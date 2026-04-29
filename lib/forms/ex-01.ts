/**
 * EX-01 — Autorización de residencia temporal no lucrativa
 * 3 pages, 97 fields. Clean Texto1..Texto71 + Casilla de verificación2..26.
 */
import type { PersonalDataField } from "@/lib/types/personal-data";

export const EX_01_TEXT_FIELDS: Record<string, PersonalDataField | null> = {
  // ── Apartado 1: Solicitante ──────────────────────────────
  Texto1:  "primerApellido",
  Texto2:  null,                  // NIE letra
  Texto3:  "nie",
  Texto4:  null,                  // NIE control
  Texto5:  "nombre",
  Texto6:  "segundoApellido",
  Texto7:  "nacionalidad",
  // Sexo: Casilla de verificación2/3/4
  Texto8:  null,                  // DD (→ DATE_FIELDS)
  Texto9:  null,                  // MM (→ DATE_FIELDS)
  Texto10: null,                  // YYYY (→ DATE_FIELDS)
  Texto11: "lugarNacimiento",
  Texto12: "paisNacimiento",
  Texto13: "pasaporte",
  // EstadoCivil: Casilla de verificación5..9
  Texto14: "nombrePadre",
  Texto15: "nombreMadre",
  Texto16: "domicilio",           // calle
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
  // Casilla de verificación10/11: hijosEscolarizacion SI/NO

  // ── Apartado 2: Familiar titular recursos económicos ─────
  Texto27: "titular_primerApellido",
  Texto28: null,                  // NIE letra
  Texto29: "titular_nie",
  Texto30: null,                  // NIE control
  Texto31: "titular_nombre",
  Texto32: "titular_segundoApellido",
  Texto33: null,                  // titular nacionalidad (no en PersonalData)
  // Sexo titular: Casilla de verificación12/13/14
  // Estado civil titular: Casilla de verificación15..19
  Texto34: null,                  // DD (→ DATE_FIELDS)
  Texto35: null,                  // MM (→ DATE_FIELDS)
  Texto36: null,                  // YYYY (→ DATE_FIELDS)
  Texto37: "titular_paisNacimiento",
  Texto38: "titular_nombrePadre",
  Texto39: "titular_nombreMadre",
  Texto40: "titular_parentesco",

  // ── Apartado 3: Representante presentación ───────────────
  Texto41: "repPresentacion_nombre",
  Texto42: "repPresentacion_dniNiePas",
  Texto43: "repPresentacion_domicilio",
  Texto44: "repPresentacion_numero",
  Texto45: "repPresentacion_piso",
  Texto46: "repPresentacion_localidad",
  Texto47: "repPresentacion_codigoPostal",
  Texto48: "repPresentacion_provincia",
  Texto49: "repPresentacion_telefono",
  Texto50: "repPresentacion_email",
  Texto51: "repPresentacion_repLegal",
  Texto52: "repPresentacion_repDniNiePas",
  Texto53: "repPresentacion_repTitulo",

  // ── Apartado 4: Notificaciones ───────────────────────────
  Texto54: "notif_nombre",
  Texto55: "notif_dniNiePas",
  Texto56: "notif_domicilio",
  Texto57: "notif_numero",
  Texto58: "notif_piso",
  Texto59: "notif_localidad",
  Texto60: "notif_codigoPostal",
  Texto61: "notif_provincia",
  Texto62: "notif_telefono",
  Texto63: "notif_email",

  // ── Firma ────────────────────────────────────────────────
  Texto64: null,                  // localitat firma
  Texto65: null,                  // dia firma
  Texto66: null,                  // mes firma
  Texto67: null,                  // any firma
  Texto68: null,
  Texto69: null,
  Texto70: null,
  Texto71: null,
};

// ── Checkboxes ──────────────────────────────────────────────────

export const EX_01_SEXO_CHECKBOXES: Record<string, string> = {
  "Casilla de verificación2": "X",
  "Casilla de verificación3": "H",
  "Casilla de verificación4": "M",
};

export const EX_01_ESTADO_CIVIL_CHECKBOXES: Record<string, string> = {
  "Casilla de verificación5": "soltero",
  "Casilla de verificación6": "casado",
  "Casilla de verificación7": "viudo",
  "Casilla de verificación8": "divorciado",
  "Casilla de verificación9": "pareja_hecho",
};

export const EX_01_HIJOS_ESCOLARIZACION_CHECKBOXES: Record<string, boolean> = {
  "Casilla de verificación10": true,   // SÍ
  "Casilla de verificación11": false,  // NO
};

export const EX_01_TITULAR_SEXO_CHECKBOXES: Record<string, string> = {
  "Casilla de verificación12": "H",
  "Casilla de verificación13": "M",
  "Casilla de verificación14": "X",
};

export const EX_01_TITULAR_ESTADO_CIVIL_CHECKBOXES: Record<string, string> = {
  "Casilla de verificación15": "soltero",
  "Casilla de verificación16": "casado",
  "Casilla de verificación17": "viudo",
  "Casilla de verificación18": "divorciado",
  "Casilla de verificación19": "pareja_hecho",
};

export const EX_01_CONSENTIMIENTO_CHECKBOX = "Casilla de verificación20";

export const EX_01_TIPO_AUTORIZACION_CHECKBOXES: Record<string, string> = {
  "Casilla de verificación21": "residencia_inicial_titular",
  "Casilla de verificación22": "residencia_inicial_familiar",
  "Casilla de verificación23": "renovacion_titular",
  "Casilla de verificación24": "renovacion_familiar",
  "Casilla de verificación25": "tipo_25",
  "Casilla de verificación26": "tipo_26",
};

export const EX_01_TIPO_DOC_CHECKBOXES: Record<string, string> = {};

export const EX_01_CIRCUNSTANCIA_CHECKBOXES: Record<string, string> = {};

// ── Camps de data ───────────────────────────────────────────────

export const EX_01_DATE_FIELDS = {
  fechaNacimiento:          { dd: "Texto8",  mm: "Texto9",  yyyy: "Texto10" },
  titular_fechaNacimiento:  { dd: "Texto34", mm: "Texto35", yyyy: "Texto36" },
} as const;
