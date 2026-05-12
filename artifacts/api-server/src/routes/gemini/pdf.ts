import { Router } from "express";
import { ai } from "@workspace/integrations-gemini-ai";

const router = Router();

router.post("/pdf/ask", async (req, res) => {
  const { text, question, language } = req.body as {
    text: string;
    question: string;
    language?: string;
  };

  if (!text || !question) {
    res.status(400).json({ error: "text and question are required" });
    return;
  }

  try {
    const langInstruction = language && language !== "en"
      ? `Respond in this language: ${language}.`
      : "";

    const prompt = `Based on the following document content, answer the question accurately and thoroughly.\n\nDocument:\n${text.slice(0, 50000)}\n\nQuestion: ${question}\n\n${langInstruction}\n\nProvide a clear, well-structured answer based only on the document content.`;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      config: { maxOutputTokens: 8192 },
    });

    res.json({ answer: response.text ?? "" });
  } catch (err) {
    req.log.error({ err }, "Failed to answer PDF question");
    res.status(500).json({ error: "Failed to process PDF question" });
  }
});

export default router;
