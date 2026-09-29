// src/constants/reverbPresets.js
// 8 Master Reverb Presets (Tone.Freeverb / Web Audio)

export const DEFAULT_REVERB_WET = 0.0; // Startup 100% Dry

export const REVERB_PRESETS = [
  { id: 'tight_booth', label: '1. Tight Booth (Dry / Dry-ish)', decay: 0.4, predelay: 0.01, roomSize: 0.2, dampening: 4000 },
  { id: 'tiled_echo', label: '2. Tiled Echo (Bathroom Slap)', decay: 0.8, predelay: 0.03, roomSize: 0.45, dampening: 3000 },
  { id: 'vintage_plate', label: '3. Vintage Plate 140 (Warm)', decay: 1.8, predelay: 0.02, roomSize: 0.7, dampening: 2500 },
  { id: 'twangy_spring', label: '4. Twangy Spring (60s Reverb)', decay: 2.2, predelay: 0.04, roomSize: 0.78, dampening: 1200 },
  { id: 'brutalist_hall', label: '5. Brutalist Hall (Concrete)', decay: 3.5, predelay: 0.05, roomSize: 0.88, dampening: 1800 },
  { id: 'subterranean_vault', label: '6. Subterranean Vault (Deep)', decay: 5.0, predelay: 0.08, roomSize: 0.94, dampening: 1000 },
  { id: 'interzone_void', label: '7. Interzone Void (Infinite)', decay: 8.0, predelay: 0.12, roomSize: 0.98, dampening: 500 },
  { id: 'ghost_bloom', label: '8. Ghost Bloom (Ethereal)', decay: 12.0, predelay: 0.20, roomSize: 0.99, dampening: 300 },
];
