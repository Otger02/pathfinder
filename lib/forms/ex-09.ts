/**
 * EX-09 — Autorización de residencia temporal con excepción de autorización de trabajo
 * 3 pages, 86 fields. Clean Texto1..Texto70 naming.
 */
import type { PersonalDataField } from "@/lib/types/personal-data";

export const EX_09_TEXT_FIELDS: Record<string, PersonalDataField | null> = {
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
  // Casilla de verificación76/77: hijosEscolarizacion

  // ── Apartado 2: Entidad que invita/contrata/desplaza ─────
  Texto24: null,                   // entidad_nombre
  Texto25: null,                   // entidad_nif
  Texto26: null,                   // entidad_actividad
  Texto27: null,                   // entidad_ocupacion
  Texto28: null,                   // entidad_domicilio
  Texto29: null,                   // entidad_numero
  Texto30: null,                   // entidad_piso
  Texto31: null,                   // entidad_localidad
  Texto32: null,                   // entidad_cp
  Texto33: null,                   // entidad_provincia
  Texto34: null,                   // entidad_telefono
  Texto35: null,                   // entidad_email
  Texto36: null,                   // entidad_repLegal
  Texto37: null,                   // entidad_repDni
  Texto38: null,                   // entidad_repTitulo

  // ── Apartado 3: Representante presentación ───────────────
  Texto39: "repPresentacionNombre",
  Texto40: "repPresentacionDniNiePas",
  Texto41: "repPresentacionDomicilio",
  Texto42: "repPresentacionNumero",
  Texto43: "repPresentacionPiso",
  Texto44: "repPresentacionLocalidad",
  Texto45: "repPresentacionCodigoPostal",
  Texto46: "repPresentacionProvincia",
  Texto47: "repPresentacionTelefono",
  Texto48: "repPresentacionEmail",
  Texto49: "repPresentacionRepLegal",
  Texto50: "repPresentacionRepDniNiePas",
  Texto51: "repPresentacionRepTitulo",

  // ── Apartado 4: Notificaciones ───────────────────────────
  Texto52: "notifNombre",
  Texto53: "notifDniNiePas",
  Texto54: "notifDomicilio",
  Texto55: "notifNumero",
  Texto56: "notifPiso",
  Texto57: "notifLocalidad",
  Texto58: "notifCodigoPostal",
  Texto59: "notifProvincia",
  Texto60: "notifTelefono",
  Texto61: "notifEmail",
};

export const EX_09_SEXO_CHECKBOXES: Record<string, string> = {
  "Casilla de verificación79": "H",
  "Casilla de verificación80": "M",
  "Casilla de verificación81": "X",
};
export const EX_09_ESTADO_CIVIL_CHECKBOXES: Record<string, string> = {
  "Casilla de verificación71": "soltero",
  "Casilla de verificación72": "casado",
  "Casilla de verificación73": "viudo",
  "Casilla de verificación74": "divorciado",
  "Casilla de verificación75": "pareja_hecho",
};
export const EX_09_HIJOS_CHECKBOXES: Record<string, boolean> = {
  "Casilla de verificación76": true,
  "Casilla de verificación77": false,
};
export const EX_09_CONSENTIMIENTO_CHECKBOX = "Casilla de verificación78";
export const EX_09_DATE_FIELDS = {
  fechaNacimiento: { dd: "Texto8", mm: "Texto9", yyyy: "Texto10" },
} as const;
