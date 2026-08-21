import { useState, useEffect } from 'react';
import { Sparkles, Flame, Volume2, ShieldCheck, Activity } from 'lucide-react';

export default function VectorPushupAnimator({
  character = 'humanoid',
  isPlaying = true,
  roastData,
  onTriggerRoast,
  isLoadingRoast,
  onVoicePlay
}) {
  const [phase, setPhase] = useState(0); // 0 (top lockout) to 1 (bottom chest depth)
  const [repCount, setRepCount] = useState(0);

  useEffect(() => {
    if (!isPlaying) return;
    let startTime = performance.now();
    let frameId;

    const loop = (now) => {
      const elapsed = (now - startTime) / 1000;
      const cycleDuration = 2.4; // 2.4s per full push-up rep
      const t = (elapsed % cycleDuration) / cycleDuration;
      
      // Biomechanical Easing: 0->0.45 descent, 0.45->0.55 bottom pause, 0.55->0.95 ascent, 0.95->1.0 lockout
      let currentPhase = 0;
      if (t < 0.45) {
        // Descent (smooth ease-in-out)
        const subT = t / 0.45;
        currentPhase = 0.5 - 0.5 * Math.cos(Math.PI * subT);
      } else if (t < 0.55) {
        // 1s Bottom Pause
        currentPhase = 1.0;
      } else if (t < 0.92) {
        // Explosive Ascent
        const subT = (t - 0.55) / 0.37;
        currentPhase = 1.0 - (0.5 - 0.5 * Math.cos(Math.PI * subT));
      } else {
        // Lockout
        currentPhase = 0.0;
      }

      setPhase(currentPhase);
      setRepCount(Math.floor(elapsed / cycleDuration));
      frameId = requestAnimationFrame(loop);
    };

    frameId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frameId);
  }, [isPlaying]);

  // Derived Kinematic Parameters
  // Top pose: Torso at y=110, chest at y=105, hands planted at y=175
  // Bottom pose: Torso sinks to y=155, chest at y=150, elbow angle bends to 90 deg
  const sinkY = phase * 42; 
  const elbowBendX = phase * 24;
  const elbowBendY = phase * 18;
  const sweatOpacity = phase > 0.6 ? 1 : 0;
  const spineAngle = phase * 2; // subtle core stability arc

  return (
    <div className="space-y-3 w-full">
      {/* ── 2D Vector Animation Stage ── */}
      <div className="relative w-full h-[260px] bg-gradient-to-b from-slate-900 via-[#0B0F19] to-[#050811] rounded-3xl border border-slate-700/50 dark:border-zinc-800 overflow-hidden shadow-2xl flex items-center justify-center">
        
        {/* Top Badges */}
        <div className="absolute top-3 left-3 flex items-center gap-2 z-10 pointer-events-none">
          <div className="bg-black/75 backdrop-blur-md px-3 py-1 rounded-full border border-white/15 flex items-center gap-1.5 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-[10px] font-mono font-bold tracking-wider text-emerald-300 uppercase">
              2D VECTOR ENGINE • {phase > 0.8 ? '90° DEPTH' : 'LOCKOUT'}
            </span>
          </div>
        </div>

        {/* Rep Counter Badge */}
        <div className="absolute top-3 right-3 z-10 pointer-events-none">
          <div className="bg-black/75 backdrop-blur-md px-2.5 py-1 rounded-xl border border-white/10 flex items-center gap-1">
            <span className="text-[10px] font-mono text-gray-400">REPS</span>
            <span className="text-xs font-mono font-black text-orange-400">{repCount}</span>
          </div>
        </div>

        {/* Gym Floor Grid Perspective */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="floorGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#1e293b" stopOpacity="0" />
              <stop offset="100%" stopColor="#f97316" stopOpacity="0.15" />
            </linearGradient>
            <linearGradient id="shadowGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#000000" stopOpacity="0.6" />
              <stop offset="50%" stopColor="#000000" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#000000" stopOpacity="0.6" />
            </linearGradient>
          </defs>

          {/* Floor Shadow beneath athlete */}
          <ellipse 
            cx="210" 
            cy="195" 
            rx={100 + phase * 15} 
            ry={12 + phase * 6} 
            fill="url(#shadowGrad)" 
            className="transition-all duration-75"
          />

          {/* Floor Reference Line */}
          <line x1="40" y1="195" x2="380" y2="195" stroke="#334155" strokeWidth="2" strokeDasharray="4 4" />
          
          {/* Hands & Feet Targets on Floor */}
          <circle cx="120" cy="195" r="7" fill="#f97316" fillOpacity="0.3" stroke="#f97316" strokeWidth="1.5" />
          <circle cx="310" cy="195" r="6" fill="#0284c7" fillOpacity="0.3" stroke="#0284c7" strokeWidth="1.5" />
        </svg>

        {/* ── Dynamic Swappable 2D Character Rig ── */}
        <div className="relative w-[360px] h-[220px] flex items-center justify-center">
          <svg viewBox="0 0 400 240" className="w-full h-full overflow-visible">
            
            {/* ═══════════════════════════════════════════════════
                CHARACTER SKIN 1: COACH ALEX (Athletic Trainer)
            ═══════════════════════════════════════════════════ */}
            {character === 'humanoid' && (
              <g className="transition-transform duration-75">
                {/* Back Arm & Hand */}
                <path 
                  d={`M 130 ${120 + sinkY} Q ${105 - elbowBendX} ${150 + elbowBendY} 115 195`} 
                  stroke="#c2410c" strokeWidth="12" strokeLinecap="round" fill="none" 
                />
                
                {/* Legs (Straight Rigid Plank from Hips to Toes) */}
                <path 
                  d={`M 235 ${115 + sinkY} L 310 195`} 
                  stroke="#1e293b" strokeWidth="16" strokeLinecap="round" 
                />
                {/* Athletic Running Shoe */}
                <ellipse cx="315" cy="195" rx="10" ry="6" fill="#f97316" />
                <path d="M 308 198 L 322 198" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" />

                {/* Torso / Core (Athletic Blue Tank Top) */}
                <path 
                  d={`M 130 ${110 + sinkY} L 240 ${115 + sinkY}`} 
                  stroke="#0284c7" strokeWidth="24" strokeLinecap="round" 
                />
                {/* Muscle Highlight line */}
                <line 
                  x1="145" y1={106 + sinkY} 
                  x2="225" y2={111 + sinkY} 
                  stroke="#38bdf8" strokeWidth="3" strokeLinecap="round" 
                />

                {/* Head, Neck & Headband */}
                <circle cx="105" cy={98 + sinkY} r="18" fill="#fdba74" />
                {/* Hair */}
                <path d={`M 92 ${90 + sinkY} Q 105 ${78 + sinkY} 122 ${88 + sinkY} Z`} fill="#7c2d12" />
                {/* Orange Sweatband */}
                <rect x="90" y={91 + sinkY} width="30" height="6" rx="3" fill="#f97316" />
                {/* Focused Eye */}
                <ellipse cx="98" cy={98 + sinkY} rx="2.5" ry="3" fill="#1e293b" />
                {/* Smile / Exertion Mouth */}
                <path 
                  d={phase > 0.7 
                    ? `M 95 ${107 + sinkY} Q 100 ${112 + sinkY} 105 ${107 + sinkY}` 
                    : `M 95 ${106 + sinkY} L 104 ${106 + sinkY}`} 
                  stroke="#1e293b" strokeWidth="2" fill="none" strokeLinecap="round" 
                />

                {/* Sweat Drop during peak depth */}
                <path 
                  d={`M 86 ${104 + sinkY} Q 83 ${112 + sinkY} 86 ${115 + sinkY} Q 89 ${112 + sinkY} 86 ${104 + sinkY} Z`} 
                  fill="#38bdf8" 
                  opacity={sweatOpacity}
                  className="transition-opacity duration-150"
                />

                {/* Front Arm & Hand (Planted under shoulder) */}
                <path 
                  d={`M 138 ${115 + sinkY} Q ${115 - elbowBendX} ${152 + elbowBendY} 125 195`} 
                  stroke="#ea580c" strokeWidth="14" strokeLinecap="round" fill="none" 
                />
                {/* Hand Palm Grip */}
                <ellipse cx="125" cy="195" rx="8" ry="4" fill="#fdba74" />
              </g>
            )}

            {/* ═══════════════════════════════════════════════════
                CHARACTER SKIN 2: QUACK NORRIS (Sarcastic Duck)
            ═══════════════════════════════════════════════════ */}
            {character === 'duck' && (
              <g className="transition-transform duration-75">
                {/* Back Wing */}
                <path 
                  d={`M 140 ${125 + sinkY} Q ${110 - elbowBendX} ${155 + elbowBendY} 115 195`} 
                  stroke="#ca8a04" strokeWidth="12" strokeLinecap="round" fill="none" 
                />

                {/* Duck Feet on Floor */}
                <path d={`M 240 ${120 + sinkY} L 305 195`} stroke="#ea580c" strokeWidth="10" strokeLinecap="round" />
                <path d="M 295 195 L 315 195 L 308 190 Z" fill="#ea580c" />

                {/* Chubby Yellow Duck Body */}
                <ellipse cx="190" cy={120 + sinkY} rx="55" ry="24" fill="#facc15" />
                {/* Wing Contour */}
                <path 
                  d={`M 160 ${120 + sinkY} Q 190 ${135 + sinkY} 215 ${115 + sinkY}`} 
                  stroke="#eab308" strokeWidth="4" fill="none" strokeLinecap="round" 
                />

                {/* Duck Head */}
                <circle cx="125" cy={98 + sinkY} r="22" fill="#facc15" />
                {/* Sweatband */}
                <rect x="110" y={88 + sinkY} width="30" height="6" rx="3" fill="#ef4444" />
                {/* Big Cartoon Eye */}
                <circle cx="118" cy={96 + sinkY} r="6" fill="#ffffff" />
                <circle cx="116" cy={96 + sinkY} r="3" fill="#0f172a" />
                <circle cx="115" cy={94 + sinkY} r="1" fill="#ffffff" />

                {/* Orange Beak (Opens wider during pushup depth) */}
                <path 
                  d={phase > 0.6
                    ? `M 112 ${102 + sinkY} L 85 ${106 + sinkY} L 112 ${114 + sinkY} Z`
                    : `M 112 ${104 + sinkY} L 90 ${106 + sinkY} L 112 ${110 + sinkY} Z`}
                  fill="#f97316" 
                />

                {/* Front Wing Planted on Floor */}
                <path 
                  d={`M 148 ${120 + sinkY} Q ${122 - elbowBendX} ${155 + elbowBendY} 125 195`} 
                  stroke="#eab308" strokeWidth="14" strokeLinecap="round" fill="none" 
                />
                <ellipse cx="125" cy="195" rx="9" ry="5" fill="#facc15" />
              </g>
            )}

            {/* ═══════════════════════════════════════════════════
                CHARACTER SKIN 3: BRICK BRO (Lego Minifigure)
            ═══════════════════════════════════════════════════ */}
            {character === 'lego' && (
              <g className="transition-transform duration-75">
                {/* Back Plastic Arm */}
                <path 
                  d={`M 135 ${118 + sinkY} L ${110 - elbowBendX * 0.7} ${155 + elbowBendY * 0.7} L 115 195`} 
                  stroke="#b91c1c" strokeWidth="12" strokeLinejoin="miter" strokeLinecap="square" fill="none" 
                />

                {/* Lego Legs (Blue Boxy Hip & Legs) */}
                <rect x="235" y={105 + sinkY} width="70" height="22" rx="4" fill="#1d4ed8" transform={`rotate(22 235 ${105 + sinkY})`} />
                {/* Leg Stud Feet */}
                <rect x="302" y="185" width="14" height="12" rx="2" fill="#1e40af" />

                {/* Lego Torso (Trapezoid Gym Bro Tank) */}
                <path 
                  d={`M 130 ${100 + sinkY} L 230 ${106 + sinkY} L 225 ${130 + sinkY} L 135 ${128 + sinkY} Z`} 
                  fill="#dc2626" 
                />
                {/* Dumbbell Decal on Chest */}
                <rect x="165" y={112 + sinkY} width="24" height="6" rx="2" fill="#ffffff" />

                {/* Lego Cylindrical Head + Top Stud */}
                <rect x="92" y={82 + sinkY} width="30" height="24" rx="5" fill="#facc15" />
                <rect x="102" y={76 + sinkY} width="10" height="7" rx="2" fill="#facc15" />
                {/* Classic Lego Face */}
                <circle cx="99" cy={92 + sinkY} r="2.5" fill="#000000" />
                <circle cx="114" cy={92 + sinkY} r="2.5" fill="#000000" />
                <path d={`M 101 ${100 + sinkY} Q 107 ${104 + sinkY} 113 ${100 + sinkY}`} stroke="#000000" strokeWidth="2" fill="none" strokeLinecap="round" />

                {/* Front Plastic Lego Hand (Yellow C-Cup Grip) */}
                <path 
                  d={`M 142 ${114 + sinkY} L ${120 - elbowBendX * 0.7} ${156 + elbowBendY * 0.7} L 125 195`} 
                  stroke="#ef4444" strokeWidth="14" strokeLinecap="square" fill="none" 
                />
                {/* C-Clip Hand */}
                <path d="M 120 190 Q 128 190 128 198 Q 128 202 120 202" stroke="#facc15" strokeWidth="4" fill="none" strokeLinecap="round" />
              </g>
            )}

            {/* ═══════════════════════════════════════════════════
                CHARACTER SKIN 4: LORD VADER (Dark Lord of Push-ups)
            ═══════════════════════════════════════════════════ */}
            {character === 'vader' && (
              <g className="transition-transform duration-75">
                {/* Flowing Black Cape */}
                <path 
                  d={`M 125 ${95 + sinkY} Q 190 ${85 + sinkY - phase * 8} 265 ${95 + sinkY} L 275 ${125 + sinkY} Q 200 ${115 + sinkY} 135 ${120 + sinkY} Z`} 
                  fill="#090d16" stroke="#1e293b" strokeWidth="1.5" 
                />

                {/* Black Armored Legs */}
                <path d={`M 235 ${115 + sinkY} L 310 195`} stroke="#0f172a" strokeWidth="16" strokeLinecap="round" />
                {/* Shiny Sith Boots */}
                <ellipse cx="315" cy="195" rx="10" ry="6" fill="#1e293b" />

                {/* Black Chest Armor with Control Console */}
                <path d={`M 130 ${110 + sinkY} L 240 ${115 + sinkY}`} stroke="#020617" strokeWidth="26" strokeLinecap="round" />
                {/* Glowing Life Support LEDs */}
                <rect x="175" y={106 + sinkY} width="6" height="6" fill="#ef4444" className="animate-pulse" />
                <rect x="185" y={106 + sinkY} width="6" height="6" fill="#38bdf8" />
                <rect x="195" y={106 + sinkY} width="6" height="6" fill="#22c55e" />

                {/* Vader Helmet & Breath Grill */}
                <path 
                  d={`M 90 ${98 + sinkY} Q 105 ${75 + sinkY} 125 ${98 + sinkY} L 120 ${108 + sinkY} L 95 ${108 + sinkY} Z`} 
                  fill="#020617" 
                />
                <circle cx="100" cy={96 + sinkY} r="3" fill="#ef4444" />
                <path d={`M 102 ${102 + sinkY} L 112 ${102 + sinkY} L 107 ${108 + sinkY} Z`} fill="#475569" />

                {/* Front Arm & Glove on Floor */}
                <path 
                  d={`M 138 ${115 + sinkY} Q ${115 - elbowBendX} ${152 + elbowBendY} 125 195`} 
                  stroke="#0f172a" strokeWidth="14" strokeLinecap="round" fill="none" 
                />
                <ellipse cx="125" cy="195" rx="8" ry="4" fill="#1e293b" />
              </g>
            )}

          </svg>
        </div>

        {/* Floating Quick Roast Button */}
        <button
          onClick={onTriggerRoast}
          disabled={isLoadingRoast}
          className="absolute bottom-3 right-3 py-2 px-4 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 active:scale-95 text-black text-xs font-black tracking-wide shadow-xl shadow-orange-500/40 flex items-center gap-1.5 transition-all z-10 uppercase"
        >
          <Flame className={`w-3.5 h-3.5 fill-current ${isLoadingRoast ? 'animate-spin' : ''}`} />
          <span>{isLoadingRoast ? 'Roasting...' : 'Roast Form'}</span>
        </button>

        {/* Biomechanical Depth Meter */}
        <div className="absolute bottom-3 left-3 z-10 pointer-events-none">
          <div className="bg-black/80 backdrop-blur-md px-3 py-1.5 rounded-2xl border border-white/10 text-left">
            <div className="text-[9px] font-mono uppercase text-gray-400 font-bold">Standard Target</div>
            <div className="text-xs font-black text-orange-400">90° Elbow Flexion</div>
          </div>
        </div>

      </div>

      {/* ── Biomechanics Breakdown Card ── */}
      <div className="bg-slate-50 dark:bg-zinc-900/80 border border-slate-200/80 dark:border-zinc-800 rounded-2xl p-3.5 space-y-2 shadow-sm">
        <div className="flex items-center justify-between text-[11px] font-mono font-bold text-slate-500 dark:text-zinc-400">
          <span className="flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-orange-500" />
            BIOMECHANICAL CUES
          </span>
          <span className="text-emerald-500 font-bold flex items-center gap-1">
            <ShieldCheck className="w-3 h-3" />
            Verified Standard
          </span>
        </div>

        <p className="text-xs text-slate-700 dark:text-zinc-300 font-medium leading-relaxed">
          {character === 'humanoid' && 'Lower with controlled 2s cadence until chest hovers 1 inch above floor. Keep elbows at 45° arrow angle.'}
          {character === 'duck' && 'Quack your core tight! Flap down to 90 degrees without letting your tail feathers sag.'}
          {character === 'lego' && 'Snap your brick spine into a rigid 180° plane. Zero loose bricks allowed!'}
          {character === 'vader' && 'Feel the power of the dark side core tension. Sagging hips lead to failure.'}
        </p>

        <div className="grid grid-cols-2 gap-2 text-xs pt-1">
          <div className="bg-white dark:bg-zinc-800/60 p-2 rounded-xl border border-slate-100 dark:border-zinc-700/40">
            <div className="text-[10px] font-bold uppercase text-slate-400 dark:text-zinc-500 mb-0.5">Primary Focus</div>
            <div className="font-semibold text-slate-800 dark:text-zinc-200">Pectorals & Triceps</div>
          </div>
          <div className="bg-white dark:bg-zinc-800/60 p-2 rounded-xl border border-slate-100 dark:border-zinc-700/40">
            <div className="text-[10px] font-bold uppercase text-slate-400 dark:text-zinc-500 mb-0.5">Tempo Cadence</div>
            <div className="font-semibold text-slate-800 dark:text-zinc-200">2s Down • 1s Pause • 1s Up</div>
          </div>
        </div>
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
              onClick={onVoicePlay}
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
