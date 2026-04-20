/**
 * EX-10 — Autorización de residencia por circunstancias excepcionales
 * 5 pages, 157 fields. Clean Texto1..Texto156 + Casilla de verificación96..148.
 */
import type { PersonalDataField } from "@/lib/types/personal-data";

export const EX_10_TEXT_FIELDS: Record<string, PersonalDataField | null> = {
  // ── Apartado 1: Solicitante ─────────────────────────────
  Texto1:  "primerApellido",
  Texto2:  null,                   // NIE letra
  Texto3:  "nie",
  Texto4:  null,                   // NIE control
  Texto5:  "nombre",
  Texto6:  "segundoApellido",       // campo largo — also "nacionalidad" on other forms
  Texto7:  "nacionalidad",
  // Sexo: Casilla de verificación96/97/98
  Texto8:  null,                   // DD
  Texto9:  null,                   // MM
  Texto10: null,                   // YYYY
  Texto11: "lugarNacimiento",
  Texto12: "paisNacimiento",
  Texto13: "numeroDocumento",
  // TipoDoc: Casilla de verificación99..103
  Texto14: "telefono",
  Texto15: "email",
  Texto16: "domicilio",            // dirección país origen
  Texto17: null,                   // número (país origen)
  Texto18: null,                   // piso (país origen)
  Texto19: "localidad",            // localidad país origen
  Texto20: "codigoPostal",         // CP país origen
  Texto21: "provincia",            // provincia país origen
  Texto22: "nombrePadre",
  Texto23: null,                   // nombreMadre — mapped from field position
  // EstadoCivil: Casilla de verificación104..111
  Texto24: "representanteLegal",
  Texto25: null,                   // representante NIE letra
  Texto26: null,                   // representante NIE control

  // ── Apartado 2: Representante legal ─────────────────────
  Texto27: null,                   // rep_primerApellido (mapped from representanteLegal)
  Texto28: null,                   // rep_NIE letra
  Texto29: null,                   // rep_nie
  Texto30: null,                   // rep_NIE control
  Texto31: null,                   // rep_nombre (mapped from representanteLegal)
  Texto32: null,                   // rep_nacionalidad
  Texto33: "representanteDniNiePas",
  // rep sexo, estadoCivil checkboxes
  Texto34: null,                   // rep_DD
  Texto35: null,                   // rep_MM
  Texto36: null,                   // rep_YYYY
  Texto37: null,                   // rep_lugarNacimiento
  Texto38: null,                   // rep_paisNacimiento
  Texto39: null,                   // rep_telefono
  Texto40: null,                   // rep_email
  Texto41: null,                   // rep_domicilio
  Texto42: null,                   // rep_numero
  Texto43: null,                   // rep_piso
  Texto44: null,                   // rep_localidad
  Texto45: null,                   // rep_cp
  Texto46: null,                   // rep_provincia
  Texto47: "representanteTitulo",

  // ── Apartado 3: Domicilio en España / Notificaciones ────
  Texto48: "nie",                  // NIE del solicitante (domicilio section)
  Texto49: null,                   // delegación
  Texto50: "domicilio",            // domicilio España
  Texto51: "numeroDomicilio",
  Texto52: "pisoDomicilio",
  Texto53: "localidad",
  Texto54: "codigoPostal",
  Texto55: "provincia",
  Texto56: "telefono",
  Texto57: "email",
  Texto58: null,                   // representante dir

  // ── Page 2: Domicilio representante (cont.) ──────────────
  Texto59: null,                   // rep_domicilio_cont
  Texto60: null,                   // rep_numero_cont
  Texto61: null,                   // rep_piso_cont
  Texto62: null,                   // rep_localidad_cont
  Texto63: null,                   // rep_cp_cont
  Texto64: null,                   // rep_provincia_cont
  Texto65: null,                   // rep_telefono_cont
  Texto66: null,                   // rep_email_cont

  // ── Apartado 3b: Notificaciones ─────────────────────────
  Texto67: "notifNombre",
  Texto68: "notifDniNiePas",
  Texto69: "notifDomicilio",
  Texto70: "notifNumero",
  Texto71: "notifNombre",          // duplicate? — page 2 notif nombre
  Texto72: null,                   // notif extra
  Texto73: "notifDomicilio",
  Texto74: "notifProvincia",
  Texto75: "notifLocalidad",
  Texto76: "notifDomicilio",       // address cont
  Texto77: "notifNumero",
  Texto78: "notifPiso",
  Texto79: "notifLocalidad",
  Texto80: "notifCodigoPostal",
  Texto81: "notifProvincia",
  Texto82: "notifTelefono",
  Texto83: "notifEmail",

  // ── Page 2 lower: Representante presentación? ────────────
  Texto84: "repPresentacionNombre",
  Texto85: "repPresentacionDniNiePas",
  Texto86: "repPresentacionRepTitulo",

  // ── Page 2 lower: additional text fields ─────────────────
  Texto87: null,                   // circunstancia text
  Texto88: null,
  Texto89: null,
  Texto90: null,
  Texto91: null,
  Texto92: null,
  Texto93: null,
  Texto94: null,
  Texto95: null,

  // ── Page 3 lower: firma fields ──────────────────────────
  Texto149: null,                  // localidad firma
  Texto150: null,                  // día firma
  Texto151: null,                  // mes firma
  Texto152: null,                  // año firma
  Texto153: null,                  // firma text
  Texto154: null,                  // delegación
  Texto155: null,
  Texto156: null,
};

export const EX_10_SEXO_CHECKBOXES: Record<string, string> = {
  "Casilla de verificación96": "H",
  "Casilla de verificación97": "M",
  "Casilla de verificación98": "X",
};

export const EX_10_TIPO_DOC_CHECKBOXES: Record<string, string> = {
  "Casilla de verificación99":  "pasaporte",
  "Casilla de verificación100": "titulo_viaje",
  "Casilla de verificación101": "cedula",
  "Casilla de verificación102": "documento_identidad",
  "Casilla de verificación103": "nie",
};

export const EX_10_ESTADO_CIVIL_CHECKBOXES: Record<string, string> = {
  "Casilla de verificación104": "soltero",
  "Casilla de verificación105": "casado",
  "Casilla de verificación106": "viudo",
  "Casilla de verificación107": "separado",
  "Casilla de verificación108": "divorciado",
  "Casilla de verificación109": "pareja_hecho",
};

export const EX_10_CIRCUNSTANCIA_CHECKBOXES: Record<string, string> = {
  "Casilla de verificación119": "arraigo_familiar",
  "Casilla de verificación120": "arraigo_social",
  "Casilla de verificación121": "arraigo_sociolaboral",
  "Casilla de verificación122": "arraigo_socioformatiu",
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

export const EX_10_HIJOS_CHECKBOXES: Record<string, boolean> = {
  // EX-10 does not have hijosEscolarizacion checkboxes
};

export const EX_10_CONSENTIMIENTO_CHECKBOX = "Casilla de verificación112";

export const EX_10_DATE_FIELDS = {
  fechaNacimiento: { dd: "Texto8", mm: "Texto9", yyyy: "Texto10" },
} as const;
