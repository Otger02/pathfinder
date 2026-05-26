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
