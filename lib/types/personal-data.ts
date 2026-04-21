/**
 * Personal data types for immigration form filling.
 *
 * Fields derived from the standard EX-XX Spanish government forms.
 * Organised in blocs matching form sections.
 */

// ── Enum types ───────────────────────────────────────────────

export type Sexo = "H" | "M" | "X" | "";
export type EstadoCivil =
  | "soltero"
  | "casado"
  | "viudo"
  | "separado"
  | "divorciado"
  | "pareja_hecho"
  | "";
export type TipoDocumento =
  | "pasaporte"
  | "titulo_viaje"
  | "cedula"
  | "documento_identidad"
  | "nie"
  | "";
export type FormacioTipus =
  | "educacio_secundaria"
  | "certificat_professional"
  | "ensenyances_obligatories_adults"
  | "formacio_serveis_empleo";
export type FormacioModalitat = "presencial" | "a_distancia" | "mixta";

// ── Main interface ───────────────────────────────────────────

export interface PersonalData {
  // ── Bloc Solicitant (base, tots els EX) ────────────────────
  pasaporte: string;
  nie: string;
  primerApellido: string;
  segundoApellido: string;
  nombre: string;
  fechaNacimiento: string; // YYYY-MM-DD
  lugarNacimiento: string;
  paisNacimiento: string;
  nacionalidad: string;
  sexo: Sexo;
  estadoCivil: EstadoCivil;
  tipoDocumento: TipoDocumento;
  numeroDocumento: string;
  nombrePadre: string;
  nombreMadre: string;
  domicilio: string;
  numeroDomicilio: string;
  pisoDomicilio: string;
  localidad: string;
  codigoPostal: string;
  provincia: string;
  telefono: string;
  email: string;
  representanteLegal: string;
  representanteDniNiePas: string;
  representanteTitulo: string;

  // ── Bloc Familiar / Reagrupat (prefix familiar_) ───────────
  familiar_pasaporte: string;
  familiar_nie: string;
  familiar_primerApellido: string;
  familiar_segundoApellido: string;
  familiar_nombre: string;
  familiar_fechaNacimiento: string;
  familiar_paisNacimiento: string;
  familiar_lugarNacimiento: string;
  familiar_nacionalidad: string;
  familiar_sexo: Sexo;
  familiar_estadoCivil: EstadoCivil;
  familiar_nombrePadre: string;
  familiar_nombreMadre: string;
  familiar_domicilio: string;
  familiar_numeroDomicilio: string;
  familiar_pisoDomicilio: string;
  familiar_localidad: string;
  familiar_codigoPostal: string;
  familiar_provincia: string;
  familiar_vinculo: string;
  familiar_parentesco: string;

  // ── Bloc Titular Recursos (prefix titular_) — EX-01 ────────
  titular_pasaporte: string;
  titular_nie: string;
  titular_primerApellido: string;
  titular_segundoApellido: string;
  titular_nombre: string;
  titular_sexo: Sexo;
  titular_estadoCivil: EstadoCivil;
  titular_fechaNacimiento: string;
  titular_paisNacimiento: string;
  titular_nombrePadre: string;
  titular_nombreMadre: string;
  titular_parentesco: string;

  // ── Bloc Espanyol (prefix espanyol_) — EX-24 ───────────────
  espanyol_pasaporte: string;
  espanyol_dni: string;
  espanyol_primerApellido: string;
  espanyol_segundoApellido: string;
  espanyol_nombre: string;
  espanyol_sexo: Sexo;
  espanyol_estadoCivil: EstadoCivil;
  espanyol_fechaNacimiento: string;
  espanyol_paisNacimiento: string;
  espanyol_nombrePadre: string;
  espanyol_nombreMadre: string;
  espanyol_domicilio: string;
  espanyol_numeroDomicilio: string;
  espanyol_pisoDomicilio: string;
  espanyol_localidad: string;
  espanyol_codigoPostal: string;
  espanyol_provincia: string;
  espanyol_parentesco: string;

  // ── Bloc Ciutadà UE (prefix ciudadanoUE_) — EX-19 ─────────
  ciudadanoUE_pasaporte: string;
  ciudadanoUE_nie: string;
  ciudadanoUE_primerApellido: string;
  ciudadanoUE_segundoApellido: string;
  ciudadanoUE_nombre: string;
  ciudadanoUE_nacionalidad: string;
  ciudadanoUE_domicilio: string;
  ciudadanoUE_numeroDomicilio: string;
  ciudadanoUE_pisoDomicilio: string;
  ciudadanoUE_localidad: string;
  ciudadanoUE_codigoPostal: string;
  ciudadanoUE_provincia: string;

  // ── Bloc Representant Presentació (prefix repPresentacion_) ─
  repPresentacion_nombre: string;
  repPresentacion_dniNiePas: string;
  repPresentacion_titulo: string;
  repPresentacion_domicilio: string;
  repPresentacion_numero: string;
  repPresentacion_piso: string;
  repPresentacion_localidad: string;
  repPresentacion_codigoPostal: string;
  repPresentacion_provincia: string;
  repPresentacion_telefono: string;
  repPresentacion_email: string;
  repPresentacion_repLegal: string;
  repPresentacion_repDniNiePas: string;
  repPresentacion_repTitulo: string;

  // ── Bloc Notificacions (prefix notif_) ─────────────────────
  notif_nombre: string;
  notif_dniNiePas: string;
  notif_domicilio: string;
  notif_numero: string;
  notif_piso: string;
  notif_localidad: string;
  notif_codigoPostal: string;
  notif_provincia: string;
  notif_telefono: string;
  notif_email: string;

  // ── Bloc Empleador (prefix empleador_) — EX-03, EX-06 ─────
  empleador_nombre: string;
  empleador_nifNie: string;
  empleador_actividad: string;
  empleador_ocupacion: string;
  empleador_cnae: string;
  empleador_cnoSpe: string;
  empleador_domicilio: string;
  empleador_numero: string;
  empleador_piso: string;
  empleador_localidad: string;
  empleador_codigoPostal: string;
  empleador_provincia: string;
  empleador_telefono: string;
  empleador_email: string;
  empleador_repNombre: string;
  empleador_repDniNie: string;
  empleador_repTitulo: string;

  // ── Bloc Entitat Acollida / Invitant (prefix entitat_) ─────
  entitat_nombre: string;
  entitat_nifNie: string;
  entitat_actividad: string;
  entitat_ocupacion: string;
  entitat_domicilio: string;
  entitat_numero: string;
  entitat_piso: string;
  entitat_localidad: string;
  entitat_codigoPostal: string;
  entitat_provincia: string;
  entitat_telefono: string;
  entitat_email: string;
  entitat_repNombre: string;
  entitat_repDniNie: string;
  entitat_repTitulo: string;

  // ── Bloc Activitat Compte Propi (prefix activitat_) — EX-07 ─
  activitat_razonSocial: string;
  activitat_nif: string;
  activitat_actividad: string;
  activitat_domicilio: string;
  activitat_numero: string;
  activitat_piso: string;
  activitat_localidad: string;
  activitat_codigoPostal: string;
  activitat_provincia: string;
  activitat_telefono: string;
  activitat_email: string;

  // ── Bloc Tutor / Entitat Menor (prefix tutor_) — EX-25 ────
  tutor_naturaleza: string;
  tutor_relacionMenor: string;
  tutor_nombre: string;
  tutor_dniNiePas: string;
  tutor_domicilio: string;
  tutor_numero: string;
  tutor_piso: string;
  tutor_localidad: string;
  tutor_codigoPostal: string;
  tutor_provincia: string;
  tutor_telefono: string;
  tutor_email: string;
  tutor_repNombre: string;
  tutor_repDniNie: string;
  tutor_repTitulo: string;

  // ── Bloc Formació (prefix formacio_) — EX-10 ──────────────
  formacio_entitat: string;
  formacio_nom: string;
  formacio_codigoCurs: string;
  formacio_nifCif: string;
  formacio_direccio: string;
  formacio_provincia: string;
  formacio_duracio: string;
  formacio_fechaInici: string;
  formacio_fechaFi: string;
  formacio_tipus: FormacioTipus[];
  formacio_modalitat: FormacioModalitat[];

  // ── EX-02 specific ─────────────────────────────────────────
  autoritzacioTitular: string;
  autoritzacioTitularDni: string;
  autoritzacioTitularTitol: string;

  // ── Booleans / flags ───────────────────────────────────────
  hijosEscolarizacion: boolean | null;
  consentimientoDehu: boolean;

  // ── Legacy fields (backwards compat — old camelCase) ───────
  /** @deprecated Use representanteDniNiePas */
  representanteNie: string;
  repPresentacionNombre: string;
  repPresentacionDniNiePas: string;
  repPresentacionDomicilio: string;
  repPresentacionNumero: string;
  repPresentacionPiso: string;
  repPresentacionLocalidad: string;
  repPresentacionCodigoPostal: string;
  repPresentacionProvincia: string;
  repPresentacionTelefono: string;
  repPresentacionEmail: string;
  repPresentacionRepLegal: string;
  repPresentacionRepDniNiePas: string;
  repPresentacionRepTitulo: string;
  notifNombre: string;
  notifDniNiePas: string;
  notifDomicilio: string;
  notifNumero: string;
  notifPiso: string;
  notifLocalidad: string;
  notifCodigoPostal: string;
  notifProvincia: string;
  notifTelefono: string;
  notifEmail: string;
}

export type PersonalDataField = keyof PersonalData;

export const EMPTY_PERSONAL_DATA: PersonalData = {
  pasaporte: "", nie: "", primerApellido: "", segundoApellido: "", nombre: "",
  fechaNacimiento: "", lugarNacimiento: "", paisNacimiento: "", nacionalidad: "",
  sexo: "", estadoCivil: "", tipoDocumento: "", numeroDocumento: "",
  nombrePadre: "", nombreMadre: "", domicilio: "", numeroDomicilio: "",
  pisoDomicilio: "", localidad: "", codigoPostal: "", provincia: "",
  telefono: "", email: "", representanteLegal: "", representanteDniNiePas: "",
  representanteTitulo: "",
  familiar_pasaporte: "", familiar_nie: "", familiar_primerApellido: "",
  familiar_segundoApellido: "", familiar_nombre: "", familiar_fechaNacimiento: "",
  familiar_paisNacimiento: "", familiar_lugarNacimiento: "", familiar_nacionalidad: "",
  familiar_sexo: "", familiar_estadoCivil: "", familiar_nombrePadre: "",
  familiar_nombreMadre: "", familiar_domicilio: "", familiar_numeroDomicilio: "",
  familiar_pisoDomicilio: "", familiar_localidad: "", familiar_codigoPostal: "",
  familiar_provincia: "", familiar_vinculo: "", familiar_parentesco: "",
  titular_pasaporte: "", titular_nie: "", titular_primerApellido: "",
  titular_segundoApellido: "", titular_nombre: "", titular_sexo: "",
  titular_estadoCivil: "", titular_fechaNacimiento: "", titular_paisNacimiento: "",
  titular_nombrePadre: "", titular_nombreMadre: "", titular_parentesco: "",
  espanyol_pasaporte: "", espanyol_dni: "", espanyol_primerApellido: "",
  espanyol_segundoApellido: "", espanyol_nombre: "", espanyol_sexo: "",
  espanyol_estadoCivil: "", espanyol_fechaNacimiento: "", espanyol_paisNacimiento: "",
  espanyol_nombrePadre: "", espanyol_nombreMadre: "", espanyol_domicilio: "",
  espanyol_numeroDomicilio: "", espanyol_pisoDomicilio: "", espanyol_localidad: "",
  espanyol_codigoPostal: "", espanyol_provincia: "", espanyol_parentesco: "",
  ciudadanoUE_pasaporte: "", ciudadanoUE_nie: "", ciudadanoUE_primerApellido: "",
  ciudadanoUE_segundoApellido: "", ciudadanoUE_nombre: "", ciudadanoUE_nacionalidad: "",
  ciudadanoUE_domicilio: "", ciudadanoUE_numeroDomicilio: "",
  ciudadanoUE_pisoDomicilio: "", ciudadanoUE_localidad: "",
  ciudadanoUE_codigoPostal: "", ciudadanoUE_provincia: "",
  repPresentacion_nombre: "", repPresentacion_dniNiePas: "",
  repPresentacion_titulo: "", repPresentacion_domicilio: "",
  repPresentacion_numero: "", repPresentacion_piso: "",
  repPresentacion_localidad: "", repPresentacion_codigoPostal: "",
  repPresentacion_provincia: "", repPresentacion_telefono: "",
  repPresentacion_email: "", repPresentacion_repLegal: "",
  repPresentacion_repDniNiePas: "", repPresentacion_repTitulo: "",
  notif_nombre: "", notif_dniNiePas: "", notif_domicilio: "",
  notif_numero: "", notif_piso: "", notif_localidad: "",
  notif_codigoPostal: "", notif_provincia: "", notif_telefono: "", notif_email: "",
  empleador_nombre: "", empleador_nifNie: "", empleador_actividad: "",
  empleador_ocupacion: "", empleador_cnae: "", empleador_cnoSpe: "",
  empleador_domicilio: "", empleador_numero: "", empleador_piso: "",
  empleador_localidad: "", empleador_codigoPostal: "", empleador_provincia: "",
  empleador_telefono: "", empleador_email: "", empleador_repNombre: "",
  empleador_repDniNie: "", empleador_repTitulo: "",
  entitat_nombre: "", entitat_nifNie: "", entitat_actividad: "",
  entitat_ocupacion: "", entitat_domicilio: "", entitat_numero: "", entitat_piso: "",
  entitat_localidad: "", entitat_codigoPostal: "", entitat_provincia: "",
  entitat_telefono: "", entitat_email: "", entitat_repNombre: "",
  entitat_repDniNie: "", entitat_repTitulo: "",
  activitat_razonSocial: "", activitat_nif: "", activitat_actividad: "",
  activitat_domicilio: "", activitat_numero: "", activitat_piso: "",
  activitat_localidad: "", activitat_codigoPostal: "", activitat_provincia: "",
  activitat_telefono: "", activitat_email: "",
  tutor_naturaleza: "", tutor_relacionMenor: "", tutor_nombre: "",
  tutor_dniNiePas: "", tutor_domicilio: "", tutor_numero: "", tutor_piso: "",
  tutor_localidad: "", tutor_codigoPostal: "", tutor_provincia: "",
  tutor_telefono: "", tutor_email: "", tutor_repNombre: "",
  tutor_repDniNie: "", tutor_repTitulo: "",
  formacio_entitat: "", formacio_nom: "", formacio_codigoCurs: "",
  formacio_nifCif: "", formacio_direccio: "", formacio_provincia: "",
  formacio_duracio: "", formacio_fechaInici: "", formacio_fechaFi: "",
  formacio_tipus: [], formacio_modalitat: [],
  autoritzacioTitular: "", autoritzacioTitularDni: "", autoritzacioTitularTitol: "",
  hijosEscolarizacion: null, consentimientoDehu: false,
  representanteNie: "", repPresentacionNombre: "", repPresentacionDniNiePas: "",
  repPresentacionDomicilio: "", repPresentacionNumero: "", repPresentacionPiso: "",
  repPresentacionLocalidad: "", repPresentacionCodigoPostal: "",
  repPresentacionProvincia: "", repPresentacionTelefono: "",
  repPresentacionEmail: "", repPresentacionRepLegal: "",
  repPresentacionRepDniNiePas: "", repPresentacionRepTitulo: "",
  notifNombre: "", notifDniNiePas: "", notifDomicilio: "", notifNumero: "",
  notifPiso: "", notifLocalidad: "", notifCodigoPostal: "", notifProvincia: "",
  notifTelefono: "", notifEmail: "",
};

/** Spanish provinces for dropdown */
export const PROVINCIAS = [
  "A Coruña", "Álava", "Albacete", "Alicante", "Almería", "Asturias",
  "Ávila", "Badajoz", "Barcelona", "Bizkaia", "Burgos", "Cáceres",
  "Cádiz", "Cantabria", "Castellón", "Ceuta", "Ciudad Real", "Córdoba",
  "Cuenca", "Gipuzkoa", "Girona", "Granada", "Guadalajara", "Huelva",
  "Huesca", "Illes Balears", "Jaén", "La Rioja", "Las Palmas", "León",
  "Lleida", "Lugo", "Madrid", "Málaga", "Melilla", "Murcia", "Navarra",
  "Ourense", "Palencia", "Pontevedra", "Salamanca",
  "Santa Cruz de Tenerife", "Segovia", "Sevilla", "Soria", "Tarragona",
  "Teruel", "Toledo", "Valencia", "Valladolid", "Zamora", "Zaragoza",
] as const;
