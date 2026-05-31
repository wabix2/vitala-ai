import { Router } from "express";
import { ai } from "@workspace/integrations-gemini-ai";

const router = Router();

router.post("/feynman/explain", async (req, res) => {
  const { topic, text, language } = req.body as {
    topic: string;
    text?: string;
    language?: string;
  };

  if (!topic?.trim()) {
    res.status(400).json({ error: "topic is required" });
    return;
  }

  try {
    const langInstruction =
      language && language !== "en"
        ? `Respond in this language: ${language}.`
        : "";

    const context = text
      ? `Use this reference material:\n\n${text.slice(0, 30000)}\n\n`
      : "";

    const prompt = `${context}Explain "${topic}" in three levels for a learning app. ${langInstruction}

Return ONLY valid JSON:
{
  "simple": "child-level explanation (2-3 short paragraphs)",
  "intermediate": "high-school level explanation",
  "expert": "university/expert level explanation",
  "keyConcepts": ["concept1", "concept2", "concept3"]
}`;

    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      config: {
        maxOutputTokens: 8192,
        responseMimeType: "application/json",
      },
    });

    const raw = response.text ?? "{}";
    const parsed = JSON.parse(raw) as {
      simple?: string;
      intermediate?: string;
      expert?: string;
      keyConcepts?: string[];
    };

    res.json({
      simple: parsed.simple ?? "",
      intermediate: parsed.intermediate ?? "",
      expert: parsed.expert ?? "",
      keyConcepts: parsed.keyConcepts ?? [],
    });
  } catch (err) {
    req.log.error({ err }, "Failed to generate Feynman explanation");
    res.status(500).json({ error: "Failed to generate explanation" });
  }
});

router.post("/feynman/evaluate", async (req, res) => {
  const { topic, explanation, language } = req.body as {
    topic: string;
    explanation: string;
    language?: string;
  };

  if (!topic?.trim() || !explanation?.trim()) {
    res.status(400).json({ error: "topic and explanation are required" });
    return;
  }

  try {
    const langInstruction =
      language && language !== "en"
        ? `Respond in this language: ${language}.`
        : "";

    const prompt = `You are a Feynman technique tutor. The student is teaching you about "${topic}".

Their explanation:
"""
${explanation.slice(0, 8000)}
"""

${langInstruction}

Evaluate how well they understand the topic. Return ONLY valid JSON:
{
  "score": 0-100,
  "strengths": ["..."],
  "gaps": ["..."],
  "improvedExplanation": "a clearer version they should aim for",
  "followUpQuestion": "one question to deepen understanding"
}`;

    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      config: {
        maxOutputTokens: 4096,
        responseMimeType: "application/json",
      },
    });

    const raw = response.text ?? "{}";
    const parsed = JSON.parse(raw) as {
      score?: number;
      strengths?: string[];
      gaps?: string[];
      improvedExplanation?: string;
      followUpQuestion?: string;
    };

    res.json({
      score: Math.min(100, Math.max(0, parsed.score ?? 0)),
      strengths: parsed.strengths ?? [],
      gaps: parsed.gaps ?? [],
      improvedExplanation: parsed.improvedExplanation ?? "",
      followUpQuestion: parsed.followUpQuestion ?? "",
    });
  } catch (err) {
    req.log.error({ err }, "Failed to evaluate Feynman explanation");
    res.status(500).json({ error: "Failed to evaluate explanation" });
  }
});

export default router;
