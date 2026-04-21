import type { PersonalDataField } from "@/lib/types/personal-data";

export const EX_19_TEXT_FIELDS: Record<string, PersonalDataField | null> = {
  "Texto2":  "pasaporte", "Texto3":  null, "Texto4":  "nie", "Texto5":  null,
  "Texto6":  "primerApellido", "Texto7":  "segundoApellido", "Texto8":  "nombre",
  "Texto9":  null, "Texto10": null, "Texto11": null,
  "Texto12": "lugarNacimiento", "Texto13": "paisNacimiento", "Texto14": "nacionalidad",
  "Texto15": "nombrePadre", "Texto16": "nombreMadre",
  "Texto17": "domicilio", "Texto18": "numeroDomicilio", "Texto19": "pisoDomicilio",
  "Texto20": "localidad", "Texto21": "codigoPostal", "Texto22": "provincia",
  "Texto23": "telefono", "Texto24": "email",
  "Texto25": "representanteLegal", "Texto26": "representanteDniNiePas", "Texto27": "representanteTitulo",
  "Texto28": "ciudadanoUE_pasaporte", "Texto29": null, "Texto30": "ciudadanoUE_nie", "Texto31": null,
  "Texto32": "ciudadanoUE_primerApellido", "Texto33": "ciudadanoUE_segundoApellido",
  "Texto34": "ciudadanoUE_nombre", "Texto35": "ciudadanoUE_nacionalidad",
  "Texto36": "ciudadanoUE_domicilio", "Texto37": "ciudadanoUE_numeroDomicilio",
  "Texto38": "ciudadanoUE_pisoDomicilio", "Texto39": "ciudadanoUE_localidad",
  "Texto40": "ciudadanoUE_codigoPostal", "Texto41": "ciudadanoUE_provincia",
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
  "Texto71": null, "Texto72": null, "Texto73": null,
};

export const EX_19_DATE_FIELDS = {
  fechaNacimiento: { dd: "Texto9", mm: "Texto10", yyyy: "Texto11" },
} as const;

export const EX_19_SEXO_CHECKBOXES: Record<string, string> = {
  "Casilla de verificación3": "X",
  "Casilla de verificación4": "H",
  "Casilla de verificación5": "M",
};

export const EX_19_ESTADO_CIVIL_CHECKBOXES: Record<string, string> = {
  "Casilla de verificación6":  "soltero",
  "Casilla de verificación7":  "casado",
  "Casilla de verificación8":  "viudo",
  "Casilla de verificación9":  "divorciado",
  "Casilla de verificación10": "separado",
};

export const EX_19_TIPO_AUTORIZACION_CHECKBOXES: Record<string, string> = {
  "Casilla de verificación12": "temporal_inicial",
  "Casilla de verificación13": "conyugue",
  "Casilla de verificación14": "pareja_registrada",
  "Casilla de verificación15": "pareja_estable",
  "Casilla de verificación16": "descendiente_menor21",
  "Casilla de verificación17": "descendiente_mayor21",
  "Casilla de verificación18": "ascendiente",
  "Casilla de verificación19": "progenitor_menor_ue",
  "Casilla de verificación20": "otros_familiares",
  "Casilla de verificación21": "residencia_permanente",
  "Casilla de verificación22": "renovacion_tarjeta",
  "Casilla de verificación23": "mantenimiento_titulo",
  "Casilla de verificación24": "fallecimiento",
  "Casilla de verificación25": "nulidad_divorcio",
  "Casilla de verificación26": "victima_violencia",
  "Casilla de verificación27": "otros_custodia",
};

export const EX_19_CONSENTIMIENTO_CHECKBOX = "Casilla de verificación28";

export const EX_19_TIPO_DOC_CHECKBOXES: Record<string, string> = {};
export const EX_19_CIRCUNSTANCIA_CHECKBOXES: Record<string, string> = {};
export const EX_19_HIJOS_ESCOLARIZACION_CHECKBOXES: Record<string, boolean> = {};
