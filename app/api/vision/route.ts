import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createServiceClient } from "@/lib/supabase";
import { checkRateLimit, getClientIp, rateLimitResponse } from "@/lib/rate-limit";
import { badRequestFromZod } from "@/lib/validation/schemas";
import { analyzeDocumentImage, type VisionMediaType } from "@/lib/vision/analyze";
import { mergeExtractedData } from "@/lib/collection-engine";
import type { PersonalData } from "@/lib/types/personal-data";

export const runtime = "nodejs";

// ~3 MB of binary image as base64 (×4/3). Client compresses to well under
// this; the cap exists so nobody ships us 50 MB bodies. Stays inside both
// Anthropic's 5 MB image limit and Vercel's 4.5 MB request limit.
const MAX_BASE64_CHARS = 4_000_000;

const VisionRequestSchema = z.object({
  image_base64: z.string().min(100).max(MAX_BASE64_CHARS),
  media_type: z.enum(["image/jpeg", "image/png", "image/webp"]),
  conversation_id: z.string().uuid().optional(),
  idioma: z.enum(["ca", "es", "en", "fr", "ar"]).optional(),
});

/**
 * POST /api/vision — analyze a photographed document.
 *
 * PRIVACY: the image is processed in memory and never stored. Extracted
 * fields are persisted into the conversation's collected_data ONLY when a
 * conversation_id is provided AND that conversation has consent_given —
 * the same consent gate the chat uses. Without consent (or without a
 * conversation), the analysis is returned for display only.
 */
export async function POST(req: NextRequest) {
  try {
    // Vision calls are the most expensive endpoint in the app — hard cap.
    const ip = getClientIp(req);
    const limit = checkRateLimit(ip, {
      windowMs: 60_000,
      max: 5,
      keyPrefix: "vision",
    });
    if (!limit.allowed) return rateLimitResponse(limit);

    const raw = await req.json();
    const parsed = VisionRequestSchema.safeParse(raw);
    if (!parsed.success) return badRequestFromZod(parsed.error);
    const { image_base64, media_type, conversation_id, idioma } = parsed.data;

    const analysis = await analyzeDocumentImage({
      imageBase64: image_base64,
      mediaType: media_type as VisionMediaType,
      idioma: idioma ?? "es",
    });

    // ── Persist extracted fields into the conversation (consent-gated) ──
    let persisted = false;
    if (conversation_id && Object.keys(analysis.fields).length > 0) {
      const supabase = createServiceClient();
      const { data: conv } = await supabase
        .from("conversations")
        .select("collected_data, consent_given")
        .eq("id", conversation_id)
        .single();

      if (conv?.consent_given) {
        const existing = (conv.collected_data ?? {}) as Partial<PersonalData>;
        // Existing (user-stated) values win over OCR on conflict.
        const merged = mergeExtractedData(analysis.fields, existing);
        const { error: updateErr } = await supabase
          .from("conversations")
          .update({ collected_data: merged })
          .eq("id", conversation_id);
        persisted = !updateErr;

        // Save the explanation as an assistant message so resume hydration
        // shows what the document said.
        if (analysis.explanation) {
          await supabase.from("messages").insert({
            conversation_id,
            role: "assistant",
            content: `📄 **${analysis.documentType}**\n\n${analysis.explanation}`,
          });
        }
      }
    }

    return NextResponse.json({
      ok: true,
      document_type: analysis.documentType,
      fields: analysis.fields,
      explanation: analysis.explanation,
      deadlines: analysis.deadlines,
      persisted,
    });
  } catch (err) {
    console.error(
      "[vision] error:",
      err instanceof Error ? err.message : "unknown error"
    );
    return NextResponse.json(
      { ok: false, error: "Document analysis failed" },
      { status: 500 }
    );
  }
}
