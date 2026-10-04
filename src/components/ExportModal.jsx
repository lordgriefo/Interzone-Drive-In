// src/components/ExportModal.jsx
// Dual-pipeline export controller dialog for The Kinet-O-Chop
// Mode A: Quick Web Export (MediaRecorder with canvas.captureStream + Tone.js)
// Mode B: HD Electron Render (Deterministic offline frame-by-frame FFmpeg)

import React, { useState, useEffect, useRef } from 'react';
import { X, Film, Zap, Download, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { isElectronEnvironment, startWebExport, runDeterministicOfflineExport, isMp4RecordingSupported } from '../utils/exportPipeline';
import { decodeAudioSource } from '../utils/offlineAudioAnalyzer';
import { QUALITY_PRESETS } from '../hooks/useVideoRecorder';
import { createProceduralAudioTrack } from '../constants/initialMedia';

export function ExportModal({
  isOpen = false,
  onClose = () => {},
  viewportElementId = 'main-viewport',
  audioDestinationRef,
  audioElement,
  audioSourceUrl,
  duration = 32,
  currentTime = 0,
  isPlaying = false,
  onStopPlayback = () => {},
  onSeek = () => {},
  onRenderFrame,
  onRenderEnd,
  sensitivity = 1.0,
}) {
  const isElectron = isElectronEnvironment();
  const [activeTab, setActiveTab] = useState(isElectron ? 'electron' : 'web');

  // Web mode state
  const [isWebRecording, setIsWebRecording] = useState(false);
  const [webQuality, setWebQuality] = useState('1080p-master');
  const [webFormat, setWebFormat] = useState('mp4');
  const [recordViewportOnly, setRecordViewportOnly] = useState(true);
  const webExportControllerRef = useRef(null);

  // Electron mode state
  const [isRendering, setIsRendering] = useState(false);
  const [electronFormat, setElectronFormat] = useState('mp4'); // 'mp4' | 'webm'
  const [electronFps, setElectronFps] = useState(60);
  const [ffmpegStatus, setFfmpegStatus] = useState(null);
  const [renderProgress, setRenderProgress] = useState({ currentFrame: 0, totalFrames: 0, percent: 0, currentTime: 0 });
  const [renderResult, setRenderResult] = useState(null);
  const [renderError, setRenderError] = useState(null);
  const abortControllerRef = useRef(null);

  useEffect(() => {
    if (isElectron && window.electronAPI?.getStatus) {
      window.electronAPI.getStatus().then(setFfmpegStatus).catch(() => {});
    }
  }, [isElectron, isOpen]);

  useEffect(() => {
    if (!isOpen && isWebRecording && webExportControllerRef.current) {
      webExportControllerRef.current.stop();
      setIsWebRecording(false);
    }
  }, [isOpen, isWebRecording]);

  if (!isOpen) return null;

  // ── Mode A: Web Recording Handlers ──
  const handleToggleWebRecord = async () => {
    if (isWebRecording) {
      if (webExportControllerRef.current) {
        webExportControllerRef.current.stop();
        webExportControllerRef.current = null;
      }
      setIsWebRecording(false);
      return;
    }

    const viewportEl = document.getElementById(viewportElementId);
    if (!viewportEl) {
      alert('Viewport element not found.');
      return;
    }

    const controller = await startWebExport({
      viewportElement: viewportEl,
      audioDestinationRef,
      exportQuality: webQuality,
      exportFormat: webFormat,
      recordViewportOnly,
      onStop: () => {
        setIsWebRecording(false);
        webExportControllerRef.current = null;
      },
      onError: (err) => {
        alert('Web export failed: ' + err.message);
        setIsWebRecording(false);
      },
    });

    if (controller) {
      webExportControllerRef.current = controller;
      setIsWebRecording(true);
    }
  };

  // ── Mode B: Deterministic Electron Render Handlers ──
  const handleStartElectronRender = async () => {
    if (!isElectron) return;

    setIsRendering(true);
    setRenderError(null);
    setRenderResult(null);
    setRenderProgress({ currentFrame: 0, totalFrames: 0, percent: 0, currentTime: 0 });

    // Stop real-time audio playback so it doesn't conflict with or distort during export
    onStopPlayback?.();

    abortControllerRef.current = new AbortController();

    try {
      // Decode audio for deterministic offline sampling
      const audioSource = audioSourceUrl || audioElement?.src || createProceduralAudioTrack(duration || 32, 120);
      const audioBuffer = await decodeAudioSource(audioSource);

      // Use the decoded audioBuffer duration as the ground truth.
      // The 'duration' prop may be stale or mismatched — audioBuffer.duration never lies.
      const renderDuration = (audioBuffer?.duration > 0.5) ? audioBuffer.duration : (duration || 30);

      const viewportEl = document.getElementById(viewportElementId);
      const bounds = viewportEl ? viewportEl.getBoundingClientRect() : null;

      const rect = bounds ? {
        x: Math.round(bounds.left),
        y: Math.round(bounds.top),
        width: Math.max(2, Math.floor(bounds.width / 2) * 2),
        height: Math.max(2, Math.floor(bounds.height / 2) * 2),
      } : { x: 0, y: 0, width: 1920, height: 1080 };

      // Render snapshot function for Mode B
      const renderFrameSnapshot = async (timestamp, signals, frameIndex) => {
        // 1. Advance timeline and feed deterministic signals into visualizer
        if (onRenderFrame) {
          onRenderFrame(timestamp, signals, frameIndex);
        } else {
          onSeek(timestamp);
        }

        // 2. Wait 1 tick for DOM, Three.js & WebGL paint (1 is sufficient for capturePage)
        await new Promise((r) => requestAnimationFrame(r));

        // 3. Capture exact viewport rect via native Chromium buffer
        if (window.electronAPI?.captureViewportFrame) {
          await window.electronAPI.captureViewportFrame(rect);
          return true;
        }

        return false;
      };

      const result = await runDeterministicOfflineExport({
        audioBuffer,
        audioSourceUrl: audioSource,
        duration: renderDuration,
        fps: electronFps,
        format: electronFormat,
        sensitivity,
        renderFrameSnapshot,
        onProgress: (p) => setRenderProgress(p),
        onComplete: (res) => {
          setRenderResult(res);
          setIsRendering(false);
          onRenderEnd?.();
        },
        onError: (err) => {
          setRenderError(err.message);
          setIsRendering(false);
          onRenderEnd?.();
        },
        abortController: abortControllerRef.current,
      });

      if (result?.canceled) {
        setIsRendering(false);
        onRenderEnd?.();
      }
    } catch (err) {
      setRenderError(err.message);
      setIsRendering(false);
      onRenderEnd?.();
    }
  };

  const handleCancelElectronRender = async () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    if (window.electronAPI?.cancelExport) {
      await window.electronAPI.cancelExport();
    }
    setIsRendering(false);
    onRenderEnd?.();
  };

  // During offline render: show compact floating HUD in bottom-right so #main-viewport is completely unobstructed!
  if (isRendering) {
    return (
      <div
        style={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          width: 360,
          backgroundColor: 'rgba(13, 13, 18, 0.95)',
          backdropFilter: 'blur(10px)',
          border: '1px solid #a855f7',
          borderRadius: 8,
          boxShadow: '0 8px 32px rgba(0,0,0,0.9), 0 0 16px rgba(168,85,247,0.35)',
          color: '#e2e8f0',
          fontFamily: 'var(--font-mono, monospace)',
          zIndex: 9999,
          padding: 16,
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#a855f7', boxShadow: '0 0 8px #a855f7' }} />
            <span style={{ fontWeight: 800, fontSize: 11, color: '#c084fc' }}>
              ENCODING {electronFormat.toUpperCase()} ({electronFps} FPS)
            </span>
          </div>
          <span style={{ fontSize: 12, color: '#fff', fontWeight: 800 }}>
            {renderProgress.percent.toFixed(1)}%
          </span>
        </div>

        {/* Progress bar */}
        <div style={{ width: '100%', height: 6, backgroundColor: '#262635', borderRadius: 3, overflow: 'hidden' }}>
          <div
            style={{
              width: `${renderProgress.percent}%`,
              height: '100%',
              backgroundColor: '#a855f7',
              transition: 'width 0.1s linear',
            }}
          />
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 10, color: '#a1a1aa' }}>
          <span>
            Frame {renderProgress.currentFrame} / {renderProgress.totalFrames} ({renderProgress.currentTime.toFixed(2)}s)
          </span>
          <button
            onClick={handleCancelElectronRender}
            style={{
              padding: '4px 10px',
              backgroundColor: '#ef4444',
              border: 'none',
              borderRadius: 3,
              color: '#fff',
              fontSize: 9,
              fontWeight: 800,
              cursor: 'pointer',
            }}
          >
            CANCEL
          </button>
        </div>
      </div>
    );
  }

  // During web recording: collapse to a small HUD so the viewport is unobstructed for screen capture
  if (isWebRecording) {
    return (
      <div
        style={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          width: 320,
          backgroundColor: 'rgba(13, 13, 18, 0.95)',
          backdropFilter: 'blur(10px)',
          border: '1px solid #ef4444',
          borderRadius: 8,
          boxShadow: '0 8px 32px rgba(0,0,0,0.9), 0 0 16px rgba(239,68,68,0.35)',
          color: '#e2e8f0',
          fontFamily: 'var(--font-mono, monospace)',
          zIndex: 9999,
          padding: 14,
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {/* Pulsing red dot */}
            <span style={{
              width: 10, height: 10, borderRadius: '50%',
              backgroundColor: '#ef4444',
              boxShadow: '0 0 8px #ef4444',
              animation: 'pulse 1s ease-in-out infinite',
            }} />
            <span style={{ fontWeight: 800, fontSize: 11, color: '#f87171' }}>
              ⏺ RECORDING LIVE
            </span>
          </div>
          <span style={{ fontSize: 9, color: '#a1a1aa' }}>
            {webQuality.toUpperCase()} · {webFormat.toUpperCase()}
          </span>
        </div>

        <div style={{ fontSize: 10, color: '#a1a1aa', lineHeight: 1.4 }}>
          Capturing your screen. Play your music — click <strong style={{ color: '#fff' }}>■ STOP</strong> when done.
        </div>

        <button
          onClick={handleToggleWebRecord}
          style={{
            padding: '8px 12px',
            backgroundColor: '#ef4444',
            border: 'none',
            borderRadius: 4,
            color: '#fff',
            fontSize: 11,
            fontWeight: 800,
            cursor: 'pointer',
            letterSpacing: 0.5,
          }}
        >
          ■ STOP & SAVE VIDEO
        </button>
      </div>
    );
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.85)',
        backdropFilter: 'blur(6px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: 20,
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 620,
          backgroundColor: '#0d0d12',
          border: '1px solid var(--border-bright, #262635)',
          borderRadius: 8,
          boxShadow: '0 16px 48px rgba(0,0,0,0.85)',
          color: '#e2e8f0',
          fontFamily: 'var(--font-mono, monospace)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Modal Header ── */}
        <div
          style={{
            padding: '12px 16px',
            borderBottom: '1px solid var(--border-dim, #1e1e2d)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: '#121218',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Film size={18} color="var(--accent-cyan, #00e5ff)" />
            <span style={{ fontWeight: 800, letterSpacing: 1, fontSize: 13 }}>
              EXPORT VIDEO CONTROLLER
            </span>
            <span
              style={{
                fontSize: 9,
                padding: '2px 8px',
                borderRadius: 4,
                fontWeight: 700,
                backgroundColor: isElectron ? 'rgba(16,185,129,0.2)' : 'rgba(0,229,255,0.15)',
                color: isElectron ? '#10b981' : 'var(--accent-cyan, #00e5ff)',
                border: isElectron ? '1px solid #10b981' : '1px solid var(--accent-cyan, #00e5ff)',
              }}
            >
              {isElectron ? '⚡ DESKTOP / ELECTRON' : '🌐 BROWSER WEB MODE'}
            </span>
          </div>

          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#888',
              cursor: 'pointer',
              padding: 4,
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* ── Mode Selection Tabs ── */}
        <div
          style={{
            display: 'flex',
            borderBottom: '1px solid var(--border-dim, #1e1e2d)',
            backgroundColor: '#09090d',
          }}
        >
          <button
            onClick={() => setActiveTab('web')}
            style={{
              flex: 1,
              padding: '10px 14px',
              border: 'none',
              borderBottom: activeTab === 'web' ? '2px solid var(--accent-cyan, #00e5ff)' : '2px solid transparent',
              backgroundColor: activeTab === 'web' ? 'rgba(0,229,255,0.06)' : 'transparent',
              color: activeTab === 'web' ? 'var(--accent-cyan, #00e5ff)' : '#71717a',
              fontWeight: 700,
              fontSize: 11,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
            }}
          >
            <Download size={14} />
            MODE A: QUICK WEB EXPORT
          </button>

          <button
            onClick={() => setActiveTab('electron')}
            style={{
              flex: 1,
              padding: '10px 14px',
              border: 'none',
              borderBottom: activeTab === 'electron' ? '2px solid #a855f7' : '2px solid transparent',
              backgroundColor: activeTab === 'electron' ? 'rgba(168,85,247,0.06)' : 'transparent',
              color: activeTab === 'electron' ? '#c084fc' : '#71717a',
              fontWeight: 700,
              fontSize: 11,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
            }}
          >
            <Zap size={14} />
            MODE B: HD ELECTRON RENDER
          </button>
        </div>

        {/* ── Tab Content ── */}
        <div style={{ padding: 20 }}>
          {activeTab === 'web' ? (
            /* ── MODE A: WEB MEDIARECORDER ── */
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ fontSize: 11, color: '#a1a1aa', lineHeight: 1.5 }}>
                {isElectron
                  ? <>Real-time screen capture via <code style={{ color: 'var(--accent-cyan)' }}>getDisplayMedia</code>. <strong style={{ color: '#e2e8f0' }}>Press Play first, then click Record.</strong> A source picker will appear — select this window. Stop recording when your music ends.</>
                  : <>Direct browser capture utilizing <code style={{ color: 'var(--accent-cyan)' }}>getDisplayMedia</code> and Tone.js master audio mix. Streams directly to a high-bitrate MP4 or WebM blob and triggers a browser download.</>
                }
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 12 }}>
                <div>
                  <label style={{ fontSize: 10, color: '#888', display: 'block', marginBottom: 4 }}>FORMAT</label>
                  <select
                    value={webFormat}
                    onChange={(e) => setWebFormat(e.target.value)}
                    disabled={isWebRecording}
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      backgroundColor: '#181820',
                      border: '1px solid #333344',
                      color: '#fff',
                      borderRadius: 4,
                      fontSize: 11,
                    }}
                  >
                    <option value="mp4">MP4 (NLE / Editor)</option>
                    <option value="webm">WebM (VP9 Master)</option>
                    <option value="auto">Auto-Detect</option>
                  </select>
                  {/* Show a note if MP4 isn't natively supported by MediaRecorder */}
                  {webFormat === 'mp4' && !isMp4RecordingSupported() && (
                    <div style={{ fontSize: 9, color: '#f59e0b', marginTop: 4, lineHeight: 1.4 }}>
                      ⚠ MP4 not supported by this browser/build — recording will auto-switch to WebM. Use Mode B (Electron) for true MP4 output.
                    </div>
                  )}
                </div>

                <div>
                  <label style={{ fontSize: 10, color: '#888', display: 'block', marginBottom: 4 }}>QUALITY & BITRATE</label>
                  <select
                    value={webQuality}
                    onChange={(e) => setWebQuality(e.target.value)}
                    disabled={isWebRecording}
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      backgroundColor: '#181820',
                      border: '1px solid #333344',
                      color: '#fff',
                      borderRadius: 4,
                      fontSize: 11,
                    }}
                  >
                    {Object.entries(QUALITY_PRESETS).map(([key, preset]) => (
                      <option key={key} value={key}>{preset.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <label style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                fontSize: 10,
                color: recordViewportOnly ? 'var(--accent-cyan, #00e5ff)' : '#a1a1aa',
                cursor: 'pointer',
                userSelect: 'none',
              }}>
                <input
                  type="checkbox"
                  checked={recordViewportOnly}
                  onChange={(e) => setRecordViewportOnly(e.target.checked)}
                  style={{ accentColor: 'var(--accent-cyan, #00e5ff)', cursor: 'pointer' }}
                />
                Record Viewport Only (crops out sidebars, timeline & studio UI)
              </label>

              <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                <button
                  onClick={handleToggleWebRecord}
                  style={{
                    flex: 1,
                    padding: '12px',
                    borderRadius: 6,
                    fontWeight: 800,
                    fontSize: 12,
                    letterSpacing: 0.5,
                    border: 'none',
                    cursor: 'pointer',
                    backgroundColor: isWebRecording ? '#ef4444' : 'var(--accent-cyan, #00e5ff)',
                    color: isWebRecording ? '#fff' : '#000',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    transition: 'all 0.15s',
                  }}
                >
                  {isWebRecording ? '■ STOP & SAVE VIDEO' : '⏺ START RECORDING'}
                </button>
              </div>

              {isWebRecording && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#ef4444', fontSize: 11 }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#ef4444', animation: 'pulse 1s infinite' }} />
                  Recording live — press ■ STOP when your music ends to save.
                </div>
              )}
            </div>
          ) : (
            /* ── MODE B: ELECTRON DETERMINISTIC RENDER ── */
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ fontSize: 11, color: '#a1a1aa', lineHeight: 1.5 }}>
                Decoupled offline rendering pipeline with fixed <code style={{ color: '#c084fc' }}>Δt = 1/60s (16.666 ms)</code> step. Advances Tone.js timeline and Meyda spectral state deterministically, streaming lossless PNG frames to a native FFmpeg process.
              </div>

              {!isElectron ? (
                <div
                  style={{
                    padding: 16,
                    borderRadius: 6,
                    backgroundColor: 'rgba(234,179,8,0.1)',
                    border: '1px solid rgba(234,179,8,0.3)',
                    color: '#fef08a',
                    fontSize: 11,
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 12,
                  }}
                >
                  <AlertCircle size={20} color="#eab308" style={{ flexShrink: 0, marginTop: 2 }} />
                  <div>
                    <div style={{ fontWeight: 700, marginBottom: 4 }}>Electron Desktop Environment Required</div>
                    <div>
                      Mode B requires direct access to system processes to spawn local FFmpeg and pipe raw frame buffers. In your browser tab, please use <strong>Mode A (Quick Web Export)</strong> which records directly using high-bitrate MediaRecorder.
                    </div>
                  </div>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {/* Status Banner */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 12px',
                    borderRadius: 4,
                    backgroundColor: '#14141d',
                    border: '1px solid #262635',
                    fontSize: 10,
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        backgroundColor: ffmpegStatus?.available !== false ? '#10b981' : '#ef4444',
                        boxShadow: ffmpegStatus?.available !== false ? '0 0 6px #10b981' : 'none',
                      }} />
                      <span style={{ fontWeight: 700, color: '#fff' }}>
                        {ffmpegStatus?.available !== false ? 'Native FFmpeg Ready' : 'FFmpeg Not Found'}
                      </span>
                      <span style={{ color: '#888', fontSize: 9 }}>
                        {ffmpegStatus?.isBundled ? '(Bundled Native Binary)' : ffmpegStatus?.path ? `(${ffmpegStatus.path})` : ''}
                      </span>
                    </div>
                    <span style={{ color: '#c084fc', fontWeight: 800, fontFamily: 'var(--font-mono)' }}>
                      OFFLINE Δt PIPE
                    </span>
                  </div>

                  {/* Format & Framerate Controls */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <div>
                      <label style={{ fontSize: 10, color: '#888', display: 'block', marginBottom: 4 }}>ENCODING CONTAINER</label>
                      <select
                        value={electronFormat}
                        onChange={(e) => setElectronFormat(e.target.value)}
                        disabled={isRendering}
                        style={{
                          width: '100%',
                          padding: '8px 10px',
                          backgroundColor: '#181820',
                          border: '1px solid #333344',
                          color: '#fff',
                          borderRadius: 4,
                          fontSize: 11,
                        }}
                      >
                        <option value="mp4">MP4 (H.264 / AAC — NLE Standard)</option>
                        <option value="webm">WebM (VP9 / Opus — Web Master)</option>
                      </select>
                    </div>

                    <div>
                      <label style={{ fontSize: 10, color: '#888', display: 'block', marginBottom: 4 }}>TIMING & FRAME RATE</label>
                      <select
                        value={electronFps}
                        onChange={(e) => setElectronFps(Number(e.target.value))}
                        disabled={isRendering}
                        style={{
                          width: '100%',
                          padding: '8px 10px',
                          backgroundColor: '#181820',
                          border: '1px solid #333344',
                          color: '#fff',
                          borderRadius: 4,
                          fontSize: 11,
                        }}
                      >
                        <option value={60}>60.000 FPS (Zero-Jank Master)</option>
                        <option value={30}>30.000 FPS (Standard / Fast)</option>
                        <option value={24}>24.000 FPS (Cinema / Quick Draft)</option>
                      </select>
                    </div>
                  </div>

                  {isRendering ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, padding: 14, backgroundColor: '#14141d', borderRadius: 6 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11 }}>
                        <span style={{ color: '#c084fc', fontWeight: 700 }}>
                          Rendering Frame {renderProgress.currentFrame} / {renderProgress.totalFrames} ({electronFormat.toUpperCase()})
                        </span>
                        <span style={{ color: '#fff' }}>{renderProgress.percent.toFixed(1)}%</span>
                      </div>

                      {/* Progress bar */}
                      <div style={{ width: '100%', height: 8, backgroundColor: '#262635', borderRadius: 4, overflow: 'hidden' }}>
                        <div
                          style={{
                            width: `${renderProgress.percent}%`,
                            height: '100%',
                            backgroundColor: '#a855f7',
                            transition: 'width 0.1s linear',
                          }}
                        />
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 6 }}>
                        <span style={{ fontSize: 10, color: '#888' }}>
                          Timeline step: {renderProgress.currentTime.toFixed(2)}s
                        </span>
                        <button
                          onClick={handleCancelElectronRender}
                          style={{
                            padding: '4px 10px',
                            backgroundColor: '#ef4444',
                            border: 'none',
                            borderRadius: 4,
                            color: '#fff',
                            fontSize: 10,
                            fontWeight: 700,
                            cursor: 'pointer',
                          }}
                        >
                          CANCEL RENDER
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={handleStartElectronRender}
                      style={{
                        padding: '12px',
                        borderRadius: 6,
                        fontWeight: 800,
                        fontSize: 12,
                        letterSpacing: 0.5,
                        border: 'none',
                        cursor: 'pointer',
                        backgroundColor: '#a855f7',
                        color: '#fff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 8,
                      }}
                    >
                      <Zap size={16} />
                      START ZERO-JANK HD {electronFormat.toUpperCase()} RENDER
                    </button>
                  )}

                  {renderResult && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#10b981', fontSize: 11 }}>
                      <CheckCircle size={16} />
                      Render Complete! Saved to: {renderResult.outputPath}
                    </div>
                  )}

                  {renderError && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#ef4444', fontSize: 11 }}>
                      <AlertCircle size={16} />
                      {renderError}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
