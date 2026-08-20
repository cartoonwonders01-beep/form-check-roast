import { Activity, AlertTriangle, CheckCircle2, Flame, Gauge } from 'lucide-react';

export default function TelemetryHUD({ poseMetrics, exercise }) {
  const formScore = poseMetrics?.formScore || 92;
  const stage = poseMetrics?.stage || 'LOCKOUT (TOP)';
  const errors = poseMetrics?.errors || [];
  const angles = poseMetrics?.angles || { elbow: 172, hip: 178, knee: 180, shoulder: 52 };

  // Color dynamics based on score
  const scoreColor = formScore > 80 ? '#CCFF00' : formScore > 50 ? '#FFB800' : '#FF3344';
  const scoreBadgeBg = formScore > 80 ? 'bg-lime-500/10 border-lime-500/30 text-lime-400' : formScore > 50 ? 'bg-amber-500/10 border-amber-500/30 text-amber-400' : 'bg-red-500/10 border-red-500/30 text-red-400';

  return (
    <div className="bg-[#0B0D13]/90 backdrop-blur-xl border border-white/10 rounded-2xl p-5 shadow-2xl space-y-5">
      {/* ── Top Bar: Form Score & Rep Phase ── */}
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <div className="flex items-center gap-3">
          <div className="relative w-14 h-14 flex items-center justify-center">
            {/* SVG Circular Dial */}
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-white/10"
                strokeWidth="3.5"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                strokeWidth="3.5"
                strokeDasharray={`${formScore}, 100`}
                strokeLinecap="round"
                stroke={scoreColor}
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <span className="absolute font-mono text-sm font-black text-white">
              {formScore}%
            </span>
          </div>

          <div>
            <div className="text-[11px] font-mono tracking-widest text-gray-400 uppercase flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-cyan-400" />
              FORM INTEGRITY
            </div>
            <div className="text-lg font-bold text-white tracking-tight">
              {formScore > 80 ? 'CLEAN BIOMECHANICS' : formScore > 50 ? 'FORM COMPROMISED' : 'CATASTROPHIC SAG'}
            </div>
          </div>
        </div>

        <div className={`px-3.5 py-1.5 rounded-full border text-xs font-mono font-bold tracking-wider uppercase ${scoreBadgeBg}`}>
          {stage}
        </div>
      </div>

      {/* ── Real-Time Joint Telemetry Gauges ── */}
      <div className="grid grid-cols-3 gap-3">
        {/* Elbow Angle */}
        <div className="bg-white/5 border border-white/5 rounded-xl p-3 text-center">
          <div className="text-[10px] font-mono text-gray-400 uppercase tracking-wider mb-1">
            ELBOW FLEXION
          </div>
          <div className="text-xl font-mono font-black text-white">
            {Math.round(angles.elbow)}°
          </div>
          <div className="text-[9px] text-gray-500 mt-0.5">Target: 90° depth</div>
        </div>

        {/* Hip Alignment */}
        <div className="bg-white/5 border border-white/5 rounded-xl p-3 text-center">
          <div className="text-[10px] font-mono text-gray-400 uppercase tracking-wider mb-1">
            SPINAL PLANK
          </div>
          <div className={`text-xl font-mono font-black ${angles.hip < 160 ? 'text-red-400' : 'text-emerald-400'}`}>
            {Math.round(angles.hip)}°
          </div>
          <div className="text-[9px] text-gray-500 mt-0.5">Target: 180° flat</div>
        </div>

        {/* Flare Angle */}
        <div className="bg-white/5 border border-white/5 rounded-xl p-3 text-center">
          <div className="text-[10px] font-mono text-gray-400 uppercase tracking-wider mb-1">
            SHOULDER FLARE
          </div>
          <div className={`text-xl font-mono font-black ${angles.shoulder > 70 ? 'text-amber-400' : 'text-cyan-400'}`}>
            {Math.round(angles.shoulder)}°
          </div>
          <div className="text-[9px] text-gray-500 mt-0.5">Target: 45° tucked</div>
        </div>
      </div>

      {/* ── Active Biomechanical Faults / Stress Vectors ── */}
      <div className="bg-black/50 border border-white/5 rounded-xl p-3.5 space-y-2">
        <div className="text-[10px] font-mono text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
          <AlertTriangle className="w-3 h-3 text-amber-400" />
          ACTIVE FAULT DETECTION
        </div>

        {errors.length === 0 ? (
          <div className="flex items-center gap-2 text-xs text-emerald-400 font-medium py-1">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Zero critical deviations. Core braced and path aligned.</span>
          </div>
        ) : (
          <div className="space-y-1.5">
            {errors.map((err, idx) => (
              <div key={idx} className="flex items-center justify-between text-xs bg-red-950/40 border border-red-500/20 px-3 py-1.5 rounded-lg text-red-300">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-ping" />
                  <span className="font-semibold">{err.label}</span>
                </div>
                <span className="font-mono text-[11px] text-red-400">
                  {Math.round(err.angle)}° vs {err.target}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
