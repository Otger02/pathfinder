import { readFileSync } from "fs";
import { join } from "path";
import { PDFDocument } from "pdf-lib";

async function main() {
  const pdfPath = join(process.cwd(), "public", "forms", "EX-10.pdf");
  const pdfBytes = readFileSync(pdfPath);
  const pdfDoc = await PDFDocument.load(pdfBytes);
  const form = pdfDoc.getForm();

  const fields = form.getFields();

  console.log(`\nPDF: ${pdfPath}`);
  console.log(`Total fields: ${fields.length}\n`);

  const rows = fields.map((field, index) => {
    const name = field.getName();
    const type = field.constructor.name;

    return {
      index: index + 1,
      name,
      type,
    };
  });

  for (const row of rows) {
    console.log(
      `${String(row.index).padStart(3, "0")} | ${row.type.padEnd(20)} | ${row.name}`
    );
  }

  console.log("\n--- JSON names only ---\n");
  console.log(JSON.stringify(rows, null, 2));
}

main().catch((err) => {
  console.error("Error inspecting EX-10 fields:", err);
  process.exit(1);
});