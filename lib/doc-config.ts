/**
 * doc-config.ts
 *
 * Maps authorization slugs to the document slugs required for each.
 * Slugs are shared across auth types — `empadronament_2_anys` is the same
 * document regardless of which authorization process uses it.
 */

import { DOC_REGISTRY, type DocDefinition } from "./doc-registry";

// ── Base document sets ──────────────────────────────────────────────────────

const BASE_ARRAIGO_DOCS = [
  "passaport_vigent",
  "antecedents_penals_espanya",
  "antecedents_penals_origen",
  "model_790",
  "foto_carnet",
];

const BASE_ARRAIGO_2_ANYS = [...BASE_ARRAIGO_DOCS.slice(0, 1), "empadronament_2_anys", ...BASE_ARRAIGO_DOCS.slice(1)];
const BASE_ARRAIGO_3_ANYS = [...BASE_ARRAIGO_DOCS.slice(0, 1), "empadronament_3_anys", ...BASE_ARRAIGO_DOCS.slice(1)];

// ── Auth slug → document slug list ─────────────────────────────────────────

export const AUTH_TO_DOCS: Record<string, string[]> = {
  // ── Arraigo types (EX-10) ────────────────────────────────────────────────
  arraigo_sociolaboral: [
    "passaport_vigent",
    "empadronament_2_anys",
    "antecedents_penals_espanya",
    "antecedents_penals_origen",
    "contracte_treball",
    "vida_laboral_empleador",
    "model_790",
    "foto_carnet",
  ],

  arraigo_social: [
    "passaport_vigent",
    "empadronament_3_anys",
    "antecedents_penals_espanya",
    "antecedents_penals_origen",
    "informe_arraigo_social",
    "model_790",
    "foto_carnet",
  ],

  arraigo_familiar: [
    "passaport_vigent",
    "empadronament_2_anys",
    "antecedents_penals_espanya",
    "antecedents_penals_origen",
    "documentacio_vincle_familiar",
    "model_790",
    "foto_carnet",
  ],

  arraigo_socioformatiu: [
    "passaport_vigent",
    "empadronament_2_anys",
    "antecedents_penals_espanya",
    "antecedents_penals_origen",
    "matricula_curs",
    "model_790",
    "foto_carnet",
  ],

  arraigo_segona_oportunitat: [
    "passaport_vigent",
    "empadronament_2_anys",
    "antecedents_penals_espanya",
    "antecedents_penals_origen",
    "resolucio_denegacio",
    "model_790",
    "foto_carnet",
  ],

  // ── Humanitarian / special circumstances (EX-10) ─────────────────────────
  residencia_humanitaria:            BASE_ARRAIGO_DOCS,
  colaboracio_autoritats_policials:  BASE_ARRAIGO_DOCS,
  colaboracio_interes_public:        BASE_ARRAIGO_DOCS,
  victima_violencia_genere:          BASE_ARRAIGO_DOCS,
  victima_violencia_sexual:          BASE_ARRAIGO_DOCS,
  colaboracio_contra_xarxes_admin:   BASE_ARRAIGO_DOCS,
  colaboracio_contra_xarxes_policial: BASE_ARRAIGO_DOCS,
  victima_trata:                     BASE_ARRAIGO_DOCS,
  residencia_retorn_voluntari:       BASE_ARRAIGO_DOCS,

  // ── Non-lucrative residence (EX-01) ─────────────────────────────────────
  residencia_no_lucrativa: [
    "passaport_vigent",
    "antecedents_penals_origen",
    "model_790",
    "foto_carnet",
  ],
  renovacio_residencia_no_lucrativa: [
    "passaport_vigent",
    "antecedents_penals_origen",
    "model_790",
    "foto_carnet",
  ],

  // ── Family reunification (EX-02) ────────────────────────────────────────
  reagrupacio_familiar: [
    "passaport_vigent",
    "documentacio_vincle_familiar",
    "model_790",
    "foto_carnet",
  ],
  renovacio_reagrupacio_familiar: [
    "passaport_vigent",
    "documentacio_vincle_familiar",
    "model_790",
    "foto_carnet",
  ],
  reagrupacio_familiar_mobilitat_ue: [
    "passaport_vigent",
    "documentacio_vincle_familiar",
    "model_790",
    "foto_carnet",
  ],
  residencia_independent_reagrupats: [
    "passaport_vigent",
    "antecedents_penals_espanya",
    "antecedents_penals_origen",
    "model_790",
    "foto_carnet",
  ],

  // ── Employment cuenta ajena (EX-03) ─────────────────────────────────────
  treball_compte_alie_inicial: [
    "passaport_vigent",
    "antecedents_penals_origen",
    "contracte_treball",
    "model_790",
    "foto_carnet",
  ],
  treball_compte_alie_renovacio: [
    "passaport_vigent",
    "antecedents_penals_espanya",
    "antecedents_penals_origen",
    "contracte_treball",
    "model_790",
    "foto_carnet",
  ],

  // ── Seasonal work (EX-06) ────────────────────────────────────────────────
  treball_temporada: [
    "passaport_vigent",
    "contracte_treball",
    "model_790",
    "foto_carnet",
  ],

  // ── Self-employment (EX-07) ──────────────────────────────────────────────
  treball_compte_propi_inicial: [
    "passaport_vigent",
    "antecedents_penals_origen",
    "model_790",
    "foto_carnet",
  ],
  treball_compte_propi_renovacio: [
    "passaport_vigent",
    "antecedents_penals_espanya",
    "antecedents_penals_origen",
    "model_790",
    "foto_carnet",
  ],

  // ── Long-duration (EX-11) ────────────────────────────────────────────────
  residencia_llarga_duracio_nacional: [
    "passaport_vigent",
    "antecedents_penals_espanya",
    "antecedents_penals_origen",
    "model_790",
    "foto_carnet",
  ],
  residencia_llarga_duracio_ue: [
    "passaport_vigent",
    "antecedents_penals_espanya",
    "antecedents_penals_origen",
    "model_790",
    "foto_carnet",
  ],

  // ── Studies / stays (EX-00) ──────────────────────────────────────────────
  estancia_estudis_superiors: [
    "passaport_vigent",
    "antecedents_penals_origen",
    "model_790",
    "foto_carnet",
  ],
  residencia_practiques: [
    "passaport_vigent",
    "antecedents_penals_origen",
    "model_790",
    "foto_carnet",
  ],
};

// ── Helper functions ────────────────────────────────────────────────────────

/**
 * Get all unique DocDefinition objects required for a set of auth slugs.
 * Slugs not found in AUTH_TO_DOCS return an empty list.
 */
export function getDocsForAuth(slugs: string[]): DocDefinition[] {
  const seen = new Set<string>();
  const result: DocDefinition[] = [];

  for (const slug of slugs) {
    const docSlugs = AUTH_TO_DOCS[slug] ?? [];
    for (const docSlug of docSlugs) {
      if (!seen.has(docSlug)) {
        seen.add(docSlug);
        const def = DOC_REGISTRY[docSlug];
        if (def) result.push(def);
      }
    }
  }

  return result;
}

/**
 * Return docs that are required but not yet obtained.
 */
export function getMissingDocs(slugs: string[], obtained: string[]): DocDefinition[] {
  const obtainedSet = new Set(obtained);
  return getDocsForAuth(slugs).filter((doc) => !obtainedSet.has(doc.slug));
}
