// src/components/AssetBin.jsx
// Media Bin — thumbnail grid, lightbox preview, Synchro-Vox puppet slot tagging

import React, { useState, useEffect, useCallback } from 'react';
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

export function AssetBin({
  assets,
  onAddAssets,
  onRemoveAsset,
  onClearAll,
  selectedAssetIndex,
  onSelectAsset,
  puppetSlots = {},
  setPuppetSlots,
  puppetMode = '2',
  setPuppetMode,
  puppetEnabled = true,
  setPuppetEnabled,
  puppetDisplayMode = 'overlay',
  setPuppetDisplayMode,
  activeSlot,
  isPlaying = false,
}) {
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
      width: 250,
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

      {/* ── ASSET GRID ── */}
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
          const isVideo    = asset.mediaType === 'video';

          return (
            <div
              key={asset.id}
              onClick={() => onSelectAsset(index)}
              style={{
                position: 'relative',
                aspectRatio: '1',
                borderRadius: 4,
                overflow: 'hidden',
                border: isSelected
                  ? '2px solid var(--clip-selected-border)'
                  : '1px solid var(--border-dim)',
                cursor: 'pointer',
                backgroundColor: 'var(--bg-secondary)',
                boxShadow: isSelected ? '0 0 8px var(--accent-orange-glow)' : 'none',
                transition: 'box-shadow 0.12s, border-color 0.12s',
              }}
            >
              {/* Thumbnail — image or video poster */}
              {isVideo ? (
                <video
                  src={asset.url}
                  muted
                  style={{ width: '100%', height: '100%', objectFit: 'cover', pointerEvents: 'none' }}
                />
              ) : (
                <img
                  src={asset.url}
                  alt={asset.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              )}

              {/* Video badge */}
              {isVideo && (
                <span style={{
                  position: 'absolute',
                  top: 2,
                  left: 2,
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
                }}
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
              }}>
                {visibleSlots.map(({ key, label, color }) => {
                  const isActive = puppetSlots?.[key] === asset.id;
                  return (
                    <button
                      key={key}
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
    </div>
  );
}