/**
 * convert-documents.ts
 *
 * Scans knowledge/sources/ recursively for .pdf and .docx files,
 * converts them to .txt using pdf-parse and mammoth respectively.
 * Skips files that already have a .txt counterpart (unless --force).
 *
 * Run:  npx tsx scripts/convert-documents.ts [--force]
 * Deps: pdf-parse, mammoth
 */

import { readFileSync, writeFileSync, readdirSync, statSync, existsSync } from "fs";
import { join, extname, basename } from "path";

// ── config ────────────────────────────────────────────────────────────────

const SOURCES_ROOT = join(process.cwd(), "knowledge", "sources");

/** Files to exclude from conversion (basename patterns). */
const EXCLUDE_PATTERNS = [
  /^Dialnet-TDAH/i,
  /^BOE-A-2011-7703-consolidado/i,
];

const forceMode = process.argv.includes("--force");

// ── helpers ───────────────────────────────────────────────────────────────

function shouldExclude(filename: string): boolean {
  return EXCLUDE_PATTERNS.some((re) => re.test(filename));
}

function walkDir(dir: string, exts: string[]): string[] {
  const results: string[] = [];
  if (!existsSync(dir)) return results;

  const entries = readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...walkDir(fullPath, exts));
    } else if (exts.includes(extname(entry.name).toLowerCase())) {
      results.push(fullPath);
    }
  }
  return results;
}

function txtPathFor(filePath: string): string {
  const ext = extname(filePath);
  return filePath.slice(0, -ext.length) + ".txt";
}

// ── converters ────────────────────────────────────────────────────────────

async function convertPdf(filePath: string): Promise<string> {
  const { PDFParse } = await import("pdf-parse");
  const buffer = readFileSync(filePath);
  const uint8 = new Uint8Array(buffer);
  const pdf = new PDFParse(uint8);
  await pdf.load();
  const result = await pdf.getText();
  return result.text;
}

async function convertDocx(filePath: string): Promise<string> {
  const mammoth = await import("mammoth");
  const result = await mammoth.extractRawText({ path: filePath });
  return result.value;
}

// ── main ──────────────────────────────────────────────────────────────────

async function main(): Promise<void> {
  console.log("\n=== Document Converter (PDF/DOCX → TXT) ===\n");
  console.log(`Source root: ${SOURCES_ROOT}`);
  console.log(`Force mode: ${forceMode}\n`);

  const files = walkDir(SOURCES_ROOT, [".pdf", ".docx"]);
  console.log(`Found ${files.length} PDF/DOCX files\n`);

  let converted = 0;
  let skipped = 0;
  let excluded = 0;
  let errors = 0;

  for (const filePath of files) {
    const filename = basename(filePath);

    if (shouldExclude(filename)) {
      console.log(`  ✗ EXCLUDED: ${filename}`);
      excluded++;
      continue;
    }

    const txtPath = txtPathFor(filePath);
    if (existsSync(txtPath) && !forceMode) {
      skipped++;
      continue;
    }

    const ext = extname(filePath).toLowerCase();

    try {
      process.stdout.write(`  Converting: ${filename}...`);

      let text: string;
      if (ext === ".pdf") {
        text = await convertPdf(filePath);
      } else {
        text = await convertDocx(filePath);
      }

      // Basic cleaning
      text = text
        .replace(/\r\n/g, "\n")
        .replace(/\r/g, "\n")
        .replace(/\t/g, " ")
        .replace(/ {2,}/g, " ")
        .replace(/\n{3,}/g, "\n\n")
        .trim();

      writeFileSync(txtPath, text, "utf-8");

      const sizeKb = (Buffer.byteLength(text, "utf-8") / 1024).toFixed(1);
      console.log(` ✓ (${sizeKb} KB, ${text.length} chars)`);
      converted++;
    } catch (err: any) {
      console.log(` ✗ ERROR: ${err.message?.slice(0, 100)}`);
      errors++;
    }
  }

  // Summary
  console.log("\n" + "═".repeat(50));
  console.log(`  Converted:  ${converted}`);
  console.log(`  Skipped:    ${skipped} (txt already exists)`);
  console.log(`  Excluded:   ${excluded}`);
  console.log(`  Errors:     ${errors}`);
  console.log("═".repeat(50));
}

main().catch((err) => {
  console.error("\nFatal error:", err);
  process.exit(1);
});
