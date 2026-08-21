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

  // Derived Kinematics
  const sinkY = phase * 48; 
  const shoulderX = 135 - phase * 6;
  const shoulderY = 115 + sinkY;
  
  // Elbow Kinematics
  const elbowX = 108 - phase * 32;
  const elbowY = 145 + sinkY * 0.7;

  // Hip & Spine
  const hipX = 240 - phase * 4;
  const hipY = 125 + sinkY;

  // Head Position
  const headX = 105 - phase * 8;
  const headY = 98 + sinkY;

  // Dynamic Background Styles based on Character (e.g. Darth Vader gets High-Contrast Imperial Light Hangar)
  const isVader = character === 'vader';

  return (
    <div className="space-y-3 w-full">
      {/* ── Vector Studio Canvas ── */}
      <div className={`relative w-full h-[270px] rounded-3xl border overflow-hidden shadow-2xl flex items-center justify-center transition-all duration-500 ${
        isVader 
          ? 'bg-gradient-to-b from-slate-100 via-slate-200 to-slate-300 border-red-500/40 text-slate-900 shadow-red-950/20' 
          : 'bg-gradient-to-b from-slate-950 via-[#0B0F19] to-[#040711] border-slate-700/60 dark:border-zinc-800 text-white'
      }`}>
        
        {/* Studio Lighting Ambient Glow */}
        {isVader ? (
          <>
            {/* Imperial Hangar Light Panels for crisp high contrast against black armor */}
            <div className="absolute inset-0 bg-[radial-gradient(#94a3b8_1px,transparent_1px)] [background-size:16px_16px] opacity-40 pointer-events-none" />
            <div className="absolute top-0 left-0 right-0 h-10 bg-gradient-to-b from-red-500/20 to-transparent pointer-events-none" />
            {/* Imperial Red Warning Pillars */}
            <div className="absolute left-4 top-10 bottom-16 w-1.5 bg-red-600/70 rounded-full shadow-[0_0_12px_rgba(239,68,68,0.8)] pointer-events-none" />
            <div className="absolute right-4 top-10 bottom-16 w-1.5 bg-red-600/70 rounded-full shadow-[0_0_12px_rgba(239,68,68,0.8)] pointer-events-none" />
          </>
        ) : (
          <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-80 h-40 bg-orange-500/15 blur-3xl rounded-full pointer-events-none" />
        )}

        {/* Top Badges */}
        <div className="absolute top-3 left-3 flex items-center gap-2 z-10 pointer-events-none">
          <div className={`backdrop-blur-md px-3 py-1 rounded-full border flex items-center gap-1.5 shadow-sm ${
            isVader 
              ? 'bg-white/90 border-slate-300 text-slate-900' 
              : 'bg-black/80 border-white/15 text-white'
          }`}>
            <span className={`w-2 h-2 rounded-full ${
              phase > 0.85 
                ? (isVader ? 'bg-red-600 animate-ping' : 'bg-orange-400 animate-ping') 
                : (isVader ? 'bg-red-500' : 'bg-emerald-400')
            }`} />
            <span className="text-[10px] font-mono font-bold tracking-wider uppercase">
              {isVader ? 'SITH PROTOCOL • 90°' : (phase > 0.85 ? '🔥 90° DEPTH HOLD' : 'LOCKED PLANK')}
            </span>
          </div>
        </div>

        {/* Rep Counter Badge */}
        <div className="absolute top-3 right-3 z-10 pointer-events-none">
          <div className={`backdrop-blur-md px-3 py-1 rounded-xl border flex items-center gap-1.5 shadow-sm ${
            isVader 
              ? 'bg-white/90 border-slate-300 text-slate-900' 
              : 'bg-black/80 border-white/15 text-white'
          }`}>
            <Zap className={`w-3.5 h-3.5 fill-current ${isVader ? 'text-red-600' : 'text-orange-400'}`} />
            <span className="text-xs font-mono font-black">{repCount} <span className="text-[9px] text-gray-500 font-normal">REPS</span></span>
          </div>
        </div>

        {/* Gym Floor Grid & Realistic Soft Shadow */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <radialGradient id="softShadow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#000000" stopOpacity={isVader ? 0.65 : 0.85} />
              <stop offset="60%" stopColor="#000000" stopOpacity={isVader ? 0.25 : 0.4} />
              <stop offset="100%" stopColor="#000000" stopOpacity="0" />
            </radialGradient>
            <linearGradient id="gridLineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor={isVader ? '#ef4444' : '#f97316'} stopOpacity="0" />
              <stop offset="50%" stopColor={isVader ? '#ef4444' : '#f97316'} stopOpacity="0.4" />
              <stop offset="100%" stopColor={isVader ? '#ef4444' : '#f97316'} stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Dynamic Floor Shadow */}
          <ellipse 
            cx="215" 
            cy="198" 
            rx={95 + phase * 22} 
            ry={12 + phase * 6} 
            fill="url(#softShadow)" 
          />

          {/* Floor Alignment Grid */}
          <line x1="30" y1="198" x2="370" y2="198" stroke={isVader ? '#94a3b8' : '#334155'} strokeWidth="2" strokeDasharray="5 5" />
          <line x1="100" y1="198" x2="340" y2="198" stroke="url(#gridLineGrad)" strokeWidth="2" />
          
          {/* Hand Palm Anchor Target */}
          <circle cx="120" cy="198" r="8" fill={isVader ? '#ef4444' : '#f97316'} fillOpacity="0.25" stroke={isVader ? '#ef4444' : '#f97316'} strokeWidth="1.5" />
          <circle cx="120" cy="198" r="3" fill={isVader ? '#ef4444' : '#f97316'} />

          {/* Toe Pivot Anchor Target */}
          <circle cx="320" cy="198" r="7" fill={isVader ? '#ef4444' : '#0284c7'} fillOpacity="0.25" stroke={isVader ? '#ef4444' : '#0284c7'} strokeWidth="1.5" />
          <circle cx="320" cy="198" r="2.5" fill={isVader ? '#ef4444' : '#0284c7'} />
        </svg>

        {/* ── Studio Character Rig ── */}
        <div className="relative w-[380px] h-[240px] flex items-center justify-center">
          <svg viewBox="0 0 400 240" className="w-full h-full overflow-visible">
            
            {/* ═══════════════════════════════════════════════════════════════════════
                SKIN 1: COACH ALEX (High-Definition Athletic Vector Trainer)
            ═══════════════════════════════════════════════════════════════════════ */}
            {character === 'humanoid' && (
              <g>
                <path 
                  d={`M ${shoulderX - 5} ${shoulderY + 5} Q ${elbowX - 5} ${elbowY + 4} 115 198`} 
                  stroke="#c2410c" strokeWidth="16" strokeLinecap="round" strokeLinejoin="round" fill="none" 
                />

                <path 
                  d={`M ${hipX} ${hipY} L 318 198`} 
                  stroke="#1e293b" strokeWidth="18" strokeLinecap="round" 
                />
                <ellipse cx="320" cy="198" rx="11" ry="6" fill="#f97316" />
                <path d="M 312 201 L 328 201" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" />

                <path 
                  d={`M ${hipX - 15} ${hipY - 8} L ${hipX + 35} ${hipY - 2} L ${hipX + 25} ${hipY + 18} L ${hipX - 18} ${hipY + 12} Z`} 
                  fill="#0f172a" stroke="#334155" strokeWidth="1.5" 
                />

                <path 
                  d={`M ${shoulderX} ${shoulderY} L ${hipX} ${hipY}`} 
                  stroke="#0284c7" strokeWidth="28" strokeLinecap="round" 
                />
                <path 
                  d={`M ${shoulderX + 5} ${shoulderY - 5} L ${hipX - 10} ${hipY - 2}`} 
                  stroke="#0369a1" strokeWidth="12" strokeLinecap="round" 
                />
                <line 
                  x1={shoulderX + 15} y1={shoulderY - 4} 
                  x2={hipX - 25} y2={hipY - 1} 
                  stroke="#38bdf8" strokeWidth="3" strokeLinecap="round" 
                />

                <path d={`M ${shoulderX - 10} ${shoulderY - 6} L ${headX + 5} ${headY + 6}`} stroke="#fdba74" strokeWidth="12" strokeLinecap="round" />

                <circle cx={headX} cy={headY} r="19" fill="#fdba74" stroke="#ea580c" strokeWidth="1" />
                <path d={`M ${headX - 15} ${headY - 8} Q ${headX} ${headY - 22} ${headX + 18} ${headY - 8} Q ${headX + 5} ${headY - 14} ${headX - 12} ${headY - 8} Z`} fill="#7c2d12" />
                
                <rect x={headX - 17} y={headY - 7} width="34" height="7" rx="3.5" fill="#f97316" stroke="#ea580c" strokeWidth="1" />
                
                {phase > 0.75 ? (
                  <path d={`M ${headX - 10} ${headY + 2} L ${headX - 3} ${headY + 2}`} stroke="#1e293b" strokeWidth="2.5" strokeLinecap="round" />
                ) : (
                  <>
                    <ellipse cx={headX - 6} cy={headY + 2} rx="2.5" ry="3" fill="#1e293b" />
                    <circle cx={headX - 7} cy={headY + 1} r="1" fill="#ffffff" />
                  </>
                )}

                {phase > 0.75 ? (
                  <path d={`M ${headX - 8} ${headY + 10} L ${headX + 2} ${headY + 10}`} stroke="#1e293b" strokeWidth="2.5" strokeLinecap="round" />
                ) : (
                  <path d={`M ${headX - 8} ${headY + 9} Q ${headX - 3} ${headY + 13} ${headX + 2} ${headY + 9}`} stroke="#1e293b" strokeWidth="2" fill="none" strokeLinecap="round" />
                )}

                {phase > 0.65 && (
                  <g className="animate-bounce">
                    <circle cx={headX - 22} cy={headY + 8} r="3" fill="#38bdf8" />
                    <circle cx={headX - 28} cy={headY + 14} r="2" fill="#38bdf8" opacity="0.7" />
                  </g>
                )}

                <path 
                  d={`M ${shoulderX} ${shoulderY} Q ${elbowX} ${elbowY} 122 198`} 
                  stroke="#ea580c" strokeWidth="17" strokeLinecap="round" strokeLinejoin="round" fill="none" 
                />
                {muscleGlow && (
                  <path 
                    d={`M ${shoulderX - 2} ${shoulderY} Q ${elbowX + 4} ${elbowY - 4} 122 198`} 
                    stroke="#fed7aa" strokeWidth="4" strokeLinecap="round" fill="none" 
                  />
                )}
                <ellipse cx="122" cy="198" rx="9" ry="5" fill="#fdba74" stroke="#c2410c" strokeWidth="1" />
              </g>
            )}

            {/* ═══════════════════════════════════════════════════════════════════════
                SKIN 2: QUACK NORRIS (Disney-Grade Cartoon Fitness Duck)
            ═══════════════════════════════════════════════════════════════════════ */}
            {character === 'duck' && (
              <g>
                <path 
                  d={`M ${shoulderX} ${shoulderY + 6} Q ${elbowX - 8} ${elbowY + 6} 115 198`} 
                  stroke="#ca8a04" strokeWidth="15" strokeLinecap="round" fill="none" 
                />

                <path d={`M ${hipX} ${hipY + 5} L 315 198`} stroke="#ea580c" strokeWidth="11" strokeLinecap="round" />
                <path d="M 302 198 L 326 198 L 316 190 Z" fill="#f97316" stroke="#c2410c" strokeWidth="1" />

                <ellipse cx={(shoulderX + hipX) / 2} cy={(shoulderY + hipY) / 2} rx="62" ry="26" fill="#facc15" stroke="#eab308" strokeWidth="2" />
                <path d={`M ${hipX + 35} ${hipY - 10} Q ${hipX + 55} ${hipY - 20} ${hipX + 45} ${hipY} Z`} fill="#facc15" stroke="#eab308" strokeWidth="1.5" />

                <circle cx={headX} cy={headY} r="24" fill="#facc15" stroke="#eab308" strokeWidth="2" />
                
                <rect x={headX - 22} y={headY - 11} width="44" height="8" rx="4" fill="#ef4444" stroke="#b91c1c" strokeWidth="1" />
                <path d={`M ${headX + 20} ${headY - 8} Q ${headX + 35} ${headY - 18 - phase * 6} ${headX + 32} ${headY - 4}`} fill="none" stroke="#ef4444" strokeWidth="4" strokeLinecap="round" />

                <circle cx={headX - 8} cy={headY - 2} r="7.5" fill="#ffffff" stroke="#713f12" strokeWidth="1" />
                <circle cx={headX - 9} cy={headY - 2} r="3.5" fill="#0f172a" />
                <circle cx={headX - 11} cy={headY - 4} r="1.5" fill="#ffffff" />

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

                {phase > 0.75 && (
                  <g className="animate-spin">
                    <ellipse cx={headX - 35} cy={headY - 15} rx="6" ry="3" fill="#fef08a" stroke="#ca8a04" strokeWidth="1" transform="rotate(-30)" />
                  </g>
                )}

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
                <path 
                  d={`M ${shoulderX} ${shoulderY + 6} L ${elbowX - 4} ${elbowY + 8} L 115 198`} 
                  stroke="#991b1b" strokeWidth="15" strokeLinejoin="miter" strokeLinecap="square" fill="none" 
                />

                <rect x={hipX - 10} y={hipY - 12} width="85" height="26" rx="4" fill="#1d4ed8" stroke="#1e3a8a" strokeWidth="2" transform={`rotate(20 ${hipX} ${hipY})`} />
                <rect x="306" y="186" width="16" height="13" rx="2" fill="#1e40af" stroke="#172554" strokeWidth="1" />

                <path 
                  d={`M ${shoulderX - 8} ${shoulderY - 14} L ${hipX + 10} ${hipY - 8} L ${hipX + 4} ${hipY + 16} L ${shoulderX - 4} ${shoulderY + 14} Z`} 
                  fill="#dc2626" stroke="#991b1b" strokeWidth="2" 
                />
                <rect x={(shoulderX + hipX)/2 - 12} y={(shoulderY + hipY)/2 - 4} width="24" height="6" rx="2" fill="#ffffff" />
                <circle cx={(shoulderX + hipX)/2 - 12} cy={(shoulderY + hipY)/2 - 1} r="4" fill="#ffffff" />
                <circle cx={(shoulderX + hipX)/2 + 12} cy={(shoulderY + hipY)/2 - 1} r="4" fill="#ffffff" />

                <rect x={headX - 16} y={headY - 12} width="32" height="24" rx="5" fill="#facc15" stroke="#ca8a04" strokeWidth="2" />
                <rect x={headX - 6} y={headY - 18} width="12" height="7" rx="2" fill="#facc15" stroke="#ca8a04" strokeWidth="1.5" />
                
                <circle cx={headX - 8} cy={headY - 2} r="2.5" fill="#000000" />
                <circle cx={headX + 7} cy={headY - 2} r="2.5" fill="#000000" />
                {phase > 0.7 ? (
                  <path d={`M ${headX - 6} ${headY + 6} L ${headX + 5} ${headY + 6}`} stroke="#000000" strokeWidth="2.5" strokeLinecap="round" />
                ) : (
                  <path d={`M ${headX - 6} ${headY + 5} Q ${headX} ${headY + 10} ${headX + 5} ${headY + 5}`} stroke="#000000" strokeWidth="2" fill="none" strokeLinecap="round" />
                )}

                <path 
                  d={`M ${shoulderX} ${shoulderY} L ${elbowX + 4} ${elbowY + 4} L 122 198`} 
                  stroke="#ef4444" strokeWidth="16" strokeLinecap="square" strokeLinejoin="miter" fill="none" 
                />
                <path d="M 116 192 Q 126 192 126 200 Q 126 205 116 205" stroke="#facc15" strokeWidth="5" fill="none" strokeLinecap="round" />
              </g>
            )}

            {/* ═══════════════════════════════════════════════════════════════════════
                SKIN 4: DARTH REPS (High-Contrast Sith Lord of Core Stability)
            ═══════════════════════════════════════════════════════════════════════ */}
            {character === 'vader' && (
              <g>
                {/* Flowing Obsidian Sith Cloak with Glossy Edge Highlights */}
                <path 
                  d={`M ${shoulderX - 5} ${shoulderY - 14} Q ${hipX} ${hipY - 20 - phase * 10} ${hipX + 75} ${hipY - 4} L ${hipX + 85} ${hipY + 22} Q ${hipX} ${hipY + 12} ${shoulderX} ${shoulderY + 12} Z`} 
                  fill="#090d16" stroke="#475569" strokeWidth="2.5" 
                />

                {/* Armored Black Sith Legs with Red Knee Armor Lines */}
                <path d={`M ${hipX} ${hipY} L 318 198`} stroke="#0f172a" strokeWidth="20" strokeLinecap="round" />
                <path d={`M ${hipX + 35} ${hipY + 30} L ${hipX + 45} ${hipY + 40}`} stroke="#ef4444" strokeWidth="2" strokeLinecap="round" />
                
                {/* Shiny Black Sith Boots */}
                <ellipse cx="320" cy="198" rx="12" ry="7" fill="#020617" stroke="#dc2626" strokeWidth="1.5" />

                {/* Black Titanium Chestplate with Glowing Control Console */}
                <path d={`M ${shoulderX} ${shoulderY} L ${hipX} ${hipY}`} stroke="#020617" strokeWidth="32" strokeLinecap="round" />
                
                {/* Chest Armor Console with Red Sith Glow */}
                <rect x={(shoulderX + hipX)/2 - 14} y={(shoulderY + hipY)/2 - 8} width="28" height="15" rx="3" fill="#1e293b" stroke="#ef4444" strokeWidth="1.5" />
                <rect x={(shoulderX + hipX)/2 - 10} y={(shoulderY + hipY)/2 - 4} width="6" height="7" fill="#ef4444" className="animate-pulse" />
                <rect x={(shoulderX + hipX)/2 - 2} y={(shoulderY + hipY)/2 - 4} width="6" height="7" fill="#38bdf8" />
                <rect x={(shoulderX + hipX)/2 + 6} y={(shoulderY + hipY)/2 - 4} width="6" height="7" fill="#22c55e" />

                {/* Iconic Vader Helmet with Glossy Rim Highlight */}
                <path 
                  d={`M ${headX - 18} ${headY + 2} Q ${headX} ${headY - 26} ${headX + 20} ${headY + 2} L ${headX + 14} ${headY + 16} L ${headX - 12} ${headY + 16} Z`} 
                  fill="#000000" stroke="#94a3b8" strokeWidth="2" 
                />
                {/* Glowing Crimson Triangular Visor Lenses */}
                <polygon points={`${headX - 9},${headY - 2} ${headX - 2},${headY - 2} ${headX - 5},${headY + 4}`} fill="#ef4444" className="animate-pulse shadow-[0_0_8px_rgba(239,68,68,1)]" />
                {/* Silver Metal Breath Triangular Grill */}
                <polygon points={`${headX - 6},${headY + 8} ${headX + 4},${headY + 8} ${headX - 1},${headY + 16}`} fill="#cbd5e1" stroke="#475569" strokeWidth="1" />

                {/* Front Gauntlet Arm with Red Armor Stripe */}
                <path 
                  d={`M ${shoulderX} ${shoulderY} Q ${elbowX} ${elbowY} 122 198`} 
                  stroke="#020617" strokeWidth="19" strokeLinecap="round" fill="none" 
                />
                <path 
                  d={`M ${shoulderX - 4} ${shoulderY + 2} Q ${elbowX} ${elbowY - 2} 122 198`} 
                  stroke="#dc2626" strokeWidth="3" strokeLinecap="round" fill="none" 
                />
                {/* Heavy Black Gauntlet Glove */}
                <ellipse cx="122" cy="198" rx="11" ry="6" fill="#000000" stroke="#ef4444" strokeWidth="1.5" />
              </g>
            )}

          </svg>
        </div>

        {/* ── Comic Speech Balloon Floating on Top of Character ── */}
        {roastData && (
          <div className="absolute top-12 left-4 right-4 z-20 animate-in fade-in zoom-in-95 duration-200">
            <div className={`relative px-4 py-2.5 rounded-2xl shadow-2xl border ${
              isVader 
                ? 'bg-black/95 text-red-400 border-red-500/60 shadow-red-950/50' 
                : 'bg-white/95 text-slate-900 border-amber-400/80 shadow-orange-500/20 dark:bg-zinc-900/95 dark:text-orange-200 dark:border-orange-500/50'
            }`}>
              <div className="flex items-start justify-between gap-2">
                <p className="text-xs md:text-sm font-black leading-snug tracking-tight text-left">
                  "{roastData.roast}"
                </p>
                <button
                  onClick={onVoicePlay}
                  className="p-1 rounded-full hover:bg-black/10 dark:hover:bg-white/10 text-orange-500 shrink-0"
                  title="Replay Voice"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Comic Speech Pointer Triangle */}
              <div className={`absolute -bottom-2 left-16 w-3 h-3 rotate-45 border-r border-b ${
                isVader 
                  ? 'bg-black border-red-500/60' 
                  : 'bg-white dark:bg-zinc-900 border-amber-400/80 dark:border-orange-500/50'
              }`} />
            </div>
          </div>
        )}

        {/* Floating Quick Roast Button */}
        <button
          onClick={onTriggerRoast}
          disabled={isLoadingRoast}
          className={`absolute bottom-3 right-3 py-2 px-4 rounded-full font-black text-xs tracking-wide shadow-xl flex items-center gap-1.5 transition-all z-10 uppercase active:scale-95 ${
            isVader 
              ? 'bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white shadow-red-500/40' 
              : 'bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-black shadow-orange-500/40'
          }`}
        >
          <Flame className={`w-3.5 h-3.5 fill-current ${isLoadingRoast ? 'animate-spin' : ''}`} />
          <span>{isLoadingRoast ? 'Roasting...' : 'Roast Form'}</span>
        </button>

        {/* Biomechanical Depth Meter */}
        <div className="absolute bottom-3 left-3 z-10 pointer-events-none">
          <div className={`backdrop-blur-md px-3 py-1.5 rounded-2xl border text-left ${
            isVader 
              ? 'bg-white/90 border-slate-300 text-slate-900' 
              : 'bg-black/80 border-white/10 text-white'
          }`}>
            <div className="text-[9px] font-mono uppercase text-gray-500 font-bold">Standard Target</div>
            <div className={`text-xs font-black ${isVader ? 'text-red-600' : 'text-orange-400'}`}>90° Elbow Flexion</div>
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
