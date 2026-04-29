import { PDFDocument, PDFTextField, PDFCheckBox } from "pdf-lib";
import { readFileSync, writeFileSync } from "fs";

async function main() {
  const bytes = readFileSync("output/EX-10-filled.pdf");
  const pdf = await PDFDocument.load(bytes);
  const form = pdf.getForm();

  // Force appearance streams on all checkboxes so flatten() renders them visibly
  const fields = form.getFields();
  for (const field of fields) {
    try {
      if (field instanceof PDFCheckBox) {
        field.updateAppearances();
      } else if (field instanceof PDFTextField) {
        field.updateAppearances();
      }
    } catch {}
  }

  try {
    form.flatten();
  } catch (e) {
    console.log("flatten() error (non-fatal):", (e as any).message);
  }

  writeFileSync("output/EX-10-flattened.pdf", await pdf.save());
  console.log("Done: output/EX-10-flattened.pdf");
}

main().catch(console.error);
