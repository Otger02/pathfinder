/**
 * EX-03 field mapping.
 *
 * Maps PersonalData fields to the AcroForm field names in the official
 * EX-03 PDF (Solicitud de autorización de residencia temporal por
 * reagrupación familiar — el familiar en España presenta esta solicitud).
 *
 * EX-03 uses descriptive AcroForm field names, closely matching EX-00/EX-02.
 * Notable quirks:
 *   - "Feccha de nacimientoz" (double-c typo, same as EX-02)
 *   - Field named "Lugar" at Y~642 whose exact purpose (nombrePadre vs
 *     lugarNacimiento) is ambiguous — mapped null with a comment.
 *   - Fields named "Piso-0", "Provincia-0", "Email-1", "Titulo-0" in
 *     Apartado 3 hold street address / localidad / email respectively.
 *
 * Field names discovered via scripts/inspect-pdf-field-positions.ts.
 * EX-03 structure (2+ pages):
 *   Page 1: Apartado 1 (Solicitante) + Apartado 3 (Domicilio en España)
 */

import type { PersonalDataField } from "@/lib/types/personal-data";

/**
 * Text field mapping: PDF field name → PersonalData field key.
 *
 * EX-03 Page 1 — Apartado 1: DATOS DEL SOLICITANTE
 *   Row Y~679: Textfield-8=primerApellido  Textfield-1=segundoApellido  Textfield-2=NIE
 *   Row Y~661: Textfield-3=nombre           Textfield-5=nacionalidad
 *   Row Y~642: Lugar=? (nombrePadre or lugarNacimiento — ambiguous)
 *              (H / M checkboxes = sexo)
 *   Row Y~624: "Feccha de nacimientoz"=DD  "Texto-1"=MM  Textfield-6=YYYY
 *              "Estado civil3t S"=lugarNacimiento  Textfield-7=paisNacimiento
 *   Row Y~606: Textfield-10=numeroDocumento  (C/V/D/Sp/ChkBox-0 = tipoDocumento)
 *   Row Y~588: Textfield-11=telefono  Piso=email
 *   Row Y~569: Textfield-12=domicilio (país origen)
 *   Row Y~551: Email=localidad(origen)  Textfield-15=CP(origen)
 *              Textfield-16=provincia(origen)
 *
 * EX-03 Page 1 — Apartado 3: DOMICILIO EN ESPAÑA / NOTIFICACIONES
 *   Row Y~262: Textfield-42=NIE solicitante  "Piso-0"=delegación
 *   Row Y~245: "Provincia-0"=domicilio  Textfield-43=número  Textfield-44=piso
 *   Row Y~228: "Email-1"=localidad  Textfield-46=CP  Textfield-48=provincia
 *   Row Y~211: Textfield-49=telefono  "Titulo-0"=email
 */
export const EX_03_TEXT_FIELDS: Record<string, PersonalDataField | null> = {
  // ── Apartado 1: Solicitante ────────────────────────────────────────────
  // Row Y~679
  "Textfield-8": "primerApellido",
  "Textfield-1": "segundoApellido",
  "Textfield-2": "nie",

  // Row Y~661
  "Textfield-3": "nombre",
  "Textfield-5": "nacionalidad",

  // Row Y~642
  Lugar: null,  // ambiguous: could be nombrePadre or lugarNacimiento — verify against PDF

  // Row Y~624 – date parts handled via DATE_FIELDS; listed here as null
  "Feccha de nacimientoz": null,   // DD (double-c typo is in the original PDF)
  "Texto-1": null,                 // MM
  "Textfield-6": null,             // YYYY
  "Estado civil3t S": "lugarNacimiento",
  "Textfield-7": "paisNacimiento",

  // Row Y~606
  "Textfield-10": "numeroDocumento",

  // Row Y~588 — PDF reuses "Piso" as the email field
  "Textfield-11": "telefono",
  Piso: "email",

  // Row Y~569 — domicilio en país de origen (no PersonalData counterpart)
  "Textfield-12": null,  // domicilio (país origen)

  // Row Y~551 — PDF reuses "Email" as a localidad (país origen) field
  Email: null,           // localidad (país origen) — field named "Email"
  "Textfield-15": null,  // CP (país origen)
  "Textfield-16": null,  // provincia (país origen)

  // ── Apartado 3: Domicilio en España / Notificaciones ─────────────────
  // Row Y~262
  "Textfield-42": "nie",
  "Piso-0": null,          // delegación

  // Row Y~245 — PDF reuses "Provincia-0" as the street/domicilio field
  "Provincia-0": "domicilio",
  "Textfield-43": null,    // número (portal)
  "Textfield-44": null,    // piso

  // Row Y~228
  "Email-1": "localidad",  // PDF field named "Email-1" holds localidad
  "Textfield-46": "codigoPostal",
  "Textfield-48": "provincia",

  // Row Y~211
  "Textfield-49": "telefono",
  "Titulo-0": "email",     // PDF field named "Titulo-0" holds email
};

/**
 * Checkbox mapping for sexo.
 * Y~642: H = Hombre, M = Mujer
 */
export const EX_03_SEXO_CHECKBOXES: Record<string, string> = {
  H: "H",  // Hombre
  M: "M",  // Mujer
};

/**
 * Checkbox mapping for tipo de documento.
 * Y~606: C=Pasaporte, V=Título de viaje, D=Cédula, Sp=Doc identidad, ChkBox-0=NIE
 */
export const EX_03_TIPO_DOC_CHECKBOXES: Record<string, string> = {
  C: "pasaporte",
  V: "titulo",    // Título de viaje
  D: "cedula",    // Cédula de identidad
  Sp: "doc",      // Documento de identidad
  "ChkBox-0": "nie",
};

/**
 * Estado civil not auto-filled for EX-03.
 */
export const EX_03_ESTADO_CIVIL_CHECKBOXES: Record<string, string> = {};

/**
 * EX-03 has no circunstancia excepcional checkboxes.
 */
export const EX_03_CIRCUNSTANCIA_CHECKBOXES: Record<string, string> = {};

/**
 * Date field mapping for fecha de nacimiento.
 * Split into DD / MM / YYYY across three separate AcroForm fields.
 * Note: "Feccha" is a typo present in the original PDF.
 */
export const EX_03_DATE_FIELDS = {
  fechaNacimiento: {
    dd: "Feccha de nacimientoz",  // typo is intentional — matches the PDF
    mm: "Texto-1",
    yyyy: "Textfield-6",
  },
} as const;
