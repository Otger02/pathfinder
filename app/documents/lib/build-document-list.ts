/**
 * Build the per-conversation document list for the vault page.
 * For each conversation we surface:
 *   - one row per EX form attached to the auth_slug (via getFormsForAuth)
 *   - one summary document
 * The actual PDF generation happens server-side on click via
 * /api/documents/regenerate.
 */

import { getFormsForAuth } from "@/lib/form-config";
import {
  type ConversationRow,
  humanizeSlug,
  relativeTime,
  statusFromConversation,
  type ProcessStatus,
} from "@/app/dashboard/lib/dashboard-data";

export type DocumentFormId = string; // "EX-XX" or "summary"

export interface DocumentItem {
  id: string; // unique key for React (conversationId + formId)
  conversationId: string;
  formId: DocumentFormId;
  formName: string;
  description: string;
}

export interface DocumentGroupData {
  conversationId: string;
  authSlug: string | null;
  authLabel: string;
  status: ProcessStatus;
  startedAtIso: string;
  startedAtRelative: string;
  documents: DocumentItem[];
}

export function buildDocumentGroups(
  conversations: ConversationRow[],
  lang: string
): DocumentGroupData[] {
  return conversations.map((c) => {
    const authSlug = c.auth_slugs?.[0] ?? null;
    const docs: DocumentItem[] = [];

    if (authSlug) {
      // EX forms
      for (const form of getFormsForAuth(authSlug)) {
        docs.push({
          id: `${c.id}-${form.id}`,
          conversationId: c.id,
          formId: form.id,
          formName: form.id,
          description: form.name,
        });
      }
      // Summary
      docs.push({
        id: `${c.id}-summary`,
        conversationId: c.id,
        formId: "summary",
        formName: "Resumen",
        description: humanizeSlug(authSlug),
      });
    }

    return {
      conversationId: c.id,
      authSlug,
      authLabel: humanizeSlug(authSlug),
      status: statusFromConversation(c),
      startedAtIso: c.created_at,
      startedAtRelative: relativeTime(c.created_at, lang),
      documents: docs,
    };
  });
}

// ── Filter helpers ────────────────────────────────────────────────

export type SituationFilter =
  | "all"
  | "sense_autoritzacio"
  | "amb_autoritzacio"
  | "ue"
  | "asil";

export type DateFilter = "all" | "week" | "month";

export function situationFromAuthSlug(
  authSlug: string | null
): SituationFilter | null {
  if (!authSlug) return null;
  if (authSlug.startsWith("arraigo_") || authSlug === "menor_no_acompanyat" || authSlug === "menor_excepcional_majoria_edat" || authSlug === "victima_violencia_genere" || authSlug === "victima_violencia_sexual" || authSlug === "victima_trata" || authSlug === "residencia_humanitaria") {
    return "sense_autoritzacio";
  }
  if (authSlug.startsWith("treball_compte") || authSlug.startsWith("renovacio") || authSlug === "residencia_llarga_duracio_nacional") {
    return "amb_autoritzacio";
  }
  if (authSlug === "certificat_registre_ciutada_ue" || authSlug === "targeta_familiar_ciutada_ue" || authSlug === "residencia_familiar_espanyol") {
    return "ue";
  }
  if (authSlug.startsWith("asil")) return "asil";
  return null;
}

export function applyFilters(
  groups: DocumentGroupData[],
  situation: SituationFilter,
  date: DateFilter
): DocumentGroupData[] {
  const now = Date.now();
  const week = 7 * 24 * 60 * 60 * 1000;
  const month = 30 * 24 * 60 * 60 * 1000;

  return groups.filter((g) => {
    if (situation !== "all") {
      const sit = situationFromAuthSlug(g.authSlug);
      if (sit !== situation) return false;
    }
    if (date !== "all") {
      const age = now - new Date(g.startedAtIso).getTime();
      const limit = date === "week" ? week : month;
      if (age > limit) return false;
    }
    return true;
  });
}
