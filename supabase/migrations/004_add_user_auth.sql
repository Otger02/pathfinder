-- Migration 004: User authentication support
-- Adds user_id to conversations so authenticated users can persist and resume sessions.
-- Anonymous users continue working as before (user_id = NULL).

ALTER TABLE conversations
  ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS conversations_user_id_idx ON conversations(user_id);

-- Enable RLS (service role client bypasses this automatically — no breakage)
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

-- Authenticated users can only see and update their own conversations
CREATE POLICY "Users can view own conversations"
  ON conversations FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own conversations"
  ON conversations FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- INSERT policy: authenticated users can create conversations linked to themselves
CREATE POLICY "Users can insert own conversations"
  ON conversations FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);
