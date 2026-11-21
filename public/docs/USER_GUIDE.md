# 📖 STRANGELET LAB: OPERATING SYSTEM MANUAL & FIELD GUIDE
**Classification**: Quantum-Acoustic Production Workstation & Offline AI Hybrid DSP System  
**Version**: 2.5.0 (Offline-Certified / Air-Gapped Ready)  
**Author**: Strangelet Lab Cybernetics & Audio Research Division  

---

## ⚡ 1. EXECUTIVE SUMMARY & ARCHITECTURE OVERVIEW

**Strangelet Lab** is a high-performance, browser-native / standalone quantum-acoustic Digital Audio Workstation (DAW) and sonic physics synthesizer. It merges modern DSP synthesis, relativistic particle audio collisions, multi-track arrangement & Pure Timeline editing, Faust DSP compilation, FFT Reference Matchering, and offline local AI mentorship (*Kobold.cpp*, *Ollama*, *LM Studio*, and **GHOST — The Ghost in the Machine**).

### Core Architectural Pillars
1. **Zero-Latency Client-Side DSP & Native Hardware Cursor**: Every oscillator, filter, saturator, and master chain operates 100% inside your hardware via Web Audio API, Web Workers, and Faust WebAssembly, paired with the native OS cursor for snappy 60fps timeline/fader control.
2. **Flexible Workspace Views & Snapshots Menu**: Switch between **Pure Timeline**, **Timeline**, **Mixer Only**, and **Split** layouts, and save/recall/A-B compare up to 8 mix states from the compact **SNAPSHOTS** header dropdown menu.
3. **The Large Sonic Collider**: Audio clips and stems become relativistic hadrons in a magnetic containment ring, steered with laser beams to induce sonic fission, micro-granular resonance, and Doppler collisions.
4. **Gold Path Mastering & Reference Matchering**: 6-stage mastering chain with Mid/Side processing, multi-band compression, tape saturation, real-time **FFT Reference Matchering** auto-EQ, and level-matched **Audition Reference Track** A/B comparison.
5. **Air-Gapped AI Hub & GHOST**: Local inference connectors for GGUF models running in Kobold.cpp, Ollama, and LM Studio, primed via the **Software Dojo** and backed by live session telemetry.

---

## 🎛️ 2. NAVIGATION & WORKSPACE TOPOLOGY

Strangelet Lab is organized into primary functional views accessible via the sidebar and top toolbar:

| View | Icon | Purpose |
| :--- | :--- | :--- |
| **Pure Timeline / Arrangement** | `Maximize2` | Edge-to-edge full-height timeline with slim micro-transport (`Pure Timeline`) or full toolbars (`Timeline`), automation lanes, and MIDI quantize. |
| **Mixer & Snapshots Menu** | `Sliders` | Channel strips with gain staging, EQ, panning, FX slots, Performance Macro Engine, and compact **SNAPSHOTS** dropdown menu (`1–8` + A/B). |
| **Global VST Browser** | `Cpu` | Project-wide Faust/VST plugin scanner with unified Parameter Automation lane toggles for timeline drawing. |
| **Collider** | `Atom` | Relativistic hadron ring where clips collide at sub-light speeds to generate new granular soundbeds. |
| **Pedalboard** | `Zap` | Modular stompbox rack (Tube Overdrive, Tape Delay, Chorus, Stereo Phaser, Bitcrusher, Spring Reverb). |
| **Mastering (Gold Path)** | `ShieldCheck` | 6-stage Gold Path mastering chain, D3 real-time FFT spectrum visualizer, LUFS metering, and **FFT Reference Matchering**. |
| **Beam Splitter** | `Split` | Frequency/transient splitter that deconstructs sounds into High/Low, Mid/Side, or Transient/Tonal. |
| **Suno De-Glaze Studio** | `Flame` | Un-bakes muddy or over-compressed AI generations using dynamic expansion and harmonic re-synthesis. |
| **MIDI / Piano Roll** | `Keyboard` | Note editor + **Global MIDI Quantize** (`1/4`, `1/8`, `1/16`, `1/32` + **Swing %**) and retro SFZ synth routing. |

---

## 💥 3. THE LARGE SONIC COLLIDER (HADRON AUDIO SYNTHESIS)

The Collider models audio stems as charged subatomic particles inside a superconducting toroidal ring.

### Key Controls
- **Beam Energy (GeV)**: Accelerates particle velocity. Higher GeV increases Doppler pitch modulation and granular grain density.
- **Magnetic B-Field (Tesla)**: Tightens the orbit radius. High Tesla values force chaotic near-misses and comb filtering.
- **Collision Cross-Section**: Probability threshold for when two particles cross orbits and trigger a micro-sonic fission burst.
- **Laser Pointer System**:
  - `Inspect`: Locks onto a particle to display its spectral frequency signature and centroid.
  - `Gravity Well`: Pulls orbiting particles toward the cursor to manually force micro-collisions.
  - `Repulsor Beam`: Deflects particles, creating sweeping pitch dive-bombs and flanging.
  - `Exciter / Ionizer`: Saturates high frequencies and generates sub-harmonic sub-bass on contact.

---

## 🛡️ 4. THE GOLD PATH MASTERING SUITE & FFT REFERENCE MATCHERING

The Gold Path is Strangelet Lab's reference-grade output signal chain designed to provide broadcast loudness without destroying transient punch.

### The 6 Stages
1. **Linear-Phase Pre-EQ**: High-pass sub-rumble cleanup (25–35 Hz) and 6-band Parametric EQ.
2. **Mid/Side Stereophonic Processor**: Centers the bass below 120 Hz while widening high-frequency air (8 kHz+).
3. **Strangelet Multi-Band Dynamic Engine**: Low, Mid, and High band compression with adjustable crossovers and auto-release.
4. **Analogue Tape Saturation**: Warm odd-order harmonics and magnetic hysteresis emulation.
5. **D3 Real-Time Spectral Analyzer**: Dual-curve FFT showing pre-master vs. post-master frequency distribution.
6. **True-Peak Brickwall Limiter**: Inter-sample peak protection with ceiling safety (-0.3 dBFS).

### Real-Time Reference Matchering & Auditioning
- **Drop Reference Audio Track (Matchering)**: Drag any `.wav` or `.mp3` song onto the mastering dropzone. Web Audio FFT computes its average spectrum across **Sub, Low-Mid, Mid, Presence, and Air**, compares it against your master bus, and auto-calibrates the 6-band Parametric EQ.
- **Audition Reference Track**: Flip instantaneously between your mastered chain and the reference track at level-matched volume to eliminate loudness bias.

---

## 🥋 5. SOFTWARE DOJO & GHOST (THE GHOST IN THE MACHINE)

Strangelet Lab features a native link to local Large Language Model runners (*Kobold.cpp*, *Ollama*, *LM Studio*).

### GHOST — Sole Studio Mentor & DSP Architect
- **Session-Aware Intelligence**: Before answering, GHOST inspects your live BPM, time signature, active track count (Audio vs. MIDI), active Gold Path mastering preset, and Reference Matchering status.
- **Practical Engineering**: Delivers concise 2–4 sentence answers citing exact Hz/kHz frequencies and Strangelet Lab knobs, plus generates and compiles live Faust DSP circuits.

### The Software Dojo Scrolls
The Dojo allows you to train and prime your local LLM with the DAW's exact feature set:
- **Scroll of Gold Path Mastering**: Teaches the model target LUFS, crossover points, and Mid/Side rules.
- **Scroll of the Large Sonic Collider**: Instructs the model on GeV energies, laser tools, and Doppler equations.
- **Scroll of Faust DSP Synthesizer**: Provides code examples and syntax rules for the in-app Faust compiler.
- **Scroll of AceStep Loop Bed Generation**: Guides prompt formatting for rhythm and drone stems.
- **Custom Scrolls**: Write and save your own studio secrets to be permanently injected into the model's system prompt!

---

## 🔌 6. LOCAL AI HUB & NEURAL MUSIC CONNECTION GUIDE

To use the AI buddies and local neural music generation completely offline with zero internet access:

> [!IMPORTANT]
> **Kobold.cpp Replaces ComfyUI**: Strangelet Lab has retired ComfyUI. All local neural music generation (ACE-Step 1.5 & YuE 2.0) and offline GHOST LLM interactions now route directly through **Kobold.cpp** (`http://localhost:5001`). This eliminates complex node graphs, heavy Python dependencies, and separate server configurations.

### Option A: Kobold.cpp (Recommended Universal Audio & LLM Engine)
1. Launch Kobold.cpp with your favorite GGUF (e.g., `Qwen2.5-7B-Instruct.gguf` or `Llama-3.1-8B-Instruct.gguf`):
   ```bash
   ./koboldcpp --model your-model.gguf --port 5001 --usecublas
   ```
2. In Strangelet Lab, click **AI Hub Endpoints** in the top bar.
3. Set Engine to `Kobold.cpp (Local API)` and URL to `http://localhost:5001`.
4. Click **Test Endpoint Connection** to verify green status.
5. For music generation, Strangelet Lab calls Kobold.cpp's REST audio bridge endpoints (`/api/extra/music/prepare` and `/api/extra/music/generate`) directly.

### Option B: Ollama (LLM Only)
1. Run Ollama locally:
   ```bash
   ollama run qwen2.5:7b
   ```
2. In Strangelet Lab, select `Ollama (Local Host)` and URL `http://localhost:11434`.
3. Enter Model Tag `qwen2.5:7b`.

### Option C: LM Studio (LLM Only)
1. Start the Local Inference Server in LM Studio (default port `1234`).
2. Select `LM Studio (Local v1)` and URL `http://localhost:1234`.

---

## 🎹 7. ADVANCED TOOLS, WORKBENCH & AUTOMATION

- **Faust DSP Workbench (12 Models & Idea Board)**: Includes 12 boutique presets (*VHS 1985 Chorus & Pitch Drift*, *Deep Cavern Shimmer Reverb*, *Cassette Head Magnetic Saturator*, *Barberpole Infinite Phaser*, *FM Glass Bell Synth*, etc.), a visual **Idea Board / Cookbook** organized by sonic tags, and 1-click **Prompt-to-Toy** recipes assembled live by GHOST.
- **Global VST Browser & Macro Engine**: Scan active Faust/VST plugins across the project, toggle timeline parameter automation lanes, and record live volume/pan/VST movements as MIDI-triggerable Performance Macros.
- **Global MIDI Quantize & Swing**: Snap selected MIDI clips or notes to `1/4`, `1/8`, `1/16`, or `1/32` grids with adjustable **Swing %** humanization and non-destructive timing restore.
- **Spotify Basic Pitch Transcriber**: Drop any audio stem (vocal, bass, guitar) to transcribe polyphonic MIDI notes with velocity and pitch-bend data.
- **AceStep Loop Designer & SFZ Open Library**: Generate BPM-synced song beds and load open-format multi-velocity `.sfz` instruments.

---

## ⌨️ 8. KEYBOARD SHORTCUTS CHEAT SHEET

| Shortcut | Action |
| :--- | :--- |
| `Space` | Play / Pause Master Transport |
| `Tab` | Cycle Active Timeline View (`Pure Timeline` / `Timeline`) <-> `Mixer Only` |
| `Alt + G` | Toggle GHOST (The Ghost in the Machine) Terminal |
| `Ctrl + B` | Collapse / Expand Left Navigation Sidebar |
| `Ctrl + E` | Open Batch Stem Export (`.WAV` ZIP) |
| `Z` / `Ctrl+Z` | Undo Last Edit |
| `R` / `M` / `S` | Record / Mute Selected Track / Solo Selected Track |
| `Esc` | Close active modal, popover menu, or deselect tools |
| `?` / `F1` | Open this User Manual & Field Guide |

---

## 🎛️ 9. MODULAR RESOURCE & VRAM MANAGEMENT (6GB TO 16GB SCALABILITY)

Strangelet Lab was engineered specifically for hardware accessibility, empowering creators on **6GB VRAM laptops** while seamlessly scaling to **16GB Pro Studio rigs** as your hardware evolves.

### Hardware Tier Profiles:
- **Tier 1: 6GB VRAM (Tight / Laptop Mode)**
  * **Target Hardware**: NVIDIA RTX 2060, RTX 3060 6GB Laptop, GTX 1660 Ti, Apple M-series 8GB shared.
  * **Recommended LLM**: `Llama 3.2 3B Q4_K_S` (2.1GB) or `Qwen 2.5 7B Slim Q4_K_S` (3.4GB).
  * **Memory Strategy**: Automatic memory scavenging; offloads heavy models when idle; single-stem sequential processing.
- **Tier 2: 8GB VRAM (Balanced Desktop)**
  * **Target Hardware**: RTX 3070, RTX 4060, Apple M1/M2/M3 16GB.
  * **Recommended LLM**: `Qwen 2.5 7B Q4_K_M` (3.8GB) or `Llama 3.1 8B Q4_K_M` (4.8GB).
- **Tier 3: 16GB VRAM (Pro Studio Mode)**
  * **Target Hardware**: NVIDIA RTX 4070 Ti, RTX 4080 (16GB Upgraded), Apple M Pro 24GB+.
  * **Recommended LLM**: `Qwen 2.5 14B Q4_K_M` (8.4GB) or `Llama 3.1 8B Q8_0 High-Def` (8.5GB).
  * **Memory Strategy**: Full 4-stem HTDemucs FP16 resident in VRAM (~1.4GB); parallel AceStep diffusion; 60 FPS real-time D3 FFT spectral analysis with zero offload delays.
- **Tier 4: 24GB+ VRAM (Studio Titan)**
  * Full FP16 unquantized models and multi-model concurrent execution.

### Modular Component Power Matrix:
You can toggle any engine between `[ACTIVE]`, `[STANDBY]`, or `[UNLOADED]` with 1 click in the Hardware Monitor to immediately reclaim memory:
- **Demucs Stem Separator**: Save ~450MB - 1.2GB VRAM when unloaded.
- **Ace-Step 1.5 Diffusion**: Save ~2.4GB - 3.2GB VRAM when unloaded.
- **Spotify Basic Pitch Model**: Save ~320MB VRAM when unloaded.
- **Faust DSP JIT Compiler**: Switch between JIT Wasm compilation and native Web Audio fallback.
- **Purge Free VRAM Button**: Instantly clears standby buffers and garbage-collects GPU cache.

---

## 🧠 10. BUDDY EVOLUTION & SOUL PRESERVATION ACROSS MODEL SWAPS

When technology evolves and you swap models in Kobold.cpp, LM Studio, or Ollama (or upgrade your GPU from 6GB to 16GB), **your Helper Buddy evolves with you and never forgets your studio habits.**

### Buddy Soul Core Features:
- **Decoupled Personality Engine**: GHOST's identity and session memories are stored independently in `buddyEvolutionCore`.
- **Evolving Lab Rank & XP**:
  * Level 1: Novice Oscillator Monk
  * Level 2: Collider Apprentice
  * Level 3: Harmonic Alchemist
  * Level 4: Faust DSP Ronin
  * Level 5: Master Sonic Sensei
  * Level 6: Grand Strangelet Hermit
  * Level 7: Quantum Singularity Oracle
- **Persistent Memory Tracking**: Automatically records your custom audio preferences (e.g. low-end mono lock habits, favorite saturation levels, 8.5kHz de-sheen preferences).
- **Soul Backup (.json)**: Click **"Export Buddy Soul"** in the Ghost in the Machine or Resource Manager to download your buddy's brain and take it to any machine!

---

## ⚡ 11. FAUST DSP ARCHITECTURE & BOUTIQUE PEDAL FORGE

Faust (Functional Audio Stream) compiles real-time signal algebra into Web Audio WebAssembly nodes directly in your browser.

### Key Syntax & Composition Operators:
- Sequential `:` (`A : B` connects output of A to input of B)
- Parallel `,` (`A , B` runs stereo parallel paths)
- Split `<:` (`split <: A, B` branches one signal into two)
- Merge `:>` (`A, B :> sum` sums two signals into one)
- Recursive `~` (creates feedback loops for delays and resonant ladders)
- Analog Saturation: `ma.tanh(x * drive)`
- Asymmetrical Tube Warmth: `ma.tanh(x * drive + bias) - bias * 0.4`
- Filter: `fi.lowpass(2, cutoffHz)` or `fi.resonlp(cutoffHz, q, gain)`
- UI Controls: `hslider("Drive[unit:x]", default, min, max, step)`

---

## 📜 12. INSIDE GAME: 12 LEGENDARY PRODUCER STUDIO SECRETS

Available directly in the **Software Dojo Scrolls** and quoted spontaneously by the Strangelet Guru:

1. **Lee "Scratch" Perry (The Black Ark)**: Burying 1/4" master tapes under tropical palm trees to ground iron particles; blowing ganja smoke into tape capstans; overdriving spring reverbs into blown guitar amps.
2. **Prince (When Doves Cry & LinnDrum)**: Muting the entire bass track 30 minutes before cutting the master lacquer to give the drums infinite headroom; pitching down LinnDrum LM-1 rimshots into Boss BF-2 flangers.
3. **Brian Eno (Oblique Strategies & Prime Delays)**: Using prime-number delay lengths (e.g. 137ms, 311ms) on 30-foot tape loops strung on pencils across carpet so reflections never phase-cancel.
4. **Dr. Dre (The Chronic 2001 Low End)**: The 100Hz mono-lock rule; synthesizing pure 40Hz sub sine waves under acoustic kicks; high-passing everything below 28Hz for maximum amplifier wattage.
5. **Sylvia Massy (Adventure Tracking)**: Routing guitar signals through dill pickles and potatoes for asymmetric harmonic crunch; hanging singers upside down for primal diaphragm compression.
6. **Kevin Shields (Loveless Glide Guitar)**: Strumming with the Jazzmaster floating tremolo arm continuously into 100% wet reverse reverb (Yamaha SPX90) into cranked Marshall JCM800. Zero chorus pedals used.
7. **Bob Katz (K-System & Dynamic Headroom)**: Mastering to -14 LUFS with -0.3dB true-peak ceiling instead of squashing to -6 LUFS; eliminates inter-sample clipping on Bluetooth and streaming DACs.
8. **Wendy Carlos (Switched-On Modular)**: Detuning dual oscillators by 0.7 Hz to simulate living orchestral acoustic drift; designing the Carlos Alpha and Beta microtuning scales.
9. **Rick Rubin (The Reductive Scalpel)**: Muting 6 synth tracks until only the raw heartbeat remains: "If it doesn't work with just a guitar and a voice, no VST can save it."
10. **Trevor Horn (Fairlight & Multiband)**: 8-bit Fairlight CMI sample transposition; gating Lexicon 480L reverbs at 240ms; chaining three Roland Dimension D spatializers in series.
11. **King Tubby (Inventor of Dub)**: Modifying a broadcast console with a sliding high-pass filter wand to slice away drum transients and toss feedback loops into spring reverb.
12. **George Martin & Geoff Emerick (Abbey Road)**: Shoving a U47 microphone wrapped in a sweater into Ringo's kick drum; running John Lennon's voice into a Leslie rotary speaker cabinet at 400 RPM.

