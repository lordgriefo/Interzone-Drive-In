// src/components/InterZoneFrame.jsx
// Phase 1 fixes: cosmic bg sits on outer frame (never inside #main-viewport)
// Interzone Drive-In banner header, ThemeProvider removed (now in FXConsole)

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { InterzoneBackground } from './InterzoneBackground.jsx';

const TIMELINE_MIN_H = 100;
const TIMELINE_MAX_H = 600;
const TIMELINE_DEFAULT_H = 240;
const TIMELINE_COLLAPSED_H = 30;

export function InterzoneFrame({ children, timeline, transportBar, isPlaying, trackTitle, audioSignals, moonVariant, moonFilter, rubeStage = 0, rubeVisuals = {}, selectedRube = 'none' }) {
  const [timelineHeight, setTimelineHeight] = useState(TIMELINE_DEFAULT_H);

  const [isCollapsed, setIsCollapsed] = useState(false);
  const dragStateRef = useRef(null);
  const frameRef = useRef(null);

  // ── 'T' key toggles collapse ──
  useEffect(() => {
    const onKey = (e) => {
      // Don't fire if focus is inside an input/select/textarea
      const tag = document.activeElement?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
      if (e.key === 't' || e.key === 'T') {
        e.preventDefault();
        setIsCollapsed((v) => !v);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // ── Drag-handle resize ──
  const handleResizeMouseDown = useCallback((e) => {
    if (isCollapsed) return;
    e.preventDefault();
    dragStateRef.current = { startY: e.clientY, startH: timelineHeight };

    const onMove = (ev) => {
      if (!dragStateRef.current) return;
      // Dragging UP increases height (delta is negative → larger timeline)
      const delta = dragStateRef.current.startY - ev.clientY;
      const newH = Math.max(
        TIMELINE_MIN_H,
        Math.min(TIMELINE_MAX_H, dragStateRef.current.startH + delta)
      );
      setTimelineHeight(newH);
    };

    const onUp = () => {
      dragStateRef.current = null;
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  }, [isCollapsed, timelineHeight]);

  const effectiveTimelineH = isCollapsed ? TIMELINE_COLLAPSED_H : timelineHeight;

  return (
    <div
      ref={frameRef}
      style={{
        flex: 1,
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-start',
        backgroundColor: 'var(--bg-primary)',
        overflow: 'hidden',
        padding: '4px 12px 0',
        minWidth: 0,
        zIndex: 1,
      }}
    >
      {/* ── COSMIC BACKGROUND — z-index 0, strictly OUTSIDE #main-viewport ── */}
      <InterzoneBackground
        era="default"
        audioSignals={isPlaying ? audioSignals : null}
        isPlaying={isPlaying}
        moonVariant={moonVariant || 'classic_halo'}
        moonFilter={moonFilter || 'silent_silver'}
      />
      {/* ── INTERZONE DRIVE-IN BANNER ── */}
      <div style={{
        position: 'relative',
        zIndex: 10,
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 5,
        flexShrink: 0,
        padding: '4px 0 6px',
        borderBottom: '1px solid var(--border-dim)',
        gap: 14,
      }}>
        {/* Left logo image */}
        <img
          src="./assets-bg/iz-midnight/iz-drv-in_midnight-010.jpg"
          alt="Interzone Drive-In"
          style={{
            height: 42,
            width: 'auto',
            objectFit: 'contain',
            borderRadius: 3,
            opacity: 0.88,
            boxShadow: '0 0 10px var(--accent-blue-glow), 0 0 2px rgba(0,229,255,0.4)',
            border: '1px solid rgba(0,229,255,0.25)',
          }}
        />

        {/* Main banner */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          lineHeight: 1,
        }}>
          <h1 style={{
            margin: 0,
            fontFamily: "'Bebas Neue', var(--font-mono)",
            fontSize: 'clamp(1.2rem, 2.6vw, 1.65rem)',
            letterSpacing: '10px',
            color: 'var(--accent-orange)',
            textShadow: '0 0 18px var(--accent-orange-glow), 0 0 36px rgba(255,107,0,0.22)',
            textTransform: 'uppercase',
            fontWeight: 'normal',
          }}>
            INTERZONE DRIVE-IN
          </h1>
          <div style={{
            fontFamily: "'Syncopate', var(--font-mono)",
            fontSize: 'clamp(0.42rem, 0.95vw, 0.56rem)',
            letterSpacing: '6px',
            color: 'var(--accent-blue)',
            textShadow: '0 0 10px var(--accent-blue-glow)',
            marginTop: 4,
            textTransform: 'uppercase',
            fontWeight: 700,
          }}>
            STRANGELET · KINET-O-CHOP
          </div>
        </div>

        {/* Right logo image */}
        <img
          src="./assets-bg/iz-midnight/iz-drv-in_midnight-010.jpg"
          alt="Interzone Drive-In"
          style={{
            height: 42,
            width: 'auto',
            objectFit: 'contain',
            borderRadius: 3,
            opacity: 0.88,
            boxShadow: '0 0 10px var(--accent-blue-glow), 0 0 2px rgba(0,229,255,0.4)',
            border: '1px solid rgba(0,229,255,0.25)',
            transform: 'scaleX(-1)',
          }}
        />
      </div>

      {/* ── MAIN VIEWPORT (#main-viewport) ── */}
      {/* isolation: isolate + contain: strict prevents cosmic background bleed
          into export captures and preview compositing */}
      <div style={{
        position: 'relative',
        zIndex: 10,
        flex: 1,
        width: '100%',
        maxWidth: 980,
        minHeight: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <div
          id="main-viewport"
          style={{
            width: '100%',
            height: '100%',
            maxHeight: timeline
              ? `calc(100vh - 90px - ${effectiveTimelineH + 14}px)`
              : 'calc(100vh - 90px)',
            aspectRatio: '16/9',
            border: '6px solid var(--border-bright)',
            backgroundColor: '#000000',
            boxShadow: '0 0 40px rgba(0,0,0,0.98), inset 0 0 20px rgba(0,0,0,0.85)',
            overflow: 'hidden',
            borderRadius: 3,
            position: 'relative',
            /* Viewport isolation — exports/previews won't capture ambient background */
            isolation: 'isolate',
            contain: 'strict',
          }}
        >
          {children}
          {/* Badge REMOVED per Phase 1 spec (was: U-DO-U CERTIFIED / MAKE COOL STUFF) */}
        </div>
      </div>

      {/* ── HARDWARE TRANSPORT BAR ── */}
      {transportBar && (
        <div style={{ width: '100%', maxWidth: 980, flexShrink: 0, position: 'relative', zIndex: 100, pointerEvents: 'auto', marginTop: 4 }}>
          {transportBar}
        </div>
      )}

      {/* ── RUBE GOLDBERG CHAIN STRIP ── */}
      {selectedRube !== 'none' && (
        <div style={{
          width: '100%',
          maxWidth: 980,
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          padding: '4px 6px',
          backgroundColor: 'rgba(0,0,0,0.55)',
          border: '1px solid var(--border-dim)',
          borderRadius: 4,
          marginTop: 3,
          zIndex: 100,
          position: 'relative',
        }}>
          {/* Label */}
          <div style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 8,
            letterSpacing: 2,
            color: 'var(--accent-orange)',
            textTransform: 'uppercase',
            flexShrink: 0,
            marginRight: 4,
            opacity: 0.8,
          }}>RUBE</div>

          {/* 8 stage nodes */}
          {[
            { idx: 0, label: 'IDLE',    icon: '○' },
            { idx: 1, label: 'PNDLM',   icon: '↻' },
            { idx: 2, label: 'DOMINO',  icon: '▦' },
            { idx: 3, label: 'JITTER',  icon: '⋯' },
            { idx: 4, label: 'GRVTY',   icon: '↓' },
            { idx: 5, label: 'PRISM',   icon: '◈' },
            { idx: 6, label: 'ZRECOIL', icon: '⟡' },
            { idx: 7, label: 'RESET',   icon: '⚡' },
          ].map(({ idx, label, icon }, i) => {
            const isActive  = rubeStage === idx;
            const isPast    = rubeStage > idx;
            const isNext    = rubeStage === idx - 1;

            // Color coding
            let nodeColor = 'rgba(255,255,255,0.1)';
            let textColor = 'rgba(255,255,255,0.25)';
            let glow = 'none';
            if (isActive) {
              nodeColor = idx === 7 ? '#ff4444' : idx >= 5 ? '#a855f7' : '#FF6B00';
              textColor = '#fff';
              glow = `0 0 8px ${nodeColor}, 0 0 16px ${nodeColor}`;
            } else if (isPast) {
              nodeColor = 'rgba(0,229,255,0.3)';
              textColor = 'rgba(0,229,255,0.7)';
            } else if (isNext) {
              nodeColor = 'rgba(255,107,0,0.15)';
              textColor = 'rgba(255,107,0,0.5)';
            }

            return (
              <React.Fragment key={idx}>
                {/* Connector line between nodes */}
                {i > 0 && (
                  <div style={{
                    flex: 1,
                    height: 1,
                    backgroundColor: isPast || isActive
                      ? 'rgba(0,229,255,0.5)'
                      : 'rgba(255,255,255,0.08)',
                    transition: 'background-color 0.3s ease',
                  }} />
                )}
                {/* Stage node */}
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 1,
                  flexShrink: 0,
                }}>
                  <div style={{
                    width: isActive ? 28 : 22,
                    height: isActive ? 28 : 22,
                    borderRadius: '50%',
                    backgroundColor: nodeColor,
                    border: `1px solid ${isActive ? nodeColor : 'rgba(255,255,255,0.12)'}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: isActive ? 12 : 10,
                    color: textColor,
                    boxShadow: glow,
                    transition: 'all 0.25s ease',
                    cursor: 'default',
                    fontFamily: 'var(--font-mono)',
                    // Pulse animation for active node
                    animation: isActive ? 'rube-pulse 0.6s ease-in-out infinite alternate' : 'none',
                  }}>
                    {icon}
                  </div>
                  <div style={{
                    fontSize: 6,
                    fontFamily: 'var(--font-mono)',
                    letterSpacing: 0.5,
                    color: textColor,
                    transition: 'color 0.25s ease',
                    userSelect: 'none',
                  }}>
                    {label}
                  </div>
                </div>
              </React.Fragment>
            );
          })}

          {/* Active effect badge derived from stage */}
          {rubeStage > 0 && (
            <div style={{
              flexShrink: 0,
              marginLeft: 6,
              fontSize: 7,
              fontFamily: 'var(--font-mono)',
              letterSpacing: 1,
              color: rubeStage === 7 ? '#ff4444' : rubeStage >= 5 ? '#a855f7' : '#FF6B00',
              textTransform: 'uppercase',
              padding: '2px 5px',
              border: `1px solid currentColor`,
              borderRadius: 2,
              opacity: 0.9,
            }}>
              {['','FLASH','SPLIT','JITTER','DROP','PRISM','ERA-SHIFT','BURST'][rubeStage] || ''}
            </div>
          )}
        </div>
      )}

      {/* Keyframe for rube node pulse — injected once into document head */}
      <style>{`
        @keyframes rube-pulse {
          from { transform: scale(1.0); opacity: 1; }
          to   { transform: scale(1.1); opacity: 0.8; }
        }
      `}</style>

      {/* ── TIMELINE PANE (resizable + collapsible) ── */}
      {timeline && (
        <div
          style={{
            width: '100%',
            maxWidth: 980,
            flexShrink: 0,
            zIndex: 10,
            marginTop: 6,
          }}
        >
          {/* ─ DRAG HANDLE ─ */}
          <div
            onMouseDown={handleResizeMouseDown}
            title={isCollapsed ? 'Expand timeline (T)' : 'Drag to resize · T to collapse'}
            style={{
              height: 6,
              width: '100%',
              cursor: isCollapsed ? 'default' : 'ns-resize',
              backgroundColor: 'var(--handle-color)',
              borderRadius: '3px 3px 0 0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'background-color 0.15s',
              userSelect: 'none',
            }}
            onMouseEnter={(e) => {
              if (!isCollapsed) e.currentTarget.style.backgroundColor = 'var(--handle-hover)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--handle-color)';
            }}
          >
            {/* Grip dots */}
            {!isCollapsed && (
              <div style={{
                display: 'flex',
                gap: 3,
                pointerEvents: 'none',
              }}>
                {[0,1,2,3,4].map(i => (
                  <div key={i} style={{
                    width: 2,
                    height: 2,
                    borderRadius: '50%',
                    background: 'var(--border-bright)',
                  }} />
                ))}
              </div>
            )}
          </div>

          {/* ─ TIMELINE CONTENT ─ */}
          <div
            className={`timeline-pane${isCollapsed ? ' collapsed' : ''}`}
            style={{ height: effectiveTimelineH, overflow: 'hidden' }}
          >
            {/* Pass isCollapsed to timeline child */}
            {React.cloneElement(timeline, { isCollapsed })}
          </div>
        </div>
      )}

      {/* ── NOW PLAYING label ── */}
      {trackTitle && (
        <div style={{
          position: 'relative',
          zIndex: 10,
          marginTop: 4,
          marginBottom: 4,
          color: 'var(--accent-blue)',
          fontFamily: "'Syncopate', var(--font-mono)",
          fontWeight: 700,
          fontSize: 9,
          letterSpacing: '3px',
          flexShrink: 0,
          textShadow: '0 0 6px var(--accent-blue-glow)',
          textTransform: 'uppercase',
        }}>
          {isPlaying ? '▶' : '⏸'} NOW PLAYING: {trackTitle}
        </div>
      )}
    </div>
  );
}
