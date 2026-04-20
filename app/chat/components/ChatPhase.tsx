import { useRef, useEffect, FormEvent } from "react";
import type { Lang } from "@/lib/i18n";
import { t, labels } from "@/lib/i18n";
import type { ChatMessage, ChatSubPhase } from "@/lib/types/chat-flow";
import PathChips from "./PathChips";
import MessageBubble from "./MessageBubble";
import ProgressTabs from "./ProgressTabs";

interface Source {
  id: string;
  source_file: string | null;
  llei_referencia: string | null;
  similarity: number;
}

export default function ChatPhase({
  messages,
  sources,
  input,
  loading,
  lang,
  path,
  mode,
  chatSubPhase,
  completionPct,
  onSubmit,
  onInputChange,
  onPrepareDocuments,
  onConsentAccept,
  onConsentDecline,
  onSummaryConfirm,
  onSummaryCorrect,
}: {
  messages: ChatMessage[];
  sources: Source[];
  input: string;
  loading: boolean;
  lang: Lang;
  path: string[];
  mode: "info" | "collection";
  chatSubPhase: ChatSubPhase;
  completionPct: number;
  onSubmit: (e: FormEvent) => void;
  onInputChange: (val: string) => void;
  onPrepareDocuments?: () => void;
  onConsentAccept: () => void;
  onConsentDecline: () => void;
  onSummaryConfirm: () => void;
  onSummaryCorrect: () => void;
}) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const inputDisabled =
    loading ||
    (mode === "collection" &&
      (chatSubPhase === "resum" || chatSubPhase === "document"));

  return (
    <div className="animate-fade-in flex flex-col min-h-[60vh]">
      {/* Progress tabs for collection mode */}
      {mode === "collection" && (
        <ProgressTabs
          activeSubPhase={chatSubPhase}
          completionPct={completionPct}
          lang={lang}
        />
      )}

      {path.length > 0 && (
        <div className="px-3 py-2 bg-success-light rounded-lg text-sm mb-4 text-success">
          <span className="font-medium">{t(labels.youIndicated, lang)}:</span>
          <div className="mt-1">
            <PathChips path={path} lang={lang} />
          </div>
        </div>
      )}

      {/* Messages */}
      <div
        className="flex-1 mb-4 space-y-1"
        role="log"
        aria-live="polite"
        aria-label="Chat messages"
      >
        {messages.map((msg, i) => (
          <MessageBubble
            key={i}
            message={msg}
            isLast={i === messages.length - 1}
            loading={loading}
            lang={lang}
            onConsentAccept={onConsentAccept}
            onConsentDecline={onConsentDecline}
            onSummaryConfirm={onSummaryConfirm}
            onSummaryCorrect={onSummaryCorrect}
          />
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Sources */}
      {sources.length > 0 && (
        <details className="mb-3 text-sm text-text-muted">
          <summary className="cursor-pointer">
            {t(labels.sourcesConsulted, lang)} ({sources.length})
          </summary>
          <ul className="mt-1 ltr:ml-4 rtl:mr-4 list-disc">
            {sources.map((s) => (
              <li key={s.id}>
                {s.source_file} {s.llei_referencia && `— ${s.llei_referencia}`}{" "}
                ({(s.similarity * 100).toFixed(0)}%)
              </li>
            ))}
          </ul>
        </details>
      )}

      {/* Prepare documents button (info mode only) */}
      {onPrepareDocuments && (
        <button
          onClick={onPrepareDocuments}
          className="w-full mb-3 px-4 py-2.5 text-sm font-medium text-primary bg-primary/10 rounded-xl hover:bg-primary/20 transition-colors border border-primary/20"
        >
          <span className="flex items-center justify-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
            </svg>
            {t(labels.prepareDocuments, lang)}
          </span>
        </button>
      )}

      {/* Input form */}
      <form
        onSubmit={onSubmit}
        className="flex gap-2 sticky bottom-0 bg-surface py-3 border-t border-border-light"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => onInputChange(e.target.value)}
          placeholder={t(labels.inputPlaceholder, lang)}
          disabled={inputDisabled}
          aria-label={t(labels.inputPlaceholder, lang)}
          className="flex-1 px-4 py-3 text-base bg-white border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary disabled:opacity-50 shadow-sm"
        />
        <button
          type="submit"
          disabled={inputDisabled}
          className="px-5 py-3 bg-primary text-white font-semibold rounded-xl hover:bg-primary-dark transition-colors disabled:opacity-50 shadow-sm"
        >
          {loading ? "..." : t(labels.sendButton, lang)}
        </button>
      </form>
    </div>
  );
}
