-- Migration 007: case_notes table
--
-- Free-text notes a user can attach to one of their cases. Notes are
-- strictly per-user: an admin or another user must NOT be able to read
-- them. RLS enforces this regardless of which client is used.

CREATE TABLE IF NOT EXISTS case_notes (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  user_id         uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content         text NOT NULL CHECK (char_length(content) BETWEEN 1 AND 4000),
  created_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_case_notes_conv_user
  ON case_notes (conversation_id, user_id, created_at DESC);

ALTER TABLE case_notes ENABLE ROW LEVEL SECURITY;

-- Owners can read their own notes
CREATE POLICY "Users read own notes"
  ON case_notes FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Owners can create notes for their own conversations
CREATE POLICY "Users insert own notes"
  ON case_notes FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM conversations c
      WHERE c.id = case_notes.conversation_id
        AND c.user_id = auth.uid()
    )
  );

-- Owners can delete their own notes
CREATE POLICY "Users delete own notes"
  ON case_notes FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Service role: full access for migrations / admin scripts
CREATE POLICY "Service write case_notes"
  ON case_notes FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

COMMENT ON TABLE case_notes IS
  'Per-user free-text notes attached to a conversation/case. Owner-only via RLS.';

-- Run this migration manually in the Supabase SQL editor.
