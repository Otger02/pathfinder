import { createServiceClient } from "@/lib/supabase";
import { createHash } from "crypto";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const sessionId = formData.get("sessionId") as string;
    const chunkIndex = parseInt(formData.get("chunkIndex") as string, 10);
    const clientSha256 = formData.get("sha256") as string;
    const chainHash = formData.get("chainHash") as string;
    const durationMs = parseInt(formData.get("durationMs") as string, 10);
    const timestamp = formData.get("timestamp") as string;
    const gpsLat = formData.get("gpsLat") ? parseFloat(formData.get("gpsLat") as string) : null;
    const gpsLon = formData.get("gpsLon") ? parseFloat(formData.get("gpsLon") as string) : null;

    if (!file || !sessionId || isNaN(chunkIndex) || !clientSha256 || !chainHash) {
      return Response.json({ error: "Missing required fields" }, { status: 400 });
    }

    const supabase = createServiceClient();

    // Look up recording by session_id
    const { data: recording, error: lookupErr } = await supabase
      .from("sos_recordings")
      .select("id")
      .eq("session_id", sessionId)
      .single();

    if (lookupErr || !recording) {
      return Response.json({ error: "Recording not found" }, { status: 404 });
    }

    const recordingId = recording.id;

    // Read blob and verify SHA-256 server-side
    const arrayBuffer = await file.arrayBuffer();
    const serverSha256 = createHash("sha256")
      .update(Buffer.from(arrayBuffer))
      .digest("hex");

    if (serverSha256 !== clientSha256) {
      return Response.json(
        { error: "SHA-256 mismatch: data integrity check failed" },
        { status: 400 }
      );
    }

    // Upload to Supabase Storage
    const paddedIndex = String(chunkIndex).padStart(5, "0");
    const storagePath = `${recordingId}/${paddedIndex}.webm`;

    const { error: uploadErr } = await supabase.storage
      .from("sos-recordings")
      .upload(storagePath, Buffer.from(arrayBuffer), {
        contentType: file.type || "video/webm",
        upsert: false,
      });

    if (uploadErr) throw new Error(`Storage upload: ${uploadErr.message}`);

    // Insert chunk metadata
    const { error: insertErr } = await supabase
      .from("sos_recording_chunks")
      .insert({
        recording_id: recordingId,
        chunk_index: chunkIndex,
        storage_path: storagePath,
        size_bytes: arrayBuffer.byteLength,
        sha256: serverSha256,
        chain_hash: chainHash,
        gps_lat: gpsLat,
        gps_lon: gpsLon,
        client_timestamp: timestamp || null,
      });

    if (insertErr) throw new Error(`Insert chunk: ${insertErr.message}`);

    // Update chunk count
    await supabase
      .from("sos_recordings")
      .update({ chunk_count: chunkIndex + 1 })
      .eq("id", recordingId);

    return Response.json({ ok: true, chunkIndex });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal error";
    console.error("Chunk upload error:", message);
    return Response.json({ error: message }, { status: 500 });
  }
}
