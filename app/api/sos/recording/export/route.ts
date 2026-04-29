import { createServiceClient } from "@/lib/supabase";
import { createHash } from "crypto";
import { zipSync } from "fflate";
import { NextRequest } from "next/server";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const recordingId = req.nextUrl.searchParams.get("recordingId");
  if (!recordingId) {
    return Response.json({ error: "recordingId is required" }, { status: 400 });
  }

  const supabase = createServiceClient();

  // Fetch recording
  const { data: recording, error: recErr } = await supabase
    .from("sos_recordings")
    .select("*")
    .eq("id", recordingId)
    .single();

  if (recErr || !recording) {
    return Response.json({ error: "Recording not found" }, { status: 404 });
  }

  // Fetch all chunks
  const { data: chunks, error: chunkErr } = await supabase
    .from("sos_recording_chunks")
    .select("*")
    .eq("recording_id", recordingId)
    .order("chunk_index", { ascending: true });

  if (chunkErr) {
    return Response.json({ error: `Fetch chunks: ${chunkErr.message}` }, { status: 500 });
  }

  const allChunks = chunks || [];

  // Download all chunk blobs and verify chain
  const zipFiles: Record<string, Uint8Array> = {};
  const chainVerification: Array<{
    index: number;
    sha256: string;
    chainHash: string;
    sha256Valid: boolean;
    chainValid: boolean;
    sizeBytes: number;
    clientTimestamp: string | null;
    gpsLat: number | null;
    gpsLon: number | null;
  }> = [];

  let previousChainHash: string | null = null;

  for (const chunk of allChunks) {
    const { data: blob, error: dlErr } = await supabase.storage
      .from("sos-recordings")
      .download(chunk.storage_path);

    if (dlErr || !blob) {
      chainVerification.push({
        index: chunk.chunk_index,
        sha256: chunk.sha256,
        chainHash: chunk.chain_hash,
        sha256Valid: false,
        chainValid: false,
        sizeBytes: chunk.size_bytes,
        clientTimestamp: chunk.client_timestamp,
        gpsLat: chunk.gps_lat,
        gpsLon: chunk.gps_lon,
      });
      previousChainHash = chunk.chain_hash;
      continue;
    }

    const arrayBuffer = await blob.arrayBuffer();
    const buf = new Uint8Array(arrayBuffer);

    // Add to ZIP
    const paddedIndex = String(chunk.chunk_index).padStart(5, "0");
    zipFiles[`chunks/${paddedIndex}.webm`] = buf;

    // Verify SHA-256
    const computedSha256 = createHash("sha256")
      .update(Buffer.from(arrayBuffer))
      .digest("hex");
    const sha256Valid = computedSha256 === chunk.sha256;

    // Verify chain
    let computedChain: string;
    if (previousChainHash === null) {
      computedChain = computedSha256;
    } else {
      computedChain = createHash("sha256")
        .update(`${previousChainHash}:${computedSha256}`)
        .digest("hex");
    }
    const chainValid = computedChain === chunk.chain_hash;

    chainVerification.push({
      index: chunk.chunk_index,
      sha256: chunk.sha256,
      chainHash: chunk.chain_hash,
      sha256Valid,
      chainValid,
      sizeBytes: chunk.size_bytes,
      clientTimestamp: chunk.client_timestamp,
      gpsLat: chunk.gps_lat,
      gpsLon: chunk.gps_lon,
    });

    previousChainHash = chunk.chain_hash;
  }

  // Build metadata.json
  const metadata = {
    recordingId: recording.id,
    sessionId: recording.session_id,
    sosEventId: recording.sos_event_id,
    status: recording.status,
    startedAt: recording.started_at,
    endedAt: recording.ended_at,
    durationMs: recording.duration_ms,
    chunkCount: recording.chunk_count,
    deviceInfo: recording.device_info,
    gps: {
      lat: recording.gps_lat,
      lon: recording.gps_lon,
    },
    gpsTrail: allChunks
      .filter((c) => c.gps_lat && c.gps_lon)
      .map((c) => ({
        chunkIndex: c.chunk_index,
        lat: c.gps_lat,
        lon: c.gps_lon,
        timestamp: c.client_timestamp,
      })),
    integrityHash: recording.integrity_hash,
    exportedAt: new Date().toISOString(),
  };

  // Build chain-verification.json
  const allValid = chainVerification.every((c) => c.sha256Valid && c.chainValid);
  const verification = {
    recordingId: recording.id,
    verifiedAt: new Date().toISOString(),
    overallValid: allValid,
    totalChunks: allChunks.length,
    chunks: chainVerification,
  };

  // Legal notice
  const legalNotice = `AVISO LEGAL — GRABACIÓN DE EVIDENCIA SOS
=========================================

Esta grabación fue realizada automáticamente por el sistema Pathfinder
de la Fundació Tierra Digna como medida de protección en una situación
de emergencia.

Marco legal español:
- Sentencia del Tribunal Supremo STS 678/2014: Grabar conversaciones
  propias es legal sin necesidad de consentimiento de terceros.
- Artículo 18.3 de la Constitución Española: Se protege el secreto de
  las comunicaciones, salvo resolución judicial. La grabación de
  conversaciones propias no vulnera este derecho.

Integridad de la evidencia:
- Cada fragmento de grabación tiene un hash SHA-256 único.
- Los hashes están encadenados criptográficamente (hash chain).
- Cualquier modificación de un fragmento invalida toda la cadena
  posterior, garantizando la detección de manipulaciones.
- El archivo chain-verification.json contiene los detalles de
  verificación.

ID de grabación: ${recording.id}
ID de sesión: ${recording.session_id}
Inicio: ${recording.started_at}
Fin: ${recording.ended_at || "En curso"}
Fragmentos: ${allChunks.length}
Integridad: ${allValid ? "VERIFICADA" : "COMPROMETIDA — ver chain-verification.json"}

Exportado: ${new Date().toISOString()}
Plataforma: Pathfinder by Fundació Tierra Digna
`;

  // Add text files to ZIP
  const encoder = new TextEncoder();
  zipFiles["metadata.json"] = encoder.encode(JSON.stringify(metadata, null, 2));
  zipFiles["chain-verification.json"] = encoder.encode(JSON.stringify(verification, null, 2));
  zipFiles["legal-notice.txt"] = encoder.encode(legalNotice);

  // Generate ZIP
  const zipBuffer = zipSync(zipFiles);

  const filename = `evidence-${recording.id.slice(0, 8)}-${new Date().toISOString().slice(0, 10)}.zip`;

  return new Response(zipBuffer as unknown as BodyInit, {
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Content-Length": String(zipBuffer.byteLength),
    },
  });
}
