"use client";

import { useState, FormEvent, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import type { Lang } from "@/lib/i18n";
import { t, labels } from "@/lib/i18n";
import { createBrowserSupabase } from "@/lib/supabase-browser";

type Mode = "magic" | "password";

function AuthPageInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const lang = ((searchParams.get("lang") || "es") as Lang);
  const returnTo = searchParams.get("returnTo") || "/chat";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<Mode>("magic");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const supabase = createBrowserSupabase();

  const callbackUrl = typeof window !== "undefined"
    ? `${window.location.origin}/auth/callback?returnTo=${encodeURIComponent(returnTo)}&lang=${lang}`
    : `/auth/callback?returnTo=${encodeURIComponent(returnTo)}&lang=${lang}`;

  async function handleMagicLink(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: callbackUrl },
    });
    if (error) setError(t(labels.authError, lang));
    else setSent(true);
    setLoading(false);
  }

  async function handlePasswordAuth(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error: signInErr } = await supabase.auth.signInWithPassword({ email, password });

    if (signInErr) {
      // User doesn't exist — try sign up
      const { error: signUpErr } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: callbackUrl },
      });
      if (signUpErr) {
        setError(t(labels.authError, lang));
      } else {
        setSent(true); // verification email sent
      }
    } else {
      router.push(`${returnTo}?lang=${lang}`);
    }
    setLoading(false);
  }

  if (sent) {
    return (
      <div className="mx-auto max-w-md px-6 py-16 text-center">
        <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-primary/10 flex items-center justify-center">
          <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
          </svg>
        </div>
        <h1 className="text-xl font-bold text-text mb-2">{t(labels.authMagicSentTitle, lang)}</h1>
        <p className="text-text-muted text-sm leading-relaxed">{t(labels.authMagicSentText, lang)}</p>
        <p className="mt-4 text-xs text-text-muted opacity-60">{email}</p>
      </div>
    );
  }

  return (
    <div
      dir={lang === "ar" ? "rtl" : "ltr"}
      className={`mx-auto max-w-md px-6 py-12 min-h-screen ${lang === "ar" ? "font-arabic" : "font-sans"}`}
    >
      {/* Logo */}
      <div className="flex items-center gap-2.5 mb-10">
        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
          <svg className="w-4.5 h-4.5 text-white" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75V15m6-6v8.25m.503 3.498l4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 00-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0z" />
          </svg>
        </div>
        <span className="text-lg font-bold text-text">Pathfinder</span>
      </div>

      <h1 className="text-2xl font-bold text-text mb-2">{t(labels.authTitle, lang)}</h1>
      <p className="text-text-muted text-sm mb-8 leading-relaxed">{t(labels.authSubtitle, lang)}</p>

      {/* Magic link form */}
      {mode === "magic" && (
        <form onSubmit={handleMagicLink} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text mb-1.5">
              {t(labels.authEmail, lang)}
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoFocus
              placeholder="nom@exemple.com"
              className="w-full px-4 py-3 text-base bg-white border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
            />
          </div>
          {error && <p className="text-sm text-danger">{error}</p>}
          <button
            type="submit"
            disabled={loading || !email}
            className="w-full px-5 py-3 bg-primary text-white font-semibold rounded-xl hover:bg-primary-dark transition-colors disabled:opacity-50"
          >
            {loading ? "..." : t(labels.authMagicLinkBtn, lang)}
          </button>
        </form>
      )}

      {/* Password form */}
      {mode === "password" && (
        <form onSubmit={handlePasswordAuth} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text mb-1.5">
              {t(labels.authEmail, lang)}
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoFocus
              placeholder="nom@exemple.com"
              className="w-full px-4 py-3 text-base bg-white border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text mb-1.5">
              {t(labels.authPassword, lang)}
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full px-4 py-3 text-base bg-white border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
            />
          </div>
          {error && <p className="text-sm text-danger">{error}</p>}
          <button
            type="submit"
            disabled={loading || !email || !password}
            className="w-full px-5 py-3 bg-primary text-white font-semibold rounded-xl hover:bg-primary-dark transition-colors disabled:opacity-50"
          >
            {loading ? "..." : t(labels.authSignInBtn, lang)}
          </button>
        </form>
      )}

      {/* Mode toggle */}
      <div className="mt-4 text-center">
        <button
          type="button"
          onClick={() => { setMode(mode === "magic" ? "password" : "magic"); setError(null); }}
          className="text-sm text-primary hover:underline"
        >
          {mode === "magic" ? t(labels.authSwitchToPassword, lang) : t(labels.authSwitchToMagic, lang)}
        </button>
      </div>

      {/* Divider + skip */}
      <div className="mt-10 pt-6 border-t border-border-light text-center">
        <a
          href={`${returnTo}?lang=${lang}`}
          className="text-sm text-text-muted hover:text-text transition-colors"
        >
          {t(labels.authSkip, lang)} →
        </a>
      </div>
    </div>
  );
}

export default function AuthPage() {
  return (
    <Suspense>
      <AuthPageInner />
    </Suspense>
  );
}
