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

// Target Camera Positions & LookAts for Each Screen View (Parked Car in Lot)
const CAMERA_TARGETS = [
  { pos: new THREE.Vector3(-45, 6, -115), lookAt: new THREE.Vector3(-95, 17, -180) },
  { pos: new THREE.Vector3(-15, 6, -135), lookAt: new THREE.Vector3(-32, 17, -215) },
  { pos: new THREE.Vector3(15, 6, -135), lookAt: new THREE.Vector3(32, 17, -215) },
  { pos: new THREE.Vector3(45, 6, -115), lookAt: new THREE.Vector3(95, 17, -180) },
];

// Target Camera Positions & LookAts for Full Viewport Zoom (Perpendicular to each screen at D = 26.8)
const CAMERA_ZOOM_TARGETS = [
  { pos: new THREE.Vector3(-85.06, 17, -155.11), lookAt: new THREE.Vector3(-95, 17, -180) },
  { pos: new THREE.Vector3(-28.26, 17, -188.46), lookAt: new THREE.Vector3(-32, 17, -215) },
  { pos: new THREE.Vector3(28.26, 17, -188.46), lookAt: new THREE.Vector3(32, 17, -215) },
  { pos: new THREE.Vector3(85.06, 17, -155.11), lookAt: new THREE.Vector3(95, 17, -180) },
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
  const [isZoomed, setIsZoomed] = useState(false);
  const isZoomedRef = useRef(false);
  isZoomedRef.current = isZoomed;

  const activeScreenIndexRef = useRef(activeScreenIndex);
  useEffect(() => {
    activeScreenIndexRef.current = activeScreenIndex;
  }, [activeScreenIndex]);

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

  // Panning & Angular Velocity tracking (Starts on dark entrance road at z = +95, x = -25)
  const currentPosRef = useRef(new THREE.Vector3(-25, 4, 95));
  const currentLookAtRef = useRef(new THREE.Vector3(-55, 9, -35));
  const prevLookAtRef = useRef(new THREE.Vector3(-55, 9, -35));
  const angularVelocityRef = useRef(0);
  const driveInStartRef = useRef<number | null>(null);

  // Reset drive-in timer whenever isDrivingIn becomes true (enables REPLAY DRIVE-IN)
  useEffect(() => {
    if (isDrivingIn) {
      driveInStartRef.current = null;
      currentPosRef.current.set(-25, 4, 95);
      currentLookAtRef.current.set(-55, 9, -35);
    }
  }, [isDrivingIn]);

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
    ctx.fillText('INTERZONE DRIVE-IN • 4 HUGE SCREENS', canvas.width / 2, 330);

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

    // 2. Camera (Starts at entrance road looking sharply left out window at sign)
    const camera = new THREE.PerspectiveCamera(54, width / height, 0.1, 1500);
    camera.position.set(-25, 4, 95);
    camera.lookAt(-55, 9, -35);
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

    // 7. Malibu Headlights (SpotLights on the Car illuminating the gravel field)
    const headlightL = new THREE.SpotLight(0xfff5d0, 6.0, 260, Math.PI / 6.5, 0.45, 1.2);
    const headlightR = new THREE.SpotLight(0xfff5d0, 6.0, 260, Math.PI / 6.5, 0.45, 1.2);
    const headlightTarget = new THREE.Object3D();
    scene.add(headlightTarget);
    headlightL.target = headlightTarget;
    headlightR.target = headlightTarget;
    scene.add(headlightL);
    scene.add(headlightR);

    // 8. Entrance Neon Roadside Billboard Sign at (-35, 9, -40)
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
        if (!isZoomedRef.current) {
          onSelectScreen(idx);
          setIsZoomed(true);
        } else {
          // If already zoomed in: clicking another screen switches to it; clicking current toggles back to lot
          if (idx !== activeScreenIndexRef.current) {
            onSelectScreen(idx);
          } else {
            setIsZoomed(false);
          }
        }
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }
      if (e.key === 'Escape') {
        if (isZoomedRef.current) {
          setIsZoomed(false);
        }
      } else if (e.key === 'z' || e.key === 'Z') {
        if (!isDrivingIn) {
          setIsZoomed((prev) => !prev);
        }
      } else if (e.key === '1') {
        onSelectScreen(0);
      } else if (e.key === '2') {
        onSelectScreen(1);
      } else if (e.key === '3') {
        onSelectScreen(2);
      } else if (e.key === '4') {
        onSelectScreen(3);
      }
    };

    renderer.domElement.addEventListener('mousemove', handlePointerMove);
    renderer.domElement.addEventListener('click', handleClick);
    window.addEventListener('keydown', handleKeyDown);

    // 12. Animation Loop (Drive-in path + Camera Panning + Dynamic Screen Canvases)
    const clock = new THREE.Clock();
    let animId: number;

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();

      // Project Malibu Headlights onto gravel field ahead
      headlightL.position.set(currentPosRef.current.x - 2.8, currentPosRef.current.y - 0.5, currentPosRef.current.z - 2);
      headlightR.position.set(currentPosRef.current.x + 2.8, currentPosRef.current.y - 0.5, currentPosRef.current.z - 2);
      headlightTarget.position.set(
        currentPosRef.current.x + (currentLookAtRef.current.x - currentPosRef.current.x) * 0.7,
        0,
        currentPosRef.current.z + (currentLookAtRef.current.z - currentPosRef.current.z) * 0.7
      );

      // ── CHILDREN OF MEN SINGLE-TAKE POV HEAD-TURNING CAMERA CHOREOGRAPHY (5.0s) ──
      if (isDrivingIn) {
        if (driveInStartRef.current === null) driveInStartRef.current = elapsed;
        const driveElapsed = elapsed - driveInStartRef.current;
        const DURATION = 5.0; // 5.0 seconds
        const progress = Math.min(1, driveElapsed / DURATION);

        if (progress < 0.36) {
          // 0.0s – 1.8s (subT: 0 -> 1):
          // Starting back on the dark entrance road (z = +95, x = -25) turning onto the lot.
          // Head turned sharply left out the driver's side window looking at the neon sign passing by.
          const subT = progress / 0.36;
          const ease = subT * subT * (3 - 2 * subT);
          
          currentPosRef.current.set(
            -25 + ease * 7, // x: -25 -> -18
            4,
            95 - ease * 70  // z: +95 -> +25
          );
          
          currentLookAtRef.current.set(
            -55 + ease * 15,
            9 - ease * 1.5,
            -35 + (1 - ease) * 15
          );
        } else if (progress < 0.72) {
          // 1.8s – 3.6s (subT: 0 -> 1):
          // Smoothly rotate the POV head-turn right across the windshield, sweeping across starry sky & all 4 screens.
          const subT = (progress - 0.36) / 0.36;
          const ease = subT * subT * (3 - 2 * subT);
          
          currentPosRef.current.set(
            -18 + ease * 12, // x: -18 -> -6
            4,
            25 - ease * 70   // z: +25 -> -45
          );
          
          currentLookAtRef.current.set(
            -40 + ease * 95,
            7.5 + Math.sin(ease * Math.PI) * 10,
            -35 - ease * 175
          );
        } else {
          // 3.6s – 5.0s (subT: 0 -> 1):
          // Pulling into final parking spot at (0, 4, -75), facing the screens as suspension settles.
          const subT = (progress - 0.72) / 0.28;
          const ease = subT * subT * (3 - 2 * subT);
          
          currentPosRef.current.set(
            -6 + ease * 6,   // x: -6 -> 0
            4,
            -45 - ease * 30  // z: -45 -> -75
          );
          
          currentLookAtRef.current.set(
            55 - ease * 150, // x: 55 -> -95
            17.5 - ease * 0.5,
            -210 + ease * 30 // z: -210 -> -180
          );
        }

        camera.position.copy(currentPosRef.current);
        camera.lookAt(currentLookAtRef.current);

        if (progress >= 1) {
          onFinishDrivingIn();
        }
      } else {
        // Interactive Panning to Selected Screen (Parked Lot vs Zoomed Viewport)
        const currentActive = activeScreenIndexRef.current;
        const targetList = isZoomedRef.current ? CAMERA_ZOOM_TARGETS : CAMERA_TARGETS;
        const target = targetList[currentActive] || targetList[0];
        const lerpFactor = isZoomedRef.current ? 0.06 : 0.045;

        currentPosRef.current.lerp(target.pos, lerpFactor);
        currentLookAtRef.current.lerp(target.lookAt, lerpFactor);

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
      window.removeEventListener('keydown', handleKeyDown);
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
        cursor: isDrivingIn ? 'pointer' : (hoveredScreen !== null ? 'pointer' : 'default'),
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

      {/* Inline Keyframe Styles for Road Vibration & Mirror Sway */}
      <style>{`
        @keyframes road-vibe {
          0% { transform: translate(0, 0); }
          20% { transform: translate(-0.8px, 0.6px); }
          40% { transform: translate(0.7px, -0.5px); }
          60% { transform: translate(-0.5px, -0.4px); }
          80% { transform: translate(0.6px, 0.5px); }
          100% { transform: translate(0, 0); }
        }
        @keyframes engine-idle {
          0%, 100% { transform: translate(0, 0); }
          50% { transform: translate(0, -0.35px); }
        }
        @keyframes mirror-sway {
          0%, 100% { transform: translateX(-50%) rotate(-1.6deg); }
          50% { transform: translateX(-50%) rotate(1.6deg); }
        }
        @keyframes dial-glow {
          0%, 100% { opacity: 0.88; text-shadow: 0 0 6px rgba(255, 170, 0, 0.6); }
          50% { opacity: 1; text-shadow: 0 0 12px rgba(255, 170, 0, 0.95); }
        }
      `}</style>

      {/* ── CHILDREN OF MEN 1964 CHEVY MALIBU FIRST-PERSON INSIDE-CABIN OVERLAY ── */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          zIndex: 10,
          animation: isDrivingIn ? 'road-vibe 0.11s infinite linear' : 'engine-idle 2.4s infinite ease-in-out',
        }}
      >
        {/* Upper Windshield Frame, A-Pillars & Roofline (Fades/slides out over 0.8s when parked) */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            opacity: isDrivingIn ? 1 : 0,
            transform: isDrivingIn ? 'translateY(0)' : 'translateY(-40px)',
            transition: 'opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1), transform 0.8s cubic-bezier(0.16, 1, 0.3, 1)',
            pointerEvents: 'none',
          }}
        >
          {/* Roof Headliner Bar with Sun Visors */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: 38,
              background: 'linear-gradient(180deg, #030306 0%, #0c0c14 80%, transparent 100%)',
              borderBottom: '2px solid rgba(255,255,255,0.06)',
              display: 'flex',
              justifyContent: 'space-between',
              padding: '0 80px',
            }}
          >
            {/* Left Sun Visor */}
            <div
              style={{
                width: 220,
                height: 14,
                backgroundColor: '#11111a',
                border: '1px solid #27273a',
                borderRadius: '0 0 8px 8px',
                opacity: 0.85,
              }}
            />
            {/* Right Sun Visor */}
            <div
              style={{
                width: 220,
                height: 14,
                backgroundColor: '#11111a',
                border: '1px solid #27273a',
                borderRadius: '0 0 8px 8px',
                opacity: 0.85,
              }}
            />
          </div>

          {/* Left A-Pillar + Quarter/Vent Window Frame (Driver's Side) */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: 58,
              bottom: 0,
              background: 'linear-gradient(90deg, #020205 0%, #0e0e18 80%, transparent 100%)',
              transform: 'skewX(-15deg)',
              transformOrigin: 'top left',
              borderRight: '1px solid rgba(255,255,255,0.08)',
            }}
          >
            {/* Vent Window Chrome Divider Bar */}
            <div
              style={{
                position: 'absolute',
                top: '32%',
                left: 14,
                width: 2,
                height: '45%',
                backgroundColor: 'rgba(255,255,255,0.25)',
                transform: 'rotate(-4deg)',
              }}
            />
          </div>

          {/* Right A-Pillar (Passenger's Side) */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              right: 0,
              width: 58,
              bottom: 0,
              background: 'linear-gradient(-90deg, #020205 0%, #0e0e18 80%, transparent 100%)',
              transform: 'skewX(15deg)',
              transformOrigin: 'top right',
              borderLeft: '1px solid rgba(255,255,255,0.08)',
            }}
          />

          {/* Hanging Chrome Rearview Mirror with Gentle Road Sway */}
          <div
            style={{
              position: 'absolute',
              top: 18,
              left: '50%',
              animation: 'mirror-sway 3.2s infinite ease-in-out',
              transformOrigin: 'top center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            {/* Mirror Ball-Joint Mounting Bracket */}
            <div style={{ width: 4, height: 20, backgroundColor: '#71717a', borderRadius: 2 }} />
            {/* Beveled Mirror Housing */}
            <div
              style={{
                width: 120,
                height: 30,
                backgroundColor: 'rgba(14, 14, 22, 0.95)',
                borderRadius: 5,
                border: '1.5px solid #a1a1aa',
                boxShadow: '0 6px 18px rgba(0,0,0,0.9), inset 0 1px 2px rgba(255,255,255,0.2)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                backdropFilter: 'blur(3px)',
              }}
            >
              <div style={{ fontSize: 7, color: '#a1a1aa', fontFamily: 'monospace', letterSpacing: 1 }}>
                REAR ROAD VIEW
              </div>
              <div style={{ fontSize: 8.5, color: '#00e5ff', fontFamily: 'monospace', fontWeight: 800, letterSpacing: 1 }}>
                WSTR 99.3 FM
              </div>
            </div>
          </div>
        </div>

        {/* 1964 Chevy Malibu Dashboard & Steering Wheel Top along the Bottom */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '24%',
            background: 'linear-gradient(180deg, transparent 0%, rgba(8,8,14,0.7) 25%, #05050a 65%, #020204 100%)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-end',
            alignItems: 'center',
            pointerEvents: 'none',
            opacity: isZoomed ? 0 : 1,
            transform: isZoomed ? 'translateY(60px)' : 'translateY(0)',
            transition: 'opacity 0.6s ease, transform 0.6s ease',
          }}
        >
          {/* Malibu Hood Center Chrome Spear projecting into Headlight Beams */}
          <div
            style={{
              width: 3,
              height: '55%',
              background: 'linear-gradient(180deg, rgba(255,255,255,0.6) 0%, #a1a1aa 40%, #27272a 100%)',
              boxShadow: '0 0 12px rgba(0, 229, 255, 0.5), 0 0 25px rgba(255, 240, 200, 0.3)',
              marginBottom: 4,
              opacity: isZoomed ? 0 : 1,
              transition: 'opacity 0.4s ease',
            }}
          />

          {/* Detailed Dashboard Edge & Instrument Pods */}
          <div
            style={{
              width: '100%',
              height: 48,
              backgroundColor: '#0a0a12',
              borderTop: '2px solid #27273a',
              boxShadow: 'inset 0 2px 4px rgba(255,255,255,0.1), 0 -4px 20px rgba(0,0,0,0.95)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0 24px',
              opacity: isDrivingIn ? 1 : 0.45,
              transition: 'opacity 0.8s ease',
            }}
          >
            {/* Speedometer Cluster (Left Driver Pod) */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '4px 10px',
                borderRadius: 4,
                backgroundColor: '#050509',
                border: '1px solid #1f1f2e',
              }}
            >
              <div style={{ fontSize: 7.5, color: '#71717a', fontFamily: 'monospace' }}>SPEED</div>
              <div style={{ width: 60, height: 6, backgroundColor: '#111', borderRadius: 3, position: 'relative', overflow: 'hidden' }}>
                <div
                  style={{
                    position: 'absolute',
                    left: 0,
                    top: 0,
                    bottom: 0,
                    width: isDrivingIn ? '35%' : '0%',
                    backgroundColor: '#ff6b00',
                    transition: 'width 0.8s ease',
                    boxShadow: '0 0 8px #ff6b00',
                  }}
                />
              </div>
              <span style={{ fontSize: 8.5, color: '#fbbf24', fontFamily: 'monospace', fontWeight: 800 }}>
                {isDrivingIn ? '25 MPH' : 'PARKED'}
              </span>
            </div>

            {/* Steering Wheel Top Chrome Arc (Driver Center-Left) */}
            <div
              style={{
                position: 'absolute',
                left: '22%',
                bottom: 8,
                width: 140,
                height: 45,
                borderTop: '4.5px solid #d4d4d8',
                borderRadius: '70px 70px 0 0',
                boxShadow: '0 -2px 10px rgba(0,0,0,0.8), inset 0 1px 2px rgba(255,255,255,0.4)',
                opacity: isDrivingIn ? 0.95 : 0,
                transform: isDrivingIn ? 'translateY(0)' : 'translateY(30px)',
                transition: 'opacity 0.8s ease, transform 0.8s ease',
              }}
            >
              {/* Inner Horn Ring */}
              <div
                style={{
                  position: 'absolute',
                  top: 8,
                  left: 20,
                  right: 20,
                  height: 30,
                  borderTop: '2px solid #71717a',
                  borderRadius: '50px 50px 0 0',
                }}
              />
            </div>

            {/* Glowing Retro Delco WSTR Radio Dial (Center Dashboard) */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '4px 14px',
                borderRadius: 4,
                backgroundColor: '#030306',
                border: '1px solid rgba(255, 107, 0, 0.4)',
                boxShadow: '0 0 12px rgba(255, 107, 0, 0.25)',
              }}
            >
              <span style={{ fontSize: 9, color: '#a1a1aa', fontFamily: 'monospace' }}>DELCO</span>
              <div
                style={{
                  fontFamily: 'monospace',
                  fontSize: 9,
                  fontWeight: 800,
                  color: '#fbbf24',
                  animation: 'dial-glow 2.5s infinite ease-in-out',
                }}
              >
                99.3 FM • WSTR RADIO
              </div>
              <div
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  backgroundColor: '#39ff14',
                  boxShadow: '0 0 8px #39ff14',
                }}
              />
            </div>

            {/* Right Glovebox Chrome Badge */}
            <div
              style={{
                fontSize: 8,
                fontFamily: "'Syncopate', sans-serif",
                color: '#71717a',
                letterSpacing: 2,
                fontWeight: 800,
              }}
            >
              MALIBU SS
            </div>
          </div>
        </div>
      </div>

      {/* ── INTERACTIVE 3D OVERLAYS & CONTROLS ── */}
      {/* Current Screen Floating HUD Badge (Lot View) */}
      {!isZoomed && (
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
            background: 'rgba(5, 5, 12, 0.85)',
            backdropFilter: 'blur(6px)',
            padding: '6px 14px',
            borderRadius: 4,
            border: '1px solid rgba(0, 229, 255, 0.4)',
            boxShadow: '0 4px 18px rgba(0,0,0,0.7)',
          }}
        >
          <span style={{ fontSize: 13 }}>🎬</span>
          <span style={{ fontFamily: "'Syncopate', sans-serif", fontSize: 9.5, fontWeight: 800, color: '#00e5ff', letterSpacing: 1.5 }}>
            {SCREEN_CONFIGS[activeScreenIndex]?.title || 'INTERZONE FIELD'}
          </span>
          {!isDrivingIn && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsZoomed(true);
              }}
              style={{
                pointerEvents: 'auto',
                background: 'rgba(0, 229, 255, 0.15)',
                border: '1px solid #00e5ff',
                color: '#00e5ff',
                padding: '3px 10px',
                borderRadius: 3,
                fontFamily: "'Syncopate', sans-serif",
                fontSize: 8,
                fontWeight: 800,
                cursor: 'pointer',
                letterSpacing: 1,
                boxShadow: '0 0 10px rgba(0, 229, 255, 0.3)',
                marginLeft: 4,
                display: 'flex',
                alignItems: 'center',
                gap: 4,
              }}
              title="Zoom camera directly to this screen [Key: Z]"
            >
              <span>🔍</span> VIEWPORT MODE [Z]
            </button>
          )}
        </div>
      )}

      {/* ── FULL VIEWPORT HUD (ACTIVE WHEN ZOOMED) ── */}
      {isZoomed && !isDrivingIn && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            zIndex: 40,
            background: 'linear-gradient(180deg, rgba(2, 2, 6, 0.95) 0%, rgba(6, 6, 14, 0.85) 75%, transparent 100%)',
            padding: '12px 18px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid rgba(0, 229, 255, 0.25)',
            backdropFilter: 'blur(8px)',
            boxShadow: '0 6px 25px rgba(0,0,0,0.9)',
          }}
        >
          {/* Left: Active Screen Indicator & Tag */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 16 }}>🎬</span>
            <div>
              <div style={{ fontFamily: "'Syncopate', sans-serif", fontSize: 10.5, fontWeight: 800, color: '#00e5ff', letterSpacing: 1.5 }}>
                {SCREEN_CONFIGS[activeScreenIndex]?.title || 'SCREEN VIEWPORT'}
              </div>
              <div style={{ fontSize: 8, color: '#fbbf24', fontFamily: 'monospace', letterSpacing: 1 }}>
                FULL VIEWPORT ACTIVE • CLICK SCREEN OR [ESC] TO RETURN TO LOT
              </div>
            </div>
          </div>

          {/* Center: Screen Quick Switchers [1] [2] [3] [4] */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            {SCREEN_CONFIGS.map((s, idx) => (
              <button
                key={s.id}
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectScreen(idx);
                }}
                style={{
                  background: activeScreenIndex === idx ? 'linear-gradient(90deg, #00e5ff, #c084fc)' : 'rgba(20, 20, 30, 0.8)',
                  color: activeScreenIndex === idx ? '#000' : '#a1a1aa',
                  border: activeScreenIndex === idx ? '1px solid #00e5ff' : '1px solid #33334d',
                  borderRadius: 4,
                  padding: '5px 12px',
                  fontFamily: 'monospace',
                  fontSize: 9,
                  fontWeight: 800,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: activeScreenIndex === idx ? '0 0 12px rgba(0, 229, 255, 0.6)' : 'none',
                }}
                title={s.title}
              >
                [{idx + 1}] {idx === 0 ? 'SHOWCASE' : idx === 1 ? 'INDIE MV' : idx === 2 ? 'GRINDHOUSE' : 'WSTR SIGNAL'}
              </button>
            ))}
          </div>

          {/* Right: Return to Lot Button */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsZoomed(false);
              }}
              style={{
                background: 'rgba(255, 107, 0, 0.18)',
                border: '1.5px solid #ff6b00',
                color: '#ff6b00',
                padding: '6px 16px',
                borderRadius: 4,
                fontFamily: "'Syncopate', sans-serif",
                fontSize: 9,
                fontWeight: 800,
                letterSpacing: 1.2,
                cursor: 'pointer',
                boxShadow: '0 0 15px rgba(255, 107, 0, 0.4)',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <span>◀</span> RETURN TO LOT / CAR (ESC)
            </button>
          </div>
        </div>
      )}

      {/* Screen Hover Tooltip in Lot View */}
      {hoveredScreen !== null && !isZoomed && !isDrivingIn && (
        <div
          style={{
            position: 'absolute',
            bottom: 65,
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 30,
            background: 'rgba(5, 5, 12, 0.92)',
            border: '1px solid #00e5ff',
            borderRadius: 20,
            padding: '6px 18px',
            fontFamily: "'Syncopate', sans-serif",
            fontSize: 8.5,
            fontWeight: 800,
            color: '#00e5ff',
            letterSpacing: 1.5,
            boxShadow: '0 0 20px rgba(0, 229, 255, 0.6)',
            pointerEvents: 'none',
          }}
        >
          🔍 CLICK TO ZOOM INTO SCREEN {hoveredScreen + 1}
        </div>
      )}

      {/* Floating Edge Pan Buttons (Click to pan across the 4 screens in 3D) */}
      {activeScreenIndex > 0 && !isDrivingIn && !isZoomed && (
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

      {activeScreenIndex < 3 && !isDrivingIn && !isZoomed && (
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
      {activeScreenIndex === 1 && !isDrivingIn && !isZoomed && onOpenSubmitModal && (
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
          opacity: isZoomed ? 0 : 1,
          transform: isZoomed ? 'translateY(25px)' : 'translateY(0)',
          transition: 'opacity 0.5s ease, transform 0.5s ease',
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
