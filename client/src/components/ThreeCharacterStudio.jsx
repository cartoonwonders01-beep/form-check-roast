import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { Eye, Flame, Volume2, Sparkles, RefreshCw } from 'lucide-react';

const EXERCISE_OPTIMAL_ANGLES = {
  pushup: 'side',
  squat: 'iso',
  situp: 'side',
  plank: 'side',
};

const CAMERA_PRESETS = [
  { id: 'auto', label: 'Smart Angle', desc: 'Optimal for movement' },
  { id: 'side', label: 'Side (90°)', desc: 'Spine & Depth' },
  { id: 'iso', label: '3D Quarter (45°)', desc: 'Depth & Form' },
  { id: 'front', label: 'Front (0°)', desc: 'Symmetry & Flare' },
  { id: 'top', label: 'Overhead (3/4)', desc: 'Hand/Arm Track' },
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
  const [modelLoaded, setModelLoaded] = useState(false);
  const targetCamPosRef = useRef(new THREE.Vector3(0, 1.1, 3.2));
  const targetLookAtRef = useRef(new THREE.Vector3(0, 0.15, 0));

  const effectiveAngle = selectedAngle === 'auto' 
    ? (EXERCISE_OPTIMAL_ANGLES[exercise] || 'side')
    : selectedAngle;

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // ── 1. WEBGL SETUP ────────────────────────────────────────────────
    const scene = new THREE.Scene();
    const width = container.clientWidth || 380;
    const height = container.clientHeight || 280;

    const camera = new THREE.PerspectiveCamera(36, width / height, 0.1, 100);
    camera.position.set(0, 1.1, 3.2);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // ── 2. STUDIO 3-POINT LIGHTING ────────────────────────────────────
    const keyLight = new THREE.DirectionalLight(0xfff8f0, 2.5);
    keyLight.position.set(3.5, 5.0, 4.0);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 2048;
    keyLight.shadow.mapSize.height = 2048;
    keyLight.shadow.bias = -0.0005;
    keyLight.shadow.radius = 2.5;
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0x38bdf8, 1.6);
    rimLight.position.set(-3.5, 3.0, -3.0);
    scene.add(rimLight);

    const fillLight = new THREE.DirectionalLight(0xffeedd, 0.9);
    fillLight.position.set(-2.0, 1.0, 3.0);
    scene.add(fillLight);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);

    // Floor Shadow
    const floorGeo = new THREE.CircleGeometry(1.6, 64);
    const floorMat = new THREE.MeshStandardMaterial({ 
      color: 0x000000, 
      roughness: 0.8,
      transparent: true,
      opacity: 0.14
    });
    const floorPlane = new THREE.Mesh(floorGeo, floorMat);
    floorPlane.rotation.x = -Math.PI / 2;
    floorPlane.position.y = -0.58;
    floorPlane.receiveShadow = true;
    scene.add(floorPlane);

    // ── 3. LOAD REAL 3D RIGGED HUMANOID MODEL (GLTF / GLB) ───────────
    const modelGroup = new THREE.Group();
    scene.add(modelGroup);

    let bones = {};
    let isRigReady = false;

    const loader = new GLTFLoader();
    const modelUrl = character === 'woody' || character === 'vader' 
      ? '/models/Soldier.glb' 
      : '/models/Xbot.glb';

    loader.load(
      modelUrl,
      (gltf) => {
        const model = gltf.scene;
        model.scale.set(0.7, 0.7, 0.7);
        model.position.y = -0.55;

        // Traverse and enable soft shadows & locate anatomical bones
        model.traverse((child) => {
          if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
            if (child.material) {
              child.material.roughness = 0.5;
              child.material.metalness = 0.1;
            }
          }
          if (child.isBone) {
            bones[child.name] = child;
          }
        });

        modelGroup.add(model);
        isRigReady = true;
        setModelLoaded(true);
      },
      undefined,
      (err) => {
        console.warn('Local GLB load fallback:', err);
      }
    );

    // ── 4. CAMERA PRESETS POSITION CONFIG ─────────────────────────────
    const updateCameraTarget = () => {
      switch (effectiveAngle) {
        case 'side':
          targetCamPosRef.current.set(3.2, 0.6, 0.2);
          targetLookAtRef.current.set(0, -0.1, 0);
          break;
        case 'front':
          targetCamPosRef.current.set(0, 0.7, 3.2);
          targetLookAtRef.current.set(0, 0.0, 0);
          break;
        case 'top':
          targetCamPosRef.current.set(1.8, 2.6, 1.8);
          targetLookAtRef.current.set(0, -0.2, 0);
          break;
        case 'iso':
        default:
          targetCamPosRef.current.set(2.4, 1.0, 2.4);
          targetLookAtRef.current.set(0, 0.0, 0);
          break;
      }
    };

    updateCameraTarget();

    // ── 5. INTERACTION & ORBIT ────────────────────────────────────────
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

    container.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);

    // Human-grade Sinusoidal Cadence Curve with Stretch Reflex & Pause
    const humanCadence = (x) => {
      const s = 0.5 - 0.5 * Math.cos(Math.PI * x);
      return Math.pow(s, 1.15);
    };

    // ── 6. REAL SKELETAL SKELETON ANIMATION LOOP ───────────────────────
    const animate = () => {
      reqId = requestAnimationFrame(animate);

      if (isPlaying) {
        time += 0.038;
      }

      camera.position.lerp(targetCamPosRef.current, 0.07);
      camera.lookAt(targetLookAtRef.current);
      modelGroup.rotation.y = manualRotY;

      const rawCycle = (Math.sin(time) + 1) / 2;
      const k = humanCadence(rawCycle);

      if (isRigReady) {
        // Access Mixamo Skeletal Bones
        const hips = bones['mixamorigHips'] || bones['Hips'];
        const spine = bones['mixamorigSpine'] || bones['Spine'];
        const spine1 = bones['mixamorigSpine1'] || bones['Spine1'];
        const spine2 = bones['mixamorigSpine2'] || bones['Spine2'];
        const leftArm = bones['mixamorigLeftArm'] || bones['LeftArm'];
        const rightArm = bones['mixamorigRightArm'] || bones['RightArm'];
        const leftForeArm = bones['mixamorigLeftForeArm'] || bones['LeftForeArm'];
        const rightForeArm = bones['mixamorigRightForeArm'] || bones['RightForeArm'];
        const leftUpLeg = bones['mixamorigLeftUpLeg'] || bones['LeftUpLeg'];
        const rightUpLeg = bones['mixamorigRightUpLeg'] || bones['RightUpLeg'];
        const leftLeg = bones['mixamorigLeftLeg'] || bones['LeftLeg'];
        const rightLeg = bones['mixamorigRightLeg'] || bones['RightLeg'];
        const head = bones['mixamorigHead'] || bones['Head'];

        if (exercise === 'pushup') {
          // ── PUSH-UP ──
          modelGroup.position.set(0, -0.45 + (1 - k) * 0.28, 0);
          modelGroup.rotation.x = THREE.MathUtils.degToRad(82);

          if (hips) hips.rotation.set(0, 0, 0);
          if (spine) spine.rotation.set(0, 0, 0);
          if (head) head.rotation.x = THREE.MathUtils.degToRad(-15);

          if (leftArm) leftArm.rotation.set(THREE.MathUtils.degToRad(-20 + k * 45), 0, THREE.MathUtils.degToRad(25 + k * 30));
          if (rightArm) rightArm.rotation.set(THREE.MathUtils.degToRad(-20 + k * 45), 0, THREE.MathUtils.degToRad(-25 - k * 30));
          if (leftForeArm) leftForeArm.rotation.x = THREE.MathUtils.degToRad(k * 85);
          if (rightForeArm) rightForeArm.rotation.x = THREE.MathUtils.degToRad(k * 85);

          if (leftUpLeg) leftUpLeg.rotation.set(0, 0, 0);
          if (rightUpLeg) rightUpLeg.rotation.set(0, 0, 0);
          if (leftLeg) leftLeg.rotation.set(0, 0, 0);
          if (rightLeg) rightLeg.rotation.set(0, 0, 0);
        } else if (exercise === 'squat') {
          // ── SQUAT ──
          modelGroup.position.set(0, -0.55 - k * 0.35, 0);
          modelGroup.rotation.x = 0;

          if (spine) spine.rotation.x = THREE.MathUtils.degToRad(k * 24);
          if (head) head.rotation.x = THREE.MathUtils.degToRad(-k * 18);

          if (leftUpLeg) leftUpLeg.rotation.x = THREE.MathUtils.degToRad(-k * 88);
          if (rightUpLeg) rightUpLeg.rotation.x = THREE.MathUtils.degToRad(-k * 88);
          if (leftLeg) leftLeg.rotation.x = THREE.MathUtils.degToRad(k * 105);
          if (rightLeg) rightLeg.rotation.x = THREE.MathUtils.degToRad(k * 105);

          if (leftArm) leftArm.rotation.x = THREE.MathUtils.degToRad(k * 80);
          if (rightArm) rightArm.rotation.x = THREE.MathUtils.degToRad(k * 80);
          if (leftForeArm) leftForeArm.rotation.x = 0;
          if (rightForeArm) rightForeArm.rotation.x = 0;
        } else if (exercise === 'situp') {
          // ── SIT-UP ──
          modelGroup.position.set(0, -0.55, 0);
          modelGroup.rotation.x = THREE.MathUtils.degToRad(-82);

          if (spine) spine.rotation.x = THREE.MathUtils.degToRad(k * 68);
          if (spine1) spine1.rotation.x = THREE.MathUtils.degToRad(k * 20);
          if (head) head.rotation.x = THREE.MathUtils.degToRad(k * 22);

          if (leftUpLeg) leftUpLeg.rotation.x = THREE.MathUtils.degToRad(55);
          if (rightUpLeg) rightUpLeg.rotation.x = THREE.MathUtils.degToRad(55);
          if (leftLeg) leftLeg.rotation.x = THREE.MathUtils.degToRad(-65);
          if (rightLeg) rightLeg.rotation.x = THREE.MathUtils.degToRad(-65);

          if (leftArm) leftArm.rotation.set(THREE.MathUtils.degToRad(110), 0, THREE.MathUtils.degToRad(35));
          if (rightArm) rightArm.rotation.set(THREE.MathUtils.degToRad(110), 0, THREE.MathUtils.degToRad(-35));
          if (leftForeArm) leftForeArm.rotation.x = THREE.MathUtils.degToRad(55);
          if (rightForeArm) rightForeArm.rotation.x = THREE.MathUtils.degToRad(55);
        } else {
          // ── PLANK ──
          modelGroup.position.set(0, -0.45, 0);
          modelGroup.rotation.x = THREE.MathUtils.degToRad(82);

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
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      renderer.dispose();
    };
  }, [character, exercise, isPlaying, effectiveAngle]);

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
      {/* ── 3D Viewport Frame ── */}
      <div 
        ref={containerRef} 
        className="relative w-full h-[270px] cursor-grab active:cursor-grabbing flex items-center justify-center bg-gradient-to-b from-slate-50/90 via-slate-100/70 to-slate-200/50 dark:from-zinc-900/90 dark:via-zinc-950 dark:to-black rounded-3xl border border-slate-200/80 dark:border-zinc-800/80 overflow-hidden shadow-inner"
      >
        {/* Active Angle Badge */}
        <div className="absolute top-2.5 right-3 pointer-events-none text-[9px] font-mono tracking-widest text-slate-500 dark:text-zinc-400 uppercase bg-white/80 dark:bg-zinc-800/80 backdrop-blur-sm px-2.5 py-0.5 rounded-full border border-slate-200/60 dark:border-zinc-700/60 flex items-center gap-1.5 shadow-sm">
          <Eye className="w-2.5 h-2.5 text-orange-500" />
          <span>VIEW: {effectiveAngle.toUpperCase()}</span>
        </div>

        {/* Floating Quick Roast Button */}
        <button
          onClick={onTriggerRoast}
          disabled={isLoadingRoast}
          className="absolute bottom-3 right-3 py-1.5 px-3 rounded-full bg-orange-500 hover:bg-orange-600 active:scale-95 text-white text-[11px] font-bold shadow-lg shadow-orange-500/30 flex items-center gap-1.5 transition-all"
        >
          <Flame className={`w-3.5 h-3.5 fill-current ${isLoadingRoast ? 'animate-spin' : ''}`} />
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
              className={`flex-1 py-1.5 px-1 rounded-xl text-[10px] font-bold font-mono transition-all text-center flex flex-col items-center justify-center ${
                isSelected
                  ? 'bg-white dark:bg-zinc-900 text-orange-600 dark:text-orange-400 shadow-sm border border-slate-200/50 dark:border-zinc-700/60'
                  : 'text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-white'
              }`}
              title={preset.desc}
            >
              <span>{preset.label}</span>
            </button>
          );
        })}
      </div>

      {/* ── Prominent Coach Roast Speech Bubble ── */}
      {roastData && (
        <div className="w-full bg-orange-500/10 dark:bg-orange-950/30 border border-orange-500/20 rounded-2xl p-3.5 shadow-sm space-y-2 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Flame className="w-3.5 h-3.5 text-orange-500 fill-current" />
              <span className="text-[11px] font-bold uppercase tracking-wider text-orange-700 dark:text-orange-400">
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

          <div className="text-[11px] text-slate-700 dark:text-orange-200/80 font-medium flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-orange-500 shrink-0" />
            <span>Cue: {roastData.correction}</span>
          </div>
        </div>
      )}
    </div>
  );
}
