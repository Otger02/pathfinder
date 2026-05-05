import { redirect } from "next/navigation";
import Link from "next/link";
import { createAuthServerClient } from "@/lib/supabase-server";
import { createServiceClient } from "@/lib/supabase";
import { t, labels } from "@/lib/i18n";
import type { Lang } from "@/lib/i18n";

interface PageProps {
  searchParams: Promise<{ lang?: string }>;
}

const PHASE_ORDER: Record<string, number> = {
  conversa: 1,
  resum: 2,
  document: 3,
  enviament: 4,
};

function phaseLabel(phase: string, lang: Lang): string {
  const map: Record<string, Record<string, string>> = {
    conversa: { es: "Conversación", en: "Conversation", ar: "محادثة", fr: "Conversation", ca: "Conversa" },
    resum: { es: "Resumen", en: "Summary", ar: "ملخص", fr: "Résumé", ca: "Resum" },
    document: { es: "Documentos", en: "Documents", ar: "مستندات", fr: "Documents", ca: "Documents" },
    enviament: { es: "Envío", en: "Sent", ar: "إرسال", fr: "Envoi", ca: "Enviament" },
  };
  return map[phase]?.[lang] ?? map[phase]?.es ?? phase;
}

function phaseColor(phase: string): string {
  return {
    conversa: "bg-surface-alt text-text-muted",
    resum: "bg-amber-50 text-amber-700",
    document: "bg-emerald-50 text-emerald-700",
    enviament: "bg-primary/10 text-primary",
  }[phase] ?? "bg-surface-alt text-text-muted";
}

export default async function HistoryPage({ searchParams }: PageProps) {
  const { lang: langParam } = await searchParams;
  const lang = (langParam as Lang) || "es";

  const supabaseAuth = await createAuthServerClient();
  const { data: { user } } = await supabaseAuth.auth.getUser();

  if (!user) {
    redirect(`/auth?returnTo=/chat/history&lang=${lang}`);
  }

  const supabase = createServiceClient();
  const { data: conversations } = await supabase
    .from("conversations")
    .select("id, language, auth_slugs, chat_sub_phase, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(20);

  const convs = conversations ?? [];

  return (
    <div className="min-h-screen bg-surface">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white border-b border-border-light px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75V15m6-6v8.25m.503 3.498l4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 00-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c-.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0z" />
            </svg>
          </div>
          <span className="font-bold text-text">Pathfinder</span>
        </div>
        <Link
          href={`/chat?lang=${lang}`}
          className="text-sm text-text-muted hover:text-text transition-colors"
        >
          ← {t(labels.backToChat, lang)}
        </Link>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-xl font-bold text-text mb-6">{t(labels.historyTitle, lang)}</h1>

        {convs.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-text-muted text-sm mb-6">{t(labels.historyEmpty, lang)}</p>
            <Link
              href={`/chat?lang=${lang}`}
              className="inline-block px-5 py-2.5 bg-primary text-white text-sm font-semibold rounded-xl hover:bg-primary-dark transition-colors"
            >
              {t(labels.historyStartNew, lang)}
            </Link>
          </div>
        ) : (
          <ul className="space-y-3">
            {convs.map((conv) => {
              const convLang = (conv.language as Lang) || lang;
              const phase = (conv.chat_sub_phase as string) || "conversa";
              const pct = Math.round(((PHASE_ORDER[phase] ?? 1) / 4) * 100);
              const slugs: string[] = conv.auth_slugs ?? [];
              const date = new Date(conv.created_at).toLocaleDateString(
                lang === "ar" ? "ar-SA" : lang === "fr" ? "fr-FR" : lang === "ca" ? "ca-ES" : lang === "en" ? "en-GB" : "es-ES",
                { day: "numeric", month: "short", year: "numeric" }
              );

              return (
                <li key={conv.id}>
                  <Link
                    href={`/chat?resume=${conv.id}&lang=${convLang}`}
                    className="block rounded-2xl bg-white border border-border shadow-sm hover:shadow-md hover:border-primary/30 transition-all p-4 group"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-text-muted mb-1">{date}</p>
                        {slugs.length > 0 && (
                          <p className="text-sm font-medium text-text truncate">
                            {slugs.map((s) => s.replace(/_/g, " ")).join(", ")}
                          </p>
                        )}
                        {/* Progress bar */}
                        <div className="mt-2 flex items-center gap-2">
                          <div className="flex-1 h-1.5 bg-border-light rounded-full overflow-hidden">
                            <div
                              className="h-full bg-primary rounded-full transition-all"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          <span className="text-xs text-text-muted shrink-0">{pct}%</span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${phaseColor(phase)}`}>
                          {phaseLabel(phase, convLang)}
                        </span>
                        <span className="text-xs font-semibold text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                          {t(labels.historyResume, lang)} →
                        </span>
                      </div>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}

        {convs.length > 0 && (
          <div className="mt-8 text-center">
            <Link
              href={`/chat?lang=${lang}`}
              className="inline-block px-5 py-2.5 bg-primary text-white text-sm font-semibold rounded-xl hover:bg-primary-dark transition-colors"
            >
              {t(labels.historyStartNew, lang)}
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
