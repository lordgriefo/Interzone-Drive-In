import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Play, Pause, Square, Volume2, Sparkles, Film } from 'lucide-react';
import { REVERB_PRESETS, DEFAULT_REVERB_WET } from '../constants/reverbPresets';

function formatTimecode(seconds = 0) {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  const centis = Math.floor((seconds % 1) * 100);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${centis.toString().padStart(2, '0')}`;
}

export function TransportBar({
  isPlaying = false,
  onTogglePlay = () => {},
  onStop = () => {},
  currentTime = 0,
  duration = 0,
  bpm = 120,
  setBpm = () => {},
  reverbPreset = 'vintage_plate',
  setReverbPreset = () => {},
  reverbWet = DEFAULT_REVERB_WET,
  setReverbWet = () => {},

  // Phase 2: A/B Region Looping
  isLooping = false,
  setIsLooping = () => {},
  loopStart = 0,
  setLoopStart = () => {},
  loopEnd = 16,
  setLoopEnd = () => {},
  // Audio Context Autoplay Gate
  isAudioUnlocked = true,
  onUnlockAudio = () => {},
  // Export pipeline modal trigger
  onOpenExport = () => {},
}) {

  const tapTimesRef = useRef([]);
  const [tapActive, setTapActive] = useState(false);

  // Tap-Tempo detection algorithm
  const handleTapTempo = useCallback(() => {
    const now = Date.now();
    setTapActive(true);
    setTimeout(() => setTapActive(false), 120);

    const taps = tapTimesRef.current;
    taps.push(now);
    if (taps.length > 4) taps.shift();

    if (taps.length >= 2) {
      const intervals = [];
      for (let i = 1; i < taps.length; i++) {
        intervals.push(taps[i] - taps[i - 1]);
      }
      const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
      if (avgInterval > 200 && avgInterval < 2000) {
        const calculatedBpm = Math.round(60000 / avgInterval);
        const clampedBpm = Math.max(40, Math.min(240, calculatedBpm));
        setBpm(clampedBpm);
      }
    }
  }, [setBpm]);

  return (
    <div
      style={{
        width: '100%',
        minHeight: 48,
        backgroundColor: '#0c0c10',
        borderTop: '1px solid var(--border-bright)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '6px 12px',
        gap: 10,
        boxSizing: 'border-box',
        color: '#e2e8f0',
        fontFamily: 'var(--font-mono)',
        fontSize: 11,
        userSelect: 'none',
        zIndex: 10,
        flexWrap: 'wrap',
      }}
    >
      {/* ── LEFT: Hardware Transport Buttons & Digital Timecode ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, pointerEvents: 'auto', position: 'relative', zIndex: 999 }}>
        {/* Play/Pause / Activate Button */}
        <button
          type="button"
          aria-label="Play or Pause"
          className="transport-btn play-btn"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log(">>> PLAY BUTTON FIRED <<<");
            if (typeof onTogglePlay === 'function') {
              onTogglePlay();
            } else if (typeof togglePlay === 'function') {
              togglePlay();
            }
          }}
          style={{
            cursor: 'pointer',
            pointerEvents: 'auto',
            position: 'relative',
            zIndex: 999,
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
            padding: '6px 14px',
            borderRadius: 4,
            border: `1px solid ${isPlaying ? '#22c55e' : 'var(--accent-orange)'}`,
            backgroundColor: isPlaying ? 'rgba(34, 197, 94, 0.25)' : 'rgba(255, 107, 0, 0.25)',
            color: isPlaying ? '#22c55e' : 'var(--accent-orange)',
            boxShadow: isPlaying ? '0 0 12px rgba(34, 197, 94, 0.5)' : '0 0 10px rgba(255, 107, 0, 0.4)',
            transition: 'all 0.15s',
            fontWeight: 700,
            fontSize: 11,
            letterSpacing: 1,
          }}
          title="Play / Activate Audio & Visual Engine"
        >
          {isPlaying ? <Pause size={14} /> : <Play size={14} style={{ marginLeft: 1 }} />}
          <span>{isPlaying ? 'PAUSE' : 'PLAY / ACTIVATE'}</span>
        </button>


        {/* Stop */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            if (typeof onStop === 'function') onStop();
          }}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 32,
            height: 32,
            borderRadius: 4,
            border: '1px solid var(--border-dim)',
            backgroundColor: 'var(--bg-secondary)',
            color: 'var(--text-dim)',
            cursor: 'pointer',
            pointerEvents: 'auto',
            position: 'relative',
            zIndex: 100,
            transition: 'all 0.15s',
          }}
          title="Stop & Reset to 00:00"
        >
          <Square size={13} />
        </button>


        {/* Digital LED Timecode Readout */}

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            backgroundColor: '#040406',
            border: '1px solid #1e293b',
            borderRadius: 4,
            padding: '3px 8px',
            boxShadow: 'inset 0 0 8px rgba(0,0,0,0.8)',
          }}
        >
          <span style={{ color: 'var(--accent-orange)', fontWeight: 700, letterSpacing: 1.5, fontSize: 13 }}>
            {formatTimecode(currentTime)}
          </span>
          <span style={{ color: 'var(--text-dim)', fontSize: 9 }}>
            / {formatTimecode(duration)}
          </span>
        </div>

        {/* Dual-Pipeline Export Button */}
        <button
          type="button"
          onClick={onOpenExport}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 5,
            padding: '4px 10px',
            borderRadius: 3,
            border: '1px solid var(--accent-cyan, #00e5ff)',
            backgroundColor: 'rgba(0, 229, 255, 0.12)',
            color: 'var(--accent-cyan, #00e5ff)',
            fontWeight: 800,
            fontSize: 10,
            cursor: 'pointer',
            letterSpacing: 0.8,
            transition: 'all 0.15s',
            fontFamily: 'var(--font-mono, monospace)',
          }}
          title="Open Video Export Pipeline (Web & Electron)"
        >
          <Film size={12} />
          <span>EXPORT</span>
        </button>

        {/* Audio Engine Unlock Button */}
        {!isAudioUnlocked && (
          <button
            onClick={onUnlockAudio}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              padding: '3px 8px',
              borderRadius: 3,
              border: '1px solid var(--accent-blue)',
              backgroundColor: 'rgba(0, 229, 255, 0.2)',
              color: 'var(--accent-blue)',
              fontWeight: 700,
              fontSize: 9,
              cursor: 'pointer',
              boxShadow: '0 0 8px rgba(0,229,255,0.4)',
              animation: 'pulse 1.5s infinite',
            }}
            title="Click to unlock Web Audio & Tone context"
          >
            ⚡ START ENGINE
          </button>
        )}
      </div>


      {/* ── A/B REGION LOOPING CONTROLS ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, backgroundColor: 'rgba(0,0,0,0.4)', padding: '2px 6px', borderRadius: 4, border: '1px solid var(--border-dim)' }}>
        {/* Loop Toggle */}
        <button
          onClick={() => setIsLooping(!isLooping)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            padding: '3px 7px',
            borderRadius: 3,
            border: `1px solid ${isLooping ? 'var(--accent-blue)' : 'var(--border-dim)'}`,
            backgroundColor: isLooping ? 'rgba(0, 229, 255, 0.2)' : 'var(--bg-secondary)',
            color: isLooping ? 'var(--accent-blue)' : 'var(--text-dim)',
            fontWeight: 700,
            fontSize: 9,
            cursor: 'pointer',
            boxShadow: isLooping ? '0 0 8px rgba(0,229,255,0.4)' : 'none',
          }}
          title="Toggle A/B Loop (Hotkey: L)"
        >
          🔁 LOOP {isLooping ? 'ON' : 'OFF'}
        </button>

        {/* Set In Button */}
        <button
          onClick={() => {
            const cur = parseFloat(currentTime.toFixed(2));
            setLoopStart(cur);
            if (cur >= loopEnd) setLoopEnd(parseFloat((cur + 8).toFixed(2)));
          }}
          style={{
            padding: '2px 5px',
            borderRadius: 2,
            border: '1px solid var(--border-bright)',
            backgroundColor: 'var(--bg-secondary)',
            color: 'var(--text-primary)',
            fontSize: 8,
            cursor: 'pointer',
          }}
          title="Set In-Point to Current Playhead (Hotkey: I)"
        >
          [ IN
        </button>
        <input
          type="number"
          step="0.5"
          min="0"
          value={loopStart}
          onChange={(e) => setLoopStart(Math.max(0, parseFloat(e.target.value) || 0))}
          style={{
            width: 42,
            backgroundColor: '#000',
            border: '1px solid var(--border-dim)',
            color: 'var(--accent-blue)',
            fontSize: 9,
            textAlign: 'center',
            borderRadius: 2,
            padding: '2px 0',
          }}
        />

        {/* Set Out Button */}
        <button
          onClick={() => {
            const cur = parseFloat(currentTime.toFixed(2));
            if (cur > loopStart) setLoopEnd(cur);
          }}
          style={{
            padding: '2px 5px',
            borderRadius: 2,
            border: '1px solid var(--border-bright)',
            backgroundColor: 'var(--bg-secondary)',
            color: 'var(--text-primary)',
            fontSize: 8,
            cursor: 'pointer',
          }}
          title="Set Out-Point to Current Playhead (Hotkey: O)"
        >
          OUT ]
        </button>
        <input
          type="number"
          step="0.5"
          min="0"
          value={loopEnd}
          onChange={(e) => setLoopEnd(Math.max(loopStart + 0.1, parseFloat(e.target.value) || 0))}
          style={{
            width: 42,
            backgroundColor: '#000',
            border: '1px solid var(--border-dim)',
            color: 'var(--accent-blue)',
            fontSize: 9,
            textAlign: 'center',
            borderRadius: 2,
            padding: '2px 0',
          }}
        />
      </div>

      {/* ── CENTER: Master BPM Stepper & Tap Tempo ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <span style={{ fontSize: 9, color: 'var(--text-dim)', letterSpacing: 0.5 }}>BPM</span>
        
        {/* Decrement */}
        <button
          onClick={() => setBpm(Math.max(40, bpm - 1))}
          style={{
            width: 20,
            height: 24,
            backgroundColor: 'var(--bg-secondary)',
            border: '1px solid var(--border-dim)',
            color: 'var(--text-primary)',
            borderRadius: 3,
            cursor: 'pointer',
            fontWeight: 700,
          }}
        >
          -
        </button>

        <span style={{
          minWidth: 32,
          textAlign: 'center',
          fontWeight: 700,
          color: 'var(--accent-orange)',
          fontSize: 12,
        }}>
          {bpm}
        </span>

        {/* Increment */}
        <button
          onClick={() => setBpm(Math.min(240, bpm + 1))}
          style={{
            width: 20,
            height: 24,
            backgroundColor: 'var(--bg-secondary)',
            border: '1px solid var(--border-dim)',
            color: 'var(--text-primary)',
            borderRadius: 3,
            cursor: 'pointer',
            fontWeight: 700,
          }}
        >
          +
        </button>

        {/* Tap Tempo Button */}
        <button
          onClick={handleTapTempo}
          style={{
            padding: '4px 8px',
            backgroundColor: tapActive ? 'var(--accent-blue)' : 'var(--bg-secondary)',
            border: `1px solid ${tapActive ? 'var(--accent-blue)' : 'var(--border-dim)'}`,
            color: tapActive ? '#000' : 'var(--accent-blue)',
            borderRadius: 3,
            fontSize: 9,
            fontWeight: 700,
            cursor: 'pointer',
            letterSpacing: 0.5,
            transition: 'all 0.1s',
          }}
          title="Click repeatedly to tap tempo"
        >
          TAP
        </button>
      </div>

      {/* ── RIGHT: Reverb — simple ON/OFF + wet amount ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <Sparkles size={12} color={reverbWet > 0 ? 'var(--accent-blue)' : 'var(--text-dim)'} />
          {/* On/Off toggle button */}
          <button
            onClick={() => setReverbWet(reverbWet > 0 ? 0 : 0.35)}
            style={{
              backgroundColor: reverbWet > 0 ? 'var(--accent-blue-dim)' : 'transparent',
              border: `1px solid ${reverbWet > 0 ? 'var(--accent-blue)' : 'var(--border-bright)'}`,
              color: reverbWet > 0 ? 'var(--accent-blue)' : 'var(--text-dim)',
              borderRadius: 3,
              padding: '2px 7px',
              fontSize: 9,
              fontFamily: 'var(--font-mono)',
              fontWeight: 700,
              cursor: 'pointer',
              letterSpacing: 0.5,
              transition: 'all 0.12s',
            }}
            title={reverbWet > 0 ? 'Click to turn reverb off' : 'Click to turn reverb on'}
          >
            REVERB {reverbWet > 0 ? 'ON' : 'OFF'}
          </button>
        </div>

        {/* Wet amount — only visible when reverb is on */}
        {reverbWet > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={{ fontSize: 8, color: 'var(--text-dim)' }}>WET</span>
            <input
              type="range"
              min="0.0"
              max="1.0"
              step="0.02"
              value={reverbWet}
              onChange={(e) => setReverbWet(parseFloat(e.target.value))}
              style={{
                width: 50,
                height: 4,
                accentColor: 'var(--accent-blue)',
                cursor: 'pointer',
              }}
              title={`Reverb amount: ${(reverbWet * 100).toFixed(0)}%`}
            />
            <span style={{ fontSize: 9, color: 'var(--accent-blue)', minWidth: 26 }}>
              {(reverbWet * 100).toFixed(0)}%
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

