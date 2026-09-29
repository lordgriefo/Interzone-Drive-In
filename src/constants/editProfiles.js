// src/constants/editProfiles.js
// Phase 2: Kinetic Edit Profiles (Stan Brakhage, Ken Burns The Criminal Drift, Apple Kinetic Cut, Burroughs, Montage)

export const EDIT_PROFILES = [
  {
    id: 'third_mind',
    label: '1. Burroughs Cut-Up (Third Mind)',
    description: 'Spliced 3-column montage with beat-synced cut-up typography.',
    category: 'Avant-Garde',
  },
  {
    id: 'brakhage_emulsion',
    label: '2. Stan Brakhage (Direct Emulsion)',
    description: 'Direct-on-film scratches, organic dye pulses, and gate micro-hops.',
    category: 'Experimental Film',
  },
  {
    id: 'ken_burns',
    label: '3. Ken Burns (Archival Rostrum)',
    description: 'Flat, zero distortion, smooth cubic pan-and-scan and slow zoom (1.0× → 1.15×).',
    category: 'Cinematic',
  },
  {
    id: 'fiona_voyeur',
    label: '4. Fiona Voyeur (Criminal 1997)',
    description: 'Handheld wander, radial barrel drift, chromatic aberration, and warm amber grading.',
    category: 'Cinematic',
  },
  {
    id: 'apple_kinetic',
    label: '5. Apple Kinetic (Beat Pivot & Pop)',
    description: 'Sharp 90° orientation snaps and punchy 1.25× scale pops on downbeats.',
    category: 'Kinetic Motion',
  },

  {
    id: 'narrative',
    label: '5. Narrative (The Criminal Pan)',
    description: 'Slow mid-range horizontal pan with bass depth weighting.',
    category: 'Narrative',
  },
  {
    id: 'montage',
    label: '6. Soviet Montage (Collision Cuts)',
    description: 'Eisenstein intellectual collision cuts on transient peaks.',
    category: 'Montage',
  },
  {
    id: 'surreal',
    label: '7. Surrealist (Edge Melting)',
    description: 'Screen-blend edge diffusion and spectral mid-blurring.',
    category: 'Surreal',
  },
  {
    id: 'strobe',
    label: '8. Kineto-Stroboscopic (Invert Pulse)',
    description: 'Half-note tempo-locked phase inversion pulse.',
    category: 'Stroboscopic',
  },
  {
    id: 'venetian',
    label: '9. Venetian Blind (180° Slats)',
    description: 'Geometric multi-slat raster slicing.',
    category: 'Geometric',
  },
  {
    id: 'jitter',
    label: '10. Jitter Frame (Reel Gate Bounce)',
    description: 'Quarter-note seeded deterministic noise translation.',
    category: 'Mechanical',
  },
  {
    id: 'seance_dissolve',
    label: '11. Séance Dissolve (Ghost Double)',
    description: 'Slow oscillating opacity ghost-double with spectral hue drift — like a spirit frame superimposed over the source.',
    category: 'Experimental Film',
  },
  {
    id: 'magnetic_tape',
    label: '12. Magnetic Tape (Slant & Dropout)',
    description: 'VHS-era horizontal slant shimmer with bass-triggered dropout hops and warm tape saturation.',
    category: 'Mechanical',
  },
  {
    id: 'liquid_gate',
    label: '13. Liquid Gate (Wet Print Bloom)',
    description: 'Wet-gate halation: soft diffusion bloom that breathes with the audio mids, suppressing scratches and adding warmth.',
    category: 'Experimental Film',
  },

  // ── CHILL / AMBIENT STYLES ──────────────────────────────────────────────
  {
    id: 'ambient_drift',
    label: '14. Ambient Drift (Slow Float)',
    description: 'Ultra-slow harmonic sine translation — barely perceptible, meditative. No transient cuts. Perfect for ambient and drone music.',
    category: 'Chill',
  },
  {
    id: 'lo_fi_flicker',
    label: '15. Lo-Fi Flicker (Warm Desaturation)',
    description: 'Gentle warm sepia desaturation with slow brightness flicker and subtle grain shift — the lo-fi hip-hop aesthetic.',
    category: 'Chill',
  },
  {
    id: 'slow_dissolve',
    label: '16. Slow Dissolve (Crossfade Cuts)',
    description: 'Smooth fade-in of each new slide on transient beats — long 1.5s opacity transition. Cinematic and unhurried.',
    category: 'Chill',
  },
  {
    id: 'dreamscape',
    label: '17. Dreamscape (Shoegaze Haze)',
    description: 'Very slow pastel hue rotation + soft Gaussian breathing + gentle opacity pulse — dreamy, shoegaze, dreampop concert cam.',
    category: 'Chill',
  },

  // ── DIRECTOR TRIBUTES ──────────────────────────────────────────────────
  { id: 'deren_meshes',      category: 'Directors', label: '18. Maya Deren — Meshes of the Afternoon', description: 'Dream logic: slow mirror flip, soft focus blur, high-contrast monochrome with fleeting colour. Inspired by Meshes of the Afternoon (1943).' },
  { id: 'anger_scorpio',     category: 'Directors', label: '19. Kenneth Anger — Scorpio Rising',       description: 'Occult biker: oversaturated reds and golds, fast ritualistic cuts, stroboscopic flash. Inspired by Scorpio Rising (1963).' },
  { id: 'mekas_diary',       category: 'Directors', label: '20. Jonas Mekas — Walden Diaries',         description: 'Handheld diary cinema: warm light leaks, overexposed frames, intimate jitter. Inspired by Walden (1969).' },
  { id: 'marker_jetee',      category: 'Directors', label: '21. Chris Marker — La Jetée',              description: 'Memory stills: nearly frozen image, high-contrast B&W, slow blue-grey tint. Inspired by La Jetée (1962).' },
  { id: 'warhol_screen',     category: 'Directors', label: '22. Andy Warhol — Screen Tests',           description: 'Durational cinema: static, confrontational, B&W portrait with factory grain. Inspired by the Screen Tests (1964-66).' },
  { id: 'jarman_super8',     category: 'Directors', label: '23. Derek Jarman — Super8 Punk',           description: 'Super8 punk decay: high contrast, blown-out whites, raw and visceral. Inspired by Jubilee (1978) and Blue (1993).' },
  { id: 'debord_detourne',   category: 'Directors', label: '24. Guy Debord — Détournement',            description: 'Anti-spectacle: text colonizes the image, high-contrast negation, deliberate alienation. Inspired by the Situationists.' },
  { id: 'smith_flaming',     category: 'Directors', label: '25. Jack Smith — Flaming Creatures',       description: 'Tropical camp excess: oversaturated pastels, dreamy overexposure, lush chromatic ecstasy. Inspired by Flaming Creatures (1963).' },
  { id: 'schneemann_fuses',  category: 'Directors', label: '26. Carolee Schneemann — Fuses',           description: 'Direct emulsion body cinema: painted-over frames, radical superimposition, organic grain storms. Inspired by Fuses (1965).' },
  { id: 'lynch_redroom',     category: 'Directors', label: '27. David Lynch — Red Room',                description: 'Twin Peaks velvet dread: deep crimson saturation, agonizing 12fps slow pans, electrical surge on bass drops, and Red Room subliminal text. Inspired by Twin Peaks (1990–2017).' },
  { id: 'lynch_eraserhead',  category: 'Directors', label: '28. David Lynch — Eraserhead',             description: 'Industrial monochrome nightmare: tungsten flicker, heavy shadow crush, blinding electrical transient flashes, and factory-floor subliminal text. Inspired by Eraserhead (1977).' },
];

export const WEBM_LOOP_PRESETS = [
  {
    id: 'organic_dust',
    label: '🎞️ 16mm Dust & Scratches',
    type: 'dust',
    color: '#ffaa44',
  },
  {
    id: 'film_grain',
    label: '📽️ Celluloid Silver Grain',
    type: 'grain',
    color: '#00e5ff',
  },
  {
    id: 'geometric_alpha',
    label: '⚡ Geometric Scanlines Alpha',
    type: 'scanlines',
    color: '#a78bfa',
  },
];
