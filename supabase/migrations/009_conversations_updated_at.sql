-- Migration 009: conversations.updated_at
--
-- The dashboard, /cases and /documents order by created_at because the
-- column never existed — so an old case the user resumes never bubbles
-- to the top. Adds updated_at + trigger so any UPDATE on the row (tool
-- extraction, sub-phase change, documents_obtained merge) bumps it.
--
-- The app code falls back to created_at ordering if this migration is
-- not applied, so it is safe to deploy code before running this.

ALTER TABLE conversations
  ADD COLUMN IF NOT EXISTS updated_at timestamptz;

-- Backfill: best available proxy is created_at.
UPDATE conversations SET updated_at = created_at WHERE updated_at IS NULL;

ALTER TABLE conversations
  ALTER COLUMN updated_at SET DEFAULT now();
ALTER TABLE conversations
  ALTER COLUMN updated_at SET NOT NULL;

CREATE OR REPLACE FUNCTION set_conversations_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public, pg_temp
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS conversations_updated_at ON conversations;
CREATE TRIGGER conversations_updated_at
  BEFORE UPDATE ON conversations
  FOR EACH ROW
  EXECUTE FUNCTION set_conversations_updated_at();

CREATE INDEX IF NOT EXISTS idx_conversations_user_updated
  ON conversations (user_id, updated_at DESC);

-- Run this migration manually in the Supabase SQL editor.
