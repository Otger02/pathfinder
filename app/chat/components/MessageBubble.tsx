"use client";

import { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import TypingIndicator from "./TypingIndicator";
import ConsentCard from "./ConsentCard";
import SummaryCard from "./SummaryCard";
import DocumentCard from "./DocumentCard";
import EmailDraftCard from "./EmailDraftCard";
import DocChecklistCard from "./DocChecklistCard";
import type { Lang } from "@/lib/i18n";
import { t, labels } from "@/lib/i18n";
import type {
  ChatMessage,
  ConsentCardData,
  SummaryCardData,
  DocumentCardData,
  EmailDraftCardData,
  DocChecklistCardData,
} from "@/lib/types/chat-flow";

const TTS_LANG_MAP: Record<string, string> = {
  ca: "ca-ES",
  es: "es-ES",
  en: "en-US",
  fr: "fr-FR",
  ar: "ar-SA",
};

/** Strip markdown syntax so TTS doesn't read asterisks and pipes aloud. */
function plainTextForSpeech(md: string): string {
  return md
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/\|/g, ". ")
    .replace(/[#*_`>~]/g, "")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/\s{2,}/g, " ")
    .trim();
}

/**
 * Read-aloud button for assistant messages. Uses the browser's built-in
 * speechSynthesis — free, offline-capable, no API. Important for users
 * with low literacy, who can dictate via the mic but struggle to read
 * long answers.
 */
function SpeakButton({ text, lang }: { text: string; lang: Lang }) {
  const [speaking, setSpeaking] = useState(false);
  const [supported, setSupported] = useState(true);

  useEffect(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      setSupported(false);
    }
    // Stop speech if the component unmounts mid-utterance
    return () => {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  if (!supported || !text.trim()) return null;

  const toggle = () => {
    const synth = window.speechSynthesis;
    if (speaking) {
      synth.cancel();
      setSpeaking(false);
      return;
    }
    synth.cancel(); // stop any other message being read
    const utterance = new SpeechSynthesisUtterance(plainTextForSpeech(text));
    utterance.lang = TTS_LANG_MAP[lang] ?? "es-ES";
    utterance.rate = 0.95;
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);
    setSpeaking(true);
    synth.speak(utterance);
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={t(speaking ? labels.ttsStop : labels.ttsListen, lang)}
      title={t(speaking ? labels.ttsStop : labels.ttsListen, lang)}
      aria-pressed={speaking}
      className="mt-1.5 inline-flex items-center gap-1 text-xs rounded-md px-1.5 py-0.5 transition-colors"
      style={{
        color: speaking ? "var(--primary-2)" : "var(--ink-3)",
        background: speaking ? "var(--primary-soft, #eef4f0)" : "transparent",
        border: "none",
        cursor: "pointer",
      }}
    >
      {speaking ? (
        <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <rect x="7" y="7" width="10" height="10" rx="1.5" />
        </svg>
      ) : (
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z" />
        </svg>
      )}
      {t(speaking ? labels.ttsStop : labels.ttsListen, lang)}
    </button>
  );
}

export default function MessageBubble({
  message,
  isLast,
  loading,
  lang,
  onConsentAccept,
  onConsentDecline,
  onSummaryConfirm,
  onSummaryCorrect,
  onDocToggle,
}: {
  message: ChatMessage;
  isLast: boolean;
  loading: boolean;
  lang: Lang;
  onConsentAccept?: () => void;
  onConsentDecline?: () => void;
  onSummaryConfirm?: () => void;
  onSummaryCorrect?: () => void;
  onDocToggle?: (slug: string, obtained: boolean) => void;
}) {
  const isUser = message.role === "user";

  // Card dispatch for assistant messages
  if (!isUser && message.cardType) {
    switch (message.cardType) {
      case "consent": {
        const data = message.cardData as ConsentCardData | undefined;
        return (
          <ConsentCard
            lang={lang}
            onAccept={onConsentAccept || (() => {})}
            onDecline={onConsentDecline || (() => {})}
            accepted={data?.accepted}
          />
        );
      }
      case "summary": {
        const data = message.cardData as SummaryCardData | undefined;
        return (
          <SummaryCard
            data={data?.collected || {}}
            authSlugs={data?.authSlugs || []}
            lang={lang}
            onConfirm={onSummaryConfirm || (() => {})}
            onCorrect={onSummaryCorrect || (() => {})}
            confirmed={data?.confirmed}
          />
        );
      }
      case "document": {
        const data = message.cardData as DocumentCardData | undefined;
        return (
          <DocumentCard
            documents={data?.documents || []}
            loading={data?.loading ?? false}
            lang={lang}
          />
        );
      }
      case "email_draft": {
        const data = message.cardData as EmailDraftCardData | undefined;
        if (!data) return null;
        return (
          <EmailDraftCard
            to={data.to}
            toName={data.toName}
            subject={data.subject}
            body={data.body}
            mailtoUrl={data.mailtoUrl}
            lang={lang}
          />
        );
      }
      case "doc_checklist": {
        const data = message.cardData as DocChecklistCardData | undefined;
        return (
          <DocChecklistCard
            authSlugs={data?.authSlugs ?? []}
            documentsObtained={data?.documentsObtained ?? []}
            lang={lang}
            onToggle={onDocToggle}
          />
        );
      }
    }
  }

  if (isUser) {
    return (
      <div className="flex justify-end mb-3">
        <div className="bubble from-user">
          {message.content}
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-start mb-3">
      <div className="bubble from-bot">
        {message.content ? (
          <>
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                strong: ({ children }) => (
                  <strong className="font-semibold">{children}</strong>
                ),
                em: ({ children }) => <em className="italic">{children}</em>,
                ul: ({ children }) => (
                  <ul className="list-disc ltr:ml-4 rtl:mr-4 mb-2">{children}</ul>
                ),
                ol: ({ children }) => (
                  <ol className="list-decimal ltr:ml-4 rtl:mr-4 mb-2">{children}</ol>
                ),
                li: ({ children }) => <li className="mb-1">{children}</li>,
                a: ({ href, children }) => (
                  <a
                    href={href}
                    className="text-primary underline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {children}
                  </a>
                ),
                h1: ({ children }) => (
                  <h1 className="font-semibold text-xl mb-2">{children}</h1>
                ),
                h2: ({ children }) => (
                  <h2 className="font-semibold text-lg mb-2">{children}</h2>
                ),
                h3: ({ children }) => (
                  <h3 className="font-semibold text-base mb-1">{children}</h3>
                ),
                // GFM table support — Claude often answers with tables
                table: ({ children }) => (
                  <div className="my-2 overflow-x-auto">
                    <table
                      className="w-full text-xs border-collapse"
                      style={{ borderColor: "var(--line)" }}
                    >
                      {children}
                    </table>
                  </div>
                ),
                thead: ({ children }) => (
                  <thead style={{ background: "var(--surface)" }}>{children}</thead>
                ),
                tbody: ({ children }) => <tbody>{children}</tbody>,
                tr: ({ children }) => (
                  <tr style={{ borderBottom: "1px solid var(--line)" }}>{children}</tr>
                ),
                th: ({ children }) => (
                  <th
                    className="text-left font-semibold px-2 py-1.5"
                    style={{
                      color: "var(--ink)",
                      borderBottom: "1px solid var(--line-2)",
                    }}
                  >
                    {children}
                  </th>
                ),
                td: ({ children }) => (
                  <td className="align-top px-2 py-1.5" style={{ color: "var(--ink-2)" }}>
                    {children}
                  </td>
                ),
                hr: () => (
                  <hr className="my-3" style={{ borderColor: "var(--line)" }} />
                ),
                code: ({ children }) => (
                  <code
                    className="px-1 py-0.5 rounded text-[0.85em]"
                    style={{
                      background: "var(--surface)",
                      color: "var(--primary-2)",
                      fontFamily: "var(--font-mono)",
                    }}
                  >
                    {children}
                  </code>
                ),
              }}
            >
              {message.content}
            </ReactMarkdown>
            {!(isLast && loading) && (
              <SpeakButton text={message.content} lang={lang} />
            )}
          </>
        ) : isLast && loading ? (
          <TypingIndicator />
        ) : null}
      </div>
    </div>
  );
}
