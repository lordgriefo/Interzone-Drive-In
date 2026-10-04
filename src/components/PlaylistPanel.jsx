// src/components/PlaylistPanel.jsx
// Playlist queue panel for The Kinet-O-Chop
// Each entry stores: audio URL, track title, duration, and a full visual preset snapshot.
// Optional: asset bin snapshot (image/video IDs + base64 thumbnails for session restore).

import React, { useState, useRef, useCallback } from 'react';
import { exportPlaylistZip, exportCurrentSongZip, importPlaylistZip } from '../utils/playlistZip';

// ── Helpers ──────────────────────────────────────────────────────────────────

function formatDuration(secs) {
  if (!secs || isNaN(secs)) return '--:--';
  const m = Math.floor(secs / 60);
  const s = Math.floor(secs % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

function newId() {
  return `pl_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

async function getAudioDuration(fileOrUrl) {
  return new Promise((resolve) => {
    const audio = new Audio();
    audio.addEventListener('loadedmetadata', () => resolve(audio.duration || 0));
    audio.addEventListener('error', () => resolve(0));
    audio.src = typeof fileOrUrl === 'string' ? fileOrUrl : URL.createObjectURL(fileOrUrl);
  });
}

// Small swatch badge for style/era
function Badge({ text, color = '#a855f7' }) {
  return (
    <span style={{
      fontSize: 7,
      fontFamily: 'var(--font-mono)',
      color,
      border: `1px solid ${color}44`,
      borderRadius: 2,
      padding: '1px 4px',
      background: `${color}18`,
      letterSpacing: 0.5,
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      maxWidth: 70,
    }}>
      {text}
    </span>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

export function PlaylistPanel({
  // Playlist state (managed externally in App.jsx)
  playlist = [],
  playlistIndex = -1,
  onPlaylistChange = () => {},
  onPlayTrack = () => {},       // (entry, index) → loads & plays the track
  onAdvanceTrack = () => {},    // () → advance to next track

  // Auto-advance option
  autoAdvance = true,
  setAutoAdvance = () => {},

  // Save-images option
  saveImages = false,
  setSaveImages = () => {},

  // Current app state — for capturing presets
  currentPreset = {},           // { selectedStyle, selectedEra, chaosLevel, chaosEnabled, sensitivity, bpm, reverbWet }
  currentAssets = [],           // AssetBin items for snapshot

  // For loading presets back into App
  onLoadPreset = () => {},      // (preset, assets?) → restores app state from playlist entry
  onLoadAssets = () => {},

  // Currently loaded song — lets us export it even when it isn't in the playlist
  currentTrackTitle = '',
  currentDuration = 0,
  getCurrentAudio = () => null, // () → File | url string | null

  isOpen = false,
  setIsOpen = () => {},
}) {
  const fileInputRef = useRef(null);
  const importInputRef = useRef(null);
  const zipInputRef = useRef(null);
  const [editingId, setEditingId] = useState(null); // which entry's title is being edited
  const [editingTitle, setEditingTitle] = useState('');

  // ── Add tracks from file picker ──────────────────────────────────────────
  const handleAddTracks = useCallback(async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    const newEntries = await Promise.all(files.map(async (file) => {
      const dur = await getAudioDuration(file);
      const url = URL.createObjectURL(file);
      // Snapshot current preset when adding
      const entry = {
        id: newId(),
        title: file.name.replace(/\.[^.]+$/, ''),
        url,
        file,
        duration: dur,
        preset: { ...currentPreset },
        assets: saveImages
          ? currentAssets.map((a) => ({ id: a.id, name: a.name, url: a.url, type: a.type }))
          : [],
      };
      return entry;
    }));

    onPlaylistChange((prev) => [...prev, ...newEntries]);
    e.target.value = '';
  }, [currentPreset, currentAssets, saveImages, onPlaylistChange]);

  // ── Capture current preset into an existing entry ──────────────────────
  const handleCapturePreset = useCallback((id) => {
    onPlaylistChange((prev) => prev.map((entry) =>
      entry.id === id
        ? {
            ...entry,
            preset: { ...currentPreset },
            assets: saveImages
              ? currentAssets.map((a) => ({ id: a.id, name: a.name, url: a.url, type: a.type }))
              : entry.assets,
          }
        : entry
    ));
  }, [currentPreset, currentAssets, saveImages, onPlaylistChange]);

  // ── Remove entry ─────────────────────────────────────────────────────────
  const handleRemove = useCallback((id) => {
    onPlaylistChange((prev) => {
      const entry = prev.find((e) => e.id === id);
      if (entry?.url?.startsWith('blob:')) URL.revokeObjectURL(entry.url);
      return prev.filter((e) => e.id !== id);
    });
  }, [onPlaylistChange]);

  // ── Reorder ──────────────────────────────────────────────────────────────
  const handleMove = useCallback((id, dir) => {
    onPlaylistChange((prev) => {
      const idx = prev.findIndex((e) => e.id === id);
      if (idx < 0) return prev;
      const next = [...prev];
      const swapIdx = idx + dir;
      if (swapIdx < 0 || swapIdx >= next.length) return prev;
      [next[idx], next[swapIdx]] = [next[swapIdx], next[idx]];
      return next;
    });
  }, [onPlaylistChange]);

  // ── Export playlist to JSON ───────────────────────────────────────────────
  const handleExport = useCallback(() => {
    const data = playlist.map(({ id, title, duration, preset, assets }) => ({
      id, title, duration, preset,
      assetHints: assets.map(({ name, type }) => ({ name, type })),
    }));
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'kinet-o-chop-playlist.json';
    a.click();
    URL.revokeObjectURL(url);
  }, [playlist]);

  // ── Import playlist from JSON ─────────────────────────────────────────────
  const handleImport = useCallback((e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target.result);
        if (!Array.isArray(data)) {
          console.warn('[Playlist] Imported JSON is not an array');
          return;
        }
        const imported = data.map((item) => ({
          id: item.id || newId(),
          title: item.title || 'Untitled',
          duration: item.duration || 0,
          preset: item.preset || {},
          assets: [],
          assetHints: item.assetHints || [],
          url: null,
          file: null,
        }));
        onPlaylistChange((prev) => [...prev, ...imported]);
      } catch (err) {
        console.error('[Playlist] Failed to parse imported JSON:', err);
        alert('Could not import playlist — invalid JSON file.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  }, [onPlaylistChange]);

  // ── Export playlist + assets as ZIP ──────────────────────────────────────
  const handleZipExport = useCallback(async () => {
    if (playlist.length === 0) return;
    try {
      await exportPlaylistZip(playlist, currentAssets);
    } catch (err) {
      console.error('[Playlist] ZIP export failed:', err);
      alert('ZIP export failed: ' + err.message);
    }
  }, [playlist, currentAssets]);

  // ── Export the currently loaded song (audio + FX + images) as ZIP ────────
  const handleCurrentSongZip = useCallback(async () => {
    try {
      const audio = getCurrentAudio();
      const result = await exportCurrentSongZip({
        title: currentTrackTitle || 'Untitled',
        audioSource: audio,
        duration: currentDuration,
        preset: { ...currentPreset },
        assets: currentAssets,
      });
      if (!audio) {
        alert('Exported FX + images, but no audio file was available to include.\n(The built-in demo track can\'t be packed — load your own song to include audio.)');
      } else if (result?.assetsPacked === 0) {
        console.info('[Playlist] Song exported with no images (Asset Bin was empty).');
      }
    } catch (err) {
      console.error('[Playlist] Current-song ZIP export failed:', err);
      alert('ZIP export failed: ' + err.message);
    }
  }, [getCurrentAudio, currentTrackTitle, currentDuration, currentPreset, currentAssets]);


  // ── Import playlist + assets from ZIP ────────────────────────────────────
  const handleZipImport = useCallback(async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const { playlist: imported, assets: importedAssets } = await importPlaylistZip(file);
      // Merge assets into the app's asset bin via the onLoadPreset callback,
      // or just extend the playlist entries — the assets array is passed back.
      onPlaylistChange((prev) => [...prev, ...imported]);
      // Notify parent so it can merge the restored assets into the Asset Bin
      if (typeof onLoadAssets === 'function') {
        onLoadAssets(importedAssets);
      }
    } catch (err) {
      console.error('[Playlist] ZIP import failed:', err);
      alert('ZIP import failed: ' + err.message);
    }
    e.target.value = '';
  }, [onPlaylistChange, onLoadAssets]);

  // ── Title inline edit ────────────────────────────────────────────────────
  const startEditTitle = (entry) => {
    setEditingId(entry.id);
    setEditingTitle(entry.title);
  };
  const commitEditTitle = () => {
    if (!editingId) return;
    onPlaylistChange((prev) => prev.map((e) =>
      e.id === editingId ? { ...e, title: editingTitle.trim() || e.title } : e
    ));
    setEditingId(null);
  };

  // ── Styles ───────────────────────────────────────────────────────────────
  const sectionBg = {
    backgroundColor: 'var(--bg-panel)',
    border: '1px solid var(--border-dim)',
    borderRadius: 4,
  };

  const accentPurple = 'var(--accent-blue, #a855f7)';
  const accentOrange = 'var(--accent-orange, #FF6B00)';

  return (
    <div>
      {/* Header toggle */}
      <button
        onClick={() => setIsOpen((v) => !v)}
        style={{
          width: '100%',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: '4px 0',
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          color: accentPurple,
          fontFamily: 'var(--font-label)',
          fontSize: 10,
          fontWeight: 700,
          letterSpacing: 2,
          textTransform: 'uppercase',
        }}
      >
        <span style={{ fontSize: 12 }}>{isOpen ? '▼' : '▶'}</span>
        🎵 PLAYLIST
        {playlist.length > 0 && (
          <span style={{ fontSize: 8, color: 'var(--text-dim)', fontWeight: 400, marginLeft: 4 }}>
            ({playlist.length} track{playlist.length !== 1 ? 's' : ''})
          </span>
        )}
        {playlistIndex >= 0 && playlistIndex < playlist.length && (
          <span style={{ fontSize: 7, background: `${accentPurple}22`, border: `1px solid ${accentPurple}`, borderRadius: 2, padding: '1px 5px', marginLeft: 2, color: accentPurple }}>
            ► {playlistIndex + 1}/{playlist.length}
          </span>
        )}
      </button>

      {isOpen && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 4 }}>

          {/* Options row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 9, color: 'var(--text-dim)' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={autoAdvance}
                onChange={(e) => setAutoAdvance(e.target.checked)}
                style={{ accentColor: accentPurple, cursor: 'pointer' }}
              />
              AUTO-ADVANCE
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={saveImages}
                onChange={(e) => setSaveImages(e.target.checked)}
                style={{ accentColor: accentOrange, cursor: 'pointer' }}
              />
              SAVE IMAGES WITH TRACK
            </label>
          </div>

          {/* Export the song that's loaded right now — always available */}
          <button
            onClick={handleCurrentSongZip}
            style={{ ...actionBtn('#06b6d4'), flex: 'none', width: '100%', padding: '8px', fontSize: 9 }}
            title="Save the current song's audio, FX settings and Asset Bin images as one .zip"
          >
            📦 EXPORT CURRENT SONG (AUDIO + FX + IMAGES) .ZIP
          </button>

          {/* Track list */}
          {playlist.length === 0 ? (
            <div style={{ fontSize: 9, color: 'var(--text-dim)', padding: '8px 0', textAlign: 'center' }}>
              No tracks yet — click ADD TRACKS to load audio files.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {playlist.map((entry, idx) => {
                const isActive = idx === playlistIndex;
                return (
                  <div
                    key={entry.id}
                    style={{
                      ...sectionBg,
                      padding: '6px 8px',
                      borderColor: isActive ? accentPurple : 'var(--border-dim)',
                      boxShadow: isActive ? `0 0 8px ${accentPurple}44` : 'none',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 4,
                    }}
                  >
                    {/* Row 1: index + title + duration */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{
                        fontSize: 8,
                        color: isActive ? accentPurple : 'var(--text-dim)',
                        fontFamily: 'var(--font-mono)',
                        minWidth: 14,
                        fontWeight: isActive ? 800 : 400,
                      }}>
                        {isActive ? '►' : `${idx + 1}.`}
                      </span>

                      {editingId === entry.id ? (
                        <input
                          autoFocus
                          value={editingTitle}
                          onChange={(e) => setEditingTitle(e.target.value)}
                          onBlur={commitEditTitle}
                          onKeyDown={(e) => { if (e.key === 'Enter') commitEditTitle(); if (e.key === 'Escape') setEditingId(null); }}
                          style={{
                            flex: 1,
                            fontSize: 9,
                            fontFamily: 'var(--font-mono)',
                            background: 'var(--bg-secondary)',
                            border: `1px solid ${accentPurple}`,
                            color: 'var(--text-primary)',
                            borderRadius: 2,
                            padding: '2px 4px',
                            outline: 'none',
                          }}
                        />
                      ) : (
                        <span
                          onClick={() => startEditTitle(entry)}
                          style={{
                            flex: 1,
                            fontSize: 9,
                            color: isActive ? 'var(--text-primary)' : 'var(--text-primary)',
                            fontFamily: 'var(--font-mono)',
                            cursor: 'text',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            opacity: isActive ? 1 : 0.8,
                          }}
                          title="Click to rename"
                        >
                          {entry.title}
                        </span>
                      )}

                      <span style={{ fontSize: 8, color: 'var(--text-dim)', fontFamily: 'var(--font-mono)', flexShrink: 0 }}>
                        {formatDuration(entry.duration)}
                      </span>
                    </div>

                    {/* Row 2: preset badges */}
                    <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', alignItems: 'center' }}>
                      {entry.preset?.selectedStyle && (
                        <Badge text={entry.preset.selectedStyle.replace(/_/g, ' ')} color={accentPurple} />
                      )}
                      {entry.preset?.selectedEra && (
                        <Badge text={entry.preset.selectedEra.replace(/_/g, ' ').slice(0, 12)} color={accentOrange} />
                      )}
                      {entry.preset?.bpm && (
                        <Badge text={`${entry.preset.bpm} BPM`} color="#22d3ee" />
                      )}
                      {entry.assets?.length > 0 && (
                        <Badge text={`📷 ${entry.assets.length} imgs`} color="#10b981" />
                      )}
                    </div>

                    {/* Row 3: controls */}
                    <div style={{ display: 'flex', gap: 4, marginTop: 2 }}>
                      <button
                        onClick={() => onPlayTrack(entry, idx)}
                        style={{
                          fontSize: 8,
                          padding: '2px 8px',
                          backgroundColor: isActive ? accentPurple : 'var(--bg-secondary)',
                          border: `1px solid ${isActive ? accentPurple : 'var(--border-bright)'}`,
                          color: isActive ? '#000' : 'var(--text-primary)',
                          borderRadius: 2,
                          cursor: 'pointer',
                          fontWeight: 700,
                          fontFamily: 'var(--font-mono)',
                        }}
                      >
                        {isActive ? '► NOW PLAYING' : '► PLAY'}
                      </button>
                      <button
                        onClick={() => handleCapturePreset(entry.id)}
                        style={{
                          fontSize: 7,
                          padding: '2px 6px',
                          backgroundColor: 'transparent',
                          border: '1px solid var(--border-bright)',
                          color: accentOrange,
                          borderRadius: 2,
                          cursor: 'pointer',
                          fontFamily: 'var(--font-mono)',
                        }}
                        title="Save current FX settings to this track"
                      >
                        📸 CAPTURE FX
                      </button>
                      <div style={{ flex: 1 }} />
                      <button onClick={() => handleMove(entry.id, -1)} style={arrowBtn} title="Move up">↑</button>
                      <button onClick={() => handleMove(entry.id, 1)} style={arrowBtn} title="Move down">↓</button>
                      <button
                        onClick={() => handleRemove(entry.id)}
                        style={{ ...arrowBtn, color: '#ef4444', borderColor: '#ef444444' }}
                        title="Remove"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Action buttons */}
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 2 }}>
            <button
              onClick={() => fileInputRef.current?.click()}
              style={actionBtn(accentPurple)}
            >
              + ADD TRACKS
            </button>
            <button
              onClick={() => importInputRef.current?.click()}
              style={actionBtn('#a855f7')}
              title="Import playlist from a previously exported JSON file"
            >
              📂 IMPORT JSON
            </button>
            <button
              onClick={() => zipInputRef.current?.click()}
              style={actionBtn('#06b6d4')}
              title="Import a previously exported session ZIP (restores images too)"
            >
              📦 IMPORT ZIP
            </button>
            {playlist.length > 0 && (
              <>
                <button
                  onClick={() => onAdvanceTrack()}
                  style={actionBtn('#22d3ee')}
                  title="Skip to next track"
                >
                  ⏭ NEXT
                </button>
                <button
                  onClick={handleExport}
                  style={actionBtn('#10b981')}
                  title="Export playlist as JSON (no images)"
                >
                  💾 JSON
                </button>
                <button
                  onClick={handleZipExport}
                  style={actionBtn('#06b6d4')}
                  title="Export playlist + all images as a ZIP archive"
                >
                  📦 ZIP+IMG
                </button>
                <button
                  onClick={() => {
                    if (window.confirm('Clear entire playlist?')) {
                      onPlaylistChange((prev) => {
                        prev.forEach((e) => { if (e.url?.startsWith('blob:')) URL.revokeObjectURL(e.url); });
                        return [];
                      });
                    }
                  }}
                  style={actionBtn('#ef4444')}
                >
                  🗑 CLEAR
                </button>
              </>
            )}
          </div>

          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="audio/mpeg,audio/wav,audio/ogg,audio/flac,audio/x-wav,audio/x-flac,.mp3,.wav,.ogg,.flac"
            multiple
            onChange={handleAddTracks}
            style={{ display: 'none' }}
          />

          {/* Hidden JSON import input */}
          <input
            ref={importInputRef}
            type="file"
            accept=".json,application/json"
            onChange={handleImport}
            style={{ display: 'none' }}
          />

          {/* Hidden ZIP import input */}
          <input
            ref={zipInputRef}
            type="file"
            accept=".zip,application/zip"
            onChange={handleZipImport}
            style={{ display: 'none' }}
          />

          {/* Hint */}
          <div style={{ fontSize: 8, color: 'var(--text-dim)', lineHeight: 1.5 }}>
            Set up your FX (style, era, BPM…) then click{' '}
            <span style={{ color: accentOrange }}>📸 CAPTURE FX</span> on any track to save its preset.
            Use <span style={{ color: '#a855f7' }}>📂 IMPORT JSON</span> to restore a saved playlist (audio files must be re-added via ADD TRACKS).
            {autoAdvance && <> Auto-advance will load the next track's preset when the current song ends.</>}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Button style helpers ──────────────────────────────────────────────────────

const arrowBtn = {
  fontSize: 8,
  padding: '2px 5px',
  backgroundColor: 'transparent',
  border: '1px solid var(--border-bright)',
  color: 'var(--text-dim)',
  borderRadius: 2,
  cursor: 'pointer',
  fontFamily: 'var(--font-mono)',
};

const actionBtn = (color) => ({
  flex: '1 1 auto',
  fontSize: 8,
  padding: '5px 8px',
  backgroundColor: `${color}18`,
  border: `1px solid ${color}66`,
  color,
  borderRadius: 3,
  cursor: 'pointer',
  fontWeight: 700,
  fontFamily: 'var(--font-mono)',
  letterSpacing: 0.5,
});
