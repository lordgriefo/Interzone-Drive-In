# ⚡ STRANGELET LAB: OPERATING SYSTEM MANUAL & PRODUCTION BIBLE
**Classification**: Quantum-Acoustic Production Workstation & Offline-First Particle Collider DAW  
**Release**: Public Beta v2.5 (`v2.5.0-beta.1`)  
**Status**: ⚡ ACTIVE PUBLIC BETA (Zero-install Web & Windows x64 Portable)  
**Author**: The Strangelet Cybernetics & Audio Division  
**Inspiration**: Georges Méliès (*Le Voyage dans la Lune*, 1902), David Lynchian Tape Realism & High-Energy Particle Physics  

---

## 🌌 1. EXECUTIVE SUMMARY & LAB ARCHITECTURE

**Strangelet Lab** is the flagship Digital Audio Workstation (DAW) and sonic physics laboratory of the **Strangelet Creative Network**. It marries classic analog console workflows with relativistic particle audio synthesis, real-time Faust WebAssembly DSP compilation, FFT reference mastering, and our resident Strangelet AI studio companion, **GHOST**.

```
   ███████╗████████╗██████╗  █████╗ ███╗   ██╗ ██████╗ ███████╗██╗     ███████╗████████╗
   ██╔════╝╚══██╔══╝██╔══██╗██╔══██╗████╗  ██║██╔════╝ ██╔════╝██║     ██╔════╝╚══██╔══╝
   ███████╗   ██║   ██████╔╝███████║██╔██╗ ██║██║  ███╗█████╗  ██║     █████╗     ██║   
   ╚════██║   ██║   ██╔══██╗██╔══██║██║╚██╗██║██║   ██║██╔══╝  ██║     ██╔══╝     ██║   
   ███████║   ██║   ██║  ██║██║  ██║██║ ╚████║╚██████╔╝███████╗███████╗███████╗   ██║   
   ╚══════╝   ╚═╝   ╚═╝  ╚═╝╚═╝  ╚═╝╚═╝  ╚═══╝ ╚═════╝ ╚══════╝╚══════╝╚══════╝   ╚═╝   
                                    -- L A B --
```

### ⚡ Public Beta Notice
Strangelet Lab is currently in **Public Beta v2.5**. The core Web Audio DSP engine, Faust compiler, Gold Path mastering, and offline Software Dojo heuristics are fully operational. Local neural bridges and desktop builds are actively evolving. Feedback and quirk reports can be submitted directly on the [GitHub Issues Tracker](https://github.com/lordgriefo/Strangelet-Lab/issues).

---

## 🔄 2. ARCHITECTURAL UPDATE: KOBOLD.CPP REPLACES COMFYUI

> [!IMPORTANT]
> **ComfyUI Retirement Notice**: Strangelet Lab has officially deprecated and removed the previous ComfyUI backend requirement. All local neural music generation (ACE-Step 1.5 & YuE 2.0) and offline GHOST LLM interactions now route exclusively through **Kobold.cpp** (`http://localhost:5001`).

### Why Kobold.cpp?
1. **Single Standalone Executable**: No Python virtual environments, Git submodule conflicts, or fragile Torch CUDA wheels. Users simply run `koboldcpp.exe`.
2. **Unified Text & Audio Inference**: Kobold.cpp now serves both GGUF language models (GHOST mentor) and music generation models from the same process.
3. **Streamlined REST Audio Endpoints**:
   - `POST /api/extra/music/prepare`: Validates prompt, tempo (BPM), musical key, and stylistic particle tags.
   - `POST /api/extra/music/generate`: Performs diffusion inference and outputs a clean 48kHz stereo `.wav` file with zero node graphs.
4. **VRAM Scavenging & Footprint**: Avoids holding separate Python VRAM pools. Kobold.cpp manages model offload gracefully across 6GB to 24GB+ hardware profiles.

---

## 🎛️ 3. CORE MODULES & FUNCTIONAL BREAKDOWN

### 1. 🎚️ Pure Timeline Multi-Track Arrangement
- **Edge-to-Edge Arrangement**: Full-height arrangement canvas designed for distraction-free multi-track editing.
- **Micro-Transport**: Slim, persistent transport controls (Play, Pause, Record, Loop, 1/16 Snap, Snapshots).
- **Automation Lanes**: Native per-track volume, pan, and Faust VST parameter envelope curves with cubic bezier tension and pencil drawing.
- **Zero-Latency Hardware Cursor**: Smooth 60fps/120fps timeline tracking decoupled from heavy React re-renders.

### 2. 🎛️ Faust DSP Toy Workbench (VST & Instrument Builder)
- **Functional Audio Stream (Faust)**: In-app real-time code editor and WebAssembly DSP compiler.
- **Live Audition Signals**: Test pedals and filters against built-in test signals (Guitar Riff, Drum Break, Synth Arp) before routing into tracks.
- **12 Boutique Presets**:
  - *Lynchian Tape Echo & Wow/Flutter*
  - *TB-303 Diode Acid Ladder Filter*
  - *VHS 1985 Chorus & Pitch Drift*
  - *Barberpole Infinite Phaser*
  - *Karplus-Strong Plucked Acoustic String*
  - *Vintage Germanium Fuzz with Voltage Starve*
  - *Deep Cavern Shimmer Reverb*
- **Visual Recipe Board**: 1-click prompt-to-toy recipes synthesized on demand by GHOST.

### 3. ⚛️ The Large Sonic Collider [LSC-27KM]
- Simulates audio stems as charged subatomic particles orbiting a 27km superconducting toroidal magnetic ring.
- **Relativistic Sonic Fission**: Particles accelerated to sub-light velocities induce Doppler pitch shifts, comb filtering, and granular micro-bursts upon collision.
- **Beam Injectors**:
  - *Beam A: Genres, Eras & Rhythms* (Samba, Indie Rock, 90s Lo-Fi, Bossa Nova, Trip Hop)
  - *Beam B: Studio Gear & Microphones* (Studer A800 tape, Pultec EQP-1A, Neumann U47, Lexicon 480L)
  - *Beam C: Sonic Yard DB & Superposition*
- **Laser Containment & Steering**: Interactive magnetic field controls to pull, inspect, or deflect orbiting sound particles.

### 4. 🌈 Beam Splitter & Optical Refractor (Snell's Law Audio Dispersion)
- **Optical Prism Chamber**: Simulates Snell's Law caustic dispersion across audio wavelengths ($n = 1.544$ quartz prism).
- **Transient Onset Detection**: Slices input audio into discrete spectral rays (R1 to R16) across the frequency spectrum.
- **Zero-Snap & Batch Export**: Export all detected slices to the Project Bin with 1 click.
- **Spectral Ray Chromatic Pads**: Instant finger-triggering via keyboard hotkeys (`1–8`, `Q–I`) for live finger drumming and MPC-style chopping.
- **Stereo Dispersion Fan**: Spreads refracted audio slices across the stereo panorama for wide holographic imaging.

### 5. 🛡️ Parametric EQ & Mastering Suite (Gold Path DSP)
- **6-Stage Audiophile Master Chain**:
  1. *Sub-Rumble Linear-Phase Highpass* (25–35 Hz)
  2. *6-Band Parametric EQ* with real-time D3 FFT spectral analysis
  3. *Multiband Bus Glue Compression*
  4. *Analog Tape Saturation Deck* (15% subtle tape warmth to driven harmonics)
  5. *Stereo Imager* with mono sub-lock below 100 Hz
  6. *Brickwall True-Peak Limiter* (-14 LUFS target, -1 dBFS ceiling)
- **Live FFT Reference Matchering**: Drop any commercial `.wav` or `.mp3` master track; the engine computes the spectral transfer curve and matches your mix's EQ and loudness profile automatically.
- **A/B Audition Switch**: Instant level-matched toggle between active master and dry signal or reference track.

### 6. 🥁 Drum Trigger // Transient-to-MIDI & SFZ Replacement
- **Spectral Onset Engine**: Real-time attack peak detection with adjustable threshold and retrigger holdoff (ms).
- **Class Detection**: Automatically classifies attack peaks into Kick, Snare, Hi-Hat, and Tom.
- **Internal SFZ Kits**:
  - *808 Boom*: Deep sub pitch-drop kick, crisp analog snare snap, metallic hats.
  - *909 Vintage Kit*: Punchy click-driven kick, snappy wire crack snare, bright sizzle hats.
  - *Acoustic Snare*: Warm oak room kick, resonant brass-shell snare with wire buzz.
- **1-Click Audio Replace**: Instantly replaces recorded drum stems with internal SFZ samples or generates standard General MIDI Channel 10 tracks.

### 7. ✂️ Laser Audio Editor & Loop Crossfade Studio
- **Non-Destructive WSOLA Time-Stretch**: Pitch-locked time stretching from 0.50x to 2.00x speed without pitch drift.
- **Chronopins**: Place time-anchor pins on the waveform to dynamically stretch specific phrases or syllables.
- **DSP Operations**: Fade In, Fade Out, Normalize, Reverse, Polarity Invert, DC Zero offset removal, Gain trim.
- **Loop Crossfade**: Seamless loop point creation with zero-crossing alignment and adjustable crossfade overlay curves.

### 8. ⚡ Spectral Wave Splitter & Stem Deck
- **Demucs v4 Hybrid + Basic Pitch Engine**: Splits full songs or AI generations into 4 isolated stems:
  1. *Vocals & Dialogue* (300 Hz – 4.5 kHz)
  2. *Sub & Synth Bass* (20 Hz – 250 Hz)
  3. *Drums & Transients* (40 Hz – 16 kHz)
  4. *Synths & Guitars* (250 Hz – 8 kHz)
- **Individual Stem Processing**: Dedicated gain, mute, solo, and **Transcribe to MIDI** buttons for each stem.
- **1-Click Stem ZIP Export**: Exports isolated stems for remixing, mashups, or Strangelet KinetiCUT VJ choreography.

### 9. 📊 Project Statistics & Mix Telemetry Radar
- **Recharts Mix Complexity Radar**: Visualizes arrangement density, dynamic range, harmonic saturation, stereo width, and frequency balance.
- **Spectral Health Score**: Alerts the engineer to low-end phase cancellations, harsh 3.5 kHz resonances, or over-compressed transients.
- **Session Audit**: Displays total tracks, active clips, memory consumption, and DSP buffer performance.

### 10. 🧪 Guided Workflows & Production Templates
- **The Quantum Alchemist**: Full pipeline taking raw prompt concepts through Collider physics, Faust coloration, and Gold Path mastering.
- **Suno De-Glaze**: Dynamic de-compression and harmonic restoration template that removes artificial high-frequency sheen and muddy mid-range buildup from AI audio.
- **16mm Grindhouse OST**: Pre-configured tape saturation, lo-fi wow/flutter, and mono-compatible spring reverb templates.

### 11. 👻 GHOST in the Machine (Offline AI Sensei)
- Resident studio companion and analog sound sage.
- **Air-Gapped Operation**: Runs completely offline using embedded Software Dojo wisdom (Lee Scratch Perry, Brian Eno, Dr. Dre, Bob Katz).
- **Kobold.cpp Connection**: Connects to local GGUF models (`Qwen2.5-7B`, `Llama-3.1-8B`) via `http://localhost:5001`.

### 12. 🎬 AudioArc & Strangelet KinetiCUT Integration
- Seamless ecosystem bridges between all Strangelet Creative Network apps:
  - **AudioArc**: Export master audio and lyric timings directly to AudioArc for Gemini-powered storyboard and scene prompt generation.
  - **Strangelet KinetiCUT**: 1-click export of master audio stems and transient hit markers for automatic film cut-up choreography.

---

## ⌨️ 4. GLOBAL KEYBOARD SHORTCUTS

| Key | Function |
| :--- | :--- |
| **`Space`** | Start / Stop Master Audio Transport |
| **`Tab`** | Toggle Arrange View (Pure Timeline) / Console View (Mixer) |
| **`B`** | Flip A/B Audition (Master vs. Dry / Reference Track) |
| **`Ctrl + Z` / `Ctrl + Y`** | Undo / Redo Timeline & DSP Parameter Edits |
| **`Ctrl + S`** | Save Project Session Snapshot (`.slp`) |
| **`1` – `8`** | Recall Mix Snapshots / Trigger Spectral Ray Pads |
| **`L`** | Toggle Transport Loop Region |
| **`Alt + G`** | Open GHOST AI Studio Terminal |
| **`Ctrl + E`** | Open Batch Stem Export Modal |

---

## 🚀 5. GETTING STARTED

### Option 1: Browser-Native Beta (Zero Installation)
Visit the live web workstation at:  
👉 **`https://lordgriefo.github.io/Strangelet-Lab/`**  
Compatible with modern Chromium browsers (Chrome, Edge, Brave), Firefox, and Safari on desktop.

### Option 2: Portable Windows x64 Binary (.zip)
1. Download `Strangelet-Lab-v2.5-Beta-Windows-x64.zip` from [GitHub Releases](https://github.com/lordgriefo/Strangelet-Lab/releases).
2. Unzip to any folder or external drive.
3. Launch `Strangelet Lab.exe`. No installer or admin privileges required.
