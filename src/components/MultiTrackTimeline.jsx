import React, { useRef, useCallback, useMemo, useState, useEffect } from 'react';
import { interpolateAutomation } from '../utils/timelineCrossfade';
import { TimelineAutomationLane } from './TimelineAutomationLane';

const TRACK_LABEL_W = 108;
const ROW_H = 56;
const MIN_CLIP_DUR = 0.1;     // seconds
const MIN_CLIP_W = 24;        // px
const TRIM_HANDLE_W = 7;      // px
const SNAP_PX = 8;            // snap distance in screen pixels
const DEFAULT_PPS = 48;       // pixels per second at 100% zoom
const MIN_PPS = 10;
const MAX_PPS = 240;

const transportBtnStyle = {
  background: 'transparent',
  border: '1px solid var(--border-mid)',
  color: 'var(--text-dim)',
  borderRadius: 3,
  padding: '2px 5px',
  fontSize: 11,
  cursor: 'pointer',
  fontFamily: 'inherit',
  lineHeight: 1,
  transition: 'all 0.12s',
};

function formatTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  const cs = Math.floor((seconds % 1) * 10);
  return `${m}:${s.toString().padStart(2, '0')}.${cs}`;
}

// ── Mode tools (stay active until you pick another) ──
const TOOLS = [
  { id: 'select', label: '↖',  title: 'Select / Move / Trim  (V)' },
  { id: 'blade',  label: '✂',  title: 'Blade — click any clip to cut it right there  (B)' },
];

// Small action button used in the edit toolbar
function ToolBtn({ label, title, onClick, disabled = false, active = false, color = 'var(--text-dim)' }) {
  return (
    <button
      type="button"
      title={title}
      disabled={disabled}
      onClick={(e) => { e.stopPropagation(); if (!disabled) onClick?.(e); }}
      style={{
        background: active ? 'var(--accent-orange-dim)' : 'transparent',
        border: `1px solid ${active ? 'var(--accent-orange)' : 'var(--border-mid)'}`,
        color: active ? 'var(--accent-orange)' : color,
        borderRadius: 3,
        padding: '2px 6px',
        fontSize: 9,
        fontWeight: 700,
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.35 : 1,
        fontFamily: 'var(--font-mono, monospace)',
        letterSpacing: 0.3,
        whiteSpace: 'nowrap',
        transition: 'all 0.12s',
      }}
    >
      {label}
    </button>
  );
}

function ToolSep() {
  return <span style={{ width: 1, alignSelf: 'stretch', background: 'var(--border-mid)', margin: '0 3px', flexShrink: 0 }} />;
}

// Numeric field that commits on blur / Enter (so typing doesn't spam undo history)
function NumField({ label, value, disabled, onCommit, step = 0.1, width = 46 }) {
  return (
    <label style={{ display: 'inline-flex', alignItems: 'center', gap: 3, fontSize: 8, color: 'var(--text-dim)' }}>
      {label}
      <input
        key={`${label}-${Number(value).toFixed(2)}`}
        type="number"
        step={step}
        min={0}
        disabled={disabled}
        defaultValue={disabled ? '' : Number(value).toFixed(2)}
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => {
          e.stopPropagation();
          if (e.key === 'Enter') e.currentTarget.blur();
        }}
        onBlur={(e) => {
          const v = parseFloat(e.target.value);
          if (!Number.isNaN(v) && Math.abs(v - Number(value)) > 0.001) onCommit?.(v);
        }}
        style={{
          width,
          fontSize: 9,
          fontFamily: 'var(--font-mono, monospace)',
          background: 'var(--bg-secondary)',
          color: 'var(--text-primary)',
          border: '1px solid var(--border-mid)',
          borderRadius: 3,
          padding: '1px 3px',
          opacity: disabled ? 0.35 : 1,
        }}
      />
    </label>
  );
}

export function MultiTrackTimeline({
  duration = 60,
  currentTime = 0,
  isPlaying = false,
  isCollapsed = false,
  assets = [],
  videoClips = [],
  selectedClipId = null,
  onSelectClip,
  onUpdateClipStart,
  onSplitClip,
  onToggleReverse,
  onDuplicateClip,
  waveformPeaks = [],
  transientMarkers = [],
  lyricSegments = [],
  automationKeyframes = [],
  onAddAutomationKeyframe,
  onUpdateAutomationKeyframe,
  onRemoveAutomationKeyframe,
  selectedCssEffect = 'solarize_invert',
  onSelectCssEffect = () => {},
  // Phase 1.5 — Track 3 section markers
  fxMarkers = [],
  onAddFxMarker,
  onRemoveFxMarker,
  onUpdateFxMarker,
  onSeek,
  bpm = 120,
  // A/B Region Looping
  isLooping = false,
  loopStart = 0,
  loopEnd = 16,
  onUpdateLoop = () => {},
  // Advanced Timeline Editing & Integration
  edit = {},
  selectedStyle = '',
  onUseTimelineStyle = () => {},
  onReorderAssetsByClips = null,
  // Transport controls
  onTogglePlay = () => {},
  onStop = () => {},
  onToggleLoop = () => {},
}) {

  const scrollRef   = useRef(null);
  const [activeTool, setActiveTool] = useState('select');
  const [bladeX, setBladeX] = useState(null); // px relative to scroll content

  // Zoom (pixels per second)
  const [pps, setPps] = useState(DEFAULT_PPS);
  const pixelsPerSecond = pps;

  // Snapping
  const [snapEnabled, setSnapEnabled] = useState(true);
  const [snapGuide, setSnapGuide] = useState(null);

  const timelineDuration = useMemo(() => {
    const clipEnd = videoClips.reduce((max, c) => Math.max(max, c.startTime + c.duration), 0);
    return Math.max(duration, clipEnd, 30);
  }, [duration, videoClips]);

  const contentWidth = timelineDuration * pixelsPerSecond;

  const assetMap = useMemo(() => {
    const map = {};
    assets.forEach((a) => { map[a.id] = a; });
    return map;
  }, [assets]);

  const selectedClip = useMemo(() => {
    return videoClips.find((c) => c.id === selectedClipId) || null;
  }, [videoClips, selectedClipId]);

  // Mode hotkeys: V (Select), B (Blade)
  useEffect(() => {
    const onKey = (e) => {
      const tag = document.activeElement?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
      if (e.key === 'v' || e.key === 'V') {
        setActiveTool('select');
      } else if (e.key === 'b' || e.key === 'B') {
        setActiveTool('blade');
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // Snapping candidates calculation
  const snapEdgesRef = useRef([]);
  useEffect(() => {
    const edges = [0];
    if (currentTime > 0) edges.push(currentTime);
    videoClips.forEach((c) => {
      edges.push(c.startTime);
      edges.push(c.startTime + c.duration);
    });
    if (bpm > 0) {
      const beatSec = 60 / bpm;
      const count = Math.min(300, Math.ceil(timelineDuration / beatSec));
      for (let i = 0; i <= count; i++) {
        edges.push(i * beatSec);
      }
    }
    snapEdgesRef.current = edges;
  }, [videoClips, currentTime, bpm, timelineDuration]);

  const snapTime = useCallback((t, ignoreClipId = null, suppress = false) => {
    if (!snapEnabled || suppress) {
      setSnapGuide(null);
      return t;
    }
    const snapThresholdSec = SNAP_PX / pixelsPerSecond;
    let closest = null;
    let minDiff = Infinity;

    const ignoreClip = ignoreClipId ? videoClips.find((c) => c.id === ignoreClipId) : null;
    const ignoreEdges = ignoreClip ? [ignoreClip.startTime, ignoreClip.startTime + ignoreClip.duration] : [];

    for (const edge of snapEdgesRef.current) {
      if (ignoreEdges.some((ie) => Math.abs(ie - edge) < 0.001)) continue;
      const diff = Math.abs(t - edge);
      if (diff <= snapThresholdSec && diff < minDiff) {
        minDiff = diff;
        closest = edge;
      }
    }

    if (closest != null) {
      setSnapGuide(closest);
      return closest;
    }
    setSnapGuide(null);
    return t;
  }, [snapEnabled, pixelsPerSecond, videoClips]);

  // ── Clip Gestures: Move, Trim Left, Trim Right ──
  const startClipGesture = useCallback((e, clip, mode = 'move') => {
    if (activeTool === 'blade') {
      e.preventDefault();
      e.stopPropagation();
      const rect = scrollRef.current?.getBoundingClientRect();
      if (!rect) return;
      const clickX = e.clientX - rect.left + (scrollRef.current?.scrollLeft || 0) - TRACK_LABEL_W;
      const cutTime = Math.max(0, clickX / pixelsPerSecond);
      const res = edit.splitClipAtTime?.(clip.id, cutTime) || onSplitClip?.(clip.id, cutTime);
      if (res?.rightId) onSelectClip?.(res.rightId);
      return;
    }

    e.preventDefault();
    e.stopPropagation();

    // Alt+Drag → duplicate immediately and drag duplicate
    if (mode === 'move' && e.altKey) {
      const dupId = edit.duplicateClip?.(clip.id) || onDuplicateClip?.(clip.id);
      if (dupId) onSelectClip?.(dupId);
      return;
    }

    onSelectClip?.(clip.id);

    const startClientX = e.clientX;
    const origStart = clip.startTime;
    const origDur = clip.duration;
    const origIn = clip.inPoint || 0;
    const isRev = Boolean(clip.reversed);
    let hasBegunEdit = false;

    const onPointerMove = (ev) => {
      const deltaPx = ev.clientX - startClientX;
      if (!hasBegunEdit && Math.abs(deltaPx) >= 3) {
        hasBegunEdit = true;
        edit.beginClipEdit?.();
      }

      const deltaTime = deltaPx / pixelsPerSecond;
      const suppressSnap = ev.shiftKey;

      if (mode === 'move') {
        const rawNewStart = Math.max(0, origStart + deltaTime);
        const snappedStart = snapTime(rawNewStart, clip.id, suppressSnap);
        onUpdateClipStart?.(clip.id, Math.max(0, snappedStart));
      } else if (mode === 'trim-l') {
        const maxStart = origStart + origDur - MIN_CLIP_DUR;
        const rawNewStart = Math.max(0, Math.min(origStart + deltaTime, maxStart));
        const snappedStart = snapTime(rawNewStart, clip.id, suppressSnap);
        const actualStart = Math.max(0, Math.min(snappedStart, maxStart));
        const durChange = origStart - actualStart;
        const newDur = Math.max(MIN_CLIP_DUR, origDur + durChange);
        const shift = actualStart - origStart;
        const newInPoint = isRev ? origIn : Math.max(0, origIn + shift);

        edit.updateClip?.(clip.id, {
          startTime: actualStart,
          duration: newDur,
          inPoint: newInPoint,
        }, false);
      } else if (mode === 'trim-r') {
        const rawDur = Math.max(MIN_CLIP_DUR, origDur + deltaTime);
        const rawEnd = origStart + rawDur;
        const snappedEnd = snapTime(rawEnd, clip.id, suppressSnap);
        const newDur = Math.max(MIN_CLIP_DUR, snappedEnd - origStart);
        const removed = origDur - newDur;
        const newInPoint = isRev ? Math.max(0, origIn + removed) : origIn;

        edit.updateClip?.(clip.id, {
          duration: newDur,
          inPoint: newInPoint,
        }, false);
      }
    };

    const onPointerUp = () => {
      setSnapGuide(null);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
    };

    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
  }, [activeTool, pixelsPerSecond, edit, onSplitClip, onDuplicateClip, onSelectClip, snapTime, onUpdateClipStart]);

  const handleClipDoubleClick = useCallback((e, clip) => {
    e.stopPropagation();
    onSeek?.(clip.startTime);
  }, [onSeek]);

  // ── Ruler / content area click ──
  const handleContentClick = useCallback((e) => {
    const rect = scrollRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = e.clientX - rect.left + (scrollRef.current?.scrollLeft || 0) - TRACK_LABEL_W;
    const time = Math.max(0, x / pixelsPerSecond);

    if (activeTool === 'blade') {
      const res = edit.splitAtTime?.(time, selectedClipId);
      if (res?.rightId) onSelectClip?.(res.rightId);
      return;
    }
    onSeek?.(time);
  }, [activeTool, selectedClipId, edit, onSeek, pixelsPerSecond, onSelectClip]);

  // ── Blade cursor tracking ──
  const handleContentMouseMove = useCallback((e) => {
    if (activeTool !== 'blade') { setBladeX(null); return; }
    const rect = scrollRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = e.clientX - rect.left + (scrollRef.current?.scrollLeft || 0);
    setBladeX(x);
  }, [activeTool]);

  const handleContentMouseLeave = useCallback(() => setBladeX(null), []);

  // ── Automation click ──
  const handleAutomationClick = useCallback((e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const time = Math.max(0, (x / rect.width) * timelineDuration);
    onAddAutomationKeyframe?.(time);
  }, [onAddAutomationKeyframe, timelineDuration]);

  // ── Auto-Scroll Timeline to Playhead ─────────────────────────────────────
  useEffect(() => {
    if (!isPlaying || !scrollRef.current) return;
    const scrollEl = scrollRef.current;
    const playheadPx = TRACK_LABEL_W + (currentTime * pixelsPerSecond);
    const viewWidth = scrollEl.clientWidth;
    
    // Jump forward if playhead goes past 85% of view
    if (playheadPx > scrollEl.scrollLeft + viewWidth * 0.85) {
      scrollEl.scrollLeft = playheadPx - viewWidth * 0.15;
    } 
    // Or jump back if the user dragged it way behind
    else if (playheadPx < scrollEl.scrollLeft + TRACK_LABEL_W) {
      scrollEl.scrollLeft = playheadPx - viewWidth * 0.15;
    }
  }, [currentTime, isPlaying, pixelsPerSecond]);

  const playheadLeft = TRACK_LABEL_W + currentTime * pixelsPerSecond;

  const automationPath = useMemo(() => {
    if (!automationKeyframes.length) return '';
    const sorted = [...automationKeyframes].sort((a, b) => a.time - b.time);
    const h = ROW_H - 12;
    return sorted.map((kf, i) => {
      const x = (kf.time / timelineDuration) * contentWidth;
      const y = h - (kf.chaosLevel / 5) * (h - 8) - 4;
      return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
    }).join(' ');
  }, [automationKeyframes, contentWidth, timelineDuration]);

  const currentChaos = interpolateAutomation(automationKeyframes, currentTime, 'chaosLevel');

  // ─────────────────────────────────────────────
  // COLLAPSED SCRUBBER BAR (30px)
  // ─────────────────────────────────────────────
  if (isCollapsed) {
    return (
      <div style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        backgroundColor: 'var(--bg-panel)',
        borderTop: '1px solid var(--border-dim)',
        padding: '0 10px',
        fontFamily: 'var(--font-label)',
        fontSize: 10,
        overflow: 'hidden',
      }}>
        {/* Mini transport in collapsed mode */}
        <button type="button" title={isPlaying ? 'Pause' : 'Play'} onClick={() => onTogglePlay?.()}
          style={{ ...transportBtnStyle, color: isPlaying ? '#22c55e' : 'var(--accent-orange)', fontSize: 12, padding: '1px 4px' }}>
          {isPlaying ? '⏸' : '▶'}
        </button>
        <button type="button" title="Stop" onClick={() => { onStop?.(); onSeek?.(0); }}
          style={{ ...transportBtnStyle, fontSize: 11, padding: '1px 4px' }}>⏹</button>

        {/* Timecode */}
        <span style={{
          color: 'var(--timecode-color)',
          fontFamily: 'var(--font-mono)',
          fontSize: 11,
          letterSpacing: 1,
          flexShrink: 0,
          textShadow: '0 0 8px var(--accent-blue-glow)',
        }}>
          {formatTime(currentTime)}
        </span>

        {/* Scrub bar */}
        <div
          style={{
            flex: 1,
            height: 6,
            background: 'var(--bg-track)',
            borderRadius: 3,
            position: 'relative',
            cursor: 'pointer',
            border: '1px solid var(--border-mid)',
          }}
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const t = ((e.clientX - rect.left) / rect.width) * timelineDuration;
            onSeek?.(Math.max(0, t));
          }}
        >
          {/* Fill */}
          <div style={{
            position: 'absolute',
            left: 0,
            top: 0,
            height: '100%',
            width: `${(currentTime / timelineDuration) * 100}%`,
            background: 'var(--accent-blue)',
            borderRadius: 3,
            opacity: 0.5,
          }} />
          {/* Playhead thumb */}
          <div style={{
            position: 'absolute',
            top: -3,
            left: `calc(${(currentTime / timelineDuration) * 100}% - 3px)`,
            width: 6,
            height: 12,
            borderRadius: 2,
            background: 'var(--playhead-color)',
            boxShadow: '0 0 6px var(--playhead-glow)',
          }} />
        </div>

        {/* Duration */}
        <span style={{ color: 'var(--text-dim)', flexShrink: 0 }}>
          {formatTime(timelineDuration)}
        </span>

        {isPlaying && (
          <span style={{ color: '#22c55e', marginLeft: 4, fontSize: 9, letterSpacing: 1 }}>
            ● LIVE
          </span>
        )}
      </div>
    );
  }

  // ─────────────────────────────────────────────
  // FULL MULTI-TRACK TIMELINE
  // ─────────────────────────────────────────────
  return (
    <div style={{
      width: '100%',
      height: '100%',
      backgroundColor: 'var(--bg-panel)',
      border: '1px solid var(--border-dim)',
      borderRadius: '4px 4px 0 0',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      fontFamily: 'var(--font-label)',
      fontSize: 10,
      color: 'var(--text-track)',
    }}>

      {/* ── HEADER ROW 1: Mode tools, Style state, Timecode ── */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '4px 10px',
        borderBottom: '1px solid var(--border-dim)',
        backgroundColor: 'var(--bg-panel-alt)',
        flexShrink: 0,
        gap: 8,
      }}>
        {/* Tool strip & style chip */}
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          <span style={{
            color: 'var(--accent-orange)',
            fontWeight: 700,
            letterSpacing: 1,
            fontSize: 9,
            marginRight: 2,
            textShadow: '0 0 8px var(--accent-orange-glow)',
          }}>
            TIMELINE
          </span>

          {TOOLS.map((tool) => (
            <button
              key={tool.id}
              title={tool.title}
              onClick={() => setActiveTool(tool.id)}
              style={{
                background: activeTool === tool.id
                  ? 'var(--accent-orange-dim)'
                  : 'transparent',
                border: `1px solid ${activeTool === tool.id
                  ? 'var(--accent-orange)'
                  : 'var(--border-mid)'}`,
                color: activeTool === tool.id
                  ? 'var(--accent-orange)'
                  : 'var(--text-dim)',
                borderRadius: 3,
                padding: '2px 8px',
                fontSize: 11,
                cursor: 'pointer',
                fontFamily: 'inherit',
                fontWeight: 700,
                transition: 'all 0.12s',
                boxShadow: activeTool === tool.id
                  ? '0 0 6px var(--accent-orange-glow)'
                  : 'none',
              }}
            >
              {tool.label}
            </button>
          ))}

          <ToolSep />

          {/* Timeline Style Indicator / Switcher */}
          {selectedStyle === 'timeline' ? (
            <span
              style={{
                color: '#22c55e',
                fontSize: 9,
                fontWeight: 700,
                border: '1px solid #22c55e',
                background: 'rgba(34, 197, 94, 0.12)',
                padding: '2px 6px',
                borderRadius: 3,
                letterSpacing: 0.5,
              }}
              title="Active Edit Style is 'Timeline Edit' — your custom clip sequence, cuts, and reverse/mirror edits play live in the viewer!"
            >
              ● TIMELINE EDITS LIVE
            </span>
          ) : (
            <button
              type="button"
              onClick={onUseTimelineStyle}
              style={{
                background: 'var(--accent-orange)',
                color: '#000',
                fontWeight: 800,
                border: 'none',
                borderRadius: 3,
                padding: '2px 8px',
                fontSize: 9,
                cursor: 'pointer',
                letterSpacing: 0.5,
                boxShadow: '0 0 8px var(--accent-orange-glow)',
                transition: 'all 0.15s',
              }}
              title="Switch FX Console Section 4 to '★ Timeline Edit' so your custom clip sequence and edits display in the viewport"
            >
              ▶ USE TIMELINE STYLE
            </button>
          )}
        </div>

        {/* ── Mini Transport Controls ── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {/* Jump to beginning */}
          <button type="button" title="Jump to start" onClick={() => onSeek?.(0)}
            style={transportBtnStyle}>⏮</button>
          {/* Skip back 5s */}
          <button type="button" title="Back 5s" onClick={() => onSeek?.(Math.max(0, currentTime - 5))}
            style={transportBtnStyle}>⏪</button>
          {/* Play / Pause */}
          <button type="button" title={isPlaying ? 'Pause' : 'Play'} onClick={() => onTogglePlay?.()}
            style={{ ...transportBtnStyle, color: isPlaying ? '#22c55e' : 'var(--accent-orange)', fontSize: 13 }}>
            {isPlaying ? '⏸' : '▶'}
          </button>
          {/* Stop */}
          <button type="button" title="Stop" onClick={() => { onStop?.(); onSeek?.(0); }}
            style={transportBtnStyle}>⏹</button>
          {/* Skip forward 5s */}
          <button type="button" title="Forward 5s" onClick={() => onSeek?.(Math.min(timelineDuration, currentTime + 5))}
            style={transportBtnStyle}>⏩</button>
          {/* Jump to end */}
          <button type="button" title="Jump to end" onClick={() => onSeek?.(timelineDuration)}
            style={transportBtnStyle}>⏭</button>

          <span style={{ width: 1, alignSelf: 'stretch', background: 'var(--border-mid)', margin: '0 3px' }} />

          {/* Loop toggle */}
          <button type="button" title={isLooping ? 'Disable Loop' : 'Enable Loop'}
            onClick={() => onToggleLoop?.()}
            style={{
              ...transportBtnStyle,
              color: isLooping ? '#22c55e' : 'var(--text-dim)',
              background: isLooping ? 'rgba(34, 197, 94, 0.12)' : 'transparent',
              border: isLooping ? '1px solid #22c55e' : '1px solid var(--border-mid)',
            }}>
            🔁
          </button>
        </div>

        {/* Timecode + status */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{
            color: 'var(--timecode-color)',
            fontFamily: 'var(--font-mono)',
            fontSize: 11,
            letterSpacing: 1,
            textShadow: '0 0 8px var(--accent-blue-glow)',
          }}>
            {formatTime(currentTime)}
            <span style={{ color: 'var(--text-dim)', margin: '0 4px' }}>/</span>
            {formatTime(timelineDuration)}
          </span>
          {isPlaying && (
            <span style={{ color: '#22c55e', fontSize: 9, letterSpacing: 1 }}>● LIVE</span>
          )}
          {currentChaos != null && (
            <span style={{ color: 'var(--accent-orange)', fontSize: 9 }}>
              chaos {currentChaos.toFixed(1)}
            </span>
          )}
          <span style={{ color: 'var(--text-dim)', fontSize: 9 }}>
            [T] collapse
          </span>
        </div>
      </div>

      {/* ── HEADER ROW 2: Edit Action Bar ── */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 4,
        padding: '3px 10px',
        backgroundColor: 'var(--bg-panel)',
        borderBottom: '1px solid var(--border-dim)',
        flexWrap: 'wrap',
        fontSize: 9,
        flexShrink: 0,
      }}>
        {/* Undo / Redo */}
        <ToolBtn
          label="↶ Undo"
          title="Undo last timeline edit (Ctrl+Z)"
          onClick={() => edit.undo?.()}
          disabled={!edit.canUndo}
        />
        <ToolBtn
          label="↷ Redo"
          title="Redo timeline edit (Ctrl+Y or Ctrl+Shift+Z)"
          onClick={() => edit.redo?.()}
          disabled={!edit.canRedo}
        />

        <ToolSep />

        {/* Clip operations */}
        <ToolBtn
          label="✂ Cut"
          title="Cut selected clip at playhead, or clip under playhead (S)"
          onClick={() => {
            const res = edit.splitAtTime?.(currentTime, selectedClipId);
            if (res?.rightId) onSelectClip?.(res.rightId);
          }}
          disabled={!selectedClip && !videoClips.some((c) => currentTime >= c.startTime && currentTime <= c.startTime + c.duration)}
        />
        <ToolBtn
          label="⇄ Rev"
          title="Toggle clip reverse playback (R) — plays video backwards / flips stills"
          active={Boolean(selectedClip?.reversed)}
          disabled={!selectedClip}
          color="var(--accent-blue)"
          onClick={() => selectedClip && (edit.toggleClipReverse?.(selectedClip.id) || onToggleReverse?.(selectedClip.id))}
        />
        <ToolBtn
          label="◐ Flip"
          title="Mirror / flip horizontally (M)"
          active={Boolean(selectedClip?.mirrored)}
          disabled={!selectedClip}
          color="#f59e0b"
          onClick={() => selectedClip && edit.toggleClipMirror?.(selectedClip.id)}
        />
        <ToolBtn
          label="⧉ Dupe"
          title="Duplicate selected clip with overlap (Ctrl+D / Alt+drag)"
          disabled={!selectedClip}
          onClick={() => {
            if (!selectedClip) return;
            const newId = edit.duplicateClip?.(selectedClip.id) || onDuplicateClip?.(selectedClip.id);
            if (newId) onSelectClip?.(newId);
          }}
        />
        <ToolBtn
          label="📋 Copy"
          title="Copy selected clip (Ctrl+C)"
          disabled={!selectedClip}
          onClick={() => selectedClip && edit.copyClip?.(selectedClip.id)}
        />
        <ToolBtn
          label="📥 Paste"
          title="Paste copied clip at playhead (Ctrl+V)"
          disabled={!edit.hasClipboard?.()}
          onClick={() => {
            const newId = edit.pasteClip?.(currentTime);
            if (newId) onSelectClip?.(newId);
          }}
        />
        <ToolBtn
          label="◀ Move"
          title="Move selected clip earlier in sequence ([)"
          disabled={!selectedClip}
          onClick={() => selectedClip && edit.moveClipInOrder?.(selectedClip.id, -1)}
        />
        <ToolBtn
          label="Move ▶"
          title="Move selected clip later in sequence (])"
          disabled={!selectedClip}
          onClick={() => selectedClip && edit.moveClipInOrder?.(selectedClip.id, 1)}
        />
        <ToolBtn
          label="🗑 Del"
          title="Delete selected clip (Delete / Backspace)"
          disabled={!selectedClip}
          color="#ef4444"
          onClick={() => {
            if (!selectedClip) return;
            edit.deleteClip?.(selectedClip.id, false);
            onSelectClip?.(null);
          }}
        />
        <ToolBtn
          label="⇥ Ripple"
          title="Ripple delete: remove clip and slide subsequent clips back (Shift+Delete)"
          disabled={!selectedClip}
          color="#ef4444"
          onClick={() => {
            if (!selectedClip) return;
            edit.deleteClip?.(selectedClip.id, true);
            onSelectClip?.(null);
          }}
        />

        <ToolSep />

        {/* Selected clip time fine-tuning */}
        {selectedClip && (
          <>
            <NumField
              label="Start:"
              value={selectedClip.startTime}
              onCommit={(val) => edit.updateClip?.(selectedClip.id, { startTime: Math.max(0, val) })}
            />
            <NumField
              label="Dur:"
              value={selectedClip.duration}
              onCommit={(val) => edit.updateClip?.(selectedClip.id, { duration: Math.max(MIN_CLIP_DUR, val) })}
            />
            <ToolSep />
          </>
        )}

        {/* Layout utilities */}
        <ToolBtn
          label="Pack"
          title="Pack clips tightly end-to-end (closes all gaps)"
          onClick={() => edit.packClips?.(0)}
        />
        <ToolBtn
          label="Shuffle"
          title="Shuffle timeline clips randomly (great for montage cut-ups)"
          onClick={() => edit.shuffleClips?.()}
        />
        <ToolBtn
          label="BIN→TL"
          title="Re-sequence timeline clips to match current Media Bin order"
          onClick={() => edit.sortClipsByAssetOrder?.(assets)}
        />
        {onReorderAssetsByClips && (
          <ToolBtn
            label="TL→BIN"
            title="Re-order Media Bin assets to match timeline playback order"
            onClick={onReorderAssetsByClips}
          />
        )}

        {/* Right side: Snapping & Zoom */}
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6 }}>
          <ToolBtn
            label={snapEnabled ? "🧲 SNAP ON" : "🧲 SNAP OFF"}
            active={snapEnabled}
            title="Toggle snapping to clip edges, playhead, and beats. (Hold Shift while dragging to temporarily bypass)"
            onClick={() => setSnapEnabled((s) => !s)}
          />

          <ToolSep />

          <span style={{ fontSize: 8, color: 'var(--text-dim)' }}>ZOOM:</span>
          <ToolBtn
            label="−"
            title="Zoom Out"
            onClick={() => setPps((p) => Math.max(MIN_PPS, Math.round(p * 0.75)))}
          />
          <input
            type="range"
            min={MIN_PPS}
            max={MAX_PPS}
            value={pps}
            onChange={(e) => setPps(Number(e.target.value))}
            style={{ width: 55, height: 10, cursor: 'pointer', accentColor: 'var(--accent-orange)' }}
            title={`Zoom: ${pps} px/s`}
          />
          <ToolBtn
            label="+"
            title="Zoom In"
            onClick={() => setPps((p) => Math.min(MAX_PPS, Math.round(p * 1.33)))}
          />
          <span style={{ fontSize: 8, color: 'var(--text-dim)', minWidth: 28, textAlign: 'right' }}>
            {pps}px/s
          </span>
        </div>
      </div>

      {/* ── SCROLLABLE CONTENT ── */}
      <div
        ref={scrollRef}
        className={activeTool === 'blade' ? 'tool-blade' : 'tool-select'}
        style={{ flex: 1, overflowX: 'auto', overflowY: 'auto', position: 'relative' }}
        onClick={handleContentClick}
        onMouseMove={handleContentMouseMove}
        onMouseLeave={handleContentMouseLeave}
        onWheel={(e) => {
          // Ctrl + wheel → zoom in/out (centered on cursor)
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            const zoomFactor = e.deltaY > 0 ? 0.88 : 1.14;
            setPps((p) => Math.min(MAX_PPS, Math.max(MIN_PPS, Math.round(p * zoomFactor))));
            return;
          }
          // Regular wheel → scroll horizontally (convert vertical to horizontal)
          if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
            e.preventDefault();
            const el = scrollRef.current;
            if (el) {
              // Shift+wheel already scrolls horizontally in some browsers — handle both
              el.scrollLeft += e.deltaY;
            }
          }
        }}
      >
        <div style={{ width: contentWidth + TRACK_LABEL_W, minWidth: '100%', position: 'relative' }}>

          {/* TIME RULER */}
          <div style={{
            height: 20,
            marginLeft: TRACK_LABEL_W,
            position: 'relative',
            borderBottom: `1px solid var(--border-mid)`,
            background: `repeating-linear-gradient(90deg,
              var(--border-mid) 0,
              var(--border-mid) 1px,
              transparent 1px,
              transparent ${pixelsPerSecond}px)`,
          }}>
            {Array.from({ length: Math.ceil(timelineDuration) + 1 }, (_, i) => (
              <span key={i} style={{
                position: 'absolute',
                left: i * pixelsPerSecond,
                top: 2,
                fontSize: 8,
                color: i % 5 === 0 ? 'var(--accent-blue)' : 'var(--text-dim)',
                fontFamily: 'var(--font-mono)',
                pointerEvents: 'none',
              }}>
                {i}s
              </span>
            ))}
          </div>

          {/* TRACK 1 — VIDEO SLICES */}
          <div style={{
            display: 'flex',
            height: ROW_H,
            borderBottom: `1px solid var(--border-dim)`,
          }}>
            <div style={{
              width: TRACK_LABEL_W,
              flexShrink: 0,
              padding: '6px 8px',
              backgroundColor: 'var(--bg-track-label)',
              borderRight: `1px solid var(--border-mid)`,
              color: 'var(--accent-orange)',
              fontWeight: 600,
              fontSize: 9,
              lineHeight: 1.4,
            }}>
              T1 · VIDEO<br />
              <span style={{ color: 'var(--text-dim)', fontWeight: 400 }}>SLICES</span>
            </div>

            <div
              style={{ position: 'relative', width: contentWidth, height: '100%', backgroundColor: 'var(--bg-track)' }}
              onDragOver={(e) => {
                e.preventDefault();
                e.dataTransfer.dropEffect = 'copy';
              }}
              onDrop={(e) => {
                e.preventDefault();
                const assetId = e.dataTransfer.getData('application/x-kinet-asset');
                if (!assetId) return;
                const rect = e.currentTarget.getBoundingClientRect();
                const dropTime = Math.max(0, (e.clientX - rect.left) / pixelsPerSecond);
                const newId = edit.addClipFromAsset?.(assetId, dropTime);
                if (newId) onSelectClip?.(newId);
              }}
            >
              {/* Snap guide line */}
              {snapGuide != null && (
                <div
                  style={{
                    position: 'absolute',
                    left: snapGuide * pixelsPerSecond,
                    top: 0,
                    bottom: 0,
                    width: 1,
                    backgroundColor: 'var(--accent-blue)',
                    boxShadow: '0 0 6px var(--accent-blue-glow)',
                    zIndex: 15,
                    pointerEvents: 'none',
                  }}
                />
              )}

              {videoClips.map((clip) => {
                const asset = assetMap[clip.assetId];
                const left  = clip.startTime * pixelsPerSecond;
                const width = clip.duration  * pixelsPerSecond;
                const isSelected = clip.id === selectedClipId;
                const isVideo = asset?.mediaType === 'video' || asset?.type === 'video' || asset?.url?.endsWith('.webm') || asset?.url?.endsWith('.mp4');

                return (
                  <div
                    key={clip.id}
                    onMouseDown={(e) => startClipGesture(e, clip, 'move')}
                    onDoubleClick={(e) => handleClipDoubleClick(e, clip)}
                    onClick={(e) => { e.stopPropagation(); onSelectClip?.(clip.id); }}
                    style={{
                      position: 'absolute',
                      left,
                      top: 5,
                      width: Math.max(width, MIN_CLIP_W),
                      height: ROW_H - 12,
                      backgroundColor: isSelected
                        ? 'var(--clip-selected-bg)'
                        : 'var(--accent-orange-dim)',
                      border: `${isSelected ? 2 : 1}px solid ${
                        clip.reversed
                          ? 'var(--accent-blue)'
                          : isSelected
                            ? 'var(--clip-selected-border)'
                            : 'var(--accent-orange)'
                      }`,
                      borderLeft: clip.reversed
                        ? '3px dashed var(--accent-blue)'
                        : undefined,
                      borderRadius: 3,
                      cursor: activeTool === 'blade' ? 'crosshair' : 'grab',
                      overflow: 'hidden',
                      display: 'flex',
                      alignItems: 'flex-end',
                      padding: 2,
                      boxSizing: 'border-box',
                      zIndex: isSelected ? 4 : 2,
                      boxShadow: isSelected
                        ? '0 0 8px var(--accent-orange-glow)'
                        : 'none',
                      transition: 'box-shadow 0.1s',
                      userSelect: 'none',
                    }}
                    title={`${asset?.name || 'clip'}${clip.reversed ? ' (reversed)' : ''}${clip.mirrored ? ' (mirrored)' : ''} — drag to move, Alt+drag to dupe, double-click to seek`}
                  >
                    {/* Left trim handle */}
                    <div
                      onMouseDown={(e) => startClipGesture(e, clip, 'trim-l')}
                      title="Trim start (drag to change in-point)"
                      style={{
                        position: 'absolute',
                        left: 0,
                        top: 0,
                        bottom: 0,
                        width: TRIM_HANDLE_W,
                        cursor: 'ew-resize',
                        zIndex: 6,
                        background: 'rgba(255,255,255,0.08)',
                        borderRight: '1px solid rgba(255,255,255,0.2)',
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--accent-orange)'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; }}
                    />

                    {/* Thumbnail — supports video badge and lazy image */}
                    {asset?.url && (
                      isVideo ? (
                        <div
                          style={{
                            position: 'absolute',
                            inset: 0,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            backgroundColor: 'rgba(6, 182, 212, 0.12)',
                            color: 'var(--accent-blue)',
                            fontSize: 9,
                            fontWeight: 700,
                            letterSpacing: 0.5,
                            pointerEvents: 'none',
                            userSelect: 'none',
                          }}
                        >
                          ▶ VID
                        </div>
                      ) : (
                        <img
                          src={asset.url}
                          alt=""
                          loading="lazy"
                          decoding="async"
                          draggable={false}
                          style={{
                            position: 'absolute',
                            inset: 0,
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            opacity: 0.5,
                            pointerEvents: 'none',
                            transform: (clip.mirrored || clip.reversed) ? 'scaleX(-1)' : 'none',
                          }}
                        />
                      )
                    )}

                    {/* Reverse badge */}
                    {clip.reversed && (
                      <span style={{
                        position: 'absolute',
                        top: 2,
                        right: clip.mirrored ? 18 : 3,
                        fontSize: 9,
                        color: 'var(--accent-blue)',
                        textShadow: '0 0 5px var(--accent-blue-glow)',
                        zIndex: 3,
                        pointerEvents: 'none',
                        fontWeight: 800,
                      }}>
                        ⇄
                      </span>
                    )}

                    {/* Mirror badge */}
                    {clip.mirrored && (
                      <span style={{
                        position: 'absolute',
                        top: 2,
                        right: 3,
                        fontSize: 9,
                        color: '#f59e0b',
                        textShadow: '0 0 5px rgba(245,158,11,0.6)',
                        zIndex: 3,
                        pointerEvents: 'none',
                        fontWeight: 800,
                      }}>
                        ◐
                      </span>
                    )}

                    {/* Clip name label */}
                    <span style={{
                      position: 'relative',
                      zIndex: 3,
                      background: 'rgba(0,0,0,0.75)',
                      color: isSelected ? 'var(--accent-orange)' : '#ddd',
                      fontSize: 8,
                      padding: '1px 3px',
                      borderRadius: 2,
                      maxWidth: 'calc(100% - 14px)',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      marginLeft: 4,
                      pointerEvents: 'none',
                    }}>
                      {asset?.name?.slice(0, 14) || 'clip'}
                    </span>

                    {/* Right trim handle */}
                    <div
                      onMouseDown={(e) => startClipGesture(e, clip, 'trim-r')}
                      title="Trim end (drag to change duration)"
                      style={{
                        position: 'absolute',
                        right: 0,
                        top: 0,
                        bottom: 0,
                        width: TRIM_HANDLE_W,
                        cursor: 'ew-resize',
                        zIndex: 6,
                        background: 'rgba(255,255,255,0.08)',
                        borderLeft: '1px solid rgba(255,255,255,0.2)',
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--accent-orange)'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; }}
                    />
                  </div>
                );
              })}

              {videoClips.length === 0 && (
                <span style={{
                  position: 'absolute',
                  top: '50%',
                  left: 12,
                  transform: 'translateY(-50%)',
                  opacity: 0.35,
                  fontSize: 9,
                }}>
                  Upload media or drag from Media Bin → clips appear here · Alt+drag to duplicate · S to split
                </span>
              )}
            </div>
          </div>

          {/* TRACK 2 — AUDIO & LYRICS */}
          <div style={{
            display: 'flex',
            height: ROW_H,
            borderBottom: `1px solid var(--border-dim)`,
          }}>
            <div style={{
              width: TRACK_LABEL_W,
              flexShrink: 0,
              padding: '6px 8px',
              backgroundColor: 'var(--bg-track-label)',
              borderRight: `1px solid var(--border-mid)`,
              color: 'var(--accent-blue)',
              fontWeight: 600,
              fontSize: 9,
              lineHeight: 1.4,
            }}>
              T2 · AUDIO<br />
              <span style={{ color: 'var(--text-dim)', fontWeight: 400 }}>& LYRICS</span>
            </div>

            <div style={{
              position: 'relative',
              width: contentWidth,
              height: '100%',
              backgroundColor: 'var(--bg-track)',
            }}>
              {/* Waveform */}
              <svg width={contentWidth} height={ROW_H} style={{ display: 'block' }}>
                {waveformPeaks.length > 0 ? (
                  waveformPeaks.map((peak, i) => {
                    const barW = contentWidth / waveformPeaks.length;
                    const x = i * barW;
                    const h = peak * (ROW_H - 16);
                    return (
                      <rect
                        key={i}
                        x={x}
                        y={(ROW_H - h) / 2}
                        width={Math.max(barW - 0.5, 1)}
                        height={h}
                        fill="var(--waveform-color)"
                      />
                    );
                  })
                ) : (
                  <text x={12} y={ROW_H / 2 + 4} fill="var(--text-dim)" fontSize="9">
                    Load audio to render waveform
                  </text>
                )}
              </svg>

              {/* Transient markers */}
              {transientMarkers.map((t, i) => (
                <div key={`tr-${i}-${t}`} style={{
                  position: 'absolute',
                  left: t * pixelsPerSecond,
                  top: 0,
                  width: 1,
                  height: '100%',
                  backgroundColor: 'var(--transient-color)',
                  opacity: 0.7,
                  pointerEvents: 'none',
                }} title={`Transient @ ${t.toFixed(2)}s`} />
              ))}

              {/* Lyric tokens */}
              {lyricSegments.map((seg) => (
                <div key={seg.id} style={{
                  position: 'absolute',
                  left: seg.start * pixelsPerSecond,
                  top: ROW_H - 18,
                  maxWidth: Math.max((seg.end - seg.start) * pixelsPerSecond, 40),
                  backgroundColor: 'rgba(124, 58, 237, 0.3)',
                  border: `1px solid var(--lyric-color)`,
                  borderRadius: 2,
                  padding: '1px 4px',
                  fontSize: 8,
                  color: '#c4b5fd',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  pointerEvents: 'none',
                }} title={seg.text}>
                  {seg.text}
                </div>
              ))}
            </div>
          </div>

          {/* TRACK 3 — GLOBAL FX / SECTION MARKERS */}
          <div style={{ display: 'flex', height: ROW_H + 8 }}>
            <div style={{
              width: TRACK_LABEL_W,
              flexShrink: 0,
              padding: '6px 8px',
              backgroundColor: 'var(--bg-track-label)',
              borderRight: `1px solid var(--border-mid)`,
              color: 'var(--automation-color)',
              fontWeight: 600,
              fontSize: 9,
              lineHeight: 1.4,
            }}>
              T3 · FX<br />
              <span style={{ color: 'var(--text-dim)', fontWeight: 400 }}>MARKERS</span>
              <div style={{ marginTop: 4, fontSize: 7, color: 'var(--text-dim)', lineHeight: 1.3 }}>
                click + add
              </div>
            </div>

            <div
              style={{
                position: 'relative',
                width: contentWidth,
                height: '100%',
                cursor: 'crosshair',
                backgroundColor: 'var(--bg-track)',
                overflow: 'hidden',
              }}
              onClick={(e) => {
                e.stopPropagation();
                const rect = e.currentTarget.getBoundingClientRect();
                const x    = e.clientX - rect.left;
                const t    = Math.max(0, x / pixelsPerSecond);
                onAddFxMarker?.(t);
              }}
              title="Click to add FX section marker"
            >
              {/* Existing FX marker zones */}
              {fxMarkers.map((m) => {
                const left   = m.time * pixelsPerSecond;
                const width  = Math.max((m.duration || 8) * pixelsPerSecond, 40);
                const ZONE_COLORS = {
                  INTRO:    'rgba(0,229,255,0.18)',
                  'CUT-UP': 'rgba(255,107,0,0.20)',
                  BRIDGE:   'rgba(167,139,250,0.20)',
                  DROP:     'rgba(239,68,68,0.20)',
                  OUTRO:    'rgba(0,229,255,0.10)',
                };
                const BORDER_COLORS = {
                  INTRO:    'var(--accent-blue)',
                  'CUT-UP': 'var(--accent-orange)',
                  BRIDGE:   'var(--automation-color)',
                  DROP:     '#ef4444',
                  OUTRO:    'var(--accent-blue)',
                };
                const bg     = ZONE_COLORS[m.label]    || 'rgba(167,139,250,0.15)';
                const border = BORDER_COLORS[m.label]  || 'var(--automation-color)';
                const LABELS = ['INTRO','CUT-UP','BRIDGE','DROP','OUTRO'];

                return (
                  <div
                    key={m.id}
                    style={{
                      position: 'absolute',
                      left,
                      top: 2,
                      width,
                      height: ROW_H + 2,
                      backgroundColor: bg,
                      border: `1px solid ${border}`,
                      borderRadius: 3,
                      overflow: 'hidden',
                      display: 'flex',
                      flexDirection: 'column',
                      padding: '2px 4px',
                      boxSizing: 'border-box',
                      zIndex: 3,
                      cursor: 'default',
                    }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    {/* Label row */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
                      <span style={{
                        fontSize: 8,
                        fontWeight: 700,
                        color: border,
                        textShadow: `0 0 6px ${border}`,
                        letterSpacing: 0.5,
                        flexGrow: 1,
                        cursor: 'pointer',
                      }}
                        title="Click to cycle label"
                        onClick={(e) => {
                          e.stopPropagation();
                          const idx = LABELS.indexOf(m.label ?? 'INTRO');
                          const next = LABELS[(idx + 1) % LABELS.length];
                          onAddFxMarker && onAddFxMarker(m.time, { ...m, label: next });
                          onRemoveFxMarker?.(m.id);
                        }}
                      >
                        {m.label || 'INTRO'}
                      </span>
                      <button
                        onClick={(e) => { e.stopPropagation(); onRemoveFxMarker?.(m.id); }}
                        style={{
                          background: 'none', border: 'none', color: 'var(--text-dim)',
                          fontSize: 9, cursor: 'pointer', padding: 0, lineHeight: 1,
                          flexShrink: 0,
                        }}
                        title="Remove marker"
                      >
                        ×
                      </button>
                    </div>

                    {/* Intensity bar — click to set 0%–150%, scroll to fine-tune */}
                    <div style={{
                      flex: 1,
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'flex-end',
                    }}>
                      <div
                        style={{
                          width: '100%',
                          height: 8,
                          background: 'var(--border-bright)',
                          borderRadius: 2,
                          overflow: 'hidden',
                          cursor: 'ew-resize',
                          position: 'relative',
                        }}
                        title={`FX intensity ×${(m.intensity ?? 1.0).toFixed(2)} — click to set, scroll to adjust`}
                        onClick={(e) => {
                          e.stopPropagation();
                          const rect = e.currentTarget.getBoundingClientRect();
                          // Map 0–width to 0.0–1.5 (allows 50% boost)
                          const raw = (e.clientX - rect.left) / rect.width * 1.5;
                          onUpdateFxMarker?.(m.id, Math.max(0, Math.min(1.5, parseFloat(raw.toFixed(2)))));
                        }}
                        onWheel={(e) => {
                          e.stopPropagation();
                          e.preventDefault();
                          const delta = e.deltaY < 0 ? 0.05 : -0.05;
                          const next = Math.max(0, Math.min(1.5, (m.intensity ?? 1.0) + delta));
                          onUpdateFxMarker?.(m.id, parseFloat(next.toFixed(2)));
                        }}
                      >
                        <div style={{
                          height: '100%',
                          // 100% = intensity 1.0; allow bar to fill to 1.5
                          width: `${(((m.intensity ?? 1.0) / 1.5) * 100).toFixed(1)}%`,
                          background: border,
                          borderRadius: 2,
                          opacity: 0.85,
                          transition: 'width 0.08s ease',
                        }} />
                        {/* 100% marker line */}
                        <div style={{
                          position: 'absolute',
                          top: 0, bottom: 0,
                          left: '66.7%',
                          width: 1,
                          background: 'rgba(255,255,255,0.2)',
                          pointerEvents: 'none',
                        }} />
                      </div>
                      <span style={{ fontSize: 7, color: 'var(--text-dim)', marginTop: 1 }}>
                        FX ×{(m.intensity ?? 1.0).toFixed(2)}
                        {(m.intensity ?? 1.0) > 1.0 && (
                          <span style={{ color: 'var(--accent-orange)', marginLeft: 3 }}>▲ BOOST</span>
                        )}
                        {(m.intensity ?? 1.0) < 0.1 && (
                          <span style={{ color: 'var(--accent-blue)', marginLeft: 3 }}>MUTED</span>
                        )}
                      </span>
                    </div>
                  </div>
                );
              })}

              {fxMarkers.length === 0 && (
                <span style={{
                  position: 'absolute',
                  top: '50%',
                  left: 12,
                  transform: 'translateY(-50%)',
                  opacity: 0.3,
                  fontSize: 8,
                  pointerEvents: 'none',
                }}>
                  click to drop FX section marker (INTRO / CUT-UP / BRIDGE / DROP / OUTRO)
                </span>
              )}
            </div>
          </div>

          {/* TRACK 4 — MODULAR CSS EFFECT AUTOMATION LANE */}
          <TimelineAutomationLane
            contentWidth={contentWidth}
            pixelsPerSecond={pixelsPerSecond}
            currentTime={currentTime}
            duration={timelineDuration}
            keyframes={automationKeyframes}
            onAddKeyframe={onAddAutomationKeyframe}
            onUpdateKeyframe={onUpdateAutomationKeyframe}
            onRemoveKeyframe={onRemoveAutomationKeyframe}
            selectedEffect={selectedCssEffect}
            onSelectEffect={onSelectCssEffect}
            isLooping={isLooping}
            loopStart={loopStart}
            loopEnd={loopEnd}
            onUpdateLoop={onUpdateLoop}
          />


          {/* PLAYHEAD */}
          <div
            className={isPlaying ? 'playhead-active' : ''}
            style={{
              position: 'absolute',
              top: 0,
              left: playheadLeft,
              width: 2,
              height: '100%',
              backgroundColor: 'var(--playhead-color)',
              boxShadow: `0 0 6px var(--playhead-glow)`,
              pointerEvents: 'none',
              zIndex: 20,
            }}
          />

          {/* BLADE CURSOR LINE */}
          {activeTool === 'blade' && bladeX != null && (
            <div className="blade-cursor-line" style={{ left: bladeX }} />
          )}

        </div>
      </div>
    </div>
  );
}
