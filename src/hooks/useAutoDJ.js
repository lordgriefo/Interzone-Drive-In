// src/hooks/useAutoDJ.js
// Auto DJ — randomly mutates editing style, era, and rube chain
// on music-reactive triggers, creating an ever-shifting VJ experience.

import { useRef, useCallback, useEffect } from 'react';

// ── Available pools ─────────────────────────────────────────────────────
const ERAS = [
  'lynchian_interzone', '1902_melies', '1920_caligari', '1927_metropolis',
  '1940_noir', '1950_bandstand', '1960_psychedelic', '1970_grindhouse',
  '1980_vhs', '2020_cyber', 'roswell_signal', 'xenotrope',
];

const STYLES = [
  'third_mind', 'brakhage_emulsion', 'ken_burns', 'fiona_voyeur', 'strobe',
  'montage', 'solarize_invert', 'vinyl_crackle', 'datamosh', 'glitch_highway',
  'lynch_redroom', 'lynch_eraserhead', 'warhol_screen', 'debord_detourne',
  'marker_jetee', 'godard_jump', 'vertov_eye', 'anger_invocation',
  'jodorowsky_ritual', 'mekas_diary', 'viola_passage', 'deren_meshes',
  'ambient_drift', 'lo_fi_flicker', 'slow_dissolve', 'dreamscape',
  'apple_kinetic', 'mv_long_cut', 'mv_slow_burn', 'mv_flash_cut',
  'mv_neon_strobe', 'mv_retro_grain', 'mv_hypnotic_drift',
  'dmt_breakthrough', 'lsd_acid_melt', 'psilocybin_breath', 'ayahuasca_vision',
];

const RUBES = [
  'none', 'dada_factory', 'alchemical', 'strangelet_event', 'pneumatic',
  'cathode_burn', 'chromatic_prism', 'film_burn', 'signal_dropout',
  'neon_pulse', 'slow_burn', 'ghost_loop', 'soft_pulse', 'warm_drift',
  'dream_haze', 'gentle_sway', 'heartbeat',
];

// ── Grouped style "moods" for more coherent randomization ────────────
const MOOD_GROUPS = {
  intense:     ['strobe', 'datamosh', 'glitch_highway', 'mv_flash_cut', 'mv_neon_strobe', 'brakhage_emulsion', 'anger_invocation', 'dmt_breakthrough'],
  cinematic:   ['ken_burns', 'fiona_voyeur', 'montage', 'slow_dissolve', 'dreamscape', 'mv_long_cut', 'mv_slow_burn', 'mv_hypnotic_drift', 'viola_passage'],
  avantgarde:  ['third_mind', 'godard_jump', 'vertov_eye', 'debord_detourne', 'marker_jetee', 'deren_meshes', 'mekas_diary', 'jodorowsky_ritual'],
  retro:       ['vinyl_crackle', 'solarize_invert', 'lo_fi_flicker', 'mv_retro_grain', 'warhol_screen'],
  dreamy:      ['ambient_drift', 'lynch_redroom', 'lynch_eraserhead', 'apple_kinetic', 'dreamscape', 'mv_hypnotic_drift', 'psilocybin_breath'],
  psychedelic: ['dmt_breakthrough', 'lsd_acid_melt', 'psilocybin_breath', 'ayahuasca_vision'],
};
const MOOD_KEYS = Object.keys(MOOD_GROUPS);

function pickRandom(arr, exclude) {
  const pool = exclude != null ? arr.filter((v) => v !== exclude) : arr;
  return pool[Math.floor(Math.random() * pool.length)];
}

/**
 * useAutoDJ — auto-randomizes style, era, and rube on music triggers.
 *
 * @param {Object} opts
 * @param {boolean}  opts.enabled        - Master on/off
 * @param {string}   opts.mode           - 'full_random' | 'mood_drift' | 'era_only' | 'style_only'
 * @param {number}   opts.changeInterval - Minimum seconds between changes (default 12)
 * @param {Object}   opts.audioSignals   - Live audio signals { bass, mid, treble, rms, isTransient }
 * @param {boolean}  opts.isPlaying      - Is audio playing?
 * @param {number}   opts.currentTime    - Current playback time
 * @param {string}   opts.currentEra
 * @param {string}   opts.currentStyle
 * @param {string}   opts.currentRube
 * @param {Function} opts.setEra
 * @param {Function} opts.setStyle
 * @param {Function} opts.setRube
 * @param {number}   opts.bpm            - Current BPM for beat-aligned changes
 */
export function useAutoDJ({
  enabled = false,
  mode = 'full_random',
  changeInterval = 12,
  audioSignals = {},
  isPlaying = false,
  currentTime = 0,
  currentEra = '',
  currentStyle = '',
  currentRube = 'none',
  setEra = () => {},
  setStyle = () => {},
  setRube = () => {},
  bpm = 120,
} = {}) {
  const lastChangeRef = useRef(0);
  const currentMoodRef = useRef(MOOD_KEYS[Math.floor(Math.random() * MOOD_KEYS.length)]);
  const transientCountRef = useRef(0);

  const doChange = useCallback(() => {
    const now = performance.now() / 1000;
    if (now - lastChangeRef.current < changeInterval) return;
    lastChangeRef.current = now;

    switch (mode) {
      case 'era_only':
        setEra(pickRandom(ERAS, currentEra));
        break;

      case 'style_only':
        setStyle(pickRandom(STYLES, currentStyle));
        break;

      case 'mood_drift': {
        // Occasionally shift to a new mood group
        if (Math.random() < 0.35) {
          currentMoodRef.current = pickRandom(MOOD_KEYS, currentMoodRef.current);
        }
        const moodStyles = MOOD_GROUPS[currentMoodRef.current];
        setStyle(pickRandom(moodStyles, currentStyle));
        // Shift era with 40% probability
        if (Math.random() < 0.4) {
          setEra(pickRandom(ERAS, currentEra));
        }
        // Shift rube with 25% probability
        if (Math.random() < 0.25) {
          setRube(pickRandom(RUBES, currentRube));
        }
        break;
      }

      case 'full_random':
      default: {
        setStyle(pickRandom(STYLES, currentStyle));
        if (Math.random() < 0.5) {
          setEra(pickRandom(ERAS, currentEra));
        }
        if (Math.random() < 0.3) {
          setRube(pickRandom(RUBES, currentRube));
        }
        break;
      }
    }
  }, [mode, changeInterval, currentEra, currentStyle, currentRube, setEra, setStyle, setRube]);

  // Fire changes on strong transients
  useEffect(() => {
    if (!enabled || !isPlaying) {
      transientCountRef.current = 0;
      return;
    }

    const bass = Number(audioSignals?.bass) || 0;
    const isTransient = audioSignals?.isTransient;

    if (isTransient && bass > 0.6) {
      transientCountRef.current++;
      // Only trigger change every Nth strong transient (depends on interval)
      // At 120 BPM, transients come roughly every 0.5s
      // With changeInterval=12, we want roughly one change per 12s
      const beatsPerInterval = Math.max(2, Math.round(changeInterval * (bpm / 60)));
      if (transientCountRef.current >= beatsPerInterval) {
        transientCountRef.current = 0;
        doChange();
      }
    }
  }, [enabled, isPlaying, audioSignals, bpm, changeInterval, doChange]);

  // Also fire on a timer as fallback (in case audio is quiet)
  useEffect(() => {
    if (!enabled || !isPlaying) return;
    const interval = setInterval(() => {
      doChange();
    }, changeInterval * 1000);
    return () => clearInterval(interval);
  }, [enabled, isPlaying, changeInterval, doChange]);

  return { doChange };
}
