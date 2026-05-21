/**
 * Zod request-body schemas for API routes.
 *
 * Used as a defense-in-depth layer before the route handlers process input.
 * Goal: reject obviously malformed or abusive requests (oversized strings,
 * non-UUIDs where UUIDs are expected, wrong primitive types) early — not
 * to enforce business logic, which still lives in the handlers.
 *
 * Each schema is intentionally permissive on optional fields so existing
 * callers keep working. Tightening can come later once telemetry confirms
 * what real clients send.
 */

import { z } from "zod";

// ── Shared primitives ───────────────────────────────────────────

const Uuid = z.string().uuid("Must be a valid UUID");
const SafeShortString = z.string().max(255);
const LangCode = z.enum(["ca", "es", "en", "fr", "ar", "pt", "sw", "ur"]);

// ── /api/chat ────────────────────────────────────────────────────

export const ChatRequestSchema = z.object({
  message: z.string().min(1, "message is required").max(4000),
  conversation_id: Uuid.optional(),
  situacio_legal: z.string().max(80).optional(),
  idioma: LangCode.optional(),
  auth_slugs: z.array(z.string().max(120)).max(20).optional(),
  mode: z.enum(["info", "collection"]).optional(),
  tree_node_id: z.string().max(120).nullable().optional(),
  tree_node_text: z.string().max(1000).nullable().optional(),
  tree_node_note: z.string().max(2000).nullable().optional(),
  tree_path: z.array(z.string().max(120)).max(50).optional(),
});
export type ChatRequest = z.infer<typeof ChatRequestSchema>;

// ── /api/chat/consent ────────────────────────────────────────────

export const ConsentRequestSchema = z.object({
  conversation_id: Uuid,
});

// ── /api/chat/documents ──────────────────────────────────────────

export const DocumentsObtainedSchema = z.object({
  conversation_id: Uuid,
  documents_obtained: z.array(z.string().max(120)).max(100),
});

// ── /api/pdf/form ────────────────────────────────────────────────

export const PdfFormSchema = z.object({
  // personalData is a wide shape — accept any record but require it to be an
  // object so callers can't pass primitives. Field-level validation happens
  // in the form-filler.
  personalData: z.record(z.string(), z.unknown()),
  exFormId: z.string().max(40),
  authSlug: z.string().max(120).optional(),
  flatten: z.boolean().optional(),
});

// ── /api/pdf/summary ─────────────────────────────────────────────

export const PdfSummarySchema = z.object({
  personalData: z.record(z.string(), z.unknown()),
  authorizationSlug: z.string().max(120),
  lang: LangCode.optional(),
});

// ── /api/email/draft ─────────────────────────────────────────────

export const EmailDraftSchema = z.object({
  personalData: z.record(z.string(), z.unknown()),
  authSlug: z.string().max(120),
  provincia: SafeShortString,
  lang: LangCode.optional(),
});

// ── /api/documents/regenerate ────────────────────────────────────

export const RegenerateDocumentSchema = z.object({
  conversation_id: Uuid,
  formId: z.string().max(40),
  lang: LangCode.optional(),
  inline: z.boolean().optional(),
});

// ── Helper: build a 400 response from a ZodError ─────────────────

import type { ZodError } from "zod";

export function badRequestFromZod(error: ZodError): Response {
  const issues = error.issues.map((i) => ({
    path: i.path.join("."),
    message: i.message,
  }));
  return Response.json(
    { error: "Invalid request body", issues },
    { status: 400 }
  );
}
