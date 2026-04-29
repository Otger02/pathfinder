import { PDFDocument } from "pdf-lib";
import { readFileSync, writeFileSync, mkdirSync } from "fs";
import { getFieldMap } from "../lib/pdf/field-maps";

async function main() {
  mkdirSync("output", { recursive: true });

  const forms = [
    "EX-00", "EX-01", "EX-02", "EX-03", "EX-04",
    "EX-06", "EX-07", "EX-09", "EX-10", "EX-11",
    "EX-19", "EX-24", "EX-25",
  ];

  for (const id of forms) {
    const fieldMap = await getFieldMap(id);
    if (!fieldMap) {
      console.log(`SKIP: ${id} — no field map`);
      continue;
    }

    const bytes = readFileSync(`public/forms/${id}.pdf`);
    const pdf = await PDFDocument.load(bytes);
    const form = pdf.getForm();

    // Fill each mapped text field with its own PDF field name
    for (const pdfField of Object.keys(fieldMap.textFields)) {
      try {
        form.getTextField(pdfField).setText(pdfField.slice(0, 30));
      } catch {}
    }

    // Check all checkboxes
    form.getFields().forEach(f => {
      if (f.constructor.name === "PDFCheckBox") {
        try { (f as any).check(); } catch {}
      }
    });

    writeFileSync(`output/${id}-identified.pdf`, await pdf.save());
    console.log(`Done: ${id}`);
  }
}

main().catch(console.error);
