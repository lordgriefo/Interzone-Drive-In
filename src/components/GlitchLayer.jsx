// src/components/GlitchLayer.jsx
// Pure-CSS glitch — no DOM manipulation, React-safe, cross-browser.
// Replaced react-powerglitch which used createContainers:true (DOM cloning)
// causing React's insertBefore reconciliation crash on style switches,
// and invisible-image bugs in Firefox from its compositor overlay divs.

import React, { useEffect, useRef, useState } from 'react';

// Inject keyframes once into the document head
let keyframesInjected = false;
function injectKeyframes() {
  if (keyframesInjected || typeof document === 'undefined') return;
  keyframesInjected = true;
  const style = document.createElement('style');
  style.textContent = `
    @keyframes _glitch_shake {
      0%   { transform: translate(0, 0); }
      20%  { transform: translate(-4px, 2px); }
      40%  { transform: translate(4px, -2px); }
      60%  { transform: translate(-3px, 3px); }
      80%  { transform: translate(3px, -1px); }
      100% { transform: translate(0, 0); }
    }
    @keyframes _glitch_hue {
      0%   { filter: hue-rotate(0deg)   saturate(1.8) contrast(1.2); }
      25%  { filter: hue-rotate(90deg)  saturate(2.2) contrast(1.4); }
      50%  { filter: hue-rotate(180deg) saturate(1.5) contrast(1.1); }
      75%  { filter: hue-rotate(270deg) saturate(2.0) contrast(1.3); }
      100% { filter: hue-rotate(360deg) saturate(1.8) contrast(1.2); }
    }
  `;
  document.head.appendChild(style);
}

export function GlitchLayer({
  children,
  audioSignals,
  isPlaying = false,
  intensity = 0.5,
  glitchEnabled = false,
  chaosLevel = 0,
}) {
  injectKeyframes();

  const [active, setActive] = useState(false);
  const timerRef = useRef(null);
  const lastBurstRef = useRef(0);

  const effectiveIntensity = Math.min(1, Math.max(0, intensity * (1 + chaosLevel * 0.5)));
  const durationMs = Math.max(100, Math.round(280 * (1.2 - effectiveIntensity * 0.4)));

  const triggerBurst = () => {
    if (!glitchEnabled || !isPlaying || effectiveIntensity <= 0.01) return;
    const now = Date.now();
    if (now - lastBurstRef.current < 120) return;
    lastBurstRef.current = now;
    setActive(true);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setActive(false), durationMs);
  };

  // Fire on transient
  useEffect(() => {
    if (audioSignals?.isTransient && isPlaying && glitchEnabled) triggerBurst();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [audioSignals?.isTransient]);

  // Stop on pause
  useEffect(() => {
    if (!isPlaying) {
      if (timerRef.current) clearTimeout(timerRef.current);
      setActive(false);
    }
  }, [isPlaying]);

  // Cleanup on unmount
  useEffect(() => () => {
    if (timerRef.current) clearTimeout(timerRef.current);
  }, []);

  const shakeAmt = `${(effectiveIntensity * 4).toFixed(1)}px`;

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        // CSS animation — no DOM cloning, no extra nodes, works in all browsers
        animation: active
          ? `_glitch_shake ${durationMs}ms steps(5) 1, _glitch_hue ${durationMs}ms linear 1`
          : 'none',
      }}
    >
      {children}
    </div>
  );
}
