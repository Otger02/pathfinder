/**
 * Deterministic decision engine for conversational data collection.
 *
 * Zero LLM calls — pure functions that compute:
 * - Which fields are still missing
 * - Whether to transition phases
 * - How to merge extracted data
 * - Completion percentage
 */

import type { PersonalData, PersonalDataField } from "./types/personal-data";
import { getRequiredFields } from "./form-config";

/**
 * Compute the list of fields still missing for the given authorization slugs.
 */
export function computeMissingFields(
  authSlugs: string[],
  collected: Partial<PersonalData>
): PersonalDataField[] {
  const required = getRequiredFields(authSlugs);
  const missing: PersonalDataField[] = [];
  for (const field of required) {
    const value = collected[field];
    if (!value || (typeof value === "string" && value.trim() === "")) {
      missing.push(field);
    }
  }
  return missing;
}

/**
 * Returns true when all required fields for the auth slugs are filled.
 */
export function shouldTransitionToResum(
  authSlugs: string[],
  collected: Partial<PersonalData>
): boolean {
  return computeMissingFields(authSlugs, collected).length === 0;
}

/**
 * Merge newly extracted data into existing collected data.
 * Does NOT overwrite existing values with empty strings.
 */
export function mergeExtractedData(
  existing: Partial<PersonalData>,
  extracted: Partial<PersonalData>
): Partial<PersonalData> {
  const merged = { ...existing };
  for (const [key, value] of Object.entries(extracted)) {
    if (value && typeof value === "string" && value.trim() !== "") {
      merged[key as PersonalDataField] = value.trim() as never;
    }
  }
  return merged;
}

/**
 * Compute completion percentage (0–100) for the required fields.
 */
export function computeCompletionPct(
  authSlugs: string[],
  collected: Partial<PersonalData>
): number {
  const required = getRequiredFields(authSlugs);
  if (required.size === 0) return 100;

  let filled = 0;
  for (const field of required) {
    const value = collected[field];
    if (value && typeof value === "string" && value.trim() !== "") {
      filled++;
    }
  }
  return Math.round((filled / required.size) * 100);
}
