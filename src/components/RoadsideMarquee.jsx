// src/components/RoadsideMarquee.jsx
// 🎪 THE INTERZONE DRIVE-IN & TRAVELING SIDESHOW 🎪
// Inspired by Tod Browning's Freaks (1932), dust-bowl medicine shows,
// hand-painted canvas banners, mechanical talkie cinema, and Burroughs cut-ups.

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  KINETO_CUT_URL,
  AUDIO_ARC_URL,
  WUNDERBAR_URL,
  CINE_SAMPLER_URL,
  BUY_ME_A_COFFEE_URL,
  DESKTOP_EXE_DOWNLOAD_URL,
} from '../constants/urls';

// ── 1930s PHONOGRAPH, GENERATOR & CALLIOPE SYNTHESIZER (Pure Web Audio) ─────
class CarnivalAudioEngine {
  constructor() {
    this.ctx = null;
    this.masterGain = null;
    this.noiseNode = null;
    this.crackleTimer = null;
    this.calliopeTimer = null;
    this.generatorOsc = null;
    this.isPlaying = false;
  }

  start() {
    if (this.isPlaying) this.stop();
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      this.ctx = new AudioCtx();

      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = 0.35;
      this.masterGain.connect(this.ctx.destination);

      // 1. Shellac 78 RPM Surface Noise (warm pink noise)
      const bufferSize = this.ctx.sampleRate * 2;
      const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      let b0 = 0, b1 = 0, b2 = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.045;
        b1 = 0.99332 * b1 + white * 0.065;
        b2 = 0.96900 * b2 + white * 0.12;
        output[i] = (b0 + b1 + b2 + white * 0.4) * 0.035;
      }

      this.noiseNode = this.ctx.createBufferSource();
      this.noiseNode.buffer = noiseBuffer;
      this.noiseNode.loop = true;

      // Antique Gramophone Horn Bandpass Filter (350Hz - 2600Hz)
      const hornFilter = this.ctx.createBiquadFilter();
      hornFilter.type = 'bandpass';
      hornFilter.frequency.value = 1120;
      hornFilter.Q.value = 1.6;

      const noiseGain = this.ctx.createGain();
      noiseGain.gain.value = 0.28;

      this.noiseNode.connect(hornFilter);
      hornFilter.connect(noiseGain);
      noiseGain.connect(this.masterGain);
      this.noiseNode.start();

      // 2. Low Gasoline Generator Humming Drone (60Hz desert generator hum)
      this.generatorOsc = this.ctx.createOscillator();
      this.generatorOsc.type = 'triangle';
      this.generatorOsc.frequency.setValueAtTime(58.5, this.ctx.currentTime);
      const genGain = this.ctx.createGain();
      genGain.gain.value = 0.025;
      this.generatorOsc.connect(genGain);
      genGain.connect(this.masterGain);
      this.generatorOsc.start();

      // 3. Needle Dust Pops (78 RPM ~1.3Hz rotation + random grit)
      const playDustPop = () => {
        if (!this.ctx || this.ctx.state === 'closed') return;
        try {
          const osc = this.ctx.createOscillator();
          const popGain = this.ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(450 + Math.random() * 750, this.ctx.currentTime);
          popGain.gain.setValueAtTime(0.06 + Math.random() * 0.08, this.ctx.currentTime);
          popGain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.02);
          osc.connect(popGain);
          popGain.connect(this.masterGain);
          osc.start();
          osc.stop(this.ctx.currentTime + 0.025);
        } catch {}
        const next = Math.random() < 0.45 ? 769 : 120 + Math.random() * 900;
        this.crackleTimer = setTimeout(playDustPop, next);
      };
      playDustPop();

      // 4. Haunting 1930s Carousel Calliope Organ Melody (3/4 time, eerie minor waltz)
      const calliopeNotes = [
        392.00, 329.63, 261.63, 392.00, 329.63, 261.63,
        440.00, 349.23, 293.66, 440.00, 349.23, 293.66,
        493.88, 392.00, 329.63, 493.88, 392.00, 329.63,
        523.25, 440.00, 349.23, 493.88, 392.00, 261.63
      ];
      let step = 0;

      const playCalliopeNote = () => {
        if (!this.ctx || this.ctx.state === 'closed') return;
        try {
          const freq = calliopeNotes[step % calliopeNotes.length];
          const osc = this.ctx.createOscillator();
          const noteGain = this.ctx.createGain();

          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

          noteGain.gain.setValueAtTime(0.0001, this.ctx.currentTime);
          noteGain.gain.exponentialRampToValueAtTime(0.045, this.ctx.currentTime + 0.04);
          noteGain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.44);

          const pipeFilter = this.ctx.createBiquadFilter();
          pipeFilter.type = 'lowpass';
          pipeFilter.frequency.value = 1500;

          osc.connect(pipeFilter);
          pipeFilter.connect(noteGain);
          noteGain.connect(this.masterGain);

          osc.start();
          osc.stop(this.ctx.currentTime + 0.48);
        } catch {}
        step++;
        this.calliopeTimer = setTimeout(playCalliopeNote, 480);
      };
      playCalliopeNote();

      this.isPlaying = true;
    } catch (e) {
      console.warn('[CarnivalAudio] Engine failed to start:', e);
    }
  }

  stop() {
    if (this.crackleTimer) clearTimeout(this.crackleTimer);
    if (this.calliopeTimer) clearTimeout(this.calliopeTimer);
    try {
      if (this.noiseNode) {
        this.noiseNode.stop();
        this.noiseNode.disconnect();
      }
      if (this.generatorOsc) {
        this.generatorOsc.stop();
        this.generatorOsc.disconnect();
      }
      if (this.ctx) this.ctx.close();
    } catch {}
    this.isPlaying = false;
  }
}

// ── SURREALIST BURROUGHS CUT-UP FORTUNES ─────────────────────────────────────
const CARNIVAL_FORTUNES = [
  { text: "“The camera catches what the eye denies at 24 frames per second. Cut on the downbeat, never on the retreat.”", stamp: "CENSOR APPROVED #881" },
  { text: "“Beware the director with clean fingernails. A true montage is spliced with razor blades and warm coffee.”", stamp: "STRANGELET PERMIT #014" },
  { text: "“Strange quark matter detected in track three. The kick drum will bend light around the actor's face.”", stamp: "BASIN LAB VERIFIED" },
  { text: "“An old 16mm reel forgotten in the desert sand will soon reveal your true storyboard arc.”", stamp: "INTERZONE ARCHIVE #1932" },
  { text: "“The cut-up is a machine for predicting the future. Tap pad nine twice before the bass drop arrives.”", stamp: "BURROUGHS CUT-UP BOARD" },
  { text: "“When the celluloid melts in the gate, do not turn away—that is the exact moment the film begins.”", stamp: "NITRATE SAFETY #772" },
  { text: "“A stranger with an Akai MPC will offer you a drum loop. Accept it without hesitation.”", stamp: "CINE-SAMPLER PROTOCOL" },
  { text: "“Tod Browning watches from the projection booth. He approves of your jump cuts.”", stamp: "TOD BROWNING ESTATE" },
];

// ── 16-PAD MPC SHOT LIBRARY SPECIFICATION ────────────────────────────────────
const MPC_PADS_CONFIG = [
  { pad: 16, name: 'WIDE MASTER', desc: 'Establishing desert panorama', color: '#f59e0b', soundFreq: 130, beats: 4 },
  { pad: 15, name: 'CRASH ZOOM', desc: 'Instant 3x snap on kick hit', color: '#ef4444', soundFreq: 180, beats: 1 },
  { pad: 14, name: 'DUTCH TILT', desc: 'Off-axis disorienting angle', color: '#8b5cf6', soundFreq: 220, beats: 2 },
  { pad: 13, name: 'CLOSE LEAD', desc: 'Tight focal portrait crop', color: '#06b6d4', soundFreq: 260, beats: 4 },

  { pad: 12, name: 'WHIP PAN', desc: 'Horizontal motion blur smear', color: '#ec4899', soundFreq: 310, beats: 1 },
  { pad: 11, name: 'LOW ANGLE', desc: 'Heroic ground perspective', color: '#10b981', soundFreq: 360, beats: 4 },
  { pad: 10, name: 'INSERT CUT', desc: 'Macabre object macro detail', color: '#f97316', soundFreq: 410, beats: 2 },
  { pad: 9,  name: 'REACTION', desc: '0.4s shocked observer glance', color: '#3b82f6', soundFreq: 460, beats: 1 },

  { pad: 8,  name: 'SLOW-MO DROP', desc: 'Half-time emulsion glide', color: '#a855f7', soundFreq: 520, beats: 8 },
  { pad: 7,  name: 'DRONE SWEEP', desc: 'Aerial swooping arc', color: '#14b8a6', soundFreq: 580, beats: 8 },
  { pad: 6,  name: 'SILHOUETTE', desc: 'High-contrast backlight', color: '#eab308', soundFreq: 640, beats: 4 },
  { pad: 5,  name: 'OVER SHOULDER', desc: 'Voyeuristic cinema depth', color: '#6366f1', soundFreq: 700, beats: 4 },

  { pad: 4,  name: 'REVERSE FLASH', desc: 'Time-inverted mirror flash', color: '#f43f5e', soundFreq: 780, beats: 2 },
  { pad: 3,  name: 'FOCUS RACK', desc: 'Foreground to background pull', color: '#22c55e', soundFreq: 860, beats: 4 },
  { pad: 2,  name: 'STROBE CHOKE', desc: 'Rapid 1/8 note shutter strobe', color: '#e11d48', soundFreq: 940, beats: 1 },
  { pad: 1,  name: 'STATIC VOID', desc: 'Instant cut to pure blackness', color: '#71717a', soundFreq: 1040, beats: 2 },
];

export function RoadsideMarquee({ onEnterDeck }) {
  const [audioActive, setAudioActive] = useState(false);
  const [activeTab, setActiveTab] = useState('midway'); // 'midway' | 'freaks' | 'mpc'
  const [peepOpen, setPeepOpen] = useState(false);
  const [peepAngle, setPeepAngle] = useState(0);
  const [fortuneIndex, setFortuneIndex] = useState(0);
  const [fortuneOpen, setFortuneOpen] = useState(false);
  const [lastPadTriggered, setLastPadTriggered] = useState(null);
  const [clockTime, setClockTime] = useState('');
  const [barkerSpeaking, setBarkerSpeaking] = useState(false);
  const audioRef = useRef(null);

  // Live Desert Time Clock
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setClockTime(now.toLocaleTimeString('en-US', { hour12: true }));
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  // Initialize Audio
  useEffect(() => {
    audioRef.current = new CarnivalAudioEngine();
    return () => audioRef.current?.stop();
  }, []);

  const toggleCarnivalAudio = () => {
    if (audioActive) {
      audioRef.current?.stop();
      setAudioActive(false);
    } else {
      audioRef.current?.start();
      setAudioActive(true);
    }
  };

  // Barker Megaphone Speech Announcement
  const triggerBarkerSpeech = () => {
    if (barkerSpeaking) return;
    setBarkerSpeaking(true);

    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const phrases = [
        "Hurry, hurry, hurry! Step right up, ladies and gentlemen! See the living celluloid automatons of the Strangelet Basin!",
        "One of us! One of us! Alive on the inside! Witness the mechanical film-chopper and the sixteen-pad cine-sampler!",
        "Ten cents admission! Gaze into the mutoscope and see the strange quark matter bend moving pictures!",
      ];
      const text = phrases[Math.floor(Math.random() * phrases.length)];
      const utter = new SpeechSynthesisUtterance(text);
      utter.rate = 1.05;
      utter.pitch = 0.88;
      utter.onend = () => setBarkerSpeaking(false);
      utter.onerror = () => setBarkerSpeaking(false);
      window.speechSynthesis.speak(utter);
    } else {
      setTimeout(() => setBarkerSpeaking(false), 2500);
    }
  };

  // MPC Pad Trigger with Mechanical Percussion Tone
  const triggerPad = (padItem) => {
    setLastPadTriggered(padItem);
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        const ctx = new AudioCtx();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(padItem.soundFreq, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(padItem.soundFreq * 0.35, ctx.currentTime + 0.12);
        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.14);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.15);
      }
    } catch {}
  };

  const dispenseFortune = () => {
    setFortuneIndex((prev) => (prev + 1) % CARNIVAL_FORTUNES.length);
    setFortuneOpen(true);
  };

  const crankMutoscope = () => {
    setPeepAngle((prev) => prev + 35);
  };

  return (
    <div
      style={{
        width: '100vw',
        height: '100vh',
        backgroundColor: '#090705',
        backgroundImage: `
          radial-gradient(circle at 50% 12%, rgba(217, 119, 6, 0.16) 0%, transparent 65%),
          radial-gradient(circle at 12% 85%, rgba(185, 28, 28, 0.12) 0%, transparent 50%),
          radial-gradient(circle at 88% 85%, rgba(202, 138, 4, 0.12) 0%, transparent 50%),
          linear-gradient(to bottom, #050403 0%, #120e09 45%, #070504 100%)
        `,
        color: '#f5ede3',
        fontFamily: "'Space Mono', 'Special Elite', monospace",
        overflowY: 'auto',
        overflowX: 'hidden',
        position: 'relative',
        boxSizing: 'border-box',
      }}
    >
      {/* ── AGED CELLULOID FILM GRAIN & DUST (CSS) ── */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          pointerEvents: 'none',
          backgroundImage: `
            repeating-linear-gradient(0deg, rgba(0,0,0,0.2) 0px, rgba(0,0,0,0.2) 1px, transparent 1px, transparent 3px),
            radial-gradient(1px 1px at 30px 40px, rgba(245,237,227,0.3), rgba(0,0,0,0)),
            radial-gradient(1.5px 1.5px at 180px 220px, rgba(217,119,6,0.35), rgba(0,0,0,0)),
            radial-gradient(1px 1px at 340px 90px, rgba(245,237,227,0.3), rgba(0,0,0,0)),
            radial-gradient(2px 2px at 600px 300px, rgba(200,100,50,0.25), rgba(0,0,0,0)),
            radial-gradient(1.5px 1.5px at 900px 140px, rgba(245,237,227,0.3), rgba(0,0,0,0))
          `,
          backgroundSize: '100% 100%, 800px 400px, 800px 400px, 800px 400px, 800px 400px, 800px 400px',
          opacity: 0.65,
          zIndex: 1,
        }}
      />

      {/* ── SWAYING EDISON CARNIVAL BULBS STRIP ── */}
      <div
        style={{
          position: 'relative',
          zIndex: 12,
          display: 'flex',
          justifyContent: 'space-around',
          padding: '6px 20px',
          backgroundColor: '#050403',
          borderBottom: '1px solid #443729',
          overflow: 'hidden',
        }}
      >
        {Array.from({ length: 18 }).map((_, i) => (
          <div
            key={i}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <div style={{ width: 1, height: 10, backgroundColor: '#78350f' }} />
            <div
              style={{
                width: 8,
                height: 10,
                borderRadius: '50% 50% 40% 40%',
                backgroundColor: i % 2 === 0 ? '#f59e0b' : '#ea580c',
                boxShadow: i % 2 === 0 ? '0 0 10px #f59e0b, 0 0 18px rgba(245,158,11,0.5)' : '0 0 10px #ea580c, 0 0 18px rgba(234,88,12,0.5)',
                animation: `pulse ${1.4 + (i % 5) * 0.2}s infinite alternate ease-in-out`,
              }}
            />
          </div>
        ))}
      </div>

      {/* ── TOP BARKER CARNIVAL STRIP WITH INSTRUMENTS ── */}
      <div
        style={{
          position: 'relative',
          zIndex: 10,
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '10px 24px',
          borderBottom: '2px solid rgba(217, 119, 6, 0.45)',
          backgroundColor: 'rgba(15, 12, 9, 0.96)',
          backdropFilter: 'blur(8px)',
          gap: 12,
        }}
      >
        {/* Desert Telemetry Instruments */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, fontSize: 10, fontFamily: "'Space Mono', monospace" }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#f59e0b' }}>
            <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', backgroundColor: '#f59e0b', boxShadow: '0 0 8px #f59e0b' }} />
            <strong>DESERT TIME:</strong> {clockTime || '03:15:00 AM'}
          </div>
          <span style={{ color: '#78350f' }}>|</span>
          <span style={{ color: '#d97706' }}>TEMP: 54°F</span>
          <span style={{ color: '#78350f' }}>|</span>
          <span style={{ color: '#ca8a04' }}>GEIGER: 0.04 µSv/h</span>
          <span style={{ color: '#78350f' }}>|</span>
          <span style={{ color: '#ea580c' }}>MILEPOST: 108</span>
        </div>

        {/* View Switcher Tabs */}
        <div style={{ display: 'flex', gap: 6 }}>
          {[
            { id: 'midway', label: '🎪 THE MIDWAY' },
            { id: 'mpc', label: '🎹 16-PAD MPC DECK' },
            { id: 'freaks', label: '🤡 HALL OF ODDITIES' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: '6px 12px',
                fontSize: 10,
                fontWeight: 800,
                fontFamily: "'Syncopate', sans-serif",
                letterSpacing: 1,
                borderRadius: 3,
                cursor: 'pointer',
                border: activeTab === tab.id ? '1px solid #ea580c' : '1px solid #443729',
                backgroundColor: activeTab === tab.id ? '#ea580c' : 'rgba(0,0,0,0.5)',
                color: activeTab === tab.id ? '#fff' : '#c7b8a5',
                transition: 'all 0.15s ease',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Audio Engine & Barker Megaphone */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button
            onClick={triggerBarkerSpeech}
            style={{
              padding: '6px 10px',
              fontSize: 10,
              fontWeight: 800,
              fontFamily: "'Syncopate', sans-serif",
              borderRadius: 3,
              cursor: 'pointer',
              border: barkerSpeaking ? '1px solid #ef4444' : '1px solid #b45309',
              backgroundColor: barkerSpeaking ? 'rgba(239, 68, 68, 0.3)' : 'rgba(180, 83, 9, 0.2)',
              color: barkerSpeaking ? '#fca5a5' : '#fde047',
              boxShadow: barkerSpeaking ? '0 0 12px #ef4444' : 'none',
            }}
          >
            📢 {barkerSpeaking ? 'BARKER SHOUTING...' : 'CALL BARKER'}
          </button>

          <button
            onClick={toggleCarnivalAudio}
            style={{
              padding: '6px 12px',
              fontSize: 10,
              fontWeight: 700,
              fontFamily: 'monospace',
              borderRadius: 3,
              cursor: 'pointer',
              border: audioActive ? '1px solid #d97706' : '1px solid #78350f',
              backgroundColor: audioActive ? 'rgba(217, 119, 6, 0.25)' : 'rgba(0,0,0,0.6)',
              color: audioActive ? '#fef3c7' : '#a8a29e',
              boxShadow: audioActive ? '0 0 12px rgba(217, 119, 6, 0.5)' : 'none',
              transition: 'all 0.15s ease',
            }}
          >
            {audioActive ? '🎺 78-RPM GRAMOPHONE: ON' : '▷ GRAMOPHONE: MUTED'}
          </button>

          <button
            onClick={onEnterDeck}
            style={{
              padding: '6px 14px',
              backgroundColor: '#ff6b00',
              color: '#000',
              fontWeight: 800,
              fontSize: 10,
              fontFamily: "'Syncopate', sans-serif",
              letterSpacing: 1,
              borderRadius: 3,
              border: 'none',
              cursor: 'pointer',
              boxShadow: '0 0 14px rgba(255, 107, 0, 0.65)',
            }}
          >
            ➔ KINETO-CUT DECK
          </button>
        </div>
      </div>

      {/* ── MAIN SIDESHOW CONTAINER ── */}
      <div
        style={{
          position: 'relative',
          zIndex: 10,
          maxWidth: 1280,
          margin: '0 auto',
          padding: '30px 20px 80px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        {/* ── GIANT WEATHERED CANVAS BARKER MARQUEE ── */}
        <div
          style={{
            width: '100%',
            maxWidth: 1140,
            padding: '38px 28px',
            marginBottom: 36,
            borderRadius: 6,
            backgroundColor: '#17120c',
            border: '4px double #b45309',
            boxShadow: `
              0 0 45px rgba(180, 83, 9, 0.35),
              inset 0 0 45px rgba(0, 0, 0, 0.95),
              0 20px 50px rgba(0, 0, 0, 0.9)
            `,
            textAlign: 'center',
            position: 'relative',
            backgroundImage: `repeating-linear-gradient(45deg, rgba(217, 119, 6, 0.03) 0px, rgba(217, 119, 6, 0.03) 10px, transparent 10px, transparent 20px)`,
          }}
        >
          <div style={{ fontSize: 13, letterSpacing: 8, color: '#d97706', marginBottom: 8 }}>
            ✦ ✦ ✦ &nbsp; STEP RIGHT UP! ALIVE ON THE INSIDE! &nbsp; ✦ ✦ ✦
          </div>

          <h1
            style={{
              margin: '0 0 10px',
              fontFamily: "'Bebas Neue', 'Special Elite', sans-serif",
              fontSize: 'clamp(2.6rem, 7vw, 5.2rem)',
              letterSpacing: '12px',
              color: '#fed7aa',
              textShadow: '0 0 24px rgba(234, 88, 12, 0.75), 2px 3px 0px #7c2d12',
              lineHeight: 1,
              textTransform: 'uppercase',
            }}
          >
            THE INTERZONE SIDESHOW
          </h1>

          <div
            style={{
              fontFamily: "'Syncopate', monospace",
              fontSize: 'clamp(0.62rem, 1.2vw, 0.85rem)',
              letterSpacing: '5px',
              color: '#f59e0b',
              textShadow: '0 0 10px rgba(245, 158, 11, 0.6)',
              textTransform: 'uppercase',
              marginBottom: 16,
              fontWeight: 800,
            }}
          >
            TRAVELLING FREAK TENT · MECHANICAL AUTOMATONS · DUST BOWL ODDITIES
          </div>

          <p
            style={{
              maxWidth: 820,
              margin: '0 auto',
              fontSize: 'clamp(0.85rem, 1.2vw, 1.02rem)',
              color: '#d6c7b2',
              lineHeight: 1.65,
              fontStyle: 'italic',
            }}
          >
            “One of us! One of us!” Step past the tattered canvas flaps into the desert traveling fair.
            Behold the mechanical film-cutter that edits to the human pulse, scry your screenplays through the story-oracle,
            roll the fortune bones in the wonder cabinet, and tap cinematic cuts on the 16-pad shot-sampler.
          </p>
        </div>

        {/* ════════════════════════════════════════════════════════════════════
            TAB 1: THE MIDWAY (SIDESHOW BANNERS)
        ════════════════════════════════════════════════════════════════════ */}
        {activeTab === 'midway' && (
          <div
            style={{
              width: '100%',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(330px, 1fr))',
              gap: 26,
              marginBottom: 44,
            }}
          >
            {/* ── BANNER 01: THE KINETO-CUT AUTOMATON ── */}
            <div
              style={{
                borderRadius: 6,
                border: '3px solid #ea580c',
                backgroundColor: '#1b140d',
                boxShadow: '0 0 30px rgba(234, 88, 12, 0.28), inset 0 0 25px rgba(0,0,0,0.85)',
                padding: 24,
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                <span
                  style={{
                    fontFamily: "'Syncopate', sans-serif",
                    fontSize: 9,
                    fontWeight: 800,
                    color: '#fdba74',
                    backgroundColor: 'rgba(234, 88, 12, 0.25)',
                    border: '1px solid #ea580c',
                    padding: '3px 8px',
                    borderRadius: 2,
                    letterSpacing: 2,
                  }}
                >
                  ★ BANNER I · THE AUTOMATON
                </span>
                <span style={{ fontSize: 9, color: '#86efac', fontWeight: 700 }}>
                  ● OPERATING NOW
                </span>
              </div>

              <h2
                style={{
                  margin: '0 0 6px',
                  fontFamily: "'Bebas Neue', sans-serif",
                  fontSize: 32,
                  letterSpacing: 3,
                  color: '#ffedd5',
                  textShadow: '0 0 12px rgba(234, 88, 12, 0.65)',
                }}
              >
                THE KINETO-CUT DECK
              </h2>

              <div style={{ fontSize: 11, color: '#f97316', letterSpacing: 1, fontWeight: 700, marginBottom: 12 }}>
                AUDIO-REACTIVE MECHANICAL FILM-CHOPPER
              </div>

              <p style={{ fontSize: 12, color: '#c7b8a5', lineHeight: 1.6, marginBottom: 16, flex: 1 }}>
                Slices celluloid and AI video clips to the rhythm of the living pulse! Real-time Meyda acoustics, 37 period editing styles (from 1902 Méliès to DMT Hyperspace), 12 Auto-MV Cut profiles, and direct DaVinci & Premiere EDL export.
              </p>

              <div style={{ display: 'flex', gap: 10, marginTop: 'auto' }}>
                <button
                  onClick={onEnterDeck}
                  style={{
                    flex: 1,
                    padding: '12px',
                    backgroundColor: '#ea580c',
                    color: '#fff',
                    fontWeight: 800,
                    fontSize: 11,
                    fontFamily: "'Syncopate', sans-serif",
                    letterSpacing: 1.5,
                    borderRadius: 3,
                    border: 'none',
                    cursor: 'pointer',
                    boxShadow: '0 0 16px rgba(234, 88, 12, 0.6)',
                  }}
                >
                  ⚡ STEP INTO CUTTING DECK ➔
                </button>

                <a
                  href={KINETO_CUT_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Open dedicated Strangelet Kineto-Cut standalone site"
                  style={{
                    padding: '12px 14px',
                    backgroundColor: 'rgba(255, 255, 255, 0.08)',
                    color: '#fff',
                    border: '1px solid rgba(255, 255, 255, 0.25)',
                    borderRadius: 3,
                    fontSize: 11,
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    textDecoration: 'none',
                  }}
                >
                  🌐 SITE ↗
                </a>
              </div>
            </div>

            {/* ── BANNER 02: AUDIO ARC (THE STORY-ORACLE) ── */}
            <div
              style={{
                borderRadius: 6,
                border: '2px solid #0284c7',
                backgroundColor: '#0f1722',
                boxShadow: '0 0 25px rgba(2, 132, 199, 0.25), inset 0 0 25px rgba(0,0,0,0.85)',
                padding: 24,
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                <span
                  style={{
                    fontFamily: "'Syncopate', sans-serif",
                    fontSize: 9,
                    fontWeight: 800,
                    color: '#7dd3fc',
                    backgroundColor: 'rgba(2, 132, 199, 0.25)',
                    border: '1px solid #0284c7',
                    padding: '3px 8px',
                    borderRadius: 2,
                    letterSpacing: 2,
                  }}
                >
                  🎬 BANNER II · SCRIPT-ORACLE
                </span>
                <span style={{ fontSize: 9, color: '#94a3b8' }}>
                  EXTERNAL LOT
                </span>
              </div>

              <h2
                style={{
                  margin: '0 0 6px',
                  fontFamily: "'Bebas Neue', sans-serif",
                  fontSize: 32,
                  letterSpacing: 3,
                  color: '#e0f2fe',
                  textShadow: '0 0 12px rgba(2, 132, 199, 0.65)',
                }}
              >
                AUDIO ARC
              </h2>

              <div style={{ fontSize: 11, color: '#38bdf8', letterSpacing: 1, fontWeight: 700, marginBottom: 12 }}>
                VISUAL STORYBOARD & SCREENPLAY ORACLE
              </div>

              <p style={{ fontSize: 12, color: '#94a3b8', lineHeight: 1.6, marginBottom: 16, flex: 1 }}>
                Peer through the crystal scrying glass before the camera cranks! Dynamic screenplay architecture and shot-by-shot storyboarding tuned specifically for music videos and short narrative films.
              </p>

              <a
                href={AUDIO_ARC_URL}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'block',
                  textAlign: 'center',
                  padding: '12px',
                  backgroundColor: 'transparent',
                  color: '#38bdf8',
                  border: '1px solid #0284c7',
                  fontWeight: 800,
                  fontSize: 11,
                  fontFamily: "'Syncopate', sans-serif",
                  letterSpacing: 1.5,
                  borderRadius: 3,
                  textDecoration: 'none',
                  boxShadow: '0 0 14px rgba(2, 132, 199, 0.3)',
                }}
              >
                LAUNCH AUDIO ARC ↗
              </a>
            </div>

            {/* ── BANNER 03: WUNDERBAR! (THE WONDER CABINET) ── */}
            <div
              style={{
                borderRadius: 6,
                border: '2px solid #9333ea',
                backgroundColor: '#191124',
                boxShadow: '0 0 25px rgba(147, 51, 234, 0.25), inset 0 0 25px rgba(0,0,0,0.85)',
                padding: 24,
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                <span
                  style={{
                    fontFamily: "'Syncopate', sans-serif",
                    fontSize: 9,
                    fontWeight: 800,
                    color: '#d8b4fe',
                    backgroundColor: 'rgba(147, 51, 234, 0.25)',
                    border: '1px solid #9333ea',
                    padding: '3px 8px',
                    borderRadius: 2,
                    letterSpacing: 2,
                  }}
                >
                  🎪 BANNER III · WONDER CABINET
                </span>
                <span style={{ fontSize: 9, color: '#94a3b8' }}>
                  PERCHANCE
                </span>
              </div>

              <h2
                style={{
                  margin: '0 0 6px',
                  fontFamily: "'Bebas Neue', sans-serif",
                  fontSize: 32,
                  letterSpacing: 3,
                  color: '#fae8ff',
                  textShadow: '0 0 12px rgba(147, 51, 234, 0.65)',
                }}
              >
                WUNDERBAR!
              </h2>

              <div style={{ fontSize: 11, color: '#c084fc', letterSpacing: 1, fontWeight: 700, marginBottom: 12 }}>
                DR. PERCHANCE’S PROCEDURAL SCENARIO DICE
              </div>

              <p style={{ fontSize: 12, color: '#cbd5e1', lineHeight: 1.6, marginBottom: 16, flex: 1 }}>
                Roll the fortune bones for impossible plots, bizarre character archetypes, and wild cinematic scenarios. A procedural playground for music video conception when you need creative lightning in a bottle.
              </p>

              <a
                href={WUNDERBAR_URL}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'block',
                  textAlign: 'center',
                  padding: '12px',
                  backgroundColor: 'transparent',
                  color: '#c084fc',
                  border: '1px solid #9333ea',
                  fontWeight: 800,
                  fontSize: 11,
                  fontFamily: "'Syncopate', sans-serif",
                  letterSpacing: 1.5,
                  borderRadius: 3,
                  textDecoration: 'none',
                  boxShadow: '0 0 14px rgba(147, 51, 234, 0.3)',
                }}
              >
                ENTER WUNDERBAR! ↗
              </a>
            </div>

            {/* ── BANNER 04: THE STRANGELET CINE-SAMPLER ── */}
            <div
              style={{
                borderRadius: 6,
                border: '2px solid #ca8a04',
                backgroundColor: '#1a160c',
                boxShadow: '0 0 25px rgba(202, 138, 4, 0.25), inset 0 0 25px rgba(0,0,0,0.85)',
                padding: 24,
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                <span
                  style={{
                    fontFamily: "'Syncopate', sans-serif",
                    fontSize: 9,
                    fontWeight: 800,
                    color: '#fef08a',
                    backgroundColor: 'rgba(202, 138, 4, 0.25)',
                    border: '1px solid #ca8a04',
                    padding: '3px 8px',
                    borderRadius: 2,
                    letterSpacing: 2,
                  }}
                >
                  🎹 BANNER IV · 110-SHOT MPC DECK
                </span>
                <span style={{ fontSize: 9, color: '#facc15', fontWeight: 700 }}>
                  ● LIVE ON PERCHANCE
                </span>
              </div>

              <h2
                style={{
                  margin: '0 0 6px',
                  fontFamily: "'Bebas Neue', sans-serif",
                  fontSize: 32,
                  letterSpacing: 3,
                  color: '#fef9c3',
                  textShadow: '0 0 12px rgba(202, 138, 4, 0.65)',
                }}
              >
                STRANGELET CINE-SAMPLER
              </h2>

              <div style={{ fontSize: 11, color: '#eab308', letterSpacing: 1, fontWeight: 700, marginBottom: 12 }}>
                110-SHOT CINEMATOGRAPHY SAMPLER & TIMELINE
              </div>

              <p style={{ fontSize: 12, color: '#d6c7b2', lineHeight: 1.6, marginBottom: 16, flex: 1 }}>
                The Akai MPC-inspired video sampler and shot deck! Explore 110 cinematography shots (Dolly Zoom, Kubrick Stare, Technicolor 3-Strip, Kuleshov Effect…), Live Sample Assign Mode with beat-length binding, and a linear production arrangement timeline.
              </p>

              <div style={{ display: 'flex', gap: 10, marginTop: 'auto' }}>
                <a
                  href={CINE_SAMPLER_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    flex: 1,
                    textAlign: 'center',
                    padding: '12px',
                    backgroundColor: '#ca8a04',
                    color: '#000',
                    fontWeight: 800,
                    fontSize: 11,
                    fontFamily: "'Syncopate', sans-serif",
                    letterSpacing: 1.5,
                    borderRadius: 3,
                    textDecoration: 'none',
                    boxShadow: '0 0 16px rgba(202, 138, 4, 0.5)',
                  }}
                >
                  🎬 LAUNCH CINE-SAMPLER ↗
                </a>

                <button
                  onClick={() => setActiveTab('mpc')}
                  style={{
                    padding: '12px 14px',
                    backgroundColor: 'rgba(202, 138, 4, 0.18)',
                    color: '#fef08a',
                    border: '1px solid #ca8a04',
                    borderRadius: 3,
                    fontSize: 11,
                    fontWeight: 800,
                    fontFamily: "'Syncopate', sans-serif",
                    cursor: 'pointer',
                  }}
                >
                  🎹 16-PADS ➔
                </button>
              </div>
            </div>

            {/* ── BANNER 05: MADAME STRANGELET'S FORTUNE MACHINE ── */}
            <div
              style={{
                borderRadius: 6,
                border: '2px solid #854d0e',
                backgroundColor: '#18120b',
                boxShadow: '0 0 25px rgba(133, 77, 14, 0.25), inset 0 0 25px rgba(0,0,0,0.85)',
                padding: 24,
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                <span
                  style={{
                    fontFamily: "'Syncopate', sans-serif",
                    fontSize: 9,
                    fontWeight: 800,
                    color: '#fed7aa',
                    backgroundColor: 'rgba(133, 77, 14, 0.25)',
                    border: '1px solid #854d0e',
                    padding: '3px 8px',
                    borderRadius: 2,
                    letterSpacing: 2,
                  }}
                >
                  🔮 BANNER V · ZOLTAR MACHINE
                </span>
                <span style={{ fontSize: 9, color: '#facc15' }}>
                  1¢ COIN-OP
                </span>
              </div>

              <h2
                style={{
                  margin: '0 0 6px',
                  fontFamily: "'Bebas Neue', sans-serif",
                  fontSize: 32,
                  letterSpacing: 3,
                  color: '#fef3c7',
                  textShadow: '0 0 12px rgba(133, 77, 14, 0.65)',
                }}
              >
                MADAME STRANGELET
              </h2>

              <div style={{ fontSize: 11, color: '#f59e0b', letterSpacing: 1, fontWeight: 700, marginBottom: 12 }}>
                MECHANICAL AUTOMATON FORTUNE TELLER
              </div>

              <p style={{ fontSize: 12, color: '#d6c7b2', lineHeight: 1.6, marginBottom: 16, flex: 1 }}>
                Drop a nickel in the slot and receive a surrealist cinema prophecy dredged from the desert subconscious. Directions for editing your next masterpiece.
              </p>

              <button
                onClick={dispenseFortune}
                style={{
                  padding: '12px',
                  backgroundColor: 'rgba(245, 158, 11, 0.2)',
                  color: '#fef08a',
                  border: '1px solid #f59e0b',
                  fontWeight: 800,
                  fontSize: 11,
                  fontFamily: "'Syncopate', sans-serif",
                  letterSpacing: 1.5,
                  borderRadius: 3,
                  cursor: 'pointer',
                  boxShadow: '0 0 14px rgba(245, 158, 11, 0.3)',
                }}
              >
                🔮 DISPENSE CINEMA FORTUNE ➔
              </button>
            </div>

            {/* ── BANNER 06: THE MIDNIGHT PEEP CABINET ── */}
            <div
              style={{
                borderRadius: 6,
                border: '2px solid #e11d48',
                backgroundColor: '#1b0d13',
                boxShadow: '0 0 25px rgba(225, 29, 72, 0.25), inset 0 0 25px rgba(0,0,0,0.85)',
                padding: 24,
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                <span
                  style={{
                    fontFamily: "'Syncopate', sans-serif",
                    fontSize: 9,
                    fontWeight: 800,
                    color: '#fda4af',
                    backgroundColor: 'rgba(225, 29, 72, 0.25)',
                    border: '1px solid #e11d48',
                    padding: '3px 8px',
                    borderRadius: 2,
                    letterSpacing: 2,
                  }}
                >
                  🔞 BANNER VI · ADULTS ONLY
                </span>
                <span style={{ fontSize: 9, color: '#fb7185' }}>
                  25¢ MUTOSCOPE
                </span>
              </div>

              <h2
                style={{
                  margin: '0 0 6px',
                  fontFamily: "'Bebas Neue', sans-serif",
                  fontSize: 32,
                  letterSpacing: 3,
                  color: '#ffe4e6',
                  textShadow: '0 0 12px rgba(225, 29, 72, 0.65)',
                }}
              >
                MIDNIGHT PEEP CABINET
              </h2>

              <div style={{ fontSize: 11, color: '#f43f5e', letterSpacing: 1, fontWeight: 700, marginBottom: 12 }}>
                8MM COIN-OP OPTICAL APERTURE
              </div>

              <p style={{ fontSize: 12, color: '#d6c7b2', lineHeight: 1.6, marginBottom: 16, flex: 1 }}>
                Press your eyes against the brass eyepiece. Crank the handle to behold hypnotic rotating mirages, kaleidoscopic phantasmagoria, and scandalous optical apparitions from the midnight reel.
              </p>

              <button
                onClick={() => setPeepOpen(true)}
                style={{
                  padding: '12px',
                  backgroundColor: 'rgba(225, 29, 72, 0.25)',
                  color: '#fecdd3',
                  border: '1px solid #e11d48',
                  fontWeight: 800,
                  fontSize: 11,
                  fontFamily: "'Syncopate', sans-serif",
                  letterSpacing: 1.5,
                  borderRadius: 3,
                  cursor: 'pointer',
                  boxShadow: '0 0 14px rgba(225, 29, 72, 0.3)',
                }}
              >
                👀 PEEK THROUGH THE APERTURE (25¢) ➔
              </button>
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════════════
            TAB 2: PLAYABLE 16-PAD MPC-SHOT SAMPLER
        ════════════════════════════════════════════════════════════════════ */}
        {activeTab === 'mpc' && (
          <div
            style={{
              width: '100%',
              maxWidth: 960,
              padding: 28,
              borderRadius: 8,
              border: '3px solid #ca8a04',
              backgroundColor: '#16120b',
              boxShadow: '0 0 45px rgba(202, 138, 4, 0.35), inset 0 0 35px rgba(0,0,0,0.92)',
              marginBottom: 44,
            }}
          >
            {/* MPC Top Bar with Backlit LCD Screen */}
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18, gap: 14 }}>
              <div>
                <h2 style={{ margin: 0, fontFamily: "'Bebas Neue', sans-serif", fontSize: 36, color: '#fef08a', letterSpacing: 4 }}>
                  STRANGELET CINE-SAMPLER // HARDWARE UNIT
                </h2>
                <div style={{ fontSize: 11, color: '#ca8a04', fontFamily: "'Syncopate', sans-serif", letterSpacing: 1 }}>
                  16-PAD VELOCITY MATRIX · CINEMATOGRAPHY SHOT BANK
                </div>
              </div>

              {/* Vintage Backlit Green LCD Display */}
              <div
                style={{
                  padding: '8px 14px',
                  borderRadius: 4,
                  backgroundColor: '#051805',
                  border: '2px solid #22c55e',
                  boxShadow: '0 0 12px rgba(34, 197, 94, 0.4), inset 0 0 8px rgba(0,0,0,0.8)',
                  color: '#86efac',
                  fontFamily: "'Space Mono', monospace",
                  fontSize: 11,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 3,
                }}
              >
                <div>
                  BANK A: <strong>{lastPadTriggered ? lastPadTriggered.name : 'STANDBY - TAP PAD'}</strong>
                </div>
                <div style={{ fontSize: 9, opacity: 0.8 }}>
                  BEATS: {lastPadTriggered ? lastPadTriggered.beats : 4} | VEL: 127 | 110 SHOTS LOADED
                </div>
              </div>
            </div>

            {/* 16 Pad Interactive Grid */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: 12,
                marginBottom: 22,
              }}
            >
              {MPC_PADS_CONFIG.map((padItem) => (
                <button
                  key={padItem.pad}
                  onClick={() => triggerPad(padItem)}
                  style={{
                    height: 92,
                    padding: 8,
                    backgroundColor: lastPadTriggered?.name === padItem.name ? padItem.color : '#251c11',
                    color: lastPadTriggered?.name === padItem.name ? '#000' : '#fef08a',
                    border: `2px solid ${padItem.color}`,
                    borderRadius: 4,
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    textAlign: 'left',
                    boxShadow: lastPadTriggered?.name === padItem.name ? `0 0 24px ${padItem.color}` : 'none',
                    transition: 'all 0.08s ease',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, opacity: 0.75 }}>
                    <span>PAD {padItem.pad}</span>
                    <span>{padItem.beats}B</span>
                  </div>
                  <div style={{ fontWeight: 800, fontSize: 11, fontFamily: "'Syncopate', sans-serif", letterSpacing: 0.5 }}>
                    {padItem.name}
                  </div>
                  <div style={{ fontSize: 8, opacity: 0.85, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {padItem.desc}
                  </div>
                </button>
              ))}
            </div>

            {/* MPC Footer Actions */}
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #443729', paddingTop: 16, gap: 10 }}>
              <span style={{ fontSize: 11, color: '#a8a29e' }}>
                Features: Pad Choke Groups · 16 Levels of Velocity · Note Repeat · MIDI Controller Hookup
              </span>
              <div style={{ display: 'flex', gap: 10 }}>
                <a
                  href={CINE_SAMPLER_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    padding: '9px 18px',
                    backgroundColor: '#ca8a04',
                    color: '#000',
                    fontWeight: 800,
                    fontSize: 11,
                    fontFamily: "'Syncopate', sans-serif",
                    borderRadius: 3,
                    textDecoration: 'none',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    boxShadow: '0 0 16px rgba(202, 138, 4, 0.45)',
                  }}
                >
                  🎬 LAUNCH FULL CINE-SAMPLER APP ↗
                </a>
                <button
                  onClick={onEnterDeck}
                  style={{
                    padding: '9px 16px',
                    backgroundColor: 'rgba(255, 255, 255, 0.08)',
                    color: '#fff',
                    border: '1px solid rgba(255, 255, 255, 0.25)',
                    fontWeight: 800,
                    fontSize: 11,
                    fontFamily: "'Syncopate', sans-serif",
                    borderRadius: 3,
                    cursor: 'pointer',
                  }}
                >
                  OPEN KINETO-CUT ➔
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════════════
            TAB 3: THE HALL OF ODDITIES (FREAK SHOW GALLERY)
        ════════════════════════════════════════════════════════════════════ */}
        {activeTab === 'freaks' && (
          <div
            style={{
              width: '100%',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: 22,
              marginBottom: 44,
            }}
          >
            {[
              {
                title: 'HANS THE LIVING FILM-REEL',
                role: 'The 35mm Man',
                desc: 'Born beneath an open nitrate chemical bath. His flesh develops moving images under direct sunlight at 24 FPS.',
                color: '#ea580c',
                icon: '🎞️',
              },
              {
                title: 'MADAME XENOTROPE',
                role: 'The Stroboscopic Clairvoyant',
                desc: 'Blinks at exactly 24 times per second. She perceives the entire universe in discrete, frozen frames.',
                color: '#d97706',
                icon: '👁️',
              },
              {
                title: 'THE BURROUGHS SIAMESE',
                role: 'The Twin Scissors',
                desc: 'Joined at the tape splice. One cuts the past while the other pastes the future into real time.',
                color: '#9333ea',
                icon: '✂️',
              },
              {
                title: 'DR. STRANGELET’S JAR',
                role: 'The Sub-Atomic Quark',
                desc: 'Suspended in heavy water. Rumored to bend the BPM of any phonograph within 50 yards of the tent.',
                color: '#b91c1c',
                icon: '🧪',
              },
              {
                title: 'THE HUMAN OSCILLOSCOPE',
                role: 'The Sine-Wave Oracle',
                desc: 'Speaks only in pure fundamental frequencies. Can tune the carnival calliope by ear from across the desert.',
                color: '#06b6d4',
                icon: '⚡',
              },
              {
                title: 'THE EIGHT-ARMED OPERATOR',
                role: 'The Projection Master',
                desc: 'Can thread four burning nitrate projectors simultaneously while rewinding audio tape with his toes.',
                color: '#10b981',
                icon: '🐙',
              },
            ].map((freak) => (
              <div
                key={freak.title}
                style={{
                  borderRadius: 6,
                  border: `2px solid ${freak.color}`,
                  backgroundColor: '#19130d',
                  padding: 22,
                  display: 'flex',
                  flexDirection: 'column',
                  textAlign: 'center',
                  boxShadow: `0 0 25px rgba(0,0,0,0.85), inset 0 0 20px rgba(0,0,0,0.85)`,
                }}
              >
                <div style={{ fontSize: 46, marginBottom: 8 }}>{freak.icon}</div>
                <h3 style={{ margin: '0 0 4px', fontFamily: "'Bebas Neue', sans-serif", fontSize: 26, letterSpacing: 2, color: '#fef3c7' }}>
                  {freak.title}
                </h3>
                <div style={{ fontSize: 10, color: freak.color, fontFamily: "'Syncopate', sans-serif", fontWeight: 700, marginBottom: 12 }}>
                  {freak.role}
                </div>
                <p style={{ fontSize: 12, color: '#c7b8a5', lineHeight: 1.55, margin: 0 }}>
                  {freak.desc}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* ── PASS THE TIN HAT (SUPPORT FOOTER) ── */}
        <div
          style={{
            width: '100%',
            maxWidth: 860,
            padding: '26px',
            borderRadius: 6,
            border: '2px dashed #b45309',
            backgroundColor: '#15100a',
            textAlign: 'center',
            marginBottom: 32,
            boxShadow: '0 0 30px rgba(0,0,0,0.8)',
          }}
        >
          <div style={{ fontSize: 11, color: '#f59e0b', letterSpacing: 2, marginBottom: 6, fontWeight: 800 }}>
            🎩 PASS THE TIN HAT FOR THE CARNIVAL CREW
          </div>
          <p style={{ fontSize: 12, color: '#c7b8a5', lineHeight: 1.6, maxWidth: 640, margin: '0 auto 16px' }}>
            Keeping the big top standing, the generators humming, and the automatons oiled in the middle of the desert requires coffee and care. Drop a coin in the hat to support independent software!
          </p>
          <a
            href={BUY_ME_A_COFFEE_URL}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '12px 24px',
              backgroundColor: '#d97706',
              color: '#000',
              fontWeight: 800,
              fontSize: 12,
              fontFamily: "'Syncopate', sans-serif",
              letterSpacing: 1.5,
              borderRadius: 3,
              textDecoration: 'none',
              boxShadow: '0 0 18px rgba(217, 119, 6, 0.55)',
            }}
          >
            ☕ BUY ME A COFFEE (magicstatic) ↗
          </a>
        </div>

        {/* ── BOTTOM FINE PRINT ── */}
        <div style={{ textAlign: 'center', fontSize: 11, color: '#78716c', letterSpacing: 1.5 }}>
          THE INTERZONE DRIVE-IN & TRAVELING SIDESHOW · EST. 1932 · ALL RIGHTS BROADCAST
        </div>
      </div>

      {/* ── MADAME STRANGELET'S FORTUNE MODAL ── */}
      {fortuneOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.94)',
            zIndex: 99999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 20,
            backdropFilter: 'blur(8px)',
          }}
          onClick={() => setFortuneOpen(false)}
        >
          <div
            style={{
              maxWidth: 540,
              width: '100%',
              backgroundColor: '#171109',
              border: '3px solid #d97706',
              borderRadius: 6,
              padding: 28,
              boxShadow: '0 0 45px rgba(217, 119, 6, 0.45)',
              textAlign: 'center',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ fontSize: 10, color: '#f59e0b', letterSpacing: 3, fontFamily: "'Syncopate', sans-serif", marginBottom: 10 }}>
              ✦ MADAME STRANGELET SPEAKS ✦
            </div>

            <div style={{ fontSize: 48, marginBottom: 14 }}>🔮</div>

            {/* Perforated Fortune Card */}
            <div
              style={{
                padding: '20px',
                backgroundColor: '#fef3c7',
                color: '#1c1917',
                borderRadius: 4,
                border: '2px dashed #92400e',
                boxShadow: '0 4px 15px rgba(0,0,0,0.5)',
                marginBottom: 20,
              }}
            >
              <div style={{ fontSize: 9, fontWeight: 700, color: '#b45309', letterSpacing: 1.5, marginBottom: 8, textTransform: 'uppercase' }}>
                {CARNIVAL_FORTUNES[fortuneIndex].stamp}
              </div>
              <p style={{ fontSize: 14, fontStyle: 'italic', lineHeight: 1.6, margin: 0 }}>
                {CARNIVAL_FORTUNES[fortuneIndex].text}
              </p>
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <button
                onClick={dispenseFortune}
                style={{
                  flex: 1,
                  padding: '10px',
                  backgroundColor: 'rgba(217, 119, 6, 0.2)',
                  color: '#fef08a',
                  border: '1px solid #d97706',
                  fontWeight: 700,
                  fontSize: 10,
                  fontFamily: "'Syncopate', sans-serif",
                  cursor: 'pointer',
                  borderRadius: 3,
                }}
              >
                DISPENSE ANOTHER ➔
              </button>
              <button
                onClick={() => setFortuneOpen(false)}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#d97706',
                  color: '#000',
                  fontWeight: 800,
                  fontSize: 10,
                  fontFamily: "'Syncopate', sans-serif",
                  border: 'none',
                  cursor: 'pointer',
                  borderRadius: 3,
                }}
              >
                CLOSE
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── 25¢ MUTOSCOPE PEEP HOLE MODAL ── */}
      {peepOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.96)',
            zIndex: 99999,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backdropFilter: 'blur(10px)',
          }}
          onClick={() => setPeepOpen(false)}
        >
          {/* Brass Rim Aperture */}
          <div
            style={{
              width: 340,
              height: 340,
              borderRadius: '50%',
              border: '16px solid #b45309',
              boxShadow: `
                0 0 50px rgba(245, 158, 11, 0.6),
                inset 0 0 60px rgba(0, 0, 0, 0.98),
                0 0 100px rgba(0,0,0,1)
              `,
              overflow: 'hidden',
              position: 'relative',
              backgroundColor: '#000',
              marginBottom: 16,
            }}
          >
            <div
              style={{
                width: '100%',
                height: '100%',
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transform: `rotate(${peepAngle}deg)`,
                filter: 'sepia(0.9) contrast(1.5) brightness(1.15)',
                transition: 'transform 0.15s ease-out',
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  backgroundImage: `
                    repeating-conic-gradient(
                      from 0deg,
                      #000 0deg 20deg,
                      #f59e0b 20deg 40deg,
                      #b91c1c 40deg 60deg,
                      #000 60deg 80deg
                    )
                  `,
                  opacity: 0.88,
                }}
              />
              <div
                style={{
                  width: 140,
                  height: 140,
                  borderRadius: '50%',
                  backgroundColor: '#000',
                  border: '4px solid #f59e0b',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <span style={{ fontSize: 44 }}>👁️</span>
              </div>
            </div>

            <div
              style={{
                position: 'absolute',
                inset: 0,
                backgroundImage: 'repeating-linear-gradient(0deg, rgba(0,0,0,0.45) 0px, rgba(0,0,0,0.45) 2px, transparent 2px, transparent 4px)',
                pointerEvents: 'none',
              }}
            />
          </div>

          {/* Interactive Hand Crank Button */}
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }} onClick={(e) => e.stopPropagation()}>
            <button
              onClick={crankMutoscope}
              style={{
                padding: '10px 18px',
                backgroundColor: '#b45309',
                color: '#fef3c7',
                border: '1px solid #f59e0b',
                fontWeight: 800,
                fontSize: 11,
                fontFamily: "'Syncopate', sans-serif",
                borderRadius: 4,
                cursor: 'pointer',
                boxShadow: '0 0 16px rgba(180, 83, 9, 0.6)',
              }}
            >
              🔄 TURN THE HAND CRANK (CLACK)
            </button>
            <button
              onClick={() => setPeepOpen(false)}
              style={{
                padding: '10px 14px',
                backgroundColor: 'rgba(255,255,255,0.1)',
                color: '#fff',
                border: '1px solid #78350f',
                fontSize: 11,
                cursor: 'pointer',
                borderRadius: 4,
              }}
            >
              ✕ STEP AWAY
            </button>
          </div>

          <div
            style={{
              marginTop: 12,
              fontFamily: "'Syncopate', monospace",
              fontSize: 10,
              letterSpacing: 2,
              color: '#f59e0b',
            }}
          >
            THE 1932 MUTOSCOPE APERTURE · CRANK TO ADVANCE REEL
          </div>
        </div>
      )}
    </div>
  );
}
