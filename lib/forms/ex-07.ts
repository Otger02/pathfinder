import type { PersonalDataField } from "@/lib/types/personal-data";

export const EX_07_TEXT_FIELDS: Record<string, PersonalDataField | null> = {
  "Textfield-1":  "pasaporte", "Textfield-2":  null, "Textfield-3":  "nie", "Textfield-4":  null,
  "Textfield-8":  "primerApellido", "x": "segundoApellido", "Textfield-5":  "nombre",
  "Textfield-6":  null, "Texto-1": null, "Fecha de nacimientoz": null,
  "Estado civil3 S": "lugarNacimiento", "Textfield-7":  "paisNacimiento",
  "Textfield-9":  "nacionalidad", "Textfield-10": "nombrePadre",
  "Piso": "nombreMadre", "Provincia": "domicilio",
  "Textfield-11": "numeroDomicilio", "Textfield-12": "pisoDomicilio",
  "Textfield-14": "localidad", "Textfield-16": "codigoPostal", "Textfield-17": "provincia",
  "Textfield-19": "telefono", "Textfield-21": "email",
  "Textfield-23": "representanteLegal", "Textfield-25": "representanteDniNiePas",
  "Textfield-27": "representanteTitulo",
  "Textfield-28": "activitat_razonSocial", "Textfield-30": "activitat_nif",
  "Textfield-31": "activitat_actividad", "Textfield-32": "activitat_domicilio",
  "Textfield-33": "activitat_numero", "Textfield-34": "activitat_piso",
  "Textfield-35": "activitat_localidad", "Textfield-36": "activitat_codigoPostal",
  "Textfield-38": "activitat_provincia", "Textfield-39": "activitat_telefono",
  "Textfield-40": "activitat_email",
  "Textfield-41": "repPresentacion_nombre", "Piso-0": "repPresentacion_dniNiePas",
  "Provincia-1": "repPresentacion_domicilio", "Textfield-42": "repPresentacion_numero",
  "Textfield-43": "repPresentacion_piso", "Email": "repPresentacion_localidad",
  "Textfield-45": "repPresentacion_codigoPostal", "Textfield-47": "repPresentacion_provincia",
  "Textfield-48": "repPresentacion_telefono", "Titulo": "repPresentacion_email",
  "Textfield-49": "repPresentacion_repLegal", "Textfield-50": "repPresentacion_repDniNiePas",
  "Textfield-51": "repPresentacion_repTitulo",
  "Textfield-52": "notif_nombre", "Textfield-53": "notif_dniNiePas",
  "Textfield-55": "notif_domicilio", "Textfield-56": "notif_numero",
  "Textfield-57": "notif_piso", "Email-0": "notif_localidad",
  "Textfield-59": "notif_codigoPostal", "Textfield-60": "notif_provincia",
  "Textfield-61": "notif_telefono", "Textfield-64": "notif_email",
  "Texto-2": null,
};

export const EX_07_DATE_FIELDS = {
  fechaNacimiento: { dd: "Textfield-6", mm: "Texto-1", yyyy: "Fecha de nacimientoz" },
} as const;

export const EX_07_SEXO_CHECKBOXES: Record<string, string> = {
  "H": "H", "M": "M", "ChkBox": "X",
};

export const EX_07_ESTADO_CIVIL_CHECKBOXES: Record<string, string> = {
  "C": "casado", "V": "viudo", "D": "divorciado",
  "Sp": "soltero", "ChkBox-0": "separado",
};

export const EX_07_HIJOS_ESCOLARIZACION_CHECKBOXES: Record<string, boolean> = {
  "Hijasos a cargo en edad de escolarizacion en Espan": true,
  "NO": false,
};

export const EX_07_TIPO_AUTORIZACION_CHECKBOXES: Record<string, string> = {
  "INICIAL": "inicial",
  "Extranjero retornado voluntariamente art 1052d":     "inicial_retornado",
  "Supuesto general de residente fuera de Espana art":  "inicial_general",
  "Titular de autorizacion de estancia por estudios i": "inicial_estudios",
  "Titular de autorizacion de residenciaresidencia y":  "inicial_residencia_previa",
  "Nacionales y sus familiares acogidos a ConveniosAc": "inicial_convenios",
  "Titular de autorizacion de residencia de busqueda":  "inicial_busqueda",
  "Residencia y trabajo independiente por cuenta prop": "inicial_independiente",
  "Otros": "inicial_otros",
  "RENOVACION": "renovacion",
  "Titular de autorizacion de residencia temporal y t": "renovacion_cuenta_propia",
  "Residencia y trabajo independiente por cuenta prop-0": "renovacion_independiente",
  "Otros-1": "renovacion_otros",
  "MODIFICACION": "modificacion",
  "De sector de actividad art 2031": "modificacion_sector",
  "De ambito territorial art 2031":  "modificacion_ambito",
  "De autorizacion por cuenta ajena a cuenta propia a": "modificacion_ajena_propia",
  "Otros-3": "modificacion_otros",
  "COMPATIBILIDAD": "compatibilidad",
  "Titular de autorizacion de residencia temporal y t-0": "compatibilidad_cuenta_ajena",
  "Otros-5": "compatibilidad_otros",
};

export const EX_07_FIRMA_CHECKBOXES: Record<string, string> = {
  "Trabajadora": "trabajador",
  "Representante legal": "representante",
};

export const EX_07_CONSENTIMIENTO_CHECKBOX =
  "CONSIENTO que las comunicaciones y notifcaciones s";

export const EX_07_TIPO_DOC_CHECKBOXES: Record<string, string> = {};
export const EX_07_CIRCUNSTANCIA_CHECKBOXES: Record<string, string> = {};
