import Link from "next/link";
import type { Lang } from "@/lib/i18n";
import { t, labels } from "@/lib/i18n";

export default function QuickStats({
  documentsGenerated,
  upcomingDeadlines,
  lang,
}: {
  documentsGenerated: number;
  upcomingDeadlines: number; // 0 for now — placeholder until we wire deadlines
  lang: Lang;
}) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <Link
        href={`/documents?lang=${lang}`}
        className="card flat block hover:shadow-md transition-shadow"
        style={{ textDecoration: "none", color: "inherit" }}
      >
        <div className="flex items-center gap-3">
          <span
            className="row-icon"
            aria-hidden="true"
            style={{ background: "var(--gold-soft)", color: "var(--gold)" }}
          >
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
                d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5A3.375 3.375 0 0010.125 2.25H8.25m4.5 5.25h-9a.75.75 0 00-.75.75v12.75c0 .414.336.75.75.75h12.75a.75.75 0 00.75-.75V11.25z"
              />
            </svg>
          </span>
          <div>
            <div className="text-2xl font-semibold" style={{ color: "var(--ink)" }}>
              {documentsGenerated}
            </div>
            <div className="text-xs" style={{ color: "var(--ink-3)" }}>
              {t(labels.documentsGenerated, lang)}
            </div>
          </div>
        </div>
      </Link>

      <div className="card flat">
        <div className="flex items-center gap-3">
          <span
            className="row-icon"
            aria-hidden="true"
            style={{ background: "var(--info-soft)", color: "var(--info)" }}
          >
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
                d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5"
              />
            </svg>
          </span>
          <div>
            <div className="text-2xl font-semibold" style={{ color: "var(--ink)" }}>
              {upcomingDeadlines === 0 ? "—" : upcomingDeadlines}
            </div>
            <div className="text-xs" style={{ color: "var(--ink-3)" }}>
              {upcomingDeadlines === 0
                ? t(labels.noUpcomingDeadlines, lang)
                : t(labels.upcomingDeadlines, lang)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
