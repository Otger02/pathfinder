/**
 * EX-04 — Autorización de residencia para prácticas
 * 3 pages, 96 fields. Clean Texto1..Texto72 naming.
 */
import type { PersonalDataField } from "@/lib/types/personal-data";

export const EX_04_TEXT_FIELDS: Record<string, PersonalDataField | null> = {
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

  // ── Apartado 2: Entidad de acogida ───────────────────────
  Texto27: null,                   // entidad_nombre
  Texto28: null,                   // entidad_nif
  Texto29: null,                   // entidad_actividad
  Texto30: null,                   // entidad_ocupacion
  Texto31: null,                   // entidad_domicilio
  Texto32: null,                   // entidad_numero
  Texto33: null,                   // entidad_piso
  Texto34: null,                   // entidad_localidad
  Texto35: null,                   // entidad_cp
  Texto36: null,                   // entidad_provincia
  Texto37: null,                   // entidad_telefono
  Texto38: null,                   // entidad_email
  Texto39: null,                   // entidad_repLegal
  Texto40: null,                   // entidad_repDni
  Texto41: null,                   // entidad_repTitulo

  // ── Apartado 3: Representante presentación ───────────────
  Texto42: "repPresentacionNombre",
  Texto43: "repPresentacionDniNiePas",
  Texto44: "repPresentacionDomicilio",
  Texto45: "repPresentacionNumero",
  Texto46: "repPresentacionPiso",
  Texto47: "repPresentacionLocalidad",
  Texto48: "repPresentacionCodigoPostal",
  Texto49: "repPresentacionProvincia",
  Texto50: "repPresentacionTelefono",
  Texto51: "repPresentacionEmail",
  Texto52: "repPresentacionRepLegal",
  Texto53: "repPresentacionRepDniNiePas",
  Texto54: "repPresentacionRepTitulo",

  // ── Apartado 4: Notificaciones ───────────────────────────
  Texto55: "notifNombre",
  Texto56: "notifDniNiePas",
  Texto57: "notifDomicilio",
  Texto58: "notifNumero",
  Texto59: "notifPiso",
  Texto60: "notifLocalidad",
  Texto61: "notifCodigoPostal",
  Texto62: "notifProvincia",
  Texto63: "notifTelefono",
  Texto64: "notifEmail",
};

export const EX_04_SEXO_CHECKBOXES: Record<string, string> = {
  "Casilla de verificación73": "H",
  "Casilla de verificación74": "M",
  "Casilla de verificación75": "X",
};
export const EX_04_ESTADO_CIVIL_CHECKBOXES: Record<string, string> = {
  "Casilla de verificación76": "soltero",
  "Casilla de verificación77": "casado",
  "Casilla de verificación78": "viudo",
  "Casilla de verificación79": "divorciado",
  "Casilla de verificación80": "pareja_hecho",
};
export const EX_04_CONSENTIMIENTO_CHECKBOX = "Casilla de verificación81";
export const EX_04_DATE_FIELDS = {
  fechaNacimiento: { dd: "Texto8", mm: "Texto9", yyyy: "Texto10" },
} as const;
