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
  Texto35: null,                   // esp_primerApellido
  Texto36: null,                   // esp_DNI campo complejo
  Texto37: null,                   // esp_DNI control
  Texto38: null,                   // esp_nombre
  Texto39: null,                   // esp_segundoApellido
  Texto40: null,                   // esp_nacionalidad (campo texto libre)
  // Casilla de verificación54..61: esp_sexo + esp_estadoCivil
  Texto41: null,                   // esp_DD
  Texto42: null,                   // esp_MM
  Texto43: null,                   // esp_YYYY
  Texto44: null,                   // esp_paisNacimiento
  Texto45: null,                   // esp_nombrePadre
  Texto46: null,                   // esp_nombreMadre
  Texto47: null,                   // esp_domicilio
  Texto48: null,                   // esp_numero
  Texto49: null,                   // esp_piso
  Texto50: null,                   // esp_localidad
  Texto51: null,                   // esp_cp
  Texto52: null,                   // esp_provincia
  Texto53: null,                   // esp_parentesco

  // ── Apartado 3: Representante presentación ───────────────
  Texto62: "repPresentacionNombre",
  Texto63: "repPresentacionDniNiePas",
  Texto64: "repPresentacionDomicilio",
  Texto65: "repPresentacionNumero",
  Texto66: "repPresentacionPiso",
  Texto67: "repPresentacionLocalidad",
  Texto68: "repPresentacionCodigoPostal",
  Texto69: "repPresentacionProvincia",
  Texto70: "repPresentacionTelefono",
  Texto71: "repPresentacionEmail",
  Texto72: "repPresentacionRepLegal",
  Texto73: "repPresentacionRepDniNiePas",
  Texto74: "repPresentacionRepTitulo",

  // ── Apartado 4: Notificaciones ───────────────────────────
  Texto75: "notifNombre",
  Texto76: "notifDniNiePas",
  Texto77: "notifDomicilio",
  Texto78: "notifNumero",
  Texto79: "notifPiso",
  Texto80: "notifLocalidad",
  Texto81: "notifCodigoPostal",
  Texto82: "notifProvincia",
  Texto83: "notifTelefono",
  Texto84: "notifEmail",
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
export const EX_24_ESP_SEXO_CHECKBOXES: Record<string, string> = {
  "Casilla de verificación54": "H",
  "Casilla de verificación55": "M",
  "Casilla de verificación56": "X",
};
export const EX_24_ESP_ESTADO_CIVIL_CHECKBOXES: Record<string, string> = {
  "Casilla de verificación57": "soltero",
  "Casilla de verificación58": "casado",
  "Casilla de verificación59": "viudo",
  "Casilla de verificación60": "divorciado",
  "Casilla de verificación61": "pareja_hecho",
};
export const EX_24_CONSENTIMIENTO_CHECKBOX = "Casilla de verificación85";
export const EX_24_DATE_FIELDS = {
  fechaNacimiento:    { dd: "Texto8",  mm: "Texto9",  yyyy: "Texto10" },
  espFechaNacimiento: { dd: "Texto41", mm: "Texto42", yyyy: "Texto43" },
} as const;
