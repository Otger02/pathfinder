/**
 * EX-02 field mapping.
 *
 * Maps PersonalData fields to the AcroForm field names in the official
 * EX-02 PDF (Solicitud de autorización de residencia por reagrupación
 * familiar — el familiar reagrupado presenta esta solicitud).
 *
 * EX-02 uses descriptive AcroForm field names, closely matching EX-00.
 * Notable quirks: "Feccha de nacimientoz" (double-c typo in the original PDF),
 * and a field named "Email" that holds the localidad (España).
 *
 * The form includes an additional section for the reagrupado (family member)
 * between Y~436 and Y~309; those fields are not yet mapped here.
 *
 * Field names discovered via scripts/inspect-pdf-field-positions.ts.
 * EX-02 structure (2+ pages):
 *   Page 1: Apartado 1 (Solicitante) + Apartado 2 (Reagrupado)
 *           + Apartado 3 (Domicilio en España / Notificaciones)
 */

import type { PersonalDataField } from "@/lib/types/personal-data";

/**
 * Text field mapping: PDF field name → PersonalData field key.
 *
 * EX-02 Page 1 — Apartado 1: DATOS DEL SOLICITANTE
 *   Row Y~672: Textfield=primerApellido  Textfield-1=segundoApellido  Textfield-2=NIE
 *   Row Y~654: Textfield-7=nombre         x=nacionalidad
 *   Row Y~636: Textfield-3=nombrePadre    (H / M checkboxes = sexo)
 *   Row Y~617: "Feccha de nacimientoz"=DD  "Texto-1"=MM  Textfield-4=YYYY
 *              "Estado civil3 S"=lugarNacimiento  Textfield-5=paisNacimiento
 *   Row Y~599: Textfield-8=numeroDocumento  (C/V/D/Sp/ChkBox-0 = tipoDocumento)
 *   Row Y~581: Textfield-9=telefono  Piso=email
 *   Row Y~562: CP=domicilio (país origen)
 *   Row Y~544: Textfield-13=localidad(origen)  Textfield-15=CP(origen)
 *              Textfield-16=provincia(origen)
 *
 * EX-02 Page 1 — Apartado 3: DOMICILIO EN ESPAÑA / NOTIFICACIONES
 *   Row Y~248: Textfield-42=NIE solicitante  Textfield-43=delegación
 *   Row Y~231: Textfield-44=domicilio  Textfield-45=número  Textfield-46=piso
 *   Row Y~214: Email=localidad  Textfield-48=CP  Textfield-49=provincia
 *   Row Y~197: Textfield-50=telefono  Textfield-52=email
 */
export const EX_02_TEXT_FIELDS: Record<string, PersonalDataField | null> = {
  // ── Apartado 1: Solicitante ────────────────────────────────────────────
  // Row Y~672
  Textfield: "primerApellido",
  "Textfield-1": "segundoApellido",
  "Textfield-2": "nie",

  // Row Y~654
  "Textfield-7": "nombre",
  x: "nacionalidad",     // field named "x" holds nacionalidad

  // Row Y~636
  "Textfield-3": "nombrePadre",

  // Row Y~617 – date parts handled via DATE_FIELDS; listed here as null
  "Feccha de nacimientoz": null,  // DD (double-c typo is in the original PDF)
  "Texto-1": null,                // MM
  "Textfield-4": null,            // YYYY
  "Estado civil3 S": "lugarNacimiento",
  "Textfield-5": "paisNacimiento",

  // Row Y~599
  "Textfield-8": "numeroDocumento",

  // Row Y~581 — PDF reuses "Piso" as the email field
  "Textfield-9": "telefono",
  Piso: "email",

  // Row Y~562 — domicilio en país de origen (no PersonalData counterpart)
  CP: null,               // domicilio (país origen)

  // Row Y~544
  "Textfield-13": null,   // localidad (país origen)
  "Textfield-15": null,   // CP (país origen)
  "Textfield-16": null,   // provincia (país origen)

  // ── Apartado 3: Domicilio en España / Notificaciones ─────────────────
  // Row Y~248
  "Textfield-42": "nie",
  "Textfield-43": null,   // delegación

  // Row Y~231
  "Textfield-44": "domicilio",
  "Textfield-45": null,   // número (portal)
  "Textfield-46": null,   // piso

  // Row Y~214 — PDF reuses "Email" as the localidad field
  Email: "localidad",
  "Textfield-48": "codigoPostal",
  "Textfield-49": "provincia",

  // Row Y~197
  "Textfield-50": "telefono",
  "Textfield-52": "email",
};

/**
 * Checkbox mapping for sexo.
 * Y~636: H = Hombre, M = Mujer
 */
export const EX_02_SEXO_CHECKBOXES: Record<string, string> = {
  H: "H",  // Hombre
  M: "M",  // Mujer
};

/**
 * Checkbox mapping for tipo de documento.
 * Y~599: C=Pasaporte, V=Título de viaje, D=Cédula, Sp=Doc identidad, ChkBox-0=NIE
 */
export const EX_02_TIPO_DOC_CHECKBOXES: Record<string, string> = {
  C: "pasaporte",
  V: "titulo",    // Título de viaje
  D: "cedula",    // Cédula de identidad
  Sp: "doc",      // Documento de identidad
  "ChkBox-0": "nie",
};

/**
 * Estado civil not auto-filled for EX-02.
 * The reagrupado section (Y~436–309) contains estado civil checkboxes
 * (H-0 / M-0 for sexo, and others for civil status), but their exact
 * AcroForm field names and values are unconfirmed. Left empty until the
 * reagrupado section is fully mapped.
 */
export const EX_02_ESTADO_CIVIL_CHECKBOXES: Record<string, string> = {};

/**
 * EX-02 has no circunstancia excepcional checkboxes.
 */
export const EX_02_CIRCUNSTANCIA_CHECKBOXES: Record<string, string> = {};

/**
 * Date field mapping for fecha de nacimiento.
 * Split into DD / MM / YYYY across three separate AcroForm fields.
 * Note: "Feccha" is a typo present in the original PDF.
 */
export const EX_02_DATE_FIELDS = {
  fechaNacimiento: {
    dd: "Feccha de nacimientoz",  // typo is intentional — matches the PDF
    mm: "Texto-1",
    yyyy: "Textfield-4",
  },
} as const;
