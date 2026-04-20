/**
 * EX-10 field mapping.
 *
 * Maps PersonalData fields to the AcroForm field names in the official
 * EX-10 PDF (Solicitud de autorización de residencia por circunstancias
 * excepcionales).
 *
 * Field names discovered via scripts/inspect-pdf-field-positions.ts.
 * EX-10 structure (5 pages):
 *   Page 1: Apartado 1 (Solicitante) + Apartado 2 (Representante)
 *           + Apartado 3 (Domicilio en España / Notificaciones)
 *   Page 2: Apartado 3 cont. + Apartado 4 (Circunstancias excepcionales)
 *   Page 3: Apartado 4 checkboxes (tipos de arraigo, etc.)
 *   Page 4-5: Legal text, firma
 */

import type { PersonalDataField } from "@/lib/types/personal-data";

/**
 * Text field mapping: PDF field name → PersonalData field key.
 *
 * EX-10 Page 1 — Apartado 1: DATOS DEL SOLICITANTE
 * Fields go top-to-bottom, left-to-right:
 *   Row Y~679: Texto1=primerApellido  Texto3=segundoApellido
 *   Row Y~662: Texto5=nombre          Texto6=nacionalidad
 *   Row Y~642: Texto7=nombrePadre     (checkboxes 96-98=sexo)
 *   Row Y~625: Texto8=DD Texto9=MM Texto10=YYYY  Texto11=lugarNacimiento  Texto12=paisNacimiento
 *   Row Y~606: Texto13=numeroDocumento  (checkboxes 99-103=tipoDocumento)
 *   Row Y~588: Texto14=telefono  Texto15=email
 *   Row Y~569: Texto16=domicilio (país origen)
 *   Row Y~552: Texto19=localidad (país origen)  Texto20=codigoPostal (origen)  Texto21=provincia (origen)
 *
 * EX-10 Page 1 — Apartado 2: REPRESENTANTE LEGAL
 *   Row Y~441: Texto27=primerApellido(rep)  Texto29=segundoApellido(rep)
 *   Row Y~423: Texto31=nombre(rep)  Texto32=nacionalidad(rep)
 *   ...
 *   Row Y~367: Texto39=telefono(rep)  Texto40=email(rep)
 *
 * EX-10 Page 1 — Apartado 3: DOMICILIO EN ESPAÑA / NOTIFICACIONES
 *   Row Y~245: Texto48=NIE solicitante  Texto49=? (delegación)
 *   Row Y~227: Texto50=domicilio España  Texto51=número  Texto52=piso
 *   Row Y~211: Texto53=localidad  Texto54=codigoPostal  Texto55=provincia
 *   Row Y~194: Texto56=telefono España  Texto57=email
 *   Row Y~177: Texto58=? (representante dir)
 *
 * EX-10 Page 2 — Apartado 3 cont.: DOMICILIO REPRESENTANTE
 *   ...
 */
export const EX_10_TEXT_FIELDS: Record<string, PersonalDataField | null> = {
  // ── Apartado 1: Solicitante ─────────────────────────────
  Texto1: "primerApellido",
  Texto3: "segundoApellido",
  Texto5: "nombre",
  Texto6: "nacionalidad",
  Texto7: "nombrePadre",       // "Nombre del padre" on the form
  // Texto8-10: fecha nacimiento — handled specially (DD/MM/YYYY split)
  Texto8: null,  // DD
  Texto9: null,  // MM
  Texto10: null, // YYYY
  Texto11: "lugarNacimiento",
  Texto12: "paisNacimiento",
  Texto13: "numeroDocumento",
  Texto14: "telefono",
  Texto15: "email",

  // ── Apartado 2: Representante legal ─────────────────────
  Texto27: null, // rep primerApellido — mapped from representanteLegal
  Texto31: null, // rep nombre — mapped from representanteLegal
  Texto39: null, // rep telefono
  Texto40: null, // rep email

  // ── Apartado 3: Domicilio en España ─────────────────────
  Texto48: "nie",             // NIE del solicitante
  Texto50: "domicilio",
  Texto53: "localidad",
  Texto54: "codigoPostal",
  Texto55: "provincia",
  Texto56: "telefono",       // teléfono en España (same as contact)
  Texto57: "email",          // email (same as contact)
};

/**
 * Checkbox mapping for sexo.
 * checkboxes 96-98 on page 1, Y~642
 *   96 = Hombre, 97 = Mujer, 98 = Otro
 */
export const EX_10_SEXO_CHECKBOXES: Record<string, string> = {
  "Casilla de verificación96": "H",  // Hombre
  "Casilla de verificación97": "M",  // Mujer
};

/**
 * Checkbox mapping for tipo de documento.
 * checkboxes 99-103 on page 1, Y~606
 *   99 = Pasaporte, 100 = Título de viaje, 101 = Cédula,
 *   102 = Documento identidad, 103 = NIE
 */
export const EX_10_TIPO_DOC_CHECKBOXES: Record<string, string> = {
  "Casilla de verificación99": "pasaporte",
  "Casilla de verificación103": "nie",
};

/**
 * Checkbox mapping for estado civil.
 * checkboxes 104-111 on page 1, Y~404
 *   104 = Soltero/a, 105 = Casado/a, 106 = Viudo/a,
 *   107 = Separado/a, 108 = Divorciado/a, 109-111 = otros
 */
export const EX_10_ESTADO_CIVIL_CHECKBOXES: Record<string, string> = {
  "Casilla de verificación104": "soltero",
  "Casilla de verificación105": "casado",
  "Casilla de verificación106": "viudo",
  "Casilla de verificación108": "divorciado",
};

/**
 * Checkbox mapping for tipo de circunstancia excepcional.
 * Page 3, checkboxes 119-148
 */
export const EX_10_CIRCUNSTANCIA_CHECKBOXES: Record<string, string> = {
  "Casilla de verificación120": "arraigo_social",
  "Casilla de verificación121": "arraigo_sociolaboral",
  "Casilla de verificación122": "arraigo_socioformatiu",
  "Casilla de verificación119": "arraigo_familiar",
  "Casilla de verificación123": "arraigo_segona_oportunitat",
  "Casilla de verificación124": "residencia_humanitaria",
  "Casilla de verificación125": "victima_violencia_genere",
  "Casilla de verificación126": "victima_violencia_sexual",
  "Casilla de verificación127": "victima_trata",
  "Casilla de verificación128": "colaboracio_autoritats_policials",
  "Casilla de verificación129": "colaboracio_interes_public",
  "Casilla de verificación130": "colaboracio_contra_xarxes_admin",
  "Casilla de verificación131": "colaboracio_contra_xarxes_policial",
  "Casilla de verificación132": "residencia_retorn_voluntari",
};

/**
 * Date field mapping for fecha de nacimiento.
 * Split into DD (Texto8), MM (Texto9), YYYY (Texto10).
 */
export const EX_10_DATE_FIELDS = {
  fechaNacimiento: {
    dd: "Texto8",
    mm: "Texto9",
    yyyy: "Texto10",
  },
} as const;
