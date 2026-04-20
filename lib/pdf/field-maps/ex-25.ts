/**
 * EX-25 field mapping.
 *
 * Maps PersonalData fields to the AcroForm field names in the official
 * EX-25 PDF (Solicitud de autorización de residencia temporal de menores
 * no acompañados).
 *
 * Field names discovered via scripts/inspect-pdf-field-positions.ts.
 * EX-25 uses "Texto157"-style names (high-numbered continuation) and
 * "Casilla de verificación" checkboxes.
 *
 * EX-25 structure (page 1):
 *   Apartado 1 (Solicitante/Menor) — Y~671 → Y~510
 *   Apartado 2 (Padre/Madre/Tutor) — Y~434 → Y~351
 *   Apartado 3 (Domicilio en España / Notificaciones) — Y~287 → Y~219
 *   Representante Domicilio en España — Y~155 → Y~104
 */

import type { PersonalDataField } from "@/lib/types/personal-data";

/**
 * Text field mapping: PDF field name → PersonalData field key.
 *
 * EX-25 Page 1 — Apartado 1: DATOS DEL SOLICITANTE (MENOR)
 *   Row Y~671: Texto157=primerApellido  Texto159=segundoApellido  Texto160=NIE
 *   Row Y~651: Texto161=nombre  Texto162=nacionalidad
 *   Row Y~634: Texto163=nombrePadre  (checkboxes 235-236=sexo)
 *   Row Y~616: Texto164=DD  Texto165=MM  Texto166=YYYY
 *              Texto167=lugarNacimiento  Texto168=paisNacimiento
 *   Row Y~597: Texto169=numeroDocumento (wide field; tipo doc checkboxes not confirmed)
 *   Row Y~579: Texto170=telefono  Texto171=email
 *   Row Y~560: Texto172=domicilio (país origen)
 *   Row Y~543: Texto175=localidad(origen)  Texto177=CP(origen)  Texto178=provincia(origen)
 *   Row Y~525: Texto176=telefono2  Texto179=NIE (duplicate)
 *   Row Y~510: Texto180=fechaEntrada  Texto181=CP  Texto182=prov
 *
 * EX-25 Page 1 — Apartado 2: PADRE/MADRE/TUTOR
 *   Row Y~434: Texto183=nombre(padre)  Texto184=nacionalidad(padre)
 *              Texto185=domicilio(padre)  Texto186=num(padre)
 *   (further rows not mapped — guardian data separate from PersonalData)
 *
 * EX-25 Page 1 — Apartado 3: DOMICILIO EN ESPAÑA / NOTIFICACIONES
 *   Row Y~287: Texto198=NIE solicitante  Texto199=delegacion
 *   Row Y~269: Texto200=domicilio  Texto201=número  Texto202=piso
 *   Row Y~252: Texto203=localidad  Texto204=codigoPostal  Texto205=provincia
 *   Row Y~235: Texto206=telefono  Texto207=email
 *   Row Y~219: Texto208=fecha  Texto209=CP2  Texto210=prov2
 *
 * EX-25 Page 1 — Representante Domicilio en España
 *   Row Y~155: Texto211=NIE(rep)  Texto212=delegacion(rep)
 *   Row Y~138: Texto213=domicilio(rep)  Texto214=num  Texto215=piso
 *   Row Y~122: Texto216=localidad  Texto217=CP  Texto218=provincia
 *   Row Y~104: Texto219=telefono  Texto220=email
 */
export const EX_25_TEXT_FIELDS: Record<string, PersonalDataField | null> = {
  // ── Apartado 1: Solicitante (Menor) ─────────────────────
  Texto157: "primerApellido",
  Texto159: "segundoApellido",
  Texto160: "nie",
  Texto161: "nombre",
  Texto162: "nacionalidad",
  Texto163: "nombrePadre",
  // Date of birth — handled by DATE_FIELDS (DD/MM/YYYY split)
  Texto164: null, // DD
  Texto165: null, // MM
  Texto166: null, // YYYY
  Texto167: "lugarNacimiento",
  Texto168: "paisNacimiento",
  Texto169: "numeroDocumento", // wide field; tipo doc type uncertain — see TIPO_DOC_CHECKBOXES

  // ── Apartado 1: Contacto y domicilio origen ──────────────
  Texto170: "telefono",
  Texto171: "email",
  Texto172: "domicilio",       // domicilio país origen
  Texto175: "localidad",       // localidad (origen)
  Texto177: "codigoPostal",    // CP (origen)
  Texto178: "provincia",       // provincia (origen)
  Texto176: null,              // teléfono secundario — not mapped
  Texto179: "nie",             // NIE (duplicate of Texto160)

  // ── Apartado 1: Fecha entrada / notif. ───────────────────
  Texto180: null,              // fecha entrada — not in PersonalData
  Texto181: null,              // CP (notif.) — not mapped
  Texto182: null,              // provincia — not mapped

  // ── Apartado 2: Padre/Madre/Tutor ───────────────────────
  Texto183: null,              // nombre padre/tutor — separate entity
  Texto184: null,              // nacionalidad padre/tutor — separate entity
  Texto185: null,              // domicilio padre/tutor — separate entity
  Texto186: null,              // número padre/tutor — separate entity

  // ── Apartado 3: Domicilio en España ─────────────────────
  Texto198: "nie",             // NIE del solicitante
  Texto199: null,              // delegación — not in PersonalData
  Texto200: "domicilio",       // domicilio en España
  Texto201: null,              // número — not in PersonalData
  Texto202: null,              // piso — not in PersonalData
  Texto203: "localidad",
  Texto204: "codigoPostal",
  Texto205: "provincia",
  Texto206: "telefono",
  Texto207: "email",
  Texto208: null,              // fecha — not mapped
  Texto209: null,              // CP2 — not mapped
  Texto210: null,              // prov2 — not mapped

  // ── Representante: Domicilio en España ───────────────────
  Texto211: null,              // NIE representante — mapped from representanteLegal
  Texto212: null,              // delegación rep
  Texto213: null,              // domicilio rep
  Texto214: null,              // número rep
  Texto215: null,              // piso rep
  Texto216: null,              // localidad rep
  Texto217: null,              // CP rep
  Texto218: null,              // provincia rep
  Texto219: null,              // telefono rep
  Texto220: null,              // email rep
};

/**
 * Checkbox mapping for sexo.
 * Y~634: "Casilla de verificación235"=Hombre, "Casilla de verificación236"=Mujer
 */
export const EX_25_SEXO_CHECKBOXES: Record<string, string> = {
  "Casilla de verificación235": "H", // Hombre
  "Casilla de verificación236": "M", // Mujer
};

/**
 * Checkbox mapping for tipo de documento.
 * Y~597: Texto169 is a wide merged field — tipo doc checkboxes not confirmed
 * in the EX-25 PDF. Leave empty until field inspection confirms checkbox names.
 */
export const EX_25_TIPO_DOC_CHECKBOXES: Record<string, string> = {
  // TODO: confirm checkbox names from PDF inspection
};

/**
 * Checkbox mapping for estado civil.
 * EX-25 does not expose estado civil checkboxes on the standard form.
 */
export const EX_25_ESTADO_CIVIL_CHECKBOXES: Record<string, string> = {};

/**
 * Checkbox mapping for circunstancias excepcionales.
 * Not applicable to EX-25.
 */
export const EX_25_CIRCUNSTANCIA_CHECKBOXES: Record<string, string> = {};

/**
 * Date field mapping for fecha de nacimiento.
 * Split into DD (Texto164), MM (Texto165), YYYY (Texto166).
 */
export const EX_25_DATE_FIELDS = {
  fechaNacimiento: {
    dd: "Texto164",
    mm: "Texto165",
    yyyy: "Texto166",
  },
} as const;
