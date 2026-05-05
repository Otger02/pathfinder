import type { Lang } from "@/lib/i18n";
import { t, labels } from "@/lib/i18n";
import type { ProcessSummary } from "@/app/dashboard/lib/dashboard-data";
import { relativeTime } from "@/app/dashboard/lib/dashboard-data";

export default function CaseHeader({
  process,
  lang,
}: {
  process: ProcessSummary;
  lang: Lang;
}) {
  const startedLabel = `${t(labels.caseStartedAgo, lang)} ${relativeTime(
    process.createdAt,
    lang
  )}`;
  const updatedLabel = `${t(labels.lastActivityAgo, lang)} ${relativeTime(
    process.updatedAt,
    lang
  )}`;

  return (
    <div className="flex items-start justify-between gap-3 flex-wrap">
      <div className="min-w-0">
        <h1 className="h-display flex items-center gap-3 flex-wrap">
          <span>{process.authLabel}</span>
          <span
            className={`chip ${
              process.status === "active"
                ? "success"
                : process.status === "paused"
                ? "warn"
                : "info"
            }`}
            style={{ fontSize: 12 }}
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
        </h1>
        <p className="body mt-1">
          {startedLabel} · {updatedLabel}
        </p>
      </div>
    </div>
  );
}
