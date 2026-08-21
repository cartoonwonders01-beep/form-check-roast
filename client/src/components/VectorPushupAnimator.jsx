import { useState, useEffect } from 'react';
import { Sparkles, Flame, Volume2, ShieldCheck, Activity, Zap } from 'lucide-react';

export default function VectorPushupAnimator({
  character = 'humanoid',
  isPlaying = true,
  roastData,
  onTriggerRoast,
  isLoadingRoast,
  onVoicePlay
}) {
  const [phase, setPhase] = useState(0); // 0 (lockout) to 1 (90° bottom depth)
  const [repCount, setRepCount] = useState(0);
  const [muscleGlow, setMuscleGlow] = useState(false);

  useEffect(() => {
    if (!isPlaying) return;
    let startTime = performance.now();
    let frameId;

    const loop = (now) => {
      const elapsed = (now - startTime) / 1000;
      const cycleDuration = 2.2; // 2.2s per authentic cadence push-up
      const t = (elapsed % cycleDuration) / cycleDuration;
      
      // Biomechanical Easing Curve:
      // 0.00 - 0.42: Smooth Controlled Descent
      // 0.42 - 0.58: 90° Bottom Isometric Pause & Muscle Flex
      // 0.58 - 0.90: Explosive Upward Drive
      // 0.90 - 1.00: Lockout & Reset
      let currentPhase = 0;
      if (t < 0.42) {
        const p = t / 0.42;
        currentPhase = 0.5 - 0.5 * Math.cos(Math.PI * p); // smooth drop
      } else if (t < 0.58) {
        currentPhase = 1.0; // bottom hold
      } else if (t < 0.90) {
        const p = (t - 0.58) / 0.32;
        currentPhase = 1.0 - (0.5 - 0.5 * Math.cos(Math.PI * p)); // explosive drive
      } else {
        currentPhase = 0.0;
      }

      setPhase(currentPhase);
      setMuscleGlow(currentPhase > 0.7);
      setRepCount(Math.floor(elapsed / cycleDuration));
      frameId = requestAnimationFrame(loop);
    };

    frameId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frameId);
  }, [isPlaying]);

  // Derived Kinematic Offsets
  // Fixed Ground Line at Y = 195
  // Planted Hands fixed at X=120, Y=195 (Zero sliding)
  // Planted Toes fixed at X=320, Y=195 (Zero sliding)
  const sinkY = phase * 48; 
  const shoulderX = 135 - phase * 6;
  const shoulderY = 115 + sinkY;
  
  // Elbow Kinematics: Hinging outward to 45° arrow angle
  const elbowX = 108 - phase * 32;
  const elbowY = 145 + sinkY * 0.7;

  // Hip & Spine line (Rigid neutral plank)
  const hipX = 240 - phase * 4;
  const hipY = 125 + sinkY;

  // Head Position (Lead neck alignment)
  const headX = 105 - phase * 8;
  const headY = 98 + sinkY;

  return (
    <div className="space-y-3 w-full">
      {/* ── Vector Studio Canvas ── */}
      <div className="relative w-full h-[270px] bg-gradient-to-b from-slate-950 via-[#0B0F19] to-[#040711] rounded-3xl border border-slate-700/60 dark:border-zinc-800 overflow-hidden shadow-2xl flex items-center justify-center">
        
        {/* Studio Lighting Ambient Glow */}
        <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-80 h-40 bg-orange-500/15 blur-3xl rounded-full pointer-events-none" />
        {muscleGlow && (
          <div className="absolute inset-0 bg-orange-500/5 transition-opacity duration-200 pointer-events-none" />
        )}

        {/* Top Badges */}
        <div className="absolute top-3 left-3 flex items-center gap-2 z-10 pointer-events-none">
          <div className="bg-black/80 backdrop-blur-md px-3 py-1 rounded-full border border-white/15 flex items-center gap-1.5 shadow-sm">
            <span className={`w-2 h-2 rounded-full ${phase > 0.85 ? 'bg-orange-400 animate-ping' : 'bg-emerald-400'}`} />
            <span className="text-[10px] font-mono font-bold tracking-wider text-white uppercase">
              {phase > 0.85 ? '🔥 90° DEPTH HOLD' : 'LOCKED PLANK'}
            </span>
          </div>
        </div>

        {/* Rep Counter Badge */}
        <div className="absolute top-3 right-3 z-10 pointer-events-none">
          <div className="bg-black/80 backdrop-blur-md px-3 py-1 rounded-xl border border-white/15 flex items-center gap-1.5 shadow-sm">
            <Zap className="w-3.5 h-3.5 text-orange-400 fill-current" />
            <span className="text-xs font-mono font-black text-white">{repCount} <span className="text-[9px] text-gray-400 font-normal">REPS</span></span>
          </div>
        </div>

        {/* Gym Floor Grid & Realistic Soft Shadow */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <radialGradient id="softShadow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#000000" stopOpacity="0.85" />
              <stop offset="60%" stopColor="#000000" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#000000" stopOpacity="0" />
            </radialGradient>
            <linearGradient id="gridLineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#f97316" stopOpacity="0" />
              <stop offset="50%" stopColor="#f97316" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#f97316" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Dynamic Floor Shadow beneath athlete that expands at bottom depth */}
          <ellipse 
            cx="215" 
            cy="198" 
            rx={95 + phase * 22} 
            ry={12 + phase * 6} 
            fill="url(#softShadow)" 
          />

          {/* Floor Alignment Grid */}
          <line x1="30" y1="198" x2="370" y2="198" stroke="#334155" strokeWidth="2" strokeDasharray="5 5" />
          <line x1="100" y1="198" x2="340" y2="198" stroke="url(#gridLineGrad)" strokeWidth="2" />
          
          {/* Hand Palm Anchor Target */}
          <circle cx="120" cy="198" r="8" fill="#f97316" fillOpacity="0.25" stroke="#f97316" strokeWidth="1.5" />
          <circle cx="120" cy="198" r="3" fill="#f97316" />

          {/* Toe Pivot Anchor Target */}
          <circle cx="320" cy="198" r="7" fill="#0284c7" fillOpacity="0.25" stroke="#0284c7" strokeWidth="1.5" />
          <circle cx="320" cy="198" r="2.5" fill="#0284c7" />
        </svg>

        {/* ── Studio Character Rig ── */}
        <div className="relative w-[380px] h-[240px] flex items-center justify-center">
          <svg viewBox="0 0 400 240" className="w-full h-full overflow-visible">
            
            {/* ═══════════════════════════════════════════════════════════════════════
                SKIN 1: COACH ALEX (High-Definition Athletic Vector Trainer)
            ═══════════════════════════════════════════════════════════════════════ */}
            {character === 'humanoid' && (
              <g>
                {/* Back Arm (Bicep & Forearm) */}
                <path 
                  d={`M ${shoulderX - 5} ${shoulderY + 5} Q ${elbowX - 5} ${elbowY + 4} 115 198`} 
                  stroke="#c2410c" strokeWidth="16" strokeLinecap="round" strokeLinejoin="round" fill="none" 
                />

                {/* Back Leg (Straight Rigid Kinetic Chain) */}
                <path 
                  d={`M ${hipX} ${hipY} L 318 198`} 
                  stroke="#1e293b" strokeWidth="18" strokeLinecap="round" 
                />
                {/* Athletic Sneaker (Back foot) */}
                <ellipse cx="320" cy="198" rx="11" ry="6" fill="#f97316" />
                <path d="M 312 201 L 328 201" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" />

                {/* Athletic Shorts */}
                <path 
                  d={`M ${hipX - 15} ${hipY - 8} L ${hipX + 35} ${hipY - 2} L ${hipX + 25} ${hipY + 18} L ${hipX - 18} ${hipY + 12} Z`} 
                  fill="#0f172a" stroke="#334155" strokeWidth="1.5" 
                />

                {/* Torso / Core (Form-fitting Blue Athletic Tank) */}
                <path 
                  d={`M ${shoulderX} ${shoulderY} L ${hipX} ${hipY}`} 
                  stroke="#0284c7" strokeWidth="28" strokeLinecap="round" 
                />
                {/* Chest & Lat Shading */}
                <path 
                  d={`M ${shoulderX + 5} ${shoulderY - 5} L ${hipX - 10} ${hipY - 2}`} 
                  stroke="#0369a1" strokeWidth="12" strokeLinecap="round" 
                />
                {/* Athletic Chest Decal Line */}
                <line 
                  x1={shoulderX + 15} y1={shoulderY - 4} 
                  x2={hipX - 25} y2={hipY - 1} 
                  stroke="#38bdf8" strokeWidth="3" strokeLinecap="round" 
                />

                {/* Muscular Neck */}
                <path d={`M ${shoulderX - 10} ${shoulderY - 6} L ${headX + 5} ${headY + 6}`} stroke="#fdba74" strokeWidth="12" strokeLinecap="round" />

                {/* Head with Stylized Jawline */}
                <circle cx={headX} cy={headY} r="19" fill="#fdba74" stroke="#ea580c" strokeWidth="1" />
                {/* Athletic Brown Hair Tuft */}
                <path d={`M ${headX - 15} ${headY - 8} Q ${headX} ${headY - 22} ${headX + 18} ${headY - 8} Q ${headX + 5} ${headY - 14} ${headX - 12} ${headY - 8} Z`} fill="#7c2d12" />
                
                {/* Orange Champion Sweatband */}
                <rect x={headX - 17} y={headY - 7} width="34" height="7" rx="3.5" fill="#f97316" stroke="#ea580c" strokeWidth="1" />
                
                {/* Determined Eyes (Squints tightly during bottom 90° hold) */}
                {phase > 0.75 ? (
                  <path d={`M ${headX - 10} ${headY + 2} L ${headX - 3} ${headY + 2}`} stroke="#1e293b" strokeWidth="2.5" strokeLinecap="round" />
                ) : (
                  <>
                    <ellipse cx={headX - 6} cy={headY + 2} rx="2.5" ry="3" fill="#1e293b" />
                    <circle cx={headX - 7} cy={headY + 1} r="1" fill="#ffffff" />
                  </>
                )}

                {/* Mouth (Teeth grit at bottom, breathing out at top) */}
                {phase > 0.75 ? (
                  <path d={`M ${headX - 8} ${headY + 10} L ${headX + 2} ${headY + 10}`} stroke="#1e293b" strokeWidth="2.5" strokeLinecap="round" />
                ) : (
                  <path d={`M ${headX - 8} ${headY + 9} Q ${headX - 3} ${headY + 13} ${headX + 2} ${headY + 9}`} stroke="#1e293b" strokeWidth="2" fill="none" strokeLinecap="round" />
                )}

                {/* Flying Sweat Drop during heavy exertion */}
                {phase > 0.65 && (
                  <g className="animate-bounce">
                    <circle cx={headX - 22} cy={headY + 8} r="3" fill="#38bdf8" />
                    <circle cx={headX - 28} cy={headY + 14} r="2" fill="#38bdf8" opacity="0.7" />
                  </g>
                )}

                {/* Front Arm (Primary Load Bearing Kinetic Hinge) */}
                <path 
                  d={`M ${shoulderX} ${shoulderY} Q ${elbowX} ${elbowY} 122 198`} 
                  stroke="#ea580c" strokeWidth="17" strokeLinecap="round" strokeLinejoin="round" fill="none" 
                />
                {/* Tricep Muscle Flex Contour */}
                {muscleGlow && (
                  <path 
                    d={`M ${shoulderX - 2} ${shoulderY} Q ${elbowX + 4} ${elbowY - 4} 122 198`} 
                    stroke="#fed7aa" strokeWidth="4" strokeLinecap="round" fill="none" 
                  />
                )}
                {/* Planted Hand Palm Grip */}
                <ellipse cx="122" cy="198" rx="9" ry="5" fill="#fdba74" stroke="#c2410c" strokeWidth="1" />
              </g>
            )}

            {/* ═══════════════════════════════════════════════════════════════════════
                SKIN 2: QUACK NORRIS (Disney-Grade Cartoon Fitness Duck)
            ═══════════════════════════════════════════════════════════════════════ */}
            {character === 'duck' && (
              <g>
                {/* Back Wing */}
                <path 
                  d={`M ${shoulderX} ${shoulderY + 6} Q ${elbowX - 8} ${elbowY + 6} 115 198`} 
                  stroke="#ca8a04" strokeWidth="15" strokeLinecap="round" fill="none" 
                />

                {/* Webbed Feet on Floor */}
                <path d={`M ${hipX} ${hipY + 5} L 315 198`} stroke="#ea580c" strokeWidth="11" strokeLinecap="round" />
                <path d="M 302 198 L 326 198 L 316 190 Z" fill="#f97316" stroke="#c2410c" strokeWidth="1" />

                {/* Plump Yellow Duck Torso */}
                <ellipse cx={(shoulderX + hipX) / 2} cy={(shoulderY + hipY) / 2} rx="62" ry="26" fill="#facc15" stroke="#eab308" strokeWidth="2" />
                {/* Feathery Tail Tuft */}
                <path d={`M ${hipX + 35} ${hipY - 10} Q ${hipX + 55} ${hipY - 20} ${hipX + 45} ${hipY} Z`} fill="#facc15" stroke="#eab308" strokeWidth="1.5" />

                {/* Duck Head */}
                <circle cx={headX} cy={headY} r="24" fill="#facc15" stroke="#eab308" strokeWidth="2" />
                
                {/* Red Karate Sweatband */}
                <rect x={headX - 22} y={headY - 11} width="44" height="8" rx="4" fill="#ef4444" stroke="#b91c1c" strokeWidth="1" />
                {/* Sweatband Knot & Ribbon Fluttering */}
                <path d={`M ${headX + 20} ${headY - 8} Q ${headX + 35} ${headY - 18 - phase * 6} ${headX + 32} ${headY - 4}`} fill="none" stroke="#ef4444" strokeWidth="4" strokeLinecap="round" />

                {/* Expressive Cartoon Eye */}
                <circle cx={headX - 8} cy={headY - 2} r="7.5" fill="#ffffff" stroke="#713f12" strokeWidth="1" />
                <circle cx={headX - 9} cy={headY - 2} r="3.5" fill="#0f172a" />
                <circle cx={headX - 11} cy={headY - 4} r="1.5" fill="#ffffff" />

                {/* Wide Orange Beak (Quacking Open on Pushup Bottom Hold) */}
                {phase > 0.6 ? (
                  <path 
                    d={`M ${headX - 12} ${headY + 4} L ${headX - 42} ${headY + 8} L ${headX - 12} ${headY + 18} Z`} 
                    fill="#f97316" stroke="#c2410c" strokeWidth="1.5" 
                  />
                ) : (
                  <path 
                    d={`M ${headX - 12} ${headY + 5} L ${headX - 38} ${headY + 8} L ${headX - 12} ${headY + 13} Z`} 
                    fill="#f97316" stroke="#c2410c" strokeWidth="1.5" 
                  />
                )}

                {/* Flying Feather Pop during bottom hold */}
                {phase > 0.75 && (
                  <g className="animate-spin">
                    <ellipse cx={headX - 35} cy={headY - 15} rx="6" ry="3" fill="#fef08a" stroke="#ca8a04" strokeWidth="1" transform="rotate(-30)" />
                  </g>
                )}

                {/* Front Wing Planted on Ground */}
                <path 
                  d={`M ${shoulderX + 5} ${shoulderY} Q ${elbowX + 4} ${elbowY + 2} 122 198`} 
                  stroke="#eab308" strokeWidth="17" strokeLinecap="round" fill="none" 
                />
                <ellipse cx="122" cy="198" rx="10" ry="5" fill="#facc15" stroke="#ca8a04" strokeWidth="1" />
              </g>
            )}

            {/* ═══════════════════════════════════════════════════════════════════════
                SKIN 3: BRICK BRO (3D-Shaded Lego Minifig Gym Rat)
            ═══════════════════════════════════════════════════════════════════════ */}
            {character === 'lego' && (
              <g>
                {/* Back Red Plastic Arm */}
                <path 
                  d={`M ${shoulderX} ${shoulderY + 6} L ${elbowX - 4} ${elbowY + 8} L 115 198`} 
                  stroke="#991b1b" strokeWidth="15" strokeLinejoin="miter" strokeLinecap="square" fill="none" 
                />

                {/* Blue Lego Box Legs */}
                <rect x={hipX - 10} y={hipY - 12} width="85" height="26" rx="4" fill="#1d4ed8" stroke="#1e3a8a" strokeWidth="2" transform={`rotate(20 ${hipX} ${hipY})`} />
                {/* Leg Stud Pegs */}
                <rect x="306" y="186" width="16" height="13" rx="2" fill="#1e40af" stroke="#172554" strokeWidth="1" />

                {/* Red Trapezoid Lego Torso */}
                <path 
                  d={`M ${shoulderX - 8} ${shoulderY - 14} L ${hipX + 10} ${hipY - 8} L ${hipX + 4} ${hipY + 16} L ${shoulderX - 4} ${shoulderY + 14} Z`} 
                  fill="#dc2626" stroke="#991b1b" strokeWidth="2" 
                />
                {/* Dumbbell Decal Printed on Chest */}
                <rect x={(shoulderX + hipX)/2 - 12} y={(shoulderY + hipY)/2 - 4} width="24" height="6" rx="2" fill="#ffffff" />
                <circle cx={(shoulderX + hipX)/2 - 12} cy={(shoulderY + hipY)/2 - 1} r="4" fill="#ffffff" />
                <circle cx={(shoulderX + hipX)/2 + 12} cy={(shoulderY + hipY)/2 - 1} r="4" fill="#ffffff" />

                {/* Yellow Cylindrical Minifig Head + Top Stud */}
                <rect x={headX - 16} y={headY - 12} width="32" height="24" rx="5" fill="#facc15" stroke="#ca8a04" strokeWidth="2" />
                <rect x={headX - 6} y={headY - 18} width="12" height="7" rx="2" fill="#facc15" stroke="#ca8a04" strokeWidth="1.5" />
                
                {/* Classic Lego Face (Big Smile vs Concentrating Face) */}
                <circle cx={headX - 8} cy={headY - 2} r="2.5" fill="#000000" />
                <circle cx={headX + 7} cy={headY - 2} r="2.5" fill="#000000" />
                {phase > 0.7 ? (
                  <path d={`M ${headX - 6} ${headY + 6} L ${headX + 5} ${headY + 6}`} stroke="#000000" strokeWidth="2.5" strokeLinecap="round" />
                ) : (
                  <path d={`M ${headX - 6} ${headY + 5} Q ${headX} ${headY + 10} ${headX + 5} ${headY + 5}`} stroke="#000000" strokeWidth="2" fill="none" strokeLinecap="round" />
                )}

                {/* Front Red Plastic Arm & Yellow C-Clip Hand */}
                <path 
                  d={`M ${shoulderX} ${shoulderY} L ${elbowX + 4} ${elbowY + 4} L 122 198`} 
                  stroke="#ef4444" strokeWidth="16" strokeLinecap="square" strokeLinejoin="miter" fill="none" 
                />
                {/* Yellow C-Cup Grip clamped on floor */}
                <path d="M 116 192 Q 126 192 126 200 Q 126 205 116 205" stroke="#facc15" strokeWidth="5" fill="none" strokeLinecap="round" />
              </g>
            )}

            {/* ═══════════════════════════════════════════════════════════════════════
                SKIN 4: DARTH REPS (Sith Lord of Core Stability)
            ═══════════════════════════════════════════════════════════════════════ */}
            {character === 'vader' && (
              <g>
                {/* Flowing Sith Cloak (Drapes down to floor when sinking) */}
                <path 
                  d={`M ${shoulderX - 5} ${shoulderY - 14} Q ${hipX} ${hipY - 20 - phase * 10} ${hipX + 75} ${hipY - 4} L ${hipX + 85} ${hipY + 22} Q ${hipX} ${hipY + 12} ${shoulderX} ${shoulderY + 12} Z`} 
                  fill="#030712" stroke="#1f2937" strokeWidth="2" 
                />

                {/* Armored Sith Legs */}
                <path d={`M ${hipX} ${hipY} L 318 198`} stroke="#0f172a" strokeWidth="19" strokeLinecap="round" />
                {/* Glossy Black Sith Boots */}
                <ellipse cx="320" cy="198" rx="11" ry="6" fill="#1e293b" stroke="#020617" strokeWidth="1" />

                {/* Black Titanium Chestplate with Life Support LEDs */}
                <path d={`M ${shoulderX} ${shoulderY} L ${hipX} ${hipY}`} stroke="#090d16" strokeWidth="30" strokeLinecap="round" />
                <rect x={(shoulderX + hipX)/2 - 12} y={(shoulderY + hipY)/2 - 6} width="24" height="12" rx="3" fill="#111827" stroke="#374151" strokeWidth="1" />
                {/* Glowing Console Buttons */}
                <rect x={(shoulderX + hipX)/2 - 9} y={(shoulderY + hipY)/2 - 3} width="5" height="6" fill="#ef4444" className="animate-pulse" />
                <rect x={(shoulderX + hipX)/2 - 2} y={(shoulderY + hipY)/2 - 3} width="5" height="6" fill="#38bdf8" />
                <rect x={(shoulderX + hipX)/2 + 5} y={(shoulderY + hipY)/2 - 3} width="5" height="6" fill="#22c55e" />

                {/* Iconic Vader Helmet & Breath Mask */}
                <path 
                  d={`M ${headX - 16} ${headY + 2} Q ${headX} ${headY - 24} ${headX + 18} ${headY + 2} L ${headX + 12} ${headY + 15} L ${headX - 10} ${headY + 15} Z`} 
                  fill="#020617" stroke="#1f2937" strokeWidth="1.5" 
                />
                {/* Crimson Triangular Lenses */}
                <polygon points={`${headX - 8},${headY - 2} ${headX - 2},${headY - 2} ${headX - 5},${headY + 3}`} fill="#ef4444" className="animate-pulse" />
                {/* Silver Breath Grill */}
                <polygon points={`${headX - 5},${headY + 7} ${headX + 3},${headY + 7} ${headX - 1},${headY + 14}`} fill="#64748b" />

                {/* Front Gauntlet Arm Planted on Ground */}
                <path 
                  d={`M ${shoulderX} ${shoulderY} Q ${elbowX} ${elbowY} 122 198`} 
                  stroke="#0f172a" strokeWidth="18" strokeLinecap="round" fill="none" 
                />
                {/* Sith Glove */}
                <ellipse cx="122" cy="198" rx="10" ry="5" fill="#1e293b" stroke="#000000" strokeWidth="1" />
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
