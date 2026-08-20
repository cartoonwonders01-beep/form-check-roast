const LOADING_LINES = [
  "Consulting the gains goblin...",
  "Analyzing your crime against biomechanics...",
  "Calculating the damage...",
  "Running biomechanical forensics...",
  "Waking up the roast committee...",
  "AI is cringing as we speak...",
  "Summoning Gordon Ramsay's gym alter ego...",
];

import { useEffect, useState } from 'react';

export default function LoadingRoast() {
  const [lineIndex, setLineIndex] = useState(0);
  const [dots, setDots] = useState('');

  useEffect(() => {
    const lineTimer = setInterval(() => {
      setLineIndex((i) => (i + 1) % LOADING_LINES.length);
    }, 900);

    const dotTimer = setInterval(() => {
      setDots((d) => (d.length >= 3 ? '' : d + '.'));
    }, 400);

    return () => {
      clearInterval(lineTimer);
      clearInterval(dotTimer);
    };
  }, []);

  return (
    <div className="glass-card p-8 flex flex-col items-center gap-4">
      {/* Spinning fire */}
      <div className="text-5xl animate-fire select-none">🔥</div>

      {/* Loading text */}
      <p className="font-display text-xl text-center tracking-wider"
         style={{ color: '#FF6B35' }}>
        {LOADING_LINES[lineIndex]}{dots}
      </p>

      {/* Progress bar */}
      <div className="w-full h-1.5 bg-roast-border rounded-full overflow-hidden">
        <div
          className="h-full rounded-full"
          style={{
            background: 'linear-gradient(90deg, #FF6B35, #FFD93D)',
            animation: 'progress-fill 2s ease-in-out infinite',
            width: '60%',
          }}
        />
      </div>

      <style>{`
        @keyframes progress-fill {
          0% { width: 10%; margin-left: 0%; }
          50% { width: 60%; margin-left: 20%; }
          100% { width: 10%; margin-left: 90%; }
        }
      `}</style>

      <p className="text-xs text-gray-600">This may take a moment — Gemini is judging you thoroughly</p>
    </div>
  );
}
