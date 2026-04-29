/**
 * EX-07 — Autorización de residencia temporal y trabajo por cuenta propia
 * 3 pages, 107 fields. Generic naming (Textfield-N).
 */
import type { PersonalDataField } from "@/lib/types/personal-data";

export const EX_07_TEXT_FIELDS: Record<string, PersonalDataField | null> = {
  // ── Apartado 1: Solicitante ──────────────────────────────
  "Textfield-1":  "primerApellido",
  "Textfield-2":  null,            // NIE letra
  "Textfield-3":  "nie",
  "Textfield-4":  null,            // NIE control
  "Textfield-8":  "nombre",
  "x":            "segundoApellido",
  "Textfield-5":  "nacionalidad",
  "Fecha de nacimientoz": null,    // DD
  "Texto-1":      null,            // MM
  "Textfield-6":  null,            // YYYY
  "Estado civil3 S": "lugarNacimiento",
  "Textfield-7":  "paisNacimiento",
  "Textfield-9":  "domicilio",
  "Piso":         null,
  "Provincia":    "localidad",
  "Textfield-11": "codigoPostal",
  "Textfield-12": "provincia",
  "Textfield-14": "telefono",
  "Textfield-16": "email",
  "Textfield-17": "nombrePadre",
  "Textfield-19": "nombreMadre",
  "Textfield-21": "representanteLegal",
  "Textfield-23": "representanteDniNiePas",
  "Textfield-25": "representanteTitulo",
  "Textfield-27": null,

  // ── Apartado 2: Datos de la actividad ────────────────────
  "Textfield-28": "activitat_razonSocial",
  "Textfield-30": "activitat_nif",
  "Textfield-31": "activitat_actividad",
  "Textfield-32": null,            // cnae — no PersonalData field
  "Textfield-33": "activitat_domicilio",
  "Textfield-34": "activitat_numero",
  "Textfield-35": "activitat_piso",
  "Textfield-36": "activitat_localidad",
  "Textfield-38": "activitat_codigoPostal",
  "Textfield-39": "activitat_provincia",
  "Textfield-40": "activitat_telefono",

  // ── Apartado 3: Representante presentación ───────────────
  "Textfield-41": "repPresentacion_nombre",
  "Piso-0":       "repPresentacion_dniNiePas",
  "Provincia-1":  "repPresentacion_domicilio",
  "Textfield-42": "repPresentacion_numero",
  "Textfield-43": "repPresentacion_piso",
  "Email":        "repPresentacion_email",
  "Textfield-45": "repPresentacion_localidad",
  "Textfield-47": "repPresentacion_codigoPostal",
  "Textfield-48": "repPresentacion_provincia",
  "Textfield-49": "repPresentacion_telefono",
  "Titulo":       "repPresentacion_repLegal",
  "Textfield-50": "repPresentacion_repDniNiePas",
  "Textfield-51": "repPresentacion_repTitulo",

  // ── Apartado 4: Notificaciones ───────────────────────────
  "Textfield-52": "notif_nombre",
  "Textfield-53": "notif_dniNiePas",
  "Textfield-55": "notif_domicilio",
  "Textfield-56": "notif_numero",
  "Textfield-57": "notif_piso",
  "Email-0":      "notif_email",
  "Textfield-59": "notif_localidad",
  "Textfield-60": "notif_codigoPostal",
  "Textfield-61": "notif_provincia",
  "Textfield-64": "notif_telefono",
};

export const EX_07_SEXO_CHECKBOXES: Record<string, string> = {
  "H": "H", "M": "M", "ChkBox": "X",
};
export const EX_07_ESTADO_CIVIL_CHECKBOXES: Record<string, string> = {
  "C": "casado", "V": "viudo", "D": "divorciado", "Sp": "pareja_hecho", "ChkBox-0": "soltero",
};

export const EX_07_TIPO_DOC_CHECKBOXES: Record<string, string> = {
  // EX-07 no tiene checkbox de tipo doc explícito
};

export const EX_07_CIRCUNSTANCIA_CHECKBOXES: Record<string, string> = {
  // EX-07 no tiene checkbox de circunstancia
};

export const EX_07_TIPO_AUTORIZACION_CHECKBOXES: Record<string, string> = {
  // ── INICIAL ──
  "INICIAL":                                                    "inicial",
  "Autorizacion de residencia temporal y trabajo por":          "residencia_trabajo_cuenta_propia",
  "Otros":                                                      "otros_inicial",
  // ── RENOVACION ──
  "1a RENOVACION":                                              "primera_renovacion",
  "2a RENOVACION":                                              "segunda_renovacion",
  "Titular de autorizacion de residencia temporal y t":         "titular_residencia_trabajo",
  "Otros-1":                                                    "otros_renovacion",
  // ── RENOVACION ESPECIAL ──
  "RENOVACION ESPECIAL":                                        "renovacion_especial",
  "Titular de autorizacion de residencia temporal y t-0":       "titular_residencia_trabajo_especial",
  "Otros-3":                                                    "otros_renovacion_especial",
};

export const EX_07_HIJOS_ESCOLARIZACION_CHECKBOXES: Record<string, boolean> = {
  "NO": false,
  "Hijasos a cargo en edad de escolarizacion en Espan": true,
};

export const EX_07_CONSENTIMIENTO_CHECKBOX =
  "CONSIENTO que las comunicaciones y notifcaciones s";

export const EX_07_DATE_FIELDS = {
  fechaNacimiento: { dd: "Fecha de nacimientoz", mm: "Texto-1", yyyy: "Textfield-6" },
} as const;
