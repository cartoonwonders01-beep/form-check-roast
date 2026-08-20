import { useState, useCallback } from 'react';
import { Activity, Flame, Shield, Sparkles, Trophy, Zap } from 'lucide-react';
import PoseCameraViewer from './components/PoseCameraViewer';
import AnimalPuppetCanvas from './components/AnimalPuppetCanvas';
import TelemetryHUD from './components/TelemetryHUD';
import CharacterSelector from './components/CharacterSelector';
import RoastCard from './components/RoastCard';
import LoadingRoast from './components/LoadingRoast';
import { sfx } from './utils/audioEffects';

const EXERCISES = [
  { id: 'pushup', label: 'Push-Up', icon: '🤸', demoVideoId: 'IODxDxX7oi4', focus: 'Chest, Triceps & Core Bracing' },
  { id: 'pullup', label: 'Pull-Up', icon: '🧗', demoVideoId: 'ba8tr1Pcqyo', focus: 'Lats & Scapular Depression' },
  { id: 'squat', label: 'Air Squat', icon: '🏋️', demoVideoId: 'bEv6CCg2BC8', focus: 'Femur Parallel & Hip Crease' },
  { id: 'dips', label: 'Bar Dips', icon: '🪑', demoVideoId: '2z8JmcrW-As', focus: 'Anterior Deltoid & 90° Angle' },
];

export default function App() {
  const [exercise, setExercise] = useState('pushup');
  const [character, setCharacter] = useState('duck');
  const [videoSource, setVideoSource] = useState('demo');
  const [uploadedVideoUrl, setUploadedVideoUrl] = useState(null);
  const [roastData, setRoastData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasRoasted, setHasRoasted] = useState(false);
  const [poseMetrics, setPoseMetrics] = useState(null);

  const currentExerciseObj = EXERCISES.find(e => e.id === exercise) || EXERCISES[0];

  const handlePoseUpdate = useCallback((metrics) => {
    setPoseMetrics(metrics);
  }, []);

  const handleRoast = async () => {
    sfx.playWhistle();
    setIsLoading(true);
    setRoastData(null);
    setHasRoasted(false);

    try {
      const res = await fetch('/api/roast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          exercise,
          character,
          videoSource,
          videoUrl: videoSource === 'demo' 
            ? `https://www.youtube.com/watch?v=${currentExerciseObj.demoVideoId}` 
            : 'user-camera-clip',
          poseTelemetry: poseMetrics ? {
            formScore: poseMetrics.formScore,
            angles: poseMetrics.angles,
            errors: poseMetrics.errors
          } : null
        }),
      });

      const json = await res.json();
      if (json.success) {
        setRoastData(json.data);
        setHasRoasted(true);
      }
    } catch (err) {
      console.error('Failed to get roast:', err);
      setRoastData({
        roast: `Your ${currentExerciseObj.label} has the structural integrity of soggy cereal — your spine folded like a cheap deckchair.`,
        correction: "Brace your core and squeeze your glutes into a rigid horizontal plank.",
        severity: "savage",
        issue: `broken ${exercise} alignment`,
      });
      setHasRoasted(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setRoastData(null);
    setHasRoasted(false);
  };

  return (
    <div className="min-h-screen bg-[#07080B] text-white flex flex-col selection:bg-orange-500 selection:text-white font-sans antialiased">
      {/* ── TOP NAV / HUD BAR ── */}
      <nav className="border-b border-white/10 bg-[#0B0D13]/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-orange-500 to-amber-400 flex items-center justify-center shadow-lg shadow-orange-500/20">
              <Flame className="w-5 h-5 text-black stroke-[2.5]" />
            </div>
            <div>
              <div className="font-black tracking-wider text-base uppercase bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent">
                FORM CHECK ROAST
              </div>
              <div className="text-[10px] font-mono text-orange-400 tracking-widest uppercase">
                AI CALISTHENICS TELEMETRY
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-mono text-gray-300">
              <Zap className="w-3.5 h-3.5 text-yellow-400" />
              <span>GEMINI 3.6 FLASH POSE REASONING</span>
            </div>
            <div className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-bold flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>60 FPS KINEMATICS</span>
            </div>
          </div>
        </div>
      </nav>

      {/* ── EXERCISE SELECTION STRIP ── */}
      <div className="border-b border-white/5 bg-[#090A0E] py-3 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
            {EXERCISES.map((ex) => {
              const isSelected = exercise === ex.id;
              return (
                <button
                  key={ex.id}
                  onClick={() => {
                    setExercise(ex.id);
                    setHasRoasted(false);
                    setRoastData(null);
                  }}
                  className={`px-4 py-2 rounded-xl text-xs font-bold font-mono uppercase tracking-wider transition-all flex items-center gap-2 ${
                    isSelected
                      ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-black shadow-lg shadow-orange-500/25 scale-[1.03]'
                      : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white border border-white/5'
                  }`}
                >
                  <span className="text-sm">{ex.icon}</span>
                  <span>{ex.label}</span>
                </button>
              );
            })}
          </div>

          <div className="text-xs font-mono text-gray-400 hidden md:block">
            Target Focus: <span className="text-white font-semibold">{currentExerciseObj.focus}</span>
          </div>
        </div>
      </div>

      {/* ── MAIN WORKSPACE ── */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* LEFT 7 COLS — Video Capture & Biomechanical Telemetry */}
          <div className="lg:col-span-7 space-y-5">
            <PoseCameraViewer
              videoId={currentExerciseObj.demoVideoId}
              videoSource={videoSource}
              setVideoSource={setVideoSource}
              uploadedVideoUrl={uploadedVideoUrl}
              setUploadedVideoUrl={setUploadedVideoUrl}
              exercise={currentExerciseObj.label}
              onPoseUpdate={handlePoseUpdate}
            />

            {/* AI ROAST TRIGGER BUTTON */}
            {!hasRoasted && !isLoading && (
              <button
                onClick={handleRoast}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-orange-500 via-amber-500 to-orange-500 hover:from-orange-400 hover:to-amber-400 active:scale-[0.99] text-black font-black text-lg tracking-wider uppercase shadow-2xl shadow-orange-500/30 transition-all flex items-center justify-center gap-2"
              >
                <Flame className="w-5 h-5 fill-current" />
                <span>ROAST MY {currentExerciseObj.label.toUpperCase()}</span>
                <Flame className="w-5 h-5 fill-current" />
              </button>
            )}

            {isLoading && <LoadingRoast />}

            {hasRoasted && roastData && (
              <div className="space-y-4">
                <RoastCard data={roastData} character={character} />
                <button
                  onClick={handleReset}
                  className="w-full py-3 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white transition-all text-xs font-mono font-bold uppercase tracking-wider"
                >
                  🔄 Analyze Another Attempt
                </button>
              </div>
            )}
          </div>

          {/* RIGHT 5 COLS — Real-Time Puppet Canvas & Form HUD */}
          <div className="lg:col-span-5 space-y-5">
            {/* CARTOON ANIMAL MIRROR PUPPET */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-xs font-mono font-bold uppercase tracking-widest text-gray-400 flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-orange-400" />
                  LIVE ANIMAL KINEMATIC PUPPET
                </h2>
                <span className="text-[10px] font-mono text-cyan-400">
                  MIRRORS YOUR MOTION
                </span>
              </div>

              <AnimalPuppetCanvas
                character={character}
                poseMetrics={poseMetrics}
                exercise={exercise}
              />
            </div>

            {/* COACH CHARACTER SELECTOR */}
            <div className="space-y-2.5">
              <div className="text-xs font-mono font-bold uppercase tracking-widest text-gray-400">
                SELECT ANIMAL COACH PERSONA
              </div>
              <CharacterSelector
                selected={character}
                onSelect={setCharacter}
              />
            </div>

            {/* BIOMECHANICAL TELEMETRY HUD */}
            <TelemetryHUD
              poseMetrics={poseMetrics}
              exercise={currentExerciseObj.label}
            />
          </div>

        </div>
      </main>

      {/* ── FOOTER ── */}
      <footer className="border-t border-white/5 bg-[#050608] py-4 px-4 text-center text-xs font-mono text-gray-600">
        FORM CHECK ROAST • POWERED BY GOOGLE MEDIAPIPE & GEMINI 3.6 FLASH • HACKATHON BUILD
      </footer>
    </div>
  );
}
