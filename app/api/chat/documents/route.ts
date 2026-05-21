import { createServiceClient } from "@/lib/supabase";
import { DocumentsObtainedSchema, badRequestFromZod } from "@/lib/validation/schemas";
import { z } from "zod";

const DeleteDocSchema = z.object({
  conversation_id: z.string().uuid(),
  slug: z.string().max(120),
});

export const runtime = "nodejs";

export async function PATCH(req: Request) {
  try {
    const raw = await req.json();
    const parsed = DocumentsObtainedSchema.safeParse(raw);
    if (!parsed.success) return badRequestFromZod(parsed.error);
    const { conversation_id, documents_obtained } = parsed.data;

    const supabase = createServiceClient();

    // Read existing collected_data and merge documents_obtained
    const { data: conv, error: fetchErr } = await supabase
      .from("conversations")
      .select("collected_data")
      .eq("id", conversation_id)
      .single();

    if (fetchErr) throw new Error(fetchErr.message);

    const existing = (conv?.collected_data as Record<string, unknown>) ?? {};
    const existingDocs = (existing.documents_obtained as string[]) ?? [];
    const merged = Array.from(new Set([...existingDocs, ...documents_obtained]));

    const { error: updateErr } = await supabase
      .from("conversations")
      .update({ collected_data: { ...existing, documents_obtained: merged } })
      .eq("id", conversation_id);

    if (updateErr) throw new Error(updateErr.message);

    return Response.json({ ok: true, documents_obtained: merged });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal error";
    return Response.json({ error: message }, { status: 500 });
  }
}

// Also support DELETE to un-mark a document
export async function DELETE(req: Request) {
  try {
    const raw = await req.json();
    const parsed = DeleteDocSchema.safeParse(raw);
    if (!parsed.success) return badRequestFromZod(parsed.error);
    const { conversation_id, slug } = parsed.data;

    const supabase = createServiceClient();

    const { data: conv, error: fetchErr } = await supabase
      .from("conversations")
      .select("collected_data")
      .eq("id", conversation_id)
      .single();

    if (fetchErr) throw new Error(fetchErr.message);

    const existing = (conv?.collected_data as Record<string, unknown>) ?? {};
    const existingDocs = (existing.documents_obtained as string[]) ?? [];
    const filtered = existingDocs.filter((s) => s !== slug);

    const { error: updateErr } = await supabase
      .from("conversations")
      .update({ collected_data: { ...existing, documents_obtained: filtered } })
      .eq("id", conversation_id);

    if (updateErr) throw new Error(updateErr.message);

    return Response.json({ ok: true, documents_obtained: filtered });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal error";
    return Response.json({ error: message }, { status: 500 });
  }
}
