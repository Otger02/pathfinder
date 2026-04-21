import { readFileSync, writeFileSync, mkdirSync } from "fs";
import { join } from "path";
import { PDFDocument } from "pdf-lib";

async function main() {
  const inputPath = join(process.cwd(), "public", "forms", "EX-10.pdf");
  const outputDir = join(process.cwd(), "output", "debug-checkboxes");

  mkdirSync(outputDir, { recursive: true });

  const pdfBytes = readFileSync(inputPath);
  const pdfDoc = await PDFDocument.load(pdfBytes);
  const form = pdfDoc.getForm();

  const fields = form.getFields();

  const checkboxes = fields.filter(
    (f) => f.constructor.name === "PDFCheckBox"
  );

  console.log(`Total checkboxes: ${checkboxes.length}`);

  let index = 0;

  for (const checkbox of checkboxes) {
    index++;

    const doc = await PDFDocument.load(pdfBytes);
    const formClone = doc.getForm();

    const field = formClone.getField(checkbox.getName());

    if (field.constructor.name === "PDFCheckBox") {
      (field as any).check();
    }

    const pdfBytesOut = await doc.save();

    const filePath = join(
      outputDir,
      `checkbox_${index}_${checkbox.getName().replace(/\s/g, "_")}.pdf`
    );

    writeFileSync(filePath, pdfBytesOut);

    console.log(`Generated: ${filePath}`);
  }

  console.log("\nDONE. Mira la carpeta output/debug-checkboxes");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});