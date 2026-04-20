/**
 * EX-01 — Autorización de residencia temporal no lucrativa
 * 3 pages, 96 fields. Clean Texto1..Texto71 naming.
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
  Texto8:  null,                  // DD fechaNacimiento
  Texto9:  null,                  // MM
  Texto10: null,                  // YYYY
  Texto11: "lugarNacimiento",
  Texto12: "paisNacimiento",
  Texto13: "domicilio",
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
  Texto27: null,                  // fam_primerApellido
  Texto28: null,                  // fam_NIE letra
  Texto29: null,                  // fam_nie
  Texto30: null,                  // fam_nie control
  Texto31: null,                  // fam_nombre
  Texto32: null,                  // fam_segundoApellido
  Texto33: null,                  // fam_nacionalidad
  // Casilla de verificación12..19: fam_sexo + fam_estadoCivil
  Texto34: null,                  // fam_DD
  Texto35: null,                  // fam_MM
  Texto36: null,                  // fam_YYYY
  Texto37: null,                  // fam_paisNacimiento
  Texto38: null,                  // fam_nombrePadre
  Texto39: null,                  // fam_nombreMadre
  Texto40: null,                  // fam_parentesco

  // ── Apartado 3: Representante presentación ───────────────
  Texto41: "repPresentacionNombre",
  Texto42: "repPresentacionDniNiePas",
  Texto43: "repPresentacionDomicilio",
  Texto44: "repPresentacionNumero",
  Texto45: "repPresentacionPiso",
  Texto46: "repPresentacionLocalidad",
  Texto47: "repPresentacionCodigoPostal",
  Texto48: "repPresentacionProvincia",
  Texto49: "repPresentacionTelefono",
  Texto50: "repPresentacionEmail",
  Texto51: "repPresentacionRepLegal",
  Texto52: "repPresentacionRepDniNiePas",
  Texto53: "repPresentacionRepTitulo",

  // ── Apartado 4: Notificaciones ───────────────────────────
  Texto54: "notifNombre",
  Texto55: "notifDniNiePas",
  Texto56: "notifDomicilio",
  Texto57: "notifNumero",
  Texto58: "notifPiso",
  Texto59: "notifLocalidad",
  Texto60: "notifCodigoPostal",
  Texto61: "notifProvincia",
  Texto62: "notifTelefono",
  Texto63: "notifEmail",
};

export const EX_01_SEXO_CHECKBOXES: Record<string, string> = {
  "Casilla de verificación2": "H",
  "Casilla de verificación3": "M",
  "Casilla de verificación4": "X",
};

export const EX_01_ESTADO_CIVIL_CHECKBOXES: Record<string, string> = {
  "Casilla de verificación5": "soltero",
  "Casilla de verificación6": "casado",
  "Casilla de verificación7": "viudo",
  "Casilla de verificación8": "divorciado",
  "Casilla de verificación9": "pareja_hecho",
};

export const EX_01_HIJOS_CHECKBOXES: Record<string, boolean> = {
  "Casilla de verificación10": true,   // SÍ
  "Casilla de verificación11": false,  // NO
};

export const EX_01_CONSENTIMIENTO_CHECKBOX = "Casilla de verificación20";

export const EX_01_DATE_FIELDS = {
  fechaNacimiento:    { dd: "Texto8",  mm: "Texto9",  yyyy: "Texto10" },
  famFechaNacimiento: { dd: "Texto34", mm: "Texto35", yyyy: "Texto36" },
} as const;
