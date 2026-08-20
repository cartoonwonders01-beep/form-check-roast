import express from 'express';

const router = express.Router();

const GEMINI_MODEL = 'gemini-3.6-flash';

const CHARACTER_PERSONAS = {
  human: 'a brutally honest, high-energy gym coach',
  duck: 'a sassy, sarcastic duck who wears a tiny sweatband and quacks when disgusted by bad form',
  cow: 'a surprisingly buff bodybuilding cow who takes biomechanics very seriously',
  frog: 'a zen martial arts frog who preaches deep range of motion and joint mobility',
  bear: 'a grumpy grizzly powerlifter who only respects heavy depth and zero half-reps'
};

const EXERCISE_PROMPTS = {
  pushup: 'push-up attempt (e.g. sagging hips, flared elbows, half-reps, head nodding)',
  pullup: 'pull-up attempt (e.g. kipping, half-range of motion, dead-hanging instead of engaging lats, swinging)',
  squat: 'squat attempt (e.g. knees caving inward, butt wink, heels lifting off the floor, quarter-rep depth)',
  dips: 'parallel bar / chair dip attempt (e.g. shoulders rolling forward, elbow flaring, insufficient depth)'
};

const FALLBACKS = {
  pushup: {
    roast: "Your spine is bending so low to the floor I can't tell if you're trying to do a push-up or limbo under a worm.",
    correction: "Squeeze your glutes to lock your hips in line with your shoulders, and tuck those elbows in to a 45-degree angle.",
    severity: "savage",
    issue: "sagging hips & flared elbows"
  },
  pullup: {
    roast: "You're flapping around that bar like a fish on a pier — that's not a pull-up, that's a panic response.",
    correction: "Engage your lats first by pulling your shoulder blades down and back before bending your elbows.",
    severity: "savage",
    issue: "kipping & disengaged scapula"
  },
  squat: {
    roast: "Your depth is so shallow that puddles have more water. You're basically bowing to an invisible audience.",
    correction: "Drive your knees outward over your pinky toes and descend until your hip crease is below the knee crease.",
    severity: "medium",
    issue: "quarter-rep depth & knees caving"
  },
  dips: {
    roast: "Your shoulders are rolled so far forward they're going to arrive in next week before your chest does.",
    correction: "Keep your chest tall, shoulders depressed, and lower until your elbows reach roughly 90 degrees.",
    severity: "savage",
    issue: "anterior shoulder glide"
  }
};

router.post('/', async (req, res) => {
  try {
    const { exercise = 'pushup', character = 'duck', videoUrl = '' } = req.body;

    const persona = CHARACTER_PERSONAS[character] || CHARACTER_PERSONAS.duck;
    const exerciseContext = EXERCISE_PROMPTS[exercise] || EXERCISE_PROMPTS.pushup;

    const systemPrompt = `You are ${persona}. 
Your job is to roast a user's ${exerciseContext}.

You must respond with ONLY a valid JSON object (no markdown, no code block fences, no explanation) with these exact keys:
{
  "roast": "a hilarious, blunt 1-2 sentence roast in character",
  "correction": "one precise, actionable biomechanical cue to fix the biggest flaw",
  "severity": "mild" | "medium" | "savage",
  "issue": "short 2-4 word summary of the form defect"
}`;

    const userPrompt = `Here is the user's ${exercise} attempt. Give me your roast and technical correction.`;

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
    const exerciseKey = req.body.exercise || 'pushup';
    const fallback = FALLBACKS[exerciseKey] || FALLBACKS.pushup;
    res.json({
      success: true,
      data: fallback,
      demo: true,
      warning: 'Fallback activated: ' + err.message,
    });
  }
});

export default router;
