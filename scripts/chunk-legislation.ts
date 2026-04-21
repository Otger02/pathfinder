/**
 * chunk-legislation.ts
 *
 * Reads every .txt in knowledge/sources/spain/legislation/,
 * splits into ~500-token chunks (≈2000 chars) with ~50-token overlap (≈200 chars),
 * enriches each chunk with metadata matching the Supabase doc_chunks schema,
 * and writes one JSON file per document to knowledge/processed/chunks/legislation/.
 *
 * Run:  npx tsx scripts/chunk-legislation.ts
 * Deps: none (Node built-ins only)
 */

import { readFileSync, writeFileSync, readdirSync, mkdirSync, existsSync } from "fs";
import { join } from "path";
import {
  CHUNK_SIZE,
  cleanText,
  chunkText,
  extractLleiRef,
  inferUrgencia,
  type SituacioLegal,
  type Urgencia,
} from "./lib/chunking.js";

// ── constants ──────────────────────────────────────────────────────────────

const SRC_DIR = join(process.cwd(), "knowledge", "sources", "spain", "legislation");
const OUT_DIR = join(process.cwd(), "knowledge", "processed", "chunks", "legislation");

interface Chunk {
  document_id:         string;
  chunk_index:         number;
  content:             string;
  tipus_autoritzacio:  string;
  situacio_legal:      SituacioLegal;
  country:             "spain";
  urgencia:            Urgencia;
  llei_referencia:     string;
  vigent_des_de:       string | null;
}

// ── metadata inference ─────────────────────────────────────────────────────

/** Map filename patterns → tipus_autoritzacio. First match wins. */
const TIPUS_RULES: [RegExp, string][] = [
  [/\barraigo\b/i,                   "arrelament"],
  [/\breagrupaci[oó]n\b/i,          "reagrupament_familiar"],
  [/\bfamiliar\b/i,                  "reagrupament_familiar"],
  [/\btrata\b/i,                     "proteccio_victimes"],
  [/\bviol[eê]ncia\b/i,             "proteccio_victimes"],
  [/\basilo\b|\brefugi/i,           "asil_refugi"],
  [/\bap[aá]trida\b/i,              "asil_refugi"],
  [/\bprotec/i,                      "asil_refugi"],
  [/\btrabajo\b|\btreballador/i,    "autoritzacio_treball"],
  [/\bauton[oó]m/i,                  "autoritzacio_treball"],
  [/\bestudi/i,                      "autoritzacio_estudis"],
  [/\bvoluntar/i,                    "autoritzacio_estudis"],
  [/\bciudadan.*UE\b|\blibre\s*circulaci/i, "ciutada_ue"],
  [/RD\s*240/i,                      "ciutada_ue"],
  [/Orden\s*PRE\s*1490/i,           "ciutada_ue"],
  [/\blarga\s*duraci[oó]n\b/i,      "residencia_llarga_duracio"],
  [/\brenovaci[oó]n\b/i,            "renovacio"],
  [/\bsancion/i,                     "procediment_sancionador"],
  [/\bexpulsi[oó]n\b/i,             "procediment_sancionador"],
  [/\bmenor/i,                       "menors"],
];

function inferTipus(filename: string, content: string): string {
  const haystack = filename + " " + content.slice(0, 3000);
  for (const [re, tipus] of TIPUS_RULES) {
    if (re.test(haystack)) return tipus;
  }
  return "general";
}

const SITUACIO_MAP: Record<string, SituacioLegal> = {
  arrelament:                "sense_autoritzacio",
  proteccio_victimes:        "sense_autoritzacio",
  asil_refugi:               "asil",
  autoritzacio_treball:      "amb_autoritzacio",
  autoritzacio_estudis:      "amb_autoritzacio",
  reagrupament_familiar:     "amb_autoritzacio",
  renovacio:                 "amb_autoritzacio",
  residencia_llarga_duracio: "amb_autoritzacio",
  ciutada_ue:                "ue",
  menors:                    "sense_autoritzacio",
  procediment_sancionador:   "general",
  general:                   "general",
};

function inferSituacio(tipus: string): SituacioLegal {
  return SITUACIO_MAP[tipus] ?? "general";
}

/** Try to extract a "valid since" date from the filename or first lines. */
function extractVigentDesde(filename: string, content: string): string | null {
  // filename often has year: "LO 4 2000" → 2000, "RD 1155 2024" → 2024
  const fnYear = filename.match(/(\d{4})(?:\s|$|\.)/);

  // Look for publication date in text
  const head = content.slice(0, 5000);

  // "de X de <mes> de YYYY" patterns
  const fullDate = head.match(
    /(\d{1,2})\s+de\s+(enero|febrero|marzo|abril|mayo|junio|julio|agosto|septiembre|octubre|noviembre|diciembre)\s+de\s+(\d{4})/i
  );
  if (fullDate) {
    const months: Record<string, string> = {
      enero: "01", febrero: "02", marzo: "03", abril: "04",
      mayo: "05", junio: "06", julio: "07", agosto: "08",
      septiembre: "09", octubre: "10", noviembre: "11", diciembre: "12",
    };
    const mm = months[fullDate[2].toLowerCase()];
    if (mm) {
      const dd = fullDate[1].padStart(2, "0");
      return `${fullDate[3]}-${mm}-${dd}`;
    }
  }

  if (fnYear) return `${fnYear[1]}-01-01`;
  return null;
}

// ── text cleaning & chunking (imported from lib/chunking) ─────────────────

// ── main ───────────────────────────────────────────────────────────────────

function main(): void {
  if (!existsSync(SRC_DIR)) {
    console.error(`Source dir not found: ${SRC_DIR}`);
    process.exit(1);
  }

  if (!existsSync(OUT_DIR)) {
    mkdirSync(OUT_DIR, { recursive: true });
  }

  const files = readdirSync(SRC_DIR).filter((f) => f.endsWith(".txt"));
  console.log(`\nFound ${files.length} .txt files in ${SRC_DIR}\n`);

  let totalChunks = 0;
  let firstChunk: Chunk | null = null;

  for (const file of files) {
    const filePath = join(SRC_DIR, file);
    const raw = readFileSync(filePath, "utf-8");
    const text = cleanText(raw);
    const documentId = file.replace(/\.txt$/, "");

    const tipus = inferTipus(file, text);
    const situacio = inferSituacio(tipus);
    const urgencia = inferUrgencia(text);
    const vigent = extractVigentDesde(file, text);

    const textChunks = chunkText(text);

    const chunks: Chunk[] = textChunks.map((content, i) => ({
      document_id:        documentId,
      chunk_index:        i,
      content,
      tipus_autoritzacio: tipus,
      situacio_legal:     situacio,
      country:            "spain" as const,
      urgencia,
      llei_referencia:    extractLleiRef(content),
      vigent_des_de:      vigent,
    }));

    const outPath = join(OUT_DIR, `${documentId}.json`);
    writeFileSync(outPath, JSON.stringify(chunks, null, 2), "utf-8");

    console.log(
      `  ✓ ${file}  →  ${chunks.length} chunks  ` +
      `(${text.length} chars, ${tipus}, ${situacio})`
    );

    totalChunks += chunks.length;
    if (!firstChunk && chunks.length > 0) firstChunk = chunks[0];
  }

  // Summary
  console.log("\n" + "═".repeat(60));
  console.log(`  Files processed:  ${files.length}`);
  console.log(`  Total chunks:     ${totalChunks}`);
  console.log(`  Avg chunks/file:  ${(totalChunks / files.length).toFixed(1)}`);
  console.log(`  Output dir:       ${OUT_DIR}`);
  console.log("═".repeat(60));

  if (firstChunk) {
    console.log("\nExample — first chunk:\n");
    console.log(JSON.stringify(firstChunk, null, 2));
  }
}

main();
