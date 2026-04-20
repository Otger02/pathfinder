/**
 * EX-01 field mapping.
 *
 * Maps PersonalData fields to the AcroForm field names in the official
 * EX-01 PDF (Solicitud de autorización de estancia por estudios, movilidad
 * de alumnos, prácticas no laborales e intercambio).
 *
 * EX-01 uses generic "TextoN" / "Casilla de verificaciónN" field names,
 * the same convention as EX-10.
 *
 * Field names discovered via scripts/inspect-pdf-field-positions.ts.
 * EX-01 structure (2+ pages):
 *   Page 1: Apartado 1 (Solicitante) + Apartado 2 (Representante)
 *           + Apartado 3 (Domicilio en España / Notificaciones)
 */

import type { PersonalDataField } from "@/lib/types/personal-data";

/**
 * Text field mapping: PDF field name → PersonalData field key.
 *
 * EX-01 Page 1 — Apartado 1: DATOS DEL SOLICITANTE
 *   Row Y~661: Texto1=primerApellido  Texto3=segundoApellido  Texto4=NIE
 *   Row Y~642: Texto5=nombre           Texto6=nacionalidad
 *   Row Y~623: Texto7=nombrePadre      (checkboxes 2/3 = sexo)
 *   Row Y~605: Texto8=DD  Texto9=MM  Texto10=YYYY
 *              Texto11=lugarNacimiento  Texto12=paisNacimiento
 *   Row Y~587: Texto13=numeroDocumento  (checkboxes 5-9 = tipoDocumento)
 *   Row Y~569: Texto14=telefono  Texto15=email
 *   Row Y~551: Texto16=domicilio (país origen)
 *   Row Y~532: Texto19=localidad(origen)  Texto20=CP(origen)  Texto21=provincia(origen)
 *
 * EX-01 Page 1 — Apartado 2: REPRESENTANTE LEGAL
 *   Row Y~419: Texto27=primerApellido(rep)
 *   Row Y~?:   Texto31=nombre(rep)  Texto33=documento(rep)
 *
 * EX-01 Page 1 — Apartado 3: DOMICILIO EN ESPAÑA / NOTIFICACIONES
 *   Row Y~261: Texto41=NIE solicitante  Texto42=delegación
 *   Row Y~244: Texto43=domicilio  Texto44=número  Texto45=piso
 *   Row Y~227: Texto46=localidad  Texto47=CP  Texto48=provincia
 *   Row Y~210: Texto49=telefono   Texto50=email
 *   Row Y~193: Texto51=? (fecha entrada)
 */
export const EX_01_TEXT_FIELDS: Record<string, PersonalDataField | null> = {
  // ── Apartado 1: Solicitante ────────────────────────────────────────────
  // Row Y~661
  Texto1: "primerApellido",
  Texto3: "segundoApellido",
  Texto4: "nie",

  // Row Y~642
  Texto5: "nombre",
  Texto6: "nacionalidad",

  // Row Y~623
  Texto7: "nombrePadre",

  // Row Y~605 – date parts handled via DATE_FIELDS; listed here as null
  Texto8: null,   // DD
  Texto9: null,   // MM
  Texto10: null,  // YYYY
  Texto11: "lugarNacimiento",
  Texto12: "paisNacimiento",

  // Row Y~587
  Texto13: "numeroDocumento",

  // Row Y~569
  Texto14: "telefono",
  Texto15: "email",

  // Row Y~551 — domicilio en país de origen (no PersonalData counterpart)
  Texto16: null,  // domicilio (país origen)

  // Row Y~532
  Texto19: null,  // localidad (país origen)
  Texto20: null,  // CP (país origen)
  Texto21: null,  // provincia (país origen)

  // ── Apartado 2: Representante legal ───────────────────────────────────
  Texto27: null,  // rep primerApellido
  Texto31: null,  // rep nombre
  Texto33: null,  // rep documento

  // ── Apartado 3: Domicilio en España / Notificaciones ─────────────────
  // Row Y~261
  Texto41: "nie",
  Texto42: null,  // delegación

  // Row Y~244
  Texto43: "domicilio",
  Texto44: null,  // número (portal)
  Texto45: null,  // piso

  // Row Y~227
  Texto46: "localidad",
  Texto47: "codigoPostal",
  Texto48: "provincia",

  // Row Y~210
  Texto49: "telefono",
  Texto50: "email",

  // Row Y~193
  Texto51: null,  // fecha de entrada — purpose unclear
};

/**
 * Checkbox mapping for sexo.
 * Y~623: checkboxes 2 = Hombre, 3 = Mujer
 */
export const EX_01_SEXO_CHECKBOXES: Record<string, string> = {
  "Casilla de verificación2": "H",  // Hombre
  "Casilla de verificación3": "M",  // Mujer
};

/**
 * Checkbox mapping for tipo de documento.
 * Y~587: checkbox 5=Pasaporte, checkbox 9=NIE
 * (checkboxes 6-8 cover other document types; unmapped until confirmed)
 */
export const EX_01_TIPO_DOC_CHECKBOXES: Record<string, string> = {
  "Casilla de verificación5": "pasaporte",
  "Casilla de verificación9": "nie",
};

/**
 * Estado civil not auto-filled for EX-01.
 * The form does contain estado civil checkboxes (12=soltero, 13=casado,
 * 14=viudo, 16=divorciado) but they are not currently wired for auto-fill.
 */
export const EX_01_ESTADO_CIVIL_CHECKBOXES: Record<string, string> = {};

/**
 * EX-01 has no circunstancia excepcional checkboxes.
 */
export const EX_01_CIRCUNSTANCIA_CHECKBOXES: Record<string, string> = {};

/**
 * Date field mapping for fecha de nacimiento.
 * Split into DD (Texto8), MM (Texto9), YYYY (Texto10).
 */
export const EX_01_DATE_FIELDS = {
  fechaNacimiento: {
    dd: "Texto8",
    mm: "Texto9",
    yyyy: "Texto10",
  },
} as const;
