/**
 * Compute per-clip opacity at `time`, accounting for overlapping clips.
 * When Clip B overlaps Clip A, shared duration gets a linear crossfade.
 */
export function computeClipOpacity(clip, allClips, time) {
  const clipEnd = clip.startTime + clip.duration;
  if (time < clip.startTime || time > clipEnd) return 0;

  let opacity = 1;

  for (const other of allClips) {
    if (other.id === clip.id) continue;

    const otherEnd = other.startTime + other.duration;
    const overlapStart = Math.max(clip.startTime, other.startTime);
    const overlapEnd = Math.min(clipEnd, otherEnd);
    if (overlapStart >= overlapEnd) continue;
    if (time < overlapStart || time > overlapEnd) continue;

    const progress = (time - overlapStart) / (overlapEnd - overlapStart);

    if (clip.startTime < other.startTime) {
      opacity = Math.min(opacity, 1 - progress);
    } else if (clip.startTime > other.startTime) {
      opacity = Math.min(opacity, progress);
    } else {
      opacity = Math.min(opacity, 0.5);
    }
  }

  return Math.max(0, Math.min(1, opacity));
}

export function getActiveClipsAtTime(clips, time) {
  return clips
    .map((clip) => ({ clip, opacity: computeClipOpacity(clip, clips, time) }))
    .filter(({ opacity }) => opacity > 0.02)
    .sort((a, b) => a.clip.startTime - b.clip.startTime);
}

export function interpolateAutomation(keyframes, time, field) {
  if (!keyframes || keyframes.length === 0) return null;
  const sorted = [...keyframes].sort((a, b) => a.time - b.time);

  if (time <= sorted[0].time) return sorted[0][field];
  if (time >= sorted[sorted.length - 1].time) return sorted[sorted.length - 1][field];

  for (let i = 0; i < sorted.length - 1; i++) {
    const a = sorted[i];
    const b = sorted[i + 1];
    if (time >= a.time && time <= b.time) {
      const span = b.time - a.time;
      if (span <= 0) return a[field];
      const t = (time - a.time) / span;
      return a[field] + (b[field] - a[field]) * t;
    }
  }

  return sorted[sorted.length - 1][field];
}
