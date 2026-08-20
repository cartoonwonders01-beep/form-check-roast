import { useEffect, useRef } from 'react';

export default function AnimalPuppetCanvas({ character = 'lego_brick', poseMetrics, exercise = 'pushup' }) {
  const canvasRef = useRef(null);
  const animFrameRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let time = 0;

    const render = () => {
      time += 0.04;
      const width = canvas.width;
      const height = canvas.height;

      ctx.clearRect(0, 0, width, height);

      // Sci-Fi / Gym Training Holo-Floor
      drawHoloGrid(ctx, width, height, time);

      const cx = width / 2;
      const cy = height / 2 + 10;

      // Extract real user joint angles or use smooth demo physics
      const hasRealPose = poseMetrics?.isValid;
      const elbowAngle = hasRealPose ? poseMetrics.angles.elbow : 180 - Math.abs(Math.sin(time)) * 95;
      const hipAngle = hasRealPose ? poseMetrics.angles.hip : 180 - Math.abs(Math.cos(time * 0.5)) * 18;
      const hasErrors = (poseMetrics?.errors?.length > 0) || (hipAngle < 160);

      // Kinematic translations
      const depthY = (180 - elbowAngle) * 0.42;
      const hipSag = (180 - hipAngle) * 0.75;

      ctx.save();
      ctx.translate(cx, cy + depthY);

      // RENDER SELECTED AVATAR UNIVERSE
      switch (character) {
        case 'lego_brick':
          drawLegoMinifig(ctx, depthY, hipSag, elbowAngle, hasErrors, time, 'brick');
          break;
        case 'lego_batman':
          drawLegoMinifig(ctx, depthY, hipSag, elbowAngle, hasErrors, time, 'batman');
          break;
        case 'vader':
          drawVaderPuppet(ctx, depthY, hipSag, elbowAngle, hasErrors, time);
          break;
        case 'yoda':
          drawYodaPuppet(ctx, depthY, hipSag, elbowAngle, hasErrors, time);
          break;
        case 'stormtrooper':
          drawStormtrooperPuppet(ctx, depthY, hipSag, elbowAngle, hasErrors, time);
          break;
        case 'duck':
          drawDuckPuppet(ctx, depthY, hipSag, elbowAngle, hasErrors, time);
          break;
        case 'bear':
          drawBearPuppet(ctx, depthY, hipSag, elbowAngle, hasErrors, time);
          break;
        default:
          drawLegoMinifig(ctx, depthY, hipSag, elbowAngle, hasErrors, time, 'brick');
      }

      ctx.restore();

      // Holographic Alignment Laser / Stress Lines
      drawLaserAlignmentGuides(ctx, width, height, hipAngle, elbowAngle, hasErrors);

      animFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [character, poseMetrics, exercise]);

  return (
    <div className="relative w-full h-[340px] rounded-2xl overflow-hidden bg-gradient-to-b from-[#0D1017] via-[#07090E] to-[#040508] border border-white/10 shadow-2xl">
      <canvas
        ref={canvasRef}
        width={500}
        height={340}
        className="w-full h-full object-contain"
      />

      {/* Floating Hologram Badge */}
      <div className="absolute top-3 right-3 bg-black/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
        <span className="text-[10px] font-mono text-cyan-300 font-bold uppercase tracking-widest">
          3D KINEMATIC MIRROR • {character.replace('_', ' ')}
        </span>
      </div>
    </div>
  );
}

// ── HOLO FLOOR & LASER GUIDES ──────────────────────────────────────────

function drawHoloGrid(ctx, width, height, time) {
  ctx.strokeStyle = 'rgba(0, 229, 255, 0.08)';
  ctx.lineWidth = 1;

  for (let x = 0; x < width; x += 25) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }
  for (let y = 0; y < height; y += 25) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }
}

function drawLaserAlignmentGuides(ctx, width, height, hipAngle, elbowAngle, hasErrors) {
  if (hasErrors) {
    // Red Glowing Stress Vector
    ctx.strokeStyle = '#FF1744';
    ctx.fillStyle = '#FF1744';
    ctx.lineWidth = 2;
    ctx.font = 'bold 11px Inter, monospace';
    ctx.fillText(`⚡ SPINAL SAG DETECTED: ${Math.round(hipAngle)}° (Target: 180°)`, 16, 26);
    ctx.fillText(`⚡ BIOMECHANICAL STRESS: HIGH`, 16, 42);

    // Laser fault line across spine
    ctx.beginPath();
    ctx.setLineDash([4, 4]);
    ctx.moveTo(width / 2 - 90, height / 2 + 30);
    ctx.lineTo(width / 2 + 90, height / 2 + 30 + (180 - hipAngle) * 0.8);
    ctx.stroke();
    ctx.setLineDash([]);
  } else {
    // Green Perfect Alignment Guide
    ctx.strokeStyle = '#D4FF00';
    ctx.fillStyle = '#D4FF00';
    ctx.lineWidth = 1.5;
    ctx.font = 'bold 11px Inter, monospace';
    ctx.fillText(`✓ LASER KINEMATICS: 98% NEUTRAL SPINE`, 16, 26);
  }
}

// ── 1. LEGO MINIFIGURE RIG (Lego Brick Diesel & Lego Batman) ───────────

function drawLegoMinifig(ctx, depthY, hipSag, elbowAngle, hasErrors, time, variant) {
  // Shadow
  ctx.fillStyle = 'rgba(0,0,0,0.4)';
  ctx.beginPath();
  ctx.ellipse(0, 65 - depthY * 0.4, 85, 16, 0, 0, Math.PI * 2);
  ctx.fill();

  const isBatman = variant === 'batman';

  // 1. Lego Blocky Torso (Angles with hip sag)
  ctx.save();
  ctx.translate(-20, 15 + hipSag * 0.4);
  ctx.rotate(hipSag * 0.008);

  ctx.fillStyle = isBatman ? '#18181B' : '#E11D48'; // Batman black or Gym red tank
  ctx.beginPath();
  ctx.roundRect(-40, -15, 65, 32, [4, 4, 2, 2]);
  ctx.fill();
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 2;
  ctx.stroke();

  // Torso Printing (Abs or Bat Symbol)
  if (isBatman) {
    ctx.fillStyle = '#FACC15';
    ctx.fillRect(-22, 10, 30, 6); // Utility belt
    ctx.fillStyle = '#000000';
    ctx.font = 'bold 9px sans-serif';
    ctx.fillText('🦇', -12, 2);
  } else {
    // 6-Pack Abs Lines on Lego Torso
    ctx.strokeStyle = '#881337';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(-15, -8); ctx.lineTo(10, -8);
    ctx.moveTo(-15, 0); ctx.lineTo(10, 0);
    ctx.moveTo(-2, -12); ctx.lineTo(-2, 10);
    ctx.stroke();
  }
  ctx.restore();

  // 2. Lego Yellow Head & Neck Stud
  const headX = 40;
  const headY = -12;

  // Stud top
  ctx.fillStyle = isBatman ? '#27272A' : '#FACC15';
  ctx.fillRect(headX - 6, headY - 24, 12, 5);
  ctx.strokeRect(headX - 6, headY - 24, 12, 5);

  // Cylinder Head
  ctx.fillStyle = isBatman ? '#27272A' : '#FACC15';
  ctx.beginPath();
  ctx.roundRect(headX - 14, headY - 19, 28, 26, 6);
  ctx.fill();
  ctx.stroke();

  if (isBatman) {
    // Bat Ears
    ctx.fillStyle = '#18181B';
    ctx.beginPath();
    ctx.moveTo(headX - 14, headY - 19); ctx.lineTo(headX - 18, headY - 32); ctx.lineTo(headX - 6, headY - 19);
    ctx.moveTo(headX + 6, headY - 19); ctx.lineTo(headX + 18, headY - 32); ctx.lineTo(headX + 14, headY - 19);
    ctx.fill();
    // White eye slits
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(headX - 8, headY - 10, 6, 3);
    ctx.fillRect(headX + 2, headY - 10, 6, 3);
  } else {
    // Classic Lego Smile & Eyes
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.arc(headX - 5, headY - 8, 2.5, 0, Math.PI * 2);
    ctx.arc(headX + 5, headY - 8, 2.5, 0, Math.PI * 2);
    ctx.fill();

    // Expression (Annoyed if bad form, happy if clean)
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;
    ctx.beginPath();
    if (hasErrors) {
      // Grimace
      ctx.moveTo(headX - 6, headY + 3); ctx.lineTo(headX + 6, headY + 3);
    } else {
      // Big Lego Grin
      ctx.arc(headX, headY - 2, 7, 0.2, Math.PI - 0.2);
    }
    ctx.stroke();

    // Red Headband
    ctx.fillStyle = '#DC2626';
    ctx.fillRect(headX - 14, headY - 17, 28, 6);
  }

  // 3. Lego C-Claw Hands on the Floor
  ctx.strokeStyle = isBatman ? '#27272A' : '#FACC15';
  ctx.lineWidth = 4;
  // Left C-Hand
  ctx.beginPath();
  ctx.arc(-55, 48 - depthY, 7, 0.5, Math.PI * 1.8);
  ctx.stroke();
  // Right C-Hand
  ctx.beginPath();
  ctx.arc(28, 48 - depthY, 7, 0.5, Math.PI * 1.8);
  ctx.stroke();

  // 4. Lego Blocky Legs
  ctx.fillStyle = isBatman ? '#18181B' : '#1E3A8A';
  ctx.fillRect(-78, 18 + hipSag * 0.2, 30, 16);
  ctx.strokeRect(-78, 18 + hipSag * 0.2, 30, 16);
  ctx.fillRect(-85, 34 + hipSag * 0.1, 14, 14); // Feet
}

// ── 2. STAR WARS RIG (Lord Vader & Master Yoda) ─────────────────────────

function drawVaderPuppet(ctx, depthY, hipSag, elbowAngle, hasErrors, time) {
  // Shadow
  ctx.fillStyle = 'rgba(0,0,0,0.5)';
  ctx.beginPath();
  ctx.ellipse(0, 65 - depthY * 0.4, 90, 18, 0, 0, Math.PI * 2);
  ctx.fill();

  // Flowing Sith Cape
  ctx.fillStyle = '#090A0F';
  ctx.beginPath();
  ctx.moveTo(30, -5);
  ctx.quadraticCurveTo(-20, 20 + hipSag * 0.6, -95, 30);
  ctx.lineTo(-90, 45);
  ctx.quadraticCurveTo(-10, 35, 30, 15);
  ctx.fill();

  // Armored Torso
  ctx.fillStyle = '#111318';
  ctx.beginPath();
  ctx.roundRect(-60, 5 + hipSag * 0.4, 85, 26, 4);
  ctx.fill();
  ctx.strokeStyle = '#2A2E39';
  ctx.lineWidth = 2;
  ctx.stroke();

  // Vader Chest Control Box with Flashing LEDs
  ctx.fillStyle = '#1E232E';
  ctx.fillRect(-28, 12 + hipSag * 0.4, 22, 14);
  // Red & Green blinking LEDs
  ctx.fillStyle = '#EF4444'; ctx.fillRect(-24, 15 + hipSag * 0.4, 5, 4);
  ctx.fillStyle = Math.sin(time * 6) > 0 ? '#10B981' : '#047857'; ctx.fillRect(-15, 15 + hipSag * 0.4, 5, 4);

  // Vader Helmet & Breathing Grille
  const helmX = 42;
  const helmY = -12;

  // Flared Helmet Dome
  ctx.fillStyle = '#0B0D13';
  ctx.beginPath();
  ctx.arc(helmX, helmY - 6, 20, Math.PI, 0);
  ctx.lineTo(helmX + 22, helmY + 12);
  ctx.lineTo(helmX - 22, helmY + 12);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#272B35';
  ctx.stroke();

  // Triangular Mask Grille
  ctx.fillStyle = '#1E232E';
  ctx.beginPath();
  ctx.moveTo(helmX, helmY + 2);
  ctx.lineTo(helmX - 7, helmY + 12);
  ctx.lineTo(helmX + 7, helmY + 12);
  ctx.fill();

  // Angular Eye Lenses
  ctx.fillStyle = '#000000';
  ctx.fillRect(helmX - 10, helmY - 5, 7, 4);
  ctx.fillRect(helmX + 3, helmY - 5, 7, 4);

  // Armored Gauntlets on the Floor
  ctx.fillStyle = '#111318';
  ctx.fillRect(-65, 42 - depthY, 16, 10);
  ctx.fillRect(25, 42 - depthY, 16, 10);

  // RED LIGHTSABER BLADE (Used as Spine Alignment Indicator)
  ctx.save();
  ctx.strokeStyle = '#FF1744';
  ctx.shadowColor = '#FF1744';
  ctx.shadowBlur = 12;
  ctx.lineWidth = 3.5;
  ctx.beginPath();
  ctx.moveTo(35, 44 - depthY);
  ctx.lineTo(110, 44 - depthY);
  ctx.stroke();
  ctx.restore();
}

function drawYodaPuppet(ctx, depthY, hipSag, elbowAngle, hasErrors, time) {
  ctx.fillStyle = 'rgba(0,0,0,0.3)';
  ctx.beginPath();
  ctx.ellipse(0, 65 - depthY * 0.4, 75, 14, 0, 0, Math.PI * 2);
  ctx.fill();

  // Jedi Robes
  ctx.fillStyle = '#A89F91';
  ctx.beginPath();
  ctx.ellipse(-15, 20 + hipSag * 0.4, 55, 22, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#78716C';
  ctx.stroke();

  // Yoda Green Head
  const yX = 35;
  const yY = -8;
  ctx.fillStyle = '#84CC16';
  ctx.beginPath();
  ctx.arc(yX, yY, 16, 0, Math.PI * 2);
  ctx.fill();

  // Long Pointy Jedi Ears
  ctx.beginPath();
  ctx.moveTo(yX - 12, yY - 2); ctx.lineTo(yX - 38, yY - 14); ctx.lineTo(yX - 10, yY + 6);
  ctx.moveTo(yX + 12, yY - 2); ctx.lineTo(yX + 38, yY - 14); ctx.lineTo(yX + 10, yY + 6);
  ctx.fill();

  // Eyes & Wrinkles
  ctx.fillStyle = '#1C1917';
  ctx.beginPath();
  ctx.arc(yX - 5, yY - 2, 2.5, 0, Math.PI * 2);
  ctx.arc(yX + 5, yY - 2, 2.5, 0, Math.PI * 2);
  ctx.fill();

  // Green Claw Hands
  ctx.fillStyle = '#84CC16';
  ctx.beginPath();
  ctx.arc(-55, 46 - depthY, 6, 0, Math.PI * 2);
  ctx.arc(22, 46 - depthY, 6, 0, Math.PI * 2);
  ctx.fill();
}

function drawStormtrooperPuppet(ctx, depthY, hipSag, elbowAngle, hasErrors, time) {
  // White Armor Stormtrooper
  ctx.fillStyle = 'rgba(0,0,0,0.4)';
  ctx.beginPath();
  ctx.ellipse(0, 65 - depthY * 0.4, 85, 16, 0, 0, Math.PI * 2);
  ctx.fill();

  // Body Glove & White Chest Plates
  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.roundRect(-55, 8 + hipSag * 0.4, 80, 26, 6);
  ctx.fill();
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 2;
  ctx.stroke();

  // Stormtrooper Helmet
  const hX = 40;
  const hY = -10;
  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.roundRect(hX - 16, hY - 18, 32, 30, 8);
  ctx.fill();
  ctx.stroke();

  // Dark Visor & Mouth Frown
  ctx.fillStyle = '#000000';
  ctx.fillRect(hX - 12, hY - 6, 24, 4); // Eye line
  ctx.fillRect(hX - 6, hY + 4, 12, 4); // Mouth
}

// ── 3. ANIMAL KINGDOM RIG ──────────────────────────────────────────────

function drawDuckPuppet(ctx, depthY, hipSag, elbowAngle, hasErrors, time) {
  ctx.fillStyle = 'rgba(0,0,0,0.3)';
  ctx.beginPath();
  ctx.ellipse(0, 65 - depthY * 0.4, 85, 16, 0, 0, Math.PI * 2);
  ctx.fill();

  // Sarcastic Duck Body
  ctx.fillStyle = hasErrors ? '#FBBF24' : '#FDE047';
  ctx.beginPath();
  ctx.ellipse(-20, 18 + hipSag * 0.4, 65, 26, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#CA8A04';
  ctx.lineWidth = 3;
  ctx.stroke();

  // Wings
  const wingAngle = (180 - elbowAngle) * 0.015;
  ctx.save();
  ctx.translate(-45, 15);
  ctx.rotate(-wingAngle - 0.2);
  ctx.fillStyle = '#EAB308';
  ctx.beginPath();
  ctx.ellipse(0, 0, 24, 12, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Head & Beak
  ctx.fillStyle = '#FDE047';
  ctx.beginPath();
  ctx.arc(42, -12, 20, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Red Gym Headband
  ctx.fillStyle = '#FF3E3E';
  ctx.fillRect(28, -24, 28, 7);

  // Big Eye
  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath(); ctx.arc(48, -14, 6, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#0F172A';
  ctx.beginPath(); ctx.arc(50, -14, 3, 0, Math.PI * 2); ctx.fill();

  // Orange Beak
  ctx.fillStyle = '#F97316';
  ctx.beginPath();
  ctx.ellipse(64, -8, 14, 6, 0.1, 0, Math.PI * 2);
  ctx.fill();
}

function drawBearPuppet(ctx, depthY, hipSag, elbowAngle, hasErrors, time) {
  ctx.fillStyle = 'rgba(0,0,0,0.35)';
  ctx.beginPath();
  ctx.ellipse(0, 65 - depthY * 0.4, 95, 18, 0, 0, Math.PI * 2);
  ctx.fill();

  // Grizzly Torso
  ctx.fillStyle = '#78350F';
  ctx.beginPath();
  ctx.ellipse(-15, 15 + hipSag * 0.4, 75, 34, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#451A03';
  ctx.lineWidth = 3.5;
  ctx.stroke();

  // Head
  ctx.fillStyle = '#78350F';
  ctx.beginPath();
  ctx.arc(54, -10, 24, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Snout
  ctx.fillStyle = '#B45309';
  ctx.beginPath();
  ctx.ellipse(68, -6, 12, 8, 0, 0, Math.PI * 2);
  ctx.fill();
}
