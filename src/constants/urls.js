// src/constants/urls.js
// Centralized URLs for Interzone Drive-In & Kinet-O-Chop

export const WEB_APP_URL = 'https://interzone-drive-in.vercel.app/';

// Windows Desktop Executable (.exe) download link.
// Can be customized via VITE_DESKTOP_DOWNLOAD_URL in .env, or points to
// GitHub Releases, a direct download link, or local /downloads/Kinet-O-Chop-Setup.exe.
export const DESKTOP_EXE_DOWNLOAD_URL =
  import.meta.env.VITE_DESKTOP_DOWNLOAD_URL ||
  'https://github.com/strangelet-lounge/kinet-o-chop/releases/latest/download/Kinet-O-Chop-Setup.exe';
