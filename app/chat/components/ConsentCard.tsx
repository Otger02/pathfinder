import type { Lang } from "@/lib/i18n";
import { t, labels } from "@/lib/i18n";

export default function ConsentCard({
  lang,
  onAccept,
  onDecline,
  accepted,
}: {
  lang: Lang;
  onAccept: () => void;
  onDecline: () => void;
  accepted?: boolean;
}) {
  return (
    <div className="flex justify-start mb-3">
      <div className="max-w-[85%] px-4 py-4 bg-white border border-border-light ltr:border-l-4 rtl:border-r-4 border-l-primary border-r-primary rounded-2xl rounded-bl-sm rtl:rounded-bl-2xl rtl:rounded-br-sm shadow-sm">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-3">
          <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
          </svg>
        </div>

        <h3 className="text-lg font-bold text-text mb-2">
          {t(labels.consentTitle, lang)}
        </h3>

        <p className="text-sm text-text-muted mb-3 leading-relaxed">
          {t(labels.consentBody, lang)}
        </p>

        <p className="text-xs text-text-muted mb-4">
          {t(labels.consentResponsible, lang)}
        </p>

        {accepted ? (
          <div className="flex items-center gap-2 text-sm text-primary font-medium">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {t(labels.consentAccepted, lang)}
          </div>
        ) : (
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
        )}
      </div>
    </div>
  );
}
