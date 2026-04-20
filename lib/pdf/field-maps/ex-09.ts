/**
 * EX-09 field mapping.
 *
 * Maps PersonalData fields to the AcroForm field names in the official
 * EX-09 PDF (Solicitud de residencia con excepción a la autorización de
 * trabajo).
 *
 * Field names discovered via scripts/inspect-pdf-field-positions.ts.
 * EX-09 uses generic "Texto1"-style field names.
 * EX-09 structure (page 1):
 *   Apartado 1: Datos del solicitante
 *   Apartado 3: Domicilio en España / Notificaciones (solicitante + representante)
 */

import type { PersonalDataField } from "@/lib/types/personal-data";

/**
 * Text field mapping: PDF field name → PersonalData field key.
 *
 * Page 1 — Apartado 1: DATOS DEL SOLICITANTE
 *   Row Y~664: Texto1=primerApellido  Texto3=segundoApellido  Texto4=NIE
 *   Row Y~646: Texto5=nombre          Texto6=nacionalidad
 *   Row Y~627: Texto7=nombrePadre     (checkboxes 79-80=sexo)
 *   Row Y~610: Texto8=DD  Texto9=MM  Texto10=YYYY  Texto11=lugarNacimiento  Texto12=paisNacimiento
 *   Row Y~591: Texto13=numeroDocumento  (checkboxes 71-75=tipoDocumento)
 *   Row Y~573: Texto14=telefono  Texto15=email
 *   Row Y~554: Texto16=domicilio (país origen)
 *   Row Y~537: Texto19=localidad (origen)  Texto20=CP (origen)  Texto21=provincia (origen)
 *
 * Page 1 — Apartado 3: DOMICILIO EN ESPAÑA / NOTIFICACIONES — Solicitante
 *   Row Y~289: Texto39=NIE  Texto40=delegación
 *   Row Y~272: Texto41=domicilio  Texto42=número  Texto43=piso
 *   Row Y~256: Texto44=localidad  Texto45=CP  Texto46=provincia
 *   Row Y~238: Texto47=telefono  Texto48=email
 *
 * Page 1 — Apartado 3: DOMICILIO EN ESPAÑA / NOTIFICACIONES — Representante
 *   Row Y~158: Texto52=NIE(rep)  Texto53=delegación(rep)
 *   Row Y~141: Texto54=domicilio(rep)  Texto55=número  Texto56=piso
 *   Row Y~124: Texto57=localidad  Texto58=CP  Texto59=provincia
 *   Row Y~107: Texto60=telefono  Texto61=email
 */
export const EX_09_TEXT_FIELDS: Record<string, PersonalDataField | null> = {
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

  // ── Apartado 3: Domicilio en España — Solicitante ───────
  Texto39: "nie",          // NIE del solicitante
  Texto40: null,           // delegación/oficina — no PersonalData equivalent
  Texto41: "domicilio",
  Texto42: null,           // número (calle) — no PersonalData equivalent
  Texto43: null,           // piso — no PersonalData equivalent
  Texto44: "localidad",
  Texto45: "codigoPostal",
  Texto46: "provincia",
  Texto47: "telefono",
  Texto48: "email",

  // ── Apartado 3: Domicilio en España — Representante ─────
  Texto52: null, // NIE representante — mapped from representanteDniNiePas
  Texto53: null, // delegación representante — no PersonalData equivalent
  Texto54: null, // domicilio representante
  Texto55: null, // número representante
  Texto56: null, // piso representante
  Texto57: null, // localidad representante
  Texto58: null, // CP representante
  Texto59: null, // provincia representante
  Texto60: null, // telefono representante
  Texto61: null, // email representante
};

/**
 * Checkbox mapping for sexo.
 * Checkboxes 79-80 on page 1, Y~627
 *   79 = Hombre, 80 = Mujer
 */
export const EX_09_SEXO_CHECKBOXES: Record<string, string> = {
  "Casilla de verificación79": "H", // Hombre
  "Casilla de verificación80": "M", // Mujer
};

/**
 * Checkbox mapping for tipo de documento.
 * Checkboxes 71-75 on page 1, Y~591
 *   71 = Pasaporte, 75 = NIE
 */
export const EX_09_TIPO_DOC_CHECKBOXES: Record<string, string> = {
  "Casilla de verificación71": "pasaporte",
  "Casilla de verificación75": "nie",
};

/**
 * Checkbox mapping for estado civil.
 * EX-09 does not include an estado civil section.
 */
export const EX_09_ESTADO_CIVIL_CHECKBOXES: Record<string, string> = {};

/**
 * Checkbox mapping for circunstancias excepcionales.
 * Not applicable to EX-09.
 */
export const EX_09_CIRCUNSTANCIA_CHECKBOXES: Record<string, string> = {};

/**
 * Date field mapping for fecha de nacimiento.
 * Split into DD (Texto8), MM (Texto9), YYYY (Texto10).
 */
export const EX_09_DATE_FIELDS = {
  fechaNacimiento: {
    dd: "Texto8",
    mm: "Texto9",
    yyyy: "Texto10",
  },
} as const;
