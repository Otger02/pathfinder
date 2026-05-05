import Link from "next/link";
import type { Lang } from "@/lib/i18n";
import { t, labels } from "@/lib/i18n";
import type { ProcessSummary } from "@/app/dashboard/lib/dashboard-data";
import { fieldLabel } from "../lib/case-helpers";

export default function ProgressCard({
  process,
  missingFieldKeys,
  lang,
}: {
  process: ProcessSummary;
  missingFieldKeys: string[];
  lang: Lang;
}) {
  // Show up to 3 missing fields, render their human-readable labels
  const visibleMissing = missingFieldKeys
    .slice(0, 3)
    .map((k) => fieldLabel(k, lang));

  return (
    <div className="card accent">
      <div className="div-label mb-2">{t(labels.progressTitle, lang)}</div>

      <div className="progress mb-2">
        <div
          className="progress-fill"
          style={{ width: `${process.completionPct}%` }}
        />
      </div>
      <p className="text-sm mb-3" style={{ color: "var(--ink-3)" }}>
        {process.completionPct}% — {process.collectedCount}{" "}
        {t(labels.dashboardOf, lang)} {process.totalRequired}{" "}
        {t(labels.dashboardFieldsNeeded, lang)}
      </p>

      {visibleMissing.length > 0 && (
        <p className="text-sm mb-4" style={{ color: "var(--ink-2)" }}>
          <span className="font-medium">{t(labels.missingFields, lang)}:</span>{" "}
          {visibleMissing.join(", ")}
          {missingFieldKeys.length > 3
            ? ` (+${missingFieldKeys.length - 3})`
            : ""}
        </p>
      )}

      <Link
        href={`/chat?lang=${lang}&resume=${process.id}`}
        className="btn btn-block"
      >
        {t(labels.continueConversation, lang)} →
      </Link>
    </div>
  );
}
