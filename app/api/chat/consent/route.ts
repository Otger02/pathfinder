import { createServiceClient } from "@/lib/supabase";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const { conversation_id } = (await req.json()) as {
      conversation_id?: string;
    };

    if (!conversation_id) {
      return Response.json({ error: "conversation_id required" }, { status: 400 });
    }

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
