// src/utils/offlineAudioAnalyzer.js
// Deterministic offline audio analysis for frame-by-frame export (Mode B)
// Decodes audio into raw Float32 samples and extracts Meyda spectral features
// and frequency energy bands for any arbitrary timestamp t without real-time playback.

import Meyda from 'meyda';

const BUFFER_SIZE = 512;

/**
 * Decodes an audio file or URL into an AudioBuffer.
 * @param {string|File|Blob} audioSource
 * @returns {Promise<AudioBuffer|null>}
 */
export async function decodeAudioSource(audioSource) {
  if (!audioSource) return null;

  try {
    let arrayBuffer;
    if (typeof audioSource === 'string') {
      const resp = await fetch(audioSource);
      arrayBuffer = await resp.arrayBuffer();
    } else if (audioSource.arrayBuffer) {
      arrayBuffer = await audioSource.arrayBuffer();
    } else {
      return null;
    }

    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return null;

    const ctx = new AudioContextClass();
    const audioBuffer = await ctx.decodeAudioData(arrayBuffer.slice(0));
    await ctx.close();
    return audioBuffer;
  } catch (err) {
    console.warn('[offlineAudioAnalyzer] Audio decode warning:', err);
    return null;
  }
}

/**
 * Creates a stateful offline audio analyzer instance that retains
 * previous FFT spectrum and flux history for accurate beat transient detection.
 * @param {AudioBuffer} audioBuffer
 * @param {number} sensitivity
 * @returns {{ extractAtTime: (timestampSeconds: number) => object }}
 */
export function createOfflineAudioAnalyzer(audioBuffer, sensitivity = 1.0) {
  let prevSpectrum = null;
  const fluxHistory = [];
  let lastTransientTime = -1;

  return {
    extractAtTime(timestampSeconds) {
      const { signals, spectrum } = extractSignalsAtTime(
        audioBuffer,
        timestampSeconds,
        sensitivity,
        prevSpectrum,
        fluxHistory,
        lastTransientTime
      );

      prevSpectrum = spectrum;
      if (signals.isTransient) {
        lastTransientTime = timestampSeconds;
      }

      return signals;
    },
  };
}

/**
 * Extracts deterministic Meyda & band energy signals at exact timestamp t.
 * @param {AudioBuffer} audioBuffer
 * @param {number} timestampSeconds
 * @param {number} sensitivity
 * @param {Float32Array|null} prevSpectrum
 * @param {number[]} [fluxHistory]
 * @param {number} [lastTransientTime]
 * @returns {{ signals: object, spectrum: Float32Array }}
 */
export function extractSignalsAtTime(
  audioBuffer,
  timestampSeconds,
  sensitivity = 1.0,
  prevSpectrum = null,
  fluxHistory = null,
  lastTransientTime = -1
) {
  const zeroSignals = {
    bass: 0,
    mid: 0,
    treble: 0,
    rawVolume: 0,
    spectralFlux: 0,
    spectralCentroid: 0,
    rms: 0,
    energy: 0,
    vocalEnergy: 0,
    isTransient: false,
    isPlaying: true,
  };

  if (!audioBuffer) return { signals: zeroSignals, spectrum: new Float32Array(BUFFER_SIZE / 2) };

  const sampleRate = audioBuffer.sampleRate;
  const channelData = audioBuffer.getChannelData(0);
  const targetSample = Math.floor(timestampSeconds * sampleRate);

  // Extract a 512-sample window
  const windowSlice = new Float32Array(BUFFER_SIZE);
  let sliceSumSq = 0;
  for (let i = 0; i < BUFFER_SIZE; i++) {
    const idx = targetSample + i;
    if (idx >= 0 && idx < channelData.length) {
      const s = channelData[idx];
      windowSlice[i] = s;
      sliceSumSq += s * s;
    } else {
      windowSlice[i] = 0;
    }
  }

  // Extract Meyda features safely (omit 'spectralFlux' from extract() — Meyda throws TypeError without live context)
  let meydaFeatures = null;
  try {
    meydaFeatures = Meyda.extract(
      ['rms', 'energy', 'spectralCentroid', 'amplitudeSpectrum'],
      windowSlice
    );
  } catch (_) {}

  const spectrum = meydaFeatures?.amplitudeSpectrum || new Float32Array(BUFFER_SIZE / 2);
  const specLen = spectrum.length;

  // Compute 3-band energy from amplitude spectrum
  let bassSum = 0;
  let midSum = 0;
  let trebleSum = 0;
  let totalSum = 0;

  const bassEnd = Math.max(1, Math.floor(specLen * 0.08));
  const midEnd = Math.max(bassEnd + 1, Math.floor(specLen * 0.40));

  for (let i = 0; i < specLen; i++) {
    const val = spectrum[i] || 0;
    totalSum += val;
    if (i < bassEnd) bassSum += val;
    else if (i < midEnd) midSum += val;
    else trebleSum += val;
  }

  const s = sensitivity;
  const bass = (bassSum / Math.max(bassEnd, 1)) * s * 10;
  const mid = (midSum / Math.max(midEnd - bassEnd, 1)) * s * 8;
  const treble = (trebleSum / Math.max(specLen - midEnd, 1)) * s * 6;
  const rawVolume = (totalSum / Math.max(specLen, 1)) * s * 5;

  // Half-wave rectified spectral flux (onsets only)
  let flux = 0;
  if (prevSpectrum && prevSpectrum.length === specLen) {
    for (let i = 0; i < specLen; i++) {
      const diff = spectrum[i] - prevSpectrum[i];
      if (diff > 0) flux += diff;
    }
    flux = (flux / specLen) * s;
  }

  // Transient onset detection using moving flux history average
  let isTransient = false;
  if (fluxHistory) {
    fluxHistory.push(flux);
    if (fluxHistory.length > 43) fluxHistory.shift(); // ~700ms window at 60fps
    const avgFlux = fluxHistory.reduce((a, b) => a + b, 0) / fluxHistory.length;
    const timeSinceLast = timestampSeconds - lastTransientTime;
    isTransient = (flux > avgFlux * 1.8 && flux > 0.002 && timeSinceLast > 0.12) ||
                  (flux > 0.04 && timeSinceLast > 0.12);
  } else {
    isTransient = flux > 0.03 || bass > 0.85;
  }

  const rmsVal = meydaFeatures?.rms !== undefined
    ? meydaFeatures.rms * s
    : Math.sqrt(sliceSumSq / BUFFER_SIZE) * s;

  const energyVal = meydaFeatures?.energy !== undefined
    ? meydaFeatures.energy * s
    : sliceSumSq * s;

  const signals = {
    bass: Math.min(2.0, bass),
    mid: Math.min(2.0, mid),
    treble: Math.min(2.0, treble),
    rawVolume: Math.min(2.0, rawVolume),
    spectralFlux: flux,
    spectralCentroid: meydaFeatures?.spectralCentroid || 0,
    rms: rmsVal,
    energy: energyVal,
    vocalEnergy: mid * 0.7,
    isTransient,
    isPlaying: true,
  };

  return { signals, spectrum };
}
