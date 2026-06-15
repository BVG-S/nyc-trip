// netlify/functions/plan.js
// FREE backend for natural-language mode, using Google Gemini's free tier.
// 1) Get a key (no credit card): https://aistudio.google.com/apikey
// 2) In Netlify → Environment variables, set GEMINI_API_KEY
// 3) In index.html set PLANNER_MODE = "api", redeploy.
// Returns an Anthropic-shaped object so the page's parser works unchanged.

const MODEL = "gemini-2.5-flash"; // or "gemini-2.5-flash-lite" for more daily requests

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") return { statusCode: 405, body: "Method not allowed" };
  try {
    const { system, message } = JSON.parse(event.body || "{}");
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${process.env.GEMINI_API_KEY}`;

    const r = await fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: system }] },
        contents: [{ role: "user", parts: [{ text: message }] }],
        generationConfig: { temperature: 0.2, responseMimeType: "application/json" },
      }),
    });

    const data = await r.json();
    const text = data?.candidates?.[0]?.content?.parts?.map(p => p.text).join("") || "";

    // Re-wrap as Anthropic-style so the front-end stays identical:
    return {
      statusCode: 200,
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ content: [{ type: "text", text }] }),
    };
  } catch (e) {
    return { statusCode: 500, headers: { "content-type": "application/json" }, body: JSON.stringify({ error: String(e) }) };
  }
};
