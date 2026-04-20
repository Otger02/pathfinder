/**
 * EX-00 field mapping.
 *
 * Maps PersonalData fields to the AcroForm field names in the official
 * EX-00 PDF (Solicitud genérica de comunicaciones y autorizaciones).
 *
 * EX-00 uses descriptive (but sometimes surprising) AcroForm field names —
 * e.g. a field named "Piso" is repurposed as the email input, and a field
 * named "Email" holds the código postal.
 *
 * Field names discovered via scripts/inspect-pdf-field-positions.ts.
 * EX-00 structure (2+ pages):
 *   Page 1: Apartado 1 (Solicitante) + Apartado 2 (Datos familiares)
 *           + Apartado 3 (Domicilio en España / Notificaciones)
 */

import type { PersonalDataField } from "@/lib/types/personal-data";

/**
 * Text field mapping: PDF field name → PersonalData field key.
 *
 * EX-00 Page 1 — Apartado 1: DATOS DEL SOLICITANTE
 *   Row Y~638: Textfield=primerApellido  Textfield-1=segundoApellido  Textfield-2=NIE
 *   Row Y~619: N=nombre                  x=nacionalidad
 *   Row Y~601: Textfield-3=nombrePadre   (H / M checkboxes = sexo)
 *   Row Y~583: "Fecha de nacimientoz"=DD  "Texto-1"=MM  Textfield-4=YYYY
 *              "Estado civil3 S"=lugarNacimiento  Textfield-5=paisNacimiento
 *   Row Y~564: Textfield-6=numeroDocumento  (C/V/D/Sp/ChkBox-0 = tipoDocumento)
 *   Row Y~546: Textfield-8=telefono  Piso=email
 *   Row Y~528: CP=domicilio (país origen)
 *   Row Y~510: Textfield-12=localidad(origen)  Textfield-13=CP(origen)  Textfield-15=provincia(origen)
 *   Row Y~492: Textfield-17=telefono(?)  "D NIN IEPAS"=NIE/pasaporte(?)
 *
 * EX-00 Page 1 — Apartado 3: DOMICILIO EN ESPAÑA / NOTIFICACIONES
 *   Row Y~252: Textfield-40=NIE solicitante
 *   Row Y~235: Textfield-42=domicilio  Textfield-43=número  Textfield-44=piso
 *   Row Y~218: Textfield-45=localidad  Email=codigoPostal  Textfield-47=provincia
 *   Row Y~201: Textfield-48=telefono   Textfield-51=email
 */
export const EX_00_TEXT_FIELDS: Record<string, PersonalDataField | null> = {
  // ── Apartado 1: Solicitante ────────────────────────────────────────────
  // Row Y~638
  Textfield: "primerApellido",
  "Textfield-1": "segundoApellido",
  "Textfield-2": "nie",

  // Row Y~619
  N: "nombre",           // field named "N" holds nombre
  x: "nacionalidad",     // field named "x" holds nacionalidad

  // Row Y~601
  "Textfield-3": "nombrePadre",

  // Row Y~583 – date parts are handled via DATE_FIELDS; listed here as null
  "Fecha de nacimientoz": null,  // DD
  "Texto-1": null,               // MM
  "Textfield-4": null,           // YYYY
  "Estado civil3 S": "lugarNacimiento",
  "Textfield-5": "paisNacimiento",

  // Row Y~564
  "Textfield-6": "numeroDocumento",

  // Row Y~546 — PDF reuses "Piso" as the email field
  "Textfield-8": "telefono",
  Piso: "email",

  // Row Y~528 — domicilio en país de origen (no PersonalData counterpart)
  CP: null,              // domicilio (país origen)

  // Row Y~510
  "Textfield-12": null,  // localidad (país origen)
  "Textfield-13": null,  // CP (país origen)
  "Textfield-15": null,  // provincia (país origen)

  // Row Y~492
  "Textfield-17": null,  // telefono duplicate row — purpose unclear
  "D NIN IEPAS": null,   // NIE / número de pasaporte — unsure of exact use

  // ── Apartado 3: Domicilio en España / Notificaciones ─────────────────
  // Row Y~252
  "Textfield-40": "nie",

  // Row Y~235
  "Textfield-42": "domicilio",
  "Textfield-43": null,  // número (portal)
  "Textfield-44": null,  // piso

  // Row Y~218 — PDF reuses "Email" as the código postal field
  "Textfield-45": "localidad",
  Email: "codigoPostal",
  "Textfield-47": "provincia",

  // Row Y~201
  "Textfield-48": "telefono",
  "Textfield-51": "email",
};

/**
 * Checkbox mapping for sexo.
 * Y~601: H = Hombre, M = Mujer
 */
export const EX_00_SEXO_CHECKBOXES: Record<string, string> = {
  H: "H",  // Hombre
  M: "M",  // Mujer
};

/**
 * Checkbox mapping for tipo de documento.
 * Y~564: C=Pasaporte, V=Título de viaje, D=Cédula, Sp=Doc identidad, ChkBox-0=NIE
 */
export const EX_00_TIPO_DOC_CHECKBOXES: Record<string, string> = {
  C: "pasaporte",
  V: "titulo",    // Título de viaje
  D: "cedula",    // Cédula de identidad
  Sp: "doc",      // Documento de identidad
  "ChkBox-0": "nie",
};

/**
 * Estado civil not auto-filled for EX-00.
 * The form has no estado civil section for the solicitante.
 */
export const EX_00_ESTADO_CIVIL_CHECKBOXES: Record<string, string> = {};

/**
 * EX-00 has no circunstancia excepcional checkboxes.
 */
export const EX_00_CIRCUNSTANCIA_CHECKBOXES: Record<string, string> = {};

/**
 * Date field mapping for fecha de nacimiento.
 * Split into DD / MM / YYYY across three separate AcroForm fields.
 */
export const EX_00_DATE_FIELDS = {
  fechaNacimiento: {
    dd: "Fecha de nacimientoz",  // note: "z" suffix is a typo in the original PDF
    mm: "Texto-1",
    yyyy: "Textfield-4",
  },
} as const;
