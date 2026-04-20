/**
 * EX-06 field mapping.
 *
 * Maps PersonalData fields to the AcroForm field names in the official
 * EX-06 PDF (Solicitud de autorización de residencia temporal y trabajo
 * por cuenta ajena — contingente / gestión colectiva de contrataciones).
 *
 * Field names discovered via scripts/inspect-pdf-field-positions.ts.
 * EX-06 uses generic "Texto1"-style field names.
 * EX-06 structure (page 1):
 *   Apartado 1: Datos del solicitante
 *   Apartado 3: Domicilio en España / Notificaciones (solicitante + representante)
 */

import type { PersonalDataField } from "@/lib/types/personal-data";

/**
 * Text field mapping: PDF field name → PersonalData field key.
 *
 * Page 1 — Apartado 1: DATOS DEL SOLICITANTE
 *   Row Y~664: Texto1=primerApellido  Texto4=segundoApellido  Texto5=NIE
 *   Row Y~647: Texto6=nombre          Texto7=nacionalidad
 *   Row Y~628: Texto8=nombrePadre     (checkboxes 9-10=sexo)
 *   Row Y~611: Texto12=DD  Texto13=MM  Texto14=YYYY  Texto15=lugarNacimiento  Texto16=paisNacimiento
 *   Row Y~592: Texto17=numeroDocumento  (checkboxes 18-22=tipoDocumento)
 *   Row Y~573: Texto23=telefono  Texto24=email
 *   Row Y~555: Texto25=domicilio (país origen)
 *   Row Y~537: Texto28=localidad (origen)  Texto29=CP (origen)  Texto30=provincia (origen)
 *
 * Page 1 — Apartado 3: DOMICILIO EN ESPAÑA / NOTIFICACIONES — Solicitante
 *   Row Y~290: Texto50=NIE  Texto51=delegación
 *   Row Y~273: Texto52=domicilio  Texto53=número  Texto54=piso
 *   Row Y~256: Texto55=localidad  Texto56=CP  Texto57=provincia
 *   Row Y~238: Texto58=telefono  Texto59=email
 *
 * Page 1 — Apartado 3: DOMICILIO EN ESPAÑA / NOTIFICACIONES — Representante
 *   Row Y~158: Texto63=NIE(rep)  Texto64=delegación(rep)
 *   Row Y~141: Texto65=domicilio(rep)  Texto66=número  Texto67=piso
 *   Row Y~125: Texto68=localidad  Texto69=CP  Texto70=provincia
 *   Row Y~107: Texto71=telefono  Texto72=email
 */
export const EX_06_TEXT_FIELDS: Record<string, PersonalDataField | null> = {
  // ── Apartado 1: Solicitante ─────────────────────────────
  Texto1: "primerApellido",
  Texto4: "segundoApellido",
  Texto5: "nie",               // NIE field on the identity row
  Texto6: "nombre",
  Texto7: "nacionalidad",
  Texto8: "nombrePadre",
  // Texto12-14: fecha nacimiento — handled specially (DD/MM/YYYY split)
  Texto12: null, // DD
  Texto13: null, // MM
  Texto14: null, // YYYY
  Texto15: "lugarNacimiento",
  Texto16: "paisNacimiento",
  Texto17: "numeroDocumento",
  Texto23: "telefono",
  Texto24: "email",
  Texto25: null, // domicilio país origen — no PersonalData equivalent
  Texto28: null, // localidad país origen — no PersonalData equivalent
  Texto29: null, // CP país origen — no PersonalData equivalent
  Texto30: null, // provincia país origen — no PersonalData equivalent

  // ── Apartado 3: Domicilio en España — Solicitante ───────
  Texto50: "nie",          // NIE del solicitante
  Texto51: null,           // delegación/oficina — no PersonalData equivalent
  Texto52: "domicilio",
  Texto53: null,           // número (calle) — no PersonalData equivalent
  Texto54: null,           // piso — no PersonalData equivalent
  Texto55: "localidad",
  Texto56: "codigoPostal",
  Texto57: "provincia",
  Texto58: "telefono",
  Texto59: "email",

  // ── Apartado 3: Domicilio en España — Representante ─────
  Texto63: null, // NIE representante — mapped from representanteDniNiePas
  Texto64: null, // delegación representante — no PersonalData equivalent
  Texto65: null, // domicilio representante
  Texto66: null, // número representante
  Texto67: null, // piso representante
  Texto68: null, // localidad representante
  Texto69: null, // CP representante
  Texto70: null, // provincia representante
  Texto71: null, // telefono representante
  Texto72: null, // email representante
};

/**
 * Checkbox mapping for sexo.
 * Checkboxes 9-10 on page 1, Y~628
 *   9 = Hombre, 10 = Mujer
 */
export const EX_06_SEXO_CHECKBOXES: Record<string, string> = {
  "Casilla de verificación9":  "H", // Hombre
  "Casilla de verificación10": "M", // Mujer
};

/**
 * Checkbox mapping for tipo de documento.
 * Checkboxes 18-22 on page 1, Y~592
 *   18 = Pasaporte, 22 = NIE
 */
export const EX_06_TIPO_DOC_CHECKBOXES: Record<string, string> = {
  "Casilla de verificación18": "pasaporte",
  "Casilla de verificación22": "nie",
};

/**
 * Checkbox mapping for estado civil.
 * EX-06 does not include an estado civil section.
 */
export const EX_06_ESTADO_CIVIL_CHECKBOXES: Record<string, string> = {};

/**
 * Checkbox mapping for circunstancias excepcionales.
 * Not applicable to EX-06.
 */
export const EX_06_CIRCUNSTANCIA_CHECKBOXES: Record<string, string> = {};

/**
 * Date field mapping for fecha de nacimiento.
 * Split into DD (Texto12), MM (Texto13), YYYY (Texto14).
 */
export const EX_06_DATE_FIELDS = {
  fechaNacimiento: {
    dd: "Texto12",
    mm: "Texto13",
    yyyy: "Texto14",
  },
} as const;
