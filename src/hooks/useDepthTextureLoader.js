// src/hooks/useDepthTextureLoader.js
// Phase 2: User-Loadable Color & Depth Map Texture Manager (Images, Video Textures & Luminance Estimation)

import { useState, useRef, useEffect, useCallback } from 'react';
import * as THREE from 'three';

// Create a default 16:9 canvas gradient texture for initial display
function createDefaultGradientTexture(type = 'color') {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 288;
  const ctx = canvas.getContext('2d');

  if (type === 'color') {
    const grad = ctx.createLinearGradient(0, 0, 512, 288);
    grad.addColorStop(0, '#0a0a14');
    grad.addColorStop(0.5, '#ff6b00');
    grad.addColorStop(1, '#00e5ff');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 512, 288);

    // Decorative grid lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.lineWidth = 1;
    for (let x = 0; x < 512; x += 32) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, 288); ctx.stroke();
    }
    for (let y = 0; y < 288; y += 32) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(512, y); ctx.stroke();
    }
  } else {
    // Radial depth map (center closer, edges farther)
    const grad = ctx.createRadialGradient(256, 144, 20, 256, 144, 260);
    grad.addColorStop(0, '#ffffff');
    grad.addColorStop(0.7, '#666666');
    grad.addColorStop(1, '#000000');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 512, 288);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  return texture;
}

export function useDepthTextureLoader() {
  const [colorTexture, setColorTexture] = useState(() => createDefaultGradientTexture('color'));
  const [depthTexture, setDepthTexture] = useState(() => createDefaultGradientTexture('depth'));
  const [useLuminanceDepth, setUseLuminanceDepth] = useState(true);
  const [colorFileName, setColorFileName] = useState('Default Scene');
  const [depthFileName, setDepthFileName] = useState('Auto Luminance');
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);

  const colorVideoRef = useRef(null);
  const depthVideoRef = useRef(null);
  const loaderRef = useRef(new THREE.TextureLoader());

  // Load Color Source (Image or Video)
  const loadColorSource = useCallback((fileOrUrl) => {
    // Guard: skip empty strings (default asset placeholder)
    if (!fileOrUrl || (typeof fileOrUrl === 'string' && fileOrUrl.trim() === '')) return;

    if (typeof fileOrUrl === 'string') {
      const isVideo = /\.(mp4|webm|mov)$/i.test(fileOrUrl);
      if (isVideo) {
        setupVideoTexture(fileOrUrl, 'color');
      } else {
        loaderRef.current.load(fileOrUrl, (tex) => {
          tex.colorSpace = THREE.SRGBColorSpace;
          tex.minFilter = THREE.LinearFilter;
          tex.magFilter = THREE.LinearFilter;
          tex.needsUpdate = true;
          setColorTexture(tex);
          setColorFileName(fileOrUrl.split('/').pop() || 'Remote Image');
        });
      }
      return;
    }

    const isVideo = fileOrUrl.type.startsWith('video/') || /\.(mp4|webm|mov)$/i.test(fileOrUrl.name);
    const url = URL.createObjectURL(fileOrUrl);

    if (isVideo) {
      setupVideoTexture(url, 'color');
      setColorFileName(fileOrUrl.name);
    } else {
      loaderRef.current.load(url, (tex) => {
        tex.colorSpace = THREE.SRGBColorSpace;
        tex.minFilter = THREE.LinearFilter;
        tex.magFilter = THREE.LinearFilter;
        tex.needsUpdate = true;
        setColorTexture(tex);
        setColorFileName(fileOrUrl.name);
      });
    }
  }, []);


  // Load Depth Map Source (Image, Video or set to Luminance Auto)
  const loadDepthSource = useCallback((fileOrUrl) => {
    if (!fileOrUrl || (typeof fileOrUrl === 'string' && fileOrUrl.trim() === '')) {
      setUseLuminanceDepth(true);
      setDepthFileName('Auto Luminance');
      return;
    }

    if (typeof fileOrUrl === 'string') {
      const isVideo = /\.(mp4|webm|mov)$/i.test(fileOrUrl);
      if (isVideo) {
        setupVideoTexture(fileOrUrl, 'depth');
      } else {
        loaderRef.current.load(fileOrUrl, (tex) => {
          tex.colorSpace = THREE.SRGBColorSpace;
          tex.minFilter = THREE.LinearFilter;
          tex.magFilter = THREE.LinearFilter;
          tex.needsUpdate = true;
          setDepthTexture(tex);
          setUseLuminanceDepth(false);
          setDepthFileName(fileOrUrl.split('/').pop() || 'Remote Depth Map');
        });
      }
      return;
    }

    const isVideo = fileOrUrl.type.startsWith('video/') || /\.(mp4|webm|mov)$/i.test(fileOrUrl.name);
    const url = URL.createObjectURL(fileOrUrl);

    if (isVideo) {
      setupVideoTexture(url, 'depth');
      setUseLuminanceDepth(false);
      setDepthFileName(fileOrUrl.name);
    } else {
      loaderRef.current.load(url, (tex) => {
        tex.colorSpace = THREE.SRGBColorSpace;
        tex.minFilter = THREE.LinearFilter;
        tex.magFilter = THREE.LinearFilter;
        tex.needsUpdate = true;
        setDepthTexture(tex);
        setUseLuminanceDepth(false);
        setDepthFileName(fileOrUrl.name);
      });
    }
  }, []);


  // Helper to create THREE.VideoTexture
  const setupVideoTexture = (url, target = 'color') => {
    const video = document.createElement('video');
    video.src = url;
    video.crossOrigin = 'anonymous';
    video.loop = true;
    video.muted = true;
    video.playsInline = true;
    video.play().catch(() => {});

    const videoTex = new THREE.VideoTexture(video);
    videoTex.minFilter = THREE.LinearFilter;
    videoTex.magFilter = THREE.LinearFilter;
    videoTex.format = THREE.RGBAFormat;

    if (target === 'color') {
      if (colorVideoRef.current) {
        colorVideoRef.current.pause();
        colorVideoRef.current.src = '';
      }
      colorVideoRef.current = video;
      setColorTexture(videoTex);
    } else {
      if (depthVideoRef.current) {
        depthVideoRef.current.pause();
        depthVideoRef.current.src = '';
      }
      depthVideoRef.current = video;
      setDepthTexture(videoTex);
    }
  };

  // Sync video play/pause with master playback state
  const syncPlayback = useCallback((isPlaying) => {
    setIsVideoPlaying(isPlaying);
    if (colorVideoRef.current) {
      if (isPlaying) colorVideoRef.current.play().catch(() => {});
      else colorVideoRef.current.pause();
    }
    if (depthVideoRef.current) {
      if (isPlaying) depthVideoRef.current.play().catch(() => {});
      else depthVideoRef.current.pause();
    }
  }, []);

  // Reset to default textures
  const resetDefaults = useCallback(() => {
    if (colorVideoRef.current) colorVideoRef.current.pause();
    if (depthVideoRef.current) depthVideoRef.current.pause();
    setColorTexture(createDefaultGradientTexture('color'));
    setDepthTexture(createDefaultGradientTexture('depth'));
    setUseLuminanceDepth(true);
    setColorFileName('Default Scene');
    setDepthFileName('Auto Luminance');
  }, []);

  return {
    colorTexture,
    depthTexture,
    useLuminanceDepth,
    setUseLuminanceDepth,
    colorFileName,
    depthFileName,
    loadColorSource,
    loadDepthSource,
    syncPlayback,
    resetDefaults,
    hasColorVideo: Boolean(colorVideoRef.current),
    hasDepthVideo: Boolean(depthVideoRef.current),
  };
}
