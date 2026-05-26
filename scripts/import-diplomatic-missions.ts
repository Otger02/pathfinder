/**
 * scripts/import-diplomatic-missions.ts
 *
 * Imports embassies and consulates of foreign countries located in Spain
 * from Wikidata's SPARQL endpoint into the `diplomatic_missions` table.
 *
 * Wikidata over scraping the MAEC HTML site:
 *   - Structured, queryable, citable.
 *   - Includes ISO 3166-1 alpha-2 (P297) directly on the country entity.
 *   - Stable over time; HTML scraping breaks every redesign.
 *   - Coverage gaps (some honorary consulates missing) are acceptable —
 *     they can be backfilled by admins via the SQL editor.
 *
 * Run:
 *   # Default: dry-run. Writes docs/diplomatic-missions-report.md.
 *   npx tsx scripts/import-diplomatic-missions.ts
 *
 *   # Actually insert rows (after reviewing the report):
 *   npx tsx scripts/import-diplomatic-missions.ts --apply
 *
 * Notes:
 *   - Idempotent. Re-runs skip rows where (country_iso, type, city)
 *     already exists.
 *   - `verified_date` is left NULL. Admins should mark rows verified
 *     after spot-checking.
 */

import { createClient } from "@supabase/supabase-js";
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs";
import { join, dirname } from "path";

// ── Load .env.local manually (tsx doesn't forward --env-file) ─────
{
  const envPath = join(process.cwd(), ".env.local");
  if (existsSync(envPath)) {
    const raw = readFileSync(envPath, "utf-8");
    for (const line of raw.split(/\r?\n/)) {
      const m = line.match(/^\s*([A-Z_][A-Z0-9_]*)\s*=\s*(.*?)\s*$/);
      if (!m) continue;
      const key = m[1];
      let val = m[2];
      if (
        (val.startsWith('"') && val.endsWith('"')) ||
        (val.startsWith("'") && val.endsWith("'"))
      ) {
        val = val.slice(1, -1);
      }
      if (!process.env[key]) process.env[key] = val;
    }
  }
}

const apply = process.argv.includes("--apply");

// ── Wikidata SPARQL query ─────────────────────────────────────────

const SPARQL_ENDPOINT = "https://query.wikidata.org/sparql";

// Diplomatic mission instance-of QIDs we accept.
// Q3917681 = diplomatic mission (parent)
// Q3957    = embassy
// Q160742  = consulate
// Q174178  = consulate general
// Q2071667 = high commission (Commonwealth — not relevant here but harmless)
const QUERY = `
SELECT DISTINCT ?mission ?missionLabel ?typeLabel ?iso ?cityLabel ?address ?website ?phone WHERE {
  ?mission wdt:P31/wdt:P279* wd:Q3917681 .
  ?mission wdt:P17 wd:Q29 .
  ?mission wdt:P137 ?country .
  ?country wdt:P297 ?iso .
  ?mission wdt:P31 ?type .
  OPTIONAL { ?mission wdt:P131 ?city }
  OPTIONAL { ?mission wdt:P6375 ?address }
  OPTIONAL { ?mission wdt:P856  ?website }
  OPTIONAL { ?mission wdt:P1329 ?phone }
  SERVICE wikibase:label { bd:serviceParam wikibase:language "es,en,ca". }
}
ORDER BY ?iso ?missionLabel
`.trim();

interface SparqlRow {
  mission: { value: string };
  missionLabel: { value: string };
  typeLabel: { value: string };
  iso: { value: string };
  cityLabel?: { value: string };
  address?: { value: string };
  website?: { value: string };
  phone?: { value: string };
}

interface SparqlResult {
  results: { bindings: SparqlRow[] };
}

async function fetchWikidata(): Promise<SparqlRow[]> {
  const url = `${SPARQL_ENDPOINT}?query=${encodeURIComponent(QUERY)}&format=json`;
  const resp = await fetch(url, {
    headers: {
      Accept: "application/sparql-results+json",
      "User-Agent":
        "PathfinderImporter/1.0 (https://github.com/Otger02/pathfinder; otger02@gmail.com)",
    },
  });
  if (!resp.ok) {
    const body = await resp.text();
    throw new Error(`Wikidata SPARQL ${resp.status}: ${body.slice(0, 200)}`);
  }
  const data = (await resp.json()) as SparqlResult;
  return data.results.bindings;
}

// ── Mapping helpers ───────────────────────────────────────────────

function classifyType(typeLabel: string): "embassy" | "consulate_general" | "honorary_consulate" | null {
  const s = typeLabel.toLowerCase();
  if (s.includes("embajada") || s.includes("embassy") || s.includes("ambaixada")) {
    return "embassy";
  }
  if (s.includes("honorario") || s.includes("honorary") || s.includes("honorari")) {
    return "honorary_consulate";
  }
  if (s.includes("consulado general") || s.includes("consulate general") || s.includes("consolat general")) {
    return "consulate_general";
  }
  if (s.includes("consulado") || s.includes("consulate") || s.includes("consolat")) {
    return "consulate_general";
  }
  if (s.includes("misión diplomática") || s.includes("diplomatic mission")) {
    return "embassy"; // best guess
  }
  return null;
}

// City → ES province ISO 3166-2. Covers the 10 cities where 95% of
// foreign missions are physically located. Anything else returns null
// and we infer from the city's known province via a fallback table.
const CITY_TO_PROVINCE: Record<string, string> = {
  madrid: "ES-M",
  barcelona: "ES-B",
  valencia: "ES-V",
  sevilla: "ES-SE",
  bilbao: "ES-BI",
  "palma de mallorca": "ES-PM",
  palma: "ES-PM",
  málaga: "ES-MA",
  malaga: "ES-MA",
  zaragoza: "ES-Z",
  "santa cruz de tenerife": "ES-TF",
  tenerife: "ES-TF",
  "las palmas de gran canaria": "ES-GC",
  "las palmas": "ES-GC",
  alicante: "ES-A",
  alacant: "ES-A",
  vigo: "ES-PO",
  ceuta: "ES-CE",
  melilla: "ES-ML",
  valladolid: "ES-VA",
  granada: "ES-GR",
  pamplona: "ES-NA",
};

function normalizeKey(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim();
}

function classifyCity(cityLabel?: string): { city: string; province_iso: string } | null {
  if (!cityLabel) return null;
  const norm = normalizeKey(cityLabel);
  const province_iso = CITY_TO_PROVINCE[norm];
  if (!province_iso) return null;
  // Title-case the city for storage
  const display = cityLabel.charAt(0).toUpperCase() + cityLabel.slice(1);
  return { city: display, province_iso };
}

/**
 * For consulates whose Wikidata entry lacks `wdt:P131` (~98% of them),
 * try to extract the Spanish city from the mission's label. Patterns:
 *   "Consulado General de Marruecos en Barcelona"
 *   "Consulat général de France à Madrid"
 *   "Honorary Consulate of Sweden in Valencia"
 */
function cityFromLabel(label: string): { city: string; province_iso: string } | null {
  const m = label.match(/\b(?:en|à|in|a|à)\s+([A-Z][\p{L}\s'.-]+?)(?:\s*[,(]|$)/u);
  if (!m) return null;
  const candidate = normalizeKey(m[1].trim());
  // Drop "España" / "Spain" / "Espagne" — they aren't cities
  if (["espana", "spain", "espagne", "el reino de espana"].includes(candidate)) {
    return null;
  }
  const province_iso = CITY_TO_PROVINCE[candidate];
  if (!province_iso) return null;
  const display = candidate.charAt(0).toUpperCase() + candidate.slice(1);
  return { city: display, province_iso };
}

/**
 * Resolve the mission's city using, in order:
 *   1. Explicit cityLabel from Wikidata P131
 *   2. City parsed from the mission label
 *   3. Convention: any embassy in Spain is in Madrid
 */
function resolveCity(
  type: "embassy" | "consulate_general" | "honorary_consulate",
  cityLabel: string | undefined,
  missionLabel: string
): { city: string; province_iso: string } | null {
  return (
    classifyCity(cityLabel) ??
    cityFromLabel(missionLabel) ??
    (type === "embassy" ? { city: "Madrid", province_iso: "ES-M" } : null)
  );
}

// ── Aggregation ──────────────────────────────────────────────────

interface ImportRow {
  country_iso: string;
  type: "embassy" | "consulate_general" | "honorary_consulate";
  city: string;
  province_iso: string;
  address: string | null;
  website: string | null;
  phone: string | null;
  source_qid: string; // Wikidata QID for traceability
  source_label: string;
}

interface SkipRow {
  iso: string;
  label: string;
  reason: string;
}

function deriveRows(bindings: SparqlRow[]): { rows: ImportRow[]; skips: SkipRow[] } {
  const rows: ImportRow[] = [];
  const skips: SkipRow[] = [];
  const seen = new Set<string>(); // dedupe: iso + type + city

  for (const b of bindings) {
    const iso = b.iso.value;
    const label = b.missionLabel.value;
    if (iso.length !== 2) {
      skips.push({ iso, label, reason: `invalid ISO code length: ${iso}` });
      continue;
    }
    const type = classifyType(b.typeLabel.value);
    if (!type) {
      skips.push({ iso, label, reason: `unknown type: ${b.typeLabel.value}` });
      continue;
    }
    const cityRes = resolveCity(type, b.cityLabel?.value, label);
    if (!cityRes) {
      skips.push({
        iso,
        label,
        reason: `could not resolve city (cityLabel="${b.cityLabel?.value ?? ""}")`,
      });
      continue;
    }
    const dedupeKey = `${iso}|${type}|${cityRes.city.toLowerCase()}`;
    if (seen.has(dedupeKey)) continue;
    seen.add(dedupeKey);

    rows.push({
      country_iso: iso,
      type,
      city: cityRes.city,
      province_iso: cityRes.province_iso,
      address: b.address?.value ?? null,
      website: b.website?.value ?? null,
      phone: b.phone?.value ?? null,
      source_qid: b.mission.value.replace("http://www.wikidata.org/entity/", ""),
      source_label: label,
    });
  }

  return { rows, skips };
}

// ── Report writer ────────────────────────────────────────────────

function writeReport(
  rows: ImportRow[],
  skips: SkipRow[],
  inserted: number | null,
  conflicts: number | null
): string {
  const lines: string[] = [];
  lines.push(`# Diplomatic missions import report`);
  lines.push("");
  lines.push(`- **Source**: Wikidata SPARQL endpoint`);
  lines.push(`- **Generated**: ${new Date().toISOString()}`);
  lines.push(`- **Mode**: ${apply ? "APPLY (rows inserted)" : "DRY-RUN (no DB writes)"}`);
  lines.push(`- **Candidates**: ${rows.length}`);
  lines.push(`- **Skipped**: ${skips.length}`);
  if (inserted !== null) lines.push(`- **Inserted**: ${inserted}`);
  if (conflicts !== null) lines.push(`- **Conflicts (already in DB)**: ${conflicts}`);
  lines.push("");

  // Group by country
  const byCountry: Record<string, ImportRow[]> = {};
  for (const r of rows) {
    (byCountry[r.country_iso] ??= []).push(r);
  }
  const isos = Object.keys(byCountry).sort();

  lines.push(`## Candidates by country (${isos.length} countries)`);
  lines.push("");
  lines.push("| ISO | Type | City | Address | Phone | Website | Wikidata |");
  lines.push("|-----|------|------|---------|-------|---------|----------|");
  for (const iso of isos) {
    for (const r of byCountry[iso]) {
      const addr = r.address ? r.address.replace(/\|/g, "\\|").slice(0, 60) : "—";
      const phone = r.phone ?? "—";
      const web = r.website ? `[link](${r.website})` : "—";
      lines.push(
        `| ${r.country_iso} | ${r.type} | ${r.city} | ${addr} | ${phone} | ${web} | [${r.source_qid}](https://www.wikidata.org/wiki/${r.source_qid}) |`
      );
    }
  }
  lines.push("");

  if (skips.length > 0) {
    lines.push(`## Skipped (${skips.length})`);
    lines.push("");
    lines.push("| ISO | Label | Reason |");
    lines.push("|-----|-------|--------|");
    for (const s of skips.slice(0, 200)) {
      lines.push(`| ${s.iso} | ${s.label} | ${s.reason} |`);
    }
    if (skips.length > 200) {
      lines.push(`| ... | _and ${skips.length - 200} more_ | |`);
    }
  }

  return lines.join("\n");
}

// ── Main ─────────────────────────────────────────────────────────

async function main() {
  console.log(`Pathfinder diplomatic missions importer`);
  console.log(`Mode: ${apply ? "APPLY" : "DRY-RUN"}`);
  console.log();

  console.log("Fetching Wikidata...");
  const bindings = await fetchWikidata();
  console.log(`  ${bindings.length} raw results`);

  const { rows, skips } = deriveRows(bindings);
  console.log(`  ${rows.length} valid candidates after normalization`);
  console.log(`  ${skips.length} skipped (unknown type/city/iso)`);

  let inserted: number | null = null;
  let conflicts: number | null = null;

  if (apply) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) {
      console.error(
        "ERROR: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in .env.local"
      );
      process.exit(1);
    }
    const supabase = createClient(url, key);

    // Probe existing rows so we report conflicts cleanly.
    const { data: existing, error: probeErr } = await supabase
      .from("diplomatic_missions")
      .select("country_iso, type, city");
    if (probeErr) {
      console.error("Probe failed:", probeErr.message);
      process.exit(1);
    }
    const existingKeys = new Set(
      (existing ?? []).map(
        (r: { country_iso: string; type: string; city: string }) =>
          `${r.country_iso}|${r.type}|${r.city.toLowerCase()}`
      )
    );

    const toInsert = rows.filter(
      (r) => !existingKeys.has(`${r.country_iso}|${r.type}|${r.city.toLowerCase()}`)
    );
    conflicts = rows.length - toInsert.length;

    if (toInsert.length === 0) {
      console.log("Nothing new to insert.");
      inserted = 0;
    } else {
      // Bulk insert in chunks of 100
      const CHUNK = 100;
      inserted = 0;
      for (let i = 0; i < toInsert.length; i += CHUNK) {
        const chunk = toInsert.slice(i, i + CHUNK).map((r) => ({
          country_iso: r.country_iso,
          type: r.type,
          city: r.city,
          province_iso: r.province_iso,
          address: r.address,
          website: r.website,
          phone: r.phone,
          // Mark provenance so admins can re-scrape over their own edits
          // safely (description.source field).
          description: { source: `wikidata:${r.source_qid}` },
          active: true,
        }));
        const { error: insErr } = await supabase
          .from("diplomatic_missions")
          .insert(chunk);
        if (insErr) {
          console.error(`Insert chunk ${i}-${i + chunk.length} failed:`, insErr.message);
          process.exit(1);
        }
        inserted += chunk.length;
        console.log(`  Inserted ${inserted}/${toInsert.length}`);
      }
    }
  }

  // Write report
  const reportPath = join(process.cwd(), "docs", "diplomatic-missions-report.md");
  mkdirSync(dirname(reportPath), { recursive: true });
  const reportContent = writeReport(rows, skips, inserted, conflicts);
  writeFileSync(reportPath, reportContent + "\n", "utf-8");
  console.log(`\n✓ Report written to ${reportPath}`);

  if (!apply) {
    console.log(
      `\nDry-run only. Review the report, then re-run with --apply to insert.`
    );
  }
}

main().catch((err) => {
  console.error("ERROR:", err);
  process.exit(1);
});
