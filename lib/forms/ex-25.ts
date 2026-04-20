/**
 * EX-25 — Solicitud de residencia temporal y desplazamiento temporal de menores extranjeros
 * 3 pages, 104 fields. Texto157..Texto234 naming (offset numbering).
 */
import type { PersonalDataField } from "@/lib/types/personal-data";

export const EX_25_TEXT_FIELDS: Record<string, PersonalDataField | null> = {
  // ── Apartado 1: Menor solicitante ────────────────────────
  Texto157: "primerApellido",
  Texto158: null,                  // NIE letra
  Texto159: "nie",
  Texto160: null,                  // NIE control
  Texto161: "nombre",
  Texto162: "segundoApellido",
  Texto163: "nacionalidad",
  Texto164: null,                  // DD
  Texto165: null,                  // MM
  Texto166: null,                  // YYYY
  Texto167: "lugarNacimiento",
  Texto168: "paisNacimiento",
  Texto169: "domicilio",           // campo largo único en este formulario
  Texto170: "nombrePadre",
  Texto171: "nombreMadre",
  Texto172: "domicilio",
  Texto173: "numeroDomicilio",
  Texto174: "pisoDomicilio",
  Texto175: "localidad",
  Texto177: "codigoPostal",
  Texto178: "provincia",
  Texto176: "telefono",
  Texto179: "email",
  Texto180: "representanteLegal",
  Texto181: "representanteDniNiePas",
  Texto182: "representanteTitulo",

  // ── Apartado 2: Entidad/persona que tutela o promueve ────
  Texto183: null,                  // tutor_nombre
  Texto184: null,                  // tutor_dniNiePas
  Texto185: null,                  // tutor_naturaleza
  Texto186: null,                  // tutor_relacionMenor
  Texto187: null,                  // tutor_domicilio
  Texto188: null,                  // tutor_numero
  Texto189: null,                  // tutor_piso
  Texto190: null,                  // tutor_localidad
  Texto191: null,                  // tutor_cp
  Texto192: null,                  // tutor_provincia
  Texto193: null,                  // tutor_telefono
  Texto194: null,                  // tutor_email
  Texto195: null,                  // tutor_repLegal
  Texto196: null,                  // tutor_repDni
  Texto197: null,                  // tutor_repTitulo

  // ── Apartado 3: Representante presentación ───────────────
  Texto198: "repPresentacionNombre",
  Texto199: "repPresentacionDniNiePas",
  Texto200: "repPresentacionDomicilio",
  Texto201: "repPresentacionNumero",
  Texto202: "repPresentacionPiso",
  Texto203: "repPresentacionLocalidad",
  Texto204: "repPresentacionCodigoPostal",
  Texto205: "repPresentacionProvincia",
  Texto206: "repPresentacionTelefono",
  Texto207: "repPresentacionEmail",
  Texto208: "repPresentacionRepLegal",
  Texto209: "repPresentacionRepDniNiePas",
  Texto210: "repPresentacionRepTitulo",

  // ── Apartado 4: Notificaciones ───────────────────────────
  Texto211: "notifNombre",
  Texto212: "notifDniNiePas",
  Texto213: "notifDomicilio",
  Texto214: "notifNumero",
  Texto215: "notifPiso",
  Texto216: "notifLocalidad",
  Texto217: "notifCodigoPostal",
  Texto218: "notifProvincia",
  Texto219: "notifTelefono",
  Texto220: "notifEmail",
};

export const EX_25_SEXO_CHECKBOXES: Record<string, string> = {
  "Casilla de verificación235": "H",
  "Casilla de verificación236": "M",
  "Casilla de verificación237": "X",
};
export const EX_25_CONSENTIMIENTO_CHECKBOX = "Casilla de verificación260";
export const EX_25_DATE_FIELDS = {
  fechaNacimiento: { dd: "Texto164", mm: "Texto165", yyyy: "Texto166" },
} as const;
