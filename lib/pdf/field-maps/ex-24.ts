/**
 * EX-24 field mapping.
 *
 * Maps PersonalData fields to the AcroForm field names in the official
 * EX-24 PDF (Solicitud de autorización de residencia temporal de familiar
 * de español).
 *
 * Field names discovered via scripts/inspect-pdf-field-positions.ts.
 * EX-24 uses generic "Texto1"-style names and "Casilla de verificación" checkboxes.
 *
 * EX-24 structure (page 1):
 *   Apartado 1 (Solicitante) — Y~665 → Y~503
 *   Apartado 2 (Familiar español) — Y~439 → Y~310
 *   Apartado 3 (Domicilio en España / Notificaciones) — Y~244 → Y~176
 *   Representante Domicilio en España — Y~113 → Y~62
 */

import type { PersonalDataField } from "@/lib/types/personal-data";

/**
 * Text field mapping: PDF field name → PersonalData field key.
 *
 * EX-24 Page 1 — Apartado 1: DATOS DEL SOLICITANTE
 *   Row Y~665: Texto1=primerApellido  Texto3=segundoApellido  Texto4=NIE
 *   Row Y~646: Texto5=nombre  Texto6=nacionalidad
 *   Row Y~627: Texto7=nombrePadre  (checkboxes 27-28=sexo)
 *   Row Y~610: Texto8=DD  Texto9=MM  Texto10=YYYY
 *              Texto11=lugarNacimiento  Texto12=paisNacimiento
 *   Row Y~590: Texto13=numeroDocumento  (tipo doc checkboxes 30-34)
 *   Row Y~573: Texto14=telefono  Texto15=email
 *   Row Y~555: Texto16=domicilio (país origen)
 *   Row Y~536: Texto19=localidad(origen)  Texto20=CP(origen)  Texto21=provincia(origen)
 *   Row Y~518: Texto22=telefono2  Texto23=NIE (duplicate)
 *   Row Y~503: Texto24=fechaEntrada  Texto25=CP  Texto26=prov
 *
 * EX-24 Page 1 — Apartado 2: FAMILIAR ESPAÑOL
 *   Row Y~439: Texto35=primerApellido(familiar)  Texto36=segundoApellido(familiar)
 *   (estado civil checkboxes 54-58 for familiar)
 *
 * EX-24 Page 1 — Apartado 3: DOMICILIO EN ESPAÑA / NOTIFICACIONES
 *   Row Y~244: Texto62=NIE solicitante  Texto63=delegacion
 *   Row Y~228: Texto64=domicilio  Texto65=número  Texto66=piso
 *   Row Y~210: Texto67=localidad  Texto68=codigoPostal  Texto69=provincia
 *   Row Y~194: Texto70=telefono  Texto71=email
 *   Row Y~176: Texto72=fecha  Texto73=CP2  Texto74=prov2
 *
 * EX-24 Page 1 — Representante Domicilio en España
 *   Row Y~113: Texto75=NIE(rep)  Texto76=delegacion(rep)
 *   Row Y~96:  Texto77=domicilio(rep)  Texto78=num  Texto79=piso
 *   Row Y~79:  Texto80=localidad  Texto81=CP  Texto82=provincia
 *   Row Y~62:  Texto83=telefono  Texto84=email
 */
export const EX_24_TEXT_FIELDS: Record<string, PersonalDataField | null> = {
  // ── Apartado 1: Solicitante ─────────────────────────────
  Texto1: "primerApellido",
  Texto3: "segundoApellido",
  Texto4: "nie",
  Texto5: "nombre",
  Texto6: "nacionalidad",
  Texto7: "nombrePadre",
  // Date of birth — handled by DATE_FIELDS (DD/MM/YYYY split)
  Texto8: null,  // DD
  Texto9: null,  // MM
  Texto10: null, // YYYY
  Texto11: "lugarNacimiento",
  Texto12: "paisNacimiento",
  Texto13: "numeroDocumento",
  Texto14: "telefono",
  Texto15: "email",
  Texto16: "domicilio",         // domicilio país origen

  // ── Apartado 1: Domicilio en país de origen ──────────────
  Texto19: "localidad",         // localidad (origen)
  Texto20: "codigoPostal",      // CP (origen)
  Texto21: "provincia",         // provincia (origen)
  Texto22: null,                // teléfono secundario — not mapped
  Texto23: "nie",               // NIE (duplicate of Texto4)

  // ── Apartado 1: Fecha entrada / notif. ───────────────────
  Texto24: null,                // fecha entrada — not in PersonalData
  Texto25: null,                // CP (notif.) — not mapped
  Texto26: null,                // provincia — not mapped

  // ── Apartado 2: Familiar español ────────────────────────
  Texto35: null,                // familiar primerApellido — separate entity
  Texto36: null,                // familiar segundoApellido — separate entity

  // ── Apartado 3: Domicilio en España ─────────────────────
  Texto62: "nie",               // NIE del solicitante
  Texto63: null,                // delegación — not in PersonalData
  Texto64: "domicilio",         // domicilio en España
  Texto65: null,                // número — not in PersonalData
  Texto66: null,                // piso — not in PersonalData
  Texto67: "localidad",
  Texto68: "codigoPostal",
  Texto69: "provincia",
  Texto70: "telefono",
  Texto71: "email",
  Texto72: null,                // fecha — not mapped
  Texto73: null,                // CP2 — not mapped
  Texto74: null,                // prov2 — not mapped

  // ── Representante: Domicilio en España ───────────────────
  Texto75: null,                // NIE representante — mapped from representanteLegal
  Texto76: null,                // delegación rep
  Texto77: null,                // domicilio rep
  Texto78: null,                // número rep
  Texto79: null,                // piso rep
  Texto80: null,                // localidad rep
  Texto81: null,                // CP rep
  Texto82: null,                // provincia rep
  Texto83: null,                // telefono rep
  Texto84: null,                // email rep
};

/**
 * Checkbox mapping for sexo.
 * Y~627: "Casilla de verificación27"=Hombre, "Casilla de verificación28"=Mujer
 */
export const EX_24_SEXO_CHECKBOXES: Record<string, string> = {
  "Casilla de verificación27": "H", // Hombre
  "Casilla de verificación28": "M", // Mujer
};

/**
 * Checkbox mapping for tipo de documento.
 * Y~590: checkboxes 30-34
 *   30=pasaporte, 34=NIE (intermediates not confirmed — marked null)
 */
export const EX_24_TIPO_DOC_CHECKBOXES: Record<string, string> = {
  "Casilla de verificación30": "pasaporte",
  "Casilla de verificación34": "nie",
};

/**
 * Checkbox mapping for estado civil del familiar español.
 * Y~439 area: checkboxes 54-58
 *   54=soltero, 55=casado, 56=viudo, 58=divorciado (57 not confirmed)
 */
export const EX_24_ESTADO_CIVIL_CHECKBOXES: Record<string, string> = {
  "Casilla de verificación54": "soltero",
  "Casilla de verificación55": "casado",
  "Casilla de verificación56": "viudo",
  "Casilla de verificación58": "divorciado",
};

/**
 * Checkbox mapping for circunstancias excepcionales.
 * Not applicable to EX-24.
 */
export const EX_24_CIRCUNSTANCIA_CHECKBOXES: Record<string, string> = {};

/**
 * Date field mapping for fecha de nacimiento.
 * Split into DD (Texto8), MM (Texto9), YYYY (Texto10).
 */
export const EX_24_DATE_FIELDS = {
  fechaNacimiento: {
    dd: "Texto8",
    mm: "Texto9",
    yyyy: "Texto10",
  },
} as const;
