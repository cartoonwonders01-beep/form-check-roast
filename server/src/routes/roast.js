import express from 'express';

const router = express.Router();

const GEMINI_MODEL = 'gemini-3.6-flash';

const UNIVERSE_PERSONAS = {
  // ── SEVEN HUMANOID & COMICAL UNIVERSES ──
  humanoid: 'Coach Alex, an elite Seven-app personal trainer who gives witty, brutally honest, high-energy biomechanical roasts and sharp movement cues',
  lego_brick: 'Brick Strong, a Lego minifigure bodybuilding coach who speaks entirely in Lego brick metaphors, snap-together jokes, and plastic durability references',
  lego: 'Brick Strong, a Lego minifigure bodybuilding coach who speaks entirely in Lego brick metaphors, snap-together jokes, and plastic durability references',
  woody: 'Sheriff Woody from Toy Story, the vintage pull-string cowboy doll, giving folksy cowboy analogies ("There\'s a snake in your spine!", "Reach for the sky!", "You are a child\'s plaything doing half-reps")',
  lego_batman: 'Lego Batman, the brooding Dark Knight who works only in black, gravelly-voiced, brutally critiquing calisthenics form with superhero arrogance',

  // ── STAR WARS UNIVERSE ──
  vader: 'Darth Vader, Supreme Commander of the Imperial Fleet, holding a red lightsaber, speaking with mechanical breathing pauses, viewing bad pushup form as weakness and treason against the Empire',
  yoda: 'Grand Master Yoda, ancient 900-year-old Jedi Master speaking in inverted syntax ("Sagging your hips are, fall to the Dark Side you will"), preaching deep range of motion and the Living Force',
  stormtrooper: 'TK-421, a clumsy Imperial Stormtrooper who misses every shot and every target depth angle, giving sarcastic tactical advice',

  // ── ANIMAL KINGDOM ──
  duck: 'Coach Quack, a sassy sarcastic duck who wears a tiny sweatband and quacks in fury when elbows flare or hips sag',
  bear: 'Grizzly Bruno, a 900lb grizzly powerlifter who only respects deep range of motion and crushing heavy bodyweight reps'
};

const EXERCISE_CONTEXTS = {
  pushup: 'push-up attempt (e.g. sagging lower back, flared elbows, half-depth nodding)',
  pullup: 'pull-up attempt (e.g. kipping legs, disengaged scapula, chin failing to clear the bar)',
  squat: 'squat attempt (e.g. shallow quarter-depth, knees caving inward, forward chest collapse)',
  dips: 'parallel bar dip attempt (e.g. forward shoulder dump, elbows flaring, half reps)'
};

const FALLBACK_ROASTS = {
  humanoid: {
    roast: "That push-up had more spinal sag than a tired hammock. Your chest barely greeted the floor while your lower back waved white flags.",
    correction: "Engage your abdominal wall, squeeze your glutes, and tuck elbows to a 45-degree arrow trajectory.",
    severity: "savage",
    issue: "Lumbar Hyperextension"
  },
  lego: {
    roast: "Your spine has less clutch power than a knock-off Mega Bloks tower on a shag rug. One more rep and you're gonna scatter into 40 loose plastic pieces.",
    correction: "Snap your core and glutes together like two 2x4 locking bricks to maintain a rigid horizontal plate.",
    severity: "savage",
    issue: "Zero Brick Clutch Power"
  },
  woody: {
    roast: "Hold on now, partner! There's a snake in your spine! You're floppin' around that floor like Andy just walked into the room!",
    correction: "Squeeze that core tight and keep your back straight as a sheriff's badge.",
    severity: "savage",
    issue: "Floppy Pull-String Spine"
  },
  lego_batman: {
    roast: "I only work in black, darkness... and actual full-range push-ups. Your form is weaker than the Joker's punchlines.",
    correction: "Tuck your elbows to 45 degrees like bat-wings before descending to the cave floor.",
    severity: "savage",
    issue: "Flared Bat-Wings"
  },
  vader: {
    roast: "I find your lack of core tension disturbing. You are not executing a pushup; your hips are simply surrendering to gravity like the Rebel Alliance.",
    correction: "Channel the Force through your abdominal wall and keep your spine aligned with my lightsaber.",
    severity: "savage",
    issue: "Sith Spine Collapse"
  },
  yoda: {
    roast: "Sagging your hips are. More like a swamp slug than a Jedi Knight you look. Do or do not — a half-rep there is not.",
    correction: "Engage the core you must, until straight as a kyber crystal your back becomes.",
    severity: "savage",
    issue: "Swamp Slug Alignment"
  },
  stormtrooper: {
    roast: "Even I don't miss targets as badly as you missed that 90-degree elbow depth. Lord Vader would choke you for that set.",
    correction: "Lower your chest all the way to target level before pressing back up.",
    severity: "medium",
    issue: "Missed Target Depth"
  },
  duck: {
    roast: "*QUACK!* Was that a push-up or are you trying to do the worm on my gym floor? My tiny sweatband is soaked in pure disgust.",
    correction: "Brace your core and squeeze your glutes into a rigid horizontal plank.",
    severity: "savage",
    issue: "Worm Sagging"
  },
  bear: {
    roast: "If I wanted to watch a dying salmon flop on a riverbank, I'd go fishing. That wasn't a rep; that was a full-body cry for help.",
    correction: "Lock your shoulder blades down and back to eliminate uncontrolled momentum.",
    severity: "savage",
    issue: "Kipping & Disengaged Scapula"
  }
};

router.post('/', async (req, res) => {
  try {
    const { exercise = 'pushup', character = 'lego_brick', videoUrl = '', poseTelemetry } = req.body;

    const persona = UNIVERSE_PERSONAS[character] || UNIVERSE_PERSONAS.lego_brick;
    const exerciseContext = EXERCISE_CONTEXTS[exercise] || EXERCISE_CONTEXTS.pushup;

    const telemetryDetails = poseTelemetry ? `
Pose Telemetry from Computer Vision:
- Form Score: ${poseTelemetry.formScore}%
- Joint Angles: Elbow: ${Math.round(poseTelemetry.angles?.elbow || 180)}°, Hip Sag: ${Math.round(poseTelemetry.angles?.hip || 180)}°, Shoulder Flare: ${Math.round(poseTelemetry.angles?.shoulder || 50)}°
- Active Faults: ${poseTelemetry.errors?.map(e => e.label).join(', ') || 'General form breakdown'}
` : '';

    const systemPrompt = `You are ${persona}. 
Your mission is to deliver a savage, hilarious, universe-authentic roast and a precise biomechanical correction for the user's ${exerciseContext}.
${telemetryDetails}

You must respond with ONLY a valid JSON object (no markdown, no code block fences, no conversational preamble) with these exact keys:
{
  "roast": "a hilarious 1-2 sentence roast staying 100% in your universe persona",
  "correction": "one precise, actionable biomechanical cue to fix the biggest flaw",
  "severity": "mild" | "medium" | "savage",
  "issue": "short 2-4 word summary of the defect"
}`;

    const userPrompt = `Roast this ${exercise} attempt as your character!`;

    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${process.env.GEMINI_API_KEY}`;
    
    const response = await fetch(geminiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: systemPrompt + '\n\n' + userPrompt }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.9,
          maxOutputTokens: 2048,
          responseMimeType: 'application/json'
        }
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Gemini HTTP ${response.status}: ${errText}`);
    }

    const resJson = await response.json();
    let responseText = resJson?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
    if (!responseText) throw new Error('Empty response from Gemini');

    responseText = responseText.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```\s*$/i, '').trim();
    const data = JSON.parse(responseText);

    res.json({ success: true, data });
  } catch (err) {
    console.error('Roast API error:', err.message);
    const charKey = req.body.character || 'lego_brick';
    const fallback = FALLBACK_ROASTS[charKey] || FALLBACK_ROASTS.lego_brick;
    res.json({
      success: true,
      data: fallback,
      demo: true,
      warning: 'Fallback activated: ' + err.message,
    });
  }
});

export default router;
