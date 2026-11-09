import React, { useState, useRef, useEffect } from 'react';

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
  // 'feature' | 'ufo_broll' | 'hey_books'
  const [screenChannel, setScreenChannel] = useState('feature');
  const [malibuFlying, setMalibuFlying] = useState(false);

  const bass = Number(audioSignals?.bass) || 0;
  const isTransient = Boolean(audioSignals?.isTransient);

  // Auto-reset flying state after acceleration clip finishes (~11s)
  useEffect(() => {
    if (malibuFlying) {
      const timer = setTimeout(() => {
        setMalibuFlying(false);
      }, 11000);
      return () => clearTimeout(timer);
    }
  }, [malibuFlying]);

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
            {/* Flashing Neon Roadside Sign */}
            <div
              style={{
                padding: '24px 36px',
                borderRadius: 8,
                backgroundColor: 'rgba(10, 10, 22, 0.88)',
                border: '2px solid #ff6b00',
                boxShadow: `0 0 ${20 + bass * 30}px rgba(255, 107, 0, 0.7), inset 0 0 20px rgba(255, 107, 0, 0.25)`,
                marginBottom: 28,
              }}
            >
              <div
                style={{
                  fontFamily: "'Syncopate', sans-serif",
                  fontSize: 11,
                  letterSpacing: 6,
                  color: '#39ff14',
                  textShadow: '0 0 10px #39ff14',
                  marginBottom: 8,
                  fontWeight: 700,
                }}
              >
                ⚡ NOW SHOWING: INTERDIMENSIONAL DOUBLE FEATURE ⚡
              </div>
              <h1
                style={{
                  margin: 0,
                  fontFamily: "'Bebas Neue', sans-serif",
                  fontSize: 'clamp(2.5rem, 6vw, 4.5rem)',
                  letterSpacing: 12,
                  color: '#ff6b00',
                  textShadow: '0 0 25px rgba(255, 107, 0, 0.9), 0 0 50px rgba(255, 107, 0, 0.5)',
                  lineHeight: 1,
                }}
              >
                INTERZONE DRIVE-IN
              </h1>
              <div
                style={{
                  fontFamily: "'Space Mono', monospace",
                  fontSize: 12,
                  color: '#00e5ff',
                  letterSpacing: 3,
                  marginTop: 10,
                  textShadow: '0 0 8px rgba(0, 229, 255, 0.6)',
                }}
              >
                HIGH DESERT HIGHWAY 66 · VEGAS UFOS · REPO MAN MALIBU · HEY BOOKS
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
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
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
              {malibuFlying ? '🛸 REPO MAN MALIBU: IN ORBIT' : '🛸 IGNITE FLYING MALIBU'}
            </button>
          </div>

          {/* ── THE GIANT DRIVE-IN THEATER SCREEN ── */}
          <div
            style={{
              width: '100%',
              maxWidth: 1040,
              aspectRatio: '16/9',
              backgroundColor: '#000',
              borderRadius: 6,
              border: '8px solid #181824',
              boxShadow: `0 0 ${30 + bass * 40}px rgba(0, 229, 255, 0.25), 0 20px 60px rgba(0, 0, 0, 0.9)`,
              position: 'relative',
              overflow: 'hidden',
              marginBottom: 16,
            }}
          >
            {/* Screen Content */}
            {malibuFlying ? (
              /* Flying Malibu into cosmic void (Repo Man ending!) */
              <video
                src="./assets-bg/drive-in/Malibu_accelerates_into_cosmic_v…_202608202035.mp4"
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
                <div style={{ fontSize: 9.5, color: '#fff', maxWidth: 180, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
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
    </div>
  );
}
