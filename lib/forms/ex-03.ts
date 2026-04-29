/**
 * EX-03 — Autorización de residencia temporal y trabajo por cuenta ajena
 * 3 pages, 118 fields.
 */
import type { PersonalDataField } from "@/lib/types/personal-data";

export const EX_03_TEXT_FIELDS: Record<string, PersonalDataField | null> = {
  // ── Apartado 1: Solicitante ──────────────────────────────
  "Textfield-8":  "primerApellido",
  "Textfield":    null,             // NIE letra
  "Textfield-1":  "nie",
  "Textfield-2":  null,             // NIE control
  "Textfield-3":  "nombre",
  "Textfield-5":  "segundoApellido",
  "Lugar":        "nacionalidad",
  "Feccha de nacimientoz": null,    // DD
  "Texto-1":      null,             // MM
  "Textfield-6":  null,             // YYYY
  "Estado civil3t S": "lugarNacimiento",
  "Textfield-7":  "paisNacimiento",
  "Textfield-10": "domicilio",
  "Piso":         null,
  "Textfield-12": "localidad",
  "Textfield-13": "codigoPostal",
  "Textfield-14": "provincia",
  "Email":        "telefono",
  "Textfield-15": "email",
  "Textfield-16": "nombrePadre",
  "Textfield-17": "representanteLegal",
  "Textfield-19": "representanteDniNiePas",
  "Textfield-21": "representanteTitulo",
  "Textfield-23": null,
  "Textfield-25": null,

  // ── Apartado 2: Empleador ────────────────────────────────
  "Ocupacion6":   "empleador_nombre",
  "Textfield-26": "empleador_nifNie",
  "N Piso":       "empleador_actividad",
  "Textfield-28": "empleador_ocupacion",
  "Textfield-29": "empleador_domicilio",
  "Textfield-30": "empleador_numero",
  "Textfield-31": "empleador_piso",
  "Email-0":      "empleador_localidad",
  "Textfield-33": "empleador_codigoPostal",
  "Textfield-34": "empleador_provincia",
  "Textfield-35": "empleador_telefono",
  "Textfield-38": "empleador_email",
  "Textfield-39": "empleador_repNombre",
  "Textfield-40": "empleador_repDniNie",
  "Textfield-41": "empleador_repTitulo",

  // ── Apartado 3: Contrato de trabajo ─────────────────────
  "Textfield-42": null,             // puesto
  "Piso-0":       null,             // grupoCotizacion
  "Provincia-0":  null,             // cnoSepe
  "Textfield-43": null,             // codigoConvenio
  "Textfield-44": null,             // denominacionConvenio
  "Email-1":      null,             // codigoContrato
  "Textfield-46": null,             // denominacionContrato
  "Textfield-48": null,             // cuentaCotizacion
  "Textfield-49": null,             // retribucionBruta
  "Titulo-0":     null,             // direccionCentroTrabajo
  "Textfield-50": null,             // centro_numero
  "Textfield-51": null,             // centro_piso
  "Textfield-52": null,             // centro_localidad
  "Textfield-53": null,             // centro_cp
  "Textfield-54": null,             // centro_provincia

  // ── Apartado 4: Representante presentación ───────────────
  "Textfield-55": "repPresentacion_nombre",
  "Textfield-56": "repPresentacion_dniNiePas",
  "Textfield-57": "repPresentacion_domicilio",
  "Textfield-59": "repPresentacion_numero",
  "Textfield-60": "repPresentacion_piso",
  "Textfield-61": "repPresentacion_localidad",
  "Textfield-64": "repPresentacion_codigoPostal",

  // ── Apartado 5: Notificaciones ───────────────────────────
  "Nombre y apellidos del titular": "notif_nombre",
};

export const EX_03_SEXO_CHECKBOXES: Record<string, string> = {
  "H": "H", "M": "M", "ChkBox": "X",
};
export const EX_03_ESTADO_CIVIL_CHECKBOXES: Record<string, string> = {
  "C": "casado", "V": "viudo", "D": "divorciado", "Sp": "pareja_hecho", "ChkBox-0": "soltero",
};

export const EX_03_TIPO_DOC_CHECKBOXES: Record<string, string> = {
  // EX-03 no tiene checkbox de tipo doc explícito
};

export const EX_03_CIRCUNSTANCIA_CHECKBOXES: Record<string, string> = {
  // EX-03 no tiene checkbox de circunstancia
};

export const EX_03_TIPO_AUTORIZACION_CHECKBOXES: Record<string, string> = {
  // ── INICIAL ──
  "INICIAL":                                                    "inicial",
  "Autorizacion de residencia temporal y trabajo por":          "residencia_trabajo_cuenta_ajena",
  "Autorizacion de residencia temporal y trabajo por-0":        "residencia_trabajo_cuenta_ajena_2",
  "Otros":                                                      "otros_inicial",
  // ── RENOVACION ──
  "1a RENOVACION":                                              "primera_renovacion",
  "2a RENOVACION":                                              "segunda_renovacion",
  "Titular de autorizacion de residencia temporal y t":         "titular_residencia_trabajo",
  "Titular de autorizacion de residencia temporal y t-0":       "titular_residencia_trabajo_2",
  "Otros-1":                                                    "otros_renovacion",
  // ── RENOVACION ESPECIAL ──
  "RENOVACION ESPECIAL":                                        "renovacion_especial",
  "Titular de autorizacion de residencia temporal y t-1":       "titular_residencia_trabajo_especial",
  "Otros-3":                                                    "otros_renovacion_especial",
};

export const EX_03_HIJOS_ESCOLARIZACION_CHECKBOXES: Record<string, boolean> = {
  "NO": false,
  "Hijasos a cargo en edad de escolarizaclon en Espan": true,
};

export const EX_03_CONSENTIMIENTO_CHECKBOX =
  "CONSIENTO que las comunicaciones y notifcaciones s";

export const EX_03_DATE_FIELDS = {
  fechaNacimiento: { dd: "Feccha de nacimientoz", mm: "Texto-1", yyyy: "Textfield-6" },
} as const;
