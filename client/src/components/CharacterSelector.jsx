const CHARACTERS = [
  { id: 'human', label: 'Coach', emoji: '🧍', description: 'Serious & perfect' },
  { id: 'duck',  label: 'Duck',  emoji: '🦆', description: 'Wobbly but trying' },
  { id: 'cow',   label: 'Cow',   emoji: '🐄', description: 'Slow & deliberate' },
  { id: 'frog',  label: 'Frog',  emoji: '🐸', description: 'Extra enthusiastic' },
  { id: 'bear',  label: 'Bear',  emoji: '🐻', description: 'Big & intimidating' },
];

export default function CharacterSelector({ selected, onSelect }) {
  return (
    <div className="grid grid-cols-5 gap-2">
      {CHARACTERS.map((char) => (
        <button
          key={char.id}
          onClick={() => onSelect(char.id)}
          title={`${char.label}: ${char.description}`}
          className={`
            flex flex-col items-center gap-1 p-2 rounded-xl border transition-all duration-200
            hover:scale-110 hover:border-roast-orange
            ${selected === char.id
              ? 'border-roast-orange bg-orange-500/20 scale-110'
              : 'border-roast-border bg-transparent'
            }
          `}
        >
          <span className="text-2xl">{char.emoji}</span>
          <span className="text-xs text-gray-400 hidden sm:block">{char.label}</span>
        </button>
      ))}
    </div>
  );
}
