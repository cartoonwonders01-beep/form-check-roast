import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Eye, Flame, Volume2, Sparkles, RefreshCw } from 'lucide-react';

const EXERCISE_OPTIMAL_ANGLES = {
  pushup: 'side',       // Best for spinal plank, hip sag & elbow depth
  squat: 'iso',         // Best for hip depth, knee tracking & chest angle
  situp: 'side',        // Best for spinal curling & crunch height
  plank: 'side',        // Best for straight line check
};

const CAMERA_PRESETS = [
  { id: 'auto', label: 'Smart Angle', desc: 'Auto-picked for exercise' },
  { id: 'side', label: 'Side (90°)', desc: 'Spine & Depth' },
  { id: 'iso', label: '3D Quarter (45°)', desc: 'Full Depth' },
  { id: 'front', label: 'Front (0°)', desc: 'Elbow/Knee Flare' },
  { id: 'top', label: 'Overhead (3/4)', desc: 'Hand Placement' },
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
  const targetCamPosRef = useRef(new THREE.Vector3(0, 1.1, 3.2));
  const targetLookAtRef = useRef(new THREE.Vector3(0, 0.15, 0));

  const effectiveAngle = selectedAngle === 'auto' 
    ? (EXERCISE_OPTIMAL_ANGLES[exercise] || 'side')
    : selectedAngle;

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // ── 1. SCENE & CAMERA ─────────────────────────────────────────────
    const scene = new THREE.Scene();
    const width = container.clientWidth || 380;
    const height = container.clientHeight || 280;

    const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 100);
    camera.position.set(0, 1.1, 3.2);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // ── 2. STUDIO LIGHTING RIG ────────────────────────────────────────
    const keyLight = new THREE.DirectionalLight(0xfff5ea, 2.2);
    keyLight.position.set(3.5, 5.0, 4.0);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 2048;
    keyLight.shadow.mapSize.height = 2048;
    keyLight.shadow.bias = -0.0005;
    keyLight.shadow.radius = 3;
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0x38bdf8, 1.4);
    rimLight.position.set(-3.5, 3.0, -3.0);
    scene.add(rimLight);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.85);
    scene.add(ambientLight);

    // Floor Shadow
    const floorGeo = new THREE.CircleGeometry(1.6, 64);
    const floorMat = new THREE.MeshStandardMaterial({ 
      color: 0x000000, 
      roughness: 0.8,
      transparent: true,
      opacity: 0.12
    });
    const floorPlane = new THREE.Mesh(floorGeo, floorMat);
    floorPlane.rotation.x = -Math.PI / 2;
    floorPlane.position.y = -0.55;
    floorPlane.receiveShadow = true;
    scene.add(floorPlane);

    // ── 3. MATERIALS PIPELINE ─────────────────────────────────────────
    const isHumanoid = character === 'humanoid';
    const isWoody = character === 'woody';
    const isVader = character === 'vader';

    // Seven.app Athletic Humanoid Materials
    const matSkin = new THREE.MeshStandardMaterial({ 
      color: isHumanoid ? 0xfbcfe8 : isWoody ? 0xfcd34d : isVader ? 0x111318 : 0xfbbf24,
      roughness: isHumanoid ? 0.6 : 0.2,
      metalness: 0.05
    });

    const matShirt = new THREE.MeshStandardMaterial({
      color: isHumanoid ? 0xf97316 : isWoody ? 0xf59e0b : isVader ? 0x18181b : 0xdc2626,
      roughness: 0.5
    });

    const matShorts = new THREE.MeshStandardMaterial({
      color: isHumanoid ? 0x1e293b : isWoody ? 0x1d4ed8 : isVader ? 0x090a0f : 0x2563eb,
      roughness: 0.6
    });

    const matShoes = new THREE.MeshStandardMaterial({
      color: isHumanoid ? 0xffffff : 0x18181b,
      roughness: 0.4
    });

    // ── 4. BUILD ATHLETIC HUMANOID RIG (Seven.app Style) ───────────────
    const rootModel = new THREE.Group();
    scene.add(rootModel);

    // PELVIS / HIPS
    const pelvis = new THREE.Group();
    rootModel.add(pelvis);

    const pelvisGeo = isHumanoid 
      ? new THREE.CylinderGeometry(0.16, 0.14, 0.18, 24)
      : new THREE.CylinderGeometry(0.12, 0.12, 0.36, 24);
    const pelvisMesh = new THREE.Mesh(pelvisGeo, matShorts);
    if (!isHumanoid) pelvisMesh.rotation.z = Math.PI / 2;
    pelvisMesh.castShadow = true;
    pelvis.add(pelvisMesh);

    // SPINE / TORSO
    const torsoGroup = new THREE.Group();
    torsoGroup.position.y = 0.10;
    pelvis.add(torsoGroup);

    // Athletic Tapered Chest & Ribcage
    const chestGeo = isHumanoid
      ? new THREE.CylinderGeometry(0.23, 0.17, 0.44, 24)
      : new THREE.CylinderGeometry(0.24, 0.30, 0.44, 4, 1, false, Math.PI / 4);
    const chestMesh = new THREE.Mesh(chestGeo, matShirt);
    chestMesh.position.y = 0.22;
    chestMesh.castShadow = true;
    torsoGroup.add(chestMesh);

    // NECK & HEAD
    const neckGroup = new THREE.Group();
    neckGroup.position.y = 0.48;
    torsoGroup.add(neckGroup);

    const headGeo = isHumanoid
      ? new THREE.SphereGeometry(0.15, 24, 24)
      : new THREE.CylinderGeometry(0.17, 0.17, 0.28, 32);
    const headMesh = new THREE.Mesh(headGeo, matSkin);
    headMesh.position.y = 0.14;
    headMesh.castShadow = true;
    neckGroup.add(headMesh);

    // Hair / Headband for Humanoid
    if (isHumanoid) {
      const hairGeo = new THREE.SphereGeometry(0.155, 20, 20, 0, Math.PI * 2, 0, Math.PI * 0.5);
      const hairMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.8 });
      const hairMesh = new THREE.Mesh(hairGeo, hairMat);
      hairMesh.position.y = 0.16;
      neckGroup.add(hairMesh);
    } else if (character === 'lego') {
      const studGeo = new THREE.CylinderGeometry(0.075, 0.075, 0.07, 24);
      const studMesh = new THREE.Mesh(studGeo, matSkin);
      studMesh.position.y = 0.31;
      neckGroup.add(studMesh);
    }

    // ── ARMS (Deltoid -> Bicep -> Elbow -> Forearm -> Hand) ───────────
    const makeArm = (isLeft) => {
      const shoulderJoint = new THREE.Group();
      shoulderJoint.position.set(isLeft ? -0.28 : 0.28, 0.38, 0);
      torsoGroup.add(shoulderJoint);

      // Deltoid
      const deltoid = new THREE.Mesh(new THREE.SphereGeometry(0.08, 16, 16), matShirt);
      shoulderJoint.add(deltoid);

      // Upper Arm / Bicep
      const upperArm = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.055, 0.22, 16), matSkin);
      upperArm.position.y = -0.11;
      upperArm.castShadow = true;
      shoulderJoint.add(upperArm);

      // Elbow Joint
      const elbowJoint = new THREE.Group();
      elbowJoint.position.y = -0.22;
      shoulderJoint.add(elbowJoint);

      // Forearm
      const forearm = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.045, 0.20, 16), matSkin);
      forearm.position.y = -0.10;
      forearm.castShadow = true;
      elbowJoint.add(forearm);

      // Hand
      const hand = new THREE.Mesh(new THREE.SphereGeometry(0.05, 16, 16), matSkin);
      hand.position.y = -0.22;
      hand.castShadow = true;
      elbowJoint.add(hand);

      return { shoulderJoint, elbowJoint };
    };

    const leftArm = makeArm(true);
    const rightArm = makeArm(false);

    // ── LEGS (Hip -> Thigh -> Knee -> Calf -> Athletic Shoes) ─────────
    const makeLeg = (isLeft) => {
      const hipJoint = new THREE.Group();
      hipJoint.position.set(isLeft ? -0.12 : 0.12, -0.08, 0);
      pelvis.add(hipJoint);

      // Thigh / Quad
      const thigh = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.065, 0.26, 16), isHumanoid ? matSkin : matShorts);
      thigh.position.y = -0.13;
      thigh.castShadow = true;
      hipJoint.add(thigh);

      // Knee Joint
      const kneeJoint = new THREE.Group();
      kneeJoint.position.y = -0.26;
      hipJoint.add(kneeJoint);

      // Calf
      const calf = new THREE.Mesh(new THREE.CylinderGeometry(0.065, 0.05, 0.24, 16), matSkin);
      calf.position.y = -0.12;
      calf.castShadow = true;
      kneeJoint.add(calf);

      // Athletic Sneaker
      const shoeGeo = new THREE.BoxGeometry(0.12, 0.08, 0.22);
      const shoe = new THREE.Mesh(shoeGeo, matShoes);
      shoe.position.set(0, -0.26, 0.05);
      shoe.castShadow = true;
      kneeJoint.add(shoe);

      return { hipJoint, kneeJoint };
    };

    const leftLeg = makeLeg(true);
    const rightLeg = makeLeg(false);

    // ── 5. CAMERA PRESETS POSITION CONFIG ─────────────────────────────
    const updateCameraTarget = () => {
      switch (effectiveAngle) {
        case 'side':
          targetCamPosRef.current.set(3.3, 0.8, 0.3);
          targetLookAtRef.current.set(0, 0.0, 0);
          break;
        case 'front':
          targetCamPosRef.current.set(0, 0.9, 3.3);
          targetLookAtRef.current.set(0, 0.1, 0);
          break;
        case 'top':
          targetCamPosRef.current.set(1.8, 2.8, 2.0);
          targetLookAtRef.current.set(0, 0.0, 0);
          break;
        case 'iso':
        default:
          targetCamPosRef.current.set(2.4, 1.2, 2.4);
          targetLookAtRef.current.set(0, 0.1, 0);
          break;
      }
    };

    updateCameraTarget();

    // ── 6. INTERACTION & ORBIT ────────────────────────────────────────
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

    // Humanoid Biomechanical Sine Curves (2s Cadence: Inhale Eccentric, Pause Depth, Exhale Lockout)
    const smoothEase = (x) => 0.5 - 0.5 * Math.cos(Math.PI * x);

    // ── 7. LIFELIKE HUMAN BIOMECHANICS ANIMATION LOOP ──────────────────
    const animate = () => {
      reqId = requestAnimationFrame(animate);

      if (isPlaying) {
        time += 0.038;
      }

      camera.position.lerp(targetCamPosRef.current, 0.07);
      camera.lookAt(targetLookAtRef.current);
      rootModel.rotation.y = manualRotY;

      const rawCycle = (Math.sin(time) + 1) / 2;
      const k = smoothEase(rawCycle);

      if (exercise === 'pushup') {
        // Humanoid Horizontal Plank
        rootModel.position.set(0, -0.22 + (1 - k) * 0.28, 0);
        rootModel.rotation.x = THREE.MathUtils.degToRad(78);

        // Scapular Retraction at depth
        chestMesh.scale.set(1 + (1 - k) * 0.05, 1, 1 + (1 - k) * 0.05); // Chest expands at bottom
        torsoGroup.rotation.x = 0;
        pelvis.rotation.x = 0;
        neckGroup.rotation.x = THREE.MathUtils.degToRad(-14);

        // Arms: 45° arrow trajectory, full 90° elbow flexion
        leftArm.shoulderJoint.rotation.x = THREE.MathUtils.degToRad(-25 + k * 52);
        rightArm.shoulderJoint.rotation.x = THREE.MathUtils.degToRad(-25 + k * 52);
        leftArm.shoulderJoint.rotation.z = THREE.MathUtils.degToRad(22 + k * 26);
        rightArm.shoulderJoint.rotation.z = THREE.MathUtils.degToRad(-22 - k * 26);
        leftArm.elbowJoint.rotation.x = THREE.MathUtils.degToRad(k * 85);
        rightArm.elbowJoint.rotation.x = THREE.MathUtils.degToRad(k * 85);

        leftLeg.hipJoint.rotation.x = 0;
        rightLeg.hipJoint.rotation.x = 0;
        leftLeg.kneeJoint.rotation.x = 0;
        rightLeg.kneeJoint.rotation.x = 0;
      } else if (exercise === 'squat') {
        // Humanoid Parallel Squat with Hip Hinge
        rootModel.position.set(0, 0.08, 0);
        rootModel.rotation.x = 0;

        const squatDepth = k * 0.38;
        pelvis.position.y = -squatDepth;

        // Hip Hinge: Torso leans 26° to counterbalance hips pushing back
        torsoGroup.rotation.x = THREE.MathUtils.degToRad(k * 26);
        neckGroup.rotation.x = THREE.MathUtils.degToRad(-k * 20);

        // Knees track over toes, hips break below parallel
        leftLeg.hipJoint.rotation.x = THREE.MathUtils.degToRad(-k * 88);
        rightLeg.hipJoint.rotation.x = THREE.MathUtils.degToRad(-k * 88);
        leftLeg.kneeJoint.rotation.x = THREE.MathUtils.degToRad(k * 98);
        rightLeg.kneeJoint.rotation.x = THREE.MathUtils.degToRad(k * 98);

        // Arms counterbalance forward
        leftArm.shoulderJoint.rotation.x = THREE.MathUtils.degToRad(k * 85);
        rightArm.shoulderJoint.rotation.x = THREE.MathUtils.degToRad(k * 85);
        leftArm.shoulderJoint.rotation.z = 0;
        rightArm.shoulderJoint.rotation.z = 0;
        leftArm.elbowJoint.rotation.x = 0;
        rightArm.elbowJoint.rotation.x = 0;
      } else if (exercise === 'situp') {
        rootModel.position.set(0, -0.32, 0);
        rootModel.rotation.x = THREE.MathUtils.degToRad(-82);

        // Segmental Spinal Curl
        torsoGroup.rotation.x = THREE.MathUtils.degToRad(k * 70);
        neckGroup.rotation.x = THREE.MathUtils.degToRad(k * 24);

        leftArm.shoulderJoint.rotation.x = THREE.MathUtils.degToRad(120);
        rightArm.shoulderJoint.rotation.x = THREE.MathUtils.degToRad(120);
        leftArm.shoulderJoint.rotation.z = THREE.MathUtils.degToRad(35);
        rightArm.shoulderJoint.rotation.z = THREE.MathUtils.degToRad(-35);
        leftArm.elbowJoint.rotation.x = THREE.MathUtils.degToRad(55);
        rightArm.elbowJoint.rotation.x = THREE.MathUtils.degToRad(55);

        leftLeg.hipJoint.rotation.x = THREE.MathUtils.degToRad(50);
        rightLeg.hipJoint.rotation.x = THREE.MathUtils.degToRad(50);
        leftLeg.kneeJoint.rotation.x = THREE.MathUtils.degToRad(-60);
        rightLeg.kneeJoint.rotation.x = THREE.MathUtils.degToRad(-60);
      } else {
        // Plank
        rootModel.position.set(0, 0.04, 0);
        rootModel.rotation.x = THREE.MathUtils.degToRad(78);

        const breathing = Math.sin(time * 6) * 0.008;
        pelvis.position.y = breathing;

        torsoGroup.rotation.x = 0;
        pelvis.rotation.x = 0;
        leftArm.shoulderJoint.rotation.x = THREE.MathUtils.degToRad(18);
        rightArm.shoulderJoint.rotation.x = THREE.MathUtils.degToRad(18);
        leftArm.elbowJoint.rotation.x = THREE.MathUtils.degToRad(85);
        rightArm.elbowJoint.rotation.x = THREE.MathUtils.degToRad(85);
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

        {/* Floating Quick Roast Button on Canvas */}
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
