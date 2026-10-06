// src/constants/editProfiles.js
// Phase 2: Kinetic Edit Profiles (Stan Brakhage, Ken Burns The Criminal Drift, Apple Kinetic Cut, Burroughs, Montage)

export const EDIT_PROFILES = [
  {
    id: 'timeline',
    label: '★ Timeline Edit (plays YOUR clip order)',
    description: 'The viewport plays exactly what is on the timeline: clip order, trims, reverse, mirror, crossfade overlaps. Edit with the timeline tools; the audio-reactive FX still apply on top.',
    category: 'Your Edit',
  },
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

  // ── MUSIC VIDEO / AI VIDEO STYLES ──────────────────────────────────────────
  {
    id: 'mv_long_cut',
    label: '29. MV Long Cut (5s AI Video Hold)',
    description: 'Holds each clip for ~5 seconds. Cuts only on strong bass transients. Audio-reactive brightness and scale pulse during hold. Designed for 5–10s AI-generated video clips.',
    category: 'Music Video',
  },
  {
    id: 'mv_slow_burn',
    label: '30. MV Slow Burn (10s Cinematic Hold)',
    description: 'Holds each clip for ~10 seconds with a warm colour-grade pulse on beats. Very infrequent cuts — lets long AI video clips play through almost completely.',
    category: 'Music Video',
  },
  {
    id: 'mv_flash_cut',
    label: '31. MV Flash Cut (Beat-Locked Quick Edit)',
    description: 'Cuts every 2–4 beats with a white-flash punch on the downbeat. Keeps clips visible for 2–4 seconds — the classic music video quick-cut tempo feel.',
    category: 'Music Video',
  },
  {
    id: 'mv_cinematic_glide',
    label: '32. MV Cinematic Glide (6s Slow Pan & Swell)',
    description: 'Holds clips for ~6 seconds with an ultra-smooth widescreen dolly pan and subtle bass-reactive scale swell. Perfect for cinematic landscape and AI video footage.',
    category: 'Music Video',
  },
  {
    id: 'mv_hypnotic_drift',
    label: '33. MV Hypnotic Drift (8s Dream Bloom)',
    description: 'Holds clips for ~8 seconds with dreamy slow hue-shifting, soft exposure breathing, and gentle Gaussian bloom on transients.',
    category: 'Music Video',
  },

  // ── PSYCHONAUT / ENTHEOGEN STYLES ─────────────────────────────────────────
  {
    id: 'dmt_breakthrough',
    label: '34. DMT Hyperspace (Sacred Geometry Shift)',
    description: 'Rapid kaleidoscopic phase shift, hyperbolic scale expansion on downbeats, transient solarize inverts, and chanting geometric resonance. The 5-MeO / DMT breakthrough experience.',
    category: 'Psychonaut',
  },
  {
    id: 'lsd_acid_melt',
    label: '35. LSD Acid Tracers (Prismatic Edge Melt)',
    description: 'Liquid undulating breathing with trailing chromatic rainbow edge-dispersions and continuous fluid displacement melt. Classic bicycle-day acid visuals.',
    category: 'Psychonaut',
  },
  {
    id: 'psilocybin_breath',
    label: '36. Psilocybin Breathing (Organic Wall Pulse)',
    description: 'Deep organic spatial expansion/contraction, earthy warm saturation swells, undulating living wall breathing on bass cycles. Shroom-state organic presence.',
    category: 'Psychonaut',
  },
  {
    id: 'ayahuasca_vision',
    label: '37. Ayahuasca Shamanic (Visionary Serpent)',
    description: 'Emerald and gold visionary grading, serpentine horizontal wave drifts, sacred geometric flashes on transients, and entheogenic glow.',
    category: 'Psychonaut',
  },
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
