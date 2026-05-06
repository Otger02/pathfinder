"use client";

import type { Lang } from "@/lib/i18n";
import { t, labels } from "@/lib/i18n";
import type { ChatSubPhase } from "@/lib/types/chat-flow";

const PHASE_ORDER: ChatSubPhase[] = ["conversa", "resum", "document", "enviament"];

const PHASE_LABELS: Record<ChatSubPhase, keyof typeof labels> = {
  conversa: "tabDades",
  resum: "tabResum",
  document: "tabDocuments",
  enviament: "tabEnviament",
};

export default function ProgressTabs({
  activeSubPhase,
  completionPct,
  lang,
  onSubPhaseChange,
}: {
  activeSubPhase: ChatSubPhase;
  completionPct: number;
  lang: Lang;
  /** When provided, the tabs become clickable and call this on each click. */
  onSubPhaseChange?: (phase: ChatSubPhase) => void;
}) {
  const activeIdx = PHASE_ORDER.indexOf(activeSubPhase);
  const interactive = !!onSubPhaseChange;

  return (
    <div
      className={`flex gap-1 p-1 bg-surface-alt rounded-xl mb-4 ${
        lang === "ar" ? "flex-row-reverse" : ""
      }`}
      role={interactive ? "tablist" : undefined}
    >
      {PHASE_ORDER.map((phase, idx) => {
        const isActive = idx === activeIdx;
        const isCompleted = idx < activeIdx;

        const baseClass = `flex-1 px-2 py-2 text-xs font-medium rounded-lg text-center transition-colors ${
          isActive
            ? "bg-primary text-white"
            : isCompleted
              ? "bg-primary/10 text-primary"
              : "text-text-muted"
        }`;

        const inner = (
          <>
            <span className="flex items-center justify-center gap-1">
              {isCompleted && (
                <svg
                  className="w-3 h-3"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2.5}
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4.5 12.75l6 6 9-13.5"
                  />
                </svg>
              )}
              {t(labels[PHASE_LABELS[phase]], lang)}
            </span>
            {phase === "conversa" && isActive && (
              <div className="h-1 mt-1 bg-white/30 rounded-full overflow-hidden">
                <div
                  className="h-full bg-white rounded-full transition-all duration-500"
                  style={{ width: `${completionPct}%` }}
                />
              </div>
            )}
          </>
        );

        if (!interactive) {
          return (
            <div key={phase} className={baseClass}>
              {inner}
            </div>
          );
        }

        return (
          <button
            key={phase}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onSubPhaseChange!(phase)}
            className={`${baseClass} cursor-pointer`}
            style={{
              border: "none",
              background: undefined, // let class drive
              minHeight: 44,
            }}
          >
            {inner}
          </button>
        );
      })}
    </div>
  );
}
