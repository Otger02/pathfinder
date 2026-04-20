/**
 * EX-02 — Autorización de residencia temporal por reagrupación familiar
 * 3 pages, 121 fields. Generic naming (Textfield, Textfield-N).
 * The REAGRUPANTE is the main applicant.
 * The REAGRUPADA is the person being brought.
 */
import type { PersonalDataField } from "@/lib/types/personal-data";

export const EX_02_TEXT_FIELDS: Record<string, PersonalDataField | null> = {
  // ── Reagrupante (solicitante principal) ──────────────────
  "Textfield":    "primerApellido",
  "Textfield-0":  null,             // NIE letra
  "Textfield-1":  "nie",
  "Textfield-2":  null,             // NIE control
  "Textfield-7":  "nombre",
  "x":            "segundoApellido",
  "Textfield-3":  "nacionalidad",
  "Feccha de nacimientoz": null,    // DD
  "Texto-1":      null,             // MM
  "Textfield-4":  null,             // YYYY
  "Estado civil3 S": "lugarNacimiento",
  "Textfield-5":  "paisNacimiento",
  "Textfield-8":  "domicilio",
  "Piso":         null,
  "CP":           "localidad",
  "Textfield-10": "codigoPostal",
  "Textfield-11": "provincia",
  "Textfield-13": "telefono",
  "Textfield-15": "email",
  "Textfield-16": null,             // nombrePadre
  "Textfield-17": null,             // nombreMadre
  "Textfield-19": "representanteLegal",
  "Textfield-21": "representanteDniNiePas",
  "Textfield-23": "representanteTitulo",
  "Textfield-25": null,             // autorizaciónTitular
  // NO / Hijasos: hijosEscolarizacion

  // ── Apartado 1: Reagrupada ───────────────────────────────
  "N-0":          null,             // reagrupada_primerApellido
  "Textfield-26": null,             // reagrupada_NIE letra
  "Textfield-28": null,             // reagrupada_nie
  "Textfield-29": null,             // reagrupada_NIE control
  "Textfield-30": null,             // reagrupada_nombre
  "Textfield-31": null,             // reagrupada_segundoApellido
  "Textfield-32": null,             // reagrupada_nacionalidad
  // H-0/M-0/Estado civil3: reagrupada_sexo
  // C-0..ChkBox-1: reagrupada_estadoCivil
  "Fecha de nacimientoz": null,     // reagrupada_DD
  "Texto-2":      null,             // reagrupada_MM
  "Textfield-33": null,             // reagrupada_YYYY
  "Nombre de la madre": null,       // reagrupada_lugarNacimiento
  "Textfield-34": null,             // reagrupada_paisNacimiento
  "Textfield-35": null,             // reagrupada_nombrePadre
  "Piso-0":       null,             // reagrupada_nombreMadre
  "Provincia-0":  null,             // reagrupada_domicilio
  "Textfield-36": null,             // reagrupada_numero
  "Textfield-37": null,             // reagrupada_piso
  "Textfield-38": null,             // reagrupada_localidad
  "Textfield-39": null,             // reagrupada_cp
  "Textfield-40": null,             // reagrupada_provincia
  "Textfield-41": null,             // reagrupada_parentesco

  // ── Apartado 2: Representante presentación ───────────────
  "Textfield-42": "repPresentacionNombre",
  "Textfield-43": "repPresentacionDniNiePas",
  "Textfield-44": "repPresentacionDomicilio",
  "Textfield-45": "repPresentacionNumero",
  "Textfield-46": "repPresentacionPiso",
  "Email":        "repPresentacionEmail",
  "Textfield-48": "repPresentacionLocalidad",
  "Textfield-49": "repPresentacionCodigoPostal",
  "Textfield-50": "repPresentacionProvincia",
  "Textfield-52": "repPresentacionTelefono",
  "Textfield-53": "repPresentacionRepLegal",
  "Textfield-54": "repPresentacionRepDniNiePas",
  "Textfield-55": "repPresentacionRepTitulo",

  // ── Apartado 3: Notificaciones ───────────────────────────
  "Textfield-56": "notifNombre",
  "Textfield-57": "notifDniNiePas",
  "Textfield-59": "notifDomicilio",
  "Textfield-60": "notifNumero",
  "Textfield-61": "notifPiso",
  "Email-0":      "notifEmail",
  "Textfield-62": "notifLocalidad",
  "Textfield-63": "notifCodigoPostal",
  "Textfield-64": "notifProvincia",
  "Textfield-65": "notifTelefono",
};

export const EX_02_SEXO_CHECKBOXES: Record<string, string> = {
  "H": "H", "M": "M", "ChkBox": "X",
};
export const EX_02_REAGRUPADA_SEXO_CHECKBOXES: Record<string, string> = {
  "H-0": "H", "M-0": "M", "Estado civil3": "X",
};
export const EX_02_ESTADO_CIVIL_CHECKBOXES: Record<string, string> = {
  "C": "casado", "V": "viudo", "D": "divorciado", "Sp": "pareja_hecho", "ChkBox-0": "soltero",
};
export const EX_02_REAGRUPADA_ESTADO_CIVIL_CHECKBOXES: Record<string, string> = {
  "C-0": "casado", "V-0": "viudo", "D-0": "divorciado",
  "Sp-0": "pareja_hecho", "ChkBox-1": "soltero",
};
export const EX_02_HIJOS_CHECKBOXES: Record<string, boolean> = {
  "NO": false, "Hijasos a cargo en edad de escolarizaclon en Espan": true,
};
export const EX_02_CONSENTIMIENTO_CHECKBOX =
  "CONSIENTO que las comunicaciones y notifcaciones s";
export const EX_02_DATE_FIELDS = {
  fechaNacimiento:          { dd: "Feccha de nacimientoz", mm: "Texto-1",  yyyy: "Textfield-4" },
  reagrupadaFechaNacimiento:{ dd: "Fecha de nacimientoz",  mm: "Texto-2",  yyyy: "Textfield-33" },
} as const;
