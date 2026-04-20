"use client";

import type { Lang, I18nText } from "@/lib/i18n";
import { t, labels } from "@/lib/i18n";

export default function ConsentModal({
  lang,
  onAccept,
  onDecline,
}: {
  lang: Lang;
  onAccept: () => void;
  onDecline: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div
        className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 animate-fade-in"
        role="dialog"
        aria-modal="true"
        aria-labelledby="consent-title"
      >
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
          <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
          </svg>
        </div>

        <h2 id="consent-title" className="text-lg font-bold text-text mb-2">
          {t(labels.consentTitle, lang)}
        </h2>

        <p className="text-sm text-text-muted mb-3 leading-relaxed">
          {t(labels.consentBody, lang)}
        </p>

        <p className="text-xs text-text-muted mb-5">
          {t(labels.consentResponsible, lang)}
        </p>

        <div className="flex gap-3">
          <button
            onClick={onDecline}
            className="flex-1 px-4 py-2.5 text-sm font-medium text-text-muted bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
          >
            {t(labels.consentDecline, lang)}
          </button>
          <button
            onClick={onAccept}
            className="flex-1 px-4 py-2.5 text-sm font-semibold text-white bg-primary rounded-xl hover:bg-primary-dark transition-colors"
          >
            {t(labels.consentAccept, lang)}
          </button>
        </div>
      </div>
    </div>
  );
}
