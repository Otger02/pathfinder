/**
 * EX-11 field mapping.
 *
 * Maps PersonalData fields to the AcroForm field names in the official
 * EX-11 PDF (Solicitud de autorización de residencia temporal por
 * reagrupación familiar).
 *
 * Field names discovered via scripts/inspect-pdf-field-positions.ts.
 * EX-11 uses descriptive field names (e.g. "Textfield-2", "Fecha de nacimientoz").
 *
 * EX-11 structure (page 1):
 *   Apartado 1 (Solicitante) — Y~638 → Y~477
 *   Apartado 2 (Representante legal) — Y~384 → Y~317
 *   Apartado 3 (Domicilio en España / Notificaciones) — Y~240 → Y~189
 */

import type { PersonalDataField } from "@/lib/types/personal-data";

/**
 * Text field mapping: PDF field name → PersonalData field key.
 *
 * EX-11 Page 1 — Apartado 1: DATOS DEL SOLICITANTE
 *   Row Y~638: "Textfield-2"=primerApellido  "Textfield-4"=segundoApellido  "Textfield-5"=NIE
 *   Row Y~618: CP=nombre  "x H"=nacionalidad
 *   Row Y~601: "Textfield-6"=nombrePadre  (M checkbox=sexoM, see SEXO_CHECKBOXES)
 *   Row Y~583: "Fecha de nacimientoz"=DD  "Texto-1"=MM  "Textfield-8"=YYYY
 *              "Estado civil3 S"=lugarNacimiento  "Textfield-9"=paisNacimiento
 *   Row Y~564: "Textfield-10"=numeroDocumento  (tipo doc checkboxes)
 *   Row Y~546: "Textfield-12"=telefono  Piso=email
 *   Row Y~528: Provincia=domicilio (país origen)
 *   Row Y~510: "Textfield-15"=localidad(origen)  "Textfield-17"=CP(origen)  "Textfield-19"=provincia(origen)
 *   Row Y~492: "Textfield-20"=telefono2  "DN IN IEPAS"=NIE (duplicate)
 *   Row Y~477: "Textfield-24"=fechaEntrada  "Textfield-26"=CP  "Textfield-28"=prov
 *
 * EX-11 Page 1 — Apartado 2: REPRESENTANTE LEGAL
 *   Row Y~384: "Textfield-30"=rep primerApellido  (etc.)
 *
 * EX-11 Page 1 — Apartado 3: DOMICILIO EN ESPAÑA / NOTIFICACIONES
 *   Row Y~240: "Textfield-44"=NIE solicitante  "N Piso"=delegacion
 *   Row Y~223: "Provincia-1"=domicilio  "Textfield-46"=número  "Textfield-47"=piso
 *   Row Y~206: "Textfield-48"=localidad  "Textfield-49"=codigoPostal  "Textfield-51"=provincia
 *   Row Y~189: "Textfield-53"=telefono  "Textfield-54"=email
 */
export const EX_11_TEXT_FIELDS: Record<string, PersonalDataField | null> = {
  // ── Apartado 1: Solicitante ─────────────────────────────
  "Textfield-2": "primerApellido",
  "Textfield-4": "segundoApellido",
  "Textfield-5": "nie",
  CP: "nombre",
  "x H": "nacionalidad",
  "Textfield-6": "nombrePadre",
  // Date of birth — handled by DATE_FIELDS (DD/MM/YYYY split)
  "Fecha de nacimientoz": null, // DD
  "Texto-1": null,              // MM
  "Textfield-8": null,          // YYYY
  // "Estado civil3 S" is used as lugarNacimiento field (unusual name)
  "Estado civil3 S": "lugarNacimiento",
  "Textfield-9": "paisNacimiento",
  "Textfield-10": "numeroDocumento",
  "Textfield-12": "telefono",
  Piso: "email",
  Provincia: "domicilio",       // domicilio país origen

  // ── Apartado 1: Domicilio en país de origen ──────────────
  "Textfield-15": "localidad",  // localidad (origen)
  "Textfield-17": "codigoPostal", // CP (origen) — null if not in PersonalData
  "Textfield-19": "provincia",  // provincia (origen)
  "Textfield-20": null,         // teléfono secundario — not mapped
  "DN IN IEPAS": "nie",         // NIE (duplicate of Textfield-5)

  // ── Apartado 1: Fecha de entrada / Representante notif. ─
  "Textfield-24": null,         // fecha entrada — not in PersonalData
  "Textfield-26": null,         // CP (representante area) — not mapped
  "Textfield-28": null,         // provincia — not mapped

  // ── Apartado 2: Representante legal ─────────────────────
  "Textfield-30": null,         // rep primerApellido — mapped from representanteLegal

  // ── Apartado 3: Domicilio en España ─────────────────────
  "Textfield-44": "nie",        // NIE del solicitante
  "N Piso": null,               // delegación — not in PersonalData
  "Provincia-1": "domicilio",   // domicilio en España
  "Textfield-46": null,         // número — not in PersonalData
  "Textfield-47": null,         // piso — not in PersonalData
  "Textfield-48": "localidad",
  "Textfield-49": "codigoPostal",
  "Textfield-51": "provincia",
  "Textfield-53": "telefono",
  "Textfield-54": "email",
};

/**
 * Checkbox mapping for sexo.
 * Y~601: "Textfield-7" is a TextField rendered as sexo "H" (treated as text above).
 * The M checkbox handles sexo Mujer.
 * ChkBox-0 at Y~564 handles NIE tipo documento.
 *
 * Note: "Textfield-7" is a TextField not a CheckBox, so it is NOT listed here.
 * Set it in TEXT_FIELDS if the value should be "H" when sexo=H.
 */
export const EX_11_SEXO_CHECKBOXES: Record<string, string> = {
  M: "M", // Mujer checkbox at Y~601
  // "Textfield-7" rendered as text sexo H — handled as text field if needed
};

/**
 * Checkbox mapping for tipo de documento.
 * Y~564: C=pasaporte, V=título de viaje, D=cédula, Sp=documento identidad, ChkBox-0=NIE
 */
export const EX_11_TIPO_DOC_CHECKBOXES: Record<string, string> = {
  C: "pasaporte",
  V: "titulo",
  D: "cedula",
  Sp: "doc",
  "ChkBox-0": "nie",
};

/**
 * Checkbox mapping for estado civil.
 * EX-11 does not expose estado civil checkboxes on the standard form.
 */
export const EX_11_ESTADO_CIVIL_CHECKBOXES: Record<string, string> = {};

/**
 * Checkbox mapping for circunstancias excepcionales.
 * Not applicable to EX-11.
 */
export const EX_11_CIRCUNSTANCIA_CHECKBOXES: Record<string, string> = {};

/**
 * Date field mapping for fecha de nacimiento.
 * Split into DD ("Fecha de nacimientoz"), MM ("Texto-1"), YYYY ("Textfield-8").
 */
export const EX_11_DATE_FIELDS = {
  fechaNacimiento: {
    dd: "Fecha de nacimientoz",
    mm: "Texto-1",
    yyyy: "Textfield-8",
  },
} as const;
