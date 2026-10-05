// src/components/InterZoneFrame.jsx
// Phase 1 fixes: cosmic bg sits on outer frame (never inside #main-viewport)
// Interzone Drive-In banner header, ThemeProvider removed (now in FXConsole)

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { InterzoneBackground } from './InterzoneBackground.jsx';
import { isElectronEnvironment } from '../utils/exportPipeline';
import { DESKTOP_EXE_DOWNLOAD_URL } from '../constants/urls';

const TIMELINE_MIN_H = 100;
const TIMELINE_MAX_H = 600;
const TIMELINE_DEFAULT_H = 240;
const TIMELINE_COLLAPSED_H = 30;

export function InterzoneFrame({ children, timeline, transportBar, isPlaying, trackTitle, audioSignals, moonVariant, moonFilter, rubeStage = 0, rubeVisuals = {}, selectedRube = 'none', onToggleCinema = null, cinemaMode = false }) {
  const [timelineHeight, setTimelineHeight] = useState(TIMELINE_DEFAULT_H);

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showCinemaHud, setShowCinemaHud] = useState(true);
  const cinemaTimerRef = useRef(null);
  const viewportRef = useRef(null);
  const dragStateRef = useRef(null);
  const frameRef = useRef(null);

  // Auto-hide Cinema exit button and cursor after 2.5s of no mouse movement
  useEffect(() => {
    if (!cinemaMode) {
      setShowCinemaHud(true);
      if (cinemaTimerRef.current) clearTimeout(cinemaTimerRef.current);
      return;
    }

    // Show on enter, then fade out
    setShowCinemaHud(true);
    cinemaTimerRef.current = setTimeout(() => {
      setShowCinemaHud(false);
    }, 2500);

    const onMouseMove = () => {
      setShowCinemaHud(true);
      if (cinemaTimerRef.current) clearTimeout(cinemaTimerRef.current);
      cinemaTimerRef.current = setTimeout(() => {
        setShowCinemaHud(false);
      }, 2500);
    };

    window.addEventListener('mousemove', onMouseMove);
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      if (cinemaTimerRef.current) clearTimeout(cinemaTimerRef.current);
    };
  }, [cinemaMode]);

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

  // ── Fullscreen toggle ──
  const handleToggleFullscreen = useCallback(() => {
    const el = viewportRef.current || document.getElementById('main-viewport');
    if (!el) return;
    if (!document.fullscreenElement) {
      el.requestFullscreen().catch((err) => {
        console.warn('[Fullscreen] Failed to enter fullscreen:', err);
      });
    } else {
      document.exitFullscreen();
    }
  }, []);

  // Track fullscreen state changes (user may press Escape to exit)
  useEffect(() => {
    const onChange = () => setIsFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener('fullscreenchange', onChange);
    return () => document.removeEventListener('fullscreenchange', onChange);
  }, []);

  // 'F' key = fullscreen toggle
  useEffect(() => {
    const onKey = (e) => {
      const tag = document.activeElement?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
      if (e.key === 'f' || e.key === 'F') {
        e.preventDefault();
        handleToggleFullscreen();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [handleToggleFullscreen]);

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
        position: cinemaMode ? 'fixed' : 'relative',
        inset: cinemaMode ? 0 : undefined,
        width: cinemaMode ? '100vw' : '100%',
        height: cinemaMode ? '100vh' : '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: cinemaMode ? 'center' : 'flex-start',
        backgroundColor: '#000000',
        overflow: 'hidden',
        padding: cinemaMode ? 0 : '4px 12px 0',
        minWidth: 0,
        zIndex: cinemaMode ? 99999 : 1,
      }}
    >
      {/* ── COSMIC BACKGROUND — z-index 0, strictly OUTSIDE #main-viewport ── */}
      {!cinemaMode && (
        <InterzoneBackground
          era="default"
          audioSignals={isPlaying ? audioSignals : null}
          isPlaying={isPlaying}
          moonVariant={moonVariant || 'classic_halo'}
          moonFilter={moonFilter || 'silent_silver'}
        />
      )}

      {/* ── UPPER-LEFT STARFIELD: MÉLIÈS MOON DESKTOP APP LINK ── */}
      {!cinemaMode && !isElectronEnvironment() && (
        <a
          href={DESKTOP_EXE_DOWNLOAD_URL}
          target="_blank"
          rel="noopener noreferrer"
          title="Download Standalone Windows Desktop App (.exe / .zip)"
          style={{
            position: 'absolute',
            top: 10,
            left: 14,
            zIndex: 35,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textDecoration: 'none',
            cursor: 'pointer',
            transition: 'transform 0.22s cubic-bezier(0.34, 1.56, 0.64, 1), filter 0.22s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.08)';
            e.currentTarget.style.filter = 'drop-shadow(0 0 12px rgba(255, 180, 0, 0.9))';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1.0)';
            e.currentTarget.style.filter = 'drop-shadow(0 0 6px rgba(255, 180, 0, 0.45))';
          }}
        >
          {/* Circular Cropped Video — scale(1.24) eliminates outer circular outline */}
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: '50%',
              overflow: 'hidden',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: '#000',
              boxShadow: '0 0 12px rgba(255, 180, 0, 0.5), inset 0 0 8px rgba(0,0,0,0.85)',
              border: '1px solid rgba(255, 180, 0, 0.4)',
            }}
          >
            <video
              src="./assets-bg/moon_trip-round.webm"
              autoPlay
              loop
              muted
              playsInline
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                transform: 'scale(1.24)', // Zoom in 24% to push the outer border ring outside the circular crop!
                display: 'block',
              }}
            />
          </div>

          {/* Small 'get desktop app' label underneath */}
          <span
            style={{
              marginTop: 4,
              fontFamily: "'Syncopate', var(--font-mono, monospace)",
              fontSize: 7.5,
              fontWeight: 800,
              letterSpacing: '0.8px',
              textTransform: 'uppercase',
              color: 'var(--accent-orange, #ff6b00)',
              textShadow: '0 0 8px var(--accent-orange-glow, rgba(255,107,0,0.85)), 0 1px 3px #000',
              whiteSpace: 'nowrap',
            }}
          >
            GET DESKTOP APP
          </span>
        </a>
      )}

      {/* ── INTERZONE DRIVE-IN BANNER ── */}
      {!cinemaMode && (
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
      )}

      {/* ── MAIN VIEWPORT (#main-viewport) ── */}
      {/* isolation: isolate + contain: strict prevents cosmic background bleed
          into export captures and preview compositing */}
      <div style={{
        position: 'relative',
        zIndex: 10,
        flex: 1,
        width: '100%',
        height: '100%',
        maxWidth: cinemaMode ? '100vw' : 980,
        minHeight: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <div
          id="main-viewport"
          ref={viewportRef}
          style={{
            width: '100%',
            height: '100%',
            maxHeight: cinemaMode
              ? '100vh'
              : (timeline
                ? `calc(100vh - 90px - ${effectiveTimelineH + 14}px)`
                : 'calc(100vh - 90px)'),
            aspectRatio: cinemaMode ? undefined : '16/9',
            border: cinemaMode ? 'none' : '6px solid var(--border-bright)',
            backgroundColor: '#000000',
            boxShadow: cinemaMode ? 'none' : '0 0 40px rgba(0,0,0,0.98), inset 0 0 20px rgba(0,0,0,0.85)',
            overflow: 'hidden',
            borderRadius: cinemaMode ? 0 : 3,
            position: 'relative',
            /* Viewport isolation — exports/previews won't capture ambient background */
            isolation: 'isolate',
            contain: 'strict',
            cursor: cinemaMode && !showCinemaHud ? 'none' : 'default',
          }}
        >
          {children}

          {/* Fullscreen / Cinema Exit HUD Button */}
          {cinemaMode ? (
            <div
              style={{
                position: 'absolute',
                top: 14,
                right: 14,
                zIndex: 9999,
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                opacity: showCinemaHud ? 1 : 0,
                pointerEvents: showCinemaHud ? 'auto' : 'none',
                transition: 'opacity 0.4s ease-in-out',
              }}
              onMouseEnter={() => {
                if (cinemaTimerRef.current) clearTimeout(cinemaTimerRef.current);
              }}
              onMouseLeave={() => {
                cinemaTimerRef.current = setTimeout(() => setShowCinemaHud(false), 2000);
              }}
            >
              <button
                onClick={onToggleCinema}
                title="Exit Cinema Fullscreen Mode (Shortcut: C or ESC)"
                style={{
                  background: 'rgba(0,0,0,0.8)',
                  border: '1px solid var(--accent-orange, #FF6B00)',
                  borderRadius: 4,
                  color: 'var(--accent-orange, #FF6B00)',
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: 1,
                  padding: '7px 14px',
                  cursor: 'pointer',
                  backdropFilter: 'blur(8px)',
                  fontFamily: 'var(--font-mono, monospace)',
                  boxShadow: '0 0 16px rgba(255,107,0,0.4)',
                  transition: 'all 0.15s ease-in-out',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--accent-orange, #FF6B00)';
                  e.currentTarget.style.color = '#000';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.8)';
                  e.currentTarget.style.color = 'var(--accent-orange, #FF6B00)';
                }}
              >
                ✕ EXIT CINEMA MODE [C / ESC]
              </button>
            </div>
          ) : (
            /* Fullscreen toggle button — top-right, appears on hover */
            <button
              onClick={handleToggleFullscreen}
              title={isFullscreen ? 'Exit fullscreen (F)' : 'Fullscreen (F)'}
              style={{
                position: 'absolute',
                top: 8,
                right: 8,
                zIndex: 20,
                background: 'rgba(0,0,0,0.6)',
                border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: 4,
                color: '#fff',
                fontSize: 13,
                lineHeight: 1,
                padding: '5px 8px',
                cursor: 'pointer',
                opacity: 0,
                transition: 'opacity 0.2s',
                backdropFilter: 'blur(4px)',
                fontFamily: 'monospace',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.9'; }}
              onMouseLeave={(e) => { e.currentTarget.style.opacity = '0'; }}
            >
              {isFullscreen ? '✕ EXIT' : '⛶ FS'}
            </button>
          )}
        </div>
      </div>

      {/* ── HARDWARE TRANSPORT BAR ── */}
      {!cinemaMode && transportBar && (
        <div style={{ width: '100%', maxWidth: 980, flexShrink: 0, position: 'relative', zIndex: 100, pointerEvents: 'auto', marginTop: 4 }}>
          {transportBar}
        </div>
      )}

      {/* ── RUBE GOLDBERG CHAIN STRIP ── */}
      {!cinemaMode && selectedRube !== 'none' && (
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
        #main-viewport:fullscreen {
          width: 100vw !important;
          height: 100vh !important;
          max-height: 100vh !important;
          border: none !important;
          border-radius: 0 !important;
          aspect-ratio: auto !important;
        }
        #main-viewport:-webkit-full-screen {
          width: 100vw !important;
          height: 100vh !important;
          max-height: 100vh !important;
          border: none !important;
          border-radius: 0 !important;
        }
      `}</style>

      {/* ── TIMELINE PANE (resizable + collapsible) ── */}
      {!cinemaMode && timeline && (
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
      {!cinemaMode && trackTitle && (
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
