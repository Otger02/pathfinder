/**
 * EX-06 — Autorización de residencia y trabajo para actividades de temporada
 * 3 pages, 88 fields. Clean Texto1..Texto89 naming.
 */
import type { PersonalDataField } from "@/lib/types/personal-data";

export const EX_06_TEXT_FIELDS: Record<string, PersonalDataField | null> = {
  // ── Apartado 1: Solicitante ──────────────────────────────
  Texto1:  "primerApellido",
  Texto3:  null,                   // NIE letra
  Texto4:  "nie",
  Texto5:  null,                   // NIE control
  Texto6:  "nombre",
  Texto7:  "segundoApellido",
  Texto8:  "nacionalidad",
  Texto12: null,                   // DD
  Texto13: null,                   // MM
  Texto14: null,                   // YYYY
  Texto15: "lugarNacimiento",
  Texto16: "paisNacimiento",
  Texto17: "domicilio",
  Texto23: "nombrePadre",
  Texto24: "nombreMadre",
  Texto25: "domicilio",
  Texto26: "numeroDomicilio",
  Texto27: "pisoDomicilio",
  Texto28: "localidad",
  Texto29: "codigoPostal",
  Texto30: "provincia",
  Texto31: "telefono",
  Texto32: "email",
  Texto33: "representanteLegal",
  Texto34: "representanteDniNiePas",
  Texto35: "representanteTitulo",

  // ── Apartado 2: Empleador ────────────────────────────────
  Texto36: null,                   // empleador_nombre
  Texto37: null,                   // empleador_dniNiePas
  Texto38: null,                   // empleador_actividad
  Texto39: null,                   // empleador_ocupacion
  Texto40: null,                   // empleador_domicilio
  Texto41: null,                   // empleador_numero
  Texto42: null,                   // empleador_piso
  Texto43: null,                   // empleador_localidad
  Texto44: null,                   // empleador_cp
  Texto45: null,                   // empleador_provincia
  Texto46: null,                   // empleador_telefono
  Texto47: null,                   // empleador_email
  Texto48: null,                   // empleador_repLegal
  Texto49: null,                   // empleador_repDni

  // ── Apartado 3: Representante presentación ───────────────
  Texto50: "repPresentacionNombre",
  Texto51: "repPresentacionDniNiePas",
  Texto52: "repPresentacionDomicilio",
  Texto53: "repPresentacionNumero",
  Texto54: "repPresentacionPiso",
  Texto55: "repPresentacionLocalidad",
  Texto56: "repPresentacionCodigoPostal",
  Texto57: "repPresentacionProvincia",
  Texto58: "repPresentacionTelefono",
  Texto59: "repPresentacionEmail",
  Texto60: "repPresentacionRepLegal",
  Texto61: "repPresentacionRepDniNiePas",
  Texto62: "repPresentacionRepTitulo",

  // ── Apartado 4: Notificaciones ───────────────────────────
  Texto63: "notifNombre",
  Texto64: "notifDniNiePas",
  Texto65: "notifDomicilio",
  Texto66: "notifNumero",
  Texto67: "notifPiso",
  Texto68: "notifLocalidad",
  Texto69: "notifCodigoPostal",
  Texto70: "notifProvincia",
  Texto71: "notifTelefono",
  Texto72: "notifEmail",
};

export const EX_06_SEXO_CHECKBOXES: Record<string, string> = {
  "Casilla de verificación9":  "H",
  "Casilla de verificación10": "M",
  "Casilla de verificación11": "X",
};
export const EX_06_ESTADO_CIVIL_CHECKBOXES: Record<string, string> = {
  "Casilla de verificación18": "soltero",
  "Casilla de verificación19": "casado",
  "Casilla de verificación20": "viudo",
  "Casilla de verificación21": "divorciado",
  "Casilla de verificación22": "pareja_hecho",
};
export const EX_06_CONSENTIMIENTO_CHECKBOX = "Casilla de verificación73";
export const EX_06_DATE_FIELDS = {
  fechaNacimiento: { dd: "Texto12", mm: "Texto13", yyyy: "Texto14" },
} as const;
