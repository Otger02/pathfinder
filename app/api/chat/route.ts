import { NextRequest } from "next/server";
import * as Sentry from "@sentry/nextjs";
import { createServiceClient } from "@/lib/supabase";
import { createAuthServerClient } from "@/lib/supabase-server";
import { checkRateLimit, getClientIp, rateLimitResponse } from "@/lib/rate-limit";
import { ChatRequestSchema, badRequestFromZod } from "@/lib/validation/schemas";
import { detectSos } from "@/lib/sos";
import { buildSystemPrompt } from "@/lib/prompt-builder";
import {
  ccaaForProvinceIso,
  isoForNationality,
  isoForProvince,
} from "@/lib/iso-mappings";
import {
  buildCollectPersonalDataTool,
  normalizeCollectedPersonalDataInput,
} from "@/lib/tool-definitions";
import {
  createChatInvocationWithFallback,
} from "@/lib/llm/provider-registry";
import type {
  ChatProviderMessage,
} from "@/lib/llm/chat-provider";
import {
  computeMissingFields,
  shouldTransitionToResum,
  mergeExtractedData,
  computeCompletionPct,
} from "@/lib/collection-engine";
import {
  EMPTY_PERSONAL_DATA,
  type PersonalData,
  type PersonalDataField,
} from "@/lib/types/personal-data";
import type { ChatSubPhase } from "@/lib/types/chat-flow";

// Node.js runtime (not Edge) — needed for tool_use stream parsing + crypto
export const runtime = "nodejs";

// Diagnostic logs are gated to non-production to avoid noisy stdout in deploy.
const isDev = process.env.NODE_ENV !== "production";
const debug = (...args: unknown[]) => { if (isDev) console.log(...args); };

// ── Config ───────────────────────────────────────────────────────────
const VOYAGE_MODEL = "voyage-multilingual-2";
const VOYAGE_URL = "https://api.voyageai.com/v1/embeddings";
const CLAUDE_MAX_TOKENS = 2048;

// ── Helpers ──────────────────────────────────────────────────────────

async function embedQuery(text: string, apiKey: string): Promise<number[]> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30_000);

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
      signal: controller.signal,
    });

    if (!resp.ok) {
      const body = await resp.text();
      throw new Error(`Voyage API ${resp.status}: ${body.slice(0, 200)}`);
    }

    const data = await resp.json();
    return data.data[0].embedding;
  } finally {
    clearTimeout(timeout);
  }
}

interface MatchChunk {
  id: string;
  content: string;
  similarity: number;
  tipus_autoritzacio: string | null;
  situacio_legal: string | null;
  llei_referencia: string | null;
  source_file: string | null;
}

interface ProceduralContextNote {
  id: string;
  authorization_slug: string | null;
  scope: "province" | "ccaa" | "national" | "consulate";
  province_iso: string | null;
  ccaa_code: string | null;
  country_iso: string | null;
  practical_text: string;
  legal_text: string | null;
  severity: "blocker" | "workaround" | "warning" | "info";
  source: string | null;
  description: Record<string, string> | null;
}

const PROCEDURAL_SEVERITY_ORDER = ["blocker", "workaround", "warning", "info"] as const;

function sseEvent(data: Record<string, unknown>): string {
  return `data: ${JSON.stringify(data)}\n\n`;
}

function pickLocalizedDescription(
  description: Record<string, string> | null | undefined,
  idioma: string,
  fallback: string
): string {
  if (!description || typeof description !== "object") return fallback;
  return description[idioma] || description.es || description.ca || description.en || fallback;
}

async function loadProceduralNotesForChat(
  supabase: ReturnType<typeof createServiceClient>,
  authSlugs: string[],
  provinceIso: string | null,
  ccaaCode: string | null,
  countryIso: string | null
): Promise<ProceduralContextNote[]> {
  const { data, error } = await supabase
    .from("procedural_notes")
    .select(
      "id, authorization_slug, scope, province_iso, ccaa_code, country_iso, practical_text, legal_text, severity, source, description"
    )
    .eq("active", true)
    .limit(40);

  if (error) {
    debug("[chat] procedural notes unavailable:", error.message);
    return [];
  }

  const rows = (data || []) as ProceduralContextNote[];
  const filtered = rows.filter((note) => {
    const matchesAuth =
      note.authorization_slug == null ||
      authSlugs.length === 0 ||
      authSlugs.includes(note.authorization_slug);
    if (!matchesAuth) return false;

    if (note.scope === "national") return true;
    if (note.scope === "province") {
      return Boolean(provinceIso && note.province_iso === provinceIso);
    }
    if (note.scope === "ccaa") {
      return Boolean(ccaaCode && note.ccaa_code === ccaaCode);
    }
    if (note.scope === "consulate") {
      return Boolean(countryIso && note.country_iso === countryIso);
    }
    return false;
  });

  filtered.sort(
    (a, b) =>
      PROCEDURAL_SEVERITY_ORDER.indexOf(a.severity) -
      PROCEDURAL_SEVERITY_ORDER.indexOf(b.severity)
  );

  return filtered.slice(0, 6);
}

const REMEMBERED_FIELD_KEYS = new Set<PersonalDataField>(
  Object.keys(EMPTY_PERSONAL_DATA) as PersonalDataField[]
);

const REMEMBERED_FIELD_EXCLUSIONS = new Set<PersonalDataField>([
  "documents_obtained",
  "tipoSolicitud",
]);

function sanitizeRememberedCollectedData(input: unknown): Partial<PersonalData> {
  if (!input || typeof input !== "object" || Array.isArray(input)) return {};

  const remembered: Partial<PersonalData> = {};
  for (const [key, value] of Object.entries(input as Record<string, unknown>)) {
    const field = key as PersonalDataField;
    if (!REMEMBERED_FIELD_KEYS.has(field)) continue;
    if (REMEMBERED_FIELD_EXCLUSIONS.has(field)) continue;

    if (typeof value === "boolean") {
      remembered[field] = value as never;
      continue;
    }

    if (Array.isArray(value)) {
      if (value.length > 0) remembered[field] = value as never;
      continue;
    }

    if (typeof value === "string" && value.trim() !== "") {
      remembered[field] = value.trim() as never;
    }
  }

  return remembered;
}

async function loadRememberedCollectedData(
  supabase: ReturnType<typeof createServiceClient>,
  userId: string
): Promise<Partial<PersonalData>> {
  const nowIso = new Date().toISOString();
  const { data, error } = await supabase
    .from("conversations")
    .select("collected_data, created_at")
    .eq("user_id", userId)
    .gte("data_expires_at", nowIso)
    .order("created_at", { ascending: false })
    .limit(20);

  if (error) {
    console.error("[chat] remembered data load failed:", error.message);
    return {};
  }

  let remembered: Partial<PersonalData> = {};
  for (const row of (data || []).slice().reverse()) {
    remembered = mergeExtractedData(
      remembered,
      sanitizeRememberedCollectedData(row.collected_data)
    );
  }

  return remembered;
}

// ── POST handler ─────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    // Rate limit: each chat call costs real money (Claude + Voyage). 20/min/IP.
    const ip = getClientIp(req);
    const limit = checkRateLimit(ip, {
      windowMs: 60_000,
      max: 20,
      keyPrefix: "chat",
    });
    if (!limit.allowed) return rateLimitResponse(limit);

    const rawBody = await req.json();
    const parsed = ChatRequestSchema.safeParse(rawBody);
    if (!parsed.success) return badRequestFromZod(parsed.error);
    const {
      message,
      conversation_id,
      situacio_legal,
      idioma,
      auth_slugs,
      mode: requestMode,
      tree_node_id,
      tree_node_text,
      tree_node_note,
      tree_path,
      pending_extracted,
    } = parsed.data;

    // Vision fields uploaded before the conversation/consent existed.
    // Normalized through the same validator as the chat tool.
    const pendingExtracted = normalizeCollectedPersonalDataInput(
      pending_extracted ?? {}
    );

    const voyageKey = process.env.VOYAGE_API_KEY;
    if (!voyageKey) {
      return Response.json({ error: "Missing API keys" }, { status: 500 });
    }

    const supabase = createServiceClient();

    // Get authenticated user (nullable — anonymous sessions work unchanged)
    const supabaseAuth = await createAuthServerClient();
    const { data: { user } } = await supabaseAuth.auth.getUser();
    const userId = user?.id ?? null;

    // Determine mode early so new authenticated conversations can decide
    // whether to preload remembered collection data.
    const effectiveAuthSlugs = auth_slugs || [];
    const mode = requestMode || (effectiveAuthSlugs.length > 0 ? "collection" : "info");

    // ── Sentinel: __CONFIRM_SUMMARY__ ───────────────────────────
    if (message.trim() === "__CONFIRM_SUMMARY__" && conversation_id) {
      await supabase
        .from("conversations")
        .update({ chat_sub_phase: "document" })
        .eq("id", conversation_id);

      const encoder = new TextEncoder();
      const stream = new ReadableStream({
        start(ctrl) {
          ctrl.enqueue(encoder.encode(`data: ${JSON.stringify({ type: "phase_change", phase: "document" })}\n\n`));
          ctrl.enqueue(encoder.encode(`data: ${JSON.stringify({ type: "done" })}\n\n`));
          ctrl.close();
        },
      });
      return new Response(stream, {
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          Connection: "keep-alive",
        },
      });
    }

    // ── 1. Create or reuse conversation ──────────────────────────
    let convId = conversation_id;
    let collectedData: Partial<PersonalData> = {};
    let chatSubPhase: ChatSubPhase = "conversa";
    let consentGiven = false;

    // Build the tree-meta sub-object once — written into collected_data so
    // CaseDetail's PathTimeline can show how the user reached this node.
    const treeMeta: Record<string, unknown> = {};
    if (Array.isArray(tree_path) && tree_path.length > 0) {
      treeMeta._tree_path = tree_path;
    }
    if (tree_node_id) treeMeta._tree_node_id = tree_node_id;
    if (tree_node_text) treeMeta._tree_node_text = tree_node_text;

    let usedRememberedData = false;
    if (!convId) {
      let rememberedCollectedData: Partial<PersonalData> = {};
      if (userId && mode === "collection") {
        rememberedCollectedData = await loadRememberedCollectedData(supabase, userId);
        usedRememberedData = Object.keys(rememberedCollectedData).length > 0;
      }

      const insertData: Record<string, unknown> = {
        user_code: "web-anonymous",
        language: idioma || "es",
        country: "ES",
        ...(userId ? { user_id: userId } : {}),
      };
      if (auth_slugs && auth_slugs.length > 0) {
        insertData.auth_slugs = auth_slugs;
      }
      // Seed collected_data with remembered authenticated data plus tree meta
      // so new logged-in applications only ask for fields missing in the new
      // authorization while keeping per-route path context.
      collectedData = {
        ...rememberedCollectedData,
        ...(treeMeta as Partial<PersonalData>),
      };
      if (Object.keys(collectedData).length > 0) {
        insertData.collected_data = collectedData;
      }
      const { data, error } = await supabase
        .from("conversations")
        .insert(insertData)
        .select("id")
        .single();

      if (error) throw new Error(`Create conversation: ${error.message}`);
      convId = data.id;
    } else {
      // Load existing state
      const { data: conv } = await supabase
        .from("conversations")
        .select("collected_data, chat_sub_phase, consent_given, auth_slugs")
        .eq("id", convId)
        .single();

      if (conv) {
        collectedData = (conv.collected_data as Partial<PersonalData>) || {};
        chatSubPhase = (conv.chat_sub_phase as ChatSubPhase) || "conversa";
        consentGiven = conv.consent_given || false;
        // Apply vision fields that were extracted before the conversation
        // (or before consent) existed. Consent-gated: pre-consent uploads
        // only persist once the user has accepted; the client re-sends
        // them until then. Existing values win over OCR.
        if (consentGiven && Object.keys(pendingExtracted).length > 0) {
          collectedData = mergeExtractedData(pendingExtracted, collectedData);
          await supabase
            .from("conversations")
            .update({ collected_data: collectedData })
            .eq("id", convId);
          debug(
            "[chat] applied pending vision fields:",
            Object.keys(pendingExtracted).join(", ")
          );
        }
        // Backfill tree meta for legacy conversations created before we
        // started persisting it. Existing fields take precedence so we
        // never overwrite a known-good _tree_node_id.
        if (Object.keys(treeMeta).length > 0) {
          collectedData = {
            ...(treeMeta as Partial<PersonalData>),
            ...collectedData,
          };
        }
        // If client sends auth_slugs, update them
        if (auth_slugs && auth_slugs.length > 0 && (!conv.auth_slugs || conv.auth_slugs.length === 0)) {
          await supabase
            .from("conversations")
            .update({ auth_slugs })
            .eq("id", convId);
        }
      }
    }

    // ── 2. Consent gate ──────────────────────────────────────────
    // If consent has not been given yet, return immediately with
    // consent_request and close the stream. Claude is NOT called.
    // The client will re-send the same message after the user accepts,
    // at which point consentGiven will be true and we proceed normally.
    if (mode === "collection" && !consentGiven) {
      const enc = new TextEncoder();
      const consentStream = new ReadableStream({
        start(ctrl) {
          ctrl.enqueue(enc.encode(sseEvent({ type: "conversation_id", conversation_id: convId })));
          ctrl.enqueue(enc.encode(sseEvent({ type: "consent_request" })));
          ctrl.enqueue(enc.encode(sseEvent({ type: "done" })));
          ctrl.close();
        },
      });
      return new Response(consentStream, {
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          Connection: "keep-alive",
        },
      });
    }

    // ── 2.5. Save user message (no PII in content) ───────────────
    const { error: msgErr } = await supabase.from("messages").insert({
      conversation_id: convId,
      role: "user",
      content: message.trim(),
    });
    if (msgErr) throw new Error(`Save user message: ${msgErr.message}`);

    // Bump last-activity so the dashboard orders by real activity.
    // Message inserts don't touch the conversations row, so the 009
    // trigger never fires for them. Non-fatal: ignore errors (e.g.
    // migration 009 not applied yet).
    supabase
      .from("conversations")
      .update({ updated_at: new Date().toISOString() })
      .eq("id", convId)
      .then(({ error }) => {
        if (error) debug("[chat] updated_at bump skipped:", error.message);
      });

    // ── 2.6. SOS detection ──────────────────────────────────────
    const sosResult = detectSos(message.trim());
    let sosEventId: string | null = null;
    if (sosResult.detected) {
      const { data: sosData } = await supabase
        .from("sos_events")
        .insert({
          user_code: "web-anonymous",
          country: "ES",
          trigger_text: sosResult.matchedTerms.join(", "),
        })
        .select("id")
        .single();
      sosEventId = sosData?.id || null;
    }

    // ── 3. Embed → RAG ──────────────────────────────────────────
    // Enrich query with the decision-tree node title so RAG retrieves
    // chunks relevant to the user's specific path, not just their question.
    const ragQuery = tree_node_text
      ? `${tree_node_text}: ${message.trim()}`
      : message.trim();
    const queryEmbedding = await embedQuery(ragQuery, voyageKey);

    const rpcParams: Record<string, unknown> = {
      query_embedding: JSON.stringify(queryEmbedding),
      match_count: 6,
    };
    if (situacio_legal) {
      rpcParams.filter_situacio = situacio_legal;
    }

    const { data: chunks, error: rpcErr } = await supabase.rpc(
      "match_chunks",
      rpcParams
    );
    if (rpcErr) throw new Error(`match_chunks: ${rpcErr.message}`);

    const allChunks = (chunks || []) as MatchChunk[];
    const relevantChunks = allChunks.filter((c) => c.similarity >= 0.3);
    const provinceIso = isoForProvince(
      typeof collectedData.provincia === "string" ? collectedData.provincia : null
    );
    const ccaaCode = ccaaForProvinceIso(provinceIso);
    const countryIso = isoForNationality(
      typeof collectedData.nacionalidad === "string"
        ? collectedData.nacionalidad
        : null
    );
    const proceduralNotes = await loadProceduralNotesForChat(
      supabase,
      effectiveAuthSlugs,
      provinceIso,
      ccaaCode,
      countryIso
    );

    // ── 4. Build context block ──────────────────────────────────
    let contextBlock: string;
    if (relevantChunks.length > 0) {
      contextBlock =
        "DOCUMENTS DE REFERÈNCIA:\n\n" +
        relevantChunks
          .map(
            (c, i) =>
              `[${i + 1}] Font: ${c.source_file || "desconeguda"}${c.llei_referencia ? ` | Llei: ${c.llei_referencia}` : ""}\n${c.content}`
          )
          .join("\n\n---\n\n");
    } else {
      contextBlock =
        "No s'han trobat documents específics a la base de coneixement per aquesta consulta. Respon amb el que sàpigues i indica que no has trobat informació específica.";
    }

    if (proceduralNotes.length > 0) {
      contextBlock +=
        "\n\nNOTES D'APLICACIO REAL:\n\n" +
        proceduralNotes
          .map((note, index) => {
            const text = pickLocalizedDescription(
              note.description,
              idioma || "es",
              note.practical_text
            );
            const legal = note.legal_text ? `\nEl text legal diu: ${note.legal_text}` : "";
            const source = note.source ? `\nFont: ${note.source}` : "";
            return `[P${index + 1}] ${note.severity.toUpperCase()} | ${note.scope}\n${text}${legal}${source}`;
          })
          .join("\n\n---\n\n");
    }

    if (usedRememberedData) {
      // Guard against stale carry-over (e.g. yesterday's tests): the
      // model must confirm remembered identity data, never greet the
      // user by an unconfirmed name.
      contextBlock +=
        "\n\nNOTA SOBRE DADES PRECARREGADES: algunes dades personals d'aquesta conversa provenen d'una conversa anterior recent de l'usuari i PODEN NO SER SEVES o estar desactualitzades. NO saludis l'usuari pel nom ni donis cap dada per bona sense confirmar-la primer (\"Tinc registrat que... és correcte?\"). Si l'usuari les desmenteix, descarta-les i recull-les de nou.";
    }

    // ── 5. Conversation history (last 6 messages) ───────────────
    const { data: history } = await supabase
      .from("messages")
      .select("role, content")
      .eq("conversation_id", convId)
      .order("created_at", { ascending: true })
      .limit(7);

    const previousMessages = (history || []).slice(0, -1).slice(-6);

    // ── 6. Compute collection state for prompt ──────────────────
    const collectedFields = Object.entries(collectedData)
      .filter(([, v]) => v && typeof v === "string" && v.trim() !== "")
      .map(([k]) => k as PersonalDataField);

    let missingFields =
      mode === "collection"
        ? computeMissingFields(effectiveAuthSlugs, collectedData)
        : [];

    // Authenticated remembered data can fully satisfy a new application.
    // In that case skip directly to the summary instead of reopening slot
    // collection for fields we already know.
    if (
      mode === "collection" &&
      chatSubPhase === "conversa" &&
      missingFields.length === 0 &&
      Object.keys(collectedData).length > 0
    ) {
      chatSubPhase = "resum";
      supabase
        .from("conversations")
        .update({ chat_sub_phase: "resum" })
        .eq("id", convId)
        .then(({ error }) => {
          if (error) {
            console.error("[chat] failed to persist resum prefill:", error.message);
          }
        });
    }

    // ── 6.5. Defensive subPhase reset ─────────────────────────────
    // If a previous turn left subPhase at "resum"/"document" but we still
    // have required fields missing, the conversation must continue collecting.
    // Otherwise the prompt-builder would inject the RESUM/DOCUMENT sections
    // and the model would just announce a summary instead of asking for the
    // next missing field.
    if (
      mode === "collection" &&
      (chatSubPhase === "resum" || chatSubPhase === "document") &&
      missingFields.length > 0
    ) {
      debug(
        "[chat] reset subPhase→conversa  was=",
        chatSubPhase,
        " missing=",
        missingFields.length,
        " collected=",
        Object.keys(collectedData).length
      );
      chatSubPhase = "conversa";
    }

    // ── 6.6. Diagnostic log per turn ──────────────────────────────
    debug("[chat]", {
      convId: typeof convId === "string" ? convId.slice(0, 8) : null,
      mode,
      subPhase: chatSubPhase,
      authSlugs: effectiveAuthSlugs,
      collected: Object.keys(collectedData).length,
      missing: missingFields.length,
      missingFields: missingFields.slice(0, 5),
    });

    // ── 7. Build system prompt ──────────────────────────────────
    const systemPrompt = buildSystemPrompt({
      situacioLegal: situacio_legal,
      idioma: idioma || "es",
      mode,
      subPhase: chatSubPhase,
      authSlugs: effectiveAuthSlugs,
      collectedFields,
      collectedData,
      missingFields,
      contextBlock,
      treeNodeId: tree_node_id ?? undefined,
      treeNodeText: tree_node_text ?? undefined,
      treeNodeNote: tree_node_note ?? undefined,
      treePath: tree_path,
    });

    // ── 8. Build Claude messages ────────────────────────────────
    const providerMessages: ChatProviderMessage[] = [];

    for (const msg of previousMessages) {
      providerMessages.push({
        role: msg.role === "user" ? "user" : "assistant",
        content: msg.content,
      });
    }

    providerMessages.push({
      role: "user",
      content: message.trim(),
    });

    // ── 9. Call provider with streaming ─────────────────────────
    const providerRequest: Parameters<typeof createChatInvocationWithFallback>[0] = {
      systemPrompt,
      messages: providerMessages,
      mode,
      subPhase: chatSubPhase,
      missingFields,
      maxTokens: CLAUDE_MAX_TOKENS,
      cacheControl: { type: "ephemeral" },
      // Slot-filling depends on the collect_personal_data tool. Gemini's
      // adapter doesn't support tool use, and it hallucinates the call as
      // plain text (nested JSON, localized keys) which silently drops the
      // data. Force Anthropic for the whole collection flow — it's the
      // only provider here with reliable strict tool use. Info-mode Q&A
      // keeps the normal (cheaper Gemini-first) order.
      ...(mode === "collection"
        ? { preferredProviders: ["anthropic" as const] }
        : {}),
    };

    // Add a dynamic tool in collection phases. Anthropic strict tool use
    // only works with smaller optional schemas, so we scope the tool to the
    // active phase and nearby pending fields.
    if (mode === "collection" && (chatSubPhase === "conversa" || chatSubPhase === "document")) {
      const scopedTool = buildCollectPersonalDataTool({
        phase: chatSubPhase === "document" ? "document" : "conversa",
        missingFields,
      });
      providerRequest.tools = [scopedTool];
      providerRequest.toolChoice =
        chatSubPhase === "document"
          ? { type: "any" }
          : missingFields.length > 0
            ? { type: "any" }
            : { type: "auto" };
    }
    const providerInvocation = await createChatInvocationWithFallback(providerRequest);
    debug("[chat] provider selected:", providerInvocation.provider, providerInvocation.model);

    // ── 10. Stream transform: provider stream → client SSE ──────
    let fullResponse = "";
    let toolUseId = "";
    let toolUseJson = "";
    let toolUseActive = false;
    let toolWasCalled = false;
    let stopReason: string | null = null;
    const contentBlockTypes: string[] = [];
    const pendingConversationUpdates: PromiseLike<void>[] = [];
    // For the agentic follow-up after tool_use
    let lastToolUseId = "";
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let lastParsedToolInput: Record<string, any> = {};

    // Capture the toolChoiceUsed for the post-stream diagnostic
    const toolChoiceUsed = providerInvocation.toolChoiceUsed;

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(streamController) {
        // Emit conversation_id
        streamController.enqueue(
          encoder.encode(
            sseEvent({ type: "conversation_id", conversation_id: convId })
          )
        );

        // Emit sources
        if (relevantChunks.length > 0) {
          streamController.enqueue(
            encoder.encode(
              sseEvent({
                type: "sources",
                sources: relevantChunks.map((c) => ({
                  id: c.id,
                  source_file: c.source_file,
                  llei_referencia: c.llei_referencia,
                  similarity: c.similarity,
                })),
              })
            )
          );
        }

        // Emit SOS
        if (sosResult.detected) {
          streamController.enqueue(
            encoder.encode(
              sseEvent({
                type: "sos",
                categories: sosResult.categories,
                matchedTerms: sosResult.matchedTerms,
                sosEventId,
              })
            )
          );
        }

        try {
          for await (const event of providerInvocation.stream) {
            if (event.type === "text_delta") {
              fullResponse += event.text;
              streamController.enqueue(
                encoder.encode(sseEvent({ type: "text", text: event.text }))
              );
              continue;
            }

            if (event.type === "content_block_start") {
              contentBlockTypes.push(event.contentBlockType);
              if (event.contentBlockType === "tool_use") {
                toolUseActive = true;
                toolWasCalled = true;
                toolUseId = event.id || "";
                toolUseJson = "";
              }
              continue;
            }

            if (event.type === "message_delta") {
              stopReason = event.stopReason;
              continue;
            }

            if (event.type === "input_json_delta") {
              toolUseJson += event.partialJson;
              continue;
            }

            if (event.type === "content_block_stop" && toolUseActive) {
              toolUseActive = false;

              try {
                const rawExtractedData = JSON.parse(toolUseJson) as Partial<PersonalData>;
                const extractedData = normalizeCollectedPersonalDataInput(rawExtractedData);
                debug(`[chat] tool extracted ${Object.keys(extractedData).length} fields (${providerInvocation.model}):`, Object.keys(extractedData).join(", "));
                if (Object.keys(rawExtractedData).length !== Object.keys(extractedData).length) {
                  debug(
                    `[chat] tool dropped invalid fields (${providerInvocation.model}):`,
                    Object.keys(rawExtractedData).filter((key) => !(key in extractedData)).join(", ")
                  );
                }

                lastToolUseId = toolUseId;
                lastParsedToolInput = extractedData as Record<string, unknown>;

                const newCollected = mergeExtractedData(collectedData, extractedData);
                collectedData = newCollected;

                const newMissing = computeMissingFields(effectiveAuthSlugs, newCollected);
                const pct = computeCompletionPct(effectiveAuthSlugs, newCollected);

                streamController.enqueue(
                  encoder.encode(
                    sseEvent({
                      type: "data_update",
                      collected: newCollected,
                      missingFields: newMissing,
                      completionPct: pct,
                    })
                  )
                );

                if (
                  chatSubPhase === "conversa" &&
                  shouldTransitionToResum(effectiveAuthSlugs, newCollected)
                ) {
                  chatSubPhase = "resum";
                  streamController.enqueue(
                    encoder.encode(sseEvent({ type: "phase_change", phase: "resum" }))
                  );
                }

                const updateData: Record<string, unknown> = {
                  collected_data: newCollected,
                  chat_sub_phase: chatSubPhase,
                  ...(userId ? { user_id: userId } : {}),
                };
                if (Object.keys(collectedData).length > 0) {
                  updateData.data_expires_at = new Date(
                    Date.now() + 24 * 60 * 60 * 1000
                  ).toISOString();
                }
                pendingConversationUpdates.push(
                  supabase
                    .from("conversations")
                    .update(updateData)
                    .eq("id", convId)
                    .then(({ error }) => {
                      if (error) {
                        console.error("[chat] supabase update failed:", error.message);
                      }
                    })
                );
              } catch (parseErr) {
                console.error("Tool use JSON parse error:", parseErr);
              }

              toolUseId = "";
              toolUseJson = "";
            }
          }
        } catch (err) {
          streamController.enqueue(
            encoder.encode(
              sseEvent({ type: "error", error: "Stream interrupted" })
            )
          );
        }

        // ── Post-stream diagnostics ─────────────────────────────
        debug("[chat] stop_reason:", stopReason, "content blocks:", contentBlockTypes, "tool_called:", toolWasCalled, "tool_choice:", toolChoiceUsed?.type);
        if (
          mode === "collection" &&
          missingFields.length > 0 &&
          !toolWasCalled &&
          stopReason === "end_turn"
        ) {
          console.warn(
            "[chat] WARNING: LLM returned end_turn with",
            missingFields.length,
            "missing fields — tool not called. text len:",
            fullResponse.length
          );
        }

        // If in collection mode and no tool was called, still emit current state
        // so the client stays in sync with progress
        if (mode === "collection" && !toolWasCalled && Object.keys(collectedData).length > 0) {
          const pct = computeCompletionPct(effectiveAuthSlugs, collectedData);
          streamController.enqueue(
            encoder.encode(
              sseEvent({
                type: "data_update",
                collected: collectedData,
                missingFields: computeMissingFields(effectiveAuthSlugs, collectedData),
                completionPct: pct,
              })
            )
          );
        }

        // ── Agentic follow-up: tool was called but no text generated ──
        // Send tool_result back to Claude so it can produce the next question.
        if (toolWasCalled && fullResponse.length === 0 && lastToolUseId) {
          const newMissingAfterTool = computeMissingFields(effectiveAuthSlugs, collectedData);
          const missingStr = newMissingAfterTool.length > 0
            ? `Missing fields: ${newMissingAfterTool.join(", ")}`
            : "All required fields collected!";

          const justSaved = Object.keys(lastParsedToolInput).filter(
            (k) => lastParsedToolInput[k] != null && lastParsedToolInput[k] !== ""
          );

          // Include ALL currently collected values in the tool_result so Claude
          // cannot hallucinate or re-ask for fields already in memory.
          const allCollectedStr = Object.entries(collectedData)
            .filter(([, v]) => v !== null && v !== undefined && v !== "")
            .map(([k, v]) => `${k}=${JSON.stringify(v)}`)
            .join(", ");
          const savedStr = justSaved.length > 0 ? `Saved this turn: ${justSaved.join(", ")}. ` : "";
          const followUpConstraint =
            chatSubPhase === "document"
              ? "DOCUMENT PHASE RULES: The authorization path is already fixed. Do NOT ask about years in Spain, eligibility, arraigo social, arraigo laboral, or alternative routes. Only acknowledge the documents just saved and ask about the next missing document or the next document-specific clarification. "
              : effectiveAuthSlugs.length > 0
                ? `FIXED AUTHORIZATION RULES: The authorization path is already fixed to ${effectiveAuthSlugs.join(", ")}. Do NOT ask which authorization, route, or tramite the user wants. If tipoSolicitud is still missing, ask only whether it is residencia inicial, prorroga, or provisional. Otherwise ask only for the next missing field required for this same authorization. `
              : "";

          // Rebuild system prompt with UPDATED collectedData so Claude knows
          // which fields are already collected after this turn's tool call.
          const updatedCollectedFields = Object.entries(collectedData)
            .filter(([, v]) => v !== undefined && v !== null && v !== "")
            .map(([k]) => k as PersonalDataField);
          const followUpSystemPrompt = buildSystemPrompt({
            situacioLegal: situacio_legal,
            idioma: idioma || "es",
            mode,
            subPhase: chatSubPhase,
            authSlugs: effectiveAuthSlugs,
            collectedFields: updatedCollectedFields,
            collectedData,
            missingFields: newMissingAfterTool,
            contextBlock,
            treeNodeId: tree_node_id ?? undefined,
            treeNodeText: tree_node_text ?? undefined,
            treeNodeNote: tree_node_note ?? undefined,
            treePath: tree_path,
          });

          const followUpMessages: ChatProviderMessage[] = [
            ...providerMessages,
            {
              role: "assistant",
              content: [{ type: "tool_use", id: lastToolUseId, name: "collect_personal_data", input: lastParsedToolInput }],
            },
            {
              role: "user",
              content: [{ type: "tool_result", tool_use_id: lastToolUseId, content: `${followUpConstraint}${savedStr}ALL data collected so far (DO NOT ASK FOR THESE AGAIN): ${allCollectedStr}. ${missingStr}` }],
            },
          ];

          try {
            const followUpStream = await providerInvocation.continueAfterToolUse({
              systemPrompt: followUpSystemPrompt,
              messages: followUpMessages,
              maxTokens: CLAUDE_MAX_TOKENS,
              cacheControl: { type: "ephemeral" },
            });

            for await (const event of followUpStream) {
              if (event.type === "text_delta") {
                fullResponse += event.text;
                streamController.enqueue(encoder.encode(sseEvent({ type: "text", text: event.text })));
              }
            }
          } catch (err) {
            console.error("[chat] Follow-up call error:", err);
          }
        }

        if (pendingConversationUpdates.length > 0) {
          await Promise.allSettled(pendingConversationUpdates);
        }

        // Done
        streamController.enqueue(
          encoder.encode(sseEvent({ type: "done" }))
        );
        streamController.close();

        // Save assistant response (fire and forget, no PII)
        if (fullResponse.length > 0) {
          supabase
            .from("messages")
            .insert({
              conversation_id: convId,
              role: "assistant",
              content: fullResponse,
            })
            .then(() => {});
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal error";
    Sentry.captureException(err);
    console.error("Chat API error:", message);
    return Response.json({ error: message }, { status: 500 });
  }
}
