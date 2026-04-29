/**
 * EX-25 — Solicitud de residencia temporal y desplazamiento temporal de menores extranjeros
 * 3 pages, 104 fields. Texto157..Texto234 naming (offset numbering).
 */
import type { PersonalDataField } from "@/lib/types/personal-data";

export const EX_25_TEXT_FIELDS: Record<string, PersonalDataField | null> = {
  // ── Apartado 1: Menor solicitante ────────────────────────
  Texto157: "primerApellido",
  Texto158: null,                  // NIE letra
  Texto159: "nie",
  Texto160: null,                  // NIE control
  Texto161: "nombre",
  Texto162: "segundoApellido",
  Texto163: "nacionalidad",
  Texto164: null,                  // DD
  Texto165: null,                  // MM
  Texto166: null,                  // YYYY
  Texto167: "lugarNacimiento",
  Texto168: "paisNacimiento",
  Texto169: "domicilio",           // campo largo único en este formulario
  Texto170: "nombrePadre",
  Texto171: "nombreMadre",
  Texto172: "domicilio",
  Texto173: "numeroDomicilio",
  Texto174: "pisoDomicilio",
  Texto175: "localidad",
  Texto177: "codigoPostal",
  Texto178: "provincia",
  Texto176: "telefono",
  Texto179: "email",
  Texto180: "representanteLegal",
  Texto181: "representanteDniNiePas",
  Texto182: "representanteTitulo",

  // ── Apartado 2: Entidad/persona que tutela o promueve ────
  Texto183: "tutor_nombre",
  Texto184: "tutor_dniNiePas",
  Texto185: "tutor_naturaleza",
  Texto186: "tutor_relacionMenor",
  Texto187: "tutor_domicilio",
  Texto188: "tutor_numero",
  Texto189: "tutor_piso",
  Texto190: "tutor_localidad",
  Texto191: "tutor_codigoPostal",
  Texto192: "tutor_provincia",
  Texto193: "tutor_telefono",
  Texto194: "tutor_email",
  Texto195: "tutor_repNombre",
  Texto196: "tutor_repDniNie",
  Texto197: "tutor_repTitulo",

  // ── Apartado 3: Representante presentación ───────────────
  Texto198: "repPresentacion_nombre",
  Texto199: "repPresentacion_dniNiePas",
  Texto200: "repPresentacion_domicilio",
  Texto201: "repPresentacion_numero",
  Texto202: "repPresentacion_piso",
  Texto203: "repPresentacion_localidad",
  Texto204: "repPresentacion_codigoPostal",
  Texto205: "repPresentacion_provincia",
  Texto206: "repPresentacion_telefono",
  Texto207: "repPresentacion_email",
  Texto208: "repPresentacion_repLegal",
  Texto209: "repPresentacion_repDniNiePas",
  Texto210: "repPresentacion_repTitulo",

  // ── Apartado 4: Notificaciones ───────────────────────────
  Texto211: "notif_nombre",
  Texto212: "notif_dniNiePas",
  Texto213: "notif_domicilio",
  Texto214: "notif_numero",
  Texto215: "notif_piso",
  Texto216: "notif_localidad",
  Texto217: "notif_codigoPostal",
  Texto218: "notif_provincia",
  Texto219: "notif_telefono",
  Texto220: "notif_email",

  // ── Firma / signing section ──────────────────────────────
  Texto221: null,
  Texto222: null,
  Texto223: null,
  Texto224: null,
  Texto225: null,
  Texto226: null,
  Texto227: null,
  Texto228: null,
  Texto229: null,
  Texto230: null,
  Texto231: null,
  Texto232: null,
  Texto233: null,
  Texto234: null,
};

export const EX_25_SEXO_CHECKBOXES: Record<string, string> = {
  "Casilla de verificación235": "H",
  "Casilla de verificación236": "M",
  "Casilla de verificación237": "X",
};
export const EX_25_ESTADO_CIVIL_CHECKBOXES: Record<string, string> = {};
export const EX_25_CONSENTIMIENTO_CHECKBOX = "Casilla de verificación260";
export const EX_25_TIPO_DOC_CHECKBOXES: Record<string, string> = {};
export const EX_25_CIRCUNSTANCIA_CHECKBOXES: Record<string, string> = {};
export const EX_25_HIJOS_ESCOLARIZACION_CHECKBOXES: Record<string, boolean> = {};
export const EX_25_TIPO_AUTORIZACION_CHECKBOXES: Record<string, string> = {
  "Casilla de verificación238": "residencia_temporal_menor_tutelado",
  "Casilla de verificación239": "residencia_temporal_menor_no_acompanado",
  "Casilla de verificación240": "residencia_temporal_menor_reagrupado",
  "Casilla de verificación241": "residencia_temporal_menor_nacido_espana",
  "Casilla de verificación242": "residencia_temporal_menor_hijo_residente",
  "Casilla de verificación243": "renovacion_residencia_menor_tutelado",
  "Casilla de verificación244": "renovacion_residencia_menor_no_acompanado",
  "Casilla de verificación245": "renovacion_residencia_menor_reagrupado",
  "Casilla de verificación246": "renovacion_residencia_menor_nacido_espana",
  "Casilla de verificación247": "renovacion_residencia_menor_hijo_residente",
  "Casilla de verificación248": "desplazamiento_temporal_estudios",
  "Casilla de verificación249": "desplazamiento_temporal_tratamiento_medico",
  "Casilla de verificación250": "desplazamiento_temporal_vacaciones",
  "Casilla de verificación251": "desplazamiento_temporal_competicion",
  "Casilla de verificación252": "desplazamiento_temporal_otros",
  "Casilla de verificación253": "autorizacion_residencia_independiente",
  "Casilla de verificación254": "modificacion_residencia_trabajo",
  "Casilla de verificación255": "residencia_larga_duracion",
  "Casilla de verificación256": "cedula_inscripcion",
  "Casilla de verificación257": "documento_identidad_apátrida",
  "Casilla de verificación258": "titulo_viaje",
  "Casilla de verificación259": "otros",
};
export const EX_25_DATE_FIELDS = {
  fechaNacimiento: { dd: "Texto164", mm: "Texto165", yyyy: "Texto166" },
} as const;
