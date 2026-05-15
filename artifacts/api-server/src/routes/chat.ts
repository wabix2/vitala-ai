import { Router } from "express";

const router = Router();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY ?? "";
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite:generateContent?key=${GEMINI_API_KEY}`;

const AI_SYSTEM = `You are Vitala, an intelligent AI study assistant inside a learning app called Vitala AI. 
Your job is to help students understand academic topics clearly, concisely, and encouragingly.
- Give focused, helpful answers to study questions
- Use examples when useful
- Keep responses under 200 words unless detail is truly needed
- Be warm, motivating, and supportive
- If a question is not study-related, gently redirect to academics`;

const FEYNMAN_SYSTEM = (topic: string) => `You are Vitala, an AI tutor using the Feynman Technique inside Vitala AI.
The student is trying to explain the topic: "${topic}".
Your role:
- Listen to their explanation and ask ONE probing follow-up question at a time
- If their explanation has gaps or errors, gently point them out and guide them to the correct understanding
- Ask them to simplify complex language as if explaining to a 10-year-old
- Praise good explanations and push for deeper understanding
- Keep responses short (1-3 sentences) — you're the questioner, not the explainer
- Never give away the full answer directly`;

interface ChatMessage {
  role: "user" | "assistant";
  text: string;
}

router.post("/chat", async (req, res) => {
  const { messages, mode, topic } = req.body as {
    messages: ChatMessage[];
    mode: "ai" | "feynman";
    topic?: string;
  };

  if (!messages || !Array.isArray(messages)) {
    res.status(400).json({ error: "messages array required" });
    return;
  }

  if (!GEMINI_API_KEY) {
    res.status(500).json({ error: "Gemini API key not configured" });
    return;
  }

  const systemInstruction =
    mode === "feynman" && topic ? FEYNMAN_SYSTEM(topic) : AI_SYSTEM;

  const contents = messages
    .slice()
    .reverse()
    .map((m) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.text }],
    }));

  try {
    const response = await fetch(GEMINI_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: systemInstruction }] },
        contents,
        generationConfig: {
          maxOutputTokens: 512,
          temperature: 0.7,
        },
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      req.log.error({ status: response.status, err }, "Gemini API error");
      res.status(502).json({ error: "AI service error" });
      return;
    }

    const data = (await response.json()) as {
      candidates?: { content?: { parts?: { text?: string }[] } }[];
    };

    const text =
      data.candidates?.[0]?.content?.parts?.[0]?.text ?? "I couldn't generate a response. Please try again.";

    res.json({ text });
  } catch (err) {
    req.log.error({ err }, "Gemini fetch failed");
    res.status(500).json({ error: "Failed to reach AI service" });
  }
});

export default router;
