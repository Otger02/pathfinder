/**
 * Inspect PDF AcroForm fields.
 *
 * Usage: npx tsx scripts/inspect-pdf-fields.ts <path-to-pdf>
 *
 * Prints all form field names, types, and current values.
 */

import { readFileSync } from "fs";
import { PDFDocument } from "pdf-lib";

async function main() {
  const pdfPath = process.argv[2];
  if (!pdfPath) {
    console.error("Usage: npx tsx scripts/inspect-pdf-fields.ts <path-to-pdf>");
    process.exit(1);
  }

  const bytes = readFileSync(pdfPath);
  const pdf = await PDFDocument.load(bytes);
  const form = pdf.getForm();
  const fields = form.getFields();

  console.log(`PDF: ${pdfPath}`);
  console.log(`Pages: ${pdf.getPageCount()}`);
  console.log(`Form fields: ${fields.length}\n`);

  if (fields.length === 0) {
    console.log("⚠ No AcroForm fields found. This PDF is not a fillable form.");
    console.log("  You will need to generate the form from scratch with pdf-lib.");
    return;
  }

  console.log("─".repeat(80));
  console.log(
    "Name".padEnd(40) +
    "Type".padEnd(20) +
    "Value"
  );
  console.log("─".repeat(80));

  for (const field of fields) {
    const name = field.getName();
    const type = field.constructor.name;

    let value = "";
    try {
      if ("getText" in field && typeof field.getText === "function") {
        value = (field as { getText: () => string }).getText() || "";
      } else if ("isChecked" in field && typeof field.isChecked === "function") {
        value = (field as { isChecked: () => boolean }).isChecked() ? "✓" : "☐";
      } else if ("getSelected" in field && typeof field.getSelected === "function") {
        const selected = (field as { getSelected: () => string[] }).getSelected();
        value = selected.join(", ");
      }
    } catch {
      value = "(unreadable)";
    }

    console.log(
      name.padEnd(40) +
      type.replace("PDF", "").padEnd(20) +
      value
    );
  }

  console.log("─".repeat(80));
  console.log(`\nTotal: ${fields.length} fields`);
}

main().catch(console.error);
