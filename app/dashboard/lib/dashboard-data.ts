/**
 * Dashboard data helpers.
 *
 * Builds the props for the dashboard cards from the rows pulled out of the
 * `conversations` table. Stays free of UI concerns — pure functions only.
 */

import type { PersonalData } from "@/lib/types/personal-data";
import { computeCompletionPct, computeMissingFields } from "@/lib/collection-engine";
import { getRequiredFields } from "@/lib/form-config";

/** Raw row shape we pull from Supabase */
export interface ConversationRow {
  id: string;
  language: string | null;
  auth_slugs: string[] | null;
  collected_data: Partial<PersonalData> | null;
  chat_sub_phase: string | null;
  consent_given: boolean | null;
  created_at: string;
  updated_at: string | null;
}

export type ProcessStatus = "active" | "paused" | "completed";

export interface ProcessSummary {
  id: string;
  authSlug: string | null;
  authLabel: string;
  status: ProcessStatus;
  completionPct: number;
  collectedCount: number;
  totalRequired: number;
  updatedAt: string;
  createdAt: string;
}

const SLUG_LABELS: Record<string, string> = {
  arraigo_social: "Arraigo social",
  arraigo_sociolaboral: "Arraigo sociolaboral",
  arraigo_socioformatiu: "Arraigo socioformativo",
  arraigo_familiar: "Arraigo familiar",
  arraigo_segona_oportunitat: "Arraigo de segunda oportunidad",
  residencia_familiar_espanyol: "Residencia de familiar de español",
  menor_no_acompanyat: "Menor no acompañado (art. 174)",
  menor_excepcional_majoria_edat: "Menor — vía excepcional",
  treball_compte_alie_renovacio: "Renovación trabajo cuenta ajena",
  treball_compte_propi_renovacio: "Renovación trabajo cuenta propia",
  renovacio_residencia_no_lucrativa: "Renovación no lucrativa",
  residencia_llarga_duracio_nacional: "Residencia larga duración",
  certificat_registre_ciutada_ue: "Certificado de registro UE",
  targeta_familiar_ciutada_ue: "Tarjeta familiar de ciudadano UE",
  victima_violencia_genere: "Víctima violencia de género",
  victima_violencia_sexual: "Víctima violencia sexual",
  victima_trata: "Víctima de trata",
  residencia_humanitaria: "Residencia humanitaria",
};

export function humanizeSlug(slug: string | null | undefined): string {
  if (!slug) return "Procés";
  return SLUG_LABELS[slug] ?? slug.replace(/_/g, " ");
}

export function statusFromConversation(c: ConversationRow): ProcessStatus {
  const phase = c.chat_sub_phase ?? "conversa";
  if (phase === "enviament") return "completed";

  // "Paused" if there's been no update in the last 7 days and we're still
  // collecting. Otherwise consider it active.
  const last = new Date(c.updated_at ?? c.created_at).getTime();
  const sevenDays = 1000 * 60 * 60 * 24 * 7;
  if (Date.now() - last > sevenDays && phase === "conversa") return "paused";
  return "active";
}

export function summarizeConversation(c: ConversationRow): ProcessSummary {
  const slugs = c.auth_slugs ?? [];
  const collected = (c.collected_data ?? {}) as Partial<PersonalData>;
  const required = getRequiredFields(slugs, collected);
  const totalRequired = required.size;

  const collectedCount = totalRequired - computeMissingFields(slugs, collected).length;
  const completionPct = computeCompletionPct(slugs, collected);
  const authSlug = slugs[0] ?? null;

  return {
    id: c.id,
    authSlug,
    authLabel: humanizeSlug(authSlug),
    status: statusFromConversation(c),
    completionPct,
    collectedCount,
    totalRequired,
    updatedAt: c.updated_at ?? c.created_at,
    createdAt: c.created_at,
  };
}

/**
 * Count documents the user already obtained across all conversations.
 * Reads from collected_data.documents_obtained (string[] JSONB field).
 */
export function countDocumentsObtained(rows: ConversationRow[]): number {
  let total = 0;
  for (const r of rows) {
    const docs = (r.collected_data as { documents_obtained?: unknown } | null)
      ?.documents_obtained;
    if (Array.isArray(docs)) total += docs.length;
  }
  return total;
}

/**
 * "fa 2 dies", "fa 1 setmana", "fa 5 minuts" — minimal i18n via switch on lang.
 * For now Catalan + Spanish supported; falls back to es.
 */
export function relativeTime(iso: string, lang: string): string {
  const t = (key: string, count: number) => {
    const map: Record<string, Record<string, string>> = {
      now: { ca: "ara mateix", es: "ahora mismo", en: "just now", fr: "à l'instant", ar: "الآن" },
      minutes: {
        ca: `fa ${count} ${count === 1 ? "minut" : "minuts"}`,
        es: `hace ${count} ${count === 1 ? "minuto" : "minutos"}`,
        en: `${count} ${count === 1 ? "minute" : "minutes"} ago`,
        fr: `il y a ${count} ${count === 1 ? "minute" : "minutes"}`,
        ar: `قبل ${count} ${count === 1 ? "دقيقة" : "دقائق"}`,
      },
      hours: {
        ca: `fa ${count} ${count === 1 ? "hora" : "hores"}`,
        es: `hace ${count} ${count === 1 ? "hora" : "horas"}`,
        en: `${count} ${count === 1 ? "hour" : "hours"} ago`,
        fr: `il y a ${count} ${count === 1 ? "heure" : "heures"}`,
        ar: `قبل ${count} ${count === 1 ? "ساعة" : "ساعات"}`,
      },
      days: {
        ca: `fa ${count} ${count === 1 ? "dia" : "dies"}`,
        es: `hace ${count} ${count === 1 ? "día" : "días"}`,
        en: `${count} ${count === 1 ? "day" : "days"} ago`,
        fr: `il y a ${count} ${count === 1 ? "jour" : "jours"}`,
        ar: `قبل ${count} ${count === 1 ? "يوم" : "أيام"}`,
      },
      weeks: {
        ca: `fa ${count} ${count === 1 ? "setmana" : "setmanes"}`,
        es: `hace ${count} ${count === 1 ? "semana" : "semanas"}`,
        en: `${count} ${count === 1 ? "week" : "weeks"} ago`,
        fr: `il y a ${count} ${count === 1 ? "semaine" : "semaines"}`,
        ar: `قبل ${count} ${count === 1 ? "أسبوع" : "أسابيع"}`,
      },
    };
    return map[key]?.[lang] ?? map[key]?.es ?? key;
  };

  const diff = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diff / (1000 * 60));
  if (minutes < 1) return t("now", 0);
  if (minutes < 60) return t("minutes", minutes);
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return t("hours", hours);
  const days = Math.floor(hours / 24);
  if (days < 7) return t("days", days);
  const weeks = Math.floor(days / 7);
  return t("weeks", weeks);
}
