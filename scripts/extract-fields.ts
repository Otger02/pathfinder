import { PDFDocument } from 'pdf-lib';
import { readFileSync, writeFileSync } from 'fs';

async function main() {
  const bytes = readFileSync('public/forms/EX-10.pdf');
  const pdf = await PDFDocument.load(bytes);
  const form = pdf.getForm();
  const lines: string[] = [];
  form.getFields().forEach(f => {
    const type = f.constructor.name.replace('PDF','').replace('Field','');
    lines.push(`${type.padEnd(12)} ${f.getName()}`);
  });
  writeFileSync('ex10-fields.txt', lines.join('\n'));
  console.log(`Wrote ${lines.length} fields to ex10-fields.txt`);
}
main();
