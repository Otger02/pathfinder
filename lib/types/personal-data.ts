/**
 * Personal data types for immigration form filling.
 *
 * Fields derived from the standard EX-XX Spanish government forms
 * (EX-00, EX-01, EX-02, EX-03, EX-07, EX-10, EX-11, EX-19, EX-24, EX-25).
 * All authorizations share the same base personal data set.
 */

export interface PersonalData {
  // Identity
  nombre: string;
  primerApellido: string;
  segundoApellido: string;
  fechaNacimiento: string; // YYYY-MM-DD
  lugarNacimiento: string;
  paisNacimiento: string;
  nacionalidad: string;
  sexo: "H" | "M" | "";

  // Parents (required by many EX forms)
  nombrePadre: string;
  nombreMadre: string;

  // Civil status
  estadoCivil:
    | "soltero"
    | "casado"
    | "divorciado"
    | "viudo"
    | "pareja_hecho"
    | "";

  // Identity documents
  tipoDocumento: "pasaporte" | "nie" | "otro" | "";
  numeroDocumento: string;
  nie: string;

  // Address in Spain
  domicilio: string;
  localidad: string;
  provincia: string;
  codigoPostal: string;

  // Contact
  telefono: string;
  email: string;

  // Legal representative (optional)
  representanteLegal: string;
  representanteNie: string;
}

export type PersonalDataField = keyof PersonalData;

export const EMPTY_PERSONAL_DATA: PersonalData = {
  nombre: "",
  primerApellido: "",
  segundoApellido: "",
  fechaNacimiento: "",
  lugarNacimiento: "",
  paisNacimiento: "",
  nacionalidad: "",
  sexo: "",
  nombrePadre: "",
  nombreMadre: "",
  estadoCivil: "",
  tipoDocumento: "",
  numeroDocumento: "",
  nie: "",
  domicilio: "",
  localidad: "",
  provincia: "",
  codigoPostal: "",
  telefono: "",
  email: "",
  representanteLegal: "",
  representanteNie: "",
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
