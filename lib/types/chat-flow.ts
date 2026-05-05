/**
 * Types for the conversational data collection flow.
 *
 * Sub-phases within the "chat" phase:
 *  conversa  → bot asks questions, user provides data
 *  resum     → bot shows summary card, user confirms
 *  document  → PDFs generated, download links shown
 *  enviament → email draft ready, mailto link
 */

export type ChatSubPhase = "conversa" | "resum" | "document" | "enviament";

/**
 * SSE event types sent from the chat API to the client.
 * Existing events are kept; new ones support the collection flow.
 */
export type SSEEventType =
  // Existing
  | "conversation_id"
  | "sources"
  | "sos"
  | "text"
  | "error"
  | "done"
  // Collection flow
  | "data_update"       // extracted personal data fields
  | "phase_change"      // sub-phase transition
  | "summary_card"      // signals client to render summary
  | "documents_ready"   // PDF generation complete
  | "email_draft"       // email draft data
  | "consent_request";  // ask for GDPR consent

/** Payload for data_update SSE event */
export interface DataUpdateEvent {
  type: "data_update";
  collected: Record<string, string>;
  missingFields: string[];
  completionPct: number;
}

/** Payload for phase_change SSE event */
export interface PhaseChangeEvent {
  type: "phase_change";
  phase: ChatSubPhase;
}

/** Payload for summary_card SSE event */
export interface SummaryCardEvent {
  type: "summary_card";
  data: Record<string, string>;
  authSlugs: string[];
}

/** Payload for documents_ready SSE event */
export interface DocumentsReadyEvent {
  type: "documents_ready";
  documents: Array<{
    name: string;
    url: string;
  }>;
}

/** Payload for email_draft SSE event */
export interface EmailDraftEvent {
  type: "email_draft";
  to: string;
  toName: string;
  subject: string;
  body: string;
  mailtoUrl: string;
}

/** Payload for consent_request SSE event */
export interface ConsentRequestEvent {
  type: "consent_request";
}

// ── Client-side message types ───────────────────────────────────────

export type CardType = "consent" | "summary" | "document" | "email_draft" | "doc_checklist";

/** Unified chat message type — replaces local Message interfaces */
export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  cardType?: CardType;
  cardData?: ConsentCardData | SummaryCardData | DocumentCardData | EmailDraftCardData | DocChecklistCardData;
}

export interface ConsentCardData {
  accepted?: boolean;
}

export interface SummaryCardData {
  collected: Record<string, string>;
  authSlugs: string[];
  confirmed?: boolean;
}

export interface DocumentCardData {
  documents: Array<{ name: string; url: string }>;
  loading?: boolean;
}

export interface EmailDraftCardData {
  to: string;
  toName: string;
  subject: string;
  body: string;
  mailtoUrl: string;
}

export interface DocChecklistCardData {
  authSlugs: string[];
  documentsObtained: string[];
}
