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
  "Textfield-19": "nombrePadre",
  "Textfield-20": "nombreMadre",
  "DN IN IEPAS":  "representanteLegal",
  "Textfield-24": "representanteDniNiePas",
  "Textfield-26": "representanteTitulo",
  "Textfield-28": null,

  // ── Apartado 2: Representante presentación ───────────────
  "Textfield-30": "repPresentacion_nombre",
  "Piso-0":       "repPresentacion_dniNiePas",
  "Textfield-31": "repPresentacion_domicilio",
  "Textfield-32": "repPresentacion_numero",
  "Textfield-33": "repPresentacion_piso",
  "Textfield-35": "repPresentacion_localidad",
  "Textfield-36": "repPresentacion_codigoPostal",
  "Textfield-38": "repPresentacion_provincia",
  "Textfield-40": "repPresentacion_telefono",
  "D NIN IEPAS":  "repPresentacion_email",
  "Textfield-41": "repPresentacion_repLegal",
  "Textfield-42": "repPresentacion_repDniNiePas",
  "Textfield-43": "repPresentacion_repTitulo",

  // ── Apartado 3: Notificaciones ───────────────────────────
  "Textfield-44": "notif_nombre",
  "N Piso":       "notif_dniNiePas",
  "Provincia-1":  "notif_domicilio",
  "Textfield-46": "notif_numero",
  "Textfield-47": "notif_piso",
  "Textfield-48": "notif_localidad",
  "Textfield-49": "notif_codigoPostal",
  "Textfield-51": "notif_provincia",
  "Textfield-53": "notif_telefono",
  "Textfield-54": "notif_email",
};

export const EX_11_SEXO_CHECKBOXES: Record<string, string> = {
  "Textfield-7": "H",   // CheckBox en inspección aparece como TextField — verificar
  "M":           "M",
  "ChkBox":      "X",
};
export const EX_11_ESTADO_CIVIL_CHECKBOXES: Record<string, string> = {
  "C": "casado", "V": "viudo", "D": "divorciado", "Sp": "pareja_hecho", "ChkBox-0": "soltero",
};

export const EX_11_TIPO_DOC_CHECKBOXES: Record<string, string> = {
  // EX-11 no tiene checkbox de tipo doc explícito
};

export const EX_11_CIRCUNSTANCIA_CHECKBOXES: Record<string, string> = {
  // EX-11 no tiene checkbox de circunstancia
};

export const EX_11_TIPO_AUTORIZACION_CHECKBOXES: Record<string, string> = {
  // ── RESIDENCIA LARGA DURACION ──
  "RESIDE NCIA LARGA DURACION":                                 "residencia_larga_duracion",
  "Titular de autorizacion de residencia temporal y t":         "titular_residencia_temporal_trabajo",
  "Titular de autorizacion de residencia temporal por":         "titular_residencia_temporal_reagrupacion",
  "Titular de autorizacion de residencia temporal con":         "titular_residencia_temporal_excepcion",
  "Titular de autorizacion de residencia por circunst":         "titular_residencia_circunstancias",
  "Titular de autorizacion de residencia no lucrativa":         "titular_residencia_no_lucrativa",
  "Titular de tarjeta de identidad de extranjero TIE":          "titular_tie",
  "Titular de autorizacion de residencia de familiar":          "titular_residencia_familiar",
  "Menor extranjero que al alcanzar la mayoria de eda":         "menor_mayoria_edad",
  "Titular de autorizacion de residencia por colabora":         "titular_residencia_colaboracion",
  "Titular de autorizacion de residencia temporal por-0":       "titular_residencia_temporal_proteccion",
  "Titular de autorizacion de residencia temporal y t-0":       "titular_residencia_temporal_trabajo_2",
  "Beneficiario del derecho a la proteccion internaci":         "beneficiario_proteccion_internacional",
  "Apátrida":                                                   "apatrida",
  "Otros":                                                      "otros_larga_duracion",
  // ── RESIDENCIA LARGA DURACION-UE ──
  "RESIDENCIA LARGA DURACIONUE":                                "residencia_larga_duracion_ue",
  "Titular de autorizacion de residencia de larga dur":         "titular_residencia_larga_duracion",
  "Titular de autorizacion de residencia de larga dur-0":       "titular_residencia_larga_duracion_2",
  "Titular de tarjeta de residencia permanente de fam":         "titular_tarjeta_permanente_familiar",
  "Beneficiario del derecho a la proteccion internaci-0":       "beneficiario_proteccion_internacional_ue",
  "Otros-1":                                                    "otros_larga_duracion_ue",
};

export const EX_11_HIJOS_ESCOLARIZACION_CHECKBOXES: Record<string, boolean> = {
  "NO": false,
  "Hijasos a cargo en edad de escolarizacion en Espan": true,
};

export const EX_11_CONSENTIMIENTO_CHECKBOX =
  "CONSIENTO que las comunicaciones y notifcaciones s";

export const EX_11_DATE_FIELDS = {
  fechaNacimiento: { dd: "Fecha de nacimientoz", mm: "Texto-1", yyyy: "Textfield-8" },
} as const;
