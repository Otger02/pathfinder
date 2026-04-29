/**
 * EX-19 — Tarjeta de residencia de familiar de ciudadano de la UE
 * 3 pages, 97 fields. Clean Texto2..Texto73 naming.
 */
import type { PersonalDataField } from "@/lib/types/personal-data";

export const EX_19_TEXT_FIELDS: Record<string, PersonalDataField | null> = {
  // ── Apartado 1: Solicitante ──────────────────────────────
  Texto2:  "primerApellido",
  Texto3:  null,                   // NIE letra
  Texto4:  "nie",
  Texto5:  null,                   // NIE control
  Texto6:  "nombre",
  Texto7:  "segundoApellido",
  Texto8:  "nacionalidad",
  Texto9:  null,                   // DD
  Texto10: null,                   // MM
  Texto11: null,                   // YYYY
  Texto12: "lugarNacimiento",
  Texto13: "paisNacimiento",
  Texto14: "domicilio",
  Texto15: "nombrePadre",
  Texto16: "nombreMadre",
  Texto17: "domicilio",
  Texto18: "numeroDomicilio",
  Texto19: "pisoDomicilio",
  Texto20: "localidad",
  Texto21: "codigoPostal",
  Texto22: "provincia",
  Texto23: "telefono",
  Texto24: "email",
  Texto25: "representanteLegal",
  Texto26: "representanteDniNiePas",
  Texto27: "representanteTitulo",

  // ── Apartado 2: Ciudadano UE que da derecho ──────────────
  Texto28: "ciudadanoUE_primerApellido",
  Texto29: null,                   // NIE letra
  Texto30: "ciudadanoUE_nie",
  Texto31: null,                   // NIE control
  Texto32: "ciudadanoUE_nombre",
  Texto33: "ciudadanoUE_segundoApellido",
  Texto34: "ciudadanoUE_nacionalidad",
  Texto35: "ciudadanoUE_domicilio",
  Texto36: "ciudadanoUE_numeroDomicilio",
  Texto37: "ciudadanoUE_pisoDomicilio",
  Texto38: "ciudadanoUE_localidad",
  Texto39: "ciudadanoUE_codigoPostal",
  Texto40: "ciudadanoUE_provincia",
  Texto41: null,                   // extra field

  // ── Apartado 3: Representante presentación ───────────────
  Texto42: "repPresentacion_nombre",
  Texto43: "repPresentacion_dniNiePas",
  Texto44: "repPresentacion_domicilio",
  Texto45: "repPresentacion_numero",
  Texto46: "repPresentacion_piso",
  Texto47: "repPresentacion_localidad",
  Texto48: "repPresentacion_codigoPostal",
  Texto49: "repPresentacion_provincia",
  Texto50: "repPresentacion_telefono",
  Texto51: "repPresentacion_email",
  Texto52: "repPresentacion_repLegal",
  Texto53: "repPresentacion_repDniNiePas",
  Texto54: "repPresentacion_repTitulo",

  // ── Apartado 4: Notificaciones ───────────────────────────
  Texto55: "notif_nombre",
  Texto56: "notif_dniNiePas",
  Texto57: "notif_domicilio",
  Texto58: "notif_numero",
  Texto59: "notif_piso",
  Texto60: "notif_localidad",
  Texto61: "notif_codigoPostal",
  Texto62: "notif_provincia",
  Texto63: "notif_telefono",
  Texto64: "notif_email",

  // ── Firma / signing section ──────────────────────────────
  Texto65: null,
  Texto66: null,
  Texto67: null,
  Texto68: null,
  Texto69: null,
  Texto70: null,
  Texto71: null,
  Texto72: null,
  Texto73: null,
};

export const EX_19_SEXO_CHECKBOXES: Record<string, string> = {
  "Casilla de verificación3": "H",
  "Casilla de verificación4": "M",
  "Casilla de verificación5": "X",
};
export const EX_19_ESTADO_CIVIL_CHECKBOXES: Record<string, string> = {
  "Casilla de verificación6":  "soltero",
  "Casilla de verificación7":  "casado",
  "Casilla de verificación8":  "viudo",
  "Casilla de verificación9":  "divorciado",
  "Casilla de verificación10": "pareja_hecho",
};
export const EX_19_CONSENTIMIENTO_CHECKBOX = "Casilla de verificación12";
export const EX_19_TIPO_DOC_CHECKBOXES: Record<string, string> = {};
export const EX_19_CIRCUNSTANCIA_CHECKBOXES: Record<string, string> = {};
export const EX_19_HIJOS_ESCOLARIZACION_CHECKBOXES: Record<string, boolean> = {};
export const EX_19_TIPO_AUTORIZACION_CHECKBOXES: Record<string, string> = {
  "Casilla de verificación13": "residencia_temporal_inicial_familiar_comunitario",
  "Casilla de verificación14": "residencia_temporal_inicial_familiar_estudiante",
  "Casilla de verificación15": "residencia_temporal_inicial_familiar_espanol",
  "Casilla de verificación16": "residencia_temporal_inicial_reagrupacion",
  "Casilla de verificación17": "residencia_temporal_inicial_arraigo",
  "Casilla de verificación18": "residencia_temporal_inicial_humanitarias",
  "Casilla de verificación19": "residencia_temporal_inicial_colaboracion",
  "Casilla de verificación20": "residencia_temporal_inicial_mujer_victima",
  "Casilla de verificación21": "residencia_permanente",
  "Casilla de verificación22": "renovacion_tarjeta_familiar_comunitario",
  "Casilla de verificación23": "renovacion_tarjeta_familiar_estudiante",
  "Casilla de verificación24": "renovacion_tarjeta_familiar_espanol",
  "Casilla de verificación25": "mantenimiento_titulo_personal_comunitario",
  "Casilla de verificación26": "mantenimiento_titulo_personal_estudiante",
  "Casilla de verificación27": "mantenimiento_titulo_personal_espanol",
  "Casilla de verificación28": "mantenimiento_titulo_personal_otro",
};
export const EX_19_DATE_FIELDS = {
  fechaNacimiento: { dd: "Texto9", mm: "Texto10", yyyy: "Texto11" },
} as const;
