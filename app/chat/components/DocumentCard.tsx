import type { Lang } from "@/lib/i18n";
import { t, labels } from "@/lib/i18n";

export default function DocumentCard({
  documents,
  loading,
  lang,
}: {
  documents: Array<{ name: string; url: string }>;
  loading: boolean;
  lang: Lang;
}) {
  return (
    <div className="flex justify-start mb-3">
      <div className="card accent bubble-card max-w-[85%]">
        {loading ? (
          <div className="flex items-center gap-3">
            <svg className="w-5 h-5 animate-spin text-primary" fill="none" viewBox="0 0 24 24" aria-hidden="true">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <span className="text-sm text-text-muted">
              {t(labels.generatingDocuments, lang)}
            </span>
          </div>
        ) : (
          <>
            <h3 className="text-lg font-bold text-text mb-3">
              {t(labels.documentsReady, lang)}
            </h3>

            <div className="space-y-2">
              {documents.map((doc, i) => (
                <a
                  key={i}
                  href={doc.url}
                  download={doc.name}
                  className="doc group"
                >
                  <div className="thumb">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                    </svg>
                  </div>
                  <span className="flex-1 text-sm font-medium text-text truncate">
                    {doc.name}
                  </span>
                  <span className="chip solid shrink-0 group-hover:bg-primary group-hover:text-on-primary transition-colors">
                    {t(labels.download, lang)}
                  </span>
                </a>
              ))}
            </div>

            <p className="text-xs text-text-muted mt-3">
              {t(labels.pdfDisclaimer, lang)}
            </p>
          </>
        )}
      </div>
    </div>
  );
}
