import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Camera, Compass, Eye, Check } from 'lucide-react';

// Recommended biomechanical reference angles for each exercise
const EXERCISE_OPTIMAL_ANGLES = {
  pushup: 'side',       // Best to see spinal plank, hip sag, and 90° elbow depth
  squat: 'isometric',   // Best to see hip depth, knee tracking, and chest uprightness
  situp: 'side',        // Best to see spinal curling and crunch height
  plank: 'side',        // Best to check head-to-heel straight line
};

const CAMERA_PRESETS = [
  { id: 'auto', label: 'Smart Angle', desc: 'Auto-picked for exercise' },
  { id: 'side', label: 'Side (90°)', desc: 'Spine & Depth' },
  { id: 'iso', label: '3D Quarter (45°)', desc: 'Full Depth' },
  { id: 'front', label: 'Front (0°)', desc: 'Elbow/Knee Flare' },
  { id: 'top', label: 'Overhead (3/4)', desc: 'Hand Placement' },
];

export default function ThreeCharacterStudio({ 
  character = 'lego', 
  exercise = 'pushup', 
  isPlaying = true 
}) {
  const containerRef = useRef(null);
  const [selectedAngle, setSelectedAngle] = useState('auto');
  const targetCamPosRef = useRef(new THREE.Vector3(0, 1.1, 3.2));
  const targetLookAtRef = useRef(new THREE.Vector3(0, 0.15, 0));

  // Determine effective angle
  const effectiveAngle = selectedAngle === 'auto' 
    ? (EXERCISE_OPTIMAL_ANGLES[exercise] || 'side')
    : selectedAngle;

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // ── 1. SCENE SETUP & CINEMATIC CAMERA ─────────────────────────────
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

    // ── 2. STUDIO LIGHTING (PIXAR / LEGO MOVIE LIGHT RIG) ─────────────
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

    // Studio Circular Floor Shadow
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

    // ── 3. LEGO MOVIE HIGH-GLOSS PLASTIC MATERIALS ────────────────────
    const createLegoPlastic = (colorHex, roughness = 0.18) => {
      return new THREE.MeshPhysicalMaterial({
        color: colorHex,
        roughness: roughness,
        metalness: 0.05,
        clearcoat: 0.85,
        clearcoatRoughness: 0.12,
        reflectivity: 0.9,
      });
    };

    const isWoody = character === 'woody';
    const isVader = character === 'vader';

    const matYellowSkin = createLegoPlastic(isWoody ? 0xfcd34d : 0xfbbf24, 0.22);
    const matTorso = createLegoPlastic(isWoody ? 0xf59e0b : isVader ? 0x18181b : 0xdc2626);
    const matPants = createLegoPlastic(isWoody ? 0x1d4ed8 : isVader ? 0x090a0f : 0x2563eb);
    const matBelt = createLegoPlastic(0x18181b, 0.3);

    // ── 4. BUILD HIERARCHICAL SKELETON MODEL ──────────────────────────
    const rootModel = new THREE.Group();
    scene.add(rootModel);

    // PELVIS / HIPS
    const pelvis = new THREE.Group();
    pelvis.position.y = 0.0;
    rootModel.add(pelvis);

    const hipBarGeo = new THREE.CylinderGeometry(0.12, 0.12, 0.36, 24);
    const hipBar = new THREE.Mesh(hipBarGeo, matBelt);
    hipBar.rotation.z = Math.PI / 2;
    hipBar.castShadow = true;
    pelvis.add(hipBar);

    // TORSO
    const torsoGroup = new THREE.Group();
    torsoGroup.position.y = 0.08;
    pelvis.add(torsoGroup);

    const torsoGeo = new THREE.CylinderGeometry(0.24, 0.30, 0.44, 4, 1, false, Math.PI / 4);
    const torsoMesh = new THREE.Mesh(torsoGeo, matTorso);
    torsoMesh.position.y = 0.22;
    torsoMesh.castShadow = true;
    torsoGroup.add(torsoMesh);

    // NECK & HEAD
    const neckGroup = new THREE.Group();
    neckGroup.position.y = 0.46;
    torsoGroup.add(neckGroup);

    const headGeo = new THREE.CylinderGeometry(0.17, 0.17, 0.28, 32);
    const headMesh = new THREE.Mesh(headGeo, matYellowSkin);
    headMesh.position.y = 0.14;
    headMesh.castShadow = true;
    neckGroup.add(headMesh);

    // Stud
    const studGeo = new THREE.CylinderGeometry(0.075, 0.075, 0.07, 24);
    const studMesh = new THREE.Mesh(studGeo, matYellowSkin);
    studMesh.position.y = 0.31;
    studMesh.castShadow = true;
    neckGroup.add(studMesh);

    // Eyes
    const eyeGeo = new THREE.SphereGeometry(0.022, 16, 16);
    const eyeMat = new THREE.MeshBasicMaterial({ color: 0x111827 });
    const leftEye = new THREE.Mesh(eyeGeo, eyeMat);
    leftEye.position.set(-0.055, 0.16, 0.165);
    neckGroup.add(leftEye);

    const rightEye = new THREE.Mesh(eyeGeo, eyeMat);
    rightEye.position.set(0.055, 0.16, 0.165);
    neckGroup.add(rightEye);

    // Hat / Headband
    if (isWoody) {
      const hatBrimGeo = new THREE.CylinderGeometry(0.38, 0.38, 0.03, 32);
      const hatCrownGeo = new THREE.CylinderGeometry(0.18, 0.20, 0.18, 24);
      const matHat = createLegoPlastic(0x78350f, 0.4);
      const hatGroup = new THREE.Group();
      hatGroup.position.y = 0.32;
      const brim = new THREE.Mesh(hatBrimGeo, matHat);
      const crown = new THREE.Mesh(hatCrownGeo, matHat);
      crown.position.y = 0.09;
      hatGroup.add(brim, crown);
      neckGroup.add(hatGroup);
    } else if (!isVader) {
      const bandGeo = new THREE.TorusGeometry(0.175, 0.02, 16, 32);
      const matBand = createLegoPlastic(0xef4444, 0.3);
      const band = new THREE.Mesh(bandGeo, matBand);
      band.position.y = 0.21;
      band.rotation.x = Math.PI / 2;
      neckGroup.add(band);
    }

    // ── ARMS ──
    const makeLegoArm = (isLeft) => {
      const shoulderJoint = new THREE.Group();
      shoulderJoint.position.set(isLeft ? -0.28 : 0.28, 0.38, 0);
      torsoGroup.add(shoulderJoint);

      const upperArmGeo = new THREE.CylinderGeometry(0.065, 0.065, 0.22, 16);
      const upperArm = new THREE.Mesh(upperArmGeo, matTorso);
      upperArm.position.y = -0.11;
      upperArm.castShadow = true;
      shoulderJoint.add(upperArm);

      const elbowJoint = new THREE.Group();
      elbowJoint.position.y = -0.22;
      shoulderJoint.add(elbowJoint);

      const forearmGeo = new THREE.CylinderGeometry(0.06, 0.06, 0.18, 16);
      const forearm = new THREE.Mesh(forearmGeo, matYellowSkin);
      forearm.position.y = -0.09;
      forearm.castShadow = true;
      elbowJoint.add(forearm);

      const handGeo = new THREE.TorusGeometry(0.055, 0.022, 12, 24, Math.PI * 1.55);
      const hand = new THREE.Mesh(handGeo, matYellowSkin);
      hand.position.y = -0.21;
      hand.rotation.z = Math.PI / 2;
      hand.castShadow = true;
      elbowJoint.add(hand);

      return { shoulderJoint, elbowJoint };
    };

    const leftArm = makeLegoArm(true);
    const rightArm = makeLegoArm(false);

    // ── LEGS ──
    const makeLegoLeg = (isLeft) => {
      const hipJoint = new THREE.Group();
      hipJoint.position.set(isLeft ? -0.12 : 0.12, -0.08, 0);
      pelvis.add(hipJoint);

      const thighGeo = new THREE.BoxGeometry(0.17, 0.24, 0.22);
      const thigh = new THREE.Mesh(thighGeo, matPants);
      thigh.position.y = -0.12;
      thigh.castShadow = true;
      hipJoint.add(thigh);

      const kneeJoint = new THREE.Group();
      kneeJoint.position.y = -0.24;
      hipJoint.add(kneeJoint);

      const calfGeo = new THREE.BoxGeometry(0.17, 0.24, 0.22);
      const calf = new THREE.Mesh(calfGeo, matPants);
      calf.position.y = -0.12;
      calf.castShadow = true;
      kneeJoint.add(calf);

      const toeGeo = new THREE.BoxGeometry(0.17, 0.10, 0.08);
      const toe = new THREE.Mesh(toeGeo, isWoody ? createLegoPlastic(0x78350f) : matPants);
      toe.position.set(0, -0.19, 0.15);
      toe.castShadow = true;
      kneeJoint.add(toe);

      return { hipJoint, kneeJoint };
    };

    const leftLeg = makeLegoLeg(true);
    const rightLeg = makeLegoLeg(false);

    // ── 5. CAMERA PRESETS POSITION CONFIGURATIONS ──────────────────────
    const updateCameraTarget = () => {
      switch (effectiveAngle) {
        case 'side':
          // Side Profile (90 degrees) — optimal for spine, hip sag, & elbow depth
          targetCamPosRef.current.set(3.3, 0.8, 0.3);
          targetLookAtRef.current.set(0, 0.0, 0);
          break;
        case 'front':
          // Straight Front (0 degrees) — optimal for symmetry & elbow flare
          targetCamPosRef.current.set(0, 0.9, 3.3);
          targetLookAtRef.current.set(0, 0.1, 0);
          break;
        case 'top':
          // 3/4 Overhead — optimal for hand width & scapula
          targetCamPosRef.current.set(1.8, 2.8, 2.0);
          targetLookAtRef.current.set(0, 0.0, 0);
          break;
        case 'iso':
        case 'isometric':
        default:
          // 45-degree Isometric Quarter View
          targetCamPosRef.current.set(2.4, 1.2, 2.4);
          targetLookAtRef.current.set(0, 0.1, 0);
          break;
      }
    };

    updateCameraTarget();

    // ── 6. INTERACTIVE ORBIT CONTROLS ─────────────────────────────────
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

    const smoothEase = (x) => 0.5 - 0.5 * Math.cos(Math.PI * x);

    // ── 7. RENDER & BIOMECHANICAL ANIMATION LOOP ───────────────────────
    const animate = () => {
      reqId = requestAnimationFrame(animate);

      if (isPlaying) {
        time += 0.038;
      }

      // Smooth Camera Glide (LERP)
      camera.position.lerp(targetCamPosRef.current, 0.07);
      camera.lookAt(targetLookAtRef.current);

      // Manual Drag Rotation
      rootModel.rotation.y = manualRotY;

      const rawCycle = (Math.sin(time) + 1) / 2;
      const k = smoothEase(rawCycle);

      if (exercise === 'pushup') {
        rootModel.position.set(0, -0.22 + (1 - k) * 0.26, 0);
        rootModel.rotation.x = THREE.MathUtils.degToRad(78);

        torsoGroup.rotation.x = 0;
        pelvis.rotation.x = 0;
        neckGroup.rotation.x = THREE.MathUtils.degToRad(-14);

        leftArm.shoulderJoint.rotation.x = THREE.MathUtils.degToRad(-25 + k * 52);
        rightArm.shoulderJoint.rotation.x = THREE.MathUtils.degToRad(-25 + k * 52);
        leftArm.shoulderJoint.rotation.z = THREE.MathUtils.degToRad(20 + k * 25);
        rightArm.shoulderJoint.rotation.z = THREE.MathUtils.degToRad(-20 - k * 25);
        leftArm.elbowJoint.rotation.x = THREE.MathUtils.degToRad(k * 80);
        rightArm.elbowJoint.rotation.x = THREE.MathUtils.degToRad(k * 80);

        leftLeg.hipJoint.rotation.x = 0;
        rightLeg.hipJoint.rotation.x = 0;
        leftLeg.kneeJoint.rotation.x = 0;
        rightLeg.kneeJoint.rotation.x = 0;
      } else if (exercise === 'squat') {
        rootModel.position.set(0, 0.08, 0);
        rootModel.rotation.x = 0;

        const squatDepth = k * 0.36;
        pelvis.position.y = -squatDepth;

        torsoGroup.rotation.x = THREE.MathUtils.degToRad(k * 26);
        neckGroup.rotation.x = THREE.MathUtils.degToRad(-k * 20);

        leftLeg.hipJoint.rotation.x = THREE.MathUtils.degToRad(-k * 85);
        rightLeg.hipJoint.rotation.x = THREE.MathUtils.degToRad(-k * 85);
        leftLeg.kneeJoint.rotation.x = THREE.MathUtils.degToRad(k * 95);
        rightLeg.kneeJoint.rotation.x = THREE.MathUtils.degToRad(k * 95);

        leftArm.shoulderJoint.rotation.x = THREE.MathUtils.degToRad(k * 85);
        rightArm.shoulderJoint.rotation.x = THREE.MathUtils.degToRad(k * 85);
        leftArm.shoulderJoint.rotation.z = 0;
        rightArm.shoulderJoint.rotation.z = 0;
        leftArm.elbowJoint.rotation.x = 0;
        rightArm.elbowJoint.rotation.x = 0;
      } else if (exercise === 'situp') {
        rootModel.position.set(0, -0.32, 0);
        rootModel.rotation.x = THREE.MathUtils.degToRad(-82);

        torsoGroup.rotation.x = THREE.MathUtils.degToRad(k * 68);
        neckGroup.rotation.x = THREE.MathUtils.degToRad(k * 22);

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

  return (
    <div className="space-y-2 w-full">
      {/* ── 3D Canvas Viewport ── */}
      <div 
        ref={containerRef} 
        className="relative w-full h-[270px] cursor-grab active:cursor-grabbing flex items-center justify-center bg-gradient-to-b from-slate-50/80 via-slate-100/60 to-slate-200/40 dark:from-zinc-900/90 dark:via-zinc-950 dark:to-black rounded-3xl border border-slate-200/80 dark:border-zinc-800/80 overflow-hidden shadow-inner"
      >
        {/* Active Angle Badge */}
        <div className="absolute top-2.5 right-3 pointer-events-none text-[9px] font-mono tracking-widest text-slate-500 dark:text-zinc-400 uppercase bg-white/80 dark:bg-zinc-800/80 backdrop-blur-sm px-2.5 py-0.5 rounded-full border border-slate-200/60 dark:border-zinc-700/60 flex items-center gap-1.5 shadow-sm">
          <Eye className="w-2.5 h-2.5 text-orange-500" />
          <span>VIEW: {effectiveAngle.toUpperCase()}</span>
        </div>
      </div>

      {/* ── Reference Angle / Camera Angle Selector Strip ── */}
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
    </div>
  );
}
