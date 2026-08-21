import { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, Flame, Moon, Sun, ChevronRight, CheckCircle2 } from 'lucide-react';
import SevenStudioViewer from './components/SevenStudioViewer';
import SevenTimerRing from './components/SevenTimerRing';
import SevenRoastCard from './components/SevenRoastCard';
import { sfx } from './utils/audioEffects';

const WORKOUT_MOVES = [
  { id: 'pushup', title: 'Press-ups', subtitle: 'Chest & Core Plank', duration: 30 },
  { id: 'squat', title: 'Squats', subtitle: 'Quads & Glutes Parallel', duration: 30 },
  { id: 'situp', title: 'Sit-ups', subtitle: 'Abdominal Crunch', duration: 30 },
  { id: 'plank', title: 'Plank Hold', subtitle: 'Isometric Stability', duration: 30 },
];

const INSTRUCTORS = [
  { id: 'humanoid', name: 'Coach Alex', icon: '🏃' },
  { id: 'lego', name: 'Lego Coach', icon: '🧱' },
  { id: 'woody', name: 'Sheriff Woody', icon: '🤠' },
  { id: 'vader', name: 'Lord Vader', icon: '⚔️' },
];

export default function App() {
  const [currentMoveIdx, setCurrentMoveIdx] = useState(0);
  const [character, setCharacter] = useState('humanoid');
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

  const handleFetchRoast = async () => {
    setIsLoadingRoast(true);
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
      }
    } catch (err) {
      console.warn('Roast fetch fallback:', err);
      // Fallback
      setRoastData({
        roast: `Your ${currentMove.title} look like a newborn giraffe learning to ice skate. Lock your core!`,
        correction: `Focus on rigid spinal tension and smooth cadence throughout the full ${currentMove.title} range.`,
        severity: 'savage',
        issue: 'core instability',
      });
    } finally {
      setIsLoadingRoast(false);
    }
  };

  return (
    <div className={`min-h-screen flex flex-col items-center justify-between p-4 md:p-6 transition-colors duration-300 ${isDarkMode ? 'bg-[#090D16] text-white' : 'bg-slate-50 text-slate-900'}`}>
      
      {/* ── Top Mobile-First App Container ── */}
      <div className="w-full max-w-md mx-auto space-y-4">
        
        {/* Header Bar */}
        <header className="flex items-center justify-between pt-2 pb-1">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-black tracking-tight text-orange-500 font-mono">SEVEN</span>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-orange-500/10 text-orange-600 dark:text-orange-400 uppercase">
              Roast Edition
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Instructor Switcher Pills */}
            <div className="flex items-center bg-slate-200/70 dark:bg-zinc-800/80 p-1 rounded-full text-xs">
              {INSTRUCTORS.map((inst) => (
                <button
                  key={inst.id}
                  onClick={() => {
                    setCharacter(inst.id);
                    if (inst.id === 'vader') sfx.playLightsaber();
                    else sfx.playLegoSnap();
                  }}
                  className={`px-2.5 py-1 rounded-full font-bold transition-all flex items-center gap-1 ${
                    character === inst.id
                      ? 'bg-white dark:bg-zinc-900 text-slate-900 dark:text-white shadow-sm'
                      : 'text-slate-500 dark:text-zinc-400 hover:text-slate-900'
                  }`}
                  title={inst.name}
                >
                  <span>{inst.icon}</span>
                </button>
              ))}
            </div>

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

        {/* ── Exercise Navigation Pills (The 4 MVP Moves) ── */}
        <div className="flex items-center justify-between bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 rounded-2xl p-1.5 shadow-sm">
          {WORKOUT_MOVES.map((move, idx) => {
            const isCurrent = currentMoveIdx === idx;
            return (
              <button
                key={move.id}
                onClick={() => handleSelectMove(idx)}
                className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all text-center ${
                  isCurrent
                    ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20'
                    : 'text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {move.title.split(' ')[0]}
              </button>
            );
          })}
        </div>

        {/* ── Seven Main Card ── */}
        <div className="bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 rounded-3xl p-6 shadow-sm flex flex-col items-center text-center space-y-4">
          
          {/* Move Info */}
          <div>
            <div className="text-[11px] font-bold uppercase tracking-widest text-slate-400 dark:text-zinc-500">
              Exercise {currentMoveIdx + 1} of {WORKOUT_MOVES.length}
            </div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight mt-0.5">
              {currentMove.title}
            </h1>
            <p className="text-xs text-slate-500 dark:text-zinc-400">
              {currentMove.subtitle}
            </p>
          </div>

          {/* Seven Studio Display (Real Human Athlete + Comical 3D Avatars) */}
          <SevenStudioViewer
            character={character}
            exercise={currentMove.id}
            isPlaying={isActive}
            roastData={roastData}
            onTriggerRoast={handleFetchRoast}
            isLoadingRoast={isLoadingRoast}
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
                  <span>PAUSE WORKOUT</span>
                </>
              ) : (
                <>
                  <Play className="w-5 h-5 fill-current" />
                  <span>START SET</span>
                </>
              )}
            </button>

            <button
              onClick={() => handleSelectMove((currentMoveIdx + 1) % WORKOUT_MOVES.length)}
              className="p-3.5 rounded-2xl bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 hover:bg-slate-200 dark:hover:bg-zinc-700 transition-colors"
              title="Next exercise"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

        </div>

      </div>

      {/* ── Footer ── */}
      <footer className="text-center py-4 text-[11px] text-slate-400 dark:text-zinc-600">
        Seven: Roast Edition • Built with Gemini 3.6 Flash & Cloudflare
      </footer>
    </div>
  );
}
