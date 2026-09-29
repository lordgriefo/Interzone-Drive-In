// src/components/TimelineAutomationLane.jsx
// Phase 2: Interactive Timeline CSS Automation Lane & Visual Loop Boundary Overlay

import React, { useRef, useState, useCallback, useMemo } from 'react';
import { CSS_EFFECTS } from '../constants/cssEffectLibrary';
import { Sparkles, Plus, Trash2 } from 'lucide-react';

const TRACK_LABEL_W = 108;
const LANE_H = 68;

export function TimelineAutomationLane({
  contentWidth = 1000,
  pixelsPerSecond = 48,
  currentTime = 0,
  duration = 60,
  keyframes = [],
  onAddKeyframe = () => {},
  onUpdateKeyframe = () => {},
  onRemoveKeyframe = () => {},
  selectedEffect = 'solarize_invert',
  onSelectEffect = () => {},
  // Loop Region Boundary
  isLooping = false,
  loopStart = 0,
  loopEnd = 16,
  onUpdateLoop = () => {},
}) {
  const canvasRef = useRef(null);
  const dragHandleRef = useRef(null);
  const [hoveredKeyframeId, setHoveredKeyframeId] = useState(null);

  const activeEffect = useMemo(() => {
    return CSS_EFFECTS.find((e) => e.id === selectedEffect) || CSS_EFFECTS[0];
  }, [selectedEffect]);

  // Sort keyframes chronologically
  const sortedKeyframes = useMemo(() => {
    return [...keyframes].sort((a, b) => a.time - b.time);
  }, [keyframes]);

  // Handle canvas click to add keyframe
  const handleCanvasClick = (e) => {
    if (dragHandleRef.current) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    const time = Math.max(0, clickX / pixelsPerSecond);
    // Value: 1.0 at top (clickY = 0), 0.0 at bottom (clickY = LANE_H)
    const value = Math.max(0, Math.min(1, 1 - (clickY / LANE_H)));

    onAddKeyframe({
      id: `kf_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      time: parseFloat(time.toFixed(2)),
      value: parseFloat(value.toFixed(2)),
      effect: selectedEffect,
    });
  };

  // Drag keyframe
  const handleKeyframeMouseDown = (e, kf) => {
    e.stopPropagation();
    e.preventDefault();

    const startX = e.clientX;
    const startY = e.clientY;
    const origTime = kf.time;
    const origVal = kf.value;

    dragHandleRef.current = { id: kf.id };

    const onMove = (ev) => {
      const deltaX = ev.clientX - startX;
      const deltaY = ev.clientY - startY;

      const newTime = Math.max(0, origTime + (deltaX / pixelsPerSecond));
      const newVal = Math.max(0, Math.min(1, origVal - (deltaY / LANE_H)));

      onUpdateKeyframe(kf.id, {
        time: parseFloat(newTime.toFixed(2)),
        value: parseFloat(newVal.toFixed(2)),
      });
    };

    const onUp = () => {
      setTimeout(() => { dragHandleRef.current = null; }, 50);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  };

  // Drag Loop Boundary Handles (In / Out)
  const handleLoopBracketMouseDown = (e, type) => {
    e.stopPropagation();
    e.preventDefault();
    const startX = e.clientX;
    const origStart = loopStart;
    const origEnd = loopEnd;

    const onMove = (ev) => {
      const deltaSec = (ev.clientX - startX) / pixelsPerSecond;
      if (type === 'start') {
        const nextStart = Math.max(0, Math.min(origEnd - 0.5, origStart + deltaSec));
        onUpdateLoop(parseFloat(nextStart.toFixed(2)), loopEnd);
      } else {
        const nextEnd = Math.max(origStart + 0.5, Math.min(duration, origEnd + deltaSec));
        onUpdateLoop(loopStart, parseFloat(nextEnd.toFixed(2)));
      }
    };

    const onUp = () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  };

  // Generate SVG polyline path string
  const pathD = useMemo(() => {
    if (sortedKeyframes.length === 0) return '';
    const points = sortedKeyframes.map((kf) => {
      const x = kf.time * pixelsPerSecond;
      const y = (1 - kf.value) * (LANE_H - 12) + 6;
      return `${x},${y}`;
    });

    // Lead in from left edge
    const firstX = sortedKeyframes[0].time * pixelsPerSecond;
    const firstY = (1 - sortedKeyframes[0].value) * (LANE_H - 12) + 6;
    const prefix = firstX > 0 ? `0,${firstY} ` : '';

    // Lead out to right edge
    const lastX = sortedKeyframes[sortedKeyframes.length - 1].time * pixelsPerSecond;
    const lastY = (1 - sortedKeyframes[sortedKeyframes.length - 1].value) * (LANE_H - 12) + 6;
    const suffix = lastX < contentWidth ? ` ${contentWidth},${lastY}` : '';

    return `${prefix}${points.join(' ')}${suffix}`;
  }, [sortedKeyframes, pixelsPerSecond, contentWidth]);

  return (
    <div style={{ display: 'flex', height: LANE_H, borderTop: '1px solid var(--border-mid)', position: 'relative' }}>
      {/* ── TRACK LABEL & EFFECT SELECTOR ── */}
      <div
        style={{
          width: TRACK_LABEL_W,
          flexShrink: 0,
          padding: '6px 8px',
          backgroundColor: 'var(--bg-track-label)',
          borderRight: '1px solid var(--border-mid)',
          color: activeEffect.color,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          zIndex: 4,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <Sparkles size={10} color={activeEffect.color} />
          <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: 0.5 }}>T4 · CSS FX</span>
        </div>

        <select
          value={selectedEffect}
          onChange={(e) => onSelectEffect(e.target.value)}
          style={{
            width: '100%',
            backgroundColor: 'var(--bg-secondary)',
            border: `1px solid ${activeEffect.color}44`,
            color: activeEffect.color,
            borderRadius: 3,
            padding: '2px 4px',
            fontSize: 8,
            outline: 'none',
            cursor: 'pointer',
          }}
        >
          {CSS_EFFECTS.map((eff) => (
            <option key={eff.id} value={eff.id}>{eff.label}</option>
          ))}
        </select>

        <span style={{ fontSize: 7, color: 'var(--text-dim)' }}>
          Click curve to add point
        </span>
      </div>

      {/* ── AUTOMATION CURVE CANVAS & LOOP OVERLAY ── */}
      <div
        ref={canvasRef}
        onClick={handleCanvasClick}
        style={{
          position: 'relative',
          width: contentWidth,
          height: '100%',
          backgroundColor: 'rgba(10, 10, 16, 0.95)',
          cursor: 'crosshair',
          overflow: 'visible',
        }}
      >
        {/* Horizontal grid lines (0%, 50%, 100%) */}
        <div style={{ position: 'absolute', top: 6, left: 0, right: 0, height: 1, backgroundColor: 'rgba(255,255,255,0.06)' }} />
        <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: 1, backgroundColor: 'rgba(255,255,255,0.04)' }} />
        <div style={{ position: 'absolute', bottom: 6, left: 0, right: 0, height: 1, backgroundColor: 'rgba(255,255,255,0.06)' }} />

        {/* ── LOOP REGION BOUNDARY OVERLAY ── */}
        {isLooping && loopEnd > loopStart && (
          <div
            style={{
              position: 'absolute',
              top: 0,
              bottom: 0,
              left: loopStart * pixelsPerSecond,
              width: (loopEnd - loopStart) * pixelsPerSecond,
              backgroundColor: 'rgba(0, 229, 255, 0.08)',
              borderLeft: '2px solid var(--accent-blue)',
              borderRight: '2px solid var(--accent-blue)',
              pointerEvents: 'none',
              zIndex: 2,
            }}
          >
            {/* Left In-Point Handle */}
            <div
              onMouseDown={(e) => handleLoopBracketMouseDown(e, 'start')}
              style={{
                position: 'absolute',
                top: 0,
                left: -6,
                width: 12,
                height: 16,
                backgroundColor: 'var(--accent-blue)',
                color: '#000',
                fontSize: 8,
                fontWeight: 900,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '0 0 3px 0',
                cursor: 'ew-resize',
                pointerEvents: 'auto',
              }}
              title={`Loop In: ${loopStart.toFixed(2)}s (Drag to adjust)`}
            >
              [
            </div>

            {/* Right Out-Point Handle */}
            <div
              onMouseDown={(e) => handleLoopBracketMouseDown(e, 'end')}
              style={{
                position: 'absolute',
                top: 0,
                right: -6,
                width: 12,
                height: 16,
                backgroundColor: 'var(--accent-blue)',
                color: '#000',
                fontSize: 8,
                fontWeight: 900,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '0 0 0 3px',
                cursor: 'ew-resize',
                pointerEvents: 'auto',
              }}
              title={`Loop Out: ${loopEnd.toFixed(2)}s (Drag to adjust)`}
            >
              ]
            </div>
          </div>
        )}

        {/* SVG Automation Curve */}
        <svg
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: contentWidth,
            height: '100%',
            pointerEvents: 'none',
            zIndex: 3,
          }}
        >
          {pathD && (
            <>
              {/* Glow filter line */}
              <polyline
                points={pathD}
                fill="none"
                stroke={activeEffect.color}
                strokeWidth="4"
                strokeOpacity="0.25"
              />
              {/* Sharp curve line */}
              <polyline
                points={pathD}
                fill="none"
                stroke={activeEffect.color}
                strokeWidth="1.8"
              />
            </>
          )}
        </svg>

        {/* Draggable Keyframe Handle Nodes */}
        {sortedKeyframes.map((kf) => {
          const x = kf.time * pixelsPerSecond;
          const y = (1 - kf.value) * (LANE_H - 12) + 6;
          const isHovered = hoveredKeyframeId === kf.id;

          return (
            <div
              key={kf.id}
              onMouseDown={(e) => handleKeyframeMouseDown(e, kf)}
              onMouseEnter={() => setHoveredKeyframeId(kf.id)}
              onMouseLeave={() => setHoveredKeyframeId(null)}
              style={{
                position: 'absolute',
                left: x - 6,
                top: y - 6,
                width: 12,
                height: 12,
                borderRadius: '50%',
                backgroundColor: activeEffect.color,
                border: '2px solid #ffffff',
                boxShadow: `0 0 8px ${activeEffect.color}`,
                cursor: 'grab',
                zIndex: 6,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'transform 0.1s',
                transform: isHovered ? 'scale(1.3)' : 'scale(1)',
              }}
              title={`Time: ${kf.time.toFixed(2)}s | Value: ${(kf.value * 100).toFixed(0)}% (Double-click to remove)`}
              onDoubleClick={(e) => {
                e.stopPropagation();
                onRemoveKeyframe(kf.id);
              }}
            >
              {isHovered && (
                <div
                  style={{
                    position: 'absolute',
                    bottom: 14,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    backgroundColor: '#000',
                    border: `1px solid ${activeEffect.color}`,
                    color: activeEffect.color,
                    padding: '1px 4px',
                    borderRadius: 2,
                    fontSize: 8,
                    whiteSpace: 'nowrap',
                    pointerEvents: 'none',
                  }}
                >
                  {(kf.value * 100).toFixed(0)}%
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
