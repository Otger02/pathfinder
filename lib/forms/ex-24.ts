import type { PersonalDataField } from "@/lib/types/personal-data";

export const EX_24_TEXT_FIELDS: Record<string, PersonalDataField | null> = {
  "Texto1":  "pasaporte", "Texto2":  null, "Texto3":  "nie", "Texto4":  null,
  "Texto5":  "primerApellido", "Texto6":  "segundoApellido", "Texto7":  "nombre",
  "Texto8":  null, "Texto9":  null, "Texto10": null,
  "Texto11": "lugarNacimiento", "Texto12": "paisNacimiento", "Texto13": "nacionalidad",
  "Texto14": "nombrePadre", "Texto15": "nombreMadre",
  "Texto16": "domicilio", "Texto17": "numeroDomicilio", "Texto18": "pisoDomicilio",
  "Texto19": "localidad", "Texto20": "codigoPostal", "Texto21": "provincia",
  "Texto22": "telefono", "Texto23": "email",
  "Texto24": "representanteLegal", "Texto25": "representanteDniNiePas", "Texto26": "representanteTitulo",
  "Texto35": "espanyol_pasaporte", "Texto36": "espanyol_dni", "Texto37": null,
  "Texto38": "espanyol_primerApellido", "Texto39": "espanyol_segundoApellido", "Texto40": "espanyol_nombre",
  "Texto41": null, "Texto42": null, "Texto43": null,
  "Texto44": "espanyol_paisNacimiento", "Texto45": "espanyol_nombrePadre", "Texto46": "espanyol_nombreMadre",
  "Texto47": "espanyol_domicilio", "Texto48": "espanyol_numeroDomicilio", "Texto49": "espanyol_pisoDomicilio",
  "Texto50": "espanyol_localidad", "Texto51": "espanyol_codigoPostal", "Texto52": "espanyol_provincia",
  "Texto53": "espanyol_parentesco",
  "Texto62": "repPresentacion_nombre", "Texto63": "repPresentacion_dniNiePas",
  "Texto64": "repPresentacion_domicilio", "Texto65": "repPresentacion_numero",
  "Texto66": "repPresentacion_piso", "Texto67": "repPresentacion_localidad",
  "Texto68": "repPresentacion_codigoPostal", "Texto69": "repPresentacion_provincia",
  "Texto70": "repPresentacion_telefono", "Texto71": "repPresentacion_email",
  "Texto72": "repPresentacion_repLegal", "Texto73": "repPresentacion_repDniNiePas",
  "Texto74": "repPresentacion_repTitulo",
  "Texto75": "notif_nombre", "Texto76": "notif_dniNiePas", "Texto77": "notif_domicilio",
  "Texto78": "notif_numero", "Texto79": "notif_piso", "Texto80": "notif_localidad",
  "Texto81": "notif_codigoPostal", "Texto82": "notif_provincia",
  "Texto83": "notif_telefono", "Texto84": "notif_email",
  "Texto101": null, "Texto102": null, "Texto103": null,
  "Texto104": null, "Texto105": null, "Texto106": null,
  "Texto107": null, "Texto108": null,
};

export const EX_24_DATE_FIELDS = {
  fechaNacimiento:          { dd: "Texto8",  mm: "Texto9",  yyyy: "Texto10" },
  espanyol_fechaNacimiento: { dd: "Texto41", mm: "Texto42", yyyy: "Texto43" },
} as const;

export const EX_24_SEXO_CHECKBOXES: Record<string, string> = {
  "Casilla de verificación27": "X",
  "Casilla de verificación28": "H",
  "Casilla de verificación29": "M",
};

export const EX_24_ESPANYOL_SEXO_CHECKBOXES: Record<string, string> = {
  "Casilla de verificación54": "X",
  "Casilla de verificación55": "H",
  "Casilla de verificación56": "M",
};

export const EX_24_ESTADO_CIVIL_CHECKBOXES: Record<string, string> = {
  "Casilla de verificación30": "soltero",
  "Casilla de verificación31": "casado",
  "Casilla de verificación32": "viudo",
  "Casilla de verificación33": "divorciado",
  "Casilla de verificación34": "separado",
};

export const EX_24_ESPANYOL_ESTADO_CIVIL_CHECKBOXES: Record<string, string> = {
  "Casilla de verificación57": "soltero",
  "Casilla de verificación58": "casado",
  "Casilla de verificación59": "viudo",
  "Casilla de verificación60": "divorciado",
  "Casilla de verificación61": "separado",
};

export const EX_24_TIPO_AUTORIZACION_CHECKBOXES: Record<string, string> = {
  "Casilla de verificación85": "inicial",
  "Casilla de verificación86": "inicial_conyugue",
  "Casilla de verificación87": "inicial_hijo_menor26",
  "Casilla de verificación88": "inicial_hijo_mayor26",
  "Casilla de verificación89": "inicial_ascendiente",
  "Casilla de verificación90": "inicial_padre_madre_menor",
  "Casilla de verificación91": "inicial_cuidador",
  "Casilla de verificación92": "inicial_hijo_origen",
  "Casilla de verificación93": "inicial_otro_familiar",
  "Casilla de verificación94": "renovacion",
  "Casilla de verificación95": "independiente_conservacion",
  "Casilla de verificación96": "ind_fallecimiento",
  "Casilla de verificación97": "ind_cese_residencia",
  "Casilla de verificación98": "ind_nulidad_divorcio",
  "Casilla de verificación99": "ind_victima_violencia",
};

export const EX_24_CONSENTIMIENTO_CHECKBOX = "Casilla de verificación100";

export const EX_24_TIPO_DOC_CHECKBOXES: Record<string, string> = {};
export const EX_24_CIRCUNSTANCIA_CHECKBOXES: Record<string, string> = {};
export const EX_24_HIJOS_ESCOLARIZACION_CHECKBOXES: Record<string, boolean> = {};
