import Link from "next/link";
import { redirect } from "next/navigation";
import { createAuthServerClient } from "@/lib/supabase-server";
import type { Lang } from "@/lib/i18n";
import { t, labels } from "@/lib/i18n";
import {
  fetchConversationsByActivity,
  summarizeConversation,
} from "@/app/dashboard/lib/dashboard-data";
import ProcessRow from "@/app/dashboard/components/ProcessRow";
import UserMenu from "@/app/dashboard/components/UserMenu";
import DashboardLangSelector from "@/app/dashboard/components/DashboardLangSelector";
import SosButton from "@/app/components/SosButton";

interface CasesPageProps {
  searchParams: Promise<{ lang?: string }>;
}

export default async function CasesPage({ searchParams }: CasesPageProps) {
  const params = await searchParams;
  const lang = ((params.lang as Lang) ?? "ca") as Lang;

  const supabase = await createAuthServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/auth?returnTo=/cases&lang=${lang}`);
  }

  const conversations = await fetchConversationsByActivity(supabase, user.id);
  const summaries = conversations.map(summarizeConversation);

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "var(--bg)" }}>
      <header className="appbar">
        <div className="flex items-center gap-3">
          <Link
            href={`/dashboard?lang=${lang}`}
            className="logo-mark"
            aria-label="Pathfinder"
          />
          <span className="font-semibold" style={{ color: "var(--ink)" }}>
            Pathfinder
          </span>
        </div>
        <DashboardLangSelector lang={lang} />
        <UserMenu email={user.email ?? ""} lang={lang} />
      </header>

      <main
        className="flex-1 mx-auto w-full max-w-2xl px-4 sm:px-6 py-8 space-y-6"
        dir={lang === "ar" ? "rtl" : "ltr"}
      >
        <div>
          <Link
            href={`/dashboard?lang=${lang}`}
            className="text-sm hover:underline"
            style={{ color: "var(--ink-2)" }}
          >
            ← {t(labels.back, lang)}
          </Link>
          <h1 className="h-display mt-2">{t(labels.casesAllTitle, lang)}</h1>
        </div>

        {summaries.length === 0 ? (
          <div className="card text-center py-12">
            <p className="body" style={{ color: "var(--ink-2)" }}>
              {t(labels.casesAllEmpty, lang)}
            </p>
            <Link
              href={`/chat?lang=${lang}`}
              className="btn btn-pill mt-6 inline-block"
            >
              + {t(labels.newProcess, lang)}
            </Link>
          </div>
        ) : (
          <>
            <div className="card flat overflow-hidden" style={{ padding: 0 }}>
              {summaries.map((p) => (
                <ProcessRow key={p.id} process={p} lang={lang} />
              ))}
            </div>

            <Link
              href={`/chat?lang=${lang}`}
              className="btn btn-tonal btn-block"
            >
              + {t(labels.newProcess, lang)}
            </Link>
          </>
        )}
      </main>

      <SosButton lang={lang} />
    </div>
  );
}
