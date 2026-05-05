import Link from "next/link";
import type { Lang } from "@/lib/i18n";
import { t, labels } from "@/lib/i18n";
import type { ProcessSummary } from "../lib/dashboard-data";
import { relativeTime } from "../lib/dashboard-data";

export default function ProcessRow({
  process,
  lang,
}: {
  process: ProcessSummary;
  lang: Lang;
}) {
  const startedLabel = `${t(labels.startedAgo, lang)} ${relativeTime(
    process.createdAt,
    lang
  )}`;

  return (
    <Link
      href={`/cases/${process.id}?lang=${lang}`}
      className="row"
      aria-label={`${process.authLabel} — ${process.status}`}
    >
      <span className="row-icon" aria-hidden="true">
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.8}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
      </span>
      <div className="row-body">
        <div className="row-title">{process.authLabel}</div>
        <div className="row-meta">{startedLabel}</div>
      </div>
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
      <span className="row-arrow" aria-hidden="true">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </span>
    </Link>
  );
}
