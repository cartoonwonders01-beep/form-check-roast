import { useState, useEffect, useCallback } from 'react';
import { Play, Pause, RotateCcw, Flame, Moon, Sun, ChevronRight, Sparkles, Layers, Box, Camera } from 'lucide-react';
import SevenStudioViewer from './components/SevenStudioViewer';
import SevenTimerRing from './components/SevenTimerRing';
import { sfx } from './utils/audioEffects';

const WORKOUT_MOVES = [
  { id: 'pushup', title: 'Press-ups', subtitle: 'Chest & Core Plank', duration: 30 },
  { id: 'squat', title: 'Squats', subtitle: 'Quads & Glutes Parallel', duration: 30 },
  { id: 'situp', title: 'Sit-ups', subtitle: 'Abdominal Crunch', duration: 30 },
  { id: 'plank', title: 'Plank Hold', subtitle: 'Isometric Stability', duration: 30 },
];

const INSTRUCTORS = [
  { id: 'humanoid', name: 'Coach Alex', label: 'Coach Alex', icon: '🏃', tagline: 'The Hype Trainer' },
  { id: 'duck', name: 'Quack Norris', label: 'Quack Norris', icon: '🦆', tagline: 'Sarcastic Duck' },
  { id: 'lego', name: 'Brick Bro', label: 'Brick Bro', icon: '🧱', tagline: 'Lego Gym Rat' },
  { id: 'vader', name: 'Darth Reps', label: 'Darth Reps', icon: '⚔️', tagline: 'Dark Lord of Core' },
];

const VIEW_MODES = [
  { id: '2d_vector', label: '2D Vector (Seven.app)', icon: Layers, desc: 'Ultra-light 60 FPS vector character skins' },
  { id: '3d_mocap', label: '3D Orbit (FitCraft)', icon: Box, desc: 'Interactive 360° 3D studio' },
  { id: 'real_athlete', label: 'Real Athlete (Pro)', icon: Camera, desc: 'Authentic gym demonstration' },
];

const PERSONA_ROASTS = {
  humanoid: [
    "Come on champion! You're dropping like a sack of unflavored protein powder! Tighten that core!",
    "Are we doing pushups or taking a tactical gym floor nap? Chest down to 90 degrees!",
    "Your form is looking solid, but let's see those triceps work on the lockout!"
  ],
  duck: [
    "QUACK! Your elbows are flapping like a goose in a wind turbine! Lock those wings at 45 degrees!",
    "I've seen bread with better structural integrity than your lower back right now. Quack up!",
    "Not bad for a human with zero feathers, but your tail is sagging. Squeeze the glutes!"
  ],
  lego: [
    "WARNING: Severe brick misalignment detected! Your spine is scattering loose pieces across the floor!",
    "Snap those core pieces together! If you bend at the waist, your minifig torso pops off!",
    "Solid brick structure! That's master builder pushup tension right there!"
  ],
  vader: [
    "I find your lack of core tension... disturbing. The dark side does not tolerate sagging hips!",
    "You were supposed to bring balance to the workout, not collapse on the floor!",
    "Good... the pushup force is strong with this set. Continue the descent!"
  ]
};

export default function App() {
  const [viewMode, setViewMode] = useState('2d_vector'); // '2d_vector' | '3d_mocap' | 'real_athlete'
  const [currentMoveIdx, setCurrentMoveIdx] = useState(0);
  const [character, setCharacter] = useState('duck');
  const [isActive, setIsActive] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(30);
  const [isRest, setIsRest] = useState(false);
  const [roastData, setRoastData] = useState(null);
  const [isLoadingRoast, setIsLoadingRoast] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  const currentMove = WORKOUT_MOVES[currentMoveIdx];

  // ── Workout Timer Loop ───────────────────────────────────────────────
  useEffect(() => {
    let timer = null;
    if (isActive && secondsLeft > 0) {
      timer = setInterval(() => {
        setSecondsLeft((prev) => prev - 1);
      }, 1000);
    } else if (isActive && secondsLeft === 0) {
      // Set completed, transition to Rest or Next Move
      sfx.playWhistle();
      if (!isRest) {
        setIsRest(true);
        setSecondsLeft(10); // 10s Rest interval
      } else {
        setIsRest(false);
        const nextIdx = (currentMoveIdx + 1) % WORKOUT_MOVES.length;
        setCurrentMoveIdx(nextIdx);
        setSecondsLeft(WORKOUT_MOVES[nextIdx].duration);
      }
    }
    return () => clearInterval(timer);
  }, [isActive, secondsLeft, isRest, currentMoveIdx]);

  const togglePlay = () => {
    if (!isActive) sfx.playLegoSnap();
    setIsActive(!isActive);
  };

  const resetTimer = () => {
    setIsActive(false);
    setIsRest(false);
    setSecondsLeft(currentMove.duration);
  };

  const handleSelectMove = (idx) => {
    setCurrentMoveIdx(idx);
    setIsActive(false);
    setIsRest(false);
    setSecondsLeft(WORKOUT_MOVES[idx].duration);
    setRoastData(null);
  };

  const speakRoast = useCallback((text) => {
    if ('speechSynthesis' in window && text) {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.rate = 1.05;
      u.pitch = character === 'duck' ? 1.45 : character === 'vader' ? 0.65 : character === 'lego' ? 1.15 : 1.0;
      window.speechSynthesis.speak(u);
    }
  }, [character]);

  const handleFetchRoast = async () => {
    setIsLoadingRoast(true);
    if (character === 'vader') sfx.playLightsaber();
    else sfx.playWhistle();

    try {
      const res = await fetch('/api/roast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          exercise: currentMove.id,
          character,
          videoSource: 'live',
          videoUrl: 'seven-app-form-check',
        }),
      });
      const json = await res.json();
      if (json.success) {
        setRoastData(json.data);
        speakRoast(`${json.data.roast} Cue: ${json.data.correction}`);
      }
    } catch (err) {
      console.warn('Roast fetch fallback:', err);
      const list = PERSONA_ROASTS[character] || PERSONA_ROASTS.humanoid;
      const randomRoast = list[Math.floor(Math.random() * list.length)];
      const fallbackData = {
        roast: randomRoast,
        correction: `Maintain a rigid 180° spinal plank and lower down until elbows reach 90° flexion.`,
        severity: 'savage',
        issue: 'cadence and depth',
      };
      setRoastData(fallbackData);
      speakRoast(`${fallbackData.roast} Cue: ${fallbackData.correction}`);
    } finally {
      setIsLoadingRoast(false);
    }
  };

  return (
    <div className={`min-h-screen flex flex-col items-center justify-between p-4 md:p-6 transition-colors duration-300 ${isDarkMode ? 'bg-[#080C14] text-white' : 'bg-slate-50 text-slate-900'}`}>
      
      {/* ── Top Mobile-First App Container ── */}
      <div className="w-full max-w-md mx-auto space-y-4">
        
        {/* Header Bar */}
        <header className="flex items-center justify-between pt-2 pb-1">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-black tracking-tight text-orange-500 font-mono">SEVEN</span>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-orange-500/10 text-orange-600 dark:text-orange-400 uppercase tracking-wider">
              COMICAL EDITION
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Dark Mode Toggle */}
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="p-2 rounded-full bg-slate-200/70 dark:bg-zinc-800/80 text-slate-600 dark:text-zinc-300 hover:bg-slate-300 dark:hover:bg-zinc-700 transition-colors"
              title="Toggle theme"
            >
              {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>
        </header>

        {/* ── Architecture Comparison Switcher (Path 1 vs Path 2) ── */}
        <div className="bg-slate-200/70 dark:bg-zinc-900 border border-slate-300/60 dark:border-zinc-800 rounded-2xl p-1 flex items-center gap-1 shadow-inner">
          {VIEW_MODES.map((mode) => {
            const isSelected = viewMode === mode.id;
            const Icon = mode.icon;
            return (
              <button
                key={mode.id}
                onClick={() => setViewMode(mode.id)}
                className={`flex-1 py-1.5 px-2 rounded-xl text-[11px] font-bold transition-all flex items-center justify-center gap-1.5 ${
                  isSelected
                    ? 'bg-white dark:bg-zinc-800 text-orange-600 dark:text-orange-400 shadow-sm border border-slate-200/50 dark:border-zinc-700/50'
                    : 'text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
                }`}
                title={mode.desc}
              >
                <Icon className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">{mode.label.split(' ')[0]} {mode.label.split(' ')[1]}</span>
              </button>
            );
          })}
        </div>

        {/* ── Comical Coach Personas Switcher (4 Swappable Skins) ── */}
        <div className="grid grid-cols-4 gap-1.5 bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 rounded-2xl p-1.5 shadow-sm">
          {INSTRUCTORS.map((inst) => {
            const isSelected = character === inst.id;
            return (
              <button
                key={inst.id}
                onClick={() => {
                  setCharacter(inst.id);
                  if (inst.id === 'vader') sfx.playLightsaber();
                  else sfx.playLegoSnap();
                  setRoastData(null);
                }}
                className={`py-2 px-1 rounded-xl text-center flex flex-col items-center justify-center transition-all ${
                  isSelected
                    ? 'bg-orange-500/10 dark:bg-orange-500/20 border border-orange-500/30 text-orange-600 dark:text-orange-400 shadow-sm'
                    : 'hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-500 dark:text-zinc-400'
                }`}
              >
                <span className="text-xl mb-0.5">{inst.icon}</span>
                <span className="text-[10px] font-bold truncate max-w-full">{inst.name.split(' ')[0]}</span>
              </button>
            );
          })}
        </div>

        {/* ── Main Exercise Card ── */}
        <div className="bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 rounded-3xl p-5 md:p-6 shadow-sm flex flex-col items-center text-center space-y-4">
          
          {/* Move Info */}
          <div>
            <div className="text-[11px] font-bold uppercase tracking-widest text-slate-400 dark:text-zinc-500">
              1-Movement MVP • Exercise 1 of 1
            </div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight mt-0.5">
              {currentMove.title}
            </h1>
            <p className="text-xs text-slate-500 dark:text-zinc-400">
              {currentMove.subtitle}
            </p>
          </div>

          {/* Dual-Mode Studio Display (2D Vector vs 3D Orbit vs Real Athlete) */}
          <SevenStudioViewer
            viewMode={viewMode}
            character={character}
            exercise={currentMove.id}
            isPlaying={isActive}
            roastData={roastData}
            onTriggerRoast={handleFetchRoast}
            isLoadingRoast={isLoadingRoast}
            onVoicePlay={() => speakRoast(`${roastData?.roast} Cue: ${roastData?.correction}`)}
          />

          {/* Seven Circular Timer Ring */}
          <SevenTimerRing
            secondsLeft={secondsLeft}
            totalSeconds={isRest ? 10 : currentMove.duration}
            isActive={isActive}
            isRest={isRest}
          />

          {/* Bottom Primary Controls */}
          <div className="w-full flex items-center gap-3 pt-2">
            <button
              onClick={resetTimer}
              className="p-3.5 rounded-2xl bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 hover:bg-slate-200 dark:hover:bg-zinc-700 transition-colors"
              title="Reset timer"
            >
              <RotateCcw className="w-5 h-5" />
            </button>

            <button
              onClick={togglePlay}
              className={`flex-1 py-4 px-6 rounded-2xl font-black text-sm tracking-wide shadow-lg transition-all flex items-center justify-center gap-2 ${
                isActive
                  ? 'bg-amber-500 hover:bg-amber-400 text-black shadow-amber-500/20'
                  : 'bg-orange-500 hover:bg-orange-400 text-white shadow-orange-500/30'
              }`}
            >
              {isActive ? (
                <>
                  <Pause className="w-5 h-5 fill-current" />
                  <span>PAUSE SET</span>
                </>
              ) : (
                <>
                  <Play className="w-5 h-5 fill-current" />
                  <span>START SET (30s)</span>
                </>
              )}
            </button>

            <button
              onClick={handleFetchRoast}
              disabled={isLoadingRoast}
              className="p-3.5 rounded-2xl bg-orange-500/10 text-orange-600 dark:text-orange-400 hover:bg-orange-500/20 transition-colors"
              title="Instant Coach Roast"
            >
              <Flame className={`w-5 h-5 fill-current ${isLoadingRoast ? 'animate-spin' : ''}`} />
            </button>
          </div>

        </div>

      </div>

      {/* ── Footer ── */}
      <footer className="text-center py-4 text-[11px] text-slate-400 dark:text-zinc-600">
        Seven: Comical Edition • 2D Vector & 3D Mocap Comparison • Built with Gemini 3.6 Flash
      </footer>
    </div>
  );
}
