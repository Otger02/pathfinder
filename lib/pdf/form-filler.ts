/**
 * form-filler.ts
 *
 * Fills official EX form PDFs with collected personal data.
 * Loads the AcroForm template, maps PersonalData fields to PDF fields,
 * and returns the filled PDF as Uint8Array.
 */

import { PDFDocument, PDFForm } from "pdf-lib";
import { readFileSync } from "fs";
import { join } from "path";
import type { ExFormId } from "@/lib/form-config";
import type { PersonalData } from "@/lib/types/personal-data";
import { getFieldMap } from "./field-maps";
import {
  EX_10_TIPO_SOLICITUD_HEADER_CHECKBOX,
  EX_10_TIPO_AUTORIZACION_HEADER_CHECKBOX,
  EX_10_TIPO_SOLICITUD_CHECKBOXES,
  EX_10_TIPO_DOC_CHECKBOXES,
  EX_10_CONSENTIMIENTO_CHECKBOX,
  resolveCircunstanciaCheckbox,
  resolveTipoSolicitudCheckbox,
} from "@/lib/forms/ex-10";

/**
 * EX-10-specific checkbox logic.
 *
 * The EX-10 PDF has 3 checkbox features that the generic FieldMap loop can't
 * handle on its own:
 *  1. The TIPO_SOLICITUD section has a HEADER checkbox (119) that must be
 *     marked alongside the chosen sub-option (120 / 121 / 122).
 *  2. The TIPO_AUTORIZACION section also has a HEADER (123) that pairs with
 *     the chosen circunstancia (124-148), with slug aliasing for generic
 *     form-config slugs (e.g. "victima_violencia_genere" → "vg_mujer_extranjera").
 *  3. Reasonable defaults: residencia_inicial as tipo_solicitud,
 *     pasaporte as tipo_doc, consentimiento Dehú checked — all unless the
 *     personalData / authSlug specifies otherwise.
 */
function fillEx10Checkboxes(
  form: PDFForm,
  personalData: Partial<PersonalData>,
  authSlug?: string
): void {
  const safeCheck = (fieldName: string) => {
    if (!fieldName) return;
    try {
      form.getCheckBox(fieldName).check();
    } catch {
      // field may not exist in this PDF version
    }
  };

  // 1. TIPO_SOLICITUD: header + default residencia_inicial
  const tipoSolicitud =
    (personalData.tipoSolicitud as keyof typeof EX_10_TIPO_SOLICITUD_CHECKBOXES) ??
    "residencia_inicial";
  safeCheck(EX_10_TIPO_SOLICITUD_HEADER_CHECKBOX);
  safeCheck(resolveTipoSolicitudCheckbox(tipoSolicitud));

  // 2. TIPO_AUTORIZACION: header + circumstància via authSlug (with aliasing)
  if (authSlug) {
    const circunField = resolveCircunstanciaCheckbox(authSlug);
    if (circunField) {
      safeCheck(EX_10_TIPO_AUTORIZACION_HEADER_CHECKBOX);
      safeCheck(circunField);
    }
  }

  // 3. TIPO_DOC: default pasaporte if no document type was collected
  if (!personalData.tipoDocumento) {
    for (const [pdfField, slugValue] of Object.entries(EX_10_TIPO_DOC_CHECKBOXES)) {
      if (slugValue === "pasaporte") {
        safeCheck(pdfField);
      }
    }
  }

  // 4. CONSENTIMIENTO Dehú: marked by default unless explicitly opted out
  if (personalData.consentimientoDehu !== false) {
    safeCheck(EX_10_CONSENTIMIENTO_CHECKBOX);
  }
}

/**
 * Fill an official EX form PDF with personal data.
 *
 * @param exFormId - The EX form identifier (e.g., "EX-10")
 * @param personalData - Collected personal data from the conversation
 * @param authSlug - Optional auth slug to auto-check circunstancia checkboxes
 * @param flatten - If true, flatten the form (makes it non-editable). Default false.
 * @returns Filled PDF as Uint8Array, or null if form template/map not available
 */
export async function fillExForm(
  exFormId: ExFormId,
  personalData: Partial<PersonalData>,
  authSlug?: string,
  flatten = false
): Promise<Uint8Array | null> {
  // Load field map
  const fieldMap = await getFieldMap(exFormId);
  if (!fieldMap) return null;

  // Load PDF template
  const templatePath = join(process.cwd(), "public", "forms", `${exFormId}.pdf`);
  let templateBytes: Buffer;
  try {
    templateBytes = readFileSync(templatePath);
  } catch {
    return null;
  }

  const pdf = await PDFDocument.load(templateBytes);
  const form = pdf.getForm();

  // ── Fill text fields ────────────────────────────────────────
  for (const [pdfField, dataKey] of Object.entries(fieldMap.textFields)) {
    if (!dataKey) continue; // null = handled separately (e.g., date parts)
    const value = personalData[dataKey];
    if (!value || typeof value !== "string" || value.trim() === "") continue;

    try {
      const field = form.getTextField(pdfField);
      field.setText(value.trim());
    } catch {
      // Field might not exist in this version of the form
    }
  }

  // ── Fill date fields (split DD/MM/YYYY) ─────────────────────
  for (const [dataKey, parts] of Object.entries(fieldMap.dateFields)) {
    const dateValue = personalData[dataKey as keyof PersonalData];
    if (!dateValue || typeof dateValue !== "string") continue;

    // Support YYYY-MM-DD or DD/MM/YYYY
    let dd = "", mm = "", yyyy = "";
    if (dateValue.includes("-")) {
      const [y, m, d] = dateValue.split("-");
      dd = d; mm = m; yyyy = y;
    } else if (dateValue.includes("/")) {
      const [d, m, y] = dateValue.split("/");
      dd = d; mm = m; yyyy = y;
    }

    if (dd && mm && yyyy) {
      try {
        form.getTextField(parts.dd).setText(dd.padStart(2, "0"));
        form.getTextField(parts.mm).setText(mm.padStart(2, "0"));
        form.getTextField(parts.yyyy).setText(yyyy);
      } catch {
        // Date fields might not exist
      }
    }
  }

  // ── Fill sexo checkboxes ────────────────────────────────────
  if (personalData.sexo) {
    for (const [pdfField, sexoValue] of Object.entries(fieldMap.sexoCheckboxes)) {
      if (personalData.sexo === sexoValue) {
        try {
          form.getCheckBox(pdfField).check();
        } catch {}
      }
    }
  }

  // ── Fill tipo documento checkboxes ──────────────────────────
  if (personalData.tipoDocumento) {
    for (const [pdfField, tipoValue] of Object.entries(fieldMap.tipoDocCheckboxes)) {
      if (personalData.tipoDocumento === tipoValue) {
        try {
          form.getCheckBox(pdfField).check();
        } catch {}
      }
    }
  }

  // ── Fill estado civil checkboxes ────────────────────────────
  if (personalData.estadoCivil) {
    for (const [pdfField, estadoValue] of Object.entries(fieldMap.estadoCivilCheckboxes)) {
      if (personalData.estadoCivil === estadoValue) {
        try {
          form.getCheckBox(pdfField).check();
        } catch {}
      }
    }
  }

  // ── Fill circunstancia checkboxes (from authSlug) ───────────
  if (authSlug && fieldMap.circunstanciaCheckboxes) {
    for (const [pdfField, slugValue] of Object.entries(fieldMap.circunstanciaCheckboxes)) {
      if (authSlug === slugValue) {
        try {
          form.getCheckBox(pdfField).check();
        } catch {}
      }
    }
  }

  // ── Fill tipo autorizacion checkboxes (from authSlug) ──────
  if (authSlug && fieldMap.tipoAutorizacionCheckboxes) {
    for (const [pdfField, slugValue] of Object.entries(fieldMap.tipoAutorizacionCheckboxes)) {
      if (authSlug === slugValue) {
        try {
          form.getCheckBox(pdfField).check();
        } catch {}
      }
    }
  }

  // ── Fill consentimiento checkbox ───────────────────────────
  if (personalData.consentimientoDehu && fieldMap.consentimientoCheckbox) {
    try {
      form.getCheckBox(fieldMap.consentimientoCheckbox).check();
    } catch {}
  }

  // ── Fill hijos escolarizacion checkboxes ───────────────────
  if (personalData.hijosEscolarizacion !== null && personalData.hijosEscolarizacion !== undefined && fieldMap.hijosEscolarizacionCheckboxes) {
    for (const [pdfField, boolValue] of Object.entries(fieldMap.hijosEscolarizacionCheckboxes)) {
      if (personalData.hijosEscolarizacion === boolValue) {
        try { form.getCheckBox(pdfField).check(); } catch {}
      }
    }
  }

  // ── Fill titular sexo checkboxes (EX-01) ───────────────────
  if (personalData.titular_sexo && fieldMap.titularSexoCheckboxes) {
    for (const [pdfField, sexoValue] of Object.entries(fieldMap.titularSexoCheckboxes)) {
      if (personalData.titular_sexo === sexoValue) {
        try { form.getCheckBox(pdfField).check(); } catch {}
      }
    }
  }

  // ── Fill titular estado civil checkboxes (EX-01) ───────────
  if (personalData.titular_estadoCivil && fieldMap.titularEstadoCivilCheckboxes) {
    for (const [pdfField, estadoValue] of Object.entries(fieldMap.titularEstadoCivilCheckboxes)) {
      if (personalData.titular_estadoCivil === estadoValue) {
        try { form.getCheckBox(pdfField).check(); } catch {}
      }
    }
  }

  // ── Fill espanyol sexo checkboxes (EX-24) ──────────────────
  if (personalData.espanyol_sexo && fieldMap.espanyolSexoCheckboxes) {
    for (const [pdfField, sexoValue] of Object.entries(fieldMap.espanyolSexoCheckboxes)) {
      if (personalData.espanyol_sexo === sexoValue) {
        try { form.getCheckBox(pdfField).check(); } catch {}
      }
    }
  }

  // ── Fill espanyol estado civil checkboxes (EX-24) ──────────
  if (personalData.espanyol_estadoCivil && fieldMap.espanyolEstadoCivilCheckboxes) {
    for (const [pdfField, estadoValue] of Object.entries(fieldMap.espanyolEstadoCivilCheckboxes)) {
      if (personalData.espanyol_estadoCivil === estadoValue) {
        try { form.getCheckBox(pdfField).check(); } catch {}
      }
    }
  }

  // ── Fill familiar sexo checkboxes ──────────────────────────
  if (personalData.familiar_sexo && fieldMap.familiarSexoCheckboxes) {
    for (const [pdfField, sexoValue] of Object.entries(fieldMap.familiarSexoCheckboxes)) {
      if (personalData.familiar_sexo === sexoValue) {
        try { form.getCheckBox(pdfField).check(); } catch {}
      }
    }
  }

  // ── Fill familiar estado civil checkboxes ──────────────────
  if (personalData.familiar_estadoCivil && fieldMap.familiarEstadoCivilCheckboxes) {
    for (const [pdfField, estadoValue] of Object.entries(fieldMap.familiarEstadoCivilCheckboxes)) {
      if (personalData.familiar_estadoCivil === estadoValue) {
        try { form.getCheckBox(pdfField).check(); } catch {}
      }
    }
  }

  // ── Fill formacio tipus checkboxes (array — check all matching) ─
  if (personalData.formacio_tipus?.length && fieldMap.formacioTipusCheckboxes) {
    for (const [pdfField, tipusValue] of Object.entries(fieldMap.formacioTipusCheckboxes)) {
      if ((personalData.formacio_tipus as string[]).includes(tipusValue)) {
        try { form.getCheckBox(pdfField).check(); } catch {}
      }
    }
  }

  // ── Fill formacio modalitat checkboxes (array — check all matching)
  if (personalData.formacio_modalitat?.length && fieldMap.formacioModalitatCheckboxes) {
    for (const [pdfField, modalitatValue] of Object.entries(fieldMap.formacioModalitatCheckboxes)) {
      if ((personalData.formacio_modalitat as string[]).includes(modalitatValue)) {
        try { form.getCheckBox(pdfField).check(); } catch {}
      }
    }
  }

  // ── EX-10 specific: headers + defaults that the generic loop can't do ─
  if (exFormId === "EX-10") {
    fillEx10Checkboxes(form, personalData, authSlug);
  }

  // ── Flatten if requested ────────────────────────────────────
  if (flatten) {
    form.flatten();
  }

  return pdf.save();
}
