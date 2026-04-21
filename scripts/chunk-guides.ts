/**
 * chunk-guides.ts
 *
 * Reads every .txt in knowledge/sources/spain/guides/,
 * splits into ~500-token chunks with overlap,
 * and writes one JSON file per document to knowledge/processed/chunks/guides/.
 *
 * For training materials, procedure docs, and general immigration guides
 * that don't fit the legislation or authorizations categories.
 *
 * Run:  npx tsx scripts/chunk-guides.ts
 * Deps: none (Node built-ins only)
 */

import { readFileSync, writeFileSync, readdirSync, mkdirSync, existsSync } from "fs";
import { join } from "path";
import {
  cleanText,
  chunkText,
  extractLleiRef,
  inferUrgencia,
} from "./lib/chunking.js";

// ── constants ──────────────────────────────────────────────────────────────

const SRC_DIR = join(process.cwd(), "knowledge", "sources", "spain", "guides");
const OUT_DIR = join(process.cwd(), "knowledge", "processed", "chunks", "guides");

// ── types ──────────────────────────────────────────────────────────────────

type DocumentType = "training" | "procedure" | "faq" | "general";

interface GuideChunk {
  document_id:        string;
  chunk_index:        number;
  content:            string;
  document_type:      DocumentType;
  tipus_autoritzacio: string;
  situacio_legal:     string;
  country:            "spain";
  urgencia:           string;
  llei_referencia:    string;
  vigent_des_de:      string | null;
}

// ── filename → document type mapping ──────────────────────────────────────

const GUIDE_MAP: [RegExp, DocumentType][] = [
  // Training materials
  [/Alba\s*Juss[aà]/i,          "training"],
  [/Formaci[oó]/i,               "training"],
  // Procedures & guides
  [/PIL/i,                        "procedure"],
  [/tr[àa]mit/i,                  "procedure"],
  [/Modificaci[oó]/i,             "procedure"],
  [/Autoritzaci[oó]/i,            "procedure"],
  [/GuiaMemoria/i,                "procedure"],
  // Asylum & international protection
  [/[Aa]silo/i,                   "procedure"],
  [/[Pp]rotecci[oó]n?\s*[Ii]nt/i, "procedure"],
  [/ACNUR|UNHCR/i,                "procedure"],
  [/[Dd]efensa.*denegaci[oó]n/i,  "procedure"],
  [/[Rr]ecursos?\s*administ/i,    "procedure"],
  [/8257/i,                        "procedure"],  // Legal assistance for asylum
  // Minors / Ukraine
  [/menores.*ucranian/i,          "procedure"],
  // FAQs
  [/FAQ|Preguntas/i,              "faq"],
  // Reports
  [/[Ii]nforme/i,                 "general"],
];

function inferDocType(filename: string): DocumentType {
  for (const [re, docType] of GUIDE_MAP) {
    if (re.test(filename)) return docType;
  }
  return "general";
}

// ── main ──────────────────────────────────────────────────────────────────

function main(): void {
  if (!existsSync(SRC_DIR)) {
    console.error(`Source dir not found: ${SRC_DIR}`);
    console.log("Create it and add .txt files first.");
    process.exit(1);
  }

  mkdirSync(OUT_DIR, { recursive: true });

  const files = readdirSync(SRC_DIR).filter((f) => f.endsWith(".txt"));
  console.log(`\nFound ${files.length} .txt files in ${SRC_DIR}\n`);

  let totalChunks = 0;
  let firstChunk: GuideChunk | null = null;

  for (const file of files) {
    const filePath = join(SRC_DIR, file);
    const raw = readFileSync(filePath, "utf-8");
    const text = cleanText(raw);
    const documentId = file.replace(/\.txt$/, "");
    const docType = inferDocType(file);

    const textChunks = chunkText(text);

    const chunks: GuideChunk[] = textChunks.map((content, i) => ({
      document_id:        documentId,
      chunk_index:        i,
      content,
      document_type:      docType,
      tipus_autoritzacio: "general",
      situacio_legal:     "general",
      country:            "spain" as const,
      urgencia:           inferUrgencia(content),
      llei_referencia:    extractLleiRef(content),
      vigent_des_de:      null,
    }));

    // Safe filename for JSON output
    const safeId = documentId.replace(/[^a-zA-Z0-9_-]/g, "_").slice(0, 80);
    const outPath = join(OUT_DIR, `${safeId}.json`);
    writeFileSync(outPath, JSON.stringify(chunks, null, 2), "utf-8");

    console.log(
      `  ✓ ${file}  →  ${chunks.length} chunks  ` +
      `(${text.length} chars, type=${docType})`
    );

    totalChunks += chunks.length;
    if (!firstChunk && chunks.length > 0) firstChunk = chunks[0];
  }

  // Summary
  console.log("\n" + "═".repeat(60));
  console.log(`  Files processed:  ${files.length}`);
  console.log(`  Total chunks:     ${totalChunks}`);
  console.log(`  Avg chunks/file:  ${files.length > 0 ? (totalChunks / files.length).toFixed(1) : 0}`);
  console.log(`  Output dir:       ${OUT_DIR}`);
  console.log("═".repeat(60));

  if (firstChunk) {
    console.log("\nExample — first chunk:\n");
    console.log(JSON.stringify(firstChunk, null, 2));
  }
}

main();
