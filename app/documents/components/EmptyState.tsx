import Link from "next/link";
import type { Lang } from "@/lib/i18n";
import { t, labels } from "@/lib/i18n";

export default function EmptyState({ lang }: { lang: Lang }) {
  return (
    <div className="card text-center" style={{ padding: 32 }}>
      <div
        className="mx-auto w-14 h-14 rounded-full flex items-center justify-center mb-3"
        style={{ background: "var(--primary-soft)", color: "var(--primary-2)" }}
        aria-hidden="true"
      >
        <svg
          width="22"
          height="22"
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
      </div>
      <h3
        className="text-lg font-semibold mb-2"
        style={{ color: "var(--ink)", fontFamily: "var(--font-serif)" }}
      >
        {t(labels.noDocumentsYet, lang)}
      </h3>
      <p className="body mb-4">{t(labels.noDocumentsDescription, lang)}</p>
      <Link href={`/chat?lang=${lang}`} className="btn btn-tonal">
        {t(labels.startNewProcess, lang)} →
      </Link>
    </div>
  );
}
