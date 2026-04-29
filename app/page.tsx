"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

// ── Mapping idioma del navegador → codi intern ─────────────────────
const LANG_MAP: Record<string, string> = {
  es: "es",
  ca: "ca",
  fr: "fr",
  ar: "ar",
  pt: "pt",
  sw: "sw",
  ur: "ur",
  en: "en",
  // Fallbacks: llengües d'Àfrica occidental que el francès cobreix raonablement
  wo: "fr",
  ff: "fr",
  man: "fr",
  snk: "fr",
};

function detectLang(): string {
  if (typeof navigator === "undefined") return "es";
  const nav = navigator.language?.split("-")[0]?.toLowerCase() ?? "es";
  return LANG_MAP[nav] ?? "es";
}

// ── Botons d'idioma ───────────────────────────────────────────────
interface LangButton {
  code: string;
  label: string;
  flag: string;
}

const PRIMARY_LANGS: LangButton[] = [
  { code: "es", label: "Español", flag: "🇪🇸" },
  { code: "ca", label: "Català", flag: "🏴" },
  { code: "fr", label: "Français", flag: "🇫🇷" },
  { code: "ar", label: "العربية", flag: "🇲🇦" },
  { code: "pt", label: "Português", flag: "🇵🇹" },
  { code: "sw", label: "Kiswahili", flag: "🇹🇿" },
  { code: "ur", label: "اردو", flag: "🇵🇰" },
  { code: "en", label: "English", flag: "🇬🇧" },
];

const FR_FALLBACK_LANGS: LangButton[] = [
  { code: "fr", label: "Wolof", flag: "🇸🇳" },
  { code: "fr", label: "Mandinka", flag: "🇬🇲" },
  { code: "fr", label: "Pular", flag: "🇬🇳" },
  { code: "fr", label: "Soninké", flag: "🇲🇱" },
];

// ── Salutacions multi-idioma ──────────────────────────────────────
const GREETINGS: Array<{ text: string; rtl?: boolean }> = [
  { text: "Hola" },
  { text: "Salut" },
  { text: "مرحبا", rtl: true },
];

const SUBTITLES = {
  es: "Te ayudo a encontrar tus papeles",
  ca: "T'ajudo a trobar els teus papers",
  fr: "Je t'aide à trouver tes papiers",
  ar: "أساعدك في العثور على أوراقك",
} as const;

const TAP_HINT = "Habla / Parla / Speak / تحدث";

// ── Page ──────────────────────────────────────────────────────────
export default function OnboardingPage() {
  const router = useRouter();
  const [micActive, setMicActive] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function goToChat(lang: string) {
    router.push(`/chat?lang=${lang}`);
  }

  async function handleMic() {
    setError(null);
    setMicActive(true);

    try {
      // Demana permís de micròfon. Si l'usuari accepta, considerem que ha
      // confirmat la intenció de parlar i el redirigim al xat amb l'idioma
      // detectat del navegador. La transcripció real es fa al xat (que
      // ja té el seu propi flux de gravació SOS).
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach((track) => track.stop());

      const lang = detectLang();
      // Petit delay per a feedback visual del pulse abans de redirigir
      setTimeout(() => goToChat(lang), 350);
    } catch {
      setError("No s'ha pogut accedir al micròfon. Tria l'idioma manualment.");
      setMicActive(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-surface">
      {/* ── Header amb logo ── */}
      <header className="px-4 sm:px-8 py-5 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-md shrink-0">
          <svg
            className="w-6 h-6 text-white"
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
        <div className="flex flex-col">
          <span className="text-lg font-bold text-text leading-none">Pathfinder</span>
          <span className="text-xs text-text-muted">Fundació Tierra Digna</span>
        </div>
      </header>

      {/* ── Hero ── */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 sm:px-8 pb-8 text-center">
        {/* Greetings */}
        <div className="flex items-baseline gap-2 sm:gap-4 flex-wrap justify-center mb-6">
          {GREETINGS.map((g, i) => (
            <span key={i} className="flex items-baseline">
              <span
                dir={g.rtl ? "rtl" : "ltr"}
                className={`text-4xl sm:text-5xl font-bold text-text tracking-tight ${
                  g.rtl ? "font-arabic" : ""
                }`}
              >
                {g.text}
              </span>
              {i < GREETINGS.length - 1 && (
                <span className="text-text-faint text-3xl mx-1 sm:mx-2">·</span>
              )}
            </span>
          ))}
        </div>

        {/* Subtitles */}
        <div className="space-y-1 max-w-md mb-10">
          <p className="text-base text-text-muted">{SUBTITLES.es}</p>
          <p className="text-base text-text-muted">{SUBTITLES.ca}</p>
          <p className="text-base text-text-muted">{SUBTITLES.fr}</p>
          <p className="text-base text-text-muted font-arabic" dir="rtl">
            {SUBTITLES.ar}
          </p>
        </div>

        {/* Big mic button */}
        <button
          onClick={handleMic}
          disabled={micActive}
          aria-label="Toca per parlar"
          className={`relative w-32 h-32 sm:w-40 sm:h-40 rounded-full flex items-center justify-center shadow-lg transition-all disabled:cursor-wait ${
            micActive
              ? "bg-primary-dark scale-95"
              : "bg-primary hover:bg-primary-dark hover:scale-105"
          }`}
        >
          {micActive && (
            <span className="absolute inset-0 rounded-full bg-primary opacity-60 animate-ping" />
          )}
          <svg
            className="w-14 h-14 sm:w-16 sm:h-16 text-white relative z-10"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.8}
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z"
            />
          </svg>
        </button>

        <p className="mt-4 text-sm text-text-muted">
          {micActive ? "Escoltant..." : TAP_HINT}
        </p>

        {error && (
          <p className="mt-3 text-sm text-danger max-w-md leading-relaxed">
            {error}
          </p>
        )}

        {/* ── Manual language grid ── */}
        <div className="mt-12 w-full max-w-2xl">
          <p className="text-xs uppercase tracking-wider text-text-faint mb-3">
            o tria el teu idioma
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {PRIMARY_LANGS.map((l) => (
              <button
                key={l.label}
                onClick={() => goToChat(l.code)}
                className="flex items-center gap-2 px-3 py-3 bg-white border border-border-light rounded-xl hover:border-primary hover:shadow-sm transition-all text-left"
              >
                <span className="text-2xl shrink-0">{l.flag}</span>
                <span className="text-sm font-medium text-text truncate">
                  {l.label}
                </span>
              </button>
            ))}
          </div>

          {/* Group B — fallback fr */}
          <p className="text-xs uppercase tracking-wider text-text-faint mt-6 mb-3">
            Llengües d'Àfrica occidental (en francès)
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {FR_FALLBACK_LANGS.map((l) => (
              <button
                key={l.label}
                onClick={() => goToChat(l.code)}
                className="flex items-center gap-2 px-3 py-3 bg-white border border-border-light rounded-xl hover:border-primary hover:shadow-sm transition-all text-left"
              >
                <span className="text-2xl shrink-0">{l.flag}</span>
                <span className="text-sm font-medium text-text truncate">
                  {l.label}
                </span>
              </button>
            ))}
          </div>
        </div>
      </main>

      {/* ── Emergency footer ── */}
      <footer className="py-4 px-4 border-t border-border-light text-center">
        <div className="flex justify-center items-center gap-3 text-sm">
          <a
            href="tel:112"
            className="text-danger font-semibold hover:underline"
          >
            Emergencias: 112
          </a>
          <span className="text-border">|</span>
          <a
            href="tel:016"
            className="text-danger font-semibold hover:underline"
          >
            Violencia de género: 016
          </a>
        </div>
      </footer>
    </div>
  );
}
