import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import TypingIndicator from "./TypingIndicator";
import ConsentCard from "./ConsentCard";
import SummaryCard from "./SummaryCard";
import DocumentCard from "./DocumentCard";
import EmailDraftCard from "./EmailDraftCard";
import DocChecklistCard from "./DocChecklistCard";
import type { Lang } from "@/lib/i18n";
import type {
  ChatMessage,
  ConsentCardData,
  SummaryCardData,
  DocumentCardData,
  EmailDraftCardData,
  DocChecklistCardData,
} from "@/lib/types/chat-flow";

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
              // GFM table support
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
                <hr
                  className="my-3"
                  style={{ borderColor: "var(--line)" }}
                />
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
        ) : isLast && loading ? (
          <TypingIndicator />
        ) : null}
      </div>
    </div>
  );
}
