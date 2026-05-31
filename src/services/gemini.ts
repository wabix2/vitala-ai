import { getGeminiApiKey } from "./env";

const MODEL = "gemini-2.5-flash";

type GeminiResponse = {
  candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
  error?: { message?: string };
};

async function generate(prompt: string) {
  const apiKey = getGeminiApiKey();
  if (!apiKey) {
    return "Gemini is not configured yet. Add GEMINI_API_KEY to your environment and run the production checks.";
  }

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.45,
          topP: 0.9,
          maxOutputTokens: 900
        }
      })
    }
  );

  const data = (await response.json()) as GeminiResponse;
  if (!response.ok) {
    throw new Error(data.error?.message ?? "Gemini request failed");
  }

  return data.candidates?.[0]?.content?.parts?.map((part) => part.text ?? "").join("\n").trim() || "I could not generate a useful answer.";
}

export function askTutor(input: string, memory: string[]) {
  return generate(
    `You are Vitala, a precise premium AI study assistant. Use a warm, concise tutoring style.
Known study memory: ${memory.join(" | ") || "none"}.
Student asks: ${input}
Respond with step-by-step help, a quick check question, and one next study action.`
  );
}

export function explainFeynman(topic: string, level: "simple" | "intermediate" | "expert") {
  return generate(
    `Explain "${topic}" using Feynman learning mode at ${level} level. Include analogy, key misconception, and a teach-back prompt.`
  );
}

export function reviewTeachBack(topic: string, answer: string) {
  return generate(
    `A student taught back this topic: ${topic}.
Their explanation: ${answer}
Correct inaccuracies, improve clarity, and give a 3-step better explanation.`
  );
}

export function summarizeDocument(name: string) {
  return generate(
    `Create a PDF intelligence report for "${name}". Include short summary, key concepts, chapter-style breakdown, formulas, definitions, likely exam questions, and suggested quiz plan.`
  );
}

export function generateQuiz(source: string, difficulty: string) {
  return generate(
    `Generate a ${difficulty} study quiz from this source/topic: ${source}. Return 4 MCQs and 2 short-answer questions with answers and explanations.`
  );
}
