import Link from "next/link";
import type { Lang } from "@/lib/i18n";
import { t, labels } from "@/lib/i18n";
import type { ProcessSummary } from "../lib/dashboard-data";

export default function CurrentProcessCard({
  process,
  lang,
}: {
  process: ProcessSummary | null;
  lang: Lang;
}) {
  if (!process) {
    // Empty state
    return (
      <div className="card accent">
        <div className="div-label mb-2">{t(labels.currentProcessTitle, lang)}</div>
        <p className="body mb-4">{t(labels.noActiveProcess, lang)}</p>
        <Link href={`/chat?lang=${lang}`} className="btn btn-tonal">
          {t(labels.newProcess, lang)} →
        </Link>
      </div>
    );
  }

  const phaseLabel = (() => {
    if (process.completionPct >= 100) return t(labels.processStatus_completed, lang);
    if (process.completionPct > 0) return t(labels.processStatus_collecting, lang);
    return t(labels.processStatus_starting, lang);
  })();

  return (
    <div className="card accent">
      <div className="flex items-center justify-between mb-3">
        <div className="div-label">{t(labels.currentProcessTitle, lang)}</div>
        <span
          className={`chip ${
            process.status === "active"
              ? "success"
              : process.status === "paused"
              ? "warn"
              : "info"
          }`}
        >
          {t(
            process.status === "active"
              ? labels.processStatus_active
              : process.status === "paused"
              ? labels.processStatus_paused
              : labels.processStatus_completed,
            lang
          )}
        </span>
      </div>

      <h3
        className="text-xl font-semibold mb-1"
        style={{ color: "var(--ink)", fontFamily: "var(--font-serif)" }}
      >
        {process.authLabel}
      </h3>
      <p className="text-sm mb-4" style={{ color: "var(--ink-3)" }}>
        {phaseLabel}
      </p>

      <div className="progress mb-2">
        <div
          className="progress-fill"
          style={{ width: `${process.completionPct}%` }}
        />
      </div>
      <p className="text-sm mb-5" style={{ color: "var(--ink-3)" }}>
        {process.completionPct}% — {process.collectedCount} {t(labels.dashboardOf, lang)}{" "}
        {process.totalRequired} {t(labels.dashboardFieldsNeeded, lang)}
      </p>

      <Link
        href={`/chat?lang=${lang}&resume=${process.id}`}
        className="btn btn-block"
      >
        {t(labels.continueProcess, lang)} →
      </Link>
    </div>
  );
}
