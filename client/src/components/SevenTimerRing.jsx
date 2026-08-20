export default function SevenTimerRing({ 
  secondsLeft, 
  totalSeconds, 
  isActive, 
  isRest,
  onToggleActive,
  onReset
}) {
  const radius = 68;
  const circumference = 2 * Math.PI * radius;
  const progress = (secondsLeft / totalSeconds) * circumference;
  const strokeColor = isRest ? '#3B82F6' : '#FF5722';

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col items-center justify-center my-2">
      <div className="relative w-44 h-44 flex items-center justify-center">
        {/* SVG Countdown Ring */}
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 160 160">
          {/* Background Track */}
          <circle
            cx="80"
            cy="80"
            r={radius}
            stroke="#E2E8F0"
            strokeWidth="8"
            fill="transparent"
            className="dark:stroke-zinc-800"
          />
          {/* Animated Countdown Stroke */}
          <circle
            cx="80"
            cy="80"
            r={radius}
            stroke={strokeColor}
            strokeWidth="8"
            strokeDasharray={circumference}
            strokeDashoffset={circumference - progress}
            strokeLinecap="round"
            fill="transparent"
            className="transition-all duration-300 ease-linear"
          />
        </svg>

        {/* Center Time & Status */}
        <div className="absolute flex flex-col items-center justify-center text-center">
          <span className="text-3xl font-black tracking-tight text-slate-900 dark:text-white font-mono">
            {formatTime(secondsLeft)}
          </span>
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400 mt-0.5">
            {isRest ? 'REST' : isActive ? 'WORK' : 'READY'}
          </span>
        </div>
      </div>
    </div>
  );
}
