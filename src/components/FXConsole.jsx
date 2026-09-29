// src/components/FXConsole.jsx
// Phase 1 fixes:
// - Méliès Moon section REMOVED
// - All hardcoded colours → CSS variables
// - Expanded file-loader accept attributes
// - Chaos Mode: toggle switch + 0.0-1.0 float slider
// - Master FX Envelope Depth slider
// - Theme switcher moved INTO panel header (no longer floating in workspace)

import React, { useState } from 'react';
import { Lock, Unlock } from 'lucide-react';
import { ERA_OPTIONS } from '../constants/eras';
import { EDIT_PROFILES, WEBM_LOOP_PRESETS } from '../constants/editProfiles';
import { PlaylistPanel } from './PlaylistPanel';


// ── Shared style helpers using CSS variables ──────────────────────────────────

const panelSection = {
  display: 'flex',
  flexDirection: 'column',
  gap: 6,
  backgroundColor: 'var(--bg-panel-alt)',
  border: '1px solid var(--border-dim)',
  padding: '10px',
  borderRadius: 6,
};

const sectionLabel = (color = 'var(--accent-orange)') => ({
  color,
  fontWeight: 700,
  fontSize: 10,
  letterSpacing: '0.8px',
  textTransform: 'uppercase',
  marginBottom: 2,
});

const selectStyle = {
  backgroundColor: 'var(--bg-secondary)',
  color: 'var(--text-primary)',
  border: '1px solid var(--border-mid)',
  padding: '7px 8px',
  borderRadius: 4,
  fontSize: 11,
  fontFamily: 'var(--font-label)',
  width: '100%',
  cursor: 'pointer',
  outline: 'none',
};

const rangeStyle = { width: '100%', accentColor: 'var(--accent-orange)', cursor: 'pointer' };

// ── Theme switcher (now lives inside the panel header) ────────────────────────

const THEMES = [
  { value: 'strangelet',       label: 'Strangelet  Purple/Orange' },
  { value: 'interzone',        label: 'Interzone  Black/Orange' },
  { value: 'mpc60_grey',       label: 'MPC 60  Grey' },
  { value: 'amber_industrial', label: 'Amber  Industrial' },
  { value: 'green_crt',        label: 'Green  CRT' },
  { value: 'noir_rose',        label: 'Noir Rose  Pink/Magenta' },
  { value: 'deep_space',       label: 'Deep Space  Blue/Indigo' },
];

function InlinethemeSwitcher() {
  const [theme, setTheme] = React.useState(() =>
    localStorage.getItem('kinet_theme') || 'strangelet'
  );
  React.useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem('kinet_theme', theme);
  }, [theme]);

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 6 }}>
      <span style={{
        width: 8, height: 8, borderRadius: '50%',
        background: 'var(--accent-orange)',
        boxShadow: '0 0 5px var(--accent-orange-glow)',
        flexShrink: 0,
      }} />
      <span style={{ fontSize: 9, color: 'var(--text-dim)', letterSpacing: 1, textTransform: 'uppercase' }}>
        THEME
      </span>
      <select
        value={theme}
        onChange={(e) => setTheme(e.target.value)}
        style={{
          ...selectStyle,
          flex: 1,
          color: 'var(--accent-orange)',
          backgroundColor: 'var(--bg-panel)',
          border: '1px solid var(--border-dim)',
          fontWeight: 600,
        }}
      >
        {THEMES.map(t => (
          <option key={t.value} value={t.value}>{t.label}</option>
        ))}
      </select>
    </div>
  );
}

// ── Chaos toggle switch ───────────────────────────────────────────────────────

function ToggleSwitch({ enabled, onChange, label, accentVar = 'var(--accent-orange)' }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, userSelect: 'none' }}>
      <div
        onClick={() => onChange(!enabled)}
        title={label}
        style={{
          width: 36,
          height: 18,
          borderRadius: 9,
          backgroundColor: enabled ? accentVar : 'var(--border-bright)',
          position: 'relative',
          cursor: 'pointer',
          transition: 'background-color 0.18s',
          flexShrink: 0,
          boxShadow: enabled ? `0 0 8px ${accentVar}` : 'none',
          border: '1px solid var(--border-mid)',
        }}
      >
        <div style={{
          position: 'absolute',
          top: 2,
          left: enabled ? 18 : 2,
          width: 12,
          height: 12,
          borderRadius: '50%',
          backgroundColor: '#fff',
          transition: 'left 0.18s cubic-bezier(0.4,0,0.2,1)',
          boxShadow: '0 1px 3px rgba(0,0,0,0.5)',
        }} />
      </div>
      <span style={{ color: enabled ? accentVar : 'var(--text-dim)', fontSize: 10, fontWeight: 700, letterSpacing: 0.5 }}>
        {label}
      </span>
    </div>
  );
}

// ── LRC / JSON Lyric Parser ───────────────────────────────────────────────────
// Parses .lrc timestamp files and .json segment arrays into the shared
// { id, text, start, end } format used by CanvasWorkspace lyric overlays.
function parseLrcFile(file, setSegments) {
  const reader = new FileReader();
  reader.onload = (e) => {
    const raw = e.target.result;
    try {
      // JSON path — expects [{start, end, text}, …]
      if (file.name.endsWith('.json')) {
        const data = JSON.parse(raw);
        const segs = (Array.isArray(data) ? data : data.segments ?? [])
          .map((s, i) => ({
            id: i,
            text: String(s.text ?? s.lyric ?? '').trim(),
            start: Number(s.start ?? s.startTime ?? 0),
            end: Number(s.end ?? s.endTime ?? (s.start ?? 0) + 3),
          }))
          .filter((s) => s.text.length > 0);
        setSegments(segs);
        return;
      }
      // LRC path — [mm:ss.xx] or [mm:ss] lines
      const LRC_RE = /\[(\d{1,2}):(\d{2})(?:[.:](\d{1,3}))?\]\s*(.*)/;
      const lines = raw.split('\n');
      const timed = [];
      lines.forEach((line) => {
        const m = line.match(LRC_RE);
        if (!m) return;
        const mins = parseInt(m[1], 10);
        const secs = parseInt(m[2], 10);
        const ms   = m[3] ? parseInt(m[3].padEnd(3, '0'), 10) : 0;
        const t    = mins * 60 + secs + ms / 1000;
        const text = m[4].trim();
        if (text) timed.push({ t, text });
      });
      const segs = timed.map((item, i) => ({
        id: i,
        text: item.text,
        start: item.t,
        end: timed[i + 1] ? timed[i + 1].t : item.t + 4,
      }));
      setSegments(segs);
    } catch (err) {
      console.warn('[LRC Parser] Failed to parse lyric file:', err);
    }
  };
  reader.readAsText(file);
}

// ── MAIN EXPORT ───────────────────────────────────────────────────────────────

export function FXConsole({
  selectedEra = 'lynchian_interzone',
  setSelectedEra = () => {},
  selectedStyle = 'montage',
  setSelectedStyle = () => {},
  selectedRube = 'none',
  setSelectedRube = () => {},
  sensitivity = 1.0,
  setSensitivity = () => {},
  chaosLevel = 0,
  setChaosLevel = () => {},
  chaosEnabled = false,
  setChaosEnabled = () => {},
  fxEnvelopeDepth = 1.0,
  setFxEnvelopeDepth = () => {},
  rubeDecay = 800,
  setRubeDecay = () => {},
  lyricAlign = 'center',
  setLyricAlign = () => {},
  lyricSize = 1.4,
  setLyricSize = () => {},
  lyricFont = 'major_mono',
  setLyricFont = () => {},
  onAudioUpload = () => {},
  isPlaying = false,
  onTogglePlay = () => {},
  onStop = () => {},
  isRecording = false,
  onToggleRecord = () => {},
  // Phase 1.5
  exportQuality = '1080p-master',
  setExportQuality = () => {},
  exportFormat = 'mp4',
  setExportFormat = () => {},
  qualityPresets = {},
  onOpenExport = () => {},
  // Era Lock State & Cooldown
  isEraLocked = false,
  setIsEraLocked = () => {},
  eraChangeCooldown = 8000,
  setEraChangeCooldown = () => {},
  onManualEraChange = null,
  adaptiveTheme = false,
  setAdaptiveTheme = () => {},
  bpm = 120,
  setBpm = () => {},
  // LRC lyric sync engine
  lyricSegments = [],
  setLyricSegments = () => {},
  // Rube Goldberg live stage (0–7) for LED visualizer
  rubeStage = 0,
  // Phase 2: 2.5D Photogrammetry & Depth Fly-Through
  depth3dEnabled = false,
  setDepth3dEnabled = () => {},
  depthExtrusion = 2.0,
  setDepthExtrusion = () => {},
  depthFlySpeed = 1.0,
  setDepthFlySpeed = () => {},
  depthAudioZPulse = 1.0,
  setDepthAudioZPulse = () => {},
  depthRenderMode = 0,
  setDepthRenderMode = () => {},
  onLoadColorSource = () => {},
  onLoadDepthSource = () => {},
  colorFileName = 'Default Scene',
  depthFileName = 'Auto Luminance',
  useLuminanceDepth = true,
  setUseLuminanceDepth = () => {},
  onResetDepthDefaults = () => {},
  // Phase 2: WebM Alpha Video Texture Overlay
  overlayPreset = null,
  onSelectOverlayPreset = () => {},
  onLoadWebMFile = () => {},
  overlayFileName = '',
  overlayOpacity = 0.65,
  setOverlayOpacity = () => {},
  onClearOverlay = () => {},
  // Playlist
  playlist = [],
  setPlaylist = () => {},
  playlistIndex = -1,
  onPlayTrack = () => {},
  onPlaylistAdvance = () => {},
  autoAdvance = true,
  setAutoAdvance = () => {},
  saveImages = false,
  setSaveImages = () => {},
  playlistOpen = false,
  setPlaylistOpen = () => {},
  currentPreset = {},
  currentAssets = [],
}) {



  return (
    <div style={{
      width: 310,
      backgroundColor: 'var(--bg-panel)',
      borderLeft: '1px solid var(--border-dim)',
      padding: '12px',
      display: 'flex',
      flexDirection: 'column',
      gap: 12,
      fontSize: 11,
      color: 'var(--text-primary)',
      fontFamily: 'var(--font-label)',
      overflowY: 'auto',
      position: 'relative',
      zIndex: 2,
      overscrollBehavior: 'contain',
    }}>

      {/* ── PANEL HEADER + THEME SWITCHER ── */}
      <div style={{
        borderBottom: '1px solid var(--border-dim)',
        paddingBottom: 10,
        marginBottom: 2,
      }}>
        <h3 style={{
          margin: 0,
          color: 'var(--accent-orange)',
          fontSize: 13,
          letterSpacing: 3,
          fontFamily: "'Syncopate', var(--font-mono)",
          fontWeight: 700,
          textShadow: '0 0 10px var(--accent-orange-glow)',
          textTransform: 'uppercase',
        }}>
          🎛 ANIMATIC FX CONSOLE
        </h3>
        <InlinethemeSwitcher />
      </div>
      {/* ── PLAYLIST PANEL ── */}
      <div style={panelSection}>
        <PlaylistPanel
          playlist={playlist}
          playlistIndex={playlistIndex}
          onPlaylistChange={setPlaylist}
          onPlayTrack={onPlayTrack}
          onAdvanceTrack={onPlaylistAdvance}
          autoAdvance={autoAdvance}
          setAutoAdvance={setAutoAdvance}
          saveImages={saveImages}
          setSaveImages={setSaveImages}
          currentPreset={currentPreset}
          currentAssets={currentAssets}
          isOpen={playlistOpen}
          setIsOpen={setPlaylistOpen}
        />
      </div>

      {/* ── 1. LOAD SOUNDTRACK ── */}
      <div style={panelSection}>
        <label style={sectionLabel('var(--accent-orange)')}>1 · LOAD SOUNDTRACK</label>
        <input
          type="file"
          accept="audio/mpeg,audio/wav,audio/ogg,audio/flac,audio/x-wav,audio/x-flac,.mp3,.wav,.ogg,.flac"
          onChange={onAudioUpload}
          style={{
            backgroundColor: 'var(--bg-secondary)',
            border: '1px solid var(--border-mid)',
            padding: '6px',
            borderRadius: 4,
            color: 'var(--text-primary)',
            fontSize: 10,
            width: '100%',
            boxSizing: 'border-box',
          }}
        />

        <div style={{ display: 'flex', gap: 6, marginTop: 2 }}>
          <button
            onClick={onTogglePlay}
            style={{
              flex: 1,
              backgroundColor: isPlaying ? 'var(--accent-orange)' : '#10b981',
              color: '#000',
              border: 'none',
              padding: '9px 6px',
              borderRadius: 4,
              fontWeight: 700,
              fontSize: 11,
              cursor: 'pointer',
              boxShadow: isPlaying ? '0 0 10px var(--accent-orange-glow)' : 'none',
              fontFamily: 'var(--font-label)',
              transition: 'all 0.15s',
            }}
          >
            {isPlaying ? '⏸ PAUSE' : '▶ ACTIVATE'}
          </button>

          <button
            onClick={onStop}
            style={{
              backgroundColor: '#c0392b',
              color: '#fff',
              border: 'none',
              padding: '9px 12px',
              borderRadius: 4,
              fontWeight: 700,
              fontSize: 11,
              cursor: 'pointer',
              fontFamily: 'var(--font-label)',
            }}
          >
            ⏹ STOP
          </button>
        </div>

        <button
          onClick={onToggleRecord}
          style={{
            backgroundColor: isRecording ? '#c0392b' : '#7b2fbe',
            color: '#fff',
            border: 'none',
            padding: '9px',
            borderRadius: 4,
            fontWeight: 700,
            fontSize: 11,
            cursor: 'pointer',
            boxShadow: isRecording ? '0 0 12px rgba(192,57,43,0.7)' : 'none',
            fontFamily: 'var(--font-label)',
            transition: 'all 0.15s',
          }}
        >
          {isRecording ? '⏹ STOP & SAVE WEBM/MP4' : '⏺ RECORD VIDEO EXPORT'}
        </button>
      </div>

      {/* ── 2. LRC LYRIC SYNC ── */}
      <div style={panelSection}>
        <label style={sectionLabel('var(--automation-color)')}>2 · LRC LYRIC SYNC</label>

        {/* File drop zone */}
        <div
          style={{
            border: `1px dashed ${lyricSegments.length > 0 ? 'var(--accent-blue)' : 'var(--border-mid)'}`,
            borderRadius: 4,
            padding: '10px 8px',
            textAlign: 'center',
            cursor: 'pointer',
            backgroundColor: lyricSegments.length > 0 ? 'rgba(0,229,255,0.06)' : 'transparent',
            transition: 'all 0.15s',
          }}
          onClick={() => document.getElementById('lrc-file-input').click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            const file = e.dataTransfer.files[0];
            if (file) parseLrcFile(file, setLyricSegments);
          }}
          title="Click or drag a .lrc or .json lyric file"
        >
          <input
            id="lrc-file-input"
            type="file"
            accept=".lrc,.json"
            style={{ display: 'none' }}
            onChange={(e) => {
              const file = e.target.files[0];
              if (file) parseLrcFile(file, setLyricSegments);
              e.target.value = '';
            }}
          />
          <span style={{ fontSize: 9, color: lyricSegments.length > 0 ? 'var(--accent-blue)' : 'var(--text-dim)' }}>
            {lyricSegments.length > 0
              ? `✓ ${lyricSegments.length} lyric segments loaded`
              : '📄 Drop .lrc or .json · click to browse'}
          </span>
        </div>

        {lyricSegments.length > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 9, color: 'var(--text-dim)' }}>
              Synced to playhead · Track 2
            </span>
            <button
              onClick={() => setLyricSegments([])}
              style={{
                background: 'none', border: '1px solid var(--border-mid)',
                color: 'var(--text-dim)', borderRadius: 3, padding: '2px 7px',
                fontSize: 9, cursor: 'pointer',
              }}
            >
              CLEAR
            </button>
          </div>
        )}

        {/* Lyric display options */}
        <label style={{ color: 'var(--text-dim)', fontSize: 9 }}>Overlay Alignment</label>
        <select value={lyricAlign} onChange={(e) => setLyricAlign(e.target.value)} style={selectStyle}>
          <option value="center">Center</option>
          <option value="left">Left</option>
          <option value="right">Right</option>
        </select>
        <label style={{ color: 'var(--text-dim)', fontSize: 9 }}>
          Type Size: {lyricSize.toFixed(1)}rem
        </label>
        <input
          type="range" min="0.8" max="2.5" step="0.1"
          value={lyricSize}
          onChange={(e) => setLyricSize(parseFloat(e.target.value))}
          style={rangeStyle}
        />
        <label style={{ color: 'var(--text-dim)', fontSize: 9 }}>Typeface</label>
        <select value={lyricFont} onChange={(e) => setLyricFont(e.target.value)} style={selectStyle}>
          <optgroup label="── Stylized ──">
            <option value="space_mono">Space Mono</option>
            <option value="vt323">VT323 — retro CRT terminal</option>
            <option value="orbitron">Orbitron — sci-fi geometric</option>
            <option value="press_start">Press Start 2P — 8-bit pixel</option>
            <option value="special_elite">Special Elite — distressed typewriter</option>
            <option value="permanent_marker">Permanent Marker — handwritten</option>
            <option value="bebas_neue">Bebas Neue — condensed headline</option>
            <option value="black_ops">Black Ops One — military stencil</option>
            <option value="russo_one">Russo One — tech bold</option>
            <option value="syncopate">Syncopate — geometric condensed</option>
          </optgroup>
          <optgroup label="── Classic ──">
            <option value="impact">Impact — bold title card</option>
            <option value="courier">Courier New — typewriter</option>
            <option value="georgia">Georgia — editorial serif</option>
            <option value="palatino">Palatino — classic serif</option>
            <option value="garamond">Garamond — old-style serif</option>
            <option value="futura">Century Gothic / Futura</option>
            <option value="arial">Arial — clean sans</option>
            <option value="verdana">Verdana — screen-optimised</option>
          </optgroup>
        </select>
      </div>

      {/* ── 3. ERA (THE LOOK) ── */}
      <div style={panelSection}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 2 }}>
          <label style={sectionLabel('var(--text-track)')}>3 · ERA  ·  THE LOOK</label>
          {/* Era Lock Toggle */}
          <button
            type="button"
            onClick={() => setIsEraLocked(!isEraLocked)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
              padding: '2px 8px',
              borderRadius: 3,
              border: isEraLocked ? '1px solid #ef4444' : '1px solid #3f3f46',
              backgroundColor: isEraLocked ? 'rgba(239,68,68,0.2)' : 'rgba(255,255,255,0.04)',
              color: isEraLocked ? '#ef4444' : '#a1a1aa',
              fontSize: 9,
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.15s',
              fontFamily: 'var(--font-mono, monospace)',
            }}
            title={isEraLocked ? "Era is LOCKED: procedural trigger chain cannot change era" : "Era is UNLOCKED: procedural chain can mutate era on transients"}
          >
            {isEraLocked ? <Lock size={10} /> : <Unlock size={10} />}
            <span>{isEraLocked ? 'LOCKED' : 'AUTO'}</span>
          </button>
        </div>

        <select
          value={selectedEra}
          onChange={(e) => onManualEraChange ? onManualEraChange(e.target.value) : setSelectedEra(e.target.value)}
          style={selectStyle}
        >
          {ERA_OPTIONS.map(({ value, label }) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>

        {/* Cooldown controls & status badge */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 2, fontSize: 8, color: 'var(--text-dim)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span>COOLDOWN:</span>
            <input
              type="range"
              min="2000"
              max="20000"
              step="1000"
              value={eraChangeCooldown}
              onChange={(e) => setEraChangeCooldown(Number(e.target.value))}
              disabled={isEraLocked}
              style={{ width: 55, height: 3, accentColor: 'var(--accent-orange)' }}
              title={`Era Change Cooldown: ${(eraChangeCooldown / 1000).toFixed(0)}s`}
            />
            <span style={{ color: isEraLocked ? '#71717a' : 'var(--accent-orange)', fontWeight: 700 }}>
              {(eraChangeCooldown / 1000).toFixed(0)}s
            </span>
          </div>

          <span style={{ fontSize: 8, color: isEraLocked ? '#ef4444' : '#10b981', fontWeight: 600 }}>
            {isEraLocked ? '🔒 MANUAL PRESET' : '⚡ CHAIN MUTATING'}
          </span>
        </div>
      </div>

      {/* ── 4. EDITING BEHAVIOR ── */}
      <div style={panelSection}>
        <label style={sectionLabel('var(--text-track)')}>4 · EDITING BEHAVIOR</label>
        <select value={selectedStyle} onChange={(e) => setSelectedStyle(e.target.value)} style={selectStyle}>
          {EDIT_PROFILES.map((profile) => (
            <option key={profile.id} value={profile.id}>
              {profile.label}
            </option>
          ))}
        </select>
        {(() => {
          const activeProf = EDIT_PROFILES.find((p) => p.id === selectedStyle);
          return activeProf ? (
            <span style={{ fontSize: 8, color: 'var(--text-dim)', lineHeight: 1.4 }}>
              {activeProf.description}
            </span>
          ) : null;
        })()}
      </div>


      {/* ── 5. RUBE GOLDBERG CHAINS ── */}
      <div style={panelSection}>
        <label style={sectionLabel('var(--text-track)')}>5 · RUBE GOLDBERG STATE CHAINS</label>
        <select value={selectedRube} onChange={(e) => setSelectedRube(e.target.value)} style={selectStyle}>
          <option value="none">None (Standard Beat Sync)</option>
          <option value="dada_factory">1. Dadaist Factory (Anvil → Jolt → Strobe)</option>
          <option value="alchemical">2. Alchemical Threshold (Fill → Shatter → Melt)</option>
          <option value="strangelet_event">3. Gravity Singularity (Vortex → Orbit → Explode)</option>
          <option value="pneumatic">4. Pneumatic Steam Press (Squash → Snap → Valve Release)</option>
          <option value="cathode_burn">5. Cathode Burn (CRT Collapse → Static → Reboot)</option>
          <option value="chromatic_prism">6. Chromatic Prism (RGB Aberration → Fringe → Refract)</option>
          <option value="film_burn">7. Film Burn (Amber Flare → Celluloid Bloom → Whiteout)</option>
          <option value="signal_dropout">8. Signal Dropout (VHS Tracking → Band Tear → Dropout)</option>
          <option value="neon_pulse">9. Neon Pulse (Electric Jolt → Rainbow Fringe → Warp)</option>
          <option value="slow_burn">10. Slow Burn (Amber Creep → Cinematic Flare → Bloom)</option>
          <option value="ghost_loop">11. Ghost Loop (Haunting Drift → Phantom Split → Dissolve)</option>
        </select>

        {/* 8-Stage LED strip */}
        {selectedRube !== 'none' && (() => {
          const STAGE_LABELS = ['IDLE','PENDULUM','DOMINO','JITTER','GRAVITY','PRISM','Z-RECOIL','RESET'];
          const STAGE_COLORS = [
            'var(--text-dim)',       // 0 idle
            'var(--accent-blue)',    // 1 pendulum
            'var(--accent-orange)',  // 2 domino
            '#f59e0b',               // 3 jitter
            '#ef4444',               // 4 gravity
            '#a78bfa',               // 5 prism
            '#10b981',               // 6 z-recoil
            '#fff',                  // 7 reset flash
          ];
          return (
            <div style={{ marginTop: 6 }}>
              {/* Active stage name */}
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                marginBottom: 5,
              }}>
                <span style={{
                  fontSize: 9, fontWeight: 700, letterSpacing: 1,
                  color: STAGE_COLORS[rubeStage] || 'var(--text-dim)',
                  textShadow: `0 0 8px ${STAGE_COLORS[rubeStage] || 'transparent'}`,
                  transition: 'color 0.15s',
                }}>
                  ▶ {STAGE_LABELS[rubeStage] ?? 'IDLE'}
                </span>
                <span style={{ fontSize: 8, color: 'var(--text-dim)' }}>
                  STAGE {rubeStage} / 7
                </span>
              </div>

              {/* LED pill row */}
              <div style={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
                {STAGE_LABELS.map((label, i) => {
                  const isActive = rubeStage === i;
                  const col = STAGE_COLORS[i];
                  return (
                    <div key={i} style={{
                      flex: '1 1 auto',
                      minWidth: 28,
                      padding: '3px 4px',
                      borderRadius: 3,
                      border: `1px solid ${isActive ? col : 'var(--border-dim)'}`,
                      backgroundColor: isActive ? `${col}22` : 'transparent',
                      boxShadow: isActive ? `0 0 8px ${col}66` : 'none',
                      textAlign: 'center',
                      transition: 'all 0.1s',
                    }}>
                      <div style={{
                        width: 6, height: 6, borderRadius: '50%',
                        backgroundColor: isActive ? col : 'var(--border-mid)',
                        boxShadow: isActive ? `0 0 6px ${col}` : 'none',
                        margin: '0 auto 2px',
                        transition: 'all 0.1s',
                      }} />
                      <span style={{
                        fontSize: 6, letterSpacing: 0.3,
                        color: isActive ? col : 'var(--text-dim)',
                        fontWeight: isActive ? 700 : 400,
                      }}>
                        {label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })()}

        <div>
          <label style={{ color: 'var(--accent-blue)', fontSize: 9 }}>
            Chain Hold / Decay: {rubeDecay}ms
          </label>
          <input
            type="range" min="300" max="2000" step="100"
            value={rubeDecay}
            onChange={(e) => setRubeDecay(parseInt(e.target.value))}
            style={{ ...rangeStyle, accentColor: 'var(--accent-blue)' }}
          />
        </div>
      </div>


      {/* ── 6. CHAOS MODE + REACTIVITY ── */}
      <div style={{
        ...panelSection,
        border: `1px solid ${chaosEnabled ? 'var(--accent-orange)' : 'var(--border-dim)'}`,
        boxShadow: chaosEnabled ? '0 0 10px var(--accent-orange-dim)' : 'none',
        transition: 'box-shadow 0.2s, border-color 0.2s',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
          <label style={sectionLabel('var(--accent-orange)')}>6 · CHAOS MODE</label>
          <ToggleSwitch
            enabled={chaosEnabled}
            onChange={setChaosEnabled}
            label={chaosEnabled ? 'ON' : 'OFF'}
          />
        </div>

        {/* Chaos intensity 0.0–1.0 float */}
        <div>
          <label style={{
            color: chaosEnabled ? 'var(--accent-orange)' : 'var(--text-dim)',
            fontSize: 10,
            fontWeight: 700,
          }}>
            🌀 JITTER INTENSITY: {chaosLevel.toFixed(2)}
          </label>
          <input
            type="range" min="0" max="1" step="0.01"
            value={chaosLevel}
            onChange={(e) => setChaosLevel(parseFloat(e.target.value))}
            disabled={!chaosEnabled}
            style={{
              ...rangeStyle,
              opacity: chaosEnabled ? 1 : 0.35,
            }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 8, color: 'var(--text-dim)', marginTop: 1 }}>
            <span>SMOOTH</span><span>FULL CHAOS</span>
          </div>
        </div>

        {/* Transient sensitivity */}
        <div>
          <label style={{ color: 'var(--text-dim)', fontSize: 9 }}>
            ⚡ Transient Sensitivity: {sensitivity.toFixed(1)}
          </label>
          <input
            type="range" min="0.5" max="3.0" step="0.1"
            value={sensitivity}
            onChange={(e) => setSensitivity(parseFloat(e.target.value))}
            style={{ ...rangeStyle, accentColor: 'var(--accent-blue)' }}
          />
        </div>
      </div>

      {/* ── 7. MASTER FX ENVELOPE DEPTH ── */}
      <div style={panelSection}>
        <label style={sectionLabel('var(--automation-color)')}>7 · MASTER FX ENVELOPE DEPTH</label>
        <div>
          <label style={{ color: 'var(--automation-color)', fontSize: 10, fontWeight: 700 }}>
            Envelope Modulation Depth: {(fxEnvelopeDepth * 100).toFixed(0)}%
          </label>
          <input
            type="range" min="0" max="1" step="0.01"
            value={fxEnvelopeDepth}
            onChange={(e) => setFxEnvelopeDepth(parseFloat(e.target.value))}
            style={{ ...rangeStyle, accentColor: 'var(--automation-color)' }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 8, color: 'var(--text-dim)', marginTop: 1 }}>
            <span>BYPASS (0%)</span>
            <span style={{ color: fxEnvelopeDepth < 0.05 ? '#22c55e' : 'var(--text-dim)' }}>
              {fxEnvelopeDepth < 0.05 ? '● BYPASSED' : ''}
            </span>
            <span>FULL (100%)</span>
          </div>
          {fxEnvelopeDepth < 0.05 && (
            <span style={{ fontSize: 9, color: '#22c55e', display: 'block', marginTop: 3 }}>
              FX envelope bypassed — smooth playback active
            </span>
          )}
        </div>
      </div>

      {/* ── 8. EXPORT FORMAT & QUALITY ── */}
      <div style={panelSection}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <label style={sectionLabel('var(--accent-blue)')}>8 · EXPORT FORMAT & QUALITY</label>
          {isRecording && (
            <span style={{
              fontSize: 8, color: '#ef4444', animation: 'pulse 1s ease-in-out infinite',
              letterSpacing: 0.5, fontWeight: 700,
            }}>● REC</span>
          )}
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          <select
            value={exportFormat}
            onChange={(e) => setExportFormat(e.target.value)}
            disabled={isRecording}
            style={{ ...selectStyle, width: '38%', flexShrink: 0 }}
          >
            <option value="mp4">MP4 (NLE)</option>
            <option value="webm">WebM (VP9)</option>
            <option value="auto">Auto</option>
          </select>
          <select
            value={exportQuality}
            onChange={(e) => setExportQuality(e.target.value)}
            disabled={isRecording}
            style={{ ...selectStyle, flex: 1 }}
          >
            {Object.entries(qualityPresets).map(([key, preset]) => (
              <option key={key} value={key}>{preset.label}</option>
            ))}
          </select>
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          <button
            onClick={onToggleRecord}
            style={{
              flex: 1,
              backgroundColor: isRecording ? 'rgba(239,68,68,0.25)' : 'rgba(0,229,255,0.12)',
              color: isRecording ? '#ef4444' : 'var(--accent-blue)',
              border: `1px solid ${isRecording ? '#ef4444' : 'var(--accent-blue)'}`,
              padding: '8px 6px',
              borderRadius: 4,
              fontWeight: 700,
              fontSize: 10,
              cursor: 'pointer',
              fontFamily: 'var(--font-label)',
              letterSpacing: 0.5,
              transition: 'all 0.15s',
            }}
          >
            {isRecording ? '■ STOP REC' : '● RECORD'}
          </button>
          <button
            type="button"
            onClick={onOpenExport}
            style={{
              backgroundColor: 'rgba(168,85,247,0.15)',
              color: '#c084fc',
              border: '1px solid #a855f7',
              padding: '8px 10px',
              borderRadius: 4,
              fontWeight: 700,
              fontSize: 10,
              cursor: 'pointer',
              fontFamily: 'var(--font-label)',
              letterSpacing: 0.5,
              transition: 'all 0.15s',
              flexShrink: 0,
            }}
            title="Open Dual-Pipeline Export Modal (Web & Electron Mode)"
          >
            ⚡ PIPELINE
          </button>
        </div>
        <span style={{ fontSize: 8, color: 'var(--text-dim)' }}>
          {exportFormat === 'mp4'
            ? 'Direct MP4 container · 320k audio · ready for DaVinci, Premiere & FCP'
            : 'VP9 WebM container · 320k Opus audio · high-fidelity web master'}
        </span>
      </div>

      {/* ── 9. BPM + ADAPTIVE THEME ── */}
      <div style={panelSection}>
        <label style={sectionLabel('var(--accent-orange)')}>9 · MASTER CLOCK + THEME</label>

        {/* BPM */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <label style={{ color: 'var(--text-dim)', fontSize: 9, flexShrink: 0 }}>BPM</label>
          <input
            type="number"
            min={40} max={240} step={1}
            value={bpm}
            onChange={(e) => {
              const v = parseInt(e.target.value, 10);
              if (v >= 40 && v <= 240) setBpm(v);
            }}
            style={{
              width: 58,
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-bright)',
              color: 'var(--accent-orange)',
              borderRadius: 3,
              padding: '3px 6px',
              fontSize: 13,
              fontWeight: 700,
              fontFamily: 'var(--font-mono)',
              outline: 'none',
              textAlign: 'center',
            }}
          />
          <input
            type="range" min={40} max={240} step={1}
            value={bpm}
            onChange={(e) => setBpm(parseInt(e.target.value, 10))}
            style={{ ...rangeStyle, flex: 1, margin: 0 }}
          />
        </div>
        <span style={{ fontSize: 8, color: 'var(--text-dim)' }}>
          Beat interval: {(60000 / bpm).toFixed(0)}ms · strobe/jitter auto-sync
        </span>

        {/* Adaptive Theme */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
          <ToggleSwitch
            enabled={adaptiveTheme}
            onChange={() => setAdaptiveTheme((v) => !v)}
            label="ADAPTIVE THEME"
            accentVar="var(--accent-blue)"
          />
          {adaptiveTheme && (
            <span style={{
              fontSize: 8,
              color: 'var(--accent-blue)',
              background: 'var(--accent-blue-dim)',
              border: '1px solid var(--accent-blue)',
              borderRadius: 3,
              padding: '1px 5px',
              letterSpacing: 0.5,
            }}>AUTO-SAMPLING ●</span>
          )}
        </div>
        {adaptiveTheme && (
          <span style={{ fontSize: 8, color: 'var(--text-dim)', lineHeight: 1.5 }}>
            Samples frame pixels every 1.5s — maps dominant hue to
            ––bg-primary, ––accent-orange, ––accent-blue. Resets on toggle off.
          </span>
        )}
      </div>

      {/* ── 10. WEBM ALPHA LOOPS & GRAIN OVERLAYS ── */}
      <div style={panelSection}>
        <label style={sectionLabel('var(--automation-color)')}>11 · WEBM ALPHA LOOPS & GRAIN</label>
        
        {/* Preset quick buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <span style={{ fontSize: 8, color: 'var(--text-dim)' }}>Quick Alpha Presets</span>
          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
            {WEBM_LOOP_PRESETS.map((p) => {
              const isSelected = overlayPreset === p.id;
              return (
                <button
                  key={p.id}
                  onClick={() => onSelectOverlayPreset(isSelected ? null : p.id)}
                  style={{
                    flex: '1 1 auto',
                    minWidth: 80,
                    padding: '4px 6px',
                    borderRadius: 3,
                    border: `1px solid ${isSelected ? p.color : 'var(--border-dim)'}`,
                    backgroundColor: isSelected ? `${p.color}22` : 'var(--bg-secondary)',
                    color: isSelected ? p.color : 'var(--text-primary)',
                    fontSize: 8,
                    fontWeight: isSelected ? 700 : 400,
                    cursor: 'pointer',
                    textAlign: 'center',
                    transition: 'all 0.15s',
                  }}
                >
                  {p.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Custom WebM upload dropzone */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2, marginTop: 2 }}>
          <label style={{ color: 'var(--text-dim)', fontSize: 9 }}>Custom WebM Alpha Video</label>
          <div
            style={{
              border: `1px dashed ${overlayFileName ? 'var(--accent-orange)' : 'var(--border-bright)'}`,
              borderRadius: 4,
              padding: '6px 8px',
              backgroundColor: 'var(--bg-secondary)',
              cursor: 'pointer',
              textAlign: 'center',
              fontSize: 9,
              color: overlayFileName ? 'var(--accent-orange)' : 'var(--text-dim)',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
            onClick={() => document.getElementById('webm-overlay-input').click()}
            title="Click or drop a transparent WebM / MP4 video overlay"
          >
            <input
              id="webm-overlay-input"
              type="file"
              accept=".webm,video/*,image/*"
              style={{ display: 'none' }}
              onChange={(e) => {
                if (e.target.files[0]) onLoadWebMFile(e.target.files[0]);
                e.target.value = '';
              }}
            />
            {overlayFileName ? `🎞️ ${overlayFileName}` : '📂 Drop .webm alpha loop'}
          </div>
        </div>

        {/* Opacity slider */}
        {overlayFileName && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label style={{ color: 'var(--text-dim)', fontSize: 9 }}>
                Overlay Opacity: {(overlayOpacity * 100).toFixed(0)}%
              </label>
              <button
                onClick={onClearOverlay}
                style={{
                  background: 'none', border: 'none', color: '#ef4444',
                  fontSize: 8, cursor: 'pointer', textDecoration: 'underline', padding: 0
                }}
              >
                Clear
              </button>
            </div>
            <input
              type="range" min="0.0" max="1.0" step="0.02"
              value={overlayOpacity}
              onChange={(e) => setOverlayOpacity(parseFloat(e.target.value))}
              style={{ ...rangeStyle, accentColor: 'var(--automation-color)' }}
            />
          </div>
        )}
      </div>


      <p style={{ fontSize: 9, opacity: 0.3, marginTop: 'auto', marginBottom: 0 }}>
        STRANGELET LOUNGE · NO RIGHTS RESERVED
      </p>
    </div>
  );
}