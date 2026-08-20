const SEVERITY_CONFIG = {
  mild: {
    label: 'MILD',
    emoji: '😬',
    color: 'text-yellow-400',
    bg: 'bg-yellow-400/10 border-yellow-400/30',
    glow: 'rgba(250,204,21,0.3)',
  },
  medium: {
    emoji: '💀',
    label: 'ROASTED',
    color: 'text-orange-400',
    bg: 'bg-orange-400/10 border-orange-400/30',
    glow: 'rgba(251,146,60,0.3)',
  },
  savage: {
    emoji: '🔥',
    label: 'ABSOLUTELY COOKED',
    color: 'text-red-400',
    bg: 'bg-red-500/10 border-red-500/30',
    glow: 'rgba(239,68,68,0.3)',
  },
};

export default function RoastCard({ data }) {
  const config = SEVERITY_CONFIG[data.severity] || SEVERITY_CONFIG.medium;

  return (
    <div
      className="glass-card p-6 animate-bounce-in"
      style={{ boxShadow: `0 0 40px ${config.glow}` }}
    >
      {/* Severity badge */}
      <div className="flex items-center justify-between mb-4">
        <span className={`severity-badge border ${config.bg} ${config.color}`}>
          {config.emoji} {config.label}
        </span>
        <span className="text-xs text-gray-600 uppercase tracking-widest">
          {data.issue}
        </span>
      </div>

      {/* The Roast */}
      <div className="mb-5">
        <p className="text-xs text-gray-500 uppercase tracking-widest mb-2">🎤 The Roast</p>
        <blockquote
          className="font-display text-2xl md:text-3xl leading-tight animate-shake"
          style={{ color: '#FF6B35' }}
        >
          "{data.roast}"
        </blockquote>
      </div>

      {/* Divider */}
      <div className="border-t border-roast-border my-4" />

      {/* The Correction */}
      <div>
        <p className="text-xs text-gray-500 uppercase tracking-widest mb-2">💡 The Fix</p>
        <p className="text-white text-base leading-relaxed">
          {data.correction}
        </p>
      </div>
    </div>
  );
}
