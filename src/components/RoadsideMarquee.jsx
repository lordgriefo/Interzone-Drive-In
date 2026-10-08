// src/components/RoadsideMarquee.jsx
// 🎪 THE INTERZONE DRIVE-IN & TRAVELING SIDESHOW 🎪
// A living, breathing simulated multi-dimensional carnival in the deep Mojave Desert.
// Features: 
// 1. 🏜️ Mojave Deep Drive-In (Vegas glow, morphing skies, 1950s speaker box, AM radio)
// 2. 🎪 1930s Tod Browning Sideshow & Midway (calliope, barker megaphone, freaks, cut-up tarot)
// 3. 🛸 Interdimensional Starport & Cosmic Cantina (alien variants, sub-space frequency tuner)
// 4. 🧪 B-Movie Monster Crypt & Mutation Splicer (radioactive green glow, monster DNA fusion)
// 5. 🎯 Midway Games & High-Striker (interactive mallet swing, brass token economy, concession stand)
// 6. 🎹 16-Pad MPC Cine-Sampler Terminal (Akai drum chassis & Perchance shot arranger)
// 7. 🗣️ Living Denizen Dialogue NPC System (branching conversations, typewriter audio, lore)

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  KINETO_CUT_URL,
  AUDIO_ARC_URL,
  WUNDERBAR_URL,
  CINE_SAMPLER_URL,
  BUY_ME_A_COFFEE_URL,
  DESKTOP_EXE_DOWNLOAD_URL,
} from '../constants/urls';
import {
  CARNIVAL_SPACES,
  MOJAVE_BG_PRESETS,
  MOJAVE_RADIO_STATIONS,
  ALL_DENIZENS,
  MONSTER_INGREDIENTS,
  SYNTHESIZED_MONSTERS,
} from '../constants/carnivalLore';
import { carnivalSFX } from '../utils/carnivalAudioEffects';

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

      // 2. Low Gasoline Generator Humming Drone (58.5Hz desert generator)
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

      // 4. Haunting 1930s Carousel Calliope Organ Melody (3/4 time waltz)
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
  // ── Global World State ───────────────────────────────────────────────────
  const [currentSpace, setCurrentSpace] = useState('mojave'); // 'mojave' | 'midway' | 'starport' | 'monsters' | 'arcade' | 'mpc'
  const [tokens, setTokens] = useState(() => {
    return parseInt(localStorage.getItem('iz_carnival_tokens') || '12', 10);
  });
  const [audioActive, setAudioActive] = useState(false);
  const [clockTime, setClockTime] = useState('');
  const [barkerSpeaking, setBarkerSpeaking] = useState(false);
  const [activeDenizen, setActiveDenizen] = useState(null);
  const [activeDialogueStep, setActiveDialogueStep] = useState(null);
  const [typewriterText, setTypewriterText] = useState('');
  const [concessionBuff, setConcessionBuff] = useState(null); // { name, desc, filter }

  // ── Mojave Space State ───────────────────────────────────────────────────
  const [selectedBgIndex, setSelectedBgIndex] = useState(0);
  const [autoCycleBg, setAutoCycleBg] = useState(true);
  const [speakerAudioActive, setSpeakerAudioActive] = useState(false);
  const [selectedRadio, setSelectedRadio] = useState(MOJAVE_RADIO_STATIONS[0]);
  const [radioTuningActive, setRadioTuningActive] = useState(false);
  const [telescopeOpen, setTelescopeOpen] = useState(false);

  // ── Midway Space State ───────────────────────────────────────────────────
  const [peepOpen, setPeepOpen] = useState(false);
  const [peepAngle, setPeepAngle] = useState(0);
  const [fortuneIndex, setFortuneIndex] = useState(0);
  const [fortuneOpen, setFortuneOpen] = useState(false);

  // ── Starport Space State ─────────────────────────────────────────────────
  const [subspaceFreq, setSubspaceFreq] = useState(1420);
  const [interceptedSignal, setInterceptedSignal] = useState(null);

  // ── Monster Crypt State ──────────────────────────────────────────────────
  const [monsterSlotA, setMonsterSlotA] = useState('gillman');
  const [monsterSlotB, setMonsterSlotB] = useState('nosferatu');
  const [synthesizedCreature, setSynthesizedCreature] = useState(null);
  const [isSplicing, setIsSplicing] = useState(false);

  // ── Arcade High-Striker State ────────────────────────────────────────────
  const [strikerPower, setStrikerPower] = useState(40);
  const [strikerResult, setStrikerResult] = useState(null); // { score, text, isBell }
  const [strikerSwinging, setStrikerSwinging] = useState(false);

  // ── MPC State ────────────────────────────────────────────────────────────
  const [lastPadTriggered, setLastPadTriggered] = useState(null);

  const audioRef = useRef(null);
  const radioAudioCtxRef = useRef(null);

  // Persist Tokens
  useEffect(() => {
    localStorage.setItem('iz_carnival_tokens', tokens.toString());
  }, [tokens]);

  const addTokens = (amt) => {
    carnivalSFX.playCoinClink();
    setTokens((prev) => prev + amt);
  };

  const spendTokens = (amt) => {
    if (tokens < amt) {
      alert("You need more brass tokens! Try ringing the bell on the High-Striker or search the dust!");
      return false;
    }
    carnivalSFX.playCoinClink();
    setTokens((prev) => prev - amt);
    return true;
  };

  // Clock Telemetry
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setClockTime(now.toLocaleTimeString('en-US', { hour12: true }));
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  // Audio Engine Lifecycle
  useEffect(() => {
    audioRef.current = new CarnivalAudioEngine();
    return () => {
      audioRef.current?.stop();
      if (radioAudioCtxRef.current) radioAudioCtxRef.current.close().catch(() => {});
    };
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

  // Auto-cycle Mojave backgrounds every 35s
  useEffect(() => {
    if (!autoCycleBg) return;
    const interval = setInterval(() => {
      setSelectedBgIndex((prev) => (prev + 1) % MOJAVE_BG_PRESETS.length);
    }, 35000);
    return () => clearInterval(interval);
  }, [autoCycleBg]);

  // High-Striker Power Meter Oscillation
  useEffect(() => {
    if (currentSpace !== 'arcade' || strikerSwinging) return;
    let dir = 1;
    const timer = setInterval(() => {
      setStrikerPower((prev) => {
        let next = prev + dir * 4;
        if (next >= 100) { next = 100; dir = -1; }
        else if (next <= 5) { next = 5; dir = 1; }
        return next;
      });
    }, 45);
    return () => clearInterval(timer);
  }, [currentSpace, strikerSwinging]);

  // ── BARKER SPEECH SYNTHESIS ───────────────────────────────────────────────
  const triggerBarkerSpeech = () => {
    if (barkerSpeaking) return;
    setBarkerSpeaking(true);

    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const phrases = [
        "Hurry, hurry, hurry! Step right up, ladies and gentlemen! See the living celluloid automatons of the Strangelet Basin!",
        "One of us! One of us! Alive on the inside! Witness the mechanical film-chopper and the sixteen-pad cine-sampler!",
        "Ten cents admission! Gaze into the mutoscope and see the strange quark matter bend moving pictures!",
        "Look yonder toward the Vegas lights! The interdimensional portals are open tonight!",
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

  // ── DRIVE-IN WINDOW SPEAKER RADIO ────────────────────────────────────────
  const toggleSpeakerRadio = () => {
    setSpeakerAudioActive((prev) => {
      const next = !prev;
      carnivalSFX.playRadioTuneChirp();
      return next;
    });
  };

  const selectRadioStation = (st) => {
    setSelectedRadio(st);
    carnivalSFX.playRadioTuneChirp();
    if (st.soundType === 'space') carnivalSFX.playThereminGlide(640);
  };

  // ── HIGH STRIKER MALLET GAME ─────────────────────────────────────────────
  const swingMallet = () => {
    if (strikerSwinging) return;
    if (!spendTokens(1)) return;

    setStrikerSwinging(true);
    carnivalSFX.playMalletSwing();

    setTimeout(() => {
      const score = strikerPower;
      const isBell = score >= 90;
      if (isBell) {
        carnivalSFX.playBellRing();
        addTokens(5);
        setStrikerResult({
          score,
          text: 'DING! DING! DING! YOU RANG THE BRASS BELL! (+5 TOKENS!)',
          isBell: true,
        });
      } else {
        carnivalSFX.playCoinClink();
        setStrikerResult({
          score,
          text: `Score: ${score}/100. Close! Put your back into it next time!`,
          isBell: false,
        });
      }
      setStrikerSwinging(false);
    }, 450);
  };

  // ── SUB-SPACE FREQUENCY TUNER (STARPORT) ──────────────────────────────────
  const handleFreqChange = (newFreq) => {
    setSubspaceFreq(newFreq);
    carnivalSFX.playRadioTuneChirp();
    if (newFreq === 1420) {
      carnivalSFX.playThereminGlide(720);
      setInterceptedSignal({
        source: 'HYDROGEN LINE // PERSEUS ARM',
        data: 'TRANSMISSION DECODED: “THE STRANGELET LAB MOTHERSHIP ORBITS AT 128 BPM. PREPARE TIMELINE REEL.”',
        reward: true,
      });
    } else if (newFreq === 108) {
      carnivalSFX.playThereminGlide(480);
      setInterceptedSignal({
        source: 'INTERZONE BEACON 108.4 MHz',
        data: 'RADAR PING: UNIDENTIFIED RETRO-AEROSPACE FLYING SAUCER APPROACHING MOJAVE SCREEN.',
      });
    } else {
      setInterceptedSignal({
        source: `STATIC SCAN [${newFreq} MHz]`,
        data: 'COSMIC BACKGROUND MICROWAVE RADIATION DETECTED. INTERSTELLAR DUST DRIFT.',
      });
    }
  };

  // ── MONSTER MUTATION SPLICER (LAB) ────────────────────────────────────────
  const runMonsterSplicer = () => {
    if (isSplicing) return;
    if (!spendTokens(2)) return;

    setIsSplicing(true);
    carnivalSFX.playLightningZap();

    setTimeout(() => {
      // Find matching combo or synthesize creative hybrid
      const match = SYNTHESIZED_MONSTERS.find(
        (m) =>
          (m.combo[0] === monsterSlotA && m.combo[1] === monsterSlotB) ||
          (m.combo[0] === monsterSlotB && m.combo[1] === monsterSlotA)
      );

      if (match) {
        setSynthesizedCreature(match);
      } else {
        const itemA = MONSTER_INGREDIENTS.find((i) => i.id === monsterSlotA);
        const itemB = MONSTER_INGREDIENTS.find((i) => i.id === monsterSlotB);
        setSynthesizedCreature({
          name: `${itemA?.name.split(' ')[0].toUpperCase()}-${itemB?.name.split(' ')[0].toUpperCase()} HYBRID`,
          tagline: '“BRED IN THE RADIOACTIVE SANDS OF THE STRANGELET BASIN!”',
          desc: `A terrifying celluloid aberration combining ${itemA?.name} with ${itemB?.name}. Emits audio transients with every step.`,
          statAtk: Math.floor(75 + Math.random() * 24),
          statChaos: Math.floor(80 + Math.random() * 19),
        });
      }
      setIsSplicing(false);
      addTokens(3); // reward for splicing
    }, 1200);
  };

  // ── NPC DIALOGUE SYSTEM ──────────────────────────────────────────────────
  const startDialogue = (denizen) => {
    setActiveDenizen(denizen);
    setActiveDialogueStep(null);
    typewriterAnimate(denizen.greeting);
  };

  const handleSelectDialogueOption = (option) => {
    setActiveDialogueStep(option);
    if (option.reward) addTokens(option.reward);
    typewriterAnimate(option.answer);
  };

  const typewriterAnimate = (fullText) => {
    setTypewriterText('');
    let idx = 0;
    const interval = setInterval(() => {
      idx++;
      setTypewriterText(fullText.slice(0, idx));
      if (idx % 3 === 0) carnivalSFX.playTypewriterTick();
      if (idx >= fullText.length) clearInterval(interval);
    }, 18);
  };

  // ── CONCESSION STAND SNACKS ──────────────────────────────────────────────
  const buyConcession = (snack) => {
    if (!spendTokens(1)) return;
    setConcessionBuff(snack);
    setTimeout(() => setConcessionBuff(null), 20000); // 20s effect
  };

  // ── MPC TRIGGER ──────────────────────────────────────────────────────────
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

  const currentBg = MOJAVE_BG_PRESETS[selectedBgIndex];

  return (
    <div
      style={{
        width: '100vw',
        height: '100vh',
        backgroundColor: '#090705',
        backgroundImage: currentSpace === 'mojave' && currentBg?.path
          ? `linear-gradient(to bottom, rgba(5,4,3,0.35) 0%, rgba(10,8,6,0.85) 100%), url(${currentBg.path})`
          : `
            radial-gradient(circle at 50% 12%, rgba(217, 119, 6, 0.16) 0%, transparent 65%),
            radial-gradient(circle at 12% 85%, rgba(185, 28, 28, 0.12) 0%, transparent 50%),
            radial-gradient(circle at 88% 85%, rgba(202, 138, 4, 0.12) 0%, transparent 50%),
            linear-gradient(to bottom, #050403 0%, #120e09 45%, #070504 100%)
          `,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
        color: '#f5ede3',
        fontFamily: "'Space Mono', 'Special Elite', monospace",
        overflowY: 'auto',
        overflowX: 'hidden',
        position: 'relative',
        boxSizing: 'border-box',
        filter: concessionBuff?.filter || 'none',
        transition: 'filter 0.5s ease',
      }}
    >
      {/* ── AGED CELLULOID FILM GRAIN & DUST OVERLAY ── */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          pointerEvents: 'none',
          backgroundImage: `
            repeating-linear-gradient(0deg, rgba(0,0,0,0.18) 0px, rgba(0,0,0,0.18) 1px, transparent 1px, transparent 3px),
            radial-gradient(1px 1px at 30px 40px, rgba(245,237,227,0.3), rgba(0,0,0,0)),
            radial-gradient(1.5px 1.5px at 180px 220px, rgba(217,119,6,0.35), rgba(0,0,0,0)),
            radial-gradient(1px 1px at 340px 90px, rgba(245,237,227,0.3), rgba(0,0,0,0))
          `,
          opacity: 0.65,
          zIndex: 1,
        }}
      />

      {/* ── SWAYING EDISON FESTIVAL BULBS STRIP ── */}
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
        {Array.from({ length: 20 }).map((_, i) => (
          <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
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

      {/* ── TOP BARKER CARNIVAL STRIP WITH INSTRUMENTS & TOKENS HUD ── */}
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
          backgroundColor: 'rgba(15, 12, 9, 0.94)',
          backdropFilter: 'blur(8px)',
          gap: 12,
        }}
      >
        {/* Telemetry & Tokens HUD */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, fontSize: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#f59e0b' }}>
            <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', backgroundColor: '#f59e0b', boxShadow: '0 0 8px #f59e0b' }} />
            <strong>DESERT TIME:</strong> {clockTime || '03:15:00 AM'}
          </div>
          <span style={{ color: '#78350f' }}>|</span>
          <span style={{ color: '#d97706' }}>TEMP: 54°F</span>
          <span style={{ color: '#78350f' }}>|</span>
          <span style={{ color: '#ca8a04' }}>GEIGER: 0.04 µSv/h</span>
          <span style={{ color: '#78350f' }}>|</span>

          {/* Tokens Pouch */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              backgroundColor: 'rgba(234, 88, 12, 0.2)',
              border: '1px solid #ea580c',
              padding: '4px 10px',
              borderRadius: 4,
              color: '#fef08a',
              fontWeight: 800,
            }}
          >
            <span>🪙 {tokens} BRASS TOKENS</span>
            <button
              onClick={() => addTokens(2)}
              title="Search the desert dust for dropped tokens"
              style={{
                fontSize: 9,
                padding: '2px 6px',
                backgroundColor: '#b45309',
                border: 'none',
                color: '#fff',
                cursor: 'pointer',
                borderRadius: 2,
              }}
            >
              +SEARCH DUST
            </button>
          </div>
        </div>

        {/* Global Soundboard Controls */}
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

      {/* ── REALM / SPACES NAVIGATION STRIP ── */}
      <div
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 20,
          display: 'flex',
          justifyContent: 'center',
          flexWrap: 'wrap',
          gap: 8,
          padding: '10px 16px',
          backgroundColor: 'rgba(9, 7, 5, 0.96)',
          borderBottom: '1px solid #443729',
          backdropFilter: 'blur(10px)',
        }}
      >
        {CARNIVAL_SPACES.map((space) => {
          const isSelected = currentSpace === space.id;
          return (
            <button
              key={space.id}
              onClick={() => {
                carnivalSFX.playCoinClink();
                setCurrentSpace(space.id);
              }}
              style={{
                padding: '8px 16px',
                fontSize: 11,
                fontWeight: 800,
                fontFamily: "'Syncopate', sans-serif",
                letterSpacing: 1,
                borderRadius: 4,
                cursor: 'pointer',
                border: isSelected ? `2px solid ${space.themeColor}` : '1px solid #33271b',
                backgroundColor: isSelected ? space.themeColor : 'rgba(18, 14, 10, 0.8)',
                color: isSelected ? '#000' : '#d6c7b2',
                boxShadow: isSelected ? `0 0 18px ${space.themeColor}` : 'none',
                transition: 'all 0.18s ease',
              }}
            >
              {space.label}
            </button>
          );
        })}
      </div>

      {/* ── CONCESSION SNACK ACTIVE NOTIFICATION ── */}
      {concessionBuff && (
        <div
          style={{
            margin: '10px auto 0',
            maxWidth: 640,
            padding: '8px 16px',
            backgroundColor: 'rgba(234, 88, 12, 0.35)',
            border: '1px solid #ea580c',
            borderRadius: 4,
            textAlign: 'center',
            fontSize: 11,
            color: '#fef08a',
            zIndex: 15,
            position: 'relative',
          }}
        >
          🍿 <strong>ACTIVE CONCESSION EFFECT:</strong> {concessionBuff.name} — {concessionBuff.desc}
        </div>
      )}

      {/* ── MAIN CONTENT CONTAINER ── */}
      <div
        style={{
          position: 'relative',
          zIndex: 10,
          maxWidth: 1280,
          margin: '0 auto',
          padding: '24px 20px 80px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        {/* ════════════════════════════════════════════════════════════════════
            SPACE 1: 🏜️ MOJAVE DEEP DRIVE-IN (VEGAS GLOW & MORPHING SKIES)
        ════════════════════════════════════════════════════════════════════ */}
        {currentSpace === 'mojave' && (
          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            {/* Giant Neon Marquee Sign */}
            <div
              style={{
                width: '100%',
                maxWidth: 1140,
                padding: '34px 28px',
                marginBottom: 28,
                borderRadius: 8,
                backgroundColor: 'rgba(18, 14, 10, 0.88)',
                border: '3px solid #f59e0b',
                boxShadow: `
                  0 0 50px rgba(245, 158, 11, 0.35),
                  inset 0 0 40px rgba(0, 0, 0, 0.95)
                `,
                textAlign: 'center',
                position: 'relative',
                backdropFilter: 'blur(6px)',
              }}
            >
              <div style={{ fontSize: 12, letterSpacing: 6, color: '#f59e0b', marginBottom: 6 }}>
                ✦ ✦ ✦ &nbsp; MOJAVE HIGHWAY MILEPOST 108 &nbsp; ✦ ✦ ✦
              </div>

              <h1
                style={{
                  margin: '0 0 8px',
                  fontFamily: "'Bebas Neue', sans-serif",
                  fontSize: 'clamp(2.8rem, 8vw, 5.8rem)',
                  letterSpacing: '14px',
                  color: '#fef08a',
                  textShadow: '0 0 28px rgba(245, 158, 11, 0.85), 2px 3px 0px #78350f',
                  lineHeight: 1,
                  textTransform: 'uppercase',
                }}
              >
                INTERZONE DRIVE-IN
              </h1>

              <div
                style={{
                  fontFamily: "'Syncopate', sans-serif",
                  fontSize: 'clamp(0.65rem, 1.2vw, 0.9rem)',
                  letterSpacing: '5px',
                  color: '#38bdf8',
                  textShadow: '0 0 12px rgba(56, 189, 248, 0.7)',
                  textTransform: 'uppercase',
                  marginBottom: 16,
                  fontWeight: 800,
                }}
              >
                UNDER THE TWO MOONS · LAS VEGAS STRIP GLOW IN THE DISTANCE
              </div>

              <p
                style={{
                  maxWidth: 820,
                  margin: '0 auto',
                  fontSize: 'clamp(0.85rem, 1.2vw, 1.02rem)',
                  color: '#e5e5e5',
                  lineHeight: 1.65,
                  fontStyle: 'italic',
                }}
              >
                Park your car in the desert sand beneath the giant projection tower.
                The Las Vegas neon strip flickers like a distant mirage across the salt flats,
                celestial planets morph into Sumerian sigils, and the window speaker box hums with 1950s drive-in intermission audio.
              </p>
            </div>

            {/* Mojave Interactive Dashboard: Scene Selector + Drive-In Speaker + AM Radio */}
            <div
              style={{
                width: '100%',
                maxWidth: 1140,
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                gap: 22,
                marginBottom: 36,
              }}
            >
              {/* Box 1: Desert Scene Shifter */}
              <div
                style={{
                  padding: 22,
                  borderRadius: 6,
                  border: '2px solid #b45309',
                  backgroundColor: 'rgba(15, 12, 9, 0.9)',
                  boxShadow: '0 0 20px rgba(0,0,0,0.8)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <span style={{ fontSize: 10, fontFamily: "'Syncopate', sans-serif", color: '#f59e0b', fontWeight: 800 }}>
                    🌄 DESERT VISTA PRESETS
                  </span>
                  <button
                    onClick={() => setAutoCycleBg((v) => !v)}
                    style={{
                      fontSize: 9,
                      padding: '3px 8px',
                      backgroundColor: autoCycleBg ? '#15803d' : '#443729',
                      border: 'none',
                      color: '#fff',
                      borderRadius: 3,
                      cursor: 'pointer',
                    }}
                  >
                    {autoCycleBg ? 'AUTO-DRIFT: ON' : 'AUTO-DRIFT: PAUSED'}
                  </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 220, overflowY: 'auto' }}>
                  {MOJAVE_BG_PRESETS.map((preset, idx) => (
                    <button
                      key={preset.id}
                      onClick={() => {
                        setSelectedBgIndex(idx);
                        carnivalSFX.playCoinClink();
                      }}
                      style={{
                        padding: '8px 10px',
                        textAlign: 'left',
                        backgroundColor: selectedBgIndex === idx ? 'rgba(245, 158, 11, 0.25)' : 'rgba(0,0,0,0.5)',
                        border: selectedBgIndex === idx ? '1px solid #f59e0b' : '1px solid #33271b',
                        color: selectedBgIndex === idx ? '#fef08a' : '#c7b8a5',
                        borderRadius: 3,
                        cursor: 'pointer',
                        fontSize: 11,
                        display: 'flex',
                        justifyContent: 'space-between',
                      }}
                    >
                      <span>{preset.name}</span>
                      <span style={{ fontSize: 9, opacity: 0.7 }}>[{preset.id}]</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Box 2: Window Speaker Box (Authentic Intermission Audio) */}
              <div
                style={{
                  padding: 22,
                  borderRadius: 6,
                  border: '2px solid #ca8a04',
                  backgroundColor: 'rgba(15, 12, 9, 0.9)',
                  boxShadow: '0 0 20px rgba(0,0,0,0.8)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                }}
              >
                <div>
                  <div style={{ fontSize: 10, fontFamily: "'Syncopate', sans-serif", color: '#fef08a', fontWeight: 800, marginBottom: 8 }}>
                    🔊 WINDOW DRIVE-IN SPEAKER BOX
                  </div>
                  <p style={{ fontSize: 11, color: '#c7b8a5', lineHeight: 1.5, margin: '0 0 14px' }}>
                    Heavy cast-aluminum speaker clamped over your door glass. Emits authentic 1950s drive-in intermission jingles and desert wind.
                  </p>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <button
                    onClick={toggleSpeakerRadio}
                    style={{
                      padding: '12px',
                      backgroundColor: speakerAudioActive ? '#ca8a04' : 'rgba(202, 138, 4, 0.2)',
                      color: speakerAudioActive ? '#000' : '#fef08a',
                      border: '1px solid #ca8a04',
                      fontWeight: 800,
                      fontSize: 11,
                      fontFamily: "'Syncopate', sans-serif",
                      borderRadius: 4,
                      cursor: 'pointer',
                      boxShadow: speakerAudioActive ? '0 0 16px #ca8a04' : 'none',
                    }}
                  >
                    {speakerAudioActive ? '◼ POWER OFF SPEAKER' : '▶ CLAMP & ACTIVATE SPEAKER'}
                  </button>

                  <button
                    onClick={() => setTelescopeOpen(true)}
                    style={{
                      padding: '8px',
                      backgroundColor: 'rgba(255,255,255,0.08)',
                      border: '1px solid #78350f',
                      color: '#fed7aa',
                      fontSize: 10,
                      cursor: 'pointer',
                      borderRadius: 4,
                    }}
                  >
                    🔭 SURVEY THE VEGAS MIRAGE WITH BINOCULARS
                  </button>
                </div>
              </div>

              {/* Box 3: Mojave AM Radio Receiver */}
              <div
                style={{
                  padding: 22,
                  borderRadius: 6,
                  border: '2px solid #38bdf8',
                  backgroundColor: 'rgba(15, 12, 9, 0.9)',
                  boxShadow: '0 0 20px rgba(0,0,0,0.8)',
                }}
              >
                <div style={{ fontSize: 10, fontFamily: "'Syncopate', sans-serif", color: '#38bdf8', fontWeight: 800, marginBottom: 8 }}>
                  📻 MOJAVE AM RADIO TUNER
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {MOJAVE_RADIO_STATIONS.map((st) => (
                    <button
                      key={st.freq}
                      onClick={() => selectRadioStation(st)}
                      style={{
                        padding: '6px 10px',
                        textAlign: 'left',
                        backgroundColor: selectedRadio.freq === st.freq ? 'rgba(56, 189, 248, 0.25)' : 'rgba(0,0,0,0.5)',
                        border: selectedRadio.freq === st.freq ? '1px solid #38bdf8' : '1px solid #233446',
                        color: selectedRadio.freq === st.freq ? '#bae6fd' : '#94a3b8',
                        borderRadius: 3,
                        cursor: 'pointer',
                        fontSize: 10,
                      }}
                    >
                      <strong>{st.freq}</strong>: {st.name}
                    </button>
                  ))}
                </div>

                <div style={{ marginTop: 10, padding: 8, backgroundColor: 'rgba(0,0,0,0.6)', borderRadius: 3, fontSize: 9, color: '#38bdf8' }}>
                  {selectedRadio.desc}
                </div>
              </div>
            </div>

            {/* Launch Deck Banner */}
            <div
              style={{
                width: '100%',
                maxWidth: 1140,
                padding: 20,
                backgroundColor: 'rgba(234, 88, 12, 0.15)',
                border: '2px dashed #ea580c',
                borderRadius: 6,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: 12,
              }}
            >
              <div>
                <div style={{ fontWeight: 800, fontSize: 13, color: '#fed7aa', fontFamily: "'Syncopate', sans-serif" }}>
                  READY TO EDIT TO THE BEAT?
                </div>
                <div style={{ fontSize: 11, color: '#d6c7b2' }}>
                  Launch Strangelet Kineto-Cut to chop video reels, align puppet mouth shapes, and score directly to audio.
                </div>
              </div>
              <button
                onClick={onEnterDeck}
                style={{
                  padding: '12px 24px',
                  backgroundColor: '#ea580c',
                  color: '#000',
                  fontWeight: 900,
                  fontSize: 12,
                  fontFamily: "'Syncopate', sans-serif",
                  border: 'none',
                  borderRadius: 4,
                  cursor: 'pointer',
                  boxShadow: '0 0 20px #ea580c',
                }}
              >
                ENTER KINETO-CUT DECK ➔
              </button>
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════════════
            SPACE 2: 🎪 1930s TOD BROWNING FREAKS MIDWAY & SIDESHOW
        ════════════════════════════════════════════════════════════════════ */}
        {currentSpace === 'midway' && (
          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            {/* Sideshow Banners Grid */}
            <div
              style={{
                width: '100%',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(330px, 1fr))',
                gap: 26,
                marginBottom: 44,
              }}
            >
              {/* Banner 1: The Kineto-Cut Automaton */}
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
                  <span style={{ fontSize: 9, fontWeight: 800, color: '#fca5a5', backgroundColor: 'rgba(239, 68, 68, 0.25)', border: '1px solid #ef4444', padding: '3px 8px', borderRadius: 2 }}>
                    📽️ BANNER I · THE AUTOMATON
                  </span>
                  <span style={{ fontSize: 9, color: '#ea580c' }}>NOW SHOWING</span>
                </div>
                <h2 style={{ margin: '0 0 6px', fontFamily: "'Bebas Neue', sans-serif", fontSize: 32, letterSpacing: 3, color: '#fef08a' }}>
                  THE KINETO-CUT CHOPPER
                </h2>
                <div style={{ fontSize: 11, color: '#ea580c', fontWeight: 700, marginBottom: 12 }}>
                  AUDIO-REACTIVE EDITING SYNTHESIZER
                </div>
                <p style={{ fontSize: 12, color: '#d6c7b2', lineHeight: 1.6, marginBottom: 16, flex: 1 }}>
                  Watch as 35mm film strips are sliced and diced by an automated pneumatic mechanism that dances directly to sub-bass drops and transient peaks.
                </p>
                <button
                  onClick={onEnterDeck}
                  style={{
                    padding: '12px',
                    backgroundColor: '#ea580c',
                    color: '#000',
                    border: 'none',
                    fontWeight: 800,
                    fontSize: 11,
                    fontFamily: "'Syncopate', sans-serif",
                    borderRadius: 3,
                    cursor: 'pointer',
                    boxShadow: '0 0 14px rgba(234, 88, 12, 0.5)',
                  }}
                >
                  ENTER THE CHOPPER DECK ➔
                </button>
              </div>

              {/* Banner 2: Strangelet Cine-Sampler */}
              <div
                style={{
                  borderRadius: 6,
                  border: '3px solid #ca8a04',
                  backgroundColor: '#16120b',
                  boxShadow: '0 0 30px rgba(202, 138, 4, 0.28), inset 0 0 25px rgba(0,0,0,0.85)',
                  padding: 24,
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                  <span style={{ fontSize: 9, fontWeight: 800, color: '#fef08a', backgroundColor: 'rgba(202, 138, 4, 0.25)', border: '1px solid #ca8a04', padding: '3px 8px', borderRadius: 2 }}>
                    🎹 BANNER II · 110-SHOT SAMPLER
                  </span>
                  <span style={{ fontSize: 9, color: '#ca8a04' }}>PERCHANCE APP</span>
                </div>
                <h2 style={{ margin: '0 0 6px', fontFamily: "'Bebas Neue', sans-serif", fontSize: 32, letterSpacing: 3, color: '#fef08a' }}>
                  STRANGELET CINE-SAMPLER
                </h2>
                <div style={{ fontSize: 11, color: '#ca8a04', fontWeight: 700, marginBottom: 12 }}>
                  16-PAD AKAI CINEMATOGRAPHY ARRANGER
                </div>
                <p style={{ fontSize: 12, color: '#d6c7b2', lineHeight: 1.6, marginBottom: 16, flex: 1 }}>
                  An Akai MPC-inspired 16-pad drum machine and timeline arranger loaded with 110 cinematography shots (Dutch tilts, crash zooms, low angles).
                </p>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    onClick={() => setCurrentSpace('mpc')}
                    style={{
                      flex: 1,
                      padding: '12px',
                      backgroundColor: '#ca8a04',
                      color: '#000',
                      border: 'none',
                      fontWeight: 800,
                      fontSize: 10,
                      fontFamily: "'Syncopate', sans-serif",
                      borderRadius: 3,
                      cursor: 'pointer',
                    }}
                  >
                    PLAY MPC DECK ➔
                  </button>
                  <a
                    href={CINE_SAMPLER_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      padding: '12px',
                      backgroundColor: 'rgba(255,255,255,0.08)',
                      color: '#fef08a',
                      border: '1px solid #ca8a04',
                      fontWeight: 800,
                      fontSize: 10,
                      fontFamily: "'Syncopate', sans-serif",
                      borderRadius: 3,
                      textDecoration: 'none',
                      display: 'flex',
                      alignItems: 'center',
                    }}
                  >
                    APP ↗
                  </a>
                </div>
              </div>

              {/* Banner 3: Madame Strangelet's Cut-Up Oracle */}
              <div
                style={{
                  borderRadius: 6,
                  border: '3px solid #9333ea',
                  backgroundColor: '#140c1b',
                  boxShadow: '0 0 30px rgba(147, 51, 234, 0.28), inset 0 0 25px rgba(0,0,0,0.85)',
                  padding: 24,
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                  <span style={{ fontSize: 9, fontWeight: 800, color: '#e9d5ff', backgroundColor: 'rgba(147, 51, 234, 0.25)', border: '1px solid #9333ea', padding: '3px 8px', borderRadius: 2 }}>
                    🔮 BANNER III · STORY ORACLE
                  </span>
                  <span style={{ fontSize: 9, color: '#c084fc' }}>1 TOKEN</span>
                </div>
                <h2 style={{ margin: '0 0 6px', fontFamily: "'Bebas Neue', sans-serif", fontSize: 32, letterSpacing: 3, color: '#f3e8ff' }}>
                  THE CUT-UP TAROT
                </h2>
                <div style={{ fontSize: 11, color: '#a855f7', fontWeight: 700, marginBottom: 12 }}>
                  WILLIAM S. BURROUGHS PROPHECIES
                </div>
                <p style={{ fontSize: 12, color: '#d6c7b2', lineHeight: 1.6, marginBottom: 16, flex: 1 }}>
                  Deposit a brass token into the slot. The mechanical arm slices three newspapers from 1959 and dispenses a stamped screenplay prophecy.
                </p>
                <button
                  onClick={() => {
                    if (spendTokens(1)) {
                      setFortuneIndex((prev) => (prev + 1) % 8);
                      setFortuneOpen(true);
                    }
                  }}
                  style={{
                    padding: '12px',
                    backgroundColor: '#9333ea',
                    color: '#fff',
                    border: 'none',
                    fontWeight: 800,
                    fontSize: 11,
                    fontFamily: "'Syncopate', sans-serif",
                    borderRadius: 3,
                    cursor: 'pointer',
                  }}
                >
                  DISPENSE FORTUNE CARD (🪙 1) ➔
                </button>
              </div>

              {/* Banner 4: 25¢ Midnight Mutoscope */}
              <div
                style={{
                  borderRadius: 6,
                  border: '3px solid #e11d48',
                  backgroundColor: '#190a10',
                  boxShadow: '0 0 30px rgba(225, 29, 72, 0.28), inset 0 0 25px rgba(0,0,0,0.85)',
                  padding: 24,
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                  <span style={{ fontSize: 9, fontWeight: 800, color: '#fda4af', backgroundColor: 'rgba(225, 29, 72, 0.25)', border: '1px solid #e11d48', padding: '3px 8px', borderRadius: 2 }}>
                    🔞 BANNER IV · OPTICAL PEEP
                  </span>
                  <span style={{ fontSize: 9, color: '#fb7185' }}>1 TOKEN</span>
                </div>
                <h2 style={{ margin: '0 0 6px', fontFamily: "'Bebas Neue', sans-serif", fontSize: 32, letterSpacing: 3, color: '#ffe4e6' }}>
                  MIDNIGHT PEEP CABINET
                </h2>
                <div style={{ fontSize: 11, color: '#f43f5e', fontWeight: 700, marginBottom: 12 }}>
                  1932 BRASS MUTOSCOPE CRANK
                </div>
                <p style={{ fontSize: 12, color: '#d6c7b2', lineHeight: 1.6, marginBottom: 16, flex: 1 }}>
                  Press your eyes against the brass rim eyepiece. Turn the handle to view hypnotic rotating kaleidoscope mirages and secret optical apparitions.
                </p>
                <button
                  onClick={() => {
                    if (spendTokens(1)) setPeepOpen(true);
                  }}
                  style={{
                    padding: '12px',
                    backgroundColor: 'rgba(225, 29, 72, 0.25)',
                    color: '#fecdd3',
                    border: '1px solid #e11d48',
                    fontWeight: 800,
                    fontSize: 11,
                    fontFamily: "'Syncopate', sans-serif",
                    borderRadius: 3,
                    cursor: 'pointer',
                  }}
                >
                  PEEK THROUGH APERTURE (🪙 1) ➔
                </button>
              </div>
            </div>

            {/* Sideshow Freak Characters Gallery */}
            <div style={{ width: '100%', marginBottom: 36 }}>
              <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 36, letterSpacing: 3, color: '#f59e0b', textAlign: 'center', marginBottom: 20 }}>
                🎪 DENIZENS OF THE SIDESHOW TENT
              </h2>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                  gap: 20,
                }}
              >
                {ALL_DENIZENS.filter((d) => d.space === 'midway').map((denizen) => (
                  <div
                    key={denizen.id}
                    style={{
                      borderRadius: 6,
                      border: `2px solid ${denizen.color}`,
                      backgroundColor: '#19130d',
                      padding: 20,
                      display: 'flex',
                      flexDirection: 'column',
                      textAlign: 'center',
                    }}
                  >
                    <div style={{ fontSize: 44, marginBottom: 8 }}>{denizen.icon}</div>
                    <h3 style={{ margin: '0 0 4px', fontFamily: "'Bebas Neue', sans-serif", fontSize: 24, color: '#fef3c7' }}>
                      {denizen.name}
                    </h3>
                    <div style={{ fontSize: 10, color: denizen.color, fontWeight: 700, marginBottom: 10 }}>
                      {denizen.title}
                    </div>
                    <p style={{ fontSize: 11, color: '#c7b8a5', lineHeight: 1.5, margin: '0 0 14px', flex: 1 }}>
                      {denizen.bio}
                    </p>
                    <button
                      onClick={() => startDialogue(denizen)}
                      style={{
                        padding: '9px',
                        backgroundColor: denizen.color,
                        color: '#000',
                        fontWeight: 800,
                        fontSize: 10,
                        fontFamily: "'Syncopate', sans-serif",
                        borderRadius: 3,
                        border: 'none',
                        cursor: 'pointer',
                      }}
                    >
                      🗣️ TALK TO {denizen.name.split(' ')[0]} ➔
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════════════
            SPACE 3: 🛸 INTERDIMENSIONAL STARPORT & COSMIC CANTINA
        ════════════════════════════════════════════════════════════════════ */}
        {currentSpace === 'starport' && (
          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            {/* Starport Header */}
            <div
              style={{
                width: '100%',
                maxWidth: 1140,
                padding: '28px',
                marginBottom: 28,
                borderRadius: 8,
                backgroundColor: 'rgba(6, 25, 36, 0.92)',
                border: '3px solid #06b6d4',
                boxShadow: '0 0 40px rgba(6, 182, 212, 0.35)',
                textAlign: 'center',
              }}
            >
              <h1 style={{ margin: '0 0 8px', fontFamily: "'Bebas Neue', sans-serif", fontSize: 48, letterSpacing: 8, color: '#67e8f9' }}>
                INTERDIMENSIONAL STARPORT & CANTINA
              </h1>
              <div style={{ fontSize: 11, color: '#38bdf8', fontFamily: "'Syncopate', sans-serif", letterSpacing: 3, marginBottom: 12 }}>
                COSMIC CROSSROAD · ALIEN EMISSARIES · SUB-SPACE FREQUENCIES
              </div>
              <p style={{ maxWidth: 780, margin: '0 auto', fontSize: 13, color: '#cffafe', fontStyle: 'italic' }}>
                Where outer space probes land to trade star charts for 16mm celluloid footage.
                Tune your sub-space radio dial to intercept extraterrestrial signals or speak directly with the alien visitors.
              </p>
            </div>

            {/* Sub-Space Frequency Receiver Station */}
            <div
              style={{
                width: '100%',
                maxWidth: 1140,
                padding: 24,
                borderRadius: 6,
                border: '2px solid #0891b2',
                backgroundColor: 'rgba(8, 20, 30, 0.95)',
                marginBottom: 36,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, flexWrap: 'wrap', gap: 10 }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 800, color: '#67e8f9', fontFamily: "'Syncopate', sans-serif" }}>
                    📡 SUB-SPACE FREQUENCY RECEIVER
                  </div>
                  <div style={{ fontSize: 11, color: '#94a3b8' }}>
                    Current Frequency: <strong>{subspaceFreq} MHz</strong>
                  </div>
                </div>

                {/* Quick Frequency Buttons */}
                <div style={{ display: 'flex', gap: 8 }}>
                  {[
                    { freq: 1420, label: '1420 MHz (Hydrogen Line)' },
                    { freq: 108, label: '108.4 MHz (Beacon)' },
                    { freq: 50, label: '50.8 MHz (Drone)' },
                  ].map((b) => (
                    <button
                      key={b.freq}
                      onClick={() => handleFreqChange(b.freq)}
                      style={{
                        padding: '6px 12px',
                        backgroundColor: subspaceFreq === b.freq ? '#06b6d4' : 'rgba(0,0,0,0.5)',
                        color: subspaceFreq === b.freq ? '#000' : '#bae6fd',
                        border: '1px solid #06b6d4',
                        borderRadius: 3,
                        fontSize: 10,
                        cursor: 'pointer',
                        fontWeight: 700,
                      }}
                    >
                      {b.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Intercepted Signal Display */}
              {interceptedSignal && (
                <div
                  style={{
                    padding: 14,
                    backgroundColor: 'rgba(6, 182, 212, 0.15)',
                    border: '1px solid #06b6d4',
                    borderRadius: 4,
                    fontSize: 11,
                    color: '#cffafe',
                  }}
                >
                  <strong style={{ color: '#67e8f9' }}>[{interceptedSignal.source}]:</strong> {interceptedSignal.data}
                </div>
              )}
            </div>

            {/* Alien Denizens Grid */}
            <div
              style={{
                width: '100%',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                gap: 20,
              }}
            >
              {ALL_DENIZENS.filter((d) => d.space === 'starport').map((alien) => (
                <div
                  key={alien.id}
                  style={{
                    borderRadius: 6,
                    border: `2px solid ${alien.color}`,
                    backgroundColor: '#0a1622',
                    padding: 20,
                    display: 'flex',
                    flexDirection: 'column',
                    textAlign: 'center',
                  }}
                >
                  <div style={{ fontSize: 44, marginBottom: 8 }}>{alien.icon}</div>
                  <h3 style={{ margin: '0 0 4px', fontFamily: "'Bebas Neue', sans-serif", fontSize: 24, color: '#e0f2fe' }}>
                    {alien.name}
                  </h3>
                  <div style={{ fontSize: 10, color: alien.color, fontWeight: 700, marginBottom: 10 }}>
                    {alien.title}
                  </div>
                  <p style={{ fontSize: 11, color: '#94a3b8', lineHeight: 1.5, margin: '0 0 14px', flex: 1 }}>
                    {alien.bio}
                  </p>
                  <button
                    onClick={() => startDialogue(alien)}
                    style={{
                      padding: '9px',
                      backgroundColor: alien.color,
                      color: '#000',
                      fontWeight: 800,
                      fontSize: 10,
                      fontFamily: "'Syncopate', sans-serif",
                      borderRadius: 3,
                      border: 'none',
                      cursor: 'pointer',
                    }}
                  >
                    🗣️ COMMUNICATE WITH {alien.name.split(' ')[0]} ➔
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════════════
            SPACE 4: 🧪 B-MOVIE MONSTER CRYPT & CREATURE LAB
        ════════════════════════════════════════════════════════════════════ */}
        {currentSpace === 'monsters' && (
          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            {/* Lab Header */}
            <div
              style={{
                width: '100%',
                maxWidth: 1140,
                padding: '28px',
                marginBottom: 28,
                borderRadius: 8,
                backgroundColor: 'rgba(10, 26, 12, 0.92)',
                border: '3px solid #22c55e',
                boxShadow: '0 0 40px rgba(34, 197, 94, 0.35)',
                textAlign: 'center',
              }}
            >
              <h1 style={{ margin: '0 0 8px', fontFamily: "'Bebas Neue', sans-serif", fontSize: 48, letterSpacing: 8, color: '#86efac' }}>
                B-MOVIE MONSTER CRYPT & SPLICER
              </h1>
              <div style={{ fontSize: 11, color: '#4ade80', fontFamily: "'Syncopate', sans-serif", letterSpacing: 3, marginBottom: 12 }}>
                RADIOACTIVE GREEN GLOW · CREATURE FEATURE LAB · ATOMIC TEST VAULT
              </div>
              <p style={{ maxWidth: 780, margin: '0 auto', fontSize: 13, color: '#dcfce7', fontStyle: 'italic' }}>
                Deep in the fallout bunker behind the screen, creature DNA and vintage celluloid reels are synthesized together.
                Splice two monster samples to invent your own B-Movie titan!
              </p>
            </div>

            {/* Monster Mutation Splicer Machine (Playable Minigame) */}
            <div
              style={{
                width: '100%',
                maxWidth: 1140,
                padding: 26,
                borderRadius: 6,
                border: '2px solid #16a34a',
                backgroundColor: 'rgba(8, 20, 10, 0.95)',
                marginBottom: 36,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
              }}
            >
              <div style={{ fontSize: 14, fontWeight: 800, color: '#86efac', fontFamily: "'Syncopate', sans-serif", marginBottom: 16 }}>
                ⚡ THE CELLULOID MONSTER SPLICER (COST: 🪙 2)
              </div>

              {/* Ingredient Selection */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap', justifyContent: 'center', marginBottom: 20 }}>
                {/* Slot A */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'center' }}>
                  <span style={{ fontSize: 10, color: '#4ade80' }}>SAMPLE A:</span>
                  <select
                    value={monsterSlotA}
                    onChange={(e) => setMonsterSlotA(e.target.value)}
                    style={{
                      padding: '8px 14px',
                      backgroundColor: '#052e16',
                      border: '1px solid #22c55e',
                      color: '#86efac',
                      borderRadius: 4,
                      fontSize: 11,
                    }}
                  >
                    {MONSTER_INGREDIENTS.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.icon} {m.name}
                      </option>
                    ))}
                  </select>
                </div>

                <span style={{ fontSize: 24, color: '#22c55e', fontWeight: 900 }}>+</span>

                {/* Slot B */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'center' }}>
                  <span style={{ fontSize: 10, color: '#4ade80' }}>SAMPLE B:</span>
                  <select
                    value={monsterSlotB}
                    onChange={(e) => setMonsterSlotB(e.target.value)}
                    style={{
                      padding: '8px 14px',
                      backgroundColor: '#052e16',
                      border: '1px solid #22c55e',
                      color: '#86efac',
                      borderRadius: 4,
                      fontSize: 11,
                    }}
                  >
                    {MONSTER_INGREDIENTS.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.icon} {m.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Pull Lightning Switch Button */}
                <button
                  onClick={runMonsterSplicer}
                  disabled={isSplicing}
                  style={{
                    padding: '12px 24px',
                    backgroundColor: isSplicing ? '#15803d' : '#22c55e',
                    color: '#000',
                    fontWeight: 900,
                    fontFamily: "'Syncopate', sans-serif",
                    fontSize: 11,
                    borderRadius: 4,
                    border: 'none',
                    cursor: 'pointer',
                    boxShadow: '0 0 20px #22c55e',
                  }}
                >
                  {isSplicing ? '⚡ LIGHTNING ZAPPING...' : '⚡ PULL KNIFE SWITCH (🪙 2)'}
                </button>
              </div>

              {/* Synthesized Result Card */}
              {synthesizedCreature && (
                <div
                  style={{
                    width: '100%',
                    maxWidth: 720,
                    padding: 20,
                    borderRadius: 6,
                    border: '2px solid #86efac',
                    backgroundColor: 'rgba(34, 197, 94, 0.15)',
                    textAlign: 'center',
                  }}
                >
                  <div style={{ fontSize: 10, color: '#4ade80', letterSpacing: 3, fontWeight: 800, marginBottom: 4 }}>
                    SUCCESSFULLY SYNTHESIZED (+3 TOKENS REWARD)
                  </div>
                  <h3 style={{ margin: '0 0 6px', fontFamily: "'Bebas Neue', sans-serif", fontSize: 32, color: '#dcfce7' }}>
                    {synthesizedCreature.name}
                  </h3>
                  <div style={{ fontSize: 12, color: '#fef08a', fontStyle: 'italic', marginBottom: 10 }}>
                    {synthesizedCreature.tagline}
                  </div>
                  <p style={{ fontSize: 12, color: '#bbf7d0', lineHeight: 1.5, margin: '0 0 12px' }}>
                    {synthesizedCreature.desc}
                  </p>
                  <div style={{ display: 'flex', justifyContent: 'center', gap: 20, fontSize: 11, color: '#86efac' }}>
                    <span>ATK POWER: <strong>{synthesizedCreature.statAtk}/100</strong></span>
                    <span>CHAOS LEVEL: <strong>{synthesizedCreature.statChaos}/100</strong></span>
                  </div>
                </div>
              )}
            </div>

            {/* Monster Denizens Grid */}
            <div
              style={{
                width: '100%',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                gap: 20,
              }}
            >
              {ALL_DENIZENS.filter((d) => d.space === 'monsters').map((monster) => (
                <div
                  key={monster.id}
                  style={{
                    borderRadius: 6,
                    border: `2px solid ${monster.color}`,
                    backgroundColor: '#0c1a0e',
                    padding: 20,
                    display: 'flex',
                    flexDirection: 'column',
                    textAlign: 'center',
                  }}
                >
                  <div style={{ fontSize: 44, marginBottom: 8 }}>{monster.icon}</div>
                  <h3 style={{ margin: '0 0 4px', fontFamily: "'Bebas Neue', sans-serif", fontSize: 24, color: '#f0fdf4' }}>
                    {monster.name}
                  </h3>
                  <div style={{ fontSize: 10, color: monster.color, fontWeight: 700, marginBottom: 10 }}>
                    {monster.title}
                  </div>
                  <p style={{ fontSize: 11, color: '#86efac', lineHeight: 1.5, margin: '0 0 14px', flex: 1 }}>
                    {monster.bio}
                  </p>
                  <button
                    onClick={() => startDialogue(monster)}
                    style={{
                      padding: '9px',
                      backgroundColor: monster.color,
                      color: '#000',
                      fontWeight: 800,
                      fontSize: 10,
                      fontFamily: "'Syncopate', sans-serif",
                      borderRadius: 3,
                      border: 'none',
                      cursor: 'pointer',
                    }}
                  >
                    🗣️ CONFRONT {monster.name.split(' ')[0]} ➔
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════════════
            SPACE 5: 🎯 CARNIVAL ARCADE & HIGH-STRIKER MINIGAME
        ════════════════════════════════════════════════════════════════════ */}
        {currentSpace === 'arcade' && (
          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div
              style={{
                width: '100%',
                maxWidth: 1140,
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
                gap: 26,
                marginBottom: 36,
              }}
            >
              {/* Game 1: The High-Striker (Ring The Bell!) */}
              <div
                style={{
                  borderRadius: 8,
                  border: '3px solid #ec4899',
                  backgroundColor: 'rgba(26, 10, 18, 0.95)',
                  boxShadow: '0 0 35px rgba(236, 72, 153, 0.35)',
                  padding: 24,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                }}
              >
                <div style={{ fontSize: 11, fontWeight: 800, color: '#f472b6', fontFamily: "'Syncopate', sans-serif", marginBottom: 6 }}>
                  🔨 TEST OF STRENGTH // HIGH-STRIKER
                </div>
                <h2 style={{ margin: '0 0 12px', fontFamily: "'Bebas Neue', sans-serif", fontSize: 36, color: '#fdf2f8' }}>
                  RING THE CARNIVAL BELL!
                </h2>

                <p style={{ fontSize: 11, color: '#fbcfe8', textAlign: 'center', margin: '0 0 18px' }}>
                  Time your swing as the power gauge peaks at the top! Hit 90-100% to clang the bell and win 5 brass tokens!
                </p>

                {/* Power Gauge Column */}
                <div
                  style={{
                    width: 44,
                    height: 200,
                    backgroundColor: '#111',
                    borderRadius: 22,
                    border: '3px solid #f472b6',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column-reverse',
                    marginBottom: 16,
                  }}
                >
                  <div
                    style={{
                      width: '100%',
                      height: `${strikerPower}%`,
                      background: strikerPower >= 90
                        ? 'linear-gradient(to top, #ec4899, #f43f5e, #fbbf24)'
                        : 'linear-gradient(to top, #8b5cf6, #ec4899)',
                      boxShadow: '0 0 16px #ec4899',
                      transition: 'height 0.05s linear',
                    }}
                  />
                </div>

                <div style={{ fontSize: 14, fontWeight: 900, color: '#f472b6', marginBottom: 14 }}>
                  POWER: {strikerPower}%
                </div>

                <button
                  onClick={swingMallet}
                  disabled={strikerSwinging}
                  style={{
                    padding: '12px 28px',
                    backgroundColor: '#ec4899',
                    color: '#000',
                    fontWeight: 900,
                    fontFamily: "'Syncopate', sans-serif",
                    fontSize: 12,
                    borderRadius: 4,
                    border: 'none',
                    cursor: 'pointer',
                    boxShadow: '0 0 20px #ec4899',
                  }}
                >
                  {strikerSwinging ? '💥 SWINGING...' : '🔨 SWING MALLET (🪙 1)'}
                </button>

                {/* Striker Result Text */}
                {strikerResult && (
                  <div
                    style={{
                      marginTop: 14,
                      padding: '8px 14px',
                      backgroundColor: strikerResult.isBell ? 'rgba(234, 179, 8, 0.25)' : 'rgba(0,0,0,0.6)',
                      border: strikerResult.isBell ? '1px solid #eab308' : '1px solid #443729',
                      borderRadius: 4,
                      fontSize: 11,
                      color: strikerResult.isBell ? '#fde047' : '#fbcfe8',
                      textAlign: 'center',
                    }}
                  >
                    {strikerResult.text}
                  </div>
                )}
              </div>

              {/* Game 2: Carny Pete's Concession Stand */}
              <div
                style={{
                  borderRadius: 8,
                  border: '2px solid #ca8a04',
                  backgroundColor: 'rgba(24, 18, 10, 0.95)',
                  boxShadow: '0 0 35px rgba(202, 138, 4, 0.3)',
                  padding: 24,
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                <div style={{ fontSize: 11, fontWeight: 800, color: '#ca8a04', fontFamily: "'Syncopate', sans-serif", marginBottom: 6 }}>
                  🍿 CARNY PETE’S REFRESHMENT WAGON
                </div>
                <h2 style={{ margin: '0 0 12px', fontFamily: "'Bebas Neue', sans-serif", fontSize: 36, color: '#fef08a' }}>
                  STRANGELET SNACKS & SODAS
                </h2>
                <p style={{ fontSize: 11, color: '#d6c7b2', margin: '0 0 16px' }}>
                  Each item bestows a special temporary sensory illusion upon your drive-in viewport! (Cost: 🪙 1 each)
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, flex: 1 }}>
                  {[
                    {
                      name: 'QUARK GLOW SODA',
                      desc: 'Radioactive green neon phosphor vision',
                      filter: 'hue-rotate(90deg) saturate(1.8) brightness(1.1)',
                      icon: '🥤',
                    },
                    {
                      name: '1932 NITRATE TAFFY',
                      desc: 'Deep warm sepia archival tint',
                      filter: 'sepia(0.85) contrast(1.2) brightness(1.05)',
                      icon: '🍬',
                    },
                    {
                      name: 'BLACK CARAVAN COFFEE',
                      desc: 'High-contrast monochrome film noir',
                      filter: 'grayscale(100%) contrast(1.5) brightness(1.15)',
                      icon: '☕',
                    },
                    {
                      name: 'BUTTERY INTERZONE POPCORN',
                      desc: 'Warm golden Technicolor bloom',
                      filter: 'saturate(1.6) brightness(1.1)',
                      icon: '🍿',
                    },
                  ].map((snack) => (
                    <button
                      key={snack.name}
                      onClick={() => buyConcession(snack)}
                      style={{
                        padding: '10px 14px',
                        backgroundColor: 'rgba(202, 138, 4, 0.15)',
                        border: '1px solid #ca8a04',
                        color: '#fef08a',
                        borderRadius: 4,
                        cursor: 'pointer',
                        textAlign: 'left',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 800, fontSize: 11 }}>
                          {snack.icon} {snack.name}
                        </div>
                        <div style={{ fontSize: 9, opacity: 0.8, color: '#d6c7b2' }}>{snack.desc}</div>
                      </div>
                      <span style={{ fontSize: 10, color: '#ca8a04', fontWeight: 800 }}>🪙 1</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════════════
            SPACE 6: 🎹 16-PAD MPC CINE-SAMPLER TERMINAL
        ════════════════════════════════════════════════════════════════════ */}
        {currentSpace === 'mpc' && (
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

        {/* ── PASS THE TIN HAT (SUPPORT FOOTER) ── */}
        <div
          style={{
            width: '100%',
            maxWidth: 860,
            padding: '24px',
            borderRadius: 6,
            border: '2px dashed #b45309',
            backgroundColor: 'rgba(20, 15, 10, 0.85)',
            textAlign: 'center',
            marginTop: 20,
          }}
        >
          <div style={{ fontSize: 24, marginBottom: 6 }}>🎩</div>
          <h3 style={{ margin: '0 0 6px', fontFamily: "'Bebas Neue', sans-serif", fontSize: 26, color: '#fef08a' }}>
            PASS THE TIN HAT // BUY ME A COFFEE
          </h3>
          <p style={{ fontSize: 12, color: '#c7b8a5', maxWidth: 640, margin: '0 auto 16px', lineHeight: 1.6 }}>
            The Interzone Drive-In and Strangelet Suite are independent works of cinema engineering. If this desert carnival fuels your creativity, drop a few coins in the tin hat.
          </p>
          <a
            href={BUY_ME_A_COFFEE_URL}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              padding: '10px 22px',
              backgroundColor: '#f59e0b',
              color: '#000',
              fontWeight: 800,
              fontSize: 11,
              fontFamily: "'Syncopate', sans-serif",
              borderRadius: 3,
              textDecoration: 'none',
              display: 'inline-block',
              boxShadow: '0 0 16px rgba(245, 158, 11, 0.45)',
            }}
          >
            ☕ DROP A COFFEE IN THE TIN HAT ↗
          </a>
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════════════════
          GLOBAL INTERACTIVE MODALS
      ════════════════════════════════════════════════════════════════════ */}

      {/* ── 1. DENIZEN DIALOGUE NPC MODAL ── */}
      {activeDenizen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.88)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backdropFilter: 'blur(8px)',
            padding: 20,
          }}
          onClick={() => setActiveDenizen(null)}
        >
          <div
            style={{
              width: '100%',
              maxWidth: 680,
              backgroundColor: '#16110a',
              border: `3px solid ${activeDenizen.color}`,
              borderRadius: 8,
              boxShadow: `0 0 50px ${activeDenizen.color}`,
              padding: 28,
              display: 'flex',
              flexDirection: 'column',
              position: 'relative',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header with Avatar and Title */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, borderBottom: '1px solid #443729', paddingBottom: 16, marginBottom: 18 }}>
              <div
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: '50%',
                  backgroundColor: '#000',
                  border: `2px solid ${activeDenizen.color}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 34,
                }}
              >
                {activeDenizen.icon}
              </div>
              <div>
                <h2 style={{ margin: '0 0 4px', fontFamily: "'Bebas Neue', sans-serif", fontSize: 32, color: '#fef08a' }}>
                  {activeDenizen.name}
                </h2>
                <div style={{ fontSize: 11, color: activeDenizen.color, fontWeight: 700 }}>
                  {activeDenizen.title}
                </div>
              </div>
            </div>

            {/* Typewriter Animated Speech Bubble */}
            <div
              style={{
                backgroundColor: 'rgba(0,0,0,0.6)',
                border: '1px solid #443729',
                borderRadius: 4,
                padding: 16,
                fontSize: 13,
                lineHeight: 1.6,
                color: '#fef3c7',
                minHeight: 80,
                fontFamily: "'Space Mono', monospace",
                marginBottom: 20,
              }}
            >
              {typewriterText}
            </div>

            {/* Branching Dialogue Options */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 18 }}>
              {activeDenizen.dialogue.map((opt, i) => (
                <button
                  key={i}
                  onClick={() => handleSelectDialogueOption(opt)}
                  style={{
                    padding: '10px 14px',
                    textAlign: 'left',
                    backgroundColor: activeDialogueStep?.question === opt.question ? 'rgba(234, 88, 12, 0.3)' : 'rgba(255,255,255,0.06)',
                    border: '1px solid #78350f',
                    color: '#fed7aa',
                    borderRadius: 4,
                    cursor: 'pointer',
                    fontSize: 12,
                    fontFamily: "'Space Mono', monospace",
                  }}
                >
                  ➔ {opt.question} {opt.reward && <span style={{ color: '#facc15' }}>(+{opt.reward} Tokens)</span>}
                </button>
              ))}
            </div>

            {/* Close Button */}
            <button
              onClick={() => setActiveDenizen(null)}
              style={{
                alignSelf: 'flex-end',
                padding: '8px 18px',
                backgroundColor: 'rgba(255,255,255,0.1)',
                border: '1px solid #78350f',
                color: '#fff',
                borderRadius: 4,
                cursor: 'pointer',
                fontSize: 11,
              }}
            >
              STEP AWAY [CLOSE]
            </button>
          </div>
        </div>
      )}

      {/* ── 2. FORTUNE CARD MODAL ── */}
      {fortuneOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.85)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 20,
          }}
          onClick={() => setFortuneOpen(false)}
        >
          <div
            style={{
              maxWidth: 480,
              backgroundColor: '#fef3c7',
              color: '#1c1917',
              padding: 32,
              borderRadius: 4,
              border: '6px double #b45309',
              boxShadow: '0 0 50px rgba(180, 83, 9, 0.6)',
              textAlign: 'center',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ fontSize: 10, letterSpacing: 4, color: '#b45309', fontWeight: 800, marginBottom: 14 }}>
              MADAME STRANGELET'S BURROUGHS CUT-UP
            </div>
            <p style={{ fontSize: 15, fontStyle: 'italic', lineHeight: 1.6, margin: '0 0 20px', fontFamily: "'Special Elite', serif" }}>
              “When the celluloid melts in the gate, do not turn away—that is the exact moment the film begins. Cut strictly on the downbeat.”
            </p>
            <div style={{ fontSize: 9, fontWeight: 800, color: '#dc2626', borderTop: '1px solid #d97706', paddingTop: 10, letterSpacing: 2 }}>
              OFFICIAL SIDESHOW CENSOR STAMP #881
            </div>
            <button
              onClick={() => setFortuneOpen(false)}
              style={{
                marginTop: 18,
                padding: '8px 20px',
                backgroundColor: '#b45309',
                color: '#fff',
                border: 'none',
                borderRadius: 3,
                cursor: 'pointer',
                fontWeight: 800,
                fontSize: 11,
              }}
            >
              TUCK CARD IN POCKET
            </button>
          </div>
        </div>
      )}

      {/* ── 3. MUTOSCOPE PEEP HOLE MODAL ── */}
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
          <div
            style={{
              width: 340,
              height: 340,
              borderRadius: '50%',
              border: '16px solid #b45309',
              boxShadow: '0 0 50px rgba(245, 158, 11, 0.6)',
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
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transform: `rotate(${peepAngle}deg)`,
                filter: 'sepia(0.9) contrast(1.5) brightness(1.15)',
                transition: 'transform 0.15s ease-out',
                backgroundImage: 'repeating-conic-gradient(from 0deg, #000 0deg 20deg, #f59e0b 20deg 40deg, #b91c1c 40deg 60deg, #000 60deg 80deg)',
              }}
            >
              <div style={{ width: 140, height: 140, borderRadius: '50%', backgroundColor: '#000', border: '4px solid #f59e0b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: 44 }}>👁️</span>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }} onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => {
                carnivalSFX.playCoinClink();
                setPeepAngle((p) => p + 35);
              }}
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
              }}
            >
              🔄 TURN HAND CRANK (CLACK)
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
        </div>
      )}

      {/* ── 4. TELESCOPE VEGAS MIRAGE MODAL ── */}
      {telescopeOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.95)',
            zIndex: 99999,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 20,
          }}
          onClick={() => setTelescopeOpen(false)}
        >
          <div
            style={{
              width: 'min(90vw, 560px)',
              height: 'min(90vw, 560px)',
              borderRadius: '50%',
              border: '20px solid #78350f',
              boxShadow: '0 0 60px rgba(245, 158, 11, 0.4), inset 0 0 60px #000',
              overflow: 'hidden',
              position: 'relative',
              backgroundImage: currentBg?.path ? `url(${currentBg.path})` : 'none',
              backgroundSize: '250%',
              backgroundPosition: '60% 40%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {/* Crosshair reticle */}
            <div style={{ position: 'absolute', width: '100%', height: 1, backgroundColor: 'rgba(245, 158, 11, 0.4)' }} />
            <div style={{ position: 'absolute', height: '100%', width: 1, backgroundColor: 'rgba(245, 158, 11, 0.4)' }} />
            <div style={{ position: 'absolute', width: 120, height: 120, borderRadius: '50%', border: '1px dashed rgba(245, 158, 11, 0.5)' }} />
          </div>

          <div style={{ marginTop: 20, textAlign: 'center' }}>
            <div style={{ fontSize: 13, fontWeight: 800, color: '#fef08a', fontFamily: "'Syncopate', sans-serif" }}>
              🔭 16X BRASS DESERT TELESCOPE VIEW
            </div>
            <div style={{ fontSize: 11, color: '#d6c7b2', margin: '4px 0 16px' }}>
              Las Vegas casino skyline mirage shimmering 40 miles south across the alkali flats.
            </div>
            <button
              onClick={() => setTelescopeOpen(false)}
              style={{
                padding: '8px 20px',
                backgroundColor: '#b45309',
                color: '#fff',
                border: 'none',
                borderRadius: 4,
                cursor: 'pointer',
                fontWeight: 800,
              }}
            >
              STEP DOWN FROM TOWER
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
