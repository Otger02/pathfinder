/**
 * Claude tool definitions for conversational data collection.
 *
 * The collect_personal_data tool lets Claude extract structured fields
 * from user messages while generating a conversational response.
 * All fields are optional — Claude only fills what the user mentioned.
 */

import type { PersonalData } from "./types/personal-data";

export interface ClaudeToolDefinition {
  name: string;
  description: string;
  strict?: boolean;
  input_schema: {
    type: "object";
    additionalProperties: boolean;
    properties: Record<string, unknown>;
    required: string[];
  };
}

const TOOL_ENUM_VALUES = {
  sexo: new Set(["H", "M", "X"]),
  estadoCivil: new Set([
    "soltero",
    "casado",
    "separado",
    "divorciado",
    "viudo",
    "pareja_hecho",
  ]),
  tipoDocumento: new Set([
    "pasaporte",
    "titulo_viaje",
    "cedula",
    "documento_identidad",
    "nie",
  ]),
  tipoSolicitud: new Set(["residencia_inicial", "prorroga", "provisional"]),
  hijosEscolarizacion: new Set(["si", "no", "no_aplica"]),
  formacio_tipus: new Set([
    "educacio_secundaria",
    "certificat_professional",
    "ensenyances_obligatories_adults",
    "formacio_serveis_empleo",
  ]),
  formacio_modalitat: new Set(["presencial", "a_distancia", "mixta"]),
} as const;

const ARRAY_TOOL_FIELDS = new Set([
  "documents_obtained",
  "formacio_tipus",
  "formacio_modalitat",
]);

const ADDRESS_FIELDS = [
  "domicilio",
  "numeroDomicilio",
  "pisoDomicilio",
  "localidad",
  "provincia",
  "codigoPostal",
] as const;

const RELATED_FIELD_GROUPS: ReadonlyArray<ReadonlyArray<string>> = [
  ADDRESS_FIELDS,
  [
    "empleador_nombre",
    "empleador_nifNie",
    "empleador_actividad",
    "empleador_domicilio",
    "empleador_localidad",
    "empleador_provincia",
    "empleador_codigoPostal",
    "empleador_telefono",
  ],
  [
    "familiar_nombre",
    "familiar_primerApellido",
    "familiar_segundoApellido",
    "familiar_vinculo",
    "familiar_sexo",
    "familiar_estadoCivil",
    "familiar_fechaNacimiento",
    "familiar_paisNacimiento",
    "familiar_lugarNacimiento",
  ],
  [
    "formacio_entitat",
    "formacio_nifCif",
    "formacio_tipus",
    "formacio_modalitat",
    "formacio_duracio",
  ],
  [
    "activitat_razonSocial",
    "activitat_nif",
    "activitat_actividad",
    "activitat_domicilio",
    "activitat_localidad",
    "activitat_provincia",
    "activitat_codigoPostal",
    "activitat_telefono",
  ],
  [
    "ciudadanoUE_nombre",
    "ciudadanoUE_primerApellido",
    "ciudadanoUE_nie",
    "ciudadanoUE_nacionalidad",
  ],
  [
    "espanyol_nombre",
    "espanyol_primerApellido",
    "espanyol_dni",
    "espanyol_sexo",
    "espanyol_estadoCivil",
  ],
  [
    "tutor_nombre",
    "tutor_dniNiePas",
    "tutor_relacionMenor",
    "tutor_domicilio",
    "tutor_localidad",
    "tutor_telefono",
  ],
];

const STRICT_OPTIONAL_FIELD_LIMIT = 24;

function addFieldIfKnown(target: Set<string>, field: string) {
  if (field in COLLECT_PERSONAL_DATA_PROPERTIES) target.add(field);
}

function expandToolFieldSet(missingFields: string[]): string[] {
  const selected = new Set<string>();
  for (const field of missingFields) addFieldIfKnown(selected, field);

  for (const group of RELATED_FIELD_GROUPS) {
    const touchesGroup = group.some((field) => selected.has(field));
    if (!touchesGroup) continue;

    for (const field of group) {
      if (selected.size >= STRICT_OPTIONAL_FIELD_LIMIT) break;
      addFieldIfKnown(selected, field);
    }
  }

  return Array.from(selected);
}

function cleanString(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function normalizeArrayField(field: string, value: unknown): unknown[] | null {
  if (!Array.isArray(value)) return null;

  const allowedValues =
    field === "formacio_tipus"
      ? TOOL_ENUM_VALUES.formacio_tipus
      : field === "formacio_modalitat"
        ? TOOL_ENUM_VALUES.formacio_modalitat
        : null;

  const cleaned = value
    .map((item) => cleanString(item))
    .filter((item): item is string => item !== null)
    .filter((item) => (allowedValues ? allowedValues.has(item) : true));

  return cleaned.length > 0 ? Array.from(new Set(cleaned)) : null;
}

export function normalizeCollectedPersonalDataInput(
  input: unknown
): Partial<PersonalData> {
  if (!input || typeof input !== "object" || Array.isArray(input)) return {};

  const normalized: Partial<PersonalData> = {};
  const payload = input as Record<string, unknown>;

  for (const [field, rawValue] of Object.entries(payload)) {
    if (!(field in COLLECT_PERSONAL_DATA_PROPERTIES)) continue;

    if (ARRAY_TOOL_FIELDS.has(field)) {
      const arrayValue = normalizeArrayField(field, rawValue);
      if (arrayValue) {
        normalized[field as keyof PersonalData] = arrayValue as never;
      }
      continue;
    }

    if (field === "hijosEscolarizacion") {
      const normalizedValue = cleanString(rawValue);
      if (!normalizedValue || !TOOL_ENUM_VALUES.hijosEscolarizacion.has(normalizedValue)) {
        continue;
      }
      normalized.hijosEscolarizacion =
        normalizedValue === "si"
          ? true
          : normalizedValue === "no"
            ? false
            : null;
      continue;
    }

    const stringValue = cleanString(rawValue);
    if (!stringValue) continue;

    if (
      field === "sexo" ||
      field === "familiar_sexo" ||
      field === "espanyol_sexo"
    ) {
      if (!TOOL_ENUM_VALUES.sexo.has(stringValue)) continue;
    } else if (
      field === "estadoCivil" ||
      field === "familiar_estadoCivil" ||
      field === "espanyol_estadoCivil"
    ) {
      if (!TOOL_ENUM_VALUES.estadoCivil.has(stringValue)) continue;
    } else if (field === "tipoDocumento") {
      if (!TOOL_ENUM_VALUES.tipoDocumento.has(stringValue)) continue;
    } else if (field === "tipoSolicitud") {
      if (!TOOL_ENUM_VALUES.tipoSolicitud.has(stringValue)) continue;
    }

    normalized[field as keyof PersonalData] = stringValue as never;
  }

  return normalized;
}

export const COLLECT_PERSONAL_DATA_TOOL = {
  name: "collect_personal_data",
  description:
    "Extract personal data fields the user just mentioned in their message. " +
    "Only include fields that the user explicitly provided. " +
    "Do NOT guess or infer values the user did not state.",
  input_schema: {
    type: "object" as const,
    additionalProperties: false,
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
        enum: ["H", "M", "X"],
        description: "Sex: H (male), M (female), or X (unspecified)",
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
        enum: ["soltero", "casado", "separado", "divorciado", "viudo", "pareja_hecho"],
        description: "Civil status",
      },
      tipoDocumento: {
        type: "string",
        enum: ["pasaporte", "titulo_viaje", "cedula", "documento_identidad", "nie"],
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
        enum: ["H", "M", "X"],
        description: "Sexo del familiar: H, M o X",
      },
      familiar_estadoCivil: {
        type: "string",
        enum: ["soltero", "casado", "separado", "divorciado", "viudo", "pareja_hecho"],
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
        enum: ["H", "M", "X"],
        description: "Sexo del ciudadano español: H, M o X",
      },
      espanyol_estadoCivil: {
        type: "string",
        enum: ["soltero", "casado", "separado", "divorciado", "viudo", "pareja_hecho"],
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

const COLLECT_PERSONAL_DATA_PROPERTIES =
  COLLECT_PERSONAL_DATA_TOOL.input_schema.properties as Record<string, unknown>;

export function buildCollectPersonalDataTool(options: {
  phase: "conversa" | "document";
  missingFields?: string[];
}): ClaudeToolDefinition {
  const fields =
    options.phase === "document"
      ? ["documents_obtained"]
      : expandToolFieldSet(options.missingFields ?? []);

  const properties = Object.fromEntries(
    fields.map((field) => [field, COLLECT_PERSONAL_DATA_PROPERTIES[field]])
  );

  return {
    name: COLLECT_PERSONAL_DATA_TOOL.name,
    description: COLLECT_PERSONAL_DATA_TOOL.description,
    strict:
      options.phase === "document" &&
      fields.length > 0 &&
      fields.length <= STRICT_OPTIONAL_FIELD_LIMIT,
    input_schema: {
      type: "object",
      additionalProperties: false,
      properties,
      required: [],
    },
  };
}
