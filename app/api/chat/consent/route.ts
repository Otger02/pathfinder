import { createServiceClient } from "@/lib/supabase";
import { ConsentRequestSchema, badRequestFromZod } from "@/lib/validation/schemas";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const raw = await req.json();
    const parsed = ConsentRequestSchema.safeParse(raw);
    if (!parsed.success) return badRequestFromZod(parsed.error);
    const { conversation_id } = parsed.data;

    const supabase = createServiceClient();
    const { error } = await supabase
      .from("conversations")
      .update({ consent_given: true })
      .eq("id", conversation_id);

    if (error) throw new Error(error.message);

    return Response.json({ ok: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal error";
    return Response.json({ error: message }, { status: 500 });
  }
}
