/**
 * EX-00 — Autorización de estancia de larga duración
 * 3 pages, 95 fields. Naming convention: generic (Textfield, Textfield-N).
 */
import type { PersonalDataField } from "@/lib/types/personal-data";

export const EX_00_TEXT_FIELDS: Record<string, PersonalDataField | null> = {
  // ── Apartado 1: Solicitante ──────────────────────────────
  "Textfield":    "numeroDocumento",    // Y~638 left
  "Textfield-0":  null,                 // NIE letra
  "Textfield-1":  "nie",               // NIE número
  "Textfield-2":  null,                 // NIE dígito control
  "N":            "primerApellido",
  "x":            "segundoApellido",
  "Textfield-3":  "nombre",
  // Fecha nacimiento: split DD/MM/YYYY
  "Fecha de nacimientoz": null,         // DD
  "Texto-1":      null,                 // MM
  "Textfield-4":  null,                 // YYYY
  "Estado civil3 S": "lugarNacimiento",
  "Textfield-5":  "paisNacimiento",
  "Textfield-6":  "nacionalidad",
  // Estado civil: checkboxes C/V/D/Sp/ChkBox-0
  "Textfield-8":  "domicilio",
  "Piso":         null,                 // número + piso juntos
  "CP":           "localidad",
  "Textfield-9":  "codigoPostal",
  "Textfield-10": "provincia",
  "Textfield-12": "telefono",
  "Textfield-13": "email",
  "Textfield-15": null,                 // nombrePadre — campo visual, no en PersonalData base
  "Textfield-17": "representanteLegal",
  "D NIN IEPAS":  "representanteDniNiePas",
  "Textfield-21": null,                 // representante título texto libre
  "Textfield-23": "representanteTitulo",
  "Textfield-25": null,                 // campo adicional representante

  // ── Apartado 6: Representante presentación ───────────────
  "Textfield-26": "repPresentacionNombre",
  "Piso-0":       "repPresentacionDniNiePas",
  "Provincia-0":  "repPresentacionDomicilio",
  "Textfield-27": "repPresentacionNumero",
  "Textfield-28": "repPresentacionPiso",
  "Textfield-29": "repPresentacionLocalidad",
  "Textfield-30": "repPresentacionCodigoPostal",
  "Textfield-32": "repPresentacionProvincia",
  "Textfield-33": "repPresentacionTelefono",
  "Textfield-35": "repPresentacionEmail",
  "Textfield-37": "repPresentacionRepLegal",
  "Titulo4":      "repPresentacionRepDniNiePas",
  "Textfield-39": "repPresentacionRepTitulo",

  // ── Apartado 7: Notificaciones ───────────────────────────
  "Textfield-40": "notifNombre",
  "Textfield-41": "notifDniNiePas",
  "Textfield-42": "notifDomicilio",
  "Textfield-43": "notifNumero",
  "Textfield-44": "notifPiso",
  "Textfield-45": "notifLocalidad",
  "Email":        "notifEmail",
  "Textfield-47": "notifProvincia",
  "Textfield-48": "notifTelefono",
  "Textfield-51": null,                 // campo extra notif
};

export const EX_00_SEXO_CHECKBOXES: Record<string, string> = {
  "H":       "H",
  "M":       "M",
  "ChkBox":  "X",
};

export const EX_00_ESTADO_CIVIL_CHECKBOXES: Record<string, string> = {
  "C":        "casado",
  "V":        "viudo",
  "D":        "divorciado",
  "Sp":       "pareja_hecho",
  "ChkBox-0": "soltero",
};

export const EX_00_TIPO_DOC_CHECKBOXES: Record<string, string> = {
  // EX-00 no tiene checkbox de tipo doc explícito — se infiere del campo relleno
};

export const EX_00_HIJOS_CHECKBOXES: Record<string, boolean> = {
  // No aparece en EX-00
};

export const EX_00_CONSENTIMIENTO_CHECKBOX =
  "CONSIENTO que las comunicaciones y notifcaciones s";

export const EX_00_DATE_FIELDS = {
  fechaNacimiento: { dd: "Fecha de nacimientoz", mm: "Texto-1", yyyy: "Textfield-4" },
} as const;
