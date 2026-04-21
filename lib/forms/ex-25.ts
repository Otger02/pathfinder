import type { PersonalDataField } from "@/lib/types/personal-data";

export const EX_25_TEXT_FIELDS: Record<string, PersonalDataField | null> = {
  "Texto157": "pasaporte", "Texto158": null, "Texto159": "nie", "Texto160": null,
  "Texto161": "primerApellido", "Texto162": "segundoApellido", "Texto163": "nombre",
  "Texto164": null, "Texto165": null, "Texto166": null,
  "Texto167": "lugarNacimiento", "Texto168": "paisNacimiento", "Texto169": "nacionalidad",
  "Texto170": "nombrePadre", "Texto171": "nombreMadre",
  "Texto172": "domicilio", "Texto173": "numeroDomicilio", "Texto174": "pisoDomicilio",
  "Texto175": "localidad", "Texto177": "codigoPostal", "Texto178": "provincia",
  "Texto176": "telefono", "Texto179": "email",
  "Texto180": "representanteLegal", "Texto181": "representanteDniNiePas", "Texto182": "representanteTitulo",
  "Texto183": "tutor_naturaleza", "Texto184": "tutor_relacionMenor",
  "Texto185": "tutor_nombre", "Texto186": "tutor_dniNiePas",
  "Texto187": "tutor_domicilio", "Texto188": "tutor_numero", "Texto189": "tutor_piso",
  "Texto190": "tutor_localidad", "Texto191": "tutor_codigoPostal", "Texto192": "tutor_provincia",
  "Texto193": "tutor_telefono", "Texto194": "tutor_email",
  "Texto195": "tutor_repNombre", "Texto196": "tutor_repDniNie", "Texto197": "tutor_repTitulo",
  "Texto198": "repPresentacion_nombre", "Texto199": "repPresentacion_dniNiePas",
  "Texto200": "repPresentacion_domicilio", "Texto201": "repPresentacion_numero",
  "Texto202": "repPresentacion_piso", "Texto203": "repPresentacion_localidad",
  "Texto204": "repPresentacion_codigoPostal", "Texto205": "repPresentacion_provincia",
  "Texto206": "repPresentacion_telefono", "Texto207": "repPresentacion_email",
  "Texto208": "repPresentacion_repLegal", "Texto209": "repPresentacion_repDniNiePas",
  "Texto210": "repPresentacion_repTitulo",
  "Texto211": "notif_nombre", "Texto212": "notif_dniNiePas", "Texto213": "notif_domicilio",
  "Texto214": "notif_numero", "Texto215": "notif_piso", "Texto216": "notif_localidad",
  "Texto217": "notif_codigoPostal", "Texto218": "notif_provincia",
  "Texto219": "notif_telefono", "Texto220": "notif_email",
  "Texto221": null, "Texto222": null, "Texto223": null,
  "Texto224": null, "Texto225": null, "Texto226": null,
  "Texto227": null, "Texto228": null, "Texto229": null,
  "Texto230": null, "Texto231": null, "Texto232": null,
  "Texto233": null, "Texto234": null,
};

export const EX_25_DATE_FIELDS = {
  fechaNacimiento: { dd: "Texto164", mm: "Texto165", yyyy: "Texto166" },
} as const;

export const EX_25_SEXO_CHECKBOXES: Record<string, string> = {
  "Casilla de verificación235": "X",
  "Casilla de verificación236": "H",
  "Casilla de verificación237": "M",
};

export const EX_25_TIPO_AUTORIZACION_CHECKBOXES: Record<string, string> = {
  "Casilla de verificación238": "menor_acompanyat_nascut",
  "Casilla de verificación239": "menor_acompanyat_no_nascut",
  "Casilla de verificación240": "desplacament_medic",
  "Casilla de verificación241": "desplacament_vacances",
  "Casilla de verificación242": "desplacament_escolaritzacio",
  "Casilla de verificación243": "menor_no_acompanyat",
  "Casilla de verificación244": "renovacio_majoria",
  "Casilla de verificación245": "excepcional_majoria",
};

export const EX_25_CONSENTIMIENTO_CHECKBOX = "Casilla de verificación260";

export const EX_25_TIPO_DOC_CHECKBOXES: Record<string, string> = {};
export const EX_25_ESTADO_CIVIL_CHECKBOXES: Record<string, string> = {};
export const EX_25_CIRCUNSTANCIA_CHECKBOXES: Record<string, string> = {};
export const EX_25_HIJOS_ESCOLARIZACION_CHECKBOXES: Record<string, boolean> = {};
