import { PDFDocument } from "pdf-lib";
import { readFileSync, writeFileSync, mkdirSync } from "fs";

async function main() {
  mkdirSync("output", { recursive: true });

  const forms = [
    "EX-00", "EX-01", "EX-02", "EX-03", "EX-04",
    "EX-06", "EX-07", "EX-09", "EX-11",
    "EX-19", "EX-24", "EX-25"
  ];

  for (const id of forms) {
    const bytes = readFileSync(`public/forms/${id}.pdf`);
    const pdf = await PDFDocument.load(bytes);
    const form = pdf.getForm();

    form.getFields().forEach(f => {
      const name = f.getName();
      const type = f.constructor.name;
      try {
        if (type === "PDFTextField") {
          (f as any).setText(name.slice(0, 20));
        } else if (type === "PDFCheckBox") {
          (f as any).check();
        }
      } catch {}
    });

    writeFileSync(`output/${id}-identified.pdf`, await pdf.save());
    console.log(`Done: ${id}`);
  }
}

main().catch(console.error);
