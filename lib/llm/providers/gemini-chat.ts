import type {
  ChatProviderAdapter,
  ChatProviderFollowUpRequest,
  ChatProviderInvocation,
  ChatProviderMessage,
  ChatProviderRequest,
  NormalizedChatStreamEvent,
} from "@/lib/llm/chat-provider";

const GEMINI_MODEL_FLASH = "gemini-2.5-flash";
const GEMINI_STREAM_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL_FLASH}:streamGenerateContent?alt=sse`;

function geminiHeaders(apiKey: string): Record<string, string> {
  return {
    "Content-Type": "application/json",
    "x-goog-api-key": apiKey,
  };
}

function toGeminiMessages(messages: ChatProviderMessage[]): Array<{ role: "user" | "model"; parts: Array<{ text: string }> }> {
  return messages.flatMap((message) => {
    if (typeof message.content !== "string") {
      throw new Error("Gemini adapter only supports text-only messages");
    }

    return [{
      role: message.role === "assistant" ? "model" : "user",
      parts: [{ text: message.content }],
    }];
  });
}

async function* parseGeminiStream(response: Response): AsyncGenerator<NormalizedChatStreamEvent> {
  const reader = response.body!.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() || "";

    for (const line of lines) {
      if (!line.startsWith("data: ")) continue;
      const jsonStr = line.slice(6).trim();
      if (!jsonStr) continue;

      try {
        const event = JSON.parse(jsonStr) as {
          candidates?: Array<{
            content?: { parts?: Array<{ text?: string }> };
            finishReason?: string;
          }>;
        };

        const candidate = event.candidates?.[0];
        for (const part of candidate?.content?.parts ?? []) {
          if (typeof part.text === "string" && part.text.length > 0) {
            yield { type: "text_delta", text: part.text };
          }
        }

        if (candidate?.finishReason) {
          yield { type: "message_delta", stopReason: candidate.finishReason.toLowerCase() };
        }
      } catch {
        // Ignore malformed SSE chunks.
      }
    }
  }
}

async function geminiFetch(apiKey: string, body: Record<string, unknown>): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 60_000);

  try {
    const response = await fetch(GEMINI_STREAM_URL, {
      method: "POST",
      headers: geminiHeaders(apiKey),
      body: JSON.stringify(body),
      signal: controller.signal,
    });

    if (!response.ok) {
      const errBody = await response.text();
      throw new Error(`Gemini API ${response.status}: ${errBody.slice(0, 300)}`);
    }

    return response;
  } finally {
    clearTimeout(timeout);
  }
}

export class GeminiChatProvider implements ChatProviderAdapter {
  readonly name = "gemini" as const;

  constructor(private readonly apiKey: string | undefined) {}

  isConfigured(): boolean {
    return typeof this.apiKey === "string" && this.apiKey.length > 0;
  }

  async createInvocation(request: ChatProviderRequest): Promise<ChatProviderInvocation> {
    if (!this.apiKey) {
      throw new Error("Gemini provider is not configured");
    }
    if (request.tools && request.tools.length > 0) {
      throw new Error("Gemini adapter does not support tool use yet");
    }

    const response = await geminiFetch(this.apiKey, {
      systemInstruction: {
        parts: [{ text: request.systemPrompt }],
      },
      contents: toGeminiMessages(request.messages),
      generationConfig: {
        maxOutputTokens: request.maxTokens,
      },
    });

    return {
      provider: this.name,
      model: GEMINI_MODEL_FLASH,
      stream: parseGeminiStream(response),
      continueAfterToolUse: async (_followUpRequest: ChatProviderFollowUpRequest) => {
        throw new Error("Gemini follow-up after tool use is not supported yet");
      },
    };
  }
}