// src/constants/initialMedia.js
// Procedural SVG, Default Artwork, and Built-in Audio Track for Instant Startup

export function createProceduralTestCard() {
  return 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';
}

// ── Built-in 32s Procedural 120 BPM Synth Track (Kick, Hats, Sub Drone) ──
function writeString(view, offset, str) {
  for (let i = 0; i < str.length; i++) {
    view.setUint8(offset + i, str.charCodeAt(i));
  }
}

export function createProceduralAudioTrack(durationSec = 32, bpm = 120) {
  try {
    const sampleRate = 22050;
    const numChannels = 1;
    const numSamples = sampleRate * durationSec;
    const buffer = new ArrayBuffer(44 + numSamples * 2);
    const view = new DataView(buffer);

    writeString(view, 0, 'RIFF');
    view.setUint32(4, 36 + numSamples * 2, true);
    writeString(view, 8, 'WAVE');
    writeString(view, 12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true); // PCM
    view.setUint16(22, numChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * 2, true);
    view.setUint16(32, 2, true);
    view.setUint16(34, 16, true);
    writeString(view, 36, 'data');
    view.setUint32(40, numSamples * 2, true);

    const beatLen = Math.floor((60 / bpm) * sampleRate);
    let offset = 44;

    for (let i = 0; i < numSamples; i++) {
      const t = i / sampleRate;
      const beatPos = (i % beatLen) / beatLen;

      // Kick drum with exponential pitch drop
      const kickFreq = 140 * Math.exp(-beatPos * 22);
      const kick = Math.sin(2 * Math.PI * kickFreq * (beatPos * (60 / bpm))) * Math.exp(-beatPos * 7);

      // Hi-hat on 8th notes
      const eighthPos = (i % Math.floor(beatLen / 2)) / (beatLen / 2);
      const hat = (Math.random() * 2 - 1) * Math.exp(-eighthPos * 18) * 0.22;

      // Warm analog sub drone (55Hz / A1)
      const drone = Math.sin(2 * Math.PI * 55 * t) * 0.16;

      const sample = Math.max(-1, Math.min(1, kick * 0.65 + hat + drone));
      view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7fff, true);
      offset += 2;
    }

    const blob = new Blob([buffer], { type: 'audio/wav' });
    return URL.createObjectURL(blob);
  } catch {
    return '';
  }
}

export const createProceduralAudioDataUri = createProceduralAudioTrack;

// ── MASTER LOAD ────────────────────────────────────────────────────────────
//
// NOTE on file naming conventions in assets-bg:
//   iz-midnight  → iz-drv-in_midnight-001.jpg   (dash before number, 3-digit)
//   iz-greenglow → iz-drv-in_greenglow001.jpg   (NO dash before number, 3-digit)
//   iz-vibe      → iz-drv-in_vibe-001.jpg       (dash before number, 3-digit)
//
// Some overflow frames from midnight (015, 016) and greenglow (024) also
// live in the iz-vibe folder — included separately below.

// Scan iz-extras in both public/assets-bg/iz-extras and assets-bg/iz-extras
const baseMediaItems = [
  // ─── IZ-MIDNIGHT  (frames 001-014 in iz-midnight folder) ───
  ...Array.from({ length: 14 }, (_, i) => {
    const n = String(i + 1).padStart(3, '0');
    return {
      id: `midnight-${n}`,
      name: `IZ Midnight ${String(i + 1).padStart(2, '0')}`,
      url: `./assets-bg/iz-midnight/iz-drv-in_midnight-${n}.jpg`,
      mediaType: 'image',
    };
  }),

  // ─── IZ-MIDNIGHT overflow (frames 015-016 landed in iz-vibe folder) ───
  {
    id: 'midnight-015',
    name: 'IZ Midnight 15',
    url: './assets-bg/iz-vibe/iz-drv-in_midnight-015.jpg',
    mediaType: 'image',
  },
  {
    id: 'midnight-016',
    name: 'IZ Midnight 16',
    url: './assets-bg/iz-vibe/iz-drv-in_midnight-016.jpg',
    mediaType: 'image',
  },

  // ─── IZ-GREENGLOW  (frames 001-023 in iz-greenglow folder) ───
  // NOTE: greenglow filenames have NO dash before the number
  ...Array.from({ length: 23 }, (_, i) => {
    const n = String(i + 1).padStart(3, '0');
    return {
      id: `greenglow-${n}`,
      name: `IZ Greenglow ${String(i + 1).padStart(2, '0')}`,
      url: `./assets-bg/iz-greenglow/iz-drv-in_greenglow${n}.jpg`,
      mediaType: 'image',
    };
  }),

  // ─── IZ-GREENGLOW overflow (frame 024 landed in iz-vibe folder) ───
  {
    id: 'greenglow-024',
    name: 'IZ Greenglow 24',
    url: './assets-bg/iz-vibe/iz-drv-in_greenglow024.jpg',
    mediaType: 'image',
  },

  // ─── IZ-VIBE  (curated: every 5th from 151, ~31 frames) ───
  ...[
    1, 5, 10, 15, 20, 25, 30, 35, 40, 45,
    50, 55, 60, 65, 70, 75, 80, 85, 90, 95,
    100, 105, 110, 115, 120, 125, 130, 135, 140, 145, 151,
  ].map((n) => {
    const ns = String(n).padStart(3, '0');
    return {
      id: `vibe-${ns}`,
      name: `IZ Vibe ${ns}`,
      url: `./assets-bg/iz-vibe/iz-drv-in_vibe-${ns}.jpg`,
      mediaType: 'image',
    };
  }),
];

import discoveredAssets from './discoveredAssets.json';

// Track all existing URLs and filenames so nothing doubles
const seenFilenames = new Set();
const seenIds = new Set();

baseMediaItems.forEach((item) => {
  if (item.id) seenIds.add(item.id.toLowerCase());
  if (item.url) {
    const fn = item.url.split('/').pop().toLowerCase();
    seenFilenames.add(fn);
  }
});

const extraMediaItems = [];
(discoveredAssets || []).forEach((item) => {
  if (!item?.url) return;
  const filename = item.url.split('/').pop();
  if (!filename) return;
  const lowerFn = filename.toLowerCase();
  if (seenFilenames.has(lowerFn)) return; // Prevent doubling!
  seenFilenames.add(lowerFn);

  extraMediaItems.push(item);
});

export const DEFAULT_MEDIA_ITEMS = [...baseMediaItems, ...extraMediaItems];
