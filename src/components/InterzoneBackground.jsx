import React, { useEffect, useRef } from 'react';

const MOON_SOURCES = {
  classic_halo: './assets-bg/mm-moon-input.webm',
  round_sun: './assets-bg/moon_trip-round.webm',
};

const MOON_FILTERS = {
  silent_silver: 'grayscale(100%) brightness(1.2) contrast(1.1)',
  warm_solar: 'sepia(0.35) saturate(1.4) brightness(1.15) hue-rotate(-8deg)',
};

export function InterzoneBackground({
  audioSignals,
  isPlaying = false,
  moonVariant = 'classic_halo',
  moonFilter = 'silent_silver',
}) {
  const starfieldIframeRef = useRef(null);
  const webglCanvasRef = useRef(null);
  const webglLostRef = useRef(false);
  const glRef = useRef(null);
  const animFrameRef = useRef(null);

  // Trigger sigil pops on audio transients
  useEffect(() => {
    if (!isPlaying || !audioSignals?.isTransient) return;
    starfieldIframeRef.current?.contentWindow?.postMessage('sigil-pop', '*');
  }, [audioSignals?.isTransient, isPlaying]);

  // WebGL star burst layer with context recovery
  useEffect(() => {
    const canvas = webglCanvasRef.current;
    if (!canvas) return;

    let gl;
    try {
      gl = canvas.getContext('webgl', { preserveDrawingBuffer: true, antialias: false })
        || canvas.getContext('experimental-webgl');
    } catch {
      return;
    }
    if (!gl) return;
    glRef.current = gl;

    const resize = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      canvas.width = parent.clientWidth;
      canvas.height = parent.clientHeight;
      gl.viewport(0, 0, canvas.width, canvas.height);
    };
    resize();

    const handleLost = (e) => {
      e.preventDefault();
      webglLostRef.current = true;
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };

    const handleRestored = () => {
      webglLostRef.current = false;
      resize();
      render();
    };

    canvas.addEventListener('webglcontextlost', handleLost);
    canvas.addEventListener('webglcontextrestored', handleRestored);

    const render = () => {
      if (webglLostRef.current || !glRef.current) return;
      const g = glRef.current;
      const b = audioSignals?.bass || 0;
      const t = audioSignals?.treble || 0;
      g.clearColor(0, 0, 0, 0);
      g.clear(g.COLOR_BUFFER_BIT);
      g.enable(g.BLEND);
      g.blendFunc(g.SRC_ALPHA, g.ONE);
      // Audio-reactive tint — orange (R) on treble, blue (B) on bass, NO green channel
      // Keeps the tint within the Interzone Black·Orange·Blue palette
      g.clearColor(t * 0.10, 0, b * 0.10, isPlaying ? 0.03 + b * 0.05 : 0);
      g.clear(g.COLOR_BUFFER_BIT);
      if (isPlaying) {
        animFrameRef.current = requestAnimationFrame(render);
      }
    };

    if (isPlaying) render();

    return () => {
      canvas.removeEventListener('webglcontextlost', handleLost);
      canvas.removeEventListener('webglcontextrestored', handleRestored);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [audioSignals?.bass, audioSignals?.treble, isPlaying]);

  const b = audioSignals?.bass || 0;
  const m = audioSignals?.mid || 0;
  const t = audioSignals?.treble || 0;
  const ringScale = 1 + b * 0.2;
  const morphDash = `${20 + t * 40} ${10 + m * 20}`;
  const rotation = (Date.now() * 0.015) % 360;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      zIndex: 0,
      overflow: 'hidden',
      pointerEvents: 'none',
    }}>
      {/* Full-bleed starfield + sigil layer from assets-bg/stars.html */}
      <iframe
        ref={starfieldIframeRef}
        src="./assets-bg/stars.html"
        title="Starfield Sigil Background"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          border: 'none',
          pointerEvents: 'none',
          opacity: 0.92,
        }}
      />

      {/* WebGL safety / tint overlay canvas */}
      <canvas
        ref={webglCanvasRef}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
        }}
      />

      {/* Morphing atomic / Sumerian sigil wheel */}
      <div style={{
        position: 'absolute',
        top: '40%',
        left: '50%',
        width: '580px',
        height: '580px',
        transform: `translate(-50%, -50%) scale(${ringScale}) rotate(${rotation}deg)`,
        transition: 'transform 0.1s ease-out',
        opacity: 0.55,
      }}>
        <svg width="100%" height="100%" viewBox="0 0 200 200">
          <circle cx="100" cy="100" r="90" fill="none" stroke="rgba(249, 115, 22, 0.35)" strokeWidth="0.8" strokeDasharray={morphDash} />
          <ellipse cx="100" cy="100" rx="75" ry="25" fill="none" stroke="rgba(6, 182, 212, 0.4)" strokeWidth="0.6" transform={`rotate(${m * 180}, 100, 100)`} />
          <ellipse cx="100" cy="100" rx="75" ry="25" fill="none" stroke="rgba(6, 182, 212, 0.4)" strokeWidth="0.6" transform={`rotate(${-m * 180 + 60}, 100, 100)`} />
          <polygon points="100,20 170,140 30,140" fill="none" stroke="rgba(249, 115, 22, 0.2)" strokeWidth="0.5" transform={`rotate(${t * 90}, 100, 100)`} />
        </svg>
      </div>

      {/* Méliès moon video layer */}
      <video
        key={moonVariant}
        autoPlay
        loop
        muted
        playsInline
        src={MOON_SOURCES[moonVariant] || MOON_SOURCES.classic_halo}
        style={{
          position: 'absolute',
          top: '28px',
          right: '40px',
          width: '120px',
          height: '120px',
          borderRadius: '50%',
          objectFit: 'cover',
          boxShadow: `0 0 ${15 + m * 35}px rgba(254, 240, 138, ${0.4 + m * 0.4})`,
          border: '1px solid rgba(254, 240, 138, 0.5)',
          filter: MOON_FILTERS[moonFilter] || MOON_FILTERS.silent_silver,
          mixBlendMode: 'screen',
          opacity: 0.85,
        }}
      />

      {/* Mojave desert horizon silhouette */}
      <svg
        width="100%"
        height="120px"
        viewBox="0 0 1000 120"
        preserveAspectRatio="none"
        style={{ position: 'absolute', bottom: 0, left: 0, right: 0, fill: '#020205', opacity: 0.95 }}
      >
        <path d="M0,120 L0,90 L80,90 L120,65 L220,65 L260,95 L400,95 L450,75 L550,75 L600,100 L750,100 L820,70 L920,70 L1000,90 L1000,120 Z" />
        <path d="M150,90 L150,50 M144,65 L150,65 M150,60 L156,60 M144,65 L144,55 M156,60 L156,55" stroke="#020205" strokeWidth="3" fill="none" />
        <path d="M780,100 L780,55 M774,70 L780,70 M780,65 L786,65 M774,70 L774,60 M786,65 L786,55" stroke="#020205" strokeWidth="3" fill="none" />
      </svg>
    </div>
  );
}

export { MOON_SOURCES, MOON_FILTERS };
