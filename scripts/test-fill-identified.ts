import { PDFDocument } from "pdf-lib";
import { readFileSync, writeFileSync, mkdirSync } from "fs";
import { join } from "path";
import { getFieldMap } from "../lib/pdf/field-maps";

async function main() {
  mkdirSync("output", { recursive: true });

  const fieldMap = await getFieldMap("EX-10");
  if (!fieldMap) throw new Error("No field map for EX-10");

  const bytes = readFileSync("public/forms/EX-10.pdf");
  const pdf = await PDFDocument.load(bytes);
  const form = pdf.getForm();

  // Fill every text field with its own name
  for (const [pdfField] of Object.entries(fieldMap.textFields)) {
    try {
      form.getTextField(pdfField).setText(pdfField);
    } catch {}
  }

  // Check every checkbox
  form.getFields().forEach(f => {
    if (f.constructor.name === "PDFCheckBox") {
      try { (f as any).check(); } catch {}
    }
  });

  writeFileSync("output/EX-10-identified.pdf", await pdf.save());
  console.log("Done: output/EX-10-identified.pdf");
}

main().catch(console.error);
