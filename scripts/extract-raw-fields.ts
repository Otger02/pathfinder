import { PDFDocument } from "pdf-lib";
import { readFileSync, readdirSync, writeFileSync } from "fs";
import { join } from "path";

async function main() {
  const dir = join(process.cwd(), "public/forms");
  const out_path = join(process.cwd(), "docs/forms/raw-fields.txt");

  const files = readdirSync(dir).filter((f) => f.endsWith(".pdf")).sort();
  let out = "";

  for (const file of files) {
    const bytes = readFileSync(join(dir, file));
    const pdf = await PDFDocument.load(bytes);
    const form = pdf.getForm();
    out += "\n=== " + file + " ===\n";
    form.getFields().forEach((f) => {
      out += f.constructor.name.replace("PDF", "").replace("Field", "").padEnd(12) + f.getName() + "\n";
    });
  }

  writeFileSync(out_path, out);
  console.log("Done. " + files.length + " forms processed.");
}

main().catch(console.error);
