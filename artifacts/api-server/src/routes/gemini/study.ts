import { Router } from "express";
import { ai } from "@workspace/integrations-gemini-ai";

const router = Router();

router.post("/study/flashcards", async (req, res) => {
  const { topic, text, language, count = 8 } = req.body as {
    topic: string;
    text?: string;
    language?: string;
    count?: number;
  };

  if (!topic) {
    res.status(400).json({ error: "topic is required" });
    return;
  }

  try {
    const langInstruction = language && language !== "en"
      ? `Generate the flashcards in this language: ${language}.`
      : "";

    const prompt = text
      ? `Generate ${count} educational flashcards about "${topic}" based on this content:\n\n${text}\n\n${langInstruction}\n\nReturn ONLY a JSON object with this structure: {"flashcards": [{"front": "question", "back": "answer"}, ...]}`
      : `Generate ${count} educational flashcards about "${topic}". ${langInstruction}\n\nReturn ONLY a JSON object with this structure: {"flashcards": [{"front": "question", "back": "answer"}, ...]}`;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      config: {
        maxOutputTokens: 8192,
        responseMimeType: "application/json",
      },
    });

    const raw = response.text ?? "{}";
    const parsed = JSON.parse(raw) as { flashcards?: unknown };
    res.json({ flashcards: parsed.flashcards ?? [] });
  } catch (err) {
    req.log.error({ err }, "Failed to generate flashcards");
    res.status(500).json({ error: "Failed to generate flashcards" });
  }
});

router.post("/study/quiz", async (req, res) => {
  const { topic, text, language, count = 5 } = req.body as {
    topic: string;
    text?: string;
    language?: string;
    count?: number;
  };

  if (!topic) {
    res.status(400).json({ error: "topic is required" });
    return;
  }

  try {
    const langInstruction = language && language !== "en"
      ? `Generate the quiz in this language: ${language}.`
      : "";

    const prompt = text
      ? `Generate ${count} multiple choice quiz questions about "${topic}" based on this content:\n\n${text}\n\n${langInstruction}\n\nReturn ONLY a JSON object: {"questions": [{"question": "...", "options": ["A", "B", "C", "D"], "correctIndex": 0, "explanation": "..."}]}`
      : `Generate ${count} multiple choice quiz questions about "${topic}". ${langInstruction}\n\nReturn ONLY a JSON object: {"questions": [{"question": "...", "options": ["A", "B", "C", "D"], "correctIndex": 0, "explanation": "..."}]}`;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      config: {
        maxOutputTokens: 8192,
        responseMimeType: "application/json",
      },
    });

    const raw = response.text ?? "{}";
    const parsed = JSON.parse(raw) as { questions?: unknown };
    res.json({ questions: parsed.questions ?? [] });
  } catch (err) {
    req.log.error({ err }, "Failed to generate quiz");
    res.status(500).json({ error: "Failed to generate quiz" });
  }
});

router.post("/study/summarize", async (req, res) => {
  const { topic, text, language } = req.body as {
    topic: string;
    text?: string;
    language?: string;
  };

  if (!topic) {
    res.status(400).json({ error: "topic is required" });
    return;
  }

  try {
    const langInstruction = language && language !== "en"
      ? `Respond in this language: ${language}.`
      : "";

    const prompt = text
      ? `Summarize the following text about "${topic}":\n\n${text}\n\n${langInstruction}\n\nReturn ONLY a JSON object: {"summary": "...", "keyPoints": ["point1", "point2", ...]}`
      : `Provide a comprehensive summary of "${topic}". ${langInstruction}\n\nReturn ONLY a JSON object: {"summary": "...", "keyPoints": ["point1", "point2", ...]}`;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      config: {
        maxOutputTokens: 8192,
        responseMimeType: "application/json",
      },
    });

    const raw = response.text ?? "{}";
    const parsed = JSON.parse(raw) as { summary?: string; keyPoints?: string[] };
    res.json({
      summary: parsed.summary ?? "",
      keyPoints: parsed.keyPoints ?? [],
    });
  } catch (err) {
    req.log.error({ err }, "Failed to summarize");
    res.status(500).json({ error: "Failed to summarize" });
  }
});

export default router;
