import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { createAuthServerClient } from "@/lib/supabase-server";
import type { Lang } from "@/lib/i18n";
import { t, labels } from "@/lib/i18n";
import {
  type ConversationRow,
  summarizeConversation,
} from "@/app/dashboard/lib/dashboard-data";
import { computeMissingFields } from "@/lib/collection-engine";
import { buildDocumentGroups } from "@/app/documents/lib/build-document-list";
import UserMenu from "@/app/dashboard/components/UserMenu";
import DashboardLangSelector from "@/app/dashboard/components/DashboardLangSelector";

import CaseHeader from "./components/CaseHeader";
import ProgressCard from "./components/ProgressCard";
import PersonalDataPanel from "./components/PersonalDataPanel";
import DocumentsPanel from "./components/DocumentsPanel";
import PathTimeline from "./components/PathTimeline";
import ResourcesPanel from "./components/ResourcesPanel";
import DeleteCaseButton from "./components/DeleteCaseButton";
import {
  resourcesForSituation,
  situationFromAuthSlug,
} from "./lib/case-helpers";

interface CasePageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ lang?: string }>;
}

export default async function CaseDetailPage({
  params,
  searchParams,
}: CasePageProps) {
  const [{ id }, sp] = await Promise.all([params, searchParams]);
  const lang = ((sp.lang as Lang) ?? "ca") as Lang;

  const supabase = await createAuthServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/auth?returnTo=/cases/${id}&lang=${lang}`);
  }

  // Auth client + RLS (auth.uid() = user_id) ensures we can only read our own.
  // Schema doesn't expose updated_at yet — fall back to created_at via summary helpers.
  const { data: row, error } = await supabase
    .from("conversations")
    .select(
      "id, language, auth_slugs, collected_data, chat_sub_phase, consent_given, created_at"
    )
    .eq("id", id)
    .single();

  if (error || !row) {
    notFound();
  }

  const conv = row as ConversationRow;
  const process = summarizeConversation(conv);
  const collected = (conv.collected_data ?? {}) as Record<string, unknown>;

  // Tree path: stored as `_tree_path` inside collected_data (meta-field).
  // Falls back to empty array if the chat backend hasn't persisted it yet.
  const treePathRaw = (collected._tree_path ?? collected.__tree_path) as
    | string[]
    | undefined;
  const treePath = Array.isArray(treePathRaw) ? treePathRaw : [];

  // Missing field keys for the ProgressCard
  const missingFieldKeys = computeMissingFields(
    conv.auth_slugs ?? [],
    collected
  );

  // Documents for this single conversation
  const groups = buildDocumentGroups([conv], lang);
  const documents = groups[0]?.documents ?? [];

  // Resources by situation
  const situation = situationFromAuthSlug(process.authSlug);
  const resources = resourcesForSituation(situation);

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
        <CaseHeader process={process} lang={lang} />

        <ProgressCard
          process={process}
          missingFieldKeys={missingFieldKeys}
          lang={lang}
        />

        <PersonalDataPanel
          conversationId={conv.id}
          data={collected}
          lang={lang}
        />

        <DocumentsPanel documents={documents} lang={lang} />

        <PathTimeline
          path={treePath}
          resultLabel={process.authLabel}
          lang={lang}
        />

        <ResourcesPanel resources={resources} lang={lang} />

        <DeleteCaseButton conversationId={conv.id} lang={lang} />
      </main>
    </div>
  );
}
