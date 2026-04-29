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
    },
    required: [] as string[],
  },
};
