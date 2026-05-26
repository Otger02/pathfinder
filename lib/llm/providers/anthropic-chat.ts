import type {
  ChatProviderAdapter,
  ChatProviderFollowUpRequest,
  ChatProviderInvocation,
  ChatProviderMessage,
  ChatProviderRequest,
  NormalizedChatStreamEvent,
} from "@/lib/llm/chat-provider";

const CLAUDE_MODEL_HAIKU = "claude-haiku-4-5-20251001";
const CLAUDE_MODEL_SONNET = "claude-sonnet-4-5-20250929";
const CLAUDE_URL = "https://api.anthropic.com/v1/messages";

function selectAnthropicModel(request: ChatProviderRequest): string {
  return request.mode === "collection" && request.subPhase === "conversa"
    ? CLAUDE_MODEL_SONNET
    : CLAUDE_MODEL_HAIKU;
}

function anthropicHeaders(apiKey: string): Record<string, string> {
  return {
    "Content-Type": "application/json",
    "x-api-key": apiKey,
    "anthropic-version": "2023-06-01",
  };
}

async function* parseAnthropicStream(
  response: Response
): AsyncGenerator<NormalizedChatStreamEvent> {
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
      if (jsonStr === "[DONE]") continue;

      try {
        const event = JSON.parse(jsonStr);

        if (
          event.type === "content_block_delta" &&
          event.delta?.type === "text_delta"
        ) {
          yield { type: "text_delta", text: event.delta.text };
          continue;
        }

        if (event.type === "content_block_start" && event.content_block?.type) {
          yield {
            type: "content_block_start",
            contentBlockType: event.content_block.type,
            id: event.content_block.id,
          };
          continue;
        }

        if (
          event.type === "content_block_delta" &&
          event.delta?.type === "input_json_delta"
        ) {
          yield {
            type: "input_json_delta",
            partialJson: event.delta.partial_json || "",
          };
          continue;
        }

        if (event.type === "content_block_stop") {
          yield { type: "content_block_stop" };
          continue;
        }

        if (event.type === "message_delta" && event.delta?.stop_reason) {
          yield {
            type: "message_delta",
            stopReason: event.delta.stop_reason,
          };
        }
      } catch {
        // Ignore malformed SSE chunks.
      }
    }
  }
}

async function anthropicFetch(
  apiKey: string,
  body: Record<string, unknown>
): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 60_000);

  try {
    const response = await fetch(CLAUDE_URL, {
      method: "POST",
      headers: anthropicHeaders(apiKey),
      body: JSON.stringify(body),
      signal: controller.signal,
    });

    if (!response.ok) {
      const errBody = await response.text();
      throw new Error(`Claude API ${response.status}: ${errBody.slice(0, 300)}`);
    }

    return response;
  } finally {
    clearTimeout(timeout);
  }
}

function toAnthropicMessages(messages: ChatProviderMessage[]): Array<{ role: string; content: string | unknown[] }> {
  return messages.map((message) => ({
    role: message.role,
    content: message.content,
  }));
}

export class AnthropicChatProvider implements ChatProviderAdapter {
  readonly name = "anthropic" as const;

  constructor(private readonly apiKey: string | undefined) {}

  isConfigured(): boolean {
    return typeof this.apiKey === "string" && this.apiKey.length > 0;
  }

  async createInvocation(request: ChatProviderRequest): Promise<ChatProviderInvocation> {
    if (!this.apiKey) {
      throw new Error("Anthropic provider is not configured");
    }

    const model = selectAnthropicModel(request);
    const response = await anthropicFetch(this.apiKey, {
      model,
      max_tokens: request.maxTokens,
      system: request.systemPrompt,
      messages: toAnthropicMessages(request.messages),
      cache_control: request.cacheControl,
      stream: true,
      ...(request.tools ? { tools: request.tools } : {}),
      ...(request.toolChoice ? { tool_choice: request.toolChoice } : {}),
    });

    return {
      provider: this.name,
      model,
      toolChoiceUsed: request.toolChoice,
      stream: parseAnthropicStream(response),
      continueAfterToolUse: async (followUpRequest: ChatProviderFollowUpRequest) => {
        const followUpResponse = await anthropicFetch(this.apiKey!, {
          model,
          max_tokens: followUpRequest.maxTokens,
          system: followUpRequest.systemPrompt,
          messages: toAnthropicMessages(followUpRequest.messages),
          cache_control: followUpRequest.cacheControl,
          stream: true,
        });
        return parseAnthropicStream(followUpResponse);
      },
    };
  }
}