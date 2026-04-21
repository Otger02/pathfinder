import type { PersonalDataField } from "@/lib/types/personal-data";

export const EX_06_TEXT_FIELDS: Record<string, PersonalDataField | null> = {
  "Texto1":  "pasaporte", "Texto3":  null, "Texto4":  "nie", "Texto5":  null,
  "Texto6":  "primerApellido", "Texto7":  "segundoApellido", "Texto8":  "nombre",
  "Texto12": null, "Texto13": null, "Texto14": null,
  "Texto15": "lugarNacimiento", "Texto16": "paisNacimiento", "Texto17": "nacionalidad",
  "Texto23": "nombrePadre", "Texto24": "nombreMadre",
  "Texto25": "domicilio", "Texto26": "numeroDomicilio", "Texto27": "pisoDomicilio",
  "Texto28": "localidad", "Texto29": "codigoPostal", "Texto30": "provincia",
  "Texto31": "telefono", "Texto32": "email",
  "Texto33": "representanteLegal", "Texto34": "representanteDniNiePas", "Texto35": "representanteTitulo",
  "Texto36": "empleador_nombre", "Texto37": "empleador_nifNie", "Texto38": "empleador_actividad",
  "Texto39": "empleador_ocupacion", "Texto40": "empleador_domicilio", "Texto41": "empleador_numero",
  "Texto42": "empleador_piso", "Texto43": "empleador_localidad", "Texto44": "empleador_codigoPostal",
  "Texto45": "empleador_provincia", "Texto46": "empleador_telefono", "Texto47": "empleador_email",
  "Texto48": "empleador_repNombre", "Texto49": "empleador_repDniNie",
  "Texto50": "repPresentacion_nombre", "Texto51": "repPresentacion_dniNiePas",
  "Texto52": "repPresentacion_domicilio", "Texto53": "repPresentacion_numero",
  "Texto54": "repPresentacion_piso", "Texto55": "repPresentacion_localidad",
  "Texto56": "repPresentacion_codigoPostal", "Texto57": "repPresentacion_provincia",
  "Texto58": "repPresentacion_telefono", "Texto59": "repPresentacion_email",
  "Texto60": "repPresentacion_repLegal", "Texto61": "repPresentacion_repDniNiePas",
  "Texto62": "repPresentacion_repTitulo",
  "Texto63": "notif_nombre", "Texto64": "notif_dniNiePas", "Texto65": "notif_domicilio",
  "Texto66": "notif_numero", "Texto67": "notif_piso", "Texto68": "notif_localidad",
  "Texto69": "notif_codigoPostal", "Texto70": "notif_provincia",
  "Texto71": "notif_telefono", "Texto72": "notif_email",
  "Texto82": null, "Texto83": null, "Texto84": null,
  "Texto85": null, "Texto86": null, "Texto87": null,
  "Texto88": null, "Texto89": null,
};

export const EX_06_DATE_FIELDS = {
  fechaNacimiento: { dd: "Texto12", mm: "Texto13", yyyy: "Texto14" },
} as const;

export const EX_06_SEXO_CHECKBOXES: Record<string, string> = {
  "Casilla de verificación9":  "X",
  "Casilla de verificación10": "H",
  "Casilla de verificación11": "M",
};

export const EX_06_ESTADO_CIVIL_CHECKBOXES: Record<string, string> = {
  "Casilla de verificación18": "soltero",
  "Casilla de verificación19": "casado",
  "Casilla de verificación20": "viudo",
  "Casilla de verificación21": "divorciado",
  "Casilla de verificación22": "separado",
};

export const EX_06_TIPO_AUTORIZACION_CHECKBOXES: Record<string, string> = {
  "Casilla de verificación73": "inicial",
  "Casilla de verificación74": "primer_llamamiento",
  "Casilla de verificación75": "segundo_llamamiento",
  "Casilla de verificación76": "tercer_llamamiento",
  "Casilla de verificación77": "cambio_empleador",
  "Casilla de verificación78": "prorroga_concatenacion",
  "Casilla de verificación79": "renovacion_plurianual",
};

export const EX_06_CONSENTIMIENTO_CHECKBOX = "Casilla de verificación81";

export const EX_06_TIPO_DOC_CHECKBOXES: Record<string, string> = {};
export const EX_06_CIRCUNSTANCIA_CHECKBOXES: Record<string, string> = {};
export const EX_06_HIJOS_ESCOLARIZACION_CHECKBOXES: Record<string, boolean> = {};
