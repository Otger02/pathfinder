import type { PersonalDataField } from "@/lib/types/personal-data";

export const EX_03_TEXT_FIELDS: Record<string, PersonalDataField | null> = {
  // Apartat 1 — Treballador
  "Textfield":    "pasaporte",
  "Textfield-1":  null,            // NIE lletra
  "Textfield-2":  "nie",
  "Textfield-3":  null,            // NIE control
  "Textfield-8":  "primerApellido",
  "Textfield-5":  "segundoApellido",
  "Lugar":        "nombre",
  "Textfield-6":  null,            // DD fechaNacimiento
  "Texto-1":      null,            // MM fechaNacimiento
  "Feccha de nacimientoz": null,   // YYYY fechaNacimiento
  "Estado civil3t S": "lugarNacimiento",
  "Textfield-7":  "paisNacimiento",
  "Textfield-10": "nacionalidad",
  "Textfield-11": "nombrePadre",
  "Piso":         "nombreMadre",
  "Textfield-12": "domicilio",
  "Textfield-13": "numeroDomicilio",
  "Textfield-14": "pisoDomicilio",
  "Email":        "localidad",
  "Textfield-15": "codigoPostal",
  "Textfield-16": "provincia",
  "Textfield-17": "telefono",
  "Textfield-19": "email",
  "Textfield-21": "representanteLegal",
  "Textfield-23": "representanteDniNiePas",
  "Textfield-25": "representanteTitulo",
  // Apartat 2 — Empleador
  "Ocupacion6":   "empleador_nombre",
  "Textfield-26": "empleador_nifNie",
  "N Piso":       "empleador_actividad",
  "Textfield-28": "empleador_ocupacion",
  "Textfield-29": "empleador_domicilio",
  "Textfield-30": "empleador_numero",
  "Textfield-31": "empleador_piso",
  "Email-0":      "empleador_localidad",
  "Textfield-33": "empleador_codigoPostal",
  "Textfield-34": "empleador_provincia",
  "Textfield-35": "empleador_telefono",
  "Textfield-38": "empleador_email",
  "Textfield-39": "empleador_repNombre",
  "Textfield-40": "empleador_repDniNie",
  "Textfield-41": "empleador_repTitulo",
  // Apartat 3 — RepPresentacion
  "Textfield-42": "repPresentacion_nombre",
  "Piso-0":       "repPresentacion_dniNiePas",
  "Provincia-0":  "repPresentacion_domicilio",
  "Textfield-43": "repPresentacion_numero",
  "Textfield-44": "repPresentacion_piso",
  "Email-1":      "repPresentacion_localidad",
  "Textfield-46": "repPresentacion_codigoPostal",
  "Textfield-48": "repPresentacion_provincia",
  "Textfield-49": "repPresentacion_telefono",
  "Titulo-0":     "repPresentacion_email",
  "Textfield-50": "repPresentacion_repLegal",
  "Textfield-51": "repPresentacion_repDniNiePas",
  "Textfield-52": "repPresentacion_repTitulo",
  // Apartat 4 — Notif
  "Textfield-53": "notif_nombre",
  "Textfield-54": "notif_dniNiePas",
  "Textfield-55": "notif_domicilio",
  "Textfield-56": "notif_numero",
  "Textfield-57": "notif_piso",
  "Email-2":      "notif_localidad",
  "Textfield-59": "notif_codigoPostal",
  "Textfield-60": "notif_provincia",
  "Textfield-61": "notif_telefono",
  "Textfield-64": "notif_email",
  // Extra
  "Texto-2":      null,
};

export const EX_03_DATE_FIELDS = {
  fechaNacimiento: { dd: "Textfield-6", mm: "Texto-1", yyyy: "Feccha de nacimientoz" },
} as const;

export const EX_03_SEXO_CHECKBOXES: Record<string, string> = {
  "H": "H", "M": "M", "ChkBox": "X",
};

export const EX_03_ESTADO_CIVIL_CHECKBOXES: Record<string, string> = {
  "C": "casado", "V": "viudo", "D": "divorciado",
  "Sp": "soltero", "ChkBox-0": "separado",
};

export const EX_03_HIJOS_ESCOLARIZACION_CHECKBOXES: Record<string, boolean> = {
  "Hijasos a cargo en edad de escolarizaclon en Espan": true,
  "NO": false,
};

export const EX_03_TIPO_AUTORIZACION_CHECKBOXES: Record<string, string> = {
  "INICIAL": "inicial",
  "Supuestos especificos de exencion de la situacion": "inicial_exencion",
  "Ocupacion de dificil cobertura segun Catalogo SPEE": "inicial_catalogo_spee",
  "Oferta gestionada en Servicio Publico de Empleo":   "inicial_oferta_spe",
  "Razones de interes economico social o laboral inve": "inicial_interes_economico",
  "Familiar de titulartramite de autorizacion de resi": "inicial_familiar_especial",
  "Titular de autorizacion de estancia por estudios i": "inicial_estudios_practicas",
  "Titular de autorizacion de residenciaresidencia y": "inicial_residencia_previa",
  "Nacionales afectados por Instrucciones dictadas po": "inicial_instrucciones_cm",
  "Nacionales y familiares acogidos a ConveniosAcuerd": "inicial_convenios",
  "Titular de autorizacion de residencia de busqueda": "inicial_busqueda_empleo",
  "Residencia y trabajo independiente por cuenta ajen": "inicial_independiente",
  "Otros": "inicial_otros",
  "RENOVACION": "renovacion",
  "Titular de autorizacion de residencia temporal y t": "renovacion_cuenta_ajena",
  "Residencia y trabajo independiente por cuenta ajen-0": "renovacion_independiente",
  "Otros-1": "renovacion_otros",
  "MODIFICACION": "modificacion",
  "De empleador por fallecimiento o desaparicion del": "modificacion_fallecimiento",
  "De empleador con comunicacion previa de imposibili": "modificacion_imposibilidad",
  "De ocupacion art 2031": "modificacion_ocupacion",
  "De ambito territorial art 2031": "modificacion_ambito",
  "De autorizacion por cuenta propia a cuenta ajena a": "modificacion_propia_ajena",
  "Otros-3": "modificacion_otros",
  "COMPATIBILIDAD": "compatibilidad",
  "TITULAR de autorizacion de residencia temporal y t": "compatibilidad_cuenta_propia",
  "Otros-5": "compatibilidad_otros",
};

export const EX_03_FIRMA_CHECKBOXES: Record<string, string> = {
  "Trabajadora": "trabajador",
  "Empleadora": "empleador",
  "Representante legal": "representante",
};

export const EX_03_CONSENTIMIENTO_CHECKBOX =
  "CONSIENTO que las comunicaciones y notifcaciones s";

export const EX_03_TIPO_DOC_CHECKBOXES: Record<string, string> = {};
export const EX_03_CIRCUNSTANCIA_CHECKBOXES: Record<string, string> = {};
