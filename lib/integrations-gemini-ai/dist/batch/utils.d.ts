/**
 * Batch Processing Utilities
 *
 * Generic batch processing with built-in rate limiting and automatic retries.
 * Use for any task that requires processing multiple items through an LLM or external API.
 *
 * USAGE:
 * ```typescript
 * import { batchProcess } from "@workspace/integrations-gemini-ai/batch";
 * import { ai } from "@workspace/integrations-gemini-ai";
 *
 * const results = await batchProcess(
 *   artworks,
 *   async (artwork) => {
 *     const response = await ai.models.generateContent({
 *       model: "gemini-2.5-flash",
 *       contents: [{ role: "user", parts: [{ text: `Categorize: ${artwork.name}` }] }],
 *       config: { responseMimeType: "application/json" },
 *     });
 *     return JSON.parse(response.text ?? "{}");
 *   },
 *   { concurrency: 2, retries: 5 }
 * );
 * ```
 */
export interface BatchOptions {
    concurrency?: number;
    retries?: number;
    minTimeout?: number;
    maxTimeout?: number;
    onProgress?: (completed: number, total: number, item: unknown) => void;
}
export declare function isRateLimitError(error: unknown): boolean;
export declare function batchProcess<T, R>(items: T[], processor: (item: T, index: number) => Promise<R>, options?: BatchOptions): Promise<R[]>;
export declare function batchProcessWithSSE<T, R>(items: T[], processor: (item: T, index: number) => Promise<R>, sendEvent: (event: {
    type: string;
    [key: string]: unknown;
}) => void, options?: Omit<BatchOptions, "concurrency" | "onProgress">): Promise<R[]>;
//# sourceMappingURL=utils.d.ts.map