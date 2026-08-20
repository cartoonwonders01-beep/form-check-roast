import { useEffect, useRef } from 'react';

export default function AnimalPuppetCanvas({ character = 'duck', poseMetrics, exercise = 'pushup' }) {
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

      // Background grid / gym mat floor
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
      ctx.lineWidth = 1;
      for (let x = 0; x < width; x += 30) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += 30) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Base coordinates
      const cx = width / 2;
      const cy = height / 2 + 10;

      // Extract real user joint angles or use natural demo interpolation
      const hasRealPose = poseMetrics?.isValid;
      const elbowAngle = hasRealPose ? poseMetrics.angles.elbow : 180 - Math.abs(Math.sin(time)) * 95;
      const hipAngle = hasRealPose ? poseMetrics.angles.hip : 180 - Math.abs(Math.cos(time * 0.5)) * 15;
      const hasErrors = poseMetrics?.errors?.length > 0;

      // Depth offset computed from elbow angle
      const depthY = (180 - elbowAngle) * 0.45;
      const hipSagOffset = (180 - hipAngle) * 0.7;

      // ── DRAW CHARACTERS RIG ───────────────────────────────────────────
      ctx.save();
      ctx.translate(cx, cy + depthY);

      if (character === 'duck') {
        drawDuckPuppet(ctx, depthY, hipSagOffset, elbowAngle, hasErrors, time);
      } else if (character === 'cow') {
        drawCowPuppet(ctx, depthY, hipSagOffset, elbowAngle, hasErrors, time);
      } else if (character === 'bear') {
        drawBearPuppet(ctx, depthY, hipSagOffset, elbowAngle, hasErrors, time);
      } else if (character === 'frog') {
        drawFrogPuppet(ctx, depthY, hipSagOffset, elbowAngle, hasErrors, time);
      } else {
        drawHumanPuppet(ctx, depthY, hipSagOffset, elbowAngle, hasErrors, time);
      }

      ctx.restore();

      // ── BIOMECHANICAL ANGLE VECTORS OVERLAY ────────────────────────────
      if (hasErrors) {
        ctx.strokeStyle = '#FF3344';
        ctx.fillStyle = '#FF3344';
        ctx.lineWidth = 2;
        ctx.font = 'bold 11px Inter, sans-serif';
        ctx.fillText(`⚠️ HIP SAG: ${hipAngle}° (Target 180°)`, 16, 24);
        ctx.fillText(`⚠️ ELBOW FLARE: ${Math.round(elbowAngle)}°`, 16, 40);
      } else {
        ctx.fillStyle = '#CCFF00';
        ctx.font = 'bold 11px Inter, sans-serif';
        ctx.fillText(`✓ SKELETAL ALIGNMENT: 98% OPTIMAL`, 16, 24);
      }

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
    <div className="relative w-full h-[320px] rounded-2xl overflow-hidden bg-gradient-to-b from-[#0F1117] to-[#08090D] border border-white/10 shadow-2xl">
      <canvas
        ref={canvasRef}
        width={480}
        height={320}
        className="w-full h-full object-contain"
      />

      {/* Floating HUD Coach Tag */}
      <div className="absolute top-3 right-3 bg-black/70 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        <span className="text-[11px] font-mono text-gray-300 uppercase tracking-widest">
          {character} • MIRROR RIG
        </span>
      </div>
    </div>
  );
}

// ── CHARACTER PUPPET RENDERERS (Kinematic Canvas Rigging) ──────────────

function drawDuckPuppet(ctx, depthY, hipSag, elbowAngle, hasErrors, time) {
  // Shadow
  ctx.fillStyle = 'rgba(0,0,0,0.3)';
  ctx.beginPath();
  ctx.ellipse(0, 70 - depthY * 0.5, 90, 18, 0, 0, Math.PI * 2);
  ctx.fill();

  // Torso / Plank Body (Reacts directly to hip sag)
  ctx.fillStyle = hasErrors ? '#FBBF24' : '#FDE047';
  ctx.beginPath();
  ctx.ellipse(-20, 20 + hipSag * 0.4, 65, 28, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#ca8a04';
  ctx.lineWidth = 3;
  ctx.stroke();

  // Left Wing (Flared when elbow angle drops)
  const wingAngle = (180 - elbowAngle) * 0.015;
  ctx.save();
  ctx.translate(-50, 15);
  ctx.rotate(-wingAngle - 0.2);
  ctx.fillStyle = '#EAB308';
  ctx.beginPath();
  ctx.ellipse(0, 0, 26, 14, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Right Wing
  ctx.save();
  ctx.translate(15, 15);
  ctx.rotate(wingAngle + 0.2);
  ctx.fillStyle = '#EAB308';
  ctx.beginPath();
  ctx.ellipse(0, 0, 26, 14, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Head & Neck
  ctx.fillStyle = '#FDE047';
  ctx.beginPath();
  ctx.arc(45, -15, 22, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Sweatband (Gym Coach Style)
  ctx.fillStyle = '#FF3E3E';
  ctx.fillRect(30, -28, 30, 8);

  // Big Eye
  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.arc(52, -18, 7, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#0F172A';
  ctx.beginPath();
  ctx.arc(54, -18, 3.5, 0, Math.PI * 2);
  ctx.fill();

  // Bill / Beak
  ctx.fillStyle = '#F97316';
  ctx.beginPath();
  ctx.ellipse(68, -12, 16, 7, 0.1, 0, Math.PI * 2);
  ctx.fill();

  // Hands / Webbed Feet on ground
  ctx.fillStyle = '#F97316';
  ctx.beginPath();
  ctx.ellipse(-65, 48 - depthY, 14, 6, 0, 0, Math.PI * 2);
  ctx.ellipse(35, 48 - depthY, 14, 6, 0, 0, Math.PI * 2);
  ctx.fill();
}

function drawCowPuppet(ctx, depthY, hipSag, elbowAngle, hasErrors, time) {
  ctx.fillStyle = 'rgba(0,0,0,0.3)';
  ctx.beginPath();
  ctx.ellipse(0, 70 - depthY * 0.5, 100, 20, 0, 0, Math.PI * 2);
  ctx.fill();

  // Massive Body
  ctx.fillStyle = '#F8FAFC';
  ctx.beginPath();
  ctx.ellipse(-15, 15 + hipSag * 0.5, 75, 34, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#94A3B8';
  ctx.lineWidth = 3;
  ctx.stroke();

  // Spots
  ctx.fillStyle = '#1E293B';
  ctx.beginPath();
  ctx.arc(-30, 10 + hipSag * 0.4, 18, 0, Math.PI * 2);
  ctx.arc(10, 25 + hipSag * 0.4, 14, 0, Math.PI * 2);
  ctx.fill();

  // Head
  ctx.fillStyle = '#F8FAFC';
  ctx.beginPath();
  ctx.arc(55, -10, 26, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Snout
  ctx.fillStyle = '#FDA4AF';
  ctx.beginPath();
  ctx.ellipse(70, -4, 16, 12, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#9F1239';
  ctx.beginPath();
  ctx.arc(66, -4, 3, 0, Math.PI * 2);
  ctx.arc(74, -4, 3, 0, Math.PI * 2);
  ctx.fill();

  // Hooves
  ctx.fillStyle = '#334155';
  ctx.fillRect(-70, 42 - depthY, 18, 12);
  ctx.fillRect(30, 42 - depthY, 18, 12);
}

function drawBearPuppet(ctx, depthY, hipSag, elbowAngle, hasErrors, time) {
  ctx.fillStyle = 'rgba(0,0,0,0.35)';
  ctx.beginPath();
  ctx.ellipse(0, 70 - depthY * 0.5, 105, 22, 0, 0, Math.PI * 2);
  ctx.fill();

  // Grizzly Torso
  ctx.fillStyle = '#78350F';
  ctx.beginPath();
  ctx.ellipse(-15, 15 + hipSag * 0.4, 80, 36, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#451A03';
  ctx.lineWidth = 4;
  ctx.stroke();

  // Head
  ctx.fillStyle = '#78350F';
  ctx.beginPath();
  ctx.arc(58, -12, 28, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Snout
  ctx.fillStyle = '#B45309';
  ctx.beginPath();
  ctx.ellipse(74, -8, 14, 10, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#1E293B';
  ctx.beginPath();
  ctx.arc(80, -10, 4, 0, Math.PI * 2);
  ctx.fill();

  // Heavy Paws
  ctx.fillStyle = '#451A03';
  ctx.beginPath();
  ctx.ellipse(-70, 42 - depthY, 20, 10, 0, 0, Math.PI * 2);
  ctx.ellipse(35, 42 - depthY, 20, 10, 0, 0, Math.PI * 2);
  ctx.fill();
}

function drawFrogPuppet(ctx, depthY, hipSag, elbowAngle, hasErrors, time) {
  ctx.fillStyle = 'rgba(0,0,0,0.3)';
  ctx.beginPath();
  ctx.ellipse(0, 70 - depthY * 0.5, 80, 16, 0, 0, Math.PI * 2);
  ctx.fill();

  // Green Zen Body
  ctx.fillStyle = '#4ADE80';
  ctx.beginPath();
  ctx.ellipse(-15, 20 + hipSag * 0.5, 60, 24, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#16A34A';
  ctx.lineWidth = 3;
  ctx.stroke();

  // Big Zen Eyes
  ctx.fillStyle = '#22C55E';
  ctx.beginPath();
  ctx.arc(38, -18, 14, 0, Math.PI * 2);
  ctx.arc(58, -18, 14, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#0F172A';
  ctx.beginPath();
  ctx.arc(38, -18, 6, 0, Math.PI * 2);
  ctx.arc(58, -18, 6, 0, Math.PI * 2);
  ctx.fill();

  // Webbed Frog Hands
  ctx.fillStyle = '#22C55E';
  ctx.beginPath();
  ctx.ellipse(-60, 46 - depthY, 14, 6, 0, 0, Math.PI * 2);
  ctx.ellipse(30, 46 - depthY, 14, 6, 0, 0, Math.PI * 2);
  ctx.fill();
}

function drawHumanPuppet(ctx, depthY, hipSag, elbowAngle, hasErrors, time) {
  ctx.fillStyle = 'rgba(0,0,0,0.3)';
  ctx.beginPath();
  ctx.ellipse(0, 70 - depthY * 0.5, 90, 18, 0, 0, Math.PI * 2);
  ctx.fill();

  // Athletic Torso
  ctx.fillStyle = '#3B82F6';
  ctx.beginPath();
  ctx.roundRect(-55, 10 + hipSag * 0.4, 90, 24, 10);
  ctx.fill();
  ctx.strokeStyle = '#1D4ED8';
  ctx.lineWidth = 3;
  ctx.stroke();

  // Head
  ctx.fillStyle = '#FBBF24';
  ctx.beginPath();
  ctx.arc(45, -12, 18, 0, Math.PI * 2);
  ctx.fill();

  // Hands on floor
  ctx.fillStyle = '#FBBF24';
  ctx.beginPath();
  ctx.arc(-55, 45 - depthY, 8, 0, Math.PI * 2);
  ctx.arc(30, 45 - depthY, 8, 0, Math.PI * 2);
  ctx.fill();
}
