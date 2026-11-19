// src/constants/radioStations.js
// Interzone Drive-In Multi-Channel Pirate Radio Network
import docEnochManifest from './docEnochManifest.json';
import occultManifest from './occultBroadcastManifest.json';

// Configurable Cloudflare R2 bucket base URL.
// Default points to live Interzone Drive-In R2 bucket.
export const DEFAULT_R2_URL = 'https://pub-cfb35735ad354d289b3f356684357a95.r2.dev';

export function getR2BaseUrl() {
  if (typeof window !== 'undefined') {
    const custom = window.localStorage.getItem('interzone_r2_url');
    if (custom) return custom.replace(/\/+$/, '');
  }
  return (import.meta.env.VITE_R2_RADIO_URL || DEFAULT_R2_URL).replace(/\/+$/, '');
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

// Local bundled audio files that are served directly by Vercel/Vite
const LOCAL_ASSET_PATHS = new Set([
  'assets-bg/archon.mp3',
  'assets-bg/babalon-jato.mp3',
  'assets-bg/babalon-working-blues.mp3',
  'assets-bg/eighth-sphere.mp3',
  'assets-bg/excavating-neverland.mp3',
  'assets-bg/high-roller.mp3',
  'assets-bg/plush.mp3',
  'assets-bg/radiator.mp3',
  'assets-bg/the-breach.mp3',
  'assets-bg/thelema-mountain.mp3',
  'assets-bg/wait-till-you-see-it.mp3',
  'assets-bg/excavating-neverland.lrc',
  'assets-bg/high-roller.lrc',
  'assets-bg/the-breach.lrc',
  'assets-bg/thelema-mountain.lrc',
  'assets-bg/babalon-working-blues.lrc',
  'assets-bg/eighth-sphere.lrc',
  'assets-bg/wait-till-you-see-it.lrc',
  'assets-bg/radiator.lrc',
]);

// Resolve any radio audio URL (properly handles local Vercel assets vs. Cloudflare R2 bucket streaming)
export function resolveRadioAudioUrl(item) {
  if (!item) return '';
  const r2 = getR2BaseUrl();
  const raw = typeof item === 'string' ? item : (item.url || item.mp3_file || item.wav_file || item.file || '');
  if (!raw) return '';
  if (raw.startsWith('http://') || raw.startsWith('https://') || raw.startsWith('blob:')) {
    return encodeURI(raw).replace(/'/g, '%27');
  }
  const clean = raw.replace(/^\.?\/+/, '');
  // If it's a locally bundled asset (or in trashorama), serve locally from the Vercel deployment
  if (LOCAL_ASSET_PATHS.has(clean) || clean.startsWith('assets-bg/trashorama/')) {
    return `./${clean}`;
  }
  // Otherwise resolve via Cloudflare R2 bucket with single quotes escaped to %27
  if (r2) {
    return encodeURI(`${r2}/${clean}`).replace(/'/g, '%27');
  }
  return `./${clean}`;
}

// ── SLICED AUTHENTIC 1960s VINTAGE ADS & CONCESSION SPOTS ──
export const VINTAGE_RADIO_ADS = [
  {
    id: 'ad_radioactive_01_snack_bar',
    title: 'Interzone Concession Stand - Atomic Popcorn & Malts',
    duration: 24,
    file: 'ad_radioactive_01_snack_bar.mp3',
    url: './assets-bg/ad_radioactive_01_snack_bar.mp3',
    tag: 'CONCESSION STAND',
    text: "Visit the intermission concession stand now! Piping hot buttered popcorn, atomic chili dogs, and radioactive mescaline malts!"
  },
  {
    id: 'ad_radioactive_02_hotrod_shock',
    title: 'Shock-O-Vision Hotrod Monster B-Movie Trailer',
    duration: 26,
    file: 'ad_radioactive_02_hotrod_shock.mp3',
    url: './assets-bg/ad_radioactive_02_hotrod_shock.mp3',
    tag: 'COMING ATTRACTION',
    text: "Coming this Friday to the giant outdoor screen: Hotrod Monsters in Shock-O-Vision! Unearthly thrills and astral jailbreaks!"
  },
  {
    id: 'ad_radioactive_03_car_speaker',
    title: 'Malibu Window Speaker Courtesy Reminder',
    duration: 22,
    file: 'ad_radioactive_03_car_speaker.mp3',
    url: './assets-bg/ad_radioactive_03_car_speaker.mp3',
    tag: 'DRIVE-IN PSA',
    text: "Drive-In courtesy reminder: Please dim your headlights, keep your window speaker hooked, and do not inspect the trunk of the 1964 Malibu."
  },
  {
    id: 'ad_radioactive_04_midnight_creeps',
    title: 'Midnight Creature Double Feature Trailer',
    duration: 28,
    file: 'ad_radioactive_04_midnight_creeps.mp3',
    url: './assets-bg/ad_radioactive_04_midnight_creeps.mp3',
    tag: 'SOMETHING WEIRD',
    text: "Midnight madness returns to the desert! Two terrifying features back-to-back under the Mojave stars in glorious Technicolor!"
  },
  {
    id: 'ad_radioactive_05_space_patrol',
    title: 'Area 51 Radar Warning & Flying Saucer Spot',
    duration: 25,
    file: 'ad_radioactive_05_space_patrol.mp3',
    url: './assets-bg/ad_radioactive_05_space_patrol.mp3',
    tag: 'PARANORMAL ALERT',
    text: "Special desert dispatch: Unidentified craft reported hovering over the perimeter fence. Keep your car radio tuned to 99.3 FM."
  },
  {
    id: 'ad_radioactive_06_diner_special',
    title: 'Interzone All-Night Diner & Centipede Chili Dog',
    duration: 26,
    file: 'ad_radioactive_06_diner_special.mp3',
    url: './assets-bg/ad_radioactive_06_diner_special.mp3',
    tag: 'CONCESSION STAND',
    text: "Open 24 hours behind Screen 3! Cold iced tea, hot apple pie, and the legendary Interzone midnight plate."
  },
  {
    id: 'ad_radioactive_07_thelemite_50ft',
    title: 'Attack of the 50-Foot Thelemite Coming Attraction',
    duration: 28,
    file: 'ad_radioactive_07_thelemite_50ft.mp3',
    url: './assets-bg/ad_radioactive_07_thelemite_50ft.mp3',
    tag: 'COMING ATTRACTION',
    text: "Terrorizing the Vegas Strip! Towering over casinos, invoking forces beyond human control! Rated Triple-X Shock!"
  },
  {
    id: 'ad_radioactive_08_last_chance_gas',
    title: 'Last Chance Mojave Gas & Roentgen Oil',
    duration: 25,
    file: 'ad_radioactive_08_last_chance_gas.mp3',
    url: './assets-bg/ad_radioactive_08_last_chance_gas.mp3',
    tag: 'DESERT SPONSOR',
    text: "Last gas for 90 miles across the salt flats! Premium leaded, cold sodas, and motor oil for your interstellar crossing."
  },
  // ── TRASH-O-RAMA & SOMETHING WEIRD RADIO COME-ONS (GOOGLE DRIVE VAULT) ──
  {
    id: 'trash_01_chrome_hot_leather',
    title: 'Chrome and Hot Leather (Rated GP)',
    duration: 51,
    file: 'trash_01_chrome_hot_leather.mp3',
    url: './assets-bg/trashorama/trash_01_chrome_hot_leather.mp3',
    tag: 'TRASH-O-RAMA',
    text: "Green Beret vs. Cycle Pack! Four special forces commandos track down a roving desert gang on two wheels!"
  },
  {
    id: 'trash_02_hells_angels_69',
    title: "Hell's Angels '69 (Rated M)",
    duration: 67,
    file: 'trash_02_hells_angels_69.mp3',
    url: './assets-bg/trashorama/trash_02_hells_angels_69.mp3',
    tag: 'TRASH-O-RAMA',
    text: "Two rich boys join the Angels to rob Caesar's Palace in Las Vegas! Starring Sonny Barger and the real Oakland Angels!"
  },
  {
    id: 'trash_03_evel_knievel',
    title: 'Evel Knievel: Live-Action Daredevil (Rated GP)',
    duration: 58,
    file: 'trash_03_evel_knievel.mp3',
    url: './assets-bg/trashorama/trash_03_evel_knievel.mp3',
    tag: 'TRASH-O-RAMA',
    text: "The living legend defying death across 19 cars! Red, white and blue chrome tearing up the outdoor screen!"
  },
  {
    id: 'trash_04_destroy_all_monsters',
    title: 'Destroy All Monsters: Toho Kaiju War (Rated G)',
    duration: 61,
    file: 'trash_04_destroy_all_monsters.mp3',
    url: './assets-bg/trashorama/trash_04_destroy_all_monsters.mp3',
    tag: 'KAIJU SHOCK',
    text: "Godzilla, Rodan, Mothra, Ghidorah! Eleven giant monsters clash at Mount Fuji in all-out Technicolor annihilation!"
  },
  {
    id: 'trash_05_tentacles',
    title: 'Tentacles: Giant Sea Terror (Rated PG)',
    duration: 56,
    file: 'trash_05_tentacles.mp3',
    url: './assets-bg/trashorama/trash_05_tentacles.mp3',
    tag: 'B-MOVIE CREATURE',
    text: "From the fathomless ocean trench! Starring John Huston, Shelley Winters, and Bo Hopkins versus the giant mutant octopus!"
  },
  {
    id: 'trash_06_empire_of_the_ants',
    title: "H.G. Wells' Empire of the Ants (Rated PG)",
    duration: 59,
    file: 'trash_06_empire_of_the_ants.mp3',
    url: './assets-bg/trashorama/trash_06_empire_of_the_ants.mp3',
    tag: 'CREATURE FEATURE',
    text: "Joan Collins trapped on an island with radioactive giant ants! An American International shock classic!"
  },
  {
    id: 'trash_07_futureworld',
    title: 'Futureworld: Robot Conspiracy (Rated PG)',
    duration: 33,
    file: 'trash_07_futureworld.mp3',
    url: './assets-bg/trashorama/trash_07_futureworld.mp3',
    tag: 'SCI-FI PULP',
    text: "Beyond Westworld! What happens when the guests never leave and the android duplicates run the world?"
  },
  {
    id: 'trash_08_squirm',
    title: 'Squirm: The Day the Earth Trembled (Rated R)',
    duration: 60,
    file: 'trash_08_squirm.mp3',
    url: './assets-bg/trashorama/trash_08_squirm.mp3',
    tag: 'GRINDHOUSE SHOCK',
    text: "Severed power cables send millions of carnivorous worms burrowing out of the swamp! You will squirm!"
  },
  {
    id: 'trash_09_blood_drinkers',
    title: 'The Blood Drinkers + The Black Cat (Double Bill)',
    duration: 64,
    file: 'trash_09_blood_drinkers.mp3',
    url: './assets-bg/trashorama/trash_09_blood_drinkers.mp3',
    tag: 'SOMETHING WEIRD',
    text: "Filmed in blood-curdling Color Glow! Two vampire twin nightmares for the price of one single car admission!"
  },
  {
    id: 'trash_10_beyond_valley_of_dolls',
    title: 'Beyond the Valley of the Dolls + Myra Breckenridge',
    duration: 60,
    file: 'trash_10_beyond_valley_of_dolls.mp3',
    url: './assets-bg/trashorama/trash_10_beyond_valley_of_dolls.mp3',
    tag: 'CULT EXPLOITATION',
    text: "Russ Meyer's rock and roll psychedelic kaleidoscope! The Carrie Nations live at the midnight rock bash!"
  },
  {
    id: 'trash_11_the_naked_witch',
    title: 'The Naked Witch: Buried 300 Years (Shock Thrill)',
    duration: 25,
    file: 'trash_11_the_naked_witch.mp3',
    url: './assets-bg/trashorama/trash_11_the_naked_witch.mp3',
    tag: 'SOMETHING WEIRD',
    text: "Buried alive with a stake in her heart! Now she walks the Texas swamps for unholy revenge!"
  },
  {
    id: 'trash_12_peter_fonda_festival',
    title: 'Peter Fonda Triple Feature: The Wild Angels + The Trip',
    duration: 64,
    file: 'trash_12_peter_fonda_festival.mp3',
    url: './assets-bg/trashorama/trash_12_peter_fonda_festival.mp3',
    tag: 'ACID HOTROD',
    text: "Three masterworks of high-octane 1960s counterculture back-to-back under the stars! Bring your friends!"
  }
];

export const SAMPLE_VINTAGE_ADS = VINTAGE_RADIO_ADS;

// ── FULL 91 DOC ENOCH DROPS MANIFEST ──
export const DOC_ENOCH_MANIFEST = docEnochManifest.map((item) => ({
  ...item,
  url: item.mp3_file ? `./assets-bg/enoch/${item.mp3_file}` : `./assets-bg/enoch/${item.wav_file}`
}));

export const DOC_ENOCH_SAMPLES = DOC_ENOCH_MANIFEST.slice(0, 10);

// ── 5 INTERZONE PIRATE RADIO STATIONS ──
export const INTERZONE_RADIO_STATIONS = [
  {
    id: 'w_occult',
    dial: '99.3 FM',
    freqNumber: 99.3,
    callSign: 'W-OCCULT',
    name: 'W-OCCULT 99.3 FM',
    shortName: 'W-OCCULT FM',
    genre: 'Occult Rock, Crowleyana & High Mojave Magick',
    host: 'Doc Enoch (Desert Transmitter Outpost)',
    vibe: 'Terence McKenna / Hunter S. Thompson Gonzo Mystic (Magick with a K)',
    slogan: 'As Above, So Below · Tape Hiss, Vacuum Tubes & Desert Transmissions',
    color: '#ff6b00',
    glow: 'rgba(255, 107, 0, 0.7)',
    icon: '🔮',
    featuredAlbum: 'As Above, So Below: An Occult Songbook (30 Master Tracks + Vault Marathon)',
    djVoice: 'Doc Enoch',
    enochDrops: DOC_ENOCH_MANIFEST,
    albumTracks: occultManifest.masterAlbum,
    extraTracks: occultManifest.extraTracks,
    tracks: occultManifest.broadcastRotation,
  },
  {
    id: 'w_beat',
    dial: '91.1 FM',
    freqNumber: 91.1,
    callSign: 'W-BEAT',
    name: 'W-BEAT 91.1 FM (RAP & ELECTRONIC)',
    shortName: 'W-BEAT FM',
    genre: 'Mojave Rap, MPC Boom-Bap, Cyber-Trap & Analog Electronics',
    host: 'The MPC Alchemist & Strangelet Sound System',
    vibe: 'Heavy 808 Sub-Bass, Saturated MPC Chops, Cyber-Glitch & Modular Electronics',
    slogan: 'Excavating Neverland · Desert Hip-Hop, Electronic Breaks & Sub-Bass Overdrive',
    color: '#fbbf24',
    glow: 'rgba(251, 191, 36, 0.7)',
    icon: '🎛️',
    featuredAlbum: 'Excavating Neverland & The Strangelet MPC Vault',
    tracks: [
      { id: 'rap_01', title: 'Excavating Neverland', artist: 'The Magic Static Society', url: './assets-bg/excavating-neverland.mp3', lrcUrl: './assets-bg/excavating-neverland.lrc', duration: 195, genre: 'Mojave Rap' },
      { id: 'rap_02', title: 'High Roller (MonoAtomic Gold Rap Chop)', artist: 'The Magic Static Society', url: './assets-bg/high-roller.mp3', lrcUrl: './assets-bg/high-roller.lrc', duration: 216, genre: 'MPC Boom-Bap' },
      { id: 'rap_03', title: 'Archon (Electronic Breakbeat & Synthesizer Glitch)', artist: 'Strangelet Electronic', url: './assets-bg/archon.mp3', duration: 219, genre: 'Electronic Breaks' },
      { id: 'rap_04', title: 'Plush (Mojave Trap Sub-Bass)', artist: 'Strangelet Sound System', url: './assets-bg/plush.mp3', duration: 246, genre: 'Cyber-Trap' },
      { id: 'rap_05', title: 'Cut The Feed (Transmission MPC Mashup)', artist: '4D Attack Radio', url: './assets-bg/high-roller.mp3', duration: 216, genre: 'Hip-Hop Mashup' },
      { id: 'rap_06', title: 'Wait Till You See It (Electronic Bass Overdrive)', artist: 'The Magic Static Society', url: './assets-bg/wait-till-you-see-it.mp3', lrcUrl: './assets-bg/wait-till-you-see-it.lrc', duration: 234, genre: 'Electronic / Bass' },
      { id: 'rap_07', title: 'Radiator Hums (Analog Drone & Modular Synth)', artist: 'Strangelet Electronic', url: './assets-bg/radiator.mp3', duration: 320, genre: 'Modular Synth' },
      { id: 'rap_08', title: 'The Breach (Cyber-Breaks Remix)', artist: "'O' Shibboleth", url: './assets-bg/the-breach.mp3', lrcUrl: './assets-bg/the-breach.lrc', duration: 337, genre: 'Electronic Breaks' },
      { id: 'rap_09', title: 'Babalon JATO (Early Electronic Dub)', artist: "'O' Shibboleth", url: './assets-bg/babalon-jato.mp3', duration: 219, genre: 'Electronic Dub' }
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
      { id: 'g2g_03', title: 'Astral X-Men', artist: '4D Attack Radio', url: './assets-bg/eighth-sphere.mp3', duration: 211 },
      { id: 'g2g_04', title: 'Architects of the Cerebral', artist: '4D Attack Radio', url: './assets-bg/thelema-mountain.mp3', duration: 217 },
      { id: 'g2g_05', title: 'The Architect is Watching', artist: '4D Attack Radio', url: './assets-bg/wait-till-you-see-it.mp3', duration: 234 },
      { id: 'g2g_06', title: 'Cold Iron Ritual', artist: '4D Attack Radio', url: './assets-bg/babalon-working-blues.mp3', duration: 210 },
      { id: 'g2g_07', title: 'Peripheral Static', artist: '4D Attack Radio', url: './assets-bg/radiator.mp3', duration: 185 },
      { id: 'g2g_08', title: 'Clean Air, Cold Stone', artist: '4D Attack Radio', url: './assets-bg/the-breach.mp3', duration: 240 },
      { id: 'g2g_09', title: 'Vestibule of Death', artist: '4D Attack Radio', url: './assets-bg/thelema-mountain.mp3', duration: 293 },
      { id: 'g2g_10', title: 'Friction of the Feast', artist: '4D Attack Radio', url: './assets-bg/high-roller.mp3', duration: 314 }
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
    featuredAlbum: 'Repo Man / Edge City Vault',
    tracks: [
      { id: 'ec_01', title: 'Neutron Glider (Repo Overdrive)', artist: 'Edge City Outlaws', url: './assets-bg/the-breach.mp3', duration: 198 },
      { id: 'ec_02', title: 'Ordinary Fucking People', artist: 'Edge City Outlaws', url: './assets-bg/babalon-working-blues.mp3', duration: 215 },
      { id: 'ec_03', title: "Otto's Malibu Ignition", artist: 'Edge City Outlaws', url: './assets-bg/thelema-mountain.mp3', duration: 184 },
      { id: 'ec_04', title: 'Flying Chevy in the Sunset', artist: 'Edge City Outlaws', url: './assets-bg/high-roller.mp3', duration: 232 },
      { id: 'ec_05', title: 'Babalon JATO Drag Race', artist: 'Edge City Outlaws', url: './assets-bg/babalon-jato.mp3', duration: 219 }
    ]
  },
  {
    id: 'phase4_theater',
    dial: 'AM 880',
    freqNumber: 880,
    callSign: 'PHASE-4',
    name: 'PHASE 4 RADIO THEATER AM 880',
    shortName: 'PHASE 4 RADIO',
    genre: 'Vintage Mystery Plays & Audio Dramas',
    host: 'The Master of Ceremonies',
    vibe: 'Old-Time Radio Foley, Organ Chords & Suspense Dramas',
    slogan: 'A Theater of the Mind · Vintage & Modern Mystery Plays',
    color: '#ff0055',
    glow: 'rgba(255, 0, 85, 0.65)',
    icon: '🎭',
    featuredAlbum: 'Phase 4 Mystery Plays Series',
    tracks: [
      { id: 'p4_01', title: 'The Parsonage Incident (Act 1)', artist: 'Phase 4 Players', url: './assets-bg/babalon-working-blues.mp3', duration: 320 },
      { id: 'p4_02', title: 'The Obsidian Mirror Transmission', artist: 'Phase 4 Players', url: './assets-bg/eighth-sphere.mp3', duration: 285 },
      { id: 'p4_03', title: 'The Shadow in the Desert Screen', artist: 'Phase 4 Players', url: './assets-bg/thelema-mountain.mp3', duration: 298 }
    ]
  }
];
