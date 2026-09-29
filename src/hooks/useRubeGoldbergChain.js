// src/hooks/useRubeGoldbergChain.js
// 8-Step Cascading Rube Goldberg State Machine
// Now with per-preset personality profiles + 4 new visual keys

import { useState, useRef, useEffect, useCallback } from 'react';
import gsap from 'gsap';
import { ERA_OPTIONS } from '../constants/eras';

const ERA_KEYS = ERA_OPTIONS.map((e) => e.value);

export const RUBE_STAGE_NAMES = [
  '0. IDLE (Breath)',
  '1. PENDULUM (Tilt)',
  '2. DOMINO (Raster Split)',
  '3. JITTER (Micro-Shake)',
  '4. GRAVITY (Bounce Drop)',
  '5. PRISM (Spectral RGB)',
  '6. Z-RECOIL (Depth Snap)',
  '7. RESET (Flash Burst)',
];

// ── Base stage definitions ─────────────────────────────────────────────────
// These provide defaults. PRESET_OVERRIDES can replace any field per stage.

const STAGE_DEFS = [
  // 0 — Idle / Primed
  {
    index: 0, label: 'IDLE', maxDuration: Infinity,
    primaryTrigger: ({ transientEdge }) => transientEdge,
    onEnter: () => ({
      flashInvert: false, opacityBleed: 1, axisSplit: false,
      dollyScale: 1, colorInvert: false, eraOverride: null,
      prismSplit: false, zRecoil: 0, tiltAngle: 0, gravityY: 0,
      tvCollapse: 0, chromaOffset: 0, filmBurn: 0, signalDrop: 0,
    }),
    onExit: () => ({}),
  },

  // 1 — Pendulum Swing
  {
    index: 1, label: 'PENDULUM', maxDuration: 1600,
    primaryTrigger: ({ mid, prevMid }) => mid > 0.25 && prevMid <= 0.25,
    onEnter: () => ({
      flashInvert: false,
      tiltAngle: (Math.random() > 0.5 ? 1 : -1) * (3 + Math.random() * 3),
      opacityBleed: 0.95,
    }),
    onExit: () => ({ tiltAngle: 0, opacityBleed: 1 }),
  },

  // 2 — Domino Slices
  {
    index: 2, label: 'DOMINO', maxDuration: 1200,
    primaryTrigger: ({ elapsed, rubeDecay }) => elapsed >= Math.min(600, rubeDecay),
    onEnter: () => ({ axisSplit: true, opacityBleed: 0.92 }),
    onExit: () => ({}),
  },

  // 3 — Jitter / Mechanical Vibration
  {
    index: 3, label: 'JITTER', maxDuration: 150,
    primaryTrigger: ({ elapsed }) => elapsed >= 150,
    onEnter: () => ({ opacityBleed: 0.88, axisSplit: true }),
    onExit: () => ({ axisSplit: false, opacityBleed: 1 }),
  },

  // 4 — Gravity Drop
  {
    index: 4, label: 'GRAVITY', maxDuration: 1500,
    primaryTrigger: ({ bass }) => bass > 0.28,
    onEnter: (ctx) => {
      const target = { y: 28 };
      gsap.to(target, { y: 0, duration: 0.6, ease: 'bounce.out' });
      return { gravityY: 28, dollyScale: 0.94 };
    },
    onExit: () => ({ gravityY: 0, dollyScale: 1.0 }),
  },

  // 5 — Prism Refraction
  {
    index: 5, label: 'PRISM', maxDuration: 1800,
    primaryTrigger: ({ beatCount }) => beatCount >= 2,
    onEnter: () => ({ prismSplit: true, dollyScale: 1.08, opacityBleed: 0.92 }),
    onExit: () => ({ prismSplit: false, dollyScale: 1.0 }),
  },

  // 6 — Z-Axis Recoil
  {
    index: 6, label: 'Z-RECOIL', maxDuration: 1400,
    primaryTrigger: ({ bass, beatCount }) => bass > 0.22 && beatCount >= 1,
    onEnter: (ctx) => {
      // Check if era mutation is locked or on cooldown
      const shouldMutate = ctx?.canMutateEra ? ctx.canMutateEra() : !ctx?.isEraLocked;
      if (shouldMutate) {
        const nextEra = ERA_KEYS[Math.floor(Math.random() * ERA_KEYS.length)];
        ctx?.onEraMutate?.(nextEra);
        return { eraOverride: nextEra, dollyScale: 1.18, zRecoil: 1 };
      }
      // Crucial: All other 9-step trigger actions (displacement intensity, camera pulsation, glitch stutter cuts)
      // MUST continue firing normally on Meyda audio spikes.
      return { dollyScale: 1.18, zRecoil: 1 };
    },
    onExit: () => ({ dollyScale: 1.0, zRecoil: 0 }),
  },

  // 7 — Full Reset
  {
    index: 7, label: 'RESET', maxDuration: 300,
    primaryTrigger: ({ elapsed }) => elapsed >= 180,
    onEnter: () => ({
      colorInvert: false, flashInvert: true, opacityBleed: 1, dollyScale: 1.0,
    }),
    onExit: () => ({
      colorInvert: false, flashInvert: false, axisSplit: false, dollyScale: 1,
      prismSplit: false, zRecoil: 0, tiltAngle: 0, gravityY: 0,
      eraOverride: null, opacityBleed: 1,
      // New visual keys — always reset to neutral
      tvCollapse: 0, chromaOffset: 0, filmBurn: 0, signalDrop: 0,
    }),
  },
];

// ── Per-preset personality overrides ──────────────────────────────────────
// Each entry is an array indexed by stage (0-7).
// null = use base STAGE_DEF unchanged.
// { maxDuration?, trigger?, patch? } = override specific fields.
//   patch   — merged ON TOP of onEnter() result
//   trigger — replaces primaryTrigger entirely
//   maxDuration — replaces stage maxDuration

const PRESET_OVERRIDES = {

  // ── Existing presets, now with real personality ──

  dada_factory: [
    null,
    // 1 PENDULUM — fast, aggressive tilt
    { maxDuration: 700,  patch: { tiltAngle: (Math.random() > 0.5 ? 1 : -1) * (7 + Math.random() * 3), opacityBleed: 0.90 } },
    // 2 DOMINO — snappy
    { maxDuration: 450,  patch: { opacityBleed: 0.84 } },
    // 3 JITTER — very short, hard shake
    { maxDuration: 120,  patch: { opacityBleed: 0.78 } },
    // 4 GRAVITY — low bass threshold, big drop
    { trigger: ({ bass }) => bass > 0.15, patch: { gravityY: 34, dollyScale: 0.90 } },
    // 5 PRISM
    { maxDuration: 750,  patch: { dollyScale: 1.16, opacityBleed: 0.88 } },
    // 6 Z-RECOIL — biggest zoom
    { maxDuration: 550,  patch: { dollyScale: 1.30 } },
    // 7 RESET — very fast
    { maxDuration: 150 },
  ],

  alchemical: [
    null,
    // 1 PENDULUM — slow, gentle
    { maxDuration: 2600, patch: { tiltAngle: (Math.random() > 0.5 ? 1 : -1) * (1 + Math.random() * 2), opacityBleed: 0.98 } },
    // 2 DOMINO
    { maxDuration: 2000, patch: { opacityBleed: 0.96 } },
    // 3 JITTER
    { maxDuration: 250,  patch: { opacityBleed: 0.92 } },
    // 4 GRAVITY — high threshold, heavy drop
    { trigger: ({ bass }) => bass > 0.40, patch: { gravityY: 20, dollyScale: 0.97 } },
    // 5 PRISM — long, contemplative
    { maxDuration: 2800, patch: { dollyScale: 1.05, opacityBleed: 0.95 } },
    // 6 Z-RECOIL — subtle
    { maxDuration: 1600, patch: { dollyScale: 1.12 } },
    // 7 RESET
    { maxDuration: 400 },
  ],

  strangelet_event: [
    null,
    // 1 PENDULUM
    { maxDuration: 1200, patch: { tiltAngle: (Math.random() > 0.5 ? 1 : -1) * (5 + Math.random() * 4), opacityBleed: 0.92 } },
    // 2 DOMINO
    { maxDuration: 900,  patch: { opacityBleed: 0.88 } },
    // 3 JITTER — hard
    { maxDuration: 120,  patch: { opacityBleed: 0.82 } },
    // 4 GRAVITY — very sensitive bass trigger, extreme drop
    { trigger: ({ bass }) => bass > 0.12, patch: { gravityY: 42, dollyScale: 0.87 } },
    // 5 PRISM
    { maxDuration: 1600, patch: { dollyScale: 1.14 } },
    // 6 Z-RECOIL — strongest recoil of all
    { maxDuration: 1300, patch: { dollyScale: 1.34 } },
    // 7 RESET
    { maxDuration: 250 },
  ],

  pneumatic: [
    null,
    // 1 PENDULUM — mid-frequency trigger (mechanical rhythm)
    { trigger: ({ mid, prevMid }) => mid > 0.38 && prevMid <= 0.38,
      maxDuration: 1400, patch: { tiltAngle: (Math.random() > 0.5 ? 1 : -1) * 4, opacityBleed: 0.93 } },
    // 2 DOMINO
    { maxDuration: 1000, patch: { opacityBleed: 0.89 } },
    // 3 JITTER
    { maxDuration: 130,  patch: { opacityBleed: 0.85 } },
    // 4 GRAVITY — mid trigger, medium drop
    { trigger: ({ mid }) => mid > 0.35, patch: { gravityY: 24, dollyScale: 0.93 } },
    // 5 PRISM
    { maxDuration: 1700, patch: { dollyScale: 1.10 } },
    // 6 Z-RECOIL
    { maxDuration: 1200, patch: { dollyScale: 1.22 } },
    // 7 RESET
    { maxDuration: 300 },
  ],

  // ── New presets with distinct CSS FX ──

  cathode_burn: [
    null,
    // 1 PENDULUM — CRT starts compressing
    { maxDuration: 1400, patch: { tvCollapse: 0.45, tiltAngle: 0 } },
    // 2 DOMINO — collapsing toward a line
    { maxDuration: 1100, patch: { tvCollapse: 0.82, opacityBleed: 0.88 } },
    // 3 JITTER — near-static, unstable
    { maxDuration: 200,  patch: { tvCollapse: 0.96, opacityBleed: 0.78 } },
    // 4 GRAVITY — picture snaps back with bounce
    { trigger: ({ bass }) => bass > 0.20, patch: { tvCollapse: 0, gravityY: 28, dollyScale: 0.93 } },
    // 5 PRISM — brief double vision + slight compression
    { maxDuration: 1600, patch: { tvCollapse: 0.18, prismSplit: true } },
    // 6 Z-RECOIL — compression + zoom out
    { maxDuration: 1300, patch: { tvCollapse: 0.12, dollyScale: 1.14 } },
    // 7 RESET
    { maxDuration: 280 },
  ],

  chromatic_prism: [
    null,
    // 1 PENDULUM — subtle RGB fringe begins
    { maxDuration: 1500, patch: { chromaOffset: 8,  tiltAngle: (Math.random() > 0.5 ? 1 : -1) * 2 } },
    // 2 DOMINO — strong chroma + axis split
    { maxDuration: 1200, patch: { chromaOffset: 16, axisSplit: true } },
    // 3 JITTER — fringe + shake
    { maxDuration: 160,  patch: { chromaOffset: 6 } },
    // 4 GRAVITY — maximum chroma split + drop
    { trigger: ({ bass }) => bass > 0.18, patch: { chromaOffset: 22, gravityY: 22 } },
    // 5 PRISM — peak fringe + prismatic overlay
    { maxDuration: 2000, patch: { chromaOffset: 14, prismSplit: true, dollyScale: 1.10 } },
    // 6 Z-RECOIL — settle with zoom
    { maxDuration: 1300, patch: { chromaOffset: 7,  dollyScale: 1.20 } },
    // 7 RESET — chromaOffset cleared by base onExit
    { maxDuration: 240 },
  ],

  film_burn: [
    null,
    // 1 PENDULUM — warmth creeping in (amber veil)
    { maxDuration: 1600, patch: { filmBurn: 0.18, tiltAngle: (Math.random() > 0.5 ? 1 : -1) * 1.5 } },
    // 2 DOMINO — orange glow intensifying
    { maxDuration: 1400, patch: { filmBurn: 0.44, opacityBleed: 0.93 } },
    // 3 JITTER — heavy burn
    { maxDuration: 180,  patch: { filmBurn: 0.74 } },
    // 4 GRAVITY — full overexposure + drop
    { trigger: ({ bass }) => bass > 0.22, patch: { filmBurn: 0.96, dollyScale: 0.95, gravityY: 22 } },
    // 5 PRISM — recovering + double vision
    { maxDuration: 1900, patch: { filmBurn: 0.32, prismSplit: true } },
    // 6 Z-RECOIL — almost clear + zoom
    { maxDuration: 1400, patch: { filmBurn: 0.14, dollyScale: 1.16 } },
    // 7 RESET — filmBurn cleared by base onExit
    { maxDuration: 280 },
  ],

  signal_dropout: [
    null,
    // 1 PENDULUM — tracking wobble begins
    { maxDuration: 1300, patch: { signalDrop: 0.25, tiltAngle: (Math.random() > 0.5 ? 1 : -1) * 3 } },
    // 2 DOMINO — bad tracking + axis split
    { maxDuration: 1000, patch: { signalDrop: 0.55, axisSplit: true } },
    // 3 JITTER — heavy dropout / near-static
    { maxDuration: 170,  patch: { signalDrop: 0.84, opacityBleed: 0.82 } },
    // 4 GRAVITY — signal restoring + drop snap
    { trigger: ({ bass }) => bass > 0.18, patch: { signalDrop: 0.15, gravityY: 25 } },
    // 5 PRISM — intermittent dropouts + prism
    { maxDuration: 1800, patch: { signalDrop: 0.42, prismSplit: true } },
    // 6 Z-RECOIL — clearing up + zoom
    { maxDuration: 1300, patch: { signalDrop: 0.18, dollyScale: 1.18 } },
    // 7 RESET — signalDrop cleared by base onExit
    { maxDuration: 260 },
  ],

  // ── New presets ──

  neon_pulse: [
    null,
    // 1 PENDULUM — fast neon jolt, aggressive tilt
    { maxDuration: 600,  patch: { tiltAngle: (Math.random() > 0.5 ? 1 : -1) * (6 + Math.random() * 4), chromaOffset: 10, opacityBleed: 0.88 } },
    // 2 DOMINO — split + strong chroma
    { maxDuration: 500,  patch: { chromaOffset: 18, axisSplit: true, opacityBleed: 0.82 } },
    // 3 JITTER — ultra-short electric spike
    { maxDuration: 80,   patch: { chromaOffset: 6, opacityBleed: 0.75 } },
    // 4 GRAVITY — low bass threshold, neon drop
    { trigger: ({ bass }) => bass > 0.12, patch: { chromaOffset: 22, gravityY: 32, dollyScale: 0.88 } },
    // 5 PRISM — full rainbow aberration
    { maxDuration: 900,  patch: { chromaOffset: 20, prismSplit: true, dollyScale: 1.18, opacityBleed: 0.85 } },
    // 6 Z-RECOIL — explosive zoom + fringe
    { maxDuration: 700,  patch: { chromaOffset: 12, dollyScale: 1.36 } },
    // 7 RESET — fast snap back
    { maxDuration: 120 },
  ],

  slow_burn: [
    null,
    // 1 PENDULUM — barely perceptible tilt, warmth starts
    { maxDuration: 3500, patch: { tiltAngle: (Math.random() > 0.5 ? 1 : -1) * 1.0, filmBurn: 0.12, opacityBleed: 0.99 } },
    // 2 DOMINO — slow amber build
    { maxDuration: 3000, patch: { filmBurn: 0.36, opacityBleed: 0.97 } },
    // 3 JITTER — one long slow tremor
    { maxDuration: 400,  patch: { filmBurn: 0.52 } },
    // 4 GRAVITY — requires heavy bass, cinematic drop
    { trigger: ({ bass }) => bass > 0.50, patch: { filmBurn: 0.88, dollyScale: 0.98, gravityY: 14 } },
    // 5 PRISM — recovering, amber haze + ghost double
    { maxDuration: 3200, patch: { filmBurn: 0.42, prismSplit: true, dollyScale: 1.04 } },
    // 6 Z-RECOIL — very slow zoom
    { maxDuration: 2400, patch: { filmBurn: 0.22, dollyScale: 1.08 } },
    // 7 RESET — slow fade
    { maxDuration: 700 },
  ],

  ghost_loop: [
    null,
    // 1 PENDULUM — haunting drift, dropout creeps in
    { maxDuration: 2200, patch: { signalDrop: 0.18, tiltAngle: (Math.random() > 0.5 ? 1 : -1) * 2, opacityBleed: 0.96 } },
    // 2 DOMINO — axis split + tracking wobble
    { maxDuration: 1800, patch: { signalDrop: 0.38, chromaOffset: 8, axisSplit: true } },
    // 3 JITTER — static burst, brief
    { maxDuration: 140,  patch: { signalDrop: 0.72, chromaOffset: 4, opacityBleed: 0.80 } },
    // 4 GRAVITY — ultra-sensitive trigger, ghost drop
    { trigger: ({ bass }) => bass > 0.10, patch: { signalDrop: 0.08, gravityY: 18, dollyScale: 0.96 } },
    // 5 PRISM — phantom fringe + prism
    { maxDuration: 2400, patch: { signalDrop: 0.28, chromaOffset: 12, prismSplit: true } },
    // 6 Z-RECOIL — slow zoom shift, spirit drift
    { maxDuration: 1900, patch: { signalDrop: 0.14, chromaOffset: 6, dollyScale: 1.12 } },
    // 7 RESET — quiet dissolve
    { maxDuration: 450 },
  ],
};


const TOTAL_STAGES = STAGE_DEFS.length; // 8

const DEFAULT_VISUALS = {
  flashInvert: false,
  opacityBleed: 1,
  axisSplit: false,
  dollyScale: 1,
  colorInvert: false,
  eraOverride: null,
  prismSplit: false,
  zRecoil: 0,
  tiltAngle: 0,
  gravityY: 0,
  // New visual effect keys
  tvCollapse: 0,    // 0–1: cathode burn — scaleY collapses picture vertically
  chromaOffset: 0,  // px: RGB channel separation
  filmBurn: 0,      // 0–1: warm amber overexposure overlay
  signalDrop: 0,    // 0–1: VHS tracking error + signal noise
};

export function useRubeGoldbergChain({
  selectedRube = 'none',
  audioSignals,
  isPlaying = false,
  chaosLevel = 0,
  rubeDecay = 800,
  onEraMutate,
  isEraLocked = false,
  eraChangeCooldown = 8000,
  currentTime = 0,
}) {
  const [stage, setStage] = useState(0);
  const [visuals, setVisuals] = useState({ ...DEFAULT_VISUALS });

  const stageRef = useRef(0);
  const stageEnteredAtRef = useRef(0);
  const beatCountRef = useRef(0);
  const prevTransientRef = useRef(false);
  const prevMidRef = useRef(0);
  const fallbackTimerRef = useRef(null);
  const advancingRef = useRef(false);
  // Keep a live ref to selectedRube so advanceStage callback always reads the current preset
  const selectedRubeRef = useRef(selectedRube);
  useEffect(() => { selectedRubeRef.current = selectedRube; }, [selectedRube]);

  const isEraLockedRef = useRef(isEraLocked);
  const eraChangeCooldownRef = useRef(eraChangeCooldown);
  const currentTimeRef = useRef(currentTime);
  const lastEraChangeTimeRef = useRef(0);

  useEffect(() => { isEraLockedRef.current = isEraLocked; }, [isEraLocked]);
  useEffect(() => { eraChangeCooldownRef.current = eraChangeCooldown; }, [eraChangeCooldown]);
  useEffect(() => { currentTimeRef.current = currentTime; }, [currentTime]);

  const canMutateEra = useCallback(() => {
    if (isEraLockedRef.current) return false;
    const now = typeof currentTimeRef.current === 'number' && currentTimeRef.current > 0
      ? currentTimeRef.current * 1000
      : Date.now();
    const elapsed = now - lastEraChangeTimeRef.current;
    if (elapsed < eraChangeCooldownRef.current) return false;
    lastEraChangeTimeRef.current = now;
    return true;
  }, []);

  const advanceStage = useCallback((fromStage, onEraMutateFn) => {
    if (stageRef.current !== fromStage) return;
    if (advancingRef.current) return;
    advancingRef.current = true;

    if (fallbackTimerRef.current !== null) {
      clearTimeout(fallbackTimerRef.current);
      fallbackTimerRef.current = null;
    }

    const def = STAGE_DEFS[fromStage];
    const exitPatch = def.onExit({ onEraMutate: onEraMutateFn }) || {};

    const nextStage = (fromStage + 1) % TOTAL_STAGES;
    const nextDef = STAGE_DEFS[nextStage];
    const now = Date.now();

    const enterCtx = {
      bass: 0, mid: 0, rawVolume: 0, isTransient: false, transientEdge: false,
      chaosNorm: 0, beatCount: beatCountRef.current, rubeDecay, now, elapsed: 0,
      onEraMutate: onEraMutateFn,
      isEraLocked: isEraLockedRef.current,
      canMutateEra,
    };

    // Merge base onEnter result with preset override patch for the NEXT stage
    const presetOverride = PRESET_OVERRIDES[selectedRubeRef.current]?.[nextStage] || {};
    const basePatch = nextDef.onEnter(enterCtx) || {};
    const enterPatch = { ...basePatch, ...(presetOverride.patch || {}) };

    setVisuals((v) => ({ ...v, ...exitPatch, ...enterPatch }));
    stageRef.current = nextStage;
    stageEnteredAtRef.current = now;
    beatCountRef.current = 0;
    advancingRef.current = false;
    setStage(nextStage);

    // Use preset-overridden maxDuration if available
    const maxDuration = presetOverride.maxDuration ?? nextDef.maxDuration;
    if (maxDuration !== Infinity) {
      fallbackTimerRef.current = setTimeout(() => {
        advanceStage(nextStage, onEraMutateFn);
      }, maxDuration);
    }
  }, [rubeDecay, canMutateEra]);

  const resetChain = useCallback(() => {
    if (fallbackTimerRef.current !== null) {
      clearTimeout(fallbackTimerRef.current);
      fallbackTimerRef.current = null;
    }
    advancingRef.current = false;
    stageRef.current = 0;
    stageEnteredAtRef.current = 0;
    beatCountRef.current = 0;
    prevTransientRef.current = false;
    prevMidRef.current = 0;
    setStage(0);
    setVisuals({ ...DEFAULT_VISUALS });
  }, []);

  useEffect(() => {
    if (!isPlaying || selectedRube === 'none') {
      resetChain();
    }
  }, [isPlaying, selectedRube, resetChain]);

  useEffect(() => () => {
    if (fallbackTimerRef.current !== null) {
      clearTimeout(fallbackTimerRef.current);
    }
  }, []);

  useEffect(() => {
    if (selectedRube === 'none' || !isPlaying || !audioSignals) return;

    const bass = Number(audioSignals.bass) || 0;
    const mid = Number(audioSignals.mid) || 0;
    const rawVolume = Number(audioSignals.rawVolume) || 0;
    const isTransient = Boolean(audioSignals.isTransient);
    const now = Date.now();
    const chaosNorm = Math.max(0, Math.min(1, chaosLevel));

    const transientEdge = isTransient && !prevTransientRef.current;
    prevTransientRef.current = isTransient;

    const currentStage = stageRef.current;
    if (transientEdge && currentStage >= 1 && currentStage <= 6) {
      beatCountRef.current += 1;
    }

    if (rawVolume < 0.02 && currentStage >= 6) {
      resetChain();
      prevMidRef.current = mid;
      return;
    }

    const elapsed = stageEnteredAtRef.current > 0 ? now - stageEnteredAtRef.current : 0;
    const prevMid = prevMidRef.current;
    prevMidRef.current = mid;

    // Stage 0 → Stage 1: first transient OR 1500ms silence fallback
    if (currentStage === 0) {
      const stage0Elapsed = stageEnteredAtRef.current > 0 ? now - stageEnteredAtRef.current : 0;
      const shouldAdvance = transientEdge || (isPlaying && stage0Elapsed > 1500);
      if (shouldAdvance) {
        const def0 = STAGE_DEFS[0];
        const exitPatch = def0.onExit({}) || {};
        const def1 = STAGE_DEFS[1];
        // Apply preset override for stage 1 even on the 0→1 path
        const presetOverride1 = PRESET_OVERRIDES[selectedRube]?.[1] || {};
        const basePatch1 = def1.onEnter({ onEraMutate }) || {};
        const enterPatch1 = { ...basePatch1, ...(presetOverride1.patch || {}) };

        setVisuals((v) => ({ ...v, ...exitPatch, ...enterPatch1 }));
        stageRef.current = 1;
        stageEnteredAtRef.current = now;
        beatCountRef.current = 0;
        advancingRef.current = false;
        setStage(1);

        if (fallbackTimerRef.current !== null) clearTimeout(fallbackTimerRef.current);
        const maxDur1 = presetOverride1.maxDuration ?? STAGE_DEFS[1].maxDuration;
        if (maxDur1 !== Infinity) {
          fallbackTimerRef.current = setTimeout(() => {
            advanceStage(1, onEraMutate);
          }, maxDur1);
        }
      }
      return;
    }

    // Stages 1–7: check preset trigger (if any) or base primaryTrigger
    if (!advancingRef.current) {
      const ctx = {
        bass, mid, rawVolume, isTransient, transientEdge, chaosNorm,
        prevMid, rubeDecay, now, elapsed,
        beatCount: beatCountRef.current, stage: currentStage, onEraMutate,
      };

      const def = STAGE_DEFS[currentStage];
      const presetOverride = PRESET_OVERRIDES[selectedRube]?.[currentStage] || {};
      // Preset can provide a trigger that completely replaces the base one
      const triggerFn = presetOverride.trigger ?? def.primaryTrigger;

      if (def && triggerFn(ctx)) {
        advanceStage(currentStage, onEraMutate);
      }
    }
  }, [
    selectedRube, isPlaying, audioSignals, chaosLevel,
    rubeDecay, onEraMutate, advanceStage, resetChain,
  ]);

  return { stage, visuals };
}

export const useRubeGoldbergEngine = useRubeGoldbergChain;
