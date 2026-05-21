"use client";

import { useState, useEffect } from "react";
import type { Lang } from "@/lib/i18n";
import { t, labels } from "@/lib/i18n";
import { EMERGENCY_RESOURCES } from "@/lib/sos";

/**
 * Floating SOS button for authenticated pages outside of /chat.
 *
 * Rationale: the chat already has its own keyword-triggered SOS overlay
 * (with recording, police screen, etc.). On the rest of the app — dashboard,
 * case detail, documents — there is no equivalent. This component gives any
 * authenticated user a one-tap way to surface the core emergency numbers
 * (112, anti-trafficking, etc.) without leaving the page.
 *
 * Intentionally simpler than the chat overlay: no recording, no police-screen
 * deception, no GPS. Just the dialed numbers and a brief description.
 */
export default function SosButton({ lang }: { lang: Lang }) {
  const [open, setOpen] = useState(false);

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
