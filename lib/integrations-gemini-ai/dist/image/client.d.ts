import { GoogleGenAI } from "@google/genai";
export declare const ai: GoogleGenAI;
export declare function generateImage(prompt: string): Promise<{
    b64_json: string;
    mimeType: string;
}>;
//# sourceMappingURL=client.d.ts.map