/**
 * form-config.ts
 *
 * Maps authorization types to their required EX forms and personal data fields.
 * Authorization numbers match the AUTH_MAP in scripts/chunk-authorizations.ts.
 * EX form assignments derived from the official authorization source documents.
 */

import type { PersonalDataField } from "./types/personal-data";

export type ExFormId =
  | "EX-00" | "EX-01" | "EX-02" | "EX-03" | "EX-04"
  | "EX-06" | "EX-07" | "EX-09" | "EX-10" | "EX-11"
  | "EX-19" | "EX-24" | "EX-25";

export interface ExFormInfo {
  id: ExFormId;
  name: string; // Human-readable form name (Spanish)
  requiredFields: PersonalDataField[];
  optionalFields: PersonalDataField[];
}

// Base fields required by virtually all EX forms
const BASE_REQUIRED: PersonalDataField[] = [
  "nombre", "primerApellido", "fechaNacimiento",
  "nacionalidad", "tipoDocumento", "numeroDocumento",
  "domicilio", "localidad", "provincia", "codigoPostal",
];

const BASE_OPTIONAL: PersonalDataField[] = [
  "segundoApellido", "sexo", "lugarNacimiento", "paisNacimiento",
  "nombrePadre", "nombreMadre", "estadoCivil", "nie",
  "telefono", "email", "representanteLegal", "representanteDniNiePas",
];

export const EX_FORMS: Record<ExFormId, ExFormInfo> = {
  "EX-00": {
    id: "EX-00",
    name: "Solicitud de autorización de estancia por estudios",
    requiredFields: [...BASE_REQUIRED, "nie"],
    optionalFields: BASE_OPTIONAL.filter((f) => f !== "nie"),
  },
  "EX-01": {
    id: "EX-01",
    name: "Solicitud de autorización de residencia temporal no lucrativa",
    requiredFields: [...BASE_REQUIRED],
    optionalFields: BASE_OPTIONAL,
  },
  "EX-02": {
    id: "EX-02",
    name: "Solicitud de autorización de residencia por reagrupación familiar",
    requiredFields: [...BASE_REQUIRED, "estadoCivil"],
    optionalFields: BASE_OPTIONAL.filter((f) => f !== "estadoCivil"),
  },
  "EX-03": {
    id: "EX-03",
    name: "Solicitud de autorización de residencia y trabajo por cuenta ajena",
    requiredFields: [...BASE_REQUIRED, "nie"],
    optionalFields: BASE_OPTIONAL.filter((f) => f !== "nie"),
  },
  "EX-04": {
    id: "EX-04",
    name: "Solicitud de autorización de residencia y trabajo en prácticas",
    requiredFields: [...BASE_REQUIRED],
    optionalFields: BASE_OPTIONAL,
  },
  "EX-06": {
    id: "EX-06",
    name: "Solicitud de autorización de residencia y trabajo de temporada",
    requiredFields: [...BASE_REQUIRED],
    optionalFields: BASE_OPTIONAL,
  },
  "EX-07": {
    id: "EX-07",
    name: "Solicitud de autorización de residencia y trabajo por cuenta propia",
    requiredFields: [...BASE_REQUIRED, "nie"],
    optionalFields: BASE_OPTIONAL.filter((f) => f !== "nie"),
  },
  "EX-09": {
    id: "EX-09",
    name: "Solicitud de autorización de residencia con excepción de autorización de trabajo",
    requiredFields: [...BASE_REQUIRED],
    optionalFields: BASE_OPTIONAL,
  },
  "EX-10": {
    id: "EX-10",
    name: "Solicitud de autorización de residencia por circunstancias excepcionales",
    requiredFields: [...BASE_REQUIRED],
    optionalFields: BASE_OPTIONAL,
  },
  "EX-11": {
    id: "EX-11",
    name: "Solicitud de autorización de residencia de larga duración / larga duración-UE",
    requiredFields: [...BASE_REQUIRED, "nie"],
    optionalFields: BASE_OPTIONAL.filter((f) => f !== "nie"),
  },
  "EX-19": {
    id: "EX-19",
    name: "Solicitud de tarjeta de residencia de familiar de ciudadano de la UE",
    requiredFields: [...BASE_REQUIRED, "estadoCivil"],
    optionalFields: BASE_OPTIONAL.filter((f) => f !== "estadoCivil"),
  },
  "EX-24": {
    id: "EX-24",
    name: "Solicitud de autorización de residencia de familiar de ciudadano español",
    requiredFields: [...BASE_REQUIRED, "estadoCivil"],
    optionalFields: BASE_OPTIONAL.filter((f) => f !== "estadoCivil"),
  },
  "EX-25": {
    id: "EX-25",
    name: "Solicitud de autorización de residencia para menores",
    requiredFields: [...BASE_REQUIRED, "nombrePadre", "nombreMadre"],
    optionalFields: BASE_OPTIONAL.filter(
      (f) => f !== "nombrePadre" && f !== "nombreMadre"
    ),
  },
};

/**
 * Maps authorization slug (from decision tree) to the EX form(s) required.
 * Slugs match those in scripts/chunk-authorizations.ts AUTH_MAP.
 */
export const AUTH_TO_EX: Record<string, ExFormId[]> = {
  // Studies / stays (EX-00)
  estancia_estudis_superiors: ["EX-00"],
  estancia_activitats_formatives: ["EX-00"],
  estancia_mobilitat_alumnes: ["EX-00"],
  estancia_voluntariat: ["EX-00"],
  mobilitat_estudiants_ue: ["EX-00"],
  cerca_feina_emprenedoria: ["EX-00"],
  residencia_practiques: ["EX-04"],
  nacionals_andorrans: ["EX-00"],

  // Non-lucrative residence (EX-01)
  residencia_no_lucrativa: ["EX-01"],
  renovacio_residencia_no_lucrativa: ["EX-01"],

  // Family reunification (EX-02)
  reagrupacio_familiar: ["EX-02"],
  reagrupacio_familiar_mobilitat_ue: ["EX-02"],
  renovacio_reagrupacio_familiar: ["EX-02"],
  residencia_independent_reagrupats: ["EX-02"],

  // Employment - cuenta ajena (EX-03)
  treball_compte_alie_inicial: ["EX-03"],
  treball_compte_alie_renovacio: ["EX-03"],
  treball_temporada: ["EX-06"],
  gestio_colectiva_contractacions: ["EX-06"],
  migracio_estable_gecco: ["EX-06"],
  migracio_circular_gecco: ["EX-06"],
  treball_transfronter_alie: ["EX-03"],
  treball_penats_regim_obert: ["EX-03"],
  contractacio_no_residents_sne: ["EX-03"],

  // Self-employment (EX-07)
  treball_compte_propi_inicial: ["EX-07"],
  treball_compte_propi_renovacio: ["EX-07"],
  treball_transfronter_propi: ["EX-07"],

  // Work exception (EX-09)
  residencia_excepcio_treball: ["EX-09"],

  // Exceptional circumstances - arraigo (EX-10)
  arraigo_segona_oportunitat: ["EX-10"],
  arraigo_social: ["EX-10"],
  arraigo_sociolaboral: ["EX-10"],
  arraigo_socioformatiu: ["EX-10"],
  arraigo_familiar: ["EX-10"],
  residencia_humanitaria: ["EX-10"],
  colaboracio_autoritats_policials: ["EX-10"],
  colaboracio_interes_public: ["EX-10"],
  victima_violencia_genere: ["EX-10"],
  victima_violencia_sexual: ["EX-10"],
  colaboracio_contra_xarxes_admin: ["EX-10"],
  colaboracio_contra_xarxes_policial: ["EX-10"],
  victima_trata: ["EX-10"],
  residencia_retorn_voluntari: ["EX-10"],

  // Long-duration (EX-11)
  residencia_llarga_duracio_nacional: ["EX-11"],
  residencia_llarga_duracio_ue: ["EX-11"],
  llarga_duracio_ue_altre_estat: ["EX-11"],
  llarga_duracio_familiar: ["EX-11"],
  recuperacio_llarga_duracio: ["EX-11"],
  recuperacio_llarga_duracio_ue: ["EX-11"],

  // Family of Spanish national (EX-24)
  residencia_familiar_espanyol: ["EX-24"],
  residencia_independent_familiar_espanyol: ["EX-24"],

  // EU family (EX-19)
  targeta_familiar_ciutada_ue: ["EX-19"],
  targeta_permanent_familiar_ue: ["EX-19"],

  // Minors (EX-25)
  menor_acompanyat_nascut_espanya: ["EX-25"],
  menor_acompanyat_no_nascut_espanya: ["EX-25"],
  desplacament_menor_medic: ["EX-25"],
  desplacament_menor_vacances: ["EX-25"],
  desplacament_menor_escolaritzacio: ["EX-25"],
  menor_no_acompanyat: ["EX-25"],
  renovacio_menor_no_acompanyat_majoria: ["EX-25"],
  menor_excepcional_majoria_edat: ["EX-25"],

  // EU registration (no EX form needed — uses Modelo EX-18 or online)
  certificat_registre_ciutada_ue: [],

  // General (no specific form)
  subjectes_legitimats: [],
  legalitzacio_traduccio_documents: [],
};

/**
 * Get the EX forms required for a given authorization slug.
 * Returns form info objects with required/optional field lists.
 */
export function getFormsForAuth(slug: string): ExFormInfo[] {
  const exIds = AUTH_TO_EX[slug] || [];
  return exIds.map((id) => EX_FORMS[id]).filter(Boolean);
}

// ── Per-auth-slug field rules ────────────────────────────────────────────
//
// Three tiers:
//   required    — always blocking; collection won't close until filled
//   recommended — activated only when the relevant context block is already
//                 present in the collected data (hasFamiliar / hasEmpleador /
//                 hasFormacion). Treated as required once context is detected.
//   optional    — extracted by the tool if the user mentions them, never
//                 explicitly asked and never blocking.

export interface AuthFieldRules {
  required: PersonalDataField[];
  recommended: PersonalDataField[];
  optional: PersonalDataField[];
}

export const AUTH_FIELD_RULES: Partial<Record<string, AuthFieldRules>> = {
  // ── Arraigo segunda oportunidad ──────────────────────────────
  arraigo_segona_oportunitat: {
    required:    ["tipoSolicitud"],
    recommended: [],
    optional:    [],
  },

  // ── Arraigo social ───────────────────────────────────────────
  arraigo_social: {
    required:    ["tipoSolicitud"],
    recommended: [],
    optional:    ["familiar_nombre", "familiar_primerApellido", "familiar_vinculo"],
  },

  // ── Arraigo sociolaboral ─────────────────────────────────────
  arraigo_sociolaboral: {
    required:    ["tipoSolicitud", "empleador_nombre", "empleador_nifNie"],
    recommended: ["empleador_actividad"],   // activated when hasEmpleador
    optional:    ["empleador_localidad", "empleador_provincia", "empleador_telefono"],
  },

  // ── Arraigo socioformativo ───────────────────────────────────
  arraigo_socioformatiu: {
    required:    ["tipoSolicitud", "formacio_entitat", "formacio_nifCif"],
    recommended: ["formacio_tipus", "formacio_modalitat", "formacio_duracio"], // activated when hasFormacion
    optional:    [],
  },

  // ── Arraigo familiar ─────────────────────────────────────────
  arraigo_familiar: {
    required:    ["tipoSolicitud", "familiar_nombre", "familiar_primerApellido", "familiar_vinculo"],
    recommended: ["familiar_sexo", "familiar_estadoCivil"],  // activated when hasFamiliar
    optional:    ["familiar_fechaNacimiento", "familiar_paisNacimiento", "familiar_lugarNacimiento"],
  },

  // ── Razones humanitarias y similares ────────────────────────
  residencia_humanitaria: {
    required:    ["tipoSolicitud"],
    recommended: [],
    optional:    [],
  },
  colaboracio_autoritats_policials: {
    required:    ["tipoSolicitud"],
    recommended: [],
    optional:    [],
  },
  colaboracio_interes_public: {
    required:    ["tipoSolicitud"],
    recommended: [],
    optional:    [],
  },
  victima_violencia_genere: {
    required:    ["tipoSolicitud"],
    recommended: [],
    optional:    [],
  },
  victima_violencia_sexual: {
    required:    ["tipoSolicitud"],
    recommended: [],
    optional:    [],
  },
  colaboracio_contra_xarxes_admin: {
    required:    ["tipoSolicitud"],
    recommended: [],
    optional:    [],
  },
  colaboracio_contra_xarxes_policial: {
    required:    ["tipoSolicitud"],
    recommended: [],
    optional:    [],
  },
  victima_trata: {
    required:    ["tipoSolicitud"],
    recommended: [],
    optional:    [],
  },
  residencia_retorn_voluntari: {
    required:    ["tipoSolicitud"],
    recommended: [],
    optional:    [],
  },
};

// ── Context detection ────────────────────────────────────────────────────

export interface CollectionContext {
  hasFamiliar: boolean;
  hasEmpleador: boolean;
  hasFormacion: boolean;
}

export function detectContext(collected: Partial<Record<string, unknown>>): CollectionContext {
  return {
    hasFamiliar: !!(
      (collected.familiar_nombre as string)?.trim() ||
      (collected.familiar_primerApellido as string)?.trim()
    ),
    hasEmpleador: !!(
      (collected.empleador_nombre as string)?.trim() ||
      (collected.empleador_nifNie as string)?.trim()
    ),
    hasFormacion: !!(
      (collected.formacio_entitat as string)?.trim() ||
      ((collected.formacio_tipus as string[])?.length ?? 0) > 0
    ),
  };
}

/**
 * Returns true if a recommended field should be treated as required
 * given the current collection context.
 */
export function isRecommendedActive(
  field: PersonalDataField,
  ctx: CollectionContext
): boolean {
  if (field.startsWith("familiar_")) return ctx.hasFamiliar;
  if (field.startsWith("empleador_")) return ctx.hasEmpleador;
  if (field.startsWith("formacio_")) return ctx.hasFormacion;
  return false;
}

/**
 * Get all required PersonalData fields across all forms for a set of auth slugs.
 * Pass `collected` to also activate context-sensitive recommended fields.
 */
export function getRequiredFields(
  slugs: string[],
  collected?: Partial<Record<string, unknown>>
): Set<PersonalDataField> {
  const fields = new Set<PersonalDataField>();
  const ctx = collected ? detectContext(collected) : null;

  for (const slug of slugs) {
    // Form-level required fields (base, from EX_FORMS)
    for (const form of getFormsForAuth(slug)) {
      for (const f of form.requiredFields) fields.add(f);
    }

    // Auth-slug-specific rules
    const rules = AUTH_FIELD_RULES[slug];
    if (!rules) continue;

    // Always add required
    for (const f of rules.required) fields.add(f);

    // Add recommended only when context is present
    if (ctx) {
      for (const f of rules.recommended) {
        if (isRecommendedActive(f, ctx)) fields.add(f);
      }
    }
    // optional: never added to required set
  }

  return fields;
}
