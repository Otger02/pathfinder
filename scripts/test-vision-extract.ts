/**
 * scripts/test-vision-extract.ts
 *
 * E2E test of the vision document-intake pipeline against the REAL
 * Anthropic API. Renders a synthetic "certificado de empadronamiento"
 * with node-canvas, runs it through analyzeDocumentImage(), and asserts
 * the personal-data fields come back correctly normalized.
 *
 * Costs a few cents per run (one Sonnet vision call).
 * Run: npx tsx scripts/test-vision-extract.ts
 */

import { createCanvas } from "canvas";
import { readFileSync, existsSync } from "fs";
import { join } from "path";

// ── Load .env.local (tsx doesn't forward --env-file) ─────────────
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

function renderSyntheticPadron(): string {
  const W = 1200;
  const H = 900;
  const canvas = createCanvas(W, H);
  const ctx = canvas.getContext("2d");

  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = "#1a1a1a";

  ctx.font = "bold 34px Arial";
  ctx.fillText("AJUNTAMENT DE LLEIDA", 80, 90);
  ctx.font = "bold 28px Arial";
  ctx.fillText("CERTIFICADO DE EMPADRONAMIENTO", 80, 150);

  ctx.font = "22px Arial";
  const lines = [
    "Se certifica que la persona abajo indicada figura inscrita",
    "en el Padrón Municipal de Habitantes de este municipio:",
    "",
    "Nombre: AMADOU",
    "Primer apellido: DIOP",
    "Segundo apellido: NDIAYE",
    "Fecha de nacimiento: 04/11/1995",
    "Nacionalidad: SENEGALESA",
    "Documento: Pasaporte A00529637",
    "",
    "Domicilio: CALLE ACADEMIA, 14, 2º",
    "Localidad: LLEIDA   C.P.: 25002   Provincia: LLEIDA",
    "",
    "Fecha de alta en el padrón: 12/02/2022",
    "",
    "Y para que conste, se expide el presente certificado.",
    "Lleida, a 3 de junio de 2026",
  ];
  let y = 230;
  for (const line of lines) {
    ctx.fillText(line, 80, y);
    y += 38;
  }

  return canvas.toBuffer("image/png").toString("base64");
}

function assert(cond: boolean, label: string, actual?: unknown) {
  console.log(`${cond ? "✓" : "✗"} ${label}${cond ? "" : ` (got: ${JSON.stringify(actual)})`}`);
  if (!cond) failures++;
}
let failures = 0;

async function main() {
  console.log("Rendering synthetic padrón certificate...");
  const imageBase64 = renderSyntheticPadron();
  console.log(`Image: ${Math.round(imageBase64.length / 1024)} KB base64`);

  console.log("Calling analyzeDocumentImage (real Anthropic API)...");
  const t0 = Date.now();
  const result = await analyzeDocumentImage({
    imageBase64,
    mediaType: "image/png",
    idioma: "ca",
  });
  console.log(`Done in ${((Date.now() - t0) / 1000).toFixed(1)}s\n`);

  console.log("document_type:", result.documentType);
  console.log("fields:", JSON.stringify(result.fields, null, 2));
  console.log("explanation:", result.explanation.slice(0, 200));
  console.log("deadlines:", JSON.stringify(result.deadlines));
  console.log("");

  const f = result.fields;
  assert(/empadronamiento|padró|padron/i.test(result.documentType), "document type mentions padrón", result.documentType);
  assert(f.nombre?.toUpperCase() === "AMADOU", "nombre = AMADOU", f.nombre);
  assert(f.primerApellido?.toUpperCase() === "DIOP", "primerApellido = DIOP", f.primerApellido);
  assert(f.fechaNacimiento === "1995-11-04", "fechaNacimiento normalized to ISO", f.fechaNacimiento);
  assert((f.pasaporte ?? f.numeroDocumento ?? "").includes("A00529637"), "passport number extracted", f.pasaporte ?? f.numeroDocumento);
  assert((f.localidad ?? "").toUpperCase().includes("LLEIDA"), "localidad = Lleida", f.localidad);
  assert(f.codigoPostal === "25002", "codigoPostal = 25002", f.codigoPostal);
  assert(result.explanation.length > 50, "explanation is substantive", result.explanation.length);

  console.log(`\n${failures === 0 ? "ALL PASSED" : `${failures} FAILED`}`);
  process.exit(failures === 0 ? 0 : 1);
}

main().catch((e) => {
  console.error("ERROR:", e);
  process.exit(1);
});
