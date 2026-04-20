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
  Texto28: null,                   // ue_primerApellido
  Texto29: null,                   // ue_NIE letra
  Texto30: null,                   // ue_nie
  Texto31: null,                   // ue_NIE control
  Texto32: null,                   // ue_nombre
  Texto33: null,                   // ue_segundoApellido — campo largo
  Texto34: null,                   // ue_nacionalidad
  Texto35: null,                   // ue_domicilio
  Texto36: null,                   // ue_numero
  Texto37: null,                   // ue_piso
  Texto38: null,                   // ue_localidad
  Texto39: null,                   // ue_cp
  Texto40: null,                   // ue_provincia
  Texto41: null,                   // ue_localidad2

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
export const EX_19_DATE_FIELDS = {
  fechaNacimiento: { dd: "Texto9", mm: "Texto10", yyyy: "Texto11" },
} as const;
