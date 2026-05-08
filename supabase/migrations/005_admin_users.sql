-- Migration 005: Admin users table
-- Explicit role-based access for the admin dashboard and SOS evidence
-- endpoints. Without this table, /admin/* would only check that a user is
-- logged in, which is insufficient since regular users can also have
-- Supabase Auth accounts (e.g. migrants resuming their case dashboard).

CREATE TABLE IF NOT EXISTS admin_users (
  user_id   uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role      text        NOT NULL CHECK (role IN ('superadmin', 'humanitarian')),
  email     text,
  added_by  uuid        REFERENCES auth.users(id),
  added_at  timestamptz NOT NULL DEFAULT now(),
  active    boolean     NOT NULL DEFAULT true
);

ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Service role: full access (manage membership via the Supabase SQL editor
-- or seeding scripts).
CREATE POLICY "Service write admin_users"
  ON admin_users FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- Authenticated users: read only their own row.
-- Required so `requireAdmin()` and the middleware can verify role using the
-- user's auth client (no service_role on the request path).
CREATE POLICY "Users read own admin row"
  ON admin_users FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_admin_users_active
  ON admin_users (user_id) WHERE active = true;

COMMENT ON TABLE admin_users IS
  'Authorized administrators for the Pathfinder admin dashboard and SOS evidence endpoints. Membership is managed manually via the Supabase SQL editor.';
COMMENT ON COLUMN admin_users.role IS
  'superadmin: full access (manage members, export evidence, all SOS routes). humanitarian: read-only on SOS data, no member management.';
COMMENT ON COLUMN admin_users.active IS
  'Set to false to revoke access without deleting the row (preserves audit trail).';

-- ─────────────────────────────────────────────────────────────────────────
-- Run after deploying. Find your own user_id with:
--   SELECT id FROM auth.users WHERE email = 'otger02@gmail.com';
-- Then insert:
-- INSERT INTO admin_users (user_id, role, email, added_at)
-- VALUES ('<my-user-id-from-auth-users>', 'superadmin', 'otger02@gmail.com', now());
