import React, { useState, useRef, useCallback, useMemo, useEffect } from 'react';

import { useAudioEngine }    from './hooks/useAudioEngine';
import { useVideoRecorder }  from './hooks/useVideoRecorder';
import { useTimelineState }  from './hooks/useTimelineState';
import { useDepthTextureLoader } from './hooks/useDepthTextureLoader';
import { useWebMVideoTexture } from './hooks/useWebMVideoTexture';
import { usePuppetEngine } from './hooks/usePuppetEngine';
import { useAutoDJ } from './hooks/useAutoDJ';

import { AppProvider }        from './AppContext';

import { AssetBin }           from './components/AssetBin';
import { FXConsole }          from './components/FXConsole';
import { InterzoneFrame }     from './components/InterZoneFrame';
import { MultiTrackTimeline } from './components/MultiTrackTimeline';
import { CanvasWorkspace }    from './components/CanvasWorkspace';
import { TransportBar }       from './components/TransportBar';
import { ExportModal }        from './components/ExportModal';
import { PlaylistPanel }      from './components/PlaylistPanel';
import { RoadsideMarquee }    from './components/RoadsideMarquee';
import { isElectronEnvironment } from './utils/exportPipeline';

import { interpolateAutomation } from './utils/timelineCrossfade';
import { evaluateCssEffect }     from './constants/cssEffectLibrary';
import { DEFAULT_MEDIA_ITEMS, createProceduralAudioTrack, createProceduralAudioDataUri } from './constants/initialMedia';
import { parseLrcString } from './utils/lrcParser';




export default function App() {
  const [sensitivity, setSensitivity] = useState(1.0);

  // ── View Mode: 'marquee' (The Interzone Drive-In 1930s Carnival) is the primary world ──
  const [viewMode, setViewMode] = useState(() => {
    if (typeof window !== 'undefined') {
      if (window.location.hash === '#kineto-cut') {
        return 'deck';
      }
    }
    // Default directly to 'marquee' so The Interzone Drive-In is front and center!
    return 'marquee';
  });

  // Keep URL hash in sync and handle browser Back/Forward
  useEffect(() => {
    const onHashChange = () => {
      if (window.location.hash === '#kineto-cut') {
        setViewMode('deck');
      } else {
        setViewMode('marquee');
      }
    };
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  const handleEnterDeck = useCallback(() => {
    setViewMode('deck');
    if (window.location.hash === '#carnival' || window.location.hash === '#lot') {
      window.location.hash = '#kineto-cut';
    }
  }, []);

  const handleExitToMarquee = useCallback(() => {
    setViewMode('marquee');
    if (window.location.hash !== '#carnival') {
      window.location.hash = '#carnival';
    }
  }, []);

  // ── Master BPM from timeline ──
  const [bpm, setBpm] = useState(120);

  const {
    loadAudioTrack,
    togglePlay,
    stopEngine,
    seekTo,
    isPlaying,
    currentTime,
    duration,
    waveformPeaks,
    transientMarkers,
    audioSignals,
    audioDestinationRef,
    audioElRef,
    transportClock,
    reverbPreset,
    setReverbPreset,
    reverbWet,
    setReverbWet,
    isLooping,
    setIsLooping,
    loopStart,
    setLoopStart,
    loopEnd,
    setLoopEnd,
    setLoopPoints,
    isAudioUnlocked,
    unlockAudio,
  } = useAudioEngine(sensitivity, bpm);

  // ── Dual-Pipeline Export Modal State ──
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  // ── Cinema Mode: hides panels + goes fullscreen for clean viewport recording ──
  const [cinemaMode, setCinemaMode] = useState(false);

  const handleToggleCinema = useCallback(() => {
    const next = !cinemaMode;
    setCinemaMode(next);
    const el = document.getElementById('main-viewport') || document.documentElement;
    if (next) {
      if (!document.fullscreenElement && el?.requestFullscreen) {
        el.requestFullscreen().catch((err) => {
          console.warn('[Cinema] Native fullscreen request not allowed or canceled:', err);
        });
      }
    } else {
      if (document.fullscreenElement && document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
    }
  }, [cinemaMode]);

  // When user presses Escape and fullscreen exits, also turn off cinema mode
  useEffect(() => {
    const onFsChange = () => {
      if (!document.fullscreenElement && cinemaMode) {
        setCinemaMode(false);
      }
    };
    document.addEventListener('fullscreenchange', onFsChange);
    return () => document.removeEventListener('fullscreenchange', onFsChange);
  }, [cinemaMode]);

  // Global key listener for Cinema Mode (C key to toggle, Escape to exit)
  useEffect(() => {
    const onKey = (e) => {
      const tag = document.activeElement?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
      if ((e.key === 'c' || e.key === 'C') && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        handleToggleCinema();
      }
      if (e.key === 'Escape' && cinemaMode) {
        e.preventDefault();
        handleToggleCinema();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [cinemaMode, handleToggleCinema]);





  const {
    isRecording,
    startRecording,
    stopRecording,
    exportQuality,
    setExportQuality,
    exportFormat,
    setExportFormat,
    recordViewportOnly,
    setRecordViewportOnly,
    qualityPresets,
  } = useVideoRecorder();

  // ── Lyric segments — populated by LRC/JSON sync engine (replaces Whisper) ──
  const [lyricSegments, setLyricSegments] = useState([]);


  // ── Asset state ──
  const [assets, setAssets] = useState(DEFAULT_MEDIA_ITEMS);
  const [selectedAssetIndex, setSelectedAssetIndex] = useState(0);

  // ── Synchro-Vox puppet lip-sync ──
  const [puppetMode, setPuppetMode] = useState('2'); // '2' | '4' | '8'
  const [puppetSlots, setPuppetSlots] = useState({
    rest: null, open: null, narrow: null, wide: null,
    teeth: null, pucker: null, midOpen: null, snap: null,
  });
  const [puppetEnabled, setPuppetEnabled] = useState(true);
  const [puppetDisplayMode, setPuppetDisplayMode] = useState('overlay'); // 'overlay' | 'swap'

  // Offline deterministic export state (Mode B)
  const [isOfflineRendering, setIsOfflineRendering] = useState(false);
  const [offlineAudioSignals, setOfflineAudioSignals] = useState(null);
  const [offlineCurrentTime, setOfflineCurrentTime] = useState(0);

  const effectiveAudioSignals = (isOfflineRendering && offlineAudioSignals) ? offlineAudioSignals : audioSignals;
  const effectiveIsPlaying = isPlaying || isOfflineRendering;
  const effectiveCurrentTime = isOfflineRendering ? offlineCurrentTime : currentTime;

  // Live Synchro-Vox audio-driven active phoneme and mouth URL
  const { activeSlot: puppetActiveSlot, activeUrl: puppetActiveUrl } = usePuppetEngine({
    puppetSlots,
    puppetMode,
    assets,
    audioSignals: effectiveAudioSignals,
    isPlaying: effectiveIsPlaying && puppetEnabled,
  });

  // ── FX / era state ──
  const [selectedEra,   setSelectedEra]   = useState('1902_melies');
  const [isEraLocked,   setIsEraLocked]   = useState(false);
  const [eraChangeCooldown, setEraChangeCooldown] = useState(8000); // 8000ms default
  const lastEraChangeTimeRef = useRef(0);
  const [selectedStyle, setSelectedStyle] = useState('montage');
  const [selectedRube,  setSelectedRube]  = useState('none');
  const [chaosLevel,    setChaosLevel]    = useState(0);
  const [rubeDecay,     setRubeDecay]     = useState(800);
  const [trackTitle,    setTrackTitle]    = useState('Excavating Neverland by The Magic Static Society');

  // ── Auto DJ ──
  const [autoDJEnabled,  setAutoDJEnabled]  = useState(false);
  const [autoDJMode,     setAutoDJMode]     = useState('full_random');
  const [autoDJInterval, setAutoDJInterval] = useState(12);

  useAutoDJ({
    enabled: autoDJEnabled,
    mode: autoDJMode,
    changeInterval: autoDJInterval,
    audioSignals,
    isPlaying,
    currentTime,
    currentEra: selectedEra,
    currentStyle: selectedStyle,
    currentRube: selectedRube,
    setEra: setSelectedEra,
    setStyle: setSelectedStyle,
    setRube: setSelectedRube,
    bpm,
  });

  const [moonVariant, setMoonVariant] = useState('classic_halo');
  const [moonFilter,  setMoonFilter]  = useState('silent_silver');
  const [lyricAlign,  setLyricAlign]  = useState('center');
  const [lyricSize,   setLyricSize]   = useState(1.4);
  const [lyricFont,   setLyricFont]   = useState('space_mono');

  // ── Chaos Mode ──
  const [chaosEnabled,    setChaosEnabled]    = useState(false);
  // ── Master FX Envelope Depth (1.0 = full, 0.0 = bypass) ──
  const [fxEnvelopeDepth, setFxEnvelopeDepth] = useState(1.0);

  // ── Phase 1.5: FX Section Markers (Track 3) ──
  const [fxMarkers, setFxMarkers] = useState([]);
  const MARKER_LABELS = ['INTRO', 'CUT-UP', 'BRIDGE', 'DROP', 'OUTRO'];
  const markerLabelCycleRef = useRef(0);

  const handleAddFxMarker = useCallback((time, overrides = {}) => {
    setFxMarkers((prev) => {
      // If overrides.id exists, this is a label-cycle update — replace matching id
      if (overrides.id) {
        return [...prev, { ...overrides }];
      }
      const label = MARKER_LABELS[markerLabelCycleRef.current % MARKER_LABELS.length];
      markerLabelCycleRef.current++;
      return [
        ...prev,
        { id: `m${Date.now()}`, time, duration: 8, label, intensity: 1.0 },
      ];
    });
  }, []);

  const handleRemoveFxMarker = useCallback((id) => {
    setFxMarkers((prev) => prev.filter((m) => m.id !== id));
  }, []);

  const handleUpdateFxMarker = useCallback((id, intensity) => {
    setFxMarkers((prev) =>
      prev.map((m) => (m.id === id ? { ...m, intensity } : m))
    );
  }, []);

  // ── Phase 1.5: Adaptive Theme ──
  const [adaptiveTheme, setAdaptiveTheme] = useState(false);

  // ── Playlist ──────────────────────────────────────────────────────────────
  const [playlist,       setPlaylist]      = useState([]);
  const [playlistIndex,  setPlaylistIndex] = useState(-1);
  const [autoAdvance,    setAutoAdvance]   = useState(true);
  const [saveImages,     setSaveImages]    = useState(false);
  const [playlistOpen,   setPlaylistOpen]  = useState(false);

  // Current preset snapshot — consumed by PlaylistPanel for capture
  const currentPreset = useMemo(() => ({
    selectedStyle,
    selectedEra,
    chaosLevel,
    chaosEnabled,
    sensitivity,
    bpm,
    reverbWet,
  }), [selectedStyle, selectedEra, chaosLevel, chaosEnabled, sensitivity, bpm, reverbWet]);

  // Load a playlist entry: load audio + apply its preset + (optionally) restore asset bin
  const handlePlayTrack = useCallback((entry, idx) => {
    setPlaylistIndex(idx);
    setTrackTitle(entry.title);
    lastAudioFileRef.current = entry.file || entry.url;
    loadAudioTrack(entry.file || entry.url);
    // Apply the entry's saved preset
    if (entry.preset) {
      if (entry.preset.selectedStyle !== undefined) setSelectedStyle(entry.preset.selectedStyle);
      if (entry.preset.selectedEra   !== undefined) setSelectedEra(entry.preset.selectedEra);
      if (entry.preset.chaosLevel    !== undefined) setChaosLevel(entry.preset.chaosLevel);
      if (entry.preset.chaosEnabled  !== undefined) setChaosEnabled(entry.preset.chaosEnabled);
      if (entry.preset.sensitivity   !== undefined) setSensitivity(entry.preset.sensitivity);
      if (entry.preset.bpm           !== undefined) setBpm(entry.preset.bpm);
      if (entry.preset.reverbWet     !== undefined) setReverbWet(entry.preset.reverbWet);
    }
    setLyricSegments([]);
  }, [loadAudioTrack, setReverbWet]);

  // Advance to the next track in the playlist
  const handlePlaylistAdvance = useCallback(() => {
    setPlaylistIndex((prev) => {
      const next = prev + 1;
      if (next < playlist.length) {
        const entry = playlist[next];
        handlePlayTrack(entry, next);
        return next;
      }
      // End of playlist — stop (or loop back to 0 if you want)
      return prev;
    });
  }, [playlist, handlePlayTrack]);

  // Wire HTML audio 'ended' event for auto-advance
  useEffect(() => {
    const el = audioElRef.current;
    if (!el) return;
    const onEnded = () => {
      if (autoAdvance && playlistIndex >= 0 && playlistIndex < playlist.length - 1) {
        handlePlaylistAdvance();
      }
    };
    el.addEventListener('ended', onEnded);
    return () => el.removeEventListener('ended', onEnded);
  }, [autoAdvance, playlistIndex, playlist, handlePlaylistAdvance, audioElRef]);

  // ── Phase 2: 2.5D Depth Displacement & Photogrammetry Pipeline ──
  const depthLoader = useDepthTextureLoader();
  const [depth3dEnabled, setDepth3dEnabled]     = useState(false);
  const [depthExtrusion, setDepthExtrusion]     = useState(2.0);
  const [depthFlySpeed, setDepthFlySpeed]       = useState(1.0);
  const [depthAudioZPulse, setDepthAudioZPulse] = useState(1.0);
  const [depthRenderMode, setDepthRenderMode]   = useState(0);

  // ── Phase 2: WebM Alpha Video Texture Pipeline & Grain Overlays ──
  const webmOverlay = useWebMVideoTexture();

  // ── MilkDrop & Psychedelic MV Visual Tricks ──
  const [liquidWarpEnabled, setLiquidWarpEnabled]     = useState(false);
  const [liquidWarpIntensity, setLiquidWarpIntensity] = useState(0.7);
  const [kaleidoscopeMode, setKaleidoscopeMode]       = useState('none'); // 'none' | '4way' | '8way'
  const [phosphorTrails, setPhosphorTrails]           = useState(false);
  const [chromaticPunch, setChromaticPunch]           = useState(false);
  const [fractalMode, setFractalMode]                 = useState('none'); // 'none' | 'spiral' | 'tunnel'
  const [alienBeam, setAlienBeam]                     = useState(false);
  const [warpDrive, setWarpDrive]                     = useState(false);
  const [lyricAnim, setLyricAnim]                     = useState('pulse_slam');

  useEffect(() => {
    depthLoader.syncPlayback(isPlaying);
    webmOverlay.syncPlayback(isPlaying);
  }, [isPlaying, depthLoader, webmOverlay]);

  // Auto-bind active asset from Media Bin to 2.5D Depth Engine (only when 3D is active)
  useEffect(() => {
    if (depth3dEnabled && assets.length > 0 && assets[selectedAssetIndex]?.url) {
      depthLoader.loadColorSource(assets[selectedAssetIndex].url);
    }
  }, [depth3dEnabled, assets, selectedAssetIndex]);


  // ── Rube Goldberg stage reporter (CanvasWorkspace → FXConsole LED strip) ──
  const [rubeStage, setRubeStage] = useState(0);
  const handleRubeStageChange = useCallback((s) => setRubeStage(s), []);


  const DEFAULT_TRACK_URL = './assets-bg/excavating-neverland.mp3';
  const DEFAULT_TRACK_TITLE = 'Excavating Neverland by The Magic Static Society';

  const lastAudioFileRef = useRef(DEFAULT_TRACK_URL);
  const hasAudioLoaded   = Boolean(lastAudioFileRef.current);

  // Auto-load Excavating Neverland track + synced LRC lyrics on startup
  useEffect(() => {
    try {
      loadAudioTrack(DEFAULT_TRACK_URL);
      setTrackTitle(DEFAULT_TRACK_TITLE);
      lastAudioFileRef.current = DEFAULT_TRACK_URL;
    } catch (err) {
      console.warn('[App] Default audio track init warning:', err);
    }

    // Auto-load synchronized LRC lyrics
    fetch('./assets-bg/excavating-neverland.lrc')
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.text();
      })
      .then((raw) => {
        const segs = parseLrcString(raw);
        if (segs.length > 0) setLyricSegments(segs);
      })
      .catch((err) => console.warn('[App] Default LRC lyrics load info:', err));
  }, [loadAudioTrack]);


  // ── Timeline state (includes full editing operations & undo/redo) ──
  const {
    videoClips,
    setVideoClips,
    updateClipStart,
    updateClip,
    clearVideoClips,
    splitClipAtTime,
    splitAtTime,
    toggleClipReverse,
    toggleClipMirror,
    duplicateClip,
    deleteClip,
    moveClipInOrder,
    packClips,
    shuffleClips,
    sortClipsByAssetOrder,
    copyClip,
    pasteClip,
    hasClipboard,
    addClipFromAsset,
    generateAutoMvCut,
    beginClipEdit,
    undo,
    redo,
    canUndo,
    canRedo,
    automationKeyframes,
    setAutomationKeyframes,
    addAutomationKeyframe,
    updateAutomationKeyframe,
    removeAutomationKeyframe,
  } = useTimelineState(assets, duration || 60, bpm, setBpm);

  // Consolidated editing operations bundle passed down to timeline and toolbar
  const timelineEdit = useMemo(() => ({
    beginClipEdit,
    updateClip,
    toggleClipReverse,
    toggleClipMirror,
    duplicateClip,
    deleteClip,
    moveClipInOrder,
    packClips,
    shuffleClips,
    sortClipsByAssetOrder,
    copyClip,
    pasteClip,
    hasClipboard,
    addClipFromAsset,
    generateAutoMvCut,
    splitAtTime,
    splitClipAtTime,
    undo,
    redo,
    canUndo,
    canRedo,
  }), [
    beginClipEdit,
    updateClip,
    toggleClipReverse,
    toggleClipMirror,
    duplicateClip,
    deleteClip,
    moveClipInOrder,
    packClips,
    shuffleClips,
    sortClipsByAssetOrder,
    copyClip,
    pasteClip,
    hasClipboard,
    addClipFromAsset,
    generateAutoMvCut,
    splitAtTime,
    splitClipAtTime,
    undo,
    redo,
    canUndo,
    canRedo,
  ]);

  // ── Modular CSS Automation Effect ──
  const [selectedCssEffect, setSelectedCssEffect] = useState('solarize_invert');

  const liveCssEffectStyle = useMemo(() => {
    const autoVal = interpolateAutomation(automationKeyframes, effectiveCurrentTime, 'value')
      ?? interpolateAutomation(automationKeyframes, effectiveCurrentTime, 'filterMix')
      ?? 0;
    return evaluateCssEffect(selectedCssEffect, autoVal);
  }, [automationKeyframes, effectiveCurrentTime, selectedCssEffect]);

  // ── Selected clip for editing operations ──
  const [selectedClipId, setSelectedClipId] = useState(null);


  // Effective chaos — gated by chaosEnabled toggle, scaled by fxEnvelopeDepth
  // Phase 1.5: further scaled by active Track 3 fxMarker intensity at currentTime
  const effectiveChaosLevel = useMemo(() => {
    if (!chaosEnabled) return 0;
    const automated = interpolateAutomation(automationKeyframes, effectiveCurrentTime, 'chaosLevel');
    // Base level from automation or manual slider
    const base = automated != null && effectiveIsPlaying
      ? automated * fxEnvelopeDepth
      : chaosLevel;

    // Find active T3 marker at effectiveCurrentTime (if any)
    // Marker spans [time, time + duration], default duration = 8s
    const activeMarker = fxMarkers.find((m) => {
      const end = m.time + (m.duration ?? 8);
      return effectiveCurrentTime >= m.time && effectiveCurrentTime < end;
    });

    // Multiply base level by marker intensity (1.0 = unchanged, 0.0 = muted, >1.0 = boost)
    const markerScale = activeMarker != null ? (activeMarker.intensity ?? 1.0) : 1.0;
    return base * markerScale;
  }, [chaosEnabled, automationKeyframes, effectiveCurrentTime, chaosLevel, effectiveIsPlaying, fxEnvelopeDepth, fxMarkers]);


  // ── Global editing hotkeys ──
  useEffect(() => {
    const onKey = (e) => {
      const tag = document.activeElement?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;

      // Undo / Redo: Ctrl+Z / Ctrl+Y / Ctrl+Shift+Z
      if ((e.ctrlKey || e.metaKey) && (e.key === 'z' || e.key === 'Z')) {
        e.preventDefault();
        if (e.shiftKey) {
          redo();
        } else {
          undo();
        }
        return;
      }
      if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || e.key === 'Y')) {
        e.preventDefault();
        redo();
        return;
      }

      // S — Blade split at playhead
      if ((e.key === 's' || e.key === 'S') && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        const res = splitAtTime(currentTime, selectedClipId);
        if (res?.rightId) setSelectedClipId(res.rightId);
        return;
      }

      // R — Reverse selected clip
      if ((e.key === 'r' || e.key === 'R') && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        if (selectedClipId) {
          toggleClipReverse(selectedClipId);
        }
        return;
      }

      // M — Mirror selected clip
      if ((e.key === 'm' || e.key === 'M') && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        if (selectedClipId) {
          toggleClipMirror(selectedClipId);
        }
        return;
      }

      // Ctrl+D — Duplicate selected clip
      if ((e.ctrlKey || e.metaKey) && (e.key === 'd' || e.key === 'D')) {
        e.preventDefault();
        if (selectedClipId) {
          const newId = duplicateClip(selectedClipId);
          if (newId) setSelectedClipId(newId);
        }
        return;
      }

      // Ctrl+C — Copy clip
      if ((e.ctrlKey || e.metaKey) && (e.key === 'c' || e.key === 'C')) {
        if (selectedClipId) {
          e.preventDefault();
          copyClip(selectedClipId);
        }
        return;
      }

      // Ctrl+V — Paste clip at playhead
      if ((e.ctrlKey || e.metaKey) && (e.key === 'v' || e.key === 'V')) {
        if (hasClipboard()) {
          e.preventDefault();
          const newId = pasteClip(currentTime);
          if (newId) setSelectedClipId(newId);
        }
        return;
      }

      // [ / ] — Move earlier / later in playback order
      if (e.key === '[' && selectedClipId) {
        e.preventDefault();
        moveClipInOrder(selectedClipId, -1);
        return;
      }
      if (e.key === ']' && selectedClipId) {
        e.preventDefault();
        moveClipInOrder(selectedClipId, 1);
        return;
      }

      // Delete / Backspace — Delete clip (or Shift+Delete for ripple delete)
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedClipId) {
          e.preventDefault();
          deleteClip(selectedClipId, e.shiftKey);
          setSelectedClipId(null);
        }
        return;
      }
    };

    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [
    selectedClipId,
    currentTime,
    splitAtTime,
    toggleClipReverse,
    toggleClipMirror,
    duplicateClip,
    copyClip,
    pasteClip,
    hasClipboard,
    moveClipInOrder,
    deleteClip,
    undo,
    redo,
  ]);

  // ── Handlers ──
  const handleEraMutate = useCallback((era, isManualOrSection = false) => {
    if (isEraLocked && !isManualOrSection) {
      return;
    }
    const cooldownSec = eraChangeCooldown / 1000;
    const elapsed = currentTime - lastEraChangeTimeRef.current;
    if (!isManualOrSection && elapsed < cooldownSec) {
      return;
    }
    setSelectedEra(era);
    lastEraChangeTimeRef.current = currentTime;
  }, [isEraLocked, eraChangeCooldown, currentTime]);

  const handleManualEraSelect = useCallback((era) => {
    setSelectedEra(era);
    lastEraChangeTimeRef.current = currentTime;
  }, [currentTime]);

  // ── Section Marker Binding (Auto-Mode) ──
  // Ensure manual selection of an era or explicit timeline section marker triggers
  // (e.g., Intro, Bridge, Outro) can override the cooldown period while respecting the user's manual choice.
  const lastSectionMarkerIdRef = useRef(null);
  useEffect(() => {
    if (!effectiveIsPlaying) {
      lastSectionMarkerIdRef.current = null;
      return;
    }

    const activeMarker = fxMarkers.find((m) => {
      const end = m.time + (m.duration ?? 8);
      return effectiveCurrentTime >= m.time && effectiveCurrentTime < end;
    });

    if (activeMarker && activeMarker.id !== lastSectionMarkerIdRef.current) {
      lastSectionMarkerIdRef.current = activeMarker.id;
      if (!isEraLocked) {
        const markerEraMap = {
          'INTRO': '1902_melies',
          'CUT-UP': 'lynchian_interzone',
          'BRIDGE': '1927_metropolis',
          'DROP': '2020_cyber',
          'OUTRO': '1970_grindhouse',
        };
        const eraForMarker = markerEraMap[activeMarker.label];
        if (eraForMarker) {
          handleEraMutate(eraForMarker, true); // true overrides cooldown
        }
      }
    }
  }, [effectiveCurrentTime, effectiveIsPlaying, fxMarkers, isEraLocked, handleEraMutate]);

  const handleRenderFrame = useCallback((timestamp, signals) => {
    setIsOfflineRendering(true);
    setOfflineAudioSignals(signals);
    setOfflineCurrentTime(timestamp);
  }, []);

  const handleRenderEnd = useCallback(() => {
    setIsOfflineRendering(false);
    setOfflineAudioSignals(null);
    setOfflineCurrentTime(0);
  }, []);

  const handleAddAssets = (newAssets) => setAssets((prev) => [...prev, ...newAssets]);

  const handleRemoveAsset = (id) => {
    setAssets((prev) => {
      // Clear any puppet slot that was pointing to this asset
      setPuppetSlots((slots) => {
        const next = { ...slots };
        Object.keys(next).forEach((key) => { if (next[key] === id) next[key] = null; });
        return next;
      });
      return prev.filter((a) => a.id !== id);
    });
  };

  const handleClearAllAssets = () => {
    assets.forEach((a) => { if (a.url?.startsWith('blob:')) URL.revokeObjectURL(a.url); });
    setAssets([]);
    setSelectedAssetIndex(0);
    setPuppetSlots({ rest: null, open: null, narrow: null, wide: null, teeth: null, pucker: null, midOpen: null, snap: null });
    clearVideoClips();
    setSelectedClipId(null);
  };

  // Reorder assets in Media Bin and automatically re-sequence timeline clips
  const handleReorderAssets = useCallback((fromIndex, toIndex) => {
    setAssets((prev) => {
      if (fromIndex < 0 || fromIndex >= prev.length || toIndex < 0 || toIndex >= prev.length) {
        return prev;
      }
      const updated = [...prev];
      const [moved] = updated.splice(fromIndex, 1);
      updated.splice(toIndex, 0, moved);

      // Re-sequence timeline clips to follow the new Media Bin order
      sortClipsByAssetOrder(updated);
      return updated;
    });

    // Keep selectedAssetIndex following the moved asset
    setSelectedAssetIndex((curr) => {
      if (curr === fromIndex) return toIndex;
      if (fromIndex < toIndex && curr > fromIndex && curr <= toIndex) return curr - 1;
      if (fromIndex > toIndex && curr >= toIndex && curr < fromIndex) return curr + 1;
      return curr;
    });
  }, [sortClipsByAssetOrder]);

  // Reorder Media Bin to match the timeline clip playback sequence
  const handleReorderAssetsByClips = useCallback(() => {
    if (videoClips.length === 0 || assets.length === 0) return;
    const firstSeen = new Map();
    [...videoClips].sort((a, b) => a.startTime - b.startTime).forEach((c) => {
      if (!firstSeen.has(c.assetId)) firstSeen.set(c.assetId, c.startTime);
    });

    setAssets((prev) => {
      return [...prev].sort((a, b) => {
        const tA = firstSeen.get(a.id) ?? 1e9;
        const tB = firstSeen.get(b.id) ?? 1e9;
        return tA - tB;
      });
    });
  }, [videoClips, assets.length]);

  // Duplicate an asset in the Media Bin so it can be tagged for different mouth shapes or cut differently
  const handleDuplicateAsset = useCallback((assetId) => {
    const src = assets.find((a) => a.id === assetId);
    if (!src) return;
    const newAsset = {
      ...src,
      id: Math.random().toString(36).substring(2, 9),
      name: `${src.name} (copy)`,
    };
    setAssets((prev) => {
      const idx = prev.findIndex((a) => a.id === assetId);
      const updated = [...prev];
      updated.splice(idx + 1, 0, newAsset);
      return updated;
    });
  }, [assets]);

  // Rename an asset
  const handleRenameAsset = useCallback((assetId, newName) => {
    if (!newName?.trim()) return;
    setAssets((prev) => prev.map((a) => (a.id === assetId ? { ...a, name: newName.trim() } : a)));
  }, []);

  const handleAudioUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setTrackTitle(file.name);
      lastAudioFileRef.current = file;
      loadAudioTrack(file);
      setLyricSegments([]); // clear LRC segments on new track load
    }
  };


  const handleToggleRecord = () => {
    if (isRecording) {
      stopRecording();
    } else {
      const element = document.getElementById('main-viewport');
      startRecording(element, audioDestinationRef, recordViewportOnly);
    }
  };

  const handleAddAutomationKeyframe = (time) => {
    addAutomationKeyframe(time, chaosLevel, 0.7);
  };

  return (
    <AppProvider
      audioSignals={audioSignals}
      selectedEra={selectedEra}
      setSelectedEra={setSelectedEra}
      selectedStyle={selectedStyle}
      setSelectedStyle={setSelectedStyle}
      selectedRube={selectedRube}
      setSelectedRube={setSelectedRube}
      assets={assets}
    >
      {viewMode === 'marquee' ? (
        <RoadsideMarquee onEnterDeck={handleEnterDeck} />
      ) : (
        <div style={{
          display: 'flex',
          width: '100vw',
          height: '100vh',
          backgroundColor: cinemaMode ? '#000' : 'var(--bg-primary)',
          overflow: 'hidden',
          position: 'relative',
        }}>

        {!cinemaMode && (
          <AssetBin
          assets={assets}
          onAddAssets={handleAddAssets}
          onRemoveAsset={handleRemoveAsset}
          onClearAll={handleClearAllAssets}
          selectedAssetIndex={selectedAssetIndex}
          onSelectAsset={setSelectedAssetIndex}
          puppetSlots={puppetSlots}
          setPuppetSlots={setPuppetSlots}
          puppetMode={puppetMode}
          setPuppetMode={setPuppetMode}
          puppetEnabled={puppetEnabled}
          setPuppetEnabled={setPuppetEnabled}
          puppetDisplayMode={puppetDisplayMode}
          setPuppetDisplayMode={setPuppetDisplayMode}
          activeSlot={puppetActiveSlot}
          isPlaying={isPlaying}
          onReorderAssets={handleReorderAssets}
          onDuplicateAsset={handleDuplicateAsset}
          onRenameAsset={handleRenameAsset}
          onAddToTimeline={(assetId) => {
            const newId = addClipFromAsset(assetId, currentTime);
            if (newId) setSelectedClipId(newId);
          }}
        />
        )}

        <InterzoneFrame
          cinemaMode={cinemaMode}
          onToggleCinema={handleToggleCinema}
          onExitToMarquee={handleExitToMarquee}
          isPlaying={isPlaying}
          trackTitle={trackTitle}
          audioSignals={audioSignals}
          moonVariant={moonVariant}
          moonFilter={moonFilter}
          rubeStage={rubeStage}
          selectedRube={selectedRube}
          timeline={(
            <MultiTrackTimeline
              duration={duration || 60}
              currentTime={currentTime}
              isPlaying={isPlaying}
              assets={assets}
              videoClips={videoClips}
              selectedClipId={selectedClipId}
              onSelectClip={setSelectedClipId}
              onUpdateClipStart={updateClipStart}
              onSplitClip={splitClipAtTime}
              onToggleReverse={toggleClipReverse}
              onDuplicateClip={duplicateClip}
              waveformPeaks={waveformPeaks}
              transientMarkers={transientMarkers}
              lyricSegments={lyricSegments}
              automationKeyframes={automationKeyframes}

              onAddAutomationKeyframe={addAutomationKeyframe}
              onUpdateAutomationKeyframe={updateAutomationKeyframe}
              onRemoveAutomationKeyframe={removeAutomationKeyframe}
              selectedCssEffect={selectedCssEffect}
              onSelectCssEffect={setSelectedCssEffect}
              isLooping={isLooping}
              loopStart={loopStart}
              loopEnd={loopEnd}
              onUpdateLoop={setLoopPoints}
              fxMarkers={fxMarkers}
              onAddFxMarker={handleAddFxMarker}
              onRemoveFxMarker={handleRemoveFxMarker}
              onUpdateFxMarker={handleUpdateFxMarker}
              bpm={bpm}
              onSeek={seekTo}
              edit={timelineEdit}
              selectedStyle={selectedStyle}
              onUseTimelineStyle={() => setSelectedStyle('timeline')}
              onReorderAssetsByClips={handleReorderAssetsByClips}
              onTogglePlay={togglePlay}
              onStop={stopEngine}
              onToggleLoop={() => setIsLooping((v) => !v)}
            />
          )}
          transportBar={(
            <TransportBar
              isPlaying={isPlaying}
              onTogglePlay={togglePlay}
              onStop={stopEngine}
              currentTime={currentTime}
              duration={duration}
              bpm={bpm}
              setBpm={setBpm}
              reverbPreset={reverbPreset}
              setReverbPreset={setReverbPreset}
              reverbWet={reverbWet}
              setReverbWet={setReverbWet}
              isLooping={isLooping}
              setIsLooping={setIsLooping}
              loopStart={loopStart}
              setLoopStart={setLoopStart}
              loopEnd={loopEnd}
              setLoopEnd={setLoopEnd}
              isAudioUnlocked={isAudioUnlocked}
              onUnlockAudio={unlockAudio}
              onOpenExport={() => setIsExportModalOpen(true)}
            />
          )}

        >
          <div
            id="canvas-workspace-element"
            style={{ width: '100%', height: '100%', position: 'relative', zIndex: 2 }}
          >

            <CanvasWorkspace
              assets={assets}
              selectedAssetIndex={selectedAssetIndex}
              audioSignals={effectiveAudioSignals}
              selectedEra={selectedEra}
              selectedStyle={selectedStyle}
              selectedRube={selectedRube}
              chaosLevel={effectiveChaosLevel}
              chaosEnabled={chaosEnabled}
              rubeDecay={rubeDecay}
              isPlaying={effectiveIsPlaying}
              currentTime={effectiveCurrentTime}
              videoClips={videoClips}
              moonVariant={moonVariant}
              moonFilter={moonFilter}
              lyricSegments={lyricSegments}
              lyricAlign={lyricAlign}
              lyricSize={lyricSize}
              lyricFont={lyricFont}
              mouthClosedId={puppetSlots?.rest}
              mouthOpenId={puppetSlots?.open}
              puppetSlots={puppetSlots}
              puppetMode={puppetMode}
              puppetEnabled={puppetEnabled}
              puppetDisplayMode={puppetDisplayMode}
              puppetActiveUrl={puppetActiveUrl}
              onEraMutate={handleEraMutate}
              onRubeStageChange={handleRubeStageChange}
              bpm={bpm}
              adaptiveTheme={adaptiveTheme}
              depth3dEnabled={depth3dEnabled}
              depthExtrusion={depthExtrusion}
              depthFlySpeed={depthFlySpeed}
              depthAudioZPulse={depthAudioZPulse}
              depthRenderMode={depthRenderMode}
              colorTexture={depthLoader.colorTexture}
              depthTexture={depthLoader.depthTexture}
              useLuminanceDepth={depthLoader.useLuminanceDepth}
              overlayTexture={webmOverlay.overlayTexture}
              overlayOpacity={webmOverlay.overlayOpacity}
              cssEffectStyle={liveCssEffectStyle}
              isEraLocked={isEraLocked}
              eraChangeCooldown={eraChangeCooldown}
              isOfflineRendering={isOfflineRendering}
              liquidWarpEnabled={liquidWarpEnabled}
              liquidWarpIntensity={liquidWarpIntensity}
              kaleidoscopeMode={kaleidoscopeMode}
              phosphorTrails={phosphorTrails}
              chromaticPunch={chromaticPunch}
              fractalMode={fractalMode}
              alienBeam={alienBeam}
              warpDrive={warpDrive}
              lyricAnim={lyricAnim}
            />
          </div>

        </InterzoneFrame>

        {!cinemaMode && (
          <FXConsole
            selectedEra={selectedEra}
          setSelectedEra={setSelectedEra}
          isEraLocked={isEraLocked}
          setIsEraLocked={setIsEraLocked}
          eraChangeCooldown={eraChangeCooldown}
          setEraChangeCooldown={setEraChangeCooldown}
          onManualEraChange={handleManualEraSelect}
          selectedStyle={selectedStyle}
          setSelectedStyle={setSelectedStyle}
          selectedRube={selectedRube}
          setSelectedRube={setSelectedRube}
          sensitivity={sensitivity}
          setSensitivity={setSensitivity}
          chaosLevel={chaosLevel}
          setChaosLevel={setChaosLevel}
          chaosEnabled={chaosEnabled}
          setChaosEnabled={setChaosEnabled}
          fxEnvelopeDepth={fxEnvelopeDepth}
          setFxEnvelopeDepth={setFxEnvelopeDepth}
          rubeDecay={rubeDecay}
          setRubeDecay={setRubeDecay}
          lyricAlign={lyricAlign}
          setLyricAlign={setLyricAlign}
          lyricSize={lyricSize}
          setLyricSize={setLyricSize}
          lyricFont={lyricFont}
          setLyricFont={setLyricFont}
          onAudioUpload={handleAudioUpload}
          isPlaying={isPlaying}
          onTogglePlay={togglePlay}
          onStop={stopEngine}
          isRecording={isRecording}
          onToggleRecord={handleToggleRecord}
          exportQuality={exportQuality}
          setExportQuality={setExportQuality}
          exportFormat={exportFormat}
          setExportFormat={setExportFormat}
          qualityPresets={qualityPresets}
          adaptiveTheme={adaptiveTheme}
          setAdaptiveTheme={setAdaptiveTheme}
          bpm={bpm}
          setBpm={setBpm}
          lyricSegments={lyricSegments}
          setLyricSegments={setLyricSegments}
          rubeStage={rubeStage}
          depth3dEnabled={depth3dEnabled}
          setDepth3dEnabled={setDepth3dEnabled}
          depthExtrusion={depthExtrusion}
          setDepthExtrusion={setDepthExtrusion}
          depthFlySpeed={depthFlySpeed}
          setDepthFlySpeed={setDepthFlySpeed}
          depthAudioZPulse={depthAudioZPulse}
          setDepthAudioZPulse={setDepthAudioZPulse}
          depthRenderMode={depthRenderMode}
          setDepthRenderMode={setDepthRenderMode}
          onLoadColorSource={depthLoader.loadColorSource}
          onLoadDepthSource={depthLoader.loadDepthSource}
          colorFileName={depthLoader.colorFileName}
          depthFileName={depthLoader.depthFileName}
          useLuminanceDepth={depthLoader.useLuminanceDepth}
          setUseLuminanceDepth={depthLoader.setUseLuminanceDepth}
          onResetDepthDefaults={depthLoader.resetDefaults}
          overlayPreset={webmOverlay.activePreset}
          onSelectOverlayPreset={webmOverlay.selectPreset}
          onLoadWebMFile={webmOverlay.loadWebMFile}
          overlayFileName={webmOverlay.fileName}
          overlayOpacity={webmOverlay.overlayOpacity}
          setOverlayOpacity={webmOverlay.setOverlayOpacity}
          onClearOverlay={webmOverlay.clearOverlay}
          onOpenExport={() => setIsExportModalOpen(true)}
          playlist={playlist}
          setPlaylist={setPlaylist}
          playlistIndex={playlistIndex}
          onPlayTrack={handlePlayTrack}
          onPlaylistAdvance={handlePlaylistAdvance}
          autoAdvance={autoAdvance}
          setAutoAdvance={setAutoAdvance}
          saveImages={saveImages}
          setSaveImages={setSaveImages}
          playlistOpen={playlistOpen}
          setPlaylistOpen={setPlaylistOpen}
          currentPreset={currentPreset}
          currentAssets={assets}
          onAddAssets={handleAddAssets}
          cinemaMode={cinemaMode}
          onToggleCinema={handleToggleCinema}
          setCinemaMode={handleToggleCinema}
          recordViewportOnly={recordViewportOnly}
          setRecordViewportOnly={setRecordViewportOnly}
          currentTrackTitle={trackTitle}
          currentDuration={duration}
          getCurrentAudio={() => lastAudioFileRef.current}
          autoDJEnabled={autoDJEnabled}
          setAutoDJEnabled={setAutoDJEnabled}
          autoDJMode={autoDJMode}
          setAutoDJMode={setAutoDJMode}
          autoDJInterval={autoDJInterval}
          setAutoDJInterval={setAutoDJInterval}
          liquidWarpEnabled={liquidWarpEnabled}
          setLiquidWarpEnabled={setLiquidWarpEnabled}
          liquidWarpIntensity={liquidWarpIntensity}
          setLiquidWarpIntensity={setLiquidWarpIntensity}
          kaleidoscopeMode={kaleidoscopeMode}
          setKaleidoscopeMode={setKaleidoscopeMode}
          phosphorTrails={phosphorTrails}
          setPhosphorTrails={setPhosphorTrails}
          chromaticPunch={chromaticPunch}
          setChromaticPunch={setChromaticPunch}
          fractalMode={fractalMode}
          setFractalMode={setFractalMode}
          alienBeam={alienBeam}
          setAlienBeam={setAlienBeam}
          warpDrive={warpDrive}
          setWarpDrive={setWarpDrive}
          lyricAnim={lyricAnim}
          setLyricAnim={setLyricAnim}
        />
        )}

        </div>
      )}

      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        viewportElementId="main-viewport"
        audioDestinationRef={audioDestinationRef}
        audioElement={audioElRef?.current}
        audioSourceUrl={lastAudioFileRef.current}
        duration={duration}
        currentTime={currentTime}
        isPlaying={isPlaying}
        onStopPlayback={stopEngine}
        onSeek={seekTo}
        onRenderFrame={handleRenderFrame}
        onRenderEnd={handleRenderEnd}
        sensitivity={sensitivity}
      />
    </AppProvider>
  );
}
