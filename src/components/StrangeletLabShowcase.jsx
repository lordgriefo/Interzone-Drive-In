import React, { useState } from 'react';

const MODULES = [
  {
    id: 'timeline',
    category: 'synthesis',
    title: 'Pure Timeline Multi-Track Arrangement',
    badge: 'CORE TIMELINE',
    badgeColor: '#fbbf24',
    img: './assets-bg/lab/timeline_multitrack.jpg',
    desc: 'Edge-to-edge arrangement canvas with micro-transport, hardware-accelerated 60fps cursor, and multi-track audio lanes with real-time cubic bezier automation.',
    bullets: [
      'Volume, pan & Faust VST parameter envelope curves',
      'Subtle, Warm, or Lynchian tape realism saturation deck',
      'Instant A/B mix balance snapshots (1–8 recall)',
    ],
  },
  {
    id: 'faust',
    category: 'dsp',
    title: 'Faust DSP Toy Lab // VST & Instrument Builder',
    badge: 'FAUST COMPILER',
    badgeColor: '#00e5ff',
    img: './assets-bg/lab/faust_dsp_toy_lab.png',
    desc: 'Code boutique guitar pedals, tape delays, and physical modeling synths in Faust (Functional Audio Stream) compiled directly to WebAssembly.',
    bullets: [
      '12 Boutique Presets: Lynchian Tape Echo, TB-303 Diode Acid Filter, VHS 1985 Chorus',
      'Live audition test signals (Guitar Riff, Drum Break, Synth Arp)',
      'Prompt-to-Toy live recipe synthesizer powered by GHOST',
    ],
  },
  {
    id: 'lsc_chamber',
    category: 'synthesis',
    title: 'The Large Sonic Collider [LSC-27KM]',
    badge: 'PARTICLE PHYSICS',
    badgeColor: '#ff6b00',
    img: './assets-bg/lab/lsc_chamber.png',
    desc: 'Superconducting 27km particle ring simulating stems as relativistic charged hadrons. Sound particles collide at sub-light speeds to generate new granular soundbeds.',
    bullets: [
      'Relativistic Doppler pitch modulations and quantum sonic fission',
      'Active particle weight & nuance ratio sliders (e.g. Samba 80%, Indie Rock 85%)',
      'Synchronized prompt physics generation for Ace-Step 1.5 & YuE 2.0',
    ],
  },
  {
    id: 'lsc_header',
    category: 'synthesis',
    title: 'LSC Hadron Matrix & Beam Sectors',
    badge: 'BEAM INJECTOR',
    badgeColor: '#ff6b00',
    img: './assets-bg/lab/lsc_header.png',
    desc: 'Multi-sector injection hub controlling particle charge (8.4 Tesla), collision cross-section, and musical style particles.',
    bullets: [
      'Beam A: Genres, Eras & Rhythms (Bossa Nova, Trip Hop, 90s Lo-Fi)',
      'Beam B: Studio Gear & Microphones (Studer A800, Pultec EQP-1A, U47)',
      'Sonic Sector, Lyric Lab, Deconstructor & Archive Vault',
    ],
  },
  {
    id: 'beam_splitter',
    category: 'ai_beams',
    title: 'Beam Splitter & Optical Refractor',
    badge: 'PRISM CHOPPER',
    badgeColor: '#39ff14',
    img: './assets-bg/lab/beam_splitter_optical.png',
    desc: 'Simulates Snell’s Law caustic dispersion across audio wavelengths using a virtual quartz prism (n = 1.544) to slice beats into spectral rays.',
    bullets: [
      'Transient onset detection dividing beats into 16 spectral rays',
      'Spectral Ray Chromatic Pads (Keys 1–8, Q–I) for finger-drumming',
      'Stereo dispersion fan spreading refracted slices across stereo space',
    ],
  },
  {
    id: 'mastering',
    category: 'dsp',
    title: 'Parametric EQ & Mastering Suite',
    badge: 'GOLD PATH MASTERING',
    badgeColor: '#fbbf24',
    img: './assets-bg/lab/parametric_eq_mastering.png',
    desc: '6-stage Gold Path audiophile mastering deck with real-time D3 FFT spectral analysis and AI reference track auto-EQ matching.',
    bullets: [
      'Live FFT Matchering: Drop any reference track to match EQ curve',
      'Level-matched A/B comparison (Processed vs Dry Original)',
      'Broadcast targets: -14 LUFS, -1 dBFS True-Peak limiter',
    ],
  },
  {
    id: 'drum_trigger',
    category: 'dsp',
    title: 'Drum Trigger // Transient-to-MIDI & SFZ',
    badge: 'DRUM TRIGGER',
    badgeColor: '#f43f5e',
    img: './assets-bg/lab/drum_trigger_sfz.png',
    desc: 'Detects Kick, Snare, Hi-Hat, and Tom attack peaks over any audio stem and replaces them with 1-click vintage SFZ drum samples or MIDI.',
    bullets: [
      'Interactive transient detection threshold scope',
      'Internal SFZ Kits: 808 Boom, 909 Vintage Kit, Acoustic Snare',
      'General MIDI Channel 10 mapping and polyphonic MIDI export',
    ],
  },
  {
    id: 'laser_editor',
    category: 'dsp',
    title: 'Laser Audio Editor & Loop Studio',
    badge: 'DSP EDITOR',
    badgeColor: '#00e5ff',
    img: './assets-bg/lab/laser_audio_editor.png',
    desc: 'Precision sample editor with pitch-locked WSOLA time-stretching, Chronopins, loop crossfade studio, and zero-crossing waveform alignment.',
    bullets: [
      'Pitch-locked time stretch from 0.50x to 2.00x speed',
      'Chronopin time-warping anchors for individual words & hits',
      'DSP suite: Fade In/Out, Normalize, Reverse, Polarity Invert, DC Zero',
    ],
  },
  {
    id: 'spectral_splitter',
    category: 'ai_beams',
    title: 'Spectral Wave Splitter & Stem Deck',
    badge: 'HYBRID AI STEMS',
    badgeColor: '#c084fc',
    img: './assets-bg/lab/spectral_wave_splitter.png',
    desc: 'Separates full songs and AI generations into 4 isolated stems powered by Demucs v4 Hybrid + Spotify Basic Pitch neural nets.',
    bullets: [
      'Stems: Vocals, Sub & Synth Bass, Drums & Transients, Synths & Guitars',
      'Per-stem gain, solo, mute, and direct "Transcribe to MIDI"',
      'Batch 1-click Stem ZIP export for remixes or VJ synchronization',
    ],
  },
  {
    id: 'telemetry',
    category: 'dsp',
    title: 'Project Statistics & Mix Telemetry',
    badge: 'TELEMETRY',
    badgeColor: '#39ff14',
    img: './assets-bg/lab/project_statistics_telemetry.png',
    desc: 'Real-time radar telemetry analyzing arrangement density, dynamic range, harmonic saturation, stereo width, and frequency balance.',
    bullets: [
      'Radar complexity index visualizer built on Recharts',
      'Spectral health check alerting to phase issues & harshness',
      'DSP buffer latency & memory consumption telemetry',
    ],
  },
  {
    id: 'guided_workflows',
    category: 'ai_beams',
    title: 'Guided Workflows & Templates',
    badge: 'PRODUCTION TEMPLATES',
    badgeColor: '#fbbf24',
    img: './assets-bg/lab/guided_workflows_templates.png',
    desc: 'Pre-engineered production pipelines guided by GHOST to take ideas from raw prompts to radio-ready mastered tracks.',
    bullets: [
      'The Quantum Alchemist: Prompt -> Collider -> Faust -> Gold Path',
      'Suno De-Glaze: Removes digital crunch & restores dynamic depth',
      'GHOST Mad Scientist: AI mentor offering analog wisdom',
    ],
  },
  {
    id: 'audioarc_bridge',
    category: 'ai_beams',
    title: 'AudioArc & KinetiCUT VJ Bridges',
    badge: 'NETWORK INTEGRATION',
    badgeColor: '#00e5ff',
    img: './assets-bg/lab/audioarc_gemini.jpg',
    desc: 'Direct roundtrip integration across the Strangelet Creative Network for visual music video storyboarding and automated beat-cutting.',
    bullets: [
      'AudioArc: Gemini-powered lyric-to-scene prompts & visual storyboards',
      'Strangelet KinetiCUT: 1-click audio & transient export for beat choreography',
      'Wunderbar!: Hardware groovebox & synth sample import',
    ],
  },
];

export function StrangeletLabShowcase({ onClose, onSwitchToStudio }) {
  const [activeFilter, setActiveFilter] = useState('all');
  const [selectedImage, setSelectedImage] = useState(null);

  const filteredModules = activeFilter === 'all'
    ? MODULES
    : MODULES.filter((m) => m.category === activeFilter);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: '#07070d',
        backgroundImage: `
          radial-gradient(ellipse at 50% 0%, rgba(251, 191, 36, 0.12) 0%, transparent 60%),
          radial-gradient(circle at 10% 30%, rgba(0, 229, 255, 0.06) 0%, transparent 40%),
          radial-gradient(circle at 90% 70%, rgba(255, 107, 0, 0.06) 0%, transparent 45%)
        `,
        zIndex: 9000,
        overflowY: 'auto',
        color: '#e4e4e7',
        fontFamily: "'Space Mono', monospace",
        padding: '24px 20px 80px',
      }}
    >
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        
        {/* Top Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid rgba(251, 191, 36, 0.25)',
            paddingBottom: 16,
            marginBottom: 24,
            flexWrap: 'wrap',
            gap: 12,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <img
              src="./assets-bg/logos/strangelet-lab-logo.jpg"
              alt="Strangelet Lab Seal"
              style={{
                width: 48,
                height: 48,
                borderRadius: '50%',
                border: '2px solid #fbbf24',
                objectFit: 'cover',
                boxShadow: '0 0 18px rgba(251, 191, 36, 0.5)',
              }}
            />
            <div>
              <div
                style={{
                  fontFamily: "'Syncopate', sans-serif",
                  fontSize: 15,
                  fontWeight: 800,
                  letterSpacing: 2,
                  color: '#fbbf24',
                }}
              >
                ⚡ STRANGELET LAB
              </div>
              <div style={{ fontSize: 9.5, color: '#a1a1aa', letterSpacing: 1 }}>
                THE MOTHERSHIP · QUANTUM-ACOUSTIC PRODUCTION WORKSTATION
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <a
              href="https://lordgriefo.github.io/Strangelet-Lab/"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                background: 'rgba(0, 229, 255, 0.15)',
                color: '#00e5ff',
                border: '1px solid #00e5ff',
                borderRadius: 4,
                padding: '7px 14px',
                fontFamily: "'Syncopate', sans-serif",
                fontSize: 8.5,
                fontWeight: 800,
                letterSpacing: 1,
                textDecoration: 'none',
                cursor: 'pointer',
              }}
            >
              ▶ LAUNCH BROWSER BETA
            </a>
            <a
              href="https://github.com/lordgriefo/Strangelet-Lab/releases"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                background: 'linear-gradient(135deg, #fbbf24, #ff6b00)',
                color: '#000',
                borderRadius: 4,
                padding: '7px 14px',
                fontFamily: "'Syncopate', sans-serif",
                fontSize: 8.5,
                fontWeight: 800,
                letterSpacing: 1,
                textDecoration: 'none',
                cursor: 'pointer',
              }}
            >
              💾 DOWNLOAD WINDOWS (.ZIP)
            </a>
            <a
              href="./strangelet-lab.html"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                background: 'rgba(255, 255, 255, 0.08)',
                color: '#e4e4e7',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: 4,
                padding: '7px 14px',
                fontFamily: "'Syncopate', sans-serif",
                fontSize: 8.5,
                fontWeight: 800,
                letterSpacing: 1,
                textDecoration: 'none',
              }}
              title="Open full dedicated landing page in new tab"
            >
              🌐 DEDICATED SITE ↗
            </a>
            {onClose && (
              <button
                onClick={onClose}
                style={{
                  background: 'rgba(244, 63, 94, 0.15)',
                  color: '#f43f5e',
                  border: '1px solid #f43f5e',
                  borderRadius: 4,
                  padding: '7px 14px',
                  fontFamily: "'Syncopate', sans-serif",
                  fontSize: 8.5,
                  fontWeight: 800,
                  letterSpacing: 1,
                  cursor: 'pointer',
                }}
              >
                ✕ CLOSE SHOWCASE
              </button>
            )}
          </div>
        </div>

        {/* Hero Banner */}
        <div style={{ textAlign: 'center', padding: '20px 10px 30px' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              background: 'rgba(255, 107, 0, 0.15)',
              border: '1px solid #ff6b00',
              color: '#ff6b00',
              padding: '4px 14px',
              borderRadius: 20,
              fontSize: 9.5,
              fontWeight: 700,
              letterSpacing: 1.5,
              marginBottom: 14,
            }}
          >
            <span
              style={{
                width: 7,
                height: 7,
                borderRadius: '50%',
                backgroundColor: '#ff6b00',
                boxShadow: '0 0 10px #ff6b00',
              }}
            />
            PUBLIC BETA v2.5.0 — ACTIVELY EVOLVING WORKSTATION
          </div>

          <h1
            style={{
              fontFamily: "'Syncopate', sans-serif",
              fontSize: 'clamp(20px, 3.5vw, 36px)',
              fontWeight: 800,
              letterSpacing: 2,
              color: '#fff',
              marginBottom: 8,
            }}
          >
            THE <span style={{ color: '#fbbf24' }}>MOTHERSHIP</span> PRODUCTION LAB
          </h1>
          <p
            style={{
              fontSize: 12,
              color: '#a1a1aa',
              maxWidth: 780,
              margin: '0 auto 20px',
              fontStyle: 'italic',
            }}
          >
            Quantum-Acoustic Production Workstation & Offline-First Particle Collider DAW.<br />
            Inspired by Georges Méliès (1902), David Lynchian Tape Realism & High-Energy Particle Physics.
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', gap: 10, flexWrap: 'wrap' }}>
            <a
              href="https://lordgriefo.github.io/Strangelet-Lab/"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                background: 'rgba(0, 229, 255, 0.2)',
                color: '#00e5ff',
                border: '1px solid #00e5ff',
                borderRadius: 4,
                padding: '9px 18px',
                fontFamily: "'Syncopate', sans-serif",
                fontSize: 9.5,
                fontWeight: 800,
                letterSpacing: 1,
                textDecoration: 'none',
                boxShadow: '0 0 15px rgba(0, 229, 255, 0.3)',
              }}
            >
              ▶ LAUNCH ZERO-INSTALL WEB BETA
            </a>
            <a
              href="https://github.com/lordgriefo/Strangelet-Lab/releases"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                background: 'linear-gradient(135deg, #fbbf24, #ff6b00)',
                color: '#000',
                border: 'none',
                borderRadius: 4,
                padding: '9px 18px',
                fontFamily: "'Syncopate', sans-serif",
                fontSize: 9.5,
                fontWeight: 800,
                letterSpacing: 1,
                textDecoration: 'none',
                boxShadow: '0 0 15px rgba(251, 191, 36, 0.4)',
              }}
            >
              💾 DOWNLOAD PORTABLE WINDOWS x64 (.ZIP)
            </a>
            <a
              href="https://github.com/lordgriefo/Strangelet-Lab/issues"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                background: 'rgba(255, 255, 255, 0.08)',
                color: '#e4e4e7',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: 4,
                padding: '9px 16px',
                fontFamily: "'Syncopate', sans-serif",
                fontSize: 9,
                fontWeight: 800,
                letterSpacing: 1,
                textDecoration: 'none',
              }}
            >
              🐛 REPORT BETA QUIRKS (GITHUB)
            </a>
          </div>
        </div>

        {/* Notice Box: Kobold.cpp replaces ComfyUI */}
        <div
          style={{
            background: 'linear-gradient(135deg, rgba(57, 255, 20, 0.08), rgba(0, 229, 255, 0.05))',
            border: '1px solid #39ff14',
            borderRadius: 6,
            padding: '16px 20px',
            marginBottom: 35,
            boxShadow: '0 0 20px rgba(57, 255, 20, 0.15)',
          }}
        >
          <div
            style={{
              display: 'inline-block',
              fontFamily: "'Syncopate', sans-serif",
              fontSize: 8.5,
              fontWeight: 800,
              color: '#000',
              backgroundColor: '#39ff14',
              padding: '2px 8px',
              borderRadius: 2,
              marginBottom: 6,
              letterSpacing: 1,
            }}
          >
            SYSTEM UPDATE
          </div>
          <div
            style={{
              fontFamily: "'Syncopate', sans-serif",
              fontSize: 11.5,
              fontWeight: 800,
              color: '#39ff14',
              marginBottom: 6,
              letterSpacing: 1,
            }}
          >
            ⚡ KOBOLD.CPP REPLACES COMFYUI FOR ALL NEURAL MUSIC & AI DIFFUSION
          </div>
          <div style={{ fontSize: 10.5, color: '#d1d5db', lineHeight: 1.6 }}>
            Strangelet Lab has retired ComfyUI in favor of <strong>Kobold.cpp</strong> (<code>http://localhost:5001</code>). 
            Kobold.cpp now serves as the unified, lightweight engine for <strong>ACE-Step 1.5</strong> loop diffusion, 
            <strong>YuE 2.0</strong> full-track synthesis, and offline <strong>GHOST</strong> sensei intelligence through direct REST endpoints 
            (<code>/api/extra/music/prepare</code> and <code>/api/extra/music/generate</code>). 
            Zero complicated node graphs, zero Python dependency hell, lower idle VRAM, and seamless 1-click timeline routing.
          </div>
        </div>

        {/* Filter Navigation */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid rgba(251, 191, 36, 0.2)',
            paddingBottom: 10,
            marginBottom: 20,
            flexWrap: 'wrap',
            gap: 10,
          }}
        >
          <div
            style={{
              fontFamily: "'Syncopate', sans-serif",
              fontSize: 13,
              fontWeight: 800,
              color: '#fbbf24',
              letterSpacing: 1.5,
            }}
          >
            📸 MOTHERSHIP MODULE SHOWCASE ({filteredModules.length})
          </div>

          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {[
              { id: 'all', label: 'ALL MODULES' },
              { id: 'synthesis', label: 'COLLIDER & ARRANGEMENT' },
              { id: 'dsp', label: 'DSP, FAUST & MASTERING' },
              { id: 'ai_beams', label: 'AI STEMS & BEAMS' },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setActiveFilter(f.id)}
                style={{
                  background: activeFilter === f.id ? '#fbbf24' : 'rgba(255,255,255,0.06)',
                  color: activeFilter === f.id ? '#000' : '#e4e4e7',
                  border: `1px solid ${activeFilter === f.id ? '#fbbf24' : 'rgba(255,255,255,0.15)'}`,
                  borderRadius: 3,
                  padding: '4px 10px',
                  fontFamily: "'Syncopate', sans-serif",
                  fontSize: 8,
                  fontWeight: 800,
                  letterSpacing: 1,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Modules Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
            gap: 20,
            marginBottom: 40,
          }}
        >
          {filteredModules.map((m) => (
            <div
              key={m.id}
              style={{
                backgroundColor: 'rgba(15, 15, 26, 0.88)',
                border: '1px solid rgba(251, 191, 36, 0.25)',
                borderRadius: 6,
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                transition: 'all 0.2s ease',
              }}
            >
              <div
                style={{
                  position: 'relative',
                  width: '100%',
                  height: 200,
                  backgroundColor: '#000',
                  cursor: 'pointer',
                }}
                onClick={() => setSelectedImage({ src: m.img, caption: m.title })}
                title="Click to view full-size screenshot"
              >
                <img
                  src={m.img}
                  alt={m.title}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    objectPosition: 'top',
                  }}
                />
                <div
                  style={{
                    position: 'absolute',
                    bottom: 8,
                    right: 8,
                    backgroundColor: 'rgba(0, 0, 0, 0.75)',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    padding: '3px 8px',
                    borderRadius: 3,
                    fontSize: 7.5,
                    fontFamily: "'Syncopate', sans-serif",
                    color: '#fff',
                    pointerEvents: 'none',
                  }}
                >
                  🔍 ZOOM
                </div>
              </div>

              <div style={{ padding: '14px 16px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                <span
                  style={{
                    alignSelf: 'flex-start',
                    fontSize: 7,
                    fontFamily: "'Syncopate', sans-serif",
                    fontWeight: 800,
                    letterSpacing: 1.2,
                    padding: '2px 6px',
                    borderRadius: 3,
                    marginBottom: 8,
                    backgroundColor: `${m.badgeColor}22`,
                    color: m.badgeColor,
                    border: `1px solid ${m.badgeColor}`,
                  }}
                >
                  {m.badge}
                </span>

                <h3
                  style={{
                    fontFamily: "'Syncopate', sans-serif",
                    fontSize: 11,
                    fontWeight: 800,
                    color: '#fff',
                    marginBottom: 6,
                    letterSpacing: 1,
                  }}
                >
                  {m.title}
                </h3>

                <p style={{ fontSize: 10, color: '#a1a1aa', lineHeight: 1.5, marginBottom: 10 }}>
                  {m.desc}
                </p>

                <ul
                  style={{
                    fontSize: 9.5,
                    color: '#cbd5e1',
                    paddingLeft: 16,
                    marginTop: 'auto',
                    lineHeight: 1.4,
                  }}
                >
                  {m.bullets.map((b, i) => (
                    <li key={i} style={{ marginBottom: 3 }}>{b}</li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>

        {/* Global Keyboard Shortcuts Table */}
        <div
          style={{
            backgroundColor: 'rgba(15, 15, 26, 0.88)',
            border: '1px solid rgba(251, 191, 36, 0.25)',
            borderRadius: 6,
            padding: '16px 20px',
            marginBottom: 35,
          }}
        >
          <div
            style={{
              fontFamily: "'Syncopate', sans-serif",
              fontSize: 11.5,
              fontWeight: 800,
              color: '#fbbf24',
              marginBottom: 12,
              letterSpacing: 1,
            }}
          >
            ⌨️ GLOBAL KEYBOARD SHORTCUTS CHEAT SHEET
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 10, fontSize: 10 }}>
            <div><kbd style={{ color: '#00e5ff' }}>Space</kbd> : Play / Pause Master Transport</div>
            <div><kbd style={{ color: '#00e5ff' }}>Tab</kbd> : Toggle Pure Timeline / Mixer</div>
            <div><kbd style={{ color: '#00e5ff' }}>B</kbd> : Flip A/B Mastering Audition</div>
            <div><kbd style={{ color: '#00e5ff' }}>Ctrl + Z / Y</kbd> : Undo / Redo Edits</div>
            <div><kbd style={{ color: '#00e5ff' }}>Ctrl + S</kbd> : Save Project Snapshot (.slp)</div>
            <div><kbd style={{ color: '#00e5ff' }}>1 – 8</kbd> : Recall Mix Snapshots</div>
            <div><kbd style={{ color: '#00e5ff' }}>L</kbd> : Toggle Transport Loop</div>
            <div><kbd style={{ color: '#00e5ff' }}>Alt + G</kbd> : Open GHOST AI Dojo</div>
          </div>
        </div>

        {/* Footer Actions */}
        <div
          style={{
            textAlign: 'center',
            paddingTop: 20,
            borderTop: '1px solid rgba(251, 191, 36, 0.2)',
          }}
        >
          <p style={{ fontSize: 10, color: '#a1a1aa', marginBottom: 12 }}>
            Designed & Developed by <strong>The Strangelet Cybernetics & Audio Division</strong> · Homage to Georges Méliès (1902)
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 12, flexWrap: 'wrap' }}>
            {onClose && (
              <button
                onClick={onClose}
                style={{
                  background: 'linear-gradient(135deg, #fbbf24, #ff6b00)',
                  color: '#000',
                  border: 'none',
                  borderRadius: 4,
                  padding: '8px 18px',
                  fontFamily: "'Syncopate', sans-serif",
                  fontSize: 9,
                  fontWeight: 800,
                  cursor: 'pointer',
                }}
              >
                RETURN TO DRIVE-IN THEATER
              </button>
            )}
            {onSwitchToStudio && (
              <button
                onClick={onSwitchToStudio}
                style={{
                  background: 'rgba(0, 229, 255, 0.15)',
                  color: '#00e5ff',
                  border: '1px solid #00e5ff',
                  borderRadius: 4,
                  padding: '8px 18px',
                  fontFamily: "'Syncopate', sans-serif",
                  fontSize: 9,
                  fontWeight: 800,
                  cursor: 'pointer',
                }}
              >
                OPEN KINETICUT STUDIO
              </button>
            )}
            <a
              href="./strangelet-lab.html"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                background: 'rgba(255, 255, 255, 0.08)',
                color: '#e4e4e7',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: 4,
                padding: '8px 18px',
                fontFamily: "'Syncopate', sans-serif",
                fontSize: 9,
                fontWeight: 800,
                textDecoration: 'none',
              }}
            >
              OPEN FULL STANDALONE SITE ↗
            </a>
          </div>
        </div>

      </div>

      {/* Lightbox Modal */}
      {selectedImage && (
        <div
          onClick={() => setSelectedImage(null)}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.94)',
            zIndex: 10000,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 24,
            backdropFilter: 'blur(8px)',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              position: 'relative',
              maxWidth: '92vw',
              maxHeight: '90vh',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <button
              onClick={() => setSelectedImage(null)}
              style={{
                position: 'absolute',
                top: -36,
                right: 0,
                background: 'none',
                border: 'none',
                color: '#fff',
                fontSize: 24,
                cursor: 'pointer',
                fontFamily: 'monospace',
              }}
            >
              ✕
            </button>
            <img
              src={selectedImage.src}
              alt={selectedImage.caption}
              style={{
                maxWidth: '100%',
                maxHeight: '80vh',
                objectFit: 'contain',
                border: '1px solid #fbbf24',
                borderRadius: 4,
                boxShadow: '0 0 35px rgba(251, 191, 36, 0.45)',
              }}
            />
            <div
              style={{
                marginTop: 12,
                fontFamily: "'Syncopate', sans-serif",
                fontSize: 11,
                color: '#fbbf24',
                textAlign: 'center',
                letterSpacing: 1.5,
              }}
            >
              {selectedImage.caption}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
