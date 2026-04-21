import { PDFDocument } from 'pdf-lib';
import { readFileSync, readdirSync, writeFileSync } from 'fs';
import { join } from 'path';

async function main() {
  const formsDir = join(process.cwd(), 'public', 'forms');
  const files = readdirSync(formsDir).filter(f => f.endsWith('.pdf') && !f.includes('labeled')).sort();
  const lines: string[] = [];

  for (const file of files) {
    const bytes = readFileSync(join(formsDir, file));
    const pdf = await PDFDocument.load(bytes);
    const form = pdf.getForm();
    lines.push(`\n=== ${file} ===`);
    form.getFields().forEach(f => {
      const type = f.constructor.name.replace('PDF','').replace('Field','');
      lines.push(`${type.padEnd(12)} ${f.getName()}`);
    });
  }
  writeFileSync('all-form-fields.txt', lines.join('\n'));
  console.log(`Wrote ${lines.length} lines for ${files.length} forms`);
}
main();
