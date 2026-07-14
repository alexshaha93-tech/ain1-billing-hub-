// Vercel serverless function — deploy as-is under /api/ai-insight.
// Set ANTHROPIC_API_KEY in your Vercel project's Environment Variables
// (Project Settings -> Environment Variables). The key never reaches the browser.
//
// If you don't need the AI summary feature, you can safely delete this file —
// the rest of the app (Billing, Stock, GST, Analytics, Owner Panel) works without it.

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    res.status(500).json({ error: "ANTHROPIC_API_KEY is not set on the server" });
    return;
  }

  try {
    const { snapshot } = req.body || {};
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 700,
        messages: [
          {
            role: "user",
            content: `You are the AI advisor inside a small trading business's operating system. Given this JSON snapshot of today's business data, write a short executive summary (3-4 sentences) in plain business English, followed by exactly 3 short bullet-point recommendations. Be specific with the numbers given, do not invent new numbers. Data: ${JSON.stringify(snapshot)}`,
          },
        ],
      }),
    });
    const data = await response.json();
    const text = (data?.content || []).map((b) => b.text || "").join("\n").trim();
    res.status(200).json({ text });
  } catch (err) {
    res.status(500).json({ error: "AI request failed" });
  }
}
