import { useEffect, useRef } from 'react';

export default function SevenVectorHumanoid({ exercise = 'pushup', isPlaying = true }) {
  const canvasRef = useRef(null);
  const animRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let time = 0;

    const render = () => {
      if (isPlaying) {
        time += 0.038;
      }

      const w = canvas.width;
      const h = canvas.height;

      ctx.clearRect(0, 0, w, h);

      // Studio floor soft shadow
      ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
      ctx.beginPath();
      ctx.ellipse(w / 2, h - 35, 110, 16, 0, 0, Math.PI * 2);
      ctx.fill();

      // Smooth EaseInOut Sine Curve (0.0 to 1.0)
      const rawCycle = (Math.sin(time) + 1) / 2;
      const k = 0.5 - 0.5 * Math.cos(Math.PI * rawCycle);

      ctx.save();
      ctx.translate(w / 2, h / 2 + 10);

      // Color Palette (Seven.app Athletic Style)
      const skinColor = '#FBCFE8'; // Warm human skin tone
      const shirtColor = '#0EA5E9'; // Electric Sky Blue athletic tee
      const shortsColor = '#1E293B'; // Slate dark navy shorts
      const hairColor = '#334155'; // Dark hair
      const shoeColor = '#FFFFFF'; // White sneaker

      if (exercise === 'pushup') {
        drawSevenPushup(ctx, k, skinColor, shirtColor, shortsColor, hairColor, shoeColor);
      } else if (exercise === 'squat') {
        drawSevenSquat(ctx, k, skinColor, shirtColor, shortsColor, hairColor, shoeColor);
      } else if (exercise === 'situp') {
        drawSevenSitup(ctx, k, skinColor, shirtColor, shortsColor, hairColor, shoeColor);
      } else {
        drawSevenPlank(ctx, time, skinColor, shirtColor, shortsColor, hairColor, shoeColor);
      }

      ctx.restore();

      animRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [exercise, isPlaying]);

  return (
    <div className="relative w-full h-[260px] flex items-center justify-center bg-gradient-to-b from-slate-50/90 to-slate-100/50 dark:from-zinc-900/90 dark:to-zinc-950 rounded-3xl border border-slate-200/80 dark:border-zinc-800/80 overflow-hidden shadow-inner">
      <canvas
        ref={canvasRef}
        width={420}
        height={260}
        className="w-full h-full object-contain"
      />
    </div>
  );
}

// ── 1. SEVEN.APP PUSH-UP VECTOR RENDERER ──────────────────────────────
function drawSevenPushup(ctx, k, skin, shirt, shorts, hair, shoe) {
  // k: 0.0 (top lockout) -> 1.0 (bottom depth)
  const depthY = k * 32;

  ctx.save();
  ctx.translate(0, depthY);

  // 1. Far Arm (Shadowed)
  ctx.strokeStyle = '#E2E8F0';
  ctx.lineWidth = 10;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.beginPath();
  ctx.moveTo(35, 10);
  ctx.lineTo(25 - k * 8, 30 + (1 - k) * 6);
  ctx.lineTo(35, 52 - depthY);
  ctx.stroke();

  // 2. Legs & Feet (Locked in straight horizontal plank)
  ctx.strokeStyle = skin;
  ctx.lineWidth = 14;
  ctx.beginPath();
  ctx.moveTo(-25, 12);
  ctx.lineTo(-95, 20); // Knee to ankle
  ctx.stroke();

  // Shoes on toes
  ctx.fillStyle = shoe;
  ctx.beginPath();
  ctx.roundRect(-108, 14, 20, 10, 4);
  ctx.fill();

  // Shorts
  ctx.fillStyle = shorts;
  ctx.beginPath();
  ctx.roundRect(-42, 4, 32, 18, 6);
  ctx.fill();

  // 3. Torso / Athletic T-Shirt (Rigid Spine)
  ctx.fillStyle = shirt;
  ctx.beginPath();
  ctx.roundRect(-22, -2, 60, 24, 8);
  ctx.fill();

  // 4. Head & Neck
  // Neck
  ctx.fillStyle = skin;
  ctx.beginPath();
  ctx.roundRect(30, -8, 12, 14, 4);
  ctx.fill();

  // Head
  ctx.beginPath();
  ctx.arc(48, -12, 16, 0, Math.PI * 2);
  ctx.fill();

  // Hair
  ctx.fillStyle = hair;
  ctx.beginPath();
  ctx.arc(46, -15, 16, Math.PI * 0.9, Math.PI * 1.9);
  ctx.fill();

  // Ear & Profile
  ctx.fillStyle = skin;
  ctx.beginPath();
  ctx.arc(46, -11, 3.5, 0, Math.PI * 2);
  ctx.fill();

  // 5. Near Arm (Foreground Articulated Arm: Shoulder -> Elbow 90° -> Hand)
  ctx.strokeStyle = skin;
  ctx.lineWidth = 12;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.beginPath();
  const shoulderX = 30;
  const shoulderY = 10;
  const elbowX = 18 - k * 12; // Elbow travels back in 45° arrow
  const elbowY = 22 + (1 - k) * 12;
  const handX = 28;
  const handY = 52 - depthY; // Stays planted on floor

  ctx.moveTo(shoulderX, shoulderY);
  ctx.lineTo(elbowX, elbowY);
  ctx.lineTo(handX, handY);
  ctx.stroke();

  // Hand palm on floor
  ctx.fillStyle = skin;
  ctx.beginPath();
  ctx.ellipse(handX, handY, 7, 4, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

// ── 2. SEVEN.APP SQUAT VECTOR RENDERER ────────────────────────────────
function drawSevenSquat(ctx, k, skin, shirt, shorts, hair, shoe) {
  // k: 0.0 (standing) -> 1.0 (full parallel depth)
  const hipDrop = k * 45;
  const hipX = -k * 22; // Hips hinge backward

  ctx.save();
  ctx.translate(0, hipDrop - 20);

  // 1. Legs (Thigh & Calf in Squat Joint Flexion)
  const hipJointX = -10 + hipX;
  const hipJointY = -10;
  const kneeX = 20 - k * 5; // Knee tracks slightly forward over toe
  const kneeY = 15 - hipDrop * 0.35;
  const ankleX = 15;
  const ankleY = 65 - hipDrop; // Planted on floor

  // Thigh
  ctx.strokeStyle = shorts;
  ctx.lineWidth = 18;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.beginPath();
  ctx.moveTo(hipJointX, hipJointY);
  ctx.lineTo(kneeX, kneeY);
  ctx.stroke();

  // Calf
  ctx.strokeStyle = skin;
  ctx.lineWidth = 14;
  ctx.beginPath();
  ctx.moveTo(kneeX, kneeY);
  ctx.lineTo(ankleX, ankleY);
  ctx.stroke();

  // Sneaker on Floor
  ctx.fillStyle = shoe;
  ctx.beginPath();
  ctx.roundRect(ankleX - 8, ankleY - 4, 28, 12, 4);
  ctx.fill();

  // 2. Torso (Leans 25° forward in athletic hip hinge balance)
  const torsoAngle = k * 0.42;
  ctx.save();
  ctx.translate(hipJointX, hipJointY);
  ctx.rotate(torsoAngle);

  // Shirt
  ctx.fillStyle = shirt;
  ctx.beginPath();
  ctx.roundRect(-12, -48, 26, 50, 8);
  ctx.fill();

  // Neck & Head
  ctx.fillStyle = skin;
  ctx.beginPath();
  ctx.roundRect(-6, -60, 14, 16, 4);
  ctx.fill();

  ctx.beginPath();
  ctx.arc(1, -68, 16, 0, Math.PI * 2);
  ctx.fill();

  // Hair
  ctx.fillStyle = hair;
  ctx.beginPath();
  ctx.arc(-1, -71, 16, Math.PI * 0.9, Math.PI * 1.9);
  ctx.fill();

  // 3. Arms Counterbalancing Forward
  ctx.strokeStyle = skin;
  ctx.lineWidth = 11;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(2, -40);
  ctx.lineTo(28 + k * 15, -40 - k * 8); // Reaches forward horizontally
  ctx.stroke();

  ctx.restore();
  ctx.restore();
}

// ── 3. SEVEN.APP SIT-UP VECTOR RENDERER ───────────────────────────────
function drawSevenSitup(ctx, k, skin, shirt, shorts, hair, shoe) {
  // k: 0.0 (supine flat) -> 1.0 (70° upright crunch)
  const curlAngle = -k * 1.1; // Rotates upward

  ctx.save();
  ctx.translate(-25, 25);

  // 1. Bent Knees & Planted Feet
  ctx.strokeStyle = shorts;
  ctx.lineWidth = 16;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.beginPath();
  ctx.moveTo(0, 0); // Hips
  ctx.lineTo(28, -25); // Knee peak
  ctx.stroke();

  ctx.strokeStyle = skin;
  ctx.lineWidth = 14;
  ctx.beginPath();
  ctx.moveTo(28, -25);
  ctx.lineTo(48, 12); // Feet on floor
  ctx.stroke();

  // Shoes
  ctx.fillStyle = shoe;
  ctx.beginPath();
  ctx.roundRect(40, 6, 24, 10, 4);
  ctx.fill();

  // 2. Curling Torso
  ctx.save();
  ctx.rotate(curlAngle);

  // Torso Shirt
  ctx.fillStyle = shirt;
  ctx.beginPath();
  ctx.roundRect(-52, -14, 54, 24, 8);
  ctx.fill();

  // Neck & Head
  ctx.fillStyle = skin;
  ctx.beginPath();
  ctx.roundRect(-66, -10, 16, 16, 4);
  ctx.fill();

  ctx.beginPath();
  ctx.arc(-76, -2, 16, 0, Math.PI * 2);
  ctx.fill();

  // Hair
  ctx.fillStyle = hair;
  ctx.beginPath();
  ctx.arc(-78, -5, 16, Math.PI * 0.8, Math.PI * 1.8);
  ctx.fill();

  // Arms: Hands behind ears, elbows forward
  ctx.strokeStyle = skin;
  ctx.lineWidth = 10;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(-36, -6);
  ctx.lineTo(-58, -22);
  ctx.lineTo(-72, -6);
  ctx.stroke();

  ctx.restore();
  ctx.restore();
}

// ── 4. SEVEN.APP PLANK VECTOR RENDERER ────────────────────────────────
function drawSevenPlank(ctx, time, skin, shirt, shorts, hair, shoe) {
  const breathing = Math.sin(time * 5) * 1.5;

  ctx.save();
  ctx.translate(0, breathing);

  // Rigid Plank Chain
  // Feet on toes
  ctx.fillStyle = shoe;
  ctx.beginPath();
  ctx.roundRect(-108, 14, 20, 10, 4);
  ctx.fill();

  // Legs
  ctx.strokeStyle = skin;
  ctx.lineWidth = 14;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(-25, 12);
  ctx.lineTo(-95, 20);
  ctx.stroke();

  // Shorts
  ctx.fillStyle = shorts;
  ctx.beginPath();
  ctx.roundRect(-42, 4, 32, 18, 6);
  ctx.fill();

  // Torso
  ctx.fillStyle = shirt;
  ctx.beginPath();
  ctx.roundRect(-22, -2, 60, 24, 8);
  ctx.fill();

  // Head & Neck
  ctx.fillStyle = skin;
  ctx.beginPath();
  ctx.roundRect(30, -8, 12, 14, 4);
  ctx.fill();

  ctx.beginPath();
  ctx.arc(48, -12, 16, 0, Math.PI * 2);
  ctx.fill();

  // Hair
  ctx.fillStyle = hair;
  ctx.beginPath();
  ctx.arc(46, -15, 16, Math.PI * 0.9, Math.PI * 1.9);
  ctx.fill();

  // Forearm flat on floor (Elbow directly under shoulder)
  ctx.strokeStyle = skin;
  ctx.lineWidth = 12;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.beginPath();
  ctx.moveTo(30, 8);
  ctx.lineTo(30, 36); // Vertical upper arm
  ctx.lineTo(54, 36); // Horizontal forearm flat on floor
  ctx.stroke();

  ctx.restore();
}
