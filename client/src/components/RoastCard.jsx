import { useEffect } from 'react';
import { Flame, ShieldAlert, Sparkles, Volume2, Share2, CheckCircle } from 'lucide-react';
import confetti from 'canvas-confetti';
import { sfx } from '../utils/audioEffects';

export default function RoastCard({ data, character }) {
  const { roast, correction, severity = 'savage', issue = 'form breakdown' } = data || {};

  useEffect(() => {
    if (severity === 'savage') {
      sfx.playBuzzer();
    } else {
      sfx.playWhistle();
    }

    if (severity === 'mild') {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.7 }
      });
    }
  }, [severity]);

  const badgeConfig = {
    savage: {
      label: 'SAVAGE CRITIQUE 🔥',
      bg: 'bg-red-500/10 border-red-500/30 text-red-400',
      glow: 'shadow-red-500/20'
    },
    medium: {
      label: 'MODERATE HEAT ⚡',
      bg: 'bg-amber-500/10 border-amber-500/30 text-amber-400',
      glow: 'shadow-amber-500/20'
    },
    mild: {
      label: 'ACCEPTABLE WORKOUT 💡',
      bg: 'bg-lime-500/10 border-lime-500/30 text-lime-400',
      glow: 'shadow-lime-500/20'
    }
  }[severity] || {
    label: 'ROAST COMPLETE',
    bg: 'bg-orange-500/10 border-orange-500/30 text-orange-400',
    glow: 'shadow-orange-500/20'
  };

  const speakRoast = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(`${roast}. Correction: ${correction}`);
      utterance.rate = 1.05;
      utterance.pitch = character === 'duck' ? 1.4 : character === 'bear' ? 0.7 : 1.0;
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className={`bg-gradient-to-b from-[#131722] to-[#0A0D14] border border-white/10 rounded-2xl p-6 shadow-2xl space-y-5 ${badgeConfig.glow}`}>
      {/* ── Top Header ── */}
      <div className="flex items-center justify-between">
        <div className={`px-3.5 py-1 rounded-full border text-xs font-mono font-bold uppercase tracking-wider ${badgeConfig.bg}`}>
          {badgeConfig.label}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={speakRoast}
            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white transition-colors"
            title="Read Roast Aloud"
          >
            <Volume2 className="w-4 h-4 text-cyan-400" />
          </button>
        </div>
      </div>

      {/* ── Savage Roast Text ── */}
      <div className="space-y-2">
        <div className="text-[11px] font-mono tracking-widest text-gray-400 uppercase flex items-center gap-1.5">
          <Flame className="w-3.5 h-3.5 text-orange-400" />
          COACH VERDICT
        </div>
        <p className="text-xl md:text-2xl font-black text-white leading-snug tracking-tight">
          "{roast}"
        </p>
      </div>

      {/* ── Actionable Biomechanical Correction ── */}
      <div className="bg-emerald-950/30 border border-emerald-500/20 rounded-xl p-4 space-y-1.5">
        <div className="text-[11px] font-mono text-emerald-400 tracking-wider uppercase font-bold flex items-center gap-1.5">
          <CheckCircle className="w-3.5 h-3.5" />
          HOW TO FIX YOUR BIOMECHANICS
        </div>
        <p className="text-sm text-emerald-200/90 font-medium leading-relaxed">
          {correction}
        </p>
      </div>

      {/* ── Issue Tag ── */}
      <div className="flex items-center justify-between text-xs text-gray-500 border-t border-white/5 pt-3">
        <span className="font-mono uppercase text-[10px]">Identified Defect:</span>
        <span className="font-mono text-gray-300 font-semibold uppercase">{issue}</span>
      </div>
    </div>
  );
}
