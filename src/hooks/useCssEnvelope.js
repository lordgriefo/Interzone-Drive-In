// src/hooks/useCssEnvelope.js
// Phase 2: Dynamic GSAP CSS Envelopes for audio-reactive contrast, brightness, and color shifts

import { useEffect, useRef, useState, useCallback } from 'react';
import gsap from 'gsap';

export function useCssEnvelope({
  audioSignals,
  isPlaying = false,
  envelopeDepth = 1.0,
  targetRef = null,
}) {
  // State holding current envelope values
  const [envelopeValues, setEnvelopeValues] = useState({
    contrast: 1.0,
    brightness: 1.0,
    saturate: 1.0,
    hueRotate: 0,
  });

  const stateRef = useRef({
    contrast: 1.0,
    brightness: 1.0,
    saturate: 1.0,
    hueRotate: 0,
  });

  const prevTransientRef = useRef(false);

  // Trigger fast attack + exponential decay GSAP tween on transient hits
  const triggerHit = useCallback((intensity = 1.0) => {
    if (envelopeDepth <= 0.01) return;

    const depth = Math.min(1.5, Math.max(0, envelopeDepth));
    const targetContrast = 1.0 + 0.65 * depth * intensity;
    const targetBrightness = 1.0 + 0.45 * depth * intensity;

    // Kill any active tweens on stateRef
    gsap.killTweensOf(stateRef.current);

    // Fast Attack (10ms) -> Exponential Decay (120-150ms)
    gsap.timeline()
      .to(stateRef.current, {
        contrast: targetContrast,
        brightness: targetBrightness,
        duration: 0.012,
        ease: 'power1.out',
        onUpdate: () => {
          setEnvelopeValues({ ...stateRef.current });
          if (targetRef?.current) {
            targetRef.current.style.setProperty('--env-contrast', stateRef.current.contrast.toFixed(3));
            targetRef.current.style.setProperty('--env-brightness', stateRef.current.brightness.toFixed(3));
          }
        },
      })
      .to(stateRef.current, {
        contrast: 1.0,
        brightness: 1.0,
        duration: 0.14,
        ease: 'expo.out',
        onUpdate: () => {
          setEnvelopeValues({ ...stateRef.current });
          if (targetRef?.current) {
            targetRef.current.style.setProperty('--env-contrast', stateRef.current.contrast.toFixed(3));
            targetRef.current.style.setProperty('--env-brightness', stateRef.current.brightness.toFixed(3));
          }
        },
      });
  }, [envelopeDepth, targetRef]);

  // Watch for audioSignals transient pulses
  useEffect(() => {
    if (!isPlaying || envelopeDepth <= 0.01) {
      prevTransientRef.current = false;
      return;
    }

    const isTransient = Boolean(audioSignals?.isTransient);
    const transientEdge = isTransient && !prevTransientRef.current;
    prevTransientRef.current = isTransient;

    if (transientEdge) {
      const flux = Number(audioSignals?.spectralFlux) || 0.5;
      const bass = Number(audioSignals?.bass) || 0.5;
      const hitStrength = Math.min(1.5, Math.max(0.6, (flux + bass) * 0.9));
      triggerHit(hitStrength);
    }
  }, [audioSignals?.isTransient, audioSignals?.spectralFlux, audioSignals?.bass, isPlaying, envelopeDepth, triggerHit]);

  // Subtle continuous spectral modulation (centroid -> saturation, mid -> subtle hue shift)
  useEffect(() => {
    if (!isPlaying || envelopeDepth <= 0.01) return;

    const centroid = Number(audioSignals?.spectralCentroid) || 0;
    const mid = Number(audioSignals?.mid) || 0;

    // spectralCentroid is in Hz (e.g. 800–5000). Normalize to 0–1 so saturate() stays sane.
    const centroidNorm = Math.min(1, centroid / 8000);

    const sat = 1.0 + (centroidNorm * 0.4) * envelopeDepth;
    const hue = (mid * 35) * envelopeDepth;

    stateRef.current.saturate = sat;
    stateRef.current.hueRotate = hue;

    setEnvelopeValues((prev) => ({
      ...prev,
      saturate: sat,
      hueRotate: hue,
    }));

    if (targetRef?.current) {
      targetRef.current.style.setProperty('--env-saturate', sat.toFixed(3));
      targetRef.current.style.setProperty('--env-hue-rotate', `${hue.toFixed(1)}deg`);
    }
  }, [audioSignals?.spectralCentroid, audioSignals?.mid, isPlaying, envelopeDepth, targetRef]);

  // Reset when paused/stopped
  useEffect(() => {
    if (!isPlaying) {
      gsap.killTweensOf(stateRef.current);
      stateRef.current = {
        contrast: 1.0,
        brightness: 1.0,
        saturate: 1.0,
        hueRotate: 0,
      };
      setEnvelopeValues({
        contrast: 1.0,
        brightness: 1.0,
        saturate: 1.0,
        hueRotate: 0,
      });
      if (targetRef?.current) {
        targetRef.current.style.removeProperty('--env-contrast');
        targetRef.current.style.removeProperty('--env-brightness');
        targetRef.current.style.removeProperty('--env-saturate');
        targetRef.current.style.removeProperty('--env-hue-rotate');
      }
    }
  }, [isPlaying, targetRef]);

  const filterString = `contrast(${envelopeValues.contrast.toFixed(3)}) brightness(${envelopeValues.brightness.toFixed(3)}) saturate(${envelopeValues.saturate.toFixed(3)}) hue-rotate(${envelopeValues.hueRotate.toFixed(1)}deg)`;

  return {
    envelopeValues,
    filterString,
    triggerHit,
  };
}
