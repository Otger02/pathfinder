import type { PersonalDataField } from "@/lib/types/personal-data";

export const EX_02_TEXT_FIELDS: Record<string, PersonalDataField | null> = {
  // Apartat 1 — Reagrupant
  "Textfield":    "pasaporte",
  "Textfield-0":  null,            // NIE lletra
  "Textfield-1":  "nie",
  "Textfield-2":  null,            // NIE control
  "Textfield-7":  "primerApellido",
  "x":            "segundoApellido",
  "Textfield-3":  "nombre",
  "Textfield-4":  null,            // DD fechaNacimiento
  "Texto-1":      null,            // MM fechaNacimiento
  "Fecha de nacimientoz": null,    // YYYY fechaNacimiento
  "Estado civil3 S": "lugarNacimiento",
  "Textfield-5":  "paisNacimiento",
  "Textfield-8":  "nacionalidad",
  "Textfield-9":  "nombrePadre",
  "Piso":         "nombreMadre",
  "CP":           "domicilio",
  "Textfield-10": "numeroDomicilio",
  "Textfield-11": "pisoDomicilio",
  "Textfield-13": "localidad",
  "Textfield-15": "codigoPostal",
  "Textfield-16": "provincia",
  "Textfield-17": "telefono",
  "Textfield-19": "email",
  "Textfield-21": "representanteLegal",
  "Textfield-23": "representanteDniNiePas",
  "Textfield-25": "representanteTitulo",
  // Apartat 2 — Reagrupat
  "N-0":          "familiar_pasaporte",
  "Textfield-28": "familiar_nie",
  "Textfield-29": null,            // familiar NIE control
  "Textfield-30": "familiar_primerApellido",
  "Textfield-31": "familiar_segundoApellido",
  "Textfield-32": "familiar_nombre",
  "Texto-2":      null,            // familiar DD fechaNacimiento
  "Feccha de nacimientoz": null,   // familiar MM fechaNacimiento (typo en PDF)
  "Textfield-33": null,            // familiar YYYY fechaNacimiento
  "Nombre de la madre": "familiar_paisNacimiento",
  "Textfield-34": "familiar_nacionalidad",
  "Textfield-35": "familiar_nombrePadre",
  "Piso-0":       "familiar_nombreMadre",
  "Provincia-0":  "familiar_domicilio",
  "Textfield-36": "familiar_numeroDomicilio",
  "Textfield-37": "familiar_pisoDomicilio",
  "Textfield-38": "familiar_localidad",
  "Textfield-39": "familiar_codigoPostal",
  "Textfield-40": "familiar_provincia",
  "Textfield-41": "familiar_vinculo",
  // Apartat 3 — RepPresentacion
  "Textfield-42": "repPresentacion_nombre",
  "Textfield-43": "repPresentacion_dniNiePas",
  "Textfield-44": "repPresentacion_domicilio",
  "Textfield-45": "repPresentacion_numero",
  "Textfield-46": "repPresentacion_piso",
  "Email":        "repPresentacion_localidad",
  "Textfield-48": "repPresentacion_codigoPostal",
  "Textfield-49": "repPresentacion_provincia",
  "Textfield-50": "repPresentacion_telefono",
  "Textfield-52": "repPresentacion_email",
  "Textfield-53": "repPresentacion_repLegal",
  "Textfield-54": "repPresentacion_repDniNiePas",
  "Textfield-55": "repPresentacion_repTitulo",
  // Apartat 4 — Notif
  "Textfield-56": "notif_nombre",
  "Textfield-57": "notif_dniNiePas",
  "Textfield-59": "notif_domicilio",
  "Textfield-60": "notif_numero",
  "Textfield-61": "notif_piso",
  "Email-0":      "notif_localidad",
  "Textfield-62": "notif_codigoPostal",
  "Textfield-63": "notif_provincia",
  "Textfield-64": "notif_telefono",
  "Textfield-65": "notif_email",
};

export const EX_02_DATE_FIELDS = {
  fechaNacimiento:         { dd: "Textfield-4",  mm: "Texto-1",            yyyy: "Fecha de nacimientoz" },
  familiar_fechaNacimiento:{ dd: "Texto-2",      mm: "Feccha de nacimientoz", yyyy: "Textfield-33" },
} as const;

export const EX_02_SEXO_CHECKBOXES: Record<string, string> = {
  "H": "H", "M": "M", "ChkBox": "X",
};

export const EX_02_FAMILIAR_SEXO_CHECKBOXES: Record<string, string> = {
  "H-0": "H", "M-0": "M", "Estado civil3": "X",
};

export const EX_02_ESTADO_CIVIL_CHECKBOXES: Record<string, string> = {
  "C": "casado", "V": "viudo", "D": "divorciado",
  "Sp": "soltero", "ChkBox-0": "separado",
};

export const EX_02_FAMILIAR_ESTADO_CIVIL_CHECKBOXES: Record<string, string> = {
  "C-0": "casado", "V-0": "viudo", "D-0": "divorciado",
  "Sp-0": "soltero", "ChkBox-1": "separado",
};

export const EX_02_HIJOS_ESCOLARIZACION_CHECKBOXES: Record<string, boolean> = {
  "Hijasos a cargo en edad de escolarizaclon en Espan": true,
  "NO": false,
};

export const EX_02_TIPO_AUTORIZACION_CHECKBOXES: Record<string, string> = {
  "INICIAL": "inicial",
  "Familiar de titular de autorizacion de residencia":   "inicial_familiar_temporal",
  "Familiar de titular de autorizacion de residencia-0": "inicial_familiar_larga",
  "Familiar de titular o en tramite de autorizacion d":  "inicial_familiar_investigacion",
  "Familiar de titular o en tramite de tarjeta azulUE":  "inicial_familiar_azul",
  "Extranjero retornado voluntariamente art 120":        "inicial_retornado",
  "Menor nacido en Espana hijo de residente art 1853":   "inicial_menor_nacido",
  "Familiar del titular de autorizacion de estancia q":  "inicial_familiar_estancia",
  "Titular de autorizacion de residencia de familiar":   "inicial_busqueda_empleo",
  "Otros": "inicial_otros",
  "1a RENOVACION": "primera_renovacion",
  "2a RENOVACION": "segunda_renovacion",
  "Titular de autorizacion de residencia por reagrupa":  "renovacion_reagrupacion",
  "Titular de autorizacion de residencia por reagrupa-0":"renovacion_cambio_reagrupante",
  "Otros-1": "renovacion_otros",
  "RENOVACION ESPECIAL": "renovacion_especial",
  "Titular de autorizacion de residencia temporal por":  "renovacion_especial_investigador",
  "Otros-3": "renovacion_especial_otros",
};

export const EX_02_SIMULTANEAS_CHECKBOXES: Record<string, boolean> = {
  "SE HALLAN EN TRAMITE O PRESENTAN SIMULTANEAMENTE O": true,
  "NO-0": false,
};

export const EX_02_CONSENTIMIENTO_CHECKBOX =
  "CONSIENTO que las comunicaciones y notifcaciones s";

export const EX_02_TIPO_DOC_CHECKBOXES: Record<string, string> = {};
export const EX_02_CIRCUNSTANCIA_CHECKBOXES: Record<string, string> = {};
