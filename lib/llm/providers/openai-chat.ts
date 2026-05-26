import type {
  ChatProviderAdapter,
  ChatProviderContentBlock,
  ChatProviderFollowUpRequest,
  ChatProviderInvocation,
  ChatProviderMessage,
  ChatProviderRequest,
  ChatProviderToolChoice,
  NormalizedChatStreamEvent,
} from "@/lib/llm/chat-provider";
import type { ChatToolDefinition } from "@/lib/tool-definitions";

const OPENAI_MODEL_MINI = "gpt-4.1-mini";
const OPENAI_MODEL_FULL = "gpt-4.1";
const OPENAI_URL = "https://api.openai.com/v1/chat/completions";

type OpenAIToolChoice = "auto" | "required";

interface OpenAIChatMessage {
  role: "system" | "user" | "assistant" | "tool";
  content?: string | null;
  tool_call_id?: string;
  tool_calls?: Array<{
    id: string;
    type: "function";
    function: {
      name: string;
      arguments: string;
    };
  }>;
}

function selectOpenAIModel(request: ChatProviderRequest): string {
  return request.mode === "collection" && request.subPhase === "conversa"
    ? OPENAI_MODEL_FULL
    : OPENAI_MODEL_MINI;
}

function openAIHeaders(apiKey: string): Record<string, string> {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${apiKey}`,
  };
}

function toOpenAIToolChoice(toolChoice: ChatProviderToolChoice | undefined): OpenAIToolChoice | undefined {
  if (!toolChoice) return undefined;
  return toolChoice.type === "any" ? "required" : "auto";
}

function toOpenAITools(tools: ChatToolDefinition[] | undefined): unknown[] | undefined {
  if (!tools || tools.length === 0) return undefined;

  return tools.map((tool) => ({
    type: "function",
    function: {
      name: tool.name,
      description: tool.description,
      parameters: tool.input_schema,
      ...(tool.strict ? { strict: true } : {}),
    },
  }));
}

function toOpenAIMessages(
  systemPrompt: string,
  messages: ChatProviderMessage[]
): OpenAIChatMessage[] {
  const output: OpenAIChatMessage[] = [{ role: "system", content: systemPrompt }];

  for (const message of messages) {
    if (typeof message.content === "string") {
      output.push({ role: message.role, content: message.content });
      continue;
    }

    if (message.role === "assistant") {
      const toolUses = message.content.filter(
        (block): block is Extract<ChatProviderContentBlock, { type: "tool_use" }> =>
          block.type === "tool_use"
      );
      if (toolUses.length > 0) {
        output.push({
          role: "assistant",
          content: null,
          tool_calls: toolUses.map((block) => ({
            id: block.id,
            type: "function",
            function: {
              name: block.name,
              arguments: JSON.stringify(block.input),
            },
          })),
        });
      }
      continue;
    }

    for (const block of message.content) {
      if (block.type !== "tool_result") continue;
      output.push({
        role: "tool",
        tool_call_id: block.tool_use_id,
        content: block.content,
      });
    }
  }

  return output;
}

async function* parseOpenAIStream(
  response: Response
): AsyncGenerator<NormalizedChatStreamEvent> {
  const reader = response.body!.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  const seenToolCalls = new Set<number>();
  let toolCallActive = false;

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
        const event = JSON.parse(jsonStr) as {
          choices?: Array<{
            delta?: {
              content?: string;
              tool_calls?: Array<{
                index?: number;
                id?: string;
                function?: {
                  name?: string;
                  arguments?: string;
                };
              }>;
            };
            finish_reason?: string | null;
          }>;
        };

        const choice = event.choices?.[0];
        const delta = choice?.delta;

        if (typeof delta?.content === "string" && delta.content.length > 0) {
          yield { type: "text_delta", text: delta.content };
        }

        for (const toolCall of delta?.tool_calls ?? []) {
          const index = toolCall.index ?? 0;
          if (!seenToolCalls.has(index)) {
            seenToolCalls.add(index);
            toolCallActive = true;
            yield {
              type: "content_block_start",
              contentBlockType: "tool_use",
              id: toolCall.id,
            };
          }

          if (toolCall.function?.arguments) {
            yield {
              type: "input_json_delta",
              partialJson: toolCall.function.arguments,
            };
          }
        }

        if (choice?.finish_reason) {
          if (toolCallActive && choice.finish_reason === "tool_calls") {
            toolCallActive = false;
            yield { type: "content_block_stop" };
          }

          yield {
            type: "message_delta",
            stopReason: choice.finish_reason,
          };
        }
      } catch {
        // Ignore malformed SSE chunks.
      }
    }
  }
}

async function openAIFetch(
  apiKey: string,
  body: Record<string, unknown>
): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 60_000);

  try {
    const response = await fetch(OPENAI_URL, {
      method: "POST",
      headers: openAIHeaders(apiKey),
      body: JSON.stringify(body),
      signal: controller.signal,
    });

    if (!response.ok) {
      const errBody = await response.text();
      throw new Error(`OpenAI API ${response.status}: ${errBody.slice(0, 300)}`);
    }

    return response;
  } finally {
    clearTimeout(timeout);
  }
}

export class OpenAIChatProvider implements ChatProviderAdapter {
  readonly name = "openai" as const;

  constructor(private readonly apiKey: string | undefined) {}

  isConfigured(): boolean {
    return typeof this.apiKey === "string" && this.apiKey.length > 0;
  }

  async createInvocation(request: ChatProviderRequest): Promise<ChatProviderInvocation> {
    if (!this.apiKey) {
      throw new Error("OpenAI provider is not configured");
    }

    const model = selectOpenAIModel(request);
    const response = await openAIFetch(this.apiKey, {
      model,
      max_tokens: request.maxTokens,
      messages: toOpenAIMessages(request.systemPrompt, request.messages),
      stream: true,
      ...(request.tools ? { tools: toOpenAITools(request.tools) } : {}),
      ...(request.toolChoice ? { tool_choice: toOpenAIToolChoice(request.toolChoice) } : {}),
    });

    return {
      provider: this.name,
      model,
      toolChoiceUsed: request.toolChoice,
      stream: parseOpenAIStream(response),
      continueAfterToolUse: async (followUpRequest: ChatProviderFollowUpRequest) => {
        const followUpResponse = await openAIFetch(this.apiKey!, {
          model,
          max_tokens: followUpRequest.maxTokens,
          messages: toOpenAIMessages(followUpRequest.systemPrompt, followUpRequest.messages),
          stream: true,
        });

        return parseOpenAIStream(followUpResponse);
      },
    };
  }
}