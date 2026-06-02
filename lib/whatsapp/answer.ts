/**
 * WhatsApp answer engine.
 *
 * A deliberately simpler flow than the web /api/chat route: WhatsApp can't
 * render the decision tree, the consent modal, or stream SSE, and you can't
 * realistically fill an EX-10 over chat text. So WhatsApp is INFO MODE only —
 * RAG-grounded Q&A over the knowledge base, in the user's language, with a
 * steer back to the web app for document preparation.
 *
 * Pipeline: detect language → embed → match_chunks → buildSystemPrompt →
 * LLM (no tools) → drain stream to a single string.
 */

import { createServiceClient } from "@/lib/supabase";
import { buildSystemPrompt } from "@/lib/prompt-builder";
import { createChatInvocationWithFallback } from "@/lib/llm/provider-registry";
import type { ChatProviderMessage } from "@/lib/llm/chat-provider";

const VOYAGE_MODEL = "voyage-multilingual-2";
const VOYAGE_URL = "https://api.voyageai.com/v1/embeddings";
const MAX_TOKENS = 1024;

interface MatchChunk {
  content: string;
  similarity: number;
  llei_referencia: string | null;
  source_file: string | null;
}

async function embed(text: string, apiKey: string): Promise<number[] | null> {
  try {
    const resp = await fetch(VOYAGE_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: VOYAGE_MODEL,
        input: [text],
        input_type: "query",
      }),
    });
    if (!resp.ok) return null;
    const data = await resp.json();
    return data.data?.[0]?.embedding ?? null;
  } catch {
    return null;
  }
}

/**
 * Best-effort, very rough language guess for the reply. WhatsApp gives us no
 * locale, so we sniff the script/keywords. Defaults to Spanish — the most
 * widely understood among the target audience.
 */
function guessLang(text: string): string {
  if (/[؀-ۿ]/.test(text)) return "ar";
  const t = text.toLowerCase();
  if (/\b(bonjour|merci|je|nationalité|séjour|étranger)\b/.test(t)) return "fr";
  if (/\b(hello|thanks|please|residence|how do i)\b/.test(t)) return "en";
  if (/\b(bon dia|gràcies|sóc|estrangeria|tràmit)\b/.test(t)) return "ca";
  return "es";
}

export async function answerWhatsappQuestion(message: string): Promise<string> {
  const voyageKey = process.env.VOYAGE_API_KEY;
  const lang = guessLang(message);

  // Graceful fallback if the embedding key is missing.
  const supabase = createServiceClient();
  let contextBlock =
    "No s'han trobat documents específics. Respon amb el que sàpigues i indica que cal confirmar amb una entitat especialitzada.";

  if (voyageKey) {
    const embedding = await embed(message, voyageKey);
    if (embedding) {
      const { data: chunks } = await supabase.rpc("match_chunks", {
        query_embedding: JSON.stringify(embedding),
        match_count: 6,
      });
      const relevant = ((chunks || []) as MatchChunk[]).filter(
        (c) => c.similarity >= 0.3
      );
      if (relevant.length > 0) {
        contextBlock =
          "DOCUMENTS DE REFERÈNCIA:\n\n" +
          relevant
            .map(
              (c, i) =>
                `[${i + 1}] ${c.content}${
                  c.llei_referencia ? ` (${c.llei_referencia})` : ""
                }`
            )
            .join("\n\n");
      }
    }
  }

  const systemPrompt = buildSystemPrompt({
    idioma: lang,
    mode: "info",
    contextBlock,
  });

  const messages: ChatProviderMessage[] = [{ role: "user", content: message }];

  try {
    const invocation = await createChatInvocationWithFallback({
      systemPrompt,
      messages,
      mode: "info",
      subPhase: "conversa",
      missingFields: [],
      maxTokens: MAX_TOKENS,
    });

    let full = "";
    for await (const event of invocation.stream) {
      if (event.type === "text_delta") full += event.text;
    }
    full = full.trim();

    // Append a gentle steer to the web app for document preparation.
    const cta: Record<string, string> = {
      es: "\n\nPara preparar tus documentos paso a paso, entra en pathfinder (web).",
      ca: "\n\nPer preparar els teus documents pas a pas, entra a pathfinder (web).",
      en: "\n\nTo prepare your documents step by step, open pathfinder (web).",
      fr: "\n\nPour préparer tes documents étape par étape, ouvre pathfinder (web).",
      ar: "\n\nلتحضير مستنداتك خطوة بخطوة، افتح pathfinder (الويب).",
    };

    return (full || "Lo siento, no he podido generar una respuesta.") + (cta[lang] ?? cta.es);
  } catch (err) {
    console.error(
      "[whatsapp] answer error:",
      err instanceof Error ? err.message : "unknown"
    );
    return "Lo siento, ahora mismo no puedo responder. Inténtalo de nuevo en unos minutos.";
  }
}
