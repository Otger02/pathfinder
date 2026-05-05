import Link from "next/link";
import { redirect } from "next/navigation";
import { createAuthServerClient } from "@/lib/supabase-server";
import type { Lang } from "@/lib/i18n";
import { t, labels } from "@/lib/i18n";
import {
  type ConversationRow,
  countDocumentsObtained,
  summarizeConversation,
} from "./lib/dashboard-data";
import CurrentProcessCard from "./components/CurrentProcessCard";
import ProcessRow from "./components/ProcessRow";
import QuickStats from "./components/QuickStats";
import UserMenu from "./components/UserMenu";
import DashboardLangSelector from "./components/DashboardLangSelector";

interface DashboardPageProps {
  searchParams: Promise<{ lang?: string }>;
}

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const params = await searchParams;
  const lang = ((params.lang as Lang) ?? "ca") as Lang;

  const supabase = await createAuthServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/auth?returnTo=/dashboard&lang=${lang}`);
  }

  // Pull the user's conversations, latest first.
  const { data: rows } = await supabase
    .from("conversations")
    .select(
      "id, language, auth_slugs, collected_data, chat_sub_phase, consent_given, created_at, updated_at"
    )
    .eq("user_id", user.id)
    .order("updated_at", { ascending: false, nullsFirst: false })
    .limit(20);

  const conversations = (rows ?? []) as ConversationRow[];
  const summaries = conversations.map(summarizeConversation);

  // Current process = the most recent conversation that isn't completed.
  const current =
    summaries.find((s) => s.status !== "completed") ?? summaries[0] ?? null;

  // Recent list = top 5, excluding the "current" one if present.
  const recent = summaries
    .filter((s) => s.id !== current?.id)
    .slice(0, 5);

  const documentsCount = countDocumentsObtained(conversations);
  const userName = user.email?.split("@")[0] ?? "";

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "var(--bg)" }}>
      {/* ── App bar ── */}
      <header className="appbar">
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center shadow-sm"
            style={{ background: "var(--primary)" }}
          >
            <svg
              className="w-5 h-5"
              style={{ color: "var(--on-primary)" }}
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
          <span className="font-semibold" style={{ color: "var(--ink)" }}>
            Pathfinder
          </span>
        </div>

        <DashboardLangSelector lang={lang} />

        <UserMenu email={user.email ?? ""} lang={lang} />
      </header>

      {/* ── Main ── */}
      <main
        className="flex-1 mx-auto w-full max-w-2xl px-4 sm:px-6 py-8 space-y-6"
        dir={lang === "ar" ? "rtl" : "ltr"}
      >
        {/* Greeting */}
        <div>
          <h1 className="h-display">
            {t(labels.greeting, lang)}
            {userName ? `, ${userName}` : ""} 👋
          </h1>
          <p className="body mt-1">
            {current
              ? `${t(labels.yourProcess, lang)} ${current.authLabel}`
              : t(labels.dashboardSubtitleEmpty, lang)}
          </p>
        </div>

        {/* Current process */}
        <CurrentProcessCard process={current} lang={lang} />

        {/* Quick stats */}
        <QuickStats
          documentsGenerated={documentsCount}
          upcomingDeadlines={0}
          lang={lang}
        />

        {/* Recent processes */}
        {recent.length > 0 && (
          <section>
            <div className="div-label mb-2">{t(labels.recentProcesses, lang)}</div>
            <div
              className="card flat overflow-hidden"
              style={{ padding: 0 }}
            >
              {recent.map((p) => (
                <ProcessRow key={p.id} process={p} lang={lang} />
              ))}
            </div>
          </section>
        )}

        {/* New process CTA */}
        <Link
          href={`/chat?lang=${lang}`}
          className="btn btn-tonal btn-block"
        >
          + {t(labels.newProcess, lang)}
        </Link>

        {/* Urgent help banner */}
        <div
          className="card"
          style={{
            background: "var(--danger-soft)",
            borderColor: "var(--danger)",
            borderInlineStartWidth: 4,
          }}
        >
          <div className="flex items-start gap-3">
            <span
              className="row-icon"
              aria-hidden="true"
              style={{
                background: "var(--danger)",
                color: "white",
                flexShrink: 0,
              }}
            >
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
                  d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.732 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
                />
              </svg>
            </span>
            <div className="flex-1">
              <h3 className="font-semibold mb-1" style={{ color: "var(--danger-2)" }}>
                {t(labels.urgentHelpTitle, lang)}
              </h3>
              <p className="text-sm mb-3" style={{ color: "var(--ink-2)" }}>
                {t(labels.urgentHelpDescription, lang)}
              </p>
              <div className="flex flex-wrap gap-2">
                <a href="tel:112" className="btn btn-sm btn-danger">
                  📞 112
                </a>
                <a href="tel:016" className="btn btn-sm btn-danger">
                  📞 016
                </a>
                <a href="tel:+34915980535" className="btn btn-sm btn-ghost">
                  CEAR
                </a>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
