/**
 * form-filler.ts
 *
 * Fills official EX form PDFs with collected personal data.
 * Loads the AcroForm template, maps PersonalData fields to PDF fields,
 * and returns the filled PDF as Uint8Array.
 */

import { PDFDocument } from "pdf-lib";
import { readFileSync } from "fs";
import { join } from "path";
import type { ExFormId } from "@/lib/form-config";
import type { PersonalData } from "@/lib/types/personal-data";
import { getFieldMap } from "./field-maps";

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

  // ── Flatten if requested ────────────────────────────────────
  if (flatten) {
    form.flatten();
  }

  return pdf.save();
}
