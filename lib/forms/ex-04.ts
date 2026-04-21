import type { PersonalDataField } from "@/lib/types/personal-data";

export const EX_04_TEXT_FIELDS: Record<string, PersonalDataField | null> = {
  "Texto1":  "pasaporte",
  "Texto2":  null, "Texto3":  "nie", "Texto4":  null,
  "Texto5":  "primerApellido", "Texto6":  "segundoApellido", "Texto7":  "nombre",
  "Texto8":  null, "Texto9":  null, "Texto10": null,
  "Texto11": "lugarNacimiento", "Texto12": "paisNacimiento", "Texto13": "nacionalidad",
  "Texto14": "nombrePadre", "Texto15": "nombreMadre",
  "Texto16": "domicilio", "Texto17": "numeroDomicilio", "Texto18": "pisoDomicilio",
  "Texto19": "localidad", "Texto20": "codigoPostal", "Texto21": "provincia",
  "Texto22": "telefono", "Texto23": "email",
  "Texto24": "representanteLegal", "Texto25": "representanteDniNiePas", "Texto26": "representanteTitulo",
  "Texto27": "entitat_nombre", "Texto28": "entitat_nifNie", "Texto29": "entitat_actividad",
  "Texto30": "entitat_ocupacion", "Texto31": "entitat_domicilio", "Texto32": "entitat_numero",
  "Texto33": "entitat_piso", "Texto34": "entitat_localidad", "Texto35": "entitat_codigoPostal",
  "Texto36": "entitat_provincia", "Texto37": "entitat_telefono", "Texto38": "entitat_email",
  "Texto39": "entitat_repNombre", "Texto40": "entitat_repDniNie", "Texto41": "entitat_repTitulo",
  "Texto42": "repPresentacion_nombre", "Texto43": "repPresentacion_dniNiePas",
  "Texto44": "repPresentacion_domicilio", "Texto45": "repPresentacion_numero",
  "Texto46": "repPresentacion_piso", "Texto47": "repPresentacion_localidad",
  "Texto48": "repPresentacion_codigoPostal", "Texto49": "repPresentacion_provincia",
  "Texto50": "repPresentacion_telefono", "Texto51": "repPresentacion_email",
  "Texto52": "repPresentacion_repLegal", "Texto53": "repPresentacion_repDniNiePas",
  "Texto54": "repPresentacion_repTitulo",
  "Texto55": "notif_nombre", "Texto56": "notif_dniNiePas", "Texto57": "notif_domicilio",
  "Texto58": "notif_numero", "Texto59": "notif_piso", "Texto60": "notif_localidad",
  "Texto61": "notif_codigoPostal", "Texto62": "notif_provincia",
  "Texto63": "notif_telefono", "Texto64": "notif_email",
  "Texto65": null, "Texto66": null, "Texto67": null,
  "Texto68": null, "Texto69": null, "Texto70": null,
  "Texto71": null, "Texto72": null,
};

export const EX_04_DATE_FIELDS = {
  fechaNacimiento: { dd: "Texto8", mm: "Texto9", yyyy: "Texto10" },
} as const;

export const EX_04_SEXO_CHECKBOXES: Record<string, string> = {
  "Casilla de verificación73": "X",
  "Casilla de verificación74": "H",
  "Casilla de verificación75": "M",
};

export const EX_04_ESTADO_CIVIL_CHECKBOXES: Record<string, string> = {
  "Casilla de verificación76": "soltero",
  "Casilla de verificación77": "casado",
  "Casilla de verificación78": "viudo",
  "Casilla de verificación79": "divorciado",
  "Casilla de verificación80": "separado",
};

export const EX_04_TIPO_AUTORIZACION_CHECKBOXES: Record<string, string> = {
  "Casilla de verificación81": "inicial_exterior_convenio",
  "Casilla de verificación82": "inicial_exterior_contrato",
  "Casilla de verificación83": "inicial_espana_convenio",
  "Casilla de verificación84": "inicial_espana_contrato",
  "Casilla de verificación85": "renovacion_convenio",
  "Casilla de verificación86": "renovacion_contrato",
  "Casilla de verificación87": "familiar_inicial",
  "Casilla de verificación88": "familiar_renovacion",
};

export const EX_04_CONSENTIMIENTO_CHECKBOX = "Casilla de verificación96";

export const EX_04_TIPO_DOC_CHECKBOXES: Record<string, string> = {};
export const EX_04_CIRCUNSTANCIA_CHECKBOXES: Record<string, string> = {};
export const EX_04_HIJOS_ESCOLARIZACION_CHECKBOXES: Record<string, boolean> = {};
