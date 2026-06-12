/**
 * scripts/test-vision-specimens.ts
 *
 * E2E regression for the vision intake using the shipped test specimens:
 *   - especimen-passaport.png through the IMAGE path
 *   - especimen-contracte.pdf through the PDF (document-block) path
 *
 * Asserts cross-document consistency (same passport number/person) and
 * that the contract yields the empleador_* fields arraigo sociolaboral
 * needs. Real Anthropic calls (~2 Sonnet vision requests per run).
 *
 * Run: npx tsx scripts/test-vision-specimens.ts
 * (Regenerate inputs first if missing: npx tsx scripts/generate-test-specimens.ts)
 */

import { readFileSync, existsSync } from "fs";
import { join } from "path";

// ── Load .env.local ────────────────────────────────────────────────
{
  const envPath = join(process.cwd(), ".env.local");
  if (existsSync(envPath)) {
    const raw = readFileSync(envPath, "utf-8");
    for (const line of raw.split(/\r?\n/)) {
      const m = line.match(/^\s*([A-Z_][A-Z0-9_]*)\s*=\s*(.*?)\s*$/);
      if (!m) continue;
      let val = m[2];
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      if (!process.env[m[1]]) process.env[m[1]] = val;
    }
  }
}

import { analyzeDocumentImage } from "../lib/vision/analyze";

let failures = 0;
function assert(cond: boolean, label: string, actual?: unknown) {
  console.log(`${cond ? "✓" : "✗"} ${label}${cond ? "" : ` (got: ${JSON.stringify(actual)})`}`);
  if (!cond) failures++;
}

async function main() {
  const pngPath = join(process.cwd(), "public", "especimen-passaport.png");
  const pdfPath = join(process.cwd(), "public", "especimen-contracte.pdf");

  // ── 1. Passport via image path ──────────────────────────────────
  console.log("── Passport (image path) ──");
  const passport = await analyzeDocumentImage({
    imageBase64: readFileSync(pngPath).toString("base64"),
    mediaType: "image/png",
    idioma: "ca",
  });
  console.log("fields:", JSON.stringify(passport.fields));
  const pf = passport.fields;
  assert((pf.numeroDocumento ?? "").includes("ZX9842215"), "passport number", pf.numeroDocumento);
  assert((pf.nombre ?? "").toUpperCase() === "AMINA", "nombre", pf.nombre);
  assert((pf.primerApellido ?? "").toUpperCase().includes("KHAYAT"), "apellido", pf.primerApellido);
  assert(pf.fechaNacimiento === "1993-05-14", "fecha ISO", pf.fechaNacimiento);

  // ── 2. Contract via PDF (document-block) path ───────────────────
  console.log("\n── Contract (PDF path) ──");
  const contract = await analyzeDocumentImage({
    imageBase64: readFileSync(pdfPath).toString("base64"),
    mediaType: "application/pdf",
    idioma: "ca",
  });
  console.log("fields:", JSON.stringify(contract.fields));
  const cf = contract.fields;
  assert((cf.empleador_nombre ?? "").toUpperCase().includes("CAL JORDI"), "empleador_nombre", cf.empleador_nombre);
  assert((cf.empleador_nifNie ?? "") === "B25876543", "empleador_nifNie", cf.empleador_nifNie);
  assert((cf.numeroDocumento ?? "").includes("ZX9842215"), "consistency: same passport number", cf.numeroDocumento);
  assert((cf.domicilio ?? "").toLowerCase().includes("acad"), "personal address from contract", cf.domicilio);
  assert((cf.telefono ?? "").replace(/\s/g, "").includes("632775889"), "phone", cf.telefono);
  assert((cf.nombrePadre ?? "").toUpperCase().includes("HASSAN"), "father", cf.nombrePadre);
  assert(contract.explanation.length > 50, "explanation substantive", contract.explanation.length);

  console.log(`\n${failures === 0 ? "ALL PASSED" : `${failures} FAILED`}`);
  process.exit(failures === 0 ? 0 : 1);
}

main().catch((e) => { console.error("ERROR:", e); process.exit(1); });
