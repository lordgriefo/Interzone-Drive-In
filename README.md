# 📽️ The Strangelet — Strangelet Kineto-Cut

An audio-reactive kinetic montage engine, multi-track visual sequencer, and vintage cinema synthesizer for live VJing, music video creation, and procedural film-chopping — in your browser or as a standalone desktop app.

[![Live Demo](https://img.shields.io/badge/LIVE-interzone--drive--in.vercel.app-FF6B00.svg)](https://interzone-drive-in.vercel.app/)
[![Buy Me a Coffee](https://img.shields.io/badge/Buy_Me_A_Coffee-magicstatic-FFDD00?style=flat&logo=buy-me-a-coffee&logoColor=black)](https://buymeacoffee.com/magicstatic/)
[![Built with React](https://img.shields.io/badge/React-18.2-blue.svg)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Bundler-Vite_5-646CFF.svg)](https://vitejs.dev/)
[![Electron](https://img.shields.io/badge/Desktop-Electron-47848F.svg)](https://www.electronjs.org/)

---

## What It Does

Load images, AI-generated video clips, or webcam stills into the **Media Bin**. Drop in a song. Strangelet Kineto-Cut analyses the audio in real time — bass, mids, treble, transients, BPM — and uses those signals to drive a constantly-shifting visual composition: cutting between images on the beat, applying era-specific colour grading, triggering Rube Goldberg chain-reaction glitch cascades, and rendering everything through one of **37 cinematic editing styles** ranging from Stan Brakhage emulsion scratches to psychedelic DMT hyperspace breakthroughs and beat-locked music video flash cuts.

You can let the **Auto DJ** randomly shift styles, eras, and effects in the flow of the music, or take full manual control with the **multi-track timeline editor** to sequence clips, trim, reverse, mirror, and crossfade your own edit.

---

## 🎪 The Interzone Traveling Sideshow & Creative Constellation

The **Interzone Drive-In** also features a 1930s Tod Browning-inspired carnival sideshow tent (accessible via `/#carnival` or the in-app `🎪 1930s SIDESHOW` banner button), serving as a gateway to our constellation of creative tools:

| Attraction | Sideshow Banner | Description | Link |
|------------|-----------------|-------------|------|
| 📽️ **Strangelet Kineto-Cut** | Banner 01 (Flagship) | Audio-reactive kinetic video sequencer & montage synthesizer with DaVinci/Premiere EDL export | [Live Web App](https://interzone-drive-in.vercel.app/) |
| 🎬 **Audio Arc** | Banner 02 | Visual storyboarding & dynamic screenplay engine designed specifically for music videos and short films | [audioarc.vercel.app](https://audioarc.vercel.app/) |
| 🎪 **Wunderbar!** | Banner 03 | Creative sandbox, procedural screenplay generator & music video concept dice-roller on Perchance | [perchance.org/the-wunderbar](https://perchance.org/the-wunderbar) |
| 🎬 **Strangelet Cine-Sampler** | Banner 04 | 110-shot cinematography library, Akai MPC-style video sampler & linear arrangement timeline | [perchance.org/strangelet-cine-sampler](https://perchance.org/strangelet-cine-sampler) |
| 🧪 **The Strangelet Lab** | Bunker 05 | High-energy sound design, sub-atomic quark synthesis & modular DAW laboratory | In Sideshow Lot |
| 🔞 **The Midnight Peep Cabinet** | Tent 06 | Vintage 8mm coin-op mutoscope displaying bizarre desert phantasmagoria & hypnotic celluloid loops | In Sideshow Lot |

---

## ✨ Features


### 🔊 Audio Engine & Spectral Reactivity
- **Meyda spectral analysis** — real-time RMS, spectral centroid, energy bands, and transient spike detection
- **Tone.js transport** — BPM-synced clock, A/B loop regions, scrub-anywhere waveform, algorithmic reverb with wet/dry control
- **Dynamic modulation** — audio amplitude and frequency bands drive visual parameters (scale, displacement, glitch intensity, cut timing)

### 🎬 37 Editing Styles
Every style responds differently to the music:

| Category | Styles |
|----------|--------|
| **Your Edit** | ★ Timeline Edit (plays your custom clip sequence) |
| **Psychonaut** | DMT Hyperspace (Sacred Geometry), LSD Acid Tracers (Prismatic Melt), Psilocybin Breathing (Living Walls), Ayahuasca Shamanic (Visionary Serpent) |
| **Avant-Garde** | Burroughs Cut-Up, Soviet Montage, Surrealist Edge Melt |
| **Experimental Film** | Brakhage Emulsion, Séance Dissolve, Liquid Gate Bloom |
| **Cinematic** | Ken Burns Rostrum, Fiona Voyeur, Narrative Pan |
| **Kinetic** | Apple Kinetic Beat Pop, Kineto-Stroboscopic Pulse |
| **Geometric** | Venetian Blind Slats, Jitter Frame Gate Bounce |
| **Mechanical** | Magnetic Tape Dropout, Vinyl Crackle |
| **Chill / Ambient** | Ambient Drift, Lo-Fi Flicker, Slow Dissolve, Dreamscape |
| **Directors** | Maya Deren, Kenneth Anger, Jonas Mekas, Chris Marker, Andy Warhol, Derek Jarman, Guy Debord, Jack Smith, Carolee Schneemann, David Lynch (Red Room + Eraserhead) |
| **Music Video** | MV Long Cut (5s), MV Slow Burn (10s), MV Flash Cut, MV Cinematic Glide, MV Hypnotic Drift |

### 🎞️ 12 Era Colour Grades
Each era applies a distinct film-era colour grade and aesthetic filter:

`1902 Méliès Twilight` · `1920 Cabinet of Caligari` · `1927 Metropolis Machine` · `1940 Film Noir` · `1950 Bandstand Hop` · `1960 Psychedelic Trip` · `1970 Drive-In Grindhouse` · `1980 Analog VHS` · `2020 Neon Glitch Grid` · `Lynchian Interzone` · `Roswell Transmission` · `Xenotrope Projection`

### ⚙️ 16 Rube Goldberg Chain Reactions
Procedural multi-stage chaos triggers that cascade through 8 stages (Idle → Pendulum → Domino → Jitter → Gravity → Prism → Z-Recoil → Reset). Chains range from intense (Dadaist Factory, Cathode Burn, Neon Pulse) to gentle MV-friendly options (Soft Pulse, Warm Drift, Dream Haze, Heartbeat).

### 🎲 Auto DJ
Automatically randomises editing style, era, and rube chain on music-reactive triggers — strong transients and bass hits drive the changes. Four modes:
- **Full Random** — shuffles everything
- **Mood Drift** — picks from coherent style groups (intense, cinematic, avant-garde, retro, dreamy, psychedelic) and gradually drifts between moods
- **Era Only** / **Style Only** — targeted randomisation
- Adjustable interval: 4s (hyper) to 60s (slow)

### ⚡ Smart MV Auto-Cutter (12 Specialized Profiles: Shortest → Longest)
One-click beat-synchronized music video generator located on the Multi-Track Timeline toolbar (`⚡ AUTO-MV CUT ▾` with high-contrast custom scrollbar, organized from fastest micro-cuts to full uncut video holds):

#### ⚡ Fast & Kinetic Micro-Cuts (< 1s)
- **💥 Glitch Frenzy (Breakcore)** — Ultra-fast 1/4 to 1 beat micro-cuts (~0.18–0.5s) with chaotic reverse and mirror flashes.
- **🎸 Punk & Speed Metal** — Relentless 1-beat downbeat thrash cuts (~0.5s) with maximum kinetic energy.
- **⚡ EDM Drop & Build** — 4-bar acceleration from 4-beat into 0.5-beat micro-cuts right before an explosive drop hold.

#### 🥁 Rhythmic & Beat-Synced Cuts (1s – 4s)
- **🥁 Beat-Locked (2–4 Beats)** — Rhythmic downbeat cuts locked to track BPM (~1.0–2.0s).
- **🌊 Energy Arc (Verse / Chorus)** — Dynamic pacing: atmospheric 6–8s intro/outro, steady verses, rapid-fire chorus cuts.
- **☕ Lo-Fi Chillhop (4–8 Beats)** — Relaxed, nostalgic pacing with smooth rhythmic transitions (~2.0–4.0s).

#### 🌀 Atmospheric & Psychedelic Holds (6s – 12s)
- **🎞️ Cinematic Hold (6–8s)** — Classic indie music video pacing tuned for short video generations.
- **🍄 Psychonaut Voyage (Entheogen)** — Shifting entheogen voyage cut alternating 7–12s breathing holds with rhythmic 2-beat phase shifts.
- **☁️ Dream Pop & Shoegaze** — Lush, elongated 8–16 beat floating holds (~8–12s).

#### 🤖 Long-Form AI Video & Full Clips (15s – Full Length)
- **⏳ Extended AI Video (15–30s)** — Ultra-long holds designed specifically for modern 10s–30s AI video outputs.
- **🎬 Epic Cinema Take (30–60s)** — Slow-cinema meditative long takes for ambient soundscapes, drone, or short films.
- **▶️ Full Clip Native (Play Entire Length)** — Places each clip at its **full natural length** (`asset.duration`) without premature cuts. Ideal for letting generative AI video clips (Runway Gen-3, Luma Dream Machine, Kling, Sora, Hailuo) play through completely.

### ✨ MilkDrop-Style Psychedelic, Sci-Fi & Entheogen Visual Tricks
Lightweight, GPU-accelerated visual effects that won't lag or crash your browser:
- **🌀 Liquid Oil-Warp** — Dynamic SVG `<feTurbulence>` / `<feDisplacementMap>` fluid rippling on bass drum transients with adjustable intensity
- **🔮 Kaleidoscope Mandala** — 4-Way Radial and 8-Way Crystal Prism mirrored symmetry rotating with treble frequencies
- **🌌 Fractal Variations** — Mandelbrot / Julia light spirals and infinite concentric fractal tunnels pulsating to the kick drum
- **🟢 Phosphor Ghost Trails** — Classic oscilloscope screen persistence trails with transient color flares
- **💥 Chromatic Bass Punch** — Explosive RGB split kick-burst with instant transient scale pops
- **👽 Alien Tractor Scan-Beam** — Bioluminescent emerald/cyan tractor beam with matrix scanlines that flares on transients
- **🚀 Sci-Fi Warp Drive Streaks** — Radial hyperspace star-streaks blasting outward from the screen center
- **⚡ Stylized Instant MV Vibes Dropdown** — Space-saving custom categorized popover with glowing color badges:
  - 🍄 **Psychonaut & Entheogen**: *DMT Hyperspace* (#f43f5e), *LSD Acid Tracers* (#a855f7), *Psilocybin Breathe* (#10b981), *Ayahuasca Shamanic* (#eab308)
  - 🌌 **Cosmic & Sci-Fi**: *Alien Signal* (#22c55e), *Sci-Fi Warp Drive* (#00e5ff), *Fractal Spiral* (#d946ef)
  - 🎬 **Cinema & Music Video**: *Cyber Club* (#06b6d4), *90s Grunge MTV* (#f59e0b), *Slow Burn MV* (#ec4899), *Lo-Fi Chill* (#a1a1aa)

### ⏱️ Multi-Track Timeline Editor
- **4-track sequencer** — video/image clips, audio waveform + lyrics, FX section markers, automation lane
- **⚡ 12-Profile Auto-MV Cut generator** — instant automatic music video cutting across the entire song length with categorized menu and custom scrollbar
- **▶ Full Dur Snap** — one-click inspector button to snap any selected clip to its full original video duration
- **💾 Save Cut & 📂 Load Cut Templates** — save your custom timeline arrangements, edit rhythms, and cut structures as reusable `.json` templates and load them into any new track or session
- **🎬 Professional EDL Export (CSV / EDL)** — export industry-standard Edit Decision Lists with source clip names, in/out points, track index, and SMPTE timecodes ready to import directly into **DaVinci Resolve**, **Adobe Premiere Pro**, and **Final Cut Pro**
- **Clip editing** — move, trim, split (blade tool), reverse, mirror, duplicate, copy/paste, ripple delete
- **Layout utilities** — Pack (close all gaps), Shuffle (random montage cuts), BIN→TL & TL→BIN synchronization
- **Undo/redo** with full history stack
- **Snap system** — snaps to clip edges, playhead, and beat grid (hold Shift to bypass)
- **Zoom** — mouse wheel + Ctrl, slider, or +/− buttons
- **Inline transport** — play/pause, stop, skip ±5s, jump to start/end, loop toggle — all without leaving the timeline
- **Horizontal scroll** — mouse wheel scrolls the timeline horizontally; Ctrl+wheel zooms
- **Drag-and-drop** — drag assets from the Media Bin directly onto the timeline

### 📦 Media Bin
- **Preview Navigation** — `◀ PREV` and `NEXT ▶` cycling, on-hover quick arrows (`‹` / `›`), and active asset display
- **Dedicated Ordering** — separate `⇦ ORDER` and `ORDER ⇨` controls for playlist order management
- **Drag-and-drop reordering** with visual drop indicators
- **Asset details** — inline rename, duplicate, and delete
- **Lightbox** — full-screen asset viewer with arrow-key navigation
- **Synchro-Vox puppet slot assignment** — tag mouth shapes for audio-driven lip-sync puppetry
- **Timeline integration** — one-click add to timeline, drag onto tracks

### 🎵 Playlist System
- **Multi-track playlist** with auto-advance between songs
- **FX preset capture** — save the current style/era/rube/chaos state per track, auto-restore on playback
- **JSON export/import** — save and restore playlists
- **ZIP export/import** — bundles playlist + all referenced images into a single archive

### 🎨 7 UI Themes
`Strangelet Purple/Orange` · `Interzone Black/Orange` · `MPC 60 Grey` · `Amber Industrial` · `Green CRT` · `Noir Rose` · `Deep Space Blue`

### 🎥 Video Export
- **In-browser WebM recording** — records viewport + mixed audio directly
- **Cinema Mode** — hides all panels for clean fullscreen viewport recording (shortcut: `C`)
- **Fullscreen** — viewport-only fullscreen (shortcut: `F`)
- **Electron desktop app** — proper MP4 encoding via ffmpeg-static for high-quality offline export

### 🖥️ Desktop App (Electron)
A standalone Windows desktop app wraps the web version with native capabilities:
- **MP4 export** via bundled ffmpeg — no browser codec limitations
- **Offline use** — no internet required after install
- Available as installer (`.exe`), portable, or `.zip`

### 🌙 WebM Alpha Overlays
Layer transparent video textures over the viewport — 16mm dust & scratches, celluloid silver grain, geometric scanline patterns. Load custom `.webm` files with alpha channels.

### 📝 LRC Lyric Sync & Beat-Reactive Animations
Import `.lrc` or `.json` lyric files with 5 real-time audio-reactive animation modes:
- **💥 Bass Slam Pop** — Downbeat scale pops with explosive double-neon halo flares
- **🌊 Karaoke Glow Wave** — Tempo-locked glowing gradient wave sweeping across the lyrics
- **⚡ Glitch Jitter & RGB Split** — Transient kick & snare horizontal chromatic split jitter
- **☁️ Floating Drift** — Ethereal sinusoidal levitation breathing with track RMS volume
- **Clean** — Crisp, steady typography without audio modulation
- Configurable fonts (Space Mono, Orbitron, VT323, Press Start 2P, etc.), sizes, and alignments.

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) 18+
- npm

### Install & Run

```bash
git clone https://github.com/YOUR-USERNAME/interzone-drive-in.git
cd interzone-drive-in
npm install
npm run dev
```

Open http://localhost:5173

### Run as Desktop App (Electron)

```bash
npm run electron:dev
```

### Build Desktop App

```bash
# Windows installer (.exe)
npm run package:exe

# Portable .zip (no install needed)
npm run package:zip
```

Output goes to `release/`.

> **Note:** Close any running instance of Strangelet Kineto-Cut before building, or the build may fail with "Access is denied" on locked DLLs.

---

## 📦 Production Web Build

```bash
npm run build
npm run preview   # preview locally
```

### Deploy to Vercel (recommended)
1. Push to GitHub
2. Import into [Vercel](https://vercel.com) — it auto-detects Vite
3. Deploy

Also works with Netlify (drag `dist/` to [Netlify Drop](https://app.netlify.com/drop)) or Cloudflare Pages.

> The app uses Web Audio and Screen Capture APIs — **must be served over HTTPS** in production.

---

## ⌨️ Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `Space` | Play / Pause |
| `T` | Collapse / expand timeline |
| `C` | Cinema mode (fullscreen, panels hidden) |
| `F` | Fullscreen viewport |
| `V` | Select / Move tool |
| `B` | Blade (split) tool |
| `S` | Split clip at playhead |
| `R` | Reverse selected clip |
| `M` | Mirror selected clip |
| `Delete` | Delete selected clip |
| `Shift+Delete` | Ripple delete |
| `Ctrl+Z` / `Ctrl+Y` | Undo / Redo |
| `Ctrl+C` / `Ctrl+V` | Copy / Paste clip |
| `Ctrl+D` | Duplicate clip |
| `[` / `]` | Move clip left / right in order |

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| UI Framework | [React 18](https://react.dev) |
| Bundler | [Vite 5](https://vitejs.dev/) |
| Audio Engine | [Tone.js](https://tonejs.github.io/) |
| Spectral Analysis | [Meyda](https://meyda.js.org/) |
| 3D / WebGL | [Three.js](https://threejs.org/) |
| Animation | [GSAP](https://greensock.com/gsap/) |
| Desktop Shell | [Electron](https://www.electronjs.org/) |
| Video Encoding | [ffmpeg-static](https://github.com/eugeneware/ffmpeg-static) |
| Archive Export | [JSZip](https://stuk.github.io/jszip/) |
| Icons | [Lucide React](https://lucide.dev/) |
| CSS | [Tailwind CSS](https://tailwindcss.com/) + CSS custom properties |

---

## ☕ Support the Project

If you find Strangelet Kineto-Cut helpful for your music videos, visual sets, or creative workflows, you can support development here:

[![Buy Me a Coffee](https://img.shields.io/badge/Buy_Me_A_Coffee-magicstatic-FFDD00?style=for-the-badge&logo=buy-me-a-coffee&logoColor=black)](https://buymeacoffee.com/magicstatic/)

---

## 📄 License

MIT — see [LICENSE](LICENSE) for details.
