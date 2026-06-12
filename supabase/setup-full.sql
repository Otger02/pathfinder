-- ============================================================
-- PATHFINDER — SETUP COMPLET PER A UN PROJECTE SUPABASE NOU
-- Generat automàticament: concatenació de schema.sql + migracions 001-009.
-- Enganxa AQUEST FITXER SENCER al SQL Editor d'un projecte BUIT i executa'l.
-- Després queden 3 passos manuals (vegeu el final del fitxer).
-- ============================================================


-- ════════════ supabase/schema.sql ════════════
-- ============================================================
-- Pathfinder — Supabase Schema
-- Fundació Tierra Digna
-- Region: EU Frankfurt
-- Created: 2026-04-13
-- ============================================================

-- 1. Extensions
-- ============================================================

create extension if not exists vector with schema extensions;
create extension if not exists "uuid-ossp" with schema extensions;


-- 2. Enums
-- ============================================================

create type message_role as enum ('user', 'assistant', 'system');

create type situacio_legal as enum (
  'sense_autoritzacio',
  'amb_autoritzacio',
  'ue',
  'asil',
  'apatrida',
  'general'
);

create type urgencia_level as enum (
  'immediata',
  'normal',
  'planificacio'
);

create type resource_type as enum (
  'ong',
  'legal_aid',
  'government',
  'shelter',
  'health',
  'education',
  'employment',
  'other'
);


-- 3. Tables
-- ============================================================

-- 3.1 Conversations
-- Identified by anonymous user_code (no auth required for migrants).
-- ============================================================

create table conversations (
  id          uuid primary key default extensions.uuid_generate_v4(),
  user_code   text        not null,
  country     text        not null default 'ES',
  language    text        not null default 'es',
  created_at  timestamptz not null default now()
);

create index idx_conversations_user_code on conversations (user_code);
create index idx_conversations_created_at on conversations (created_at desc);

comment on table conversations is 'Chat sessions. user_code is an anonymous identifier (WhatsApp hashed phone or browser fingerprint).';
comment on column conversations.language is 'ISO 639-1 code: es, ar, ro, en, fr, wo, zgh, uk, zh, tl.';


-- 3.2 Messages
-- ============================================================

create table messages (
  id               uuid primary key default extensions.uuid_generate_v4(),
  conversation_id  uuid           not null references conversations(id) on delete cascade,
  role             message_role   not null,
  content          text           not null,
  created_at       timestamptz    not null default now()
);

create index idx_messages_conversation on messages (conversation_id, created_at);

comment on table messages is 'Individual messages within a conversation.';


-- 3.3 Document Chunks (RAG)
-- ============================================================

create table doc_chunks (
  id                    uuid primary key default extensions.uuid_generate_v4(),
  content               text            not null,
  embedding             vector(1024),
  tokens_count          int,

  -- Immigration-specific metadata
  tipus_autoritzacio    text,
  situacio_legal        situacio_legal,
  country               text            not null default 'ES',
  urgencia              urgencia_level  not null default 'normal',
  llei_referencia       text,
  vigent_des_de         date,
  documents_necessaris  text[],

  -- Source tracking
  source_file           text,
  chunk_index           int,

  created_at            timestamptz     not null default now(),

  -- Unique constraint for idempotent upserts
  constraint uq_doc_chunks_source unique (source_file, chunk_index)
);

-- HNSW index for fast approximate nearest neighbor search
create index idx_doc_chunks_embedding on doc_chunks
  using hnsw (embedding vector_cosine_ops)
  with (m = 16, ef_construction = 64);

-- Metadata filter indexes
create index idx_doc_chunks_situacio on doc_chunks (situacio_legal);
create index idx_doc_chunks_tipus on doc_chunks (tipus_autoritzacio);
create index idx_doc_chunks_country on doc_chunks (country);
create index idx_doc_chunks_urgencia on doc_chunks (urgencia);

comment on table doc_chunks is 'RAG chunks with pgvector embeddings. Each chunk is a fragment of legislation or procedure with immigration-specific metadata for filtered retrieval.';
comment on column doc_chunks.embedding is 'Voyage AI voyage-multilingual-2 (1024 dimensions).';
comment on column doc_chunks.documents_necessaris is 'Array of required document IDs, e.g. {pasaporte, empadronamiento, contrato_trabajo}.';


-- 3.4 Authorizations
-- Structured reference data for the 63+ immigration procedures.
-- ============================================================

create table authorizations (
  id          uuid primary key default extensions.uuid_generate_v4(),
  slug        text        not null unique,
  nom         jsonb       not null,
  descripcio  jsonb       not null default '{}'::jsonb,
  requisits   jsonb       not null default '[]'::jsonb,
  passos      jsonb       not null default '[]'::jsonb,
  lleis       jsonb       not null default '[]'::jsonb,
  country     text        not null default 'ES',

  -- Categorization
  situacio_legal    situacio_legal,
  termini_dies      int,
  silenci_admin     text,

  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index idx_authorizations_slug on authorizations (slug);
create index idx_authorizations_situacio on authorizations (situacio_legal);
create index idx_authorizations_country on authorizations (country);

comment on table authorizations is 'Structured immigration authorization procedures. JSONB fields contain multilingual content keyed by ISO 639-1 code.';
comment on column authorizations.slug is 'URL-safe identifier, e.g. arraigo-social, reagrupacion-familiar.';
comment on column authorizations.nom is '{"es": "Arraigo social", "en": "Social roots", "ar": "..."}.';
comment on column authorizations.requisits is '[{"id": "permanencia", "text": {"es": "..."}, "obligatori": true, "documents": ["empadronamiento"]}].';
comment on column authorizations.passos is '[{"ordre": 1, "accio": {"es": "Reunir documentación"}, "url": "..."}].';
comment on column authorizations.lleis is '["LO 4/2000 Art. 31.3", "RD 1155/2024 Art. 124"].';
comment on column authorizations.silenci_admin is 'positiu | negatiu — administrative silence outcome.';


-- 3.5 Resources
-- NGOs, legal aid, shelters, government offices by location.
-- ============================================================

create table resources (
  id            uuid primary key default extensions.uuid_generate_v4(),
  nom           text           not null,
  tipus         resource_type  not null,
  country       text           not null default 'ES',
  city          text,
  adreca        text,
  telefon       text,
  email         text,
  web           text,
  idiomes       text[]         not null default '{}',
  especialitat  text[],
  horari        text,
  notes         text,

  created_at    timestamptz    not null default now()
);

create index idx_resources_country_city on resources (country, city);
create index idx_resources_tipus on resources (tipus);

comment on table resources is 'Support organizations and government offices by location and specialty.';
comment on column resources.idiomes is 'Languages spoken, e.g. {es, ar, fr}.';
comment on column resources.especialitat is 'Areas of expertise, e.g. {asilo, arraigo, menores}.';


-- 3.6 SOS Events
-- Emergency trigger tracking when bot detects distress patterns.
-- ============================================================

create table sos_events (
  id            uuid primary key default extensions.uuid_generate_v4(),
  user_code     text        not null,
  country       text        not null default 'ES',
  trigger_text  text        not null,
  timestamp     timestamptz not null default now(),
  resolved      boolean     not null default false,
  resolved_at   timestamptz,
  resolved_by   text,
  notes         text
);

create index idx_sos_events_user_code on sos_events (user_code);
create index idx_sos_events_unresolved on sos_events (resolved) where resolved = false;
create index idx_sos_events_timestamp on sos_events (timestamp desc);

comment on table sos_events is 'Emergency events triggered when the bot detects distress signals (detention, violence, exploitation). Monitored by humanitarian workers.';


-- 4. Row Level Security
-- ============================================================

alter table conversations enable row level security;
alter table messages enable row level security;
alter table doc_chunks enable row level security;
alter table authorizations enable row level security;
alter table resources enable row level security;
alter table sos_events enable row level security;

-- 4.1 doc_chunks, authorizations, resources: public read
-- These are reference data — anyone can read, only service_role can write.

create policy "Public read doc_chunks"
  on doc_chunks for select
  using (true);

create policy "Service write doc_chunks"
  on doc_chunks for all
  using (auth.role() = 'service_role');

create policy "Public read authorizations"
  on authorizations for select
  using (true);

create policy "Service write authorizations"
  on authorizations for all
  using (auth.role() = 'service_role');

create policy "Public read resources"
  on resources for select
  using (true);

create policy "Service write resources"
  on resources for all
  using (auth.role() = 'service_role');

-- 4.2 conversations, messages: access by user_code via RPC
-- The API layer passes user_code as a claim. For now, service_role
-- handles all reads/writes server-side; no direct client access.

create policy "Service access conversations"
  on conversations for all
  using (auth.role() = 'service_role');

create policy "Service access messages"
  on messages for all
  using (auth.role() = 'service_role');

-- 4.3 sos_events: service_role only (humanitarian workers via admin dashboard)

create policy "Service access sos_events"
  on sos_events for all
  using (auth.role() = 'service_role');


-- 5. Helper functions
-- ============================================================

-- 5.1 Similarity search with metadata filters
create or replace function match_chunks(
  query_embedding vector(1024),
  match_count     int default 5,
  filter_situacio situacio_legal default null,
  filter_country  text default null,
  filter_urgencia urgencia_level default null
)
returns table (
  id                 uuid,
  content            text,
  similarity         float,
  tipus_autoritzacio text,
  situacio_legal     situacio_legal,
  llei_referencia    text,
  source_file        text
)
language plpgsql
as $$
begin
  return query
  select
    dc.id,
    dc.content,
    1 - (dc.embedding <=> query_embedding) as similarity,
    dc.tipus_autoritzacio,
    dc.situacio_legal,
    dc.llei_referencia,
    dc.source_file
  from doc_chunks dc
  where
    (filter_situacio is null or dc.situacio_legal = filter_situacio)
    and (filter_country is null or dc.country = filter_country)
    and (filter_urgencia is null or dc.urgencia = filter_urgencia)
  order by dc.embedding <=> query_embedding
  limit match_count;
end;
$$;

comment on function match_chunks is 'Semantic similarity search over doc_chunks with optional metadata filters. Returns top-k chunks ordered by cosine similarity.';


-- 5.2 Auto-update updated_at on authorizations
create or replace function update_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger trg_authorizations_updated_at
  before update on authorizations
  for each row execute function update_updated_at();


-- ============================================================
-- Done. Schema ready for Pathfinder.
-- Next steps:
--   1. Populate authorizations from knowledge/sources/spain/authorizations/
--   2. Run chunking pipeline on knowledge/sources/spain/legislation/
--   3. Generate embeddings and insert into doc_chunks
--   4. Populate resources with NGO/government office data
-- ============================================================

-- ════════════ supabase/migrations/001_admin_analytics.sql ════════════
-- Analytics helper functions for the admin dashboard

-- Conversations per day (last N days)
CREATE OR REPLACE FUNCTION conversations_per_day(days_back int DEFAULT 14)
RETURNS TABLE (day date, count bigint)
LANGUAGE sql STABLE
AS $$
  SELECT date_trunc('day', created_at)::date AS day, count(*)
  FROM conversations
  WHERE created_at > now() - make_interval(days => days_back)
  GROUP BY day ORDER BY day;
$$;

-- Language distribution
CREATE OR REPLACE FUNCTION language_distribution()
RETURNS TABLE (language text, count bigint)
LANGUAGE sql STABLE
AS $$
  SELECT language, count(*)
  FROM conversations
  GROUP BY language ORDER BY count DESC;
$$;

-- SOS summary stats
CREATE OR REPLACE FUNCTION sos_summary()
RETURNS TABLE (total bigint, unresolved bigint, today bigint)
LANGUAGE sql STABLE
AS $$
  SELECT
    count(*),
    count(*) FILTER (WHERE resolved = false),
    count(*) FILTER (WHERE timestamp::date = current_date)
  FROM sos_events;
$$;

-- ════════════ supabase/migrations/002_collection_state.sql ════════════
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

-- ════════════ supabase/migrations/003_sos_recordings.sql ════════════
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

-- ════════════ supabase/migrations/004_add_user_auth.sql ════════════
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

-- ════════════ supabase/migrations/005_admin_users.sql ════════════
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

-- ════════════ supabase/migrations/006_security_hardening.sql ════════════
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

-- ════════════ supabase/migrations/007_case_notes.sql ════════════
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

-- ════════════ supabase/migrations/008_resource_layer.sql ════════════
-- Migration 008: Resource layer expansion
--
-- Three pieces, all designed to ship the data layer for the
-- "geographically-aware case detail" feature:
--
-- 1. Extends the existing `resources` table with province + targeting
--    columns so we can filter by location and population served. Existing
--    rows keep working — every new column is nullable or has a default.
--
-- 2. New `diplomatic_missions` table for embassies and consulates of
--    the user's country of origin physically located in Spain.
--
-- 3. New `procedural_notes` table capturing the gap between what the law
--    says and how procedures are actually applied at the province / CCAA /
--    consulate level. This is the highest-value table — it's where
--    in-house knowledge (Alba, immigration lawyers, lived experience)
--    will live.
--
-- All three are read-public, write-admin (service_role only via RLS),
-- mirroring the existing `resources` / `authorizations` access model.
-- Seed data is intentionally NOT included — populating these tables with
-- unverified addresses or procedural claims would be worse than empty.
-- A follow-up migration (or admin UI insert) will seed them.

-- ── 1. Extend `resources` ───────────────────────────────────────────

ALTER TABLE resources
  ADD COLUMN IF NOT EXISTS province_iso         text,
  ADD COLUMN IF NOT EXISTS ccaa_code            text,
  ADD COLUMN IF NOT EXISTS target_populations   text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS free_of_charge       boolean DEFAULT true,
  ADD COLUMN IF NOT EXISTS appointment_required boolean,
  ADD COLUMN IF NOT EXISTS description          jsonb DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS verified_by          text,
  ADD COLUMN IF NOT EXISTS verified_date        date,
  ADD COLUMN IF NOT EXISTS active               boolean NOT NULL DEFAULT true;

CREATE INDEX IF NOT EXISTS idx_resources_province
  ON resources (province_iso, active);
CREATE INDEX IF NOT EXISTS idx_resources_ccaa
  ON resources (ccaa_code, active);
CREATE INDEX IF NOT EXISTS idx_resources_target
  ON resources USING gin(target_populations);

COMMENT ON COLUMN resources.province_iso IS
  'ISO 3166-2 subdivision code of the Spanish province, e.g. ES-B (Barcelona), ES-M (Madrid).';
COMMENT ON COLUMN resources.ccaa_code IS
  'ISO 3166-2 of the autonomous community, e.g. ES-CT (Catalunya).';
COMMENT ON COLUMN resources.target_populations IS
  'Populations served: {unaccompanied_minors, women_victims, asylum_seekers, lgbtq, roma, general, ...}.';
COMMENT ON COLUMN resources.description IS
  'Multilingual description: { "ca": "...", "es": "...", "en": "...", ... }';

-- ── 2. diplomatic_missions ─────────────────────────────────────────

CREATE TABLE IF NOT EXISTS diplomatic_missions (
  id                    uuid PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  -- Represented country (ISO 3166-1 alpha-2): MA, SN, PK, RO, CO, ...
  country_iso           text NOT NULL,
  type                  text NOT NULL
    CHECK (type IN ('embassy', 'consulate_general', 'honorary_consulate')),
  -- Location inside Spain
  city                  text NOT NULL,
  province_iso          text NOT NULL,
  address               text,
  -- Contact
  phone                 text,
  email                 text,
  website               text,
  appointment_url       text,
  appointment_required  boolean,
  -- Services offered
  services              text[] DEFAULT '{}',
  business_hours        jsonb,
  -- Spanish provinces this mission serves (an embassy in Madrid covers
  -- the whole country; a consulate general in Barcelona may only cover a
  -- subset). Empty array = covers everything.
  covers_provinces      text[] DEFAULT '{}',
  -- Multilingual notes for the panel
  description           jsonb DEFAULT '{}'::jsonb,
  -- Audit
  verified_date         date,
  active                boolean NOT NULL DEFAULT true,
  created_at            timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_missions_country
  ON diplomatic_missions (country_iso, active);
CREATE INDEX IF NOT EXISTS idx_missions_province
  ON diplomatic_missions (province_iso, active);
CREATE INDEX IF NOT EXISTS idx_missions_covers
  ON diplomatic_missions USING gin(covers_provinces);

ALTER TABLE diplomatic_missions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read diplomatic_missions"
  ON diplomatic_missions FOR SELECT
  USING (active = true);

CREATE POLICY "Service write diplomatic_missions"
  ON diplomatic_missions FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

COMMENT ON TABLE diplomatic_missions IS
  'Embassies and consulates of foreign countries physically located in Spain. Used to point migrants to passport renewal, civil registry and emergency assistance services from their home country.';

-- ── 3. procedural_notes ────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS procedural_notes (
  id                  uuid PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  -- Scope of the note
  authorization_slug  text,
  scope               text NOT NULL
    CHECK (scope IN ('province', 'ccaa', 'national', 'consulate')),
  province_iso        text,
  ccaa_code           text,
  country_iso         text,
  -- Content
  legal_text          text,
  practical_text      text NOT NULL,
  severity            text NOT NULL
    CHECK (severity IN ('blocker', 'workaround', 'warning', 'info')),
  -- Provenance
  source              text,
  source_date         date,
  verified_by         text[] DEFAULT '{}',
  active              boolean NOT NULL DEFAULT true,
  -- Targeting
  tags                text[] DEFAULT '{}',
  description         jsonb DEFAULT '{}'::jsonb,
  created_at          timestamptz NOT NULL DEFAULT now(),
  updated_at          timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_proc_notes_auth_prov
  ON procedural_notes (authorization_slug, province_iso, active);
CREATE INDEX IF NOT EXISTS idx_proc_notes_auth_ccaa
  ON procedural_notes (authorization_slug, ccaa_code, active);
CREATE INDEX IF NOT EXISTS idx_proc_notes_country
  ON procedural_notes (country_iso, active)
  WHERE country_iso IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_proc_notes_tags
  ON procedural_notes USING gin(tags);

ALTER TABLE procedural_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read procedural_notes"
  ON procedural_notes FOR SELECT
  USING (active = true);

CREATE POLICY "Service write procedural_notes"
  ON procedural_notes FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

COMMENT ON TABLE procedural_notes IS
  'Gap between law and practice. Captures what actually happens at the province/CCAA/consulate level — quirks, requirements not in the written law, slow citas previas, requested-but-not-required documents, etc.';
COMMENT ON COLUMN procedural_notes.severity IS
  'blocker = stops the procedure if not addressed; workaround = there is a known way around; warning = be aware; info = useful context.';
COMMENT ON COLUMN procedural_notes.verified_by IS
  'Names / handles of people who confirmed this note. Multiple verifications = higher confidence.';

-- ── Run this migration manually in the Supabase SQL editor.
-- After applying, verify:
--   \dt diplomatic_missions
--   \dt procedural_notes
--   \d resources           -- confirm new columns

-- ════════════ supabase/migrations/009_conversations_updated_at.sql ════════════
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

-- ============================================================
-- PASSOS MANUALS DESPRÉS D'EXECUTAR AIXÒ:
-- 1. Storage → New bucket: 'sos-recordings' (privat, 10MB, video/audio webm+mp4)
-- 2. Authentication → URL Configuration → Site URL + Redirect URLs (/auth/callback, /auth/reset)
-- 3. Crea el teu compte a l'app i després:
--    INSERT INTO admin_users (user_id, role, email) VALUES ((SELECT id FROM auth.users WHERE email='otger02@gmail.com'), 'superadmin', 'otger02@gmail.com');
-- ============================================================
