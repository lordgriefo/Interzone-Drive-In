import React, { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import { useAppState } from '../AppContext';
// InterzoneBackground is now rendered in InterZoneFrame (outer layer)
// so cosmic particles NEVER enter #main-viewport
import { ERA_FILTER_MAP } from '../constants/eras';
import { getActiveClipsAtTime } from '../utils/timelineCrossfade';
import { useRubeGoldbergEngine } from '../hooks/useRubeGoldbergEngine';
import { RUBE_STAGE_NAMES } from '../hooks/useRubeGoldbergChain';
import { GlitchLayer } from './GlitchLayer';
import { useCssEnvelope } from '../hooks/useCssEnvelope';
import { usePuppetEngine } from '../hooks/usePuppetEngine';

// ── PROCEDURAL SMPTE FALLBACK ───────────────────────────────────────────────
// Generates a high-contrast SMPTE color-bar canvas data URL (480×270) for
// immediate display when no asset URL is available or an image fails to load.
// Falls back to a 1×1 transparent PNG if canvas is unavailable (Firefox
// restricted environments, SSR, etc.) — never returns empty string.
const TRANSPARENT_1PX = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';

function createSmpteDataUrl() {
  try {
    const W = 480, H = 270;
    const canvas = document.createElement('canvas');
    canvas.width = W; canvas.height = H;
    const ctx = canvas.getContext('2d');
    if (!ctx) return TRANSPARENT_1PX;

    // Top 75% — classic 7 SMPTE colour bars
    const bars = [
      '#C0C0C0', '#C0C000', '#00C0C0', '#00C000',
      '#C000C0', '#C00000', '#0000C0',
    ];
    const bW = W / bars.length;
    bars.forEach((col, i) => {
      ctx.fillStyle = col;
      ctx.fillRect(i * bW, 0, bW, H * 0.75);
    });

    // Bottom strip — black / white / PLUGE-style tones
    const bottom = ['#000010', '#FFFFFF', '#1a1a1a', '#000000', '#090909', '#1c1c1c', '#000014'];
    bottom.forEach((col, i) => {
      ctx.fillStyle = col;
      ctx.fillRect(i * bW, H * 0.75, bW, H * 0.25);
    });

    // Orange / cyan label
    ctx.fillStyle = 'rgba(0,0,0,0.65)';
    ctx.fillRect(0, H * 0.36, W, 30);
    ctx.fillStyle = '#FF6B00';
    ctx.font = 'bold 14px "Courier New", monospace';
    ctx.textAlign = 'center';
    ctx.fillText('INTERZONE DRIVE-IN  ·  DROP MEDIA TO BEGIN', W / 2, H * 0.36 + 19);

    const dataUrl = canvas.toDataURL('image/png');
    // Paranoia check — some browsers return 'data:,' on a tainted/blocked canvas
    return dataUrl && dataUrl.length > 100 ? dataUrl : TRANSPARENT_1PX;
  } catch (_) {
    return TRANSPARENT_1PX;
  }
}

const SMPTE_FALLBACK_URL = createSmpteDataUrl();



// ── BURROUGHS CUT-UP TEXT ENGINE ────────────────────────────────────────────
// Spliced fragments from Naked Lunch, The Soft Machine, and Nova Express.
// STRICTLY scoped to selectedStyle === 'third_mind'.
const BURROUGHS_PHRASES = [
  // Naked Lunch
  "WOULDN'T YOU?",
  "STAND NAKED /// OBJURGATED",
  "WORD FALLING /// PHOTO FALLING",
  "HASSAN I SABBAH /// NOTHING IS TRUE",
  "THE ALGEBRA OF NEED",
  "A FROZEN MOMENT /// WHEN EVERYONE SEES WHAT IS ON THE END OF EVERY FORK",
  "DISPLACED PERSONS SPEAK ONLY TO THEIR OWN KIND",
  "THE HEAT CLOSES IN",
  "BENWAY ENTERS THROUGH THE WALL",
  "INTERZONE CITY OF THE GREY AREA",
  "CUT THE WORD LINES",
  // The Soft Machine
  "SOFT MACHINE /// SCANNING PATTERNS",
  "SCRAMBLE ALL TAPE RECORDINGS",
  "I HAVE JUST SEEN THE THIRD MIND",
  "THE DOOR TO THE LEFT /// THE DOOR TO THE RIGHT",
  "IMAGE TRACK JAMMED",
  "NEWSREEL OF THE FUTURE ROLLING BACK",
  "PLAY IT BACK /// PLAY IT FORWARD",
  "SILENCE TO ALL TAPE PROGRAMS",
  "THE SOFT MACHINE /// REPLICATE",
  // Nova Express
  "COORDINATES LOST",
  "NOVA HEAT CLOSING IN",
  "WORD VIRUS DETECTED",
  "BOARD BOOKS SEIZED",
  "INSPECTOR LEE /// REPORTS FROM THE NOVA POLICE",
  "BIOLOGICAL COPY WITHDRAWN",
  "SILENCE /// BRING IN THE SILENCE",
  "THE REWRITE SQUAD MOVING IN",
  "DISMANTLE THE CONTROL MACHINE",
  "FOLD IN THE NEWSPAPER /// FOLD IN THE UNIVERSE",
  "WRITING IS FIFTY YEARS BEHIND PAINTING",
  "SHOW YOUR TICKET /// END OF THE LINE",
];

// ── LYNCH / INTERZONE OVERLAY PHRASES ──────────────────────────────────
// Scoped to lynch_* / interzone / avant-garde director styles ONLY.
// Does NOT appear during third_mind (Burroughs) mode.
const LYNCH_PHRASES = [
  "PIGEONS SPREAD DISEASES AND MESS UP THE PLACE...",
  "LISTEN TO THE DEEP SOUND COMING DOWN...",
  "THEY'RE WATCHING YOU FROM THE SHADOWS...",
  "THAT'S BOBBY PERU /// HE LIKES TO HELP PEOPLE",
  "YOU EVER GET THE FEELING YOU'RE LIVING IN A DREAM?",
  "IT'S KIND OF HALF-NIGHT, YOU KNOW?",
  "THERE'S SOMETHING BEHIND THIS PLACE...",
  "EVERYTHING IS NORMAL /// DO NOT LOOK AT THE SKY",
  "NO HAY BANDA /// IT IS ALL AN ILLUSION",
  "THE LOG LADY SAYS NOTHING",
  "THE OWLS ARE NOT WHAT THEY SEEM",
  "FIRE WALK WITH ME",
  "THIS IS THE PLACE",
  "COOPER. COOP-ER. DO YOU READ ME.",
  "NOBODY OWNS THE INTERZONE",
  "TANGIER SIGNAL RECEIVED",
  "SILENCIO",
  "IT IS HAPPENING AGAIN",
  "ELECTRICITY",
  "NO HAY BANDA",
];

// Red Room / Twin Peaks — velvet, backward speech, doppelgänger dread
const LYNCH_REDROOM_PHRASES = [
  "SILENCIO",
  "IT IS HAPPENING AGAIN",
  "THE OWLS ARE NOT WHAT THEY SEEM",
  "THIS IS THE GIRL",
  "SHE IS FILLED WITH SECRETS",
  "DIANE...",
  "LELAND WANTS TO TALK",
  "THE DREAM OF THE RED ROOM",
  "NO HAY BANDA",
  "THIS IS NOT A DREAM",
  "MEANWHILE IN THE LODGE",
  "THE EVOLUTION OF THE ARM",
];

// Eraserhead / industrial — factory haze, grinding machinery, deep dread
const LYNCH_ERASERHEAD_PHRASES = [
  "IN HEAVEN EVERYTHING IS FINE",
  "ELECTRICITY",
  "THE RADIATOR HUMS",
  "HENRY DREAMS",
  "SOMETHING WRONG WITH THE BABY",
  "THE PENCIL FACTORY",
  "WORM LARVA",
  "BEAUTIFUL DAY",
  "THE MACHINE BREATHES",
  "ARE YOU SURE ABOUT THAT?",
  "PLEASE. KEEP IT SIMPLE.",
  "STATIC",
];

const DEREN_PHRASES   = ['SHE SEES HERSELF', 'THE KEY FALLS', 'MIRROR AND KNIFE', 'DREAM WITHIN DREAM', 'SHE RUNS FROM HERSELF', 'THE FIGURE ON THE STAIRS', 'SAND AND SILENCE', 'WOMAN IN THE LOOP'];
const MARKER_PHRASES  = ['THIS IS THE STORY OF A MAN', 'MARKED BY AN IMAGE', 'TIME TRAVEL', 'THE JETTY', 'A WORLD IN RUINS', 'MEMORY IS TREACHEROUS', 'SHE LOOKS BACK', 'THE END IS A BEGINNING'];
const ANGER_PHRASES   = ['LUCIFER RISING', 'SCORPIO', 'WALPURGISNACHT', 'INVOCATION', 'MOLOCH', 'THE MAGUS', 'REBEL REBEL', 'INVOCATION OF MY DEMON BROTHER'];
const DEBORD_PHRASES  = ['THE SPECTACLE IS CAPITAL', 'ALL THAT WAS DIRECTLY LIVED', 'BOREDOM IS ALWAYS COUNTER-REVOLUTIONARY', 'NEVER WORK', 'BENEATH THE PAVING STONES', 'SOCIETY OF THE SPECTACLE', 'THE DÉRIVE', 'DÉTOURNEMENT'];

export function CanvasWorkspace({
  assets: propsAssets,
  selectedAssetIndex = 0,
  audioSignals: propsAudioSignals,
  selectedEra: propsSelectedEra,
  selectedStyle: propsSelectedStyle,
  selectedRube: propsSelectedRube,
  rubeDecay = 800,
  chaosLevel = 0,
  chaosEnabled = false,
  isPlaying = false,
  moonVariant = 'classic_halo',
  moonFilter = 'silent_silver',
  lyricSegments = [],
  currentTime = 0,
  videoClips = [],
  lyricAlign = 'center',
  lyricSize = 1.4,
  lyricFont = 'space_mono',
  mouthClosedId,
  puppetSlots,
  puppetMode = '2',
  puppetEnabled = true,
  puppetDisplayMode = 'overlay',
  puppetActiveUrl: propsPuppetActiveUrl,
  onEraMutate,
  onRubeStageChange,
  // Phase 1: master BPM — live-bound to all beat-synced FX
  bpm = 120,
  // Phase 1.5: Adaptive theme sampling
  adaptiveTheme = false,
  // Phase 2: WebM Alpha Video Texture Overlay
  overlayTexture = null,
  overlayOpacity = 0.65,
  // Phase 2: CSS Automation Lane Effects
  cssEffectStyle = {},
  // Era Lock State & Cooldown
  isEraLocked = false,
  eraChangeCooldown = 8000,
}) {



  const [slideIndex, setSlideIndex] = useState(0);
  const [, setAnimTick] = useState(0);
  const [failedUrls, setFailedUrls] = useState({});  // map of URL -> true if failed
  const [subliminal, setSubliminal] = useState({
    text: '',
    top: '50%',
    left: '50%',
    visible: false,
    scale: 1,
    rotation: 0,
  });

  const [webglStatus, setWebglStatus] = useState('ok');

  const previousTransientRef = useRef(false);
  const assetsLengthRef = useRef(0);
  const chopOrderRef = useRef([]);
  const chopPointerRef = useRef(0);
  const containerRef    = useRef(null);
  const webglCanvasRef  = useRef(null);
  const animFrameRef    = useRef(null);
  const webglLostRef    = useRef(false);
  // Video element pool — one <video> per unique asset URL
  const videoElemsRef   = useRef({});
  // Off-screen canvas for adaptive theme colour sampling
  const samplerCanvasRef = useRef(null);
  // Montage hold-state — keeps last Eisenstein snap visible for 130ms
  const montageSnapRef = useRef({ transform: 'none', until: 0 });
  // Beat flash overlay — white strobe punch driven by RAF decay
  const beatFlashRef   = useRef(null);
  const beatFlashRafRef = useRef(null);
  // Per-style minimum hold time between slide advances (ms). Chill styles use a long hold.
  const lastSlideAdvanceRef = useRef(0);

  const contextState = useAppState() || {};

  const audioSignals = propsAudioSignals !== undefined ? propsAudioSignals : contextState.audioSignals;
  const selectedEra = propsSelectedEra !== undefined ? propsSelectedEra : contextState.selectedEra;
  const selectedStyle = propsSelectedStyle !== undefined ? propsSelectedStyle : contextState.selectedStyle;
  const selectedRube = propsSelectedRube !== undefined ? propsSelectedRube : contextState.selectedRube;
  const assets = propsAssets !== undefined ? propsAssets : contextState.assets;

  const { stage: rubeStage, visuals: rubeVisuals } = useRubeGoldbergEngine({
    selectedRube,
    audioSignals,
    isPlaying,
    chaosLevel,
    rubeDecay,
    onEraMutate,
    isEraLocked,
    eraChangeCooldown,
    currentTime,
  });

  const activeEra = isEraLocked ? selectedEra : (rubeVisuals.eraOverride || selectedEra);

  // Dynamic GSAP contrast/brightness envelope
  const { filterString: envelopeFilter } = useCssEnvelope({
    audioSignals,
    isPlaying,
    envelopeDepth: 1.0,
    targetRef: containerRef,
  });

  // Report stage changes up to App → FXConsole LED strip
  useEffect(() => {
    onRubeStageChange?.(rubeStage);
  }, [rubeStage, onRubeStageChange]);


  // Build shuffled chop order whenever asset list changes
  useEffect(() => {
    if (!assets || assets.length === 0) {
      assetsLengthRef.current = 0;
      chopOrderRef.current = [];
      chopPointerRef.current = 0;
      return;
    }

    assetsLengthRef.current = assets.length;
    const indices = assets.map((_, i) => i);
    // Fisher-Yates shuffle for full-array coverage
    for (let i = indices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [indices[i], indices[j]] = [indices[j], indices[i]];
    }
    chopOrderRef.current = indices;
    chopPointerRef.current = 0;
  }, [assets]);

  // ── Video element factory ────────────────────────────────────────────────
  // Returns a <video> element ready to render for the given asset URL.
  // Elements are cached in videoElemsRef so they are not recreated on every
  // render tick — video decode state is expensive to restart.
  const getVideoElem = useCallback((url) => {
    if (videoElemsRef.current[url]) return videoElemsRef.current[url];
    const vid = document.createElement('video');
    vid.src           = url;
    vid.crossOrigin   = 'anonymous';
    vid.playsInline   = true;
    vid.muted         = true;
    vid.loop          = true;
    vid.preload       = 'auto';
    vid.style.display = 'none'; // keep out of DOM flow; render via React element
    videoElemsRef.current[url] = vid;
    // Kick off load so readyState advances quickly
    vid.load();
    return vid;
  }, []);

  // Clean up stale video elements when asset list changes
  useEffect(() => {
    const activeUrls = new Set((assets || []).map((a) => a.url));
    Object.keys(videoElemsRef.current).forEach((url) => {
      if (!activeUrls.has(url)) {
        videoElemsRef.current[url].src = '';
        delete videoElemsRef.current[url];
      }
    });
  }, [assets]);

  // Synchronize slideIndex immediately when user selects an asset in Media Bin
  useEffect(() => {
    if (selectedAssetIndex !== undefined && selectedAssetIndex >= 0 && assets && assets.length > 0) {
      const idx = selectedAssetIndex % assets.length;
      setSlideIndex(idx);
      if (chopOrderRef.current.length > 0) {
        const pos = chopOrderRef.current.indexOf(idx);
        if (pos >= 0) chopPointerRef.current = pos;
      }
    }
  }, [selectedAssetIndex, assets]);

  // ── Adaptive Theme Sampler ────────────────────────────────────────────────

  // Samples the current visible frame every ~1.5s, extracts dominant hue,
  // and maps it to CSS variables on document.documentElement.
  const sampleFrameColors = useCallback(() => {
    if (!adaptiveTheme || !containerRef.current) return;

    // Grab a reference element to sample (prefer video, fallback to img)
    const mediaEl =
      containerRef.current.querySelector('video') ||
      containerRef.current.querySelector('img');
    if (!mediaEl) return;

    // Create or reuse 32x18 offscreen canvas (16:9, tiny = fast)
    let c = samplerCanvasRef.current;
    if (!c) {
      c = document.createElement('canvas');
      c.width  = 32;
      c.height = 18;
      samplerCanvasRef.current = c;
    }
    const ctx = c.getContext('2d', { willReadFrequently: true });
    try {
      ctx.drawImage(mediaEl, 0, 0, 32, 18);
    } catch (_) {
      return; // cross-origin or not ready
    }

    const data = ctx.getImageData(0, 0, 32, 18).data;
    // Accumulate RGB across all pixels
    let rSum = 0, gSum = 0, bSum = 0, count = 0;
    for (let i = 0; i < data.length; i += 4) {
      rSum += data[i];   gSum += data[i + 1];   bSum += data[i + 2];
      count++;
    }
    const rA = rSum / count;
    const gA = gSum / count;
    const bA = bSum / count;

    // Convert avg RGB to HSL to find dominant hue
    const r1 = rA / 255, g1 = gA / 255, b1 = bA / 255;
    const max = Math.max(r1, g1, b1);
    const min = Math.min(r1, g1, b1);
    const delta = max - min;
    let hue = 0;
    if (delta > 0.01) {
      if (max === r1)      hue = 60 * (((g1 - b1) / delta) % 6);
      else if (max === g1) hue = 60 * ((b1 - r1) / delta + 2);
      else                 hue = 60 * ((r1 - g1) / delta + 4);
    }
    if (hue < 0) hue += 360;
    const lum = (max + min) / 2;

    // Map dominant hue to theme accent colours
    // Accent is a saturated version of the dominant hue
    const accentH  = Math.round(hue);
    const accentL  = Math.round(40 + lum * 20);
    // Complementary hue for secondary accent
    const compH    = (accentH + 180) % 360;

    // Build CSS colour strings
    const bgPrimary    = `hsl(${accentH}, 8%, 4%)`;
    const accentOrange = `hsl(${accentH}, 90%, ${accentL}%)`;
    const accentBlue   = `hsl(${compH}, 85%, 58%)`;

    const root = document.documentElement;
    root.style.setProperty('--bg-primary',    bgPrimary);
    root.style.setProperty('--bg-secondary',  `hsl(${accentH}, 8%, 6%)`);
    root.style.setProperty('--bg-panel',      `hsl(${accentH}, 8%, 7%)`);
    root.style.setProperty('--accent-orange', accentOrange);
    root.style.setProperty('--accent-orange-glow', `${accentOrange.replace(')', ', 0.55)')}`);
    root.style.setProperty('--accent-blue',   accentBlue);
    root.style.setProperty('--accent-blue-glow', `${accentBlue.replace('hsl', 'hsla').replace(')', ', 0.50)')}`);
  }, [adaptiveTheme]);

  // Run sampler every 1.5s while adaptive theme is on and playing
  useEffect(() => {
    if (!adaptiveTheme || !isPlaying) return;
    const id = setInterval(sampleFrameColors, 1500);
    return () => clearInterval(id);
  }, [adaptiveTheme, isPlaying, sampleFrameColors]);

  // Reset to data-theme variables when adaptive mode is turned off
  useEffect(() => {
    if (!adaptiveTheme) {
      ['--bg-primary','--bg-secondary','--bg-panel',
       '--accent-orange','--accent-orange-glow',
       '--accent-blue','--accent-blue-glow'].forEach((v) =>
        document.documentElement.style.removeProperty(v)
      );
    }
  }, [adaptiveTheme]);

  const advanceSlide = useCallback(() => {
    const len = assetsLengthRef.current;
    if (len === 0) return;

    if (chopOrderRef.current.length !== len) {
      chopOrderRef.current = Array.from({ length: len }, (_, i) => i);
      chopPointerRef.current = 0;
    }

    const nextPointer = (chopPointerRef.current + 1) % len;
    if (nextPointer === 0) {
      const indices = [...chopOrderRef.current];
      for (let i = indices.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [indices[i], indices[j]] = [indices[j], indices[i]];
      }
      chopOrderRef.current = indices;
    }
    chopPointerRef.current = nextPointer;
    setSlideIndex(chopOrderRef.current[chopPointerRef.current]);
  }, []);

  // Era filter — applied at container level so it blankets ALL content in the viewport
  const getEraFilter = () => ERA_FILTER_MAP[activeEra] || ERA_FILTER_MAP.default;

  // Image-level filter — envelope (beat-reactive contrast/brightness) + rube visual overrides
  // Era filter is NOT included here; it lives on the container div above
  const getImageFilter = () => {
    let parts = [envelopeFilter || ''];
    if (rubeVisuals.eraOverride && rubeStage >= 3) {
      parts.push(`hue-rotate(${rubeStage * 12}deg)`);
    }
    if (rubeVisuals.colorInvert || rubeStage === 7) {
      parts.push('invert(1)');
    }
    if (rubeVisuals.flashInvert) {
      parts.push('invert(0.85) brightness(1.4)');
    }
    // Signal dropout: desaturate + high contrast (VHS noise look)
    const drop = rubeVisuals.signalDrop || 0;
    if (drop > 0) {
      const contrast = (1 + drop * 5).toFixed(2);
      const sat = Math.max(0, 1 - drop * 0.8).toFixed(2);
      const bright = (1 - drop * 0.22).toFixed(2);
      parts.push(`contrast(${contrast}) saturate(${sat}) brightness(${bright})`);
    }
    return parts.filter(Boolean).join(' ').trim() || 'none';
  };


  const getStyleExtras = () => {
    // Always run when playing — audio signals default to 0 so baseline motion still works
    if (!isPlaying) return {};

    const bass = Number(audioSignals?.bass) || 0;
    const mid  = Number(audioSignals?.mid)  || 0;
    const t    = Date.now() * 0.001;

    // ── Beat math helpers ──
    const beatsPerSec   = bpm / 60;
    const secPerBeat    = 1 / beatsPerSec;
    const secPerQuarter = secPerBeat;

    const flux = Number(audioSignals?.spectralFlux) || 0;
    const rms  = Number(audioSignals?.rms) || 0;

    switch (selectedStyle) {

      // ── STAN BRAKHAGE: Celluloid gate hops + dye-shift from spectral flux ──
      case 'brakhage_emulsion': {
        const frameStep = Math.floor(currentTime * 24);
        const hopX = Math.sin(frameStep * 91.3) * 10 + bass * 8;
        const hopY = Math.cos(frameStep * 47.7) * 10 + mid * 6;
        const dyeSat = 1.0 + flux * 2.5 + rms * 1.2;
        const dyeContrast = 1.15 + (audioSignals?.isTransient ? 0.55 : 0) + bass * 0.35;
        return {
          transform: `translate(${hopX.toFixed(1)}px, ${hopY.toFixed(1)}px)`,
          filter: `saturate(${dyeSat.toFixed(2)}) contrast(${dyeContrast.toFixed(2)})`,
        };
      }

      // ── KEN BURNS: Slow rostrum pan/zoom — baseline always moving, audio boosts zoom ──
      case 'ken_burns': {
        const beatWindow = 16 * secPerBeat;
        const tNorm = Math.min((currentTime % beatWindow) / beatWindow, 1);
        const sCurve = tNorm * tNorm * (3 - 2 * tNorm);
        const scale  = 1 + sCurve * 0.25 + bass * 0.10;
        const panPhase = (currentTime / (8 * secPerBeat)) * Math.PI;
        return {
          transform: `scale(${scale.toFixed(4)}) translate(${(Math.sin(panPhase) * 8.0).toFixed(2)}%, ${(Math.cos(panPhase * 0.7) * 4.5).toFixed(2)}%)`,
        };
      }

      // ── FIONA VOYEUR: Handheld wander — large sinusoidal drift, audio amplifies ──
      case 'fiona_voyeur': {
        const wanderX = Math.sin(currentTime * 1.6) * 14 + Math.sin(currentTime * 3.8) * 5 + (mid - 0.5) * 32;
        const wanderY = Math.cos(currentTime * 1.2) * 10 + Math.cos(currentTime * 2.9) * 4 + bass * 22;
        const roll    = Math.sin(currentTime * 0.5) * 4.5 + (mid - 0.5) * 3.5;
        return {
          transform: `scale(1.12) translate(${wanderX.toFixed(1)}px, ${wanderY.toFixed(1)}px) rotate(${roll.toFixed(2)}deg)`,
          filter: `sepia(0.4) saturate(1.6) hue-rotate(-12deg) contrast(1.3)`,
        };
      }

      // ── APPLE KINETIC: 90° bar pivots + punchy scale pop ──
      case 'apple_kinetic': {
        const beatIndex = Math.floor(currentTime / secPerQuarter);
        const barIndex  = Math.floor(beatIndex / 4);
        const rotationAngle = (barIndex % 4) * 90;
        const beatFraction  = (currentTime % secPerQuarter) / secPerQuarter;
        const popScale = 1.0 + Math.max(0, 0.38 * Math.exp(-beatFraction * 8.0)) + bass * 0.12;
        return {
          transform: `rotate(${rotationAngle}deg) scale(${popScale.toFixed(3)})`,
          transition: 'transform 0.08s cubic-bezier(0.2, 0.9, 0.3, 1.2)',
        };
      }

      // ── NARRATIVE: Wide bass-driven pan + zoom baseline ──
      case 'narrative': {
        const panX = (mid - 0.5) * 42 + Math.sin(currentTime * 0.7) * 10;
        const zoom = 1.04 + bass * 0.20 + Math.sin(currentTime * 1.1) * 0.025;
        return { transform: `translateX(${panX.toFixed(2)}%) scale(${zoom.toFixed(3)})` };
      }

      // ── MONTAGE: Eisenstein collision — hold snap for 130ms so it's actually visible ──
      case 'montage': {
        const now = Date.now();
        if (!audioSignals?.isTransient) {
          // Return held snap if within hold window
          if (now < montageSnapRef.current.until) {
            return { transform: montageSnapRef.current.transform, transition: 'none' };
          }
          return {};
        }
        const dir = Math.random() > 0.5 ? 1 : -1;
        const jX  = dir * (18 + Math.random() * 28);
        const jY  = (Math.random() - 0.5) * 22;
        const sc  = 1.07 + Math.random() * 0.14;
        const snap = `translate(${jX.toFixed(1)}px, ${jY.toFixed(1)}px) scale(${sc.toFixed(3)})`;
        montageSnapRef.current = { transform: snap, until: now + 130 };
        return { transform: snap, transition: 'none' };
      }

      // ── SURREAL: Blur driven by mid + sinusoidal drift, screen blend ──
      case 'surreal': {
        const blurAmt = Math.max(0, mid * 9 + Math.sin(currentTime * 0.8) * 2).toFixed(1);
        return { filter: `blur(${blurAmt}px)`, mixBlendMode: 'screen' };
      }

      // ── STROBE: Color-cycling invert on beat half-freq ──
      case 'strobe': {
        const strobeFreq = beatsPerSec * 0.5;
        const phase = Math.sin(t * strobeFreq * Math.PI * 2);
        const hueShift = (currentTime * 60) % 360;
        if (phase > 0) {
          return { filter: `invert(1) hue-rotate(${hueShift.toFixed(0)}deg) saturate(2.5) contrast(1.3)` };
        }
        return { filter: `saturate(${(1 + bass * 2.2).toFixed(2)}) contrast(${(1.25 + mid * 0.85).toFixed(2)})` };
      }

      // ── VENETIAN: Handled by renderVenetian() — return empty, routing is done in JSX ──
      case 'venetian':
        return {};

      // ── JITTER: Chaos-gated deterministic shake ──
      case 'jitter': {
        if (!chaosEnabled || chaosLevel <= 0) return {};
        const quarterIndex = Math.floor(currentTime / secPerQuarter);
        const seed = (quarterIndex * 1664525 + 1013904223) & 0xffffffff;
        const nx = ((seed >>> 16) / 0xffff) - 0.5;
        const ny = ((seed >>> 8 & 0xffff) / 0xffff) - 0.5;
        return {
          transform: `translate(${(nx * chaosLevel * 22).toFixed(2)}px, ${(ny * chaosLevel * 18).toFixed(2)}px)`,
        };
      }

      // ── SÉANCE DISSOLVE: ghost-double opacity oscillation + slow hue drift ──
      case 'seance_dissolve': {
        const ghostOpacity = 0.55 + Math.sin(currentTime * 0.9) * 0.30 + mid * 0.15;
        const hueDrift     = (currentTime * 18) % 360;
        const sat          = 1.25 + flux * 1.8;
        return {
          opacity:  Math.min(1, Math.max(0.25, ghostOpacity)).toFixed(3),
          filter:   `hue-rotate(${hueDrift.toFixed(1)}deg) saturate(${sat.toFixed(2)}) contrast(1.1)`,
          mixBlendMode: 'screen',
        };
      }

      // ── MAGNETIC TAPE: VHS horizontal slant shimmer + bass-dropout hop ──
      case 'magnetic_tape': {
        const slant     = Math.sin(currentTime * 2.3) * 1.8 + (mid - 0.5) * 3.5;
        const dropX     = audioSignals?.isTransient ? (Math.random() - 0.5) * 14 : 0;
        const dropY     = audioSignals?.isTransient ? (Math.random() - 0.5) * 6  : 0;
        const tapeSat   = 1.15 + bass * 0.6;
        const tapeWarm  = `sepia(0.28) saturate(${tapeSat.toFixed(2)}) contrast(1.08)`;
        return {
          transform: `skewY(${slant.toFixed(2)}deg) translate(${dropX.toFixed(1)}px, ${dropY.toFixed(1)}px)`,
          filter:    tapeWarm,
        };
      }

      // ── LIQUID GATE: wet-print halation — soft bloom breathing with mids ──
      case 'liquid_gate': {
        const bloom     = Math.max(0.4, mid * 6.5 + Math.sin(currentTime * 1.1) * 1.2);
        const warmth    = 0.18 + rms * 0.22;
        const glow      = `blur(${bloom.toFixed(1)}px) sepia(${warmth.toFixed(2)}) brightness(${(1.08 + mid * 0.18).toFixed(3)}) saturate(1.35)`;
        return {
          filter:      glow,
          mixBlendMode: 'lighten',
        };
      }

      // ── AMBIENT DRIFT: ultra-slow harmonic sine float — meditative, no cuts ──
      case 'ambient_drift': {
        // Very slow drift: period ~120s, barely perceptible movement
        const driftX = Math.sin(currentTime * 0.04) * 8 + Math.sin(currentTime * 0.027) * 4;
        const driftY = Math.cos(currentTime * 0.033) * 5 + Math.cos(currentTime * 0.019) * 3;
        const breathe = 1.0 + Math.sin(currentTime * 0.05) * 0.02 + rms * 0.015;
        return {
          transform: `translate(${driftX.toFixed(2)}px, ${driftY.toFixed(2)}px) scale(${breathe.toFixed(4)})`,
          transition: 'transform 2s ease-in-out',
        };
      }

      // ── LO-FI FLICKER: warm desaturation + slow brightness pulse ──
      case 'lo_fi_flicker': {
        // Slow primary wave (~0.5 cycles/s) + gentle secondary lilt (~0.64 cycles/s)
        // No fast flutter — keep it cozy and unhurried
        const flicker = 0.92 + Math.sin(currentTime * 3.14) * 0.06 + Math.sin(currentTime * 4.0) * 0.02;
        // Very slow warm grain-shift hue — barely perceptible colour drift
        const grainHue = Math.sin(currentTime * 0.3) * 4;
        const tapeSat = 0.68 + rms * 0.10 + bass * 0.06;
        return {
          filter: `sepia(0.55) saturate(${tapeSat.toFixed(2)}) brightness(${flicker.toFixed(3)}) hue-rotate(${grainHue.toFixed(1)}deg) contrast(1.03)`,
        };
      }

      // ── SLOW DISSOLVE: fade-in on transients, long 1.5s CSS transition ──
      case 'slow_dissolve': {
        // When a transient fires (in the useEffect below), advanceSlide() is called as normal.
        // Here we apply a long CSS opacity transition so the incoming image fades in slowly.
        const targetOpacity = audioSignals?.isTransient ? 0.60 : 1.0;
        // Gentle scale breathing — not static
        const gentleScale = 1.0 + Math.sin(currentTime * 0.08) * 0.015;
        return {
          opacity: targetOpacity,
          transform: `scale(${gentleScale.toFixed(4)})`,
          transition: 'opacity 1.5s ease-in-out, transform 3s ease-in-out',
        };
      }

      // ── DREAMSCAPE: slow pastel hue rotation + soft blur breathing ──
      case 'dreamscape': {
        const hue = (currentTime * 5) % 360;          // full hue cycle every 72s
        const blurBreath = 1.2 + Math.sin(currentTime * 0.12) * 0.8; // 1.2–2.0px soft blur
        const sat = 0.65 + Math.sin(currentTime * 0.09) * 0.15 + mid * 0.12;
        const opacity = 0.88 + Math.sin(currentTime * 0.07) * 0.07;
        return {
          opacity: Math.min(1, opacity).toFixed(3),
          filter: `hue-rotate(${hue.toFixed(1)}deg) saturate(${sat.toFixed(2)}) blur(${blurBreath.toFixed(1)}px) brightness(1.04)`,
          transition: 'filter 2s ease-in-out, opacity 2s ease-in-out',
        };
      }

      // ── MAYA DEREN: Dream logic mirror — slow grayscale with colour flash on transient ──
      case 'deren_meshes': {
        const mirrorX = Math.sin(t * 0.083) > 0 ? 1 : -1; // flips slowly ~12s
        const dreamBlur = 0.8 + Math.sin(t * 0.06) * 0.7;
        const gentleScale = 1.0 + Math.sin(t * 0.04) * 0.015;
        const derenGray = audioSignals?.isTransient ? 0.1 : 0.75;
        return {
          transform: `scaleX(${(mirrorX * gentleScale).toFixed(4)}) scaleY(${gentleScale.toFixed(4)})`,
          filter: `grayscale(${derenGray}) contrast(1.2) blur(${dreamBlur.toFixed(2)}px)`,
          transition: 'transform 4s ease-in-out, filter 3s ease-in-out',
        };
      }

      // ── KENNETH ANGER: Occult hypersaturation — ritualistic flash on transient ──
      case 'anger_scorpio': {
        const satPulse = 1.85 + Math.sin(t * 0.4) * 0.35 + rms * 0.6;
        const hueRitual = Math.sin(t * 0.22) * 8 - 4;
        const brightFlash = audioSignals?.isTransient ? 1.6 : (1.0 + rms * 0.3);
        return {
          filter: `saturate(${satPulse.toFixed(2)}) hue-rotate(${hueRitual.toFixed(1)}deg) contrast(1.25) brightness(${brightFlash.toFixed(2)})`,
          transition: 'filter 0.18s ease-in-out',
        };
      }

      // ── JONAS MEKAS: Handheld diary — warm overexposure + intimate jitter ──
      case 'mekas_diary': {
        const mekasBright = 1.12 + rms * 0.5 + Math.sin(t * 1.3) * 0.08;
        const jX = Math.sin(t * 7.3) * 3 + bass * 5;
        const jY = Math.cos(t * 5.1) * 3 + mid * 3;
        return {
          filter: `sepia(0.18) brightness(${mekasBright.toFixed(2)}) contrast(0.93) saturate(1.15)`,
          transform: `translate(${jX.toFixed(1)}px, ${jY.toFixed(1)}px)`,
          transition: 'transform 0.08s linear',
        };
      }

      // ── CHRIS MARKER: Memory stills — near-static B&W with blue-grey tint ──
      case 'marker_jetee': {
        const stillScale = 1.0 + Math.sin(t * 0.025) * 0.005;
        return {
          filter: 'grayscale(0.92) contrast(1.15) hue-rotate(205deg) saturate(0.25) brightness(0.95)',
          transform: `scale(${stillScale.toFixed(4)})`,
          transition: 'transform 8s ease-in-out, filter 5s ease-in-out',
        };
      }

      // ── ANDY WARHOL: Screen Test — confrontational B&W stillness, factory grain shimmer ──
      case 'warhol_screen': {
        const grainShimmer = Math.sin(t * 0.5) * 1.5;
        return {
          filter: `grayscale(1.0) contrast(1.08) hue-rotate(${grainShimmer.toFixed(1)}deg)`,
          transition: 'filter 6s ease-in-out',
        };
      }

      // ── DEREK JARMAN: Super8 punk — blown whites, raw contrast ──
      case 'jarman_super8': {
        const rawBright = 1.08 + rms * 0.4 + Math.sin(t * 2.1) * 0.07;
        const punkContrast = 1.45 + bass * 0.3;
        const punkSat = audioSignals?.isTransient ? 0.15 : (0.85 + rms * 0.4);
        return {
          filter: `contrast(${punkContrast.toFixed(2)}) brightness(${rawBright.toFixed(2)}) saturate(${punkSat.toFixed(2)})`,
          transition: 'filter 0.12s ease-in-out',
        };
      }

      // ── GUY DEBORD: Situationist détournement — harsh inversion, anti-image ──
      case 'debord_detourne': {
        const opPulse = 0.72 + Math.sin(t * 0.4) * 0.22;
        return {
          filter: `invert(0.88) contrast(1.65) grayscale(0.55) brightness(${(1.0 + rms * 0.2).toFixed(2)})`,
          opacity: opPulse.toFixed(3),
          transition: 'filter 0.45s ease-in-out, opacity 0.9s ease-in-out',
        };
      }

      // ── JACK SMITH: Flaming Creatures — tropical oversaturation, bloom, camp ecstasy ──
      case 'smith_flaming': {
        const tropSat = 2.15 + rms * 0.75 + Math.sin(t * 0.35) * 0.3;
        const tropHue = 15 + Math.sin(t * 0.28) * 8;
        const bloomBlur = 0.4 + Math.sin(t * 0.18) * 0.6;
        return {
          filter: `saturate(${tropSat.toFixed(2)}) hue-rotate(${tropHue.toFixed(1)}deg) blur(${bloomBlur.toFixed(2)}px) brightness(1.08)`,
          transition: 'filter 1.4s ease-in-out',
        };
      }

      // ── CAROLEE SCHNEEMANN: Fuses — painted emulsion, raw flux, body grain ──
      case 'schneemann_fuses': {
        const fuseHue = (t * 7.5) % 55;
        const fuseContrast = 1.28 + rms * 0.55;
        const fuseSat = 1.55 + bass * 1.1;
        const fuseJX = Math.sin(t * 9.1) * 5 + bass * 7;
        const fuseJY = Math.cos(t * 6.7) * 5 + mid * 4;
        return {
          filter: `saturate(${fuseSat.toFixed(2)}) contrast(${fuseContrast.toFixed(2)}) hue-rotate(${fuseHue.toFixed(1)}deg)`,
          transform: `translate(${fuseJX.toFixed(1)}px, ${fuseJY.toFixed(1)}px)`,
          transition: 'filter 0.35s ease-in-out',
        };
      }

      // ── DAVID LYNCH — Red Room (Twin Peaks): velvet crimson, slow mirror drift, electrical surge ──
      case 'lynch_redroom': {
        // Deep crimson saturation — like looking through red velvet
        const redSat = 1.6 + Math.sin(t * 0.11) * 0.25 + rms * 0.3;
        const redHue = Math.sin(t * 0.07) * 6 - 8; // slight warm red bias
        // Shadow crush: very high contrast, crushing the blacks
        const shadowContrast = 1.55 + bass * 0.25;
        // Electrical surge on transient — brief blinding brightness spike
        const surgeBright = audioSignals?.isTransient
          ? 1.9 + rms * 0.6
          : (1.0 + Math.sin(t * 0.13) * 0.04);
        // 12fps "shutter drag" — quantize pan to discrete stepped intervals
        const shutterT = Math.floor(t * 12) / 12;
        const slowPanX = Math.sin(shutterT * 0.028) * 14;
        const slowPanY = Math.cos(shutterT * 0.019) * 8;
        const velvetOpacity = 0.88 + Math.sin(t * 0.06) * 0.12;
        return {
          filter: `saturate(${redSat.toFixed(2)}) hue-rotate(${redHue.toFixed(1)}deg) contrast(${shadowContrast.toFixed(2)}) brightness(${surgeBright.toFixed(2)})`,
          transform: `translate(${slowPanX.toFixed(2)}px, ${slowPanY.toFixed(2)}px)`,
          opacity: velvetOpacity.toFixed(3),
          transition: audioSignals?.isTransient
            ? 'filter 0.05s, transform 0s'
            : 'filter 3s ease-in-out, transform 6s ease-in-out, opacity 4s ease-in-out',
        };
      }

      // ── DAVID LYNCH — Eraserhead: industrial monochrome, tungsten flicker, grinding machinery ──
      case 'lynch_eraserhead': {
        // Heavy monochrome with breathing grayscale — not fully B&W
        const industrialGray = 0.78 + Math.sin(t * 0.19) * 0.12;
        // Quantize to 12fps for the shutter drag / slow-motion interpolation feel
        const flickerT = Math.floor(t * 12) / 12;
        const tungstenBright = 0.82 + Math.sin(flickerT * 2.3) * 0.07 + Math.sin(flickerT * 5.7) * 0.04 + rms * 0.15;
        // Transient = blinding electrical flash (Eraserhead deploys this constantly)
        const eraseContrast = audioSignals?.isTransient
          ? 2.8
          : (1.65 + bass * 0.35 + Math.sin(flickerT * 1.1) * 0.15);
        const eraseBright = audioSignals?.isTransient ? 2.2 : tungstenBright;
        // Mechanical gate jitter — tiny industrial hops
        const gateX = Math.sin(flickerT * 3.7) * 2 + bass * 4;
        const gateY = Math.cos(flickerT * 2.9) * 2 + mid * 3;
        return {
          filter: `grayscale(${industrialGray.toFixed(2)}) contrast(${eraseContrast.toFixed(2)}) brightness(${eraseBright.toFixed(2)}) sepia(0.12)`,
          transform: `translate(${gateX.toFixed(1)}px, ${gateY.toFixed(1)}px)`,
          transition: audioSignals?.isTransient
            ? 'filter 0.04s, transform 0s'
            : 'filter 0.8s ease-in-out, transform 0.12s linear',
        };
      }

      default:
        return {};
    }
  };

  // Transient chop — only while playing
  // Text overlays are BPM-beat-synced: display duration = one beat at master BPM (clamped 120–600ms)
  useEffect(() => {
    if (!isPlaying || !assets || assets.length === 0) {
      previousTransientRef.current = false;
      return;
    }

    const isTransient = Boolean(audioSignals?.isTransient);
    if (isTransient && !previousTransientRef.current) {
      // ── Per-style minimum hold between slide advances ──
      // Chill styles use a long hold so slides linger instead of flicking rapidly.
      const CHILL_STYLES = new Set(['ambient_drift', 'lo_fi_flicker', 'slow_dissolve', 'dreamscape', 'deren_meshes', 'marker_jetee', 'warhol_screen', 'debord_detourne', 'lynch_redroom', 'lynch_eraserhead']);
      const CHILL_MIN_HOLD_MS = {
        ambient_drift: 8000,   // new slide every ~8s minimum — very languid
        lo_fi_flicker: 2500,   // every ~2.5s — lo-fi groove, mid-tempo rhythm
        slow_dissolve: 2500,   // every ~2.5s — cinematic but not glacial
        dreamscape:    7000,   // every ~7s — dreamy drift, very slow
        deren_meshes:   6000,
        marker_jetee:   8000,
        warhol_screen:  12000,
        debord_detourne: 3000,
        lynch_redroom:   7000,  // agonizing holds — the Red Room operates on dream time
        lynch_eraserhead: 4000, // industrial holds — slightly more frequent than redroom
      };
      const currentStyle = (selectedStyle || selectedEra || '').toLowerCase();
      const minHold = CHILL_MIN_HOLD_MS[currentStyle] ?? 0; // 0 = no throttle for hi-nrg styles
      const now = performance.now();
      const sinceLastAdvance = now - lastSlideAdvanceRef.current;

      if (sinceLastAdvance >= minHold) {
        advanceSlide();
        lastSlideAdvanceRef.current = now;

        // ── Beat flash: skip for chill styles (no white strobe punch) ──
        if (!CHILL_STYLES.has(currentStyle) && beatFlashRef.current) {
          if (beatFlashRafRef.current) cancelAnimationFrame(beatFlashRafRef.current);
          beatFlashRef.current.style.opacity = '0.38';
          const flashStart = performance.now();
          const decayFlash = () => {
            const age = performance.now() - flashStart;
            const opacity = Math.max(0, 0.38 * (1 - age / 140));
            if (beatFlashRef.current) beatFlashRef.current.style.opacity = String(opacity.toFixed(3));
            if (age < 140) beatFlashRafRef.current = requestAnimationFrame(decayFlash);
          };
          beatFlashRafRef.current = requestAnimationFrame(decayFlash);
        }

        // ── BURROUGHS CUT-UP: third_mind only ──
        if (currentStyle === 'third_mind') {
          const phrase = BURROUGHS_PHRASES[Math.floor(Math.random() * BURROUGHS_PHRASES.length)];
          // Beat-locked display: one beat interval at master BPM, clamped 120–600ms
          const beatMs = Math.min(600, Math.max(120, Math.round(60000 / bpm)));
          setSubliminal({
            text: phrase,
            top: `${30 + Math.random() * 40}%`,
            left: `${15 + Math.random() * 70}%`,
            visible: true,
            scale: 0.8 + Math.random() * 0.5,
            rotation: (Math.random() - 0.5) * 22,
          });
          setTimeout(() => setSubliminal((prev) => ({ ...prev, visible: false })), beatMs);

        // ── LYNCH RED ROOM: velvet Twin Peaks phrases, long hypnotic hold ──
        } else if (currentStyle === 'lynch_redroom') {
          const phrase = LYNCH_REDROOM_PHRASES[Math.floor(Math.random() * LYNCH_REDROOM_PHRASES.length)];
          const beatMs = Math.min(1400, Math.max(400, Math.round(60000 / bpm) * 1.5));
          setSubliminal({
            text: phrase,
            top: `${38 + Math.random() * 24}%`,
            left: `${22 + Math.random() * 56}%`,
            visible: true,
            scale: 0.7 + Math.random() * 0.35,
            rotation: (Math.random() - 0.5) * 4, // almost level — the Red Room is eerily still
          });
          setTimeout(() => setSubliminal((prev) => ({ ...prev, visible: false })), beatMs);

        // ── LYNCH ERASERHEAD: industrial factory phrases, sharp and dissonant ──
        } else if (currentStyle === 'lynch_eraserhead') {
          const phrase = LYNCH_ERASERHEAD_PHRASES[Math.floor(Math.random() * LYNCH_ERASERHEAD_PHRASES.length)];
          const beatMs = Math.min(500, Math.max(100, Math.round(60000 / bpm) * 0.6));
          setSubliminal({
            text: phrase,
            top: `${25 + Math.random() * 50}%`,
            left: `${10 + Math.random() * 80}%`,
            visible: true,
            scale: 0.9 + Math.random() * 0.55,
            rotation: (Math.random() - 0.5) * 6,
          });
          setTimeout(() => setSubliminal((prev) => ({ ...prev, visible: false })), beatMs);

        // ── INTERZONE / AVANT-GARDE / other Lynch-adjacent styles ──
        } else if (
          currentStyle.includes('lynch') ||
          currentStyle.includes('interzone') ||
          currentStyle.includes('avant')
        ) {
          const phrase = LYNCH_PHRASES[Math.floor(Math.random() * LYNCH_PHRASES.length)];
          const beatMs = Math.min(600, Math.max(120, Math.round(60000 / bpm)));
          setSubliminal({
            text: phrase,
            top: `${35 + Math.random() * 30}%`,
            left: `${20 + Math.random() * 60}%`,
            visible: true,
            scale: 0.85 + Math.random() * 0.4,
            rotation: (Math.random() - 0.5) * 16,
          });
          setTimeout(() => setSubliminal((prev) => ({ ...prev, visible: false })), beatMs);

        } else if (currentStyle === 'deren_meshes') {
          const phrase = DEREN_PHRASES[Math.floor(Math.random() * DEREN_PHRASES.length)];
          const beatMs = Math.min(800, Math.max(200, Math.round(60000 / bpm)));
          setSubliminal({ text: phrase, top: `${40 + Math.random() * 20}%`, left: `${25 + Math.random() * 50}%`, visible: true, scale: 0.7 + Math.random() * 0.4, rotation: (Math.random() - 0.5) * 8 });
          setTimeout(() => setSubliminal((prev) => ({ ...prev, visible: false })), beatMs);

        } else if (currentStyle === 'anger_scorpio') {
          const phrase = ANGER_PHRASES[Math.floor(Math.random() * ANGER_PHRASES.length)];
          const beatMs = Math.min(400, Math.max(100, Math.round(60000 / bpm)));
          setSubliminal({ text: phrase, top: `${20 + Math.random() * 60}%`, left: `${10 + Math.random() * 80}%`, visible: true, scale: 1.0 + Math.random() * 0.6, rotation: (Math.random() - 0.5) * 12 });
          setTimeout(() => setSubliminal((prev) => ({ ...prev, visible: false })), beatMs);

        } else if (currentStyle === 'marker_jetee') {
          const phrase = MARKER_PHRASES[Math.floor(Math.random() * MARKER_PHRASES.length)];
          const beatMs = Math.min(1200, Math.max(600, Math.round(60000 / bpm)));
          setSubliminal({ text: phrase, top: `${45 + Math.random() * 15}%`, left: `${20 + Math.random() * 60}%`, visible: true, scale: 0.9 + Math.random() * 0.3, rotation: 0 });
          setTimeout(() => setSubliminal((prev) => ({ ...prev, visible: false })), beatMs);

        } else if (currentStyle === 'debord_detourne') {
          const phrase = DEBORD_PHRASES[Math.floor(Math.random() * DEBORD_PHRASES.length)];
          const beatMs = Math.min(1000, Math.max(400, Math.round(60000 / bpm)));
          setSubliminal({ text: phrase, top: `${30 + Math.random() * 40}%`, left: `${5 + Math.random() * 85}%`, visible: true, scale: 0.8 + Math.random() * 0.5, rotation: 0 });
          setTimeout(() => setSubliminal((prev) => ({ ...prev, visible: false })), beatMs);
        }
        // All other styles: no subliminal text (narrative, montage, strobe, chill, etc.)
      }
    }
    previousTransientRef.current = isTransient;
  }, [audioSignals?.isTransient, assets, selectedStyle, selectedEra, isPlaying, bpm, advanceSlide]);

  // Halt animation + reset when paused/stopped
  useEffect(() => {
    if (isPlaying) return;
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    if (beatFlashRafRef.current) cancelAnimationFrame(beatFlashRafRef.current);
    if (beatFlashRef.current) beatFlashRef.current.style.opacity = '0';
    setAnimTick(0);
    setSubliminal((prev) => ({ ...prev, visible: false }));
    previousTransientRef.current = false;
  }, [isPlaying]);

  // Live animation loop — only while playing
  useEffect(() => {
    // Styles that need a per-frame RAF tick for smooth animation
    // NOTE: 'montage' must be here so Eisenstein snap transforms are actually painted
    const ANIMATED_STYLES = new Set([
      'ken_burns', 'fiona_voyeur', 'strobe', 'brakhage_emulsion',
      'apple_kinetic', 'narrative', 'surreal', 'jitter', 'venetian',
      'montage', 'seance_dissolve', 'magnetic_tape', 'liquid_gate',
      // Chill / ambient styles
      'ambient_drift', 'lo_fi_flicker', 'slow_dissolve', 'dreamscape',
      // Director tributes
      'deren_meshes', 'anger_scorpio', 'mekas_diary', 'marker_jetee',
      'warhol_screen', 'jarman_super8', 'debord_detourne', 'smith_flaming', 'schneemann_fuses',
      'lynch_redroom', 'lynch_eraserhead',
    ]);
    const needsAnimation =
      isPlaying &&
      (chaosLevel > 0 ||
       // Arm RAF for ANY active Rube preset — don't gate on rubeStage (async state lag)
       selectedRube !== 'none' ||
       ANIMATED_STYLES.has(selectedStyle));

    if (!needsAnimation) {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      return;
    }

    const loop = () => {
      setAnimTick((t) => t + 1);
      animFrameRef.current = requestAnimationFrame(loop);
    };
    animFrameRef.current = requestAnimationFrame(loop);
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [chaosLevel, selectedRube, rubeStage, isPlaying, selectedStyle]);

  // WebGL safety listeners on workspace canvas
  useEffect(() => {
    const canvas = webglCanvasRef.current;
    if (!canvas) return;

    let gl;
    try {
      gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    } catch {
      setWebglStatus('unsupported');
      return;
    }
    if (!gl) {
      setWebglStatus('unsupported');
      return;
    }

    const resize = () => {
      const parent = containerRef.current;
      if (!parent) return;
      canvas.width = parent.clientWidth;
      canvas.height = parent.clientHeight;
      gl.viewport(0, 0, canvas.width, canvas.height);
    };
    resize();

    const onLost = (e) => {
      e.preventDefault();
      webglLostRef.current = true;
      setWebglStatus('lost');
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };

    const onRestored = () => {
      webglLostRef.current = false;
      setWebglStatus('restored');
      resize();
      setTimeout(() => setWebglStatus('ok'), 1200);
    };

    canvas.addEventListener('webglcontextlost', onLost);
    canvas.addEventListener('webglcontextrestored', onRestored);

    const ro = new ResizeObserver(resize);
    if (containerRef.current) ro.observe(containerRef.current);

    return () => {
      canvas.removeEventListener('webglcontextlost', onLost);
      canvas.removeEventListener('webglcontextrestored', onRestored);
      ro.disconnect();
    };
  }, []);

    const getTransform = () => {
    if (!isPlaying || !audioSignals) return 'none';

    const bass = Number(audioSignals.bass) || 0;
    const mid = Number(audioSignals.mid) || 0;
    const chaosJitter = chaosLevel > 0 ? (Math.random() - 0.5) * chaosLevel * 10 : 0;

    let scale = 1 + bass * 0.1 + (chaosLevel > 0 ? chaosLevel * 0.05 : 0);
    let rotate = (mid - 0.5) * 3 + chaosJitter;
    let translateY = 0;

    if (rubeVisuals.tiltAngle) {
      rotate += rubeVisuals.tiltAngle;
    }
    if (rubeVisuals.gravityY) {
      translateY += rubeVisuals.gravityY;
    }
    if (rubeVisuals.dollyScale && rubeVisuals.dollyScale !== 1) {
      scale *= rubeVisuals.dollyScale;
    }
    if (rubeStage === 2) {
      rotate += Math.sin(Date.now() * 0.01) * 4;
    }
    if (rubeStage === 3) {
      rotate += Math.sin(Date.now() * 0.02) * 2;
    }

    const tvCollapse = rubeVisuals.tvCollapse || 0;
    const signalDrop = rubeVisuals.signalDrop || 0;

    // Signal dropout: high-freq horizontal jitter (VHS tracking error)
    let translateX = 0;
    if (signalDrop > 0) {
      const t = Date.now();
      translateX = Math.sin(t * 0.09) * signalDrop * 18 + Math.sin(t * 0.14) * signalDrop * 9;
    }

    // CRT cathode burn: compress scaleY without touching scaleX
    const scaleYFactor = tvCollapse > 0 ? Math.max(0.03, 1 - tvCollapse * 0.96) : 1;
    const hasXYSplit = tvCollapse > 0 || translateX !== 0;

    if (hasXYSplit) {
      return `scaleX(${scale.toFixed(3)}) scaleY(${(scale * scaleYFactor).toFixed(3)}) rotate(${rotate.toFixed(2)}deg) translate(${translateX.toFixed(1)}px, ${translateY.toFixed(1)}px)`;
    }
    return `scale(${scale.toFixed(3)}) rotate(${rotate.toFixed(2)}deg) translateY(${translateY.toFixed(1)}px)`;

  };


  const getAssetUrl = (index) => {
    if (!assets || assets.length === 0) return null;
    const asset = assets[index % assets.length];
    return typeof asset === 'string' ? asset : asset?.url;
  };

  const currentAssetUrl = getAssetUrl(slideIndex);

  // ── Synchro-Vox multi-sprite puppet engine ──
  // usePuppetEngine drives slot selection from Meyda audio signals.
  // When no puppet slots are assigned it returns activeUrl=null and we
  // fall through to the regular slide/asset display unchanged.
  const { activeSlot: _activeSlot, activeUrl: engineActiveUrl } = usePuppetEngine({
    puppetSlots: puppetSlots || {},
    puppetMode:  puppetMode  || '2',
    assets:      assets      || [],
    audioSignals,
    isPlaying:   isPlaying && puppetEnabled,
  });
  const puppetActiveUrl = propsPuppetActiveUrl ?? engineActiveUrl;

  // ── Synchro-Vox Display Resolution ──
  // Check if currently selected asset is one of the assigned puppet mouth sprites
  const isPuppetSlotSelected = puppetSlots && Object.values(puppetSlots).includes(assets?.[slideIndex]?.id);
  const hasPuppetAssignment = puppetSlots && Object.values(puppetSlots).some(Boolean);

  // In SWAP mode:
  //   If the user selected a puppet mouth sprite, swap to puppetActiveUrl on audio.
  //   If the user selected any other photo (character/scene), that photo stays in view!
  // In OVERLAY mode:
  //   The base image is ALWAYS currentAssetUrl (the photo the user clicked), and the mouth sprite
  //   animates on top (true Synchro-Vox character lip-sync!).
  const rawDisplayUrl = (isPlaying && puppetEnabled && hasPuppetAssignment && puppetActiveUrl && puppetDisplayMode === 'swap' && isPuppetSlotSelected)
    ? puppetActiveUrl
    : currentAssetUrl;

  // Fall back to SMPTE test-card if no asset URL or image failed to load
  const displayUrl = (rawDisplayUrl && !failedUrls[rawDisplayUrl]) ? rawDisplayUrl : SMPTE_FALLBACK_URL;

  const renderBurroughsCutUp = () => {
    if (!assets || assets.length === 0) return null;
    const len = assets.length;
    const i0 = slideIndex % len;
    const i1 = (slideIndex + 1) % len;
    const i2 = (slideIndex + 2) % len;

    return (
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr 1fr',
        gap: '2px',
        width: '100%',
        height: '100%',
        backgroundColor: '#000',
        overflow: 'hidden',
        position: 'relative',
      }}>
        {[i0, i1, i2].map((idx, col) => {
          // Dynamic roving offsets (covering full X, Y in [0.0, 1.0] without top/bottom cropping)
          const roveX = Math.sin(currentTime * 0.45 + col * 1.8) * 12;
          const roveY = Math.cos(currentTime * 0.35 + col * 1.3) * 8;
          const transientHop = (audioSignals?.isTransient ? (Math.random() - 0.5) * 6 : 0);
          const colBaseOffset = col * 33.33;

          return (
            <div
              key={col}
              style={{
                overflow: 'hidden',
                position: 'relative',
                width: '100%',
                height: '100%',
                borderRight: col < 2 ? '1px solid rgba(6, 182, 212, 0.4)' : 'none',
              }}
            >
              <img
                src={getAssetUrl(idx) || SMPTE_FALLBACK_URL}
                alt={`Cut ${col + 1}`}
                style={{
                  width: '320%',
                  height: '115%',
                  objectFit: 'cover',
                  transform: `translateX(-${(colBaseOffset + roveX + transientHop).toFixed(2)}%) translateY(${roveY.toFixed(2)}%) scale(1.04)`,
                  filter: getImageFilter(),
                  opacity: rubeVisuals.opacityBleed,
                  transition: audioSignals?.isTransient ? 'none' : 'transform 0.08s ease-out',
                }}
              />
            </div>
          );
        })}
      </div>
    );
  };


  // ── VENETIAN BLINDS: Render separate slat divs, each with its own clip-path ──
  const renderVenetian = () => {
    const bass = Number(audioSignals?.bass) || 0;
    const mid  = Number(audioSignals?.mid)  || 0;
    const slats = 10;
    const bassScale = 1 + bass * 0.07;
    const midShift  = (mid - 0.5) * 18;
    const hueA = (currentTime * 25) % 360;
    const hueB = (hueA + 140) % 360;

    const slatEls = [];
    for (let i = 0; i < slats; i++) {
      const topPct    = (i / slats) * 100;
      const bottomPct = ((i + 1) / slats) * 100;
      const isEven = i % 2 === 0;

      slatEls.push(
        <div
          key={i}
          style={{
            position: 'absolute',
            inset: 0,
            clipPath: `polygon(0% ${topPct}%, 100% ${topPct}%, 100% ${bottomPct}%, 0% ${bottomPct}%)`,
            overflow: 'hidden',
          }}
        >
          <img
            src={displayUrl}
            alt={`slat-${i}`}
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              filter: isEven
                ? `hue-rotate(${hueA.toFixed(0)}deg) saturate(1.7) contrast(1.2)`
                : `hue-rotate(${hueB.toFixed(0)}deg) saturate(1.5) contrast(1.15)`,
              transform: isEven
                ? `translateX(${(-midShift).toFixed(1)}px) scale(${bassScale.toFixed(3)})`
                : `translateX(${midShift.toFixed(1)}px) scale(${bassScale.toFixed(3)})`,
            }}
          />
        </div>
      );
    }

    return (
      <div style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden', backgroundColor: '#000' }}>
        {slatEls}
      </div>
    );
  };


  const renderMainImage = () => {
    // displayUrl is always non-null (SMPTE_FALLBACK_URL is the guaranteed minimum)
    const currentAsset = assets?.[slideIndex];
    const isVideo = !failedUrls[displayUrl] && (
      currentAsset?.url === displayUrl
        ? currentAsset?.mediaType === 'video'
        : assets?.find(a => a.url === displayUrl)?.mediaType === 'video'
    );
    const styleExtras   = getStyleExtras();
    const splitStyle = rubeVisuals.axisSplit
      ? {
          clipPath: rubeStage % 2 === 0
            ? 'polygon(0 0, 50% 0, 50% 100%, 0 100%)'
            : 'polygon(50% 0, 100% 0, 100% 100%, 50% 100%)',
        }
      : {};

    // Compose style-specific filter with image-level envelope/rube filter.
    // Era filter lives on the container div above — not here.
    const imgFilter = getImageFilter();
    const styleFilter = styleExtras.filter;
    const composedFilter = [styleFilter, (imgFilter !== 'none' ? imgFilter : '')].filter(Boolean).join(' ').trim() || 'none';

    const sharedStyle = {
      // Fill the full flex container — prevents the gray-bar collapse
      width: '100%',
      height: '100%',
      objectFit: 'contain',
      display: 'block',
      filter: composedFilter,
      opacity: rubeVisuals.opacityBleed,
      transition: chaosLevel > 0 || !isPlaying ? 'none' : 'filter 0.15s ease',
      mixBlendMode: styleExtras.mixBlendMode,
      ...splitStyle,
      ...styleExtras,
    };

    return (
      <div style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {isVideo ? (
          <video
            key={displayUrl}
            src={displayUrl}
            crossOrigin="anonymous"
            playsInline
            muted
            loop
            autoPlay={isPlaying}
            style={sharedStyle}
            onLoadedMetadata={(e) => { if (isPlaying) e.target.play().catch(() => {}); }}
            onError={(e) => {
              console.warn('[CanvasWorkspace] video load error', e);
              if (displayUrl !== SMPTE_FALLBACK_URL) {
                setFailedUrls(prev => ({ ...prev, [displayUrl]: true }));
              }
            }}
          />
        ) : (
          <img
            key={displayUrl}
            src={displayUrl}
            alt="Asset Cut"
            style={sharedStyle}
            onError={() => {
              // Only trigger fallback if we were attempting a non-fallback URL
              if (displayUrl !== SMPTE_FALLBACK_URL) {
                setFailedUrls(prev => ({ ...prev, [displayUrl]: true }));
              }
            }}
          />
        )}

        {/* ── Synchro-Vox Mouth Overlay (Classic Clutch Cargo / Character Lip-Sync) ── */}
        {puppetEnabled && hasPuppetAssignment && puppetActiveUrl && puppetDisplayMode === 'overlay' && (
          <div
            style={{
              position: 'absolute',
              bottom: '18%',
              left: '50%',
              transform: 'translateX(-50%)',
              width: '32%',
              maxHeight: '28%',
              zIndex: 6,
              pointerEvents: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <img
              key={`synchro-vox-${puppetActiveUrl}`}
              src={puppetActiveUrl}
              alt="Synchro-Vox Lip-Sync"
              style={{
                maxWidth: '100%',
                maxHeight: '100%',
                objectFit: 'contain',
                filter: composedFilter,
                opacity: rubeVisuals.opacityBleed,
              }}
            />
          </div>
        )}
      </div>
    );
  };

  // ── Chromatic Prism: RGB-split overlay when chromaOffset > 0 ──────────────
  // Three screen-blended copies of the image/video with R/G/B channel isolation
  // and lateral offset — produces classic chromatic aberration / prism fringe.
  const renderChromaOffset = () => {
    const currentAsset = assets?.[slideIndex];
    const isVideo = !failedUrls[displayUrl] && currentAsset?.mediaType === 'video';
    const offset = rubeVisuals.chromaOffset || 0;
    const mediaStyle = {
      position: 'absolute', inset: 0,
      width: '100%', height: '100%',
      objectFit: 'contain', display: 'block',
      mixBlendMode: 'screen',
      opacity: 0.85,
    };

    if (isVideo) {
      return (
        <div style={{ position: 'relative', width: '100%', height: '100%' }}>
          {/* Red channel — shift left */}
          <video
            src={displayUrl}
            muted loop autoPlay={isPlaying} playsInline
            style={{
              ...mediaStyle,
              filter: 'saturate(8) hue-rotate(0deg) contrast(1.8) brightness(0.9)',
              transform: `translateX(-${offset}px)`,
            }}
          />
          {/* Green channel — center (primary) */}
          <video
            src={displayUrl}
            muted loop autoPlay={isPlaying} playsInline
            style={{
              ...mediaStyle,
              filter: 'saturate(4) hue-rotate(120deg) contrast(1.4) brightness(0.85)',
              transform: 'none',
            }}
          />
          {/* Blue channel — shift right */}
          <video
            src={displayUrl}
            muted loop autoPlay={isPlaying} playsInline
            style={{
              ...mediaStyle,
              filter: 'saturate(8) hue-rotate(240deg) contrast(1.8) brightness(0.9)',
              transform: `translateX(${offset}px)`,
            }}
          />
        </div>
      );
    }

    return (
      <div style={{ position: 'relative', width: '100%', height: '100%' }}>
        {/* Red channel — shift left */}
        <img src={displayUrl} alt="" style={{
          ...mediaStyle,
          filter: 'saturate(8) hue-rotate(0deg) contrast(1.8) brightness(0.9)',
          transform: `translateX(-${offset}px)`,
        }} />
        {/* Green channel — center (primary) */}
        <img src={displayUrl} alt="Asset Cut" style={{
          ...mediaStyle,
          filter: 'saturate(4) hue-rotate(120deg) contrast(1.4) brightness(0.85)',
          transform: 'none',
        }} />
        {/* Blue channel — shift right */}
        <img src={displayUrl} alt="" style={{
          ...mediaStyle,
          filter: 'saturate(8) hue-rotate(240deg) contrast(1.8) brightness(0.9)',
          transform: `translateX(${offset}px)`,
        }} />
      </div>
    );
  };


  const renderTimelineComposite = () => {
    const active = getActiveClipsAtTime(videoClips, currentTime);
    if (active.length === 0) return renderMainImage();

    return (
      <div style={{ position: 'relative', width: '100%', height: '100%' }}>
        {active.map(({ clip, opacity }) => {
          const asset = assets.find((a) => a.id === clip.assetId);
          if (!asset?.url) return null;
          const styleExtras = getStyleExtras();
          const isVideo = asset.mediaType === 'video';
          const clipUrl = failedUrls[asset.url] ? SMPTE_FALLBACK_URL : asset.url;
          const imgFilter = getImageFilter();
          const composedClipFilter = [styleExtras.filter, imgFilter !== 'none' ? imgFilter : ''].filter(Boolean).join(' ').trim() || 'none';

          const sharedStyle = {
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            display: 'block',
            filter: composedClipFilter,
            opacity: opacity * rubeVisuals.opacityBleed,
            transition: 'opacity 0.05s linear',
            pointerEvents: 'none',
            mixBlendMode: styleExtras.mixBlendMode,
            ...styleExtras,
          };

          if (isVideo) {
            return (
              <video
                key={clip.id}
                src={clipUrl}
                crossOrigin="anonymous"
                playsInline
                muted
                loop
                autoPlay={isPlaying}
                style={sharedStyle}
                onLoadedMetadata={(e) => { if (isPlaying) e.target.play().catch(() => {}); }}
                onError={(e) => {
                  console.warn('[Timeline] video clip load error', clip.id, e);
                  if (clipUrl !== SMPTE_FALLBACK_URL) {
                    setFailedUrls(prev => ({ ...prev, [clipUrl]: true }));
                  }
                }}
              />
            );
          }

          return (
            <img
              key={clip.id}
              src={clipUrl}
              alt={asset.name}
              style={sharedStyle}
              onError={() => {
                if (clipUrl !== SMPTE_FALLBACK_URL) {
                  setFailedUrls(prev => ({ ...prev, [clipUrl]: true }));
                }
              }}
            />
          );
        })}
      </div>
    );
  };

  // Use timeline composite during playback when clips exist AND timeline style is active;
  // otherwise show the active Media Bin selection / montage / synchro-vox directly
  const useTimelineView = isPlaying && selectedStyle === 'timeline' && videoClips.length > 0;


  const activeLyric = lyricSegments.find(
    (seg) => currentTime >= seg.start && currentTime <= (seg.end || seg.start + 4)
  );

  return (
    <div
      ref={containerRef}
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        // Solid matte black — no cosmic bleed ever enters the video viewport
        backgroundColor: '#000000',
      }}
    >

      {/* Primary visualizer canvas */}
      <canvas
        ref={webglCanvasRef}
        id="kinetochop-visualizer-canvas"
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          zIndex: 1,
          opacity: 0,
        }}
      />

      {webglStatus === 'lost' && (
        <div style={{
          position: 'absolute',
          top: 8,
          left: 8,
          zIndex: 20,
          background: 'rgba(220,38,38,0.85)',
          color: '#fff',
          fontSize: '10px',
          fontFamily: 'monospace',
          padding: '4px 8px',
          borderRadius: 4,
        }}>
          WebGL context lost — recovering…
        </div>
      )}

      {subliminal.visible && (
        <div style={{
          position: 'absolute',
          top: subliminal.top,
          left: subliminal.left,
          transform: `translate(-50%, -50%) scale(${subliminal.scale}) rotate(${subliminal.rotation}deg)`,
          color: 'rgba(255, 255, 255, 0.9)',
          fontFamily: 'monospace',
          fontWeight: 'bold',
          fontSize: '1.4rem',
          letterSpacing: '3px',
          textShadow: '0 0 10px rgba(249,115,22,0.8), 0 0 20px rgba(0,0,0,0.9)',
          pointerEvents: 'none',
          zIndex: 10,
        }}>
          {subliminal.text}
        </div>
      )}

      {/* Main media — strict flex centering with GlitchLayer */}
      <GlitchLayer
        audioSignals={audioSignals}
        isPlaying={isPlaying}
        intensity={chaosLevel > 0 ? chaosLevel : 0.15}
        glitchEnabled={
          // Rube chain has its own visual effects — don't layer glitch on top
          selectedRube === 'none' &&
          (selectedStyle === 'third_mind' || chaosLevel > 0.05)
        }
        chaosLevel={chaosLevel}
      >
          {/* Era filter wrapper — separate from transform div to avoid Firefox
              compositor bug where filter+transform on the same element inside
              an overflow:hidden parent causes children to not paint */}
          <div style={{
            position: 'relative',
            zIndex: 5,
            width: '100%',
            height: '100%',
            filter: getEraFilter(),
          }}>
            <div style={{
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transform: getTransform(),
              transition: chaosLevel > 0 || !isPlaying ? 'none' : 'transform 0.08s ease-out',
            }}>
              {selectedStyle === 'third_mind'
                ? renderBurroughsCutUp()
                : selectedStyle === 'venetian'
                  ? renderVenetian()
                  : rubeVisuals.chromaOffset > 0
                    ? renderChromaOffset()
                    : useTimelineView
                      ? renderTimelineComposite()
                      : renderMainImage()}
            </div>
          </div>
      </GlitchLayer>

      {/* WebM Alpha Loop / Celluloid Overlay Layer */}
      {overlayTexture?.image && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            zIndex: 7,
            pointerEvents: 'none',
            mixBlendMode: 'screen',
            opacity: overlayOpacity,
          }}
        >
          {overlayTexture.image instanceof HTMLVideoElement ? (
            <video
              ref={(el) => {
                if (el && el.src !== overlayTexture.image.src) {
                  el.src = overlayTexture.image.src;
                  el.loop = true;
                  el.muted = true;
                  el.playsInline = true;
                  if (isPlaying) el.play().catch(() => {});
                }
              }}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          ) : overlayTexture.image instanceof HTMLCanvasElement ? (
            <canvas
              ref={(el) => {
                if (el && overlayTexture.image) {
                  const ctx = el.getContext('2d');
                  el.width = overlayTexture.image.width;
                  el.height = overlayTexture.image.height;
                  ctx.drawImage(overlayTexture.image, 0, 0);
                }
              }}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          ) : null}
        </div>
      )}

      {/* CSS Automation Lane Vignette Depth Layer */}
      {cssEffectStyle?.boxShadow && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            zIndex: 8,
            pointerEvents: 'none',
            boxShadow: cssEffectStyle.boxShadow,
            borderRadius: 'inherit',
          }}
        />
      )}

      {/* Axis split companion layer (stage 4) */}


      {rubeVisuals.axisSplit && displayUrl && selectedStyle !== 'third_mind' && (
        <div style={{
          position: 'absolute',
          zIndex: 6,
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          pointerEvents: 'none',
          mixBlendMode: 'screen',
          opacity: 0.7,
        }}>
          <img
            src={displayUrl}
            alt=""
            style={{
              maxHeight: '100%',
              maxWidth: '100%',
              objectFit: 'contain',
              clipPath: 'polygon(50% 0, 100% 0, 100% 100%, 50% 100%)',
              filter: `hue-rotate(90deg) saturate(1.4)`,
              transform: `translateY(${Math.sin(Date.now() * 0.008) * 8}px)`,
            }}
          />
        </div>
      )}

      {/* Time-synced lyrics overlay */}
      {activeLyric && (() => {
        // Font map — system fonts + Google Fonts (all loaded in index.html)
        const LYRIC_FONTS = {
          // ── Google Fonts — stylized ──
          space_mono:      "'Space Mono', monospace",
          major_mono:      "'Space Mono', monospace",
          vt323:           "'VT323', monospace",              // retro CRT terminal
          orbitron:        "'Orbitron', sans-serif",          // sci-fi geometric
          press_start:     "'Press Start 2P', monospace",     // 8-bit pixel
          special_elite:   "'Special Elite', monospace",      // distressed typewriter
          permanent_marker:"'Permanent Marker', cursive",     // handwritten marker
          bebas_neue:      "'Bebas Neue', sans-serif",        // condensed headline
          black_ops:       "'Black Ops One', sans-serif",     // military stencil
          russo_one:       "'Russo One', sans-serif",         // tech bold
          syncopate:       "'Syncopate', sans-serif",         // geometric condensed
          // ── System fallbacks ──
          courier:         "'Courier New', Courier, monospace",
          impact:          "Impact, 'Arial Narrow', sans-serif",
          georgia:         "Georgia, 'Times New Roman', serif",
          palatino:        "'Palatino Linotype', Palatino, serif",
          garamond:        "Garamond, 'Times New Roman', serif",
          futura:          "'Century Gothic', Futura, sans-serif",
          arial:           "Arial, Helvetica, sans-serif",
          verdana:         "Verdana, Geneva, sans-serif",
        };
        const fontFamily = LYRIC_FONTS[lyricFont] || LYRIC_FONTS.space_mono;
        return (
          <div style={{
            position: 'absolute',
            bottom: '12%',
            left: lyricAlign === 'left' ? '8%' : lyricAlign === 'right' ? 'auto' : '50%',
            right: lyricAlign === 'right' ? '8%' : 'auto',
            transform: lyricAlign === 'center' ? 'translateX(-50%)' : 'none',
            zIndex: 12,
            color: '#fff',
            fontFamily,
            fontSize: `${lyricSize}rem`,
            letterSpacing: (lyricFont === 'space_mono' || lyricFont === 'major_mono') ? '2px' : '0.5px',
            textAlign: lyricAlign,
            textShadow: '0 0 12px rgba(6,182,212,0.9), 0 2px 8px rgba(0,0,0,0.95)',
            maxWidth: '85%',
            pointerEvents: 'none',
            lineHeight: 1.4,
          }}>
            {activeLyric.text}
          </div>
        );
      })()}


      {/* Film Burn overlay — warm amber celluloid flare when filmBurn > 0 */}
      {rubeVisuals.filmBurn > 0 && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundColor: '#ff6600',
            opacity: Math.min(0.85, rubeVisuals.filmBurn * 0.8),
            pointerEvents: 'none',
            zIndex: 24,
            mixBlendMode: 'screen',
            transition: 'opacity 0.15s ease-out',
          }}
        />
      )}

      {/* Beat flash overlay — full-viewport white strobe punch on every transient */}
      <div
        ref={beatFlashRef}
        style={{
          position: 'absolute',
          inset: 0,
          backgroundColor: '#ffffff',
          opacity: 0,
          pointerEvents: 'none',
          zIndex: 25,
          mixBlendMode: 'screen',
        }}
      />
    </div>
  );
}

