"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createBrowserSupabase } from "@/lib/supabase-browser";

// ── Mapping idioma del navegador → codi intern (fallback) ──────────
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

function detectLangFromBrowser(): string {
  if (typeof navigator === "undefined") return "es";
  const nav = navigator.language?.split("-")[0]?.toLowerCase() ?? "es";
  return LANG_MAP[nav] ?? "es";
}

// ── Detecció per veu: keywords → codi ──────────────────────────────
// "fr-*" indica llengües sense suport directe que mappegen a francès.
const LANGUAGE_KEYWORDS: Record<string, string[]> = {
  es: ["español", "espanol", "castellano"],
  ca: ["català", "catala"],
  en: ["english", "inglés", "ingles", "anglès", "angles"],
  fr: ["français", "francais", "francés", "frances", "french"],
  ar: ["عربية", "العربية", "arabic", "árabe", "arabe", "arabi"],
  pt: ["português", "portugues", "portuguese"],
  sw: ["kiswahili", "swahili"],
  ur: ["اردو", "urdu"],
  // Llengües africanes → fallback francès
  "fr-wo": ["wolof", "ouolof"],
  "fr-mn": ["mandinka", "mandinga", "mandingue"],
  "fr-pu": ["pular", "pulaar", "fula", "fulani", "peul"],
  "fr-so": ["soninké", "soninke", "soninkée"],
};

function normalize(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .trim();
}

function detectLanguageFromTranscript(transcript: string): string | null {
  const normalized = normalize(transcript);
  for (const [code, keywords] of Object.entries(LANGUAGE_KEYWORDS)) {
    for (const keyword of keywords) {
      if (normalized.includes(normalize(keyword))) {
        return code.startsWith("fr-") ? "fr" : code;
      }
    }
  }
  return null;
}

// ── Web Speech API typings (vendor-prefixed, sense globals) ────────
interface SpeechRecognitionResult {
  transcript: string;
}
interface SpeechRecognitionResultList {
  [index: number]: SpeechRecognitionResult[] & {
    length: number;
    item: (i: number) => SpeechRecognitionResult;
  };
  length: number;
  isFinal?: boolean;
}
interface SpeechRecognitionEvent {
  results: SpeechRecognitionResultList;
}
interface SpeechRecognitionInstance {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  maxAlternatives: number;
  onresult: ((e: SpeechRecognitionEvent) => void) | null;
  onend: (() => void) | null;
  onerror: (() => void) | null;
  start: () => void;
  stop: () => void;
}
type SpeechRecognitionCtor = new () => SpeechRecognitionInstance;

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

// Llista d'idiomes amb endonims que es mostra durant l'escolta i a la
// targeta de feedback. L'usuari ha de dir un d'aquests noms.
const LANGUAGE_DISPLAY_NAMES = [
  "Español",
  "Català",
  "English",
  "Français",
  "العربية",
  "Português",
  "Kiswahili",
  "اردو",
  "Wolof",
  "Mandinka",
  "Pular",
  "Soninké",
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

const LISTEN_PROMPTS = [
  { text: "Di tu idioma", rtl: false },
  { text: "Digues el teu idioma", rtl: false },
  { text: "Say your language", rtl: false },
  { text: "Dis ta langue", rtl: false },
  { text: "قل لغتك", rtl: true },
];

// ── Page ──────────────────────────────────────────────────────────
export default function OnboardingPage() {
  const router = useRouter();
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const langGridRef = useRef<HTMLDivElement | null>(null);

  const [isListening, setIsListening] = useState(false);
  const [notUnderstood, setNotUnderstood] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastTranscript, setLastTranscript] = useState<string | null>(null);
  const [authChecking, setAuthChecking] = useState(true);

  // If the user is already authenticated, send them to /dashboard.
  // Anonymous visitors continue to see the landing.
  useEffect(() => {
    let cancelled = false;
    const supabase = createBrowserSupabase();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (cancelled) return;
      if (user) {
        const browserLang = (typeof navigator !== "undefined"
          ? navigator.language?.split("-")[0]?.toLowerCase()
          : "ca") || "ca";
        router.replace(`/dashboard?lang=${browserLang}`);
      } else {
        setAuthChecking(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [router]);

  function goToChat(lang: string) {
    router.push(`/chat?lang=${lang}`);
  }

  function stopRecognition() {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // already stopped
      }
      recognitionRef.current = null;
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }

  function scrollToLangGrid() {
    setTimeout(() => {
      langGridRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 80);
  }

  async function startLanguageDetection() {
    setError(null);
    setNotUnderstood(false);
    setLastTranscript(null);

    if (typeof window === "undefined") return;
    const w = window as unknown as {
      SpeechRecognition?: SpeechRecognitionCtor;
      webkitSpeechRecognition?: SpeechRecognitionCtor;
    };
    const SR = w.SpeechRecognition || w.webkitSpeechRecognition;

    if (!SR) {
      // Fallback: detect from navigator.language and redirect immediately
      setError(
        "El teu navegador no suporta el reconeixement de veu. Tria l'idioma manualment."
      );
      scrollToLangGrid();
      return;
    }

    // Demana permís de micròfon de manera explícita per a millor UX
    // (sinó alguns navegadors fallen silenciosament al recognition.start()).
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach((t) => t.stop());
    } catch {
      setError("No s'ha pogut accedir al micròfon. Tria l'idioma manualment.");
      scrollToLangGrid();
      return;
    }

    const recognition = new SR();
    // Lang base que captura la majoria de paraules llatines i cyril·les;
    // l'àrab i urdú també arriben prou bé per al match per keyword.
    recognition.lang = "es-ES";
    recognition.interimResults = false;
    recognition.continuous = false;
    recognition.maxAlternatives = 5;

    recognition.onresult = (event) => {
      const firstResult = event.results[0] as unknown as Array<{
        transcript: string;
      }>;
      const alternatives: string[] = [];
      const len =
        (firstResult as unknown as { length?: number }).length ??
        firstResult.length ??
        0;
      for (let i = 0; i < len; i++) {
        const alt = firstResult[i]?.transcript;
        if (alt) alternatives.push(alt);
      }

      // Prova totes les alternatives
      for (const alt of alternatives) {
        const detected = detectLanguageFromTranscript(alt);
        if (detected) {
          setLastTranscript(alt);
          stopRecognition();
          // Petit delay per a feedback visual abans de redirigir
          setTimeout(() => goToChat(detected), 250);
          return;
        }
      }

      // Cap match: mostra missatge i scroll als botons
      setLastTranscript(alternatives[0] ?? null);
      setNotUnderstood(true);
      setIsListening(false);
      stopRecognition();
      scrollToLangGrid();
    };

    recognition.onerror = () => {
      setIsListening(false);
      stopRecognition();
    };

    recognition.onend = () => {
      // Si onresult no ha disparat un match (`isListening` segueix true),
      // mostrem el fallback "no entès".
      setIsListening((prev) => {
        if (prev) {
          setNotUnderstood(true);
          scrollToLangGrid();
        }
        return false;
      });
    };

    recognitionRef.current = recognition;
    setIsListening(true);

    try {
      recognition.start();
    } catch {
      setIsListening(false);
      setError(
        "No s'ha pogut iniciar el reconeixement de veu. Tria l'idioma manualment."
      );
      scrollToLangGrid();
      return;
    }

    // Timeout de seguretat — 8 segons màxim
    timeoutRef.current = setTimeout(() => {
      stopRecognition();
    }, 8000);
  }

  function cancelListening() {
    stopRecognition();
    setIsListening(false);
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopRecognition();
    };
  }, []);

  // Si l'usuari clica "Toca per parlar" sense haver fet servir el navegador,
  // detect from navigator.language i redirigeix (mantenim aquesta opció com a
  // fallback ràpid si SpeechRecognition no està disponible).
  void detectLangFromBrowser; // referenciat per evitar dead-code en el futur

  // While we wait for the auth check we render an empty surface to avoid
  // flashing the landing page when the user is going to be redirected to
  // /dashboard anyway.
  if (authChecking) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: "var(--bg)" }}
      />
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-surface relative">
      {/* ── Header amb logo ── */}
      <header className="px-4 sm:px-8 py-5 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
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
        </div>

        {/* Login button — shown only to anonymous visitors (auth check
            in the useEffect above redirects authenticated users to /dashboard
            before this header even renders). */}
        <a href="/auth?returnTo=/dashboard" className="btn btn-tonal btn-pill">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l3 3m0 0l-3 3m3-3H2.25" />
          </svg>
          Iniciar sessió
        </a>
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
          onClick={startLanguageDetection}
          disabled={isListening}
          aria-label="Toca per parlar"
          className={`relative w-32 h-32 sm:w-40 sm:h-40 rounded-full flex items-center justify-center shadow-lg transition-all disabled:cursor-wait ${
            isListening
              ? "bg-primary-dark scale-95"
              : "bg-primary hover:bg-primary-dark hover:scale-105"
          }`}
        >
          {isListening && (
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
          {isListening ? "Escoltant..." : TAP_HINT}
        </p>

        {/* Not-understood card (shown after a failed detection) */}
        {notUnderstood && (
          <div className="mt-5 max-w-md mx-auto px-4 py-3 bg-warning-bg border border-accent-light rounded-xl text-warning-text text-sm leading-relaxed">
            <p className="font-semibold mb-1">No t&apos;hem entès.</p>
            {lastTranscript && (
              <p className="text-xs italic opacity-80 mb-1">
                Vam sentir: &ldquo;{lastTranscript}&rdquo;
              </p>
            )}
            <p>Tria amb el dit a baix ↓</p>
          </div>
        )}

        {error && (
          <p className="mt-3 text-sm text-danger max-w-md leading-relaxed">
            {error}
          </p>
        )}

        {/* ── Manual language grid ── */}
        <div ref={langGridRef} className="mt-12 w-full max-w-2xl scroll-mt-8">
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
            Llengües d&apos;Àfrica occidental (en francès)
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

      {/* ── Listening overlay ─────────────────────────────────────── */}
      {isListening && (
        <div
          className="fixed inset-0 z-[100] bg-text/80 backdrop-blur-sm flex items-center justify-center px-4 animate-fade-in"
          role="dialog"
          aria-modal="true"
          aria-label="Detectant idioma"
        >
          <div className="w-full max-w-lg bg-surface rounded-3xl p-6 sm:p-8 shadow-2xl text-center relative">
            {/* Cancel button */}
            <button
              onClick={cancelListening}
              aria-label="Cancel·lar"
              className="absolute top-3 right-3 w-9 h-9 rounded-full text-text-muted hover:text-text hover:bg-surface-alt transition-colors flex items-center justify-center text-xl"
            >
              ✕
            </button>

            {/* Animated mic */}
            <div className="relative mx-auto w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-primary flex items-center justify-center shadow-lg mb-5">
              <span className="absolute inset-0 rounded-full bg-primary opacity-50 animate-ping" />
              <span className="absolute inset-2 rounded-full bg-primary opacity-30 animate-pulse" />
              <svg
                className="w-12 h-12 sm:w-14 sm:h-14 text-white relative z-10"
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
            </div>

            {/* Multi-language prompt */}
            <h2 className="text-2xl sm:text-3xl font-bold text-text mb-3">
              Di tu idioma
            </h2>
            <div className="flex flex-wrap justify-center items-baseline gap-x-3 gap-y-1 text-sm text-text-muted mb-5">
              {LISTEN_PROMPTS.slice(1).map((p, i) => (
                <span
                  key={i}
                  dir={p.rtl ? "rtl" : "ltr"}
                  className={p.rtl ? "font-arabic" : ""}
                >
                  {p.text}
                </span>
              ))}
            </div>

            {/* Language names list — endonyms */}
            <div className="border-t border-border-light pt-4">
              <p className="text-xs uppercase tracking-wider text-text-faint mb-2">
                Idiomes possibles
              </p>
              <div className="flex flex-wrap justify-center items-baseline gap-x-2 gap-y-1.5 text-base">
                {LANGUAGE_DISPLAY_NAMES.map((name, i) => {
                  const isArabic = /[؀-ۿ]/.test(name);
                  return (
                    <span key={name} className="flex items-baseline">
                      <span
                        dir={isArabic ? "rtl" : "ltr"}
                        className={`font-medium text-text ${
                          isArabic ? "font-arabic" : ""
                        }`}
                      >
                        {name}
                      </span>
                      {i < LANGUAGE_DISPLAY_NAMES.length - 1 && (
                        <span className="text-text-faint mx-1">·</span>
                      )}
                    </span>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
