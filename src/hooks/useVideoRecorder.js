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
  const [isRecording,   setIsRecording]   = useState(false);
  const [exportQuality, setExportQuality] = useState(DEFAULT_QUALITY);
  const [exportFormat,  setExportFormat]  = useState(DEFAULT_FORMAT);

  const mediaRecorderRef  = useRef(null);
  const recordedChunksRef = useRef([]);

  const startRecording = async (viewportElement, audioDestinationRef) => {
    recordedChunksRef.current = [];

    const preset = QUALITY_PRESETS[exportQuality] || QUALITY_PRESETS[DEFAULT_QUALITY];

    // ── Strategy 1a: Element Capture (Chrome 104+) ──
    // CropTarget crops the tab stream to a single DOM element — only
    // #main-viewport is recorded, with no cursor and explicit resolution hints.
    let displayStream = null;
    try {
      if (viewportElement && window.CropTarget?.fromElement) {
        // Grab the tab stream with resolution hints and cursor hidden
        displayStream = await navigator.mediaDevices.getDisplayMedia({
          video: {
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
        // Crop down strictly to the viewport element
        const cropTarget = await window.CropTarget.fromElement(viewportElement);
        const [videoTrack] = displayStream.getVideoTracks();
        if (videoTrack?.cropTo) {
          await videoTrack.cropTo(cropTarget);
        }
      } else {
        // ── Strategy 1b: full-tab capture (no element crop) ──
        displayStream = await navigator.mediaDevices.getDisplayMedia({
          video: {
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
      }
    } catch (e) {
      console.warn('[Recorder] getDisplayMedia failed:', e);
    }

    // ── Strategy 2: fallback to captureStream on a canvas if available ──
    if (!displayStream && viewportElement) {
      const canvas = viewportElement.querySelector('canvas') || viewportElement;
      if (canvas?.captureStream) {
        try {
          displayStream = canvas.captureStream(preset.fps);
        } catch (e2) {
          console.warn('[Recorder] captureStream fallback also failed:', e2);
        }
      }
    }

    if (!displayStream) {
      alert(
        'Recording not available in this browser.\n\n' +
        'Chrome 94+, Brave, or Edge required.\n' +
        'Make sure the page is served over https:// or localhost.\n\n' +
        'Tip: you can also use OBS or the OS screen recorder.'
      );
      return;
    }

    // Build combined stream: display video + Web Audio output
    const combinedStream = new MediaStream();
    displayStream.getVideoTracks().forEach((t) => combinedStream.addTrack(t));

    if (audioDestinationRef?.current?.stream) {
      audioDestinationRef.current.stream
        .getAudioTracks()
        .forEach((t) => combinedStream.addTrack(t));
    }

    // Pick the best supported codec matching format preference
    const mimeType = resolveMimeType(exportFormat);

    const mediaRecorder = new MediaRecorder(combinedStream, {
      mimeType,
      videoBitsPerSecond: preset.bitrate,
      audioBitsPerSecond: 320_000, // 320 kbps high fidelity stereo audio
    });

    mediaRecorder.ondataavailable = (e) => {
      if (e.data && e.data.size > 0) recordedChunksRef.current.push(e.data);
    };

    mediaRecorder.onstop = () => {
      // Stop all display capture tracks so the browser indicator dismisses
      displayStream.getTracks().forEach((t) => t.stop());

      const ext  = mimeType.includes('mp4') ? 'mp4' : 'webm';
      const blob = new Blob(recordedChunksRef.current, { type: mimeType });
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement('a');
      a.href     = url;
      a.download = `interzone-${exportQuality}-${Date.now()}.${ext}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 10000);
    };

    // If user closes the display picker or stops via browser UI, sync state
    displayStream.getVideoTracks()[0].addEventListener('ended', () => {
      if (mediaRecorderRef.current?.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
      setIsRecording(false);
    });

    // 1000ms chunking for clean GOP intervals & reduced CPU encoding pressure
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
    qualityPresets: QUALITY_PRESETS,
  };
}