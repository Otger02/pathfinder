import { createServiceClient } from "@/lib/supabase";
import { notFound } from "next/navigation";
import RecordingDetail from "./RecordingDetail";

interface Chunk {
  id: string;
  chunk_index: number;
  storage_path: string;
  size_bytes: number;
  sha256: string;
  chain_hash: string;
  gps_lat: number | null;
  gps_lon: number | null;
  client_timestamp: string | null;
  server_timestamp: string;
}

interface Recording {
  id: string;
  session_id: string;
  sos_event_id: string | null;
  user_code: string;
  status: string;
  started_at: string;
  ended_at: string | null;
  duration_ms: number | null;
  chunk_count: number;
  gps_lat: number | null;
  gps_lon: number | null;
  device_info: Record<string, unknown> | null;
  integrity_hash: string | null;
}

export default async function RecordingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = createServiceClient();

  const { data: recording } = await supabase
    .from("sos_recordings")
    .select("*")
    .eq("id", id)
    .single();

  if (!recording) notFound();

  const { data: chunks } = await supabase
    .from("sos_recording_chunks")
    .select("*")
    .eq("recording_id", id)
    .order("chunk_index", { ascending: true });

  // Generate signed URLs for playback (1 hour expiry)
  const chunksWithUrls: Array<Chunk & { signedUrl: string | null }> = [];
  for (const chunk of (chunks || []) as Chunk[]) {
    const { data: urlData } = await supabase.storage
      .from("sos-recordings")
      .createSignedUrl(chunk.storage_path, 3600);

    chunksWithUrls.push({
      ...chunk,
      signedUrl: urlData?.signedUrl || null,
    });
  }

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <a
          href="/admin/sos/recordings"
          style={{ color: "#1976d2", textDecoration: "none", fontSize: 13 }}
        >
          &larr; Tornar a gravacions
        </a>
      </div>
      <RecordingDetail
        recording={recording as Recording}
        chunks={chunksWithUrls}
      />
    </div>
  );
}
