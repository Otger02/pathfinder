/**
 * EX-11 — Autorización de residencia de larga duración o larga duración-UE
 * 3 pages, 93 fields. Generic naming — simplest form structure.
 */
import type { PersonalDataField } from "@/lib/types/personal-data";

export const EX_11_TEXT_FIELDS: Record<string, PersonalDataField | null> = {
  // ── Apartado 1: Solicitante ──────────────────────────────
  "Textfield-2":  "primerApellido",
  "Textfield-3":  null,            // NIE letra
  "Textfield-4":  "nie",
  "Textfield-5":  null,            // NIE control
  "CP":           "nombre",
  "x H":          "segundoApellido",
  "Textfield-6":  "nacionalidad",
  "Textfield-7":  null,            // sexo H checkbox (ver SEXO_CHECKBOXES)
  "Fecha de nacimientoz": null,    // DD
  "Texto-1":      null,            // MM
  "Textfield-8":  null,            // YYYY
  "Estado civil3 S": "lugarNacimiento",
  "Textfield-9":  "paisNacimiento",
  "Textfield-10": "domicilio",
  "Piso":         null,
  "Provincia":    "localidad",
  "Textfield-13": "codigoPostal",
  "Textfield-14": "provincia",
  "Textfield-15": "telefono",
  "Textfield-17": "email",
  "Textfield-19": null,            // nombrePadre
  "Textfield-20": null,            // nombreMadre
  "DN IN IEPAS":  "representanteLegal",
  "Textfield-24": "representanteDniNiePas",
  "Textfield-26": "representanteTitulo",
  "Textfield-28": null,
  // NO/Hijasos: hijosEscolarizacion

  // ── Apartado 2: Representante presentación ───────────────
  "Textfield-30": "repPresentacionNombre",
  "Piso-0":       "repPresentacionDniNiePas",
  "Textfield-31": "repPresentacionDomicilio",
  "Textfield-32": "repPresentacionNumero",
  "Textfield-33": "repPresentacionPiso",
  "Textfield-35": "repPresentacionLocalidad",
  "Textfield-36": "repPresentacionCodigoPostal",
  "Textfield-38": "repPresentacionProvincia",
  "Textfield-40": "repPresentacionTelefono",
  "D NIN IEPAS":  "repPresentacionEmail",
  "Textfield-41": "repPresentacionRepLegal",
  "Textfield-42": "repPresentacionRepDniNiePas",
  "Textfield-43": "repPresentacionRepTitulo",

  // ── Apartado 3: Notificaciones ───────────────────────────
  "Textfield-44": "notifNombre",
  "N Piso":       "notifDniNiePas",
  "Provincia-1":  "notifDomicilio",
  "Textfield-46": "notifNumero",
  "Textfield-47": "notifPiso",
  "Textfield-48": "notifLocalidad",
  "Textfield-49": "notifCodigoPostal",
  "Textfield-51": "notifProvincia",
  "Textfield-53": "notifTelefono",
  "Textfield-54": "notifEmail",
};

export const EX_11_SEXO_CHECKBOXES: Record<string, string> = {
  "Textfield-7": "H",   // CheckBox en inspección aparece como TextField — verificar
  "M":           "M",
  "ChkBox":      "X",
};
export const EX_11_ESTADO_CIVIL_CHECKBOXES: Record<string, string> = {
  "C": "casado", "V": "viudo", "D": "divorciado", "Sp": "pareja_hecho", "ChkBox-0": "soltero",
};
export const EX_11_HIJOS_CHECKBOXES: Record<string, boolean> = {
  "NO": false,
  "Hijasos a cargo en edad de escolarizacion en Espan": true,
};
export const EX_11_CONSENTIMIENTO_CHECKBOX =
  "CONSIENTO que las comunicaciones y notifcaciones s";
export const EX_11_DATE_FIELDS = {
  fechaNacimiento: { dd: "Fecha de nacimientoz", mm: "Texto-1", yyyy: "Textfield-8" },
} as const;
