// src/hooks/useVideoRecorder.js
// High-bitrate tab & element capture recording using getDisplayMedia + CropTarget
// Supports native MP4 (H.264 / AAC) for NLE video editors (Premiere, DaVinci, FCP)
// and high-bitrate WebM (VP9 / Opus) for web mastering.

import { useState, useRef } from 'react';

// Quality presets — high-bitrate profiles preserving grain, glitch, and depth shaders
export const QUALITY_PRESETS = {
  '1080p-master': { label: '1080p · Master (24M 60fps)', fps: 60, bitrate: 24_000_000, width: 1920, height: 1080 },
  '1080p-high':   { label: '1080p · High (16M 60fps)',   fps: 60, bitrate: 16_000_000, width: 1920, height: 1080 },
  '1080p-cinema': { label: '1080p · Cinema (12M 24fps)', fps: 24, bitrate: 12_000_000, width: 1920, height: 1080 },
  '720p-high':    { label: '720p · High (8M 60fps)',     fps: 60, bitrate: 8_000_000,  width: 1280, height: 720  },
  '720p-medium':  { label: '720p · Standard (5M 30fps)', fps: 30, bitrate: 5_000_000,  width: 1280, height: 720  },
  '4k-ultra':     { label: '4K · Ultra (40M 60fps)',     fps: 60, bitrate: 40_000_000, width: 3840, height: 2160 },
};

export const DEFAULT_QUALITY = '1080p-master';
export const DEFAULT_FORMAT  = 'mp4';

function resolveMimeType(formatPreference = 'mp4') {
  const mp4Types = [
    'video/mp4;codecs=avc1.4d401f,mp4a.40.2',
    'video/mp4;codecs=avc1.42E01E,mp4a.40.2',
    'video/mp4;codecs=avc1',
    'video/mp4',
  ];
  const webmTypes = [
    'video/webm;codecs=vp9,opus',
    'video/webm;codecs=vp8,opus',
    'video/webm',
  ];

  if (formatPreference === 'mp4') {
    const supportedMp4 = mp4Types.find((t) => MediaRecorder.isTypeSupported?.(t));
    if (supportedMp4) return supportedMp4;
    console.info('[Recorder] Native MP4 not supported by browser, falling back to WebM VP9');
  }

  if (formatPreference === 'webm') {
    const supportedWebm = webmTypes.find((t) => MediaRecorder.isTypeSupported?.(t));
    if (supportedWebm) return supportedWebm;
  }

  // Auto / fallback mode: test MP4 first for NLE compatibility, then VP9 WebM
  const allTypes = [...mp4Types, ...webmTypes];
  return allTypes.find((t) => MediaRecorder.isTypeSupported?.(t)) || 'video/webm';
}

export function useVideoRecorder() {
  const [isRecording,          setIsRecording]          = useState(false);
  const [exportQuality,        setExportQuality]        = useState(DEFAULT_QUALITY);
  const [exportFormat,         setExportFormat]         = useState(DEFAULT_FORMAT);
  const [recordViewportOnly,   setRecordViewportOnly]   = useState(true);

  const mediaRecorderRef  = useRef(null);
  const recordedChunksRef = useRef([]);
  const cleanupRef        = useRef(null);

  const startRecording = async (viewportElement, audioDestinationRef, cropViewport = recordViewportOnly) => {
    recordedChunksRef.current = [];

    const preset = QUALITY_PRESETS[exportQuality] || QUALITY_PRESETS[DEFAULT_QUALITY];

    // Capture tab stream via getDisplayMedia
    let displayStream = null;
    try {
      displayStream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          displaySurface: 'browser',
          preferCurrentTab: true,
          frameRate: { ideal: preset.fps, max: preset.fps },
          width: { ideal: preset.width || 1920, max: preset.width || 1920 },
          height: { ideal: preset.height || 1080, max: preset.height || 1080 },
          cursor: 'never',
        },
        audio: false,
        selfBrowserSurface: 'include',
        systemAudio: 'exclude',
        surfaceSwitching: 'exclude',
      });
    } catch (e) {
      console.warn('[Recorder] getDisplayMedia canceled or failed:', e);
      return;
    }

    if (!displayStream) return;

    let recordStream = displayStream;
    let stopCropper = null;

    // ── Dedicated Real-Time Viewport Cropper (CropTarget + Precision Fallback) ──
    if (cropViewport && viewportElement) {
      let nativeCropped = false;
      const [rawTrack] = displayStream.getVideoTracks();

      // 1. Try modern Chromium W3C Region Capture API (CropTarget)
      if (window.CropTarget && typeof CropTarget.fromElement === 'function' && rawTrack && typeof rawTrack.cropTo === 'function') {
        try {
          const cropTarget = await CropTarget.fromElement(viewportElement);
          await rawTrack.cropTo(cropTarget);
          nativeCropped = true;
          console.info('[Recorder] Native CropTarget applied directly to #main-viewport!');
        } catch (cropTargetErr) {
          console.warn('[Recorder] Native CropTarget failed or not allowed on this surface, using precision canvas cropper:', cropTargetErr);
        }
      }

      // 2. Fallback: Precision Real-Time Canvas Cropper
      if (!nativeCropped) {
        try {
          const hiddenVideo = document.createElement('video');
          hiddenVideo.srcObject = displayStream;
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
              const track = displayStream.getVideoTracks()[0];
              const settings = track?.getSettings ? track.getSettings() : {};
              const surface = settings.displaySurface; // 'browser' | 'window' | 'monitor'

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
                // Pure web viewport (Tab capture):
                const scaleX = hiddenVideo.videoWidth / window.innerWidth;
                const scaleY = hiddenVideo.videoHeight / window.innerHeight;

                sx = Math.max(0, Math.round(rect.left * scaleX));
                sy = Math.max(0, Math.round(rect.top * scaleY));
                sw = Math.min(hiddenVideo.videoWidth - sx, Math.round(rect.width * scaleX));
                sh = Math.min(hiddenVideo.videoHeight - sy, Math.round(rect.height * scaleY));
              } else {
                // Window capture:
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
            if (cropRaf) cancelAnimationFrame(cropRaf);
            hiddenVideo.pause();
            hiddenVideo.srcObject = null;
            hiddenVideo.remove();
          };
        } catch (cropErr) {
          console.warn('[Recorder] Canvas cropper init failed, recording full stream:', cropErr);
        }
      }
    }

    // Combine video (cropped or full) + Web Audio master bus
    const combinedStream = new MediaStream();
    recordStream.getVideoTracks().forEach((t) => combinedStream.addTrack(t));

    if (audioDestinationRef?.current?.stream) {
      audioDestinationRef.current.stream
        .getAudioTracks()
        .forEach((t) => combinedStream.addTrack(t));
    }

    const mimeType = resolveMimeType(exportFormat);

    const mediaRecorder = new MediaRecorder(combinedStream, {
      mimeType,
      videoBitsPerSecond: preset.bitrate,
      audioBitsPerSecond: 320_000,
    });

    cleanupRef.current = () => {
      if (stopCropper) stopCropper();
      displayStream.getTracks().forEach((t) => t.stop());
    };

    mediaRecorder.ondataavailable = (e) => {
      if (e.data && e.data.size > 0) recordedChunksRef.current.push(e.data);
    };

    mediaRecorder.onstop = () => {
      if (cleanupRef.current) {
        cleanupRef.current();
        cleanupRef.current = null;
      }

      const ext  = mimeType.includes('mp4') ? 'mp4' : 'webm';
      const blob = new Blob(recordedChunksRef.current, { type: mimeType });
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement('a');
      a.href     = url;
      a.download = `interzone-${cropViewport ? 'viewport' : 'full'}-${Date.now()}.${ext}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 10000);
      setIsRecording(false);
    };

    displayStream.getVideoTracks()[0]?.addEventListener('ended', () => {
      if (mediaRecorderRef.current?.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
      setIsRecording(false);
    });

    mediaRecorder.start(1000);
    mediaRecorderRef.current = mediaRecorder;
    setIsRecording(true);
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current?.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  return {
    isRecording,
    startRecording,
    stopRecording,
    exportQuality,
    setExportQuality,
    exportFormat,
    setExportFormat,
    recordViewportOnly,
    setRecordViewportOnly,
    qualityPresets: QUALITY_PRESETS,
  };
}