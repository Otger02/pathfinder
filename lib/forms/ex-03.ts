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
  "Textfield-16": null,             // nombrePadre
  "Textfield-17": "representanteLegal",
  "Textfield-19": "representanteDniNiePas",
  "Textfield-21": "representanteTitulo",
  "Textfield-23": null,
  "Textfield-25": null,
  // NO/Hijasos: hijosEscolarizacion

  // ── Apartado 2: Empleador ────────────────────────────────
  "Ocupacion6":   null,             // empleador_nombre
  "Textfield-26": null,             // empleador_nif
  "N Piso":       null,             // empleador_actividad
  "Textfield-28": null,             // empleador_cnae
  "Textfield-29": null,             // empleador_domicilio
  "Textfield-30": null,             // empleador_numero
  "Textfield-31": null,             // empleador_piso
  "Email-0":      null,             // empleador_localidad
  "Textfield-33": null,             // empleador_cp
  "Textfield-34": null,             // empleador_provincia
  "Textfield-35": null,             // empleador_telefono
  "Textfield-38": null,             // empleador_email
  "Textfield-39": null,             // empleador_repLegal
  "Textfield-40": null,             // empleador_repDni
  "Textfield-41": null,             // empleador_repTitulo

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
  "Textfield-55": "repPresentacionNombre",
  "Textfield-56": "repPresentacionDniNiePas",
  "Textfield-57": "repPresentacionDomicilio",
  "Textfield-59": "repPresentacionNumero",
  "Textfield-60": "repPresentacionPiso",
  "Textfield-61": "repPresentacionLocalidad",
  "Textfield-64": "repPresentacionCodigoPostal",

  // ── Apartado 5: Notificaciones ───────────────────────────
  "Nombre y apellidos del titular": "notifNombre",
};

export const EX_03_SEXO_CHECKBOXES: Record<string, string> = {
  "H": "H", "M": "M", "ChkBox": "X",
};
export const EX_03_ESTADO_CIVIL_CHECKBOXES: Record<string, string> = {
  "C": "casado", "V": "viudo", "D": "divorciado", "Sp": "pareja_hecho", "ChkBox-0": "soltero",
};
export const EX_03_HIJOS_CHECKBOXES: Record<string, boolean> = {
  "NO": false,
  "Hijasos a cargo en edad de escolarizaclon en Espan": true,
};
export const EX_03_CONSENTIMIENTO_CHECKBOX =
  "CONSIENTO que las comunicaciones y notifcaciones s";
export const EX_03_DATE_FIELDS = {
  fechaNacimiento: { dd: "Feccha de nacimientoz", mm: "Texto-1", yyyy: "Textfield-6" },
} as const;
