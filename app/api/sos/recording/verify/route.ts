import { createServiceClient } from "@/lib/supabase";
import { requireAdmin } from "@/lib/admin-auth";
import { createHash } from "crypto";
import { NextRequest } from "next/server";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  // Integrity verification exposes hashes and chunk metadata — admin only.
  const admin = await requireAdmin();
  if (!admin) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  const recordingId = req.nextUrl.searchParams.get("recordingId");
  if (!recordingId) {
    return Response.json({ error: "recordingId is required" }, { status: 400 });
  }

  const supabase = createServiceClient();

  // Fetch recording
  const { data: recording, error: recErr } = await supabase
    .from("sos_recordings")
    .select("id, session_id, status, chunk_count")
    .eq("id", recordingId)
    .single();

  if (recErr || !recording) {
    return Response.json({ error: "Recording not found" }, { status: 404 });
  }

  // Fetch all chunks ordered by index
  const { data: chunks, error: chunkErr } = await supabase
    .from("sos_recording_chunks")
    .select("chunk_index, storage_path, sha256, chain_hash, size_bytes")
    .eq("recording_id", recordingId)
    .order("chunk_index", { ascending: true });

  if (chunkErr) {
    return Response.json({ error: `Fetch chunks: ${chunkErr.message}` }, { status: 500 });
  }

  if (!chunks || chunks.length === 0) {
    return Response.json({
      valid: true,
      totalChunks: 0,
      checkedAt: new Date().toISOString(),
      details: [],
      brokenAtIndex: null,
    });
  }

  // Verify each chunk
  const details: Array<{
    index: number;
    sha256Match: boolean;
    chainMatch: boolean;
    storedSha256: string;
    computedSha256: string;
    storedChain: string;
    computedChain: string;
  }> = [];

  let previousChainHash: string | null = null;
  let brokenAtIndex: number | null = null;

  for (const chunk of chunks) {
    // Download blob from Storage
    const { data: blob, error: dlErr } = await supabase.storage
      .from("sos-recordings")
      .download(chunk.storage_path);

    if (dlErr || !blob) {
      details.push({
        index: chunk.chunk_index,
        sha256Match: false,
        chainMatch: false,
        storedSha256: chunk.sha256,
        computedSha256: "DOWNLOAD_FAILED",
        storedChain: chunk.chain_hash,
        computedChain: "DOWNLOAD_FAILED",
      });
      if (brokenAtIndex === null) brokenAtIndex = chunk.chunk_index;
      continue;
    }

    // Compute SHA-256 of blob
    const arrayBuffer = await blob.arrayBuffer();
    const computedSha256 = createHash("sha256")
      .update(Buffer.from(arrayBuffer))
      .digest("hex");

    const sha256Match = computedSha256 === chunk.sha256;

    // Compute chain hash
    let computedChain: string;
    if (previousChainHash === null) {
      computedChain = computedSha256;
    } else {
      computedChain = createHash("sha256")
        .update(`${previousChainHash}:${computedSha256}`)
        .digest("hex");
    }

    const chainMatch = computedChain === chunk.chain_hash;

    details.push({
      index: chunk.chunk_index,
      sha256Match,
      chainMatch,
      storedSha256: chunk.sha256,
      computedSha256,
      storedChain: chunk.chain_hash,
      computedChain,
    });

    if ((!sha256Match || !chainMatch) && brokenAtIndex === null) {
      brokenAtIndex = chunk.chunk_index;
    }

    // Use the STORED chain hash to continue the chain (so one broken chunk
    // doesn't cascade false positives for all subsequent chunks)
    previousChainHash = chunk.chain_hash;
  }

  return Response.json({
    valid: brokenAtIndex === null,
    totalChunks: chunks.length,
    checkedAt: new Date().toISOString(),
    details,
    brokenAtIndex,
  });
}
