# 📦 STRANGELET LAB: ADD-ONS & MODEL DOWNLOAD CENTER

Welcome to the **Strangelet Lab Add-on & Model Hub**.  
Strangelet Lab is built to be **100% air-gapped and offline-first**. You can run the entire DAW without any AI models at all, or connect it to your favorite local models on your GPU.

---

## 👻 1. GHOST LLM BRAINS (TIERED BY GPU VRAM)

GHOST is your in-studio audio mentor, analog sage, and Faust DSP architect.  
Select the model tier that fits your GPU VRAM:

### 🥉 Tier 1: 4 GB – 6 GB VRAM Range (3B – 4B Models)
*Designed for laptops, mobile GPUs (GTX 1650, RTX 3050, RTX 2060), and 8GB unified memory Macs.*

| Model | Recommended Hardware | VRAM Usage | File Size | 1-Line Ollama Command | Hugging Face GGUF Link |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Google Gemma 2 2B IT** *(Ultralight)* | Any 4GB–6GB GPU / Intel / Apple | **1.6 GB** | 1.6 GB | `ollama run gemma2:2b` | [Gemma-2-2B-IT-GGUF](https://huggingface.co/google/gemma-2-2b-it-GGUF) |
| **Qwen 2.5 3B Instruct** | GTX 1650, RTX 3050, 4GB–6GB Laptops | **1.9 GB** | 1.9 GB | `ollama run qwen2.5:3b` | [Qwen2.5-3B-Instruct-GGUF](https://huggingface.co/Qwen/Qwen2.5-3B-Instruct-GGUF) |
| **Llama 3.2 3B Instruct** | 4GB or 6GB Laptop GPU | **2.1 GB** | 2.0 GB | `ollama run llama3.2:3b` | [Llama-3.2-3B-Instruct-GGUF](https://huggingface.co/bartowski/Llama-3.2-3B-Instruct-GGUF) |
| **GHOST Mad Scientist 3B–4B** *(Default)* | RTX 2060 6GB / RTX 3060 Mobile | **2.6 GB** | 2.6 GB | `ollama run llama3.2:3b` | [GHOST-Mad-Scientist](https://huggingface.co/bartowski/Llama-3.2-3B-Instruct-GGUF) |

---

### 🥈 Tier 2: 8 GB – 12 GB VRAM Range (7B – 9B Models)
*Designed for desktop studio rigs: RTX 3060 12GB, RTX 3070, RTX 4060, Apple M-series 16GB.*

| Model | Recommended Hardware | VRAM Usage | File Size | 1-Line Ollama Command | Hugging Face GGUF Link |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Nous Hermes 3 8B** *(Steerable Genius)* | RTX 3060 12GB, RTX 4060, Mac 16GB | **4.8 GB** | 4.9 GB | `ollama run hermes3:8b` | [Hermes-3-Llama-3.1-8B-GGUF](https://huggingface.co/NousResearch/Hermes-3-Llama-3.1-8B-GGUF) |
| **Google Gemma 2 9B IT** *(Precision)* | RTX 3060 12GB, RTX 4060, Mac 16GB | **5.8 GB** | 5.4 GB | `ollama run gemma2:9b` | [Gemma-2-9B-IT-GGUF](https://huggingface.co/google/gemma-2-9b-it-GGUF) |
| **Qwen 2.5 7B Instruct** *(Studio Master)* | RTX 3060, RTX 4060, Apple M 16GB | **4.2 GB** | 4.7 GB | `ollama run qwen2.5:7b` | [Qwen2.5-7B-Instruct-GGUF](https://huggingface.co/Qwen/Qwen2.5-7B-Instruct-GGUF) |
| **Meta Llama 3.1 8B** *(Analog Sage)* | RTX 3070, RTX 4070 8GB | **4.8 GB** | 4.9 GB | `ollama run llama3.1:8b` | [Llama-3.1-8B-Instruct-GGUF](https://huggingface.co/bartowski/Meta-Llama-3.1-8B-Instruct-GGUF) |

---

### 🥇 Tier 3: 16 GB+ VRAM Range (14B – 32B+ Models)
*Designed for pro studios & titan GPUs: RTX 4070 Ti, RTX 4080, RTX 3090, RTX 4090 (24GB), Mac M Max 32GB–64GB.*

| Model | Recommended Hardware | VRAM Usage | File Size | 1-Line Ollama Command | Hugging Face GGUF Link |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Qwen 2.5 14B Pro Master** | RTX 4070 Ti, RTX 4080 16GB, Mac 32GB | **8.8 GB** | 9.2 GB | `ollama run qwen2.5:14b` | [Qwen2.5-14B-Instruct-GGUF](https://huggingface.co/Qwen/Qwen2.5-14B-Instruct-GGUF) |
| **Meta Llama 3.1 8B Q8_0 High-Def** | RTX 4070 Ti, RTX 4080 16GB | **8.5 GB** | 8.9 GB | `ollama run llama3.1:8b-instruct-q8_0` | [Llama-3.1-8B-Q8-GGUF](https://huggingface.co/bartowski/Meta-Llama-3.1-8B-Instruct-GGUF) |
| **Qwen 2.5 32B Studio Flagship** | RTX 3090 / 4090 24GB, Mac 48GB+ | **18.2 GB** | 19.4 GB | `ollama run qwen2.5:32b` | [Qwen2.5-32B-Instruct-GGUF](https://huggingface.co/Qwen/Qwen2.5-32B-Instruct-GGUF) |
| **DeepSeek Coder V2 16B** *(DSP Architect)* | RTX 4080 16GB / RTX 3090 / Mac 32GB | **9.6 GB** | 9.8 GB | `ollama run deepseek-coder-v2:16b` | [DeepSeek-Coder-V2-Lite-GGUF](https://huggingface.co/bartowski/DeepSeek-Coder-V2-Lite-Instruct-GGUF) |

---

### How to Run GHOST Locally:
1. **Via Ollama (Recommended / 1-Click)**:
   * Install [Ollama](https://ollama.com).
   * Open Terminal and run e.g.: `ollama run hermes3:8b` or `ollama run gemma2:2b`.
   * In Strangelet Lab, open **AI / Tools &rarr; Local AI Hub Settings** and select **Ollama (`http://localhost:11434`)**.
2. **Via Kobold.cpp (Ultra-Low VRAM)**:
   * Download the standalone [Kobold.cpp](https://koboldai.org/cpp) executable.
   * Launch it, load your downloaded `.gguf` file, and set port to `5001`.
   * In Strangelet Lab, select **Kobold.cpp (`http://localhost:5001`)**.
3. **Zero-Setup Offline Fallback**:
   * If no local server is running, Strangelet Lab's built-in **Software Dojo Heuristic Kernel** automatically powers Ghost with zero hallucination.

---

## 🎛️ 2. OPEN-SOURCE EFFECTS RACKS & DSP COMPONENTS

How do we get open-source effects and tools to work inside Strangelet Lab? There are two primary integration modes:

### Mode A: In-App Native DSP (Zero Installation, 100% Built-In)
These effects run directly inside Strangelet Lab's native Web Audio engine. No extra files or downloads needed:
1. **Per-Track Insert FX Chain**: Every channel strip in the Mixer has an expandable **`FX`** drawer with:
   * **3-Band Surgical EQ**: Low Shelf (100Hz), Mid Peaking (1kHz), High Shelf (8kHz).
   * **Tube Drive / Saturation**: Hyperbolic tangent ($\tanh$) soft clipping waveshaper for 2nd and 3rd order analog harmonics.
   * **Resonant State-Variable Filter**: Lowpass / Highpass / Bandpass with cutoff (20Hz - 20kHz) and resonance Q.
   * **Delay & Reverb Inserts**: Millisecond tempo-sync delay with feedback loop and algorithmic plate decay.
2. **Quantum Stompbox Pedalboard**: A dedicated pedalboard view with 9 modular stompboxes:
   * `NEUTRON DRIVE`: Analog overdrive and bite EQ.
   * `QUARK CHORUS`: Modulated bucket-brigade stereo chorus.
   * `HADRON CRUSHER`: Variable bit-depth (4-16 bit) and sample rate decimation.
   * `MOOG LADDER`: 4-pole 24dB/oct resonant transistor ladder filter.
   * `PULSAR PHASER`: 6-stage optical all-pass filter cascade.
   * `4x12 VINTAGE CAB`: Tube speaker cabinet simulation with air/thump contours.
   * `DARK REVERB`: Algorithmic plate space.

### Mode B: External Open-Source Plugins & Standards (Drop-In)

| Tool / Framework | Type & Format | How to Get It Working in Strangelet Lab | Source Link |
| :--- | :--- | :--- | :--- |
| **[Tuna.js](https://github.com/TheCodeDestroyer/tuna)** | Native Web Audio Stompboxes | Embedded in Strangelet Lab's AudioWorklet engine. 14 modular rack units ready to insert on any bus. | [Tuna.js GitHub](https://github.com/TheCodeDestroyer/tuna) |
| **[WAM 2.0 (Web Audio Modules)](https://webaudiomodules.org/)** | WebAssembly Plugins | Launch via the in-app **VST Wrapper Host Modal**. Run ChowDSP (tape modeler, ChowCentaur) and Dexed FM in Wasm. | [Web Audio Modules](https://webaudiomodules.org/) |
| **[Faust DSP Lab](https://faust.grame.fr/)** | Functional Stream JIT | Open **Views &rarr; Faust DSP Lab**. Paste or write Faust code; it compiles directly into a live Web Audio node you can route to any mixer track! | [Faust DSP Library](https://faust.grame.fr/) |
| **[Freeverb & Dattorro Plate](https://github.com/nick-thompson/freeverb)** | Algorithmic Network | Zero-latency diffusion algorithm embedded inside the master bus and channel strip insert rack. | [Freeverb Core](https://github.com/nick-thompson/freeverb) |
| **[Neural Amp Modeler (NAM)](https://github.com/sdatkinson/neural-amp-modeler)** | Wasm Amp Profiler | Connect via the Desktop VST Bridge or load NAM `.nam` model files via WAM 2.0 host. | [NAM GitHub](https://github.com/sdatkinson/neural-amp-modeler) |

---

## ⚡ 3. ACE-STEP 1.5 & NEURAL AUDIO DIFFUSION (KOBOLD.CPP BACKEND)

Strangelet Lab now routes local neural music generation directly through **Kobold.cpp** (`http://localhost:5001`), replacing ComfyUI entirely. Kobold.cpp provides a unified, lightweight, single-executable REST bridge for ACE-Step 1.5 loop diffusion, YuE 2.0 full-track generation, and GHOST LLMs with zero complex node graphs or Python environment headaches.

| Component | Model Name | Format | VRAM | Download Link |
| :--- | :--- | :--- | :--- | :--- |
| **Language Backbone** | `acestep-5Hz-lm-1.7B-BF16.gguf` | GGUF | 2.4 GB | [AceStep 1.5 GGUF on HuggingFace](https://huggingface.co/Comfy-Org/AceStep_1.5_GGUF) |
| **Diffusion DiT** | `acestep-v15-turbo-shift3-BF16.safetensors` | Safetensors | 3.2 GB | [AceStep 1.5 Weights on HuggingFace](https://huggingface.co/Comfy-Org/AceStep_1.5_GGUF) |
| **Kobold.cpp Engine** | `koboldcpp.exe` (v1.75+) | Standalone Binary | 0 MB | [Kobold.cpp GitHub Releases](https://github.com/LostRuins/koboldcpp/releases) |

### How to Connect (Kobold.cpp REST Audio Bridge):
1. Launch **Kobold.cpp** on your local machine (default port `http://localhost:5001`).
2. In Strangelet Lab, open the **Kobold.cpp REST Audio Bridge** / **Ace-Step 1.5** panel.
3. Verify the endpoint status (`http://localhost:5001` — green indicator).
4. **Step 1 ("Prepare Plan")**: Dispatches `/api/extra/music/prepare` to establish key, tempo, and style nuances.
5. **Step 2 ("Generate Track")**: Calls `/api/extra/music/generate` to synthesize audio. The generated `.wav` preview can be placed directly onto the multitrack timeline with 1 click!

> [!NOTE]
> **ComfyUI Transition**: We have retired ComfyUI in favor of Kobold.cpp. Kobold.cpp runs offline as a single executable, unifies text and music generation, and consumes significantly less idle VRAM.

---

## 🎶 4. YuE2 FULL-SONG GENERATOR

YuE2 is a 7B dual-track foundation model for generating complete full-length songs with separated vocal and backing tracks.

| Model | Description | Size | Download Link |
| :--- | :--- | :--- | :--- |
| **YuE-s1-7B-anneal-en-cot** | Stage 1 Lyric-to-Acoustic Tokens Model | 8.4 GB | [YuE-s1 on HuggingFace](https://huggingface.co/multimodalart/YuE-GPT) |
| **YuE-s2-1B-general** | Stage 2 Dual-Track Vocal/Instrumental Model | 2.2 GB | [YuE-s2 on HuggingFace](https://huggingface.co/multimodalart/YuE-GPT) |
| **xCodec Neural Vocoder** | 48kHz Stereo Waveform Decoder | 1.1 GB | [xCodec on HuggingFace](https://huggingface.co/HKUST-Audio/xcodec_mini_infer) |

---

## 🎹 5. FREE SOUNDFONT & SFZ INSTRUMENT PACKS

High-quality open-source sample-based instruments for the built-in **SFZ Player** and **Drum Transient Replacer** (100% Web Audio, zero GPU needed):

### 🌐 The Open SFZ Repository: [sfzinstruments.github.io](https://sfzinstruments.github.io/)
Browse 200+ free, community-curated, multi-sampled instruments across acoustic pianos, vintage electric pianos, orchestral strings, upright basses, guitars, and drum kits.

| Instrument / Library | Category | Description | Size | Link |
| :--- | :--- | :--- | :--- | :--- |
| **[Salamander Grand Piano](https://sfzinstruments.github.io/pianos/salamander_grand_piano)** | Concert Grand | Yamaha C5 with 16 velocity layers, hammer noise, string resonance. | 1.1 GB (Flac) | [Download SFZ](https://sfzinstruments.github.io/pianos/salamander_grand_piano) |
| **[Virtual Playing Orchestra](https://sfzinstruments.github.io/orchestral/virtual_playing_orchestra)** | Symphonic Suite | Solo & section strings, woodwinds, brass, and orchestral percussion. | 780 MB | [Download VPO](https://sfzinstruments.github.io/orchestral/virtual_playing_orchestra) |
| **[Karoryfer Meatbass](https://sfzinstruments.github.io/bass/meatbass)** | Acoustic Upright | Real double bass with finger pizzicato, open string growl, body thumps. | 220 MB | [Download Meatbass](https://sfzinstruments.github.io/bass/meatbass) |
| **[GeneralUser GS SFZ](https://sfzinstruments.github.io/general_midi/generaluser_gs)** | 128 GM Pack | Complete 128 General MIDI instrument set mapped to open SFZ format. | 30 MB | [Download GS](https://sfzinstruments.github.io/general_midi/generaluser_gs) |
| **[Splendid 136 Grand & jRhodes3](https://sfzinstruments.github.io/pianos/splendid_grand_piano)** | Studio Keys | Classic Steinway grand piano sample set paired with the warm vintage jRhodes3. | 136 MB | [Download Keys](https://sfzinstruments.github.io/pianos/splendid_grand_piano) |
| **1973 Rhodes Mark I Vintage EP** | Electric Piano | Sampled through tube preamps with natural bell harmonics. | 36 MB | Included / Releases |
| **Roland TR-808 & TR-909 Analog Kit** | Drum Samples | Studio-grade drum transient hits for 1-click drum replacement. | 18 MB | Included / Releases |

---

## 🛠️ VRAM TIER QUICK-REFERENCE

| Your GPU VRAM | Recommended Ghost LLM | Stem Separation | Ace-Step Diffusion |
| :--- | :--- | :--- | :--- |
| **4GB - 6GB (Tier 1)** | Gemma 2 2B (1.6GB) / Qwen 2.5 3B (1.9GB) | Mobile ONNX (On-Demand) | Sequential Generation |
| **8GB - 12GB (Tier 2)** | Hermes 3 8B (4.8GB) / Gemma 2 9B (5.8GB) / Qwen 7B (4.2GB) | HTDemucs 4-Stem | Standby Mode |
| **16GB+ (Tier 3)** | Qwen 2.5 14B Pro (8.8GB) / Qwen 32B (18.2GB) | Full FP16 Resident | Full Multi-Track Concurrent |
