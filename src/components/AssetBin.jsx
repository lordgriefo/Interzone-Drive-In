// src/components/AssetBin.jsx
// Media Bin — thumbnail grid, lightbox preview, Synchro-Vox puppet slot tagging

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { PUPPET_SLOTS, getSlotsForMode } from '../hooks/usePuppetEngine';

// All supported media types the bin can load
const MEDIA_ACCEPT = [
  // Images
  'image/png', 'image/jpeg', 'image/gif', 'image/webp', 'image/avif', 'image/svg+xml',
  // Video
  'video/mp4', 'video/webm', 'video/quicktime', 'video/x-matroska',
  // Extensions as fallback (some browsers need these)
  '.png', '.jpg', '.jpeg', '.gif', '.webp', '.avif',
  '.mp4', '.webm', '.mov', '.mkv',
].join(',');

// Lightweight lazy loader so 150+ offscreen thumbnails do not bombard network connections on startup
function LazyAssetThumbnail({ asset, isVideo }) {
  const [isVisible, setIsVisible] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    if (typeof IntersectionObserver === 'undefined') {
      setIsVisible(true);
      return;
    }
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          obs.disconnect();
        }
      },
      { rootMargin: '300px' }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div ref={containerRef} style={{ width: '100%', height: '100%', position: 'relative' }}>
      {isVisible ? (
        isVideo ? (
          <video
            src={asset.url}
            muted
            playsInline
            preload="metadata"
            style={{ width: '100%', height: '100%', objectFit: 'cover', pointerEvents: 'none' }}
          />
        ) : (
          <img
            src={asset.url}
            alt={asset.name}
            loading="lazy"
            decoding="async"
            draggable={false}
            style={{ width: '100%', height: '100%', objectFit: 'cover', pointerEvents: 'none' }}
          />
        )
      ) : (
        <div style={{
          width: '100%',
          height: '100%',
          backgroundColor: 'var(--bg-secondary)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <span style={{ fontSize: 10, color: 'var(--text-dim)', opacity: 0.35 }}>
            {isVideo ? '🎬' : '🖼'}
          </span>
        </div>
      )}
    </div>
  );
}

export function AssetBin({
  assets = [],
  onAddAssets = () => {},
  onRemoveAsset = () => {},
  onClearAll = () => {},
  selectedAssetIndex = 0,
  onSelectAsset = () => {},
  puppetSlots = {},
  setPuppetSlots = () => {},
  puppetMode = '2',
  setPuppetMode = () => {},
  puppetEnabled = true,
  setPuppetEnabled = () => {},
  puppetDisplayMode = 'overlay',
  setPuppetDisplayMode = () => {},
  activeSlot,
  isPlaying = false,
  onReorderAssets = () => {},
  onDuplicateAsset = () => {},
  onRenameAsset = () => {},
  onAddToTimeline = () => {},
}) {
  const [isRenaming, setIsRenaming] = useState(false);
  const [renameText, setRenameText] = useState('');
  const [dragOverIndex, setDragOverIndex] = useState(null);
  const [lightboxIndex, setLightboxIndex] = useState(null);

  const selectedAsset = assets[selectedAssetIndex] || null;
  const selectedIsVideo = selectedAsset?.mediaType === 'video' || selectedAsset?.type === 'video' || selectedAsset?.url?.endsWith('.webm') || selectedAsset?.url?.endsWith('.mp4');

  // Lightbox keyboard navigation (Escape = close, Left/Right = cycle)
  useEffect(() => {
    if (lightboxIndex == null) return;
    const onKey = (e) => {
      if (e.key === 'Escape') {
        setLightboxIndex(null);
      } else if (e.key === 'ArrowLeft') {
        setLightboxIndex((curr) => (curr > 0 ? curr - 1 : assets.length - 1));
      } else if (e.key === 'ArrowRight') {
        setLightboxIndex((curr) => (curr < assets.length - 1 ? curr + 1 : 0));
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [lightboxIndex, assets.length]);

  // Toggle a puppet slot: clicking the same slot clears it; clicking a new one assigns it exclusively
  const handleSlotToggle = (slotKey, assetId) => {
    setPuppetSlots((prev) => ({
      ...prev,
      // If this asset is already in this slot, clear it; else assign (and remove from any other slot)
      ...Object.fromEntries(
        Object.keys(prev).map((k) => [
          k,
          k === slotKey
            ? (prev[k] === assetId ? null : assetId)   // toggle
            : prev[k] === assetId ? null : prev[k],     // evict from other slots
        ])
      ),
    }));
  };

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    const newAssets = files.map((file) => ({
      id: Math.random().toString(36).substring(2, 9),
      name: file.name,
      url: URL.createObjectURL(file),
      mediaType: file.type.startsWith('video/') ? 'video' : 'image',
    }));
    onAddAssets(newAssets);
    e.target.value = '';
  };

  const visibleSlots = getSlotsForMode(puppetMode);

  return (
    <div style={{
      width: 310,
      backgroundColor: 'var(--bg-panel)',
      borderRight: '1px solid var(--border-dim)',
      padding: 14,
      display: 'flex',
      flexDirection: 'column',
      gap: 10,
      fontSize: 11,
      color: 'var(--text-primary)',
      fontFamily: 'var(--font-label)',
      position: 'relative',
      zIndex: 2,
      overflowY: 'auto',
      overscrollBehavior: 'contain',
    }}>

      {/* ── HEADER ── */}
      <h3 style={{
        margin: 0,
        color: 'var(--accent-orange)',
        fontSize: 16,
        letterSpacing: '3px',
        fontFamily: "'Bebas Neue', var(--font-mono)",
        borderBottom: '1px solid var(--border-dim)',
        paddingBottom: 8,
        textShadow: '0 0 10px var(--accent-orange-glow)',
      }}>
        📁 MEDIA BIN
      </h3>

      {/* ── FILE DROP ZONE ── */}
      <label style={{
        backgroundColor: 'var(--bg-panel-alt)',
        border: '1px dashed var(--border-mid)',
        padding: '10px 8px',
        borderRadius: 5,
        textAlign: 'center',
        cursor: 'pointer',
        color: 'var(--accent-blue)',
        fontWeight: 700,
        fontSize: 10,
        letterSpacing: 0.5,
        transition: 'border-color 0.15s, background-color 0.15s',
        lineHeight: 1.5,
      }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = 'var(--accent-orange)';
          e.currentTarget.style.backgroundColor = 'var(--accent-orange-dim)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = 'var(--border-mid)';
          e.currentTarget.style.backgroundColor = 'var(--bg-panel-alt)';
        }}
      >
        + DROP / UPLOAD MEDIA
        <span style={{ display: 'block', fontSize: 8, color: 'var(--text-dim)', fontWeight: 400, marginTop: 3 }}>
          images · video (.mp4 .webm .mov .mkv) · gif · webp
        </span>
        <input
          type="file"
          multiple
          accept={MEDIA_ACCEPT}
          onChange={handleFileUpload}
          style={{ display: 'none' }}
        />
      </label>

      {/* ── CLEAR ALL ── */}
      <button
        type="button"
        onClick={onClearAll}
        disabled={assets.length === 0}
        style={{
          backgroundColor: assets.length === 0 ? 'var(--bg-panel-alt)' : 'rgba(127,29,29,0.6)',
          color: assets.length === 0 ? 'var(--text-dim)' : '#fecaca',
          border: `1px solid ${assets.length === 0 ? 'var(--border-dim)' : '#991b1b'}`,
          padding: '7px 8px',
          borderRadius: 4,
          fontWeight: 700,
          cursor: assets.length === 0 ? 'not-allowed' : 'pointer',
          fontSize: 10,
          fontFamily: 'var(--font-label)',
          transition: 'all 0.15s',
        }}
      >
        🗑 CLEAR ALL / RESET
      </button>

      {/* ── SELECTED ASSET PREVIEW PANEL ── */}
      {selectedAsset && (
        <div style={{
          backgroundColor: 'var(--bg-secondary)',
          border: '1px solid var(--border-bright)',
          borderRadius: 6,
          padding: 8,
          display: 'flex',
          flexDirection: 'column',
          gap: 6,
        }}>
          {/* Header row: Index counter & Name / Inline rename */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 4 }}>
            <span style={{
              fontSize: 8,
              color: 'var(--accent-orange)',
              fontFamily: 'var(--font-mono, monospace)',
              fontWeight: 800,
            }}>
              #{selectedAssetIndex + 1}/{assets.length}
            </span>

            {isRenaming ? (
              <input
                autoFocus
                type="text"
                value={renameText}
                onChange={(e) => setRenameText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    onRenameAsset(selectedAsset.id, renameText);
                    setIsRenaming(false);
                  } else if (e.key === 'Escape') {
                    setIsRenaming(false);
                  }
                }}
                onBlur={() => {
                  onRenameAsset(selectedAsset.id, renameText);
                  setIsRenaming(false);
                }}
                style={{
                  flex: 1,
                  background: 'var(--bg-panel)',
                  color: 'var(--text-primary)',
                  border: '1px solid var(--accent-orange)',
                  borderRadius: 3,
                  fontSize: 9,
                  padding: '1px 4px',
                }}
              />
            ) : (
              <span
                onDoubleClick={() => {
                  setRenameText(selectedAsset.name || '');
                  setIsRenaming(true);
                }}
                title="Double-click to rename"
                style={{
                  flex: 1,
                  fontSize: 9,
                  fontWeight: 700,
                  color: 'var(--text-primary)',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  cursor: 'text',
                }}
              >
                {selectedAsset.name || 'Untitled Asset'}
              </span>
            )}

            <button
              type="button"
              onClick={() => {
                if (isRenaming) {
                  onRenameAsset(selectedAsset.id, renameText);
                  setIsRenaming(false);
                } else {
                  setRenameText(selectedAsset.name || '');
                  setIsRenaming(true);
                }
              }}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--text-dim)',
                cursor: 'pointer',
                fontSize: 9,
                padding: '0 2px',
              }}
              title="Rename asset"
            >
              ✎
            </button>
          </div>

          {/* Large media display */}
          <div
            onClick={() => setLightboxIndex(selectedAssetIndex)}
            style={{
              position: 'relative',
              width: '100%',
              height: 125,
              backgroundColor: '#000',
              borderRadius: 4,
              overflow: 'hidden',
              cursor: 'zoom-in',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid var(--border-dim)',
            }}
            title="Click to view full lightbox"
          >
            {selectedIsVideo ? (
              <video
                src={selectedAsset.url}
                controls
                loop
                muted
                playsInline
                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
              />
            ) : (
              <img
                src={selectedAsset.url}
                alt={selectedAsset.name}
                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
              />
            )}

            <span style={{
              position: 'absolute',
              top: 4,
              right: 4,
              background: 'rgba(0,0,0,0.7)',
              color: '#fff',
              fontSize: 8,
              padding: '2px 4px',
              borderRadius: 2,
              pointerEvents: 'none',
            }}>
              🔍 ENLARGE
            </span>
          </div>

          {/* Action buttons: Reorder ◀ ▶, Dupe, + Timeline, Delete */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
            <button
              type="button"
              disabled={selectedAssetIndex <= 0}
              onClick={() => onReorderAssets(selectedAssetIndex, selectedAssetIndex - 1)}
              style={{
                flex: 1,
                background: 'var(--bg-panel-alt)',
                border: '1px solid var(--border-mid)',
                color: selectedAssetIndex <= 0 ? 'var(--text-dim)' : 'var(--text-primary)',
                borderRadius: 3,
                padding: '3px 0',
                fontSize: 9,
                fontWeight: 700,
                cursor: selectedAssetIndex <= 0 ? 'not-allowed' : 'pointer',
              }}
              title="Move earlier in Media Bin (and update timeline order)"
            >
              ◀
            </button>
            <button
              type="button"
              disabled={selectedAssetIndex >= assets.length - 1}
              onClick={() => onReorderAssets(selectedAssetIndex, selectedAssetIndex + 1)}
              style={{
                flex: 1,
                background: 'var(--bg-panel-alt)',
                border: '1px solid var(--border-mid)',
                color: selectedAssetIndex >= assets.length - 1 ? 'var(--text-dim)' : 'var(--text-primary)',
                borderRadius: 3,
                padding: '3px 0',
                fontSize: 9,
                fontWeight: 700,
                cursor: selectedAssetIndex >= assets.length - 1 ? 'not-allowed' : 'pointer',
              }}
              title="Move later in Media Bin (and update timeline order)"
            >
              ▶
            </button>
            <button
              type="button"
              onClick={() => onDuplicateAsset(selectedAsset.id)}
              style={{
                background: 'var(--bg-panel-alt)',
                border: '1px solid var(--border-mid)',
                color: 'var(--text-primary)',
                borderRadius: 3,
                padding: '3px 5px',
                fontSize: 8,
                fontWeight: 700,
                cursor: 'pointer',
              }}
              title="Duplicate this asset in the bin (so you can assign it to multiple Synchro-Vox phoneme slots)"
            >
              ⧉ DUPE
            </button>
            <button
              type="button"
              onClick={() => onAddToTimeline(selectedAsset.id)}
              style={{
                background: 'var(--accent-orange-dim)',
                border: '1px solid var(--accent-orange)',
                color: 'var(--accent-orange)',
                borderRadius: 3,
                padding: '3px 5px',
                fontSize: 8,
                fontWeight: 800,
                cursor: 'pointer',
              }}
              title="Drop this item onto the timeline at current playhead"
            >
              + TL
            </button>
            <button
              type="button"
              onClick={() => onRemoveAsset(selectedAsset.id)}
              style={{
                background: 'rgba(239, 68, 68, 0.2)',
                border: '1px solid #ef4444',
                color: '#fca5a5',
                borderRadius: 3,
                padding: '3px 5px',
                fontSize: 9,
                cursor: 'pointer',
              }}
              title="Delete asset from bin"
            >
              🗑
            </button>
          </div>

          {/* Quick Synchro-Vox Mouth Shape Assigner */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 3, marginTop: 2 }}>
            <span style={{ fontSize: 7, color: 'var(--text-dim)', letterSpacing: 0.5, fontWeight: 700 }}>
              ASSIGN MOUTH SHAPE:
            </span>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
              {visibleSlots.map(({ key, label, color }) => {
                const isTagged = puppetSlots?.[key] === selectedAsset.id;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => handleSlotToggle(key, selectedAsset.id)}
                    style={{
                      background: isTagged ? color : 'rgba(0,0,0,0.5)',
                      color: isTagged ? '#fff' : 'var(--text-dim)',
                      border: isTagged ? `1px solid ${color}` : '1px solid var(--border-mid)',
                      borderRadius: 3,
                      padding: '2px 5px',
                      fontSize: 8,
                      fontWeight: 800,
                      cursor: 'pointer',
                      boxShadow: isTagged ? `0 0 6px ${color}` : 'none',
                      transition: 'all 0.1s',
                    }}
                    title={`Assign this asset as mouth shape: ${label}`}
                  >
                    {isTagged ? `✓ ${label}` : label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ── ASSET GRID (Drag & drop reorder + quick shift buttons) ── */}
      <div style={{
        flexGrow: 1,
        overflowY: 'auto',
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: 7,
        alignContent: 'start',
      }}>
        {assets.map((asset, index) => {
          const isSelected = selectedAssetIndex === index;
          const isVideo    = asset.mediaType === 'video' || asset.type === 'video' || asset.url?.endsWith('.webm') || asset.url?.endsWith('.mp4');
          const isDropTarget = dragOverIndex === index;

          return (
            <div
              key={asset.id}
              draggable={true}
              onDragStart={(e) => {
                e.dataTransfer.setData('application/x-kinet-asset-index', String(index));
                e.dataTransfer.setData('application/x-kinet-asset', asset.id);
                e.dataTransfer.effectAllowed = 'copyMove';
              }}
              onDragOver={(e) => {
                e.preventDefault();
                e.dataTransfer.dropEffect = 'move';
                if (dragOverIndex !== index) setDragOverIndex(index);
              }}
              onDragLeave={() => {
                if (dragOverIndex === index) setDragOverIndex(null);
              }}
              onDrop={(e) => {
                e.preventDefault();
                setDragOverIndex(null);
                const rawIdx = e.dataTransfer.getData('application/x-kinet-asset-index');
                const fromIdx = parseInt(rawIdx, 10);
                if (!Number.isNaN(fromIdx) && fromIdx !== index) {
                  onReorderAssets?.(fromIdx, index);
                }
              }}
              onClick={() => onSelectAsset(index)}
              onDoubleClick={() => setLightboxIndex(index)}
              style={{
                position: 'relative',
                aspectRatio: '1',
                borderRadius: 4,
                overflow: 'hidden',
                border: isSelected
                  ? '2px solid var(--clip-selected-border)'
                  : isDropTarget
                    ? '2px dashed var(--accent-orange)'
                    : '1px solid var(--border-dim)',
                cursor: 'grab',
                backgroundColor: 'var(--bg-secondary)',
                boxShadow: isSelected
                  ? '0 0 8px var(--accent-orange-glow)'
                  : isDropTarget
                    ? '0 0 10px var(--accent-orange)'
                    : 'none',
                transform: isDropTarget ? 'scale(1.04)' : 'none',
                transition: 'box-shadow 0.12s, border-color 0.12s, transform 0.12s',
              }}
              title={`${asset.name} (Drag to reorder or drop on timeline · Double-click to enlarge)`}
            >
              {/* Thumbnail — lazy loaded image or video poster */}
              <LazyAssetThumbnail asset={asset} isVideo={isVideo} />

              {/* Order index badge */}
              <span style={{
                position: 'absolute',
                top: 2,
                left: 2,
                background: 'rgba(0,0,0,0.75)',
                color: isSelected ? 'var(--accent-orange)' : 'var(--text-dim)',
                fontSize: 7,
                padding: '1px 3px',
                borderRadius: 2,
                pointerEvents: 'none',
                fontFamily: 'var(--font-mono, monospace)',
                fontWeight: 700,
              }}>
                {index + 1}
              </span>

              {/* Video badge */}
              {isVideo && (
                <span style={{
                  position: 'absolute',
                  top: 2,
                  left: 18,
                  background: 'rgba(0,0,0,0.75)',
                  color: 'var(--accent-blue)',
                  fontSize: 7,
                  padding: '1px 3px',
                  borderRadius: 2,
                  pointerEvents: 'none',
                  fontWeight: 700,
                }}>
                  VID
                </span>
              )}

              {/* DELETE */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onRemoveAsset(asset.id);
                }}
                style={{
                  position: 'absolute',
                  top: 2,
                  right: 2,
                  background: 'rgba(0,0,0,0.75)',
                  color: '#ff6b6b',
                  border: 'none',
                  borderRadius: 2,
                  fontSize: 10,
                  cursor: 'pointer',
                  padding: '1px 4px',
                  lineHeight: 1,
                  zIndex: 3,
                }}
                title="Remove asset"
              >
                ✕
              </button>

              {/* ── SYNCHRO-VOX SLOT TAGS ── */}
              <div style={{
                position: 'absolute',
                bottom: 2,
                left: 2,
                right: 2,
                display: 'flex',
                flexWrap: 'wrap',
                gap: 2,
                zIndex: 3,
              }}>
                {visibleSlots.map(({ key, label, color }) => {
                  const isActive = puppetSlots?.[key] === asset.id;
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSlotToggle(key, asset.id);
                      }}
                      title={`Tag as ${label} mouth shape`}
                      style={{
                        background: isActive ? color : 'rgba(0,0,0,0.75)',
                        color: '#fff',
                        border: isActive ? `1px solid ${color}` : '1px solid rgba(255,255,255,0.1)',
                        borderRadius: 2,
                        fontSize: 6,
                        padding: '1px 3px',
                        cursor: 'pointer',
                        fontWeight: 800,
                        fontFamily: 'var(--font-mono, monospace)',
                        letterSpacing: 0.3,
                        lineHeight: 1.4,
                      }}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* ── SYNCHRO-VOX PUPPET PANEL ── */}
      <div style={{
        borderTop: '1px solid var(--border-dim)',
        paddingTop: 8,
        display: 'flex',
        flexDirection: 'column',
        gap: 6,
      }}>
        {/* Synchro-Vox Controls: Mode switcher + Live/Off toggle + Display mode toggle */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 4, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={{ fontSize: 9, color: 'var(--accent-orange, #ff6b00)', fontFamily: 'var(--font-mono)', fontWeight: 800 }}>
              🗣 SYNCHRO-VOX
            </span>
            <button
              onClick={() => setPuppetEnabled?.(!puppetEnabled)}
              style={{
                padding: '2px 6px',
                borderRadius: 3,
                border: puppetEnabled ? '1px solid #10b981' : '1px solid var(--border-dim)',
                backgroundColor: puppetEnabled ? 'rgba(16,185,129,0.2)' : 'transparent',
                color: puppetEnabled ? '#10b981' : 'var(--text-dim)',
                fontSize: 8,
                fontWeight: 800,
                cursor: 'pointer',
                fontFamily: 'var(--font-mono)',
              }}
              title={puppetEnabled ? 'Lip-sync is ACTIVE (audio drives mouth shapes)' : 'Lip-sync is BYPASSED (shows selected photos cleanly)'}
            >
              {puppetEnabled ? '● LIVE' : '○ OFF'}
            </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
            {/* Display mode: Overlay (Synchro-Vox over face) vs Swap (full frame) */}
            <button
              onClick={() => setPuppetDisplayMode?.(puppetDisplayMode === 'swap' ? 'overlay' : 'swap')}
              style={{
                padding: '2px 6px',
                borderRadius: 3,
                border: '1px solid var(--border-dim)',
                backgroundColor: 'rgba(255,255,255,0.06)',
                color: puppetDisplayMode === 'overlay' ? 'var(--accent-cyan, #00e5ff)' : '#c084fc',
                fontSize: 8,
                fontWeight: 800,
                cursor: 'pointer',
                fontFamily: 'var(--font-mono)',
              }}
              title={puppetDisplayMode === 'overlay' ? 'OVERLAY: Mouth animates on top of selected photo (Classic Synchro-Vox)' : 'SWAP: Mouth replaces full frame'}
            >
              {puppetDisplayMode === 'overlay' ? '🎭 OVERLAY' : '🔀 SWAP'}
            </button>

            {/* 2 / 4 / 8 sprite mode */}
            {['2', '4', '8'].map((m) => (
              <button
                key={m}
                onClick={() => setPuppetMode(m)}
                style={{
                  padding: '2px 5px',
                  borderRadius: 3,
                  border: puppetMode === m
                    ? '1px solid var(--accent-orange, #ff6b00)'
                    : '1px solid var(--border-dim)',
                  backgroundColor: puppetMode === m ? 'rgba(255,107,0,0.2)' : 'transparent',
                  color: puppetMode === m ? 'var(--accent-orange, #ff6b00)' : 'var(--text-dim)',
                  fontSize: 8,
                  fontWeight: 700,
                  cursor: 'pointer',
                  fontFamily: 'var(--font-mono)',
                }}
                title={`${m}-sprite mouth set`}
              >
                {m}
              </button>
            ))}
          </div>
        </div>

        {/* Mouth phoneme thumbnail grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: puppetMode === '8' ? 'repeat(4, 1fr)' : puppetMode === '4' ? 'repeat(4, 1fr)' : 'repeat(2, 1fr)',
          gap: 5,
          marginTop: 2,
        }}>
          {visibleSlots.map(({ key, label, color }) => {
            const assignedId = puppetSlots?.[key];
            const assignedAsset = assets?.find((a) => a.id === assignedId);
            const isSpeaking = activeSlot === key && isPlaying && puppetEnabled;

            return (
              <div
                key={key}
                onClick={() => {
                  if (assignedAsset) {
                    const idx = assets.findIndex((a) => a.id === assignedId);
                    if (idx >= 0) onSelectAsset(idx);
                  } else if (selectedAssetIndex !== undefined && assets[selectedAssetIndex]) {
                    handleSlotToggle(key, assets[selectedAssetIndex].id);
                  }
                }}
                title={
                  assignedAsset
                    ? `${label}: ${assignedAsset.name} (Click to preview)`
                    : `${label}: Empty (Select an image above & click here to assign)`
                }
                style={{
                  position: 'relative',
                  aspectRatio: '1',
                  borderRadius: 4,
                  overflow: 'hidden',
                  backgroundColor: assignedAsset ? '#000' : 'rgba(0,0,0,0.3)',
                  border: isSpeaking
                    ? '2px solid #fff'
                    : assignedAsset
                      ? `2px solid ${color}`
                      : `1px dashed ${color}66`,
                  boxShadow: isSpeaking
                    ? `0 0 10px ${color}, 0 0 4px #fff`
                    : assignedAsset
                      ? `0 0 5px ${color}44`
                      : 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.1s ease',
                }}
              >
                {assignedAsset ? (
                  <img
                    src={assignedAsset.url}
                    alt={label}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                    <span style={{ fontSize: 9, color: `${color}aa`, fontWeight: 800, lineHeight: 1 }}>+</span>
                    <span style={{ fontSize: 7, color: `${color}aa`, fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
                      {label}
                    </span>
                  </div>
                )}

                {/* Badge */}
                <span style={{
                  position: 'absolute',
                  bottom: 2,
                  left: 2,
                  background: isSpeaking ? '#fff' : color,
                  color: isSpeaking ? '#000' : '#fff',
                  fontSize: 6,
                  fontWeight: 900,
                  padding: '1px 3px',
                  borderRadius: 2,
                  fontFamily: 'var(--font-mono, monospace)',
                  pointerEvents: 'none',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.7)',
                }}>
                  {label}
                </span>

                {/* Unassign button */}
                {assignedAsset && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSlotToggle(key, assignedId);
                    }}
                    style={{
                      position: 'absolute',
                      top: 1,
                      right: 1,
                      background: 'rgba(0,0,0,0.8)',
                      color: '#ff6b6b',
                      border: 'none',
                      borderRadius: 2,
                      fontSize: 8,
                      cursor: 'pointer',
                      padding: '1px 3px',
                      lineHeight: 1,
                    }}
                    title={`Unassign ${label}`}
                  >
                    ✕
                  </button>
                )}
              </div>
            );
          })}
        </div>

        <div style={{ fontSize: 8, color: 'var(--text-dim)', lineHeight: 1.4 }}>
          Click any photo to bring it into view. Tag mouth shapes below to lip-sync.
        </div>
      </div>

      {/* ── LIGHTBOX MODAL ── */}
      {lightboxIndex != null && assets[lightboxIndex] && (
        <div
          onClick={() => setLightboxIndex(null)}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.88)',
            zIndex: 9999,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backdropFilter: 'blur(8px)',
            padding: 20,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              position: 'relative',
              maxWidth: '85vw',
              maxHeight: '82vh',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              backgroundColor: '#0d0d12',
              border: '1px solid var(--border-bright)',
              borderRadius: 8,
              padding: 12,
              boxShadow: '0 0 32px rgba(0,0,0,0.9)',
            }}
          >
            {/* Header */}
            <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, gap: 10 }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--accent-orange)', fontFamily: 'var(--font-mono)' }}>
                #{lightboxIndex + 1} · {assets[lightboxIndex].name}
              </span>
              <button
                type="button"
                onClick={() => setLightboxIndex(null)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#fff',
                  fontSize: 16,
                  cursor: 'pointer',
                  lineHeight: 1,
                  padding: '2px 6px',
                }}
                title="Close (Esc)"
              >
                ✕
              </button>
            </div>

            {/* Media */}
            <div style={{ maxWidth: '80vw', maxHeight: '65vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {(assets[lightboxIndex].mediaType === 'video' || assets[lightboxIndex].url?.endsWith('.webm') || assets[lightboxIndex].url?.endsWith('.mp4')) ? (
                <video
                  src={assets[lightboxIndex].url}
                  controls
                  autoPlay
                  loop
                  style={{ maxWidth: '100%', maxHeight: '65vh', borderRadius: 4 }}
                />
              ) : (
                <img
                  src={assets[lightboxIndex].url}
                  alt=""
                  style={{ maxWidth: '100%', maxHeight: '65vh', objectFit: 'contain', borderRadius: 4 }}
                />
              )}
            </div>

            {/* Navigation footer */}
            <div style={{ display: 'flex', gap: 12, marginTop: 10, alignItems: 'center' }}>
              <button
                type="button"
                onClick={() => setLightboxIndex((curr) => (curr > 0 ? curr - 1 : assets.length - 1))}
                style={{
                  background: 'var(--bg-panel-alt)',
                  border: '1px solid var(--border-mid)',
                  color: '#fff',
                  borderRadius: 4,
                  padding: '4px 12px',
                  fontSize: 11,
                  cursor: 'pointer',
                  fontWeight: 700,
                }}
                title="Previous (Left Arrow)"
              >
                ◀ PREV
              </button>
              <span style={{ fontSize: 10, color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>
                {lightboxIndex + 1} / {assets.length}
              </span>
              <button
                type="button"
                onClick={() => setLightboxIndex((curr) => (curr < assets.length - 1 ? curr + 1 : 0))}
                style={{
                  background: 'var(--bg-panel-alt)',
                  border: '1px solid var(--border-mid)',
                  color: '#fff',
                  borderRadius: 4,
                  padding: '4px 12px',
                  fontSize: 11,
                  cursor: 'pointer',
                  fontWeight: 700,
                }}
                title="Next (Right Arrow)"
              >
                NEXT ▶
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}