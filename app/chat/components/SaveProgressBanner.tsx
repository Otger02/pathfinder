"use client";

import type { Lang } from "@/lib/i18n";
import { t, labels } from "@/lib/i18n";

interface Props {
  lang: Lang;
  onDismiss: () => void;
}

export default function SaveProgressBanner({ lang, onDismiss }: Props) {
  const authUrl = `/auth?returnTo=/chat&lang=${lang}`;

  return (
    <div className="mx-4 mb-4 rounded-2xl border border-primary/20 bg-primary/5 p-4 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-text">{t(labels.saveProgressTitle, lang)}</p>
          <p className="mt-0.5 text-xs text-text-muted leading-relaxed">{t(labels.saveProgressBody, lang)}</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <a
            href={authUrl}
            className="px-4 py-2 text-sm font-semibold bg-primary text-white rounded-xl hover:bg-primary-dark transition-colors whitespace-nowrap"
          >
            {t(labels.saveProgressCta, lang)}
          </a>
          <button
            type="button"
            onClick={onDismiss}
            className="text-xs text-text-muted hover:text-text transition-colors whitespace-nowrap"
          >
            {t(labels.saveProgressDismiss, lang)}
          </button>
        </div>
      </div>
    </div>
  );
}
