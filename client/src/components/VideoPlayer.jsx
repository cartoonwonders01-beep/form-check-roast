export default function VideoPlayer({ videoId }) {
  return (
    <div className="glass-card overflow-hidden">
      <div className="bg-black flex items-center justify-between px-4 py-2">
        <span className="font-display text-sm tracking-wider" style={{ color: '#FF6B35' }}>
          📹 EXHIBIT A — THE CRIME SCENE
        </span>
        <span className="text-xs text-gray-500">push-up form check</span>
      </div>

      {/* YouTube embed — responsive 16:9 */}
      <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
        <iframe
          className="absolute inset-0 w-full h-full"
          src={`https://www.youtube.com/embed/${videoId}?autoplay=0&rel=0&modestbranding=1`}
          title="Push-up form check video"
          allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>

      <div className="px-4 py-3 flex items-center gap-2 border-t border-roast-border">
        <span className="text-yellow-400 text-sm">⚠️</span>
        <span className="text-xs text-gray-400">
          Viewer discretion advised — this form is a war crime against biomechanics.
        </span>
      </div>
    </div>
  );
}
