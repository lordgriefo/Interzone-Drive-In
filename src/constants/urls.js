// src/constants/urls.js
// Centralized URLs for Interzone Drive-In & Kinet-O-Chop

export const WEB_APP_URL = 'https://interzone-drive-in.vercel.app/';

// Windows Desktop Executable (.exe) download link.
// Can be customized via VITE_DESKTOP_DOWNLOAD_URL in .env, or points to
// GitHub Releases, a direct download link, or local /downloads/Kinet-O-Chop-Setup.exe.
export const DESKTOP_EXE_DOWNLOAD_URL =
  import.meta.env.VITE_DESKTOP_DOWNLOAD_URL ||
  'https://github.com/strangelet-lounge/kinet-o-chop/releases/latest/download/Kinet-O-Chop-Setup.exe';

// Creator Support Page (Buy Me a Coffee)
export const BUY_ME_A_COFFEE_URL = 'https://buymeacoffee.com/magicstatic/';

// Sister Roadside Attractions & Suite Tools
export const KINETO_CUT_URL = 'https://strangelet-kineto-cut.vercel.app/';
export const AUDIO_ARC_URL = 'https://audioarc.vercel.app/';
export const WUNDERBAR_URL = 'https://perchance.org/the-wunderbar';
export const CINE_SAMPLER_URL = 'https://perchance.org/strangelet-cine-sampler';
