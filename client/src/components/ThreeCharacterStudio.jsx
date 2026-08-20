import { useEffect, useRef } from 'react';
import * as THREE from 'three';

export default function ThreeCharacterStudio({ 
  character = 'lego', 
  exercise = 'pushup', 
  isPlaying = true 
}) {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // ── 1. SCENE SETUP & CINEMATIC CAMERA ─────────────────────────────
    const scene = new THREE.Scene();
    const width = container.clientWidth || 380;
    const height = container.clientHeight || 280;

    const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 100);
    camera.position.set(0, 1.1, 3.2);
    camera.lookAt(0, 0.15, 0);

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
    // Warm Key Light
    const keyLight = new THREE.DirectionalLight(0xfff5ea, 2.2);
    keyLight.position.set(3.5, 5.0, 4.0);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 2048;
    keyLight.shadow.mapSize.height = 2048;
    keyLight.shadow.bias = -0.0005;
    keyLight.shadow.radius = 3;
    scene.add(keyLight);

    // Cool Rim Light (gives crisp plastic silhouette highlights)
    const rimLight = new THREE.DirectionalLight(0x38bdf8, 1.4);
    rimLight.position.set(-3.5, 3.0, -3.0);
    scene.add(rimLight);

    // Soft Ambient Fill
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.85);
    scene.add(ambientLight);

    // Studio Circular Mirror / Shadow Floor
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
    const matCape = new THREE.MeshStandardMaterial({ color: 0x090a0f, roughness: 0.9, side: THREE.DoubleSide });

    // ── 4. BUILD ARTICULATED HIERARCHICAL SKELETON ─────────────────────
    const rootModel = new THREE.Group();
    scene.add(rootModel);

    // PELVIS / HIPS (Center Pivot)
    const pelvis = new THREE.Group();
    pelvis.position.y = 0.0;
    rootModel.add(pelvis);

    const hipBarGeo = new THREE.CylinderGeometry(0.12, 0.12, 0.36, 24);
    const hipBar = new THREE.Mesh(hipBarGeo, matBelt);
    hipBar.rotation.z = Math.PI / 2;
    hipBar.castShadow = true;
    pelvis.add(hipBar);

    // TORSO (Trapezoidal Lego Minifig Mold)
    const torsoGroup = new THREE.Group();
    torsoGroup.position.y = 0.08;
    pelvis.add(torsoGroup);

    const torsoGeo = new THREE.CylinderGeometry(0.24, 0.30, 0.44, 4, 1, false, Math.PI / 4);
    const torsoMesh = new THREE.Mesh(torsoGeo, matTorso);
    torsoMesh.position.y = 0.22;
    torsoMesh.castShadow = true;
    torsoGroup.add(torsoMesh);

    // NECK & HEAD GROUP
    const neckGroup = new THREE.Group();
    neckGroup.position.y = 0.46;
    torsoGroup.add(neckGroup);

    // Classic Cylindrical Lego Head with Beveled Chin
    const headGeo = new THREE.CylinderGeometry(0.17, 0.17, 0.28, 32);
    const headMesh = new THREE.Mesh(headGeo, matYellowSkin);
    headMesh.position.y = 0.14;
    headMesh.castShadow = true;
    neckGroup.add(headMesh);

    // Lego Top Stud
    const studGeo = new THREE.CylinderGeometry(0.075, 0.075, 0.07, 24);
    const studMesh = new THREE.Mesh(studGeo, matYellowSkin);
    studMesh.position.y = 0.31;
    studMesh.castShadow = true;
    neckGroup.add(studMesh);

    // Painted Face Features (Texture or 3D Decal Eyes & Smile)
    const eyeGeo = new THREE.SphereGeometry(0.022, 16, 16);
    const eyeMat = new THREE.MeshBasicMaterial({ color: 0x111827 });
    const leftEye = new THREE.Mesh(eyeGeo, eyeMat);
    leftEye.position.set(-0.055, 0.16, 0.165);
    neckGroup.add(leftEye);

    const rightEye = new THREE.Mesh(eyeGeo, eyeMat);
    rightEye.position.set(0.055, 0.16, 0.165);
    neckGroup.add(rightEye);

    // Headband / Hat Detail
    if (isWoody) {
      // Toy Story Cowboy Hat
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
      // Red Gym Headband
      const bandGeo = new THREE.TorusGeometry(0.175, 0.02, 16, 32);
      const matBand = createLegoPlastic(0xef4444, 0.3);
      const band = new THREE.Mesh(bandGeo, matBand);
      band.position.y = 0.21;
      band.rotation.x = Math.PI / 2;
      neckGroup.add(band);
    }

    // ── ARMS (2-Segment Articulation: Upper Arm + Forearm + C-Claw) ──
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

      // C-Claw Hand
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

    // ── LEGS (2-Segment Articulation: Hip Pivot + Knee Joint) ──
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

      // Shoe / Boot toe
      const toeGeo = new THREE.BoxGeometry(0.17, 0.10, 0.08);
      const toe = new THREE.Mesh(toeGeo, isWoody ? createLegoPlastic(0x78350f) : matPants);
      toe.position.set(0, -0.19, 0.15);
      toe.castShadow = true;
      kneeJoint.add(toe);

      return { hipJoint, kneeJoint };
    };

    const leftLeg = makeLegoLeg(true);
    const rightLeg = makeLegoLeg(false);

    // ── 5. SEVEN.APP SMOOTH BIOMECHANICAL MOTION LOOPS ────────────────
    let time = 0;
    let reqId = null;

    // Interactive Drag Rotation
    let isDragging = false;
    let prevMouseX = 0;

    const onMouseDown = (e) => {
      isDragging = true;
      prevMouseX = e.clientX;
    };
    const onMouseMove = (e) => {
      if (isDragging) {
        const deltaX = e.clientX - prevMouseX;
        rootModel.rotation.y += deltaX * 0.015;
        prevMouseX = e.clientX;
      }
    };
    const onMouseUp = () => { isDragging = false; };

    container.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);

    // Human-grade EaseInOut Sine Curve
    const smoothEase = (x) => 0.5 - 0.5 * Math.cos(Math.PI * x);

    const animate = () => {
      reqId = requestAnimationFrame(animate);

      if (isPlaying) {
        time += 0.038;
      }

      // Smooth ping-pong cycle 0.0 (top) -> 1.0 (depth)
      const rawCycle = (Math.sin(time) + 1) / 2;
      const k = smoothEase(rawCycle);

      if (exercise === 'pushup') {
        // ── PUSH-UP BIOMECHANICS ──
        // Body positioned horizontally in strict plank
        rootModel.position.set(0, -0.22 + (1 - k) * 0.26, 0);
        rootModel.rotation.x = THREE.MathUtils.degToRad(78);
        if (!isDragging) rootModel.rotation.y = THREE.MathUtils.degToRad(-38);

        // Core & Spine stay 100% rigid
        torsoGroup.rotation.x = 0;
        pelvis.rotation.x = 0;
        neckGroup.rotation.x = THREE.MathUtils.degToRad(-14); // Head packed neutral

        // Arms: Elbows track back in 45° arrow, flexing from 180° to 90° at depth
        leftArm.shoulderJoint.rotation.x = THREE.MathUtils.degToRad(-25 + k * 52);
        rightArm.shoulderJoint.rotation.x = THREE.MathUtils.degToRad(-25 + k * 52);
        leftArm.shoulderJoint.rotation.z = THREE.MathUtils.degToRad(20 + k * 25);
        rightArm.shoulderJoint.rotation.z = THREE.MathUtils.degToRad(-20 - k * 25);
        leftArm.elbowJoint.rotation.x = THREE.MathUtils.degToRad(k * 80);
        rightArm.elbowJoint.rotation.x = THREE.MathUtils.degToRad(k * 80);

        // Legs locked straight
        leftLeg.hipJoint.rotation.x = 0;
        rightLeg.hipJoint.rotation.x = 0;
        leftLeg.kneeJoint.rotation.x = 0;
        rightLeg.kneeJoint.rotation.x = 0;
      } else if (exercise === 'squat') {
        // ── SQUAT BIOMECHANICS ──
        rootModel.position.set(0, 0.08, 0);
        rootModel.rotation.x = 0;
        if (!isDragging) rootModel.rotation.y = THREE.MathUtils.degToRad(-28);

        // Pelvis lowers smoothly
        const squatDepth = k * 0.36;
        pelvis.position.y = -squatDepth;

        // Hip Hinge (Torso leans forward 25° while chest stays proud)
        torsoGroup.rotation.x = THREE.MathUtils.degToRad(k * 26);
        neckGroup.rotation.x = THREE.MathUtils.degToRad(-k * 20);

        // Femurs reach full 90° parallel, knees flex naturally
        leftLeg.hipJoint.rotation.x = THREE.MathUtils.degToRad(-k * 85);
        rightLeg.hipJoint.rotation.x = THREE.MathUtils.degToRad(-k * 85);
        leftLeg.kneeJoint.rotation.x = THREE.MathUtils.degToRad(k * 95);
        rightLeg.kneeJoint.rotation.x = THREE.MathUtils.degToRad(k * 95);

        // Arms counterbalance forward
        leftArm.shoulderJoint.rotation.x = THREE.MathUtils.degToRad(k * 85);
        rightArm.shoulderJoint.rotation.x = THREE.MathUtils.degToRad(k * 85);
        leftArm.shoulderJoint.rotation.z = 0;
        rightArm.shoulderJoint.rotation.z = 0;
        leftArm.elbowJoint.rotation.x = 0;
        rightArm.elbowJoint.rotation.x = 0;
      } else if (exercise === 'situp') {
        // ── SIT-UP BIOMECHANICS ──
        rootModel.position.set(0, -0.32, 0);
        rootModel.rotation.x = THREE.MathUtils.degToRad(-82);
        if (!isDragging) rootModel.rotation.y = THREE.MathUtils.degToRad(-32);

        // Torso curls from flat supine to 70° upright crunch
        torsoGroup.rotation.x = THREE.MathUtils.degToRad(k * 68);
        neckGroup.rotation.x = THREE.MathUtils.degToRad(k * 22);

        // Hands behind head
        leftArm.shoulderJoint.rotation.x = THREE.MathUtils.degToRad(120);
        rightArm.shoulderJoint.rotation.x = THREE.MathUtils.degToRad(120);
        leftArm.shoulderJoint.rotation.z = THREE.MathUtils.degToRad(35);
        rightArm.shoulderJoint.rotation.z = THREE.MathUtils.degToRad(-35);
        leftArm.elbowJoint.rotation.x = THREE.MathUtils.degToRad(55);
        rightArm.elbowJoint.rotation.x = THREE.MathUtils.degToRad(55);

        // Knees bent at 60°
        leftLeg.hipJoint.rotation.x = THREE.MathUtils.degToRad(50);
        rightLeg.hipJoint.rotation.x = THREE.MathUtils.degToRad(50);
        leftLeg.kneeJoint.rotation.x = THREE.MathUtils.degToRad(-60);
        rightLeg.kneeJoint.rotation.x = THREE.MathUtils.degToRad(-60);
      } else {
        // ── PLANK HOLD (Isometric Stability) ──
        rootModel.position.set(0, 0.04, 0);
        rootModel.rotation.x = THREE.MathUtils.degToRad(78);
        if (!isDragging) rootModel.rotation.y = THREE.MathUtils.degToRad(-38);

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
  }, [character, exercise, isPlaying]);

  return (
    <div 
      ref={containerRef} 
      className="relative w-full h-[270px] cursor-grab active:cursor-grabbing flex items-center justify-center bg-gradient-to-b from-slate-50/80 via-slate-100/60 to-slate-200/40 dark:from-zinc-900/90 dark:via-zinc-950 dark:to-black rounded-3xl border border-slate-200/80 dark:border-zinc-800/80 overflow-hidden shadow-inner"
    >
      <div className="absolute top-2.5 right-3 pointer-events-none text-[9px] font-mono tracking-widest text-slate-400 dark:text-zinc-500 uppercase bg-white/60 dark:bg-zinc-800/60 backdrop-blur-sm px-2 py-0.5 rounded-full border border-slate-200/40 dark:border-zinc-700/40">
        3D KINEMATICS • DRAG TO ORBIT
      </div>
    </div>
  );
}
