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
  "Textfield-17": null,            // nombrePadre
  "Textfield-19": null,            // nombreMadre
  "Textfield-21": "representanteLegal",
  "Textfield-23": "representanteDniNiePas",
  "Textfield-25": "representanteTitulo",
  "Textfield-27": null,
  // NO/Hijasos: hijosEscolarizacion

  // ── Apartado 2: Datos de la actividad ────────────────────
  "Textfield-28": null,            // actividad_razonSocial
  "Textfield-30": null,            // actividad_nif
  "Textfield-31": null,            // actividad_actividad
  "Textfield-32": null,            // actividad_cnae
  "Textfield-33": null,            // actividad_domicilio
  "Textfield-34": null,            // actividad_numero
  "Textfield-35": null,            // actividad_piso
  "Textfield-36": null,            // actividad_localidad
  "Textfield-38": null,            // actividad_cp
  "Textfield-39": null,            // actividad_provincia
  "Textfield-40": null,            // actividad_telefono

  // ── Apartado 3: Representante presentación ───────────────
  "Textfield-41": "repPresentacionNombre",
  "Piso-0":       "repPresentacionDniNiePas",
  "Provincia-1":  "repPresentacionDomicilio",
  "Textfield-42": "repPresentacionNumero",
  "Textfield-43": "repPresentacionPiso",
  "Email":        "repPresentacionEmail",
  "Textfield-45": "repPresentacionLocalidad",
  "Textfield-47": "repPresentacionCodigoPostal",
  "Textfield-48": "repPresentacionProvincia",
  "Textfield-49": "repPresentacionTelefono",
  "Titulo":       "repPresentacionRepLegal",
  "Textfield-50": "repPresentacionRepDniNiePas",
  "Textfield-51": "repPresentacionRepTitulo",

  // ── Apartado 4: Notificaciones ───────────────────────────
  "Textfield-52": "notifNombre",
  "Textfield-53": "notifDniNiePas",
  "Textfield-55": "notifDomicilio",
  "Textfield-56": "notifNumero",
  "Textfield-57": "notifPiso",
  "Email-0":      "notifEmail",
  "Textfield-59": "notifLocalidad",
  "Textfield-60": "notifCodigoPostal",
  "Textfield-61": "notifProvincia",
  "Textfield-64": "notifTelefono",
};

export const EX_07_SEXO_CHECKBOXES: Record<string, string> = {
  "H": "H", "M": "M", "ChkBox": "X",
};
export const EX_07_ESTADO_CIVIL_CHECKBOXES: Record<string, string> = {
  "C": "casado", "V": "viudo", "D": "divorciado", "Sp": "pareja_hecho", "ChkBox-0": "soltero",
};
export const EX_07_HIJOS_CHECKBOXES: Record<string, boolean> = {
  "NO": false,
  "Hijasos a cargo en edad de escolarizacion en Espan": true,
};
export const EX_07_CONSENTIMIENTO_CHECKBOX =
  "CONSIENTO que las comunicaciones y notifcaciones s";
export const EX_07_DATE_FIELDS = {
  fechaNacimiento: { dd: "Fecha de nacimientoz", mm: "Texto-1", yyyy: "Textfield-6" },
} as const;
