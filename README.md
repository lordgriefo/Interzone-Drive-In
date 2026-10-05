# 📽️ Interzone Drive-In — The Kinet-O-Chop

An audio-reactive kinetic montage engine, multi-track visual sequencer, and vintage cinema synthesizer for live VJing, music video creation, and procedural film-chopping — in your browser or as a standalone desktop app.

[![Live Demo](https://img.shields.io/badge/LIVE-interzone--drive--in.vercel.app-FF6B00.svg)](https://interzone-drive-in.vercel.app/)
[![Built with React](https://img.shields.io/badge/React-18.2-blue.svg)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Bundler-Vite_5-646CFF.svg)](https://vitejs.dev/)
[![Electron](https://img.shields.io/badge/Desktop-Electron-47848F.svg)](https://www.electronjs.org/)

---

## What It Does

Load images, AI-generated video clips, or webcam stills into the **Media Bin**. Drop in a song. The Kinet-O-Chop analyses the audio in real time — bass, mids, treble, transients, BPM — and uses those signals to drive a constantly-shifting visual composition: cutting between images on the beat, applying era-specific colour grading, triggering Rube Goldberg chain-reaction glitch cascades, and rendering everything through one of **33 cinematic editing styles** ranging from Stan Brakhage emulsion scratches to beat-locked music video flash cuts.

You can let the **Auto DJ** randomly shift styles, eras, and effects in the flow of the music, or take full manual control with the **multi-track timeline editor** to sequence clips, trim, reverse, mirror, and crossfade your own edit.

---

## ✨ Features

### 🔊 Audio Engine & Spectral Reactivity
- **Meyda spectral analysis** — real-time RMS, spectral centroid, energy bands, and transient spike detection
- **Tone.js transport** — BPM-synced clock, A/B loop regions, scrub-anywhere waveform, algorithmic reverb with wet/dry control
- **Dynamic modulation** — audio amplitude and frequency bands drive visual parameters (scale, displacement, glitch intensity, cut timing)

### 🎬 33 Editing Styles
Every style responds differently to the music:

| Category | Styles |
|----------|--------|
| **Your Edit** | ★ Timeline Edit (plays your custom clip sequence) |
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
- **Mood Drift** — picks from coherent style groups (intense, cinematic, avant-garde, retro, dreamy) and gradually drifts between moods
- **Era Only** / **Style Only** — targeted randomisation
- Adjustable interval: 4s (hyper) to 60s (slow)

### ⏱️ Multi-Track Timeline Editor
- **4-track sequencer** — video/image clips, audio waveform + lyrics, FX section markers, automation lane
- **Clip editing** — move, trim, split (blade tool), reverse, mirror, duplicate, copy/paste, ripple delete
- **Undo/redo** with full history stack
- **Snap system** — snaps to clip edges, playhead, and beat grid (hold Shift to bypass)
- **Zoom** — mouse wheel + Ctrl, slider, or +/− buttons
- **Inline transport** — play/pause, stop, skip ±5s, jump to start/end, loop toggle — all without leaving the timeline
- **Horizontal scroll** — mouse wheel scrolls the timeline horizontally; Ctrl+wheel zooms
- **Drag-and-drop** — drag assets from the Media Bin directly onto the timeline

### 📦 Media Bin
- **Drag-and-drop reordering** with visual drop indicators
- **Asset preview panel** — large preview with inline rename, reorder, duplicate, and delete
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

### 📝 LRC Lyric Sync
Import `.lrc` or `.json` lyric files — lyrics display synchronised to the music with configurable font, size, and alignment.

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

> **Note:** Close any running instance of Kinet-O-Chop before building, or the build may fail with "Access is denied" on locked DLLs.

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

## 📄 License

MIT — see [LICENSE](LICENSE) for details.
