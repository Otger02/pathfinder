import { getDocsForAuth } from "@/lib/doc-config";
import type { DocWhoObtains } from "@/lib/doc-registry";
import type { Lang } from "@/lib/i18n";
import { t, labels } from "@/lib/i18n";

function WhoObtainsBadge({ who, lang }: { who: DocWhoObtains; lang: Lang }) {
  const labelKey =
    who === "employer" ? labels.whoObtainsEmployer
    : who === "authority" ? labels.whoObtainsAuthority
    : who === "training_entity" ? labels.whoObtainsTraining
    : labels.whoObtainsApplicant;

  const colorClass =
    who === "employer" ? "bg-amber-50 text-amber-700 border-amber-200"
    : who === "authority" ? "bg-blue-50 text-blue-700 border-blue-200"
    : who === "training_entity" ? "bg-purple-50 text-purple-700 border-purple-200"
    : "bg-primary/5 text-primary border-primary/20";

  return (
    <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium border ${colorClass}`}>
      {t(labelKey, lang)}
    </span>
  );
}

export default function DocChecklistCard({
  authSlugs,
  documentsObtained,
  lang,
  onToggle,
}: {
  authSlugs: string[];
  documentsObtained: string[];
  lang: Lang;
  onToggle?: (slug: string, obtained: boolean) => void;
}) {
  const allDocs = getDocsForAuth(authSlugs);
  const obtainedSet = new Set(documentsObtained);
  const obtained = allDocs.filter((d) => obtainedSet.has(d.slug));
  const pending = allDocs.filter((d) => !obtainedSet.has(d.slug));

  // Use Catalan names when lang is "ca", otherwise Spanish
  const docName = (d: ReturnType<typeof getDocsForAuth>[number]) =>
    lang === "ca" ? d.nameCa : d.nameEs;

  return (
    <div className="flex justify-start mb-3">
      <div className="max-w-[85%] w-full px-4 py-4 bg-white border border-border-light ltr:border-l-4 rtl:border-r-4 border-l-primary border-r-primary rounded-2xl rounded-bl-sm rtl:rounded-bl-2xl rtl:rounded-br-sm shadow-sm">
        <h3 className="text-base font-bold text-text mb-3">
          {t(labels.docChecklistTitle, lang)}
        </h3>

        {/* Obtained documents */}
        {obtained.length > 0 && (
          <div className="mb-3">
            <p className="text-xs font-semibold text-success uppercase tracking-wide mb-1.5">
              {t(labels.docChecklistObtained, lang)} ({obtained.length})
            </p>
            <div className="space-y-1.5">
              {obtained.map((doc) => (
                <label
                  key={doc.slug}
                  className="flex items-start gap-2.5 cursor-pointer group"
                >
                  <input
                    type="checkbox"
                    checked
                    onChange={() => onToggle?.(doc.slug, false)}
                    className="mt-0.5 h-4 w-4 rounded border-border-light text-primary accent-primary shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <span className="text-sm text-text line-through opacity-60">
                      {docName(doc)}
                    </span>
                  </div>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Pending documents */}
        {pending.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-text-muted uppercase tracking-wide mb-1.5">
              {t(labels.docChecklistPending, lang)} ({pending.length})
            </p>
            <div className="space-y-2">
              {pending.map((doc) => (
                <label
                  key={doc.slug}
                  className="flex items-start gap-2.5 cursor-pointer group"
                >
                  <input
                    type="checkbox"
                    checked={false}
                    onChange={() => onToggle?.(doc.slug, true)}
                    className="mt-0.5 h-4 w-4 rounded border-border-light text-primary accent-primary shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-1.5 mb-0.5">
                      <span className="text-sm font-medium text-text">
                        {docName(doc)}
                      </span>
                      <WhoObtainsBadge who={doc.whoObtains} lang={lang} />
                    </div>
                    {doc.validity && (
                      <p className="text-[11px] text-text-muted">{doc.validity}</p>
                    )}
                  </div>
                </label>
              ))}
            </div>
          </div>
        )}

        {pending.length === 0 && allDocs.length > 0 && (
          <div className="flex items-center gap-2 text-sm text-success font-medium mt-1">
            <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {lang === "ca" ? "Tots els documents confirmats!" : "¡Todos los documentos confirmados!"}
          </div>
        )}
      </div>
    </div>
  );
}
