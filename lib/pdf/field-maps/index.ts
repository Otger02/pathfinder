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
  tipoAutorizacionCheckboxes: Record<string, string>;
  hijosEscolarizacionCheckboxes: Record<string, boolean>;
  consentimientoCheckbox: string;
  dateFields: Record<string, { dd: string; mm: string; yyyy: string }>;
  // Form-specific optional checkbox groups
  familiarSexoCheckboxes?: Record<string, string>;
  familiarEstadoCivilCheckboxes?: Record<string, string>;
  titularSexoCheckboxes?: Record<string, string>;
  titularEstadoCivilCheckboxes?: Record<string, string>;
  espanyolSexoCheckboxes?: Record<string, string>;
  espanyolEstadoCivilCheckboxes?: Record<string, string>;
  formacioTipusCheckboxes?: Record<string, string>;
  formacioModalitatCheckboxes?: Record<string, string>;
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
      tipoAutorizacionCheckboxes: m.EX_00_TIPO_AUTORIZACION_CHECKBOXES,
      hijosEscolarizacionCheckboxes: m.EX_00_HIJOS_ESCOLARIZACION_CHECKBOXES,
      consentimientoCheckbox: m.EX_00_CONSENTIMIENTO_CHECKBOX,
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
      tipoAutorizacionCheckboxes: m.EX_01_TIPO_AUTORIZACION_CHECKBOXES,
      hijosEscolarizacionCheckboxes: m.EX_01_HIJOS_ESCOLARIZACION_CHECKBOXES,
      consentimientoCheckbox: m.EX_01_CONSENTIMIENTO_CHECKBOX,
      dateFields: m.EX_01_DATE_FIELDS,
      titularSexoCheckboxes: m.EX_01_TITULAR_SEXO_CHECKBOXES,
      titularEstadoCivilCheckboxes: m.EX_01_TITULAR_ESTADO_CIVIL_CHECKBOXES,
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
      tipoAutorizacionCheckboxes: m.EX_02_TIPO_AUTORIZACION_CHECKBOXES,
      hijosEscolarizacionCheckboxes: m.EX_02_HIJOS_ESCOLARIZACION_CHECKBOXES,
      consentimientoCheckbox: m.EX_02_CONSENTIMIENTO_CHECKBOX,
      dateFields: m.EX_02_DATE_FIELDS,
      familiarSexoCheckboxes: m.EX_02_FAMILIAR_SEXO_CHECKBOXES,
      familiarEstadoCivilCheckboxes: m.EX_02_FAMILIAR_ESTADO_CIVIL_CHECKBOXES,
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
      tipoAutorizacionCheckboxes: m.EX_03_TIPO_AUTORIZACION_CHECKBOXES,
      hijosEscolarizacionCheckboxes: m.EX_03_HIJOS_ESCOLARIZACION_CHECKBOXES,
      consentimientoCheckbox: m.EX_03_CONSENTIMIENTO_CHECKBOX,
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
      tipoAutorizacionCheckboxes: m.EX_04_TIPO_AUTORIZACION_CHECKBOXES,
      hijosEscolarizacionCheckboxes: m.EX_04_HIJOS_ESCOLARIZACION_CHECKBOXES,
      consentimientoCheckbox: m.EX_04_CONSENTIMIENTO_CHECKBOX,
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
      tipoAutorizacionCheckboxes: m.EX_06_TIPO_AUTORIZACION_CHECKBOXES,
      hijosEscolarizacionCheckboxes: m.EX_06_HIJOS_ESCOLARIZACION_CHECKBOXES,
      consentimientoCheckbox: m.EX_06_CONSENTIMIENTO_CHECKBOX,
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
      tipoAutorizacionCheckboxes: m.EX_07_TIPO_AUTORIZACION_CHECKBOXES,
      hijosEscolarizacionCheckboxes: m.EX_07_HIJOS_ESCOLARIZACION_CHECKBOXES,
      consentimientoCheckbox: m.EX_07_CONSENTIMIENTO_CHECKBOX,
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
      tipoAutorizacionCheckboxes: m.EX_09_TIPO_AUTORIZACION_CHECKBOXES,
      hijosEscolarizacionCheckboxes: m.EX_09_HIJOS_ESCOLARIZACION_CHECKBOXES,
      consentimientoCheckbox: m.EX_09_CONSENTIMIENTO_CHECKBOX,
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
      tipoAutorizacionCheckboxes: m.EX_10_TIPO_AUTORIZACION_CHECKBOXES,
      hijosEscolarizacionCheckboxes: m.EX_10_HIJOS_ESCOLARIZACION_CHECKBOXES,
      consentimientoCheckbox: m.EX_10_CONSENTIMIENTO_CHECKBOX,
      dateFields: m.EX_10_DATE_FIELDS,
      familiarSexoCheckboxes: m.EX_10_FAMILIAR_SEXO_CHECKBOXES,
      familiarEstadoCivilCheckboxes: m.EX_10_FAMILIAR_ESTADO_CIVIL_CHECKBOXES,
      formacioTipusCheckboxes: m.EX_10_FORMACIO_TIPUS_CHECKBOXES,
      formacioModalitatCheckboxes: m.EX_10_FORMACIO_MODALITAT_CHECKBOXES,
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
      tipoAutorizacionCheckboxes: m.EX_11_TIPO_AUTORIZACION_CHECKBOXES,
      hijosEscolarizacionCheckboxes: m.EX_11_HIJOS_ESCOLARIZACION_CHECKBOXES,
      consentimientoCheckbox: m.EX_11_CONSENTIMIENTO_CHECKBOX,
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
      tipoAutorizacionCheckboxes: m.EX_19_TIPO_AUTORIZACION_CHECKBOXES,
      hijosEscolarizacionCheckboxes: m.EX_19_HIJOS_ESCOLARIZACION_CHECKBOXES,
      consentimientoCheckbox: m.EX_19_CONSENTIMIENTO_CHECKBOX,
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
      tipoAutorizacionCheckboxes: m.EX_24_TIPO_AUTORIZACION_CHECKBOXES,
      hijosEscolarizacionCheckboxes: m.EX_24_HIJOS_ESCOLARIZACION_CHECKBOXES,
      consentimientoCheckbox: m.EX_24_CONSENTIMIENTO_CHECKBOX,
      dateFields: m.EX_24_DATE_FIELDS,
      espanyolSexoCheckboxes: m.EX_24_ESPANYOL_SEXO_CHECKBOXES,
      espanyolEstadoCivilCheckboxes: m.EX_24_ESPANYOL_ESTADO_CIVIL_CHECKBOXES,
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
      tipoAutorizacionCheckboxes: m.EX_25_TIPO_AUTORIZACION_CHECKBOXES,
      hijosEscolarizacionCheckboxes: m.EX_25_HIJOS_ESCOLARIZACION_CHECKBOXES,
      consentimientoCheckbox: m.EX_25_CONSENTIMIENTO_CHECKBOX,
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
