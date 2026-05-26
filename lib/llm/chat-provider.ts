import type { ChatSubPhase } from "@/lib/types/chat-flow";
import type { ChatToolDefinition } from "@/lib/tool-definitions";

export type ChatProviderName = "anthropic" | "openai" | "gemini";

export interface ChatProviderToolChoice {
  type: string;
}

export type ChatProviderContentBlock =
  | {
      type: "tool_use";
      id: string;
      name: string;
      input: Record<string, unknown>;
    }
  | {
      type: "tool_result";
      tool_use_id: string;
      content: string;
    };

export interface ChatProviderMessage {
  role: "user" | "assistant";
  content: string | ChatProviderContentBlock[];
}

export type NormalizedChatStreamEvent =
  | { type: "text_delta"; text: string }
  | { type: "content_block_start"; contentBlockType: string; id?: string }
  | { type: "content_block_stop" }
  | { type: "input_json_delta"; partialJson: string }
  | { type: "message_delta"; stopReason: string };

export interface ChatProviderRequest {
  systemPrompt: string;
  messages: ChatProviderMessage[];
  mode: "info" | "collection";
  subPhase: ChatSubPhase;
  missingFields: string[];
  maxTokens: number;
  tools?: ChatToolDefinition[];
  toolChoice?: ChatProviderToolChoice;
  cacheControl?: { type: "ephemeral" };
  preferredProviders?: ChatProviderName[];
}

export interface ChatProviderFollowUpRequest {
  systemPrompt: string;
  messages: ChatProviderMessage[];
  maxTokens: number;
  cacheControl?: { type: "ephemeral" };
}

export interface ChatProviderInvocation {
  provider: ChatProviderName;
  model: string;
  toolChoiceUsed?: ChatProviderToolChoice;
  stream: AsyncGenerator<NormalizedChatStreamEvent>;
  continueAfterToolUse(
    request: ChatProviderFollowUpRequest
  ): Promise<AsyncGenerator<NormalizedChatStreamEvent>>;
}

export interface ChatProviderAdapter {
  name: ChatProviderName;
  isConfigured(): boolean;
  createInvocation(request: ChatProviderRequest): Promise<ChatProviderInvocation>;
}