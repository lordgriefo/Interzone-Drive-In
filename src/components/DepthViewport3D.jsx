// src/components/DepthViewport3D.jsx
// Phase 2: 2.5D Depth Displacement & Fight Club Camera Fly-Through Viewport
// Fullscreen-quad approach with Pre-Cached Rhythmic Texture Cutting & Beat-Sync

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { depthVertexShader, depthFragmentShader } from '../shaders/depthDisplacement';
import { createProceduralTestCard } from '../constants/initialMedia';

export function DepthViewport3D({
  colorTexture,
  depthTexture,
  useLuminanceDepth = true,
  audioSignals,
  isPlaying = false,
  extrusionDepth = 2.0,
  flyThroughSpeed = 1.0,
  audioZPulse = 1.0,
  renderMode = 0,
  pointSize = 4.0,
  initialUrl = null,
  activeMediaUrl = null,
  mediaBin = [],
  slices = [],
  selectedAssetIndex = 0,
  currentTime = 0,
  bpm = 120,
  editingBehavior = 'beat_sync', // 'beat_sync' | 'soviet_montage' | 'timeline'
}) {
  const containerRef = useRef(null);
  const rendererRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const materialRef = useRef(null);
  const meshRef = useRef(null);
  const pointsRef = useRef(null);
  const animFrameRef = useRef(null);
  const fallbackTexRef = useRef(null);

  const textureLoaderRef = useRef(new THREE.TextureLoader());
  const textureCacheRef = useRef({});
  const activeUrlRef = useRef(null);

  const mousePosRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });
  const cameraZRef = useRef(1.0);
  const timeRef = useRef(0);
  const dispScaleRef = useRef(0.0);

  // ── Pre-cache textures to prevent stutter during rapid rhythmic cutting ──
  useEffect(() => {
    const assetsToPreload = [...(mediaBin || []), ...(slices || [])];
    assetsToPreload.forEach((item) => {
      const url = typeof item === 'string' ? item : item?.url || item?.thumbnail;
      if (url && !textureCacheRef.current[url]) {
        const isVideo = /\.(mp4|webm|mov|mkv)$/i.test(url) || (typeof url === 'string' && url.startsWith('blob:video'));
        if (isVideo) {
          const vid = document.createElement('video');
          vid.src = url;
          vid.crossOrigin = 'anonymous';
          vid.loop = true;
          vid.muted = true;
          vid.playsInline = true;
          vid.preload = 'auto';
          const vTex = new THREE.VideoTexture(vid);
          vTex.colorSpace = THREE.SRGBColorSpace;
          vTex.minFilter = THREE.LinearFilter;
          vTex.magFilter = THREE.LinearFilter;
          textureCacheRef.current[url] = vTex;
        } else {
          textureLoaderRef.current.load(
            url,
            (tex) => {
              tex.colorSpace = THREE.SRGBColorSpace;
              tex.minFilter = THREE.LinearFilter;
              tex.magFilter = THREE.LinearFilter;
              tex.needsUpdate = true;
              textureCacheRef.current[url] = tex;
            },
            undefined,
            (err) => {
              console.warn('[DepthViewport3D] Pre-cache texture warning:', url, err);
            }
          );
        }
      }
    });
  }, [mediaBin, slices]);

  // ── Init Three.js scene ──────────────────────────────────────────────────
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth || 800;
    const height = container.clientHeight || 450;

    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);
    sceneRef.current = scene;

    // Orthographic camera covering exactly [-1,1] in NDC space
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 10);
    camera.position.set(0, 0, 1);
    cameraRef.current = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: 'high-performance',
      alpha: false,
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    renderer.setClearColor(0x000000, 1.0);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // High-contrast procedural test card as guaranteed default texture
    const defaultDataUrl = createProceduralTestCard();
    const fallbackTex = textureLoaderRef.current.load(defaultDataUrl, (tex) => {
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.minFilter = THREE.LinearFilter;
      tex.magFilter = THREE.LinearFilter;
      tex.needsUpdate = true;
      if (rendererRef.current && sceneRef.current && cameraRef.current) {
        rendererRef.current.render(sceneRef.current, cameraRef.current);
      }
    });
    fallbackTexRef.current = fallbackTex;

    // Fullscreen quad
    const geometry = new THREE.PlaneGeometry(2, 2, 128, 128);

    const material = new THREE.ShaderMaterial({
      vertexShader: depthVertexShader,
      fragmentShader: depthFragmentShader,
      uniforms: {
        uColorMap: { value: fallbackTex },
        uTexture: { value: fallbackTex },
        uDepthMap: { value: fallbackTex },
        uDepthIntensity: { value: 0.0 },
        uAudioTransient: { value: 0 },
        uAudioZPulse: { value: audioZPulse },
        uAudioRms: { value: 0 },
        uAudioFlux: { value: 0 },
        uAudioCentroid: { value: 0 },
        uTime: { value: 0 },
        uUseLuminanceDepth: { value: useLuminanceDepth ? 1.0 : 0.0 },
        uRenderMode: { value: renderMode },
        uPointSize: { value: pointSize },
        uScanColor: { value: new THREE.Color(0x00e5ff) },
      },
      side: THREE.DoubleSide,
      transparent: false,
      depthWrite: true,
      wireframe: false,
    });
    materialRef.current = material;

    const mesh = new THREE.Mesh(geometry, material);
    const points = new THREE.Points(geometry, material);
    mesh.visible = renderMode !== 1;
    points.visible = renderMode === 1;
    scene.add(mesh);
    scene.add(points);
    meshRef.current = mesh;
    pointsRef.current = points;

    // Immediate first-frame paint on mount
    renderer.render(scene, camera);

    // Mouse parallax
    const onMouseMove = (e) => {
      const rect = container.getBoundingClientRect();
      const nx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const ny = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      mousePosRef.current.targetX = nx * 0.04;
      mousePosRef.current.targetY = ny * 0.025;
    };
    container.addEventListener('mousemove', onMouseMove);

    const onResize = () => {
      if (!container || !renderer) return;
      renderer.setSize(container.clientWidth, container.clientHeight);
      if (sceneRef.current && cameraRef.current) {
        renderer.render(sceneRef.current, cameraRef.current);
      }
    };
    const ro = new ResizeObserver(onResize);
    ro.observe(container);

    return () => {
      container.removeEventListener('mousemove', onMouseMove);
      ro.disconnect();
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      geometry.dispose();
      material.dispose();
      renderer.dispose();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Determine active slice texture based on Musical Beat Grid, Timeline, or Selection ──
  useEffect(() => {
    if (!materialRef.current) return;
    const mat = materialRef.current;
    const fb = fallbackTexRef.current;

    let targetUrl = null;
    const pool = (slices && slices.length > 0) ? slices : (mediaBin || []);

    if (isPlaying && editingBehavior === 'beat_sync' && pool.length > 0) {
      // Calculate current beat number (e.g. 120 BPM = 2 beats per second)
      const beatsPerSecond = Math.max(1, bpm) / 60;
      const currentBeat = Math.floor(currentTime * beatsPerSecond);
      const activeIndex = currentBeat % pool.length;
      const item = pool[activeIndex];
      targetUrl = typeof item === 'string' ? item : item?.url || item?.thumbnail;
    } else if (isPlaying && slices && slices.length > 0) {
      const activeSlice = slices.find((s) => currentTime >= s.startTime && currentTime < (s.startTime + s.duration));
      const activeAsset = activeSlice ? (mediaBin || []).find((a) => a.id === activeSlice.assetId) : null;
      targetUrl = activeAsset?.url || activeSlice?.url || activeMediaUrl;
    } else {
      targetUrl =
        activeMediaUrl ||
        (mediaBin && mediaBin[selectedAssetIndex]?.url) ||
        (slices && slices[0]?.url) ||
        initialUrl;
    }

    const applyTexture = (tex) => {
      if (!tex) return;
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.minFilter = THREE.LinearFilter;
      tex.magFilter = THREE.LinearFilter;
      tex.needsUpdate = true;

      if (mat.uniforms?.uColorMap) mat.uniforms.uColorMap.value = tex;
      if (mat.uniforms?.uTexture) mat.uniforms.uTexture.value = tex;
      else mat.map = tex;
      mat.needsUpdate = true;

      if (rendererRef.current && sceneRef.current && cameraRef.current) {
        rendererRef.current.render(sceneRef.current, cameraRef.current);
      }
    };

    if (targetUrl) {
      if (targetUrl !== activeUrlRef.current) {
        activeUrlRef.current = targetUrl;
        const cached = textureCacheRef.current[targetUrl];

        if (cached) {
          applyTexture(cached);
        } else {
          const isVideo = /\.(mp4|webm|mov|mkv)$/i.test(targetUrl) || (typeof targetUrl === 'string' && targetUrl.startsWith('blob:video'));
          if (isVideo) {
            const vid = document.createElement('video');
            vid.src = targetUrl;
            vid.crossOrigin = 'anonymous';
            vid.loop = true;
            vid.muted = true;
            vid.playsInline = true;
            vid.play().catch(() => {});
            const vTex = new THREE.VideoTexture(vid);
            textureCacheRef.current[targetUrl] = vTex;
            applyTexture(vTex);
          } else {
            textureLoaderRef.current.load(targetUrl, (tex) => {
              textureCacheRef.current[targetUrl] = tex;
              applyTexture(tex);
            });
          }
        }
      }
    } else if (colorTexture) {
      applyTexture(colorTexture);
    }

    const dep = depthTexture || fb;
    if (mat.uniforms?.uDepthMap) mat.uniforms.uDepthMap.value = dep ?? fb;
    mat.uniforms.uUseLuminanceDepth.value = useLuminanceDepth ? 1.0 : 0.0;
    mat.uniforms.uDepthIntensity.value = extrusionDepth;
    mat.uniforms.uAudioZPulse.value = audioZPulse;
    mat.uniforms.uRenderMode.value = renderMode;
    mat.uniforms.uPointSize.value = pointSize;
    mat.needsUpdate = true;

    dispScaleRef.current = 1.0;

    if (meshRef.current && pointsRef.current) {
      meshRef.current.visible = renderMode !== 1;
      pointsRef.current.visible = renderMode === 1;
    }
  }, [
    currentTime,
    bpm,
    editingBehavior,
    isPlaying,
    colorTexture,
    depthTexture,
    initialUrl,
    activeMediaUrl,
    mediaBin,
    slices,
    selectedAssetIndex,
    useLuminanceDepth,
    extrusionDepth,
    audioZPulse,
    renderMode,
    pointSize,
  ]);

  // ── Render loop ─────────────────────────────────────────────────────────
  useEffect(() => {
    const loop = () => {
      const camera = cameraRef.current;
      const renderer = rendererRef.current;
      const scene = sceneRef.current;
      const material = materialRef.current;

      if (camera && renderer && scene && material) {
        timeRef.current += 0.016;

        // Normalize Meyda signals for shader
        const flux = Math.min((Number(audioSignals?.spectralFlux) || 0) / 100, 2.0);
        const centroid = Math.min((Number(audioSignals?.spectralCentroid) || 0) / 4000, 1.0);
        const rms = Number(audioSignals?.rms) || 0;
        const isTransient = audioSignals?.isTransient ? 1.0 : 0.0;

        material.uniforms.uTime.value = timeRef.current;
        material.uniforms.uAudioFlux.value = flux;
        material.uniforms.uAudioCentroid.value = centroid;
        material.uniforms.uAudioRms.value = rms;
        material.uniforms.uAudioTransient.value = isTransient;

        const mouse = mousePosRef.current;
        mouse.x += (mouse.targetX - mouse.x) * 0.06;
        mouse.y += (mouse.targetY - mouse.y) * 0.06;

        if (dispScaleRef.current > 0) {
          if (isPlaying && flyThroughSpeed > 0.01) {
            const zOsc = Math.sin(timeRef.current * flyThroughSpeed * 0.3) * 0.12 * dispScaleRef.current;
            if (meshRef.current) meshRef.current.position.z = zOsc;
          } else if (!isPlaying && meshRef.current) {
            meshRef.current.position.z = 0;
          }
        }

        camera.position.x = mouse.x;
        camera.position.y = mouse.y;

        const col = material.uniforms.uColorMap?.value;
        const dep = material.uniforms.uDepthMap?.value;
        if (col?.image instanceof HTMLVideoElement) col.needsUpdate = true;
        if (dep?.image instanceof HTMLVideoElement) dep.needsUpdate = true;

        renderer.render(scene, camera);
      }

      animFrameRef.current = requestAnimationFrame(loop);
    };

    animFrameRef.current = requestAnimationFrame(loop);
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [audioSignals, isPlaying, flyThroughSpeed, audioZPulse]);

  return (
    <div
      ref={containerRef}
      style={{
        width: '100%',
        height: '100%',
        position: 'relative',
        backgroundColor: '#000000',
        overflow: 'hidden',
        cursor: 'crosshair',
      }}
    />
  );
}

export default DepthViewport3D;
