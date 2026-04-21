import { PDFDocument } from 'pdf-lib';
import { readFileSync } from 'fs';

async function main() {
  const pdf = await PDFDocument.load(readFileSync('public/forms/EX-10.pdf'));
  const form = pdf.getForm();
  const fields = form.getFields();
  const pages = pdf.getPages();

  for (const f of fields) {
    const name = f.getName();
    if (!name.startsWith('Casilla')) continue;
    const widgets = (f as any).acroField.getWidgets();
    for (const w of widgets) {
      const pageRef = (w as any).P();
      let pageIdx = -1;
      if (pageRef) {
        pageIdx = pages.findIndex(p => (p as any).ref === pageRef);
      }
      const rect = w.getRectangle();
      console.log(`${name.padEnd(45)} Page ${pageIdx+1}  X=${Math.round(rect.x)}  Y=${Math.round(rect.y)}`);
    }
  }
}
main();
