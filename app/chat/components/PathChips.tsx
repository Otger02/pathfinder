import type { Lang } from "@/lib/i18n";

export default function PathChips({
  path,
}: {
  path: string[];
  lang: Lang;
}) {
  if (path.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-1.5 text-sm">
      {path.map((step, i) => (
        <span key={i} className="flex items-center gap-1.5">
          {i > 0 && (
            <svg
              className="w-3.5 h-3.5 text-text-faint rtl:rotate-180 shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          )}
          <span className="inline-block px-2.5 py-1 bg-white border border-border-light rounded-full text-text-muted text-xs">
            {step}
          </span>
        </span>
      ))}
    </div>
  );
}
