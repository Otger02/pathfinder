import type { PersonalDataField } from "@/lib/types/personal-data";

export const EX_00_TEXT_FIELDS: Record<string, PersonalDataField | null> = {
  // Apartat 1 — Sol·licitant
  "Textfield":    "pasaporte",
  "Textfield-0":  null,            // NIE lletra
  "Textfield-1":  "nie",
  "Textfield-2":  null,            // NIE control
  "N":            "primerApellido",
  "x":            "segundoApellido",
  "Textfield-3":  "nombre",
  "Textfield-4":  null,            // DD fechaNacimiento
  "Texto-1":      null,            // MM fechaNacimiento
  "Fecha de nacimientoz": null,    // YYYY fechaNacimiento
  "Estado civil3 S": "lugarNacimiento",
  "Textfield-5":  "paisNacimiento",
  "Textfield-6":  "nacionalidad",
  "Textfield-8":  "nombrePadre",
  "Piso":         "nombreMadre",
  "CP":           "domicilio",
  "Textfield-9":  "numeroDomicilio",
  "Textfield-10": "pisoDomicilio",
  "Textfield-12": "localidad",
  "Textfield-13": "codigoPostal",
  "Textfield-15": "provincia",
  "Textfield-17": "telefono",
  "D NIN IEPAS":  "email",
  "Textfield-21": "representanteLegal",
  "Textfield-23": "representanteDniNiePas",
  "Textfield-25": "representanteTitulo",
  // Apartat 2 — RepPresentacion
  "Textfield-26": "repPresentacion_nombre",
  "Piso-0":       "repPresentacion_dniNiePas",
  "Provincia-0":  "repPresentacion_domicilio",
  "Textfield-27": "repPresentacion_numero",
  "Textfield-28": "repPresentacion_piso",
  "Textfield-29": "repPresentacion_localidad",
  "Textfield-30": "repPresentacion_codigoPostal",
  "Textfield-32": "repPresentacion_provincia",
  "Textfield-33": "repPresentacion_telefono",
  "Textfield-35": "repPresentacion_email",
  "Textfield-37": "repPresentacion_repLegal",
  "Titulo4":      "repPresentacion_repDniNiePas",
  "Textfield-39": "repPresentacion_repTitulo",
  // Apartat 3 — Notif
  "Textfield-40": "notif_nombre",
  "Textfield-41": "notif_dniNiePas",
  "Textfield-42": "notif_domicilio",
  "Textfield-43": "notif_numero",
  "Textfield-44": "notif_piso",
  "Textfield-45": "notif_localidad",
  "Email":        "notif_codigoPostal",
  "Textfield-47": "notif_provincia",
  "Textfield-48": "notif_telefono",
  "Textfield-51": "notif_email",
};

export const EX_00_DATE_FIELDS = {
  fechaNacimiento: { dd: "Textfield-4", mm: "Texto-1", yyyy: "Fecha de nacimientoz" },
} as const;

export const EX_00_SEXO_CHECKBOXES: Record<string, string> = {
  "H": "H", "M": "M", "ChkBox": "X",
};

export const EX_00_ESTADO_CIVIL_CHECKBOXES: Record<string, string> = {
  "C": "casado", "V": "viudo", "D": "divorciado",
  "Sp": "soltero", "ChkBox-0": "separado",
};

export const EX_00_TIPO_AUTORIZACION_CHECKBOXES: Record<string, string> = {
  "INICIAL": "inicial",
  "Estancia por movilidad de alumnos art 443": "inicial_movilidad_alumnos",
  "Autorizacion de estancia por estudios superiores a": "inicial_estudios_superiores",
  "Autorizacion de estancia por estudios no superiore": "inicial_estudios_no_superiores",
  "Formacion reglada para el empleo certificado de pr": "inicial_formacion_empleo",
  "Estudiante convenio Andorra": "inicial_estudiante_andorra",
  "Familiar de titular autorizacion de estancia para": "inicial_familiar_andorra",
  "Estancia en base a instrucciones dictadas por Cons": "inicial_instrucciones_cm",
  "Otros": "inicial_otros",
  "PRORROGA": "prorroga",
  "Titular de autorizacion de estancia ordinaria sin": "prorroga_ordinaria",
  "Titular de visado de estancia art 34": "prorroga_visado",
  "Titular de autorizacion estancia por estudios movi": "prorroga_estudios_movilidad",
  "Familiar de titular de autorizacion de estancia po": "prorroga_familiar_estudios",
  "Familiar de titular de autorizacion de estancia en": "prorroga_familiar_mir",
  "Titular de autorizacion de estancia en regimen esp": "prorroga_mir",
  "Titular de autorizacion de estancia por movilidad": "prorroga_movilidad_estudiantes",
  "Titular de autorizacion de estancia por estudios s": "prorroga_estudios_superiores",
  "Titular de autorizacion de estancia por estudios n": "prorroga_estudios_no_superiores",
  "Menor desplazado para tratamiento medico art 1262": "prorroga_menor_medico",
  "Menor desplazado para escolarizacion razones excep": "prorroga_menor_escolarizacion",
  "Titular de autorizacion de estancia en base a inst": "prorroga_instrucciones_cm",
  "Titular de autorizacion de estancia Convenios Inte": "prorroga_convenios",
  "Titular de visado de estancia Convenios internacio": "prorroga_visado_convenios",
  "Otros-1": "prorroga_otros",
};

export const EX_00_CONSENTIMIENTO_CHECKBOX =
  "CONSIENTO que las comunicaciones y notifcaciones s";

export const EX_00_TIPO_DOC_CHECKBOXES: Record<string, string> = {};
export const EX_00_CIRCUNSTANCIA_CHECKBOXES: Record<string, string> = {};
export const EX_00_HIJOS_ESCOLARIZACION_CHECKBOXES: Record<string, boolean> = {};
