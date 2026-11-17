import React, { useState, useRef, useEffect } from 'react';
import communityReelData from '../constants/communityReel.json';
import { STRANGELET_SUITE_APPS } from '../constants/urls';
import { StrangeletSuiteMenu } from './StrangeletSuiteMenu';
import {
  INTERZONE_RADIO_STATIONS,
  SAMPLE_VINTAGE_ADS,
  VINTAGE_RADIO_ADS,
  DOC_ENOCH_MANIFEST,
  DOC_ENOCH_SAMPLES,
  getR2BaseUrl,
  setR2BaseUrl,
  resolveRadioAudioUrl,
} from '../constants/radioStations';
import { playTunerStatic } from '../utils/radioTunerAudio';

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

export const VEGAS_UFO_BROLL_CLIPS = [
  { id: 'ufo-1', title: 'Sands Casino Neon Explosion', url: './assets-bg/excavating/Scene_20__Sands_Explosion_202609031307.mp4' },
  { id: 'ufo-2', title: 'Sky Jellyfish Over 1960s Strip', url: './assets-bg/excavating/Scene_29__Sky_Jellyfish_(Action)_202609031307.mp4' },
  { id: 'ufo-3', title: 'Archon Tendrils Swirl in Vegas Sky', url: './assets-bg/excavating/Archon_tendrils_swirl_in_sky_202609031307.mp4' },
  { id: 'ufo-4', title: '1950s Classroom Reality Fracture', url: './assets-bg/excavating/Scene_2__Classroom_Manifest_202609031307.mp4' },
  { id: 'ufo-5', title: 'Cosmic Eye Opens Over Strip', url: './assets-bg/excavating/Scene_35__Cosmic_Eye_202609031307.mp4' },
  { id: 'ufo-6', title: 'CRT Control Room Static Breach', url: './assets-bg/excavating/Scene_8__CRT_Control_Room_202609031307.mp4' },
  { id: 'ufo-7', title: 'Maniacal Laugh Astral Projection', url: './assets-bg/excavating/Scene_38__Maniacal_Laugh_202609031307.mp4' },
  { id: 'ufo-8', title: 'Oily Computer Lab Archons', url: './assets-bg/excavating/Scene_32__Oily_Computer_Lab_202609031307.mp4' },
  { id: 'ufo-9', title: 'Neon Overload Finale Explosion', url: './assets-bg/excavating/Scene_44__Neon_Overload_Final_202609031307.mp4' },
  { id: 'ufo-10', title: 'Black-Robed Figures in Repo Malibu', url: './assets-bg/excavating/Black-robed_figures_in_car_202607231531.mp4' },
  { id: 'ufo-11', title: 'Shrimp on Dash at High Speed', url: './assets-bg/excavating/Shrimp_on_dash_figures_highway_202607231531.mp4' },
  { id: 'ufo-12', title: 'Malibu Accelerates into Sky Vortex', url: './assets-bg/excavating/Malibu_accelerates_into_sky_vortex_202607231532.mp4' },
];

export function InterzoneDriveInTheater({
  onSwitchToStudio,
  currentTrackTitle,
  isPlaying,
  onTogglePlay,
  onStop = () => {},
  isMuted = false,
  onToggleMute = () => {},
  videoPlaying: externalVideoPlaying = true,
  onToggleVideo: externalToggleVideo = null,
  audioSignals,
  playlist = [],
  onSelectTrack,
}) {
  // 'lot' (parked in the desert watching screen) or 'gate' (roadside box office)
  const [driveInView, setDriveInView] = useState('lot');
  // 'feature' | 'ufo_broll' | 'hey_books' | 'community_reel'
  const [screenChannel, setScreenChannel] = useState('feature');
  // Panoramic 4-Screen Camera Panning: 0 (Feature/Strangelet), 1 (Indie MV/KinetoCut), 2 (Midnight Grindhouse), 3 (Live Visualizer/Radio)
  const [activeScreenIndex, setActiveScreenIndex] = useState(0);
  const [malibuFlying, setMalibuFlying] = useState(false);
  const [internalVideoPlaying, setInternalVideoPlaying] = useState(true);

  const handleSelectScreen = (idx) => {
    const clamped = Math.max(0, Math.min(3, idx));
    setActiveScreenIndex(clamped);
    if (clamped === 0) setScreenChannel('feature');
    else if (clamped === 1) setScreenChannel('community_reel');
    else if (clamped === 2) setScreenChannel('hey_books');
    else if (clamped === 3) setScreenChannel('ufo_broll');
  };

  useEffect(() => {
    if (screenChannel === 'feature') setActiveScreenIndex(0);
    else if (screenChannel === 'community_reel') setActiveScreenIndex(1);
    else if (screenChannel === 'hey_books') setActiveScreenIndex(2);
    else if (screenChannel === 'ufo_broll') setActiveScreenIndex(3);
  }, [screenChannel]);

  const videoPlaying = externalToggleVideo ? externalVideoPlaying : internalVideoPlaying;
  const toggleVideo = externalToggleVideo || (() => setInternalVideoPlaying((prev) => !prev));

  // Marquee movie cycling
  const [marqueeIndex, setMarqueeIndex] = useState(0);

  // Screen 2: 1960s Vegas UFO B-Roll cycling
  const [ufoClipIndex, setUfoClipIndex] = useState(0);

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

  // ── MULTI-CHANNEL PIRATE RADIO STATE ──
  const [activeStationId, setActiveStationId] = useState('w_occult');
  const [showR2ConfigModal, setShowR2ConfigModal] = useState(false);
  const [r2UrlInput, setR2UrlInput] = useState(() => getR2BaseUrl());
  const [interstitialMode, setInterstitialMode] = useState(true);
  const [radioSubTab, setRadioSubTab] = useState('tracks'); // 'tracks' | 'enoch' | 'ads'
  const [activeEnochFilter, setActiveEnochFilter] = useState('all'); // 'all' | 'intro' | 'fact' | 'error' | 'station'

  const activeStation =
    INTERZONE_RADIO_STATIONS.find((s) => s.id === activeStationId) || INTERZONE_RADIO_STATIONS[0];

  const handleTuneStation = (stationId) => {
    playTunerStatic(0.35);
    setActiveStationId(stationId);
    const station = INTERZONE_RADIO_STATIONS.find((s) => s.id === stationId);
    if (station && station.tracks.length > 0 && onSelectTrack) {
      const track = station.tracks[0];
      onSelectTrack({
        ...track,
        url: resolveRadioAudioUrl(track.url),
      });
      if (!isPlaying && onTogglePlay) {
        onTogglePlay();
      }
    }
  };

  const handleSaveR2Url = (e) => {
    e.preventDefault();
    setR2BaseUrl(r2UrlInput);
    setShowR2ConfigModal(false);
  };

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

        {/* ── RADIO TUNER / NOW PLAYING & SOUND/VIDEO CONTROLS ── */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '4px 12px',
            backgroundColor: 'rgba(20, 20, 35, 0.85)',
            borderRadius: 4,
            border: '1px solid rgba(57, 255, 20, 0.35)',
            boxShadow: isTransient ? '0 0 14px rgba(57, 255, 20, 0.4)' : 'none',
            transition: 'box-shadow 0.1s',
          }}
        >
          {/* Play/Pause */}
          <button
            onClick={onTogglePlay}
            style={{
              background: isPlaying ? '#ff6b00' : 'rgba(255, 255, 255, 0.12)',
              color: isPlaying ? '#000' : '#fff',
              border: 'none',
              borderRadius: 3,
              padding: '4px 10px',
              fontFamily: 'inherit',
              fontWeight: 800,
              fontSize: 10,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 4,
            }}
            title={isPlaying ? "Pause music playback" : "Play music"}
          >
            {isPlaying ? '⏸ PAUSE' : '▶ TRANSMIT'}
          </button>

          {/* Stop Audio */}
          {isPlaying && (
            <button
              onClick={onStop}
              style={{
                background: 'rgba(239, 68, 68, 0.2)',
                color: '#f87171',
                border: '1px solid #ef4444',
                borderRadius: 3,
                padding: '4px 7px',
                fontFamily: 'inherit',
                fontWeight: 800,
                fontSize: 9.5,
                cursor: 'pointer',
              }}
              title="Stop audio transmission"
            >
              ⏹ STOP
            </button>
          )}

          {/* Sound Mute Toggle */}
          <button
            onClick={onToggleMute}
            style={{
              background: isMuted ? '#ef4444' : 'rgba(255, 255, 255, 0.1)',
              color: isMuted ? '#fff' : '#e4e4e7',
              border: `1px solid ${isMuted ? '#ef4444' : 'rgba(255, 255, 255, 0.2)'}`,
              borderRadius: 3,
              padding: '4px 8px',
              fontFamily: 'inherit',
              fontWeight: 700,
              fontSize: 9.5,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 3,
            }}
            title={isMuted ? "Unmute audio" : "Turn off audio (Mute)"}
          >
            {isMuted ? '🔇 MUTED' : '🔊 SOUND'}
          </button>

          {/* Video / Screen Motion Pause Toggle */}
          <button
            onClick={toggleVideo}
            style={{
              background: videoPlaying ? 'rgba(0, 229, 255, 0.15)' : 'rgba(239, 68, 68, 0.25)',
              color: videoPlaying ? '#00e5ff' : '#fca5a5',
              border: `1px solid ${videoPlaying ? '#00e5ff' : '#ef4444'}`,
              borderRadius: 3,
              padding: '4px 8px',
              fontFamily: 'inherit',
              fontWeight: 700,
              fontSize: 9.5,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 3,
            }}
            title={videoPlaying ? "Pause all looping videos and screen motion" : "Resume video playback"}
          >
            {videoPlaying ? '🎬 VIDEO: ON' : '⏸ VIDEO: OFF'}
          </button>

          <div
            onClick={() => {
              const idx = INTERZONE_RADIO_STATIONS.findIndex((s) => s.id === activeStationId);
              const nextStation = INTERZONE_RADIO_STATIONS[(idx + 1) % INTERZONE_RADIO_STATIONS.length];
              handleTuneStation(nextStation.id);
            }}
            style={{ display: 'flex', flexDirection: 'column', marginLeft: 4, cursor: 'pointer' }}
            title="Click to cycle to the next radio station on the dial"
          >
            <span style={{ fontSize: 8, color: activeStation.color, letterSpacing: 1.5, fontWeight: 700 }}>
              {activeStation.icon} {activeStation.dial} · {activeStation.shortName}
            </span>
            <span
              style={{
                fontSize: 10,
                color: '#e4e4e7',
                maxWidth: 220,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {currentTrackTitle || activeStation.host}
            </span>
          </div>
        </div>

        {/* ── SUITE DROPDOWN & JUMP TO CHOREOGRAPHY STUDIO TAB ── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <StrangeletSuiteMenu currentAppId="keneticut" align="right" />
          <a
            href="https://github.com/lordgriefo/Strangelet-Lab/releases"
            target="_blank"
            rel="noopener noreferrer"
            title="Download Strangelet Lab v2.5 Beta (Windows x64 / Faust WebAssembly / GHOST AI DAW)"
            style={{
              background: 'linear-gradient(135deg, rgba(251, 191, 36, 0.2), rgba(255, 107, 0, 0.2))',
              color: '#fbbf24',
              border: '1px solid #fbbf24',
              borderRadius: 4,
              padding: '6px 12px',
              fontFamily: "'Syncopate', sans-serif",
              fontWeight: 800,
              fontSize: 9,
              letterSpacing: 1.5,
              textDecoration: 'none',
              cursor: 'pointer',
              boxShadow: '0 0 10px rgba(251, 191, 36, 0.35)',
              transition: 'all 0.15s ease',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.04)';
              e.currentTarget.style.boxShadow = '0 0 18px rgba(251, 191, 36, 0.6)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1.0)';
              e.currentTarget.style.boxShadow = '0 0 10px rgba(251, 191, 36, 0.35)';
            }}
          >
            <span>⚡ LAB BETA</span>
            <span style={{ fontSize: 8 }}>↗</span>
          </a>
          <button
            onClick={onSwitchToStudio}
            style={{
              background: 'linear-gradient(135deg, rgba(255, 107, 0, 0.2), rgba(0, 229, 255, 0.2))',
              color: '#fff',
              border: '1px solid #ff6b00',
              borderRadius: 4,
              padding: '7px 14px',
              fontFamily: "'Syncopate', sans-serif",
              fontWeight: 800,
              fontSize: 9.5,
              letterSpacing: 1.5,
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
        </div>
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

            {/* ── TICKET BOOTH SUITE LAUNCHERS & ROADSIDE NETWORK ── */}
            <div style={{ width: '100%', marginBottom: 16 }}>
              <div
                style={{
                  fontFamily: "'Syncopate', sans-serif",
                  fontSize: 10,
                  letterSpacing: 3,
                  color: '#fbbf24',
                  textShadow: '0 0 10px rgba(251, 191, 36, 0.7)',
                  fontWeight: 800,
                  marginBottom: 14,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                }}
              >
                <span>⚡</span>
                <span>INTERZONE CREATIVE NETWORK · SUITE TOOLS & BETA APPS</span>
                <span>⚡</span>
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                  gap: 14,
                  width: '100%',
                }}
              >
                {/* 1. KenetiCut (Studio Switcher + Perchance Link) */}
                <div
                  style={{
                    padding: 16,
                    backgroundColor: 'rgba(15, 20, 35, 0.88)',
                    borderRadius: 6,
                    border: '1px solid #00e5ff',
                    boxShadow: '0 0 15px rgba(0, 229, 255, 0.25)',
                    textAlign: 'left',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                      <span style={{ fontSize: 22 }}>🎞️</span>
                      <span
                        style={{
                          fontSize: 7.5,
                          fontFamily: "'Syncopate', sans-serif",
                          color: '#00e5ff',
                          border: '1px solid #00e5ff',
                          padding: '2px 5px',
                          borderRadius: 3,
                          fontWeight: 800,
                        }}
                      >
                        ACTIVE STUDIO
                      </span>
                    </div>
                    <div style={{ fontFamily: "'Syncopate', sans-serif", fontSize: 10.5, fontWeight: 800, color: '#00e5ff' }}>
                      KENETICUT
                    </div>
                    <div style={{ fontSize: 9.5, color: '#e4e4e7', marginTop: 4, lineHeight: 1.4 }}>
                      Audio-reactive video montage, beat-synced pacing, living reel choreography & VJ cut-up lab.
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 6, marginTop: 12 }}>
                    <button
                      onClick={onSwitchToStudio}
                      style={{
                        flex: 1,
                        background: 'linear-gradient(90deg, #00e5ff, #00b0ff)',
                        color: '#000',
                        border: 'none',
                        borderRadius: 3,
                        padding: '6px 8px',
                        fontFamily: "'Syncopate', sans-serif",
                        fontWeight: 800,
                        fontSize: 8,
                        letterSpacing: 0.5,
                        cursor: 'pointer',
                      }}
                    >
                      ENTER STUDIO ➔
                    </button>
                    <a
                      href="https://perchance.org/keneticut"
                      target="_blank"
                      rel="noopener noreferrer"
                      title="Open KenetiCut on Perchance"
                      style={{
                        background: 'rgba(255,255,255,0.08)',
                        color: '#00e5ff',
                        border: '1px solid rgba(0, 229, 255, 0.4)',
                        borderRadius: 3,
                        padding: '6px 10px',
                        fontSize: 10,
                        textDecoration: 'none',
                        display: 'flex',
                        alignItems: 'center',
                      }}
                    >
                      ↗
                    </a>
                  </div>
                </div>

                {/* 2. Phase 4 Radio (Face for Radio) */}
                <a
                  href="https://perchance.org/face-for-radio"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    padding: 16,
                    backgroundColor: 'rgba(15, 25, 20, 0.85)',
                    borderRadius: 6,
                    border: '1px solid rgba(57, 255, 20, 0.45)',
                    boxShadow: '0 0 12px rgba(57, 255, 20, 0.15)',
                    textAlign: 'left',
                    textDecoration: 'none',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    transition: 'border-color 0.2s, transform 0.2s, box-shadow 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#39ff14';
                    e.currentTarget.style.boxShadow = '0 0 20px rgba(57, 255, 20, 0.35)';
                    e.currentTarget.style.transform = 'translateY(-3px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(57, 255, 20, 0.45)';
                    e.currentTarget.style.boxShadow = '0 0 12px rgba(57, 255, 20, 0.15)';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                      <span style={{ fontSize: 22 }}>🎙️</span>
                      <span style={{ fontSize: 8.5, color: '#39ff14', fontFamily: 'monospace' }}>perchance.org ↗</span>
                    </div>
                    <div style={{ fontFamily: "'Syncopate', sans-serif", fontSize: 10.5, fontWeight: 800, color: '#39ff14' }}>
                      PHASE 4 RADIO
                    </div>
                    <div style={{ fontSize: 7.5, color: '#86efac', fontFamily: 'monospace', marginTop: 1 }}>
                      (FACE FOR RADIO)
                    </div>
                    <div style={{ fontSize: 9.5, color: '#e4e4e7', marginTop: 4, lineHeight: 1.4 }}>
                      Vintage & modern radio plays: write old-fashioned radio dramas, episodic voice plays & character dialogue.
                    </div>
                  </div>
                  <div
                    style={{
                      marginTop: 12,
                      fontSize: 8,
                      fontFamily: "'Syncopate', sans-serif",
                      color: '#39ff14',
                      fontWeight: 700,
                      letterSpacing: 1,
                    }}
                  >
                    WRITE RADIO PLAYS ➔
                  </div>
                </a>

                {/* 3. The Wunderbar */}
                <a
                  href="https://perchance.org/the-wunderbar"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    padding: 16,
                    backgroundColor: 'rgba(25, 22, 15, 0.85)',
                    borderRadius: 6,
                    border: '1px solid rgba(251, 191, 36, 0.45)',
                    boxShadow: '0 0 12px rgba(251, 191, 36, 0.15)',
                    textAlign: 'left',
                    textDecoration: 'none',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    transition: 'border-color 0.2s, transform 0.2s, box-shadow 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#fbbf24';
                    e.currentTarget.style.boxShadow = '0 0 20px rgba(251, 191, 36, 0.35)';
                    e.currentTarget.style.transform = 'translateY(-3px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(251, 191, 36, 0.45)';
                    e.currentTarget.style.boxShadow = '0 0 12px rgba(251, 191, 36, 0.15)';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                      <img 
                        src="./assets-bg/logos/strangelet-lab-logo.jpg" 
                        alt="Strangelet Lab Seal" 
                        style={{ width: 28, height: 28, borderRadius: '50%', border: '1px solid #fbbf24', objectFit: 'cover', boxShadow: '0 0 10px rgba(251, 191, 36, 0.45)' }} 
                      />
                      <span style={{ fontSize: 8.5, color: '#fbbf24', fontFamily: 'monospace' }}>perchance.org ↗</span>
                    </div>
                    <div style={{ fontFamily: "'Syncopate', sans-serif", fontSize: 10.5, fontWeight: 800, color: '#fbbf24' }}>
                      THE WUNDERBAR
                    </div>
                    <div style={{ fontSize: 7.5, color: '#fde047', fontFamily: 'monospace', marginTop: 1 }}>
                      DOES PRETTY MUCH EVERYTHING
                    </div>
                    <div style={{ fontSize: 9.5, color: '#e4e4e7', marginTop: 4, lineHeight: 1.4 }}>
                      Music videos, character creation, alchemical prompts & storyboards. The all-in-one creative catalyst.
                    </div>
                  </div>
                  <div
                    style={{
                      marginTop: 12,
                      fontSize: 8,
                      fontFamily: "'Syncopate', sans-serif",
                      color: '#fbbf24',
                      fontWeight: 700,
                      letterSpacing: 1,
                    }}
                  >
                    ENTER WUNDERBAR ➔
                  </div>
                </a>

                {/* 4. Phase 4 Pictures */}
                <a
                  href="https://perchance.org/phase-4-pictures"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    padding: 16,
                    backgroundColor: 'rgba(25, 15, 20, 0.85)',
                    borderRadius: 6,
                    border: '1px solid rgba(244, 63, 94, 0.45)',
                    boxShadow: '0 0 12px rgba(244, 63, 94, 0.15)',
                    textAlign: 'left',
                    textDecoration: 'none',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    transition: 'border-color 0.2s, transform 0.2s, box-shadow 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#f43f5e';
                    e.currentTarget.style.boxShadow = '0 0 20px rgba(244, 63, 94, 0.35)';
                    e.currentTarget.style.transform = 'translateY(-3px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(244, 63, 94, 0.45)';
                    e.currentTarget.style.boxShadow = '0 0 12px rgba(244, 63, 94, 0.15)';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                      <span style={{ fontSize: 22 }}>🎬</span>
                      <span style={{ fontSize: 8.5, color: '#f43f5e', fontFamily: 'monospace' }}>perchance.org ↗</span>
                    </div>
                    <div style={{ fontFamily: "'Syncopate', sans-serif", fontSize: 10.5, fontWeight: 800, color: '#f43f5e' }}>
                      PHASE 4 PICTURES
                    </div>
                    <div style={{ fontSize: 7.5, color: '#fda4af', fontFamily: 'monospace', marginTop: 1 }}>
                      AI SCREENPLAY GENERATOR
                    </div>
                    <div style={{ fontSize: 9.5, color: '#e4e4e7', marginTop: 4, lineHeight: 1.4 }}>
                      Take any amount of influences and an AI will write a screenplay for you, or you can co-write it together.
                    </div>
                  </div>
                  <div
                    style={{
                      marginTop: 12,
                      fontSize: 8,
                      fontFamily: "'Syncopate', sans-serif",
                      color: '#f43f5e',
                      fontWeight: 700,
                      letterSpacing: 1,
                    }}
                  >
                    GENERATE SCREENPLAY ➔
                  </div>
                </a>

                {/* 5. The LSC */}
                <a
                  href="https://perchance.org/thelsc"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    padding: 16,
                    backgroundColor: 'rgba(20, 15, 30, 0.85)',
                    borderRadius: 6,
                    border: '1px solid rgba(192, 132, 252, 0.45)',
                    boxShadow: '0 0 12px rgba(192, 132, 252, 0.15)',
                    textAlign: 'left',
                    textDecoration: 'none',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    transition: 'border-color 0.2s, transform 0.2s, box-shadow 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#c084fc';
                    e.currentTarget.style.boxShadow = '0 0 20px rgba(192, 132, 252, 0.35)';
                    e.currentTarget.style.transform = 'translateY(-3px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(192, 132, 252, 0.45)';
                    e.currentTarget.style.boxShadow = '0 0 12px rgba(192, 132, 252, 0.15)';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                      <span style={{ fontSize: 22 }}>⚛️</span>
                      <span style={{ fontSize: 8.5, color: '#c084fc', fontFamily: 'monospace' }}>perchance.org ↗</span>
                    </div>
                    <div style={{ fontFamily: "'Syncopate', sans-serif", fontSize: 10.5, fontWeight: 800, color: '#c084fc' }}>
                      THE LSC
                    </div>
                    <div style={{ fontSize: 7.5, color: '#e9d5ff', fontFamily: 'monospace', marginTop: 1 }}>
                      MUSICIAN'S TOOLKIT & PROMPTS
                    </div>
                    <div style={{ fontSize: 9.5, color: '#e4e4e7', marginTop: 4, lineHeight: 1.4 }}>
                      Prompt builder, lyric writing, track mastering, audio-to-MIDI conversions & taking songs apart.
                    </div>
                  </div>
                  <div
                    style={{
                      marginTop: 12,
                      fontSize: 8,
                      fontFamily: "'Syncopate', sans-serif",
                      color: '#c084fc',
                      fontWeight: 700,
                      letterSpacing: 1,
                    }}
                  >
                    OPEN MUSICIAN'S TOOLKIT ➔
                  </div>
                </a>

                {/* 6. AudioArc */}
                <a
                  href="https://perchance.org/audioarc"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    padding: 16,
                    backgroundColor: 'rgba(15, 25, 35, 0.85)',
                    borderRadius: 6,
                    border: '1px solid rgba(56, 189, 248, 0.45)',
                    boxShadow: '0 0 12px rgba(56, 189, 248, 0.15)',
                    textAlign: 'left',
                    textDecoration: 'none',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    transition: 'border-color 0.2s, transform 0.2s, box-shadow 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#38bdf8';
                    e.currentTarget.style.boxShadow = '0 0 20px rgba(56, 189, 248, 0.35)';
                    e.currentTarget.style.transform = 'translateY(-3px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(56, 189, 248, 0.45)';
                    e.currentTarget.style.boxShadow = '0 0 12px rgba(56, 189, 248, 0.15)';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                      <span style={{ fontSize: 22 }}>🎚️</span>
                      <span style={{ fontSize: 8.5, color: '#38bdf8', fontFamily: 'monospace' }}>perchance.org ↗</span>
                    </div>
                    <div style={{ fontFamily: "'Syncopate', sans-serif", fontSize: 10.5, fontWeight: 800, color: '#38bdf8' }}>
                      AUDIOARC
                    </div>
                    <div style={{ fontSize: 7.5, color: '#bae6fd', fontFamily: 'monospace', marginTop: 1 }}>
                      STORYBOARDS · SCRIPTS · SHORT FILMS
                    </div>
                    <div style={{ fontSize: 9.5, color: '#e4e4e7', marginTop: 4, lineHeight: 1.4 }}>
                      Storyboard, screenwriting, music video & short film creator app with narrative pacing.
                    </div>
                  </div>
                  <div
                    style={{
                      marginTop: 12,
                      fontSize: 8,
                      fontFamily: "'Syncopate', sans-serif",
                      color: '#38bdf8',
                      fontWeight: 700,
                      letterSpacing: 1,
                    }}
                  >
                    OPEN AUDIOARC ➔
                  </div>
                </a>

                {/* 7. Strangelet Cine-Sampler */}
                <a
                  href="https://perchance.org/strangelet-cine-sampler"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    padding: 16,
                    backgroundColor: 'rgba(15, 30, 25, 0.85)',
                    borderRadius: 6,
                    border: '1px solid rgba(52, 211, 153, 0.45)',
                    boxShadow: '0 0 12px rgba(52, 211, 153, 0.15)',
                    textAlign: 'left',
                    textDecoration: 'none',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    transition: 'border-color 0.2s, transform 0.2s, box-shadow 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#34d399';
                    e.currentTarget.style.boxShadow = '0 0 20px rgba(52, 211, 153, 0.35)';
                    e.currentTarget.style.transform = 'translateY(-3px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(52, 211, 153, 0.45)';
                    e.currentTarget.style.boxShadow = '0 0 12px rgba(52, 211, 153, 0.15)';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                      <span style={{ fontSize: 22 }}>📽️</span>
                      <span style={{ fontSize: 8.5, color: '#34d399', fontFamily: 'monospace' }}>perchance.org ↗</span>
                    </div>
                    <div style={{ fontFamily: "'Syncopate', sans-serif", fontSize: 10.5, fontWeight: 800, color: '#34d399' }}>
                      CINE-SAMPLER
                    </div>
                    <div style={{ fontSize: 7.5, color: '#a7f3d0', fontFamily: 'monospace', marginTop: 1 }}>
                      SHOT LIBRARY v2.0
                    </div>
                    <div style={{ fontSize: 9.5, color: '#e4e4e7', marginTop: 4, lineHeight: 1.4 }}>
                      Cinematographic shot library, lens angles, visual framing compositions & reference catalog v2.0.
                    </div>
                  </div>
                  <div
                    style={{
                      marginTop: 12,
                      fontSize: 8,
                      fontFamily: "'Syncopate', sans-serif",
                      color: '#34d399',
                      fontWeight: 700,
                      letterSpacing: 1,
                    }}
                  >
                    BROWSE SHOT LIBRARY ➔
                  </div>
                </a>

                {/* 8. Strangelet Lab (v2.5 Beta Native DAW) */}
                <a
                  href="https://github.com/lordgriefo/Strangelet-Lab/releases"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    padding: 16,
                    backgroundColor: 'rgba(30, 24, 12, 0.88)',
                    borderRadius: 6,
                    border: '1px solid rgba(251, 191, 36, 0.55)',
                    boxShadow: '0 0 14px rgba(251, 191, 36, 0.25)',
                    textAlign: 'left',
                    textDecoration: 'none',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    transition: 'border-color 0.2s, transform 0.2s, box-shadow 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#fbbf24';
                    e.currentTarget.style.boxShadow = '0 0 22px rgba(251, 191, 36, 0.5)';
                    e.currentTarget.style.transform = 'translateY(-3px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(251, 191, 36, 0.55)';
                    e.currentTarget.style.boxShadow = '0 0 14px rgba(251, 191, 36, 0.25)';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                      <img 
                        src="./assets-bg/logos/strangelet-lab-logo.jpg" 
                        alt="Strangelet Lab Seal" 
                        style={{ width: 28, height: 28, borderRadius: '50%', border: '1px solid #fbbf24', objectFit: 'cover', boxShadow: '0 0 10px rgba(251, 191, 36, 0.45)' }} 
                      />
                      <span
                        style={{
                          fontSize: 7,
                          fontFamily: "'Syncopate', sans-serif",
                          fontWeight: 800,
                          color: '#000',
                          backgroundColor: '#fbbf24',
                          padding: '2px 5px',
                          borderRadius: 2,
                        }}
                      >
                        BETA v2.5
                      </span>
                    </div>
                    <div style={{ fontFamily: "'Syncopate', sans-serif", fontSize: 10.5, fontWeight: 800, color: '#fbbf24' }}>
                      STRANGELET LAB
                    </div>
                    <div style={{ fontSize: 7.5, color: '#fef08a', fontFamily: 'monospace', marginTop: 1 }}>
                      PARTICLE COLLIDER DAW
                    </div>
                    <div style={{ fontSize: 9.5, color: '#e4e4e7', marginTop: 4, lineHeight: 1.4 }}>
                      Quantum-acoustic DAW: Faust WebAssembly DSP, level-matched FFT mastering, drum transient replacer & air-gapped GHOST AI companion.
                    </div>
                  </div>
                  <div
                    style={{
                      marginTop: 12,
                      fontSize: 8,
                      fontFamily: "'Syncopate', sans-serif",
                      color: '#fbbf24',
                      fontWeight: 700,
                      letterSpacing: 1,
                    }}
                  >
                    DOWNLOAD v2.5 BETA (.EXE / ZIP) ➔
                  </div>
                </a>

                {/* 9. Strangelet Stitch */}
                <a
                  href="https://github.com/lordgriefo/strangelet-kineto-cut"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    padding: 16,
                    backgroundColor: 'rgba(25, 15, 35, 0.88)',
                    borderRadius: 6,
                    border: '1px solid rgba(192, 132, 252, 0.55)',
                    boxShadow: '0 0 14px rgba(192, 132, 252, 0.25)',
                    textAlign: 'left',
                    textDecoration: 'none',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    transition: 'border-color 0.2s, transform 0.2s, box-shadow 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#c084fc';
                    e.currentTarget.style.boxShadow = '0 0 22px rgba(192, 132, 252, 0.5)';
                    e.currentTarget.style.transform = 'translateY(-3px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(192, 132, 252, 0.55)';
                    e.currentTarget.style.boxShadow = '0 0 14px rgba(192, 132, 252, 0.25)';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                      <span style={{ fontSize: 22 }}>🪡</span>
                      <span style={{ fontSize: 8.5, color: '#c084fc', fontFamily: 'monospace' }}>github.com ↗</span>
                    </div>
                    <div style={{ fontFamily: "'Syncopate', sans-serif", fontSize: 10.5, fontWeight: 800, color: '#c084fc' }}>
                      STRANGELET STITCH
                    </div>
                    <div style={{ fontSize: 7.5, color: '#e9d5ff', fontFamily: 'monospace', marginTop: 1 }}>
                      LIVING REEL STITCHER
                    </div>
                    <div style={{ fontSize: 9.5, color: '#e4e4e7', marginTop: 4, lineHeight: 1.4 }}>
                      Beat-synced video montage choreography, multi-scene living reel stitcher & audio-reactive visual cut-up laboratory.
                    </div>
                  </div>
                  <div
                    style={{
                      marginTop: 12,
                      fontSize: 8,
                      fontFamily: "'Syncopate', sans-serif",
                      color: '#c084fc',
                      fontWeight: 700,
                      letterSpacing: 1,
                    }}
                  >
                    EXPLORE STRANGELET STITCH ➔
                  </div>
                </a>

                {/* 10. Hey Books Scene Card */}
                <div
                  onClick={() => {
                    setDriveInView('lot');
                    setScreenChannel('hey_books');
                  }}
                  style={{
                    padding: 16,
                    backgroundColor: 'rgba(25, 15, 30, 0.85)',
                    borderRadius: 6,
                    border: '1px solid rgba(244, 63, 94, 0.5)',
                    boxShadow: '0 0 12px rgba(244, 63, 94, 0.25)',
                    cursor: 'pointer',
                    textAlign: 'left',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
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
                  <div>
                    <div style={{ fontSize: 22, marginBottom: 6 }}>📚</div>
                    <div style={{ fontFamily: "'Syncopate', sans-serif", fontSize: 10.5, fontWeight: 800, color: '#f43f5e' }}>
                      HEY BOOKS · SAN DIEGO
                    </div>
                    <div style={{ fontSize: 9.5, color: '#e4e4e7', marginTop: 4, lineHeight: 1.4 }}>
                      Matthew's neighborhood bookstore in North Park. Watch the late-night storefront scene on Screen 3.
                    </div>
                  </div>
                  <div
                    style={{
                      marginTop: 12,
                      fontSize: 8,
                      fontFamily: "'Syncopate', sans-serif",
                      color: '#f43f5e',
                      fontWeight: 700,
                      letterSpacing: 1,
                    }}
                  >
                    WATCH ON SCREEN 3 ➔
                  </div>
                </div>

                {/* 8. Community Reel Card */}
                <div
                  onClick={() => {
                    setDriveInView('lot');
                    setScreenChannel('community_reel');
                  }}
                  style={{
                    padding: 16,
                    backgroundColor: 'rgba(20, 15, 35, 0.85)',
                    borderRadius: 6,
                    border: '1px solid rgba(168, 85, 247, 0.5)',
                    boxShadow: '0 0 12px rgba(168, 85, 247, 0.25)',
                    cursor: 'pointer',
                    textAlign: 'left',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
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
                  <div>
                    <div style={{ fontSize: 22, marginBottom: 6 }}>📼</div>
                    <div style={{ fontFamily: "'Syncopate', sans-serif", fontSize: 10.5, fontWeight: 800, color: '#c084fc' }}>
                      COMMUNITY REEL SHOWCASE
                    </div>
                    <div style={{ fontSize: 9.5, color: '#e4e4e7', marginTop: 4, lineHeight: 1.4 }}>
                      Screen 4! Watch music videos made by the community using KenetiCut & the Strangelet Suite.
                    </div>
                  </div>
                  <div
                    style={{
                      marginTop: 12,
                      fontSize: 8,
                      fontFamily: "'Syncopate', sans-serif",
                      color: '#c084fc',
                      fontWeight: 700,
                      letterSpacing: 1,
                    }}
                  >
                    WATCH ON SCREEN 4 ➔
                  </div>
                </div>
              </div>
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

            {/* Screen Channel Selector (Panoramic 4-Screen Multiplex) */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 9, color: '#71717a', textTransform: 'uppercase', fontFamily: "'Syncopate', sans-serif" }}>Field:</span>
              <button
                onClick={() => handleSelectScreen(0)}
                style={{
                  background: activeScreenIndex === 0 ? '#ff6b00' : 'rgba(20,20,35,0.85)',
                  color: activeScreenIndex === 0 ? '#000' : '#fff',
                  border: activeScreenIndex === 0 ? '1px solid #ff6b00' : '1px solid rgba(255, 107, 0, 0.35)',
                  borderRadius: 3,
                  padding: '4px 10px',
                  fontSize: 9,
                  fontWeight: 800,
                  fontFamily: "'Syncopate', sans-serif",
                  cursor: 'pointer',
                  boxShadow: activeScreenIndex === 0 ? '0 0 14px rgba(255, 107, 0, 0.55)' : 'none',
                  transition: 'all 0.2s',
                }}
              >
                SCREEN 1: ⚡ STRANGELET LAB
              </button>
              <button
                onClick={() => handleSelectScreen(1)}
                style={{
                  background: activeScreenIndex === 1 ? '#00e5ff' : 'rgba(20,20,35,0.85)',
                  color: activeScreenIndex === 1 ? '#000' : '#fff',
                  border: activeScreenIndex === 1 ? '1px solid #00e5ff' : '1px solid rgba(0, 229, 255, 0.35)',
                  borderRadius: 3,
                  padding: '4px 10px',
                  fontSize: 9,
                  fontWeight: 800,
                  fontFamily: "'Syncopate', sans-serif",
                  cursor: 'pointer',
                  boxShadow: activeScreenIndex === 1 ? '0 0 14px rgba(0, 229, 255, 0.55)' : 'none',
                  transition: 'all 0.2s',
                }}
              >
                SCREEN 2: 📼 INDIE MV & STITCH
              </button>
              <button
                onClick={() => handleSelectScreen(2)}
                style={{
                  background: activeScreenIndex === 2 ? '#f43f5e' : 'rgba(20,20,35,0.85)',
                  color: activeScreenIndex === 2 ? '#000' : '#f43f5e',
                  border: activeScreenIndex === 2 ? '1px solid #f43f5e' : '1px solid rgba(244, 63, 94, 0.35)',
                  borderRadius: 3,
                  padding: '4px 10px',
                  fontSize: 9,
                  fontWeight: 800,
                  fontFamily: "'Syncopate', sans-serif",
                  cursor: 'pointer',
                  boxShadow: activeScreenIndex === 2 ? '0 0 14px rgba(244, 63, 94, 0.55)' : 'none',
                  transition: 'all 0.2s',
                }}
              >
                SCREEN 3: 🩸 16MM GRINDHOUSE
              </button>
              <button
                onClick={() => handleSelectScreen(3)}
                style={{
                  background: activeScreenIndex === 3 ? '#c084fc' : 'rgba(20,20,35,0.85)',
                  color: activeScreenIndex === 3 ? '#000' : '#c084fc',
                  border: activeScreenIndex === 3 ? '1px solid #c084fc' : '1px solid rgba(192, 132, 252, 0.35)',
                  borderRadius: 3,
                  padding: '4px 10px',
                  fontSize: 9,
                  fontWeight: 800,
                  fontFamily: "'Syncopate', sans-serif",
                  cursor: 'pointer',
                  boxShadow: activeScreenIndex === 3 ? '0 0 14px rgba(192, 132, 252, 0.55)' : 'none',
                  transition: 'all 0.2s',
                }}
              >
                SCREEN 4: 📻 VISUALIZER & RADIO
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

          {/* ── PANORAMIC 4-SCREEN CLASSIC MULTIPLEX HORIZON ── */}
          <div
            style={{
              position: 'relative',
              width: '100%',
              maxWidth: 1040,
              aspectRatio: '16 / 9',
              borderRadius: 8,
              overflow: 'hidden',
              border: '3px solid #1a1a2e',
              boxShadow: `0 0 ${35 + bass * 45}px rgba(0, 229, 255, 0.4), 0 20px 60px rgba(0, 0, 0, 0.95)`,
              marginBottom: 20,
              backgroundColor: '#030308',
            }}
          >
            {/* Embedded CSS Animations for Starfield, Glyphs, and Grindhouse Scratches */}
            <style>{`
              @keyframes star-twinkle {
                0%, 100% { opacity: 0.2; transform: scale(0.85); }
                50% { opacity: 0.95; transform: scale(1.3); }
              }
              @keyframes orbit-spin {
                from { transform: rotate(0deg); }
                to { transform: rotate(360deg); }
              }
              @keyframes glyph-pulse {
                0%, 100% { opacity: 0.18; transform: scale(1); }
                50% { opacity: 0.45; transform: scale(1.08); }
              }
              @keyframes molecule-float {
                0% { transform: translateY(0px) rotate(0deg); }
                50% { transform: translateY(-8px) rotate(4deg); }
                100% { transform: translateY(0px) rotate(0deg); }
              }
              @keyframes film-scratch-jitter {
                0% { transform: translate(0, 0); opacity: 0.7; }
                20% { transform: translate(-2px, 1px); opacity: 0.9; }
                40% { transform: translate(3px, -1px); opacity: 0.6; }
                60% { transform: translate(-1px, 2px); opacity: 0.85; }
                80% { transform: translate(2px, -2px); opacity: 0.5; }
                100% { transform: translate(0, 0); opacity: 0.7; }
              }
              @keyframes slasher-strobe {
                0%, 100% { opacity: 0.75; }
                50% { opacity: 0.3; }
              }
              @keyframes censor-wobble {
                0%, 100% { transform: scale(1) rotate(-1deg); }
                50% { transform: scale(1.025) rotate(1deg); }
              }
            `}</style>

            {/* 1. Cosmic Starfield & Pulsing Molecular/Wingding Sky Layer */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                pointerEvents: 'none',
                zIndex: 1,
                overflow: 'hidden',
                background: 'radial-gradient(ellipse at 50% 12%, #0e0d1f 0%, #060714 55%, #020206 100%)',
              }}
            >
              <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
                {/* 65 Twinkling Desert Stars */}
                {Array.from({ length: 65 }).map((_, i) => {
                  const cx = (i * 37) % 100;
                  const cy = (i * 19) % 75;
                  const r = (i % 3 === 0 ? 1.6 : i % 2 === 0 ? 1.1 : 0.7);
                  const dur = 2.2 + (i % 5) * 1.1;
                  const color = i % 4 === 0 ? '#00e5ff' : i % 5 === 0 ? '#fbbf24' : '#ffffff';
                  return (
                    <circle
                      key={`star-${i}`}
                      cx={`${cx}%`}
                      cy={`${cy}%`}
                      r={r}
                      fill={color}
                      style={{
                        animation: `star-twinkle ${dur}s ease-in-out infinite alternate`,
                        animationDelay: `${(i % 7) * 0.4}s`,
                      }}
                    />
                  );
                })}

                {/* Pulsing Atomic Orbital Rings (Bohr Model) */}
                <g transform="translate(140, 75) scale(0.65)" stroke="#00e5ff" fill="none" opacity="0.28">
                  <circle cx="0" cy="0" r="7" fill="#00e5ff" opacity="0.8" />
                  <ellipse cx="0" cy="0" rx="70" ry="24" strokeWidth="1.2" strokeDasharray="4 3" style={{ animation: 'orbit-spin 18s linear infinite', transformOrigin: '0 0' }} />
                  <ellipse cx="0" cy="0" rx="70" ry="24" strokeWidth="1.2" strokeDasharray="4 3" transform="rotate(60)" style={{ animation: 'orbit-spin 14s linear infinite reverse', transformOrigin: '0 0' }} />
                  <ellipse cx="0" cy="0" rx="70" ry="24" strokeWidth="1.2" strokeDasharray="4 3" transform="rotate(120)" style={{ animation: 'orbit-spin 22s linear infinite', transformOrigin: '0 0' }} />
                </g>

                {/* Sacred Geometry Vesica Piscis & Otzt Chiim Sephirot */}
                <g transform="translate(480, 70) scale(0.55)" stroke="#fbbf24" fill="none" opacity="0.25" style={{ animation: 'glyph-pulse 7s ease-in-out infinite' }}>
                  <circle cx="-35" cy="0" r="50" strokeWidth="1.2" />
                  <circle cx="35" cy="0" r="50" strokeWidth="1.2" />
                  <circle cx="0" cy="-55" r="50" strokeWidth="0.8" strokeDasharray="3 3" />
                  <line x1="-35" y1="0" x2="35" y2="0" strokeWidth="1" />
                  <line x1="0" y1="-55" x2="0" y2="55" strokeWidth="1" />
                  <circle cx="0" cy="0" r="4" fill="#fbbf24" />
                </g>

                {/* Chemical Molecular Benzene Rings */}
                <g transform="translate(780, 80) scale(0.55)" stroke="#00e5ff" fill="none" opacity="0.24" style={{ animation: 'molecule-float 9s ease-in-out infinite' }}>
                  <polygon points="0,-36 32,-18 32,18 0,36 -32,18 -32,-18" strokeWidth="1.4" />
                  <circle cx="0" cy="0" r="22" strokeWidth="1" strokeDasharray="4 2" />
                  <polygon points="32,18 64,36 64,72 32,90 0,72 0,36" strokeWidth="1.2" />
                  <line x1="-32" y1="-18" x2="-58" y2="-34" strokeWidth="1.4" />
                  <text x="-74" y="-32" fill="#00e5ff" fontSize="12" fontFamily="monospace">OH</text>
                  <text x="74" y="80" fill="#fbbf24" fontSize="12" fontFamily="monospace">CH₃</text>
                </g>

                {/* Translucent Retro Wingdings & Alchemical Glyphs */}
                <text x="8%" y="22%" fill="#fbbf24" opacity="0.28" fontSize="18" fontFamily="'Cinzel', serif" style={{ animation: 'glyph-pulse 6s ease-in-out infinite' }}>♄</text>
                <text x="24%" y="16%" fill="#00e5ff" opacity="0.25" fontSize="20" fontFamily="'Cinzel', serif" style={{ animation: 'glyph-pulse 8s ease-in-out infinite' }}>♃</text>
                <text x="42%" y="24%" fill="#ff6b00" opacity="0.28" fontSize="18" fontFamily="'Cinzel', serif" style={{ animation: 'glyph-pulse 7s ease-in-out infinite' }}>🜂</text>
                <text x="64%" y="18%" fill="#00e5ff" opacity="0.30" fontSize="22" fontFamily="'Cinzel', serif" style={{ animation: 'glyph-pulse 9s ease-in-out infinite' }}>☢</text>
                <text x="82%" y="24%" fill="#fbbf24" opacity="0.28" fontSize="20" fontFamily="'Cinzel', serif" style={{ animation: 'glyph-pulse 6s ease-in-out infinite' }}>🜄</text>
                <text x="94%" y="16%" fill="#39ff14" opacity="0.25" fontSize="18" fontFamily="'Cinzel', serif" style={{ animation: 'glyph-pulse 8s ease-in-out infinite' }}>☣</text>
              </svg>
            </div>

            {/* 2. Panoramic 4-Screen Camera Track (Wide 400% Viewport Container) */}
            <div
              style={{
                position: 'relative',
                display: 'flex',
                width: '400%',
                height: '100%',
                transform: `translateX(-${activeScreenIndex * 25}%)`,
                transition: 'transform 900ms cubic-bezier(0.22, 1, 0.36, 1)',
                willChange: 'transform',
                zIndex: 2,
              }}
            >
              {/* ─── SCREEN 1: MAIN FEATURE // STRANGELET LAB SHOWCASE ─── */}
              <div
                style={{
                  position: 'relative',
                  width: '25%',
                  height: '100%',
                  backgroundColor: '#000',
                  overflow: 'hidden',
                }}
              >
                {malibuFlying ? (
                  <video
                    src="./assets-bg/drive-in/Malibu_accelerates_into_cosmic_v._202608202035.mp4"
                    autoPlay={videoPlaying}
                    loop
                    muted
                    playsInline
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    ref={(el) => { if (el) { if (videoPlaying && el.paused) el.play().catch(()=>{}); else if (!videoPlaying && !el.paused) el.pause(); } }}
                  />
                ) : (
                  <video
                    src="./assets-bg/drive-in/1964_Chevy_Malibu_parked_drive-in_202608202035.mp4"
                    autoPlay={videoPlaying}
                    loop
                    muted
                    playsInline
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    ref={(el) => { if (el) { if (videoPlaying && el.paused) el.play().catch(()=>{}); else if (!videoPlaying && !el.paused) el.pause(); } }}
                  />
                )}

                {/* Screen 1 Marquee Header */}
                <div
                  style={{
                    position: 'absolute',
                    top: 14,
                    left: 20,
                    right: 20,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    zIndex: 10,
                    pointerEvents: 'none',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      background: 'rgba(0,0,0,0.7)',
                      backdropFilter: 'blur(4px)',
                      padding: '6px 14px',
                      borderRadius: 4,
                      border: '1px solid rgba(255, 107, 0, 0.5)',
                      boxShadow: '0 0 15px rgba(255, 107, 0, 0.3)',
                    }}
                  >
                    <img 
                      src="./assets-bg/logos/strangelet-lab-logo.jpg" 
                      alt="Strangelet Lab Seal" 
                      style={{ width: 22, height: 22, borderRadius: '50%', border: '1px solid #ff6b00', objectFit: 'cover' }} 
                    />
                    <div style={{ fontFamily: "'Syncopate', sans-serif", fontSize: 9.5, fontWeight: 800, color: '#ff6b00', letterSpacing: 1.5 }}>
                      SCREEN 1: STRANGELET LAB SHOWCASE
                    </div>
                  </div>

                  <a
                    href="https://github.com/lordgriefo/Strangelet-Lab/releases"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      pointerEvents: 'auto',
                      background: 'linear-gradient(90deg, #ff6b00, #fbbf24)',
                      color: '#000',
                      border: 'none',
                      borderRadius: 3,
                      padding: '5px 12px',
                      fontFamily: "'Syncopate', sans-serif",
                      fontWeight: 800,
                      fontSize: 8.5,
                      letterSpacing: 1,
                      textDecoration: 'none',
                      cursor: 'pointer',
                      boxShadow: '0 0 14px rgba(255, 107, 0, 0.5)',
                    }}
                  >
                    ⚡ GET LAB v2.5 BETA ↗
                  </a>
                </div>

                {/* Screen 1 Lower-Third */}
                <div
                  style={{
                    position: 'absolute',
                    bottom: 16,
                    left: 20,
                    zIndex: 10,
                    background: 'rgba(0,0,0,0.65)',
                    padding: '6px 14px',
                    borderRadius: 4,
                    border: '1px solid rgba(255,255,255,0.15)',
                    pointerEvents: 'none',
                  }}
                >
                  <div style={{ fontSize: 8.5, color: '#fbbf24', fontFamily: "'Syncopate', sans-serif", letterSpacing: 1 }}>
                    NOW SCREENING:
                  </div>
                  <div style={{ fontSize: 13, color: '#fff', fontWeight: 800, fontFamily: "'Bebas Neue', sans-serif", letterSpacing: 2 }}>
                    QUANTUM COLLIDER & FAUST DSP WORKSTATION
                  </div>
                </div>
              </div>

              {/* ─── SCREEN 2: 24/7 INDIE MUSIC VIDEO & KINETO-CUT FESTIVAL ─── */}
              <div
                style={{
                  position: 'relative',
                  width: '25%',
                  height: '100%',
                  backgroundColor: '#000',
                  overflow: 'hidden',
                }}
              >
                <video
                  key={currentCommunityCut.id}
                  src={currentCommunityCut.videoUrl}
                  autoPlay={videoPlaying}
                  loop
                  muted
                  playsInline
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    filter: 'contrast(1.25) saturate(1.3)',
                  }}
                  ref={(el) => { if (el) { if (videoPlaying && el.paused) el.play().catch(()=>{}); else if (!videoPlaying && !el.paused) el.pause(); } }}
                />

                {/* Screen 2 Overlay */}
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    padding: '16px 22px',
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
                          letterSpacing: 2.5,
                          color: '#00e5ff',
                          fontWeight: 700,
                          textShadow: '0 0 10px #00e5ff',
                        }}
                      >
                        📼 SCREEN 2: INDIE MV & KINETO-CUT
                      </span>
                      <span
                        style={{
                          fontSize: 8.5,
                          color: '#a1a1aa',
                          background: 'rgba(255,255,255,0.1)',
                          padding: '2px 8px',
                          borderRadius: 3,
                          fontFamily: 'monospace',
                        }}
                      >
                        CUT {communityIndex + 1} OF {communityReelData.length}
                      </span>
                    </div>

                    <button
                      onClick={() => setShowSubmitModal(true)}
                      style={{
                        background: 'linear-gradient(90deg, #00e5ff, #c084fc)',
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
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                      <span style={{ fontSize: 9.5, color: '#39ff14', fontWeight: 700, letterSpacing: 1 }}>
                        NOW PLAYING:
                      </span>
                      <span style={{ fontSize: 9.5, color: '#fbbf24', letterSpacing: 1 }}>
                        {currentCommunityCut.audioTrack}
                      </span>
                    </div>
                    <h2
                      style={{
                        margin: 0,
                        fontFamily: "'Bebas Neue', sans-serif",
                        fontSize: 'clamp(1.5rem, 3.8vw, 2.6rem)',
                        letterSpacing: 4,
                        color: '#fff',
                        textShadow: '0 0 16px rgba(0, 229, 255, 0.9), 0 0 30px #000',
                        lineHeight: 1,
                      }}
                    >
                      {currentCommunityCut.title}
                    </h2>
                    <div style={{ fontSize: 10, color: '#00e5ff', marginTop: 2, fontWeight: 700 }}>
                      BY: {currentCommunityCut.creator} · PRESET: {currentCommunityCut.preset}
                    </div>

                    {/* Stepper Buttons */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 }}>
                      <button
                        onClick={() =>
                          setCommunityIndex((prev) => (prev - 1 + communityReelData.length) % communityReelData.length)
                        }
                        style={{
                          background: 'rgba(255,255,255,0.12)',
                          color: '#fff',
                          border: '1px solid rgba(255,255,255,0.3)',
                          borderRadius: 3,
                          padding: '3px 9px',
                          fontSize: 8.5,
                          cursor: 'pointer',
                        }}
                      >
                        ◀ PREV CUT
                      </button>
                      <button
                        onClick={() => setCommunityIndex((prev) => (prev + 1) % communityReelData.length)}
                        style={{
                          background: '#00e5ff',
                          color: '#000',
                          border: 'none',
                          borderRadius: 3,
                          padding: '3px 11px',
                          fontSize: 8.5,
                          fontWeight: 700,
                          cursor: 'pointer',
                        }}
                      >
                        NEXT CUT ▶
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* ─── SCREEN 3: 16MM MIDNIGHT GRINDHOUSE // EXPLOITATION SIGHT GAG ─── */}
              <div
                style={{
                  position: 'relative',
                  width: '25%',
                  height: '100%',
                  backgroundColor: '#0a0004',
                  overflow: 'hidden',
                }}
              >
                <video
                  src="./assets-bg/puppet-man/Bookstore_window_at_night_202608202035.mp4"
                  autoPlay={videoPlaying}
                  loop
                  muted
                  playsInline
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    filter: 'contrast(1.4) saturate(1.4) hue-rotate(330deg)',
                  }}
                  onError={(e) => {
                    e.currentTarget.src = "./assets-bg/puppet-man/Puppet_man_walking_past_bookstore_202608202034.mp4";
                  }}
                  ref={(el) => { if (el) { if (videoPlaying && el.paused) el.play().catch(()=>{}); else if (!videoPlaying && !el.paused) el.pause(); } }}
                />

                {/* 16mm Film Scratches & Sprocket Jitter Simulation */}
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    pointerEvents: 'none',
                    zIndex: 5,
                    background: 'repeating-linear-gradient(90deg, transparent, transparent 180px, rgba(255,255,255,0.06) 181px, transparent 183px)',
                    animation: 'film-scratch-jitter 0.18s steps(2) infinite',
                    mixBlendMode: 'screen',
                  }}
                />

                {/* Dramatic Blood-Red Slasher Vignette Glow */}
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    pointerEvents: 'none',
                    zIndex: 6,
                    background: 'radial-gradient(circle at 50% 50%, rgba(220, 20, 60, 0.15) 0%, rgba(136, 8, 28, 0.6) 80%, rgba(20, 0, 5, 0.95) 100%)',
                    animation: 'slasher-strobe 4s ease-in-out infinite',
                    mixBlendMode: 'multiply',
                  }}
                />

                {/* ── CHEEKY 16MM GRINDHOUSE CENSOR SIGHT GAG OVERLAY ── */}
                <div
                  style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    zIndex: 12,
                    pointerEvents: 'none',
                    width: '90%',
                    maxWidth: 580,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    animation: 'censor-wobble 2.5s ease-in-out infinite alternate',
                  }}
                >
                  <div
                    style={{
                      width: '100%',
                      backgroundColor: 'rgba(180, 10, 20, 0.92)',
                      border: '3px solid #ffdd00',
                      boxShadow: '0 0 35px rgba(220, 20, 60, 0.9), inset 0 0 15px rgba(0,0,0,0.8)',
                      padding: '10px 16px',
                      borderRadius: 4,
                      textAlign: 'center',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 2 }}>
                      <span style={{ fontSize: 16 }}>⚠️</span>
                      <span
                        style={{
                          fontFamily: "'Bebas Neue', sans-serif",
                          fontSize: 'clamp(1.3rem, 2.8vw, 2rem)',
                          letterSpacing: 4,
                          color: '#fff',
                          textShadow: '0 2px 4px #000, 0 0 10px #ffdd00',
                          lineHeight: 1,
                        }}
                      >
                        RESTRICTED: TOO HOT & TOO GORY FOR TV!
                      </span>
                      <span style={{ fontSize: 16 }}>⚠️</span>
                    </div>

                    <div
                      style={{
                        fontFamily: "'Space Mono', monospace",
                        fontSize: 8.5,
                        color: '#ffdd00',
                        fontWeight: 700,
                        letterSpacing: 2,
                        textTransform: 'uppercase',
                        marginTop: 2,
                      }}
                    >
                      THE MANAGEMENT WARNS THOSE WITH WEAK HEARTS: LOOK AWAY NOW!
                    </div>

                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 12,
                        marginTop: 6,
                        borderTop: '1px solid rgba(255, 221, 0, 0.4)',
                        paddingTop: 4,
                      }}
                    >
                      <span
                        style={{
                          fontSize: 7.5,
                          fontFamily: "'Syncopate', sans-serif",
                          fontWeight: 800,
                          backgroundColor: '#000',
                          color: '#ffdd00',
                          padding: '2px 6px',
                          borderRadius: 2,
                          border: '1px solid #ffdd00',
                        }}
                      >
                        RATED X · UNRATED REEL
                      </span>
                      <span style={{ fontSize: 8, color: '#fed7aa', fontFamily: 'monospace' }}>
                        16MM MIDNIGHT EXPLOITATION TRAILER REEL
                      </span>
                    </div>
                  </div>
                </div>

                {/* Screen 3 Top Marquee Header */}
                <div
                  style={{
                    position: 'absolute',
                    top: 14,
                    left: 20,
                    right: 20,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    zIndex: 10,
                    pointerEvents: 'none',
                  }}
                >
                  <div
                    style={{
                      fontFamily: "'Syncopate', sans-serif",
                      fontSize: 9.5,
                      letterSpacing: 2,
                      color: '#f43f5e',
                      fontWeight: 800,
                      background: 'rgba(0,0,0,0.75)',
                      padding: '5px 12px',
                      borderRadius: 3,
                      border: '1px solid rgba(244, 63, 94, 0.5)',
                      textShadow: '0 0 10px #f43f5e',
                    }}
                  >
                    SCREEN 3: 16MM MIDNIGHT GRINDHOUSE
                  </div>
                  <div
                    style={{
                      fontSize: 8.5,
                      fontFamily: 'monospace',
                      color: '#ffd',
                      background: 'rgba(0,0,0,0.6)',
                      padding: '3px 8px',
                      borderRadius: 2,
                    }}
                  >
                    SAN DIEGO · NORTH PARK VAULT
                  </div>
                </div>
              </div>

              {/* ─── SCREEN 4: LIVE AUDIO VISUALIZER & DELCO RADIO SIMULCAST ─── */}
              <div
                style={{
                  position: 'relative',
                  width: '25%',
                  height: '100%',
                  backgroundColor: '#02020a',
                  overflow: 'hidden',
                }}
              >
                {/* 1960s Vegas UFO B-Roll in Background */}
                {(() => {
                  const currentUfoClip = VEGAS_UFO_BROLL_CLIPS[ufoClipIndex % VEGAS_UFO_BROLL_CLIPS.length];
                  return (
                    <video
                      key={currentUfoClip.id}
                      src={currentUfoClip.url}
                      autoPlay={videoPlaying}
                      loop
                      muted
                      playsInline
                      style={{
                        position: 'absolute',
                        inset: 0,
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        opacity: 0.45,
                        filter: 'contrast(1.3) saturate(1.2) sepia(0.2)',
                      }}
                      ref={(el) => { if (el) { if (videoPlaying && el.paused) el.play().catch(()=>{}); else if (!videoPlaying && !el.paused) el.pause(); } }}
                    />
                  );
                })()}

                {/* Real-time Oscilloscope & Spectrum Visualizer Layer */}
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    zIndex: 4,
                    padding: '20px',
                    pointerEvents: 'none',
                  }}
                >
                  {/* Dynamic Audio-Reactive Waveform SVG */}
                  <svg width="100%" height="110" viewBox="0 0 600 110" style={{ overflow: 'visible' }}>
                    <defs>
                      <linearGradient id="spectrum-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#00e5ff" stopOpacity="0.9" />
                        <stop offset="50%" stopColor="#c084fc" stopOpacity="0.95" />
                        <stop offset="100%" stopColor="#ff6b00" stopOpacity="0.9" />
                      </linearGradient>
                    </defs>

                    {/* Frequency Bars reacting to bass & audio */}
                    {Array.from({ length: 32 }).map((_, i) => {
                      const barH = 12 + Math.sin(i * 0.4 + (bass * 5)) * 25 + (bass * 35);
                      const clampedH = Math.max(6, Math.min(85, barH));
                      const x = 30 + i * 17;
                      return (
                        <rect
                          key={`spec-bar-${i}`}
                          x={x}
                          y={55 - clampedH / 2}
                          width="10"
                          height={clampedH}
                          rx="3"
                          fill="url(#spectrum-grad)"
                          opacity={0.45 + (i % 3) * 0.2 + (bass * 0.35)}
                        />
                      );
                    })}

                    {/* Center Oscilloscope Beam */}
                    <path
                      d={`M 10 55 Q 150 ${55 - bass * 40}, 300 55 T 590 ${55 + bass * 35}`}
                      fill="none"
                      stroke="#39ff14"
                      strokeWidth={isTransient ? 3.5 : 2}
                      style={{
                        filter: 'drop-shadow(0 0 10px #39ff14)',
                        transition: 'stroke-width 0.1s',
                      }}
                    />
                  </svg>
                </div>

                {/* Screen 4 Header Bar */}
                <div
                  style={{
                    position: 'absolute',
                    top: 14,
                    left: 20,
                    right: 20,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    zIndex: 10,
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      background: 'rgba(0,0,0,0.75)',
                      padding: '5px 12px',
                      borderRadius: 3,
                      border: '1px solid rgba(192, 132, 252, 0.5)',
                    }}
                  >
                    <span style={{ fontSize: 13 }}>📻</span>
                    <span style={{ fontFamily: "'Syncopate', sans-serif", fontSize: 9.5, fontWeight: 800, color: '#c084fc', letterSpacing: 1.5 }}>
                      SCREEN 4: DELCO RADIO SIMULCAST
                    </span>
                    <span style={{ fontSize: 8, padding: '2px 5px', borderRadius: 2, background: '#39ff14', color: '#000', fontWeight: 800 }}>
                      ON AIR
                    </span>
                  </div>

                  {/* UFO Clip Steppers */}
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button
                      onClick={() =>
                        setUfoClipIndex((prev) => (prev - 1 + VEGAS_UFO_BROLL_CLIPS.length) % VEGAS_UFO_BROLL_CLIPS.length)
                      }
                      style={{
                        background: 'rgba(255,255,255,0.12)',
                        color: '#fff',
                        border: '1px solid rgba(255,255,255,0.3)',
                        borderRadius: 3,
                        padding: '3px 8px',
                        fontSize: 8.5,
                        cursor: 'pointer',
                      }}
                    >
                      ◀ UFO REEL
                    </button>
                    <button
                      onClick={() => setUfoClipIndex((prev) => (prev + 1) % VEGAS_UFO_BROLL_CLIPS.length)}
                      style={{
                        background: '#c084fc',
                        color: '#000',
                        border: 'none',
                        borderRadius: 3,
                        padding: '3px 10px',
                        fontSize: 8.5,
                        fontWeight: 700,
                        cursor: 'pointer',
                      }}
                    >
                      NEXT UFO ▶
                    </button>
                  </div>
                </div>

                {/* Screen 4 Bottom Telemetry */}
                <div
                  style={{
                    position: 'absolute',
                    bottom: 16,
                    left: 20,
                    right: 20,
                    zIndex: 10,
                    background: 'rgba(0,0,0,0.8)',
                    padding: '8px 16px',
                    borderRadius: 4,
                    border: '1px solid rgba(192, 132, 252, 0.4)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div>
                    <div style={{ fontSize: 9, color: '#39ff14', fontFamily: 'monospace' }}>
                      TRANSMITTING AT {activeStation.frequency} • {activeStation.title.toUpperCase()}
                    </div>
                    <div style={{ fontSize: 13, color: '#fff', fontWeight: 700 }}>
                      {currentTrackTitle || 'Interzone Broadcast Signal'}
                    </div>
                  </div>

                  <div style={{ fontSize: 9, color: '#c084fc', fontFamily: 'monospace', textAlign: 'right' }}>
                    DJ: DOC ENOCH · 432Hz OCCULT SONGBOOK
                  </div>
                </div>
              </div>
            </div>

            {/* 3. Floating Edge Pan Buttons (Click to Pan Camera across Horizon) */}
            {activeScreenIndex > 0 && (
              <button
                onClick={() => handleSelectScreen(activeScreenIndex - 1)}
                style={{
                  position: 'absolute',
                  left: 10,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  zIndex: 25,
                  background: 'rgba(0, 0, 0, 0.75)',
                  border: '1px solid #00e5ff',
                  color: '#00e5ff',
                  padding: '8px 12px',
                  borderRadius: '20px',
                  fontFamily: "'Syncopate', sans-serif",
                  fontSize: 8.5,
                  fontWeight: 800,
                  letterSpacing: 1,
                  cursor: 'pointer',
                  boxShadow: '0 0 15px rgba(0, 229, 255, 0.4)',
                  backdropFilter: 'blur(4px)',
                  transition: 'all 0.15s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#00e5ff';
                  e.currentTarget.style.color = '#000';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(0, 0, 0, 0.75)';
                  e.currentTarget.style.color = '#00e5ff';
                }}
              >
                ◀ SCREEN {activeScreenIndex}
              </button>
            )}

            {activeScreenIndex < 3 && (
              <button
                onClick={() => handleSelectScreen(activeScreenIndex + 1)}
                style={{
                  position: 'absolute',
                  right: 10,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  zIndex: 25,
                  background: 'rgba(0, 0, 0, 0.75)',
                  border: '1px solid #ff6b00',
                  color: '#ff6b00',
                  padding: '8px 12px',
                  borderRadius: '20px',
                  fontFamily: "'Syncopate', sans-serif",
                  fontSize: 8.5,
                  fontWeight: 800,
                  letterSpacing: 1,
                  cursor: 'pointer',
                  boxShadow: '0 0 15px rgba(255, 107, 0, 0.4)',
                  backdropFilter: 'blur(4px)',
                  transition: 'all 0.15s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#ff6b00';
                  e.currentTarget.style.color = '#000';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(0, 0, 0, 0.75)';
                  e.currentTarget.style.color = '#ff6b00';
                }}
              >
                SCREEN {activeScreenIndex + 2} ▶
              </button>
            )}

            {/* 4. Drive-In Projector Beam & Film Grain Overlay */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                pointerEvents: 'none',
                background: 'radial-gradient(ellipse at 50% 0%, rgba(255,255,255,0.08) 0%, transparent 70%)',
                mixBlendMode: 'screen',
                zIndex: 20,
              }}
            />

            {/* 5. Screen Speaker Box Overlay (Cast Metal Hanging Speaker) */}
            <div
              style={{
                position: 'absolute',
                bottom: 16,
                right: 20,
                zIndex: 22,
                backgroundColor: 'rgba(18, 18, 26, 0.94)',
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
              backgroundColor: 'rgba(10, 10, 18, 0.94)',
              borderRadius: 8,
              border: `2px solid ${activeStation.color}`,
              boxShadow: `0 0 25px ${activeStation.glow}, inset 0 0 30px rgba(0,0,0,0.9)`,
              padding: '16px 20px',
              display: 'flex',
              flexDirection: 'column',
              gap: 14,
              transition: 'border-color 0.3s, box-shadow 0.3s',
            }}
          >
            {/* Top Row: Vehicle Diagnostics & Broadcast Switches */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: 12,
                borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                paddingBottom: 10,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: '50%',
                    backgroundColor: '#05050c',
                    border: '2px solid #39ff14',
                    boxShadow: '0 0 10px rgba(57, 255, 20, 0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 20,
                  }}
                >
                  ☢️
                </div>
                <div>
                  <div style={{ fontFamily: "'Syncopate', sans-serif", fontSize: 10, fontWeight: 800, color: '#39ff14', letterSpacing: 1 }}>
                    1964 CHEVY MALIBU · REPO RAD-METER: 3.8 ROENTGENS
                  </div>
                  <div style={{ fontSize: 8.5, color: '#a1a1aa', fontFamily: 'monospace', marginTop: 2 }}>
                    Flight Mode: {malibuFlying ? '⚡ ACTIVE (ORBITAL)' : 'STANDBY'} · Antenna: 99.3 FM WHIP
                  </div>
                </div>
              </div>

              {/* R2 Sync & Doc Enoch DJ Toggle Buttons */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <button
                  onClick={() => setShowR2ConfigModal(true)}
                  style={{
                    background: r2UrlInput ? 'rgba(57, 255, 20, 0.15)' : 'rgba(255, 107, 0, 0.15)',
                    color: r2UrlInput ? '#39ff14' : '#ff6b00',
                    border: `1px solid ${r2UrlInput ? '#39ff14' : '#ff6b00'}`,
                    borderRadius: 3,
                    padding: '4px 9px',
                    fontFamily: "'Syncopate', sans-serif",
                    fontSize: 7.5,
                    fontWeight: 800,
                    letterSpacing: 0.8,
                    cursor: 'pointer',
                  }}
                  title="Configure Cloudflare R2 bucket link for custom radio audio"
                >
                  ⚙️ {r2UrlInput ? 'R2 BUCKET: CONNECTED' : 'CONNECT CLOUDFLARE R2'}
                </button>

                <button
                  onClick={() => setInterstitialMode((prev) => !prev)}
                  style={{
                    background: interstitialMode ? 'rgba(251, 191, 36, 0.2)' : 'rgba(255, 255, 255, 0.08)',
                    color: interstitialMode ? '#fbbf24' : '#888',
                    border: `1px solid ${interstitialMode ? '#fbbf24' : 'rgba(255, 255, 255, 0.2)'}`,
                    borderRadius: 3,
                    padding: '4px 9px',
                    fontFamily: "'Syncopate', sans-serif",
                    fontSize: 7.5,
                    fontWeight: 800,
                    letterSpacing: 0.8,
                    cursor: 'pointer',
                  }}
                  title="Toggle Doc Enoch DJ commentary, B-movie ads & snack bar bumpers between tracks"
                >
                  🎙️ {interstitialMode ? 'DJ DOC ENOCH & ADS: ON' : 'DJ CHATTER: OFF'}
                </button>
              </div>
            </div>

            {/* Middle Row: Vacuum Tube Tuner Display Face */}
            <div
              style={{
                backgroundColor: '#05050a',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                borderRadius: 5,
                padding: '12px 18px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: 14,
                boxShadow: 'inset 0 0 20px rgba(0,0,0,0.95)',
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                  <span
                    style={{
                      fontFamily: "'Bebas Neue', sans-serif",
                      fontSize: 32,
                      letterSpacing: 4,
                      color: activeStation.color,
                      textShadow: `0 0 14px ${activeStation.color}`,
                      lineHeight: 1,
                    }}
                  >
                    {activeStation.dial}
                  </span>
                  <span
                    style={{
                      fontFamily: "'Syncopate', sans-serif",
                      fontSize: 10.5,
                      fontWeight: 800,
                      color: '#fff',
                      letterSpacing: 2,
                    }}
                  >
                    {activeStation.name}
                  </span>
                  <span
                    style={{
                      fontSize: 8,
                      fontFamily: 'monospace',
                      color: activeStation.color,
                      border: `1px solid ${activeStation.color}`,
                      padding: '2px 6px',
                      borderRadius: 3,
                    }}
                  >
                    {activeStation.genre}
                  </span>
                </div>

                <div style={{ fontSize: 9.5, color: '#fbbf24', fontFamily: 'monospace' }}>
                  🎙️ HOST: <strong style={{ color: '#fff' }}>{activeStation.host}</strong> · {activeStation.vibe}
                </div>
                <div style={{ fontSize: 9, color: '#a1a1aa', fontStyle: 'italic', marginTop: 3 }}>
                  "{activeStation.slogan}"
                </div>

                {/* Delco Tactile Broadcast Power Switch & On-Air Lamp */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 8 }}>
                  <button
                    onClick={onTogglePlay}
                    style={{
                      background: isPlaying
                        ? 'linear-gradient(135deg, #ff6b00, #ff8800)'
                        : 'linear-gradient(135deg, rgba(255,255,255,0.15), rgba(255,255,255,0.05))',
                      color: isPlaying ? '#000' : '#fff',
                      border: `2px solid ${isPlaying ? '#ffaa00' : 'rgba(255,255,255,0.3)'}`,
                      borderRadius: 4,
                      padding: '5px 12px',
                      fontFamily: "'Syncopate', sans-serif",
                      fontSize: 8.5,
                      fontWeight: 800,
                      letterSpacing: 1,
                      cursor: 'pointer',
                      boxShadow: isPlaying ? '0 0 16px rgba(255, 107, 0, 0.8)' : 'none',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      transition: 'all 0.15s',
                    }}
                    title={isPlaying ? "Pause Radio Broadcast" : "Turn Delco Radio ON & Broadcast"}
                  >
                    <span>{isPlaying ? '⏸' : '▶'}</span>
                    <span>{isPlaying ? 'ON AIR' : 'POWER ON'}</span>
                  </button>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        backgroundColor: isPlaying ? '#39ff14' : '#ef4444',
                        boxShadow: isPlaying ? '0 0 10px #39ff14' : 'none',
                        display: 'inline-block',
                      }}
                    />
                    <span style={{ fontSize: 8.5, fontFamily: "'Space Mono', monospace", color: isPlaying ? '#39ff14' : '#a1a1aa' }}>
                      {isPlaying ? `TRANSMITTING: ${currentTrackTitle || activeStation.name}` : 'STANDBY · CLICK POWER ON TO TRANSMIT'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Station Audio Dispatch & Track Picker Cluster */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, minWidth: 290 }}>
                {/* Audio Mode Tabs */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexWrap: 'wrap' }}>
                  <button
                    onClick={() => setRadioSubTab('tracks')}
                    style={{
                      background: radioSubTab === 'tracks' ? activeStation.color : 'rgba(255,255,255,0.06)',
                      color: radioSubTab === 'tracks' ? '#000' : '#d4d4d8',
                      border: `1px solid ${radioSubTab === 'tracks' ? activeStation.color : 'rgba(255,255,255,0.15)'}`,
                      borderRadius: 3,
                      padding: '2px 7px',
                      fontSize: 8,
                      fontFamily: "'Syncopate', sans-serif",
                      fontWeight: 800,
                      cursor: 'pointer',
                      transition: 'all 0.15s',
                    }}
                  >
                    🎵 MUSIC ({activeStation.tracks.length})
                  </button>
                  <button
                    onClick={() => setRadioSubTab('enoch')}
                    style={{
                      background: radioSubTab === 'enoch' ? '#ff6b00' : 'rgba(255,255,255,0.06)',
                      color: radioSubTab === 'enoch' ? '#000' : '#ffaa55',
                      border: `1px solid ${radioSubTab === 'enoch' ? '#ff6b00' : 'rgba(255,107,0,0.3)'}`,
                      borderRadius: 3,
                      padding: '2px 7px',
                      fontSize: 8,
                      fontFamily: "'Syncopate', sans-serif",
                      fontWeight: 800,
                      cursor: 'pointer',
                      transition: 'all 0.15s',
                    }}
                  >
                    🎙️ DOC ENOCH ({DOC_ENOCH_MANIFEST.length})
                  </button>
                  <button
                    onClick={() => setRadioSubTab('ads')}
                    style={{
                      background: radioSubTab === 'ads' ? '#00e5ff' : 'rgba(255,255,255,0.06)',
                      color: radioSubTab === 'ads' ? '#000' : '#67e8f9',
                      border: `1px solid ${radioSubTab === 'ads' ? '#00e5ff' : 'rgba(0,229,255,0.3)'}`,
                      borderRadius: 3,
                      padding: '2px 7px',
                      fontSize: 8,
                      fontFamily: "'Syncopate', sans-serif",
                      fontWeight: 800,
                      cursor: 'pointer',
                      transition: 'all 0.15s',
                    }}
                  >
                    📻 1960s ADS ({VINTAGE_RADIO_ADS.length})
                  </button>
                </div>

                {/* SubTab 1: Standard Station Music Cuts */}
                {radioSubTab === 'tracks' && (
                  <select
                    value={activeStation.tracks.find((t) => t.title === currentTrackTitle)?.id || ''}
                    onChange={(e) => {
                      const sel = activeStation.tracks.find((t) => t.id === e.target.value);
                      if (sel && onSelectTrack) {
                        onSelectTrack({
                          ...sel,
                          url: resolveRadioAudioUrl(sel.url),
                        });
                        if (!isPlaying && onTogglePlay) {
                          onTogglePlay();
                        }
                      }
                    }}
                    style={{
                      backgroundColor: '#0a0a14',
                      color: '#fff',
                      border: `1px solid ${activeStation.color}`,
                      borderRadius: 4,
                      padding: '6px 10px',
                      fontFamily: 'monospace',
                      fontSize: 9.5,
                      cursor: 'pointer',
                      boxShadow: `0 0 8px ${activeStation.glow}`,
                      width: '100%',
                    }}
                  >
                    {activeStation.tracks.map((t, idx) => (
                      <option key={t.id || idx} value={t.id}>
                        {t.num ? `${t.num}. ` : `${idx + 1}. `}{t.title} ({Math.floor(t.duration / 60)}:{(t.duration % 60).toString().padStart(2, '0')})
                      </option>
                    ))}
                  </select>
                )}

                {/* SubTab 2: Doc Enoch 91 Voice Drops */}
                {radioSubTab === 'enoch' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                      {['all', 'intro', 'fact', 'error', 'station'].map((filt) => (
                        <button
                          key={filt}
                          onClick={() => setActiveEnochFilter(filt)}
                          style={{
                            background: activeEnochFilter === filt ? '#ff6b00' : 'rgba(255,255,255,0.05)',
                            color: activeEnochFilter === filt ? '#000' : '#a1a1aa',
                            border: '1px solid rgba(255,107,0,0.3)',
                            borderRadius: 2,
                            padding: '1px 5px',
                            fontSize: 7,
                            fontFamily: 'monospace',
                            cursor: 'pointer',
                            textTransform: 'uppercase',
                          }}
                        >
                          {filt}
                        </button>
                      ))}
                    </div>
                    <select
                      onChange={(e) => {
                        const drop = DOC_ENOCH_MANIFEST.find((d) => d.id === e.target.value);
                        if (drop && onSelectTrack) {
                          onSelectTrack({
                            id: drop.id,
                            title: `[DJ DROP] ${drop.track_title || drop.id}`,
                            artist: 'Doc Enoch · W-OCCULT 99.3',
                            url: resolveRadioAudioUrl(drop.url),
                            duration: drop.duration,
                            script: drop.script,
                          });
                          if (!isPlaying && onTogglePlay) {
                            onTogglePlay();
                          }
                        }
                      }}
                      style={{
                        backgroundColor: '#120d08',
                        color: '#ffaa55',
                        border: '1px solid #ff6b00',
                        borderRadius: 4,
                        padding: '6px 8px',
                        fontFamily: 'monospace',
                        fontSize: 9,
                        cursor: 'pointer',
                        boxShadow: '0 0 10px rgba(255,107,0,0.4)',
                        width: '100%',
                      }}
                    >
                      <option value="">🎙️ Select a Doc Enoch Drop to Broadcast...</option>
                      {DOC_ENOCH_MANIFEST.filter((d) => {
                        if (activeEnochFilter === 'all') return true;
                        if (activeEnochFilter === 'intro') return d.type === 'track_intro';
                        if (activeEnochFilter === 'fact') return d.type === 'fact_tangent';
                        if (activeEnochFilter === 'error') return d.type === 'transmission_error';
                        if (activeEnochFilter === 'station') return d.type === 'station_id' || d.type === 'weather' || d.type === 'bumper';
                        return true;
                      }).map((d) => (
                        <option key={d.id} value={d.id}>
                          [{d.type.toUpperCase()}] {d.track_title} ({d.duration}s)
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* SubTab 3: Authentic 1960s Radio Ads */}
                {radioSubTab === 'ads' && (
                  <select
                    onChange={(e) => {
                      const ad = VINTAGE_RADIO_ADS.find((a) => a.id === e.target.value);
                      if (ad && onSelectTrack) {
                        onSelectTrack({
                          id: ad.id,
                          title: `[AD] ${ad.title}`,
                          artist: 'Interzone Concessions (1965-1969)',
                          url: resolveRadioAudioUrl(ad.url),
                          duration: ad.duration,
                          script: ad.text,
                        });
                        if (!isPlaying && onTogglePlay) {
                          onTogglePlay();
                        }
                      }
                    }}
                    style={{
                      backgroundColor: '#051016',
                      color: '#67e8f9',
                      border: '1px solid #00e5ff',
                      borderRadius: 4,
                      padding: '6px 8px',
                      fontFamily: 'monospace',
                      fontSize: 9,
                      cursor: 'pointer',
                      boxShadow: '0 0 10px rgba(0,229,255,0.4)',
                      width: '100%',
                    }}
                  >
                    <option value="">📻 Select a 1960s Drive-In Spot to Broadcast...</option>
                    {VINTAGE_RADIO_ADS.map((ad) => (
                      <option key={ad.id} value={ad.id}>
                        [{ad.tag}] {ad.title} ({ad.duration}s)
                      </option>
                    ))}
                  </select>
                )}
              </div>
            </div>

            {/* Bottom Row: 5 Tactile Pushbutton Preset Switches */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <div style={{ fontSize: 8, color: '#71717a', fontFamily: "'Syncopate', sans-serif", letterSpacing: 1.5, fontWeight: 700 }}>
                PIRATE RADIO FREQUENCY PRESETS (CLICK TO TUNE):
              </div>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                  gap: 8,
                }}
              >
                {INTERZONE_RADIO_STATIONS.map((station) => {
                  const isActive = station.id === activeStationId;
                  return (
                    <button
                      key={station.id}
                      onClick={() => handleTuneStation(station.id)}
                      style={{
                        background: isActive
                          ? `linear-gradient(135deg, ${station.color}, #0a0a14)`
                          : 'rgba(255, 255, 255, 0.04)',
                        color: isActive ? '#000' : '#e4e4e7',
                        border: `1px solid ${isActive ? station.color : 'rgba(255, 255, 255, 0.15)'}`,
                        borderRadius: 4,
                        padding: '8px 10px',
                        cursor: 'pointer',
                        textAlign: 'left',
                        boxShadow: isActive ? `0 0 14px ${station.glow}` : 'none',
                        transition: 'all 0.15s ease',
                      }}
                      onMouseEnter={(e) => {
                        if (!isActive) {
                          e.currentTarget.style.borderColor = station.color;
                          e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.08)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isActive) {
                          e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.15)';
                          e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.04)';
                        }
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ fontFamily: "'Syncopate', sans-serif", fontSize: 9, fontWeight: 800 }}>
                          {station.icon} {station.dial}
                        </span>
                        {isActive && (
                          <span style={{ fontSize: 7, fontWeight: 800, color: '#000', backgroundColor: '#fff', padding: '1px 4px', borderRadius: 2 }}>
                            LIVE
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: 8.5, fontWeight: 700, marginTop: 2, color: isActive ? '#000' : station.color }}>
                        {station.shortName}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── CLOUDFLARE R2 BUCKET CONFIGURATION MODAL ── */}
      {showR2ConfigModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 1100,
            backgroundColor: 'rgba(0, 0, 0, 0.85)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 20,
          }}
          onClick={() => setShowR2ConfigModal(false)}
        >
          <div
            style={{
              backgroundColor: '#0a0a14',
              border: '2px solid #ff6b00',
              borderRadius: 8,
              boxShadow: '0 0 35px rgba(255, 107, 0, 0.5), inset 0 0 25px rgba(0,0,0,0.8)',
              maxWidth: 520,
              width: '100%',
              padding: 24,
              color: '#fff',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 26, letterSpacing: 3, color: '#ff6b00' }}>
                ⚙️ CLOUDFLARE R2 RADIO TRANSMITTER SYNC
              </div>
              <button
                onClick={() => setShowR2ConfigModal(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#888',
                  fontSize: 18,
                  cursor: 'pointer',
                }}
              >
                ✕
              </button>
            </div>

            <p style={{ fontSize: 10, color: '#a1a1aa', lineHeight: 1.5, marginBottom: 16 }}>
              Connect your Cloudflare R2 bucket public endpoint so the 1964 Malibu car radio can pull custom audio tracks, Doc Enoch DJ dispatches, and B-movie ads directly from your cloud storage.
            </p>

            <form onSubmit={handleSaveR2Url} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <label style={{ fontSize: 8.5, fontFamily: "'Syncopate', sans-serif", fontWeight: 700, color: '#39ff14', display: 'block', marginBottom: 4 }}>
                  R2 PUBLIC BASE URL (R2.DEV SUBDOMAIN OR CUSTOM DOMAIN):
                </label>
                <input
                  type="url"
                  placeholder="https://pub-xxxxxxxxxxxxxx.r2.dev"
                  value={r2UrlInput}
                  onChange={(e) => setR2UrlInput(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    backgroundColor: '#05050c',
                    border: '1px solid #39ff14',
                    borderRadius: 4,
                    color: '#fff',
                    fontFamily: 'monospace',
                    fontSize: 10,
                    boxShadow: '0 0 10px rgba(57, 255, 20, 0.25)',
                  }}
                />
              </div>

              <div style={{ fontSize: 8.5, color: '#fbbf24', background: 'rgba(251, 191, 36, 0.08)', padding: '6px 10px', borderRadius: 4, border: '1px solid rgba(251, 191, 36, 0.3)' }}>
                💡 Tip: Make sure public access is allowed on your R2 bucket settings and CORS allows GET requests.
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 8 }}>
                {r2UrlInput && (
                  <button
                    type="button"
                    onClick={() => {
                      setR2UrlInput('');
                      setR2BaseUrl('');
                      setShowR2ConfigModal(false);
                    }}
                    style={{
                      background: 'rgba(239, 68, 68, 0.2)',
                      color: '#f87171',
                      border: '1px solid #ef4444',
                      borderRadius: 4,
                      padding: '6px 12px',
                      fontSize: 9,
                      cursor: 'pointer',
                    }}
                  >
                    DISCONNECT
                  </button>
                )}
                <button
                  type="submit"
                  style={{
                    background: 'linear-gradient(90deg, #ff6b00, #ff8800)',
                    color: '#000',
                    border: 'none',
                    borderRadius: 4,
                    padding: '6px 18px',
                    fontFamily: "'Syncopate', sans-serif",
                    fontWeight: 800,
                    fontSize: 9,
                    letterSpacing: 1,
                    cursor: 'pointer',
                    boxShadow: '0 0 14px rgba(255, 107, 0, 0.5)',
                  }}
                >
                  SAVE & SYNC TRANSMITTER
                </button>
              </div>
            </form>
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
