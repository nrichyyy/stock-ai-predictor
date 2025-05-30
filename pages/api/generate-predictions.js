import { Configuration, OpenAIApi } from "openai";

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { ticker, date } = req.body;

  if (!ticker || !date) {
    return res.status(400).json({ error: "Missing ticker or date" });
  }

  try {
    const prompt = `
Act as a top-tier financial analyst. Using the most recent data, analyze the stock of ${ticker}.
Consider historical price movements, trading volume trends, technical indicators (RSI, MACD, Moving Averages), recent news sentiment, and quarterly earnings.
Predict the likely trend for the next 5 trading days starting from ${date}.

Format your response as JSON with keys:
- prediction: Up/Down/Stable
- reasoning: Explain key factors
- confidence: Confidence score 0-100
- forecast: Daily breakdown if possible
`;

    const completion = await openai.createChatCompletion({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
    });

    const raw = completion.data.choices[0].message.content;

    // Try to parse JSON from response, else send raw text fallback
    let parsed;
    try {
      parsed = JSON.parse(raw);
    } catch {
      parsed = {
        prediction: "Unknown",
        reasoning: raw,
        confidence: "N/A",
        forecast: "N/A",
      };
    }

    res.status(200).json(parsed);
  } catch (error) {
    console.error("OpenAI error:", error);
    res.status(500).json({ error: "Failed to generate prediction" });
  }
}
