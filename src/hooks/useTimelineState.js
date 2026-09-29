// src/hooks/useTimelineState.js
// Phase 1: Added bpm state, splitClipAtTime, toggleClipReverse, duplicateClip

import { useState, useEffect, useCallback } from 'react';

const DEFAULT_CLIP_DURATION = 2.5;
// Crossfade overlap injected when duplicating a clip (seconds)
const DUPLICATE_OVERLAP = 0.25;

export function useTimelineState(assets, duration = 60, externalBpm, setExternalBpm) {
  const [videoClips, setVideoClips] = useState([]);

  // ── Master BPM — exposed for binding to project clock / FX console ──
  const [internalBpm, setInternalBpm] = useState(120);
  const bpm = externalBpm !== undefined ? externalBpm : internalBpm;
  const setBpm = setExternalBpm || setInternalBpm;

  const [automationKeyframes, setAutomationKeyframes] = useState([
    { id: 'auto-0', time: 0,  chaosLevel: 0, filterMix: 0.5 },
    { id: 'auto-1', time: 15, chaosLevel: 2, filterMix: 0.8 },
    { id: 'auto-2', time: 30, chaosLevel: 0, filterMix: 0.5 },
  ]);


  // Sync clips when asset list changes
  useEffect(() => {
    setVideoClips((prev) => {
      const assetIds = new Set(assets.map((a) => a.id));
      const kept = prev.filter((clip) => assetIds.has(clip.assetId));
      const existingAssetIds = new Set(kept.map((c) => c.assetId));

      let cursor = kept.reduce((max, c) => Math.max(max, c.startTime + c.duration), 0);
      const added = [];

      for (const asset of assets) {
        if (existingAssetIds.has(asset.id)) continue;
        added.push({
          id: `clip-${asset.id}-${Date.now()}`,
          assetId: asset.id,
          startTime: cursor,
          duration: DEFAULT_CLIP_DURATION,
          reversed: false,
        });
        cursor += DEFAULT_CLIP_DURATION * 0.85;
      }

      return [...kept, ...added];
    });
  }, [assets]);

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

  // ── Drag to reposition ──
  const updateClipStart = useCallback((clipId, newStart) => {
    setVideoClips((prev) =>
      prev.map((clip) =>
        clip.id === clipId ? { ...clip, startTime: Math.max(0, newStart) } : clip
      )
    );
  }, []);

  // ── Clear all clips ──
  const clearVideoClips = useCallback(() => {
    setVideoClips([]);
  }, []);

  // ── Blade / Split at playhead ──
  // Splits clipId into two clips: [startTime → time] and [time → startTime+duration]
  const splitClipAtTime = useCallback((clipId, time) => {
    setVideoClips((prev) => {
      const clip = prev.find((c) => c.id === clipId);
      if (!clip) return prev;

      const splitPoint = time;
      const clipEnd = clip.startTime + clip.duration;

      // Guard: split must be strictly inside the clip
      if (splitPoint <= clip.startTime + 0.05 || splitPoint >= clipEnd - 0.05) return prev;

      const leftDuration  = splitPoint - clip.startTime;
      const rightDuration = clipEnd - splitPoint;

      const left = {
        ...clip,
        id: `${clip.id}-L`,
        duration: leftDuration,
      };
      const right = {
        ...clip,
        id: `${clip.id}-R`,
        startTime: splitPoint,
        duration: rightDuration,
      };

      return prev.map((c) => (c.id === clipId ? left : c)).concat(right);
    });
  }, []);

  // ── Reverse toggle ──
  const toggleClipReverse = useCallback((clipId) => {
    setVideoClips((prev) =>
      prev.map((c) => (c.id === clipId ? { ...c, reversed: !c.reversed } : c))
    );
  }, []);

  // ── Duplicate clip (Ctrl+D / Alt+Drag) ──
  // The duplicate starts at originalEnd - DUPLICATE_OVERLAP so crossfade ramp engages
  const duplicateClip = useCallback((clipId) => {
    setVideoClips((prev) => {
      const clip = prev.find((c) => c.id === clipId);
      if (!clip) return prev;

      const dupStart = clip.startTime + clip.duration - DUPLICATE_OVERLAP;
      const dup = {
        ...clip,
        id: `clip-dup-${clipId}-${Date.now()}`,
        startTime: Math.max(0, dupStart),
      };
      return [...prev, dup];
    });
  }, []);

  // ── Automation keyframes ──
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

  return {
    // Clip state
    videoClips,
    setVideoClips,
    updateClipStart,
    clearVideoClips,
    // Clip editing
    splitClipAtTime,
    toggleClipReverse,
    duplicateClip,
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

