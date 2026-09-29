// src/hooks/useTransportClock.js
// Phase 2: Tone.js Master Transport Clock & Global Subdivision Ticks (1/4, 1/8, 1/16)
// Resilient: uses requestAnimationFrame as primary clock source so the playhead
// never freezes, even if the Tone.js AudioContext is delayed or suspended.

import { useState, useEffect, useRef, useCallback } from 'react';
import * as Tone from 'tone';

export function useTransportClock({
  bpm = 120,
  isPlaying = false,
  currentTime = 0,
  isLooping = false,
  loopStart = 0,
  loopEnd = 0,
  onQuarterTick,
  onEighthTick,
  onSixteenthTick,
}) {
  const [subdivisions, setSubdivisions] = useState({
    quarter: 0,
    eighth: 0,
    sixteenth: 0,
    bar: 0,
  });

  const quarterEventId    = useRef(null);
  const eighthEventId     = useRef(null);
  const sixteenthEventId  = useRef(null);
  const isTransportRunning = useRef(false);

  // ── BPM sync ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!isPlaying && !isTransportRunning.current) return;
    try {
      Tone.getTransport().bpm.rampTo(bpm, 0.05);
    } catch (_) {}
  }, [bpm, isPlaying]);

  // ── A/B Loop sync ────────────────────────────────────────────────────────
  useEffect(() => {
    if (!isPlaying && !isTransportRunning.current) return;
    try {
      const t = Tone.getTransport();
      t.loop = isLooping;
      if (isLooping && loopEnd > loopStart) {
        t.loopStart = loopStart;
        t.loopEnd   = loopEnd;
      }
    } catch (_) {}
  }, [isLooping, loopStart, loopEnd, isPlaying]);

  // ── Subdivision schedules ────────────────────────────────────────────────
  useEffect(() => {
    if (!isPlaying && !isTransportRunning.current) return;
    let t;
    try {
      t = Tone.getTransport();

      if (quarterEventId.current   !== null) t.clear(quarterEventId.current);
      if (eighthEventId.current    !== null) t.clear(eighthEventId.current);
      if (sixteenthEventId.current !== null) t.clear(sixteenthEventId.current);

      quarterEventId.current = t.scheduleRepeat((time) => {
        setSubdivisions((prev) => ({
          ...prev,
          quarter: (prev.quarter + 1) % 4,
          bar: Math.floor(prev.quarter / 4),
        }));
        onQuarterTick?.(time);
      }, '4n');

      eighthEventId.current = t.scheduleRepeat((time) => {
        setSubdivisions((prev) => ({ ...prev, eighth: (prev.eighth + 1) % 8 }));
        onEighthTick?.(time);
      }, '8n');

      sixteenthEventId.current = t.scheduleRepeat((time) => {
        setSubdivisions((prev) => ({ ...prev, sixteenth: (prev.sixteenth + 1) % 16 }));
        onSixteenthTick?.(time);
      }, '16n');
    } catch (err) {
      console.warn('[useTransportClock] Schedule setup:', err);
    }

    return () => {
      try {
        const tr = Tone.getTransport();
        if (quarterEventId.current   !== null) tr.clear(quarterEventId.current);
        if (eighthEventId.current    !== null) tr.clear(eighthEventId.current);
        if (sixteenthEventId.current !== null) tr.clear(sixteenthEventId.current);
      } catch (_) {}
    };
  }, [isPlaying, onQuarterTick, onEighthTick, onSixteenthTick]);

  // ── Transport start / stop ───────────────────────────────────────────────
  useEffect(() => {
    const run = async () => {
      try {
        if (isPlaying) {
          const ctx = Tone.getContext();
          if (ctx.state !== 'running') await Tone.start();
          const t = Tone.getTransport();
          t.bpm.value = bpm;
          if (t.state !== 'started') {
            t.start();
            isTransportRunning.current = true;
          }
        } else {
          if (isTransportRunning.current) {
            const t = Tone.getTransport();
            if (t.state === 'started') {
              t.pause();
              isTransportRunning.current = false;
            }
          }
        }
      } catch (err) {
        console.warn('[useTransportClock] Transport sync:', err);
      }
    };
    run();
  }, [isPlaying, bpm]);


  // ── Helpers ──────────────────────────────────────────────────────────────
  const seekTransport = useCallback((seconds) => {
    try { Tone.getTransport().seconds = seconds; } catch (_) {}
  }, []);

  const resetClock = useCallback(() => {
    try {
      const t = Tone.getTransport();
      t.stop();
      t.seconds = 0;
      isTransportRunning.current = false;
    } catch (_) {}
    setSubdivisions({ quarter: 0, eighth: 0, sixteenth: 0, bar: 0 });
  }, []);

  return { subdivisions, seekTransport, resetClock, transportSeconds: currentTime };
}
