// src/utils/exportPipeline.js
// Dual-export pipeline router for The Kinet-O-Chop (Interzone Drive-In)
// Mode A: Web MediaRecorder (canvas.captureStream(60) + Tone.js/WebAudio stream)
// Mode B: Electron Deterministic FFmpeg (offline frame-by-frame Δt=1/60s render -> IPC)

import { createOfflineAudioAnalyzer } from './offlineAudioAnalyzer';
import { audioBufferToWav } from './audioBufferToWav';
import { QUALITY_PRESETS } from '../hooks/useVideoRecorder';

/**
 * Checks whether the application is running in an Electron desktop environment.
 */
export function isElectronEnvironment() {
  if (typeof window === 'undefined') return false;
  return Boolean(window.isElectron || window.electronAPI?.isElectron);
}

/**
 * Checks whether the application is running in a Tauri v2 desktop environment.
 */
export function isTauriEnvironment() {
  if (typeof window === 'undefined') return false;
  return Boolean(window.__TAURI_INTERNALS__ || window.__TAURI__);
}

/**
 * Checks whether the application is running in any native desktop shell (Tauri or Electron).
 */
export function isDesktopEnvironment() {
  return isElectronEnvironment() || isTauriEnvironment();
}

/**
 * Probes available container MIME types for Web MediaRecorder.
 * Returns the best available type for the requested format,
 * falling back to WebM if the format isn't supported.
 */
export function probeSupportedMimeType(formatPreference = 'mp4') {
  if (typeof window === 'undefined' || !window.MediaRecorder) return 'video/webm';

  // Electron/Chromium-compatible MP4 types (order matters — most specific first)
  const mp4Types = [
    'video/mp4;codecs=avc1.42E028,mp4a.40.2',
    'video/mp4;codecs=avc1.4d4028,mp4a.40.2',
    'video/mp4;codecs=avc1.4d401f,mp4a.40.2',
    'video/mp4;codecs=avc1.42E01E,mp4a.40.2',
    'video/mp4;codecs=avc1,mp4a',
    'video/mp4;codecs=avc1',
    'video/mp4',
  ];
  const webmTypes = [
    'video/webm;codecs=vp9,opus',
    'video/webm;codecs=vp8,opus',
    'video/webm',
  ];

  if (formatPreference === 'mp4') {
    const supported = mp4Types.find((t) => window.MediaRecorder.isTypeSupported?.(t));
    if (supported) return supported;
    // MP4 genuinely not supported — fall back to WebM silently
    const webmFallback = webmTypes.find((t) => window.MediaRecorder.isTypeSupported?.(t));
    return webmFallback || 'video/webm';
  }

  if (formatPreference === 'webm') {
    const supported = webmTypes.find((t) => window.MediaRecorder.isTypeSupported?.(t));
    if (supported) return supported;
  }

  return (
    [...mp4Types, ...webmTypes].find((t) => window.MediaRecorder.isTypeSupported?.(t)) ||
    'video/webm'
  );
}

/**
 * Returns true if native MP4 recording is supported by MediaRecorder in this context.
 * Electron supports it on Windows; some browser builds do not.
 */
export function isMp4RecordingSupported() {
  if (typeof window === 'undefined' || !window.MediaRecorder) return false;
  return ['video/mp4;codecs=avc1.42E028,mp4a.40.2', 'video/mp4;codecs=avc1.42E01E,mp4a.40.2',
          'video/mp4;codecs=avc1', 'video/mp4']
    .some((t) => window.MediaRecorder.isTypeSupported?.(t));
}

/**
 * Mode A: Web Mode — getDisplayMedia tab capture + Tone.js master audio mix.
 *
 * NOTE: The Kinet-O-Chop visualizer renders via DOM/CSS/Three.js — NOT a
 * single capturable 2D canvas. canvas.captureStream() would capture either a
 * blank opacity:0 recovery canvas or a Three.js sub-canvas, missing all CSS
 * filter/composite layers. We go straight to getDisplayMedia for reliable
 * full-fidelity capture of the composited viewport.
 */
export async function startWebExport({
  viewportElement,
  audioDestinationRef,
  exportQuality = '1080p-master',
  exportFormat = 'mp4',
  recordViewportOnly = true,
  onStop = () => {},
  onError = (err) => console.error(err),
}) {
  const preset = QUALITY_PRESETS[exportQuality] || QUALITY_PRESETS['1080p-master'];
  let videoStream = null;

  console.info('[exportPipeline] Requesting tab capture via getDisplayMedia…');
  try {
    videoStream = await navigator.mediaDevices.getDisplayMedia({
      video: {
        displaySurface: 'browser',
        preferCurrentTab: true,
        frameRate: { ideal: preset.fps, max: preset.fps },
        width:  { ideal: preset.width  || 1920, max: preset.width  || 1920 },
        height: { ideal: preset.height || 1080, max: preset.height || 1080 },
        cursor: 'never',
      },
      audio: false,
      selfBrowserSurface: 'include',
      systemAudio: 'exclude',
      surfaceSwitching: 'exclude',
    });
    console.info('[exportPipeline] getDisplayMedia granted — tracks:', videoStream.getVideoTracks().length);
  } catch (err) {
    console.error('[exportPipeline] getDisplayMedia failed:', err.name, err.message);
    onError(
      new Error(
        err.name === 'NotAllowedError'
          ? 'Screen share permission denied. Click "Share" in the browser dialog to start recording.'
          : `Capture failed: ${err.message}. Make sure the app is running on localhost or https://.`
      )
    );
    return null;
  }

  let recordStream = videoStream;
  let stopCropper = null;

  // ── High-Precision Viewport Cropper (Native CropTarget + Robust Fallback) ──
  // Extract strictly the #main-viewport bounding rectangle into a dedicated 16:9 stream.
  if (recordViewportOnly && viewportElement) {
    let nativeCropped = false;
    const [rawTrack] = videoStream.getVideoTracks();

    // 1. Try modern Chromium W3C Region Capture API (CropTarget)
    if (window.CropTarget && typeof CropTarget.fromElement === 'function' && rawTrack && typeof rawTrack.cropTo === 'function') {
      try {
        const cropTarget = await CropTarget.fromElement(viewportElement);
        await rawTrack.cropTo(cropTarget);
        nativeCropped = true;
        console.info('[exportPipeline] Native CropTarget applied directly to #main-viewport!');
      } catch (cropTargetErr) {
        console.warn('[exportPipeline] Native CropTarget failed or not allowed on this surface, using precision canvas cropper:', cropTargetErr);
      }
    }

    // 2. Fallback: Precision Real-Time Canvas Cropper
    if (!nativeCropped) {
      try {
        const hiddenVideo = document.createElement('video');
        hiddenVideo.srcObject = videoStream;
        hiddenVideo.muted = true;
        hiddenVideo.playsInline = true;
        hiddenVideo.style.position = 'fixed';
        hiddenVideo.style.top = '0';
        hiddenVideo.style.left = '0';
        hiddenVideo.style.width = '1px';
        hiddenVideo.style.height = '1px';
        hiddenVideo.style.opacity = '0.01';
        hiddenVideo.style.pointerEvents = 'none';
        hiddenVideo.style.zIndex = '-9999';
        document.body.appendChild(hiddenVideo);

        await hiddenVideo.play().catch(() => {});

        const cropCanvas = document.createElement('canvas');
        cropCanvas.width = preset.width || 1920;
        cropCanvas.height = preset.height || 1080;
        const cropCtx = cropCanvas.getContext('2d', { alpha: false });

        let isCropping = true;
        let cropRaf = null;
        let cachedRect = viewportElement.getBoundingClientRect();
        let frameCount = 0;
        const onResize = () => {
          if (viewportElement) cachedRect = viewportElement.getBoundingClientRect();
        };
        window.addEventListener('resize', onResize);

        const cropLoop = () => {
          if (!isCropping) return;
          frameCount++;
          if (frameCount % 30 === 0 && viewportElement) {
            cachedRect = viewportElement.getBoundingClientRect();
          }
          if (hiddenVideo.readyState >= 2 && hiddenVideo.videoWidth > 0) {
            const rect = cachedRect;
            const track = videoStream.getVideoTracks()[0];
            const settings = track?.getSettings ? track.getSettings() : {};
            const surface = settings.displaySurface; // 'browser' | 'window' | 'monitor'

            // Tab vs Window/Monitor detection:
            // - surface === 'browser' is a tab.
            // - document.fullscreenElement means zero window chrome.
            // - or video aspect ratio matches client window aspect ratio.
            const dpr = window.devicePixelRatio || 1;
            const tabRatio = window.innerWidth / window.innerHeight;
            const videoRatio = hiddenVideo.videoWidth / hiddenVideo.videoHeight;
            const isTab = surface === 'browser' ||
                          !!document.fullscreenElement ||
                          Math.abs(videoRatio - tabRatio) < 0.05 ||
                          Math.abs(hiddenVideo.videoWidth - Math.round(window.innerWidth * dpr)) < 8;

            let sx = 0;
            let sy = 0;
            let sw = hiddenVideo.videoWidth;
            let sh = hiddenVideo.videoHeight;

            if (isTab) {
              // Pure web viewport capture (Current Tab):
              // Top-left of the stream is (0,0) of window.innerWidth x window.innerHeight.
              const scaleX = hiddenVideo.videoWidth / window.innerWidth;
              const scaleY = hiddenVideo.videoHeight / window.innerHeight;

              sx = Math.max(0, Math.round(rect.left * scaleX));
              sy = Math.max(0, Math.round(rect.top * scaleY));
              sw = Math.min(hiddenVideo.videoWidth - sx, Math.round(rect.width * scaleX));
              sh = Math.min(hiddenVideo.videoHeight - sy, Math.round(rect.height * scaleY));
            } else {
              // Window / Screen capture:
              // Account for OS window border and browser top chrome (title bar, tabs, URL bar).
              const chromeTop = Math.max(0, window.outerHeight - window.innerHeight);
              const chromeLeft = Math.max(0, (window.outerWidth - window.innerWidth) / 2);
              const scaleX = hiddenVideo.videoWidth / window.outerWidth;
              const scaleY = hiddenVideo.videoHeight / window.outerHeight;

              sx = Math.max(0, Math.round((rect.left + chromeLeft) * scaleX));
              sy = Math.max(0, Math.round((rect.top + chromeTop) * scaleY));
              sw = Math.min(hiddenVideo.videoWidth - sx, Math.round(rect.width * scaleX));
              sh = Math.min(hiddenVideo.videoHeight - sy, Math.round(rect.height * scaleY));
            }

            if (sw > 20 && sh > 20) {
              cropCtx.drawImage(
                hiddenVideo,
                sx,
                sy,
                sw,
                sh,
                0,
                0,
                cropCanvas.width,
                cropCanvas.height
              );
            }
          }
          cropRaf = requestAnimationFrame(cropLoop);
        };
        cropLoop();

        recordStream = cropCanvas.captureStream(preset.fps || 60);

        stopCropper = () => {
          isCropping = false;
          window.removeEventListener('resize', onResize);
          if (cropRaf) cancelAnimationFrame(cropRaf);
          hiddenVideo.pause();
          hiddenVideo.srcObject = null;
          hiddenVideo.remove();
        };
        console.info('[exportPipeline] Precision canvas cropper active for #main-viewport');
      } catch (cropErr) {
        console.warn('[exportPipeline] Canvas cropper init failed, recording full stream:', cropErr);
      }
    }
  }

  // When the user dismisses capture via the browser stop-sharing button,
  // also fire stop() so UI state stays in sync.
  const videoTrack = videoStream.getVideoTracks()[0];

  // ── Combine video + Tone.js / Web Audio master bus ──
  const combinedStream = new MediaStream();
  recordStream.getVideoTracks().forEach((t) => combinedStream.addTrack(t));

  if (audioDestinationRef?.current?.stream) {
    audioDestinationRef.current.stream
      .getAudioTracks()
      .forEach((t) => combinedStream.addTrack(t));
    console.info('[exportPipeline] Audio tracks attached from audioDestinationRef');
  } else {
    console.warn('[exportPipeline] audioDestinationRef has no stream — recording will be video-only');
  }

  const mimeType = probeSupportedMimeType(exportFormat);
  console.info('[exportPipeline] Selected MIME type:', mimeType, '| bitrate:', preset.bitrate);
  const recordedChunks = [];

  const mediaRecorder = new MediaRecorder(combinedStream, {
    mimeType,
    videoBitsPerSecond: preset.bitrate,
    audioBitsPerSecond: 320_000,
  });

  mediaRecorder.ondataavailable = (e) => {
    if (e.data && e.data.size > 0) recordedChunks.push(e.data);
  };

  mediaRecorder.onstop = () => {
    if (stopCropper) stopCropper();
    videoStream.getTracks().forEach((t) => t.stop());

    const ext = mimeType.includes('mp4') ? 'mp4' : 'webm';
    const totalBytes = recordedChunks.reduce((n, c) => n + c.size, 0);
    console.info(`[exportPipeline] Encoding done — ${recordedChunks.length} chunks, ${(totalBytes / 1_048_576).toFixed(2)} MB`);

    const blob = new Blob(recordedChunks, { type: mimeType });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = `interzone-${recordViewportOnly ? 'viewport' : 'full'}-${Date.now()}.${ext}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 10_000);

    onStop({ blob, mimeType, filename: a.download });
  };

  // Wire external stop (browser share bar) to update UI
  if (videoTrack) {
    videoTrack.addEventListener('ended', () => {
      console.info('[exportPipeline] Track ended externally — stopping recorder');
      if (mediaRecorder.state !== 'inactive') mediaRecorder.stop();
    });
  }

  mediaRecorder.start(1000);
  console.info('[exportPipeline] MediaRecorder started (1 s chunks)');

  return {
    mediaRecorder,
    combinedStream,
    stop: () => {
      if (mediaRecorder.state !== 'inactive') {
        mediaRecorder.stop();
      }
    },
  };
}

/**
 * Unified Desktop Bridge: provides the exact same IPC interface
 * whether running inside Tauri v2 (Rust backend) or Electron (Node.js backend).
 */
export async function getDesktopAPI() {
  if (typeof window === 'undefined') return null;

  // 1. Electron bridge
  if (window.electronAPI) {
    return window.electronAPI;
  }

  // 2. Tauri v2 bridge
  if (window.__TAURI_INTERNALS__ || window.__TAURI__) {
    let invoke = window.__TAURI_INTERNALS__?.invoke;
    if (!invoke) {
      try {
        const core = await import('@tauri-apps/api/core');
        invoke = core.invoke;
      } catch (_) {}
    }

    if (invoke) {
      return {
        isTauri: true,
        getStatus: () => invoke('export_status'),
        initExport: (options = {}) =>
          invoke('export_init', {
            options: {
              fps: options.fps || 60,
              format: options.format || 'mp4',
              audio_data: options.audioData ? Array.from(new Uint8Array(options.audioData)) : null,
              default_file_name: options.defaultFileName || null,
              width: options.width || 1920,
              height: options.height || 1080,
            },
          }),
        sendFrame: (buffer, frameIndex) => {
          const u8 = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
          return invoke('export_write_frame', {
            buffer: Array.from(u8),
            frameIndex: frameIndex || 0,
          });
        },
        captureViewportFrame: (rect) =>
          invoke('export_capture_viewport', {
            rect: {
              x: Math.round(rect.x || 0),
              y: Math.round(rect.y || 0),
              width: Math.round(rect.width || 1920),
              height: Math.round(rect.height || 1080),
            },
          }),
        finishExport: () => invoke('export_finish'),
        cancelExport: () => invoke('export_cancel'),
      };
    }
  }

  return null;
}

/**
 * Mode B: Zero-Jank Desktop Offline Render (Tauri v2 / Electron + Native FFmpeg).
 * Locks rendering to Δt = 1/60s, stepping Tone.js and Meyda offline.
 */
export async function runDeterministicOfflineExport({
  audioBuffer,
  audioSourceUrl = null,
  duration = 30,
  fps = 60,
  format = 'mp4',
  sensitivity = 1.0,
  width = 1920,
  height = 1080,
  renderFrameSnapshot, // async (timestamp, signals, frameIndex) => ArrayBuffer or Uint8Array (PNG)
  onProgress = () => {},
  onComplete = () => {},
  onError = (err) => console.error(err),
  abortController = null,
  shouldStop = () => false,
}) {
  const desktopAPI = await getDesktopAPI();
  if (!desktopAPI) {
    const err = new Error('Deterministic offline render requires a desktop shell (Tauri v2 or Electron).');
    onError(err);
    throw err;
  }

  const totalFrames = Math.max(1, Math.floor(duration * fps));
  const dt = 1 / fps;

  try {
    // Convert Web Audio AudioBuffer to standard PCM WAV for FFmpeg muxing
    let audioData = null;
    if (audioBuffer) {
      try {
        audioData = audioBufferToWav(audioBuffer, { targetDuration: duration });
      } catch (err) {
        console.warn('[exportPipeline] Failed to convert audioBuffer to WAV:', err);
      }
    }

    const isWebM = format.toLowerCase() === 'webm';
    const ext = isWebM ? 'webm' : 'mp4';

    // 1. Initialize session in Desktop process (Tauri Rust / Electron Node)
    const session = await desktopAPI.initExport({
      fps,
      totalFrames,
      format,
      audioData,
      audioSourceUrl,
      width,
      height,
      defaultFileName: `strangelet-kinetocut-${Date.now()}.${ext}`,
    });

    if (session?.canceled) {
      return { canceled: true };
    }

    const analyzer = createOfflineAudioAnalyzer(audioBuffer, sensitivity);

    // 2. Deterministic step loop
    for (let k = 0; k < totalFrames; k++) {
      if (abortController?.signal?.aborted) {
        await desktopAPI.cancelExport();
        return { canceled: true };
      }

      const t = k * dt;

      // Early graceful stop: user clicked Stop & Save
      if (shouldStop && shouldStop()) {
        console.info(`[exportPipeline] Early stop requested at frame ${k}/${totalFrames} (${t.toFixed(2)}s). Finalizing video stream…`);
        break;
      }

      // Extract deterministic audio signals for this frame tick
      const signals = analyzer.extractAtTime(t);

      // Render visualizer state to offscreen buffer / snapshot
      const frameBuffer = await renderFrameSnapshot(t, signals, k);

      if (!frameBuffer) {
        throw new Error(`Failed to capture frame ${k}`);
      }

      // Stream frame buffer to Desktop process -> FFmpeg stdin
      // (Skipped if renderFrameSnapshot already piped the frame via captureViewportFrame)
      if (frameBuffer && frameBuffer !== true) {
        await desktopAPI.sendFrame(frameBuffer, k);
      }

      onProgress({
        currentFrame: k + 1,
        totalFrames,
        percent: ((k + 1) / totalFrames) * 100,
        currentTime: t,
      });

      // Yield event loop slightly so UI remains responsive
      if (k % 5 === 0) {
        await new Promise((r) => setTimeout(r, 0));
      }
    }

    // 3. Finalize FFmpeg encoding & muxing
    const result = await desktopAPI.finishExport();
    onComplete(result);
    return result;
  } catch (err) {
    console.error('[exportPipeline] Offline render error:', err);
    try {
      const api = await getDesktopAPI();
      if (api?.cancelExport) await api.cancelExport();
    } catch (_) {}
    onError(err);
    throw err;
  }
}
