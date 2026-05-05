"use client";

import type { Lang } from "@/lib/i18n";
import { t, labels } from "@/lib/i18n";
import type {
  SituationFilter,
  DateFilter,
} from "../lib/build-document-list";

const SITUATION_LABEL: Record<SituationFilter, string> = {
  all: "all",
  sense_autoritzacio: "Sense papers",
  amb_autoritzacio: "Amb autorització",
  ue: "UE",
  asil: "Asil",
};

export default function Filters({
  situation,
  date,
  onSituationChange,
  onDateChange,
  lang,
}: {
  situation: SituationFilter;
  date: DateFilter;
  onSituationChange: (s: SituationFilter) => void;
  onDateChange: (d: DateFilter) => void;
  lang: Lang;
}) {
  return (
    <div className="card flat" style={{ padding: 12 }}>
      <div className="flex flex-wrap items-center gap-3">
        <span className="div-label">{t(labels.filters, lang)}:</span>

        <label className="flex items-center gap-1 text-sm">
          <span style={{ color: "var(--ink-3)" }}>
            {t(labels.filterSituation, lang)}:
          </span>
          <select
            value={situation}
            onChange={(e) =>
              onSituationChange(e.target.value as SituationFilter)
            }
            className="rounded-md text-sm font-medium px-2 py-1"
            style={{
              background: "var(--surface-2)",
              border: "1px solid var(--line)",
              color: "var(--ink)",
              minHeight: 32,
            }}
          >
            <option value="all">{t(labels.filterAll, lang)}</option>
            <option value="sense_autoritzacio">{SITUATION_LABEL.sense_autoritzacio}</option>
            <option value="amb_autoritzacio">{SITUATION_LABEL.amb_autoritzacio}</option>
            <option value="ue">{SITUATION_LABEL.ue}</option>
            <option value="asil">{SITUATION_LABEL.asil}</option>
          </select>
        </label>

        <label className="flex items-center gap-1 text-sm">
          <span style={{ color: "var(--ink-3)" }}>
            {t(labels.filterByDate, lang)}:
          </span>
          <select
            value={date}
            onChange={(e) => onDateChange(e.target.value as DateFilter)}
            className="rounded-md text-sm font-medium px-2 py-1"
            style={{
              background: "var(--surface-2)",
              border: "1px solid var(--line)",
              color: "var(--ink)",
              minHeight: 32,
            }}
          >
            <option value="all">{t(labels.filterAll, lang)}</option>
            <option value="week">{t(labels.filterDate_week, lang)}</option>
            <option value="month">{t(labels.filterDate_month, lang)}</option>
          </select>
        </label>
      </div>
    </div>
  );
}
