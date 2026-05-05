import Link from "next/link";
import { redirect } from "next/navigation";
import { createAuthServerClient } from "@/lib/supabase-server";
import type { Lang } from "@/lib/i18n";
import { t, labels } from "@/lib/i18n";
import type { ConversationRow } from "@/app/dashboard/lib/dashboard-data";
import UserMenu from "@/app/dashboard/components/UserMenu";
import DashboardLangSelector from "@/app/dashboard/components/DashboardLangSelector";
import { buildDocumentGroups } from "./lib/build-document-list";
import DocumentsView from "./components/DocumentsView";

interface DocumentsPageProps {
  searchParams: Promise<{ lang?: string }>;
}

export default async function DocumentsPage({ searchParams }: DocumentsPageProps) {
  const params = await searchParams;
  const lang = ((params.lang as Lang) ?? "ca") as Lang;

  const supabase = await createAuthServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/auth?returnTo=/documents&lang=${lang}`);
  }

  // Pull conversations the user can produce documents from: those with
  // at least one auth_slug. Without an auth_slug we have no form to fill
  // and no summary to render.
  const { data: rows } = await supabase
    .from("conversations")
    .select(
      "id, language, auth_slugs, collected_data, chat_sub_phase, consent_given, created_at, updated_at"
    )
    .eq("user_id", user.id)
    .not("auth_slugs", "is", null)
    .order("updated_at", { ascending: false, nullsFirst: false })
    .limit(50);

  const conversations = (rows ?? []) as ConversationRow[];
  const groups = buildDocumentGroups(conversations, lang);

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "var(--bg)" }}>
      {/* ── App bar ── */}
      <header className="appbar">
        <div className="flex items-center gap-3">
          <Link
            href={`/dashboard?lang=${lang}`}
            className="icon-btn"
            aria-label={t(labels.backToDashboard, lang)}
            title={t(labels.backToDashboard, lang)}
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </Link>

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
        <div>
          <h1 className="h-display">{t(labels.vaultTitle, lang)}</h1>
          <p className="body mt-1">{t(labels.vaultSubtitle, lang)}</p>
        </div>

        <DocumentsView groups={groups} lang={lang} />
      </main>
    </div>
  );
}
