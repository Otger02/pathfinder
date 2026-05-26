import type {
  ChatProviderAdapter,
  ChatProviderInvocation,
  ChatProviderName,
  ChatProviderRequest,
} from "@/lib/llm/chat-provider";
import { AnthropicChatProvider } from "@/lib/llm/providers/anthropic-chat";
import { OpenAIChatProvider } from "@/lib/llm/providers/openai-chat";

const DEFAULT_PROVIDER_ORDER: ChatProviderName[] = ["anthropic"];

function parseProviderOrder(rawOrder: string | undefined): ChatProviderName[] {
  if (!rawOrder) return DEFAULT_PROVIDER_ORDER;

  const parsed = rawOrder
    .split(",")
    .map((name) => name.trim().toLowerCase())
    .filter(
      (name): name is ChatProviderName =>
        name === "anthropic" || name === "openai"
    );

  return parsed.length > 0 ? Array.from(new Set(parsed)) : DEFAULT_PROVIDER_ORDER;
}

export function getConfiguredChatProviders(): ChatProviderAdapter[] {
  const providers: Record<ChatProviderName, ChatProviderAdapter> = {
    anthropic: new AnthropicChatProvider(process.env.ANTHROPIC_API_KEY),
    openai: new OpenAIChatProvider(process.env.OPENAI_API_KEY),
  };

  return parseProviderOrder(process.env.CHAT_PROVIDER_ORDER)
    .map((name) => providers[name])
    .filter((provider) => provider.isConfigured());
}

export async function createChatInvocationWithFallback(
  request: ChatProviderRequest
): Promise<ChatProviderInvocation> {
  const configuredProviders = getConfiguredChatProviders();
  if (process.env.NODE_ENV !== "production") {
    console.log(
      "[chat] provider order:",
      process.env.CHAT_PROVIDER_ORDER || "(default)",
      "configured:",
      configuredProviders.map((provider) => provider.name)
    );
  }
  if (configuredProviders.length === 0) {
    throw new Error("No chat providers are configured");
  }

  const errors: string[] = [];
  for (const provider of configuredProviders) {
    try {
      return await provider.createInvocation(request);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      if (process.env.NODE_ENV !== "production") {
        console.warn(`[chat] provider failed: ${provider.name} -> ${message}`);
      }
      errors.push(`${provider.name}: ${message}`);
    }
  }

  throw new Error(`All chat providers failed. ${errors.join(" | ")}`);
}