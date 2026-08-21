import { useState, useEffect } from 'react';
import { Scan, AlertTriangle, ShieldCheck, Flame, Zap, Volume2, Sparkles } from 'lucide-react';

export default function SavageXRayScanner({
  isPlaying = true,
  character = 'humanoid',
  roastData,
  onTriggerRoast,
  isLoadingRoast,
  onVoicePlay
}) {
  const [phase, setPhase] = useState(0);
  const [scanPulse, setScanPulse] = useState(0);

  useEffect(() => {
    if (!isPlaying) return;
    let startTime = performance.now();
    let frameId;

    const loop = (now) => {
      const elapsed = (now - startTime) / 1000;
      const t = (elapsed % 2.2) / 2.2;
      let currentPhase = 0;
      if (t < 0.42) {
        currentPhase = 0.5 - 0.5 * Math.cos(Math.PI * (t / 0.42));
      } else if (t < 0.58) {
        currentPhase = 1.0;
      } else if (t < 0.90) {
        currentPhase = 1.0 - (0.5 - 0.5 * Math.cos(Math.PI * ((t - 0.58) / 0.32)));
      } else {
        currentPhase = 0.0;
      }

      setPhase(currentPhase);
      setScanPulse(Math.sin(elapsed * 4));
      frameId = requestAnimationFrame(loop);
    };

    frameId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frameId);
  }, [isPlaying]);

  const sinkY = phase * 46;
  const elbowAngle = Math.round(180 - phase * 90);
  const coreStress = Math.round(45 + phase * 50);

  return (
    <div className="space-y-3 w-full">
      {/* ── Cybernetic X-Ray HUD Canvas ── */}
      <div className="relative w-full h-[270px] bg-[#030712] rounded-3xl border border-cyan-500/30 overflow-hidden shadow-2xl flex items-center justify-center">
        
        {/* Neon Cyber Grid Background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#06b6d410_1px,transparent_1px),linear-gradient(to_bottom,#06b6d410_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none" />
        
        {/* Scanning Laser Line that sweeps vertically */}
        <div 
          className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_15px_#22d3ee] pointer-events-none transition-all duration-75"
          style={{ top: `${35 + phase * 45}%` }}
        />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 flex items-center gap-2 z-10 pointer-events-none">
          <div className="bg-black/85 backdrop-blur-md px-3 py-1 rounded-full border border-cyan-500/30 flex items-center gap-1.5 shadow-sm">
            <Scan className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
            <span className="text-[10px] font-mono font-bold tracking-wider text-cyan-300 uppercase">
              BIOMECHANICAL X-RAY SCAN
            </span>
          </div>
        </div>

        {/* Real-time Telemetry Overlay Top Right */}
        <div className="absolute top-3 right-3 z-10 pointer-events-none text-right font-mono">
          <div className="bg-black/85 backdrop-blur-md px-2.5 py-1 rounded-xl border border-cyan-500/20 text-[10px]">
            <div className="text-gray-400">JOINT ANGLE</div>
            <div className={`text-xs font-black ${elbowAngle <= 95 ? 'text-emerald-400' : 'text-amber-400'}`}>
              {elbowAngle}° {elbowAngle <= 95 ? '✓ OPTIMAL' : '⚠ SHALLOW'}
            </div>
          </div>
        </div>

        {/* ── Skeletal Wireframe & Joint Load Sensors ── */}
        <div className="relative w-[380px] h-[240px] flex items-center justify-center">
          <svg viewBox="0 0 400 240" className="w-full h-full overflow-visible">
            
            {/* Floor Target Line */}
            <line x1="30" y1="198" x2="370" y2="198" stroke="#1e293b" strokeWidth="2" strokeDasharray="4 4" />
            <line x1="110" y1="198" x2="330" y2="198" stroke="#06b6d4" strokeWidth="2" strokeOpacity="0.4" />

            {/* Hand & Foot Anchor Nodes */}
            <circle cx="122" cy="198" r="8" fill="#06b6d4" fillOpacity="0.2" stroke="#22d3ee" strokeWidth="2" />
            <circle cx="122" cy="198" r="3" fill="#22d3ee" />
            <text x="105" y="215" fill="#67e8f9" fontSize="9" fontFamily="monospace">GRIP [X122]</text>

            <circle cx="320" cy="198" r="8" fill="#06b6d4" fillOpacity="0.2" stroke="#22d3ee" strokeWidth="2" />
            <circle cx="320" cy="198" r="3" fill="#22d3ee" />
            <text x="300" y="215" fill="#67e8f9" fontSize="9" fontFamily="monospace">PIVOT [X320]</text>

            {/* Neon Skeletal Bones */}
            <line 
              x1={240 - phase * 4} y1={125 + sinkY} 
              x2="320" y2="198" 
              stroke="#38bdf8" strokeWidth="6" strokeLinecap="round" strokeOpacity="0.8"
            />
            <line 
              x1={135 - phase * 6} y1={115 + sinkY} 
              x2={240 - phase * 4} y2={125 + sinkY} 
              stroke={phase > 0.8 ? "#22c55e" : "#06b6d4"} strokeWidth="8" strokeLinecap="round" 
            />
            <line 
              x1={135 - phase * 6} y1={115 + sinkY} 
              x2={105 - phase * 8} y2={98 + sinkY} 
              stroke="#06b6d4" strokeWidth="5" strokeLinecap="round" 
            />

            <circle 
              cx={105 - phase * 8} cy={98 + sinkY} r="18" 
              fill="none" stroke="#22d3ee" strokeWidth="2" strokeDasharray="3 3" 
            />
            <circle 
              cx={105 - phase * 8} cy={98 + sinkY} r="5" 
              fill="#22d3ee" fillOpacity="0.6" 
            />

            {/* Arm Kinetic Chain */}
            <line 
              x1={135 - phase * 6} y1={115 + sinkY} 
              x2={108 - phase * 32} y2={145 + sinkY * 0.7} 
              stroke="#f43f5e" strokeWidth="6" strokeLinecap="round" 
            />
            <line 
              x1={108 - phase * 32} y1={145 + sinkY * 0.7} 
              x2="122" y2="198" 
              stroke="#f43f5e" strokeWidth="6" strokeLinecap="round" 
            />

            <circle 
              cx={108 - phase * 32} cy={145 + sinkY * 0.7} r={8 + (scanPulse > 0 ? 2 : 0)} 
              fill="#f43f5e" fillOpacity="0.3" stroke="#fb7185" strokeWidth="2" 
            />
            <circle cx={108 - phase * 32} cy={145 + sinkY * 0.7} r="3" fill="#ffffff" />
            
            <g transform={`translate(${108 - phase * 32 - 45}, ${145 + sinkY * 0.7 - 18})`}>
              <rect width="40" height="16" rx="4" fill="#0f172a" stroke="#f43f5e" strokeWidth="1" />
              <text x="20" y="11" fill="#fb7185" fontSize="9" fontFamily="monospace" fontWeight="bold" textAnchor="middle">
                {elbowAngle}°
              </text>
            </g>

            <circle 
              cx={(135 - phase * 6 + 240 - phase * 4)/2} 
              cy={(115 + sinkY + 125 + sinkY)/2} 
              r={12 + phase * 6} 
              fill="#22c55e" fillOpacity={0.15 + phase * 0.2} 
              stroke="#4ade80" strokeWidth="1.5" strokeDasharray="2 2"
            />

          </svg>
        </div>

        {/* Floating Quick Roast Button */}
        <button
          onClick={onTriggerRoast}
          disabled={isLoadingRoast}
          className="absolute bottom-3 right-3 py-2 px-4 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 active:scale-95 text-black text-xs font-black tracking-wide shadow-xl shadow-cyan-500/40 flex items-center gap-1.5 transition-all z-10 uppercase font-mono"
        >
          <Flame className={`w-3.5 h-3.5 fill-current ${isLoadingRoast ? 'animate-spin' : ''}`} />
          <span>{isLoadingRoast ? 'Scanning...' : 'Diagnose Fault'}</span>
        </button>

        {/* Live Diagnostics HUD Bottom Left */}
        <div className="absolute bottom-3 left-3 z-10 pointer-events-none font-mono">
          <div className="bg-black/90 backdrop-blur-md px-3 py-1.5 rounded-2xl border border-cyan-500/30 text-left">
            <div className="text-[9px] uppercase text-cyan-400 font-bold flex items-center gap-1">
              <Zap className="w-2.5 h-2.5" /> CORE STRESS: {coreStress}%
            </div>
            <div className="text-xs font-black text-white">
              {phase > 0.8 ? 'MAX TRICEP TORQUE' : 'ECCENTRIC LOADING'}
            </div>
          </div>
        </div>

      </div>

      {/* ── Savage Scan Telemetry Card ── */}
      <div className="bg-slate-900 border border-cyan-500/20 rounded-2xl p-3.5 space-y-2 shadow-sm font-mono text-xs">
        <div className="flex items-center justify-between text-[11px] font-bold text-cyan-400">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            DIAGNOSTIC STATUS
          </span>
          <span className="text-emerald-400 font-bold">100% CALIBRATED</span>
        </div>

        <div className="grid grid-cols-2 gap-2 text-slate-300">
          <div className="bg-black/50 p-2 rounded-xl border border-slate-800">
            <div className="text-[9px] text-gray-500 uppercase">Spinal Alignment</div>
            <div className="font-bold text-emerald-400">180° Neutral Plane</div>
          </div>
          <div className="bg-black/50 p-2 rounded-xl border border-slate-800">
            <div className="text-[9px] text-gray-500 uppercase">Elbow Flare Trajectory</div>
            <div className="font-bold text-cyan-300">45° Arrow Profile</div>
          </div>
        </div>
      </div>

      {/* ── Prominent Diagnostic Roast Speech Bubble ── */}
      {roastData && (
        <div className="w-full bg-cyan-950/40 border border-cyan-500/30 rounded-2xl p-3.5 shadow-sm space-y-2 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Flame className="w-3.5 h-3.5 text-cyan-400 fill-current" />
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-cyan-300">
                Diagnostic Scan Verdict
              </span>
            </div>
            <button
              onClick={onVoicePlay}
              className="p-1 rounded-full hover:bg-cyan-500/20 text-cyan-400 transition-colors"
              title="Play voice"
            >
              <Volume2 className="w-3.5 h-3.5" />
            </button>
          </div>

          <p className="text-xs md:text-sm font-bold text-cyan-100 font-mono leading-snug">
            "{roastData.roast}"
          </p>

          <div className="text-[11px] text-cyan-300/80 font-medium font-mono flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-cyan-400 shrink-0" />
            <span>Telemetry Cue: {roastData.correction}</span>
          </div>
        </div>
      )}
    </div>
  );
}
