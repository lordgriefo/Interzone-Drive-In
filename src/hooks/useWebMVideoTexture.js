// src/hooks/useWebMVideoTexture.js
// Phase 2: Hardware-Accelerated WebM (VP8/VP9 Alpha) Texture Pipeline & Procedural Alpha Loops

import { useState, useRef, useEffect, useCallback } from 'react';
import * as THREE from 'three';
import { WEBM_LOOP_PRESETS } from '../constants/editProfiles';

// Procedural 16:9 transparent canvas texture generator for default alpha loops
function generateProceduralAlphaCanvas(type = 'dust', time = 0) {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 288;
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, 512, 288);

  if (type === 'dust') {
    // 16mm Dust & Scratches on transparent background
    ctx.fillStyle = 'rgba(255, 235, 200, 0.85)';
    for (let i = 0; i < 35; i++) {
      const x = (Math.sin(i * 99 + time * 13) * 0.5 + 0.5) * 512;
      const y = (Math.cos(i * 33 + time * 17) * 0.5 + 0.5) * 288;
      const r = Math.random() * 2.2 + 0.5;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }
    // Vertical scratches
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
    ctx.lineWidth = 1;
    for (let s = 0; s < 3; s++) {
      const sx = (Math.sin(s * 77 + time * 7) * 0.5 + 0.5) * 512;
      ctx.beginPath();
      ctx.moveTo(sx, 0);
      ctx.lineTo(sx + (Math.random() - 0.5) * 4, 288);
      ctx.stroke();
    }
  } else if (type === 'grain') {
    // High-frequency transparent film grain
    const imgData = ctx.createImageData(512, 288);
    const buf = new Uint32Array(imgData.data.buffer);
    for (let i = 0; i < buf.length; i++) {
      if (Math.random() > 0.88) {
        const v = Math.floor(Math.random() * 180 + 75);
        const a = Math.floor(Math.random() * 120 + 30);
        buf[i] = (a << 24) | (v << 16) | (v << 8) | v;
      }
    }
    ctx.putImageData(imgData, 0, 0);
  } else if (type === 'scanlines') {
    // Geometric CRT / Matrix scanlines
    ctx.fillStyle = 'rgba(0, 229, 255, 0.12)';
    const offset = (time * 60) % 8;
    for (let y = offset; y < 288; y += 6) {
      ctx.fillRect(0, y, 512, 2);
    }
  }

  return canvas;
}

export function useWebMVideoTexture() {
  const [activePreset, setActivePreset] = useState(null);
  const [overlayTexture, setOverlayTexture] = useState(null);
  const [fileName, setFileName] = useState('');
  const [overlayOpacity, setOverlayOpacity] = useState(0.65);

  const videoRef = useRef(null);
  const animFrameRef = useRef(null);
  const canvasRef = useRef(null);
  const canvasTextureRef = useRef(null);

  // Load Custom WebM / MP4 video file or image with alpha transparency
  const loadWebMFile = useCallback((fileOrUrl) => {
    if (!fileOrUrl) return;

    setActivePreset(null);

    if (typeof fileOrUrl === 'string') {
      setupVideo(fileOrUrl, fileOrUrl.split('/').pop() || 'Remote WebM');
      return;
    }

    const isVideo = fileOrUrl.type.startsWith('video/') || /\.(webm|mp4|mov)$/i.test(fileOrUrl.name);
    const url = URL.createObjectURL(fileOrUrl);

    if (isVideo) {
      setupVideo(url, fileOrUrl.name);
    } else {
      const loader = new THREE.TextureLoader();
      loader.load(url, (tex) => {
        tex.minFilter = THREE.LinearFilter;
        tex.magFilter = THREE.LinearFilter;
        setOverlayTexture(tex);
        setFileName(fileOrUrl.name);
      });
    }
  }, []);

  const setupVideo = (url, name) => {
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.src = '';
    }

    const video = document.createElement('video');
    video.src = url;
    video.crossOrigin = 'anonymous';
    video.loop = true;
    video.muted = true;
    video.playsInline = true;
    // Hardware acceleration hint
    video.setAttribute('webkit-playsinline', 'true');
    video.play().catch(() => {});

    const texture = new THREE.VideoTexture(video);
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
    texture.format = THREE.RGBAFormat;

    videoRef.current = video;
    setOverlayTexture(texture);
    setFileName(name);
  };

  // Set default procedural WebM alpha loop preset
  const selectPreset = useCallback((presetId) => {
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current = null;
    }

    const preset = WEBM_LOOP_PRESETS.find((p) => p.id === presetId);
    if (!preset) {
      setActivePreset(null);
      setOverlayTexture(null);
      setFileName('');
      return;
    }

    setActivePreset(preset.id);
    setFileName(preset.label);

    // Create dynamic canvas texture for the preset
    const canvas = generateProceduralAlphaCanvas(preset.type, 0);
    canvasRef.current = canvas;
    const texture = new THREE.CanvasTexture(canvas);
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
    canvasTextureRef.current = texture;
    setOverlayTexture(texture);
  }, []);

  // Update procedural canvas texture on animation frame when active
  useEffect(() => {
    if (!activePreset) {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      return;
    }

    const preset = WEBM_LOOP_PRESETS.find((p) => p.id === activePreset);
    if (!preset) return;

    let time = 0;
    const loop = () => {
      time += 0.05;
      if (canvasRef.current && canvasTextureRef.current) {
        const ctx = canvasRef.current.getContext('2d');
        ctx.clearRect(0, 0, 512, 288);

        if (preset.type === 'dust') {
          ctx.fillStyle = 'rgba(255, 235, 200, 0.85)';
          for (let i = 0; i < 35; i++) {
            const x = (Math.sin(i * 99 + time * 13) * 0.5 + 0.5) * 512;
            const y = (Math.cos(i * 33 + time * 17) * 0.5 + 0.5) * 288;
            const r = Math.random() * 2.2 + 0.5;
            ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
          }
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
          ctx.lineWidth = 1;
          for (let s = 0; s < 3; s++) {
            const sx = (Math.sin(s * 77 + time * 7) * 0.5 + 0.5) * 512;
            ctx.beginPath(); ctx.moveTo(sx, 0); ctx.lineTo(sx + (Math.random() - 0.5) * 4, 288); ctx.stroke();
          }
        } else if (preset.type === 'grain') {
          const imgData = ctx.createImageData(512, 288);
          const buf = new Uint32Array(imgData.data.buffer);
          for (let i = 0; i < buf.length; i++) {
            if (Math.random() > 0.88) {
              const v = Math.floor(Math.random() * 180 + 75);
              const a = Math.floor(Math.random() * 120 + 30);
              buf[i] = (a << 24) | (v << 16) | (v << 8) | v;
            }
          }
          ctx.putImageData(imgData, 0, 0);
        } else if (preset.type === 'scanlines') {
          ctx.fillStyle = 'rgba(0, 229, 255, 0.15)';
          const offset = (time * 60) % 8;
          for (let y = offset; y < 288; y += 6) {
            ctx.fillRect(0, y, 512, 2);
          }
        }

        canvasTextureRef.current.needsUpdate = true;
      }
      animFrameRef.current = requestAnimationFrame(loop);
    };

    animFrameRef.current = requestAnimationFrame(loop);
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [activePreset]);

  // Sync playback with audio engine / transport
  const syncPlayback = useCallback((isPlaying) => {
    if (videoRef.current) {
      if (isPlaying) videoRef.current.play().catch(() => {});
      else videoRef.current.pause();
    }
  }, []);

  const clearOverlay = useCallback(() => {
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current = null;
    }
    setActivePreset(null);
    setOverlayTexture(null);
    setFileName('');
  }, []);

  return {
    overlayTexture,
    activePreset,
    fileName,
    overlayOpacity,
    setOverlayOpacity,
    loadWebMFile,
    selectPreset,
    clearOverlay,
    syncPlayback,
  };
}
