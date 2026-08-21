import { useState, useEffect } from 'react';
import { Flame, Volume2, Sparkles, Activity, CheckCircle2, ShieldCheck } from 'lucide-react';

const EXERCISE_DATA = {
  pushup: {
    title: 'Press-ups',
    subtitle: 'Chest & Core Plank',
    images: ['/exercises/Pushups/0.jpg', '/exercises/Pushups/1.jpg'],
    primaryMuscles: 'Pectorals (Chest), Triceps',
    secondaryMuscles: 'Anterior Deltoids, Core',
    targetCue: 'Lower until chest hovers 1 inch above floor, elbows at 45° arrow angle.',
    depthMetric: '90° Elbow Flexion',
    tempo: '2s Down • 1s Pause • 1s Up'
  },
  squat: {
    title: 'Squats',
    subtitle: 'Quads & Glutes',
    images: ['/exercises/Bodyweight_Squat/0.jpg', '/exercises/Bodyweight_Squat/1.jpg'],
    primaryMuscles: 'Quadriceps, Gluteus Maximus',
    secondaryMuscles: 'Hamstrings, Calves, Core',
    targetCue: 'Hips back, thighs parallel with floor, knees tracking over toes.',
    depthMetric: 'Femur Parallel to Floor',
    tempo: '3s Down • 1s Pause • 2s Up'
  },
  situp: {
    title: 'Sit-ups',
    subtitle: 'Abdominal Crunch',
    images: ['/exercises/Sit-Up/0.jpg', '/exercises/Sit-Up/1.jpg'],
    primaryMuscles: 'Rectus Abdominis (Abs)',
    secondaryMuscles: 'Hip Flexors, Obliques',
    targetCue: 'Hands behind ears, curl upper body up to 70° upright position.',
    depthMetric: '70° Upright Spinal Curl',
    tempo: '2s Up • 2s Controlled Descent'
  },
  plank: {
    title: 'Plank Hold',
    subtitle: 'Isometric Core Stability',
    images: ['/exercises/Plank/0.jpg', '/exercises/Plank/1.jpg'],
    primaryMuscles: 'Transverse Abdominis, Core',
    secondaryMuscles: 'Glutes, Deltoids, Quads',
    targetCue: 'Forearms flat, straight rigid kinetic chain from ears to heels.',
    depthMetric: '180° Neutral Spinal Line',
    tempo: 'Isometric Continuous Hold'
  }
};

export default function SevenAthleteViewer({
  exercise = 'pushup',
  isPlaying = true,
  roastData,
  onTriggerRoast,
  isLoadingRoast,
  character = 'humanoid'
}) {
  const [frameIdx, setFrameIdx] = useState(0);
  const data = EXERCISE_DATA[exercise] || EXERCISE_DATA.pushup;

  // Smooth cadence frame oscillation loop (1.6s per rep)
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setFrameIdx((prev) => (prev === 0 ? 1 : 0));
    }, 1100);
    return () => clearInterval(interval);
  }, [isPlaying, exercise]);

  const speakRoast = () => {
    if ('speechSynthesis' in window && roastData?.roast) {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(`${roastData.roast} Correction: ${roastData.correction}`);
      u.rate = 1.0;
      u.pitch = character === 'duck' ? 1.3 : character === 'vader' ? 0.7 : character === 'woody' ? 1.2 : 1.05;
      window.speechSynthesis.speak(u);
    }
  };

  return (
    <div className="space-y-3 w-full">
      {/* ── Real Human Athlete Motion Demonstration Card ── */}
      <div className="relative w-full h-[260px] bg-black rounded-3xl border border-slate-200/80 dark:border-zinc-800 overflow-hidden shadow-2xl group">
        {/* Animated Real Athlete Frame */}
        <img
          src={data.images[frameIdx]}
          alt={data.title}
          className="w-full h-full object-cover transition-all duration-700 ease-in-out scale-105"
        />

        {/* Studio Dark Vignette & Floor Lighting */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 flex items-center gap-1.5 z-10 pointer-events-none">
          <div className="bg-black/70 backdrop-blur-md px-3 py-1 rounded-full border border-white/15 flex items-center gap-1.5 shadow-sm">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-[10px] font-mono font-bold tracking-wider text-white uppercase">
              PRO ATHLETE • {frameIdx === 0 ? 'START POSE' : 'FULL DEPTH'}
            </span>
          </div>
        </div>

        {/* Depth Standard Metric */}
        <div className="absolute bottom-3 left-3 z-10 pointer-events-none">
          <div className="bg-black/80 backdrop-blur-md px-3 py-1.5 rounded-2xl border border-white/10 text-left">
            <div className="text-[9px] font-mono uppercase text-gray-400 font-bold">Standard Target</div>
            <div className="text-xs font-black text-orange-400">{data.depthMetric}</div>
          </div>
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
      </div>

      {/* ── Biomechanics Breakdown Card ── */}
      <div className="bg-slate-50 dark:bg-zinc-900/80 border border-slate-200/80 dark:border-zinc-800 rounded-2xl p-3.5 space-y-2 shadow-sm">
        <div className="flex items-center justify-between text-[11px] font-mono font-bold text-slate-500 dark:text-zinc-400">
          <span className="flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-orange-500" />
            BIOMECHANICAL CUES
          </span>
          <span className="text-emerald-500 font-bold flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            Verified
          </span>
        </div>

        <p className="text-xs text-slate-700 dark:text-zinc-300 font-medium leading-relaxed">
          {data.targetCue}
        </p>

        <div className="grid grid-cols-2 gap-2 text-xs pt-1">
          <div className="bg-white dark:bg-zinc-800/60 p-2 rounded-xl border border-slate-100 dark:border-zinc-700/40">
            <div className="text-[10px] font-bold uppercase text-slate-400 dark:text-zinc-500 mb-0.5">Primary Focus</div>
            <div className="font-semibold text-slate-800 dark:text-zinc-200">{data.primaryMuscles}</div>
          </div>
          <div className="bg-white dark:bg-zinc-800/60 p-2 rounded-xl border border-slate-100 dark:border-zinc-700/40">
            <div className="text-[10px] font-bold uppercase text-slate-400 dark:text-zinc-500 mb-0.5">Tempo Cadence</div>
            <div className="font-semibold text-slate-800 dark:text-zinc-200">{data.tempo}</div>
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
              onClick={speakRoast}
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
