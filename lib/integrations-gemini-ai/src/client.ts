import { GoogleGenAI } from "@google/genai";

const baseUrl = process.env.AI_INTEGRATIONS_GEMINI_BASE_URL;
const proxyKey = process.env.AI_INTEGRATIONS_GEMINI_API_KEY;
const directKey = process.env.GEMINI_API_KEY;

if (!baseUrl && !directKey) {
  throw new Error(
    "Either AI_INTEGRATIONS_GEMINI_BASE_URL (Replit integration) or GEMINI_API_KEY must be set.",
  );
}

if (baseUrl && !proxyKey) {
  throw new Error(
    "AI_INTEGRATIONS_GEMINI_BASE_URL is set but AI_INTEGRATIONS_GEMINI_API_KEY is missing.",
  );
}

export const ai = baseUrl
  ? new GoogleGenAI({
      apiKey: proxyKey!,
      httpOptions: {
        apiVersion: "",
        baseUrl,
      },
    })
  : new GoogleGenAI({ apiKey: directKey! });
