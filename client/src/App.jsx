import { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, Flame, Moon, Sun, ChevronRight, CheckCircle2 } from 'lucide-react';
import SevenCharacterViewer from './components/SevenCharacterViewer';
import SevenTimerRing from './components/SevenTimerRing';
import SevenRoastCard from './components/SevenRoastCard';
import { sfx } from './utils/audioEffects';

const WORKOUT_MOVES = [
  { id: 'pushup', title: 'Press-ups', subtitle: 'Chest & Core Plank', duration: 30 },
  { id: 'squat', title: 'Air Squats', subtitle: 'Quads & Glutes', duration: 30 },
  { id: 'situp', title: 'Sit-ups', subtitle: 'Abdominal Crunch', duration: 30 },
  { id: 'plank', title: 'Plank Hold', subtitle: 'Isometric Stability', duration: 30 },
];

const INSTRUCTORS = [
  { id: 'lego', name: 'Lego Coach', icon: '🧱' },
  { id: 'vader', name: 'Lord Vader', icon: '⚔️' },
  { id: 'duck', name: 'Coach Duck', icon: '🦆' },
];

export default function App() {
  const [currentMoveIdx, setCurrentMoveIdx] = useState(0);
  const [character, setCharacter] = useState('lego');
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
      if (!isRest) {
        // Move to Rest
        sfx.playRepSuccess();
        setIsRest(true);
        setSecondsLeft(10);
      } else {
        // Move to Next Exercise
        sfx.playLegoSnap();
        setIsRest(false);
        const nextIdx = (currentMoveIdx + 1) % WORKOUT_MOVES.length;
        setCurrentMoveIdx(nextIdx);
        setSecondsLeft(WORKOUT_MOVES[nextIdx].duration);
      }
    }
    return () => clearInterval(timer);
  }, [isActive, secondsLeft, isRest, currentMoveIdx]);

  const toggleTimer = () => {
    sfx.playLegoSnap();
    setIsActive(!isActive);
  };

  const resetTimer = () => {
    setIsActive(false);
    setIsRest(false);
    setSecondsLeft(currentMove.duration);
    setRoastData(null);
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
          character: character === 'lego' ? 'lego_brick' : character,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setRoastData(data.data);
      }
    } catch (err) {
      setRoastData({
        roast: "Your form has less structural integrity than loose plastic on a rug.",
        correction: "Lock your core and maintain full range of motion.",
        severity: "savage",
        issue: "Core breakdown"
      });
    } finally {
      setIsLoadingRoast(false);
    }
  };

  return (
    <div className={`${isDarkMode ? 'dark' : ''} min-h-screen bg-[#F8FAFC] dark:bg-[#090A0E] text-slate-900 dark:text-white transition-colors duration-200 font-sans flex flex-col items-center justify-start p-4 sm:p-6`}>
      
      {/* ── Seven-Style Container Frame ── */}
      <div className="w-full max-w-md flex flex-col space-y-4">

        {/* ── Top Header ── */}
        <header className="flex items-center justify-between pt-2">
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
              className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-zinc-800 text-slate-500 dark:text-zinc-400 transition-colors"
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

          {/* Animated Character Avatar */}
          <SevenCharacterViewer
            character={character}
            exercise={currentMove.id}
            isPlaying={isActive}
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
              onClick={toggleTimer}
              className={`flex-1 py-4 rounded-2xl font-black text-sm uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg ${
                isActive
                  ? 'bg-slate-900 dark:bg-zinc-100 text-white dark:text-slate-900 hover:opacity-90'
                  : 'bg-orange-500 text-white hover:bg-orange-600 shadow-orange-500/25'
              }`}
            >
              {isActive ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
              <span>{isActive ? 'Pause Workout' : 'Start Set'}</span>
            </button>

            <button
              onClick={handleFetchRoast}
              disabled={isLoadingRoast}
              className="p-3.5 rounded-2xl bg-orange-500/10 border border-orange-500/20 text-orange-600 dark:text-orange-400 hover:bg-orange-500/20 transition-colors"
              title="Roast my form"
            >
              <Flame className="w-5 h-5 fill-current" />
            </button>
          </div>

        </div>

        {/* ── Coach Roast Dialogue Card ── */}
        {roastData && (
          <SevenRoastCard
            roastData={roastData}
            character={character}
            onRoastAgain={handleFetchRoast}
            isLoading={isLoadingRoast}
          />
        )}

      </div>
    </div>
  );
}
