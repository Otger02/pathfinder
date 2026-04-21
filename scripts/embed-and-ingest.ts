/**
 * embed-and-ingest.ts
 *
 * Reads all chunk JSONs from legislation/ and authorizations/,
 * generates embeddings via Voyage AI (voyage-multilingual-2, 1536d),
 * and upserts everything into Supabase doc_chunks.
 *
 * Run:  npx tsx scripts/embed-and-ingest.ts
 * Env:  VOYAGE_API_KEY, NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
 *       (reads from .env.local)
 *
 * Deps: @supabase/supabase-js (the only external dep)
 */

import { readFileSync, readdirSync, existsSync } from "fs";
import { join } from "path";
import { createClient, SupabaseClient } from "@supabase/supabase-js";

// ── config ─────────────────────────────────────────────────────────────────

const CHUNKS_ROOT = join(process.cwd(), "knowledge", "processed", "chunks");
// Dynamically discover all subdirectories containing chunk JSONs
const CHUNKS_DIRS = (() => {
  if (!existsSync(CHUNKS_ROOT)) return [];
  return readdirSync(CHUNKS_ROOT, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => join(CHUNKS_ROOT, d.name));
})();

const VOYAGE_MODEL      = "voyage-multilingual-2";
const VOYAGE_URL        = "https://api.voyageai.com/v1/embeddings";
const VOYAGE_BATCH_SIZE = 128;
const VOYAGE_DELAY_MS   = 200;

const SUPABASE_BATCH_SIZE = 50;

const MAX_RETRIES    = 3;
const RETRY_BASE_MS  = 1000;

// ── types ──────────────────────────────────────────────────────────────────

interface ChunkInput {
  document_id:          string;
  chunk_index:          number;
  content:              string;
  tipus_autoritzacio:   string;
  situacio_legal:       string;
  country:              string;
  urgencia:             string;
  llei_referencia:      string;
  vigent_des_de:        string | null;
  documents_necessaris?: string[];
  // authorization-specific (optional)
  authorization_number?: number;
  decision_tree_node?:   string | null;
}

interface DbRow {
  content:              string;
  embedding:            string;  // pgvector accepts stringified array
  tokens_count:         number;
  tipus_autoritzacio:   string | null;
  situacio_legal:       string | null;
  country:              string;
  urgencia:             string;
  llei_referencia:      string | null;
  vigent_des_de:        string | null;
  documents_necessaris: string[] | null;
  source_file:          string;
  chunk_index:          number;
}

// ── env ────────────────────────────────────────────────────────────────────

function loadEnv(): void {
  const envPath = join(process.cwd(), ".env.local");
  if (!existsSync(envPath)) return;

  const lines = readFileSync(envPath, "utf-8").split("\n");
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIdx = trimmed.indexOf("=");
    if (eqIdx < 0) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    const val = trimmed.slice(eqIdx + 1).trim().replace(/^["']|["']$/g, "");
    if (!process.env[key]) process.env[key] = val;
  }
}

function requireEnv(key: string): string {
  const val = process.env[key];
  if (!val) {
    console.error(`Missing env var: ${key}`);
    process.exit(1);
  }
  return val;
}

// ── load chunks ────────────────────────────────────────────────────────────

function loadAllChunks(): ChunkInput[] {
  const all: ChunkInput[] = [];

  for (const dir of CHUNKS_DIRS) {
    if (!existsSync(dir)) {
      console.warn(`  ⚠ Dir not found, skipping: ${dir}`);
      continue;
    }
    const files = readdirSync(dir).filter((f) => f.endsWith(".json"));
    for (const file of files) {
      const chunks: ChunkInput[] = JSON.parse(
        readFileSync(join(dir, file), "utf-8")
      );
      all.push(...chunks);
    }
    console.log(`  Loaded ${files.length} files from ${dir.split(/[\\/]/).pop()}/`);
  }

  return all;
}

// ── voyage AI embeddings ───────────────────────────────────────────────────

async function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

async function embedBatchWithRetry(
  texts: string[],
  apiKey: string,
  batchLabel: string
): Promise<number[][]> {
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const resp = await fetch(VOYAGE_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: VOYAGE_MODEL,
          input: texts,
          input_type: "document",
        }),
      });

      if (!resp.ok) {
        const body = await resp.text();
        throw new Error(`Voyage API ${resp.status}: ${body.slice(0, 300)}`);
      }

      const data = await resp.json();
      return data.data.map((d: { embedding: number[] }) => d.embedding);
    } catch (err: any) {
      const delayMs = RETRY_BASE_MS * Math.pow(2, attempt - 1);
      console.warn(
        `  ⚠ ${batchLabel} attempt ${attempt}/${MAX_RETRIES} failed: ${err.message?.slice(0, 120)}`
      );
      if (attempt === MAX_RETRIES) throw err;
      console.log(`    Retrying in ${delayMs}ms...`);
      await sleep(delayMs);
    }
  }
  throw new Error("unreachable");
}

async function embedAllChunks(
  chunks: ChunkInput[],
  apiKey: string
): Promise<number[][]> {
  const totalBatches = Math.ceil(chunks.length / VOYAGE_BATCH_SIZE);
  const allEmbeddings: number[][] = [];

  for (let b = 0; b < totalBatches; b++) {
    const start = b * VOYAGE_BATCH_SIZE;
    const end = Math.min(start + VOYAGE_BATCH_SIZE, chunks.length);
    const batch = chunks.slice(start, end);
    const texts = batch.map((c) => c.content);

    const label = `Embedding batch ${b + 1}/${totalBatches}`;
    process.stdout.write(`  ${label} (${start + 1}–${end} of ${chunks.length})...`);

    const embeddings = await embedBatchWithRetry(texts, apiKey, label);
    allEmbeddings.push(...embeddings);

    process.stdout.write(` ✓ (${embeddings[0].length}d)\n`);

    if (b < totalBatches - 1) await sleep(VOYAGE_DELAY_MS);
  }

  return allEmbeddings;
}

// ── supabase ingest ────────────────────────────────────────────────────────

function chunkToRow(chunk: ChunkInput, embedding: number[]): DbRow {
  // Rough token count: chars / 4
  const tokensCount = Math.ceil(chunk.content.length / 4);

  return {
    content:              chunk.content,
    embedding:            JSON.stringify(embedding),
    tokens_count:         tokensCount,
    tipus_autoritzacio:   chunk.tipus_autoritzacio || null,
    situacio_legal:       chunk.situacio_legal || null,
    country:              chunk.country || "ES",
    urgencia:             chunk.urgencia || "normal",
    llei_referencia:      chunk.llei_referencia || null,
    vigent_des_de:        chunk.vigent_des_de || null,
    documents_necessaris: chunk.documents_necessaris ?? null,
    source_file:          chunk.document_id,
    chunk_index:          chunk.chunk_index,
  };
}

async function ingestToSupabase(
  supabase: SupabaseClient,
  chunks: ChunkInput[],
  embeddings: number[][]
): Promise<{ ingested: number; errors: string[] }> {
  const totalBatches = Math.ceil(chunks.length / SUPABASE_BATCH_SIZE);
  let ingested = 0;
  const errors: string[] = [];

  for (let b = 0; b < totalBatches; b++) {
    const start = b * SUPABASE_BATCH_SIZE;
    const end = Math.min(start + SUPABASE_BATCH_SIZE, chunks.length);

    const rows = chunks.slice(start, end).map((chunk, i) =>
      chunkToRow(chunk, embeddings[start + i])
    );

    process.stdout.write(
      `  Ingesting chunks ${start + 1}–${end} of ${chunks.length}...`
    );

    const { error } = await supabase
      .from("doc_chunks")
      .upsert(rows, { onConflict: "source_file,chunk_index" });

    if (error) {
      const msg = `Batch ${b + 1}: ${error.message}`;
      errors.push(msg);
      process.stdout.write(` ✗ ${error.message.slice(0, 100)}\n`);
    } else {
      ingested += rows.length;
      process.stdout.write(` ✓\n`);
    }
  }

  return { ingested, errors };
}

// ── main ───────────────────────────────────────────────────────────────────

async function main(): Promise<void> {
  const t0 = Date.now();

  // Load env
  loadEnv();
  const voyageKey   = requireEnv("VOYAGE_API_KEY");
  const supabaseUrl = requireEnv("NEXT_PUBLIC_SUPABASE_URL");
  const supabaseKey = requireEnv("SUPABASE_SERVICE_ROLE_KEY");

  // Load chunks
  console.log("\n1. Loading chunks...\n");
  const chunks = loadAllChunks();
  console.log(`\n   Total chunks to process: ${chunks.length}\n`);

  if (chunks.length === 0) {
    console.log("   No chunks found. Run chunk-legislation.ts and chunk-authorizations.ts first.");
    process.exit(0);
  }

  // Generate embeddings
  console.log("2. Generating embeddings via Voyage AI...\n");
  const embeddings = await embedAllChunks(chunks, voyageKey);

  // Validate
  if (embeddings.length !== chunks.length) {
    console.error(`   Mismatch: ${chunks.length} chunks but ${embeddings.length} embeddings`);
    process.exit(1);
  }

  // Ingest to Supabase
  console.log("\n3. Upserting to Supabase doc_chunks...\n");
  const supabase = createClient(supabaseUrl, supabaseKey);
  const { ingested, errors } = await ingestToSupabase(supabase, chunks, embeddings);

  // Summary
  const elapsed = ((Date.now() - t0) / 1000).toFixed(1);
  console.log("\n" + "═".repeat(60));
  console.log(`  Total chunks:     ${chunks.length}`);
  console.log(`  Ingested:         ${ingested}`);
  console.log(`  Errors:           ${errors.length}`);
  console.log(`  Elapsed:          ${elapsed}s`);
  console.log("═".repeat(60));

  if (errors.length > 0) {
    console.log("\n  Error details:");
    for (const e of errors) {
      console.log(`    - ${e}`);
    }
    process.exit(1);
  }
}

main().catch((err) => {
  console.error("\nFatal error:", err);
  process.exit(1);
});
