import { useState } from 'react';
import VideoPlayer from './components/VideoPlayer';
import RoastCard from './components/RoastCard';
import CharacterSelector from './components/CharacterSelector';
import CharacterDemo from './components/CharacterDemo';
import LoadingRoast from './components/LoadingRoast';

const EXERCISES = [
  { id: 'pushup', label: 'Push-up', icon: '🤸', demoVideoId: 'IODxDxX7oi4' },
  { id: 'pullup', label: 'Pull-up', icon: '🧗', demoVideoId: 'ba8tr1Pcqyo' },
  { id: 'squat', label: 'Squat', icon: '🏋️', demoVideoId: 'bEv6CCg2BC8' },
  { id: 'dips', label: 'Dips', icon: '🪑', demoVideoId: '2z8JmcrW-As' },
];

export default function App() {
  const [exercise, setExercise] = useState('pushup');
  const [character, setCharacter] = useState('duck');
  const [videoSource, setVideoSource] = useState('demo');
  const [uploadedVideoUrl, setUploadedVideoUrl] = useState(null);
  const [roastData, setRoastData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasRoasted, setHasRoasted] = useState(false);

  const currentExerciseObj = EXERCISES.find(e => e.id === exercise) || EXERCISES[0];

  const handleRoast = async () => {
    setIsLoading(true);
    setRoastData(null);
    setHasRoasted(false);

    try {
      const res = await fetch('/api/roast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          exercise,
          character,
          videoSource,
          videoUrl: videoSource === 'demo' 
            ? `https://www.youtube.com/watch?v=${currentExerciseObj.demoVideoId}` 
            : 'user-uploaded-clip',
        }),
      });

      const json = await res.json();
      if (json.success) {
        setRoastData(json.data);
        setHasRoasted(true);
      }
    } catch (err) {
      console.error('Failed to get roast:', err);
      // Fallback response so offline or edge always works
      setRoastData({
        roast: `Your ${exercise} has the structural integrity of wet spaghetti — even a Roomba has better core tension.`,
        correction: "Brace your core and lock your form through the full range of motion.",
        severity: "savage",
        issue: `poor ${exercise} technique`,
      });
      setHasRoasted(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setRoastData(null);
    setHasRoasted(false);
  };

  return (
    <div className="min-h-screen flex flex-col bg-dark text-white">
      {/* ── Header ── */}
      <header className="text-center pt-8 pb-4 px-4">
        <h1 className="font-display text-5xl md:text-7xl tracking-wider text-roast"
            style={{ textShadow: '0 0 30px rgba(255,107,53,0.5)' }}>
          FORM CHECK ROAST 🔥
        </h1>
        <p className="mt-2 text-gray-400 text-sm md:text-base max-w-xl mx-auto">
          Film or upload your calisthenics move. Get brutally roasted. Pick your cartoon animal coach. Fix your form.
        </p>

        {/* ── Calisthenics Exercise Selector ── */}
        <div className="flex items-center justify-center gap-2 mt-6 flex-wrap">
          {EXERCISES.map((ex) => (
            <button
              key={ex.id}
              onClick={() => {
                setExercise(ex.id);
                setHasRoasted(false);
                setRoastData(null);
              }}
              className={`px-4 py-2 rounded-full text-sm font-bold transition-all flex items-center gap-2 ${
                exercise === ex.id
                  ? 'bg-gold text-black shadow-lg shadow-yellow-400/20 scale-105'
                  : 'bg-white/10 text-gray-300 hover:bg-white/20'
              }`}
            >
              <span>{ex.icon}</span>
              <span>{ex.label}</span>
            </button>
          ))}
        </div>
      </header>

      {/* ── Main Two-Column Layout ── */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 pb-16">
        <div className="flex flex-col lg:flex-row gap-6 mt-4">

          {/* LEFT COLUMN — Video / Camera + Roast Trigger */}
          <div className="flex-1 flex flex-col gap-4">
            <VideoPlayer
              videoId={currentExerciseObj.demoVideoId}
              videoSource={videoSource}
              setVideoSource={setVideoSource}
              uploadedVideoUrl={uploadedVideoUrl}
              setUploadedVideoUrl={setUploadedVideoUrl}
              exercise={currentExerciseObj.label}
            />

            {!hasRoasted && !isLoading && (
              <button
                onClick={handleRoast}
                className="btn-roast w-full py-4 text-xl shadow-xl hover:scale-[1.02] transition-transform"
              >
                🔥 ROAST MY {currentExerciseObj.label.toUpperCase()} 🔥
              </button>
            )}

            {isLoading && <LoadingRoast />}

            {hasRoasted && roastData && (
              <div className="space-y-4">
                <RoastCard data={roastData} />
                <button
                  onClick={handleReset}
                  className="w-full py-3 rounded-full border border-white/20 text-gray-400
                             hover:border-roast hover:text-white transition-colors text-sm font-semibold"
                >
                  🔄 Roast Another Attempt
                </button>
              </div>
            )}
          </div>

          {/* RIGHT COLUMN — Animated Cartoon Coaches */}
          <div className="flex-1 flex flex-col gap-4">
            <div className="glass-card p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-display text-xl tracking-wide text-gold">
                  🐾 CHOOSE YOUR COACH
                </h3>
                <span className="text-xs text-gray-400">interactive form demos</span>
              </div>

              <CharacterSelector
                selected={character}
                onSelect={setCharacter}
              />

              <div className="mt-4">
                <CharacterDemo character={character} />
              </div>
            </div>
          </div>

        </div>
      </main>

      {/* ── Footer ── */}
      <footer className="text-center py-6 text-xs text-gray-600 border-t border-white/5">
        Form Check Roast • Built for the Hackathon with Gemini 3.6 Flash & Cloudflare
      </footer>
    </div>
  );
}
