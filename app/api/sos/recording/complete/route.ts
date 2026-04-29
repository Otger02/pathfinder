import { createServiceClient } from "@/lib/supabase";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const { sessionId, finalChainHash } = (await req.json()) as {
      sessionId: string;
      finalChainHash?: string;
    };

    if (!sessionId) {
      return Response.json({ error: "sessionId required" }, { status: 400 });
    }

    const supabase = createServiceClient();

    // Look up recording
    const { data: recording, error: lookupErr } = await supabase
      .from("sos_recordings")
      .select("id, started_at, chunk_count")
      .eq("session_id", sessionId)
      .single();

    if (lookupErr || !recording) {
      return Response.json({ error: "Recording not found" }, { status: 404 });
    }

    // Calculate duration
    const startedAt = new Date(recording.started_at);
    const durationMs = Date.now() - startedAt.getTime();

    // Update recording as completed
    const { error: updateErr } = await supabase
      .from("sos_recordings")
      .update({
        status: "completed",
        ended_at: new Date().toISOString(),
        duration_ms: durationMs,
        integrity_hash: finalChainHash || null,
      })
      .eq("id", recording.id);

    if (updateErr) throw new Error(updateErr.message);

    return Response.json({
      ok: true,
      recordingId: recording.id,
      durationMs,
      chunkCount: recording.chunk_count,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal error";
    return Response.json({ error: message }, { status: 500 });
  }
}
