"use client";

import { useState } from "react";
import type { Lang } from "@/lib/i18n";
import { t, labels } from "@/lib/i18n";

export default function EmailDraftCard({
  to,
  toName,
  subject,
  body,
  mailtoUrl,
  lang,
}: {
  to: string;
  toName: string;
  subject: string;
  body: string;
  mailtoUrl: string;
  lang: Lang;
}) {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    navigator.clipboard.writeText(body).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <div className="flex justify-start mb-3">
      <div className="max-w-[85%] px-4 py-4 bg-white border border-border-light ltr:border-l-4 rtl:border-r-4 border-l-accent border-r-accent rounded-2xl rounded-bl-sm rtl:rounded-bl-2xl rtl:rounded-br-sm shadow-sm">
        <h3 className="text-lg font-bold text-text mb-3">
          {t(labels.emailDraftTitle, lang)}
        </h3>

        <div className="space-y-2 mb-3 text-sm">
          <div>
            <span className="text-text-muted">{t(labels.emailTo, lang)}: </span>
            <span className="font-medium text-text">{toName}</span>
            <span className="text-text-muted text-xs ltr:ml-1 rtl:mr-1">&lt;{to}&gt;</span>
          </div>
          <div>
            <span className="text-text-muted">{t(labels.emailSubject, lang)}: </span>
            <span className="font-medium text-text">{subject}</span>
          </div>
        </div>

        <div className="p-3 bg-surface-alt rounded-lg text-sm whitespace-pre-wrap max-h-48 overflow-y-auto mb-3 text-text">
          {body}
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => window.open(mailtoUrl, "_blank")}
            className="flex-1 px-4 py-2.5 text-sm font-semibold text-white bg-primary rounded-xl hover:bg-primary-dark transition-colors"
          >
            {t(labels.openInEmail, lang)}
          </button>
          <button
            onClick={handleCopy}
            className="flex-1 px-4 py-2.5 text-sm font-medium text-primary border border-primary rounded-xl hover:bg-primary/10 transition-colors"
          >
            {copied ? t(labels.textCopied, lang) : t(labels.copyText, lang)}
          </button>
        </div>

        <p className="text-xs text-text-muted mt-3">
          {t(labels.emailDisclaimer, lang)}
        </p>
      </div>
    </div>
  );
}
