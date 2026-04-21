import type { PersonalDataField } from "@/lib/types/personal-data";

export const EX_11_TEXT_FIELDS: Record<string, PersonalDataField | null> = {
  "Textfield-2":  "pasaporte", "Textfield-3":  null, "Textfield-4":  "nie", "Textfield-5":  null,
  "CP":           "primerApellido", "x H": "segundoApellido", "Textfield-6":  "nombre",
  "Textfield-7":  null, "Texto-1": null, "Fecha de nacimientoz": null,
  "Textfield-8":  null, "Estado civil3 S": "lugarNacimiento",
  "Textfield-9":  "paisNacimiento", "Textfield-10": "nacionalidad",
  "Textfield-12": "nombrePadre", "Piso": "nombreMadre", "Provincia": "domicilio",
  "Textfield-13": "numeroDomicilio", "Textfield-14": "pisoDomicilio",
  "Textfield-15": "localidad", "Textfield-17": "codigoPostal", "Textfield-19": "provincia",
  "Textfield-20": "telefono", "DN IN IEPAS": "email",
  "Textfield-24": "representanteLegal", "Textfield-26": "representanteDniNiePas",
  "Textfield-28": "representanteTitulo",
  "Textfield-30": "repPresentacion_nombre", "Piso-0": "repPresentacion_dniNiePas",
  "Textfield-31": "repPresentacion_domicilio", "Textfield-32": "repPresentacion_numero",
  "Textfield-33": "repPresentacion_piso", "Textfield-35": "repPresentacion_localidad",
  "Textfield-36": "repPresentacion_codigoPostal", "Textfield-38": "repPresentacion_provincia",
  "Textfield-40": "repPresentacion_telefono", "D NIN IEPAS": "repPresentacion_email",
  "Textfield-41": "repPresentacion_repLegal", "Textfield-42": "repPresentacion_repDniNiePas",
  "Textfield-43": "repPresentacion_repTitulo",
  "Textfield-44": "notif_nombre", "N Piso": "notif_dniNiePas", "Provincia-1": "notif_domicilio",
  "Textfield-46": "notif_numero", "Textfield-47": "notif_piso", "Textfield-48": "notif_localidad",
  "Textfield-49": "notif_codigoPostal", "Textfield-51": "notif_provincia",
  "Textfield-53": "notif_telefono", "Textfield-54": "notif_email",
};

export const EX_11_DATE_FIELDS = {
  fechaNacimiento: { dd: "Textfield-7", mm: "Texto-1", yyyy: "Fecha de nacimientoz" },
} as const;

export const EX_11_SEXO_CHECKBOXES: Record<string, string> = {
  "M": "M", "ChkBox": "X",
};

export const EX_11_ESTADO_CIVIL_CHECKBOXES: Record<string, string> = {
  "C": "casado", "V": "viudo", "D": "divorciado",
  "Sp": "soltero", "ChkBox-0": "separado",
};

export const EX_11_HIJOS_ESCOLARIZACION_CHECKBOXES: Record<string, boolean> = {
  "Hijasos a cargo en edad de escolarizacion en Espan": true,
  "NO": false,
};

export const EX_11_TIPO_AUTORIZACION_CHECKBOXES: Record<string, string> = {
  "RESIDE NCIA LARGA DURACION": "larga_duracion",
  "Titular de autorizacion de residencia por reagrupa": "ld_reagrupacion",
  "Supuesto general 5 anos de residencia continuada e": "ld_general_5",
  "Residente en Espana en los 2 anos inmediatamente a": "ld_tarjeta_azul",
  "Residente beneficiario de pension contributiva de": "ld_pension",
  "Residente beneficiario de incapacidad permanente a": "ld_incapacidad",
  "Residente en los tres anos inmediatamente anterior": "ld_nacido_espana",
  "Espanol de origen que haya perdido la nacionalidad": "ld_espanol_origen",
  "Residente tutelado por entidad publica 5 anos cons": "ld_tutelado",
  "Apatridas o refugiados en territorio espanol recon": "ld_apatrida_refugiado",
  "Titular de autorizacion de residencia de larga dur": "ld_ue_otro_em",
  "Familiar de titular de autorizacion de residencia": "ld_familiar_ue",
  "Titular de autorizacion de residencia de larga dur-0": "ld_cesado",
  "Menor nacido en Espana hijo de titular de residenc": "ld_menor_nacido",
  "Otros": "ld_otros",
  "RESIDENCIA LARGA DURACIONUE": "larga_duracion_ue",
  "Supuesto general 5 anos de residencia continuada e-0": "ldUE_general_5",
  "Residente en Espana con autorizacion anterior de e": "ldUE_estudios",
  "Residente en Espana en los 2 anos inmediatamente a-0": "ldUE_tarjeta_azul",
  "Titular de residencia de larga duracionUE en otro": "ldUE_renuncia",
  "Titular de autorizacion de residencia de larga dur-1": "ldUE_cesado",
  "Otros-1": "ldUE_otros",
};

export const EX_11_CONSENTIMIENTO_CHECKBOX =
  "CONSIENTO que las comunicaciones y notifcaciones s";

export const EX_11_TIPO_DOC_CHECKBOXES: Record<string, string> = {};
export const EX_11_CIRCUNSTANCIA_CHECKBOXES: Record<string, string> = {};
