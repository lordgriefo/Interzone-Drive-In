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

  // ── Real-Time Viewport Canvas Cropper ──
  // Extract strictly the #main-viewport bounding rectangle into a dedicated 16:9 canvas stream.
  if (recordViewportOnly && viewportElement) {
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

      const cropLoop = () => {
        if (!isCropping) return;
        if (hiddenVideo.readyState >= 2 && hiddenVideo.videoWidth > 0) {
          const rect = viewportElement.getBoundingClientRect();

          // Detect whether user shared a Tab vs Window/Screen:
          // A Tab capture's aspect ratio matches window.innerWidth / window.innerHeight.
          // A Window capture includes the browser title bar, tab strip, and URL address bar at the top.
          const streamRatio = hiddenVideo.videoWidth / hiddenVideo.videoHeight;
          const contentRatio = window.innerWidth / window.innerHeight;
          const isTabCapture = Math.abs(streamRatio - contentRatio) < 0.04;

          let chromeTop = 0;
          let chromeLeft = 0;
          let baseW = window.innerWidth;
          let baseH = window.innerHeight;

          if (!isTabCapture) {
            // Window capture: web content starts below the browser's tabs + URL address bar
            const totalChromeH = Math.max(0, window.outerHeight - window.innerHeight);
            chromeTop = Math.max(0, totalChromeH - 8);
            chromeLeft = Math.max(0, (window.outerWidth - window.innerWidth) / 2);
            baseW = window.outerWidth;
            baseH = window.outerHeight;
          }

          const sX = hiddenVideo.videoWidth / baseW;
          const sY = hiddenVideo.videoHeight / baseH;

          // Trim 5px inside the viewport border to ensure zero bezel/border bleed
          const inset = 5;
          const targetX = rect.left + chromeLeft + inset;
          const targetY = rect.top + chromeTop + inset;
          const targetW = Math.max(10, rect.width - inset * 2);
          const targetH = Math.max(10, rect.height - inset * 2);

          const sx = Math.max(0, targetX * sX);
          const sy = Math.max(0, targetY * sY);
          const sw = Math.min(hiddenVideo.videoWidth - sx, targetW * sX);
          const sh = Math.min(hiddenVideo.videoHeight - sy, targetH * sY);

          if (sw > 10 && sh > 10) {
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
        if (cropRaf) cancelAnimationFrame(cropRaf);
        hiddenVideo.pause();
        hiddenVideo.srcObject = null;
        hiddenVideo.remove();
      };
      console.info('[exportPipeline] Live canvas cropper active for #main-viewport');
    } catch (cropErr) {
      console.warn('[exportPipeline] Canvas cropper init failed, recording full tab:', cropErr);
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
 * Mode B: Desktop / Electron Mode - Deterministic offline frame-by-frame rendering.
 * Locks rendering to Δt = 1/60s, stepping Tone.js and Meyda offline.
 */
export async function runDeterministicOfflineExport({
  audioBuffer,
  audioSourceUrl = null,
  duration = 30,
  fps = 60,
  format = 'mp4',
  sensitivity = 1.0,
  renderFrameSnapshot, // async (timestamp, signals, frameIndex) => ArrayBuffer or Uint8Array (PNG)
  onProgress = () => {},
  onComplete = () => {},
  onError = (err) => console.error(err),
  abortController = null,
}) {
  if (!isElectronEnvironment()) {
    const err = new Error('Deterministic offline render requires the Electron desktop environment.');
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

    // 1. Initialize session in Electron main process
    const session = await window.electronAPI.initExport({
      fps,
      totalFrames,
      format,
      audioData,
      audioSourceUrl,
      width: 1920,
      height: 1080,
      defaultFileName: `interzone-hd-${Date.now()}.${ext}`,
    });

    if (session?.canceled) {
      return { canceled: true };
    }

    const analyzer = createOfflineAudioAnalyzer(audioBuffer, sensitivity);

    // 2. Deterministic step loop
    for (let k = 0; k < totalFrames; k++) {
      if (abortController?.signal?.aborted) {
        await window.electronAPI.cancelExport();
        return { canceled: true };
      }

      const t = k * dt;

      // Extract deterministic audio signals for this frame tick
      const signals = analyzer.extractAtTime(t);

      // Render visualizer state to offscreen buffer / snapshot
      const frameBuffer = await renderFrameSnapshot(t, signals, k);

      if (!frameBuffer) {
        throw new Error(`Failed to capture frame ${k}`);
      }

      // Stream PNG buffer to Electron main process -> FFmpeg stdin
      // (Skipped if renderFrameSnapshot already piped the frame via captureViewportFrame)
      if (frameBuffer && frameBuffer !== true) {
        await window.electronAPI.sendFrame(frameBuffer, k);
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
    const result = await window.electronAPI.finishExport();
    onComplete(result);
    return result;
  } catch (err) {
    console.error('[exportPipeline] Offline render error:', err);
    try {
      await window.electronAPI.cancelExport();
    } catch (_) {}
    onError(err);
    throw err;
  }
}
