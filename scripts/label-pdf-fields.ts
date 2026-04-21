/**
 * Fill each PDF field with its own name for visual identification.
 *
 * Usage: npx tsx scripts/label-pdf-fields.ts <input.pdf> <output.pdf>
 */

import { readFileSync, writeFileSync } from "fs";
import { PDFDocument } from "pdf-lib";

async function main() {
  const inputPath = process.argv[2];
  const outputPath = process.argv[3] || "labeled-output.pdf";

  if (!inputPath) {
    console.error("Usage: npx tsx scripts/label-pdf-fields.ts <input.pdf> [output.pdf]");
    process.exit(1);
  }

  const bytes = readFileSync(inputPath);
  const pdf = await PDFDocument.load(bytes);
  const form = pdf.getForm();
  const fields = form.getFields();

  let filled = 0;
  for (const field of fields) {
    const name = field.getName();
    try {
      if ("setText" in field && typeof field.setText === "function") {
        (field as { setText: (t: string) => void }).setText(name);
        filled++;
      } else if ("check" in field && typeof field.check === "function") {
        // Check all checkboxes so they're visible
        (field as { check: () => void }).check();
        filled++;
      }
    } catch {
      console.log(`Could not fill: ${name}`);
    }
  }

  const out = await pdf.save();
  writeFileSync(outputPath, out);
  console.log(`Filled ${filled}/${fields.length} fields → ${outputPath}`);
}

main().catch(console.error);
