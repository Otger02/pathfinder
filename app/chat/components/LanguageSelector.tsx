"use client";

import { useEffect, useRef, useState } from "react";
import type { Lang } from "@/lib/i18n";

// Endonyms — each language in its own writing. Catalan first by default.
const LANG_ORDER: Lang[] = ["ca", "es", "en", "fr", "ar"];

const LANG_ENDONYMS: Record<Lang, string> = {
  ca: "Català",
  es: "Español",
  en: "English",
  fr: "Français",
  ar: "العربية",
};

const ARABIC = /[؀-ۿ]/;

export default function LanguageSelector({
  lang,
  onLangChange,
}: {
  lang: Lang;
  onLangChange: (l: Lang) => void;
}) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (!wrapperRef.current?.contains(e.target as Node)) setOpen(false);
    }
    if (open) document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [open]);

  // Close on Escape
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    if (open) document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  const currentEndonym = LANG_ENDONYMS[lang];
  const currentIsArabic = ARABIC.test(currentEndonym);

  return (
    <div ref={wrapperRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label="Language selector"
        className="inline-flex items-center gap-1.5 rounded-full text-xs font-medium transition-colors"
        style={{
          minHeight: 28,
          height: 28,
          padding: "0 10px",
          background: "var(--surface)",
          border: "1px solid var(--line)",
          color: "var(--ink)",
          cursor: "pointer",
        }}
      >
        <span
          dir={currentIsArabic ? "rtl" : "ltr"}
          className={currentIsArabic ? "font-arabic" : ""}
        >
          {currentEndonym}
        </span>
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          aria-hidden="true"
          className={`transition-transform ${open ? "rotate-180" : ""}`}
          style={{ color: "var(--ink-3)" }}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div
          role="listbox"
          aria-label="Languages"
          className="absolute end-0 mt-2 w-44 overflow-hidden"
          style={{
            zIndex: 30,
            background: "var(--surface-2)",
            border: "1px solid var(--line)",
            borderRadius: "var(--radius-md)",
            boxShadow: "var(--shadow-lg)",
            padding: 4,
          }}
        >
          {LANG_ORDER.map((l) => {
            const endonym = LANG_ENDONYMS[l];
            const isArabic = ARABIC.test(endonym);
            const active = l === lang;
            return (
              <button
                key={l}
                role="option"
                aria-selected={active}
                onClick={() => {
                  onLangChange(l);
                  setOpen(false);
                }}
                className="w-full flex items-center justify-between px-3 rounded-md transition-colors text-left"
                style={{
                  minHeight: 36,
                  height: 36,
                  background: active ? "var(--primary-soft)" : "transparent",
                  color: active ? "var(--primary-2)" : "var(--ink)",
                  fontWeight: active ? 600 : 500,
                  fontSize: 14,
                  cursor: "pointer",
                }}
                onMouseEnter={(e) => {
                  if (!active) {
                    (e.currentTarget as HTMLButtonElement).style.background =
                      "var(--surface)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!active) {
                    (e.currentTarget as HTMLButtonElement).style.background =
                      "transparent";
                  }
                }}
              >
                <span
                  dir={isArabic ? "rtl" : "ltr"}
                  className={isArabic ? "font-arabic" : ""}
                >
                  {endonym}
                </span>
                {active && (
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2.5}
                    aria-hidden="true"
                    style={{ color: "var(--primary)" }}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
