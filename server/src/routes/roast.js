import express from 'express';

const router = express.Router();

const GEMINI_MODEL = 'gemini-3.6-flash';

const UNIVERSE_PERSONAS = {
  humanoid: 'Coach Alex, an elite Seven-app personal trainer and fitness influencer who gives witty, brutally honest, high-energy roasts with protein shake and crypto analogies',
  lego: 'Brick Strong, a Lego minifigure bodybuilding coach who speaks entirely in Lego brick metaphors, snap-together jokes, loose stud warnings, and plastic durability puns',
  vader: 'Darth Vader, Supreme Commander of the Imperial Fleet, viewing bad pushup form as weakness, treason against the Emperor, and lack of dark side core discipline',
  duck: 'Quack Norris, a sassy sarcastic cartoon duck who wears a red karate headband and quacks in fury when elbows flare or hips sag like wet bread',
  woody: 'Sheriff Woody, the vintage pull-string cowboy doll, giving folksy cowboy analogies ("There\'s a snake in your spine!", "Reach for the sky!")',
  bear: 'Grizzly Bruno, a 900lb grizzly powerlifter who only respects deep range of motion and crushing heavy bodyweight reps'
};

const EXERCISE_CONTEXTS = {
  pushup: 'push-up attempt (e.g. sagging lower back, flared elbows, half-depth nodding, flopping like a fish)',
  pullup: 'pull-up attempt (e.g. kipping legs, disengaged scapula, chin failing to clear the bar)',
  squat: 'squat attempt (e.g. shallow quarter-depth, knees caving inward, forward chest collapse)',
  situp: 'sit-up attempt (e.g. neck yanking, hip thrusting, zero abdominal contraction)',
  plank: 'plank attempt (e.g. drooping hips, arched lumbar spine, trembling shoulders)'
};

const RICH_FALLBACK_ROASTS = {
  humanoid: [
    { roast: "Bro! Your form is so creative, I thought you were auditioning for an interpretive modern dance troupe! Lock that spine!", correction: "Engage your abdominal wall and keep elbows at 45 degrees.", severity: "savage", issue: "Spinal Interpretive Dance" },
    { roast: "Are we doing pushups or taking a tactical 30-second power nap on the turf? Chest down to 90 degrees!", correction: "Lower until chest hovers 1 inch above the floor.", severity: "medium", issue: "Tactical Floor Nap" },
    { roast: "You're dropping down like my crypto portfolio in a bear market! Control the negative descent!", correction: "Use a strict 2-second eccentric tempo.", severity: "savage", issue: "Uncontrolled Descent" },
    { roast: "I’d tell you to fix your elbow flare, but I’m worried you're about to achieve aerodynamic liftoff and hit the gym ceiling!", correction: "Tuck elbows into an arrow shape, not a T-shape.", severity: "savage", issue: "Helicopter Elbow Flare" },
    { roast: "That wasn't full range of motion, that was a polite nod in the general direction of the gym floor!", correction: "Reach a full 90-degree elbow flexion at the bottom.", severity: "medium", issue: "Polite Head Nodding" },
    { roast: "Did you leave your abdominal core in your gym locker? Because your lower back is doing the limbo!", correction: "Squeeze glutes and tuck pelvis to eliminate lower back sag.", severity: "savage", issue: "Limbo Lower Back" }
  ],
  duck: [
    { roast: "QUACK! Are you doing pushups or aggressively apologizing to the gym floor?", correction: "Maintain a rigid horizontal plank and drive from the triceps.", severity: "savage", issue: "Floor Apologies" },
    { roast: "I've seen soggy bread with more structural core integrity than your lower spine right now!", correction: "Squeeze the glutes and lock the abdominal wall tight.", severity: "savage", issue: "Soggy Bread Spine" },
    { roast: "Your elbows are flaring out like a goose caught in a helicopter rotor! 45 degrees, you turkey!", correction: "Tuck your wings to a 45-degree angle alongside your ribs.", severity: "savage", issue: "Flapping Goose Wings" },
    { roast: "You're dropping down like an anvil dropped from an airplane. Where is the controlled 2-second tempo?!", correction: "Control your descent over 2 seconds before pausing.", severity: "medium", issue: "Anvil Gravity Drop" },
    { roast: "I have no teeth and two hollow wing bones, and I can still hold a stiffer plank than that!", correction: "Keep your hips level with your shoulders throughout the rep.", severity: "savage", issue: "Hollow Plank" }
  ],
  lego: [
    { roast: "WARNING: Critical brick failure! Your hip connector piece just snapped completely off!", correction: "Snap your core and glutes together like two 2x4 locking bricks.", severity: "savage", issue: "Loose Brick Connector" },
    { roast: "If your core sags any further, you're going to scatter 400 loose Lego pieces across the carpet!", correction: "Lock your torso into a single rigid baseplate.", severity: "savage", issue: "Catastrophic Scatter" },
    { roast: "Are you built out of Mega Bloks? Because authentic Lego bricks do NOT wobble like that!", correction: "Maintain isometric tension from neck to ankles.", severity: "savage", issue: "Off-Brand Wobble" },
    { roast: "That rep had more gaps than a Lego instruction booklet missing page 4! Build a real foundation!", correction: "Complete the full range of motion from lockout to floor.", severity: "medium", issue: "Missing Instructions" },
    { roast: "Stepping barefoot on a Lego hurts less than watching that attempt at a full-range pushup!", correction: "Lower your chest to full depth before pressing.", severity: "savage", issue: "Barefoot Lego Pain" }
  ],
  vader: [
    { roast: "I find your lack of core tension... disturbing. The Emperor does not accept half-reps!", correction: "Channel the Force into your abdominal wall and lock your spine straight.", severity: "savage", issue: "Disturbing Core Tension" },
    { roast: "You were supposed to destroy the weakness, not collapse upon the imperial hangar floor!", correction: "Maintain active shoulder engagement at the top of every rep.", severity: "savage", issue: "Hangar Deck Collapse" },
    { roast: "Your lower back is sagging faster than the Galactic Republic. Tighten your core!", correction: "Tuck your pelvis and engage your glutes.", severity: "savage", issue: "Galactic Republic Sag" },
    { roast: "Are you pushing the planet down, or is gravity force-choking you into submission?", correction: "Drive powerfully through the palms to full lockout.", severity: "medium", issue: "Force-Choked Gravity" },
    { roast: "Your pushup technique is as fragile as the thermal exhaust port on the Death Star!", correction: "Eliminate shoulder shrug and stabilize the scapulae.", severity: "savage", issue: "Exhaust Port Vulnerability" }
  ]
};

router.post('/', async (req, res) => {
  try {
    const { exercise = 'pushup', character = 'humanoid', videoUrl = '', poseTelemetry } = req.body;

    const persona = UNIVERSE_PERSONAS[character] || UNIVERSE_PERSONAS.humanoid;
    const exerciseContext = EXERCISE_CONTEXTS[exercise] || EXERCISE_CONTEXTS.pushup;

    const telemetryDetails = poseTelemetry ? `
Pose Telemetry from Computer Vision:
- Form Score: ${poseTelemetry.formScore}%
- Joint Angles: Elbow: ${Math.round(poseTelemetry.angles?.elbow || 180)}°, Hip Sag: ${Math.round(poseTelemetry.angles?.hip || 180)}°, Shoulder Flare: ${Math.round(poseTelemetry.angles?.shoulder || 50)}°
- Active Faults: ${poseTelemetry.errors?.map(e => e.label).join(', ') || 'General form breakdown'}
` : '';

    const systemPrompt = `You are ${persona}. 
Your mission is to deliver a savage, laugh-out-loud, universe-authentic roast and a precise biomechanical correction for the user's ${exerciseContext}.
Use creative punchlines, comedic metaphors, and memorable pop-culture or character quirks. Make it genuinely hilarious.
${telemetryDetails}

You must respond with ONLY a valid JSON object (no markdown, no code block fences, no conversational preamble) with these exact keys:
{
  "roast": "a hilarious 1-2 sentence roast staying 100% in your universe persona",
  "correction": "one precise, actionable biomechanical cue to fix the biggest flaw",
  "severity": "mild" | "medium" | "savage",
  "issue": "short 2-4 word summary of the defect"
}`;

    const userPrompt = `Roast this ${exercise} attempt as your character! Give me a brand new, wildly creative punchline!`;

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
          temperature: 0.95,
          maxOutputTokens: 2048,
          responseMimeType: 'application/json'
        }
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Gemini HTTP ${response.status}: ${errText}`);
    }

    const data = await response.json();
    const rawContent = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!rawContent) {
      throw new Error('Empty response from Gemini API');
    }

    let parsedRoast;
    try {
      const cleaned = rawContent.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      parsedRoast = JSON.parse(cleaned);
    } catch (parseErr) {
      console.warn('JSON parse error from Gemini output, using raw text:', rawContent);
      parsedRoast = {
        roast: rawContent.slice(0, 140),
        correction: "Maintain core tension and control the full range of motion.",
        severity: "savage",
        issue: "Form Breakdown"
      };
    }

    return res.json({
      success: true,
      data: parsedRoast,
      source: 'gemini-3.6-flash'
    });

  } catch (error) {
    console.error('Roast API Error (Falling back to universe response):', error.message);
    
    // Pick a random funny fallback roast from our rich pool
    const list = RICH_FALLBACK_ROASTS[req.body.character] || RICH_FALLBACK_ROASTS.humanoid;
    const fallback = list[Math.floor(Math.random() * list.length)];

    return res.json({
      success: true,
      data: fallback,
      source: 'universe-fallback',
      note: 'Using offline comedic personality fallback'
    });
  }
});

export default router;
