// src/hooks/useAudioEngine.js
// Native HTML5 Audio Clock + Tone.js Transport & Meyda Spectral Analysis
// Exports every field App.jsx destructures

import { useState, useRef, useEffect, useCallback } from 'react';
import * as Tone from 'tone';
import Meyda from 'meyda';
import { useTransportClock } from './useTransportClock';
import { REVERB_PRESETS, DEFAULT_REVERB_WET } from '../constants/reverbPresets';
import { createProceduralAudioTrack } from '../constants/initialMedia';

const MEYDA_BUFFER_SIZE = 512;

// ── Waveform peak extraction for timeline visualisation (cached & deduplicated) ──
const peaksCache = new Map();
const inFlightDecodes = new Map();

async function decodeWaveformPeaks(fileOrUrl, sampleCount = 200) {
  try {
    const cacheKey = typeof fileOrUrl === 'string' ? fileOrUrl : (fileOrUrl?.name || null);
    if (cacheKey && peaksCache.has(cacheKey)) {
      return peaksCache.get(cacheKey);
    }
    if (cacheKey && inFlightDecodes.has(cacheKey)) {
      return await inFlightDecodes.get(cacheKey);
    }

    const decodePromise = (async () => {
      let arrayBuffer;
      if (typeof fileOrUrl === 'string') {
        const resp = await fetch(fileOrUrl);
        if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
        arrayBuffer = await resp.arrayBuffer();
      } else if (fileOrUrl?.arrayBuffer) {
        arrayBuffer = await fileOrUrl.arrayBuffer();
      } else {
        return [];
      }
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const decoded = await ctx.decodeAudioData(arrayBuffer.slice(0));
      await ctx.close().catch(() => {});

      const ch = decoded.getChannelData(0);
      const blockSize = Math.floor(ch.length / sampleCount);
      const peaks = [];
      for (let i = 0; i < sampleCount; i++) {
        let sum = 0;
        const start = i * blockSize;
        for (let j = 0; j < blockSize; j++) sum += Math.abs(ch[start + j] || 0);
        peaks.push(sum / blockSize);
      }
      const max = Math.max(...peaks, 0.001);
      const result = peaks.map((p) => p / max);
      if (cacheKey) peaksCache.set(cacheKey, result);
      return result;
    })();

    if (cacheKey) inFlightDecodes.set(cacheKey, decodePromise);
    const res = await decodePromise;
    if (cacheKey) inFlightDecodes.delete(cacheKey);
    return res;
  } catch (err) {
    console.warn('[useAudioEngine] decodeWaveformPeaks fallback:', err);
    return Array.from({ length: sampleCount }, (_, i) => 0.2 + 0.25 * Math.sin(i * 0.1));
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// HOOK
// ═══════════════════════════════════════════════════════════════════════════
export function useAudioEngine(sensitivity = 1.0, bpm = 120) {
  // ── Core playback state ────────────────────────────────────────────────
  const [isPlaying, setIsPlaying]             = useState(false);
  const [currentTime, setCurrentTime]         = useState(0);
  const [duration, setDuration]               = useState(32); // default so counter shows 00:32
  const [waveformPeaks, setWaveformPeaks]     = useState([]);
  const [transientMarkers, setTransientMarkers] = useState([]);
  const [isAudioUnlocked, setIsAudioUnlocked] = useState(false);

  // ── Spectral / audio-reactive signals ──────────────────────────────────
  const [audioSignals, setAudioSignals] = useState({
    bass: 0, mid: 0, treble: 0, rawVolume: 0,
    spectralFlux: 0, spectralCentroid: 0,
    rms: 0, energy: 0, vocalEnergy: 0,
    isTransient: false, isPlaying: false,
  });
  const zeroSignals = () => ({
    bass: 0, mid: 0, treble: 0, rawVolume: 0,
    spectralFlux: 0, spectralCentroid: 0,
    rms: 0, energy: 0, vocalEnergy: 0,
    isTransient: false, isPlaying: false,
  });

  // ── Reverb state ───────────────────────────────────────────────────────
  const [reverbPreset, setReverbPreset] = useState('vintage_plate');
  const [reverbWet, setReverbWet]       = useState(DEFAULT_REVERB_WET);

  // ── A/B Loop state ─────────────────────────────────────────────────────
  const [isLooping, setIsLooping] = useState(false);
  const [loopStart, setLoopStart] = useState(0);
  const [loopEnd, setLoopEnd]     = useState(16);

  const isLoopingRef = useRef(false);
  const loopStartRef = useRef(0);
  const loopEndRef   = useRef(16);
  useEffect(() => { isLoopingRef.current = isLooping; }, [isLooping]);
  useEffect(() => { loopStartRef.current = loopStart; }, [loopStart]);
  useEffect(() => { loopEndRef.current   = loopEnd;   }, [loopEnd]);

  const setLoopPoints = useCallback((start, end) => {
    setLoopStart(start);
    setLoopEnd(end);
  }, []);

  // ── Refs ────────────────────────────────────────────────────────────────
  const audioRef            = useRef(null);
  const rafRef              = useRef(null);
  const audioContextRef     = useRef(null);
  const analyserRef         = useRef(null);
  const audioDestinationRef = useRef(null);
  const sourceNodeRef       = useRef(null);
  const meydaAnalyzerRef    = useRef(null);
  const reverbRef           = useRef(null);
  const dataArrayRef        = useRef(null);
  const sensitivityRef      = useRef(sensitivity);
  useEffect(() => { sensitivityRef.current = sensitivity; }, [sensitivity]);

  const lastTransientTime = useRef(0);
  const fluxHistoryRef    = useRef([]);
  const latestMeyda       = useRef({
    spectralFlux: 0, spectralCentroid: 0, rms: 0, energy: 0, vocalEnergy: 0, rawFlux: 0,
  });

  // ── Tone Transport Clock ───────────────────────────────────────────────
  const transportClock = useTransportClock({
    bpm, isPlaying, currentTime,
    isLooping, loopStart, loopEnd,
  });

  // ── Create native Audio element once ───────────────────────────────────
  useEffect(() => {
    if (!audioRef.current) {
      const el = new Audio();
      el.crossOrigin = 'anonymous';
      el.preload     = 'metadata';
      audioRef.current = el;

      // Duration discovery
      const syncDuration = () => {
        if (el.duration && isFinite(el.duration) && el.duration > 0) {
          setDuration(el.duration);
        }
      };
      el.addEventListener('loadedmetadata', syncDuration);
      el.addEventListener('durationchange', syncDuration);
      el.addEventListener('canplay', syncDuration);

      // Native timeupdate with A/B loop enforcement
      el.addEventListener('timeupdate', () => {
        if (el && !el.paused) {
          const t = el.currentTime || 0;
          if (isLoopingRef.current && loopEndRef.current > loopStartRef.current && t >= loopEndRef.current) {
            el.currentTime = loopStartRef.current;
            setCurrentTime(loopStartRef.current);
            transportClock.seekTransport(loopStartRef.current);
          } else {
            setCurrentTime(t);
          }
        }
      });

      // End handling (loop or stop)
      el.addEventListener('ended', () => {
        if (isLoopingRef.current && loopEndRef.current > loopStartRef.current) {
          el.currentTime = loopStartRef.current;
          setCurrentTime(loopStartRef.current);
          transportClock.seekTransport(loopStartRef.current);
          el.play().catch(() => {});
          return;
        }
        setIsPlaying(false);
        setCurrentTime(0);
        if (rafRef.current) cancelAnimationFrame(rafRef.current);
        if (meydaAnalyzerRef.current) try { meydaAnalyzerRef.current.stop(); } catch (_) {}
        setAudioSignals(zeroSignals());
        transportClock.resetClock();
      });
    }

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Web Audio graph (for Meyda spectral analysis + reverb) ─────────────
  const ensureAudioGraph = useCallback(() => {
    const el = audioRef.current;
    if (!el || audioContextRef.current) return;

    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      audioContextRef.current = ctx;

      const source = ctx.createMediaElementSource(el);
      sourceNodeRef.current = source;

      const analyser = ctx.createAnalyser();
      analyser.fftSize = 2048;
      analyserRef.current = analyser;
      dataArrayRef.current = new Uint8Array(analyser.frequencyBinCount);

      const dest = ctx.createMediaStreamDestination();
      audioDestinationRef.current = dest;

      // Chain: source → analyser → destination + speakers
      source.connect(analyser);
      analyser.connect(ctx.destination);
      analyser.connect(dest);

      // Meyda
      try {
        const meyda = Meyda.createMeydaAnalyzer({
          audioContext: ctx,
          source: analyser,
          bufferSize: MEYDA_BUFFER_SIZE,
          featureExtractors: ['rms', 'energy', 'spectralFlux', 'spectralCentroid'],
          callback: (features) => {
            if (!features) return;
            const s = sensitivityRef.current;
            latestMeyda.current = {
              spectralFlux:    (features.spectralFlux || 0) * s,
              spectralCentroid: features.spectralCentroid || 0,
              rms:             (features.rms || 0) * s,
              energy:          (features.energy || 0) * s,
              vocalEnergy:     0,
              rawFlux:         features.spectralFlux || 0,
            };
          },
        });
        meydaAnalyzerRef.current = meyda;
      } catch (meydaErr) {
        console.warn('[useAudioEngine] Meyda init warning:', meydaErr);
      }
    } catch (err) {
      console.warn('[useAudioEngine] Web Audio graph init warning:', err);
    }
  }, []);

  // ── RAF-based signal extractor (runs while playing) ────────────────────
  const startClockAndAnalysis = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);

    // Previous FFT frame for spectral flux computation
    let prevFrame = null;

    const tick = () => {
      const el       = audioRef.current;
      const analyser = analyserRef.current;
      const data     = dataArrayRef.current;

      if (el && !el.paused) {
        setCurrentTime(el.currentTime);

        if (analyser && data) {
          analyser.getByteFrequencyData(data);
          const len = data.length;
          const s   = sensitivityRef.current;

          // ── Band energy ──
          let bassSum = 0, midSum = 0, trebleSum = 0, totalSum = 0;
          const bassEnd = Math.floor(len * 0.08);
          const midEnd  = Math.floor(len * 0.40);
          for (let i = 0; i < len; i++) {
            const v = data[i] / 255;
            totalSum += v;
            if (i < bassEnd)       bassSum   += v;
            else if (i < midEnd)   midSum    += v;
            else                   trebleSum += v;
          }
          const bass   = (bassSum   / Math.max(bassEnd, 1)) * s;
          const mid    = (midSum    / Math.max(midEnd - bassEnd, 1)) * s;
          const treble = (trebleSum / Math.max(len - midEnd, 1)) * s;
          const raw    = (totalSum  / len) * s;
          const rms    = Math.sqrt(totalSum / len) * s; // simple RMS approx

          // ── Spectral flux: L1 diff between this frame and previous ──
          let flux = 0;
          if (prevFrame) {
            for (let i = 0; i < len; i++) {
              const diff = (data[i] - prevFrame[i]) / 255;
              if (diff > 0) flux += diff; // half-wave rectified (onsets only)
            }
            flux /= len; // normalize to [0, ~0.1] range
          }
          // Save a copy of current frame for next tick
          if (!prevFrame || prevFrame.length !== len) prevFrame = new Uint8Array(len);
          prevFrame.set(data);

          // ── Transient detection from flux history ──
          const now = performance.now() / 1000;
          fluxHistoryRef.current.push(flux);
          if (fluxHistoryRef.current.length > 43) fluxHistoryRef.current.shift(); // ~700ms at 60fps
          const avgFlux = fluxHistoryRef.current.reduce((a, b) => a + b, 0) / fluxHistoryRef.current.length;

          // Transient fires when flux spikes 1.8× above recent average, min 120ms apart
          const isTransient = flux > avgFlux * 1.8 && flux > 0.002 && (now - lastTransientTime.current) > 0.12;
          if (isTransient) lastTransientTime.current = now;

          // Also grab any Meyda data if it happened to fire (optional enhancement)
          const m = latestMeyda.current;

          setAudioSignals({
            bass, mid, treble, rawVolume: raw,
            rms:             m.rms > 0 ? m.rms : rms,
            energy:          m.energy || raw,
            spectralFlux:    flux,
            spectralCentroid: m.spectralCentroid || 0,
            vocalEnergy:     m.vocalEnergy || 0,
            isTransient, isPlaying: true,
          });
        }

        rafRef.current = requestAnimationFrame(tick);
      }
    };

    rafRef.current = requestAnimationFrame(tick);
  }, []);

  // ── Spacebar play/pause ────────────────────────────────────────────────
  useEffect(() => {
    const onKey = (e) => {
      if (e.code === 'Space' && !e.target.closest('input, textarea, select, [contenteditable]')) {
        e.preventDefault();
        togglePlayRef.current();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // ── Audio unlock (first user gesture) ──────────────────────────────────
  const unlockAudio = useCallback(async () => {
    try {
      if (Tone.getContext().state !== 'running') await Tone.start();
      if (audioContextRef.current?.state === 'suspended') await audioContextRef.current.resume();
      setIsAudioUnlocked(true);
    } catch (e) {
      console.warn('[useAudioEngine] Audio unlock warning:', e);
    }
  }, []);

  useEffect(() => {
    const gesture = () => unlockAudio();
    window.addEventListener('pointerdown', gesture, { once: true });
    window.addEventListener('keydown', gesture, { once: true });
    return () => {
      window.removeEventListener('pointerdown', gesture);
      window.removeEventListener('keydown', gesture);
    };
  }, [unlockAudio]);

  // ── loadAudioTrack ─────────────────────────────────────────────────────
  const loadAudioTrack = useCallback((fileOrUrl) => {
    const el = audioRef.current;
    if (!el) return;

    el.pause();
    setIsPlaying(false);
    setCurrentTime(0);
    if (rafRef.current) cancelAnimationFrame(rafRef.current);

    const url = typeof fileOrUrl === 'string' ? fileOrUrl : URL.createObjectURL(fileOrUrl);
    el.src = url;
    el.preload = 'metadata';
    el.load();

    setWaveformPeaks([]);
    setTransientMarkers([]);

    // Defer waveform peak decode so browser finishes DOM paint and layout first
    setTimeout(() => {
      decodeWaveformPeaks(fileOrUrl).then(setWaveformPeaks);
    }, 150);
  }, []);

  // ── togglePlay ─────────────────────────────────────────────────────────
  const togglePlay = useCallback(async () => {
    const el = audioRef.current;
    if (!el) return;

    // Auto-generate fallback if no source loaded
    if (!el.src || el.src === window.location.href || el.src === '') {
      const defaultTrackUrl = './assets-bg/excavating-neverland.mp3';
      el.src = defaultTrackUrl;
      el.preload = 'auto';
      el.load();
    } else {
      el.preload = 'auto';
    }

    ensureAudioGraph();
    await unlockAudio();

    if (audioContextRef.current?.state === 'suspended') {
      try { await audioContextRef.current.resume(); } catch (_) {}
    }

    if (!el.paused) {
      // PAUSE
      el.pause();
      setIsPlaying(false);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (meydaAnalyzerRef.current) try { meydaAnalyzerRef.current.stop(); } catch (_) {}
      setAudioSignals(zeroSignals());
    } else {
      // PLAY
      try {
        await el.play();
        setIsPlaying(true);
        if (meydaAnalyzerRef.current) try { meydaAnalyzerRef.current.start(); } catch (_) {}
        startClockAndAnalysis();
      } catch (err) {
        console.error('[useAudioEngine] Audio playback error:', err);
      }
    }
  }, [ensureAudioGraph, unlockAudio, startClockAndAnalysis, bpm]);

  // Stable ref for spacebar handler
  const togglePlayRef = useRef(togglePlay);
  useEffect(() => { togglePlayRef.current = togglePlay; }, [togglePlay]);

  // ── stopEngine ─────────────────────────────────────────────────────────
  const stopEngine = useCallback(() => {
    const el = audioRef.current;
    if (el) { el.pause(); el.currentTime = 0; }
    setIsPlaying(false);
    setCurrentTime(0);
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    if (meydaAnalyzerRef.current) try { meydaAnalyzerRef.current.stop(); } catch (_) {}
    transportClock.resetClock();
    setAudioSignals(zeroSignals());
    setTransientMarkers([]);
  }, [transportClock]);

  // ── seekTo ─────────────────────────────────────────────────────────────
  const seekTo = useCallback((time) => {
    const el = audioRef.current;
    if (!el) return;
    const clamped = Math.max(0, Math.min(time, el.duration || duration || 0));
    el.currentTime = clamped;
    setCurrentTime(clamped);
    transportClock.seekTransport(clamped);
  }, [duration, transportClock]);

  // ═════════════════════════════════════════════════════════════════════════
  // RETURN — every field App.jsx destructures
  // ═════════════════════════════════════════════════════════════════════════
  return {
    // Playback
    isPlaying,
    currentTime,
    duration,
    waveformPeaks,
    transientMarkers,
    audioSignals,
    isAudioUnlocked,

    // Methods
    loadAudioTrack,
    togglePlay,
    stopEngine,
    seekTo,
    unlockAudio,

    // Aliases (backward compat)
    loadTrack: loadAudioTrack,
    seek: seekTo,
    audioElRef: audioRef,
    audioElement: audioRef.current,

    // Reverb
    reverbPreset,
    setReverbPreset,
    reverbWet,
    setReverbWet,

    // A/B Looping
    isLooping,
    setIsLooping,
    loopStart,
    setLoopStart,
    loopEnd,
    setLoopEnd,
    setLoopPoints,

    // Transport clock subdivision data
    transportClock,

    // Recording destination
    audioDestinationRef,
  };
}