// src/hooks/usePuppetEngine.js
// Synchro-Vox multi-sprite puppet lip-sync engine for The Kinet-O-Chop
//
// Supports 3 tagging modes:
//   '2' -- REST + OPEN  (original binary flip, fully backwards-compatible)
//   '4' -- REST . NARROW . OPEN . WIDE  (4-shape Preston Blair set)
//   '8' -- Full 8-shape phoneme set
//
// Audio signals used (all from Meyda via useAudioEngine -- DO NOT MODIFY source):
//   rms              -- overall amplitude (0-1)
//   mid              -- mid-frequency energy (0-1)
//   spectralCentroid -- brightness in Hz (typically 200-8000)
//   spectralFlux     -- frame-to-frame spectral change (transient detector)

import { useRef, useState, useEffect } from 'react';

// -- Slot metadata ----------------------------------------------------------
// Defines the display label, color accent, and sort order for each slot.
export const PUPPET_SLOTS = {
  rest:    { label: 'REST',   color: '#3b82f6', order: 0, modes: ['2','4','8'] },
  open:    { label: 'OPEN',   color: '#f97316', order: 1, modes: ['2','4','8'] },
  narrow:  { label: 'NARROW', color: '#06b6d4', order: 2, modes: ['4','8']    },
  wide:    { label: 'WIDE',   color: '#ef4444', order: 3, modes: ['4','8']    },
  teeth:   { label: 'TEETH',  color: '#a855f7', order: 4, modes: ['8']        },
  pucker:  { label: 'PUCKER', color: '#ec4899', order: 5, modes: ['8']        },
  midOpen: { label: 'MID',    color: '#eab308', order: 6, modes: ['8']        },
  snap:    { label: 'SNAP',   color: '#22c55e', order: 7, modes: ['8']        },
};

// Slots visible for each mode, in display order
export function getSlotsForMode(mode) {
  return Object.entries(PUPPET_SLOTS)
    .filter(([, meta]) => meta.modes.includes(mode))
    .sort(([, a], [, b]) => a.order - b.order)
    .map(([key, meta]) => ({ key, ...meta }));
}

// -- Driver functions -------------------------------------------------------

function drive2(signals) {
  // Classic binary flip -- preserves original behavior exactly
  const mid = signals?.mid ?? 0;
  return mid > 0.35 ? 'open' : 'rest';
}

function drive4(signals) {
  const rms      = signals?.rms             ?? 0;
  const centroid = signals?.spectralCentroid ?? 0;
  const flux     = signals?.spectralFlux     ?? 0;

  if (rms < 0.08)                    return 'rest';
  if (flux > 0.55 && rms > 0.45)    return 'wide';   // transient peak / loud attack
  if (centroid > 3800 && rms > 0.12) return 'narrow'; // bright/sibilant (S,F,TH,EE)
  return 'open';                                       // broad vowel default
}

function drive8(signals) {
  const rms      = signals?.rms             ?? 0;
  const centroid = signals?.spectralCentroid ?? 0;
  const flux     = signals?.spectralFlux     ?? 0;

  if (rms < 0.06)                               return 'rest';
  if (flux > 0.75 && rms < 0.35)               return 'snap';    // bilabial pop B/P/M
  if (centroid > 6000 && rms > 0.1)            return 'teeth';   // F/V sibilant S
  if (rms > 0.55 && flux > 0.5)                return 'wide';    // peak attack
  if (centroid > 3800 && rms > 0.12)           return 'narrow';  // EE/S broad
  if (rms > 0.15 && rms < 0.35 && centroid < 2200) return 'pucker'; // W/OO rounded
  if (rms > 0.09 && rms < 0.28 && centroid < 3800) return 'midOpen'; // E/EH mid vowel
  return 'open';                                                   // A/O broad open
}

const DRIVERS = { '2': drive2, '4': drive4, '8': drive8 };

// -- usePuppetEngine --------------------------------------------------------
/**
 * @param {object}  opts.puppetSlots   -- { rest, open, narrow, wide, teeth, pucker, midOpen, snap } asset IDs
 * @param {string}  opts.puppetMode    -- '2' | '4' | '8'
 * @param {object}  opts.assets        -- full assets array (for URL lookup)
 * @param {object}  opts.audioSignals  -- live Meyda signal object
 * @param {boolean} opts.isPlaying
 * @param {number}  [opts.holdMs=40]   -- min ms to hold a shape before switching (anti-flicker)
 *
 * @returns {{ activeSlot: string, activeUrl: string|null }}
 */
export function usePuppetEngine({
  puppetSlots = {},
  puppetMode  = '2',
  assets      = [],
  audioSignals,
  isPlaying   = false,
  holdMs      = 40,
}) {
  const [activeSlot, setActiveSlot] = useState('rest');
  const holdTimer   = useRef(null);
  const pendingSlot = useRef(null);
  const lastSwitch  = useRef(0);

  useEffect(() => {
    if (!isPlaying) {
      setActiveSlot('rest');
      return;
    }

    const driver    = DRIVERS[puppetMode] ?? drive2;
    const candidate = driver(audioSignals);

    // If candidate slot has no asset, fall back to 'rest'
    const hasAsset = Boolean(puppetSlots?.[candidate]);
    const resolved = hasAsset ? candidate : 'rest';

    const now = Date.now();

    if (resolved === activeSlot) return;

    // Within hold window -- queue but don't thrash
    if (now - lastSwitch.current < holdMs) {
      pendingSlot.current = resolved;
      if (!holdTimer.current) {
        holdTimer.current = setTimeout(() => {
          if (pendingSlot.current) {
            setActiveSlot(pendingSlot.current);
            lastSwitch.current = Date.now();
          }
          holdTimer.current = null;
          pendingSlot.current = null;
        }, holdMs);
      }
      return;
    }

    setActiveSlot(resolved);
    lastSwitch.current = now;
  });

  useEffect(() => () => { if (holdTimer.current) clearTimeout(holdTimer.current); }, []);

  // Resolve slot key -> asset URL
  const activeAssetId = puppetSlots?.[activeSlot] ?? puppetSlots?.rest ?? null;
  const activeAsset   = assets.find((a) => a.id === activeAssetId);
  const activeUrl     = activeAsset?.url ?? null;

  return { activeSlot, activeUrl };
}
