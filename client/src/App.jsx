import { useState } from 'react';
import VideoPlayer from './components/VideoPlayer';
import RoastCard from './components/RoastCard';
import CharacterSelector from './components/CharacterSelector';
import CharacterDemo from './components/CharacterDemo';
import LoadingRoast from './components/LoadingRoast';

// A known YouTube video of someone doing push-ups with bad form
const DEMO_VIDEO_ID = 'IODxDxX7oi4'; // "How to do a push-up WRONG" style video

export default function App() {
  const [character, setCharacter] = useState('duck');
  const [roastData, setRoastData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasRoasted, setHasRoasted] = useState(false);

  const handleRoast = async () => {
    setIsLoading(true);
    setRoastData(null);
    setHasRoasted(false);

    try {
      const res = await fetch('/api/roast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          videoUrl: `https://www.youtube.com/watch?v=${DEMO_VIDEO_ID}`,
        }),
      });

      const json = await res.json();
      if (json.success) {
        setRoastData(json.data);
        setHasRoasted(true);
      }
    } catch (err) {
      console.error('Failed to get roast:', err);
      // Fallback hardcoded roast so demo never dies
      setRoastData({
        roast: "Your push-up has the structural integrity of wet spaghetti — even a Roomba has better core tension.",
        correction: "Lock your core tight before you descend — squeeze your abs like you're bracing for a punch.",
        severity: "savage",
        issue: "zero core engagement",
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
    <div className="min-h-screen flex flex-col">
      {/* ── Header ── */}
      <header className="text-center pt-10 pb-6 px-4">
        <h1 className="font-display text-6xl md:text-8xl tracking-wider"
            style={{ color: '#FF6B35', textShadow: '0 0 40px rgba(255,107,53,0.5)' }}>
          FORM CHECK
        </h1>
        <h2 className="font-display text-4xl md:text-5xl tracking-widest"
            style={{ color: '#FFD93D', textShadow: '0 0 20px rgba(255,217,61,0.4)' }}>
          ROAST 🔥
        </h2>
        <p className="mt-3 text-gray-400 text-sm md:text-base max-w-md mx-auto">
          Watch the vid. Get brutally roasted. Pick your animal coach. Fix your form.
        </p>
      </header>

      {/* ── Main Layout ── */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 pb-16">
        <div className="flex flex-col lg:flex-row gap-6">

          {/* LEFT — Video + Roast Button */}
          <div className="flex-1 flex flex-col gap-4">
            <VideoPlayer videoId={DEMO_VIDEO_ID} />

            {!hasRoasted && !isLoading && (
              <button
                onClick={handleRoast}
                className="btn-roast w-full"
              >
                🔥 ROAST MY FORM 🔥
              </button>
            )}

            {isLoading && <LoadingRoast />}

            {hasRoasted && roastData && (
              <>
                <RoastCard data={roastData} />
                <button
                  onClick={handleReset}
                  className="w-full py-3 rounded-full border border-roast-border text-gray-400
                             hover:border-roast-orange hover:text-white transition-colors text-sm"
                >
                  🔄 Roast Again
                </button>
              </>
            )}
          </div>

          {/* RIGHT — Character Coach */}
          <div className="lg:w-80 flex flex-col gap-4">
            <div className="glass-card p-5">
              <h3 className="font-display text-2xl text-center mb-1"
                  style={{ color: '#FFD93D' }}>
                PICK YOUR COACH
              </h3>
              <p className="text-center text-gray-500 text-xs mb-4">
                They'll demonstrate the correct form
              </p>
              <CharacterSelector selected={character} onSelect={setCharacter} />
            </div>

            <div className="glass-card p-5 flex-1 flex flex-col items-center justify-center min-h-64">
              <CharacterDemo character={character} isActive={hasRoasted} />
            </div>

            {hasRoasted && roastData && (
              <div className="glass-card p-4 animate-slide-up">
                <p className="text-xs text-gray-500 uppercase tracking-widest mb-2 text-center">
                  Coach says:
                </p>
                <p className="text-center text-sm text-white leading-relaxed">
                  "{roastData.correction}"
                </p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* ── Footer ── */}
      <footer className="text-center pb-6 text-gray-700 text-xs">
        Built at the hackathon 🏋️ · Powered by Gemini AI · No egos spared
      </footer>
    </div>
  );
}
