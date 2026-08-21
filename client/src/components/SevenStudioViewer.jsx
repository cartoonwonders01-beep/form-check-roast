import { Flame, Volume2, Sparkles, User, Box, Swords } from 'lucide-react';
import SevenVectorHumanoid from './SevenVectorHumanoid';
import ThreeCharacterStudio from './ThreeCharacterStudio';

export default function SevenStudioViewer({
  character = 'humanoid',
  exercise = 'pushup',
  isPlaying = true,
  roastData,
  onTriggerRoast,
  isLoadingRoast
}) {
  const speakRoast = () => {
    if ('speechSynthesis' in window && roastData?.roast) {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(`${roastData.roast} Correction: ${roastData.correction}`);
      u.rate = 1.0;
      u.pitch = character === 'duck' ? 1.3 : character === 'vader' ? 0.7 : character === 'woody' ? 1.2 : 1.05;
      window.speechSynthesis.speak(u);
    }
  };

  const isRealHuman = character === 'humanoid';

  return (
    <div className="space-y-3 w-full">
      {/* ── Studio Center Display ── */}
      <div className="relative w-full">
        {isRealHuman ? (
          /* ── 1. SEVEN.APP ATHLETIC VECTOR HUMANOID ── */
          <div className="relative w-full">
            <SevenVectorHumanoid exercise={exercise} isPlaying={isPlaying} />

            {/* Coach Alex Badge */}
            <div className="absolute top-3 left-3 bg-white/80 dark:bg-zinc-800/80 backdrop-blur-md px-2.5 py-1 rounded-full border border-slate-200/60 dark:border-zinc-700/60 flex items-center gap-1.5 shadow-sm pointer-events-none">
              <User className="w-3 h-3 text-orange-500" />
              <span className="text-[10px] font-mono font-bold tracking-wider text-slate-700 dark:text-zinc-200 uppercase">
                COACH ALEX • PERFECT FORM
              </span>
            </div>
          </div>
        ) : (
          /* ── 2. COMICAL 3D UNIVERSE (Lego, Woody, Vader) ── */
          <ThreeCharacterStudio
            character={character}
            exercise={exercise}
            isPlaying={isPlaying}
            roastData={null}
            onTriggerRoast={onTriggerRoast}
            isLoadingRoast={isLoadingRoast}
          />
        )}

        {/* Floating One-Tap Roast Trigger Button */}
        <button
          onClick={onTriggerRoast}
          disabled={isLoadingRoast}
          className="absolute bottom-3 right-3 py-1.5 px-3.5 rounded-full bg-orange-500 hover:bg-orange-600 active:scale-95 text-white text-xs font-bold shadow-lg shadow-orange-500/30 flex items-center gap-1.5 transition-all z-10"
        >
          <Flame className={`w-3.5 h-3.5 fill-current ${isLoadingRoast ? 'animate-spin' : ''}`} />
          <span>{isLoadingRoast ? 'Roasting...' : 'Roast My Form'}</span>
        </button>
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
