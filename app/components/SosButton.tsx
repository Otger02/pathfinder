"use client";

import { useState, useEffect } from "react";
import type { Lang } from "@/lib/i18n";
import { t, labels } from "@/lib/i18n";
import { EMERGENCY_RESOURCES } from "@/lib/sos";
import { useSosRecording } from "@/lib/use-sos-recording";

/**
 * Floating SOS button for authenticated pages outside of /chat.
 *
 * Rationale: the chat has its own keyword-triggered SOS overlay. On the rest
 * of the app — dashboard, case detail, documents — there was no equivalent.
 * This component gives any authenticated user a one-tap way to surface the
 * core emergency numbers (112, anti-trafficking, etc.) AND, in case of
 * imminent danger, start the same evidence recording as the chat overlay
 * (write-ahead to the device + streamed to our server).
 */
function formatTime(secs: number): string {
  const m = Math.floor(secs / 60).toString().padStart(2, "0");
  const s = (secs % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

export default function SosButton({ lang }: { lang: Lang }) {
  const [open, setOpen] = useState(false);
  const rec = useSosRecording();

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={t(labels.sosButtonAriaLabel, lang)}
        title={t(labels.sosButtonAriaLabel, lang)}
        className="fixed z-40 rounded-full shadow-lg font-bold text-sm transition-transform active:scale-95"
        style={{
          right: 20,
          bottom: 20,
          width: 60,
          height: 60,
          background: "var(--danger, #dc2626)",
          color: "#fff",
          border: "3px solid #fff",
        }}
      >
        {t(labels.sosButton, lang)}
      </button>

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="sos-dialog-title"
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-3"
          style={{ background: "rgba(0,0,0,0.55)" }}
          onClick={() => setOpen(false)}
        >
          <div
            className="card flat w-full max-w-md max-h-[85vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
            style={{ background: "var(--surface-alt)" }}
          >
            <div className="flex justify-between items-start mb-3 gap-3">
              <h2
                id="sos-dialog-title"
                className="text-lg font-bold"
                style={{ color: "var(--danger-2, #b91c1c)" }}
              >
                {t(labels.sosButton, lang)} —{" "}
                {lang === "ca"
                  ? "Recursos d'emergència"
                  : lang === "es"
                  ? "Recursos de emergencia"
                  : lang === "fr"
                  ? "Ressources d'urgence"
                  : lang === "ar"
                  ? "موارد الطوارئ"
                  : "Emergency resources"}
              </h2>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close"
                className="text-xl leading-none"
                style={{
                  color: "var(--ink-3)",
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  padding: 4,
                }}
              >
                ✕
              </button>
            </div>

            {/* Imminent-danger trigger — opens camera/mic and uploads to our server */}
            {rec.isRecording ? (
              <div className="mb-3 px-3 py-2 rounded-lg flex items-center gap-3 text-sm text-white" style={{ background: "var(--danger, #dc2626)" }}>
                <span className="w-3 h-3 bg-white rounded-full animate-pulse flex-shrink-0" />
                <span className="font-semibold">{t(labels.recordingActive, lang)}</span>
                <span className="font-mono">{formatTime(rec.elapsed)}</span>
                <span className="text-white/70 text-xs">
                  {rec.chunksUploaded} {t(labels.chunksUploaded, lang)}
                  {rec.audioOnly ? " (audio)" : ""}
                </span>
                <button
                  type="button"
                  onClick={() => rec.stopRecording()}
                  className="ml-auto px-3 py-1 bg-white/20 hover:bg-white/30 rounded text-xs font-medium transition-colors"
                >
                  {t(labels.stopRecording, lang)}
                </button>
              </div>
            ) : (
              <div className="mb-3">
                <button
                  type="button"
                  onClick={() => rec.startRecording()}
                  disabled={rec.starting}
                  className="w-full px-4 py-4 text-lg font-extrabold text-white rounded-xl flex items-center justify-center gap-3 transition-colors shadow-lg disabled:opacity-70 disabled:cursor-wait animate-[pulse_2s_ease-in-out_infinite]"
                  style={{ background: "#b71c1c" }}
                >
                  {rec.starting ? (
                    <span className="w-5 h-5 border-[3px] border-white/40 border-t-white rounded-full animate-spin flex-shrink-0" />
                  ) : (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className="flex-shrink-0">
                      <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                      <line x1="12" y1="9" x2="12" y2="13" />
                      <line x1="12" y1="17" x2="12.01" y2="17" />
                    </svg>
                  )}
                  <span className="leading-tight">
                    {rec.starting ? t(labels.recordingStarting, lang) : t(labels.dangerNow, lang)}
                  </span>
                </button>
                <p className="text-xs mt-2 px-1 text-center" style={{ color: "var(--ink-3)" }}>
                  {t(labels.dangerNowSub, lang)}
                </p>
                {rec.error && (
                  <div className="mt-2 px-3 py-2 rounded-lg text-sm leading-relaxed" style={{ background: "#fef2f2", border: "1px solid #fecaca", color: "#991b1b" }}>
                    {t(labels.recordingCannotStart, lang)}
                  </div>
                )}
              </div>
            )}

            <ul className="space-y-2">
              {EMERGENCY_RESOURCES.slice(0, 6).map((r, idx) => {
                const nom = r.nom[lang as "es" | "en" | "ar" | "fr" | "ca"] || r.nom.es;
                const desc =
                  r.descripcio[lang as "es" | "en" | "ar" | "fr" | "ca"] ||
                  r.descripcio.es;
                return (
                  <li
                    key={idx}
                    className="card flat"
                    style={{ background: "var(--surface)", padding: 10 }}
                  >
                    <div className="flex justify-between items-center gap-2">
                      <span
                        className="font-semibold text-sm flex-1 min-w-0"
                        style={{ color: "var(--ink)" }}
                      >
                        {nom}
                      </span>
                      <a
                        href={`tel:${r.telefon.replace(/\s/g, "")}`}
                        className="text-base font-bold shrink-0"
                        style={{ color: "var(--danger-2, #b91c1c)" }}
                      >
                        {r.telefon}
                      </a>
                    </div>
                    <p
                      className="text-xs mt-1"
                      style={{ color: "var(--ink-3)" }}
                    >
                      {desc}
                    </p>
                    <p
                      className="text-[11px] mt-1"
                      style={{ color: "var(--ink-3)" }}
                    >
                      {r.disponibilitat}
                    </p>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      )}
    </>
  );
}
