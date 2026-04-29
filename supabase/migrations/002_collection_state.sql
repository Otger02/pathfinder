-- Add columns for conversational data collection state.
-- PII stored in collected_data only (never in messages).
-- data_expires_at enforces 24h TTL for GDPR compliance.

ALTER TABLE conversations
  ADD COLUMN IF NOT EXISTS auth_slugs text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS collected_data jsonb DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS chat_sub_phase text DEFAULT 'conversa'
    CHECK (chat_sub_phase IN ('conversa','resum','document','enviament')),
  ADD COLUMN IF NOT EXISTS consent_given boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS data_expires_at timestamptz;

-- Index for cleanup cron
CREATE INDEX IF NOT EXISTS idx_conversations_data_expires
  ON conversations (data_expires_at)
  WHERE data_expires_at IS NOT NULL;

-- Auto-cleanup function: nullify PII after expiry
CREATE OR REPLACE FUNCTION cleanup_expired_pii()
RETURNS integer AS $$
DECLARE
  cleaned integer;
BEGIN
  UPDATE conversations
  SET collected_data = '{}'::jsonb,
      data_expires_at = NULL
  WHERE data_expires_at IS NOT NULL
    AND data_expires_at < NOW();
  GET DIAGNOSTICS cleaned = ROW_COUNT;
  RETURN cleaned;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
