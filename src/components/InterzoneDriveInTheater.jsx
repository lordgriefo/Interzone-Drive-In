import React, { useState, useRef, useEffect } from 'react';
import communityReelData from '../constants/communityReel.json';

export const FAKE_MARQUEE_MOVIES = [
  {
    feature1: "REFORM SCHOOL ARCHON GIRLS",
    feature2: "HOT NEON & ROSWELL CHROME",
    tagline: "Detention in the 4th Dimension! Bad girls, rayguns, and hotrod astral jailbreaks!",
    rating: "RATED XXX (EXTRATERRESTRIAL)",
    snackSpecial: "CONCESSION STAND: ASTRAL NACHOS & MESCALINE MALTS",
    posterGlow: '#ff0055',
    neonColor: '#ff2d75',
  },
  {
    feature1: "ANNUNAKI-D LUNCH",
    feature2: "EXTERMINATE ALL RATIONAL THOUGHT",
    tagline: "William S. Burroughs meets the Sumerian Sky Reptilians at the Mojave Diner!",
    rating: "RATED NC-666",
    snackSpecial: "INTERZONE SPECIAL: CENTIPEDE BURGERS & RADIOACTIVE SLUSHIES",
    posterGlow: '#39ff14',
    neonColor: '#39ff14',
  },
  {
    feature1: "THE 1964 RADIOACTIVE MALIBU",
    feature2: "DON'T LOOK IN THE TRUNK!",
    tagline: "It's got four wheels, 400 horsepower, and it flies straight through the time-space continuum!",
    rating: "APPROVED BY OTTO (REPO CODE #7)",
    snackSpecial: "REPO SPECIAL: PURE BLINDING WHITE LIGHT CORN DOGS",
    posterGlow: '#00e5ff',
    neonColor: '#00e5ff',
  },
  {
    feature1: "ATTACK OF THE 50-FOOT THELEMITE",
    feature2: "BABALON WORKING: VEGAS OVERCLOCK",
    tagline: "Do what thou wilt shall be the whole of the lawness! Archons take cover!",
    rating: "MAGICK IN CINEMASCOPE",
    snackSpecial: "CONCESSION STAND: ABBEY OF THELEMA POPCORN & ABSINTHE FIZZ",
    posterGlow: '#c084fc',
    neonColor: '#c084fc',
  },
  {
    feature1: "THE ARCHON OVERCLOCKERS",
    feature2: "NIGHT OF THE DEMONIC AREA 51 CHILDREN",
    tagline: "They crashed the 1966 Vegas Strip... and now they run the slot machines!",
    rating: "B-ROLL DELIRIUM",
    snackSpecial: "HIGH ROLLER SPECIAL: MONOATOMIC COLD BREW & GLOWING DICE",
    posterGlow: '#eab308',
    neonColor: '#eab308',
  },
];

export function InterzoneDriveInTheater({
  onSwitchToStudio,
  currentTrackTitle,
  isPlaying,
  onTogglePlay,
  audioSignals,
  playlist = [],
  onSelectTrack,
}) {
  // 'gate' (box office / entry) or 'lot' (parked in the desert watching screen)
  const [driveInView, setDriveInView] = useState('gate');
  // 'feature' | 'ufo_broll' | 'hey_books' | 'community_reel'
  const [screenChannel, setScreenChannel] = useState('feature');
  const [malibuFlying, setMalibuFlying] = useState(false);

  // Marquee movie cycling
  const [marqueeIndex, setMarqueeIndex] = useState(0);

  // Community Reel cycling & modal
  const [communityIndex, setCommunityIndex] = useState(0);
  const [showSubmitModal, setShowSubmitModal] = useState(false);

  const bass = Number(audioSignals?.bass) || 0;
  const isTransient = Boolean(audioSignals?.isTransient);

  const currentMarquee = FAKE_MARQUEE_MOVIES[marqueeIndex % FAKE_MARQUEE_MOVIES.length];
  const currentCommunityCut = communityReelData[communityIndex % communityReelData.length];

  // Auto-reset flying state after acceleration clip finishes (~11s)
  useEffect(() => {
    if (malibuFlying) {
      const timer = setTimeout(() => {
        setMalibuFlying(false);
      }, 11000);
      return () => clearTimeout(timer);
    }
  }, [malibuFlying]);

  const handleRollMarquee = () => {
    setMarqueeIndex((prev) => (prev + 1) % FAKE_MARQUEE_MOVIES.length);
  };

  return (
    <div
      style={{
        flex: 1,
        width: '100%',
        height: '100%',
        position: 'relative',
        backgroundColor: '#030308',
        color: '#fff',
        overflowY: 'auto',
        overflowX: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        fontFamily: "'Space Mono', monospace",
      }}
    >
      {/* ── TOP NAV BAR & RADIO TRANSMITTER ── */}
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 100,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '8px 16px',
          backgroundColor: 'rgba(5, 5, 12, 0.92)',
          backdropFilter: 'blur(10px)',
          borderBottom: '1px solid rgba(255, 107, 0, 0.3)',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.8)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <img
            src="./assets-bg/iz-midnight/iz-drv-in_midnight-010.jpg"
            alt="Interzone Marquee"
            style={{
              height: 36,
              borderRadius: 3,
              border: '1px solid rgba(0, 229, 255, 0.5)',
              boxShadow: '0 0 10px rgba(0, 229, 255, 0.4)',
            }}
          />
          <div>
            <div
              style={{
                fontFamily: "'Bebas Neue', sans-serif",
                fontSize: 22,
                letterSpacing: 4,
                color: '#ff6b00',
                textShadow: '0 0 12px rgba(255, 107, 0, 0.8)',
                lineHeight: 1,
              }}
            >
              INTERZONE DRIVE-IN THEATER
            </div>
            <div
              style={{
                fontFamily: "'Syncopate', sans-serif",
                fontSize: 8.5,
                fontWeight: 700,
                letterSpacing: 2,
                color: '#00e5ff',
                textShadow: '0 0 8px rgba(0, 229, 255, 0.7)',
                marginTop: 2,
              }}
            >
              MOJAVE INTERDIMENSIONAL OUTPOST · EST. 1964
            </div>
          </div>
        </div>

        {/* ── RADIO TUNER / NOW PLAYING ── */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '4px 12px',
            backgroundColor: 'rgba(20, 20, 35, 0.75)',
            borderRadius: 4,
            border: '1px solid rgba(57, 255, 20, 0.35)',
            boxShadow: isTransient ? '0 0 14px rgba(57, 255, 20, 0.4)' : 'none',
            transition: 'box-shadow 0.1s',
          }}
        >
          <button
            onClick={onTogglePlay}
            style={{
              background: isPlaying ? '#ff6b00' : 'rgba(255, 255, 255, 0.1)',
              color: isPlaying ? '#000' : '#fff',
              border: 'none',
              borderRadius: 3,
              padding: '4px 10px',
              fontFamily: 'inherit',
              fontWeight: 800,
              fontSize: 11,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 4,
            }}
          >
            {isPlaying ? '⏸ PAUSE' : '▶ TRANSMIT'}
          </button>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: 8, color: '#39ff14', letterSpacing: 1.5, fontWeight: 700 }}>
              📻 99.3 FM CAR SPEAKER TUNER
            </span>
            <span
              style={{
                fontSize: 10,
                color: '#e4e4e7',
                maxWidth: 240,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {currentTrackTitle || 'Station Offline'}
            </span>
          </div>
        </div>

        {/* ── JUMP TO CHOREOGRAPHY STUDIO TAB ── */}
        <button
          onClick={onSwitchToStudio}
          style={{
            background: 'linear-gradient(135deg, rgba(255, 107, 0, 0.2), rgba(0, 229, 255, 0.2))',
            color: '#fff',
            border: '1px solid #ff6b00',
            borderRadius: 4,
            padding: '7px 16px',
            fontFamily: "'Syncopate', sans-serif",
            fontWeight: 800,
            fontSize: 10,
            letterSpacing: 2,
            cursor: 'pointer',
            boxShadow: '0 0 12px rgba(255, 107, 0, 0.4)',
            transition: 'transform 0.15s, box-shadow 0.15s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.04)';
            e.currentTarget.style.boxShadow = '0 0 20px rgba(255, 107, 0, 0.7)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1.0)';
            e.currentTarget.style.boxShadow = '0 0 12px rgba(255, 107, 0, 0.4)';
          }}
        >
          🎬 OPEN CHOREOGRAPHY STUDIO →
        </button>
      </header>

      {/* ── MAIN VIEW SWITCHER: GATE vs LOT ── */}
      {driveInView === 'gate' ? (
        /* ══════════════════════════════════════════════════════════════════════════
           PHASE 1: THE ROADSIDE ENTRANCE & TICKET BOOTH
           ══════════════════════════════════════════════════════════════════════════ */
        <div
          style={{
            flex: 1,
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '30px 20px',
            minHeight: 'calc(100vh - 65px)',
          }}
        >
          {/* Background Loop: Gate entrance video */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              zIndex: 0,
              overflow: 'hidden',
              opacity: 0.38,
            }}
          >
            <video
              src="./assets-bg/drive-in/Interzone_Drive-In_entrance_midn…_202608202035.webm"
              autoPlay
              loop
              muted
              playsInline
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                filter: 'contrast(1.2) saturate(1.4) hue-rotate(-10deg)',
              }}
            />
            {/* Gradient overlay for readability */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background: 'radial-gradient(circle at center, rgba(3,3,8,0.4) 0%, rgba(3,3,8,0.92) 80%)',
              }}
            />
          </div>

          {/* Foreground Gate Portal */}
          <div
            style={{
              position: 'relative',
              zIndex: 10,
              maxWidth: 960,
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
            }}
          >
            {/* Flashing Neon Roadside Marquee with Fake B-Movie Double Feature */}
            <div
              style={{
                padding: '24px 32px',
                borderRadius: 8,
                backgroundColor: 'rgba(10, 10, 22, 0.92)',
                border: `2px solid ${currentMarquee.neonColor}`,
                boxShadow: `0 0 ${20 + bass * 35}px ${currentMarquee.posterGlow}, inset 0 0 25px rgba(0,0,0,0.8)`,
                marginBottom: 24,
                width: '100%',
                maxWidth: 880,
                transition: 'border-color 0.4s, box-shadow 0.4s',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: 10,
                  flexWrap: 'wrap',
                  gap: 8,
                }}
              >
                <div
                  style={{
                    fontFamily: "'Syncopate', sans-serif",
                    fontSize: 10,
                    letterSpacing: 4,
                    color: currentMarquee.neonColor,
                    textShadow: `0 0 10px ${currentMarquee.neonColor}`,
                    fontWeight: 700,
                  }}
                >
                  ⚡ NOW SHOWING: INTERDIMENSIONAL DOUBLE FEATURE ⚡
                </div>
                <div
                  style={{
                    fontFamily: "'Syncopate', sans-serif",
                    fontSize: 9,
                    letterSpacing: 2,
                    color: '#fbbf24',
                    background: 'rgba(251, 191, 36, 0.15)',
                    padding: '3px 8px',
                    borderRadius: 3,
                    border: '1px solid rgba(251, 191, 36, 0.4)',
                  }}
                >
                  {currentMarquee.rating}
                </div>
              </div>

              {/* Main Feature 1 Title */}
              <h1
                style={{
                  margin: '4px 0',
                  fontFamily: "'Bebas Neue', sans-serif",
                  fontSize: 'clamp(2.4rem, 6vw, 4.4rem)',
                  letterSpacing: 8,
                  color: '#fff',
                  textShadow: `0 0 20px ${currentMarquee.neonColor}, 0 0 40px rgba(0,0,0,0.9)`,
                  lineHeight: 1,
                }}
              >
                {currentMarquee.feature1}
              </h1>

              {/* Feature 2 Subtitle */}
              <div
                style={{
                  fontFamily: "'Bebas Neue', sans-serif",
                  fontSize: 'clamp(1.4rem, 3.5vw, 2.2rem)',
                  color: currentMarquee.neonColor,
                  letterSpacing: 5,
                  textShadow: `0 0 12px ${currentMarquee.neonColor}`,
                  marginTop: 2,
                }}
              >
                ★ PLUS CO-FEATURE: {currentMarquee.feature2} ★
              </div>

              {/* B-Movie Tagline */}
              <div
                style={{
                  fontFamily: "'Space Mono', monospace",
                  fontSize: 11.5,
                  color: '#e4e4e7',
                  letterSpacing: 1.5,
                  marginTop: 10,
                  fontStyle: 'italic',
                }}
              >
                "{currentMarquee.tagline}"
              </div>

              {/* Concession Stand Special */}
              <div
                style={{
                  marginTop: 12,
                  padding: '6px 12px',
                  backgroundColor: 'rgba(0, 0, 0, 0.6)',
                  borderRadius: 4,
                  border: '1px dashed rgba(255, 255, 255, 0.25)',
                  fontSize: 9.5,
                  color: '#fbbf24',
                  letterSpacing: 2,
                }}
              >
                🍿 {currentMarquee.snackSpecial}
              </div>

              {/* Marquee Cycle & Randomizer Controls */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 12,
                  marginTop: 14,
                }}
              >
                <button
                  onClick={() =>
                    setMarqueeIndex((prev) => (prev - 1 + FAKE_MARQUEE_MOVIES.length) % FAKE_MARQUEE_MOVIES.length)
                  }
                  style={{
                    background: 'rgba(255,255,255,0.06)',
                    color: '#fff',
                    border: '1px solid rgba(255,255,255,0.2)',
                    borderRadius: 3,
                    padding: '4px 10px',
                    fontSize: 9,
                    cursor: 'pointer',
                  }}
                >
                  ◀ PREV BILL
                </button>
                <button
                  onClick={handleRollMarquee}
                  style={{
                    background: `linear-gradient(90deg, ${currentMarquee.neonColor}, #ff8800)`,
                    color: '#000',
                    border: 'none',
                    borderRadius: 3,
                    padding: '5px 14px',
                    fontFamily: "'Syncopate', sans-serif",
                    fontWeight: 800,
                    fontSize: 9.5,
                    letterSpacing: 1.5,
                    cursor: 'pointer',
                    boxShadow: `0 0 14px ${currentMarquee.posterGlow}`,
                  }}
                >
                  🎲 ROLL NEW FAKE B-MOVIE MARQUEE
                </button>
                <button
                  onClick={handleRollMarquee}
                  style={{
                    background: 'rgba(255,255,255,0.06)',
                    color: '#fff',
                    border: '1px solid rgba(255,255,255,0.2)',
                    borderRadius: 3,
                    padding: '4px 10px',
                    fontSize: 9,
                    cursor: 'pointer',
                  }}
                >
                  NEXT BILL ▶
                </button>
              </div>
            </div>

            {/* ── DRIVE IN ACTION BUTTON ── */}
            <button
              onClick={() => setDriveInView('lot')}
              style={{
                background: 'linear-gradient(90deg, #ff6b00, #ff8800, #ff6b00)',
                color: '#000',
                border: 'none',
                borderRadius: 6,
                padding: '16px 48px',
                fontFamily: "'Bebas Neue', sans-serif",
                fontSize: 26,
                letterSpacing: 5,
                cursor: 'pointer',
                boxShadow: '0 0 30px rgba(255, 107, 0, 0.8), 0 8px 24px rgba(0, 0, 0, 0.6)',
                marginBottom: 36,
                transition: 'transform 0.2s, box-shadow 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.06)';
                e.currentTarget.style.boxShadow = '0 0 45px rgba(255, 107, 0, 1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1.0)';
                e.currentTarget.style.boxShadow = '0 0 30px rgba(255, 107, 0, 0.8)';
              }}
            >
              DRIVE IN: ENTER THEATER LOT ➔
            </button>

            {/* ── TICKET BOOTH SUITE LAUNCHERS & LOCAL SPONSOR ── */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
                gap: 16,
                width: '100%',
              }}
            >
              {/* Studio Launcher Card */}
              <div
                onClick={onSwitchToStudio}
                style={{
                  padding: 18,
                  backgroundColor: 'rgba(15, 15, 30, 0.82)',
                  borderRadius: 6,
                  border: '1px solid rgba(255, 107, 0, 0.4)',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'border-color 0.2s, transform 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#ff6b00';
                  e.currentTarget.style.transform = 'translateY(-3px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(255, 107, 0, 0.4)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <div style={{ fontSize: 20, marginBottom: 6 }}>🎬</div>
                <div style={{ fontFamily: "'Syncopate', sans-serif", fontSize: 10, fontWeight: 700, color: '#ff6b00' }}>
                  SONG CHOREOGRAPHY STUDIO
                </div>
                <div style={{ fontSize: 9.5, color: '#a1a1aa', marginTop: 4, lineHeight: 1.4 }}>
                  The multi-track timeline, beat-synced cutting, puppet slots, and audio-reactive VJ engine.
                </div>
              </div>

              {/* Hey Books Sponsor Card */}
              <div
                onClick={() => {
                  setDriveInView('lot');
                  setScreenChannel('hey_books');
                }}
                style={{
                  padding: 18,
                  backgroundColor: 'rgba(25, 15, 30, 0.85)',
                  borderRadius: 6,
                  border: '1px solid rgba(244, 63, 94, 0.5)',
                  boxShadow: '0 0 12px rgba(244, 63, 94, 0.25)',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'border-color 0.2s, transform 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#f43f5e';
                  e.currentTarget.style.transform = 'translateY(-3px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(244, 63, 94, 0.5)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <div style={{ fontSize: 20, marginBottom: 6 }}>📚</div>
                <div style={{ fontFamily: "'Syncopate', sans-serif", fontSize: 10, fontWeight: 700, color: '#f43f5e' }}>
                  HEY BOOKS · SAN DIEGO
                </div>
                <div style={{ fontSize: 9.5, color: '#e4e4e7', marginTop: 4, lineHeight: 1.4 }}>
                  Official drive-in sponsor! Matthew's bookstore of rare, occult, & unusual folios. Watch Intermission Ad ➔
                </div>
              </div>

              {/* Community Reel Card */}
              <div
                onClick={() => {
                  setDriveInView('lot');
                  setScreenChannel('community_reel');
                }}
                style={{
                  padding: 18,
                  backgroundColor: 'rgba(20, 15, 35, 0.85)',
                  borderRadius: 6,
                  border: '1px solid rgba(168, 85, 247, 0.5)',
                  boxShadow: '0 0 12px rgba(168, 85, 247, 0.25)',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'border-color 0.2s, transform 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#c084fc';
                  e.currentTarget.style.transform = 'translateY(-3px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(168, 85, 247, 0.5)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <div style={{ fontSize: 20, marginBottom: 6 }}>📼</div>
                <div style={{ fontFamily: "'Syncopate', sans-serif", fontSize: 10, fontWeight: 700, color: '#c084fc' }}>
                  COMMUNITY REEL SHOWCASE
                </div>
                <div style={{ fontSize: 9.5, color: '#e4e4e7', marginTop: 4, lineHeight: 1.4 }}>
                  Screen 4! Watch music videos made by the community using KenetiCut and Strangelet Stitch ➔
                </div>
              </div>

              {/* Strangelet Stitch Launcher Card */}
              <a
                href="http://127.0.0.1:8765"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  padding: 18,
                  backgroundColor: 'rgba(15, 15, 30, 0.82)',
                  borderRadius: 6,
                  border: '1px solid rgba(0, 229, 255, 0.4)',
                  textDecoration: 'none',
                  textAlign: 'left',
                  transition: 'border-color 0.2s, transform 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#00e5ff';
                  e.currentTarget.style.transform = 'translateY(-3px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(0, 229, 255, 0.4)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <div style={{ fontSize: 20, marginBottom: 6 }}>🧵</div>
                <div style={{ fontFamily: "'Syncopate', sans-serif", fontSize: 10, fontWeight: 700, color: '#00e5ff' }}>
                  STRANGELET STITCH
                </div>
                <div style={{ fontSize: 9.5, color: '#a1a1aa', marginTop: 4, lineHeight: 1.4 }}>
                  Dual-bay generative music video orchestrator & DJ Fact Cards (Port 8765).
                </div>
              </a>

              {/* Strangelet Lab Launcher Card */}
              <a
                href="http://localhost:8081"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  padding: 18,
                  backgroundColor: 'rgba(15, 15, 30, 0.82)',
                  borderRadius: 6,
                  border: '1px solid rgba(57, 255, 20, 0.4)',
                  textDecoration: 'none',
                  textAlign: 'left',
                  transition: 'border-color 0.2s, transform 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#39ff14';
                  e.currentTarget.style.transform = 'translateY(-3px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(57, 255, 20, 0.4)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <div style={{ fontSize: 20, marginBottom: 6 }}>🧪</div>
                <div style={{ fontFamily: "'Syncopate', sans-serif", fontSize: 10, fontWeight: 700, color: '#39ff14' }}>
                  STRANGELET LAB
                </div>
                <div style={{ fontSize: 9.5, color: '#a1a1aa', marginTop: 4, lineHeight: 1.4 }}>
                  The research lab, lyric graph networks, D3 visualizer, and GenAI console (Port 8081).
                </div>
              </a>
            </div>
          </div>
        </div>
      ) : (
        /* ══════════════════════════════════════════════════════════════════════════
           PHASE 2: THE INTERDIMENSIONAL THEATER LOT (MALIBU DASHBOARD PERSPECTIVE)
           ══════════════════════════════════════════════════════════════════════════ */
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            padding: '16px 16px 40px',
            position: 'relative',
          }}
        >
          {/* Top Lot Controls */}
          <div
            style={{
              width: '100%',
              maxWidth: 1040,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 14,
              flexWrap: 'wrap',
              gap: 10,
            }}
          >
            <button
              onClick={() => setDriveInView('gate')}
              style={{
                background: 'rgba(255, 255, 255, 0.08)',
                color: '#fff',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: 4,
                padding: '5px 12px',
                fontSize: 9.5,
                fontFamily: "'Syncopate', sans-serif",
                cursor: 'pointer',
              }}
            >
              ← RETURN TO FRONT GATE
            </button>

            {/* Screen Channel Selector */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 9, color: '#71717a', textTransform: 'uppercase' }}>Screen:</span>
              <button
                onClick={() => setScreenChannel('feature')}
                style={{
                  background: screenChannel === 'feature' ? '#ff6b00' : 'rgba(20,20,35,0.8)',
                  color: screenChannel === 'feature' ? '#000' : '#fff',
                  border: '1px solid #ff6b00',
                  borderRadius: 3,
                  padding: '4px 10px',
                  fontSize: 9.5,
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                SCREEN 1: FEATURE CUT
              </button>
              <button
                onClick={() => setScreenChannel('ufo_broll')}
                style={{
                  background: screenChannel === 'ufo_broll' ? '#00e5ff' : 'rgba(20,20,35,0.8)',
                  color: screenChannel === 'ufo_broll' ? '#000' : '#fff',
                  border: '1px solid #00e5ff',
                  borderRadius: 3,
                  padding: '4px 10px',
                  fontSize: 9.5,
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                SCREEN 2: 1960s VEGAS UFO B-ROLL
              </button>
              <button
                onClick={() => setScreenChannel('hey_books')}
                style={{
                  background: screenChannel === 'hey_books' ? '#f43f5e' : 'rgba(20,20,35,0.8)',
                  color: screenChannel === 'hey_books' ? '#000' : '#f43f5e',
                  border: '1px solid #f43f5e',
                  borderRadius: 3,
                  padding: '4px 10px',
                  fontSize: 9.5,
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                SCREEN 3: 📚 HEY BOOKS AD
              </button>
              <button
                onClick={() => setScreenChannel('community_reel')}
                style={{
                  background: screenChannel === 'community_reel' ? '#c084fc' : 'rgba(20,20,35,0.8)',
                  color: screenChannel === 'community_reel' ? '#000' : '#c084fc',
                  border: '1px solid #c084fc',
                  borderRadius: 3,
                  padding: '4px 10px',
                  fontSize: 9.5,
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                SCREEN 4: 📼 COMMUNITY REEL
              </button>
            </div>

            {/* Repo Man Flying Malibu Ignition Button */}
            <button
              onClick={() => setMalibuFlying((prev) => !prev)}
              style={{
                background: malibuFlying
                  ? 'linear-gradient(90deg, #39ff14, #00e5ff)'
                  : 'rgba(57, 255, 20, 0.15)',
                color: malibuFlying ? '#000' : '#39ff14',
                border: '1px solid #39ff14',
                borderRadius: 4,
                padding: '5px 14px',
                fontFamily: "'Syncopate', sans-serif",
                fontWeight: 800,
                fontSize: 9.5,
                letterSpacing: 1.5,
                cursor: 'pointer',
                boxShadow: malibuFlying ? '0 0 25px #39ff14' : 'none',
                transition: 'all 0.2s',
              }}
            >
              {malibuFlying ? '🚀 MALIBU FLIGHT ACTIVE' : '🛸 IGNITE FLYING MALIBU'}
            </button>
          </div>

          {/* ── GIANT OUTDOOR DRIVE-IN SCREEN FRAME ── */}
          <div
            style={{
              position: 'relative',
              width: '100%',
              maxWidth: 1040,
              aspectRatio: '16 / 9',
              borderRadius: 6,
              overflow: 'hidden',
              border: '3px solid #1a1a2e',
              boxShadow: `0 0 ${35 + bass * 45}px rgba(0, 229, 255, 0.4), 0 20px 60px rgba(0, 0, 0, 0.95)`,
              marginBottom: 20,
              backgroundColor: '#000',
            }}
          >
            {/* Screen Projection Content */}
            {malibuFlying ? (
              /* Repo Man Malibu Flying Acceleration Mode */
              <video
                src="./assets-bg/drive-in/Malibu_accelerates_into_cosmic_v._202608202035.mp4"
                autoPlay
                loop
                playsInline
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            ) : screenChannel === 'hey_books' ? (
              /* Screen 3: Hey Books Intermission Trailer */
              <div style={{ position: 'relative', width: '100%', height: '100%', backgroundColor: '#000' }}>
                <video
                  src="./assets-bg/puppet-man/Puppet_man_overseeing_glowing_books_202608202034.mp4"
                  autoPlay
                  loop
                  playsInline
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    filter: 'contrast(1.3) saturate(1.4)',
                  }}
                />
                {/* Hey Books Intermission Ad Overlay */}
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    padding: '24px 32px',
                    background: 'linear-gradient(180deg, rgba(0,0,0,0.75) 0%, transparent 40%, rgba(0,0,0,0.88) 100%)',
                    pointerEvents: 'none',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span
                      style={{
                        fontFamily: "'Syncopate', sans-serif",
                        fontSize: 10,
                        letterSpacing: 4,
                        color: '#f43f5e',
                        fontWeight: 700,
                        textShadow: '0 0 10px #f43f5e',
                      }}
                    >
                      ★ LOCAL DRIVE-IN INTERMISSION SPONSOR ★
                    </span>
                    <span style={{ fontSize: 10, color: '#fbbf24', letterSpacing: 2 }}>SAN DIEGO, CA</span>
                  </div>

                  <div>
                    <h2
                      style={{
                        margin: 0,
                        fontFamily: "'Bebas Neue', sans-serif",
                        fontSize: 'clamp(2rem, 5vw, 4rem)',
                        letterSpacing: 8,
                        color: '#fff',
                        textShadow: '0 0 20px rgba(244, 63, 94, 0.9), 0 0 40px rgba(0,0,0,0.9)',
                        lineHeight: 1,
                      }}
                    >
                      HEY BOOKS
                    </h2>
                    <div
                      style={{
                        fontSize: 12,
                        color: '#fbbf24',
                        letterSpacing: 3,
                        marginTop: 4,
                        textShadow: '0 1px 4px #000',
                        fontWeight: 700,
                      }}
                    >
                      SAN DIEGO · SANCTUARY OF RARE, STRANGE, & OCCULT BOOKS
                    </div>
                    <div
                      style={{
                        fontSize: 10.5,
                        color: '#e4e4e7',
                        marginTop: 6,
                        lineHeight: 1.5,
                        maxWidth: 620,
                      }}
                    >
                      Matthew's haven of glowing occult texts, vintage pulp, rare paperbacks, and curiosities. Stop in and explore the archives before the Repo Man Malibu takes off!
                    </div>
                  </div>
                </div>
              </div>
            ) : screenChannel === 'community_reel' ? (
              /* Screen 4: Community Reel Showcase */
              <div style={{ position: 'relative', width: '100%', height: '100%', backgroundColor: '#000' }}>
                <video
                  key={currentCommunityCut.id}
                  src={currentCommunityCut.videoUrl}
                  autoPlay
                  loop
                  playsInline
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    filter: 'contrast(1.25) saturate(1.3)',
                  }}
                />

                {/* Community Reel Lower-Third & Top Tag */}
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    padding: '20px 28px',
                    background: 'linear-gradient(180deg, rgba(0,0,0,0.7) 0%, transparent 35%, rgba(0,0,0,0.85) 100%)',
                    pointerEvents: 'none',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pointerEvents: 'auto' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span
                        style={{
                          fontFamily: "'Syncopate', sans-serif",
                          fontSize: 9.5,
                          letterSpacing: 3,
                          color: '#c084fc',
                          fontWeight: 700,
                          textShadow: '0 0 10px #c084fc',
                        }}
                      >
                        📼 COMMUNITY GUEST REEL
                      </span>
                      <span
                        style={{
                          fontSize: 9,
                          color: '#a1a1aa',
                          background: 'rgba(255,255,255,0.1)',
                          padding: '2px 8px',
                          borderRadius: 3,
                        }}
                      >
                        CUT {communityIndex + 1} OF {communityReelData.length}
                      </span>
                    </div>

                    <button
                      onClick={() => setShowSubmitModal(true)}
                      style={{
                        background: 'linear-gradient(90deg, #c084fc, #ff6b00)',
                        color: '#000',
                        border: 'none',
                        borderRadius: 3,
                        padding: '4px 10px',
                        fontFamily: "'Syncopate', sans-serif",
                        fontWeight: 800,
                        fontSize: 8.5,
                        letterSpacing: 1,
                        cursor: 'pointer',
                      }}
                    >
                      🛸 SUBMIT YOUR CUT
                    </button>
                  </div>

                  <div style={{ pointerEvents: 'auto' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                      <span style={{ fontSize: 10, color: '#39ff14', fontWeight: 700, letterSpacing: 1.5 }}>
                        NOW SCREENING:
                      </span>
                      <span style={{ fontSize: 10, color: '#fbbf24', letterSpacing: 1 }}>
                        AUDIO: {currentCommunityCut.audioTrack}
                      </span>
                    </div>
                    <h2
                      style={{
                        margin: 0,
                        fontFamily: "'Bebas Neue', sans-serif",
                        fontSize: 'clamp(1.8rem, 4.5vw, 3.2rem)',
                        letterSpacing: 6,
                        color: '#fff',
                        textShadow: '0 0 16px rgba(192, 132, 252, 0.9), 0 0 30px #000',
                        lineHeight: 1,
                      }}
                    >
                      {currentCommunityCut.title}
                    </h2>
                    <div style={{ fontSize: 11, color: '#c084fc', marginTop: 4, fontWeight: 700 }}>
                      CHOREOGRAPHED BY: {currentCommunityCut.creator} · PRESET: {currentCommunityCut.preset}
                    </div>
                    <div style={{ fontSize: 9.5, color: '#d4d4d8', marginTop: 4, maxWidth: 650 }}>
                      "{currentCommunityCut.description}"
                    </div>

                    {/* Community Cut Stepper Controls */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 10 }}>
                      <button
                        onClick={() =>
                          setCommunityIndex((prev) => (prev - 1 + communityReelData.length) % communityReelData.length)
                        }
                        style={{
                          background: 'rgba(255,255,255,0.12)',
                          color: '#fff',
                          border: '1px solid rgba(255,255,255,0.3)',
                          borderRadius: 3,
                          padding: '3px 10px',
                          fontSize: 9,
                          cursor: 'pointer',
                        }}
                      >
                        ◀ PREV GUEST CUT
                      </button>
                      <button
                        onClick={() => setCommunityIndex((prev) => (prev + 1) % communityReelData.length)}
                        style={{
                          background: '#c084fc',
                          color: '#000',
                          border: 'none',
                          borderRadius: 3,
                          padding: '3px 12px',
                          fontSize: 9,
                          fontWeight: 700,
                          cursor: 'pointer',
                        }}
                      >
                        NEXT GUEST CUT ▶
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : screenChannel === 'ufo_broll' ? (
              /* Screen 2: 1960s Vegas UFO B-roll footage */
              <video
                src="./assets-bg/drive-in/Chevy_Malibu_parked_at_drive-in_202608202035.mp4"
                autoPlay
                loop
                playsInline
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  filter: 'contrast(1.25) saturate(1.3) sepia(0.2)',
                }}
              />
            ) : (
              /* Screen 1: Feature Parked at Drive-In */
              <video
                src="./assets-bg/drive-in/1964_Chevy_Malibu_parked_drive-in_202608202035.mp4"
                autoPlay
                loop
                playsInline
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            )}

            {/* Drive-In Projector Beam & Film Grain Overlay */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                pointerEvents: 'none',
                background: 'radial-gradient(ellipse at 50% 0%, rgba(255,255,255,0.12) 0%, transparent 70%)',
                mixBlendMode: 'screen',
              }}
            />

            {/* Screen Speaker Box Overlay (Cast Metal Hanging Speaker) */}
            <div
              style={{
                position: 'absolute',
                bottom: 16,
                right: 20,
                zIndex: 20,
                backgroundColor: 'rgba(18, 18, 26, 0.92)',
                padding: '8px 14px',
                borderRadius: 5,
                border: '1px solid #71717a',
                boxShadow: '0 4px 15px rgba(0,0,0,0.85)',
                display: 'flex',
                alignItems: 'center',
                gap: 12,
              }}
            >
              <div style={{ fontSize: 18 }}>📢</div>
              <div>
                <div style={{ fontSize: 8, color: '#39ff14', fontWeight: 800, letterSpacing: 1 }}>
                  WINDOW SPEAKER ACTIVE
                </div>
                <div
                  style={{
                    fontSize: 9.5,
                    color: '#fff',
                    maxWidth: 180,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {currentTrackTitle || 'Transmission'}
                </div>
              </div>
            </div>
          </div>

          {/* ── DRIVER PERSPECTIVE: DASHBOARD OF THE 1964 CHEVY MALIBU ── */}
          <div
            style={{
              width: '100%',
              maxWidth: 1040,
              backgroundColor: 'rgba(12, 12, 20, 0.85)',
              borderRadius: 6,
              border: '1px solid rgba(255, 107, 0, 0.3)',
              padding: '14px 20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 16,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: '50%',
                  backgroundColor: '#0a0a14',
                  border: '2px solid #39ff14',
                  boxShadow: '0 0 12px rgba(57, 255, 20, 0.5)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 22,
                }}
              >
                ☢️
              </div>
              <div>
                <div style={{ fontFamily: "'Syncopate', sans-serif", fontSize: 11, fontWeight: 700, color: '#39ff14' }}>
                  1964 CHEVY MALIBU (TRUNK EMITTING 3.8 ROENTGENS)
                </div>
                <div style={{ fontSize: 9.5, color: '#a1a1aa', marginTop: 2 }}>
                  Repo Man Interdimensional Flight Mode: {malibuFlying ? 'ACTIVE ⚡' : 'STANDBY'}
                </div>
              </div>
            </div>

            {/* Quick Song Picker for the Drive-In Radio */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 9.5, color: '#71717a' }}>TUNER:</span>
              <select
                onChange={(e) => {
                  const selected = playlist.find((p) => p.id === e.target.value);
                  if (selected && onSelectTrack) onSelectTrack(selected);
                }}
                style={{
                  backgroundColor: '#05050a',
                  color: '#ff6b00',
                  border: '1px solid #ff6b00',
                  borderRadius: 4,
                  padding: '5px 10px',
                  fontFamily: 'inherit',
                  fontSize: 10,
                  cursor: 'pointer',
                }}
              >
                {playlist.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.title}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}

      {/* ── COMMUNITY REEL SUBMISSION POPUP MODAL ── */}
      {showSubmitModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 1000,
            backgroundColor: 'rgba(0, 0, 0, 0.85)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 20,
          }}
          onClick={() => setShowSubmitModal(false)}
        >
          <div
            style={{
              backgroundColor: '#0c0c18',
              border: '2px solid #c084fc',
              borderRadius: 8,
              padding: '28px 32px',
              maxWidth: 580,
              width: '100%',
              boxShadow: '0 0 35px rgba(192, 132, 252, 0.5)',
              position: 'relative',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <span style={{ fontSize: 10, color: '#39ff14', fontWeight: 700, letterSpacing: 2 }}>
                  INTERZONE COMMUNITY INGESTION
                </span>
                <h3
                  style={{
                    margin: '4px 0 10px',
                    fontFamily: "'Bebas Neue', sans-serif",
                    fontSize: 28,
                    letterSpacing: 4,
                    color: '#fff',
                  }}
                >
                  BEAM YOUR CUT TO THE BIG SCREEN
                </h3>
              </div>
              <button
                onClick={() => setShowSubmitModal(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#71717a',
                  fontSize: 20,
                  cursor: 'pointer',
                }}
              >
                ✕
              </button>
            </div>

            <p style={{ fontSize: 11, color: '#e4e4e7', lineHeight: 1.6, margin: '8px 0 16px' }}>
              Did you choreograph a video in <strong>KenetiCut</strong> or generate a cut in <strong>Strangelet Stitch</strong>?
              You can opt-in to have your creation screened right here on Screen 4 of the Interzone Drive-In!
            </p>

            <div
              style={{
                backgroundColor: 'rgba(255,255,255,0.04)',
                borderRadius: 6,
                padding: '14px 16px',
                fontSize: 10.5,
                color: '#a1a1aa',
                lineHeight: 1.6,
                border: '1px solid rgba(255,255,255,0.1)',
                marginBottom: 20,
              }}
            >
              <div style={{ color: '#c084fc', fontWeight: 700, marginBottom: 4 }}>
                HOW TO SUBMIT:
              </div>
              <div>1. In KenetiCut Studio or Stitch, export your finished WebM/MP4 video.</div>
              <div>2. Check the <strong>"Beam to Interzone Drive-In"</strong> box on export.</div>
              <div>3. Your cut is synced to the Cloudflare R2 / Google Drive community pool and queued for screening!</div>
            </div>

            <button
              onClick={() => setShowSubmitModal(false)}
              style={{
                width: '100%',
                background: 'linear-gradient(90deg, #c084fc, #ff6b00)',
                color: '#000',
                border: 'none',
                borderRadius: 4,
                padding: '10px 20px',
                fontFamily: "'Syncopate', sans-serif",
                fontWeight: 800,
                fontSize: 11,
                letterSpacing: 2,
                cursor: 'pointer',
              }}
            >
              GOT IT · READY TO CUT
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
