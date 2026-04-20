/**
 * EX-04 field mapping.
 *
 * Maps PersonalData fields to the AcroForm field names in the official
 * EX-04 PDF (Solicitud de autorización de residencia temporal y trabajo
 * por cuenta ajena — régimen general / prácticas).
 *
 * Field names discovered via scripts/inspect-pdf-field-positions.ts.
 * EX-04 uses generic "Texto1"-style field names.
 * EX-04 structure (page 1):
 *   Apartado 1: Datos del solicitante
 *   Apartado 2: Representante legal
 *   Apartado 3: Domicilio en España / Notificaciones (solicitante + representante)
 */

import type { PersonalDataField } from "@/lib/types/personal-data";

/**
 * Text field mapping: PDF field name → PersonalData field key.
 *
 * Page 1 — Apartado 1: DATOS DEL SOLICITANTE
 *   Row Y~665: Texto1=primerApellido  Texto3=segundoApellido  Texto4=NIE
 *   Row Y~646: Texto5=nombre          Texto6=nacionalidad
 *   Row Y~628: Texto7=nombrePadre     (checkboxes 73-74=sexo)
 *   Row Y~610: Texto8=DD  Texto9=MM  Texto10=YYYY  Texto11=lugarNacimiento  Texto12=paisNacimiento
 *   Row Y~591: Texto13=numeroDocumento  (checkboxes 76-80=tipoDocumento)
 *   Row Y~573: Texto14=telefono  Texto15=email
 *   Row Y~554: Texto16=domicilio (país origen)
 *   Row Y~536: Texto19=localidad (origen)  Texto20=CP (origen)  Texto21=provincia (origen)
 *
 * Page 1 — Apartado 2: REPRESENTANTE LEGAL
 *   Row Y~439: Texto27=domicilio(rep)  Texto29=nombre(rep)
 *
 * Page 1 — Apartado 3: DOMICILIO EN ESPAÑA / NOTIFICACIONES — Solicitante
 *   Row Y~290: Texto42=NIE  Texto43=delegación
 *   Row Y~274: Texto44=domicilio  Texto45=número  Texto46=piso
 *   Row Y~257: Texto47=localidad  Texto48=CP  Texto49=provincia
 *   Row Y~239: Texto50=telefono  Texto51=email
 *   Row Y~223: Texto52=fecha  Texto53=CP2  Texto54=prov2
 *
 * Page 1 — Apartado 3: DOMICILIO EN ESPAÑA / NOTIFICACIONES — Representante
 *   Row Y~159: Texto55=NIE(rep)  Texto56=delegación(rep)
 *   Row Y~142: Texto57=domicilio(rep)  Texto58=número  Texto59=piso
 *   Row Y~125: Texto60=localidad  Texto61=CP  Texto62=provincia
 *   Row Y~109: Texto63=telefono  Texto64=email
 */
export const EX_04_TEXT_FIELDS: Record<string, PersonalDataField | null> = {
  // ── Apartado 1: Solicitante ─────────────────────────────
  Texto1: "primerApellido",
  Texto3: "segundoApellido",
  Texto4: "nie",               // NIE field on the identity row
  Texto5: "nombre",
  Texto6: "nacionalidad",
  Texto7: "nombrePadre",
  // Texto8-10: fecha nacimiento — handled specially (DD/MM/YYYY split)
  Texto8: null,  // DD
  Texto9: null,  // MM
  Texto10: null, // YYYY
  Texto11: "lugarNacimiento",
  Texto12: "paisNacimiento",
  Texto13: "numeroDocumento",
  Texto14: "telefono",
  Texto15: "email",
  Texto16: null, // domicilio país origen — no PersonalData equivalent
  Texto19: null, // localidad país origen — no PersonalData equivalent
  Texto20: null, // CP país origen — no PersonalData equivalent
  Texto21: null, // provincia país origen — no PersonalData equivalent

  // ── Apartado 2: Representante legal ─────────────────────
  Texto27: null, // domicilio representante — mapped from representanteLegal
  Texto29: null, // nombre representante — mapped from representanteLegal

  // ── Apartado 3: Domicilio en España — Solicitante ───────
  Texto42: "nie",          // NIE del solicitante
  Texto43: null,           // delegación/oficina — no PersonalData equivalent
  Texto44: "domicilio",
  Texto45: null,           // número (calle) — no PersonalData equivalent
  Texto46: null,           // piso — no PersonalData equivalent
  Texto47: "localidad",
  Texto48: "codigoPostal",
  Texto49: "provincia",
  Texto50: "telefono",
  Texto51: "email",
  Texto52: null,           // fecha (notificaciones) — no PersonalData equivalent
  Texto53: null,           // CP2 — purpose unclear, skipped
  Texto54: null,           // prov2 — purpose unclear, skipped

  // ── Apartado 3: Domicilio en España — Representante ─────
  Texto55: null, // NIE representante — mapped from representanteDniNiePas
  Texto56: null, // delegación representante — no PersonalData equivalent
  Texto57: null, // domicilio representante
  Texto58: null, // número representante
  Texto59: null, // piso representante
  Texto60: null, // localidad representante
  Texto61: null, // CP representante
  Texto62: null, // provincia representante
  Texto63: null, // telefono representante
  Texto64: null, // email representante
};

/**
 * Checkbox mapping for sexo.
 * Checkboxes 73-74 on page 1, Y~628
 *   73 = Hombre, 74 = Mujer
 */
export const EX_04_SEXO_CHECKBOXES: Record<string, string> = {
  "Casilla de verificación73": "H", // Hombre
  "Casilla de verificación74": "M", // Mujer
};

/**
 * Checkbox mapping for tipo de documento.
 * Checkboxes 76-80 on page 1, Y~591
 *   76 = Pasaporte, 80 = NIE
 */
export const EX_04_TIPO_DOC_CHECKBOXES: Record<string, string> = {
  "Casilla de verificación76": "pasaporte",
  "Casilla de verificación80": "nie",
};

/**
 * Checkbox mapping for estado civil.
 * EX-04 does not include an estado civil section.
 */
export const EX_04_ESTADO_CIVIL_CHECKBOXES: Record<string, string> = {};

/**
 * Checkbox mapping for circunstancias excepcionales.
 * Not applicable to EX-04.
 */
export const EX_04_CIRCUNSTANCIA_CHECKBOXES: Record<string, string> = {};

/**
 * Date field mapping for fecha de nacimiento.
 * Split into DD (Texto8), MM (Texto9), YYYY (Texto10).
 */
export const EX_04_DATE_FIELDS = {
  fechaNacimiento: {
    dd: "Texto8",
    mm: "Texto9",
    yyyy: "Texto10",
  },
} as const;
