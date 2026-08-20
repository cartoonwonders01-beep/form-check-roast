import { Volume2, Sparkles, AlertCircle, RefreshCw } from 'lucide-react';

export default function SevenRoastCard({ 
  roastData, 
  character, 
  onRoastAgain,
  isLoading 
}) {
  const { roast, correction, issue, severity } = roastData || {};

  const speakRoast = () => {
    if ('speechSynthesis' in window && roast) {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(`${roast} Correction: ${correction}`);
      u.rate = 1.0;
      u.pitch = character === 'duck' ? 1.3 : character === 'vader' ? 0.7 : 1.1;
      window.speechSynthesis.speak(u);
    }
  };

  const getCharName = () => {
    if (character === 'lego') return '🧱 Lego Coach Brick';
    if (character === 'vader') return '⚔️ Lord Vader';
    return '🦆 Coach Quack';
  };

  return (
    <div className="w-full bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-5 shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-zinc-200">
            {getCharName()}
          </span>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-orange-500/10 text-orange-600 dark:text-orange-400 font-bold uppercase">
            Form Check
          </span>
        </div>

        <button
          onClick={speakRoast}
          className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-500 dark:text-zinc-400 transition-colors"
          title="Play voice"
        >
          <Volume2 className="w-4 h-4 text-orange-500" />
        </button>
      </div>

      <p className="text-base md:text-lg font-bold text-slate-900 dark:text-white leading-snug">
        "{roast}"
      </p>

      <div className="bg-slate-50 dark:bg-zinc-800/60 rounded-2xl p-3.5 border border-slate-100 dark:border-zinc-700/40 space-y-1">
        <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-400 flex items-center gap-1.5">
          <Sparkles className="w-3 h-3 text-orange-500" />
          Pro Correction Cue
        </div>
        <p className="text-xs text-slate-700 dark:text-zinc-200 font-medium">
          {correction}
        </p>
      </div>

      <div className="flex items-center justify-between pt-1 border-t border-slate-100 dark:border-zinc-800 text-xs">
        <span className="text-[11px] text-slate-400 dark:text-zinc-500 font-mono">
          Defect: {issue || 'Alignment'}
        </span>
        <button
          onClick={onRoastAgain}
          disabled={isLoading}
          className="text-xs font-bold text-orange-500 hover:text-orange-600 dark:hover:text-orange-400 flex items-center gap-1 transition-colors"
        >
          <RefreshCw className={`w-3 h-3 ${isLoading ? 'animate-spin' : ''}`} />
          <span>New Roast</span>
        </button>
      </div>
    </div>
  );
}
