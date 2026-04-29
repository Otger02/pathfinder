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
