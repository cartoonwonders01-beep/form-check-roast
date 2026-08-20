import { useEffect, useRef } from 'react';

export default function SevenCharacterViewer({ 
  character = 'lego', 
  exercise = 'pushup', 
  isPlaying = true 
}) {
  const canvasRef = useRef(null);
  const animRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let t = 0;

    const loop = () => {
      if (isPlaying) {
        t += 0.045;
      }
      const w = canvas.width;
      const h = canvas.height;

      ctx.clearRect(0, 0, w, h);

      // Clean studio floor circle shadow
      ctx.fillStyle = 'rgba(0, 0, 0, 0.06)';
      ctx.beginPath();
      ctx.ellipse(w / 2, h - 35, 95, 14, 0, 0, Math.PI * 2);
      ctx.fill();

      // Smooth kinematic cycle (0 = start, 1 = max depth/extension)
      const cycle = (Math.sin(t) + 1) / 2;

      ctx.save();
      ctx.translate(w / 2, h / 2 + 10);

      if (character === 'lego') {
        renderLegoExercise(ctx, exercise, cycle, t);
      } else if (character === 'vader') {
        renderVaderExercise(ctx, exercise, cycle, t);
      } else {
        renderDuckExercise(ctx, exercise, cycle, t);
      }

      ctx.restore();

      animRef.current = requestAnimationFrame(loop);
    };

    loop();

    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [character, exercise, isPlaying]);

  return (
    <div className="relative w-full h-[260px] flex items-center justify-center bg-slate-50/80 dark:bg-zinc-900/60 rounded-3xl border border-slate-100 dark:border-zinc-800/80 overflow-hidden shadow-inner">
      <canvas
        ref={canvasRef}
        width={400}
        height={260}
        className="w-full h-full object-contain"
      />
    </div>
  );
}

// ── 1. LEGO MINIFIGURE EXERCISE RENDERER ────────────────────────────────

function renderLegoExercise(ctx, exercise, cycle, t) {
  if (exercise === 'pushup') {
    const depthY = cycle * 28;

    // Body in horizontal plank
    ctx.save();
    ctx.translate(0, depthY);

    // Torso (Red Lego)
    ctx.fillStyle = '#EF4444';
    ctx.beginPath();
    ctx.roundRect(-45, -10, 65, 24, 4);
    ctx.fill();
    ctx.strokeStyle = '#991B1B';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Lego Head & Stud
    ctx.fillStyle = '#FACC15';
    ctx.fillRect(26, -26, 10, 4); // Stud
    ctx.beginPath();
    ctx.roundRect(20, -22, 22, 22, 5); // Head
    ctx.fill();
    ctx.strokeStyle = '#CA8A04';
    ctx.stroke();

    // Smile & Eyes
    ctx.fillStyle = '#18181B';
    ctx.beginPath();
    ctx.arc(32, -13, 2, 0, Math.PI * 2);
    ctx.arc(38, -13, 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(35, -9, 4, 0.2, Math.PI - 0.2);
    ctx.stroke();

    // Legs (Blue Lego)
    ctx.fillStyle = '#2563EB';
    ctx.fillRect(-75, -8, 30, 20);
    ctx.strokeRect(-75, -8, 30, 20);

    // C-Claw Hands on Ground
    ctx.strokeStyle = '#FACC15';
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.arc(-35, 26 - depthY, 6, 0.4, Math.PI * 1.8);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(10, 26 - depthY, 6, 0.4, Math.PI * 1.8);
    ctx.stroke();

    ctx.restore();
  } else if (exercise === 'squat') {
    const squatY = cycle * 32;

    ctx.save();
    ctx.translate(0, squatY - 15);

    // Head
    ctx.fillStyle = '#FACC15';
    ctx.fillRect(-5, -54, 10, 4); // Stud
    ctx.beginPath();
    ctx.roundRect(-12, -50, 24, 22, 5); // Head
    ctx.fill();
    ctx.strokeStyle = '#CA8A04';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Eyes & Smile
    ctx.fillStyle = '#18181B';
    ctx.beginPath();
    ctx.arc(-4, -40, 2, 0, Math.PI * 2);
    ctx.arc(4, -40, 2, 0, Math.PI * 2);
    ctx.fill();

    // Torso (Red)
    ctx.fillStyle = '#EF4444';
    ctx.beginPath();
    ctx.roundRect(-16, -26, 32, 28, 4);
    ctx.fill();
    ctx.strokeStyle = '#991B1B';
    ctx.stroke();

    // Legs bending in squat
    ctx.fillStyle = '#2563EB';
    ctx.fillRect(-16, 2, 14, 26 - squatY * 0.4);
    ctx.fillRect(2, 2, 14, 26 - squatY * 0.4);

    ctx.restore();
  } else if (exercise === 'situp') {
    // Situp curl rotation
    const angle = (1 - cycle) * -0.7;

    ctx.save();
    ctx.translate(-20, 20);

    // Legs flat / knees bent
    ctx.fillStyle = '#2563EB';
    ctx.fillRect(0, -6, 40, 18);

    // Rotating Torso
    ctx.save();
    ctx.rotate(angle);

    ctx.fillStyle = '#EF4444';
    ctx.beginPath();
    ctx.roundRect(-45, -18, 45, 24, 4);
    ctx.fill();
    ctx.strokeStyle = '#991B1B';
    ctx.stroke();

    // Head
    ctx.fillStyle = '#FACC15';
    ctx.fillRect(-62, -15, 6, 12);
    ctx.beginPath();
    ctx.roundRect(-60, -18, 20, 22, 5);
    ctx.fill();

    ctx.restore();
    ctx.restore();
  } else {
    // Plank Hold
    ctx.save();
    const microVibe = Math.sin(t * 12) * 1.2;
    ctx.translate(0, microVibe);

    // Torso
    ctx.fillStyle = '#EF4444';
    ctx.beginPath();
    ctx.roundRect(-45, -10, 65, 24, 4);
    ctx.fill();

    // Head
    ctx.fillStyle = '#FACC15';
    ctx.fillRect(26, -26, 10, 4);
    ctx.roundRect(20, -22, 22, 22, 5);
    ctx.fill();

    // Legs
    ctx.fillStyle = '#2563EB';
    ctx.fillRect(-75, -8, 30, 20);

    ctx.restore();
  }
}

// ── 2. DARTH VADER EXERCISE RENDERER ───────────────────────────────────

function renderVaderExercise(ctx, exercise, cycle, t) {
  if (exercise === 'pushup' || exercise === 'plank') {
    const depthY = exercise === 'plank' ? 0 : cycle * 26;

    ctx.save();
    ctx.translate(0, depthY);

    // Flowing Cape
    ctx.fillStyle = '#090A0F';
    ctx.beginPath();
    ctx.moveTo(15, -6);
    ctx.quadraticCurveTo(-20, 10, -75, 18);
    ctx.lineTo(-70, 28);
    ctx.quadraticCurveTo(-10, 20, 15, 10);
    ctx.fill();

    // Dark Armor Torso
    ctx.fillStyle = '#18181B';
    ctx.beginPath();
    ctx.roundRect(-50, -8, 65, 22, 4);
    ctx.fill();
    ctx.strokeStyle = '#3F3F46';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Chest control box LED
    ctx.fillStyle = '#EF4444';
    ctx.fillRect(-22, -3, 6, 4);
    ctx.fillStyle = '#10B981';
    ctx.fillRect(-14, -3, 6, 4);

    // Vader Helmet
    const hX = 24;
    const hY = -12;
    ctx.fillStyle = '#090A0F';
    ctx.beginPath();
    ctx.arc(hX, hY, 14, Math.PI, 0);
    ctx.lineTo(hX + 16, hY + 12);
    ctx.lineTo(hX - 16, hY + 12);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Red Lightsaber Floor Line
    ctx.strokeStyle = '#FF1744';
    ctx.shadowColor = '#FF1744';
    ctx.shadowBlur = 8;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(-70, 30);
    ctx.lineTo(70, 30);
    ctx.stroke();
    ctx.shadowBlur = 0;

    ctx.restore();
  } else if (exercise === 'squat') {
    const squatY = cycle * 30;

    ctx.save();
    ctx.translate(0, squatY - 15);

    // Cape
    ctx.fillStyle = '#090A0F';
    ctx.fillRect(-22, -20, 44, 40);

    // Helmet
    ctx.fillStyle = '#090A0F';
    ctx.beginPath();
    ctx.arc(0, -42, 16, Math.PI, 0);
    ctx.lineTo(18, -26); ctx.lineTo(-18, -26);
    ctx.fill();

    // Torso & Chest LED
    ctx.fillStyle = '#18181B';
    ctx.roundRect(-16, -26, 32, 28, 4);
    ctx.fill();
    ctx.fillStyle = '#EF4444'; ctx.fillRect(-8, -16, 6, 4);
    ctx.fillStyle = '#10B981'; ctx.fillRect(2, -16, 6, 4);

    // Legs
    ctx.fillStyle = '#090A0F';
    ctx.fillRect(-16, 2, 14, 24 - squatY * 0.35);
    ctx.fillRect(2, 2, 14, 24 - squatY * 0.35);

    ctx.restore();
  } else {
    // Situp
    const angle = (1 - cycle) * -0.65;
    ctx.save();
    ctx.translate(-20, 20);
    ctx.fillStyle = '#090A0F';
    ctx.fillRect(0, -6, 40, 16);

    ctx.save();
    ctx.rotate(angle);
    ctx.fillStyle = '#18181B';
    ctx.roundRect(-45, -16, 45, 22, 4);
    ctx.fill();

    // Helmet
    ctx.fillStyle = '#090A0F';
    ctx.beginPath();
    ctx.arc(-55, -8, 14, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
    ctx.restore();
  }
}

// ── 3. DUCK COACH EXERCISE RENDERER ────────────────────────────────────

function renderDuckExercise(ctx, exercise, cycle, t) {
  if (exercise === 'pushup' || exercise === 'plank') {
    const depthY = exercise === 'plank' ? 0 : cycle * 26;

    ctx.save();
    ctx.translate(0, depthY);

    // Yellow Body
    ctx.fillStyle = '#FACC15';
    ctx.beginPath();
    ctx.ellipse(-15, 6, 50, 20, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#CA8A04';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Head
    ctx.beginPath();
    ctx.arc(32, -12, 16, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Red Headband
    ctx.fillStyle = '#EF4444';
    ctx.fillRect(20, -22, 24, 5);

    // Orange Bill
    ctx.fillStyle = '#F97316';
    ctx.beginPath();
    ctx.ellipse(48, -8, 12, 5, 0.1, 0, Math.PI * 2);
    ctx.fill();

    // Eye
    ctx.fillStyle = '#18181B';
    ctx.beginPath();
    ctx.arc(38, -14, 2.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  } else if (exercise === 'squat') {
    const squatY = cycle * 28;

    ctx.save();
    ctx.translate(0, squatY - 15);

    // Head & Headband
    ctx.fillStyle = '#FACC15';
    ctx.beginPath();
    ctx.arc(0, -38, 18, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#EF4444';
    ctx.fillRect(-14, -48, 28, 6);

    // Bill
    ctx.fillStyle = '#F97316';
    ctx.beginPath();
    ctx.ellipse(16, -34, 12, 5, 0.1, 0, Math.PI * 2);
    ctx.fill();

    // Body
    ctx.fillStyle = '#FACC15';
    ctx.beginPath();
    ctx.ellipse(0, -8, 24, 20, 0, 0, Math.PI * 2);
    ctx.fill();

    // Webbed Feet
    ctx.fillStyle = '#F97316';
    ctx.fillRect(-18, 12, 14, 8);
    ctx.fillRect(4, 12, 14, 8);

    ctx.restore();
  } else {
    // Situp
    const angle = (1 - cycle) * -0.65;
    ctx.save();
    ctx.translate(-20, 20);

    ctx.save();
    ctx.rotate(angle);
    ctx.fillStyle = '#FACC15';
    ctx.beginPath();
    ctx.ellipse(-25, 0, 35, 16, 0, 0, Math.PI * 2);
    ctx.fill();

    // Head
    ctx.beginPath();
    ctx.arc(-55, -6, 14, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#F97316';
    ctx.ellipse(-66, -4, 10, 4, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
    ctx.restore();
  }
}
