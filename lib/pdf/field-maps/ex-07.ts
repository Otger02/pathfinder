/**
 * EX-07 field mapping.
 *
 * Maps PersonalData fields to the AcroForm field names in the official
 * EX-07 PDF (Solicitud de autorización de residencia temporal y trabajo
 * por cuenta propia).
 *
 * Field names discovered via scripts/inspect-pdf-field-positions.ts.
 * EX-07 uses descriptive field names (e.g. "Textfield-1", "Piso", "Email")
 * rather than the generic "Texto1" pattern of other EX forms.
 * EX-07 structure (page 1):
 *   Apartado 1: Datos del solicitante
 *   Apartado 3: Domicilio en España / Notificaciones
 */

import type { PersonalDataField } from "@/lib/types/personal-data";

/**
 * Text field mapping: PDF field name → PersonalData field key.
 *
 * Page 1 — Apartado 1: DATOS DEL SOLICITANTE
 *   Row Y~665: Textfield-1=primerApellido  Textfield-3=segundoApellido  Textfield-4=NIE
 *   Row Y~647: Textfield-8=nombre          x=nacionalidad (field name uncertain)
 *   Row Y~629: Textfield-5=nombrePadre     (H=sexoH, M=sexoM checkboxes)
 *   Row Y~611: "Fecha de nacimientoz"=DD  "Texto-1"=MM  Textfield-6=YYYY
 *              "Estado civil3 S"=lugarNacimiento  Textfield-7=paisNacimiento
 *   Row Y~592: Textfield-9=numeroDocumento  (C/V/D/Sp/ChkBox-0=tipoDocumento)
 *   Row Y~574: Textfield-10=telefono  Piso=email (field name reused from address section)
 *   Row Y~556: Provincia=domicilio (país origen — field name reused from address section)
 *   Row Y~537: Textfield-14=localidad (origen)  Textfield-16=CP (origen)  Textfield-17=provincia (origen)
 *
 * Page 1 — Apartado 3: DOMICILIO EN ESPAÑA / NOTIFICACIONES
 *   Row Y~263: Textfield-41=NIE  Piso-0=delegación (field name uncertain)
 *   Row Y~246: Provincia-1=domicilio (reused name)  Textfield-42=número  Textfield-43=piso
 *   Row Y~229: Email=localidad (reused name)  Textfield-45=CP  Textfield-47=provincia
 *   Row Y~212: Textfield-48=telefono  Titulo=email (field name uncertain)
 *
 * NOTE: EX-07 reuses field names like "Piso", "Provincia", "Email", "Titulo"
 * in unexpected positions. Mappings for these are flagged as uncertain.
 */
export const EX_07_TEXT_FIELDS: Record<string, PersonalDataField | null> = {
  // ── Apartado 1: Solicitante ─────────────────────────────
  "Textfield-1": "primerApellido",
  "Textfield-3": "segundoApellido",
  "Textfield-4": "nie",            // NIE field on the identity row
  "Textfield-8": "nombre",
  x: null,                         // nacionalidad — field name "x" is uncertain
  "Textfield-5": "nombrePadre",
  // Date fields — handled specially (DD/MM/YYYY split)
  "Fecha de nacimientoz": null,    // DD — field name unusual, verify against PDF
  "Texto-1":               null,   // MM
  "Textfield-6":           null,   // YYYY
  "Estado civil3 S": "lugarNacimiento", // field name reused — verify against PDF
  "Textfield-7": "paisNacimiento",
  "Textfield-9": "numeroDocumento",
  "Textfield-10": "telefono",
  Piso: "email",                   // field name reused in contact row — verify
  Provincia: null,                 // domicilio país origen — field name reused, no PersonalData equivalent
  "Textfield-14": null,            // localidad país origen — no PersonalData equivalent
  "Textfield-16": null,            // CP país origen — no PersonalData equivalent
  "Textfield-17": null,            // provincia país origen — no PersonalData equivalent

  // ── Apartado 3: Domicilio en España ─────────────────────
  "Textfield-41": "nie",           // NIE del solicitante
  "Piso-0": null,                  // delegación/oficina — field name uncertain
  "Provincia-1": "domicilio",      // field name reused — verify against PDF
  "Textfield-42": null,            // número (calle) — no PersonalData equivalent
  "Textfield-43": null,            // piso — no PersonalData equivalent
  Email: "localidad",              // field name reused — verify against PDF
  "Textfield-45": "codigoPostal",
  "Textfield-47": "provincia",
  "Textfield-48": "telefono",
  Titulo: "email",                 // field name reused — verify against PDF
};

/**
 * Checkbox mapping for sexo.
 * Checkboxes on page 1, Y~629.
 * EX-07 uses single-letter field names: H = Hombre, M = Mujer.
 */
export const EX_07_SEXO_CHECKBOXES: Record<string, string> = {
  H: "H", // Hombre
  M: "M", // Mujer
};

/**
 * Checkbox mapping for tipo de documento.
 * Checkboxes on page 1, Y~592.
 *   C = Pasaporte, V = Título de viaje, D = Cédula,
 *   Sp = Documento identidad, ChkBox-0 = NIE
 */
export const EX_07_TIPO_DOC_CHECKBOXES: Record<string, string> = {
  C:          "pasaporte",
  "ChkBox-0": "nie",
};

/**
 * Checkbox mapping for estado civil.
 * EX-07 does not include an estado civil section.
 */
export const EX_07_ESTADO_CIVIL_CHECKBOXES: Record<string, string> = {};

/**
 * Checkbox mapping for circunstancias excepcionales.
 * Not applicable to EX-07.
 */
export const EX_07_CIRCUNSTANCIA_CHECKBOXES: Record<string, string> = {};

/**
 * Date field mapping for fecha de nacimiento.
 * Split into DD ("Fecha de nacimientoz"), MM ("Texto-1"), YYYY ("Textfield-6").
 * Note: field names are unusual — verify against the actual PDF.
 */
export const EX_07_DATE_FIELDS = {
  fechaNacimiento: {
    dd:   "Fecha de nacimientoz",
    mm:   "Texto-1",
    yyyy: "Textfield-6",
  },
} as const;
