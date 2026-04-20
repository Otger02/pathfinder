"use client";

import { useState } from "react";
import Link from "next/link";
import type { Lang } from "@/lib/i18n";
import { t, labels } from "@/lib/i18n";
import LanguageSelector from "./chat/components/LanguageSelector";

const features = {
  guide: {
    es: "Te guiamos paso a paso para entender tus opciones legales",
    en: "We guide you step by step to understand your legal options",
    ar: "نرشدك خطوة بخطوة لفهم خياراتك القانونية",
    fr: "Nous te guidons pas à pas pour comprendre tes options légales",
  },
  languages: {
    es: "Disponible en español, inglés, árabe y francés",
    en: "Available in Spanish, English, Arabic and French",
    ar: "متوفر بالإسبانية والإنجليزية والعربية والفرنسية",
    fr: "Disponible en espagnol, anglais, arabe et français",
  },
  emergency: {
    es: "Acceso inmediato a recursos de emergencia si lo necesitas",
    en: "Immediate access to emergency resources if you need them",
    ar: "وصول فوري لموارد الطوارئ عند الحاجة",
    fr: "Accès immédiat aux ressources d'urgence si besoin",
  },
};

export default function HomePage() {
  const [lang, setLang] = useState<Lang>("es");

  return (
    <div
      dir={lang === "ar" ? "rtl" : "ltr"}
      className={`min-h-screen flex flex-col ${lang === "ar" ? "font-arabic" : "font-sans"}`}
    >
      {/* ── Top bar ── */}
      <header className="flex justify-between items-center px-4 sm:px-8 py-4">
        <span className="text-sm font-medium text-text-muted">
          Fundació Tierra Digna
        </span>
        <LanguageSelector lang={lang} onLangChange={setLang} />
      </header>

      {/* ── Hero ── */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 sm:px-8 pb-12">
        {/* Logo mark */}
        <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center mb-6 shadow-md">
          <svg
            className="w-9 h-9 text-white"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.8}
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 6.75V15m6-6v8.25m.503 3.498l4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 00-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0z"
            />
          </svg>
        </div>

        <h1 className="text-4xl sm:text-5xl font-bold text-text tracking-tight text-center">
          Pathfinder
        </h1>

        <p className="text-lg sm:text-xl text-text-muted mt-3 max-w-lg text-center leading-relaxed">
          {t(labels.tagline, lang)}
        </p>

        {/* ── Feature cards ── */}
        <div className="mt-10 w-full max-w-md space-y-3">
          {[
            { icon: "compass", text: features.guide },
            { icon: "globe", text: features.languages },
            { icon: "shield", text: features.emergency },
          ].map((feat, i) => (
            <div
              key={i}
              className="flex items-start gap-3 px-4 py-3 bg-white rounded-xl border border-border-light"
            >
              <div className="mt-0.5 w-8 h-8 rounded-lg bg-primary-light flex items-center justify-center shrink-0">
                {feat.icon === "compass" && (
                  <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75V15m6-6v8.25m.503 3.498l4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 00-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0z" />
                  </svg>
                )}
                {feat.icon === "globe" && (
                  <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
                  </svg>
                )}
                {feat.icon === "shield" && (
                  <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                  </svg>
                )}
              </div>
              <p className="text-sm text-text-muted leading-snug pt-1">
                {t(feat.text, lang)}
              </p>
            </div>
          ))}
        </div>

        {/* ── CTA ── */}
        <Link
          href={`/chat?lang=${lang}`}
          className="mt-10 w-full sm:w-auto px-14 py-4 text-lg font-semibold bg-primary text-white rounded-xl hover:bg-primary-dark transition-colors text-center shadow-sm"
        >
          {t(labels.start, lang)}
        </Link>

        {/* Trust */}
        <div className="flex items-center gap-2 mt-5 text-text-faint">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
          </svg>
          <span className="text-xs">{t(labels.safeConfidential, lang)}</span>
        </div>
      </main>

      {/* ── Emergency footer ── */}
      <footer className="py-4 px-4 border-t border-border-light text-center">
        <div className="flex justify-center items-center gap-3 text-sm">
          <a href="tel:112" className="text-danger font-semibold hover:underline">
            {t(labels.emergencyCall, lang)}
          </a>
          <span className="text-border">|</span>
          <a href="tel:016" className="text-danger font-semibold hover:underline">
            {t(labels.genderViolence, lang)}
          </a>
        </div>
      </footer>
    </div>
  );
}
