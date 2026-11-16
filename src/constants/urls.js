// src/constants/urls.js
// Centralized URLs for Interzone Drive-In & Strangelet Creative Suite

export const WEB_APP_URL = 'https://interzone-drive-in.vercel.app/';

// Windows Desktop Executable (.exe) download link.
export const DESKTOP_EXE_DOWNLOAD_URL =
  import.meta.env.VITE_DESKTOP_DOWNLOAD_URL ||
  'https://github.com/lordgriefo/strangelet-kineto-cut/releases/tag/v1.27';

// Creator Support Page (Buy Me a Coffee)
export const BUY_ME_A_COFFEE_URL = 'https://buymeacoffee.com/magicstatic/';

// ── THE 6 ACTIVE PERCHANCE SITES IN THE STRANGELET SUITE ──
export const PERCHANCE_KENETICUT_URL = 'https://perchance.org/keneticut';
export const PERCHANCE_WUNDERBAR_URL = 'https://perchance.org/the-wunderbar';
export const PERCHANCE_FACE_FOR_RADIO_URL = 'https://perchance.org/face-for-radio';
export const PERCHANCE_PHASE_4_PICTURES_URL = 'https://perchance.org/phase-4-pictures';
export const PERCHANCE_THE_LSC_URL = 'https://perchance.org/thelsc';
export const PERCHANCE_AUDIO_ARC_URL = 'https://perchance.org/audioarc';

// Sister Roadside Attractions & Suite Tools (backwards compatible aliases)
export const KINETO_CUT_URL = 'https://strangelet-kineto-cut.vercel.app/';
export const AUDIO_ARC_URL = PERCHANCE_AUDIO_ARC_URL;
export const WUNDERBAR_URL = PERCHANCE_WUNDERBAR_URL;
export const CINE_SAMPLER_URL = 'https://perchance.org/strangelet-cine-sampler';

// Music & Album Releases
export const OCCULT_SONGBOOK_URL = 'https://buymeacoffee.com/magicstatic/';

// Google Flow Syncro-Vox Tool (Talking Mouth Shape Generator)
export const GOOGLE_FLOW_SYNCRO_VOX_URL = 'https://flow.google.com/shared/tool/245908d5-dceb-42ed-884c-9c2f8f21b98a';

// ── STRUCTURED ROSTER OF ALL 6 ACTIVE SITES FOR SUITE MENUS & HUBS ──
export const STRANGELET_SUITE_APPS = [
  {
    id: 'keneticut',
    title: 'KenetiCut',
    tagline: 'Audio-Reactive Montage & Reel Studio',
    badge: 'CHOREOGRAPHY & LIVING REEL',
    icon: '🎞️',
    url: PERCHANCE_KENETICUT_URL,
    desc: 'Audio-reactive video montage, beat-synced pacing & living reel choreography.',
    color: '#00e5ff',
    glow: 'rgba(0, 229, 255, 0.45)',
  },
  {
    id: 'the-wunderbar',
    title: 'The Wunderbar',
    tagline: 'Prompt Physics & Lyric Catalyst',
    badge: 'PROMPT PHYSICS & LYRIC CATALYST',
    icon: '⚡',
    url: PERCHANCE_WUNDERBAR_URL,
    desc: 'Alchemical prompt engine, lyric craft & sonic physics collisions.',
    color: '#fbbf24',
    glow: 'rgba(251, 191, 36, 0.45)',
  },
  {
    id: 'phase-4-pictures',
    title: 'Phase 4 Pictures',
    tagline: 'Visual Staging & Cinematic Scene AI',
    badge: 'VISUAL STAGING & CINEMATIC AI',
    icon: '🎬',
    url: PERCHANCE_PHASE_4_PICTURES_URL,
    desc: 'Cinematic scene generator, vintage film aesthetics & surreal photo generation.',
    color: '#f43f5e',
    glow: 'rgba(244, 63, 94, 0.45)',
  },
  {
    id: 'face-for-radio',
    title: 'Face for Radio',
    tagline: 'Character Audio & Voice Synthesizer',
    badge: 'VOICE & RADIO BROADCAST',
    icon: '🎙️',
    url: PERCHANCE_FACE_FOR_RADIO_URL,
    desc: 'Character voice synthesis, radio transmissions & vocal audio generation.',
    color: '#39ff14',
    glow: 'rgba(57, 255, 20, 0.45)',
  },
  {
    id: 'thelsc',
    title: 'The LSC',
    tagline: 'Large Sonic Collider AI Music Generator',
    badge: 'LARGE SONIC COLLIDER',
    icon: '⚛️',
    url: PERCHANCE_THE_LSC_URL,
    desc: 'High-energy prompt physics ordering chaos for AI music generation.',
    color: '#c084fc',
    glow: 'rgba(192, 132, 252, 0.45)',
  },
  {
    id: 'audioarc',
    title: 'Audio Arc',
    tagline: 'Audio Timeline & Stem Pacing',
    badge: 'AUDIO ARRANGEMENT & STEMS',
    icon: '🎚️',
    url: PERCHANCE_AUDIO_ARC_URL,
    desc: 'Dynamic audio timeline, wave shaping & multi-part stem pacing.',
    color: '#38bdf8',
    glow: 'rgba(56, 189, 248, 0.45)',
  },
];
