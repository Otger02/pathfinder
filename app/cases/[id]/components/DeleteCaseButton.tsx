"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Lang } from "@/lib/i18n";
import { t, labels } from "@/lib/i18n";

export default function DeleteCaseButton({
  conversationId,
  lang,
}: {
  conversationId: string;
  lang: Lang;
}) {
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function handleDelete() {
    if (busy) return;
    setError(null);
    setBusy(true);
    try {
      const resp = await fetch(`/api/cases/${conversationId}`, {
        method: "DELETE",
      });
      if (!resp.ok) {
        const err = await resp.json().catch(() => ({}));
        throw new Error(err.error || `HTTP ${resp.status}`);
      }
      router.push(`/dashboard?lang=${lang}`);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error");
      setBusy(false);
    }
  }

  return (
    <>
      <button
        onClick={() => setConfirming(true)}
        className="btn btn-ghost btn-block"
        style={{ color: "var(--danger)", borderColor: "var(--danger-soft)" }}
      >
        {t(labels.deleteCase, lang)}
      </button>

      {confirming && (
        <div
          className="scrim"
          role="dialog"
          aria-modal="true"
          onClick={() => !busy && setConfirming(false)}
        >
          <div
            className="sheet"
            style={{
              maxWidth: 480,
              margin: "0 auto",
              borderRadius: "var(--radius-xl)",
              alignSelf: "center",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="grabber" />
            <h3
              className="text-lg font-semibold mb-2"
              style={{
                color: "var(--ink)",
                fontFamily: "var(--font-serif)",
              }}
            >
              {t(labels.deleteCase, lang)}
            </h3>
            <p className="body mb-4">{t(labels.deleteCaseConfirm, lang)}</p>

            {error && (
              <p
                className="text-sm mb-3"
                style={{ color: "var(--danger)" }}
                role="alert"
              >
                {error}
              </p>
            )}

            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setConfirming(false)}
                disabled={busy}
                className="btn btn-ghost"
              >
                {t(labels.consentDecline, lang)}
              </button>
              <button
                onClick={handleDelete}
                disabled={busy}
                className="btn btn-danger"
              >
                {busy ? "..." : t(labels.deleteCase, lang)}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
