# Strangelet KinetiCUT — Welcome to Strangelet, CT

> *Like Connecticut, but it chops film on the beat.*
> *Welcome to Strangelet, CT — population: your music videos.*

## Overview
- **Perchance App URL:** [https://perchance.org/strangelet-keneticut](https://perchance.org/strangelet-keneticut) (or [https://perchance.org/keneticut](https://perchance.org/keneticut))
- **Concept:** An audio-reactive kinetic montage engine + multi-track visual sequencer. Think: VJ rig + music-video auto-cutter + vintage cinema filter box in one browser page.
- **Default Experience:** Land on the **KinetiCUT** editor by default (Timeline & Media Bin); the **AI Flipbook Studio** is the dedicated second tab.

---

## 60-Second Walkthrough

### 1. Transport Bar (Top / Bottom)
- Play / Pause / Stop controls with millisecond timecode (`00:00.00`) and total track duration.
- Real-time BPM display with interactive tap-tempo.
- A/B loop region markers for rehearsing loops and cut points.
- Reverb preset selector with wet/dry mix slider.
- Audio unlock and direct Export modal button.
- **Hotkeys:** `Space` = Play/Pause, `T` = Toggle timeline collapse, `C` = Cinema Mode (hides all UI for clean screen capture), `F` = Fullscreen viewport.

### 2. Media Bin (Left)
- **Format Support:** Drop in PNG, JPG, GIF, WebP, AVIF, SVG, MP4, WebM, MOV, MKV, webcam captures, or assets pushed live from the AI Flipbook Studio.
- **Asset Management:** Prev/Next cycling, hover scrub arrows, drag-to-reorder, rename, duplicate, delete, and fullscreen lightbox view with arrow keys.
- **Timeline Integration:** Drag clips and stills directly onto timeline tracks.
- **Synchro-Vox Puppetry:** Tag mouth shape anchor slots so audio signals automatically drive synchronized puppet lip movement.

### 3. Main Viewport (Center)
- **Audio-Reactive Engine:** Meyda audio DSP analyzes bass, mids, treble, RMS energy, and transients in real time.
- **Clock Synchronization:** Tone.js synchronizes the master BPM clock.
- **Dynamic Modulation:** Real-time audio frequencies modulate scale bounce, displacement, glitch intensity, cut timing, kaleidoscope rotation, liquid oil-warps, tractor-beams, warp streaks, and ghost trails.

### 4. FX Console (Right)
- **37 Editing Styles:**
  - *Timeline Edit:* Your custom cut-up arrangement.
  - *Psychonaut:* DMT Hyperspace, LSD Tracers, Psilocybin Breathe, Ayahuasca.
  - *Avant-Garde:* Burroughs Cut-Up, Soviet Montage.
  - *Experimental:* Brakhage Emulsion, Séance Dissolve.
  - *Cinematic:* Ken Burns, Fiona Voyeur.
  - *Kinetic:* Apple Beat Pop, Stroboscopic Pulse.
  - *Mechanical:* Tape Dropout, Vinyl Crackle.
  - *Chill & Ambient:* Ambient Drift, Lo-Fi Chillhop.
  - *10x Auteur Directors:* Maya Deren, Kenneth Anger, Jonas Mekas, Chris Marker, Andy Warhol, Derek Jarman, David Lynch (Red Room & Eraserhead).
  - *Music Video Modes:* Long Cut (5s), Slow Burn (10s), Flash Cut, Glide, Hypnotic Drift.
- **12 Era Grades:**
  - 1902 Méliès, 1920 Caligari, 1927 Metropolis, 1940 Noir, 1950 Bandstand, 1960 Psych, 1970 Grindhouse, 1980 VHS, 2020 Neon Glitch, Lynchian Interzone, Roswell, Xenotrope.
- **16 Rube Goldberg Chains:**
  - 8-stage cascade: *Idle > Pendulum > Domino > Jitter > Gravity > Prism > Z-Recoil > Reset*.
  - From high-chaos *Dada Factory* and *Cathode Burn* to *Soft Pulse*, *Dream Haze*, and *Heartbeat*.
- **Auto DJ Modes:**
  - Full Random, Mood Drift (Intense, Cinematic, Avant, Retro, Dreamy, Psych), Era Only, Style Only.
  - Interval timer (4s–60s) or triggered directly by audio transients and kick hits.
- **MilkDrop Visual FX:**
  - Liquid oil-warp, 4-way and 8-way kaleidoscope, fractal tunnels, phosphor cathode trails, chromatic bass punch, alien scan-beams, warp drive.
- **LRC Synchronized Lyrics:**
  - Import `.lrc` or `.json` lyric files with 5 visual presentation modes: *Bass Slam Pop*, *Karaoke Glow Wave*, *Glitch Jitter RGB Split*, *Floating Drift*, and *Clean*.
- **7 Workspace Themes:**
  - Strangelet Purple/Orange, Interzone Black/Orange, MPC60 Grey, Amber Industrial, Green CRT, Noir Rose, Deep Space Blue.

### 5. Multi-Track Timeline (Bottom — 4 Tracks)
- **Track Layout:**
  1. Video / Image layers
  2. Audio waveform + lyric markers
  3. FX animation markers
  4. Automation envelope lane
- **Editing Tools & Shortcuts:**
  - Select / Move / Trim (`V`), Blade cut tool (`B`), Split at playhead (`S`), Reverse clip (`R`), Mirror (`M`).
  - Delete / Ripple Delete (`Shift+Delete`).
  - Duplicate, Copy, Paste (`Ctrl+D`, `Ctrl+C`, `Ctrl+V`).
  - Pack gaps, Shuffle montage, Two-way BIN ↔ Timeline sync.
  - Edge snapping to clip borders, playhead, and musical beats (`Shift` bypasses snap).
  - Mouse wheel = Horizontal scroll; `Ctrl + Wheel` = Zoom timeline; Undo / Redo (`Ctrl+Z` / `Ctrl+Y`).
  - Inline transport controls for seamless timeline editing.
- **Killer Feature: AUTO-MV CUT (12 One-Click Profiles):**
  - *Glitch Frenzy* (Ultra-fast strobe)
  - *Punk / Metal* (Aggressive cut-up)
  - *EDM Drop Build* (Accelerating tension cuts)
  - *Beat-Locked* (2–4 beats per cut)
  - *Energy Arc* (Verse / Chorus dynamics)
  - *Lo-Fi Chillhop* (Relaxed pacing)
  - *Cinematic Hold* (6–8s sustained shots)
  - *Psychonaut Voyage* (7–12s fluid drifts)
  - *Dream Pop* (8–12s ethereal cross-fades)
  - *Extended AI* (15–30s generative shots)
  - *Epic Cinema* (30–60s sweeping takes)
  - *Full Clip Native* (Plays full Runway, Luma, Kling, or Sora generation lengths)
- **Export Formats:** Save / Load Cut Templates (`.json`), EDL CSV export, and standard SMPTE timecode EDL for DaVinci Resolve, Adobe Premiere, and Final Cut Pro.

### 6. Playlist & Master Export
- Multi-track playlist with auto-advance and per-track style/era/chain persistence.
- Project JSON and full ZIP export (including bundled image and video assets).
- High-fidelity in-browser WebM recording of viewport + mixed audio.
- Desktop Electron build with native FFmpeg for lossless MP4 export and offline use.

---

## How the AI Flipbook Studio Fits In

Access via **`BACK TO AI FLIPBOOK STUDIO`** in the top navigation bar.

### Core Architecture
- It is a music-synced AI video generator and companion feeder to the KinetiCUT Timeline and Media Bin.
- **Workflow:**
  1. Pick a visual theme from the 20 built-in presets or type a custom prompt.
  2. Define audio placement: **Cue In** (e.g. `00:00`) and **Duration** (e.g. `15s`).
  3. Click **Choreograph Reel** to generate 6, 12, 16, or 24 AI frames live.
  4. Preview in the **Living Theater** (1280x720 canvas with frame-stepping, scrubbing, and 6/12/24/30 FPS playback).
  5. Click **PUSH TO KINETICUT** to stream the reel directly into KinetiCUT's Media Bin with its `cueStart` and `cueEnd` timestamps locked to that exact window of the song.

### 2 Output Modes
1. **🎥 WebM Video Loop (Default):** Compiles frames in-browser via `captureStream` + `MediaRecorder` into a 4-second looping video with 4 motion styles:
   - Rapid Cinema 12fps cut
   - Ken Burns Drift & Zoom
   - Strobe / Pulse
   - Hyper Speed 24fps
2. **🎞️ Flipbook Stills:** Rapid flipbook animation on canvas; sends each individual frame as an asset.

### 20 Built-in Cinematic Presets
1. Nevada '55: Atomic Rearview Escape
2. Vegas Corridor '59 (Burma-Shave Highway)
3. The 8th Sphere: Enochian Horizon
4. Kenneth Anger: Scorpio Rites
5. W-OCCULT AM 660 Broadcast Intrusion
6. Eraserhead: Industrial Radiator Shimmer
7. The Black Lodge: Chevron Horizon
8. 1956 Drive-In Atomic Invasion
9. Maya Deren: Meshes of the Afternoon
10. Interzone Burroughs Cut-Up
11. Sacred Geometry Hyperspace
12. Neon Boneyard: Mojave Sign Graveyard
13. The Starlight Motel: Room 13
14. Route 375: Black Sedan Pursuit
15. Wardenclyffe Desert: The Tesla Spire
16. Stan Brakhage: Mothlight Emulsion
17. Chris Marker: La Jetée Jetty
18. The Fox Sisters: 1920s Spirit Cabinet
19. Project Blue Book: Redacted Microfilm
20. Psilocybin Breath: The Living Tapestry

*Bonus:* **⚡ Cut-Up Button** flashes subliminal Burroughs phrases (*"THE WORD IS A VIRUS"*, *"RADIO W-OCCULT AM 660"*) over the video in sync with the audio track.

### Real-Time Song Sync & Inter-Window Protocol
- Top bar displays live song timecode (`00:00.0 / 03:34.4`) with a pulsing BPM indicator.
- Active Song Cues Board tracks every generated reel as an interactive card; highlights green during playback when the playhead enters that cue.
- Communicates via `postMessage`: `ADD_ASSET`, `SET_STYLE`, `SEEK_TO`, `SET_SUBLIMINAL`, `TRIGGER_CHOP`, `TOGGLE_PLAY`, `SWITCH_TAB`.

---

## First Run Quick-Start Guide (30 Seconds to a Video)

1. **Load a Song:** Open Playlist panel, add an MP3/WAV, hit play. BPM and transient detection lock in.
2. **Populate Media Bin:** Drag in 5–10 images/clips, or click *BACK TO AI FLIPBOOK STUDIO*, choose *Nevada '55*, set Cue In `00:05` / Dur `10s`, 12 frames, Rapid Cinema, click *Choreograph Reel* → *PUSH TO KINETICUT*.
3. **Auto-Cut the Timeline:** Back in KinetiCUT timeline toolbar, click *AUTO-MV CUT* → select *Beat-Locked (2–4 Beats)* for instant cut-up choreography.
4. **Dial in Real-Time Aesthetics:** In FX Console, set Style to *MV Flash Cut*, Era to *1980 Analog VHS* or *Lynchian Interzone*, Chain to *Heartbeat*. Visuals now pulse and cut to bass hits.
5. **Add Lyrics:** Import `.lrc` and select *Bass Slam Pop* + *Karaoke Glow Wave*.
6. **Capture & Export:** Tap `C` for Cinema Mode (clean fullscreen) and record viewport + audio to WebM. Export EDL for DaVinci Resolve or Premiere.

---

## Copy-Paste Listings

### Reddit (r/aiart / r/musicvideos / r/WeAreTheMusicMakers / r/SunoAI)
**Title:**
*Strangelet KinetiCUT (Strangelet, CT) — free browser tool that turns your song into a beat-synced cut-up film*

**Body:**
```text
Strangelet KinetiCUT (Strangelet, CT) - free browser tool that turns your song into a beat-synced cut-up film. 37 editing styles, 12 era grades, 16 glitch chains, Auto-DJ + 12 auto-MV cut profiles, multitrack timeline with EDL export, + an AI flipbook tab that generates WebM loops timed to song cues.

Welcome to Strangelet, CT: like Connecticut, but it chops film on the beat.

Try it free in-browser (no install):
https://perchance.org/strangelet-keneticut
(or https://perchance.org/keneticut)
```

---

### Facebook & Social Groups
```text
🎬 Welcome to Strangelet, CT — population: your music videos.

KinetiCUT listens to your song (bass, transients, BPM) and live-cuts your clips, AI loops, and vintage film grades to the beat. No install.

✨ 37 editing styles + 12 era grades (1902 Méliès to 1980s VHS)
✨ Auto-MV Cut: 12 one-click beat-synced cut profiles
✨ 4-track timeline with Resolve / Premiere EDL export
✨ Built-in AI Flipbook Studio with 20 cinematic presets

Make your first 30 seconds in 5 minutes:
👉 https://perchance.org/strangelet-keneticut
```

---

### Short Form & Snippets
**Tagline:**
> *Strangelet KinetiCUT — Welcome to Strangelet, CT: like Connecticut, but it chops film on the beat.*

**One-Liner:**
> *Audio-reactive VJ rig & living reel montage engine: live beat-synced cuts, 37 edit styles, 12 era grades & AI Flipbook studio in the browser.*
