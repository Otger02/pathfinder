"use client";

import type { Lang } from "@/lib/i18n";
import { t, labels } from "@/lib/i18n";
import type { DocumentGroupData } from "../lib/build-document-list";
import DocumentRow from "./DocumentRow";

export default function DocumentGroup({
  group,
  lang,
}: {
  group: DocumentGroupData;
  lang: Lang;
}) {
  const startedLabel = `${t(labels.startedAgo, lang)} ${group.startedAtRelative}`;

  return (
    <section>
      <div className="div-label mb-2">
        <span>{group.authLabel.toUpperCase()}</span>
        <span style={{ color: "var(--ink-3)" }}> · {startedLabel}</span>
      </div>

      <div className="card flat overflow-hidden" style={{ padding: 0 }}>
        {group.documents.length === 0 ? (
          <div className="row" style={{ color: "var(--ink-3)" }}>
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
                  d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5A3.375 3.375 0 0010.125 2.25H8.25m4.5 5.25h-9a.75.75 0 00-.75.75v12.75c0 .414.336.75.75.75h12.75a.75.75 0 00.75-.75V11.25z"
                />
              </svg>
            </span>
            <div className="row-body">
              <div className="row-title" style={{ color: "var(--ink-3)" }}>
                {t(labels.noDocumentsInGroup, lang)}
              </div>
            </div>
          </div>
        ) : (
          group.documents.map((d) => (
            <DocumentRow key={d.id} doc={d} lang={lang} />
          ))
        )}
      </div>
    </section>
  );
}
