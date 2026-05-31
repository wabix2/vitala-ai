import { GoogleGenAI } from "@google/genai";

const apiKey =
  process.env.AI_INTEGRATIONS_GEMINI_API_KEY ??
  process.env.GEMINI_API_KEY;

if (!apiKey) {
  throw new Error(
    "AI_INTEGRATIONS_GEMINI_API_KEY or GEMINI_API_KEY must be set.",
  );
}

const baseUrl =
  process.env.AI_INTEGRATIONS_GEMINI_BASE_URL ??
  "https://generativelanguage.googleapis.com";

export const ai = new GoogleGenAI({
  apiKey,
  httpOptions: {
    apiVersion: "v1beta",
    baseUrl,
  },
});
