"use client";

import { useState, useRef, useEffect, useCallback, FormEvent, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import type { Lang } from "@/lib/i18n";
import { t, labels } from "@/lib/i18n";
import type { PersonalData, PersonalDataField } from "@/lib/types/personal-data";
import { EMPTY_PERSONAL_DATA } from "@/lib/types/personal-data";
import { getFormsForAuth } from "@/lib/form-config";
import type {
  ChatMessage,
  ChatSubPhase,
  SummaryCardData,
  DocumentCardData,
  EmailDraftCardData,
  DocChecklistCardData,
} from "@/lib/types/chat-flow";
import type { DecisionNode, DecisionTree } from "@/lib/types/decision-tree";
import {
  loadTranslations,
  translateNode,
  getRootNode,
  ROOT_NODE_ID,
} from "@/lib/tree-i18n";
import LanguageSelector from "./components/LanguageSelector";
import TreePhase from "./components/TreePhase";
import ChatPhase from "./components/ChatPhase";
import FormPhase from "./components/FormPhase";
import ConsentModal from "./components/ConsentModal";
import SosOverlay from "./components/SosOverlay";
import SaveProgressBanner from "./components/SaveProgressBanner";
import { RecordingEngine } from "@/lib/recording-engine";
import { createBrowserSupabase } from "@/lib/supabase-browser";
import type { User } from "@supabase/supabase-js";

interface RecursUrgent {
  nom: string;
  telefon: string;
  disponibilitat: string;
}

type DecisionOption = DecisionNode["opts"][number];

// nodeMap stores the source-of-truth (Catalan) nodes from the JSON.
// translateNode() is applied each time we move to a new node so the
// component receives strings in the user's selected language.
function buildNodeMap(tree: DecisionTree): Map<string, DecisionNode> {
  const map = new Map<string, DecisionNode>();
  for (const branch of [tree.branches.b1, tree.branches.b2, tree.branches.b3, tree.branches.b4]) {
    for (const node of branch) {
      map.set(node.id, node);
    }
  }
  return map;
}

function inferSituacioFromNextId(nextId: string | null): string | null {
  if (!nextId) return null;
  if (nextId.startsWith("b1")) return "sense_autoritzacio";
  if (nextId.startsWith("b2")) return "amb_autoritzacio";
  if (nextId.startsWith("b3")) return "ue";
  if (nextId.startsWith("b4")) return "asil";
  return null;
}

// ── Types ─────────────────────────────────────────────────────────

interface Source {
  id: string;
  source_file: string | null;
  llei_referencia: string | null;
  similarity: number;
}

// ── Component ─────────────────────────────────────────────────────

export default function ChatPage() {
  return (
    <Suspense>
      <ChatPageInner />
    </Suspense>
  );
}

function ChatPageInner() {
  const searchParams = useSearchParams();
  const initialLang = (searchParams.get("lang") as Lang) || "es";
  const resumeId = searchParams.get("resume");

  const [lang, setLang] = useState<Lang>(initialLang);
  const [nodeMap, setNodeMap] = useState<Map<string, DecisionNode> | null>(null);
  const [phase, setPhase] = useState<"tree" | "chat" | "form">("tree");
  const [transitioning, setTransitioning] = useState(false);

  // Tree state
  const [currentNode, setCurrentNode] = useState<DecisionNode | null>(null);
  const [path, setPath] = useState<string[]>([]);
  const [situacioLegal, setSituacioLegal] = useState<string | null>(null);
  const [authSlugs, setAuthSlugs] = useState<string[]>([]);

  // Chat state
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [sources, setSources] = useState<Source[]>([]);
  const abortRef = useRef<AbortController | null>(null);

  // Collection state
  const [mode, setMode] = useState<"info" | "collection">("info");
  const [chatSubPhase, setChatSubPhase] = useState<ChatSubPhase>("conversa");
  const [collectedData, setCollectedData] = useState<Record<string, string>>({});
  const [completionPct, setCompletionPct] = useState(0);
  const collectedDataRef = useRef<Record<string, string>>({});
  const [generatedDocs, setGeneratedDocs] = useState<Array<{ name: string; url: string }>>([]);

  // SOS state
  const [sosActive, setSosActive] = useState(false);
  const [sosCategories, setSosCategories] = useState<string[]>([]);
  const [sosView, setSosView] = useState<"emergency" | "rights" | "police">("emergency");
  const [treeRecursosUrgents, setTreeRecursosUrgents] = useState<RecursUrgent[]>([]);
  const sosButtonRef = useRef<HTMLButtonElement>(null);

  // SOS Recording state
  const [isRecording, setIsRecording] = useState(false);
  const [recordingChunks, setRecordingChunks] = useState(0);
  const [recordingAudioOnly, setRecordingAudioOnly] = useState(false);
  const [recordingElapsed, setRecordingElapsed] = useState(0);
  const recordingEngineRef = useRef<RecordingEngine | null>(null);
  const recordingTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Form / PDF state (info-mode backward compat)
  const [personalData, setPersonalData] = useState<PersonalData>({ ...EMPTY_PERSONAL_DATA });
  const [consentGiven, setConsentGiven] = useState(false);
  const [showConsent, setShowConsent] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);

  // Auth state
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [showSaveBanner, setShowSaveBanner] = useState(false);

  useEffect(() => {
    const supabase = createBrowserSupabase();
    supabase.auth.getUser().then(({ data: { user } }) => setCurrentUser(user));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setCurrentUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  // Pending message: stores the user's first message when the backend
  // intercepts it with a consent_request. Re-sent after the user accepts.
  const [pendingMessage, setPendingMessage] = useState<string | null>(null);
  const lastSentTextRef = useRef<string>("");
  // pendingResend is set by handleConsentAcceptInline and watched by a
  // useEffect that fires sendChatMessage as soon as loading goes false.
  const [pendingResend, setPendingResend] = useState<string | null>(null);

  // Keep ref in sync with state
  useEffect(() => {
    collectedDataRef.current = collectedData;
  }, [collectedData]);

  // Fire the pending re-send as soon as the previous request finishes
  useEffect(() => {
    if (!loading && pendingResend) {
      const msg = pendingResend;
      setPendingResend(null);
      sendChatMessage(msg);
    }
    // sendChatMessage is a stable function reference (declared below)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, pendingResend]);

  // Cleanup blob URLs on unmount
  useEffect(() => {
    return () => {
      generatedDocs.forEach((doc) => URL.revokeObjectURL(doc.url));
    };
  }, [generatedDocs]);

  // Cleanup recording on unmount
  useEffect(() => {
    return () => {
      if (recordingEngineRef.current) {
        recordingEngineRef.current.stop();
      }
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
      }
    };
  }, []);

  // Recording handlers
  const handleStartRecording = useCallback(async (sosEventId?: string) => {
    if (recordingEngineRef.current?.getSession()?.status === "recording") return;

    const engine = new RecordingEngine();
    recordingEngineRef.current = engine;

    engine.setOnStateChange((state) => {
      setIsRecording(state.status === "recording");
      setRecordingAudioOnly(state.audioOnly);
      setRecordingChunks(state.chunksUploaded);
    });

    engine.setOnChunkUploaded((_idx, total) => {
      setRecordingChunks(total);
    });

    const started = await engine.start(sosEventId);
    if (started) {
      setIsRecording(true);
      setRecordingElapsed(0);
      recordingTimerRef.current = setInterval(() => {
        setRecordingElapsed((prev) => prev + 1);
      }, 1000);
    }
  }, []);

  const handleStopRecording = useCallback(async () => {
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
      recordingTimerRef.current = null;
    }
    if (recordingEngineRef.current) {
      await recordingEngineRef.current.stop();
    }
    setIsRecording(false);
  }, []);

  // Load decision tree + translations in parallel
  useEffect(() => {
    Promise.all([
      fetch("/api/tree").then((r) => r.json() as Promise<DecisionTree>),
      loadTranslations(),
    ])
      .then(([data]) => {
        const map = buildNodeMap(data);
        setNodeMap(map);
        setCurrentNode(getRootNode(lang));
      })
      .catch(() => setPhase("chat"));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Resume a saved conversation from /chat/history
  useEffect(() => {
    if (!resumeId) return;
    fetch(`/api/conversations/${resumeId}`)
      .then((r) => r.json())
      .then((conv) => {
        if (!conv?.id) return;
        setConversationId(conv.id);
        const loadedData = (conv.collected_data as Record<string, string>) || {};
        setCollectedData(loadedData);
        collectedDataRef.current = loadedData;
        if (conv.auth_slugs?.length > 0) {
          setAuthSlugs(conv.auth_slugs);
          setMode("collection");
        }
        if (conv.chat_sub_phase) {
          setChatSubPhase(conv.chat_sub_phase as ChatSubPhase);
        }
        if (conv.language) {
          setLang(conv.language as Lang);
        }
        setMessages([
          {
            role: "assistant",
            content: conv.chat_sub_phase === "enviament" || conv.chat_sub_phase === "document"
              ? t(labels.dataConfirmed, conv.language as Lang || lang)
              : t(labels.collectIntro, conv.language as Lang || lang),
          },
        ]);
        setPhase("chat");
      })
      .catch(() => {/* resume failed — stay on tree */ });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resumeId]);

  // Re-translate currentNode when lang changes mid-navigation
  useEffect(() => {
    if (!currentNode || !nodeMap) return;
    if (currentNode.id === ROOT_NODE_ID) {
      setCurrentNode(getRootNode(lang));
    } else {
      const original = nodeMap.get(currentNode.id);
      if (original) setCurrentNode(translateNode(original, lang));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang, nodeMap]);

  function handleOptionClick(option: DecisionOption, parentNode: DecisionNode) {
    setPath((prev) => [...prev, option.text]);

    if (parentNode.id === ROOT_NODE_ID) {
      setSituacioLegal(inferSituacioFromNextId(option.next));
    }

    if (option.next && nodeMap) {
      const nextNode = nodeMap.get(option.next);
      if (nextNode) {
        setCurrentNode(translateNode(nextNode, lang));
      }
    }
  }

  function startChat() {
    setTransitioning(true);
    const resultNode = currentNode;
    const slugs = resultNode?.slugs ?? [];
    setAuthSlugs(slugs);
    setMode(slugs.length > 0 ? "collection" : "info");

    setTimeout(() => {
      setPhase("chat");
      setTransitioning(false);

      // Welcome message: use the result node's text + note as orientation
      if (resultNode) {
        let fullWelcome = resultNode.text;
        if (resultNode.note) {
          fullWelcome += `\n\n${resultNode.note}`;
        }
        if (slugs.length > 0) {
          fullWelcome += "\n\n" + t(labels.collectIntro, lang);
        } else {
          fullWelcome += "\n\n" + t(labels.askAnything, lang);
        }
        setMessages([{ role: "assistant", content: fullWelcome }]);
      }
    }, 300);
  }

  function handleReset() {
    if (nodeMap) {
      setPath([]);
      setSituacioLegal(null);
      setCurrentNode(getRootNode(lang));
    }
  }

  // ── Chat submit ──────────────────────────────────────────────────

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text || loading) return;
    setInput("");
    await sendChatMessage(text);
  }

  async function sendChatMessage(text: string) {
    if (!text || loading) return;

    lastSentTextRef.current = text;
    setLoading(true);
    setSources([]);

    setMessages((prev) => [...prev, { role: "user", content: text }]);
    setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

    try {
      abortRef.current = new AbortController();
      const resp = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          conversation_id: conversationId,
          situacio_legal: situacioLegal,
          idioma: lang,
          auth_slugs: authSlugs.length > 0 ? authSlugs : undefined,
          mode: mode,
          tree_node_id: currentNode?.id ?? null,
          tree_node_text: currentNode?.text ?? null,
          tree_node_note: currentNode?.note ?? null,
          tree_path: path,
        }),
        signal: abortRef.current.signal,
      });

      if (!resp.ok) {
        const err = await resp.json();
        throw new Error(err.error || `HTTP ${resp.status}`);
      }

      const reader = resp.body!.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          try {
            const event = JSON.parse(line.slice(6));

            if (event.type === "conversation_id") {
              setConversationId(event.conversation_id);
            } else if (event.type === "sources") {
              setSources(event.sources);
            } else if (event.type === "sos") {
              setSosActive(true);
              setSosCategories(event.categories);
              setSosView("emergency");
              // Auto-start recording on SOS
              handleStartRecording(event.sosEventId);
            } else if (event.type === "text") {
              setMessages((prev) => {
                const updated = [...prev];
                const last = updated[updated.length - 1];
                updated[updated.length - 1] = {
                  ...last,
                  content: last.content + event.text,
                };
                return updated;
              });
            } else if (event.type === "consent_request") {
              // Save the user's first message so we can re-send it after
              // they accept consent — the backend's first-turn response is
              // dropped here because we replace the assistant placeholder
              // with the consent card.
              setPendingMessage(lastSentTextRef.current);
              // Inject consent card (guard: no duplicates)
              setMessages((prev) => {
                if (prev.some((m) => m.cardType === "consent")) return prev;
                // Replace the empty assistant placeholder with consent card
                const updated = [...prev];
                updated[updated.length - 1] = {
                  role: "assistant",
                  content: "",
                  cardType: "consent",
                  cardData: { accepted: false },
                };
                return updated;
              });
            } else if (event.type === "data_update") {
              setCollectedData(event.collected);
              setCompletionPct(event.completionPct);
              collectedDataRef.current = event.collected;
              // Live-update the doc checklist card if documents_obtained changed
              const newObtained = (event.collected.documents_obtained as string[]) ?? [];
              setMessages((prev) =>
                prev.map((m) =>
                  m.cardType === "doc_checklist"
                    ? { ...m, cardData: { ...(m.cardData as DocChecklistCardData), documentsObtained: newObtained } }
                    : m
                )
              );
            } else if (event.type === "phase_change") {
              setChatSubPhase(event.phase);
              if (event.phase === "resum") {
                // Inject summary card
                setMessages((prev) => [
                  ...prev,
                  {
                    role: "assistant",
                    content: "",
                    cardType: "summary",
                    cardData: {
                      collected: { ...collectedDataRef.current },
                      authSlugs: authSlugs,
                      confirmed: false,
                    } as SummaryCardData,
                  },
                ]);
              }
            }
          } catch {
            // skip malformed SSE
          }
        }
      }
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : "Error";
      if (errMsg !== "The user aborted a request.") {
        setMessages((prev) => {
          const updated = [...prev];
          updated[updated.length - 1] = {
            role: "assistant",
            content: `Error: ${errMsg}`,
          };
          return updated;
        });
      }
    } finally {
      setLoading(false);
    }
  }

  // ── Collection mode handlers ─────────────────────────────────────

  const handleConsentAcceptInline = useCallback(() => {
    console.log("[consent] handleConsentAcceptInline called, pendingMessage:", pendingMessage, "lastSentTextRef:", lastSentTextRef.current);

    // Mark consent card as accepted
    setMessages((prev) =>
      prev.map((m) =>
        m.cardType === "consent"
          ? { ...m, cardData: { ...m.cardData, accepted: true } }
          : m
      )
    );

    setConsentGiven(true);

    // Record consent server-side — WAIT for this before re-sending, otherwise
    // the re-sent message arrives at the backend before consent_given is true
    // in Supabase and hits the consent gate again.
    const consentPromise = conversationId
      ? fetch("/api/chat/consent", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ conversation_id: conversationId }),
        }).catch(() => {})
      : Promise.resolve();

    const msgToResend = pendingMessage || lastSentTextRef.current;
    console.log("[consent] msgToResend:", msgToResend);

    if (msgToResend) {
      setPendingMessage(null);
      // Only queue the re-send after consent is confirmed server-side
      consentPromise.then(() => {
        console.log("[consent] consent confirmed, queuing resend:", msgToResend);
        setPendingResend(msgToResend);
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversationId, pendingMessage]);

  const handleConsentDeclineInline = useCallback(() => {
    // Remove consent card and reset to info mode
    setMessages((prev) => prev.filter((m) => m.cardType !== "consent"));
    setMode("info");
  }, []);

  const handleSummaryConfirm = useCallback(async () => {
    // Mark summary as confirmed
    setMessages((prev) =>
      prev.map((m) =>
        m.cardType === "summary"
          ? { ...m, cardData: { ...(m.cardData as SummaryCardData), confirmed: true } }
          : m
      )
    );

    setChatSubPhase("document");

    // Tell server about the confirmation (fire and forget)
    if (conversationId) {
      fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: "__CONFIRM_SUMMARY__",
          conversation_id: conversationId,
        }),
      }).catch(() => {});
    }

    // Auto-generate PDFs
    await handleAutoGeneratePdfs();
  }, [conversationId, authSlugs, lang]);

  const handleSummaryCorrect = useCallback(() => {
    setChatSubPhase("conversa");
    // Inject a system message directing the bot to ask what to correct
    setMessages((prev) => [
      ...prev,
      { role: "user", content: t(labels.correctData, lang) },
    ]);
  }, [lang]);

  const handleDocToggle = useCallback(async (slug: string, obtained: boolean) => {
    // Optimistic update
    setMessages((prev) =>
      prev.map((m) =>
        m.cardType === "doc_checklist"
          ? {
              ...m,
              cardData: {
                ...(m.cardData as DocChecklistCardData),
                documentsObtained: obtained
                  ? [...(m.cardData as DocChecklistCardData).documentsObtained, slug]
                  : (m.cardData as DocChecklistCardData).documentsObtained.filter((s) => s !== slug),
              },
            }
          : m
      )
    );
    // Persist to Supabase
    if (conversationId) {
      if (obtained) {
        await fetch("/api/chat/documents", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ conversation_id: conversationId, documents_obtained: [slug] }),
        });
      } else {
        await fetch("/api/chat/documents", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ conversation_id: conversationId, slug }),
        });
      }
    }
  }, [conversationId]);

  async function handleAutoGeneratePdfs() {
    // Inject doc checklist card before the document loader
    const docsObtained = (collectedDataRef.current?.documents_obtained as unknown as string[]) ?? [];
    setMessages((prev) => [
      ...prev,
      {
        role: "assistant",
        content: "",
        cardType: "doc_checklist",
        cardData: { authSlugs, documentsObtained: docsObtained } as DocChecklistCardData,
      },
    ]);

    // Inject loading document card
    setMessages((prev) => [
      ...prev,
      {
        role: "assistant",
        content: "",
        cardType: "document",
        cardData: { documents: [], loading: true } as DocumentCardData,
      },
    ]);

    try {
      const docs: Array<{ name: string; url: string }> = [];

      // Generate PDFs for each auth slug in parallel
      const results = await Promise.all(
        authSlugs.map(async (slug) => {
          const resp = await fetch("/api/pdf/summary", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              personalData: collectedDataRef.current,
              authorizationSlug: slug,
              lang,
            }),
          });

          if (!resp.ok) return null;
          const blob = await resp.blob();
          const url = URL.createObjectURL(blob);
          return { name: `pathfinder-${slug}.pdf`, url };
        })
      );

      for (const result of results) {
        if (result) docs.push(result);
      }

      // Generate filled EX forms for each auth slug
      for (const slug of authSlugs) {
        const exForms = getFormsForAuth(slug);
        for (const exForm of exForms) {
          try {
            const formResp = await fetch("/api/pdf/form", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                personalData: collectedDataRef.current,
                exFormId: exForm.id,
                authSlug: slug,
              }),
            });
            if (formResp.ok) {
              const blob = await formResp.blob();
              const url = URL.createObjectURL(blob);
              docs.push({ name: `${exForm.id}-${slug}.pdf`, url });
            }
          } catch {
            // EX form fill failed — still show summary
          }
        }
      }

      setGeneratedDocs(docs);

      // Update the document card
      setMessages((prev) =>
        prev.map((m) =>
          m.cardType === "document"
            ? { ...m, cardData: { documents: docs, loading: false } as DocumentCardData }
            : m
        )
      );

      // Transition to enviament
      await handleTransitionToEnviament();

      // Show save-progress banner for unauthenticated users
      if (!currentUser && !sessionStorage.getItem("save_banner_dismissed")) {
        setShowSaveBanner(true);
      }
    } catch (err) {
      console.error("PDF generation failed:", err);
      setMessages((prev) =>
        prev.map((m) =>
          m.cardType === "document"
            ? { ...m, cardData: { documents: [], loading: false } as DocumentCardData }
            : m
        )
      );
    }
  }

  async function handleTransitionToEnviament() {
    try {
      const provincia = collectedDataRef.current.provincia;
      if (!provincia || !authSlugs[0]) return;

      const resp = await fetch("/api/email/draft", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          personalData: collectedDataRef.current,
          authSlug: authSlugs[0],
          provincia,
          lang,
        }),
      });

      if (!resp.ok) return;
      const emailData = (await resp.json()) as EmailDraftCardData;

      setChatSubPhase("enviament");
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "",
          cardType: "email_draft",
          cardData: emailData,
        },
      ]);
    } catch (err) {
      console.error("Email draft generation failed:", err);
      // Still move to enviament even if email fails
      setChatSubPhase("enviament");
    }
  }

  // ── Form / PDF handlers (info-mode backward compat) ──────────────

  function handlePrepareDocuments() {
    if (consentGiven) {
      setPhase("form");
    } else {
      setShowConsent(true);
    }
  }

  function handleConsentAccept() {
    setConsentGiven(true);
    setShowConsent(false);
    setPhase("form");
  }

  function handleConsentDecline() {
    setShowConsent(false);
  }

  function handleDataChange(field: PersonalDataField, value: string) {
    setPersonalData((prev) => ({ ...prev, [field]: value }));
  }

  function handleClearData() {
    setPersonalData({ ...EMPTY_PERSONAL_DATA });
  }

  async function handleGeneratePdf() {
    if (!authSlugs.length) return;
    setPdfLoading(true);
    try {
      const resp = await fetch("/api/pdf/summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          personalData,
          authorizationSlug: authSlugs[0],
          lang,
        }),
      });

      if (!resp.ok) {
        const err = await resp.json();
        throw new Error(err.error || `HTTP ${resp.status}`);
      }

      const blob = await resp.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `pathfinder-${authSlugs[0]}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("PDF generation failed:", err);
    } finally {
      setPdfLoading(false);
    }
  }

  // ── Render ────────────────────────────────────────────────────────

  return (
    <div
      dir={lang === "ar" ? "rtl" : "ltr"}
      className={`mx-auto max-w-2xl px-4 sm:px-6 py-5 min-h-screen ${lang === "ar" ? "font-arabic" : "font-sans"}`}
    >
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2.5">
          <div className="logo-mark">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75V15m6-6v8.25m.503 3.498l4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 00-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0z" />
            </svg>
          </div>
          <h1 className="text-lg font-bold text-text">Pathfinder</h1>
        </div>
        <div className="flex items-center gap-2">
          <LanguageSelector lang={lang} onLangChange={setLang} />
          {currentUser && (
            <>
              <a
                href={`/chat/history?lang=${lang}`}
                className="icon-btn outlined hidden sm:inline-flex rounded-lg w-auto px-2.5 gap-1.5 text-xs"
              >
                <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {t(labels.historyTitle, lang)}
              </a>
              <button
                onClick={async () => {
                  await createBrowserSupabase().auth.signOut();
                  window.location.href = `/auth?lang=${lang}`;
                }}
                title={currentUser.email ?? "Logout"}
                className="icon-btn outlined rounded-lg w-auto px-2.5 gap-1.5 text-xs"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
                </svg>
                <span className="hidden sm:inline max-w-[120px] truncate">{currentUser.email}</span>
              </button>
            </>
          )}
        </div>
      </div>

      <hr className="my-3 border-border-light" />

      {/* ── PHASE 1: Decision Tree ─────────────────────────── */}
      {phase === "tree" && currentNode && (
        <TreePhase
          currentNode={currentNode}
          lang={lang}
          path={path}
          transitioning={transitioning}
          onOptionClick={handleOptionClick}
          onStartChat={startChat}
          onReset={handleReset}
        />
      )}

      {/* ── PHASE 2: Chat ──────────────────────────────────── */}
      {phase === "chat" && (
        <ChatPhase
          messages={messages}
          sources={sources}
          input={input}
          loading={loading}
          lang={lang}
          path={path}
          mode={mode}
          chatSubPhase={chatSubPhase}
          completionPct={completionPct}
          onSubmit={handleSubmit}
          onInputChange={setInput}
          onPrepareDocuments={
            mode === "info" && authSlugs.length > 0
              ? handlePrepareDocuments
              : undefined
          }
          onConsentAccept={handleConsentAcceptInline}
          onConsentDecline={handleConsentDeclineInline}
          onSummaryConfirm={handleSummaryConfirm}
          onSummaryCorrect={handleSummaryCorrect}
          onDocToggle={handleDocToggle}
        />
      )}

      {/* Save progress banner (shown after PDF gen for anonymous users) */}
      {showSaveBanner && phase === "chat" && (
        <SaveProgressBanner
          lang={lang}
          onDismiss={() => {
            sessionStorage.setItem("save_banner_dismissed", "1");
            setShowSaveBanner(false);
          }}
        />
      )}

      {/* ── PHASE 3: Form (info-mode backward compat) ──────── */}      {phase === "form" && (
        <FormPhase
          lang={lang}
          data={personalData}
          authSlugs={authSlugs}
          onDataChange={handleDataChange}
          onGeneratePdf={handleGeneratePdf}
          onClear={handleClearData}
          onBack={() => setPhase("chat")}
          pdfLoading={pdfLoading}
        />
      )}

      {/* Consent modal (info-mode only) */}
      {showConsent && mode === "info" && (
        <ConsentModal
          lang={lang}
          onAccept={handleConsentAccept}
          onDecline={handleConsentDecline}
        />
      )}

      {/* Loading tree */}
      {phase === "tree" && !currentNode && (
        <p className="text-text-muted text-center py-8">
          {t(labels.loading, lang)}
        </p>
      )}

      {/* ── SOS Overlay ────────────────────────────────────── */}
      <SosOverlay
        active={sosActive}
        categories={sosCategories}
        view={sosView}
        lang={lang}
        treeRecursosUrgents={treeRecursosUrgents}
        recording={isRecording}
        chunksUploaded={recordingChunks}
        elapsedSeconds={recordingElapsed}
        audioOnly={recordingAudioOnly}
        onClose={() => {
          setSosActive(false);
          sosButtonRef.current?.focus();
        }}
        onViewChange={setSosView}
        onStartRecording={() => handleStartRecording()}
        onStopRecording={handleStopRecording}
      />

      {/* ── SOS Persistent Button ──────────────────────────── */}
      {phase === "chat" &&
        (sosCategories.length > 0 || treeRecursosUrgents.length > 0) &&
        !sosActive && (
          <button
            ref={sosButtonRef}
            onClick={() => {
              setSosActive(true);
              setSosView("emergency");
            }}
            aria-label="Emergency help"
            className="fixed bottom-5 ltr:right-5 rtl:left-5 w-14 h-14 rounded-full bg-danger text-white border-none text-base font-bold cursor-pointer shadow-lg z-[100] hover:bg-danger-dark transition-colors"
          >
            SOS
          </button>
        )}
    </div>
  );
}
