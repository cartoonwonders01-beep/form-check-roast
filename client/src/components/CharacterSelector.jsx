import { useState } from 'react';
import { Check, Box, Swords, PawPrint } from 'lucide-react';
import { sfx } from '../utils/audioEffects';

const UNIVERSES = [
  { id: 'lego', label: 'Lego Minifigs', icon: Box, color: 'text-yellow-400' },
  { id: 'starwars', label: 'Galactic Empire', icon: Swords, color: 'text-red-400' },
  { id: 'animals', label: 'Wild Kingdom', icon: PawPrint, color: 'text-emerald-400' },
];

const ROSTER = {
  lego: [
    {
      id: 'lego_brick',
      name: 'Brick Strong',
      avatar: '🧱',
      sub: 'Lego Gym Bro',
      desc: 'Snaps together tight core planks',
      quote: 'If your hips sag, you scatter into loose bricks!'
    },
    {
      id: 'lego_batman',
      name: 'Lego Dark Knight',
      avatar: '🦇',
      sub: 'Gotham Calisthenics',
      desc: 'Brooding form perfection in black & yellow',
      quote: 'I only work in black. And sometimes very dark gray.'
    }
  ],
  starwars: [
    {
      id: 'vader',
      name: 'Lord Vader',
      avatar: '⚔️',
      sub: 'Sith Commander',
      desc: 'Lightsaber-straight spine alignment',
      quote: 'I find your lack of core tension disturbing.'
    },
    {
      id: 'yoda',
      name: 'Master Yoda',
      avatar: '🧙‍♂️',
      sub: 'Grand Jedi Master',
      desc: 'Deep your squat must be, or fall you will',
      quote: 'Do or do not, there is no half-rep.'
    },
    {
      id: 'stormtrooper',
      name: 'TK-421',
      avatar: '🪖',
      sub: 'Imperial Cadet',
      desc: 'Misses the target depth on every single rep',
      quote: 'These aren\'t the push-ups you\'re looking for.'
    }
  ],
  animals: [
    {
      id: 'duck',
      name: 'Coach Quack',
      avatar: '🦆',
      sub: 'Sarcastic Duck',
      desc: 'Quacks aggressively at elbow flaring',
      quote: 'QUACK! Even floating on a pond I hold a better line.'
    },
    {
      id: 'bear',
      name: 'Grizzly Bruno',
      avatar: '🐻',
      sub: 'Powerlifter Bear',
      desc: 'Strict depth & heavy locked biomechanics',
      quote: 'Depth is non-negotiable. Drop to the floor!'
    }
  ]
};

export default function CharacterSelector({ selected, onSelect }) {
  const [activeUniverse, setActiveUniverse] = useState('lego');

  const handleSelect = (charId) => {
    if (activeUniverse === 'starwars') {
      sfx.playLightsaber();
    } else if (activeUniverse === 'lego') {
      sfx.playLegoSnap();
    } else {
      sfx.playWhistle();
    }
    onSelect(charId);
  };

  return (
    <div className="space-y-3">
      {/* ── Universe Tab Bar ── */}
      <div className="flex items-center gap-1.5 p-1 bg-black/50 border border-white/10 rounded-xl">
        {UNIVERSES.map((u) => {
          const Icon = u.icon;
          const isActive = activeUniverse === u.id;
          return (
            <button
              key={u.id}
              onClick={() => setActiveUniverse(u.id)}
              className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-mono font-bold flex items-center justify-center gap-1.5 transition-all ${
                isActive
                  ? 'bg-white/10 text-white border border-white/15 shadow-md'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${u.color}`} />
              <span>{u.label}</span>
            </button>
          );
        })}
      </div>

      {/* ── Character Roster Cards ── */}
      <div className="grid grid-cols-2 gap-2">
        {ROSTER[activeUniverse].map((char) => {
          const isSelected = selected === char.id;
          return (
            <button
              key={char.id}
              onClick={() => handleSelect(char.id)}
              className={`relative p-3 rounded-xl border text-left transition-all duration-200 flex flex-col justify-between ${
                isSelected
                  ? 'bg-gradient-to-b from-white/15 to-white/5 border-white shadow-xl scale-[1.02]'
                  : 'bg-white/5 border-white/5 hover:bg-white/10 opacity-75 hover:opacity-100'
              }`}
            >
              {isSelected && (
                <div className="absolute top-2 right-2 w-4 h-4 rounded-full bg-white text-black flex items-center justify-center shadow">
                  <Check className="w-3 h-3 stroke-[3]" />
                </div>
              )}

              <div>
                <div className="text-2xl mb-1">{char.avatar}</div>
                <div className="text-xs font-bold text-white tracking-tight">{char.name}</div>
                <div className="text-[10px] font-mono text-cyan-400 mt-0.5">{char.sub}</div>
              </div>

              <div className="mt-2 text-[10px] text-gray-400 italic line-clamp-2">
                "{char.quote}"
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
