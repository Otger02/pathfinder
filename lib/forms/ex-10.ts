import type { FieldMap } from "@/lib/pdf/field-maps";
import type { PersonalDataField } from "@/lib/types/personal-data";

/**
 * EX-10 — Arraigo / Circunstancias excepcionales
 *
 * IMPORTANT:
 * - Aquest fitxer deixa els TEXT_FIELDS i DATE_FIELDS coherents amb el mapping
 *   revisat manualment.
 * - Les CHECKBOXES queden buides de moment perquè per omplir-les bé cal tenir
 *   els noms reals dels camps checkbox del PDF, no només la lògica semàntica.
 * - Un cop tinguem els field names reals del PDF, omplirem:
 *   - EX_10_SEXO_CHECKBOXES
 *   - EX_10_ESTADO_CIVIL_CHECKBOXES
 *   - EX_10_TIPO_DOC_CHECKBOXES
 *   - EX_10_CIRCUNSTANCIA_CHECKBOXES
 *   - EX_10_TIPO_AUTORIZACION_CHECKBOXES
 *   - EX_10_HIJOS_ESCOLARIZACION_CHECKBOXES
 *   - EX_10_CONSENTIMIENTO_CHECKBOX
 *   - EX_10_FAMILIAR_SEXO_CHECKBOXES
 *   - EX_10_FAMILIAR_ESTADO_CIVIL_CHECKBOXES
 *   - EX_10_FORMACIO_TIPUS_CHECKBOXES
 *   - EX_10_FORMACIO_MODALITAT_CHECKBOXES
 */

/* =========================================================
 * 1) TEXT FIELDS
 * ======================================================= */

export const EX_10_TEXT_FIELDS: Record<string, PersonalDataField | null> = {
  // ======================================================
  // PÀGINA 1 — APARTAT 1: DADES DE LA PERSONA ESTRANGERA
  // ======================================================

  Texto1: "pasaporte",
  Texto2: null, // NIE lletra
  Texto3: "nie",
  Texto4: null, // NIE control

  Texto5: "primerApellido",
  Texto6: "segundoApellido",
  Texto7: "nombre",

  // Fecha nacimiento → es resol via DATE_FIELDS
  Texto8: null,
  Texto9: null,
  Texto10: null,

  Texto11: "lugarNacimiento",
  Texto12: "paisNacimiento",
  Texto13: "nacionalidad",
  Texto14: "nombrePadre",
  Texto15: "nombreMadre",

  Texto16: "domicilio",
  Texto17: "numeroDomicilio",
  Texto18: "pisoDomicilio",
  Texto19: "localidad",
  Texto20: "codigoPostal",
  Texto21: "provincia",
  Texto22: "telefono",
  Texto23: "email",

  Texto24: "representanteLegal",
  Texto25: "representanteDniNiePas",
  Texto26: "representanteTitulo",

  // ======================================================
  // PÀGINA 1 — APARTAT 2: FAMILIAR CIUTADÀ UE / FAMILIAR
  // ======================================================

  Texto27: "familiar_pasaporte",
  Texto28: null, // familiar NIE lletra
  Texto29: "familiar_nie",
  Texto30: null, // familiar NIE control

  Texto31: "familiar_primerApellido",
  Texto32: "familiar_segundoApellido",
  Texto33: "familiar_nombre",

  // Fecha nacimiento familiar → DATE_FIELDS
  Texto34: null,
  Texto35: null,
  Texto36: null,

  Texto37: "familiar_paisNacimiento",
  Texto38: "familiar_lugarNacimiento",
  Texto39: "familiar_nombrePadre",
  Texto40: "familiar_nombreMadre",
  Texto41: "familiar_domicilio",
  Texto42: "familiar_numeroDomicilio",
  Texto43: "familiar_pisoDomicilio",
  Texto44: "familiar_localidad",
  Texto45: "familiar_codigoPostal",
  Texto46: "familiar_provincia",
  Texto47: "familiar_vinculo",

  // ======================================================
  // PÀGINA 1 — APARTAT 3: REPRESENTANT PRESENTACIÓ
  // ======================================================

  Texto48: "repPresentacion_nombre",
  Texto49: "repPresentacion_dniNiePas",
  Texto50: "repPresentacion_domicilio",
  Texto51: "repPresentacion_numero",
  Texto52: "repPresentacion_piso",
  Texto53: "repPresentacion_localidad",
  Texto54: "repPresentacion_codigoPostal",
  Texto55: "repPresentacion_provincia",
  Texto56: "repPresentacion_telefono",
  Texto57: "repPresentacion_email",
  Texto58: "repPresentacion_repLegal",
  Texto59: "repPresentacion_repDniNiePas",
  Texto60: "repPresentacion_repTitulo",

  // ======================================================
  // PÀGINA 1 — APARTAT 4: DOMICILI NOTIFICACIONS
  // ======================================================

  Texto61: "notif_nombre",
  Texto62: "notif_dniNiePas",
  Texto63: "notif_domicilio",
  Texto64: "notif_numero",
  Texto65: "notif_piso",
  Texto66: "notif_localidad",
  Texto67: "notif_codigoPostal",
  Texto68: "notif_provincia",
  Texto69: "notif_telefono",
  Texto70: "notif_email",

  // ======================================================
  // PÀGINA 2 — APARTAT 5: EMPLEADOR (ARRAIGO SOCIOLABORAL)
  // ======================================================

  Texto71: "empleador_nombre",
  Texto72: "empleador_nifNie",
  Texto73: "empleador_actividad",
  Texto74: "empleador_cnae",
  Texto75: "empleador_cnoSpe",
  Texto76: "empleador_domicilio",
  Texto77: "empleador_numero",
  Texto78: "empleador_piso",
  Texto79: "empleador_localidad",
  Texto80: "empleador_codigoPostal",
  Texto81: "empleador_provincia",
  Texto82: "empleador_telefono",
  Texto83: "empleador_email",
  Texto84: "empleador_repNombre",
  Texto85: "empleador_repDniNie",
  Texto86: "empleador_repTitulo",

  // ======================================================
  // PÀGINA 2 — APARTAT 6: CENTRE DE FORMACIÓ
  // ======================================================

  Texto87: "formacio_entitat",
  Texto88: "formacio_nom",
  Texto89: "formacio_codigoCurs",
  Texto90: "formacio_nifCif",
  Texto91: "formacio_direccio",
  Texto92: "formacio_provincia",
  Texto93: "formacio_duracio",

  // Dates formació → DATE_FIELDS
  Texto94: null,
  Texto95: null,
};

/* =========================================================
 * 2) DATE FIELDS
 * ======================================================= */

export const EX_10_DATE_FIELDS: Record<
  string,
  { dd: string; mm: string; yyyy: string }
> = {
  fechaNacimiento: {
    dd: "Texto8",
    mm: "Texto9",
    yyyy: "Texto10",
  },
  familiar_fechaNacimiento: {
    dd: "Texto34",
    mm: "Texto35",
    yyyy: "Texto36",
  },
  formacio_fechaInici: {
    dd: "Texto94",
    mm: "Texto95",
    yyyy: "", // pendent de confirmar si l’any va en un altre field
  },
  formacio_fechaFi: {
    dd: "",
    mm: "",
    yyyy: "", // pendent de confirmar amb el PDF real
  },
};

// ==============================
// EX-10 — CHECKBOX MAPPING
// ==============================

// ------------------------------
// 1. SEXE (persona estrangera)
// ------------------------------
export const EX_10_SEXO_CHECKBOXES: Record<
  string,
  "H" | "M" | "X"
> = {
  "Casilla de verificación96": "X",
  "Casilla de verificación97": "H",
  "Casilla de verificación98": "M",
};

// ------------------------------
// 2. ESTAT CIVIL (persona estrangera)
// ------------------------------
export const EX_10_ESTADO_CIVIL_CHECKBOXES: Record<
  string,
  "soltero" | "casado" | "viudo" | "divorciado" | "separado"
> = {
  "Casilla de verificación99": "soltero",
  "Casilla de verificación100": "casado",
  "Casilla de verificación101": "viudo",
  "Casilla de verificación102": "divorciado",
  // ⚠️ pendent identificar:
  // "Casilla de verificaciónXXX": "separado",
};

// ------------------------------
// 3. SEXE (familiar UE)
// ------------------------------
export const EX_10_FAMILIAR_SEXO_CHECKBOXES: Record<
  string,
  "H" | "M" | "X"
> = {
  "Casilla de verificación103": "X",
  "Casilla de verificación104": "H",
  "Casilla de verificación105": "M",
};

// ------------------------------
// 4. CHECKBOXES PENDENTS — stubs buits
// ------------------------------
// Aquests grups estan presents al PDF d'EX-10 però encara no s'han mapat
// manualment. Quedan com a Record buits perquè el field-map satisfaci la
// interfície FieldMap. Quan es mapin, substituir aquí amb les claus reals.

export const EX_10_TIPO_DOC_CHECKBOXES: Record<string, string> = {};

export const EX_10_FAMILIAR_ESTADO_CIVIL_CHECKBOXES: Record<string, string> = {};

export const EX_10_FORMACIO_TIPUS_CHECKBOXES: Record<string, string> = {};

export const EX_10_FORMACIO_MODALITAT_CHECKBOXES: Record<string, string> = {};

export const EX_10_CIRCUNSTANCIA_CHECKBOXES: Record<string, string> = {};

export const EX_10_TIPO_AUTORIZACION_CHECKBOXES: Record<string, string> = {};

export const EX_10_HIJOS_ESCOLARIZACION_CHECKBOXES: Record<string, boolean> = {};

export const EX_10_CONSENTIMIENTO_CHECKBOX = "";

// ------------------------------
// 5. ESTRUCTURA UNIFICADA (helper)
// ------------------------------
export const EX_10_CHECKBOXES = {
  sexo: EX_10_SEXO_CHECKBOXES,
  estadoCivil: EX_10_ESTADO_CIVIL_CHECKBOXES,
  familiarSexo: EX_10_FAMILIAR_SEXO_CHECKBOXES,
};

// ------------------------------
// 5. FUNCIONS D’UTILITAT
// ------------------------------
export function getCheckboxKeyByValue(
  map: Record<string, string>,
  value: string
): string | undefined {
  return Object.entries(map).find(([, v]) => v === value)?.[0];
}

// Exemple d’ús:
// getCheckboxKeyByValue(EX_10_SEXO_CHECKBOXES, "H")
// → "Casilla de verificación97"

/* =========================================================
 * 4) FIELD MAP EXPORT
 * ======================================================= */

export const EX_10_FIELD_MAP: FieldMap = {
  textFields: EX_10_TEXT_FIELDS,
  sexoCheckboxes: EX_10_SEXO_CHECKBOXES,
  tipoDocCheckboxes: EX_10_TIPO_DOC_CHECKBOXES,
  estadoCivilCheckboxes: EX_10_ESTADO_CIVIL_CHECKBOXES,
  circunstanciaCheckboxes: EX_10_CIRCUNSTANCIA_CHECKBOXES,
  tipoAutorizacionCheckboxes: EX_10_TIPO_AUTORIZACION_CHECKBOXES,
  hijosEscolarizacionCheckboxes: EX_10_HIJOS_ESCOLARIZACION_CHECKBOXES,
  consentimientoCheckbox: EX_10_CONSENTIMIENTO_CHECKBOX,
  dateFields: EX_10_DATE_FIELDS,

  // específics del formulari
  familiarSexoCheckboxes: EX_10_FAMILIAR_SEXO_CHECKBOXES,
  familiarEstadoCivilCheckboxes: EX_10_FAMILIAR_ESTADO_CIVIL_CHECKBOXES,
  formacioTipusCheckboxes: EX_10_FORMACIO_TIPUS_CHECKBOXES,
  formacioModalitatCheckboxes: EX_10_FORMACIO_MODALITAT_CHECKBOXES,
};