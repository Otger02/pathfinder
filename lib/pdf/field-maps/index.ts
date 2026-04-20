/**
 * Field map registry.
 *
 * Maps ExFormId to the field map modules for PDF auto-fill.
 * Add new forms here as they are mapped.
 */

import type { ExFormId } from "@/lib/form-config";
import type { PersonalDataField } from "@/lib/types/personal-data";

export interface FieldMap {
  textFields: Record<string, PersonalDataField | null>;
  sexoCheckboxes: Record<string, string>;
  tipoDocCheckboxes: Record<string, string>;
  estadoCivilCheckboxes: Record<string, string>;
  circunstanciaCheckboxes: Record<string, string>;
  dateFields: Record<string, { dd: string; mm: string; yyyy: string }>;
}

// Lazy imports to avoid loading all maps at once
const FIELD_MAP_LOADERS: Partial<Record<ExFormId, () => Promise<FieldMap>>> = {
  "EX-00": async () => {
    const m = await import("./ex-00");
    return {
      textFields: m.EX_00_TEXT_FIELDS,
      sexoCheckboxes: m.EX_00_SEXO_CHECKBOXES,
      tipoDocCheckboxes: m.EX_00_TIPO_DOC_CHECKBOXES,
      estadoCivilCheckboxes: m.EX_00_ESTADO_CIVIL_CHECKBOXES,
      circunstanciaCheckboxes: m.EX_00_CIRCUNSTANCIA_CHECKBOXES,
      dateFields: m.EX_00_DATE_FIELDS,
    };
  },
  "EX-01": async () => {
    const m = await import("./ex-01");
    return {
      textFields: m.EX_01_TEXT_FIELDS,
      sexoCheckboxes: m.EX_01_SEXO_CHECKBOXES,
      tipoDocCheckboxes: m.EX_01_TIPO_DOC_CHECKBOXES,
      estadoCivilCheckboxes: m.EX_01_ESTADO_CIVIL_CHECKBOXES,
      circunstanciaCheckboxes: m.EX_01_CIRCUNSTANCIA_CHECKBOXES,
      dateFields: m.EX_01_DATE_FIELDS,
    };
  },
  "EX-02": async () => {
    const m = await import("./ex-02");
    return {
      textFields: m.EX_02_TEXT_FIELDS,
      sexoCheckboxes: m.EX_02_SEXO_CHECKBOXES,
      tipoDocCheckboxes: m.EX_02_TIPO_DOC_CHECKBOXES,
      estadoCivilCheckboxes: m.EX_02_ESTADO_CIVIL_CHECKBOXES,
      circunstanciaCheckboxes: m.EX_02_CIRCUNSTANCIA_CHECKBOXES,
      dateFields: m.EX_02_DATE_FIELDS,
    };
  },
  "EX-03": async () => {
    const m = await import("./ex-03");
    return {
      textFields: m.EX_03_TEXT_FIELDS,
      sexoCheckboxes: m.EX_03_SEXO_CHECKBOXES,
      tipoDocCheckboxes: m.EX_03_TIPO_DOC_CHECKBOXES,
      estadoCivilCheckboxes: m.EX_03_ESTADO_CIVIL_CHECKBOXES,
      circunstanciaCheckboxes: m.EX_03_CIRCUNSTANCIA_CHECKBOXES,
      dateFields: m.EX_03_DATE_FIELDS,
    };
  },
  "EX-04": async () => {
    const m = await import("./ex-04");
    return {
      textFields: m.EX_04_TEXT_FIELDS,
      sexoCheckboxes: m.EX_04_SEXO_CHECKBOXES,
      tipoDocCheckboxes: m.EX_04_TIPO_DOC_CHECKBOXES,
      estadoCivilCheckboxes: m.EX_04_ESTADO_CIVIL_CHECKBOXES,
      circunstanciaCheckboxes: m.EX_04_CIRCUNSTANCIA_CHECKBOXES,
      dateFields: m.EX_04_DATE_FIELDS,
    };
  },
  "EX-06": async () => {
    const m = await import("./ex-06");
    return {
      textFields: m.EX_06_TEXT_FIELDS,
      sexoCheckboxes: m.EX_06_SEXO_CHECKBOXES,
      tipoDocCheckboxes: m.EX_06_TIPO_DOC_CHECKBOXES,
      estadoCivilCheckboxes: m.EX_06_ESTADO_CIVIL_CHECKBOXES,
      circunstanciaCheckboxes: m.EX_06_CIRCUNSTANCIA_CHECKBOXES,
      dateFields: m.EX_06_DATE_FIELDS,
    };
  },
  "EX-07": async () => {
    const m = await import("./ex-07");
    return {
      textFields: m.EX_07_TEXT_FIELDS,
      sexoCheckboxes: m.EX_07_SEXO_CHECKBOXES,
      tipoDocCheckboxes: m.EX_07_TIPO_DOC_CHECKBOXES,
      estadoCivilCheckboxes: m.EX_07_ESTADO_CIVIL_CHECKBOXES,
      circunstanciaCheckboxes: m.EX_07_CIRCUNSTANCIA_CHECKBOXES,
      dateFields: m.EX_07_DATE_FIELDS,
    };
  },
  "EX-09": async () => {
    const m = await import("./ex-09");
    return {
      textFields: m.EX_09_TEXT_FIELDS,
      sexoCheckboxes: m.EX_09_SEXO_CHECKBOXES,
      tipoDocCheckboxes: m.EX_09_TIPO_DOC_CHECKBOXES,
      estadoCivilCheckboxes: m.EX_09_ESTADO_CIVIL_CHECKBOXES,
      circunstanciaCheckboxes: m.EX_09_CIRCUNSTANCIA_CHECKBOXES,
      dateFields: m.EX_09_DATE_FIELDS,
    };
  },
  "EX-10": async () => {
    const m = await import("./ex-10");
    return {
      textFields: m.EX_10_TEXT_FIELDS,
      sexoCheckboxes: m.EX_10_SEXO_CHECKBOXES,
      tipoDocCheckboxes: m.EX_10_TIPO_DOC_CHECKBOXES,
      estadoCivilCheckboxes: m.EX_10_ESTADO_CIVIL_CHECKBOXES,
      circunstanciaCheckboxes: m.EX_10_CIRCUNSTANCIA_CHECKBOXES,
      dateFields: m.EX_10_DATE_FIELDS,
    };
  },
  "EX-11": async () => {
    const m = await import("./ex-11");
    return {
      textFields: m.EX_11_TEXT_FIELDS,
      sexoCheckboxes: m.EX_11_SEXO_CHECKBOXES,
      tipoDocCheckboxes: m.EX_11_TIPO_DOC_CHECKBOXES,
      estadoCivilCheckboxes: m.EX_11_ESTADO_CIVIL_CHECKBOXES,
      circunstanciaCheckboxes: m.EX_11_CIRCUNSTANCIA_CHECKBOXES,
      dateFields: m.EX_11_DATE_FIELDS,
    };
  },
  "EX-19": async () => {
    const m = await import("./ex-19");
    return {
      textFields: m.EX_19_TEXT_FIELDS,
      sexoCheckboxes: m.EX_19_SEXO_CHECKBOXES,
      tipoDocCheckboxes: m.EX_19_TIPO_DOC_CHECKBOXES,
      estadoCivilCheckboxes: m.EX_19_ESTADO_CIVIL_CHECKBOXES,
      circunstanciaCheckboxes: m.EX_19_CIRCUNSTANCIA_CHECKBOXES,
      dateFields: m.EX_19_DATE_FIELDS,
    };
  },
  "EX-24": async () => {
    const m = await import("./ex-24");
    return {
      textFields: m.EX_24_TEXT_FIELDS,
      sexoCheckboxes: m.EX_24_SEXO_CHECKBOXES,
      tipoDocCheckboxes: m.EX_24_TIPO_DOC_CHECKBOXES,
      estadoCivilCheckboxes: m.EX_24_ESTADO_CIVIL_CHECKBOXES,
      circunstanciaCheckboxes: m.EX_24_CIRCUNSTANCIA_CHECKBOXES,
      dateFields: m.EX_24_DATE_FIELDS,
    };
  },
  "EX-25": async () => {
    const m = await import("./ex-25");
    return {
      textFields: m.EX_25_TEXT_FIELDS,
      sexoCheckboxes: m.EX_25_SEXO_CHECKBOXES,
      tipoDocCheckboxes: m.EX_25_TIPO_DOC_CHECKBOXES,
      estadoCivilCheckboxes: m.EX_25_ESTADO_CIVIL_CHECKBOXES,
      circunstanciaCheckboxes: m.EX_25_CIRCUNSTANCIA_CHECKBOXES,
      dateFields: m.EX_25_DATE_FIELDS,
    };
  },
};

export async function getFieldMap(formId: ExFormId): Promise<FieldMap | null> {
  const loader = FIELD_MAP_LOADERS[formId];
  if (!loader) return null;
  return loader();
}

export function getSupportedForms(): ExFormId[] {
  return Object.keys(FIELD_MAP_LOADERS) as ExFormId[];
}
