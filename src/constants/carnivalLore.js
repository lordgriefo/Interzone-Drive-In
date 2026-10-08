// src/constants/carnivalLore.js
// Rich lore, dialogue trees, radio broadcasts, and data for the Interzone Drive-In simulation.

// ── AVAILABLE REALMS / SPACES ───────────────────────────────────────────────
export const CARNIVAL_SPACES = [
  {
    id: 'mojave',
    label: '🏜️ MOJAVE DRIVE-IN',
    sublabel: 'Distant Vegas Glow · Desert Ruins · Morphing Skies',
    themeColor: '#f59e0b',
    bgTint: 'rgba(245, 158, 11, 0.08)',
  },
  {
    id: 'midway',
    label: '🎪 1930s SIDESHOW MIDWAY',
    sublabel: 'Tod Browning Freaks · Edison Bulbs · Calliope Organ',
    themeColor: '#ea580c',
    bgTint: 'rgba(234, 88, 12, 0.08)',
  },
  {
    id: 'starport',
    label: '🛸 INTERDIMENSIONAL STARPORT',
    sublabel: 'Cosmic Cantina · Alien Variants · Sub-Space Beacons',
    themeColor: '#06b6d4',
    bgTint: 'rgba(6, 182, 212, 0.08)',
  },
  {
    id: 'monsters',
    label: '🧪 B-MOVIE MONSTER CRYPT',
    sublabel: 'Radioactive Green Glow · Creature Splicer · Atomic Tests',
    themeColor: '#22c55e',
    bgTint: 'rgba(34, 197, 94, 0.08)',
  },
  {
    id: 'arcade',
    label: '🎯 MIDWAY GAMES & BOOTHS',
    sublabel: 'High-Striker Mallet · Cut-Up Oracle · Brass Tokens',
    themeColor: '#ec4899',
    bgTint: 'rgba(236, 72, 153, 0.08)',
  },
  {
    id: 'mpc',
    label: '🎹 CINE-SAMPLER MPC DECK',
    sublabel: '16-Pad Akai Matrix · 110 Cinematography Shots',
    themeColor: '#ca8a04',
    bgTint: 'rgba(202, 138, 4, 0.08)',
  },
];

// ── CURATED BACKGROUND IMAGE PRESETS (FROM LOCAL ASSETS-BG) ────────────────
export const MOJAVE_BG_PRESETS = [
  { id: 'vibe-001', name: 'Vegas Neon Shimmer', path: './assets-bg/iz-vibe/iz-drv-in_vibe-001.jpg', desc: 'Distant neon lights along the Mojave horizon with dusk horizon' },
  { id: 'vibe-007', name: 'Morphing Star Vortex', path: './assets-bg/iz-vibe/iz-drv-in_vibe-007.jpg', desc: 'Swirling celestial constellations bending over the giant screen' },
  { id: 'vibe-018', name: 'Desert Concrete Ruins', path: './assets-bg/iz-vibe/iz-drv-in_vibe-018.jpg', desc: 'Ancient abandoned radio relay tower beside the drive-in speaker field' },
  { id: 'vibe-033', name: 'Finned Cadillac Graveyard', path: './assets-bg/iz-vibe/iz-drv-in_vibe-033.jpg', desc: '1958 finned coupes half-buried in the white desert sand' },
  { id: 'vibe-052', name: 'Cosmic Dust Mirage', path: './assets-bg/iz-vibe/iz-drv-in_vibe-052.jpg', desc: 'Golden dust devils spinning beneath violet auroral clouds' },
  { id: 'midnight-001', name: 'Dead Midnight Basin', path: './assets-bg/iz-midnight/iz-drv-in_midnight-001.jpg', desc: 'Pitch black silence under sharp silver starlight' },
  { id: 'midnight-008', name: 'Projection Beam Dust', path: './assets-bg/iz-midnight/iz-drv-in_midnight-008.jpg', desc: 'Glowing 35mm photon beam illuminating suspended dust motes' },
  { id: 'green-001', name: 'Radioactive Glow Dunes', path: './assets-bg/iz-greenglow/iz-drv-in_greenglow001.jpg', desc: 'Luminescent neon phosphor wash across the amphitheater' },
  { id: 'green-014', name: 'Atomic Test Phosphor', path: './assets-bg/iz-greenglow/iz-drv-in_greenglow014.jpg', desc: 'Green CRT residue following an early morning desert detonation' },
];

// ── MOJAVE DRIVE-IN AM RADIO STATIONS ───────────────────────────────────────
export const MOJAVE_RADIO_STATIONS = [
  {
    freq: 'AM 540',
    name: 'K-VEGAS CASINO STRIP MIRAGE',
    desc: 'Late-night muted trumpet swing, dice rattling, and roulette wheel static drifting from the neon strip.',
    soundType: 'jazz',
  },
  {
    freq: 'AM 780',
    name: 'DESERT NUMBERS STATION [XM-4]',
    desc: 'A monotone synthesized female voice reciting Spanish phonetic digits over a shortwave chime loop.',
    soundType: 'numbers',
  },
  {
    freq: 'AM 1080',
    name: 'THE STRANGELET LAB TELEMETRY',
    desc: 'Live telemetry broadcast directly from the Mothership DAW: sub-bass pulse, 432Hz sine chime, and quark spin readings.',
    soundType: 'mothership',
  },
  {
    freq: 'AM 1320',
    name: 'CREATURE FEATURE THEATER RADIO',
    desc: '1950s trailer voiceover: “BEHOLD THE GIGANTIC HORROR FROM THE UNEXPLORED DEEPS OF STRANGELET BASIN!”',
    soundType: 'horror',
  },
  {
    freq: 'AM 1590',
    name: 'INTERPLANETARY STATIC VOID',
    desc: 'Jupiter magnetosphere radio whistlers, pulsars clicking like a typewriter, and ionospheric whistlers.',
    soundType: 'space',
  },
];

// ── INTERACTIVE DENIZENS & DIALOGUE NPC REGISTRY ─────────────────────────────
export const ALL_DENIZENS = [
  // ── SIDESHOW DENIZENS ──
  {
    id: 'barker',
    space: 'midway',
    name: 'PROFESSOR JACK “THE BARKER”',
    title: 'Sideshow Orator & Snake-Oil Master',
    icon: '📢',
    color: '#ea580c',
    voiceType: 'speech',
    bio: 'Wears a silk top hat with dust on the brim. Has cried spiels for 40 years across every medicine show from Topeka to the Mojave.',
    greeting: '“Hurry, hurry, hurry! Step right up, traveler! What brings your shoes into the sawdust of the Interzone?”',
    dialogue: [
      {
        question: '“What exactly is this place in the desert?”',
        answer: '“This, my friend, is the geographic crossroad where 1932 carnival nitrate collides with the outer void! The drive-in screen acts as a lens. Every beam of light cuts through space-time!”',
      },
      {
        question: '“Where is the mothership—The Strangelet Lab?”',
        answer: '“Ah! The mothership sits back in the control nexus! Everything here—the Cine-Sampler, the Kineto-Cut chopper, Audio Arc—are satellite vessels tethered to that great audio-visual DAW!”',
      },
      {
        question: '“Do you have any spare carnival tokens?”',
        reward: 2,
        answer: '“A fellow carny in need? Here—take two brass slugs. Go ring the bell on the High-Striker or ask Madame Xenotrope for a cut-up prophecy!”',
      },
      {
        question: '“What’s that strange glowing green fog behind the dunes?”',
        answer: '“Don’t drink the cactus water back there! That’s the B-Movie Monster Crypt where the 1950s atomic tests cracked open old celluloid creature vaults!”',
      },
    ],
  },
  {
    id: 'xenotrope',
    space: 'midway',
    name: 'MADAME XENOTROPE',
    title: 'The Stroboscopic Clairvoyant',
    icon: '👁️',
    color: '#d97706',
    voiceType: 'mystic',
    bio: 'Her eyelids flutter at exactly 24 hertz. She sees past and future not as a river, but as individual gelatin silver halide frames.',
    greeting: '“Your shutter angle is 180 degrees, stranger. But your timeline is slipping out of sync. What truth do you seek?”',
    dialogue: [
      {
        question: '“Read my fortune from the cut-up strips.”',
        answer: '“I see a montage cut strictly on the sub-bass transient. The razor blade does not lie: a strange purple quark will enter your audio track and alter your arrangement.”',
      },
      {
        question: '“Why does the stroboscope govern you?”',
        answer: '“When you perceive reality at 24 frames each second, the darkness between the frames becomes visible. That black inter-frame darkness is where the aliens hide.”',
      },
      {
        question: '“Can you reveal a secret code for the Cine-Sampler?”',
        answer: '“Tap Pad 16 on the downbeat, then choke Pad 2 immediately after. It creates a crash zoom that will bend any viewer’s optic nerve.”',
      },
    ],
  },
  {
    id: 'hans',
    space: 'midway',
    name: 'HANS THE LIVING FILM-REEL',
    title: 'The 35mm Celluloid Man',
    icon: '🎞️',
    color: '#b45309',
    voiceType: 'clicker',
    bio: 'Born in an open vat of developer fluid in 1928. Sprocket holes run down the sides of his spine.',
    greeting: '“Clack-clack... mind the acetate fumes. If you strike a match in here, my left arm might catch fire.”',
    dialogue: [
      {
        question: '“How does it feel to be made of motion picture film?”',
        answer: '“Light hurts, but the projector gate feels like home. When the bulb turns on, my memories play across whatever wall faces me.”',
      },
      {
        question: '“What is the most dangerous film stock?”',
        answer: '“Cellulose nitrate. It produces its own oxygen as it burns. Even underwater, the montage never stops dying.”',
      },
      {
        question: '“Teach me the secret to a jump cut.”',
        answer: '“Cut out the hesitation! Remove the breath before the sentence! Let the music drop while the eye is still blinking!”',
      },
    ],
  },
  {
    id: 'siamese',
    space: 'midway',
    name: 'THE BURROUGHS SIAMESE',
    title: 'William & Bill, The Twin Scissors',
    icon: '✂️',
    color: '#9333ea',
    voiceType: 'cutup',
    bio: 'Two minds joined by a magnetic tape splice. They finish each other’s cut-ups before the tape head reads them.',
    greeting: '“Cut word lines... / ...shift lingual space! When you cut into the present, the future leaks out.”',
    dialogue: [
      {
        question: '“How do you predict the future with scissors?”',
        answer: '“Take a newspaper from yesterday. Fold it through a screenplay from tomorrow. Read across the middle column. The result is what will happen tonight at 3 AM.”',
      },
      {
        question: '“What do you think of Strangelet Cine-Sampler?”',
        answer: '“An Akai MPC for shots! Brilliant cut-up apparatus! 110 cinematography cards shuffled like a deck of playing cards!”',
      },
    ],
  },

  // ── STARPORT ALIEN DENIZENS ──
  {
    id: 'xur7',
    space: 'starport',
    name: 'COMMANDER XUR-7',
    title: 'Alpha Quadrant Celluloid Scout',
    icon: '🛸',
    color: '#06b6d4',
    voiceType: 'synth',
    bio: 'A crystalline polymorph from the Orion sector. His species consumes terrestrial B-movie radiation as high-protein nourishment.',
    greeting: '“*BZZT-GLITCH* Earth creature! Your optical projectors emit 580 nanometer photons of unmatched aesthetic beauty. State your business.”',
    dialogue: [
      {
        question: '“What brought your starship to the Mojave Desert?”',
        answer: '“We tracked electromagnetic transmissions of 1950s atomic sci-fi movies across three parsecs. The giant drive-in screen is visible from lunar orbit!”',
      },
      {
        question: '“How do aliens edit motion pictures?”',
        answer: '“We do not edit temporally. We view all frames simultaneously in five dimensions as a singular hyper-cube of frozen emotion.”',
      },
      {
        question: '“Can you translate the sub-space frequency 1420 MHz?”',
        reward: 3,
        answer: '“That is the galactic Hydrogen beacon! It pulses in 4/4 time at 128 BPM! Here—take these 3 cosmic quarks for listening to the truth!”',
      },
    ],
  },
  {
    id: 'blob58',
    space: 'starport',
    name: 'THE 1958 GELATINOUS BLOB',
    title: 'Sentient Silicon-Carbide Mass',
    icon: '🟣',
    color: '#a855f7',
    voiceType: 'gurgle',
    bio: 'Escaped from a projection booth beam during a midnight screening of a Steve McQueen film. Absorbs carbon dioxide and sub-bass frequencies.',
    greeting: '“*GLUB... SQUISH... SQUELCH...* [A rhythmic purple gelatin bubble vibrates with deep 40Hz sub-bass resonance]”',
    dialogue: [
      {
        question: '“Are you going to consume the drive-in snack bar?”',
        answer: '“*Gurgle-pop!* Already consumed 40 crates of buttery popcorn and three cases of Strangelet Glow Soda! Growing exponentially!”',
      },
      {
        question: '“What music do you like?”',
        answer: '“*Squelch!* Heavy 808 kicks! The lower the frequency, the more elastic my protoplasm becomes!”',
      },
    ],
  },
  {
    id: 'roswell',
    space: 'starport',
    name: 'THE ROSWELL GREY 1947',
    title: 'Telepathic Numbers Entity',
    icon: '👽',
    color: '#10b981',
    voiceType: 'telepath',
    bio: 'Recovered from the Corona crash debris with an unexposed reel of magnesium alloy film in his clasp.',
    greeting: '“09... 44... 108... 772... We hear your thoughts before your vocal cords resonate. What does the human heart edit for?”',
    dialogue: [
      {
        question: '“What was on that magnesium film reel?”',
        answer: '“Star charts of the Perseus Arm, rendered in sound waveforms. If loaded into Kineto-Cut, the screen dissolves into starlight.”',
      },
      {
        question: '“Why do your flying saucers visit drive-in theaters?”',
        answer: '“The drive-in is the only human institution where thousands of minds sit in metal capsules in the dark, watching giant light illusions together. It resembles our communion.”',
      },
    ],
  },
  {
    id: 'gort9',
    space: 'starport',
    name: 'GORT-9 SENTINEL',
    title: 'Klaatu Heavy Automaton',
    icon: '🤖',
    color: '#94a3b8',
    voiceType: 'robot',
    bio: 'Eight feet of polished interstellar metal alloy. His visor emits an eye-searing ruby disintegration laser on beat drops.',
    greeting: '“KLAATU BARADA NIKTO. SCANNING LOCAL ENTITY FOR WEAPONS OR CORRUPT CODECS.”',
    dialogue: [
      {
        question: '“What is your duty at the Interzone?”',
        answer: '“PROTECTION OF THE ANALOG MASTER REEL. NO HARMFUL FREQUENCIES MAY DISTORT THE SACRED CHOP.”',
      },
      {
        question: '“Can you fire your visor beam at the sky?”',
        answer: '“BEAM ENGAGED AT 10% POWER. OBSERVING PHOSPHOROUS RETENTION IN DESERT STRATOSPHERE.”',
      },
    ],
  },

  // ── B-MOVIE MONSTER CRYPT DENIZENS ──
  {
    id: 'gillman',
    space: 'monsters',
    name: 'THE GILL-MAN OF STRANGELET BASIN',
    title: 'Devonian Lagoon Survivor',
    icon: '🦎',
    color: '#22c55e',
    voiceType: 'growl',
    bio: 'Dwells in the runoff cooling tank behind the drive-in projector. Has webbed talons perfectly contoured for spinning edit reels.',
    greeting: '“*HSSSSS-GURGLE* The desert is too dry, human! But the glow of that screen feels like moonlight through brackish water!”',
    dialogue: [
      {
        question: '“How did a lagoon creature end up in the Mojave?”',
        answer: '“*Chirp-click* A traveling carnival wagon broke an axle in 1954. I slipped into the underground aquifer and found the drive-in drainpipe!”',
      },
      {
        question: '“What is your favorite cinematic transition?”',
        answer: '“The ripple dissolve! When one image liquefies into the next like pond weeds parting for a predator!”',
      },
    ],
  },
  {
    id: 'nosferatu',
    space: 'monsters',
    name: 'COUNT ORLOK / NOSFERATU',
    title: '1922 Lead Silent Editor',
    icon: '🧛',
    color: '#ef4444',
    voiceType: 'whisper',
    bio: 'His silhouette alone casts 12-foot shadows across the canvas tents. He uses his razor fingernails as splicing blades.',
    greeting: '“The sun has set over the dunes... the nitrate bat emerges. Why do you awaken the master of shadows?”',
    dialogue: [
      {
        question: '“Why do you prefer silent cinema?”',
        answer: '“Silence makes the eyes hungry. When there is no sound, the mind projects its own scream onto the dark.”',
      },
      {
        question: '“How do you cut film with those long fingers?”',
        answer: '“One claw shears the celluloid. The second scratches the emulsion. The third applies the toxic acetone glue. Flawless splice every time.”',
      },
    ],
  },
  {
    id: 'giantwoman',
    space: 'monsters',
    name: 'THE 50-FOOT WOMAN',
    title: 'Colossal Drive-In Titaness',
    icon: '👠',
    color: '#f43f5e',
    voiceType: 'boom',
    bio: 'Enlarged by alien radiation in 1958. She can lean her elbows comfortably on top of the 60-foot drive-in screen tower.',
    greeting: '“Watch your step, little one! One wrong move and I might accidentally kick your car into the neon billboard!”',
    dialogue: [
      {
        question: '“What does the drive-in look like from 50 feet up?”',
        answer: '“Like a glowing silver stamp in an ocean of black sand! I can see the headlights on Route 66 all the way to Barstow!”',
      },
      {
        question: '“Can you adjust the projector angle for us?”',
        answer: '“Already did! Gave it a 3-degree Dutch tilt. Looks much more dynamic that way!”',
      },
    ],
  },
  {
    id: 'telepodfly',
    space: 'monsters',
    name: 'DR. BRUNDLE-FLY',
    title: 'Telepod Genetic Splicer',
    icon: '🪰',
    color: '#84cc16',
    voiceType: 'buzz',
    bio: 'Stepped into a teleportation pod with a stray strip of 16mm reversal film. Part scientist, part insect, part optical printer.',
    greeting: '“*BZZZZ-CLICK* Help me... fuse the audio... with the video! The telepods want to merge all media into a single organism!”',
    dialogue: [
      {
        question: '“What happens when you splice two creature reels together?”',
        answer: '“Pure cinematic evolution! Try the Monster Splicer machine beside my cage! Pull the lightning lever and behold what crawls out!”',
      },
      {
        question: '“Are you in pain?”',
        answer: '“Only when someone renders a video in the wrong aspect ratio! 16:9 hurts my compound eyes! Give me 4:3 Academy ratio!”',
      },
    ],
  },
];

// ── B-MOVIE MONSTER SPLICER RECIPES (MINIGAME) ──────────────────────────────
export const MONSTER_INGREDIENTS = [
  { id: 'gillman', name: 'Lagoon Creature DNA', icon: '🦎', color: '#22c55e' },
  { id: 'nosferatu', name: 'Nosferatu Shadow Claws', icon: '🧛', color: '#ef4444' },
  { id: 'alien', name: 'Roswell Grey Telepathy', icon: '👽', color: '#06b6d4' },
  { id: 'blob', name: 'Silicon Blob Protoplasm', icon: '🟣', color: '#a855f7' },
  { id: 'kaiju', name: 'Radioactive Kaiju Scale', icon: '🦖', color: '#eab308' },
  { id: 'automaton', name: 'Gort-9 Heavy Alloy', icon: '🤖', color: '#94a3b8' },
];

export const SYNTHESIZED_MONSTERS = [
  {
    combo: ['gillman', 'nosferatu'],
    name: 'COUNT ICHTHYOS: THE VAMPIRE OF THE DEEP',
    tagline: '“HE DRINKS THE BLOOD OF LAGOON SWIMMERS THROUGH WEBBED FANGS!”',
    desc: 'A pale amphibian aristocrat with razor fins. Slices film rolls with ultrasonic echolocation clicks.',
    statAtk: 88,
    statChaos: 92,
  },
  {
    combo: ['alien', 'blob'],
    name: 'THE ASTRAL GELATIN OF PLANET X',
    tagline: '“NO WEAPON CAN PIERCE IT! IT DISSOLVES SOUND BOOTHS INTO PURE SUB-BASS!”',
    desc: 'An oozing magenta mass that absorbs radio waves and speaks telepathically in vintage synth arpeggios.',
    statAtk: 75,
    statChaos: 98,
  },
  {
    combo: ['kaiju', 'automaton'],
    name: 'MECHA-GOLIATH: THE URANIUM SENTINEL',
    tagline: '“ARMED WITH RUBY LASERS TO DEFEND THE LAST ANALOG MASTER TAPE!”',
    desc: 'Towering armored colossus fueled by atomic decay. Emits 60Hz generator hum with every earth-shaking step.',
    statAtk: 99,
    statChaos: 70,
  },
  {
    combo: ['gillman', 'alien'],
    name: 'THE COSMIC GILL-BEAST',
    tagline: '“FROM THE SUB-SURFACE OCEANS OF EUROPA TO THE MOJAVE DESERT!”',
    desc: 'Bioluminescent aquatic alien with six telescopic eye-stalks. Cuts videos strictly on underwater sound waves.',
    statAtk: 82,
    statChaos: 85,
  },
  {
    combo: ['nosferatu', 'automaton'],
    name: 'CYBER-ORLOK 2000',
    tagline: '“A METALLIC PHANTOM THAT DRAINS VOLTAGE FROM SIDESHOW GENERATORS!”',
    desc: 'Chrome-plated vampire equipped with motorized reel cutters and infrared night vision lenses.',
    statAtk: 91,
    statChaos: 80,
  },
  {
    combo: ['blob', 'kaiju'],
    name: 'GELATIN-KAIJU THE DESTROYER',
    tagline: '“ONE HUNDRED FEET OF SQUISHING, ROARING B-MOVIE TERROR!”',
    desc: 'A massive radioactive blob that can mimic the shape of any billboard or drive-in projection tower it engulfs.',
    statAtk: 95,
    statChaos: 99,
  },
];
