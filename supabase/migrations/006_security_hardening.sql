-- Migration 006: Security hardening (audit follow-ups)
--
-- Closes three gaps from the pre-deploy security audit:
-- 1. messages had only a service_role policy, so authenticated clients
--    can't read their own conversation history through RLS even though
--    they own it. Defense in depth: add a per-user SELECT policy.
-- 2. conversations was missing an authenticated-user DELETE policy.
--    /api/cases/[id] DELETE uses the auth client and would silently
--    return zero affected rows under RLS. Adds the policy.
-- 3. cleanup_expired_pii() is SECURITY DEFINER without an explicit
--    search_path — a classic privilege-escalation pattern. Pin it.

-- ── 1. messages: per-user SELECT ─────────────────────────────────────

CREATE POLICY "Users can view own messages"
  ON messages FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM conversations c
      WHERE c.id = messages.conversation_id
        AND c.user_id = auth.uid()
    )
  );

-- ── 2. conversations: per-user DELETE ────────────────────────────────

CREATE POLICY "Users can delete own conversations"
  ON conversations FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- ── 3. Pin search_path on SECURITY DEFINER cleanup function ──────────

ALTER FUNCTION cleanup_expired_pii() SET search_path = public, pg_temp;

-- ─────────────────────────────────────────────────────────────────────
-- Run this migration manually in the Supabase SQL editor.
-- After applying, verify:
--   SELECT polname FROM pg_policy
--   WHERE polrelid = 'messages'::regclass OR polrelid = 'conversations'::regclass;
-- You should see the two new policy names above.
