/**
 * Extract field positions from PDF to determine field ordering and purpose.
 *
 * Usage: npx tsx scripts/inspect-pdf-field-positions.ts <path-to-pdf>
 */

import { readFileSync } from "fs";
import { PDFDocument } from "pdf-lib";

async function main() {
  const pdfPath = process.argv[2];
  if (!pdfPath) {
    console.error("Usage: npx tsx scripts/inspect-pdf-field-positions.ts <path-to-pdf>");
    process.exit(1);
  }

  const bytes = readFileSync(pdfPath);
  const pdf = await PDFDocument.load(bytes);
  const form = pdf.getForm();
  const fields = form.getFields();

  const pageCount = pdf.getPageCount();
  console.log(`PDF: ${pdfPath} — ${pageCount} pages, ${fields.length} fields\n`);

  const fieldData: Array<{
    name: string;
    type: string;
    page: number;
    x: number;
    y: number;
    width: number;
    height: number;
  }> = [];

  for (const field of fields) {
    const widgets = field.acroField.getWidgets();
    for (const widget of widgets) {
      const rect = widget.getRectangle();
      const pageRef = widget.P();
      let pageNum = -1;
      if (pageRef) {
        for (let i = 0; i < pageCount; i++) {
          const page = pdf.getPage(i);
          if (page.ref === pageRef) {
            pageNum = i + 1;
            break;
          }
        }
      }
      fieldData.push({
        name: field.getName(),
        type: field.constructor.name.replace("PDF", ""),
        page: pageNum,
        x: Math.round(rect.x),
        y: Math.round(rect.y),
        width: Math.round(rect.width),
        height: Math.round(rect.height),
      });
    }
  }

  // Sort by page, then by y (descending = top to bottom), then by x
  fieldData.sort((a, b) => {
    if (a.page !== b.page) return a.page - b.page;
    if (Math.abs(a.y - b.y) > 10) return b.y - a.y; // top to bottom
    return a.x - b.x; // left to right
  });

  let currentPage = -1;
  for (const f of fieldData) {
    if (f.page !== currentPage) {
      currentPage = f.page;
      console.log(`\n${"═".repeat(80)}`);
      console.log(`PAGE ${currentPage}`);
      console.log(`${"═".repeat(80)}`);
      console.log(
        "Name".padEnd(45) +
        "Type".padEnd(12) +
        "X".padStart(5) +
        "Y".padStart(6) +
        "W".padStart(5) +
        "H".padStart(5)
      );
      console.log("─".repeat(80));
    }
    console.log(
      f.name.padEnd(45) +
      f.type.padEnd(12) +
      String(f.x).padStart(5) +
      String(f.y).padStart(6) +
      String(f.width).padStart(5) +
      String(f.height).padStart(5)
    );
  }
}

main().catch(console.error);
