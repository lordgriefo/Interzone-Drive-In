// src/hooks/useTimelineState.js
// Phase 1: Added bpm state, splitClipAtTime, toggleClipReverse, duplicateClip
// Phase 3: Undo/redo history, delete / ripple delete, order moves, copy / paste,
//          trim, mirror, pack, shuffle, sort-by-bin-order.
//
// All clip mutations go through `applyClips`, which reads the latest clips from a
// ref (never stale inside a single event handler) and records an undo snapshot.

import { useState, useEffect, useCallback, useRef } from 'react';

const DEFAULT_CLIP_DURATION = 2.5;
// Crossfade overlap injected when duplicating a clip (seconds)
const DUPLICATE_OVERLAP = 0.25;
// Auto-layout spacing: each clip starts at 85% of the previous clip's length (small crossfade)
const AUTO_LAYOUT_FACTOR = 0.85;
const MIN_CLIP_DURATION = 0.1;
const HISTORY_LIMIT = 100;

let uidCounter = 0;
function uid(prefix = 'clip') {
  uidCounter += 1;
  return `${prefix}-${Date.now().toString(36)}-${uidCounter}-${Math.random().toString(36).slice(2, 5)}`;
}

const byStart = (a, b) => a.startTime - b.startTime;

export function useTimelineState(assets, duration = 60, externalBpm, setExternalBpm) {
  const [videoClips, setVideoClipsRaw] = useState([]);

  // Always-current clips + history stacks (refs so handlers never see stale data)
  const clipsRef     = useRef([]);
  const pastRef      = useRef([]);
  const futureRef    = useRef([]);
  const clipboardRef = useRef(null);
  const [, setHistoryVersion] = useState(0);
  const bumpHistory = () => setHistoryVersion((v) => v + 1);

  const pushPast = (snapshot) => {
    pastRef.current.push(snapshot);
    if (pastRef.current.length > HISTORY_LIMIT) pastRef.current.shift();
    futureRef.current = [];
    bumpHistory();
  };

  // ── Core mutation primitive ──
  const applyClips = useCallback((updater, record = true) => {
    const prev = clipsRef.current;
    const next = typeof updater === 'function' ? updater(prev) : updater;
    if (!next || next === prev) return prev;
    if (record) pushPast(prev);
    clipsRef.current = next;
    setVideoClipsRaw(next);
    return next;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Public escape hatch — not recorded in history
  const setVideoClips = useCallback((updater) => applyClips(updater, false), [applyClips]);

  // ── Master BPM — exposed for binding to project clock / FX console ──
  const [internalBpm, setInternalBpm] = useState(120);
  const bpm = externalBpm !== undefined ? externalBpm : internalBpm;
  const setBpm = setExternalBpm || setInternalBpm;

  const [automationKeyframes, setAutomationKeyframes] = useState([
    { id: 'auto-0', time: 0,  chaosLevel: 0, filterMix: 0.5 },
    { id: 'auto-1', time: 15, chaosLevel: 2, filterMix: 0.8 },
    { id: 'auto-2', time: 30, chaosLevel: 0, filterMix: 0.5 },
  ]);

  // ── Sync clips when asset list changes ──
  // `knownAssetIds` remembers which assets already got an auto-clip, so a clip you
  // deliberately deleted does not magically reappear when you add other media.
  const knownAssetIdsRef = useRef(new Set());
  useEffect(() => {
    const assetIds = new Set(assets.map((a) => a.id));
    const known = knownAssetIdsRef.current;
    for (const id of [...known]) if (!assetIds.has(id)) known.delete(id);

    applyClips((prev) => {
      const kept = prev.filter((clip) => assetIds.has(clip.assetId));
      let cursor = kept.reduce((max, c) => Math.max(max, c.startTime + c.duration), 0);
      const added = [];

      for (const asset of assets) {
        if (known.has(asset.id)) continue;
        known.add(asset.id);
        // Re-adopt if a clip already references it (e.g. restored session)
        if (kept.some((c) => c.assetId === asset.id)) continue;
        added.push({
          id: uid(`clip-${asset.id}`),
          assetId: asset.id,
          startTime: cursor,
          duration: DEFAULT_CLIP_DURATION,
          inPoint: 0,
          reversed: false,
          mirrored: false,
        });
        cursor += DEFAULT_CLIP_DURATION * AUTO_LAYOUT_FACTOR;
      }

      if (added.length === 0 && kept.length === prev.length) return prev;
      return [...kept, ...added];
    }, false); // automatic — never part of undo history
  }, [assets, applyClips]);

  // Stretch last automation keyframe to match audio duration
  useEffect(() => {
    if (duration <= 0) return;
    setAutomationKeyframes((prev) => {
      const last = prev[prev.length - 1];
      if (last && Math.abs(last.time - duration) < 0.5) return prev;
      return prev.map((kf, i) =>
        i === prev.length - 1 ? { ...kf, time: Math.max(kf.time, duration) } : kf
      );
    });
  }, [duration]);

  // ─────────────────────────── Undo / Redo ───────────────────────────
  // Call once at the start of a continuous gesture (drag / trim); the gesture's
  // per-frame updates are then applied with record=false.
  const beginClipEdit = useCallback(() => {
    pushPast(clipsRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const undo = useCallback(() => {
    const snapshot = pastRef.current.pop();
    if (!snapshot) return;
    futureRef.current.push(clipsRef.current);
    clipsRef.current = snapshot;
    setVideoClipsRaw(snapshot);
    bumpHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const redo = useCallback(() => {
    const snapshot = futureRef.current.pop();
    if (!snapshot) return;
    pastRef.current.push(clipsRef.current);
    clipsRef.current = snapshot;
    setVideoClipsRaw(snapshot);
    bumpHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ─────────────────────────── Basic edits ───────────────────────────

  // Drag to reposition (continuous — call beginClipEdit() first)
  const updateClipStart = useCallback((clipId, newStart) => {
    applyClips(
      (prev) => prev.map((clip) =>
        clip.id === clipId ? { ...clip, startTime: Math.max(0, newStart) } : clip
      ),
      false
    );
  }, [applyClips]);

  // Generic patch (trim, numeric inspector fields, ...). record=false during drags.
  const updateClip = useCallback((clipId, patch, record = true) => {
    applyClips((prev) => prev.map((clip) => {
      if (clip.id !== clipId) return clip;
      const next = { ...clip, ...patch };
      next.startTime = Math.max(0, next.startTime);
      next.duration = Math.max(MIN_CLIP_DURATION, next.duration);
      next.inPoint = Math.max(0, next.inPoint || 0);
      return next;
    }), record);
  }, [applyClips]);

  const clearVideoClips = useCallback(() => {
    applyClips([], true);
  }, [applyClips]);

  // Blade / Split — returns { leftId, rightId } or null if the cut is outside the clip
  const splitClipAtTime = useCallback((clipId, time) => {
    let result = null;
    applyClips((prev) => {
      const clip = prev.find((c) => c.id === clipId);
      if (!clip) return prev;

      const clipEnd = clip.startTime + clip.duration;
      if (time <= clip.startTime + 0.05 || time >= clipEnd - 0.05) return prev;

      const L = time - clip.startTime;
      const R = clipEnd - time;
      const inPt = clip.inPoint || 0;
      const leftId = uid('clip');
      const rightId = uid('clip');

      // Keep each half pointing at the correct slice of the source video
      const left  = { ...clip, id: leftId,  duration: L, inPoint: clip.reversed ? inPt + R : inPt };
      const right = { ...clip, id: rightId, startTime: time, duration: R, inPoint: clip.reversed ? inPt : inPt + L };
      result = { leftId, rightId };

      return prev.flatMap((c) => (c.id === clipId ? [left, right] : [c]));
    });
    return result;
  }, [applyClips]);

  // Split the preferred (selected) clip if the playhead is inside it, otherwise whichever
  // clip is under the playhead. Returns { leftId, rightId } or null.
  const splitAtTime = useCallback((time, preferredId = null) => {
    const inside = (c) => time > c.startTime + 0.05 && time < c.startTime + c.duration - 0.05;
    const clips = clipsRef.current;
    const target =
      clips.find((c) => c.id === preferredId && inside(c)) ||
      [...clips].sort(byStart).reverse().find(inside);
    return target ? splitClipAtTime(target.id, time) : null;
  }, [splitClipAtTime]);

  const toggleClipReverse = useCallback((clipId) => {
    applyClips((prev) => prev.map((c) => (c.id === clipId ? { ...c, reversed: !c.reversed } : c)));
  }, [applyClips]);

  const toggleClipMirror = useCallback((clipId) => {
    applyClips((prev) => prev.map((c) => (c.id === clipId ? { ...c, mirrored: !c.mirrored } : c)));
  }, [applyClips]);

  // Duplicate (Ctrl+D / Alt+Drag) — copy starts at original end minus overlap (crossfade).
  // Returns the new clip id.
  const duplicateClip = useCallback((clipId) => {
    let newId = null;
    applyClips((prev) => {
      const clip = prev.find((c) => c.id === clipId);
      if (!clip) return prev;
      newId = uid('clip-dup');
      const dup = {
        ...clip,
        id: newId,
        startTime: Math.max(0, clip.startTime + clip.duration - DUPLICATE_OVERLAP),
      };
      return [...prev, dup];
    });
    return newId;
  }, [applyClips]);

  // ─────────────────────────── Delete ───────────────────────────
  // ripple=true also closes the gap: later clips slide left to where this one began.
  const deleteClip = useCallback((clipId, ripple = false) => {
    applyClips((prev) => {
      const clip = prev.find((c) => c.id === clipId);
      if (!clip) return prev;
      const rest = prev.filter((c) => c.id !== clipId);
      if (!ripple) return rest;

      const later = rest.filter((c) => c.startTime > clip.startTime).sort(byStart);
      if (later.length === 0) return rest;
      const delta = later[0].startTime - clip.startTime;
      return rest.map((c) =>
        c.startTime > clip.startTime ? { ...c, startTime: Math.max(0, c.startTime - delta) } : c
      );
    });
  }, [applyClips]);

  // ─────────────────────────── Order ───────────────────────────
  // Move a clip one place earlier (-1) or later (+1) in playing order.
  // The pair keeps its combined span, so nothing after it moves.
  const moveClipInOrder = useCallback((clipId, dir) => {
    applyClips((prev) => {
      const sorted = [...prev].sort(byStart);
      const i = sorted.findIndex((c) => c.id === clipId);
      const j = i + dir;
      if (i < 0 || j < 0 || j >= sorted.length) return prev;

      const a = sorted[Math.min(i, j)]; // currently earlier
      const b = sorted[Math.max(i, j)]; // currently later
      const gap = b.startTime - (a.startTime + a.duration); // negative = crossfade overlap
      const newBStart = a.startTime;
      const newAStart = newBStart + b.duration + gap;

      return prev.map((c) => {
        if (c.id === b.id) return { ...c, startTime: Math.max(0, newBStart) };
        if (c.id === a.id) return { ...c, startTime: Math.max(0, newAStart) };
        return c;
      });
    });
  }, [applyClips]);

  // Lay clips out in a given order (array of clip objects), starting at `from`.
  const layoutSequential = (ordered, from = 0, factor = AUTO_LAYOUT_FACTOR) => {
    let cursor = from;
    return ordered.map((c) => {
      const placed = { ...c, startTime: cursor };
      cursor += c.duration * factor;
      return placed;
    });
  };

  // Close all gaps, keeping the current order. overlap = crossfade seconds between clips.
  const packClips = useCallback((overlap = 0) => {
    applyClips((prev) => {
      const sorted = [...prev].sort(byStart);
      let cursor = 0;
      return sorted.map((c) => {
        const placed = { ...c, startTime: Math.max(0, cursor) };
        cursor += Math.max(MIN_CLIP_DURATION, c.duration - overlap);
        return placed;
      });
    });
  }, [applyClips]);

  // Randomise playing order (great for cut-up montage)
  const shuffleClips = useCallback(() => {
    applyClips((prev) => {
      const arr = [...prev];
      for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
      }
      return layoutSequential(arr);
    });
  }, [applyClips]);

  // Re-order the timeline so clips follow the Media Bin order
  const sortClipsByAssetOrder = useCallback((orderedAssets) => {
    const index = new Map(orderedAssets.map((a, i) => [a.id, i]));
    applyClips((prev) => {
      if (prev.length === 0) return prev;
      const sorted = [...prev].sort((a, b) => {
        const d = (index.get(a.assetId) ?? 1e9) - (index.get(b.assetId) ?? 1e9);
        return d !== 0 ? d : a.startTime - b.startTime;
      });
      return layoutSequential(sorted);
    });
  }, [applyClips]);

  // ─────────────────────────── Copy / Paste / Add ───────────────────────────
  const copyClip = useCallback((clipId) => {
    const clip = clipsRef.current.find((c) => c.id === clipId);
    if (clip) clipboardRef.current = { ...clip };
    return Boolean(clip);
  }, []);

  const pasteClip = useCallback((time) => {
    const src = clipboardRef.current;
    if (!src) return null;
    const newId = uid('clip-paste');
    applyClips((prev) => [...prev, { ...src, id: newId, startTime: Math.max(0, time) }]);
    return newId;
  }, [applyClips]);

  const hasClipboard = () => Boolean(clipboardRef.current);

  // Drop a Media Bin asset onto the timeline at `time`
  const addClipFromAsset = useCallback((assetId, time = 0, clipDuration = DEFAULT_CLIP_DURATION) => {
    const newId = uid('clip-add');
    applyClips((prev) => [
      ...prev,
      {
        id: newId,
        assetId,
        startTime: Math.max(0, time),
        duration: clipDuration,
        inPoint: 0,
        reversed: false,
        mirrored: false,
      },
    ]);
    return newId;
  }, [applyClips]);

  // ─────────────────────────── Automation keyframes ───────────────────────────
  const addAutomationKeyframe = useCallback((time, chaosLevel = 1, filterMix = 0.7) => {
    setAutomationKeyframes((prev) => [
      ...prev,
      { id: `auto-${Date.now()}`, time, chaosLevel, filterMix },
    ]);
  }, []);

  const updateAutomationKeyframe = useCallback((id, updates) => {
    setAutomationKeyframes((prev) =>
      prev.map((kf) => (kf.id === id ? { ...kf, ...updates } : kf))
    );
  }, []);

  const removeAutomationKeyframe = useCallback((id) => {
    setAutomationKeyframes((prev) => prev.filter((kf) => kf.id !== id));
  }, []);

  // ── Auto MV Cut Generator ────────────────────────────────────────────────
  // Generates a fully synced, rhythmic music video cut across the entire track
  const generateAutoMvCut = useCallback((options = {}) => {
    const {
      mode = 'beat_locked',
      currentBpm = externalBpm || 120,
      totalDuration = duration || 60,
    } = options;

    if (!assets || assets.length === 0) return;

    applyClips(() => {
      const beatSec = Math.max(0.2, 60 / currentBpm);
      const newClips = [];
      let cursor = 0;
      let assetIdx = 0;

      while (cursor < totalDuration) {
        const asset = assets[assetIdx % assets.length];
        assetIdx++;

        let clipDur;
        let isReversed = Math.random() < 0.12;
        let isMirrored = Math.random() < 0.10;

        if (mode === 'full_clip_native') {
          // Play full native video duration — lets each AI clip play completely through without cutoffs
          const nativeDur = (asset.duration && asset.duration > 0.5)
            ? asset.duration
            : Math.max(10.0, 16 * beatSec);
          clipDur = nativeDur;
          isReversed = false;
        } else if (mode === 'ai_long_form') {
          // 15–30s extended holds tailored for modern long-form generative AI video clips
          const nativeDur = (asset.duration && asset.duration >= 8) ? asset.duration : null;
          clipDur = nativeDur || Math.min(30.0, Math.max(12.0, 24 * beatSec));
        } else if (mode === 'epic_cinematic') {
          // 30–60s ultra-long continuous takes for slow-cinema narrative and long AI scenes
          const nativeDur = (asset.duration && asset.duration >= 20) ? asset.duration : null;
          clipDur = nativeDur || Math.min(60.0, Math.max(25.0, 48 * beatSec));
        } else if (mode === 'psychonaut_voyage') {
          // Shifting entheogen rhythms: alternates 8–12s breathing hold with 2–4 beat phase shifts
          const r = Math.random();
          clipDur = r < 0.6 ? Math.max(7.0, 12 * beatSec) : (2 * beatSec);
          isMirrored = Math.random() < 0.25;
        } else if (mode === 'beat_locked') {
          // Alternate 2-beat and 4-beat cuts with occasional 1-beat punch
          const r = Math.random();
          const beats = r < 0.25 ? 1 : r < 0.75 ? 2 : 4;
          clipDur = beats * beatSec;
        } else if (mode === 'energy_arc') {
          const progress = cursor / Math.max(totalDuration, 1);
          if (progress < 0.15 || progress > 0.85) {
            // Intro or Outro: atmospheric holds (6-8s)
            clipDur = Math.min(8.0, Math.max(4.0, 8 * beatSec));
          } else if (progress >= 0.40 && progress <= 0.75) {
            // Chorus / Climax: fast 1-2 beat cuts!
            clipDur = (Math.random() < 0.5 ? 1 : 2) * beatSec;
          } else {
            // Verse: 3-4s holds
            clipDur = Math.max(2.5, 4 * beatSec);
          }
        } else if (mode === 'drop_buildup') {
          // 4-bar (16 beat) build and drop cycles
          const phraseBeat = (cursor / beatSec) % 16;
          if (phraseBeat < 8) {
            // Early build: 4-beat holds
            clipDur = 4 * beatSec;
          } else if (phraseBeat < 12) {
            // Mid build: 2-beat acceleration
            clipDur = 2 * beatSec;
          } else if (phraseBeat < 15) {
            // Pre-drop snare roll: 1-beat cuts
            clipDur = 1 * beatSec;
          } else {
            // Drop impact: 0.5 beat machine-gun cut
            clipDur = Math.max(0.2, 0.5 * beatSec);
            isReversed = true;
          }
        } else if (mode === 'glitch_frenzy') {
          // Ultra-fast micro cuts with erratic mirrors and reverses
          const r = Math.random();
          const beats = r < 0.4 ? 0.5 : r < 0.8 ? 1 : 2;
          clipDur = Math.max(0.18, beats * beatSec);
          isReversed = Math.random() < 0.35;
          isMirrored = Math.random() < 0.25;
        } else if (mode === 'lofi_chillhop') {
          // Relaxed, nostalgic 4-8 beat holds with smooth pacing
          const r = Math.random();
          const beats = r < 0.5 ? 4 : 8;
          clipDur = beats * beatSec;
          isReversed = Math.random() < 0.08;
        } else if (mode === 'punk_speed') {
          // Relentless downbeat thrash: 1-beat downbeats with occasional 2-beat holds
          const beats = Math.random() < 0.65 ? 1 : 2;
          clipDur = beats * beatSec;
        } else if (mode === 'dream_pop') {
          // Extended ethereal holds: 8-16 beats
          const beats = Math.random() < 0.5 ? 8 : 16;
          clipDur = beats * beatSec;
          isMirrored = Math.random() < 0.15;
        } else {
          // 'cinematic': 5-8s long holds
          clipDur = Math.max(4.5, Math.round(12 * beatSec));
        }

        // Clamp to not overshoot too far past duration
        if (cursor + clipDur > totalDuration + 1) {
          clipDur = Math.max(MIN_CLIP_DURATION, totalDuration - cursor);
        }

        newClips.push({
          id: uid(`mv-${asset.id}`),
          assetId: asset.id,
          startTime: cursor,
          duration: Math.max(MIN_CLIP_DURATION, clipDur),
          inPoint: 0,
          reversed: isReversed,
          mirrored: isMirrored,
        });

        cursor += clipDur;
      }

      return newClips;
    }, true);
  }, [assets, externalBpm, duration, applyClips]);

  // Fit selected clip duration to match its asset's native video duration
  const fitClipToAssetDuration = useCallback((clipId) => {
    applyClips((prev) => {
      const clip = prev.find((c) => c.id === clipId);
      if (!clip) return prev;
      const asset = assets.find((a) => a.id === clip.assetId);
      if (!asset) return prev;
      const targetDur = (asset.duration && asset.duration > 0.5) ? asset.duration : DEFAULT_CLIP_DURATION * 4;
      return prev.map((c) => (c.id === clipId ? { ...c, duration: targetDur, inPoint: 0 } : c));
    }, true);
  }, [assets, applyClips]);

  // Export current cut sequence as a JSON template
  const exportCutTemplate = useCallback(() => {
    return {
      version: 1,
      createdAt: new Date().toISOString(),
      bpm,
      duration,
      clips: clipsRef.current.map((c) => {
        const asset = assets.find((a) => a.id === c.assetId);
        return {
          startTime: c.startTime,
          duration: c.duration,
          inPoint: c.inPoint || 0,
          reversed: Boolean(c.reversed),
          mirrored: Boolean(c.mirrored),
          assetIndex: assets.findIndex((a) => a.id === c.assetId),
          assetName: asset?.name || 'clip',
        };
      }),
    };
  }, [bpm, duration, assets]);

  // Load a cut sequence from a JSON template
  const loadCutTemplate = useCallback((templateData) => {
    if (!templateData || !Array.isArray(templateData.clips) || templateData.clips.length === 0) return;
    applyClips(() => {
      return templateData.clips.map((c, i) => {
        let matchedAsset = assets[c.assetIndex];
        if (!matchedAsset && c.assetName) {
          matchedAsset = assets.find((a) => a.name === c.assetName);
        }
        if (!matchedAsset) {
          matchedAsset = assets[i % Math.max(assets.length, 1)];
        }
        return {
          id: uid('imported-clip'),
          assetId: matchedAsset ? matchedAsset.id : `asset-${i}`,
          startTime: Number(c.startTime) || 0,
          duration: Math.max(MIN_CLIP_DURATION, Number(c.duration) || DEFAULT_CLIP_DURATION),
          inPoint: Number(c.inPoint) || 0,
          reversed: Boolean(c.reversed),
          mirrored: Boolean(c.mirrored),
        };
      });
    }, true);
  }, [assets, applyClips]);

  return {
    // Clip state
    videoClips,
    setVideoClips,
    updateClipStart,
    updateClip,
    clearVideoClips,
    // Clip editing
    splitClipAtTime,
    splitAtTime,
    toggleClipReverse,
    toggleClipMirror,
    duplicateClip,
    deleteClip,
    moveClipInOrder,
    packClips,
    shuffleClips,
    sortClipsByAssetOrder,
    copyClip,
    pasteClip,
    hasClipboard,
    addClipFromAsset,
    generateAutoMvCut,
    fitClipToAssetDuration,
    exportCutTemplate,
    loadCutTemplate,
    // History
    beginClipEdit,
    undo,
    redo,
    canUndo: pastRef.current.length > 0,
    canRedo: futureRef.current.length > 0,
    // Automation
    automationKeyframes,
    setAutomationKeyframes,
    addAutomationKeyframe,
    updateAutomationKeyframe,
    removeAutomationKeyframe,
    // Master tempo — ready to bind to project clock / FX console
    bpm,
    setBpm,
  };
}
