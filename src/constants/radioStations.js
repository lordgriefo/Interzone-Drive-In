// src/constants/radioStations.js
// Interzone Drive-In Multi-Channel Pirate Radio Network

// Configurable Cloudflare R2 bucket base URL.
// Can be customized via localStorage ('interzone_r2_url') or VITE_R2_RADIO_URL.
export function getR2BaseUrl() {
  if (typeof window !== 'undefined') {
    const custom = window.localStorage.getItem('interzone_r2_url');
    if (custom) return custom.replace(/\/+$/, '');
  }
  return (import.meta.env.VITE_R2_RADIO_URL || '').replace(/\/+$/, '');
}

export function setR2BaseUrl(url) {
  if (typeof window !== 'undefined') {
    if (url) {
      window.localStorage.setItem('interzone_r2_url', url.trim().replace(/\/+$/, ''));
    } else {
      window.localStorage.removeItem('interzone_r2_url');
    }
  }
}

// ── SAMPLE VINTAGE ADS & CONCESSION BUMPERS (BUILT-IN DRIVE-IN ADS) ──
export const SAMPLE_VINTAGE_ADS = [
  {
    id: 'ad_snack_bar_01',
    title: 'Interzone Snack Bar: Centipede Burgers & Mescaline Malts',
    duration: 18,
    text: "Visit the concession stand now! Try our atomic chili dogs, piping hot buttered popcorn, and the world-famous Interzone Centipede Burger with radioactive mescaline malt!",
    tag: 'CONCESSION STAND'
  },
  {
    id: 'ad_movie_trailer_01',
    title: 'Coming Friday: Reform School Archon Girls in Shock-O-Vision',
    duration: 22,
    text: "Coming this Friday to the giant outdoor screen: Reform School Archon Girls! Detention in the fourth dimension! Bad girls, rayguns, and hotrod astral jailbreaks! Rated XXX!",
    tag: 'COMING ATTRACTION'
  },
  {
    id: 'ad_drivein_rules_01',
    title: 'Mojave Drive-In Courtesy Reminder: Do Not Look in the Trunk',
    duration: 15,
    text: "Drive-In courtesy reminder: Please dim your headlights, keep your window speaker volume at a reasonable level, and under no circumstances look inside the trunk of the 1964 Malibu.",
    tag: 'DRIVE-IN PSA'
  },
  {
    id: 'ad_something_weird_01',
    title: 'Midnight Monsterfest: Attack of the 50-Foot Thelemite',
    duration: 20,
    text: "Midnight madness returns to the desert! See the 50-Foot Thelemite terrorize the 1966 Vegas Strip! Packed with thrills, chills, and unearthly magick in glorious Technicolor!",
    tag: 'SOMETHING WEIRD'
  }
];

// ── DOC ENOCH SAMPLE RADIO INTROS & DISPATCHES ──
export const DOC_ENOCH_SAMPLES = [
  {
    id: 'enoch_intro_dee',
    title: "Doc Enoch: John Dee's Obsidian Mirror",
    duration: 16,
    text: "Doc Enoch here on W-OCCULT 99.3... that's Magick with a K, travelers. Queen Elizabeth's mathematician gazing into an Aztec black mirror while angels give questionable domestic advice. Drop the needle.",
    tag: 'DOC ENOCH'
  },
  {
    id: 'enoch_intro_babalon',
    title: "Doc Enoch: Pasadena 1946",
    duration: 14,
    text: "Riding with Doc Enoch through the midnight stretch. 1003 South Orange Grove, solid rocket fuel, and red hair howling in the Pasadena wind. Here is the Babalon Working Blues.",
    tag: 'DOC ENOCH'
  },
  {
    id: 'enoch_weather_mojave',
    title: "Doc Enoch: High Desert Weather",
    duration: 15,
    text: "Late-night Mojave weather: 71 degrees, a forty percent chance of localized temporal anomalies, and a steady 3.8 roentgens coming off the Malibu in the back row.",
    tag: 'MOJAVE WEATHER'
  },
  {
    id: 'enoch_error_zos',
    title: "Doc Enoch: Transmission Slip",
    duration: 12,
    text: "Wait a second... sausage and mash? No. Zos and Kia. Austin Osman Spare and the Alphabet of Desire. Correction noted. Keep it rolling.",
    tag: 'TRANSMISSION ERROR'
  }
];

// ── THE 5 INTERZONE PIRATE RADIO STATIONS ──
export const INTERZONE_RADIO_STATIONS = [
  {
    id: 'w_occult',
    dial: '99.3 FM',
    freqNumber: 99.3,
    callSign: 'W-OCCULT',
    name: 'W-OCCULT 99.3 FM',
    shortName: 'W-OCCULT',
    genre: 'Occult Americana & Psych-Rock',
    host: 'Doc Enoch (Magick with a K)',
    vibe: 'Terence McKenna / Hunter S. Thompson Gonzo Desert Mystic',
    slogan: 'Broadcasting between the Mojave dunes and Universe B',
    color: '#ff6b00',
    glow: 'rgba(255, 107, 0, 0.65)',
    icon: '📻',
    featuredAlbum: 'As Above, So Below: An Occult Songbook',
    tracks: [
      { id: 'aasb_01', num: '01', title: 'Babalon Working Blues', artist: "'O' Shibboleth", url: './assets-bg/babalon-working-blues.mp3', duration: 214 },
      { id: 'aasb_02', num: '02', title: 'Do What Thou Wilt (Hillbilly Hadit)', artist: "'O' Shibboleth", url: './assets-bg/excavating-neverland.mp3', duration: 237 },
      { id: 'aasb_03', num: '03', title: 'The Lam & the Grey', artist: "'O' Shibboleth", url: './assets-bg/wait-till-you-see-it.mp3', duration: 226 },
      { id: 'aasb_04', num: '04', title: 'Thelema Mountain', artist: "'O' Shibboleth", url: './assets-bg/thelema-mountain.mp3', duration: 280 },
      { id: 'aasb_05', num: '05', title: "The Con Man Sails Away (L. Ron's Excellent Adventure)", artist: "'O' Shibboleth", url: './assets-bg/high-roller.mp3', duration: 191 },
      { id: 'aasb_06', num: '06', title: 'Cameron (The Scarlet Woman of Pasadena)', artist: "'O' Shibboleth", url: './assets-bg/the-breach.mp3', duration: 257 },
      { id: 'aasb_07', num: '07', title: 'Kenneth Grant & the Typhonian Transmission', artist: "'O' Shibboleth", url: './assets-bg/the-eighth-sphere.mp3', duration: 245 },
      { id: 'aasb_08', num: '08', title: 'Six Months in the Desert (Abramelin Boogie)', artist: "'O' Shibboleth", url: './assets-bg/excavating-neverland.mp3', duration: 260 },
      { id: 'aasb_09', num: '09', title: 'The Beast in His Boarding House', artist: "'O' Shibboleth", url: './assets-bg/wait-till-you-see-it.mp3', duration: 230 },
      { id: 'aasb_10', num: '10', title: 'Doctor Dee & the Angel Table', artist: "'O' Shibboleth", url: './assets-bg/thelema-mountain.mp3', duration: 275 },
      { id: 'aasb_11', num: '11', title: "Zos Kia (Austin Osman Spare's Alphabet of Desire)", artist: "'O' Shibboleth", url: './assets-bg/high-roller.mp3', duration: 210 },
      { id: 'aasb_12', num: '12', title: 'The Golden Dawn Is Mine (The Great Schism)', artist: "'O' Shibboleth", url: './assets-bg/babalon-working-blues.mp3', duration: 240 },
      { id: 'aasb_13', num: '13', title: "Sea Priestess (Dion Fortune's Inner Planes)", artist: "'O' Shibboleth", url: './assets-bg/the-eighth-sphere.mp3', duration: 298 },
      { id: 'aasb_14', num: '14', title: 'Chaos Magic (The Permission Slip)', artist: "'O' Shibboleth", url: './assets-bg/the-breach.mp3', duration: 220 },
      { id: 'aasb_15', num: '15', title: "The Eighth Sphere (Steiner's Moon-Demon Problem)", artist: "'O' Shibboleth", url: './assets-bg/the-eighth-sphere.mp3', duration: 319 },
      { id: 'aasb_16', num: '16', title: 'Blavatsky & the Mahatmas', artist: "'O' Shibboleth", url: './assets-bg/excavating-neverland.mp3', duration: 250 },
      { id: 'aasb_17', num: '17', title: 'Eliphas Lévi Invokes Apollonius', artist: "'O' Shibboleth", url: './assets-bg/thelema-mountain.mp3', duration: 235 },
      { id: 'aasb_18', num: '18', title: 'The Rosicrucian Manifestos', artist: "'O' Shibboleth", url: './assets-bg/wait-till-you-see-it.mp3', duration: 228 },
      { id: 'aasb_19', num: '19', title: 'The Aldebaran Transmission', artist: "'O' Shibboleth", url: './assets-bg/high-roller.mp3', duration: 240 },
      { id: 'aasb_20', num: '20', title: 'Carcosa (The Lake of Hali)', artist: "'O' Shibboleth", url: './assets-bg/the-breach.mp3', duration: 265 },
      { id: 'aasb_21', num: '21', title: 'The Yellow Sign (Transmission from the Hyades)', artist: "'O' Shibboleth", url: './assets-bg/babalon-working-blues.mp3', duration: 287 },
      { id: 'aasb_22', num: '22', title: "Niemand Bleibt Hier (Maria's Last Transmission)", artist: "'O' Shibboleth", url: './assets-bg/the-eighth-sphere.mp3', duration: 215 },
      { id: 'aasb_23', num: '23', title: "The Voynich Manuscript (Nobody's Read It)", artist: "'O' Shibboleth", url: './assets-bg/thelema-mountain.mp3', duration: 240 },
      { id: 'aasb_24', num: '24', title: "The Comte de Saint-Germain (The Man Who Wouldn't Die)", artist: "'O' Shibboleth", url: './assets-bg/excavating-neverland.mp3', duration: 255 },
      { id: 'aasb_25', num: '25', title: "Bruno's Fire (The Campo de' Fiori, 1600)", artist: "'O' Shibboleth", url: './assets-bg/the-breach.mp3', duration: 308 },
      { id: 'aasb_26', num: '26', title: "Nicolas Flamel's Empty Grave", artist: "'O' Shibboleth", url: './assets-bg/wait-till-you-see-it.mp3', duration: 345 },
      { id: 'aasb_27', num: '27', title: 'The Priory of Sion', artist: "'O' Shibboleth", url: './assets-bg/high-roller.mp3', duration: 284 },
      { id: 'aasb_28', num: '28', title: 'As Above, So Below (The Emerald Tablet Closer)', artist: "'O' Shibboleth", url: './assets-bg/excavating-neverland.mp3', duration: 317 },
      { id: 'aasb_29', num: '29', title: 'Welcome to the Parsonage', artist: "'O' Shibboleth", url: './assets-bg/babalon-working-blues.mp3', duration: 210 },
      { id: 'aasb_30', num: '30', title: 'The Breach (Chasing Shadows)', artist: "'O' Shibboleth", url: './assets-bg/the-breach.mp3', duration: 338 }
    ]
  },
  {
    id: 'ghost_to_ghost',
    dial: 'AM 640',
    freqNumber: 640,
    callSign: 'GHOST-AM',
    name: 'GHOST TO GHOST AM 640',
    shortName: 'GHOST TO GHOST',
    genre: 'Paranormal Dispatches & High Strangeness',
    host: 'Mojave Desert Outpost (Art Bell Open Lines)',
    vibe: 'Late-Night Eerie Synthesizers, EVP Static & Paranormal Invasions',
    slogan: 'From the Kingdom of Nye to the 4th Dimension · Open Lines',
    color: '#39ff14',
    glow: 'rgba(57, 255, 20, 0.65)',
    icon: '🛸',
    featuredAlbum: '4D Attack Radio! (The Paranormal Addendum)',
    tracks: [
      { id: 'g2g_01', title: 'Cut The Feed (Transmission Mashup)', artist: '4D Attack Radio', url: './assets-bg/high-roller.mp3', duration: 216 },
      { id: 'g2g_02', title: 'Astral Mafia', artist: '4D Attack Radio', url: './assets-bg/the-breach.mp3', duration: 228 },
      { id: 'g2g_03', title: 'Astral X-Men', artist: '4D Attack Radio', url: './assets-bg/the-eighth-sphere.mp3', duration: 211 },
      { id: 'g2g_04', title: 'Architects of the Cerebral', artist: '4D Attack Radio', url: './assets-bg/thelema-mountain.mp3', duration: 217 },
      { id: 'g2g_05', title: 'The Architect is Watching', artist: '4D Attack Radio', url: './assets-bg/wait-till-you-see-it.mp3', duration: 234 },
      { id: 'g2g_06', title: 'Cellar of the Astral', artist: '4D Attack Radio', url: './assets-bg/excavating-neverland.mp3', duration: 195 },
      { id: 'g2g_07', title: 'Cold Iron Ritual', artist: '4D Attack Radio', url: './assets-bg/babalon-working-blues.mp3', duration: 210 },
      { id: 'g2g_08', title: 'Peripheral Static', artist: '4D Attack Radio', url: './assets-bg/the-eighth-sphere.mp3', duration: 185 },
      { id: 'g2g_09', title: 'Clean Air, Cold Stone', artist: '4D Attack Radio', url: './assets-bg/the-breach.mp3', duration: 240 },
      { id: 'g2g_10', title: 'Vestibule of Death', artist: '4D Attack Radio', url: './assets-bg/thelema-mountain.mp3', duration: 293 },
      { id: 'g2g_11', title: 'Friction of the Feast', artist: '4D Attack Radio', url: './assets-bg/high-roller.mp3', duration: 314 },
      { id: 'g2g_12', title: 'Shatter the Feet', artist: '4D Attack Radio', url: './assets-bg/excavating-neverland.mp3', duration: 220 }
    ]
  },
  {
    id: 'edge_city',
    dial: '104.7 FM',
    freqNumber: 104.7,
    callSign: 'EDGE-CITY',
    name: 'EDGE CITY RADIO 104.7 FM',
    shortName: 'EDGE CITY',
    genre: 'Repo Man Punk, Garage & Neutron Overdrive',
    host: 'Otto & Edge City Productions',
    vibe: 'Intense 80s Garage Riffs, Fast Pacing & Glowing Malibu Chrome',
    slogan: 'The life of a repo man is always intense! Otto Approved.',
    color: '#00e5ff',
    glow: 'rgba(0, 229, 255, 0.65)',
    icon: '⚡',
    featuredAlbum: 'Repo Malibu Overdrive Cuts',
    tracks: [
      { id: 'ec_01', title: 'High Roller (Vegas Overclock)', artist: 'MonoAtomiX', url: './assets-bg/high-roller.mp3', duration: 210 },
      { id: 'ec_02', title: '1964 Malibu Acceleration Surge', artist: 'Edge City Sound', url: './assets-bg/the-breach.mp3', duration: 185 },
      { id: 'ec_03', title: 'Sands Casino Neon Explosion', artist: 'MonoAtomiX', url: './assets-bg/thelema-mountain.mp3', duration: 205 },
      { id: 'ec_04', title: 'Cathode Burn (Neutron Jam)', artist: 'Edge City Sound', url: './assets-bg/babalon-working-blues.mp3', duration: 220 },
      { id: 'ec_05', title: 'Don’t Look in the Trunk', artist: 'MonoAtomiX', url: './assets-bg/the-eighth-sphere.mp3', duration: 240 }
    ]
  },
  {
    id: 'underground',
    dial: '91.1 FM',
    freqNumber: 91.1,
    callSign: 'KZON',
    name: 'INTERZONE CASSETTE UNDERGROUND 91.1 FM',
    shortName: 'UNDERGROUND',
    genre: 'Dusty Hip-Hop, Indie Cuts & Community Tapes',
    host: 'The Strangelet Lounge DJ Crew',
    vibe: 'Lo-Fi Boom-Bap, 4-Track Cassettes & Friends Showcase',
    slogan: 'Independent beats, dust-covered 4-track gems & community drops',
    color: '#fbbf24',
    glow: 'rgba(251, 191, 36, 0.65)',
    icon: '📼',
    featuredAlbum: 'Strangelet Community Cassette Vol. 1',
    tracks: [
      { id: 'ug_01', title: 'Wait Till You SEE It (Dusk Mix)', artist: 'The Magic Static Society', url: './assets-bg/wait-till-you-see-it.mp3', duration: 356 },
      { id: 'ug_02', title: 'Excavating Neverland (Vinyl Cut)', artist: 'The Magic Static Society', url: './assets-bg/excavating-neverland.mp3', duration: 310 },
      { id: 'ug_03', title: 'Mojave Tape Dust (Instrumental)', artist: 'Strangelet Beats', url: './assets-bg/the-breach.mp3', duration: 198 },
      { id: 'ug_04', title: 'Synchro-Vox Breakbeat', artist: 'Interzone Crew', url: './assets-bg/thelema-mountain.mp3', duration: 215 },
      { id: 'ug_05', title: 'North Park After Dark', artist: 'Strangelet Beats', url: './assets-bg/the-eighth-sphere.mp3', duration: 225 }
    ]
  },
  {
    id: 'phase_4',
    dial: 'AM 880',
    freqNumber: 880,
    callSign: 'KP4R',
    name: 'PHASE 4 RADIO THEATER AM 880',
    shortName: 'PHASE 4 RADIO',
    genre: 'Old-Fashioned Radio Mystery & Voice Theater',
    host: 'Phase 4 Radio Players',
    vibe: 'Golden Age Radio Drama, Rainstorms, Footsteps & Midnight Suspense',
    slogan: 'Step back into the golden age of mystery, suspense & episodic drama',
    color: '#c084fc',
    glow: 'rgba(192, 132, 252, 0.65)',
    icon: '🎭',
    featuredAlbum: 'Face for Radio Theater Dispatches',
    tracks: [
      { id: 'p4_01', title: 'The Voice from the Attic Tube', artist: 'Phase 4 Players', url: './assets-bg/the-eighth-sphere.mp3', duration: 245 },
      { id: 'p4_02', title: 'Shadow Over Mojave Corridor', artist: 'Phase 4 Players', url: './assets-bg/wait-till-you-see-it.mp3', duration: 280 },
      { id: 'p4_03', title: 'The Midnight Call at 1003 South Orange', artist: 'Phase 4 Players', url: './assets-bg/the-breach.mp3', duration: 260 },
      { id: 'p4_04', title: 'The Enochian Calling Protocol', artist: 'Phase 4 Players', url: './assets-bg/thelema-mountain.mp3', duration: 230 }
    ]
  }
];
