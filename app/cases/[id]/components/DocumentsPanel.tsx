"use client";

import type { Lang } from "@/lib/i18n";
import { t, labels } from "@/lib/i18n";
import type { DocumentItem } from "@/app/documents/lib/build-document-list";
import DocumentRow from "@/app/documents/components/DocumentRow";

export default function DocumentsPanel({
  documents,
  lang,
}: {
  documents: DocumentItem[];
  lang: Lang;
}) {
  return (
    <section>
      <div className="div-label mb-2">
        {t(labels.documentsTitle, lang)} ({documents.length})
      </div>
      <div className="card flat overflow-hidden" style={{ padding: 0 }}>
        {documents.length === 0 ? (
          <div
            className="px-4 py-5 text-sm"
            style={{ color: "var(--ink-3)" }}
          >
            {t(labels.noDocumentsInGroup, lang)}
          </div>
        ) : (
          documents.map((d) => <DocumentRow key={d.id} doc={d} lang={lang} />)
        )}
      </div>
    </section>
  );
}
