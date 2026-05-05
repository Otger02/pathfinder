/**
 * Claude tool definitions for conversational data collection.
 *
 * The collect_personal_data tool lets Claude extract structured fields
 * from user messages while generating a conversational response.
 * All fields are optional — Claude only fills what the user mentioned.
 */

export const COLLECT_PERSONAL_DATA_TOOL = {
  name: "collect_personal_data",
  description:
    "Extract personal data fields the user just mentioned in their message. " +
    "Only include fields that the user explicitly provided. " +
    "Do NOT guess or infer values the user did not state.",
  input_schema: {
    type: "object" as const,
    properties: {
      nombre: {
        type: "string",
        description: "First name (nombre)",
      },
      primerApellido: {
        type: "string",
        description: "First surname (primer apellido)",
      },
      segundoApellido: {
        type: "string",
        description: "Second surname (segundo apellido)",
      },
      fechaNacimiento: {
        type: "string",
        description: "Date of birth in YYYY-MM-DD format",
      },
      lugarNacimiento: {
        type: "string",
        description: "Place of birth (city/town)",
      },
      paisNacimiento: {
        type: "string",
        description: "Country of birth",
      },
      nacionalidad: {
        type: "string",
        description: "Nationality / citizenship",
      },
      sexo: {
        type: "string",
        enum: ["H", "M"],
        description: "Sex: H (male) or M (female)",
      },
      nombrePadre: {
        type: "string",
        description: "Father's full name",
      },
      nombreMadre: {
        type: "string",
        description: "Mother's full name",
      },
      estadoCivil: {
        type: "string",
        enum: ["soltero", "casado", "divorciado", "viudo", "pareja_hecho"],
        description: "Civil status",
      },
      tipoDocumento: {
        type: "string",
        enum: ["pasaporte", "nie", "otro"],
        description: "Type of identity document",
      },
      numeroDocumento: {
        type: "string",
        description: "Identity document number",
      },
      nie: {
        type: "string",
        description: "NIE (Número de Identidad de Extranjero)",
      },
      domicilio: {
        type: "string",
        description: "Street address in Spain",
      },
      localidad: {
        type: "string",
        description: "City / town in Spain",
      },
      provincia: {
        type: "string",
        description: "Province in Spain",
      },
      codigoPostal: {
        type: "string",
        description: "Postal code (5 digits)",
      },
      telefono: {
        type: "string",
        description: "Phone number",
      },
      email: {
        type: "string",
        description: "Email address",
      },
      representanteLegal: {
        type: "string",
        description: "Legal representative's name",
      },
      representanteDniNiePas: {
        type: "string",
        description: "Legal representative's NIE",
      },

      // ── Camps base que faltaven ────────────────────────────────
      numeroDomicilio: {
        type: "string",
        description: "Número del domicilio del solicitante",
      },
      pisoDomicilio: {
        type: "string",
        description: "Piso/puerta del domicilio del solicitante",
      },
      tipoSolicitud: {
        type: "string",
        enum: ["residencia_inicial", "prorroga", "provisional"],
        description:
          "Tipo de solicitud: residencia_inicial, prorroga o provisional",
      },
      hijosEscolarizacion: {
        type: "string",
        enum: ["si", "no", "no_aplica"],
        description:
          "Hijos en edad escolar escolarizados: si, no o no_aplica",
      },

      // ── Empleador (arraigo sociolaboral) ──────────────────────
      empleador_nombre: {
        type: "string",
        description: "Nombre o razón social del empleador",
      },
      empleador_nifNie: {
        type: "string",
        description: "NIF o NIE del empleador",
      },
      empleador_actividad: {
        type: "string",
        description: "Actividad o sector del empleador",
      },
      empleador_domicilio: {
        type: "string",
        description: "Calle/dirección del empleador",
      },
      empleador_localidad: {
        type: "string",
        description: "Localidad del empleador",
      },
      empleador_provincia: {
        type: "string",
        description: "Provincia del empleador",
      },
      empleador_codigoPostal: {
        type: "string",
        description: "Código postal del empleador",
      },
      empleador_telefono: {
        type: "string",
        description: "Teléfono del empleador",
      },

      // ── Familiar (arraigo familiar) ───────────────────────────
      familiar_nombre: {
        type: "string",
        description: "Nombre del familiar residente en España",
      },
      familiar_primerApellido: {
        type: "string",
        description: "Primer apellido del familiar",
      },
      familiar_segundoApellido: {
        type: "string",
        description: "Segundo apellido del familiar",
      },
      familiar_vinculo: {
        type: "string",
        description: "Vínculo / parentesco con el familiar (hijo, hermano, cónyuge, etc.)",
      },
      familiar_sexo: {
        type: "string",
        enum: ["H", "M"],
        description: "Sexo del familiar: H (hombre) o M (mujer)",
      },
      familiar_estadoCivil: {
        type: "string",
        enum: ["soltero", "casado", "divorciado", "viudo", "pareja_hecho"],
        description: "Estado civil del familiar",
      },
      familiar_fechaNacimiento: {
        type: "string",
        description: "Fecha de nacimiento del familiar (YYYY-MM-DD)",
      },
      familiar_paisNacimiento: {
        type: "string",
        description: "País de nacimiento del familiar",
      },
      familiar_lugarNacimiento: {
        type: "string",
        description: "Lugar de nacimiento del familiar",
      },

      // ── Formació (arraigo socioformatiu) ──────────────────────
      formacio_entitat: {
        type: "string",
        description: "Nombre de la entidad o centro de formación",
      },
      formacio_nifCif: {
        type: "string",
        description: "NIF/CIF de la entidad de formación",
      },
      formacio_tipus: {
        type: "array",
        items: { type: "string" },
        description:
          "Tipo(s) de formación: educacio_secundaria, certificat_professional, ensenyances_obligatories_adults, formacio_serveis_empleo",
      },
      formacio_modalitat: {
        type: "array",
        items: { type: "string" },
        description: "Modalidad(es): presencial, a_distancia, mixta",
      },
      formacio_duracio: {
        type: "string",
        description: "Duración del curso (ej: '6 meses', '200 horas')",
      },

      // ── Documents obtained ────────────────────────────────────
      documents_obtained: {
        type: "array",
        items: { type: "string" },
        description:
          "Slugs of documents the user confirms they have or have already obtained. " +
          "Valid slugs: passaport_vigent, foto_carnet, model_790, empadronament_2_anys, empadronament_3_anys, " +
          "antecedents_penals_espanya, antecedents_penals_origen, contracte_treball, vida_laboral_empleador, " +
          "informe_arraigo_social, matricula_curs, documentacio_vincle_familiar, resolucio_denegacio.",
      },

      // ── Activitat compte propi (EX-07) ────────────────────────
      activitat_razonSocial: {
        type: "string",
        description: "Razón social o nombre de la actividad por cuenta propia",
      },
      activitat_nif: {
        type: "string",
        description: "NIF de la actividad o empresa propia",
      },
      activitat_actividad: {
        type: "string",
        description: "Descripción de la actividad económica propia",
      },
      activitat_domicilio: {
        type: "string",
        description: "Dirección del centro de actividad propia",
      },
      activitat_localidad: {
        type: "string",
        description: "Localidad del centro de actividad propia",
      },
      activitat_provincia: {
        type: "string",
        description: "Provincia del centro de actividad propia",
      },
      activitat_codigoPostal: {
        type: "string",
        description: "Código postal del centro de actividad propia",
      },
      activitat_telefono: {
        type: "string",
        description: "Teléfono de la actividad propia",
      },

      // ── Ciutadà UE (EX-19) ───────────────────────────────────
      ciudadanoUE_nombre: {
        type: "string",
        description: "Nombre del ciudadano de la UE del que es familiar",
      },
      ciudadanoUE_primerApellido: {
        type: "string",
        description: "Primer apellido del ciudadano UE",
      },
      ciudadanoUE_nie: {
        type: "string",
        description: "NIE/pasaporte del ciudadano UE",
      },
      ciudadanoUE_nacionalidad: {
        type: "string",
        description: "Nacionalidad del ciudadano UE",
      },

      // ── Familiar d'espanyol (EX-24) ───────────────────────────
      espanyol_nombre: {
        type: "string",
        description: "Nombre del ciudadano español del que es familiar",
      },
      espanyol_primerApellido: {
        type: "string",
        description: "Primer apellido del ciudadano español",
      },
      espanyol_dni: {
        type: "string",
        description: "DNI del ciudadano español",
      },
      espanyol_sexo: {
        type: "string",
        enum: ["H", "M"],
        description: "Sexo del ciudadano español: H (hombre) o M (mujer)",
      },
      espanyol_estadoCivil: {
        type: "string",
        enum: ["soltero", "casado", "divorciado", "viudo", "pareja_hecho"],
        description: "Estado civil del ciudadano español",
      },

      // ── Tutor / Entitat menor (EX-25) ─────────────────────────
      tutor_nombre: {
        type: "string",
        description: "Nombre del tutor o entidad responsable del menor",
      },
      tutor_dniNiePas: {
        type: "string",
        description: "DNI/NIE/pasaporte del tutor",
      },
      tutor_relacionMenor: {
        type: "string",
        description: "Relación del tutor con el menor (padre, madre, tutor legal, entidad, etc.)",
      },
      tutor_domicilio: {
        type: "string",
        description: "Domicilio del tutor",
      },
      tutor_localidad: {
        type: "string",
        description: "Localidad del tutor",
      },
      tutor_telefono: {
        type: "string",
        description: "Teléfono del tutor",
      },
    },
    required: [] as string[],
  },
};
