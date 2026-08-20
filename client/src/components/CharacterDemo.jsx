// ---------------------------------------------------------------------------
// SVG character bodies — each character is a unique inline SVG
// The pushup animation is applied via CSS keyframes defined in tailwind.config.js
// ---------------------------------------------------------------------------

const characters = {
  human: {
    label: 'Coach Human',
    tagline: 'Perfect form, perfect attitude.',
    animClass: 'animate-pushup-human',
    color: '#60a5fa',
    svg: (
      <svg viewBox="0 0 120 80" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        {/* Head */}
        <circle cx="60" cy="12" r="10" fill="#FBBF24" />
        {/* Hair */}
        <rect x="52" y="4" width="16" height="5" rx="3" fill="#92400E" />
        {/* Eyes */}
        <circle cx="56" cy="11" r="1.5" fill="#1e293b" />
        <circle cx="64" cy="11" r="1.5" fill="#1e293b" />
        {/* Smile */}
        <path d="M56 15 Q60 18 64 15" stroke="#1e293b" strokeWidth="1.2" fill="none" />
        {/* Body / torso in plank */}
        <rect x="35" y="22" width="50" height="14" rx="6" fill="#60a5fa" />
        {/* Arms */}
        <rect x="28" y="30" width="12" height="22" rx="5" fill="#FBBF24" />
        <rect x="80" y="30" width="12" height="22" rx="5" fill="#FBBF24" />
        {/* Hands */}
        <circle cx="34" cy="54" r="5" fill="#FBBF24" />
        <circle cx="86" cy="54" r="5" fill="#FBBF24" />
        {/* Legs */}
        <rect x="42" y="36" width="12" height="28" rx="5" fill="#1d4ed8" />
        <rect x="66" y="36" width="12" height="28" rx="5" fill="#1d4ed8" />
        {/* Feet */}
        <ellipse cx="48" cy="65" rx="7" ry="4" fill="#1e293b" />
        <ellipse cx="72" cy="65" rx="7" ry="4" fill="#1e293b" />
        {/* "Perfect" badge */}
        <text x="60" y="78" textAnchor="middle" fontSize="7" fill="#60a5fa" fontWeight="bold">PERFECT FORM</text>
      </svg>
    ),
  },

  duck: {
    label: 'Duck',
    tagline: 'QUACK! (Translation: tuck those elbows!)',
    animClass: 'animate-pushup-duck',
    color: '#FDE047',
    svg: (
      <svg viewBox="0 0 120 80" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        {/* Body */}
        <ellipse cx="60" cy="42" rx="32" ry="20" fill="#FDE047" />
        {/* Head */}
        <circle cx="88" cy="22" r="14" fill="#FDE047" />
        {/* Bill */}
        <ellipse cx="101" cy="24" rx="9" ry="5" fill="#f97316" />
        {/* Eye */}
        <circle cx="91" cy="18" r="3" fill="#1e293b" />
        <circle cx="92" cy="17" r="1" fill="white" />
        {/* Wing left */}
        <ellipse cx="38" cy="44" rx="10" ry="6" fill="#ca8a04" transform="rotate(-15 38 44)" />
        {/* Wing right */}
        <ellipse cx="82" cy="44" rx="10" ry="6" fill="#ca8a04" transform="rotate(15 82 44)" />
        {/* Feet / hands on ground */}
        <ellipse cx="38" cy="62" rx="10" ry="5" fill="#f97316" />
        <ellipse cx="82" cy="62" rx="10" ry="5" fill="#f97316" />
        {/* Neck */}
        <rect x="74" y="28" width="10" height="18" rx="5" fill="#FDE047" />
        {/* Sweat drop */}
        <ellipse cx="95" cy="10" rx="3" ry="4" fill="#7dd3fc" />
        <text x="60" y="78" textAnchor="middle" fontSize="7" fill="#FDE047" fontWeight="bold">QUACK QUACK</text>
      </svg>
    ),
  },

  cow: {
    label: 'Cow',
    tagline: 'Slow is smooth. Smooth is moooo-ving.',
    animClass: 'animate-pushup-cow',
    color: '#e2e8f0',
    svg: (
      <svg viewBox="0 0 120 80" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        {/* Body */}
        <ellipse cx="60" cy="42" rx="35" ry="19" fill="white" stroke="#d1d5db" strokeWidth="1" />
        {/* Black spots */}
        <ellipse cx="50" cy="38" rx="10" ry="7" fill="#374151" />
        <ellipse cx="75" cy="46" rx="8" ry="5" fill="#374151" />
        {/* Head */}
        <ellipse cx="88" cy="25" rx="16" ry="13" fill="white" stroke="#d1d5db" strokeWidth="1" />
        {/* Ears */}
        <ellipse cx="75" cy="16" rx="5" ry="7" fill="#fca5a5" />
        <ellipse cx="101" cy="16" rx="5" ry="7" fill="#fca5a5" />
        {/* Eyes */}
        <circle cx="84" cy="22" r="3" fill="#1e293b" />
        <circle cx="85" cy="21" r="1" fill="white" />
        {/* Nose */}
        <ellipse cx="91" cy="30" rx="7" ry="5" fill="#fca5a5" />
        <circle cx="88" cy="31" r="1.5" fill="#9f1239" />
        <circle cx="94" cy="31" r="1.5" fill="#9f1239" />
        {/* Hooves / hands */}
        <ellipse cx="30" cy="62" rx="9" ry="5" fill="#374151" />
        <ellipse cx="90" cy="62" rx="9" ry="5" fill="#374151" />
        {/* Udder hint */}
        <ellipse cx="55" cy="59" rx="10" ry="5" fill="#fca5a5" />
        <text x="60" y="78" textAnchor="middle" fontSize="7" fill="#e2e8f0" fontWeight="bold">MOOOO</text>
      </svg>
    ),
  },

  frog: {
    label: 'Frog',
    tagline: 'Going extra deep — that\'s called a deficit push-up, king.',
    animClass: 'animate-pushup-frog',
    color: '#4ade80',
    svg: (
      <svg viewBox="0 0 120 80" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        {/* Body */}
        <ellipse cx="60" cy="44" rx="28" ry="18" fill="#4ade80" />
        {/* Head */}
        <ellipse cx="60" cy="24" rx="20" ry="16" fill="#4ade80" />
        {/* Eyes (bulging) */}
        <circle cx="48" cy="16" r="8" fill="white" stroke="#166534" strokeWidth="1" />
        <circle cx="72" cy="16" r="8" fill="white" stroke="#166534" strokeWidth="1" />
        <circle cx="48" cy="16" r="4" fill="#1e293b" />
        <circle cx="72" cy="16" r="4" fill="#1e293b" />
        <circle cx="50" cy="14" r="1.5" fill="white" />
        <circle cx="74" cy="14" r="1.5" fill="white" />
        {/* Mouth — huge grin */}
        <path d="M44 30 Q60 40 76 30" stroke="#166534" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        {/* Arms */}
        <rect x="18" y="36" width="10" height="22" rx="5" fill="#16a34a" />
        <rect x="92" y="36" width="10" height="22" rx="5" fill="#16a34a" />
        {/* Hands (webbed) */}
        <ellipse cx="23" cy="60" rx="9" ry="4" fill="#16a34a" />
        <ellipse cx="97" cy="60" rx="9" ry="4" fill="#16a34a" />
        {/* Hind legs folded */}
        <ellipse cx="44" cy="62" rx="8" ry="4" fill="#16a34a" />
        <ellipse cx="76" cy="62" rx="8" ry="4" fill="#16a34a" />
        {/* Belly */}
        <ellipse cx="60" cy="48" rx="16" ry="10" fill="#86efac" />
        <text x="60" y="78" textAnchor="middle" fontSize="7" fill="#4ade80" fontWeight="bold">RIBBIT!</text>
      </svg>
    ),
  },

  bear: {
    label: 'Bear',
    tagline: 'Slow reps, heavy gains. ROAR.',
    animClass: 'animate-pushup-bear',
    color: '#a16207',
    svg: (
      <svg viewBox="0 0 120 80" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        {/* Body — massive */}
        <ellipse cx="60" cy="46" rx="38" ry="22" fill="#92400E" />
        {/* Head */}
        <circle cx="60" cy="22" r="18" fill="#92400E" />
        {/* Ears */}
        <circle cx="44" cy="8" r="8" fill="#92400E" />
        <circle cx="44" cy="8" r="5" fill="#78350F" />
        <circle cx="76" cy="8" r="8" fill="#92400E" />
        <circle cx="76" cy="8" r="5" fill="#78350F" />
        {/* Face */}
        <ellipse cx="60" cy="27" rx="11" ry="8" fill="#78350F" />
        {/* Eyes */}
        <circle cx="52" cy="19" r="3.5" fill="#1e293b" />
        <circle cx="68" cy="19" r="3.5" fill="#1e293b" />
        <circle cx="53" cy="18" r="1.2" fill="white" />
        <circle cx="69" cy="18" r="1.2" fill="white" />
        {/* Nose */}
        <ellipse cx="60" cy="26" rx="5" ry="3.5" fill="#1e293b" />
        {/* Paws */}
        <circle cx="28" cy="64" r="11" fill="#78350F" />
        <circle cx="92" cy="64" r="11" fill="#78350F" />
        {/* Claws */}
        <line x1="22" y1="72" x2="20" y2="76" stroke="#1e293b" strokeWidth="1.5" />
        <line x1="28" y1="74" x2="28" y2="78" stroke="#1e293b" strokeWidth="1.5" />
        <line x1="34" y1="72" x2="36" y2="76" stroke="#1e293b" strokeWidth="1.5" />
        <line x1="86" y1="72" x2="84" y2="76" stroke="#1e293b" strokeWidth="1.5" />
        <line x1="92" y1="74" x2="92" y2="78" stroke="#1e293b" strokeWidth="1.5" />
        <line x1="98" y1="72" x2="100" y2="76" stroke="#1e293b" strokeWidth="1.5" />
        <text x="60" y="78" textAnchor="middle" fontSize="7" fill="#a16207" fontWeight="bold">ROAAAAR</text>
      </svg>
    ),
  },
};

export default function CharacterDemo({ character, isActive }) {
  const config = characters[character] || characters.duck;

  return (
    <div className="flex flex-col items-center w-full gap-3">
      {/* Character name */}
      <div className="text-center">
        <span
          className="font-display text-xl tracking-wider"
          style={{ color: config.color }}
        >
          {config.label}
        </span>
      </div>

      {/* Animated SVG */}
      <div
        className={`w-40 h-28 transition-all duration-300 ${
          isActive ? config.animClass : ''
        }`}
        title={config.tagline}
      >
        {config.svg}
      </div>

      {/* Tagline */}
      {isActive && (
        <p className="text-center text-xs text-gray-400 italic px-2 animate-slide-up">
          "{config.tagline}"
        </p>
      )}

      {!isActive && (
        <p className="text-center text-xs text-gray-600 italic">
          Hit "Roast My Form" to activate your coach
        </p>
      )}

      {/* Push-up label */}
      {isActive && (
        <div
          className="text-xs font-bold tracking-widest uppercase animate-slide-up"
          style={{ color: config.color }}
        >
          ↑↓ Correct Push-Up Form
        </div>
      )}
    </div>
  );
}
