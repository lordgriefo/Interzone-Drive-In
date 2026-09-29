import React, { useRef, useCallback, useMemo, useState, useEffect } from 'react';
import { interpolateAutomation } from '../utils/timelineCrossfade';
import { TimelineAutomationLane } from './TimelineAutomationLane';

const TRACK_LABEL_W = 108;
const ROW_H = 56;

function formatTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  const cs = Math.floor((seconds % 1) * 10);
  return `${m}:${s.toString().padStart(2, '0')}.${cs}`;
}

// ── Tool definitions ──
const TOOLS = [
  { id: 'select', label: '↖',  title: 'Select / Move  (V)' },
  { id: 'blade',  label: '✂',  title: 'Blade / Split  (S)' },
  { id: 'reverse',label: '⇄',  title: 'Reverse Clip  (R)' },
  { id: 'dupe',   label: '⧉',  title: 'Duplicate Clip  (Ctrl+D)' },
];

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
}) {

  const scrollRef   = useRef(null);
  const dragRef     = useRef(null);
  const [activeTool, setActiveTool] = useState('select');
  const [bladeX, setBladeX] = useState(null); // px relative to scroll content

  const timelineDuration = useMemo(() => {
    const clipEnd = videoClips.reduce((max, c) => Math.max(max, c.startTime + c.duration), 0);
    return Math.max(duration, clipEnd, 30);
  }, [duration, videoClips]);

  const pixelsPerSecond = 48;
  const contentWidth = timelineDuration * pixelsPerSecond;

  const assetMap = useMemo(() => {
    const map = {};
    assets.forEach((a) => { map[a.id] = a; });
    return map;
  }, [assets]);

  // ── Clip drag / alt+drag duplicate ──
  const handleClipMouseDown = useCallback((e, clip) => {
    if (activeTool === 'blade') return; // blade handled on ruler click
    e.preventDefault();
    e.stopPropagation();

    // Alt+Drag → duplicate
    if (e.altKey && onDuplicateClip) {
      onDuplicateClip(clip.id);
      return;
    }

    onSelectClip?.(clip.id);
    const startX   = e.clientX;
    const origStart = clip.startTime;
    dragRef.current = { clipId: clip.id, startX, origStart };

    const onMove = (ev) => {
      if (!dragRef.current) return;
      const deltaPx   = ev.clientX - dragRef.current.startX;
      const deltaTime = deltaPx / pixelsPerSecond;
      onUpdateClipStart?.(dragRef.current.clipId, dragRef.current.origStart + deltaTime);
    };
    const onUp = () => {
      dragRef.current = null;
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  }, [activeTool, onSelectClip, onUpdateClipStart, onDuplicateClip, pixelsPerSecond]);

  // ── Ruler / content area click ──
  const handleContentClick = useCallback((e) => {
    const rect = scrollRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = e.clientX - rect.left + (scrollRef.current?.scrollLeft || 0) - TRACK_LABEL_W;
    const time = Math.max(0, x / pixelsPerSecond);

    if (activeTool === 'blade' && selectedClipId) {
      onSplitClip?.(selectedClipId, time);
      return;
    }
    onSeek?.(time);
  }, [activeTool, selectedClipId, onSplitClip, onSeek, pixelsPerSecond]);

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

      {/* ── HEADER ROW ── */}
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
        {/* Tool strip */}
        <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
          <span style={{
            color: 'var(--accent-orange)',
            fontWeight: 600,
            letterSpacing: 1,
            fontSize: 9,
            marginRight: 6,
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
                padding: '2px 7px',
                fontSize: 12,
                cursor: 'pointer',
                fontFamily: 'inherit',
                transition: 'all 0.12s',
                boxShadow: activeTool === tool.id
                  ? '0 0 6px var(--accent-orange-glow)'
                  : 'none',
              }}
            >
              {tool.label}
            </button>
          ))}
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

      {/* ── SCROLLABLE CONTENT ── */}
      <div
        ref={scrollRef}
        className={activeTool === 'blade' ? 'tool-blade' : 'tool-select'}
        style={{ flex: 1, overflowX: 'auto', overflowY: 'hidden', position: 'relative' }}
        onClick={handleContentClick}
        onMouseMove={handleContentMouseMove}
        onMouseLeave={handleContentMouseLeave}
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

            <div style={{ position: 'relative', width: contentWidth, height: '100%', backgroundColor: 'var(--bg-track)' }}>
              {videoClips.map((clip) => {
                const asset = assetMap[clip.assetId];
                const left  = clip.startTime * pixelsPerSecond;
                const width = clip.duration  * pixelsPerSecond;
                const isSelected = clip.id === selectedClipId;

                return (
                  <div
                    key={clip.id}
                    onMouseDown={(e) => handleClipMouseDown(e, clip)}
                    onClick={(e) => { e.stopPropagation(); onSelectClip?.(clip.id); }}
                    style={{
                      position: 'absolute',
                      left,
                      top: 5,
                      width: Math.max(width, 24),
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
                    }}
                    title={`${asset?.name || 'clip'}${clip.reversed ? ' (reversed)' : ''} — drag to move, Alt+drag to dupe`}
                  >
                    {/* Thumbnail */}
                    {asset?.url && (
                      <img
                        src={asset.url}
                        alt=""
                        draggable={false}
                        style={{
                          position: 'absolute',
                          inset: 0,
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          opacity: 0.45,
                          pointerEvents: 'none',
                          transform: clip.reversed ? 'scaleX(-1)' : 'none',
                        }}
                      />
                    )}

                    {/* Reverse badge */}
                    {clip.reversed && (
                      <span style={{
                        position: 'absolute',
                        top: 2,
                        right: 3,
                        fontSize: 9,
                        color: 'var(--accent-blue)',
                        textShadow: '0 0 5px var(--accent-blue-glow)',
                        zIndex: 3,
                        pointerEvents: 'none',
                      }}>
                        ⇄
                      </span>
                    )}

                    {/* Clip name label */}
                    <span style={{
                      position: 'relative',
                      zIndex: 1,
                      background: 'rgba(0,0,0,0.75)',
                      color: isSelected ? 'var(--accent-orange)' : '#ddd',
                      fontSize: 8,
                      padding: '1px 3px',
                      borderRadius: 2,
                      maxWidth: '100%',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}>
                      {asset?.name?.slice(0, 12) || 'clip'}
                    </span>
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
                  Upload media → clips appear here · Alt+drag to duplicate · S to split
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
