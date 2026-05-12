import { fetch } from "expo/fetch";
import { getApiUrl } from "@/lib/query-client";

export async function streamChatMessage(
  conversationId: number,
  content: string,
  language: string,
  onChunk: (text: string) => void,
  onDone: () => void,
  onError: (err: string) => void,
) {
  try {
    const response = await fetch(
      `${getApiUrl()}api/gemini/conversations/${conversationId}/messages`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "text/event-stream",
        },
        body: JSON.stringify({ content, language }),
      },
    );

    if (!response.ok) {
      onError("Failed to get AI response");
      return;
    }

    const reader = response.body?.getReader();
    if (!reader) {
      onError("No response body");
      return;
    }

    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() ?? "";

      for (const line of lines) {
        if (!line.startsWith("data: ")) continue;
        const data = line.slice(6);
        try {
          const parsed = JSON.parse(data) as {
            content?: string;
            done?: boolean;
            error?: string;
          };
          if (parsed.error) {
            onError(parsed.error);
            return;
          }
          if (parsed.content) onChunk(parsed.content);
          if (parsed.done) {
            onDone();
            return;
          }
        } catch {}
      }
    }
    onDone();
  } catch (err) {
    onError(err instanceof Error ? err.message : "Unknown error");
  }
}
