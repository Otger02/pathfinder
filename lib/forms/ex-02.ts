import type { PersonalDataField } from "@/lib/types/personal-data";

export const EX_02_TEXT_FIELDS: Record<string, PersonalDataField | null> = {
  // =========================
  // SOLICITANT (REAGRUPANTE)
  // =========================

  "Textfield": "pasaporte",
  "Textfield-1": "nie",

  "Textfield-2": "primerApellido",
  "Textfield-3": "segundoApellido",
  "Textfield-4": "nombre",

  // Fecha nacimiento (día/mes/año)
  "Textfield-5": null,
  "Textfield-6": null,
  "Textfield-7": null,

  "Textfield-8": "lugarNacimiento",
  "Textfield-9": "paisNacimiento",

  "Textfield-10": "nacionalidad",

  "Textfield-11": "nombrePadre",
  "Textfield-12": "nombreMadre",

  "Textfield-13": "domicilio",
  "Textfield-14": "numeroDomicilio",
  "Textfield-15": "pisoDomicilio",

  "Textfield-16": "localidad",
  "Textfield-17": "codigoPostal",
  "Textfield-18": "provincia",

  "Textfield-19": "telefono",
  "Textfield-20": "email",

  // =========================
  // FAMILIAR (REAGRUPADO)
  // =========================

  "Textfield-30": "familiar_pasaporte",
  "Textfield-31": "familiar_nie",

  "Textfield-32": "familiar_primerApellido",
  "Textfield-33": "familiar_segundoApellido",
  "Textfield-34": "familiar_nombre",

  // Fecha nacimiento
  "Textfield-35": null,
  "Textfield-36": null,
  "Textfield-37": null,

  "Textfield-38": "familiar_lugarNacimiento",
  "Textfield-39": "familiar_paisNacimiento",

  "Textfield-40": "familiar_nacionalidad",

  "Textfield-41": "familiar_nombrePadre",
  "Textfield-42": "familiar_nombreMadre",

  "Textfield-43": "familiar_domicilio",
  "Textfield-44": "familiar_numeroDomicilio",
  "Textfield-45": "familiar_pisoDomicilio",

  "Textfield-46": "familiar_localidad",
  "Textfield-47": "familiar_codigoPostal",
  "Textfield-48": "familiar_provincia",

  "Textfield-49": "familiar_vinculo",

  // =========================
  // REPRESENTANTE
  // =========================

  "Textfield-60": "representanteLegal",
  "Textfield-61": "representanteDniNiePas",
  "Textfield-62": "representanteTitulo",

  "Textfield-63": "repPresentacion_domicilio",
  "Textfield-64": "repPresentacion_localidad",
  "Textfield-65": "repPresentacion_codigoPostal",
  "Textfield-66": "repPresentacion_provincia",
  "Textfield-67": "repPresentacion_telefono",
  "Textfield-68": "repPresentacion_email",

  // =========================
  // NOTIFICACIONES
  // =========================

  "Textfield-70": "notif_nombre",
  "Textfield-71": "notif_dniNiePas",
  "Textfield-72": "notif_domicilio",
  "Textfield-73": "notif_localidad",
  "Textfield-74": "notif_codigoPostal",
  "Textfield-75": "notif_provincia",
  "Textfield-76": "notif_telefono",
  "Textfield-77": "notif_email",
};

export const EX_02_SEXO_CHECKBOXES: Record<string, string> = {
  "ChkBox-sexo-H": "H",
  "ChkBox-sexo-M": "M",
};

export const EX_02_TIPO_DOC_CHECKBOXES: Record<string, string> = {
  "ChkBox-tipoDoc-pasaporte": "pasaporte",
  "ChkBox-tipoDoc-nie": "nie",
};

export const EX_02_ESTADO_CIVIL_CHECKBOXES: Record<string, string> = {
  "ChkBox-estadoCivil-soltero": "soltero",
  "ChkBox-estadoCivil-casado": "casado",
  "ChkBox-estadoCivil-divorciado": "divorciado",
  "ChkBox-estadoCivil-viudo": "viudo",
};

export const EX_02_CIRCUNSTANCIA_CHECKBOXES: Record<string, string> = {
  "ChkBox-circunstancia-reagrupacio": "reagrupacio_familiar",
};

export const EX_02_TIPO_AUTORIZACION_CHECKBOXES: Record<string, string> = {
  "ChkBox-autorizacion-reagrupacio": "reagrupacio_familiar",
};

export const EX_02_FAMILIAR_SEXO_CHECKBOXES: Record<string, string> = {
  "ChkBox-familiar-sexo-H": "H",
  "ChkBox-familiar-sexo-M": "M",
};

export const EX_02_FAMILIAR_ESTADO_CIVIL_CHECKBOXES: Record<string, string> = {
  "ChkBox-familiar-estadoCivil-soltero": "soltero",
  "ChkBox-familiar-estadoCivil-casado": "casado",
  "ChkBox-familiar-estadoCivil-divorciado": "divorciado",
  "ChkBox-familiar-estadoCivil-viudo": "viudo",
};

export const EX_02_HIJOS_ESCOLARIZACION_CHECKBOXES: Record<string, boolean> = {
  "ChkBox-hijos-si": true,
  "ChkBox-hijos-no": false,
};

export const EX_02_CONSENTIMIENTO_CHECKBOX = "ChkBox-consentimiento";

export const EX_02_DATE_FIELDS = {
  fechaNacimiento: { dd: "Textfield-5", mm: "Textfield-6", yyyy: "Textfield-7" },
  familiar_fechaNacimiento: { dd: "Textfield-35", mm: "Textfield-36", yyyy: "Textfield-37" },
};