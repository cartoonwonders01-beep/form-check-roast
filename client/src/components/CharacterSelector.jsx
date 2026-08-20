import { Check } from 'lucide-react';

const CHARACTERS = [
  {
    id: 'duck',
    name: 'Coach Quack',
    animal: 'Duck 🦆',
    tagline: 'Sarcastic & quacks at shallow depth',
    badge: 'SARCASTIC',
    color: 'from-amber-500/20 to-yellow-500/20 border-yellow-500/30 text-yellow-400'
  },
  {
    id: 'cow',
    name: 'Bovine Bob',
    animal: 'Cow 🐄',
    tagline: 'Muscle mass & strict form enforcement',
    badge: 'HYPERTROPHY',
    color: 'from-slate-500/20 to-zinc-500/20 border-zinc-400/30 text-zinc-300'
  },
  {
    id: 'bear',
    name: 'Grizzly Bruno',
    animal: 'Bear 🐻',
    tagline: 'Powerlifting veteran who hates half-reps',
    badge: 'STRENGTH',
    color: 'from-amber-800/20 to-orange-950/20 border-amber-700/30 text-amber-500'
  },
  {
    id: 'frog',
    name: 'Sensei Hop',
    animal: 'Frog 🐸',
    tagline: 'Zen master of joint mobility & deep ROM',
    badge: 'MOBILITY',
    color: 'from-emerald-500/20 to-green-500/20 border-emerald-500/30 text-emerald-400'
  },
  {
    id: 'human',
    name: 'Coach Max',
    animal: 'Human 🧍',
    tagline: 'High-octane drill sergeant energy',
    badge: 'TACTICAL',
    color: 'from-blue-500/20 to-cyan-500/20 border-blue-500/30 text-blue-400'
  }
];

export default function CharacterSelector({ selected, onSelect }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5">
      {CHARACTERS.map((char) => {
        const isSelected = selected === char.id;
        return (
          <button
            key={char.id}
            onClick={() => onSelect(char.id)}
            className={`relative p-3 rounded-xl border text-left transition-all duration-200 flex flex-col justify-between ${
              isSelected
                ? `bg-gradient-to-b ${char.color} border-white shadow-xl scale-[1.03]`
                : 'bg-white/5 border-white/5 hover:bg-white/10 opacity-70 hover:opacity-100'
            }`}
          >
            {isSelected && (
              <div className="absolute top-2 right-2 w-4 h-4 rounded-full bg-white text-black flex items-center justify-center shadow">
                <Check className="w-3 h-3 stroke-[3]" />
              </div>
            )}

            <div>
              <div className="text-xl mb-1">{char.animal.split(' ')[1]}</div>
              <div className="text-xs font-bold text-white tracking-tight">{char.name}</div>
              <div className="text-[10px] text-gray-400 line-clamp-2 mt-0.5">{char.tagline}</div>
            </div>

            <div className="mt-2.5">
              <span className="text-[9px] font-mono font-black uppercase px-2 py-0.5 rounded bg-black/40 border border-white/10 text-gray-300">
                {char.badge}
              </span>
            </div>
          </button>
        );
      })}
    </div>
  );
}
