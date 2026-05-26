import type { Lang } from "@/lib/i18n";
import { t, labels } from "@/lib/i18n";

interface ProceduralNote {
  id: string;
  severity: "blocker" | "workaround" | "warning" | "info";
  practical_text: string;
  legal_text: string | null;
  scope: "province" | "ccaa" | "national" | "consulate";
  source: string | null;
  description: Record<string, string> | null;
}

interface Props {
  notes: ProceduralNote[];
  lang: Lang;
}

const SEVERITY_STYLE: Record<
  ProceduralNote["severity"],
  { bg: string; border: string; icon: string; iconColor: string }
> = {
  blocker: {
    bg: "var(--danger-soft, #fee2e2)",
    border: "var(--danger, #dc2626)",
    icon: "⛔",
    iconColor: "var(--danger-2, #b91c1c)",
  },
  workaround: {
    bg: "var(--gold-soft, #fef3c7)",
    border: "var(--gold, #d97706)",
    icon: "↪",
    iconColor: "var(--gold, #d97706)",
  },
  warning: {
    bg: "var(--gold-soft, #fef3c7)",
    border: "var(--gold, #d97706)",
    icon: "⚠",
    iconColor: "var(--gold, #d97706)",
  },
  info: {
    bg: "var(--primary-soft, #dbeafe)",
    border: "var(--primary, #3b82f6)",
    icon: "ℹ",
    iconColor: "var(--primary-2, #1d4ed8)",
  },
};

function pickDescription(
  desc: Record<string, string> | null | undefined,
  lang: Lang
): string | null {
  if (!desc) return null;
  return desc[lang] || desc.es || desc.en || null;
}

/**
 * Surfaces "the law says X, in practice Y" notes for this case's
 * authorization and province. Returns null when there are no notes —
 * we never want to bait the user with an empty section.
 *
 * Notes are sorted server-side by severity (blocker → workaround →
 * warning → info) so the user reads the most actionable ones first.
 */
export default function ProceduralNotesPanel({ notes, lang }: Props) {
  if (!notes || notes.length === 0) return null;

  return (
    <section aria-labelledby="proc-notes-title">
      <h2
        id="proc-notes-title"
        className="div-label mb-2"
      >
        {t(labels.proceduralNotesTitle, lang)}
      </h2>

      <ul className="space-y-2">
        {notes.map((note) => {
          const style = SEVERITY_STYLE[note.severity];
          const text =
            pickDescription(note.description, lang) ?? note.practical_text;
          return (
            <li
              key={note.id}
              className="card flat"
              style={{
                background: style.bg,
                borderInlineStartWidth: 4,
                borderInlineStartStyle: "solid",
                borderInlineStartColor: style.border,
                padding: 12,
              }}
            >
              <div className="flex items-start gap-2">
                <span
                  aria-hidden="true"
                  style={{
                    color: style.iconColor,
                    fontSize: 16,
                    lineHeight: 1,
                    marginTop: 2,
                  }}
                >
                  {style.icon}
                </span>
                <div className="flex-1 min-w-0">
                  <p
                    className="text-sm"
                    style={{ color: "var(--ink)" }}
                  >
                    {text}
                  </p>
                  {note.legal_text && (
                    <p
                      className="text-xs mt-1 italic"
                      style={{ color: "var(--ink-3)" }}
                    >
                      {t(labels.proceduralLawSays, lang)}: {note.legal_text}
                    </p>
                  )}
                  {note.source && (
                    <p
                      className="text-[11px] mt-1"
                      style={{ color: "var(--ink-3)" }}
                    >
                      {t(labels.proceduralSource, lang)}: {note.source}
                    </p>
                  )}
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
