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

  // ── Fill representante legal fields ─────────────────────────
  if (personalData.representanteLegal) {
    // Parse "Nombre Apellido" format into the representative fields
    const repName = personalData.representanteLegal.trim();
    try {
      // Texto27 = rep primer apellido, Texto31 = rep nombre
      // Simple heuristic: first word = nombre, rest = apellido
      const parts = repName.split(" ");
      if (parts.length >= 2) {
        form.getTextField("Texto31").setText(parts[0]);
        form.getTextField("Texto27").setText(parts.slice(1).join(" "));
      } else {
        form.getTextField("Texto31").setText(repName);
      }
    } catch {}
  }

  if (personalData.representanteDniNiePas) {
    try {
      // Texto33 = rep document number (based on position Y~404)
      form.getTextField("Texto33").setText(personalData.representanteDniNiePas);
    } catch {}
  }

  // ── Flatten if requested ────────────────────────────────────
  if (flatten) {
    form.flatten();
  }

  return pdf.save();
}
