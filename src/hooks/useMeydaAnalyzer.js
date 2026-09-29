// src/hooks/useMeydaAnalyzer.js
// Phase 2: Real-time audio feature extraction using Meyda
// Extracts spectralFlux, spectralCentroid, rms, energy, and computes vocal-band / transient triggers

import { useEffect, useRef, useState, useCallback } from 'react';
import Meyda from 'meyda';

const BUFFER_SIZE = 512;

export function useMeydaAnalyzer({
  audioContext,
  sourceNode,
  isPlaying,
  sensitivity = 1.0,
  onTransient,
}) {
  const [meydaSignals, setMeydaSignals] = useState({
    spectralFlux: 0,
    spectralCentroid: 0,
    rms: 0,
    energy: 0,
    vocalEnergy: 0,
    isTransient: false,
  });

  const analyzerRef = useRef(null);
  const sensitivityRef = useRef(sensitivity);
  const lastTransientTimeRef = useRef(0);
  const fluxHistoryRef = useRef([]);
  const isPlayingRef = useRef(isPlaying);

  useEffect(() => {
    sensitivityRef.current = sensitivity;
  }, [sensitivity]);

  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);

  // Cleanup analyzer on unmount or node change
  const stopAnalyzer = useCallback(() => {
    if (analyzerRef.current) {
      try {
        analyzerRef.current.stop();
      } catch (_) {}
      analyzerRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (!audioContext || !sourceNode || !isPlaying) {
      stopAnalyzer();
      return;
    }

    try {
      // Set Meyda audio context
      Meyda.audioContext = audioContext;
      Meyda.bufferSize = BUFFER_SIZE;

      const analyzer = Meyda.createMeydaAnalyzer({
        audioContext,
        source: sourceNode,
        bufferSize: BUFFER_SIZE,
        windowingFunction: 'hanning',
        featureExtractors: [
          'spectralFlux',
          'spectralCentroid',
          'rms',
          'energy',
          'zcr',
        ],
        callback: (features) => {
          if (!features || !isPlayingRef.current) return;

          const rawFlux = typeof features.spectralFlux === 'number' ? features.spectralFlux : 0;
          const rawCentroid = typeof features.spectralCentroid === 'number' ? features.spectralCentroid : 0;
          const rawRms = typeof features.rms === 'number' ? features.rms : 0;
          const rawEnergy = typeof features.energy === 'number' ? features.energy : 0;

          // Running flux average for adaptive thresholding
          const fluxHist = fluxHistoryRef.current;
          fluxHist.push(rawFlux);
          if (fluxHist.length > 30) fluxHist.shift();
          const avgFlux = fluxHist.reduce((a, b) => a + b, 0) / (fluxHist.length || 1);

          // Normalized values [0.0, 1.0]
          // Nyquist frequency = sampleRate / 2 (typically 22050 or 24000)
          const nyquist = (audioContext.sampleRate || 44100) / 2;
          const normCentroid = Math.min(1, Math.max(0, rawCentroid / Math.min(8000, nyquist)));
          const normFlux = Math.min(1, Math.max(0, rawFlux / 50));
          const normRms = Math.min(1, Math.max(0, rawRms * 2.5));
          const normEnergy = Math.min(1, Math.max(0, rawEnergy / 40));

          // Vocal band focus (~300Hz to ~3400Hz represents typical human vocal resonance)
          // High centroid with moderate energy indicates strong vocal/lead presence
          const vocalPresence = Math.min(1, Math.max(0, (normCentroid * 1.2) * (normRms * 1.5)));

          // Transient detection with dynamic sensitivity
          const threshold = Math.max(0.12, (avgFlux * 1.6 + 0.1) / Math.max(0.2, sensitivityRef.current));
          const now = Date.now();
          const isSpike = rawFlux > threshold && (now - lastTransientTimeRef.current > 140);

          if (isSpike) {
            lastTransientTimeRef.current = now;
            onTransient?.({
              flux: normFlux,
              centroid: normCentroid,
              energy: normEnergy,
            });
          }

          setMeydaSignals({
            spectralFlux: normFlux,
            spectralCentroid: normCentroid,
            rms: normRms,
            energy: normEnergy,
            vocalEnergy: vocalPresence,
            isTransient: isSpike,
          });
        },
      });

      analyzer.start();
      analyzerRef.current = analyzer;
    } catch (err) {
      console.warn('[useMeydaAnalyzer] Initialization warning:', err);
    }

    return () => {
      stopAnalyzer();
    };
  }, [audioContext, sourceNode, isPlaying, stopAnalyzer, onTransient]);

  return {
    meydaSignals,
    stopAnalyzer,
  };
}
