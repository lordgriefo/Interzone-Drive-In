// src/components/DesertGliderWorld.jsx
// 🛸 3D DESERT GLIDER & INTERZONE FREE-ROAM EXPLORATION
// Built with Three.js (Procedural 3D WebGL Desert, Two Moons, Neon Drive-In Marquee,
// Circus Tent, Crashed Flying Saucer, Radioactive Crypt, Collectible Tokens, and Spatial Proximity).

import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { carnivalSFX } from '../utils/carnivalAudioEffects';

export function DesertGliderWorld({
  onClose,
  onEnterDeck,
  onOpenDenizen,
  tokens = 12,
  onAddTokens = () => {},
}) {
  const mountRef = useRef(null);
  const [cruiseMode, setCruiseMode] = useState(false);
  const [nearHotspot, setNearHotspot] = useState(null);
  const [speedBoost, setSpeedBoost] = useState(false);
  const [compassHeading, setCompassHeading] = useState(0);

  // Key states
  const keysRef = useRef({ w: false, s: false, a: false, d: false, space: false, shift: false });
  const cruiseRef = useRef(false);
  cruiseRef.current = cruiseMode;

  useEffect(() => {
    const mountEl = mountRef.current;
    if (!mountEl) return;

    // ── 1. THREE.JS SCENE SETUP ──────────────────────────────────────────────
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x060810, 0.0035);

    const camera = new THREE.PerspectiveCamera(65, mountEl.clientWidth / mountEl.clientHeight, 0.1, 2000);
    camera.position.set(0, 7, 75);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
    renderer.setSize(mountEl.clientWidth, mountEl.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    mountEl.appendChild(renderer.domElement);

    // ── 2. LIGHTING ─────────────────────────────────────────────────────────
    // Ambient moonlight
    const ambientLight = new THREE.AmbientLight(0x1e293b, 1.2);
    scene.add(ambientLight);

    // Directional moonlight (silver/cyan)
    const moonDirLight = new THREE.DirectionalLight(0x93c5fd, 1.6);
    moonDirLight.position.set(100, 200, -150);
    scene.add(moonDirLight);

    // ── 3. CELESTIAL SKYBOX & TWO MOONS (FROM INTERZONE PDF) ────────────────
    // Starfield particles
    const starCount = 3500;
    const starGeo = new THREE.BufferGeometry();
    const starPositions = new Float32Array(starCount * 3);
    const starColors = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);
      const r = 850 + Math.random() * 250;
      starPositions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      starPositions[i * 3 + 1] = Math.abs(r * Math.cos(phi)) + 20; // above horizon
      starPositions[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);

      // Star color variation (blue, amber, white)
      const colorChoice = Math.random();
      if (colorChoice < 0.6) {
        starColors[i * 3] = 0.9; starColors[i * 3 + 1] = 0.95; starColors[i * 3 + 2] = 1.0;
      } else if (colorChoice < 0.85) {
        starColors[i * 3] = 0.4; starColors[i * 3 + 1] = 0.8; starColors[i * 3 + 2] = 1.0;
      } else {
        starColors[i * 3] = 1.0; starColors[i * 3 + 1] = 0.7; starColors[i * 3 + 2] = 0.4;
      }
    }
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    starGeo.setAttribute('color', new THREE.BufferAttribute(starColors, 3));
    const starMat = new THREE.PointsMaterial({ size: 2.2, vertexColors: true, transparent: true, opacity: 0.85 });
    const starField = new THREE.Points(starGeo, starMat);
    scene.add(starField);

    // Moon 1: Large Cratered Silver Moon
    const moon1Geo = new THREE.SphereGeometry(32, 32, 32);
    const moon1Mat = new THREE.MeshBasicMaterial({ color: 0xdbeafe });
    const moon1 = new THREE.Mesh(moon1Geo, moon1Mat);
    moon1.position.set(-220, 260, -600);
    scene.add(moon1);

    // Moon 1 Halo Glow
    const halo1Geo = new THREE.SphereGeometry(38, 16, 16);
    const halo1Mat = new THREE.MeshBasicMaterial({ color: 0x60a5fa, transparent: true, opacity: 0.22, side: THREE.BackSide });
    moon1.add(new THREE.Mesh(halo1Geo, halo1Mat));

    // Moon 2: Glowing Turquoise Ringed Planet (from the PDF)
    const planetGeo = new THREE.SphereGeometry(22, 32, 32);
    const planetMat = new THREE.MeshBasicMaterial({ color: 0x06b6d4 });
    const planet = new THREE.Mesh(planetGeo, planetMat);
    planet.position.set(160, 290, -550);
    scene.add(planet);

    // Planet Planetary Ring
    const ringGeo = new THREE.RingGeometry(28, 44, 48);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0x22d3ee, side: THREE.DoubleSide, transparent: true, opacity: 0.65 });
    const ringMesh = new THREE.Mesh(ringGeo, ringMat);
    ringMesh.rotation.x = Math.PI / 2.8;
    planet.add(ringMesh);

    // Distant Vegas Golden Horizon Glow Ribbon
    const vegasGeo = new THREE.CylinderGeometry(850, 850, 24, 64, 1, true, 0, Math.PI);
    const vegasMat = new THREE.MeshBasicMaterial({ color: 0xf59e0b, transparent: true, opacity: 0.12, side: THREE.BackSide });
    const vegasGlow = new THREE.Mesh(vegasGeo, vegasMat);
    vegasGlow.position.set(0, 10, -500);
    scene.add(vegasGlow);

    // ── 4. MOJAVE DESERT TERRAIN ─────────────────────────────────────────────
    const terrainWidth = 1200;
    const terrainHeight = 1200;
    const terrainSegments = 120;
    const terrainGeo = new THREE.PlaneGeometry(terrainWidth, terrainHeight, terrainSegments, terrainSegments);
    terrainGeo.rotateX(-Math.PI / 2);

    const posAttr = terrainGeo.attributes.position;
    for (let i = 0; i < posAttr.count; i++) {
      const x = posAttr.getX(i);
      const z = posAttr.getZ(i);
      // Gentle rolling sand dunes + dry wash hollow in center
      const distFromCenter = Math.sqrt(x * x + z * z);
      const dune1 = Math.sin(x * 0.012) * Math.cos(z * 0.012) * 5.5;
      const dune2 = Math.sin(x * 0.025 + 1.2) * 2.8;
      let y = (dune1 + dune2) * Math.min(1, distFromCenter * 0.01);
      if (distFromCenter < 120) y *= 0.25; // flat drive-in parking bowl
      posAttr.setY(i, y);
    }
    terrainGeo.computeVertexNormals();

    const terrainMat = new THREE.MeshStandardMaterial({
      color: 0x1a140f,
      roughness: 0.92,
      metalness: 0.05,
      flatShading: true,
    });
    const terrainMesh = new THREE.Mesh(terrainGeo, terrainMat);
    scene.add(terrainMesh);

    // ── 5. LANDMARK 1: THE NEON "INTERZONE DRIVE-IN" MARQUEE ─────────────────
    const marqueeGroup = new THREE.Group();
    marqueeGroup.position.set(0, 0, 30);

    // Wooden / Steel Pylons
    const poleGeo = new THREE.CylinderGeometry(0.5, 0.5, 18, 8);
    const poleMat = new THREE.MeshStandardMaterial({ color: 0x271e16, roughness: 0.8 });
    const poleL = new THREE.Mesh(poleGeo, poleMat);
    poleL.position.set(-10, 9, 0);
    const poleR = new THREE.Mesh(poleGeo, poleMat);
    poleR.position.set(10, 9, 0);
    marqueeGroup.add(poleL, poleR);

    // Main Marquee Billboard Box
    const signBoxGeo = new THREE.BoxGeometry(26, 8, 1.8);
    const signBoxMat = new THREE.MeshStandardMaterial({ color: 0x0f0b08, roughness: 0.7 });
    const signBox = new THREE.Mesh(signBoxGeo, signBoxMat);
    signBox.position.set(0, 15, 0);
    marqueeGroup.add(signBox);

    // Glowing Neon Tube Face (Red / Amber glowing material)
    const neonFaceGeo = new THREE.PlaneGeometry(24.5, 6.5);
    const neonFaceMat = new THREE.MeshBasicMaterial({ color: 0xf97316 });
    const neonFaceFront = new THREE.Mesh(neonFaceGeo, neonFaceMat);
    neonFaceFront.position.set(0, 15, 0.95);
    const neonFaceBack = new THREE.Mesh(neonFaceGeo, neonFaceMat);
    neonFaceBack.position.set(0, 15, -0.95);
    neonFaceBack.rotation.y = Math.PI;
    marqueeGroup.add(neonFaceFront, neonFaceBack);

    // Neon Point Light casting amber glow on the ground
    const neonPointLight = new THREE.PointLight(0xf97316, 3.5, 65, 1.8);
    neonPointLight.position.set(0, 15, 5);
    marqueeGroup.add(neonPointLight);

    scene.add(marqueeGroup);

    // ── 6. LANDMARK 2: GIANT 60-FOOT PROJECTION SCREEN TOWER ────────────────
    const screenGroup = new THREE.Group();
    screenGroup.position.set(0, 0, -90);

    // Screen tower frame
    const towerGeo = new THREE.BoxGeometry(64, 38, 2);
    const towerMat = new THREE.MeshStandardMaterial({ color: 0x181410, roughness: 0.8 });
    const tower = new THREE.Mesh(towerGeo, towerMat);
    tower.position.set(0, 22, 0);
    screenGroup.add(tower);

    // Canvas Projection Surface (Bright cinematic white-cyan glow)
    const screenSurfGeo = new THREE.PlaneGeometry(58, 32);
    const screenSurfMat = new THREE.MeshBasicMaterial({ color: 0xe0f2fe });
    const screenSurf = new THREE.Mesh(screenSurfGeo, screenSurfMat);
    screenSurf.position.set(0, 22, 1.05);
    screenGroup.add(screenSurf);

    // Projection Beam Cone Light
    const beamGeo = new THREE.ConeGeometry(38, 90, 16, 1, true);
    beamGeo.rotateX(Math.PI / 2);
    const beamMat = new THREE.MeshBasicMaterial({
      color: 0x93c5fd,
      transparent: true,
      opacity: 0.08,
      side: THREE.DoubleSide,
    });
    const projBeam = new THREE.Mesh(beamGeo, beamMat);
    projBeam.position.set(0, 22, 45);
    screenGroup.add(projBeam);

    scene.add(screenGroup);

    // ── 7. LANDMARK 3: THE 1930s CIRCUS SIDESHOW TENT ────────────────────────
    const tentGroup = new THREE.Group();
    tentGroup.position.set(-110, 0, -10);

    // Tent cone
    const tentConeGeo = new THREE.ConeGeometry(24, 20, 16);
    const tentConeMat = new THREE.MeshStandardMaterial({ color: 0x991b1b, roughness: 0.7 });
    const tentCone = new THREE.Mesh(tentConeGeo, tentConeMat);
    tentCone.position.set(0, 18, 0);
    tentGroup.add(tentCone);

    // Tent wall cylinder
    const tentWallGeo = new THREE.CylinderGeometry(24, 24, 10, 16, 1, true);
    const tentWallMat = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.75, side: THREE.DoubleSide });
    const tentWall = new THREE.Mesh(tentWallGeo, tentWallMat);
    tentWall.position.set(0, 5, 0);
    tentGroup.add(tentWall);

    // Tent Entrance warm lantern
    const tentLight = new THREE.PointLight(0xf59e0b, 2.8, 50);
    tentLight.position.set(0, 6, 26);
    tentGroup.add(tentLight);

    scene.add(tentGroup);

    // ── 8. LANDMARK 4: STARPORT & CRASHED FLYING SAUCER ─────────────────────
    const saucerGroup = new THREE.Group();
    saucerGroup.position.set(120, 0, -20);

    // Flying saucer hull
    const hullTopGeo = new THREE.SphereGeometry(14, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2.2);
    const hullMat = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.9, roughness: 0.2 });
    const hullTop = new THREE.Mesh(hullTopGeo, hullMat);
    hullTop.position.set(0, 4, 0);
    saucerGroup.add(hullTop);

    // Glowing cyan energy ring
    const saucerRingGeo = new THREE.TorusGeometry(15, 0.9, 12, 32);
    const saucerRingMat = new THREE.MeshBasicMaterial({ color: 0x06b6d4 });
    const saucerRing = new THREE.Mesh(saucerRingGeo, saucerRingMat);
    saucerRing.position.set(0, 4, 0);
    saucerRing.rotation.x = Math.PI / 2;
    saucerGroup.add(saucerRing);

    // Cyan glowing light
    const saucerLight = new THREE.PointLight(0x06b6d4, 3.5, 60);
    saucerLight.position.set(0, 5, 0);
    saucerGroup.add(saucerLight);

    scene.add(saucerGroup);

    // ── 9. LANDMARK 5: B-MOVIE RADIOACTIVE MONSTER CRYPT ────────────────────
    const cryptGroup = new THREE.Group();
    cryptGroup.position.set(-60, 0, -160);

    // Concrete bunker
    const bunkerGeo = new THREE.BoxGeometry(28, 12, 24);
    const bunkerMat = new THREE.MeshStandardMaterial({ color: 0x1c1917, roughness: 0.95 });
    const bunker = new THREE.Mesh(bunkerGeo, bunkerMat);
    bunker.position.set(0, 6, 0);
    cryptGroup.add(bunker);

    // Glowing toxic green light
    const cryptLight = new THREE.PointLight(0x22c55e, 3.5, 55);
    cryptLight.position.set(0, 8, 14);
    cryptGroup.add(cryptLight);

    scene.add(cryptGroup);

    // ── 10. PARKED CARS & SPEAKER POSTS ──────────────────────────────────────
    const carMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.6, roughness: 0.4 });
    const carWindowMat = new THREE.MeshBasicMaterial({ color: 0x93c5fd });
    const carRows = [
      { z: -35, count: 6, spacing: 14 },
      { z: -10, count: 8, spacing: 14 },
      { z: 15, count: 7, spacing: 15 },
    ];

    carRows.forEach((row) => {
      for (let i = 0; i < row.count; i++) {
        const x = (i - (row.count - 1) / 2) * row.spacing;
        const car = new THREE.Group();
        car.position.set(x + (Math.random() - 0.5) * 2, 1.2, row.z);

        // Body
        const body = new THREE.Mesh(new THREE.BoxGeometry(4.2, 1.5, 8.5), carMat);
        car.add(body);
        // Cabin
        const cabin = new THREE.Mesh(new THREE.BoxGeometry(3.6, 1.2, 4.2), carWindowMat);
        cabin.position.set(0, 1.2, -0.4);
        car.add(cabin);
        // Tail lights
        const tailLight = new THREE.Mesh(new THREE.BoxGeometry(3.8, 0.4, 0.2), new THREE.MeshBasicMaterial({ color: 0xdc2626 }));
        tailLight.position.set(0, 0.2, 4.3);
        car.add(tailLight);

        // Speaker Post beside car
        const post = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 4), poleMat);
        post.position.set(2.8, 1.8, 0);
        const speakerHead = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.6, 0.4), carMat);
        speakerHead.position.set(2.8, 3.8, 0);
        car.add(post, speakerHead);

        scene.add(car);
      }
    });

    // ── 11. SCATTERED JOSHUA TREES & CACTI ──────────────────────────────────
    const cactusGeo = new THREE.CylinderGeometry(0.4, 0.5, 6, 6);
    const cactusMat = new THREE.MeshStandardMaterial({ color: 0x14532d, roughness: 0.9 });
    for (let i = 0; i < 40; i++) {
      const angle = Math.random() * Math.PI * 2;
      const dist = 70 + Math.random() * 260;
      const cx = Math.cos(angle) * dist;
      const cz = Math.sin(angle) * dist;
      const cactus = new THREE.Mesh(cactusGeo, cactusMat);
      cactus.position.set(cx, 3, cz);
      scene.add(cactus);
    }

    // ── 12. FLOATING COLLECTIBLE BRASS TOKENS ────────────────────────────────
    const tokenTokens = [];
    const tokenGeo = new THREE.CylinderGeometry(1.2, 1.2, 0.2, 16);
    tokenGeo.rotateX(Math.PI / 2);
    const tokenMat = new THREE.MeshStandardMaterial({ color: 0xfbbf24, metalness: 0.9, roughness: 0.2 });

    const tokenCoords = [
      { x: 0, z: 12 }, { x: -35, z: 2 }, { x: 35, z: -15 },
      { x: -90, z: -10 }, { x: 95, z: -20 }, { x: 0, z: -60 },
      { x: -50, z: -130 }, { x: 40, z: -120 }, { x: -20, z: -35 },
      { x: 20, z: 25 }, { x: -80, z: 40 }, { x: 80, z: 35 },
    ];

    tokenCoords.forEach((coord, i) => {
      const tokenMesh = new THREE.Mesh(tokenGeo, tokenMat);
      tokenMesh.position.set(coord.x, 2.5, coord.z);
      scene.add(tokenMesh);
      tokenTokens.push({ mesh: tokenMesh, active: true, id: i });
    });

    // ── 13. HOTSPOT DEFINITIONS (FOR PROXIMITY HUD) ──────────────────────────
    const HOTSPOTS = [
      { id: 'marquee', name: 'NEON MARQUEE SIGN', x: 0, z: 30, radius: 26, actionLabel: 'SURVEY ENTRANCE' },
      { id: 'screen', name: 'THE DRIVE-IN SCREEN', x: 0, z: -90, radius: 36, actionLabel: 'ENTER KINETO-CUT' },
      { id: 'tent', name: '1930s CIRCUS SIDESHOW', x: -110, z: -10, radius: 32, actionLabel: 'TALK TO BARKER' },
      { id: 'saucer', name: 'INTERDIMENSIONAL STARPORT', x: 120, z: -20, radius: 32, actionLabel: 'COMMUNICATE WITH ALIEN' },
      { id: 'crypt', name: 'B-MOVIE MONSTER CRYPT', x: -60, z: -160, radius: 30, actionLabel: 'OPEN SPLICER LAB' },
    ];

    // ── 14. INPUT CONTROLS (WASD + MOUSE DRAG LOOK) ─────────────────────────
    const keys = keysRef.current;
    const onKeyDown = (e) => {
      const k = e.key.toLowerCase();
      if (k === 'w' || k === 'arrowup') keys.w = true;
      if (k === 's' || k === 'arrowdown') keys.s = true;
      if (k === 'a' || k === 'arrowleft') keys.a = true;
      if (k === 'd' || k === 'arrowright') keys.d = true;
      if (k === ' ' || k === 'spacebar') keys.space = true;
      if (k === 'shift') setSpeedBoost(true);
      if (k === 'e' || k === 'enter') triggerNearestHotspot();
    };

    const onKeyUp = (e) => {
      const k = e.key.toLowerCase();
      if (k === 'w' || k === 'arrowup') keys.w = false;
      if (k === 's' || k === 'arrowdown') keys.s = false;
      if (k === 'a' || k === 'arrowleft') keys.a = false;
      if (k === 'd' || k === 'arrowright') keys.d = false;
      if (k === ' ' || k === 'spacebar') keys.space = false;
      if (k === 'shift') setSpeedBoost(false);
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);

    // Mouse drag orbit
    let isMouseDown = false;
    let prevMouseX = 0;
    let cameraYaw = 0;

    const onMouseDown = (e) => { isMouseDown = true; prevMouseX = e.clientX; };
    const onMouseUp = () => { isMouseDown = false; };
    const onMouseMove = (e) => {
      if (!isMouseDown) return;
      const deltaX = e.clientX - prevMouseX;
      prevMouseX = e.clientX;
      cameraYaw -= deltaX * 0.0035;
    };

    mountEl.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mouseup', onMouseUp);
    window.addEventListener('mousemove', onMouseMove);

    // Resize handler
    const onResize = () => {
      if (!mountEl) return;
      camera.aspect = mountEl.clientWidth / mountEl.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mountEl.clientWidth, mountEl.clientHeight);
    };
    window.addEventListener('resize', onResize);

    // ── 15. MAIN ANIMATION LOOP ─────────────────────────────────────────────
    let animId;
    let clock = new THREE.Clock();
    let cruiseAngle = 0;

    const triggerNearestHotspot = () => {
      const current = activeHotspotRef.current;
      if (!current) return;
      if (current.id === 'screen') onEnterDeck?.();
      else if (current.id === 'tent') onOpenDenizen?.('barker');
      else if (current.id === 'saucer') onOpenDenizen?.('xur7');
      else if (current.id === 'crypt') onOpenDenizen?.('gillman');
      else if (current.id === 'marquee') onClose?.();
    };

    const activeHotspotRef = { current: null };

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const delta = Math.min(clock.getDelta(), 0.1);
      const time = clock.getElapsedTime();

      // Spin tokens
      tokenTokens.forEach((t) => {
        if (!t.active) return;
        t.mesh.rotation.z += 0.04;
        t.mesh.position.y = 2.5 + Math.sin(time * 3 + t.id) * 0.4;

        // Check player collection
        const dist = camera.position.distanceTo(t.mesh.position);
        if (dist < 4.5) {
          t.active = false;
          scene.remove(t.mesh);
          carnivalSFX.playCoinClink();
          onAddTokens(1);
        }
      });

      // Neon sign & screen flicker
      neonPointLight.intensity = 3.2 + Math.sin(time * 12) * 0.4 + (Math.random() < 0.05 ? -0.8 : 0);
      screenSurfMat.color.setHex(time % 4 < 2 ? 0xe0f2fe : 0xfef08a);

      // Movement handling
      const currentSpeed = (speedBoost ? 55 : 28) * delta;

      if (cruiseRef.current) {
        // Smooth cinematic automatic cruise around the desert
        cruiseAngle += delta * 0.18;
        const radiusX = 130;
        const radiusZ = 120;
        camera.position.x = Math.sin(cruiseAngle) * radiusX;
        camera.position.z = Math.cos(cruiseAngle) * radiusZ - 40;
        camera.position.y = 12 + Math.sin(cruiseAngle * 2) * 4;
        camera.lookAt(0, 16, -40); // look at the drive-in center
      } else {
        // Manual WASD exploration
        const forward = new THREE.Vector3(-Math.sin(cameraYaw), 0, -Math.cos(cameraYaw));
        const right = new THREE.Vector3(Math.cos(cameraYaw), 0, -Math.sin(cameraYaw));

        if (keys.w) camera.position.addScaledVector(forward, currentSpeed);
        if (keys.s) camera.position.addScaledVector(forward, -currentSpeed);
        if (keys.a) camera.position.addScaledVector(right, -currentSpeed);
        if (keys.d) camera.position.addScaledVector(right, currentSpeed);
        if (keys.space) camera.position.y = Math.min(camera.position.y + 12 * delta, 40);
        else camera.position.y = Math.max(5.5, camera.position.y - 8 * delta); // gentle gravity

        // Keep inside bounds
        camera.position.x = Math.max(-280, Math.min(280, camera.position.x));
        camera.position.z = Math.max(-280, Math.min(220, camera.position.z));

        // Look direction
        camera.rotation.set(0, cameraYaw, 0, 'YXZ');
      }

      // Update Compass Heading
      setCompassHeading(Math.round(((cameraYaw % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2) * (180 / Math.PI)));

      // Check Proximity to Hotspots
      let found = null;
      for (const h of HOTSPOTS) {
        const dx = camera.position.x - h.x;
        const dz = camera.position.z - h.z;
        const dist = Math.sqrt(dx * dx + dz * dz);
        if (dist < h.radius) {
          found = h;
          break;
        }
      }
      activeHotspotRef.current = found;
      setNearHotspot(found);

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      mountEl.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('resize', onResize);
      renderer.dispose();
      if (mountEl.contains(renderer.domElement)) {
        mountEl.removeChild(renderer.domElement);
      }
    };
  }, [onEnterDeck, onOpenDenizen, onClose, onAddTokens, speedBoost]);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 99999,
        backgroundColor: '#000',
        overflow: 'hidden',
        userSelect: 'none',
      }}
    >
      {/* 3D WebGL Canvas Container */}
      <div ref={mountRef} style={{ width: '100%', height: '100%' }} />

      {/* ── TOP HEADS-UP DISPLAY (HUD) ── */}
      <div
        style={{
          position: 'absolute',
          top: 16,
          left: 20,
          right: 20,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          pointerEvents: 'none',
          fontFamily: "'Space Mono', monospace",
        }}
      >
        {/* Radar Telemetry & Tokens */}
        <div
          style={{
            pointerEvents: 'auto',
            padding: '8px 16px',
            backgroundColor: 'rgba(15, 12, 9, 0.85)',
            border: '2px solid #f59e0b',
            borderRadius: 6,
            color: '#fef08a',
            fontSize: 11,
            display: 'flex',
            alignItems: 'center',
            gap: 14,
            boxShadow: '0 0 20px rgba(245, 158, 11, 0.3)',
          }}
        >
          <span style={{ fontWeight: 800 }}>🛸 MOJAVE DESERT GLIDER</span>
          <span style={{ color: '#78350f' }}>|</span>
          <span>HEADING: {compassHeading}°</span>
          <span style={{ color: '#78350f' }}>|</span>
          <span>🪙 {tokens} TOKENS</span>
        </div>

        {/* Glider Mode Buttons */}
        <div style={{ display: 'flex', gap: 10, pointerEvents: 'auto' }}>
          <button
            onClick={() => setCruiseMode((v) => !v)}
            style={{
              padding: '8px 16px',
              backgroundColor: cruiseMode ? '#06b6d4' : 'rgba(0,0,0,0.7)',
              color: cruiseMode ? '#000' : '#67e8f9',
              border: '1px solid #06b6d4',
              borderRadius: 4,
              fontSize: 11,
              fontWeight: 800,
              fontFamily: "'Syncopate', sans-serif",
              cursor: 'pointer',
              boxShadow: cruiseMode ? '0 0 16px #06b6d4' : 'none',
            }}
          >
            {cruiseMode ? '🛸 CRUISE: ACTIVE (CLICK TO PILOT)' : '🛸 CRUISE MODE'}
          </button>

          <button
            onClick={onClose}
            style={{
              padding: '8px 16px',
              backgroundColor: '#ea580c',
              color: '#000',
              border: 'none',
              borderRadius: 4,
              fontSize: 11,
              fontWeight: 900,
              fontFamily: "'Syncopate', sans-serif",
              cursor: 'pointer',
              boxShadow: '0 0 16px #ea580c',
            }}
          >
            ✕ EXIT TO MARQUEE
          </button>
        </div>
      </div>

      {/* ── NEARBY HOTSPOT INTERACTIVE POPUP ── */}
      {nearHotspot && (
        <div
          style={{
            position: 'absolute',
            bottom: 40,
            left: '50%',
            transform: 'translateX(-50%)',
            padding: '14px 28px',
            backgroundColor: 'rgba(15, 12, 9, 0.94)',
            border: '2px solid #f59e0b',
            borderRadius: 6,
            boxShadow: '0 0 35px rgba(245, 158, 11, 0.5)',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 8,
            fontFamily: "'Space Mono', monospace",
          }}
        >
          <div style={{ fontSize: 13, fontWeight: 900, color: '#fef08a' }}>
            📍 REACHED: {nearHotspot.name}
          </div>
          <div style={{ fontSize: 10, color: '#d6c7b2' }}>
            PRESS <kbd style={{ padding: '2px 6px', backgroundColor: '#33271b', borderRadius: 2 }}>E</kbd> OR CLICK BELOW TO INTERACT
          </div>
          <button
            onClick={() => {
              if (nearHotspot.id === 'screen') onEnterDeck?.();
              else if (nearHotspot.id === 'tent') onOpenDenizen?.('barker');
              else if (nearHotspot.id === 'saucer') onOpenDenizen?.('xur7');
              else if (nearHotspot.id === 'crypt') onOpenDenizen?.('gillman');
              else if (nearHotspot.id === 'marquee') onClose?.();
            }}
            style={{
              marginTop: 4,
              padding: '8px 22px',
              backgroundColor: '#f59e0b',
              color: '#000',
              fontWeight: 900,
              fontFamily: "'Syncopate', sans-serif",
              fontSize: 11,
              borderRadius: 3,
              border: 'none',
              cursor: 'pointer',
              boxShadow: '0 0 16px #f59e0b',
            }}
          >
            {nearHotspot.actionLabel} ➔
          </button>
        </div>
      )}

      {/* ── BOTTOM FLIGHT CONTROLS GUIDE ── */}
      <div
        style={{
          position: 'absolute',
          bottom: 14,
          left: 20,
          pointerEvents: 'none',
          fontSize: 10,
          color: 'rgba(255,255,255,0.6)',
          fontFamily: "'Space Mono', monospace",
        }}
      >
        [W/A/S/D] Glide & Turn · [SPACE] Hover Altitude · [MOUSE DRAG] 360° Pan · [SHIFT] Turbo Boost
      </div>
    </div>
  );
}
