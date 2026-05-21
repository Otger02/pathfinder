"use client";

import { useState, useEffect, FormEvent, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import type { Lang } from "@/lib/i18n";
import { t, labels } from "@/lib/i18n";
import { createBrowserSupabase } from "@/lib/supabase-browser";

function ResetPasswordInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const lang = ((searchParams.get("lang") || "es") as Lang);

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [hasSession, setHasSession] = useState<boolean | null>(null);

  const supabase = createBrowserSupabase();

  useEffect(() => {
    // Supabase parses the recovery token from the URL hash and creates a
    // session automatically. Check if it succeeded.
    supabase.auth.getSession().then(({ data }) => {
      setHasSession(!!data.session);
    });
  }, [supabase]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (password !== confirm) {
      setError(t(labels.authResetMismatch, lang));
      return;
    }
    setLoading(true);
    setError(null);
    const { error: updErr } = await supabase.auth.updateUser({ password });
    if (updErr) {
      setError(t(labels.authError, lang));
      setLoading(false);
      return;
    }
    setSuccess(true);
    setTimeout(() => router.push(`/dashboard?lang=${lang}`), 1500);
  }

  if (hasSession === false) {
    return (
      <div className="mx-auto max-w-md px-6 py-16 text-center">
        <p className="text-sm text-danger mb-6">{t(labels.authResetInvalidLink, lang)}</p>
        <a href={`/auth?lang=${lang}`} className="btn btn-block">
          {t(labels.authResetBackToSignIn, lang)}
        </a>
      </div>
    );
  }

  if (hasSession === null) {
    return <div className="mx-auto max-w-md px-6 py-16 text-center text-sm text-text-muted">…</div>;
  }

  return (
    <div
      dir={lang === "ar" ? "rtl" : "ltr"}
      className={`mx-auto max-w-md px-6 py-12 min-h-screen ${lang === "ar" ? "font-arabic" : "font-sans"}`}
    >
      <div className="flex items-center gap-2.5 mb-10">
        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
          <svg className="w-4.5 h-4.5 text-white" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75V15m6-6v8.25m.503 3.498l4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 00-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0z" />
          </svg>
        </div>
        <span className="text-lg font-bold text-text">Pathfinder</span>
      </div>

      <h1 className="text-2xl font-bold text-text mb-8">{t(labels.authResetNewPasswordTitle, lang)}</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-text mb-1.5">
            {t(labels.authResetNewPasswordLabel, lang)}
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            autoFocus
            className="input"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-text mb-1.5">
            {t(labels.authResetConfirmPasswordLabel, lang)}
          </label>
          <input
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            required
            minLength={6}
            className="input"
          />
        </div>
        {error && <p className="text-sm text-danger">{error}</p>}
        {success && <p className="text-sm text-primary">{t(labels.authResetSuccess, lang)}</p>}
        <button
          type="submit"
          disabled={loading || success || !password || !confirm}
          className="btn btn-block"
        >
          {loading ? "..." : t(labels.authResetSaveBtn, lang)}
        </button>
      </form>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPasswordInner />
    </Suspense>
  );
}
