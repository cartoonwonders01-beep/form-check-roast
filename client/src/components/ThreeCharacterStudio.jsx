import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Eye, Flame, Volume2, Sparkles } from 'lucide-react';

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
  const targetCamPosRef = useRef(new THREE.Vector3(0, 1.1, 3.2));
  const targetLookAtRef = useRef(new THREE.Vector3(0, 0.15, 0));

  const effectiveAngle = selectedAngle === 'auto' 
    ? (EXERCISE_OPTIMAL_ANGLES[exercise] || 'side')
    : selectedAngle;

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // ── 1. HIGH-END WEBGL RENDERER & CAMERA ───────────────────────────
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
    renderer.toneMappingExposure = 1.1;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // ── 2. CINEMATIC 3-POINT STUDIO LIGHTING ──────────────────────────
    // Key light with soft shadow
    const keyLight = new THREE.DirectionalLight(0xfff8f0, 2.4);
    keyLight.position.set(3.5, 5.0, 4.0);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 2048;
    keyLight.shadow.mapSize.height = 2048;
    keyLight.shadow.bias = -0.0005;
    keyLight.shadow.radius = 2.5;
    scene.add(keyLight);

    // Cool rim light (accentuates anatomical muscle definition)
    const rimLight = new THREE.DirectionalLight(0x38bdf8, 1.6);
    rimLight.position.set(-3.5, 3.0, -3.0);
    scene.add(rimLight);

    // Soft warm fill light
    const fillLight = new THREE.DirectionalLight(0xffeedd, 0.8);
    fillLight.position.set(-2.0, 1.0, 3.0);
    scene.add(fillLight);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    // Soft studio floor shadow
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

    // ── 3. ANATOMICALLY ORGANIC MATERIALS ─────────────────────────────
    const isHumanoid = character === 'humanoid';
    const isWoody = character === 'woody';
    const isVader = character === 'vader';

    // Realistic Organic Human Skin Material with Subsurface Scattering sheen
    const matHumanSkin = new THREE.MeshPhysicalMaterial({
      color: 0xf3c1a5, // Natural athletic skin tone
      roughness: 0.55,
      metalness: 0.0,
      clearcoat: 0.15,
      clearcoatRoughness: 0.4,
      sheen: 0.35,
      sheenColor: new THREE.Color(0xffd1ba)
    });

    const matLegoSkin = new THREE.MeshPhysicalMaterial({
      color: isWoody ? 0xfcd34d : isVader ? 0x111318 : 0xfbbf24,
      roughness: 0.18,
      clearcoat: 0.85
    });

    const matSkin = isHumanoid ? matHumanSkin : matLegoSkin;

    // Athletic compression shirt & shorts
    const matShirt = new THREE.MeshStandardMaterial({
      color: isHumanoid ? 0x0ea5e9 : isWoody ? 0xf59e0b : isVader ? 0x18181b : 0xdc2626, // Cyan athletic tee
      roughness: 0.65
    });

    const matShorts = new THREE.MeshStandardMaterial({
      color: isHumanoid ? 0x1e293b : isWoody ? 0x1d4ed8 : isVader ? 0x090a0f : 0x2563eb,
      roughness: 0.7
    });

    const matShoes = new THREE.MeshStandardMaterial({
      color: isHumanoid ? 0xffffff : 0x18181b,
      roughness: 0.35
    });

    const matHair = new THREE.MeshStandardMaterial({
      color: 0x2b1d14, // Dark brown natural hair
      roughness: 0.85
    });

    // ── 4. BUILD ORGANIC ANATOMICAL HUMAN RIG ─────────────────────────
    const rootModel = new THREE.Group();
    scene.add(rootModel);

    // ROOT HIPS & PELVIS
    const pelvis = new THREE.Group();
    rootModel.add(pelvis);

    // Contoured Pelvic Girdle & Glutes
    const pelvisMesh = new THREE.Mesh(new THREE.CapsuleGeometry(0.14, 0.12, 16, 24), matShorts);
    pelvisMesh.rotation.z = Math.PI / 2;
    pelvisMesh.castShadow = true;
    pelvis.add(pelvisMesh);

    // SPINE / TORSO GROUP (V-Taper Athletic Shape)
    const torsoGroup = new THREE.Group();
    torsoGroup.position.y = 0.08;
    pelvis.add(torsoGroup);

    // Abdominal Core
    const absMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.14, 0.16, 24), matShirt);
    absMesh.position.y = 0.08;
    absMesh.castShadow = true;
    torsoGroup.add(absMesh);

    // Pectoral Chest & Lats (Organic V-Taper)
    const chestGroup = new THREE.Group();
    chestGroup.position.y = 0.18;
    torsoGroup.add(chestGroup);

    const chestMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.16, 0.22, 24), matShirt);
    chestMesh.position.y = 0.10;
    chestMesh.castShadow = true;
    chestGroup.add(chestMesh);

    // Pectoral Muscle Contours (Left & Right)
    const pecGeo = new THREE.CapsuleGeometry(0.06, 0.08, 12, 16);
    const leftPec = new THREE.Mesh(pecGeo, matShirt);
    leftPec.position.set(-0.08, 0.12, 0.11);
    leftPec.rotation.z = Math.PI / 3.5;
    leftPec.rotation.x = -Math.PI / 8;
    chestGroup.add(leftPec);

    const rightPec = new THREE.Mesh(pecGeo, matShirt);
    rightPec.position.set(0.08, 0.12, 0.11);
    rightPec.rotation.z = -Math.PI / 3.5;
    rightPec.rotation.x = -Math.PI / 8;
    chestGroup.add(rightPec);

    // NECK & HEAD
    const neckGroup = new THREE.Group();
    neckGroup.position.y = 0.42;
    torsoGroup.add(neckGroup);

    const neckMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.08, 0.10, 20), matSkin);
    neckMesh.position.y = 0.05;
    neckMesh.castShadow = true;
    neckGroup.add(neckMesh);

    // Anatomical Head (Cranium + Jaw)
    const headMesh = new THREE.Mesh(new THREE.SphereGeometry(0.135, 24, 24), matSkin);
    headMesh.position.set(0, 0.17, 0.02);
    headMesh.scale.set(0.92, 1.08, 1.0);
    headMesh.castShadow = true;
    neckGroup.add(headMesh);

    // Styled Athletic Hair
    const hairMesh = new THREE.Mesh(new THREE.SphereGeometry(0.142, 24, 24, 0, Math.PI * 2, 0, Math.PI * 0.58), matHair);
    hairMesh.position.set(0, 0.19, -0.01);
    neckGroup.add(hairMesh);

    // ── ANATOMICAL ARMS (Deltoid -> Bicep/Tricep -> Elbow -> Forearm -> Hand) ──
    const makeOrganicArm = (isLeft) => {
      const shoulderJoint = new THREE.Group();
      shoulderJoint.position.set(isLeft ? -0.25 : 0.25, 0.32, 0);
      torsoGroup.add(shoulderJoint);

      // Rounded Deltoid Cap
      const deltoid = new THREE.Mesh(new THREE.SphereGeometry(0.082, 16, 16), matShirt);
      deltoid.scale.set(1.0, 1.2, 0.9);
      shoulderJoint.add(deltoid);

      // Bicep / Tricep Upper Arm (Smooth Capsule)
      const bicepMesh = new THREE.Mesh(new THREE.CapsuleGeometry(0.055, 0.16, 16, 20), matSkin);
      bicepMesh.position.y = -0.11;
      bicepMesh.castShadow = true;
      shoulderJoint.add(bicepMesh);

      // Elbow Joint
      const elbowJoint = new THREE.Group();
      elbowJoint.position.y = -0.22;
      shoulderJoint.add(elbowJoint);

      // Forearm (Tapered from elbow to wrist)
      const forearmMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.048, 0.038, 0.20, 16), matSkin);
      forearmMesh.position.y = -0.10;
      forearmMesh.castShadow = true;
      elbowJoint.add(forearmMesh);

      // Wrist & Hand with palm contour
      const handMesh = new THREE.Mesh(new THREE.CapsuleGeometry(0.038, 0.06, 12, 16), matSkin);
      handMesh.position.y = -0.22;
      handMesh.scale.set(1.1, 1.0, 0.6);
      handMesh.castShadow = true;
      elbowJoint.add(handMesh);

      return { shoulderJoint, elbowJoint };
    };

    const leftArm = makeOrganicArm(true);
    const rightArm = makeOrganicArm(false);

    // ── ANATOMICAL LEGS (Glute/Hip -> Quad -> Knee -> Calf -> Sneakers) ──
    const makeOrganicLeg = (isLeft) => {
      const hipJoint = new THREE.Group();
      hipJoint.position.set(isLeft ? -0.11 : 0.11, -0.06, 0);
      pelvis.add(hipJoint);

      // Thigh / Quadriceps (Tapered athletic capsule)
      const thighMesh = new THREE.Mesh(new THREE.CapsuleGeometry(0.075, 0.22, 16, 20), isHumanoid ? matSkin : matShorts);
      thighMesh.position.y = -0.14;
      thighMesh.castShadow = true;
      hipJoint.add(thighMesh);

      // Shorts Leg Cuff
      if (isHumanoid) {
        const cuffMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.082, 0.08, 0.12, 20), matShorts);
        cuffMesh.position.y = -0.06;
        hipJoint.add(cuffMesh);
      }

      // Knee Joint
      const kneeJoint = new THREE.Group();
      kneeJoint.position.y = -0.27;
      hipJoint.add(kneeJoint);

      // Calf / Gastrocnemius (Muscular tear-drop shape)
      const calfMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.064, 0.042, 0.26, 16), matSkin);
      calfMesh.position.y = -0.13;
      calfMesh.castShadow = true;
      kneeJoint.add(calfMesh);

      // Athletic Sneaker
      const shoeGroup = new THREE.Group();
      shoeGroup.position.set(0, -0.28, 0.04);
      kneeJoint.add(shoeGroup);

      const sole = new THREE.Mesh(new THREE.BoxGeometry(0.10, 0.04, 0.22), matShoes);
      const upper = new THREE.Mesh(new THREE.CapsuleGeometry(0.048, 0.12, 12, 16), matShorts);
      upper.position.set(0, 0.03, 0.01);
      upper.rotation.x = Math.PI / 2;
      shoeGroup.add(sole, upper);

      return { hipJoint, kneeJoint };
    };

    const leftLeg = makeOrganicLeg(true);
    const rightLeg = makeOrganicLeg(false);

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

    // ── 6. INTERACTIVE ORBIT ──────────────────────────────────────────
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
      // Natural 2-phase tempo: controlled descent -> 0.1s stretch reflex -> explosive concentric ascent
      const s = 0.5 - 0.5 * Math.cos(Math.PI * x);
      return Math.pow(s, 1.15); // subtle non-linear muscle contraction curve
    };

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
      const k = humanCadence(rawCycle);

      if (exercise === 'pushup') {
        // ── LIFELIKE PUSH-UP (Scapular Retraction, 45° Elbow Arrow, Neutral Cervical Spine) ──
        rootModel.position.set(0, -0.22 + (1 - k) * 0.28, 0);
        rootModel.rotation.x = THREE.MathUtils.degToRad(78);

        // Core Bracing & Inhale Chest Expansion at bottom
        chestGroup.scale.set(1 + (1 - k) * 0.06, 1, 1 + (1 - k) * 0.06);
        torsoGroup.rotation.x = 0;
        pelvis.rotation.x = 0;
        neckGroup.rotation.x = THREE.MathUtils.degToRad(-14);

        // Arms: Authentic 45° Arrow Tracking with 90° elbow flexion
        leftArm.shoulderJoint.rotation.x = THREE.MathUtils.degToRad(-25 + k * 54);
        rightArm.shoulderJoint.rotation.x = THREE.MathUtils.degToRad(-25 + k * 54);
        leftArm.shoulderJoint.rotation.z = THREE.MathUtils.degToRad(24 + k * 26);
        rightArm.shoulderJoint.rotation.z = THREE.MathUtils.degToRad(-24 - k * 26);
        leftArm.elbowJoint.rotation.x = THREE.MathUtils.degToRad(k * 88);
        rightArm.elbowJoint.rotation.x = THREE.MathUtils.degToRad(k * 88);

        // Lower body rigid kinetic chain
        leftLeg.hipJoint.rotation.x = 0;
        rightLeg.hipJoint.rotation.x = 0;
        leftLeg.kneeJoint.rotation.x = 0;
        rightLeg.kneeJoint.rotation.x = 0;
      } else if (exercise === 'squat') {
        // ── LIFELIKE AIR SQUAT (Hip Hinge, 26° Torso Lean, Femur Parallel Depth, Heel Drive) ──
        rootModel.position.set(0, 0.08, 0);
        rootModel.rotation.x = 0;

        const squatDepth = k * 0.38;
        pelvis.position.y = -squatDepth;

        // Hip Hinge counterbalancing knee travel
        torsoGroup.rotation.x = THREE.MathUtils.degToRad(k * 26);
        neckGroup.rotation.x = THREE.MathUtils.degToRad(-k * 20);

        // Hip & Knee synchronized flexion
        leftLeg.hipJoint.rotation.x = THREE.MathUtils.degToRad(-k * 90);
        rightLeg.hipJoint.rotation.x = THREE.MathUtils.degToRad(-k * 90);
        leftLeg.kneeJoint.rotation.x = THREE.MathUtils.degToRad(k * 102);
        rightLeg.kneeJoint.rotation.x = THREE.MathUtils.degToRad(k * 102);

        // Arms reach forward for balance
        leftArm.shoulderJoint.rotation.x = THREE.MathUtils.degToRad(k * 85);
        rightArm.shoulderJoint.rotation.x = THREE.MathUtils.degToRad(k * 85);
        leftArm.shoulderJoint.rotation.z = 0;
        rightArm.shoulderJoint.rotation.z = 0;
        leftArm.elbowJoint.rotation.x = 0;
        rightArm.elbowJoint.rotation.x = 0;
      } else if (exercise === 'situp') {
        // ── LIFELIKE SIT-UP (Segmental Spinal Curling from Supine to 70° Upright) ──
        rootModel.position.set(0, -0.32, 0);
        rootModel.rotation.x = THREE.MathUtils.degToRad(-82);

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
        // ── LIFELIKE ISOMETRIC PLANK HOLD (Diaphragmatic Breathing & Core Brace) ──
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
