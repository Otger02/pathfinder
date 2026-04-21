import type { PersonalDataField } from "@/lib/types/personal-data";

export const EX_01_TEXT_FIELDS: Record<string, PersonalDataField | null> = {
  // Apartat 1 — Sol·licitant
  "Texto1":  "pasaporte",
  "Texto2":  null,           // NIE lletra
  "Texto3":  "nie",
  "Texto4":  null,           // NIE control
  "Texto5":  "primerApellido",
  "Texto6":  "segundoApellido",
  "Texto7":  "nombre",
  "Texto8":  null,           // DD fechaNacimiento
  "Texto9":  null,           // MM fechaNacimiento
  "Texto10": null,           // YYYY fechaNacimiento
  "Texto11": "lugarNacimiento",
  "Texto12": "paisNacimiento",
  "Texto13": "nacionalidad",
  "Texto14": "nombrePadre",
  "Texto15": "nombreMadre",
  "Texto16": "domicilio",
  "Texto17": "numeroDomicilio",
  "Texto18": "pisoDomicilio",
  "Texto19": "localidad",
  "Texto20": "codigoPostal",
  "Texto21": "provincia",
  "Texto22": "telefono",
  "Texto23": "email",
  "Texto24": "representanteLegal",
  "Texto25": "representanteDniNiePas",
  "Texto26": "representanteTitulo",
  // Apartat 2 — Titular recursos econòmics
  "Texto27": "titular_pasaporte",
  "Texto28": null,           // titular NIE lletra
  "Texto29": "titular_nie",
  "Texto30": null,           // titular NIE control
  "Texto31": "titular_primerApellido",
  "Texto32": "titular_segundoApellido",
  "Texto33": "titular_nombre",
  "Texto34": null,           // titular DD fechaNacimiento
  "Texto35": null,           // titular MM fechaNacimiento
  "Texto36": null,           // titular YYYY fechaNacimiento
  "Texto37": "titular_paisNacimiento",
  "Texto38": "titular_nombrePadre",
  "Texto39": "titular_nombreMadre",
  "Texto40": "titular_parentesco",
  // Apartat 3 — RepPresentacion
  "Texto41": "repPresentacion_nombre",
  "Texto42": "repPresentacion_dniNiePas",
  "Texto43": "repPresentacion_domicilio",
  "Texto44": "repPresentacion_numero",
  "Texto45": "repPresentacion_piso",
  "Texto46": "repPresentacion_localidad",
  "Texto47": "repPresentacion_codigoPostal",
  "Texto48": "repPresentacion_provincia",
  "Texto49": "repPresentacion_telefono",
  "Texto50": "repPresentacion_email",
  "Texto51": "repPresentacion_repLegal",
  "Texto52": "repPresentacion_repDniNiePas",
  "Texto53": "repPresentacion_repTitulo",
  // Apartat 4 — Notif
  "Texto54": "notif_nombre",
  "Texto55": "notif_dniNiePas",
  "Texto56": "notif_domicilio",
  "Texto57": "notif_numero",
  "Texto58": "notif_piso",
  "Texto59": "notif_localidad",
  "Texto60": "notif_codigoPostal",
  "Texto61": "notif_provincia",
  "Texto62": "notif_telefono",
  "Texto63": "notif_email",
};

export const EX_01_DATE_FIELDS = {
  fechaNacimiento:         { dd: "Texto8",  mm: "Texto9",  yyyy: "Texto10" },
  titular_fechaNacimiento: { dd: "Texto34", mm: "Texto35", yyyy: "Texto36" },
} as const;

export const EX_01_SEXO_CHECKBOXES: Record<string, string> = {
  "Casilla de verificación2": "X",
  "Casilla de verificación3": "H",
  "Casilla de verificación4": "M",
};

export const EX_01_TITULAR_SEXO_CHECKBOXES: Record<string, string> = {
  "Casilla de verificación5":  "X",
  "Casilla de verificación6":  "H",
  "Casilla de verificación7":  "M",
};

export const EX_01_ESTADO_CIVIL_CHECKBOXES: Record<string, string> = {
  "Casilla de verificación8":  "soltero",
  "Casilla de verificación9":  "casado",
  "Casilla de verificación10": "viudo",
  "Casilla de verificación11": "divorciado",
  "Casilla de verificación12": "separado",
};

export const EX_01_TITULAR_ESTADO_CIVIL_CHECKBOXES: Record<string, string> = {
  "Casilla de verificación13": "soltero",
  "Casilla de verificación14": "casado",
  "Casilla de verificación15": "viudo",
  "Casilla de verificación16": "divorciado",
  "Casilla de verificación17": "separado",
};

export const EX_01_HIJOS_ESCOLARIZACION_CHECKBOXES: Record<string, boolean> = {
  "Casilla de verificación18": true,   // SÍ
  "Casilla de verificación19": false,  // NO
};

export const EX_01_TIPO_AUTORIZACION_CHECKBOXES: Record<string, string> = {
  "Casilla de verificación20": "inicial_titular",
  "Casilla de verificación21": "inicial_familiar",
  "Casilla de verificación22": "renovacion_titular",
  "Casilla de verificación23": "renovacion_familiar",
};

export const EX_01_CONSENTIMIENTO_CHECKBOX = "Casilla de verificación26";

export const EX_01_TIPO_DOC_CHECKBOXES: Record<string, string> = {};
export const EX_01_CIRCUNSTANCIA_CHECKBOXES: Record<string, string> = {};
