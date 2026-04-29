/**
 * EX-06 — Autorización de residencia y trabajo para actividades de temporada
 * 3 pages. Texto1, Texto3-Texto89 (no Texto2!) + Casilla de verificación9-11, 18-22, 73-81.
 */
import type { PersonalDataField } from "@/lib/types/personal-data";

export const EX_06_TEXT_FIELDS: Record<string, PersonalDataField | null> = {
  // ── Apartado 1: Solicitante ──────────────────────────────
  // Same structure as EX-04 but NO Texto2 (NIE letra absent)
  Texto1:  "primerApellido",
  // (no Texto2)
  Texto3:  "nie",
  Texto4:  null,                   // NIE control
  Texto5:  "nombre",
  Texto6:  "segundoApellido",
  Texto7:  "nacionalidad",
  // Sexo: Casilla de verificación9/10/11
  Texto8:  null,                   // DD (→ DATE_FIELDS)
  Texto9:  null,                   // MM (→ DATE_FIELDS)
  Texto10: null,                   // YYYY (→ DATE_FIELDS)
  Texto11: "lugarNacimiento",
  Texto12: "paisNacimiento",
  Texto13: "pasaporte",
  // EstadoCivil: Casilla de verificación18..22
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

  // ── Apartado 2: Empleador ────────────────────────────────
  Texto27: "empleador_nombre",
  Texto28: "empleador_nifNie",
  Texto29: "empleador_actividad",
  Texto30: "empleador_ocupacion",
  Texto31: "empleador_domicilio",
  Texto32: "empleador_numero",
  Texto33: "empleador_piso",
  Texto34: "empleador_localidad",
  Texto35: "empleador_codigoPostal",
  Texto36: "empleador_provincia",
  Texto37: "empleador_telefono",
  Texto38: "empleador_email",
  Texto39: "empleador_repNombre",
  Texto40: "empleador_repDniNie",
  // NOTE: NO empleador_repTitulo in EX-06

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

  // ── Otros campos del formulario (sin mapeo personal) ─────
  Texto64: null,
  Texto65: null,
  Texto66: null,
  Texto67: null,
  Texto68: null,
  Texto69: null,
  Texto70: null,
  Texto71: null,
  Texto72: null,
  Texto73: null,
  Texto74: null,
  Texto75: null,
  Texto76: null,
  Texto77: null,
  Texto78: null,
  Texto79: null,
  Texto80: null,
  Texto81: null,

  // ── Firma ────────────────────────────────────────────────
  Texto82: null,
  Texto83: null,
  Texto84: null,
  Texto85: null,
  Texto86: null,
  Texto87: null,
  Texto88: null,
  Texto89: null,
};

// ── Checkboxes ──────────────────────────────────────────────────

export const EX_06_SEXO_CHECKBOXES: Record<string, string> = {
  "Casilla de verificación9":  "X",
  "Casilla de verificación10": "H",
  "Casilla de verificación11": "M",
};

export const EX_06_ESTADO_CIVIL_CHECKBOXES: Record<string, string> = {
  "Casilla de verificación18": "soltero",
  "Casilla de verificación19": "casado",
  "Casilla de verificación20": "viudo",
  "Casilla de verificación21": "divorciado",
  "Casilla de verificación22": "pareja_hecho",
};

export const EX_06_CONSENTIMIENTO_CHECKBOX = "Casilla de verificación73";

export const EX_06_TIPO_AUTORIZACION_CHECKBOXES: Record<string, string> = {
  "Casilla de verificación74": "residencia_inicial_1r",
  "Casilla de verificación75": "residencia_inicial_2n",
  "Casilla de verificación76": "residencia_inicial_3r",
  "Casilla de verificación77": "canvi_empleador",
  "Casilla de verificación78": "prorroga",
  "Casilla de verificación79": "renovacio_plurianual",
  "Casilla de verificación80": "tipo_80",
  "Casilla de verificación81": "tipo_81",
};

export const EX_06_TIPO_DOC_CHECKBOXES: Record<string, string> = {};

export const EX_06_CIRCUNSTANCIA_CHECKBOXES: Record<string, string> = {};

export const EX_06_HIJOS_ESCOLARIZACION_CHECKBOXES: Record<string, boolean> = {};

// ── Camps de data ───────────────────────────────────────────────

export const EX_06_DATE_FIELDS = {
  fechaNacimiento: { dd: "Texto8", mm: "Texto9", yyyy: "Texto10" },
} as const;
