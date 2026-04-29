-- 003: SOS recording infrastructure.
-- Stores metadata for camera/audio recordings triggered during SOS events.
-- Chunks are uploaded to Supabase Storage bucket "sos-recordings" (private).
-- Hash chain provides tamper-detection for legal evidence.
--
-- MANUAL STEP: Create the Supabase Storage bucket via dashboard:
--   Name: sos-recordings
--   Public: false
--   File size limit: 10MB
--   Allowed MIME: video/webm, video/mp4, audio/webm, audio/mp4

-- ── Recording sessions ──────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS sos_recordings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sos_event_id uuid REFERENCES sos_events(id) ON DELETE SET NULL,
  user_code text NOT NULL,
  session_id uuid NOT NULL,
  started_at timestamptz NOT NULL DEFAULT now(),
  ended_at timestamptz,
  duration_ms int,
  chunk_count int NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'recording'
    CHECK (status IN ('recording', 'completed', 'interrupted', 'failed')),
  gps_lat double precision,
  gps_lon double precision,
  device_info jsonb DEFAULT '{}'::jsonb,
  integrity_hash text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_sos_recordings_session
  ON sos_recordings (session_id);
CREATE INDEX IF NOT EXISTS idx_sos_recordings_sos_event
  ON sos_recordings (sos_event_id)
  WHERE sos_event_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_sos_recordings_status
  ON sos_recordings (status)
  WHERE status = 'recording';

-- ── Recording chunks ────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS sos_recording_chunks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  recording_id uuid NOT NULL REFERENCES sos_recordings(id) ON DELETE CASCADE,
  chunk_index int NOT NULL,
  storage_path text NOT NULL,
  size_bytes int NOT NULL,
  sha256 text NOT NULL,
  chain_hash text NOT NULL,
  gps_lat double precision,
  gps_lon double precision,
  client_timestamp timestamptz,
  server_timestamp timestamptz NOT NULL DEFAULT now(),
  UNIQUE (recording_id, chunk_index)
);

CREATE INDEX IF NOT EXISTS idx_sos_chunks_recording
  ON sos_recording_chunks (recording_id, chunk_index);

-- ── Link SOS events to recordings ───────────────────────────────────

ALTER TABLE sos_events
  ADD COLUMN IF NOT EXISTS recording_id uuid REFERENCES sos_recordings(id);

-- ── RLS ─────────────────────────────────────────────────────────────

ALTER TABLE sos_recordings ENABLE ROW LEVEL SECURITY;
ALTER TABLE sos_recording_chunks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access on sos_recordings"
  ON sos_recordings FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Service role full access on sos_recording_chunks"
  ON sos_recording_chunks FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');
