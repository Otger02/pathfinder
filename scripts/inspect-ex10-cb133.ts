/**
 * Extracts text content near cb133-148+261 from the blank EX-10 PDF.
 * Reads: widget tooltip (TU), alternate name (TM), and raw page content
 * around the checkbox coordinates.
 */
import { PDFDocument, PDFCheckBox } from "pdf-lib";
import { readFileSync } from "fs";

async function main() {
  const bytes = readFileSync("public/forms/EX-10.pdf");
  const pdf = await PDFDocument.load(bytes);
  const form = pdf.getForm();
  const pages = pdf.getPages();

  // Build ref→pageIndex
  const refToPage = new Map<string, number>();
  for (let i = 0; i < pages.length; i++) {
    try {
      const annots = pages[i].node.Annots();
      if (!annots) continue;
      for (const item of annots.asArray()) {
        refToPage.set(item.toString(), i + 1);
      }
    } catch {}
  }

  const TARGET = new Set([
    "Casilla de verificación133","Casilla de verificación134",
    "Casilla de verificación135","Casilla de verificación136",
    "Casilla de verificación137","Casilla de verificación138",
    "Casilla de verificación139","Casilla de verificación140",
    "Casilla de verificación141","Casilla de verificación142",
    "Casilla de verificación143","Casilla de verificación144",
    "Casilla de verificación145","Casilla de verificación146",
    "Casilla de verificación147","Casilla de verificación148",
    "Casilla de verificación261",
  ]);

  console.log("=== EX-10 cb133-148+261 — Widget metadata ===\n");
  console.log(["NAME","PAGE","X","Y","TU (tooltip)","TM (alt name)","DA"].join("\t"));

  for (const field of form.getFields()) {
    const name = field.getName();
    if (!TARGET.has(name)) continue;

    let page = "?", x = "?", y = "?";
    let tu = "", tm = "", da = "";

    try {
      const widgets = (field as any).acroField.getWidgets();
      if (widgets.length > 0) {
        const w = widgets[0];
        const rect = w.getRectangle();
        x = rect.x.toFixed(1); y = rect.y.toFixed(1);
        const pg = refToPage.get(w.ref.toString());
        if (pg) page = String(pg);

        // Try reading annotation dict fields
        const dict = w.dict;
        try { tu = dict.get(dict.context.obj("TU"))?.toString() ?? ""; } catch {}
        try { tm = dict.get(dict.context.obj("TM"))?.toString() ?? ""; } catch {}
        try { da = dict.get(dict.context.obj("DA"))?.toString() ?? ""; } catch {}

        // Also try the field dict (parent)
        if (!tu) {
          try {
            const parent = (field as any).acroField.dict;
            tu = parent.get(parent.context.obj("TU"))?.toString() ?? "";
          } catch {}
        }
      }
    } catch {}

    console.log([name, page, x, y, tu, tm, da].join("\t"));
  }

  // Also dump all checkbox widgets for ALL fields near Y 300-545
  // (where cb133-148 live) with ALL dict keys
  console.log("\n=== Full dict dump for cb133-148 ===\n");
  for (const field of form.getFields()) {
    const name = field.getName();
    if (!TARGET.has(name)) continue;
    if (name === "Casilla de verificación261") continue;

    try {
      const widgets = (field as any).acroField.getWidgets();
      if (widgets.length === 0) continue;
      const w = widgets[0];
      const dict = w.dict;
      const keys = dict.keys().map((k: any) => k.toString());
      console.log(`${name}: keys = [${keys.join(", ")}]`);
      // Print each key value
      for (const k of keys) {
        try {
          const val = dict.get(dict.context.obj(k));
          console.log(`  ${k}: ${val?.toString()?.slice(0, 80)}`);
        } catch {}
      }
    } catch {}
  }
}

main().catch(console.error);
