import { useRef, useEffect, useState, FormEvent } from "react";
import type { Lang } from "@/lib/i18n";
import { t, labels } from "@/lib/i18n";
import type { ChatMessage, ChatSubPhase } from "@/lib/types/chat-flow";
import { getPreferredAudioMimeType } from "@/lib/media-permissions";
import PathChips from "./PathChips";
import MessageBubble from "./MessageBubble";
import ProgressTabs from "./ProgressTabs";

// Minimal Web Speech API typings (browser-vendor-prefixed, no global types)
interface SpeechRecognitionResult {
  transcript: string;
}
interface SpeechRecognitionEvent {
  results: Array<Array<SpeechRecognitionResult>>;
}
interface SpeechRecognitionInstance {
  lang: string;
  interimResults: boolean;
  maxAlternatives: number;
  onresult: ((e: SpeechRecognitionEvent) => void) | null;
  onend: (() => void) | null;
  onerror: (() => void) | null;
  start: () => void;
  stop: () => void;
}
type SpeechRecognitionCtor = new () => SpeechRecognitionInstance;
const SR_LANG_MAP: Record<string, string> = {
  ca: "ca-ES",
  es: "es-ES",
  en: "en-US",
  fr: "fr-FR",
  ar: "ar-SA",
};

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
  onDocToggle,
  onAttachDocument,
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
  onDocToggle?: (slug: string, obtained: boolean) => void;
  onAttachDocument?: (file: File) => void;
}) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const voiceSubmitPending = useRef(false);
  const [recording, setRecording] = useState(false);
  const [srUnsupported, setSrUnsupported] = useState(false);
  const [transcribing, setTranscribing] = useState(false);
  const [voiceError, setVoiceError] = useState<string | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Auto-submit once input state reflects the voice transcript
  useEffect(() => {
    if (voiceSubmitPending.current && input.trim()) {
      voiceSubmitPending.current = false;
      formRef.current?.requestSubmit();
    }
  }, [input]);

  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
        mediaRecorderRef.current.stop();
      }
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  const inputDisabled =
    loading ||
    transcribing ||
    (mode === "collection" &&
      (chatSubPhase === "resum" || chatSubPhase === "document"));

  async function transcribeAudio(blob: Blob) {
    setVoiceError(null);
    setTranscribing(true);

    try {
      const formData = new FormData();
      formData.append("audio", new File([blob], "voice-input.webm", { type: blob.type || "audio/webm" }));
      formData.append("lang", SR_LANG_MAP[lang] ?? "es-ES");

      const response = await fetch("/api/chat/transcribe", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      const data = (await response.json()) as { text?: string };
      const transcript = typeof data.text === "string" ? data.text.trim() : "";
      if (!transcript) {
        setVoiceError(t(labels.voiceInputFailed, lang));
        return;
      }

      voiceSubmitPending.current = true;
      onInputChange(transcript);
    } catch {
      setVoiceError(t(labels.voiceInputFailed, lang));
    } finally {
      setTranscribing(false);
    }
  }

  function startBrowserSpeechFallback() {
    if (typeof window === "undefined") return;
    const w = window as unknown as {
      SpeechRecognition?: SpeechRecognitionCtor;
      webkitSpeechRecognition?: SpeechRecognitionCtor;
    };
    const SR = w.SpeechRecognition || w.webkitSpeechRecognition;
    if (!SR) {
      setSrUnsupported(true);
      return;
    }

    const recognition = new SR();
    recognition.lang = SR_LANG_MAP[lang] ?? "es-ES";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.onresult = (e) => {
      const transcript = e.results[0]?.[0]?.transcript ?? "";
      if (transcript) {
        voiceSubmitPending.current = true;
        onInputChange(transcript);
      }
    };
    recognition.onend = () => setRecording(false);
    recognition.onerror = () => setRecording(false);
    recognitionRef.current = recognition;
    setRecording(true);
    recognition.start();
  }

  async function startVoiceInput() {
    if (recording) {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
        mediaRecorderRef.current.stop();
        return;
      }
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      return;
    }

    setVoiceError(null);

    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === "undefined") {
      startBrowserSpeechFallback();
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = getPreferredAudioMimeType();
      const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);

      audioChunksRef.current = [];
      mediaStreamRef.current = stream;
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      recorder.onerror = () => {
        setRecording(false);
        setVoiceError(t(labels.voiceInputFailed, lang));
      };

      recorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, {
          type: recorder.mimeType || mimeType || "audio/webm",
        });
        mediaStreamRef.current?.getTracks().forEach((track) => track.stop());
        mediaStreamRef.current = null;
        mediaRecorderRef.current = null;
        audioChunksRef.current = [];
        setRecording(false);

        if (audioBlob.size > 0) {
          await transcribeAudio(audioBlob);
        }
      };

      setRecording(true);
      recorder.start();
    } catch {
      startBrowserSpeechFallback();
    }
  }

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

      {voiceError && (
        <div className="mb-3 text-sm text-danger">{voiceError}</div>
      )}

      {transcribing && (
        <div className="mb-3 text-sm text-text-muted">{t(labels.transcribingVoice, lang)}</div>
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
            onDocToggle={onDocToggle}
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
        ref={formRef}
        onSubmit={onSubmit}
        className="flex gap-2 sticky bottom-0 bg-surface-alt py-3 border-t border-border-light"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => onInputChange(e.target.value)}
          placeholder={t(labels.inputPlaceholder, lang)}
          disabled={inputDisabled}
          aria-label={t(labels.inputPlaceholder, lang)}
          className="input flex-1"
        />
        {onAttachDocument && (
          <>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,application/pdf"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) onAttachDocument(file);
                // Reset so picking the same file again re-triggers onChange
                e.target.value = "";
              }}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={inputDisabled}
              aria-label={t(labels.attachDocument, lang)}
              title={t(labels.attachDocumentHint, lang)}
              className="icon-btn outlined shrink-0 rounded-xl"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M18.375 12.739l-7.693 7.693a4.5 4.5 0 01-6.364-6.364l10.94-10.94A3 3 0 1119.5 7.372L8.552 18.32m.009-.01l-.01.01m5.699-9.941l-7.81 7.81a1.5 1.5 0 002.112 2.13" />
              </svg>
            </button>
          </>
        )}
        {!srUnsupported && (
          <button
            type="button"
            onClick={startVoiceInput}
            disabled={inputDisabled}
            aria-label={recording ? t(labels.stopVoiceInput, lang) : t(labels.startVoiceInput, lang)}
            className={`icon-btn outlined shrink-0 rounded-xl ${
              recording ? "bg-danger! text-white! border-danger! animate-pulse" : ""
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
            </svg>
          </button>
        )}
        <button
          type="submit"
          disabled={inputDisabled}
          className="btn shrink-0"
        >
          {loading ? "..." : t(labels.sendButton, lang)}
        </button>
      </form>
    </div>
  );
}
