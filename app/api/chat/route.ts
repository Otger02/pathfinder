import { NextRequest } from "next/server";
import { createServiceClient } from "@/lib/supabase";
import { detectSos } from "@/lib/sos";
import { buildSystemPrompt } from "@/lib/prompt-builder";
import { COLLECT_PERSONAL_DATA_TOOL } from "@/lib/tool-definitions";
import {
  computeMissingFields,
  shouldTransitionToResum,
  mergeExtractedData,
  computeCompletionPct,
} from "@/lib/collection-engine";
import type { PersonalData, PersonalDataField } from "@/lib/types/personal-data";
import type { ChatSubPhase } from "@/lib/types/chat-flow";

// Node.js runtime (not Edge) — needed for tool_use stream parsing + crypto
export const runtime = "nodejs";

// ── Config ───────────────────────────────────────────────────────────
const VOYAGE_MODEL = "voyage-multilingual-2";
const VOYAGE_URL = "https://api.voyageai.com/v1/embeddings";
const CLAUDE_MODEL = "claude-haiku-4-5-20251001";
const CLAUDE_URL = "https://api.anthropic.com/v1/messages";
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

function sseEvent(data: Record<string, unknown>): string {
  return `data: ${JSON.stringify(data)}\n\n`;
}

// ── POST handler ─────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
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
    } = body as {
      message?: string;
      conversation_id?: string;
      situacio_legal?: string;
      idioma?: string;
      auth_slugs?: string[];
      mode?: "info" | "collection";
      tree_node_id?: string | null;
      tree_node_text?: string | null;
      tree_node_note?: string | null;
      tree_path?: string[];
    };

    if (!message || typeof message !== "string" || message.trim().length === 0) {
      return Response.json({ error: "message is required" }, { status: 400 });
    }

    const voyageKey = process.env.VOYAGE_API_KEY;
    const anthropicKey = process.env.ANTHROPIC_API_KEY;
    if (!voyageKey || !anthropicKey) {
      return Response.json({ error: "Missing API keys" }, { status: 500 });
    }

    const supabase = createServiceClient();

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

    if (!convId) {
      const insertData: Record<string, unknown> = {
        user_code: "web-anonymous",
        language: idioma || "es",
        country: "ES",
      };
      if (auth_slugs && auth_slugs.length > 0) {
        insertData.auth_slugs = auth_slugs;
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
        // If client sends auth_slugs, update them
        if (auth_slugs && auth_slugs.length > 0 && (!conv.auth_slugs || conv.auth_slugs.length === 0)) {
          await supabase
            .from("conversations")
            .update({ auth_slugs })
            .eq("id", convId);
        }
      }
    }

    // Determine mode: explicit from client, or auto-detect from auth_slugs
    const effectiveAuthSlugs = auth_slugs || [];
    const mode = requestMode || (effectiveAuthSlugs.length > 0 ? "collection" : "info");

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
      console.log(
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
    console.log("[chat]", {
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
    const claudeMessages: Array<{ role: string; content: string }> = [];

    for (const msg of previousMessages) {
      claudeMessages.push({
        role: msg.role === "user" ? "user" : "assistant",
        content: msg.content,
      });
    }

    claudeMessages.push({
      role: "user",
      content: message.trim(),
    });

    // ── 9. Call Claude with streaming ───────────────────────────
    const claudeBody: Record<string, unknown> = {
      model: CLAUDE_MODEL,
      max_tokens: CLAUDE_MAX_TOKENS,
      system: systemPrompt,
      messages: claudeMessages,
      stream: true,
    };

    // Add tool when in collection mode + conversa phase.
    // Force the model to call collect_personal_data while there are
    // missing required fields. Once everything is collected, fall back
    // to "auto" so the model can answer free-form questions.
    if (mode === "collection" && chatSubPhase === "conversa") {
      claudeBody.tools = [COLLECT_PERSONAL_DATA_TOOL];
      claudeBody.tool_choice =
        missingFields.length > 0 ? { type: "any" } : { type: "auto" };
    }

    const claudeController = new AbortController();
    const claudeTimeout = setTimeout(() => claudeController.abort(), 60_000);

    const claudeResp = await fetch(CLAUDE_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": anthropicKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify(claudeBody),
      signal: claudeController.signal,
    });

    clearTimeout(claudeTimeout);

    if (!claudeResp.ok) {
      const errBody = await claudeResp.text();
      throw new Error(`Claude API ${claudeResp.status}: ${errBody.slice(0, 300)}`);
    }

    // ── 10. Stream transform: Claude SSE → client SSE ───────────
    let fullResponse = "";
    let toolUseId = "";
    let toolUseJson = "";
    let toolUseActive = false;
    let toolWasCalled = false;
    let stopReason: string | null = null;
    const contentBlockTypes: string[] = [];
    // For the agentic follow-up after tool_use
    let lastToolUseId = "";
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let lastParsedToolInput: Record<string, any> = {};

    // Capture the toolChoiceUsed for the post-stream diagnostic
    const toolChoiceUsed =
      claudeBody.tool_choice as { type: string } | undefined;

    const encoder = new TextEncoder();
    const decoder = new TextDecoder();

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

        // Parse Claude stream
        const reader = claudeResp.body!.getReader();
        let buffer = "";

        try {
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

                // Text streaming
                if (
                  event.type === "content_block_delta" &&
                  event.delta?.type === "text_delta"
                ) {
                  const text = event.delta.text;
                  fullResponse += text;
                  streamController.enqueue(
                    encoder.encode(sseEvent({ type: "text", text }))
                  );
                }

                // Track content block types for diagnostics
                if (event.type === "content_block_start" && event.content_block?.type) {
                  contentBlockTypes.push(event.content_block.type);
                }

                // Track stop_reason from message_delta
                if (
                  event.type === "message_delta" &&
                  event.delta?.stop_reason
                ) {
                  stopReason = event.delta.stop_reason;
                }

                // Tool use start
                if (
                  event.type === "content_block_start" &&
                  event.content_block?.type === "tool_use"
                ) {
                  toolUseActive = true;
                  toolWasCalled = true;
                  toolUseId = event.content_block.id || "";
                  toolUseJson = "";
                }

                // Tool use JSON delta
                if (
                  event.type === "content_block_delta" &&
                  event.delta?.type === "input_json_delta"
                ) {
                  toolUseJson += event.delta.partial_json || "";
                }

                // Tool use complete
                if (event.type === "content_block_stop" && toolUseActive) {
                  toolUseActive = false;

                  try {
                    const extractedData = JSON.parse(toolUseJson) as Partial<PersonalData>;

                    // Save for the agentic follow-up call
                    lastToolUseId = toolUseId;
                    lastParsedToolInput = extractedData as Record<string, unknown>;

                    // Merge with existing data
                    const newCollected = mergeExtractedData(
                      collectedData,
                      extractedData
                    );
                    collectedData = newCollected;

                    // Compute new state
                    const newMissing = computeMissingFields(
                      effectiveAuthSlugs,
                      newCollected
                    );
                    const pct = computeCompletionPct(
                      effectiveAuthSlugs,
                      newCollected
                    );

                    // Emit data_update
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

                    // Check phase transition
                    if (shouldTransitionToResum(effectiveAuthSlugs, newCollected)) {
                      chatSubPhase = "resum";
                      streamController.enqueue(
                        encoder.encode(
                          sseEvent({ type: "phase_change", phase: "resum" })
                        )
                      );
                    }

                    // Update Supabase (fire and forget)
                    const updateData: Record<string, unknown> = {
                      collected_data: newCollected,
                      chat_sub_phase: chatSubPhase,
                    };
                    // Set 24h TTL on first data collection
                    if (Object.keys(collectedData).length > 0) {
                      updateData.data_expires_at = new Date(
                        Date.now() + 24 * 60 * 60 * 1000
                      ).toISOString();
                    }
                    supabase
                      .from("conversations")
                      .update(updateData)
                      .eq("id", convId)
                      .then(({ error }) => {
                        if (error) {
                          console.error(
                            "[chat] supabase update failed:",
                            error.message
                          );
                        }
                      });
                  } catch (parseErr) {
                    console.error("Tool use JSON parse error:", parseErr);
                  }

                  toolUseId = "";
                  toolUseJson = "";
                }
              } catch {
                // skip unparseable lines
              }
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
        console.log("[chat] stop_reason:", stopReason, "content blocks:", contentBlockTypes, "tool_called:", toolWasCalled, "tool_choice:", toolChoiceUsed?.type);
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

          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const followUpMessages: any[] = [
            ...claudeMessages,
            {
              role: "assistant",
              content: [{ type: "tool_use", id: lastToolUseId, name: "collect_personal_data", input: lastParsedToolInput }],
            },
            {
              role: "user",
              content: [{ type: "tool_result", tool_use_id: lastToolUseId, content: `${savedStr}ALL data collected so far (DO NOT ASK FOR THESE AGAIN): ${allCollectedStr}. ${missingStr}` }],
            },
          ];

          const followUpCtrl = new AbortController();
          const followUpTimeout = setTimeout(() => followUpCtrl.abort(), 30_000);

          try {
            const followUpResp = await fetch(CLAUDE_URL, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "x-api-key": anthropicKey,
                "anthropic-version": "2023-06-01",
              },
              body: JSON.stringify({
                model: CLAUDE_MODEL,
                max_tokens: CLAUDE_MAX_TOKENS,
                system: followUpSystemPrompt,
                messages: followUpMessages,
                stream: true,
              }),
              signal: followUpCtrl.signal,
            });

            clearTimeout(followUpTimeout);

            if (followUpResp.ok) {
              const followUpReader = followUpResp.body!.getReader();
              let followUpBuffer = "";
              while (true) {
                const { done, value } = await followUpReader.read();
                if (done) break;
                followUpBuffer += decoder.decode(value, { stream: true });
                const followUpLines = followUpBuffer.split("\n");
                followUpBuffer = followUpLines.pop() || "";
                for (const line of followUpLines) {
                  if (!line.startsWith("data: ")) continue;
                  const jsonStr = line.slice(6).trim();
                  if (jsonStr === "[DONE]") continue;
                  try {
                    const event = JSON.parse(jsonStr);
                    if (event.type === "content_block_delta" && event.delta?.type === "text_delta") {
                      const text = event.delta.text;
                      fullResponse += text;
                      streamController.enqueue(encoder.encode(sseEvent({ type: "text", text })));
                    }
                  } catch { /* skip */ }
                }
              }
            } else {
              console.error("[chat] Follow-up call failed:", await followUpResp.text());
            }
          } catch (err) {
            console.error("[chat] Follow-up call error:", err);
          } finally {
            clearTimeout(followUpTimeout);
          }
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
    console.error("Chat API error:", message);
    return Response.json({ error: message }, { status: 500 });
  }
}
