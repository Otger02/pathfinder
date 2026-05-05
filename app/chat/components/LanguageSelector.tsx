import type { Lang } from "@/lib/i18n";

const LANG_LABELS: Record<Lang, string> = {
  ca: "CA",
  es: "ES",
  en: "EN",
  ar: "AR",
  fr: "FR",
};

// Flag emojis. CA has no ISO flag, so we use a plain pennant; the
// 2-letter code keeps it unambiguous for any locale.
const LANG_FLAGS: Record<Lang, string> = {
  ca: "🏴",
  es: "🇪🇸",
  en: "🇬🇧",
  ar: "🇲🇦",
  fr: "🇫🇷",
};

export default function LanguageSelector({
  lang,
  onLangChange,
}: {
  lang: Lang;
  onLangChange: (l: Lang) => void;
}) {
  return (
    <div
      className="flex gap-0.5 p-0.5 rounded-full"
      role="group"
      aria-label="Language selector"
      style={{ background: "var(--surface)", border: "1px solid var(--line)" }}
    >
      {(Object.keys(LANG_LABELS) as Lang[]).map((l) => {
        const active = lang === l;
        return (
          <button
            key={l}
            onClick={() => onLangChange(l)}
            aria-label={`Switch to ${LANG_LABELS[l]}`}
            aria-pressed={active}
            title={LANG_LABELS[l]}
            className="inline-flex items-center justify-center gap-1 rounded-full transition-colors text-[11px] font-semibold leading-none"
            style={{
              minHeight: 28,
              height: 28,
              padding: "0 8px",
              background: active ? "var(--primary)" : "transparent",
              color: active ? "var(--on-primary)" : "var(--ink-2)",
              cursor: "pointer",
            }}
          >
            <span aria-hidden="true" className="text-sm leading-none">
              {LANG_FLAGS[l]}
            </span>
            <span>{LANG_LABELS[l]}</span>
          </button>
        );
      })}
    </div>
  );
}
