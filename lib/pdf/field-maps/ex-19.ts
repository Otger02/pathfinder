/**
 * EX-19 field mapping.
 *
 * Maps PersonalData fields to the AcroForm field names in the official
 * EX-19 PDF (Solicitud de autorización de residencia temporal de familiar
 * de ciudadano de la Unión Europea).
 *
 * Field names discovered via scripts/inspect-pdf-field-positions.ts.
 * EX-19 uses generic "Texto2"-style names and "Casilla de verificación" checkboxes.
 *
 * EX-19 structure (page 1):
 *   Apartado 1 (Solicitante) — Y~665 → Y~504
 *   Apartado 2 (Familiar UE) — Y~413 → Y~341
 *   Apartado 3 (Domicilio en España / Notificaciones) — Y~264 → Y~196
 *   Representante Domicilio en España — Y~133 → Y~82
 */

import type { PersonalDataField } from "@/lib/types/personal-data";

/**
 * Text field mapping: PDF field name → PersonalData field key.
 *
 * EX-19 Page 1 — Apartado 1: DATOS DEL SOLICITANTE
 *   Row Y~665: Texto2=primerApellido  Texto4=segundoApellido  Texto5=NIE
 *   Row Y~647: Texto6=nombre  Texto7=nacionalidad
 *   Row Y~628: Texto8=nombrePadre  (checkboxes 3-4=sexo)
 *   Row Y~610: Texto9=DD  Texto10=MM  Texto11=YYYY
 *              Texto12=lugarNacimiento  Texto13=paisNacimiento
 *   Row Y~591: Texto14=numeroDocumento  (tipo doc checkboxes 6-10)
 *   Row Y~573: Texto15=telefono  Texto16=email
 *   Row Y~555: Texto17=domicilio (país origen)
 *   Row Y~537: Texto20=localidad(origen)  Texto21=CP(origen)  Texto22=provincia(origen)
 *   Row Y~519: Texto23=telefono2  Texto24=NIE (duplicate)
 *   Row Y~504: Texto25=fechaEntrada  Texto26=CP  Texto27=prov
 *
 * EX-19 Page 1 — Apartado 2: FAMILIAR UE
 *   Row Y~413: Texto28=primerApellido(familiar)  Texto30=segundoApellido(familiar)
 *   (further rows not mapped — familiar data separate from PersonalData)
 *
 * EX-19 Page 1 — Apartado 3: DOMICILIO EN ESPAÑA / NOTIFICACIONES
 *   Row Y~264: Texto42=NIE solicitante  Texto43=delegacion
 *   Row Y~247: Texto44=domicilio  Texto45=número  Texto46=piso
 *   Row Y~230: Texto47=localidad  Texto48=codigoPostal  Texto49=provincia
 *   Row Y~213: Texto50=telefono  Texto51=email
 *   Row Y~196: Texto52=fecha  Texto53=CP2  Texto54=prov2
 *
 * EX-19 Page 1 — Representante Domicilio en España
 *   Row Y~133: Texto55=NIE(rep)  Texto56=delegacion(rep)
 *   Row Y~117: Texto57=domicilio(rep)  Texto58=num  Texto59=piso
 *   Row Y~99:  Texto60=localidad  Texto61=CP  Texto62=provincia
 *   Row Y~82:  Texto63=telefono  Texto64=email
 */
export const EX_19_TEXT_FIELDS: Record<string, PersonalDataField | null> = {
  // ── Apartado 1: Solicitante ─────────────────────────────
  Texto2: "primerApellido",
  Texto4: "segundoApellido",
  Texto5: "nie",
  Texto6: "nombre",
  Texto7: "nacionalidad",
  Texto8: "nombrePadre",
  // Date of birth — handled by DATE_FIELDS (DD/MM/YYYY split)
  Texto9: null,  // DD
  Texto10: null, // MM
  Texto11: null, // YYYY
  Texto12: "lugarNacimiento",
  Texto13: "paisNacimiento",
  Texto14: "numeroDocumento",
  Texto15: "telefono",
  Texto16: "email",
  Texto17: "domicilio",         // domicilio país origen

  // ── Apartado 1: Domicilio en país de origen ──────────────
  Texto20: "localidad",         // localidad (origen)
  Texto21: "codigoPostal",      // CP (origen)
  Texto22: "provincia",         // provincia (origen)
  Texto23: null,                // teléfono secundario — not mapped
  Texto24: "nie",               // NIE (duplicate of Texto5)

  // ── Apartado 1: Fecha entrada / notif. ───────────────────
  Texto25: null,                // fecha entrada — not in PersonalData
  Texto26: null,                // CP (notif.) — not mapped
  Texto27: null,                // provincia — not mapped

  // ── Apartado 2: Familiar UE ──────────────────────────────
  Texto28: null,                // familiar primerApellido — separate entity
  Texto30: null,                // familiar segundoApellido — separate entity

  // ── Apartado 3: Domicilio en España ─────────────────────
  Texto42: "nie",               // NIE del solicitante
  Texto43: null,                // delegación — not in PersonalData
  Texto44: "domicilio",         // domicilio en España
  Texto45: null,                // número — not in PersonalData
  Texto46: null,                // piso — not in PersonalData
  Texto47: "localidad",
  Texto48: "codigoPostal",
  Texto49: "provincia",
  Texto50: "telefono",
  Texto51: "email",
  Texto52: null,                // fecha — not mapped
  Texto53: null,                // CP2 — not mapped
  Texto54: null,                // prov2 — not mapped

  // ── Representante: Domicilio en España ───────────────────
  Texto55: null,                // NIE representante — mapped from representanteLegal
  Texto56: null,                // delegación rep
  Texto57: null,                // domicilio rep
  Texto58: null,                // número rep
  Texto59: null,                // piso rep
  Texto60: null,                // localidad rep
  Texto61: null,                // CP rep
  Texto62: null,                // provincia rep
  Texto63: null,                // telefono rep
  Texto64: null,                // email rep
};

/**
 * Checkbox mapping for sexo.
 * Y~628: "Casilla de verificación3"=Hombre, "Casilla de verificación4"=Mujer
 */
export const EX_19_SEXO_CHECKBOXES: Record<string, string> = {
  "Casilla de verificación3": "H", // Hombre
  "Casilla de verificación4": "M", // Mujer
};

/**
 * Checkbox mapping for tipo de documento.
 * Y~591: checkboxes 6-10
 *   6=pasaporte, 10=NIE (intermediates not confirmed — marked null)
 */
export const EX_19_TIPO_DOC_CHECKBOXES: Record<string, string> = {
  "Casilla de verificación6": "pasaporte",
  "Casilla de verificación10": "nie",
};

/**
 * Checkbox mapping for estado civil.
 * EX-19 does not expose estado civil checkboxes on the standard form.
 */
export const EX_19_ESTADO_CIVIL_CHECKBOXES: Record<string, string> = {};

/**
 * Checkbox mapping for circunstancias excepcionales.
 * Not applicable to EX-19.
 */
export const EX_19_CIRCUNSTANCIA_CHECKBOXES: Record<string, string> = {};

/**
 * Date field mapping for fecha de nacimiento.
 * Split into DD (Texto9), MM (Texto10), YYYY (Texto11).
 */
export const EX_19_DATE_FIELDS = {
  fechaNacimiento: {
    dd: "Texto9",
    mm: "Texto10",
    yyyy: "Texto11",
  },
} as const;
