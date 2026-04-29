import type { Lang } from "@/lib/i18n";

const LANG_LABELS: Record<Lang, string> = {
  ca: "CA",
  es: "ES",
  en: "EN",
  ar: "AR",
  fr: "FR",
};

export default function LanguageSelector({
  lang,
  onLangChange,
}: {
  lang: Lang;
  onLangChange: (l: Lang) => void;
}) {
  return (
    <div className="flex gap-1" role="group" aria-label="Language selector">
      {(Object.keys(LANG_LABELS) as Lang[]).map((l) => (
        <button
          key={l}
          onClick={() => onLangChange(l)}
          aria-label={`Switch to ${LANG_LABELS[l]}`}
          aria-pressed={lang === l}
          className={`px-2.5 py-1.5 text-xs font-medium rounded-lg transition-colors min-h-[36px] ${
            lang === l
              ? "bg-primary text-white shadow-sm"
              : "bg-white text-text-muted hover:bg-surface-alt border border-border-light"
          }`}
        >
          {LANG_LABELS[l]}
        </button>
      ))}
    </div>
  );
}
