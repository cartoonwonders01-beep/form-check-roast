import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { Eye, Flame, Volume2, Sparkles, ZoomIn, ZoomOut, RotateCcw, Activity } from 'lucide-react';

const EXERCISE_CONFIG = {
  pushup: {
    title: 'Press-ups',
    primaryMuscles: ['Pectorals (Chest)', 'Triceps Brachii'],
    secondaryMuscles: ['Anterior Deltoids', 'Core / Abs'],
    optimalAngle: 'side',
    targetDepth: '90° Elbow Flexion',
    tempo: '2s Down • 1s Pause • 1s Up'
  },
  squat: {
    title: 'Squats',
    primaryMuscles: ['Quadriceps', 'Gluteus Maximus'],
    secondaryMuscles: ['Hamstrings', 'Core Stabilizers'],
    optimalAngle: 'iso',
    targetDepth: 'Femur Parallel to Floor',
    tempo: '3s Down • 1s Pause • 2s Up'
  },
  situp: {
    title: 'Sit-ups',
    primaryMuscles: ['Rectus Abdominis (Core)'],
    secondaryMuscles: ['Hip Flexors', 'Obliques'],
    optimalAngle: 'side',
    targetDepth: '70° Upright Spinal Curl',
    tempo: '2s Up • 2s Controlled Descent'
  },
  plank: {
    title: 'Plank Hold',
    primaryMuscles: ['Transverse Abdominis', 'Core Stabilizers'],
    secondaryMuscles: ['Glutes', 'Deltoids', 'Quads'],
    optimalAngle: 'side',
    targetDepth: '180° Neutral Spinal Line',
    tempo: 'Isometric Continuous Hold'
  }
};

const CAMERA_PRESETS = [
  { id: 'auto', label: 'Smart' },
  { id: 'side', label: 'Side (90°)' },
  { id: 'iso', label: '3D Quarter' },
  { id: 'front', label: 'Front' },
  { id: 'top', label: 'Top' },
];

export default function ThreeCharacterStudio({ 
  character = 'humanoid', 
  exercise = 'pushup', 
  isPlaying = true,
  roastData,
  onTriggerRoast,
  isLoadingRoast
}) {
  const containerRef = useRef(null);
  const [selectedAngle, setSelectedAngle] = useState('auto');
  const [zoomLevel, setZoomLevel] = useState(3.0);

  const targetCamPosRef = useRef(new THREE.Vector3(0, 1.0, 3.0));
  const targetLookAtRef = useRef(new THREE.Vector3(0, 0.0, 0));

  const currentConfig = EXERCISE_CONFIG[exercise] || EXERCISE_CONFIG.pushup;
  const effectiveAngle = selectedAngle === 'auto' 
    ? (currentConfig.optimalAngle || 'side')
    : selectedAngle;

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // ── 1. WEBGL SETUP ────────────────────────────────────────────────
    const scene = new THREE.Scene();
    const width = container.clientWidth || 380;
    const height = container.clientHeight || 260;

    const camera = new THREE.PerspectiveCamera(36, width / height, 0.1, 100);
    camera.position.set(0, 1.0, 3.0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.35;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // ── 2. 3-POINT STUDIO LIGHTING ────────────────────────────────────
    const keyLight = new THREE.DirectionalLight(0xfff8f0, 3.5);
    keyLight.position.set(3.5, 5.0, 4.0);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 2048;
    keyLight.shadow.mapSize.height = 2048;
    keyLight.shadow.bias = -0.0005;
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0x38bdf8, 2.4);
    rimLight.position.set(-3.5, 3.0, -3.0);
    scene.add(rimLight);

    const fillLight = new THREE.DirectionalLight(0xffeedd, 1.2);
    fillLight.position.set(-2.0, 1.0, 3.0);
    scene.add(fillLight);

    const ambientLight = new THREE.AmbientLight(0xffffff, 1.0);
    scene.add(ambientLight);

    // Floor Shadow & Grid
    const floorGeo = new THREE.CircleGeometry(1.8, 64);
    const floorMat = new THREE.MeshStandardMaterial({ 
      color: 0x000000, 
      roughness: 0.8,
      transparent: true,
      opacity: 0.22
    });
    const floorPlane = new THREE.Mesh(floorGeo, floorMat);
    floorPlane.rotation.x = -Math.PI / 2;
    floorPlane.position.y = -0.55;
    floorPlane.receiveShadow = true;
    scene.add(floorPlane);

    const gridHelper = new THREE.GridHelper(3.0, 12, 0xf97316, 0x475569);
    gridHelper.position.y = -0.54;
    gridHelper.material.opacity = 0.25;
    gridHelper.material.transparent = true;
    scene.add(gridHelper);

    // ── 3. LOAD FULLY RIGGED 3D HUMAN SKELETON ────────────────────────
    const modelRoot = new THREE.Group();
    scene.add(modelRoot);

    const b = {};
    let isRigReady = false;

    const loader = new GLTFLoader();
    loader.load(
      '/models/Soldier.glb',
      (gltf) => {
        const model = gltf.scene;
        model.scale.set(0.68, 0.68, 0.68);
        model.position.set(0, 0, 0);

        model.traverse((child) => {
          if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
            if (child.material) {
              child.material.roughness = 0.4;
              child.material.metalness = 0.1;
            }
          }
          if (child.isBone) {
            const norm = child.name.toLowerCase().replace(/mixamorig:?/g, '').replace(/[^a-z0-9]/g, '');
            b[norm] = child;
          }
        });

        modelRoot.add(model);
        isRigReady = true;
      },
      undefined,
      (err) => console.warn('GLB load error:', err)
    );

    // ── 4. CAMERA PRESETS POSITION CONFIG ─────────────────────────────
    const updateCameraTarget = () => {
      const z = zoomLevel / 3.0;
      switch (effectiveAngle) {
        case 'side':
          targetCamPosRef.current.set(2.7 * z, 0.35, 0.0);
          targetLookAtRef.current.set(0, -0.05, 0);
          break;
        case 'front':
          targetCamPosRef.current.set(0, 0.45, 2.7 * z);
          targetLookAtRef.current.set(0, -0.05, 0);
          break;
        case 'top':
          targetCamPosRef.current.set(1.5 * z, 2.4 * z, 1.5 * z);
          targetLookAtRef.current.set(0, -0.15, 0);
          break;
        case 'iso':
        default:
          targetCamPosRef.current.set(2.0 * z, 0.65, 2.0 * z);
          targetLookAtRef.current.set(0, -0.05, 0);
          break;
      }
    };

    updateCameraTarget();

    // ── 5. INTERACTION ────────────────────────────────────────────────
    let time = 0;
    let reqId = null;
    let isDragging = false;
    let prevMouseX = 0;
    let manualRotY = 0;

    const onMouseDown = (e) => {
      isDragging = true;
      prevMouseX = e.clientX;
    };
    const onMouseMove = (e) => {
      if (isDragging) {
        const deltaX = e.clientX - prevMouseX;
        manualRotY += deltaX * 0.015;
        prevMouseX = e.clientX;
      }
    };
    const onMouseUp = () => { isDragging = false; };

    const onWheel = (e) => {
      e.preventDefault();
      setZoomLevel((prev) => Math.min(4.5, Math.max(1.8, prev + e.deltaY * 0.003)));
    };

    container.addEventListener('mousedown', onMouseDown);
    container.addEventListener('wheel', onWheel, { passive: false });
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);

    const humanCadence = (x) => {
      const s = 0.5 - 0.5 * Math.cos(Math.PI * x);
      return Math.pow(s, 1.15);
    };

    // ── 6. SKELETAL MOVEMENT LOOP (Flawless Centering) ─────────────────
    const animate = () => {
      reqId = requestAnimationFrame(animate);

      if (isPlaying) {
        time += 0.038;
      }

      camera.position.lerp(targetCamPosRef.current, 0.08);
      camera.lookAt(targetLookAtRef.current);
      modelRoot.rotation.y = manualRotY;

      const rawCycle = (Math.sin(time) + 1) / 2;
      const k = humanCadence(rawCycle);

      if (isRigReady) {
        const hips = b['hips'];
        const spine = b['spine'];
        const spine1 = b['spine1'];
        const leftArm = b['leftarm'];
        const rightArm = b['rightarm'];
        const leftForeArm = b['leftforearm'];
        const rightForeArm = b['rightforearm'];
        const leftUpLeg = b['leftupleg'];
        const rightUpLeg = b['rightupleg'];
        const leftLeg = b['leftleg'];
        const rightLeg = b['rightleg'];
        const leftFoot = b['leftfoot'];
        const rightFoot = b['rightfoot'];
        const head = b['head'];

        if (exercise === 'pushup') {
          // Perfectly centered in viewport (+0.75 along Z)
          modelRoot.position.set(0, -0.26 + (1 - k) * 0.26, 0.75);
          modelRoot.rotation.x = THREE.MathUtils.degToRad(82);

          if (hips) hips.rotation.set(0, 0, 0);
          if (spine) spine.rotation.set(0, 0, 0);
          if (head) head.rotation.x = THREE.MathUtils.degToRad(-15);

          if (leftArm) leftArm.rotation.set(THREE.MathUtils.degToRad(-20 + k * 52), 0, THREE.MathUtils.degToRad(25 + k * 30));
          if (rightArm) rightArm.rotation.set(THREE.MathUtils.degToRad(-20 + k * 52), 0, THREE.MathUtils.degToRad(-25 - k * 30));
          if (leftForeArm) leftForeArm.rotation.x = THREE.MathUtils.degToRad(k * 88);
          if (rightForeArm) rightForeArm.rotation.x = THREE.MathUtils.degToRad(k * 88);

          if (leftFoot) leftFoot.rotation.x = THREE.MathUtils.degToRad(75);
          if (rightFoot) rightFoot.rotation.x = THREE.MathUtils.degToRad(75);
        } else if (exercise === 'squat') {
          // Centered Squat
          modelRoot.position.set(0, -0.48 - k * 0.34, 0);
          modelRoot.rotation.x = 0;

          if (spine) spine.rotation.x = THREE.MathUtils.degToRad(k * 26);
          if (spine1) spine1.rotation.x = THREE.MathUtils.degToRad(k * 10);
          if (head) head.rotation.x = THREE.MathUtils.degToRad(-k * 18);

          if (leftUpLeg) leftUpLeg.rotation.x = THREE.MathUtils.degToRad(-k * 90);
          if (rightUpLeg) rightUpLeg.rotation.x = THREE.MathUtils.degToRad(-k * 90);
          if (leftLeg) leftLeg.rotation.x = THREE.MathUtils.degToRad(k * 108);
          if (rightLeg) rightLeg.rotation.x = THREE.MathUtils.degToRad(k * 108);

          if (leftArm) leftArm.rotation.x = THREE.MathUtils.degToRad(k * 82);
          if (rightArm) rightArm.rotation.x = THREE.MathUtils.degToRad(k * 82);
        } else if (exercise === 'situp') {
          // Centered Sit-up (+0.60 along Z)
          modelRoot.position.set(0, -0.32, 0.60);
          modelRoot.rotation.x = THREE.MathUtils.degToRad(-82);

          if (spine) spine.rotation.x = THREE.MathUtils.degToRad(k * 70);
          if (spine1) spine1.rotation.x = THREE.MathUtils.degToRad(k * 22);
          if (head) head.rotation.x = THREE.MathUtils.degToRad(k * 24);

          if (leftUpLeg) leftUpLeg.rotation.x = THREE.MathUtils.degToRad(55);
          if (rightUpLeg) rightUpLeg.rotation.x = THREE.MathUtils.degToRad(55);
          if (leftLeg) leftLeg.rotation.x = THREE.MathUtils.degToRad(-65);
          if (rightLeg) rightLeg.rotation.x = THREE.MathUtils.degToRad(-65);

          if (leftArm) leftArm.rotation.set(THREE.MathUtils.degToRad(110), 0, THREE.MathUtils.degToRad(35));
          if (rightArm) rightArm.rotation.set(THREE.MathUtils.degToRad(110), 0, THREE.MathUtils.degToRad(-35));
          if (leftForeArm) leftForeArm.rotation.x = THREE.MathUtils.degToRad(55);
          if (rightForeArm) rightForeArm.rotation.x = THREE.MathUtils.degToRad(55);
        } else {
          // Centered Plank (+0.75 along Z)
          modelRoot.position.set(0, -0.26, 0.75);
          modelRoot.rotation.x = THREE.MathUtils.degToRad(82);

          const breathing = Math.sin(time * 6) * 0.006;
          if (spine) spine.position.y = breathing;

          if (leftArm) leftArm.rotation.set(THREE.MathUtils.degToRad(15), 0, THREE.MathUtils.degToRad(20));
          if (rightArm) rightArm.rotation.set(THREE.MathUtils.degToRad(15), 0, THREE.MathUtils.degToRad(-20));
          if (leftForeArm) leftForeArm.rotation.x = THREE.MathUtils.degToRad(85);
          if (rightForeArm) rightForeArm.rotation.x = THREE.MathUtils.degToRad(85);
        }
      }

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      if (reqId) cancelAnimationFrame(reqId);
      container.removeEventListener('mousedown', onMouseDown);
      container.removeEventListener('wheel', onWheel);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      renderer.dispose();
    };
  }, [character, exercise, isPlaying, effectiveAngle, zoomLevel]);

  const speakRoast = () => {
    if ('speechSynthesis' in window && roastData?.roast) {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(`${roastData.roast} Correction: ${roastData.correction}`);
      u.rate = 1.0;
      u.pitch = character === 'duck' ? 1.3 : character === 'vader' ? 0.7 : character === 'woody' ? 1.2 : 1.05;
      window.speechSynthesis.speak(u);
    }
  };

  return (
    <div className="space-y-2.5 w-full">
      {/* ── 3D FitCraft Visualizer Viewport ── */}
      <div 
        ref={containerRef} 
        className="relative w-full h-[260px] cursor-grab active:cursor-grabbing flex items-center justify-center bg-gradient-to-b from-slate-900 via-[#0D1117] to-black rounded-3xl border border-white/10 overflow-hidden shadow-2xl"
      >
        {/* Floating FitCraft HUD Controls */}
        <div className="absolute top-2.5 left-3 flex items-center gap-1.5 z-10 pointer-events-none">
          <div className="bg-black/70 backdrop-blur-md px-2.5 py-0.5 rounded-full border border-white/10 flex items-center gap-1.5 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            <span className="text-[9px] font-mono font-bold tracking-wider text-cyan-300 uppercase">
              3D VISUALIZER • 60 FPS
            </span>
          </div>
        </div>

        {/* Zoom & Reset Controls */}
        <div className="absolute top-2.5 right-3 flex items-center gap-1 z-10">
          <button
            onClick={() => setZoomLevel((prev) => Math.max(1.8, prev - 0.4))}
            className="p-1 rounded-lg bg-black/60 backdrop-blur-md border border-white/10 text-gray-300 hover:text-white transition-colors"
            title="Zoom In"
          >
            <ZoomIn className="w-3 h-3" />
          </button>
          <button
            onClick={() => setZoomLevel((prev) => Math.min(4.5, prev + 0.4))}
            className="p-1 rounded-lg bg-black/60 backdrop-blur-md border border-white/10 text-gray-300 hover:text-white transition-colors"
            title="Zoom Out"
          >
            <ZoomOut className="w-3 h-3" />
          </button>
          <button
            onClick={() => {
              setZoomLevel(3.0);
              setSelectedAngle('auto');
            }}
            className="p-1 rounded-lg bg-black/60 backdrop-blur-md border border-white/10 text-gray-300 hover:text-white transition-colors"
            title="Reset Camera"
          >
            <RotateCcw className="w-3 h-3" />
          </button>
        </div>

        {/* Floating Quick Roast Button */}
        <button
          onClick={onTriggerRoast}
          disabled={isLoadingRoast}
          className="absolute bottom-2.5 right-3 py-1.5 px-3 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 active:scale-95 text-black text-[11px] font-black tracking-wide shadow-lg shadow-orange-500/30 flex items-center gap-1.5 transition-all z-10 uppercase"
        >
          <Flame className={`w-3 h-3 fill-current ${isLoadingRoast ? 'animate-spin' : ''}`} />
          <span>{isLoadingRoast ? 'Roasting...' : 'Roast Form'}</span>
        </button>
      </div>

      {/* ── Reference Angle Strip ── */}
      <div className="flex items-center justify-between gap-1 p-1 bg-slate-100 dark:bg-zinc-800/60 rounded-2xl border border-slate-200/60 dark:border-zinc-700/50">
        {CAMERA_PRESETS.map((preset) => {
          const isSelected = selectedAngle === preset.id;
          return (
            <button
              key={preset.id}
              onClick={() => setSelectedAngle(preset.id)}
              className={`flex-1 py-1 px-1 rounded-xl text-[10px] font-bold font-mono transition-all text-center flex flex-col items-center justify-center ${
                isSelected
                  ? 'bg-white dark:bg-zinc-900 text-orange-600 dark:text-orange-400 shadow-sm border border-slate-200/50 dark:border-zinc-700/60'
                  : 'text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-white'
              }`}
            >
              <span>{preset.label}</span>
            </button>
          );
        })}
      </div>

      {/* ── FitCraft Muscle Anatomy Card ── */}
      <div className="bg-slate-50 dark:bg-zinc-900/80 border border-slate-200/80 dark:border-zinc-800 rounded-2xl p-3 space-y-1.5 shadow-sm">
        <div className="flex items-center justify-between text-[10px] font-mono font-bold text-slate-500 dark:text-zinc-400">
          <span className="flex items-center gap-1">
            <Activity className="w-3 h-3 text-cyan-500" />
            TARGET BIOMECHANICS
          </span>
          <span className="text-orange-500 font-bold">{currentConfig.targetDepth}</span>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="bg-white dark:bg-zinc-800/60 p-1.5 rounded-xl border border-slate-100 dark:border-zinc-700/40">
            <div className="text-[9px] font-bold uppercase text-slate-400 dark:text-zinc-500 mb-0.5">Primary Muscles</div>
            <div className="font-semibold text-slate-800 dark:text-zinc-200 text-[11px]">{currentConfig.primaryMuscles.join(', ')}</div>
          </div>
          <div className="bg-white dark:bg-zinc-800/60 p-1.5 rounded-xl border border-slate-100 dark:border-zinc-700/40">
            <div className="text-[9px] font-bold uppercase text-slate-400 dark:text-zinc-500 mb-0.5">Recommended Cadence</div>
            <div className="font-semibold text-slate-800 dark:text-zinc-200 text-[11px]">{currentConfig.tempo}</div>
          </div>
        </div>
      </div>

      {/* ── Prominent Coach Roast Speech Bubble ── */}
      {roastData && (
        <div className="w-full bg-orange-500/10 dark:bg-orange-950/30 border border-orange-500/20 rounded-2xl p-3 shadow-sm space-y-1.5 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Flame className="w-3.5 h-3.5 text-orange-500 fill-current" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-orange-700 dark:text-orange-400">
                Coach Verdict
              </span>
            </div>
            <button
              onClick={speakRoast}
              className="p-1 rounded-full hover:bg-orange-500/20 text-orange-600 dark:text-orange-400 transition-colors"
              title="Play voice"
            >
              <Volume2 className="w-3.5 h-3.5" />
            </button>
          </div>

          <p className="text-xs md:text-sm font-bold text-slate-900 dark:text-orange-100 leading-snug">
            "{roastData.roast}"
          </p>

          <div className="text-[10px] text-slate-700 dark:text-orange-200/80 font-medium flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-orange-500 shrink-0" />
            <span>Cue: {roastData.correction}</span>
          </div>
        </div>
      )}
    </div>
  );
}
