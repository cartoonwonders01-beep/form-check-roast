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

    // ── 1. THREE.JS SCENE, CAMERA, RENDERER ──────────────────────────────
    const scene = new THREE.Scene();
    const width = container.clientWidth || 360;
    const height = container.clientHeight || 260;

    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.set(0, 1.2, 3.4);
    camera.lookAt(0, 0.2, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // ── 2. STUDIO LIGHTING ───────────────────────────────────────────────
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.85);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xffffff, 1.2);
    keyLight.position.set(3, 5, 4);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    keyLight.shadow.bias = -0.001;
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0x38bdf8, 0.4);
    fillLight.position.set(-3, 2, -2);
    scene.add(fillLight);

    // Studio Contact Shadow Floor
    const shadowGeo = new THREE.PlaneGeometry(3, 3);
    const shadowMat = new THREE.ShadowMaterial({ opacity: 0.15 });
    const shadowPlane = new THREE.Mesh(shadowGeo, shadowMat);
    shadowPlane.rotation.x = -Math.PI / 2;
    shadowPlane.position.y = -0.5;
    shadowPlane.receiveShadow = true;
    scene.add(shadowPlane);

    // ── 3. BUILD HIERARCHICAL 3D SKELETON MODEL ─────────────────────────
    const rootGroup = new THREE.Group();
    scene.add(rootGroup);

    // Color Palette based on Character Universe
    const colors = {
      lego: {
        skin: 0xfacc15, // Lego yellow
        torso: 0xef4444, // Red torso
        legs: 0x2563eb, // Blue pants
        hands: 0xfacc15,
        detail: 0x991b1b
      },
      vader: {
        skin: 0x111318, // Black armor
        torso: 0x18181b,
        legs: 0x090a0f,
        hands: 0x18181b,
        detail: 0xef4444
      },
      duck: {
        skin: 0xfacc15, // Yellow duck
        torso: 0xfde047,
        legs: 0xf97316, // Orange feet
        hands: 0xf97316,
        detail: 0xef4444 // Red sweatband
      }
    }[character] || {
      skin: 0xfacc15,
      torso: 0xef4444,
      legs: 0x2563eb,
      hands: 0xfacc15,
      detail: 0x991b1b
    };

    // Materials
    const matSkin = new THREE.MeshStandardMaterial({ color: colors.skin, roughness: 0.3, metalness: 0.1 });
    const matTorso = new THREE.MeshStandardMaterial({ color: colors.torso, roughness: 0.35, metalness: 0.1 });
    const matLegs = new THREE.MeshStandardMaterial({ color: colors.legs, roughness: 0.4, metalness: 0.05 });
    const matHands = new THREE.MeshStandardMaterial({ color: colors.hands, roughness: 0.3 });
    const matDetail = new THREE.MeshStandardMaterial({ color: colors.detail, roughness: 0.3 });

    // PELVIS / ROOT HIPS
    const pelvis = new THREE.Group();
    rootGroup.add(pelvis);

    // TORSO
    const torsoGeo = new THREE.BoxGeometry(0.52, 0.55, 0.32);
    const torsoMesh = new THREE.Mesh(torsoGeo, matTorso);
    torsoMesh.position.y = 0.28;
    torsoMesh.castShadow = true;
    pelvis.add(torsoMesh);

    // NECK & HEAD
    const neck = new THREE.Group();
    neck.position.y = 0.58;
    pelvis.add(neck);

    const headGeo = new THREE.CylinderGeometry(0.2, 0.2, 0.36, 24);
    const headMesh = new THREE.Mesh(headGeo, matSkin);
    headMesh.position.y = 0.18;
    headMesh.castShadow = true;
    neck.add(headMesh);

    // Stud on top of Lego Head
    if (character === 'lego') {
      const studGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.08, 16);
      const studMesh = new THREE.Mesh(studGeo, matSkin);
      studMesh.position.y = 0.4;
      studMesh.castShadow = true;
      neck.add(studMesh);
    }

    // Helmet / Cape for Vader
    if (character === 'vader') {
      const helmGeo = new THREE.SphereGeometry(0.24, 20, 20);
      const helmMesh = new THREE.Mesh(helmGeo, matSkin);
      helmMesh.position.y = 0.22;
      neck.add(helmMesh);
    }

    // SHOULDER & ARMS (Left & Right)
    const leftShoulder = new THREE.Group();
    leftShoulder.position.set(-0.35, 0.5, 0);
    pelvis.add(leftShoulder);

    const armGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.4, 16);
    const leftArmMesh = new THREE.Mesh(armGeo, matTorso);
    leftArmMesh.position.y = -0.2;
    leftArmMesh.castShadow = true;
    leftShoulder.add(leftArmMesh);

    const leftHand = new THREE.Mesh(new THREE.TorusGeometry(0.07, 0.03, 8, 16, Math.PI * 1.5), matHands);
    leftHand.position.y = -0.45;
    leftHand.rotation.z = Math.PI / 2;
    leftShoulder.add(leftHand);

    const rightShoulder = new THREE.Group();
    rightShoulder.position.set(0.35, 0.5, 0);
    pelvis.add(rightShoulder);

    const rightArmMesh = new THREE.Mesh(armGeo, matTorso);
    rightArmMesh.position.y = -0.2;
    rightArmMesh.castShadow = true;
    rightShoulder.add(rightArmMesh);

    const rightHand = new THREE.Mesh(new THREE.TorusGeometry(0.07, 0.03, 8, 16, Math.PI * 1.5), matHands);
    rightHand.position.y = -0.45;
    rightHand.rotation.z = Math.PI / 2;
    rightShoulder.add(rightHand);

    // HIPS & LEGS (Left & Right)
    const leftHip = new THREE.Group();
    leftHip.position.set(-0.16, 0, 0);
    pelvis.add(leftHip);

    const legGeo = new THREE.BoxGeometry(0.22, 0.52, 0.26);
    const leftLegMesh = new THREE.Mesh(legGeo, matLegs);
    leftLegMesh.position.y = -0.26;
    leftLegMesh.castShadow = true;
    leftHip.add(leftLegMesh);

    const rightHip = new THREE.Group();
    rightHip.position.set(0.16, 0, 0);
    pelvis.add(rightHip);

    const rightLegMesh = new THREE.Mesh(legGeo, matLegs);
    rightLegMesh.position.y = -0.26;
    rightLegMesh.castShadow = true;
    rightHip.add(rightLegMesh);

    // ── 4. KINEMATIC MOTION CAPTURE CYCLE ────────────────────────────────
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
        rootGroup.rotation.y += deltaX * 0.015;
        prevMouseX = e.clientX;
      }
    };
    const onMouseUp = () => { isDragging = false; };

    container.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);

    const animate = () => {
      reqId = requestAnimationFrame(animate);

      if (isPlaying) {
        time += 0.04;
      }

      const cycle = (Math.sin(time) + 1) / 2; // 0 (start) to 1 (depth)

      if (exercise === 'pushup') {
        // Horizontal Plank Position
        rootGroup.position.set(0, -0.15 + (1 - cycle) * 0.28, 0);
        rootGroup.rotation.x = THREE.MathUtils.degToRad(75);
        if (!isDragging) rootGroup.rotation.y = THREE.MathUtils.degToRad(-35);

        // Arms bend in 90 degree pushup motion
        leftShoulder.rotation.x = THREE.MathUtils.degToRad(-30 + cycle * 55);
        rightShoulder.rotation.x = THREE.MathUtils.degToRad(-30 + cycle * 55);
        leftShoulder.rotation.z = THREE.MathUtils.degToRad(25 + cycle * 35);
        rightShoulder.rotation.z = THREE.MathUtils.degToRad(-25 - cycle * 35);

        // Legs stay locked in rigid plank
        leftHip.rotation.x = THREE.MathUtils.degToRad(0);
        rightHip.rotation.x = THREE.MathUtils.degToRad(0);
        neck.rotation.x = THREE.MathUtils.degToRad(-15);
      } else if (exercise === 'squat') {
        // Upright Stand to Deep Parallel Squat
        rootGroup.rotation.x = 0;
        if (!isDragging) rootGroup.rotation.y = THREE.MathUtils.degToRad(-25);

        const squatDepth = cycle * 0.38;
        pelvis.position.y = -squatDepth;

        // Hip hinge back
        pelvis.rotation.x = THREE.MathUtils.degToRad(cycle * 22);

        // Legs bend
        leftHip.rotation.x = THREE.MathUtils.degToRad(-cycle * 75);
        rightHip.rotation.x = THREE.MathUtils.degToRad(-cycle * 75);

        // Arms counterbalance forward
        leftShoulder.rotation.x = THREE.MathUtils.degToRad(cycle * 80);
        rightShoulder.rotation.x = THREE.MathUtils.degToRad(cycle * 80);
        leftShoulder.rotation.z = 0;
        rightShoulder.rotation.z = 0;

        neck.rotation.x = THREE.MathUtils.degToRad(-cycle * 18);
      } else if (exercise === 'situp') {
        // Lying on Back to 70° Torso Curl
        rootGroup.position.set(0, -0.3, 0);
        rootGroup.rotation.x = THREE.MathUtils.degToRad(-80);
        if (!isDragging) rootGroup.rotation.y = THREE.MathUtils.degToRad(-30);

        // Torso curls up
        pelvis.rotation.x = THREE.MathUtils.degToRad(cycle * 65);

        // Arms behind head
        leftShoulder.rotation.x = THREE.MathUtils.degToRad(120);
        rightShoulder.rotation.x = THREE.MathUtils.degToRad(120);
        leftShoulder.rotation.z = THREE.MathUtils.degToRad(30);
        rightShoulder.rotation.z = THREE.MathUtils.degToRad(-30);

        // Knees bent
        leftHip.rotation.x = THREE.MathUtils.degToRad(45);
        rightHip.rotation.x = THREE.MathUtils.degToRad(45);
      } else {
        // Plank Hold (Rigid isometric hold with subtle breathing)
        rootGroup.position.set(0, 0.05, 0);
        rootGroup.rotation.x = THREE.MathUtils.degToRad(78);
        if (!isDragging) rootGroup.rotation.y = THREE.MathUtils.degToRad(-35);

        const microVibe = Math.sin(time * 8) * 0.01;
        pelvis.position.y = microVibe;

        leftShoulder.rotation.x = THREE.MathUtils.degToRad(20);
        rightShoulder.rotation.x = THREE.MathUtils.degToRad(20);
        leftShoulder.rotation.z = THREE.MathUtils.degToRad(20);
        rightShoulder.rotation.z = THREE.MathUtils.degToRad(-20);
        leftHip.rotation.x = 0;
        rightHip.rotation.x = 0;
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
      className="relative w-full h-[260px] cursor-grab active:cursor-grabbing flex items-center justify-center bg-gradient-to-b from-slate-100/70 to-slate-200/50 dark:from-zinc-900/80 dark:to-zinc-950/90 rounded-3xl border border-slate-200/60 dark:border-zinc-800/80 overflow-hidden shadow-inner"
    >
      <div className="absolute top-2 right-3 pointer-events-none text-[9px] font-mono tracking-widest text-slate-400 dark:text-zinc-500 uppercase">
        3D WEBGL • DRAG TO ROTATE
      </div>
    </div>
  );
}
