import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';

interface DriveIn3DStageProps {
  activeScreenIndex: number;
  onSelectScreen: (index: number) => void;
  videoPlaying: boolean;
  malibuFlying: boolean;
  bass?: number;
  isTransient?: boolean;
  currentCommunityCut?: {
    id: string;
    title: string;
    creator: string;
    preset: string;
    audioTrack: string;
    videoUrl: string;
  };
  activeStation?: {
    id: string;
    dial: string;
    name: string;
    callSign: string;
    host: string;
    color: string;
    glow: string;
  };
  currentTrackTitle?: string;
  isDrivingIn: boolean;
  onFinishDrivingIn: () => void;
  onReplayDrivingIn: () => void;
  onOpenSubmitModal?: () => void;
}

// ── Screen Coordinates in the 3D Drive-In Lot ──
const SCREEN_CONFIGS = [
  { id: 0, title: 'Screen 1: Strangelet Lab Showcase', x: -95, y: 17, z: -180, rotY: 0.38 },
  { id: 1, title: 'Screen 2: Indie MV & KinetoCut', x: -32, y: 17, z: -215, rotY: 0.14 },
  { id: 2, title: 'Screen 3: 16mm Midnight Grindhouse', x: 32, y: 17, z: -215, rotY: -0.14 },
  { id: 3, title: 'Screen 4: Visualizer & WSTR Simulcast', x: 95, y: 17, z: -180, rotY: -0.38 },
];

// Target Camera Positions & LookAts for Each Screen View
const CAMERA_TARGETS = [
  { pos: new THREE.Vector3(-45, 6, -115), lookAt: new THREE.Vector3(-95, 17, -180) },
  { pos: new THREE.Vector3(-15, 6, -135), lookAt: new THREE.Vector3(-32, 17, -215) },
  { pos: new THREE.Vector3(15, 6, -135), lookAt: new THREE.Vector3(32, 17, -215) },
  { pos: new THREE.Vector3(45, 6, -115), lookAt: new THREE.Vector3(95, 17, -180) },
];

export function DriveIn3DStage({
  activeScreenIndex,
  onSelectScreen,
  videoPlaying,
  malibuFlying,
  bass = 0,
  isTransient = false,
  currentCommunityCut,
  activeStation,
  currentTrackTitle,
  isDrivingIn,
  onFinishDrivingIn,
  onReplayDrivingIn,
  onOpenSubmitModal,
}: DriveIn3DStageProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoveredScreen, setHoveredScreen] = useState<number | null>(null);

  // Hidden HTML5 Video Elements used as live Three.js textures
  const video1Ref = useRef<HTMLVideoElement>(null);
  const video2Ref = useRef<HTMLVideoElement>(null);
  const video3Ref = useRef<HTMLVideoElement>(null);

  // Canvases for Screen 3 (Grindhouse/Test Pattern) and Screen 4 (Visualizer)
  const screen3CanvasRef = useRef<HTMLCanvasElement | null>(null);
  const screen4CanvasRef = useRef<HTMLCanvasElement | null>(null);
  const signCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Three.js instances
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const screenMeshesRef = useRef<THREE.Mesh[]>([]);

  // Panning & Angular Velocity tracking
  const currentPosRef = useRef(new THREE.Vector3(0, 4, 40));
  const currentLookAtRef = useRef(new THREE.Vector3(-35, 6, -40));
  const prevLookAtRef = useRef(new THREE.Vector3(-35, 6, -40));
  const angularVelocityRef = useRef(0);
  const driveInStartRef = useRef<number | null>(null);

  // Create Roadside Sign Canvas Texture
  const getSignTexture = useCallback(() => {
    if (!signCanvasRef.current) {
      signCanvasRef.current = document.createElement('canvas');
      signCanvasRef.current.width = 1024;
      signCanvasRef.current.height = 512;
    }
    const canvas = signCanvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    ctx.fillStyle = '#0a0a14';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Glowing Neon Border
    ctx.strokeStyle = '#ff6b00';
    ctx.lineWidth = 14;
    ctx.strokeRect(16, 16, canvas.width - 32, canvas.height - 32);

    ctx.strokeStyle = '#00e5ff';
    ctx.lineWidth = 4;
    ctx.strokeRect(30, 30, canvas.width - 60, canvas.height - 60);

    // Header Tag
    ctx.fillStyle = '#39ff14';
    ctx.font = 'bold 24px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('★ MOJAVE JURISDICTION • BORDER OUTPOST ★', canvas.width / 2, 80);

    // Main Town Welcome
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 56px "Bebas Neue", sans-serif';
    ctx.shadowColor = '#ff6b00';
    ctx.shadowBlur = 25;
    ctx.fillText('WELCOME TO STRANGELET, KINETICUT', canvas.width / 2, 170);
    ctx.shadowBlur = 0;

    // Population
    ctx.fillStyle = '#fbbf24';
    ctx.font = 'bold 36px monospace';
    ctx.fillText('POPULATION: ???', canvas.width / 2, 230);

    // Drive-In Marquee Notice
    ctx.fillStyle = '#00e5ff';
    ctx.font = 'bold 32px monospace';
    ctx.fillText('INTERZONE DRIVE-IN THEATER • 4 HUGE SCREENS', canvas.width / 2, 330);

    ctx.fillStyle = '#a1a1aa';
    ctx.font = '24px monospace';
    ctx.fillText('ADMISSION $1.50 • GHOSTS & TRAVELERS ENTER FREE', canvas.width / 2, 390);

    ctx.fillStyle = '#ff6b00';
    ctx.font = 'bold 26px monospace';
    ctx.fillText('TUNE DELCO DASHBOARD: 99.3 FM WSTR', canvas.width / 2, 450);

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
  }, []);

  // Initialize Three.js Scene
  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    // 1. Scene & Exponential Fog (blends horizon into void)
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x030308);
    scene.fog = new THREE.FogExp2(0x050510, 0.0018);
    sceneRef.current = scene;

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(54, width / height, 0.1, 1500);
    camera.position.set(0, 4, 40);
    camera.lookAt(-35, 6, -40);
    cameraRef.current = camera;

    // 3. WebGL Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 4. Lighting
    const ambientLight = new THREE.AmbientLight(0x222238, 0.9);
    scene.add(ambientLight);

    const moonLight = new THREE.DirectionalLight(0x4466aa, 1.2);
    moonLight.position.set(100, 200, 100);
    scene.add(moonLight);

    // 5. Ground Plane (2000 x 2000 units dark desert/gravel)
    const groundGeo = new THREE.PlaneGeometry(2000, 2000, 40, 40);
    groundGeo.rotateX(-Math.PI / 2);

    // Procedural Dark Desert Gravel Texture
    const groundCanvas = document.createElement('canvas');
    groundCanvas.width = 512;
    groundCanvas.height = 512;
    const gCtx = groundCanvas.getContext('2d');
    if (gCtx) {
      gCtx.fillStyle = '#08080f';
      gCtx.fillRect(0, 0, 512, 512);
      for (let i = 0; i < 4000; i++) {
        const x = Math.random() * 512;
        const y = Math.random() * 512;
        const r = Math.random() * 1.5;
        gCtx.fillStyle = Math.random() > 0.5 ? '#161625' : '#040409';
        gCtx.beginPath();
        gCtx.arc(x, y, r, 0, Math.PI * 2);
        gCtx.fill();
      }
      // Radial tire arcs toward screens
      gCtx.strokeStyle = 'rgba(0, 229, 255, 0.04)';
      gCtx.lineWidth = 14;
      gCtx.beginPath();
      gCtx.arc(256, 512, 320, Math.PI, 0);
      gCtx.stroke();
    }
    const groundTexture = new THREE.CanvasTexture(groundCanvas);
    groundTexture.wrapS = THREE.RepeatWrapping;
    groundTexture.wrapT = THREE.RepeatWrapping;
    groundTexture.repeat.set(40, 40);

    const groundMat = new THREE.MeshStandardMaterial({
      map: groundTexture,
      roughness: 0.95,
      metalness: 0.1,
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.position.y = 0;
    scene.add(ground);

    // 6. Starfield Dome (3,000 Twinkling Stars)
    const starCount = 3000;
    const starGeo = new THREE.BufferGeometry();
    const starPositions = new Float32Array(starCount * 3);
    const starColors = new Float32Array(starCount * 3);

    for (let i = 0; i < starCount; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 0.9 + 0.05); // Upper dome
      const rad = 500 + Math.random() * 300;

      starPositions[i * 3] = rad * Math.sin(phi) * Math.cos(theta);
      starPositions[i * 3 + 1] = rad * Math.cos(phi);
      starPositions[i * 3 + 2] = rad * Math.sin(phi) * Math.sin(theta);

      // Star Color (white, cyan, amber, lavender)
      const cChoice = Math.random();
      if (cChoice < 0.4) {
        starColors[i * 3] = 1; starColors[i * 3 + 1] = 1; starColors[i * 3 + 2] = 1;
      } else if (cChoice < 0.7) {
        starColors[i * 3] = 0.2; starColors[i * 3 + 1] = 0.9; starColors[i * 3 + 2] = 1;
      } else if (cChoice < 0.85) {
        starColors[i * 3] = 1; starColors[i * 3 + 1] = 0.75; starColors[i * 3 + 2] = 0.2;
      } else {
        starColors[i * 3] = 0.8; starColors[i * 3 + 1] = 0.5; starColors[i * 3 + 2] = 1;
      }
    }
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    starGeo.setAttribute('color', new THREE.BufferAttribute(starColors, 3));

    const starMat = new THREE.PointsMaterial({
      size: 2.2,
      vertexColors: true,
      transparent: true,
      opacity: 0.9,
    });
    const starField = new THREE.Points(starGeo, starMat);
    scene.add(starField);

    // 7. Rotating Celestial Wormholes in Upper Atmosphere
    const wormholes: THREE.Mesh[] = [];
    const createWormhole = (x: number, y: number, z: number, color1: string, color2: string, size: number) => {
      const wCanvas = document.createElement('canvas');
      wCanvas.width = 512;
      wCanvas.height = 512;
      const wCtx = wCanvas.getContext('2d');
      if (wCtx) {
        const radGrad = wCtx.createRadialGradient(256, 256, 10, 256, 256, 250);
        radGrad.addColorStop(0, '#000000');
        radGrad.addColorStop(0.25, color1);
        radGrad.addColorStop(0.65, color2);
        radGrad.addColorStop(1, 'rgba(0,0,0,0)');
        wCtx.fillStyle = radGrad;
        wCtx.fillRect(0, 0, 512, 512);

        // Spiral vortex arcs
        wCtx.strokeStyle = '#ffffff';
        wCtx.lineWidth = 3;
        for (let a = 0; a < Math.PI * 4; a += 0.2) {
          const r = 20 + a * 18;
          const px = 256 + Math.cos(a) * r;
          const py = 256 + Math.sin(a) * r;
          if (a === 0) wCtx.beginPath();
          wCtx.lineTo(px, py);
        }
        wCtx.stroke();
      }
      const wTex = new THREE.CanvasTexture(wCanvas);
      const wGeo = new THREE.PlaneGeometry(size, size);
      const wMat = new THREE.MeshBasicMaterial({
        map: wTex,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        side: THREE.DoubleSide,
      });
      const mesh = new THREE.Mesh(wGeo, wMat);
      mesh.position.set(x, y, z);
      scene.add(mesh);
      wormholes.push(mesh);
    };

    createWormhole(-80, 115, -340, '#00e5ff', '#a855f7', 120);
    createWormhole(85, 125, -350, '#fbbf24', '#ff0055', 110);
    createWormhole(0, 85, -390, '#39ff14', '#00e5ff', 80);

    // 8. Pulsing Wireframe Sacred Geometry / Molecular Glyphs in Upper Sky
    const glyphs: THREE.LineSegments[] = [];
    const glyphGeo1 = new THREE.OctahedronGeometry(12, 1);
    const glyphMat1 = new THREE.LineBasicMaterial({ color: 0x00e5ff, transparent: true, opacity: 0.35 });
    const glyph1 = new THREE.LineSegments(new THREE.WireframeGeometry(glyphGeo1), glyphMat1);
    glyph1.position.set(-110, 85, -280);
    scene.add(glyph1);
    glyphs.push(glyph1);

    const glyphGeo2 = new THREE.IcosahedronGeometry(15, 1);
    const glyphMat2 = new THREE.LineBasicMaterial({ color: 0xfbbf24, transparent: true, opacity: 0.3 });
    const glyph2 = new THREE.LineSegments(new THREE.WireframeGeometry(glyphGeo2), glyphMat2);
    glyph2.position.set(110, 95, -290);
    scene.add(glyph2);
    glyphs.push(glyph2);

    const glyphGeo3 = new THREE.TorusGeometry(14, 2, 8, 24);
    const glyphMat3 = new THREE.LineBasicMaterial({ color: 0xc084fc, transparent: true, opacity: 0.35 });
    const glyph3 = new THREE.LineSegments(new THREE.WireframeGeometry(glyphGeo3), glyphMat3);
    glyph3.position.set(0, 75, -310);
    scene.add(glyph3);
    glyphs.push(glyph3);

    // 9. Entrance Neon Roadside Billboard Sign at (-35, 6, -40)
    const signTex = getSignTexture();
    const signGeo = new THREE.PlaneGeometry(28, 14);
    const signMat = new THREE.MeshBasicMaterial({
      map: signTex,
      side: THREE.DoubleSide,
    });
    const signMesh = new THREE.Mesh(signGeo, signMat);
    signMesh.position.set(-35, 9, -40);
    signMesh.rotation.y = 0.45;
    scene.add(signMesh);

    // Sign Support Posts
    const postMat = new THREE.MeshStandardMaterial({ color: 0x181820, roughness: 0.8 });
    const postGeo = new THREE.CylinderGeometry(0.3, 0.3, 9, 8);
    const post1 = new THREE.Mesh(postGeo, postMat);
    post1.position.set(-45, 4.5, -44);
    scene.add(post1);
    const post2 = new THREE.Mesh(postGeo, postMat);
    post2.position.set(-25, 4.5, -36);
    scene.add(post2);

    // 10. The 4 Giant Freestanding Outdoor Cinema Screens
    const screenMeshes: THREE.Mesh[] = [];
    const screenGeo = new THREE.PlaneGeometry(48, 27); // 16:9 cinema billboard

    // Video textures for Screens 1 & 2
    let tex1: THREE.Texture;
    if (video1Ref.current) {
      tex1 = new THREE.VideoTexture(video1Ref.current);
      tex1.colorSpace = THREE.SRGBColorSpace;
    } else {
      tex1 = new THREE.Texture();
    }

    let tex2: THREE.Texture;
    if (video2Ref.current) {
      tex2 = new THREE.VideoTexture(video2Ref.current);
      tex2.colorSpace = THREE.SRGBColorSpace;
    } else {
      tex2 = new THREE.Texture();
    }

    // Dynamic Canvases for Screens 3 & 4
    const s3Canvas = document.createElement('canvas');
    s3Canvas.width = 960;
    s3Canvas.height = 540;
    screen3CanvasRef.current = s3Canvas;
    const tex3 = new THREE.CanvasTexture(s3Canvas);
    tex3.colorSpace = THREE.SRGBColorSpace;

    const s4Canvas = document.createElement('canvas');
    s4Canvas.width = 960;
    s4Canvas.height = 540;
    screen4CanvasRef.current = s4Canvas;
    const tex4 = new THREE.CanvasTexture(s4Canvas);
    tex4.colorSpace = THREE.SRGBColorSpace;

    const materials = [
      new THREE.MeshBasicMaterial({ map: tex1, side: THREE.DoubleSide }),
      new THREE.MeshBasicMaterial({ map: tex2, side: THREE.DoubleSide }),
      new THREE.MeshBasicMaterial({ map: tex3, side: THREE.DoubleSide }),
      new THREE.MeshBasicMaterial({ map: tex4, side: THREE.DoubleSide }),
    ];

    SCREEN_CONFIGS.forEach((cfg, idx) => {
      const mesh = new THREE.Mesh(screenGeo, materials[idx]);
      mesh.position.set(cfg.x, cfg.y, cfg.z);
      mesh.rotation.y = cfg.rotY;
      mesh.userData = { screenIndex: idx };
      scene.add(mesh);
      screenMeshes.push(mesh);

      // Outdoor Billboard Truss Scaffolding Frame & Legs
      const frameGeo = new THREE.BoxGeometry(49.5, 28.5, 1.2);
      const frameMat = new THREE.MeshStandardMaterial({ color: 0x111118, roughness: 0.9 });
      const frameMesh = new THREE.Mesh(frameGeo, frameMat);
      frameMesh.position.set(cfg.x, cfg.y, cfg.z - 0.7);
      frameMesh.rotation.y = cfg.rotY;
      scene.add(frameMesh);

      // Tall Support Steel Columns
      const legGeo = new THREE.BoxGeometry(1.4, cfg.y + 13.5, 1.4);
      const legMat = new THREE.MeshStandardMaterial({ color: 0x1a1a24, metalness: 0.7, roughness: 0.6 });
      const legLeft = new THREE.Mesh(legGeo, legMat);
      const legRight = new THREE.Mesh(legGeo, legMat);

      const offsetDist = 20;
      const legCos = Math.cos(cfg.rotY);
      const legSin = Math.sin(cfg.rotY);

      legLeft.position.set(
        cfg.x - offsetDist * legCos,
        (cfg.y + 13.5) / 2,
        cfg.z + offsetDist * legSin
      );
      legLeft.rotation.y = cfg.rotY;
      scene.add(legLeft);

      legRight.position.set(
        cfg.x + offsetDist * legCos,
        (cfg.y + 13.5) / 2,
        cfg.z - offsetDist * legSin
      );
      legRight.rotation.y = cfg.rotY;
      scene.add(legRight);

      // Red Aviation Obstruction Strobe Lights on Top Corners
      const beaconGeo = new THREE.SphereGeometry(0.5, 8, 8);
      const beaconMat = new THREE.MeshBasicMaterial({ color: 0xff0022 });
      const beaconL = new THREE.Mesh(beaconGeo, beaconMat);
      beaconL.position.set(cfg.x - 24 * legCos, cfg.y + 14.5, cfg.z + 24 * legSin);
      scene.add(beaconL);

      const beaconR = new THREE.Mesh(beaconGeo, beaconMat);
      beaconR.position.set(cfg.x + 24 * legCos, cfg.y + 14.5, cfg.z - 24 * legSin);
      scene.add(beaconR);
    });

    screenMeshesRef.current = screenMeshes;

    // 11. Raycasting for Clicking Directly on Screens in 3D
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const handlePointerMove = (e: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(screenMeshes);
      if (intersects.length > 0) {
        const idx = intersects[0].object.userData.screenIndex;
        setHoveredScreen(idx);
      } else {
        setHoveredScreen(null);
      }
    };

    const handleClick = (e: MouseEvent) => {
      if (isDrivingIn) {
        onFinishDrivingIn();
        return;
      }
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(screenMeshes);
      if (intersects.length > 0) {
        const idx = intersects[0].object.userData.screenIndex;
        onSelectScreen(idx);
      }
    };

    renderer.domElement.addEventListener('mousemove', handlePointerMove);
    renderer.domElement.addEventListener('click', handleClick);

    // 12. Animation Loop (Drive-in path + Camera Panning + Dynamic Screen Canvases)
    const clock = new THREE.Clock();
    let animId: number;

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();

      // Rotate Wormholes & Glyphs
      wormholes.forEach((w, i) => {
        w.rotation.z = (i % 2 === 0 ? 1 : -1) * elapsed * (0.05 + i * 0.02);
      });
      glyphs.forEach((g, i) => {
        g.rotation.x = elapsed * (0.1 + i * 0.05);
        g.rotation.y = elapsed * (0.15 + i * 0.04);
      });

      // ── DRIVE-IN CAMERA PATH OR INTERACTIVE SCREEN PANNING ──
      if (isDrivingIn) {
        if (driveInStartRef.current === null) driveInStartRef.current = elapsed;
        const driveElapsed = elapsed - driveInStartRef.current;
        const DURATION = 4.5;
        const progress = Math.min(1, driveElapsed / DURATION);

        // Smooth easeInOutCubic
        const ease = progress < 0.5 ? 4 * progress * progress * progress : 1 - Math.pow(-2 * progress + 2, 3) / 2;

        if (progress < 0.35) {
          // 0.0s - 1.5s: Approaching Gate & Sign
          const subT = progress / 0.35;
          currentPosRef.current.set(0, 4, 40 - subT * 35);
          currentLookAtRef.current.set(-35 + subT * 5, 6 + subT * 2, -40 - subT * 30);
        } else if (progress < 0.75) {
          // 1.5s - 3.4s: Sweeping view across sky and 4 screens
          const subT = (progress - 0.35) / 0.4;
          currentPosRef.current.set(0, 4, 5 - subT * 50);
          currentLookAtRef.current.set(-30 + subT * 80, 25 - subT * 10, -220);
        } else {
          // 3.4s - 4.5s: Settling parked in front of Screen 1
          const subT = (progress - 0.75) / 0.25;
          currentPosRef.current.lerp(CAMERA_TARGETS[0].pos, 0.08);
          currentLookAtRef.current.lerp(CAMERA_TARGETS[0].lookAt, 0.08);
        }

        camera.position.copy(currentPosRef.current);
        camera.lookAt(currentLookAtRef.current);

        if (progress >= 1) {
          onFinishDrivingIn();
        }
      } else {
        // Interactive Panning to Selected Screen
        const target = CAMERA_TARGETS[activeScreenIndex] || CAMERA_TARGETS[0];
        currentPosRef.current.lerp(target.pos, 0.045);
        currentLookAtRef.current.lerp(target.lookAt, 0.045);

        camera.position.copy(currentPosRef.current);
        camera.lookAt(currentLookAtRef.current);
      }

      // Track Angular Velocity (rate of lookAt change) for Screen 3 Gag
      const lookDelta = currentLookAtRef.current.distanceTo(prevLookAtRef.current);
      angularVelocityRef.current = lookDelta;
      prevLookAtRef.current.copy(currentLookAtRef.current);

      // ── UPDATE DYNAMIC SCREEN 3 CANVAS (Grindhouse Flash vs. Please Stand By) ──
      if (screen3CanvasRef.current) {
        const c3 = screen3CanvasRef.current;
        const ctx3 = c3.getContext('2d');
        if (ctx3) {
          // Trigger subliminal flash ONLY while camera is actively panning fast
          const isHighVelocity = angularVelocityRef.current > 0.38;

          if (isHighVelocity) {
            // Rapid 3-frame 16mm grindhouse strobe
            const frameChoice = Math.floor(elapsed * 12) % 3;
            if (frameChoice === 0) {
              // Frame 1: Blood crimson splatter
              ctx3.fillStyle = '#8b0000';
              ctx3.fillRect(0, 0, c3.width, c3.height);
              ctx3.fillStyle = '#ff0033';
              for (let i = 0; i < 20; i++) {
                ctx3.beginPath();
                ctx3.arc(Math.random() * c3.width, Math.random() * c3.height, Math.random() * 45, 0, Math.PI * 2);
                ctx3.fill();
              }
            } else if (frameChoice === 1) {
              // Frame 2: Stark inverted silhouette
              ctx3.fillStyle = '#ffffff';
              ctx3.fillRect(0, 0, c3.width, c3.height);
              ctx3.fillStyle = '#000000';
              ctx3.fillRect(c3.width * 0.3, 0, c3.width * 0.4, c3.height);
            } else {
              // Frame 3: Restricted Censor Card Flash
              ctx3.fillStyle = '#d00a14';
              ctx3.fillRect(0, 0, c3.width, c3.height);
              ctx3.fillStyle = '#ffdd00';
              ctx3.font = 'bold 52px "Bebas Neue", sans-serif';
              ctx3.textAlign = 'center';
              ctx3.fillText('RESTRICTED: TOO HOT & TOO GORY FOR TV!', c3.width / 2, c3.height / 2 + 15);
            }
          } else {
            // Settled: Innocent Vintage "PLEASE STAND BY" Test Card
            ctx3.fillStyle = '#14141d';
            ctx3.fillRect(0, 0, c3.width, c3.height);

            // Circular Test Target
            ctx3.strokeStyle = 'rgba(255,255,255,0.4)';
            ctx3.lineWidth = 4;
            ctx3.beginPath();
            ctx3.arc(c3.width / 2, c3.height / 2, 140, 0, Math.PI * 2);
            ctx3.stroke();

            ctx3.beginPath();
            ctx3.arc(c3.width / 2, c3.height / 2, 70, 0, Math.PI * 2);
            ctx3.stroke();

            // Card Text
            ctx3.fillStyle = '#f4f4f5';
            ctx3.font = 'bold 64px "Bebas Neue", sans-serif';
            ctx3.textAlign = 'center';
            ctx3.shadowColor = '#000';
            ctx3.shadowBlur = 10;
            ctx3.fillText('PLEASE STAND BY', c3.width / 2, c3.height / 2 - 20);
            ctx3.shadowBlur = 0;

            ctx3.fillStyle = '#fbbf24';
            ctx3.font = 'bold 22px monospace';
            ctx3.fillText('TEMPORARY TECHNICAL DIFFICULTIES', c3.width / 2, c3.height / 2 + 35);

            ctx3.fillStyle = '#a1a1aa';
            ctx3.font = '16px monospace';
            ctx3.fillText('STRANGELET BROADCAST SYSTEM • KINETICUT CH. 3', c3.width / 2, c3.height / 2 + 75);

            // Subtle scanlines
            ctx3.fillStyle = 'rgba(0,0,0,0.2)';
            for (let y = 0; y < c3.height; y += 4) {
              ctx3.fillRect(0, y, c3.width, 2);
            }
          }
          tex3.needsUpdate = true;
        }
      }

      // ── UPDATE DYNAMIC SCREEN 4 CANVAS (Oscilloscope & Visualizer) ──
      if (screen4CanvasRef.current) {
        const c4 = screen4CanvasRef.current;
        const ctx4 = c4.getContext('2d');
        if (ctx4) {
          ctx4.fillStyle = '#04040c';
          ctx4.fillRect(0, 0, c4.width, c4.height);

          // Top Header Banner
          ctx4.fillStyle = activeStation?.color || '#00e5ff';
          ctx4.font = 'bold 24px monospace';
          ctx4.textAlign = 'left';
          ctx4.fillText(`TRANSMITTING AT ${activeStation?.dial || '99.3 FM'} • ${(activeStation?.name || 'WSTR RADIO').toUpperCase()}`, 40, 50);

          ctx4.fillStyle = '#ffffff';
          ctx4.font = 'bold 36px "Bebas Neue", sans-serif';
          ctx4.fillText(currentTrackTitle || 'Interzone Broadcast Signal', 40, 95);

          // Real-time Audio Spectrum Bars reacting to bass
          const numBars = 36;
          const barWidth = 18;
          const startX = 60;
          for (let b = 0; b < numBars; b++) {
            const h = 18 + Math.sin(b * 0.35 + elapsed * 6) * 45 + bass * 80;
            const clampedH = Math.max(8, Math.min(220, h));
            const bx = startX + b * (barWidth + 6);
            const by = c4.height / 2 + 40 - clampedH / 2;

            const grad = ctx4.createLinearGradient(0, by, 0, by + clampedH);
            grad.addColorStop(0, '#00e5ff');
            grad.addColorStop(0.5, '#c084fc');
            grad.addColorStop(1, '#ff6b00');
            ctx4.fillStyle = grad;
            ctx4.fillRect(bx, by, barWidth, clampedH);
          }

          // Oscilloscope Center Beam
          ctx4.strokeStyle = '#39ff14';
          ctx4.lineWidth = isTransient ? 4 : 2;
          ctx4.beginPath();
          for (let x = 40; x < c4.width - 40; x += 10) {
            const waveY = c4.height / 2 + 40 + Math.sin(x * 0.04 + elapsed * 10) * (15 + bass * 40);
            if (x === 40) ctx4.moveTo(x, waveY);
            else ctx4.lineTo(x, waveY);
          }
          ctx4.stroke();

          // Bottom DJ Callout
          ctx4.fillStyle = '#c084fc';
          ctx4.font = '20px monospace';
          ctx4.textAlign = 'right';
          ctx4.fillText(`DJ: ${(activeStation?.host || 'DOC ENOCH • OCCULT SONGBOOK').toUpperCase()}`, c4.width - 40, c4.height - 40);

          tex4.needsUpdate = true;
        }
      }

      // Render Three.js Scene
      renderer.render(scene, camera);
    };

    animate();

    // Resize Handler
    const handleResize = () => {
      if (!containerRef.current) return;
      const newW = containerRef.current.clientWidth;
      const newH = containerRef.current.clientHeight;
      camera.aspect = newW / newH;
      camera.updateProjectionMatrix();
      renderer.setSize(newW, newH);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      renderer.domElement.removeEventListener('mousemove', handlePointerMove);
      renderer.domElement.removeEventListener('click', handleClick);
      cancelAnimationFrame(animId);
      renderer.dispose();
      if (renderer.domElement.parentElement) {
        renderer.domElement.parentElement.removeChild(renderer.domElement);
      }
    };
  }, [getSignTexture, onFinishDrivingIn, onSelectScreen]);

  // Sync external video playback with HTML5 video texture elements
  useEffect(() => {
    [video1Ref.current, video2Ref.current, video3Ref.current].forEach((vid) => {
      if (vid) {
        if (videoPlaying && vid.paused) vid.play().catch(() => {});
        else if (!videoPlaying && !vid.paused) vid.pause();
      }
    });
  }, [videoPlaying]);

  return (
    <div
      ref={containerRef}
      style={{
        position: 'relative',
        width: '100%',
        maxWidth: 1080,
        aspectRatio: '16 / 9',
        borderRadius: 8,
        overflow: 'hidden',
        border: '3px solid #1a1a2e',
        boxShadow: `0 0 ${35 + bass * 45}px rgba(0, 229, 255, 0.4), 0 20px 60px rgba(0, 0, 0, 0.95)`,
        marginBottom: 20,
        backgroundColor: '#020206',
        cursor: isDrivingIn ? 'pointer' : 'default',
      }}
      onClick={isDrivingIn ? onFinishDrivingIn : undefined}
    >
      {/* Hidden HTML5 Video Elements used as live WebGL textures on Screens 1 & 2 */}
      <div style={{ display: 'none' }}>
        <video
          ref={video1Ref}
          src={
            malibuFlying
              ? './assets-bg/drive-in/Malibu_accelerates_into_cosmic_v._202608202035.mp4'
              : './assets-bg/drive-in/1964_Chevy_Malibu_parked_drive-in_202608202035.mp4'
          }
          autoPlay
          loop
          muted
          playsInline
          crossOrigin="anonymous"
        />
        <video
          ref={video2Ref}
          src={currentCommunityCut?.videoUrl || './assets-bg/puppet-man/Bookstore_window_at_night_202608202035.mp4'}
          autoPlay
          loop
          muted
          playsInline
          crossOrigin="anonymous"
        />
        <video
          ref={video3Ref}
          src="./assets-bg/puppet-man/Bookstore_window_at_night_202608202035.mp4"
          autoPlay
          loop
          muted
          playsInline
          crossOrigin="anonymous"
        />
      </div>

      {/* ── 2D FIRST-PERSON 1964 CHEVY MALIBU CABIN & WINDSHIELD OVERLAY ── */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          zIndex: 10,
        }}
      >
        {/* Upper Windshield Frame & A-Pillars (Retracts/fades on parked mode) */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            opacity: isDrivingIn ? 1 : 0,
            transform: isDrivingIn ? 'translateY(0)' : 'translateY(-30px)',
            transition: 'opacity 0.8s ease, transform 0.8s ease',
            pointerEvents: 'none',
          }}
        >
          {/* Windshield Header */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: 28,
              background: 'linear-gradient(180deg, #050508 0%, rgba(10,10,16,0.9) 75%, transparent 100%)',
              borderBottom: '2px solid rgba(255,255,255,0.08)',
            }}
          />
          {/* Left A-Pillar */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: 38,
              bottom: 0,
              background: 'linear-gradient(90deg, #050508 0%, rgba(14,14,22,0.95) 75%, transparent 100%)',
              transform: 'skewX(-14deg)',
              transformOrigin: 'top left',
            }}
          />
          {/* Right A-Pillar */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              right: 0,
              width: 38,
              bottom: 0,
              background: 'linear-gradient(-90deg, #050508 0%, rgba(14,14,22,0.95) 75%, transparent 100%)',
              transform: 'skewX(14deg)',
              transformOrigin: 'top right',
            }}
          />
          {/* Hanging Rearview Mirror with Gentle Sway */}
          <div
            style={{
              position: 'absolute',
              top: 14,
              left: '50%',
              transform: 'translateX(-50%)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <div style={{ width: 3, height: 16, backgroundColor: '#71717a' }} />
            <div
              style={{
                width: 90,
                height: 22,
                backgroundColor: 'rgba(20, 20, 30, 0.95)',
                borderRadius: 4,
                border: '1.5px solid #a1a1aa',
                boxShadow: '0 4px 12px rgba(0,0,0,0.85)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <span style={{ fontSize: 7.5, color: '#00e5ff', fontFamily: 'monospace', letterSpacing: 1 }}>
                432Hz WSTR
              </span>
            </div>
          </div>
        </div>

        {/* 1964 Chevy Malibu Hood in Bottom Foreground */}
        <div
          style={{
            position: 'absolute',
            bottom: -2,
            left: 0,
            right: 0,
            height: '18%',
            background: 'linear-gradient(180deg, transparent 0%, rgba(10,10,18,0.7) 40%, rgba(5,5,10,0.98) 100%)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'flex-end',
          }}
        >
          {/* Malibu Hood Center Chrome Spear */}
          <div
            style={{
              width: 3,
              height: '100%',
              background: 'linear-gradient(180deg, rgba(255,255,255,0.4) 0%, #a1a1aa 50%, #3f3f46 100%)',
              boxShadow: '0 0 10px rgba(0, 229, 255, 0.4)',
            }}
          />
        </div>
      </div>

      {/* ── INTERACTIVE 3D OVERLAYS & CONTROLS ── */}
      {/* Current Screen Floating HUD Badge */}
      <div
        style={{
          position: 'absolute',
          top: 14,
          left: 18,
          zIndex: 15,
          pointerEvents: 'none',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          background: 'rgba(5, 5, 12, 0.8)',
          backdropFilter: 'blur(6px)',
          padding: '6px 14px',
          borderRadius: 4,
          border: '1px solid rgba(0, 229, 255, 0.4)',
        }}
      >
        <span style={{ fontSize: 13 }}>🎬</span>
        <span style={{ fontFamily: "'Syncopate', sans-serif", fontSize: 9.5, fontWeight: 800, color: '#00e5ff', letterSpacing: 1.5 }}>
          {SCREEN_CONFIGS[activeScreenIndex]?.title || 'INTERZONE FIELD'}
        </span>
      </div>

      {/* Floating Edge Pan Buttons (Click to pan across the 4 screens in 3D) */}
      {activeScreenIndex > 0 && !isDrivingIn && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onSelectScreen(activeScreenIndex - 1);
          }}
          style={{
            position: 'absolute',
            left: 12,
            top: '50%',
            transform: 'translateY(-50%)',
            zIndex: 25,
            background: 'rgba(0, 0, 0, 0.8)',
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
          }}
        >
          ◀ SCREEN {activeScreenIndex}
        </button>
      )}

      {activeScreenIndex < 3 && !isDrivingIn && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onSelectScreen(activeScreenIndex + 1);
          }}
          style={{
            position: 'absolute',
            right: 12,
            top: '50%',
            transform: 'translateY(-50%)',
            zIndex: 25,
            background: 'rgba(0, 0, 0, 0.8)',
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
          }}
        >
          SCREEN {activeScreenIndex + 2} ▶
        </button>
      )}

      {/* Screen 2 Submit Cut Button Quick Access */}
      {activeScreenIndex === 1 && !isDrivingIn && onOpenSubmitModal && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onOpenSubmitModal();
          }}
          style={{
            position: 'absolute',
            top: 14,
            right: 18,
            zIndex: 25,
            background: 'linear-gradient(90deg, #00e5ff, #c084fc)',
            color: '#000',
            border: 'none',
            borderRadius: 3,
            padding: '6px 14px',
            fontFamily: "'Syncopate', sans-serif",
            fontWeight: 800,
            fontSize: 9,
            letterSpacing: 1,
            cursor: 'pointer',
            boxShadow: '0 0 15px rgba(0, 229, 255, 0.5)',
          }}
        >
          🛸 SUBMIT YOUR CUT
        </button>
      )}

      {/* Drive-In Window Speaker Box */}
      <div
        style={{
          position: 'absolute',
          bottom: 16,
          right: 20,
          zIndex: 26,
          backgroundColor: 'rgba(18, 18, 26, 0.94)',
          padding: '8px 14px',
          borderRadius: 5,
          border: '1px solid #71717a',
          boxShadow: '0 4px 15px rgba(0,0,0,0.85)',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          pointerEvents: 'none',
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

      {/* Skip Drive-In Entry Hint Pill */}
      {isDrivingIn && (
        <div
          style={{
            position: 'absolute',
            bottom: 24,
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 30,
            background: 'rgba(0, 0, 0, 0.85)',
            border: '1px solid rgba(255, 107, 0, 0.6)',
            borderRadius: 20,
            padding: '6px 16px',
            fontFamily: "'Syncopate', sans-serif",
            fontSize: 8.5,
            fontWeight: 800,
            color: '#fbbf24',
            letterSpacing: 1.5,
            boxShadow: '0 0 15px rgba(255, 107, 0, 0.5)',
            pointerEvents: 'none',
          }}
        >
          CLICK ANYWHERE OR PRESS [ESC] TO SKIP ENTRY
        </div>
      )}
    </div>
  );
}
