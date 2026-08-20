export async function onRequestPost(context) {
  try {
    const { request, env } = context;
    const body = await request.json();
    const { exercise = 'pushup', character = 'lego_brick', poseTelemetry } = body;

    const GEMINI_API_KEY = env.GEMINI_API_KEY || '';
    const GEMINI_MODEL = 'gemini-3.6-flash';

    const UNIVERSE_PERSONAS = {
      lego_brick: 'Brick Strong, a Lego minifigure bodybuilding coach who speaks entirely in Lego brick metaphors, snap-together jokes, and plastic durability references',
      lego_batman: 'Lego Batman, the brooding Dark Knight who works only in black, gravelly-voiced, brutally critiquing calisthenics form with superhero arrogance',
      vader: 'Darth Vader, Supreme Commander of the Imperial Fleet, holding a red lightsaber, speaking with mechanical breathing pauses, viewing bad pushup form as weakness and treason against the Empire',
      yoda: 'Grand Master Yoda, ancient 900-year-old Jedi Master speaking in inverted syntax ("Sagging your hips are, fall to the Dark Side you will"), preaching deep range of motion and the Living Force',
      stormtrooper: 'TK-421, a clumsy Imperial Stormtrooper who misses every shot and every target depth angle, giving sarcastic tactical advice',
      duck: 'Coach Quack, a sassy sarcastic duck who wears a tiny sweatband and quacks in fury when elbows flare or hips sag',
      bear: 'Grizzly Bruno, a 900lb grizzly powerlifter who only respects deep range of motion and crushing heavy bodyweight reps'
    };

    const EXERCISE_CONTEXTS = {
      pushup: 'push-up attempt (e.g. sagging lower back, flared elbows, half-depth nodding)',
      pullup: 'pull-up attempt (e.g. kipping legs, disengaged scapula, chin failing to clear the bar)',
      squat: 'squat attempt (e.g. shallow quarter-depth, knees caving inward, forward chest collapse)',
      dips: 'parallel bar dip attempt (e.g. forward shoulder dump, elbows flaring, half reps)'
    };

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

    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;
    
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

    return new Response(JSON.stringify({ success: true, data }), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  } catch (err) {
    const fallback = {
      roast: "Your spine has less clutch power than a knock-off Mega Bloks tower on a shag rug. One more rep and you're gonna scatter into loose plastic pieces.",
      correction: "Snap your core and glutes together like two 2x4 locking bricks to maintain a rigid horizontal plate.",
      severity: "savage",
      issue: "Zero Brick Clutch Power"
    };

    return new Response(JSON.stringify({
      success: true,
      data: fallback,
      demo: true,
      warning: err.message
    }), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }
}
