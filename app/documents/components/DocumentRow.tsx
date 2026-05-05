"use client";

import { useState } from "react";
import type { Lang } from "@/lib/i18n";
import { t, labels } from "@/lib/i18n";
import type { DocumentItem } from "../lib/build-document-list";

async function fetchPdf(
  conversationId: string,
  formId: string,
  lang: Lang,
  inline: boolean
): Promise<Blob> {
  const resp = await fetch("/api/documents/regenerate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      conversation_id: conversationId,
      formId,
      lang,
      inline,
    }),
  });
  if (!resp.ok) {
    const err = await resp.json().catch(() => ({}));
    throw new Error(err.error || `HTTP ${resp.status}`);
  }
  return resp.blob();
}

export default function DocumentRow({
  doc,
  lang,
}: {
  doc: DocumentItem;
  lang: Lang;
}) {
  const [busy, setBusy] = useState<"download" | "view" | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleDownload() {
    if (busy) return;
    setError(null);
    setBusy("download");
    try {
      const blob = await fetchPdf(doc.conversationId, doc.formId, lang, false);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${doc.formName}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error");
    } finally {
      setBusy(null);
    }
  }

  async function handleView() {
    if (busy) return;
    setError(null);
    setBusy("view");
    try {
      const blob = await fetchPdf(doc.conversationId, doc.formId, lang, true);
      const url = URL.createObjectURL(blob);
      window.open(url, "_blank", "noopener,noreferrer");
      // The blob URL stays alive while the new tab uses it; cleanup is handled
      // by the browser on tab close. We don't revoke here.
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error");
    } finally {
      setBusy(null);
    }
  }

  // Only EX forms are viewable inline; the summary makes more sense as a download.
  const canView = doc.formId !== "summary";

  return (
    <div className="row" style={{ alignItems: "flex-start" }}>
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
        <div className="row-title">{doc.formName}</div>
        <div className="row-meta">{doc.description}</div>
        {error && (
          <div
            className="text-xs mt-1"
            style={{ color: "var(--danger)" }}
            role="alert"
          >
            {error}
          </div>
        )}
      </div>

      <div className="flex items-center gap-1.5 flex-shrink-0">
        <button
          onClick={handleDownload}
          disabled={!!busy}
          className="btn btn-tonal btn-sm"
          style={{ minHeight: 32 }}
        >
          {busy === "download" ? "..." : t(labels.documentDownload, lang)}
        </button>
        {canView && (
          <button
            onClick={handleView}
            disabled={!!busy}
            className="btn btn-ghost btn-sm"
            style={{ minHeight: 32 }}
          >
            {busy === "view" ? "..." : t(labels.documentView, lang)}
          </button>
        )}
      </div>
    </div>
  );
}
