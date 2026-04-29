/**
 * EX-24 — Autorización de residencia temporal de familiares de personas con nacionalidad española
 * 3 pages, 108 fields. Clean Texto1..Texto108 naming.
 */
import type { PersonalDataField } from "@/lib/types/personal-data";

export const EX_24_TEXT_FIELDS: Record<string, PersonalDataField | null> = {
  // ── Apartado 1: Solicitante ──────────────────────────────
  Texto1:  "primerApellido",
  Texto2:  null,                   // NIE letra
  Texto3:  "nie",
  Texto4:  null,                   // NIE control
  Texto5:  "nombre",
  Texto6:  "segundoApellido",
  Texto7:  "nacionalidad",
  Texto8:  null,                   // DD
  Texto9:  null,                   // MM
  Texto10: null,                   // YYYY
  Texto11: "lugarNacimiento",
  Texto12: "paisNacimiento",
  Texto13: "domicilio",
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

  // ── Apartado 2: Persona con nacionalidad española ────────
  Texto35: "espanyol_primerApellido",
  Texto36: "espanyol_dni",
  Texto37: null,                   // DNI control
  Texto38: "espanyol_nombre",
  Texto39: "espanyol_segundoApellido",
  Texto40: null,                   // espanyol nacionalidad (text)
  Texto41: null,                   // DD → DATE_FIELDS
  Texto42: null,                   // MM
  Texto43: null,                   // YYYY
  Texto44: "espanyol_paisNacimiento",
  Texto45: "espanyol_nombrePadre",
  Texto46: "espanyol_nombreMadre",
  Texto47: "espanyol_domicilio",
  Texto48: "espanyol_numeroDomicilio",
  Texto49: "espanyol_pisoDomicilio",
  Texto50: "espanyol_localidad",
  Texto51: "espanyol_codigoPostal",
  Texto52: "espanyol_provincia",
  Texto53: "espanyol_parentesco",

  // ── Apartado 3: Representante presentación ───────────────
  Texto62: "repPresentacion_nombre",
  Texto63: "repPresentacion_dniNiePas",
  Texto64: "repPresentacion_domicilio",
  Texto65: "repPresentacion_numero",
  Texto66: "repPresentacion_piso",
  Texto67: "repPresentacion_localidad",
  Texto68: "repPresentacion_codigoPostal",
  Texto69: "repPresentacion_provincia",
  Texto70: "repPresentacion_telefono",
  Texto71: "repPresentacion_email",
  Texto72: "repPresentacion_repLegal",
  Texto73: "repPresentacion_repDniNiePas",
  Texto74: "repPresentacion_repTitulo",

  // ── Apartado 4: Notificaciones ───────────────────────────
  Texto75: "notif_nombre",
  Texto76: "notif_dniNiePas",
  Texto77: "notif_domicilio",
  Texto78: "notif_numero",
  Texto79: "notif_piso",
  Texto80: "notif_localidad",
  Texto81: "notif_codigoPostal",
  Texto82: "notif_provincia",
  Texto83: "notif_telefono",
  Texto84: "notif_email",

  // ── Firma / signing section ──────────────────────────────
  Texto101: null,
  Texto102: null,
  Texto103: null,
  Texto104: null,
  Texto105: null,
  Texto106: null,
  Texto107: null,
  Texto108: null,
};

export const EX_24_SEXO_CHECKBOXES: Record<string, string> = {
  "Casilla de verificación27": "H",
  "Casilla de verificación28": "M",
  "Casilla de verificación29": "X",
};
export const EX_24_ESTADO_CIVIL_CHECKBOXES: Record<string, string> = {
  "Casilla de verificación30": "soltero",
  "Casilla de verificación31": "casado",
  "Casilla de verificación32": "viudo",
  "Casilla de verificación33": "divorciado",
  "Casilla de verificación34": "pareja_hecho",
};
export const EX_24_ESPANYOL_SEXO_CHECKBOXES: Record<string, string> = {
  "Casilla de verificación54": "H",
  "Casilla de verificación55": "M",
  "Casilla de verificación56": "X",
};
export const EX_24_ESPANYOL_ESTADO_CIVIL_CHECKBOXES: Record<string, string> = {
  "Casilla de verificación57": "soltero",
  "Casilla de verificación58": "casado",
  "Casilla de verificación59": "viudo",
  "Casilla de verificación60": "divorciado",
  "Casilla de verificación61": "pareja_hecho",
};
export const EX_24_CONSENTIMIENTO_CHECKBOX = "Casilla de verificación85";
export const EX_24_TIPO_DOC_CHECKBOXES: Record<string, string> = {};
export const EX_24_CIRCUNSTANCIA_CHECKBOXES: Record<string, string> = {};
export const EX_24_HIJOS_ESCOLARIZACION_CHECKBOXES: Record<string, boolean> = {};
export const EX_24_TIPO_AUTORIZACION_CHECKBOXES: Record<string, string> = {
  "Casilla de verificación86":  "residencia_inicial_familiar_espanol",
  "Casilla de verificación87":  "residencia_inicial_conyuge_pareja",
  "Casilla de verificación88":  "residencia_inicial_ascendiente",
  "Casilla de verificación89":  "residencia_inicial_descendiente",
  "Casilla de verificación90":  "residencia_inicial_menor_tutelado",
  "Casilla de verificación91":  "residencia_inicial_persona_cargo",
  "Casilla de verificación92":  "residencia_inicial_hijo_espanol",
  "Casilla de verificación93":  "residencia_inicial_progenitor_hijo_espanol",
  "Casilla de verificación94":  "residencia_inicial_otros",
  "Casilla de verificación95":  "renovacion_residencia",
  "Casilla de verificación96":  "residencia_independiente_familiar",
  "Casilla de verificación97":  "conservacion_derecho_conyuge",
  "Casilla de verificación98":  "conservacion_derecho_ascendiente",
  "Casilla de verificación99":  "conservacion_derecho_descendiente",
  "Casilla de verificación100": "conservacion_derecho_otros",
};
export const EX_24_DATE_FIELDS = {
  fechaNacimiento:          { dd: "Texto8",  mm: "Texto9",  yyyy: "Texto10" },
  espanyol_fechaNacimiento: { dd: "Texto41", mm: "Texto42", yyyy: "Texto43" },
} as const;
