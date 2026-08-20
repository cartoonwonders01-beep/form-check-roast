import express from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';

const router = express.Router();

// ---------------------------------------------------------------------------
// Gemini client
// ---------------------------------------------------------------------------
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

// ---------------------------------------------------------------------------
// System prompt — shapes the roast + correction output
// ---------------------------------------------------------------------------
const SYSTEM_PROMPT = `You are a brutally funny, slightly unhinged personal trainer who has seen too many bad push-ups.
Your job is to:
1. Give ONE savage but funny one-liner roast about the form you see (think Gordon Ramsay meets gym bro meme culture).
2. Give ONE real, actionable correction cue that would actually fix the biggest form issue.
3. Rate the severity: "mild", "medium", or "savage".

Always respond with ONLY valid JSON, no markdown, no extra text:
{
  "roast": "...",
  "correction": "...",
  "severity": "mild" | "medium" | "savage",
  "issue": "one short label for the main form issue, e.g. 'sagging hips'"
}

If you cannot see a pushup or the video is unclear, still respond with valid JSON using a funny generic roast.`;

// ---------------------------------------------------------------------------
// Hardcoded demo analysis (fallback if API key is invalid)
// ---------------------------------------------------------------------------
const DEMO_RESPONSES = [
  {
    roast: "Your push-up has the structural integrity of a wet paper bag — even my grandma's knees hold up better than your hips.",
    correction: "Keep your body in a rigid plank: squeeze your glutes and core so your hips stay level with your shoulders throughout the movement.",
    severity: "savage",
    issue: "sagging hips"
  },
  {
    roast: "You're doing the worm at the gym and calling it a workout — this isn't a dance class, bestie.",
    correction: "Before you go down, set your hips: imagine a broomstick resting on your back from head to heels — don't let it fall off.",
    severity: "medium",
    issue: "undulating spine"
  },
  {
    roast: "Your elbows are flaring out so wide you're basically doing a chest flye with extra steps — put the wings away, you're not a bird.",
    correction: "Tuck your elbows to about 45° from your body as you lower down — this protects your shoulders and actually works your chest.",
    severity: "medium",
    issue: "elbows flaring"
  },
];

// ---------------------------------------------------------------------------
// POST /api/roast
// Body: { videoUrl?: string, useDemo?: boolean }
// ---------------------------------------------------------------------------
router.post('/', async (req, res) => {
  try {
    const { videoUrl, useDemo } = req.body;

    // If demo mode or no valid API key prefix, return a random demo response
    if (useDemo || !process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY.startsWith('your_')) {
      const random = DEMO_RESPONSES[Math.floor(Math.random() * DEMO_RESPONSES.length)];
      // Simulate a slight delay for realism
      await new Promise(r => setTimeout(r, 1200));
      return res.json({ success: true, data: random, demo: true });
    }

    // Build prompt — for MVP we describe the video by URL context
    // In a full build you'd pass video bytes via the File API
    const prompt = videoUrl
      ? `Analyze the push-up form in this video: ${videoUrl}\n\nIf you cannot access the video directly, imagine you are watching a typical "bad push-up" video where the person has sagging hips and flared elbows. Give your roast and correction based on those common issues.`
      : `Imagine you're watching someone do a push-up with terrible form — hips are sagging, elbows flared out wide. Give your roast and correction.`;

    const result = await model.generateContent([
      { text: SYSTEM_PROMPT },
      { text: prompt },
    ]);

    const responseText = result.response.text().trim();

    // Strip markdown code fences if Gemini wraps in them
    const jsonStr = responseText
      .replace(/^```json\s*/i, '')
      .replace(/^```\s*/i, '')
      .replace(/```\s*$/i, '')
      .trim();

    const data = JSON.parse(jsonStr);

    res.json({ success: true, data });
  } catch (err) {
    console.error('Roast API error:', err.message);

    // Graceful fallback — never let the UI break
    const fallback = DEMO_RESPONSES[Math.floor(Math.random() * DEMO_RESPONSES.length)];
    res.json({
      success: true,
      data: fallback,
      demo: true,
      warning: 'Fell back to demo response: ' + err.message,
    });
  }
});

export default router;
