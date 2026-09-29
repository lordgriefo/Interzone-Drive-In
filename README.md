# 📽️ Interzone Drive-In

An experimental web-based multimedia pavilion and vintage cinema laboratory. **Interzone Drive-In** houses specialized interactive attractions for generative video art, audio-reactive synthesis, and digital nostalgia.

[![Built with React](https://img.shields.io/badge/React-18.2-blue.svg)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Bundler-Vite_5-646CFF.svg)](https://vitejs.dev/)
[![Three.js](https://img.shields.io/badge/3D-Three.js-black.svg)](https://threejs.org/)
[![Tone.js](https://img.shields.io/badge/Audio-Tone.js-orange.svg)](https://tonejs.github.io/)
[![Tailwind CSS](https://img.shields.io/badge/Style-Tailwind_CSS-38B2AC.svg)](https://tailwindcss.com/)

---

## 🎡 Featured Attractions

### 🎛️ Attraction #1: The Kinet-O-Chop
The premier attraction inside the Interzone Drive-In: an audio-reactive kinetic montage engine, multi-track visual sequencer, and vintage cinema synthesizer built for live VJing, music visualization, and procedural film-chopping.

By combining spectral audio analysis with WebGL displacement shaders, timeline automation, and era-specific aesthetic filters, the Kinet-O-Chop acts as a modular visual synthesis console directly in your browser.

---

## ✨ Kinet-O-Chop Features

### 🔊 Audio Engine & Spectral Reactivity
- **Meyda Spectral Analysis**: Real-time extraction of RMS, spectral centroid, energy, and transient spikes.
- **Tone.js Master Clock**: BPM-synced transport, looping regions, scrubbable waveform, and wet/dry algorithmic reverb.
- **Dynamic Modulation**: Route audio amplitude and frequency bands directly to visual parameters (scale, displacement, glitch intensity).

### 🌌 2.5D Depth Displacement & Photogrammetry
- **Custom Three.js Shaders**: Extrude 2D still images into 3D volumetric landscapes using grayscale depth textures.
- **Camera Fly-Throughs**: Interactive camera navigation with audio-reactive Z-axis pulsation.
- **Render Modes**: Switch between mesh surfaces, wireframes, and point-cloud particle matrices.

### ⏱️ Multi-Track Timeline & Automation
- **Multi-Track Sequencer**: Arrange audio, video assets, automated keyframes, and section markers on a unified timeline.
- **LRC / Lyric Synchronization**: Synchronize lyric segments and text cues to exact timecodes with customizable typography.
- **FX Section Markers**: Define distinct song sections (Intro, Cut-up, Bridge, Drop, Outro) with automated parameter triggers.

### 🎞️ Era Emulation & Visual Glitch Synthesizer
- **Vintage Era Presets**: 1970s Grindhouse, Silent Silver Screen, VHS static, and experimental montage styles.
- **Layered Effects**: Procedural scanlines, CRT distortion, film grain, RGB channel split, and reactive stutter cuts.
- **Rube Goldberg Chain Reactions**: Procedural chaos triggers that introduce organic randomness and glitch cascades.

### 🎥 In-Browser Video Recording
- **High-Definition Export**: Record your performance directly to WebM or MP4 using high-framerate viewport and element capture.
- **Audio Mix Integration**: Records synthesized master audio and visuals in sync without needing external capture software.

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (version 18 or higher recommended)
- [npm](https://www.npmjs.com/)

### Installation

1. **Clone the repository:**
   `ash
   git clone https://github.com/YOUR-USERNAME/interzone-drive-in.git
   cd interzone-drive-in
   `

2. **Install dependencies:**
   `ash
   npm install
   `

3. **Start the development server:**
   `ash
   npm run dev
   `

4. Open your browser and navigate to http://localhost:5173.

---

## 📦 Building for Production

To create an optimized, minified production build:

`ash
npm run build
`

You can preview the production bundle locally with:
`ash
npm run preview
`

---

## 🌐 Deploying to the Web

Because Interzone Drive-In utilizes browser APIs like **Web Audio**, **WebGL**, and **Screen/Element Capture**, it **must be served over HTTPS**.

### Deploy with Vercel (Fastest)
1. Push your code to GitHub.
2. Import your repository into [Vercel](https://vercel.com).
3. Vercel automatically configures the Vite build settings (
pm run build -> dist).
4. Click **Deploy**.

### Deploy with Netlify
1. Run 
pm run build locally.
2. Drag and drop the generated dist/ directory into [Netlify Drop](https://app.netlify.com/drop).

### Deploy with Cloudflare Pages
1. Connect your GitHub repository to [Cloudflare Pages](https://pages.cloudflare.com/).
2. Select **Vite** as the framework preset, set dist as the build output directory, and deploy.

---

## 🛠️ Technology Stack

- **Frontend**: [React 18](https://react.org)
- **Tooling & Bundler**: [Vite](https://vitejs.dev/)
- **3D Graphics & Shaders**: [Three.js](https://threejs.org/)
- **Audio Synthesis & Transport**: [Tone.js](https://tonejs.github.io/)
- **Audio Feature Extraction**: [Meyda](https://meyda.js.org/)
- **Animations**: [GSAP](https://greensock.com/gsap/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)

---

## 📄 License

This project is licensed under the MIT License — see the LICENSE file for details.
