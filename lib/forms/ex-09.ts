import type { PersonalDataField } from "@/lib/types/personal-data";

export const EX_09_TEXT_FIELDS: Record<string, PersonalDataField | null> = {
  "Texto1":  "pasaporte", "Texto2":  null, "Texto3":  "nie", "Texto4":  null,
  "Texto5":  "primerApellido", "Texto6":  "segundoApellido", "Texto7":  "nombre",
  "Texto8":  null, "Texto9":  null, "Texto10": null,
  "Texto11": "lugarNacimiento", "Texto12": "paisNacimiento", "Texto13": "nacionalidad",
  "Texto14": "nombrePadre", "Texto15": "nombreMadre",
  "Texto16": "domicilio", "Texto17": "numeroDomicilio", "Texto18": "pisoDomicilio",
  "Texto19": "localidad", "Texto20": "codigoPostal", "Texto21": "provincia",
  "Texto22": "telefono", "Texto23": "email",
  "Texto24": "entitat_nombre", "Texto25": "entitat_nifNie", "Texto26": "entitat_actividad",
  "Texto27": "entitat_ocupacion", "Texto28": "entitat_domicilio", "Texto29": "entitat_numero",
  "Texto30": "entitat_piso", "Texto31": "entitat_localidad", "Texto32": "entitat_codigoPostal",
  "Texto33": "entitat_provincia", "Texto34": "entitat_telefono", "Texto35": "entitat_email",
  "Texto36": "entitat_repNombre", "Texto37": "entitat_repDniNie", "Texto38": "entitat_repTitulo",
  "Texto39": "repPresentacion_nombre", "Texto40": "repPresentacion_dniNiePas",
  "Texto41": "repPresentacion_domicilio", "Texto42": "repPresentacion_numero",
  "Texto43": "repPresentacion_piso", "Texto44": "repPresentacion_localidad",
  "Texto45": "repPresentacion_codigoPostal", "Texto46": "repPresentacion_provincia",
  "Texto47": "repPresentacion_telefono", "Texto48": "repPresentacion_email",
  "Texto49": "repPresentacion_repLegal", "Texto50": "repPresentacion_repDniNiePas",
  "Texto51": "repPresentacion_repTitulo",
  "Texto52": "notif_nombre", "Texto53": "notif_dniNiePas", "Texto54": "notif_domicilio",
  "Texto55": "notif_numero", "Texto56": "notif_piso", "Texto57": "notif_localidad",
  "Texto58": "notif_codigoPostal", "Texto59": "notif_provincia",
  "Texto60": "notif_telefono", "Texto61": "notif_email",
  "Texto62": null, "Texto63": null, "Texto64": null,
  "Texto65": null, "Texto66": null, "Texto67": null,
  "Texto68": null, "Texto69": null, "Texto70": null,
};

export const EX_09_DATE_FIELDS = {
  fechaNacimiento: { dd: "Texto8", mm: "Texto9", yyyy: "Texto10" },
} as const;

export const EX_09_SEXO_CHECKBOXES: Record<string, string> = {
  "Casilla de verificación71": "X",
  "Casilla de verificación72": "H",
  "Casilla de verificación73": "M",
};

export const EX_09_ESTADO_CIVIL_CHECKBOXES: Record<string, string> = {
  "Casilla de verificación74": "soltero",
  "Casilla de verificación75": "casado",
  "Casilla de verificación76": "viudo",
  "Casilla de verificación77": "divorciado",
  "Casilla de verificación78": "separado",
};

export const EX_09_HIJOS_ESCOLARIZACION_CHECKBOXES: Record<string, boolean> = {
  "Casilla de verificación79": true,
  "Casilla de verificación80": false,
};

export const EX_09_TIPO_AUTORIZACION_CHECKBOXES: Record<string, string> = {
  "Casilla de verificación81": "inicial_excepcion",
  "Casilla de verificación82": "inicial_religioso",
  "Casilla de verificación83": "inicial_otros",
  "Casilla de verificación84": "prorroga",
  "Casilla de verificación85": "prorroga_titular",
};

export const EX_09_CONSENTIMIENTO_CHECKBOX = "Casilla de verificación86";

export const EX_09_TIPO_DOC_CHECKBOXES: Record<string, string> = {};
export const EX_09_CIRCUNSTANCIA_CHECKBOXES: Record<string, string> = {};
