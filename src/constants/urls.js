// src/constants/urls.js
// Centralized URLs and tool identities for Interzone Drive-In & Strangelet Creative Suite

export const WEB_APP_URL = 'https://interzone-drive-in.vercel.app/';

// Windows Desktop Executable (.exe) download link.
export const DESKTOP_EXE_DOWNLOAD_URL =
  import.meta.env.VITE_DESKTOP_DOWNLOAD_URL ||
  'https://github.com/lordgriefo/strangelet-kineto-cut/releases/tag/v1.27';

// Creator Support Page (Buy Me a Coffee)
export const BUY_ME_A_COFFEE_URL = 'https://buymeacoffee.com/magicstatic/';

// ── THE 7 ACTIVE PERCHANCE SITES IN THE STRANGELET SUITE ──
export const PERCHANCE_KENETICUT_URL = 'https://perchance.org/strangelet-keneticut';
export const PERCHANCE_KENETICUT_ALIAS_URL = 'https://perchance.org/keneticut';
export const PERCHANCE_WUNDERBAR_URL = 'https://perchance.org/the-wunder-bar';
export const PERCHANCE_WUNDERBAR_MIRROR_URL = 'https://perchance.org/the-wunderbar';
export const PERCHANCE_FACE_FOR_RADIO_URL = 'https://perchance.org/face-for-radio';
export const PERCHANCE_HACKJOB_URL = 'https://perchance.org/hackjob';
export const PERCHANCE_PHASE_4_PICTURES_URL = 'https://perchance.org/hackjob';
export const PERCHANCE_THE_LSC_URL = 'https://perchance.org/the-lsc';
export const PERCHANCE_AUDIO_ARC_URL = 'https://perchance.org/audioarc';
export const POLLINATIONS_AUDIO_ARC_URL = 'https://audioarc.pollinations.app';
export const PERCHANCE_CINE_SAMPLER_URL = 'https://perchance.org/strangelet-cine-sampler';

// Sister Roadside Attractions & Suite Tools (backwards compatible aliases)
export const KINETO_CUT_URL = 'https://strangelet-kineto-cut.vercel.app/';
export const AUDIO_ARC_URL = POLLINATIONS_AUDIO_ARC_URL;
export const WUNDERBAR_URL = PERCHANCE_WUNDERBAR_URL;
export const CINE_SAMPLER_URL = PERCHANCE_CINE_SAMPLER_URL;

// Music & Album Releases
export const OCCULT_SONGBOOK_URL = 'https://buymeacoffee.com/magicstatic/';

// Strangelet Lab (Quantum-Acoustic Production Workstation & Particle Collider DAW)
export const STRANGELET_LAB_URL = 'https://github.com/lordgriefo/Strangelet-Lab';
export const STRANGELET_LAB_BETA_URL = 'https://github.com/lordgriefo/Strangelet-Lab/releases';

// Strangelet Stitch (Living Reel Montage & Video Stitcher)
export const STRANGELET_STITCH_URL = 'https://github.com/lordgriefo/strangelet-kineto-cut';

// Google Flow Syncro-Vox Tool (Talking Mouth Shape Generator)
export const GOOGLE_FLOW_SYNCRO_VOX_URL = 'https://flow.google.com/shared/tool/245908d5-dceb-42ed-884c-9c2f8f21b98a';

// ── ACCURATE CREATIVE ROSTER DIRECTLY FROM THE CREATOR ──
export const STRANGELET_SUITE_APPS = [
  {
    id: 'keneticut',
    title: 'Strangelet KinetiCUT',
    subtitle: '(Welcome to Strangelet, CT)',
    tagline: 'Audio-Reactive Montage & Multi-Track Sequencer',
    badge: 'VJ RIG & LIVING REEL ENGINE',
    icon: '🎞️',
    url: PERCHANCE_KENETICUT_URL,
    aliasUrl: PERCHANCE_KENETICUT_ALIAS_URL,
    desc: 'Like Connecticut, but it chops film on the beat: audio-reactive VJ rig with 37 edit styles, 12 era grades, 12 Auto-MV beat profiles, multi-track timeline with EDL export, and AI Flipbook Studio.',
    color: '#00e5ff',
    glow: 'rgba(0, 229, 255, 0.45)',
  },
  {
    id: 'the-wunderbar',
    title: 'Wunderbar!',
    subtitle: '(The Wunderbar)',
    tagline: 'Song → Storyboard → Music Video → Screenplay',
    badge: 'AI MOVIE SUITE & 4-WAY PREVIZ',
    icon: '⚡',
    url: PERCHANCE_WUNDERBAR_URL,
    mirrorUrl: PERCHANCE_WUNDERBAR_MIRROR_URL,
    desc: 'In-browser AI movie suite: 4-way visual storyboard previz, massive film lens & stock library, audio-reactive music video exporter with karaoke lyrics, lip-sync studio & full Fountain screenplay co-writer.',
    color: '#fbbf24',
    glow: 'rgba(251, 191, 36, 0.45)',
  },
  {
    id: 'hackjob',
    title: '+Hackjob+ Pictures',
    subtitle: "* The Writer's Room *",
    tagline: 'Genre-Agnostic Film-Fiction & Screenwriting Engine',
    badge: 'SCREENPLAY & WRITERS ROOM',
    icon: '🎬',
    url: PERCHANCE_HACKJOB_URL,
    aliasUrl: 'https://perchance.org/phase-4-pictures',
    desc: 'Mix 100s of cinematic influences (Lynch to Kurosawa, folk horror, lenses & lighting) → concept → scene beats → full screenplay with cast table read, Fountain/PDF export & poster key art + teaser lab.',
    color: '#f43f5e',
    glow: 'rgba(244, 63, 94, 0.45)',
  },
  {
    id: 'face-for-radio',
    title: 'Phase 4 Radio',
    subtitle: '(Face for Radio)',
    tagline: 'Vintage & Modern Radio Play Studio',
    badge: 'OLD-FASHIONED RADIO PLAYS',
    icon: '🎙️',
    url: PERCHANCE_FACE_FOR_RADIO_URL,
    desc: 'Audio drama & vintage broadcast tool for writing classic, old-fashioned radio plays, multi-character dialogue & episodic voice theater.',
    color: '#39ff14',
    glow: 'rgba(57, 255, 20, 0.45)',
  },
  {
    id: 'thelsc',
    title: 'The Large Sonic Collider',
    subtitle: '(The LSC)',
    tagline: "1000+ Particle Prompt Lab · 14-Stage Mastering · Audio-to-MIDI",
    badge: 'PROMPT COLLIDER & AUDIO MATRIX',
    icon: '⚛️',
    url: PERCHANCE_THE_LSC_URL,
    desc: "Free in-browser prompt lab & audio toolkit: collide 1000+ sonic particles for Suno, YuE2 & Udio, 14-stage mastering matrix with Matchering, and audio-to-MIDI conversion.",
    color: '#c084fc',
    glow: 'rgba(192, 132, 252, 0.45)',
  },
  {
    id: 'audioarc-perchance',
    title: 'audioArc (perchance)',
    subtitle: 'Perchance Edition',
    tagline: 'AI Filmmaking Studio · Timed Storyboards · Sora Prompts',
    badge: 'AI FILMMAKING STUDIO',
    icon: '🎚️',
    url: PERCHANCE_AUDIO_ARC_URL,
    desc: 'Free in-browser AI filmmaking studio: turn lyrics & MP3s into timed music video storyboards with keyframe prompts, Sora video directives, cast continuity & multi-format exports.',
    color: '#38bdf8',
    glow: 'rgba(56, 189, 248, 0.45)',
  },
  {
    id: 'audioarc-pollinations',
    title: 'audioArc (pollinations)',
    subtitle: 'Pollinations Production Edition',
    tagline: 'Full Pre-Pro Suite · Master Production Bible · Live Animatic',
    badge: 'POLLINATIONS PRE-PRO SUITE',
    icon: '🎬',
    url: POLLINATIONS_AUDIO_ARC_URL,
    desc: 'Full-spectrum filmmaking studio: Audio Intelligence beat listening, multi-track animatic timeline, multi-model AI screenplays & client-ready Master Production Bible PDFs.',
    color: '#0284c7',
    glow: 'rgba(2, 132, 199, 0.55)',
  },
  {
    id: 'cine-sampler',
    title: 'Strangelet Cine-Sampler',
    subtitle: 'Shot Library v2.0',
    tagline: 'Cinematographic Shot Library & Lens Sampler',
    badge: 'SHOT LIBRARY v2.0',
    icon: '📽️',
    url: PERCHANCE_CINE_SAMPLER_URL,
    desc: 'Cinematographic shot library, lens angles, visual framing compositions & reference catalog v2.0.',
    color: '#34d399',
    glow: 'rgba(52, 211, 153, 0.45)',
  },
  {
    id: 'strangelet-lab',
    title: 'Strangelet Lab',
    subtitle: 'v2.5 Beta',
    tagline: 'Particle Collider DAW · Faust DSP · GHOST AI Companion',
    badge: 'DESKTOP DAW v2.5 BETA',
    icon: '⚡',
    url: STRANGELET_LAB_BETA_URL,
    external: true,
    isBeta: true,
    desc: 'Quantum-acoustic desktop DAW & sonic collider: Faust WebAssembly DSP, level-matched FFT mastering, drum transient replacer & air-gapped GHOST AI studio companion.',
    color: '#fbbf24',
    glow: 'rgba(251, 191, 36, 0.55)',
  },
  {
    id: 'strangelet-stitch',
    title: 'Strangelet Stitch',
    tagline: 'Living Reel Montage & Video Stitcher',
    badge: 'CINEMATIC REEL STITCHER',
    icon: '🪡',
    url: STRANGELET_STITCH_URL,
    external: true,
    desc: 'Beat-synced video montage choreography, multi-scene living reel stitcher, fast cuts & audio-reactive visual cut-up laboratory.',
    color: '#c084fc',
    glow: 'rgba(192, 132, 252, 0.55)',
  },
];
