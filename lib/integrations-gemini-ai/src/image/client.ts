import { GoogleGenAI, Modality } from "@google/genai";

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

export async function generateImage(
  prompt: string
): Promise<{ b64_json: string; mimeType: string }> {
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-image",
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    config: {
      responseModalities: [Modality.TEXT, Modality.IMAGE],
    },
  });

  const candidate = response.candidates?.[0];
  const imagePart = candidate?.content?.parts?.find(
    (part: { inlineData?: { data?: string; mimeType?: string } }) => part.inlineData
  );

  if (!imagePart?.inlineData?.data) {
    throw new Error("No image data in response");
  }

  return {
    b64_json: imagePart.inlineData.data,
    mimeType: imagePart.inlineData.mimeType || "image/png",
  };
}
