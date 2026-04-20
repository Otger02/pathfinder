import ReactMarkdown from "react-markdown";
import TypingIndicator from "./TypingIndicator";
import ConsentCard from "./ConsentCard";
import SummaryCard from "./SummaryCard";
import DocumentCard from "./DocumentCard";
import EmailDraftCard from "./EmailDraftCard";
import type { Lang } from "@/lib/i18n";
import type {
  ChatMessage,
  ConsentCardData,
  SummaryCardData,
  DocumentCardData,
  EmailDraftCardData,
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
}: {
  message: ChatMessage;
  isLast: boolean;
  loading: boolean;
  lang: Lang;
  onConsentAccept?: () => void;
  onConsentDecline?: () => void;
  onSummaryConfirm?: () => void;
  onSummaryCorrect?: () => void;
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
    }
  }

  if (isUser) {
    return (
      <div className="flex justify-end mb-3">
        <div className="max-w-[85%] px-4 py-3 bg-primary text-white rounded-2xl rounded-br-sm rtl:rounded-br-2xl rtl:rounded-bl-sm text-base shadow-sm">
          {message.content}
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-start mb-3">
      <div className="max-w-[85%] px-4 py-3 bg-white border border-border-light rounded-2xl rounded-bl-sm rtl:rounded-bl-2xl rtl:rounded-br-sm text-base shadow-sm">
        {message.content ? (
          <ReactMarkdown
            components={{
              p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
              strong: ({ children }) => (
                <strong className="font-semibold">{children}</strong>
              ),
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
