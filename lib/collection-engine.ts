/**
 * Deterministic decision engine for conversational data collection.
 *
 * Zero LLM calls — pure functions that compute:
 * - Which fields are still missing
 * - Whether to transition phases
 * - How to merge extracted data
 * - Completion percentage
 *
 * Context-aware: recommended fields (e.g. empleador_actividad) are only
 * treated as required when the relevant data block has already been started
 * (hasFamiliar / hasEmpleador / hasFormacion).
 */

import type { PersonalData, PersonalDataField } from "./types/personal-data";
import { getRequiredFields } from "./form-config";

// ── Field value helpers ───────────────────────────────────────────────────

function isFilled(value: unknown): boolean {
  if (value === undefined || value === null) return false;
  if (typeof value === "boolean") return true;          // false is a valid answer
  if (Array.isArray(value)) return value.length > 0;
  if (typeof value === "string") return value.trim() !== "";
  return false;
}

// ── Public API ────────────────────────────────────────────────────────────

/**
 * Compute the list of fields still missing for the given authorization slugs.
 * Passes collected data so context-sensitive recommended fields are included
 * once their block has been started (hasFamiliar / hasEmpleador / hasFormacion).
 */
export function computeMissingFields(
  authSlugs: string[],
  collected: Partial<PersonalData>
): PersonalDataField[] {
  const required = getRequiredFields(authSlugs, collected);
  const missing: PersonalDataField[] = [];
  for (const field of required) {
    if (!isFilled(collected[field])) missing.push(field);
  }
  return missing;
}

/**
 * Returns true when all required (+ active recommended) fields are filled.
 */
export function shouldTransitionToResum(
  authSlugs: string[],
  collected: Partial<PersonalData>
): boolean {
  return computeMissingFields(authSlugs, collected).length === 0;
}

/**
 * Merge newly extracted data into existing collected data.
 * Handles strings, booleans, and arrays.
 * Does NOT overwrite existing non-empty values with empty ones.
 */
export function mergeExtractedData(
  existing: Partial<PersonalData>,
  extracted: Partial<PersonalData>
): Partial<PersonalData> {
  const merged = { ...existing };
  for (const [key, value] of Object.entries(extracted)) {
    if (value === undefined || value === null) continue;
    if (typeof value === "boolean") {
      merged[key as PersonalDataField] = value as never;
    } else if (Array.isArray(value)) {
      if (value.length > 0) merged[key as PersonalDataField] = value as never;
    } else if (typeof value === "string" && value.trim() !== "") {
      merged[key as PersonalDataField] = value.trim() as never;
    }
  }
  return merged;
}

/**
 * Compute completion percentage (0–100) for required + active recommended fields.
 */
export function computeCompletionPct(
  authSlugs: string[],
  collected: Partial<PersonalData>
): number {
  const required = getRequiredFields(authSlugs, collected);
  if (required.size === 0) return 100;

  let filled = 0;
  for (const field of required) {
    if (isFilled(collected[field])) filled++;
  }
  return Math.round((filled / required.size) * 100);
}
