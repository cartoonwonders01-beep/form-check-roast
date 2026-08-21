export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // Handle Cloudflare edge API roast route
    if (url.pathname === '/api/roast' && request.method === 'POST') {
      try {
        const body = await request.json();
        const { exercise = 'pushup', character = 'duck' } = body;

        const apiKey = env.GEMINI_API_KEY || "";
        if (apiKey) {
          const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${apiKey}`;
          const prompt = `You are a hilarious ${character} fitness coach. Deliver a savage 1-2 sentence roast for this ${exercise} attempt in valid JSON { "roast": "...", "correction": "...", "severity": "savage", "issue": "..." }`;
          
          const geminiRes = await fetch(geminiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }],
              generationConfig: { responseMimeType: 'application/json' }
            })
          });

          if (geminiRes.ok) {
            const data = await geminiRes.json();
            const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
            if (text) {
              return new Response(JSON.stringify({ 
                success: true, 
                data: JSON.parse(text), 
                source: 'cloudflare-gemini' 
              }), {
                headers: { 
                  'Content-Type': 'application/json',
                  'Access-Control-Allow-Origin': '*'
                }
              });
            }
          }
        }
      } catch (e) {
        console.warn('Edge Gemini error:', e);
      }

      // Edge personality fallback
      const fallbacks = {
        duck: { roast: "QUACK! Your lower back is sagging so low it's practically digging for worms! Lock those wings at 45 degrees!", correction: "Keep your spine aligned and tuck elbows to 45 degrees.", severity: "savage", issue: "Soggy Duck Spine" },
        vader: { roast: "I find your lack of core tension... disturbing. The Emperor does not tolerate collapsing on the floor!", correction: "Channel the dark side: maintain a rigid horizontal line.", severity: "savage", issue: "Sith Core Failure" },
        lego: { roast: "WARNING: Critical brick failure! Your hip connector piece just snapped completely off!", correction: "Snap core into a rigid 180-degree plate.", severity: "savage", issue: "Loose Brick Connector" },
        humanoid: { roast: "Bro! Your form is so creative, I thought you were auditioning for an interpretive modern dance troupe!", correction: "Lower down until elbows reach 90-degree flexion.", severity: "savage", issue: "Spinal Interpretive Dance" }
      };

      const char = url.searchParams.get('character') || 'duck';
      const fallback = fallbacks[char] || fallbacks.duck;

      return new Response(JSON.stringify({
        success: true,
        data: fallback,
        source: 'cloudflare-edge'
      }), {
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }

    // Pass through to static assets bundle
    return env.ASSETS.fetch(request);
  }
};
