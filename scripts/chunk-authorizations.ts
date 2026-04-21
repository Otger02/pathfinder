/**
 * chunk-authorizations.ts
 *
 * Reads every .txt in knowledge/sources/spain/authorizations/ (numbered 1-65),
 * splits into ~500-token chunks (≈2000 chars) with ~50-token overlap (≈200 chars),
 * maps each file to its tipus_autoritzacio by authorization number,
 * cross-references data/decision-tree.json for situacio_legal and node id,
 * and writes one JSON per document to knowledge/processed/chunks/authorizations/.
 *
 * Run:  npx tsx scripts/chunk-authorizations.ts
 * Deps: none (Node built-ins only)
 */

import { readFileSync, writeFileSync, readdirSync, mkdirSync, existsSync } from "fs";
import { join } from "path";
import {
  cleanText,
  chunkText,
  extractLleiRef,
  inferUrgencia,
  type SituacioLegal,
  type Urgencia,
} from "./lib/chunking.js";

// ── constants ──────────────────────────────────────────────────────────────

const SRC_DIR  = join(process.cwd(), "knowledge", "sources", "spain", "authorizations");
const OUT_DIR  = join(process.cwd(), "knowledge", "processed", "chunks", "authorizations");
const TREE_PATH = join(process.cwd(), "data", "decision-tree.json");

interface AuthChunk {
  document_id:          string;
  chunk_index:          number;
  content:              string;
  authorization_number: number;
  tipus_autoritzacio:   string;
  situacio_legal:       SituacioLegal;
  decision_tree_node:   string | null;
  country:              "spain";
  urgencia:             Urgencia;
  llei_referencia:      string;
  vigent_des_de:        string | null;
}

// ── authorization number → tipus map (Spanish immigration system) ──────────
// Based on the official Ministry "Listado completo de autorizaciones" (1-65)

interface AuthMeta {
  tipus: string;
  situacio: SituacioLegal;
  slug: string;            // maps to decision-tree slug
}

const AUTH_MAP: Record<number, AuthMeta> = {
  // --- Estancias de larga duración ---
  1:  { tipus: "estancia_estudis_superiors",          situacio: "amb_autoritzacio", slug: "prorroga-estada-estudis" },
  2:  { tipus: "estancia_activitats_formatives",      situacio: "amb_autoritzacio", slug: "prorroga-estada-estudis" },
  3:  { tipus: "estancia_mobilitat_alumnes",          situacio: "amb_autoritzacio", slug: "prorroga-estada-estudis" },
  4:  { tipus: "estancia_voluntariat",                situacio: "amb_autoritzacio", slug: "prorroga-estada-estudis" },
  5:  { tipus: "mobilitat_estudiants_ue",             situacio: "ue",              slug: "prorroga-estada-estudis" },

  // --- Residencia temporal no lucrativa ---
  6:  { tipus: "residencia_no_lucrativa",             situacio: "amb_autoritzacio", slug: "renovacio-residencia-temporal" },
  7:  { tipus: "renovacio_residencia_no_lucrativa",   situacio: "amb_autoritzacio", slug: "renovacio-residencia-temporal" },

  // --- Reagrupación familiar ---
  8:  { tipus: "reagrupacio_familiar",                situacio: "amb_autoritzacio", slug: "reagrupacio-familiar" },
  9:  { tipus: "reagrupacio_familiar_mobilitat_ue",   situacio: "amb_autoritzacio", slug: "reagrupacio-familiar" },
  10: { tipus: "renovacio_reagrupacio_familiar",      situacio: "amb_autoritzacio", slug: "renovacio-reagrupacio-familiar" },
  11: { tipus: "residencia_independent_reagrupats",   situacio: "amb_autoritzacio", slug: "residencia-independent-reagrupats" },

  // --- Trabajo por cuenta ajena ---
  12: { tipus: "treball_compte_alie_inicial",         situacio: "amb_autoritzacio", slug: "treball-compte-alie" },
  13: { tipus: "treball_compte_alie_renovacio",       situacio: "amb_autoritzacio", slug: "renovacio-residencia-treball-alie" },

  // --- Trabajo por cuenta propia ---
  14: { tipus: "treball_compte_propi_inicial",        situacio: "amb_autoritzacio", slug: "treball-compte-alie" },
  15: { tipus: "treball_compte_propi_renovacio",      situacio: "amb_autoritzacio", slug: "renovacio-residencia-treball-propi" },

  // --- Excepción a autorización de trabajo ---
  16: { tipus: "residencia_excepcio_treball",         situacio: "amb_autoritzacio", slug: "residencia-excepcio-treball" },

  // --- Retorno voluntario ---
  17: { tipus: "residencia_retorn_voluntari",         situacio: "amb_autoritzacio", slug: "renovacio-residencia-temporal" },

  // --- Familiares de españoles ---
  18: { tipus: "residencia_familiar_espanyol",        situacio: "amb_autoritzacio", slug: "reagrupacio-familiar" },
  19: { tipus: "residencia_independent_familiar_espanyol", situacio: "amb_autoritzacio", slug: "residencia-independent-reagrupats" },

  // --- Búsqueda de empleo / prácticas ---
  20: { tipus: "cerca_feina_emprenedoria",            situacio: "amb_autoritzacio", slug: "cerca-feina-post-estudis" },
  21: { tipus: "residencia_practiques",               situacio: "amb_autoritzacio", slug: "prorroga-estada-estudis" },

  // --- Nacionales andorranos ---
  22: { tipus: "nacionals_andorrans",                 situacio: "amb_autoritzacio", slug: "renovacio-residencia-temporal" },

  // --- Trabajo de temporada / gestión colectiva ---
  23: { tipus: "treball_temporada",                   situacio: "amb_autoritzacio", slug: "treball-compte-alie" },
  24: { tipus: "gestio_colectiva_contractacions",     situacio: "amb_autoritzacio", slug: "treball-compte-alie" },
  25: { tipus: "migracio_estable_gecco",              situacio: "amb_autoritzacio", slug: "treball-compte-alie" },
  26: { tipus: "migracio_circular_gecco",             situacio: "amb_autoritzacio", slug: "treball-compte-alie" },

  // --- Arraigos (circunstancias excepcionales) ---
  27: { tipus: "arraigo_segona_oportunitat",          situacio: "sense_autoritzacio", slug: "arraigo-segona-oportunitat" },
  28: { tipus: "arraigo_social",                      situacio: "sense_autoritzacio", slug: "arraigo-social" },
  29: { tipus: "arraigo_sociolaboral",                situacio: "sense_autoritzacio", slug: "arraigo-sociolaboral" },
  30: { tipus: "arraigo_socioformatiu",               situacio: "sense_autoritzacio", slug: "arraigo-socioformatiu" },
  31: { tipus: "arraigo_familiar",                    situacio: "sense_autoritzacio", slug: "arraigo-familiar" },
  32: { tipus: "residencia_humanitaria",              situacio: "sense_autoritzacio", slug: "arraigo-humanitari" },

  // --- Colaboración con autoridades ---
  33: { tipus: "colaboracio_autoritats_policials",    situacio: "sense_autoritzacio", slug: "arraigo-humanitari" },
  34: { tipus: "colaboracio_interes_public",          situacio: "sense_autoritzacio", slug: "arraigo-humanitari" },

  // --- Víctimas ---
  35: { tipus: "victima_violencia_genere",            situacio: "sense_autoritzacio", slug: "victima-violencia-genere" },
  // 35 bis is handled via "35 bis" string match below
  36: { tipus: "colaboracio_contra_xarxes_admin",     situacio: "sense_autoritzacio", slug: "arraigo-humanitari" },
  37: { tipus: "colaboracio_contra_xarxes_policial",  situacio: "sense_autoritzacio", slug: "arraigo-humanitari" },
  38: { tipus: "victima_trata",                       situacio: "sense_autoritzacio", slug: "victima-trata" },

  // --- Transfronterizos ---
  39: { tipus: "treball_transfronter_propi",          situacio: "amb_autoritzacio", slug: "treball-compte-alie" },
  40: { tipus: "treball_transfronter_alie",           situacio: "amb_autoritzacio", slug: "treball-compte-alie" },

  // --- Menores ---
  41: { tipus: "menor_acompanyat_nascut_espanya",     situacio: "amb_autoritzacio", slug: "reagrupacio-familiar" },
  42: { tipus: "menor_acompanyat_no_nascut_espanya",  situacio: "amb_autoritzacio", slug: "reagrupacio-familiar" },
  43: { tipus: "desplacament_menor_medic",            situacio: "amb_autoritzacio", slug: "renovacio-residencia-temporal" },
  44: { tipus: "desplacament_menor_vacances",         situacio: "amb_autoritzacio", slug: "renovacio-residencia-temporal" },
  45: { tipus: "desplacament_menor_escolaritzacio",   situacio: "amb_autoritzacio", slug: "renovacio-residencia-temporal" },
  46: { tipus: "menor_no_acompanyat",                 situacio: "sense_autoritzacio", slug: "residencia-menor-no-acompanyat" },
  47: { tipus: "renovacio_menor_no_acompanyat_majoria", situacio: "sense_autoritzacio", slug: "residencia-excepcional-menor-majoria-edat" },
  48: { tipus: "menor_excepcional_majoria_edat",      situacio: "sense_autoritzacio", slug: "residencia-excepcional-menor-majoria-edat" },

  // --- Larga duración ---
  49: { tipus: "residencia_llarga_duracio_nacional",  situacio: "amb_autoritzacio", slug: "residencia-llarga-duracio" },
  50: { tipus: "residencia_llarga_duracio_ue",        situacio: "amb_autoritzacio", slug: "residencia-llarga-duracio-ue" },
  51: { tipus: "llarga_duracio_ue_altre_estat",       situacio: "amb_autoritzacio", slug: "residencia-llarga-duracio-ue" },
  52: { tipus: "llarga_duracio_familiar",             situacio: "amb_autoritzacio", slug: "residencia-llarga-duracio" },
  53: { tipus: "recuperacio_llarga_duracio",          situacio: "amb_autoritzacio", slug: "residencia-llarga-duracio" },
  54: { tipus: "recuperacio_llarga_duracio_ue",       situacio: "amb_autoritzacio", slug: "residencia-llarga-duracio-ue" },

  // --- (55-58 no existeixen al llistat oficial) ---

  // --- Contratación / legitimación ---
  59: { tipus: "contractacio_no_residents_sne",       situacio: "amb_autoritzacio", slug: "treball-compte-alie" },
  60: { tipus: "subjectes_legitimats",                situacio: "general",          slug: "" },

  // --- Documentación / trámites ---
  61: { tipus: "legalitzacio_traduccio_documents",    situacio: "general",          slug: "" },

  // --- Ciudadanos UE y familiares ---
  62: { tipus: "targeta_familiar_ciutada_ue",         situacio: "ue", slug: "targeta-familiar-ue" },
  63: { tipus: "targeta_permanent_familiar_ue",       situacio: "ue", slug: "targeta-permanent-familiar-ue" },

  // --- Penados ---
  64: { tipus: "treball_penats_regim_obert",          situacio: "amb_autoritzacio", slug: "residencia-excepcio-treball" },

  // --- Certificado UE ---
  65: { tipus: "certificat_registre_ciutada_ue",      situacio: "ue", slug: "certificat-registre-ue" },
};

// 35 bis special entry
const AUTH_35BIS: AuthMeta = {
  tipus: "victima_violencia_sexual",
  situacio: "sense_autoritzacio",
  slug: "victima-violencia-genere",
};

// ── decision-tree cross-reference ──────────────────────────────────────────

/** Recursively collect all slug→nodeId mappings from the tree. */
function collectSlugToNode(node: any, path: string[] = []): Map<string, string> {
  const map = new Map<string, string>();

  if (node.autoritzacions && Array.isArray(node.autoritzacions)) {
    for (const auth of node.autoritzacions) {
      if (auth.slug) {
        // Use the parent result node's id
        map.set(auth.slug, node.id ?? "unknown");
      }
    }
  }

  if (node.opcions && Array.isArray(node.opcions)) {
    for (const opt of node.opcions) {
      if (opt.node) {
        for (const [k, v] of collectSlugToNode(opt.node, [...path, opt.id])) {
          // First match wins (don't overwrite)
          if (!map.has(k)) map.set(k, v);
        }
      }
    }
  }

  return map;
}

function loadSlugToNodeMap(): Map<string, string> {
  if (!existsSync(TREE_PATH)) {
    console.warn(`  ⚠ Decision tree not found at ${TREE_PATH}, node mapping disabled`);
    return new Map();
  }
  const tree = JSON.parse(readFileSync(TREE_PATH, "utf-8"));
  return collectSlugToNode(tree);
}

// ── shared helpers (imported from lib/chunking) ─────────────────────────

function extractVigentDesde(content: string): string | null {
  const head = content.slice(0, 5000);
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
    if (mm) return `${fullDate[3]}-${mm}-${fullDate[1].padStart(2, "0")}`;
  }
  return null;
}

// ── filename → authorization number ────────────────────────────────────────

/**
 * Extract the authorization number from the filename.
 * Handles: "28. Arraigo social.txt", "35 bis. Victims...", "19RESI~1.txt", "26AUTO~1.txt"
 */
function extractAuthNumber(filename: string): { num: number; isBis: boolean } | null {
  // "35 bis." pattern
  const bisMatch = filename.match(/^(\d+)\s*bis\b/i);
  if (bisMatch) return { num: parseInt(bisMatch[1], 10), isBis: true };

  // Normal: "28. xxx" or "28.xxx"
  const normalMatch = filename.match(/^(\d+)\.\s/);
  if (normalMatch) return { num: parseInt(normalMatch[1], 10), isBis: false };

  // 8.3 short names: "19RESI~1.txt", "26AUTO~1.txt", "36AUTO~1.txt", etc.
  const shortMatch = filename.match(/^(\d+)[A-Z]+~\d/i);
  if (shortMatch) return { num: parseInt(shortMatch[1], 10), isBis: false };

  return null;
}

// ── main ───────────────────────────────────────────────────────────────────

function main(): void {
  if (!existsSync(SRC_DIR)) {
    console.error(`Source dir not found: ${SRC_DIR}`);
    process.exit(1);
  }

  mkdirSync(OUT_DIR, { recursive: true });

  // Load decision tree slug→nodeId map
  const slugToNode = loadSlugToNodeMap();
  console.log(`\nDecision tree loaded: ${slugToNode.size} slug→node mappings\n`);

  const files = readdirSync(SRC_DIR).filter((f) => f.endsWith(".txt"));
  console.log(`Found ${files.length} .txt files in ${SRC_DIR}\n`);

  let totalChunks = 0;
  let filesProcessed = 0;
  let filesSkipped = 0;
  let firstChunk: AuthChunk | null = null;

  for (const file of files) {
    const parsed = extractAuthNumber(file);
    if (!parsed) {
      console.log(`  ⚠ Skipping (no auth number): ${file}`);
      filesSkipped++;
      continue;
    }

    const { num, isBis } = parsed;
    const meta: AuthMeta | undefined = isBis && num === 35
      ? AUTH_35BIS
      : AUTH_MAP[num];

    if (!meta) {
      console.log(`  ⚠ Skipping (no mapping for #${num}): ${file}`);
      filesSkipped++;
      continue;
    }

    const filePath = join(SRC_DIR, file);
    const raw = readFileSync(filePath, "utf-8");
    const text = cleanText(raw);
    const documentId = file.replace(/\.txt$/, "");
    const treeNode = meta.slug ? (slugToNode.get(meta.slug) ?? null) : null;

    const textChunks = chunkText(text);

    const chunks: AuthChunk[] = textChunks.map((content, i) => ({
      document_id:          documentId,
      chunk_index:          i,
      content,
      authorization_number: num,
      tipus_autoritzacio:   meta.tipus,
      situacio_legal:       meta.situacio,
      decision_tree_node:   treeNode,
      country:              "spain" as const,
      urgencia:             inferUrgencia(content),
      llei_referencia:      extractLleiRef(content),
      vigent_des_de:        extractVigentDesde(text),
    }));

    const safeDocId = isBis ? `${num}_bis` : `${num}`;
    const outPath = join(OUT_DIR, `auth_${safeDocId}.json`);
    writeFileSync(outPath, JSON.stringify(chunks, null, 2), "utf-8");

    const nodeLabel = treeNode ? `→ ${treeNode}` : "(no tree node)";
    console.log(
      `  ✓ #${isBis ? num + " bis" : num}  ${meta.tipus}  →  ` +
      `${chunks.length} chunks  (${meta.situacio})  ${nodeLabel}`
    );

    totalChunks += chunks.length;
    filesProcessed++;
    if (!firstChunk && chunks.length > 0) firstChunk = chunks[0];
  }

  // Summary
  console.log("\n" + "═".repeat(65));
  console.log(`  Files processed:  ${filesProcessed}`);
  console.log(`  Files skipped:    ${filesSkipped}`);
  console.log(`  Total chunks:     ${totalChunks}`);
  console.log(`  Avg chunks/file:  ${filesProcessed > 0 ? (totalChunks / filesProcessed).toFixed(1) : 0}`);
  console.log(`  Output dir:       ${OUT_DIR}`);
  console.log("═".repeat(65));

  if (firstChunk) {
    console.log("\nExample — first chunk:\n");
    console.log(JSON.stringify(firstChunk, null, 2));
  }
}

main();
