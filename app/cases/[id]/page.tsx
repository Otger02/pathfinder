import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { createAuthServerClient } from "@/lib/supabase-server";
import { createServiceClient } from "@/lib/supabase";
import type { Lang } from "@/lib/i18n";
import { t, labels } from "@/lib/i18n";
import {
  type ConversationRow,
  summarizeConversation,
} from "@/app/dashboard/lib/dashboard-data";
import { computeMissingFields } from "@/lib/collection-engine";
import { buildDocumentGroups } from "@/app/documents/lib/build-document-list";
import { isoForNationality, isoForProvince } from "@/lib/iso-mappings";
import UserMenu from "@/app/dashboard/components/UserMenu";
import DashboardLangSelector from "@/app/dashboard/components/DashboardLangSelector";
import SosButton from "@/app/components/SosButton";

import CaseHeader from "./components/CaseHeader";
import ProgressCard from "./components/ProgressCard";
import PersonalDataPanel from "./components/PersonalDataPanel";
import DocumentsPanel from "./components/DocumentsPanel";
import PathTimeline from "./components/PathTimeline";
import NotesPanel from "./components/NotesPanel";
import ConsulatesPanel from "./components/ConsulatesPanel";
import ProceduralNotesPanel from "./components/ProceduralNotesPanel";
import ResourcesPanel from "./components/ResourcesPanel";
import DeleteCaseButton from "./components/DeleteCaseButton";
import {
  resourcesForSituation,
  situationFromAuthSlug,
} from "./lib/case-helpers";

// Severity ordering: blockers first, then workarounds, warnings, info.
const SEVERITY_ORDER = ["blocker", "workaround", "warning", "info"] as const;

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

  // ── Resource-layer queries (best-effort, never block render) ──
  // Both panels return null when their query yields zero rows, so if the
  // tables haven't been seeded yet the UI just doesn't show those sections.
  const nationalityIso = isoForNationality(
    typeof collected.nacionalidad === "string"
      ? collected.nacionalidad
      : null
  );
  const provinceIso = isoForProvince(
    typeof collected.provincia === "string" ? collected.provincia : null
  );

  // Use a service client for the public, read-only lookups (RLS already
  // grants public SELECT; this just skips an extra auth roundtrip).
  let missions: Awaited<ReturnType<typeof fetchMissions>> = [];
  let proceduralNotes: Awaited<ReturnType<typeof fetchProceduralNotes>> = [];
  try {
    const svc = createServiceClient();
    missions = nationalityIso ? await fetchMissions(svc, nationalityIso) : [];
    proceduralNotes = await fetchProceduralNotes(
      svc,
      process.authSlug ?? null,
      provinceIso
    );
  } catch (err) {
    // Tables may not exist yet (migration 008 not applied) — degrade silently.
    // NB: `process` is shadowed by the local ProcessSummary variable above,
    // so reach for the Node global through `globalThis`.
    const nodeEnv = (globalThis as { process?: { env?: { NODE_ENV?: string } } })
      .process?.env?.NODE_ENV;
    if (nodeEnv !== "production") {
      console.warn(
        "[case] resource-layer fetch failed:",
        err instanceof Error ? err.message : "unknown"
      );
    }
  }

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

        <NotesPanel conversationId={conv.id} lang={lang} />

        <ConsulatesPanel missions={missions} lang={lang} />

        <ProceduralNotesPanel notes={proceduralNotes} lang={lang} />

        <ResourcesPanel resources={resources} lang={lang} />

        <DeleteCaseButton conversationId={conv.id} lang={lang} />
      </main>

      <SosButton lang={lang} />
    </div>
  );
}

// ── Resource-layer fetch helpers ─────────────────────────────────────

async function fetchMissions(
  supabase: ReturnType<typeof createServiceClient>,
  countryIso: string
) {
  const { data, error } = await supabase
    .from("diplomatic_missions")
    .select(
      "id, type, city, address, phone, email, website, appointment_url, appointment_required, services, description"
    )
    .eq("country_iso", countryIso)
    .eq("active", true)
    .order("type", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

async function fetchProceduralNotes(
  supabase: ReturnType<typeof createServiceClient>,
  authSlug: string | null,
  provinceIso: string | null
) {
  // Build an OR filter: notes that match the auth slug OR are generic
  // (auth_slug IS NULL), AND match the province OR are national.
  // Supabase doesn't have a clean OR builder for compound conditions,
  // so we fetch the candidates and filter in JS — table size is small.
  let query = supabase
    .from("procedural_notes")
    .select(
      "id, severity, practical_text, legal_text, scope, source, authorization_slug, province_iso, ccaa_code, description"
    )
    .eq("active", true);
  if (authSlug) {
    query = query.or(`authorization_slug.eq.${authSlug},authorization_slug.is.null`);
  } else {
    query = query.is("authorization_slug", null);
  }
  const { data, error } = await query.limit(20);
  if (error) throw error;

  const rows = data ?? [];
  // Filter by location: keep national-scope rows + rows matching the user's province.
  const filtered = rows.filter((n) => {
    if (n.scope === "national") return true;
    if (n.scope === "province" && provinceIso) return n.province_iso === provinceIso;
    if (n.scope === "ccaa" && provinceIso) {
      // Crude CCAA match would need a province→CCAA map; defer to procedural_notes
      // having ccaa_code matching the user's province's CCAA. Skip for now —
      // when we add the CCAA mapper, this branch tightens.
      return false;
    }
    return false;
  });

  // Sort by severity
  filtered.sort(
    (a, b) =>
      SEVERITY_ORDER.indexOf(
        a.severity as (typeof SEVERITY_ORDER)[number]
      ) -
      SEVERITY_ORDER.indexOf(b.severity as (typeof SEVERITY_ORDER)[number])
  );

  return filtered;
}
