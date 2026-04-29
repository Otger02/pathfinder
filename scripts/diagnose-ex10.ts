import { PDFDocument, PDFTextField, PDFCheckBox, PDFRadioGroup, PDFRef } from "pdf-lib";
import { readFileSync, writeFileSync } from "fs";

async function main() {
  const filledBytes = readFileSync("output/EX-10-filled.pdf");
  const pdf = await PDFDocument.load(filledBytes);
  const form = pdf.getForm();
  const pages = pdf.getPages();

  // Build a ref→pageIndex map from page annotations
  const refToPage: Map<string, number> = new Map();
  for (let i = 0; i < pages.length; i++) {
    try {
      const annotsRef = pages[i].node.get(pages[i].node.context.obj("Annots") as any);
      const annots = pages[i].node.Annots();
      if (!annots) continue;
      const arr = annots.asArray();
      for (const item of arr) {
        refToPage.set(item.toString(), i + 1);
      }
    } catch {}
  }

  const fields = form.getFields();

  // ── 1. FULL DUMP ──────────────────────────────────────────
  const lines: string[] = [];
  lines.push("=== EX-10 FULL FIELD DUMP ===");
  lines.push(`Total fields: ${fields.length}`);
  lines.push("");
  lines.push(["NAME","TYPE","VALUE","PAGE","X","Y","W","H"].join("\t"));

  for (const field of fields) {
    const name = field.getName();
    const type = field.constructor.name.replace("PDF", "");
    let value = "";
    let page = "?", x = "?", y = "?", w = "?", h = "?";

    try {
      if (field instanceof PDFTextField) value = field.getText() ?? "";
      else if (field instanceof PDFCheckBox) value = field.isChecked() ? "CHECKED" : "unchecked";
      else if (field instanceof PDFRadioGroup) value = field.getSelected() ?? "";
    } catch {}

    try {
      const widgets = (field as any).acroField.getWidgets();
      if (widgets.length > 0) {
        const widget = widgets[0];
        const rect = widget.getRectangle();
        x = rect.x.toFixed(1); y = rect.y.toFixed(1);
        w = rect.width.toFixed(1); h = rect.height.toFixed(1);
        const ref: PDFRef = widget.ref;
        const pg = refToPage.get(ref.toString());
        if (pg) page = String(pg);
      }
    } catch {}

    lines.push([name, type, value, page, x, y, w, h].join("\t"));
  }

  // ── 2. CHECKBOX-ONLY TABLE WITH SEMANTIC LABELS ───────────
  // Based on coordinates and known form structure:
  // Page 1 Y range: ~50–680 (bottom=50, top=680+)
  // Page 2 Y range: ~50–770 (empleador + formació)
  // Page 3 Y range: ~50–770 (tipo autorización list)

  // Semantic labels derived from EX-10 PDF structure
  // Labels match the verified mapping in lib/forms/ex-10.ts
  const semanticLabels: Record<string, string> = {
    // SEXE (persona estrangera)
    "Casilla de verificación96":  "Sexo: H (hombre)",
    "Casilla de verificación97":  "Sexo: M (mujer)",
    "Casilla de verificación98":  "Sexo: X (indeterminado)",
    // TIPO DOCUMENTO
    "Casilla de verificación99":  "TipoDoc: pasaporte",
    "Casilla de verificación100": "TipoDoc: titulo_viaje",
    "Casilla de verificación101": "TipoDoc: cedula",
    "Casilla de verificación102": "TipoDoc: documento_identidad",
    "Casilla de verificación103": "TipoDoc: nie",
    // SEXE FAMILIAR
    "Casilla de verificación104": "Familiar Sexo: H (hombre)",
    "Casilla de verificación105": "Familiar Sexo: M (mujer)",
    "Casilla de verificación106": "Familiar Sexo: X (indeterminado)",
    // ESTAT CIVIL FAMILIAR
    "Casilla de verificación107": "Familiar EstadoCivil: soltero",
    "Casilla de verificación108": "Familiar EstadoCivil: casado",
    "Casilla de verificación109": "Familiar EstadoCivil: viudo",
    "Casilla de verificación110": "Familiar EstadoCivil: separado",
    "Casilla de verificación111": "Familiar EstadoCivil: divorciado",
    // cb112 = unidentified (not in any constant)
    "Casilla de verificación112": "UNIDENTIFIED (not mapped)",
    // FORMACIÓ TIPUS
    "Casilla de verificación113": "FormacioTipus: educacio_secundaria",
    "Casilla de verificación114": "FormacioTipus: certificat_professional",
    "Casilla de verificación115": "FormacioTipus: ensenyances_obligatories_adults",
    // FORMACIÓ MODALITAT
    "Casilla de verificación116": "FormacioModalitat: presencial",
    "Casilla de verificación117": "FormacioModalitat: a_distancia",
    "Casilla de verificación118": "FormacioModalitat: mixta",
    // TIPO SOLICITUD BLOQUE HEADER (no seleccionable)
    "Casilla de verificación119": "[HEADER] Tipo solicitud bloque",
    // TIPO SOLICITUD
    "Casilla de verificación120": "TipoAutorizacion: residencia_inicial",
    "Casilla de verificación121": "TipoAutorizacion: prorroga",
    "Casilla de verificación122": "TipoAutorizacion: provisional",
    // CIRCUMSTÀNCIA BLOQUE HEADER (no seleccionable)
    "Casilla de verificación123": "[HEADER] Circunstancia/motivo bloque",
    // CIRCUMSTÀNCIES / MOTIUS
    "Casilla de verificación124": "Circunstancia: arraigo_segunda_oportunidad",
    "Casilla de verificación125": "Circunstancia: arraigo_sociolaboral",
    "Casilla de verificación126": "Circunstancia: arraigo_social",
    "Casilla de verificación127": "Circunstancia: arraigo_socioformativo",
    "Casilla de verificación128": "Circunstancia: arraigo_familiar",
    "Casilla de verificación129": "Circunstancia: razones_humanitarias_victima_determinados_delitos",
    "Casilla de verificación130": "Circunstancia: razones_humanitarias_enfermedad_sobrevenida_grave",
    "Casilla de verificación131": "Circunstancia: razones_humanitarias_progenitor_menor_enfermedad_sobrevenida_grave",
    "Casilla de verificación132": "Circunstancia: razones_humanitarias_peligro_seguridad_familia",
    "Casilla de verificación133": "Circunstancia: colaboracion_autoridades_ajena_redes_organizadas",
    "Casilla de verificación134": "Circunstancia: interes_publico_o_seguridad_nacional",
    "Casilla de verificación135": "Circunstancia: colaboracion_autoridad_laboral_judicial_trabajo_irregular",
    "Casilla de verificación136": "Circunstancia: mujer_victima_violencia_genero",
    "Casilla de verificación137": "Circunstancia: hijo_menor_discapacitado_tutelado_victima_violencia_genero",
    "Casilla de verificación138": "Circunstancia: padre_madre_victima_violencia_genero",
    "Casilla de verificación139": "Circunstancia: victima_violencia_sexual",
    "Casilla de verificación140": "Circunstancia: hijo_menor_discapacitado_tutelado_victima_violencia_sexual",
    "Casilla de verificación141": "Circunstancia: padre_madre_victima_violencia_sexual",
    "Casilla de verificación142": "Circunstancia: adulto_responsable_victima_violencia_sexual_menor_edad",
    "Casilla de verificación143": "Circunstancia: colaboracion_contra_redes_organizadas_victima_perjudicado_testigo",
    "Casilla de verificación144": "Circunstancia: victima_trata_colaboracion_investigacion",
    "Casilla de verificación145": "Circunstancia: victima_trata_situacion_personal",
    "Casilla de verificación146": "Circunstancia: hijo_menor_discapacitado_tutelado_padre_madre_victima_trata",
    "Casilla de verificación147": "Circunstancia: circunstancias_excepcionales_no_previstas_rd_1155_2024",
    "Casilla de verificación148": "Circunstancia: circunstancias_excepcionales_dana_2024_prorroga",
    // CONSENTIMENT DEHú
    "Casilla de verificación261": "Consentimiento DEHú",
  };

  lines.push("");
  lines.push("=== CHECKBOXES ONLY ===");
  lines.push(["NAME","VALUE","PAGE","X","Y","LABEL"].join("\t"));

  for (const field of fields) {
    if (!(field instanceof PDFCheckBox) && !(field instanceof PDFRadioGroup)) continue;
    const name = field.getName();
    let value = "";
    let page = "?", x = "?", y = "?";

    try {
      if (field instanceof PDFCheckBox) value = field.isChecked() ? "CHECKED" : "unchecked";
      else if (field instanceof PDFRadioGroup) value = field.getSelected() ?? "";
    } catch {}

    try {
      const widgets = (field as any).acroField.getWidgets();
      if (widgets.length > 0) {
        const widget = widgets[0];
        const rect = widget.getRectangle();
        x = rect.x.toFixed(1); y = rect.y.toFixed(1);
        const ref: PDFRef = widget.ref;
        const pg = refToPage.get(ref.toString());
        if (pg) page = String(pg);
      }
    } catch {}

    const label = semanticLabels[name] ?? "UNIDENTIFIED";
    lines.push([name, value, page, x, y, label].join("\t"));
  }

  const out = lines.join("\n");
  writeFileSync("output/EX-10-field-dump.txt", out, "utf8");
  console.log(out);
}

main().catch(console.error);
