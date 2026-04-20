import { useRef, useEffect, useState } from "react";
import type { Lang, I18nText } from "@/lib/i18n";
import { t, labels } from "@/lib/i18n";
import {
  EMERGENCY_RESOURCES,
  LEGAL_RIGHTS,
  POLICE_SCREEN,
} from "@/lib/sos";
import ResourceCard from "./ResourceCard";

interface RecursUrgent {
  nom: string;
  telefon: string;
  disponibilitat: string;
}

export default function SosOverlay({
  active,
  categories,
  view,
  lang,
  treeRecursosUrgents,
  recording,
  chunksUploaded,
  elapsedSeconds,
  audioOnly,
  onClose,
  onViewChange,
  onStartRecording,
  onStopRecording,
}: {
  active: boolean;
  categories: string[];
  view: "emergency" | "rights" | "police";
  lang: Lang;
  treeRecursosUrgents: RecursUrgent[];
  recording: boolean;
  chunksUploaded: number;
  elapsedSeconds: number;
  audioOnly: boolean;
  onClose: () => void;
  onViewChange: (v: "emergency" | "rights" | "police") => void;
  onStartRecording: () => void;
  onStopRecording: () => void;
}) {
  const firstTabRef = useRef<HTMLButtonElement>(null);
  const [showLegalNotice, setShowLegalNotice] = useState(false);

  useEffect(() => {
    if (active && firstTabRef.current) {
      firstTabRef.current.focus();
    }
  }, [active]);

  // Show legal notice briefly when recording starts
  useEffect(() => {
    if (recording) {
      setShowLegalNotice(true);
      const timer = setTimeout(() => setShowLegalNotice(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [recording]);

  if (!active) return null;

  const relevantResources =
    categories.length > 0
      ? EMERGENCY_RESOURCES.filter((r) =>
          r.categories.some((c) => categories.includes(c))
        )
      : EMERGENCY_RESOURCES;
  const otherResources = EMERGENCY_RESOURCES.filter(
    (r) => !relevantResources.includes(r)
  );

  const policeColors: Record<Lang, string> = {
    es: "bg-[#1a237e]",
    en: "bg-[#0d47a1]",
    ar: "bg-[#1b5e20]",
    fr: "bg-[#4a148c]",
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60).toString().padStart(2, "0");
    const s = (secs % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  return (
    <div
      className="fixed inset-0 z-[9999] bg-white overflow-auto"
      dir={lang === "ar" ? "rtl" : "ltr"}
      role="dialog"
      aria-modal="true"
      aria-label="Emergency help"
    >
      <div className="max-w-[700px] mx-auto p-4">
        {/* Recording status bar */}
        {recording && (
          <div className="bg-danger text-white px-4 py-2 rounded-lg mb-3 flex items-center gap-3 text-sm">
            <span className="w-3 h-3 bg-white rounded-full animate-pulse flex-shrink-0" />
            <span className="font-semibold">{t(labels.recordingActive, lang)}</span>
            <span className="font-mono">{formatTime(elapsedSeconds)}</span>
            <span className="text-white/70">
              {chunksUploaded} {t(labels.chunksUploaded, lang)}
            </span>
            {audioOnly && (
              <span className="text-white/70 text-xs">
                (audio)
              </span>
            )}
            <button
              onClick={onStopRecording}
              className="ml-auto px-3 py-1 bg-white/20 hover:bg-white/30 rounded text-xs font-medium transition-colors"
            >
              {t(labels.stopRecording, lang)}
            </button>
          </div>
        )}

        {/* Legal notice (fades after 5s) */}
        {showLegalNotice && (
          <div className="bg-amber-50 border border-amber-200 text-amber-900 px-4 py-2 rounded-lg mb-3 text-xs leading-relaxed">
            {t(labels.recordingLegalNotice, lang)}
          </div>
        )}

        {/* Close button (not on police view) */}
        {view !== "police" && (
          <button
            onClick={onClose}
            aria-label="Close"
            className="absolute top-3 ltr:right-4 rtl:left-4 bg-transparent border-none text-3xl cursor-pointer text-text-muted hover:text-text z-[10000]"
          >
            ✕
          </button>
        )}

        {/* Tabs */}
        <div className="flex gap-0.5 mb-4" role="tablist">
          {(
            [
              { id: "emergency", label: labels.emergency },
              { id: "rights", label: labels.yourRights },
              { id: "police", label: labels.showToPolice },
            ] as const
          ).map((tab, i) => (
            <button
              key={tab.id}
              ref={i === 0 ? firstTabRef : undefined}
              role="tab"
              aria-selected={view === tab.id}
              onClick={() => onViewChange(tab.id)}
              className={`flex-1 px-2 py-3 text-[15px] font-semibold transition-colors ${
                view === tab.id
                  ? "bg-danger text-white"
                  : "bg-surface text-text hover:bg-gray-200"
              }`}
            >
              {t(tab.label, lang)}
            </button>
          ))}
        </div>

        {/* ── Emergency View ──────────────────────────────── */}
        {view === "emergency" && (
          <div role="tabpanel">
            <div className="bg-danger text-white p-4 rounded-lg mb-4 text-center text-xl font-bold">
              {t(labels.emergencyResources, lang)}
            </div>

            {/* Record evidence button */}
            {!recording && (
              <button
                onClick={onStartRecording}
                className="w-full px-4 py-4 mb-4 text-lg font-bold bg-[#b71c1c] text-white rounded-lg flex items-center justify-center gap-3 hover:bg-[#c62828] transition-colors"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <circle cx="12" cy="12" r="4" fill="currentColor" />
                </svg>
                {t(labels.startRecording, lang)}
              </button>
            )}

            {/* Tree-specific resources first */}
            {treeRecursosUrgents.length > 0 && (
              <div className="mb-4">
                {treeRecursosUrgents.map((r, i) => (
                  <a
                    key={`tree-${i}`}
                    href={`tel:${r.telefon.replace(/\s/g, "")}`}
                    className="block w-full px-4 py-3.5 my-1.5 text-lg font-bold bg-success text-white rounded-lg text-center no-underline"
                  >
                    {"📞 "}
                    {r.nom} — {r.telefon} ({r.disponibilitat})
                  </a>
                ))}
              </div>
            )}

            {/* Relevant global resources */}
            {relevantResources.map((r, i) => (
              <ResourceCard key={`rel-${i}`} resource={r} lang={lang} />
            ))}

            {/* Other resources */}
            {otherResources.length > 0 && (
              <>
                <hr className="my-4 border-t border-border" />
                <p className="text-sm text-text-muted mb-2">
                  {t(labels.otherResources, lang)}
                </p>
                {otherResources.map((r, i) => (
                  <ResourceCard key={`other-${i}`} resource={r} lang={lang} />
                ))}
              </>
            )}
          </div>
        )}

        {/* ── Rights View ─────────────────────────────────── */}
        {view === "rights" && (
          <div role="tabpanel">
            {LEGAL_RIGHTS.map((right, i) => (
              <div
                key={i}
                className="p-4 my-2 bg-surface ltr:border-l-4 rtl:border-r-4 border-primary rounded"
              >
                <h3 className="text-lg font-semibold mb-1">
                  {t(right.title as I18nText, lang)}
                </h3>
                <p className="text-base leading-relaxed mb-1">
                  {t(right.body as I18nText, lang)}
                </p>
                <p className="text-sm text-text-muted">{right.law}</p>
              </div>
            ))}
          </div>
        )}

        {/* ── Police View (all 4 languages) ──────────────── */}
        {view === "police" && (
          <div role="tabpanel" dir="ltr">
            <button
              onClick={() => onViewChange("emergency")}
              className="mb-2 text-xl text-text-faint bg-transparent border-none cursor-pointer"
            >
              {"← "}
              {t(labels.back, lang)}
            </button>

            {(["es", "en", "ar", "fr"] as Lang[]).map((l) => (
              <div
                key={l}
                className={`p-5 mb-4 ${policeColors[l]} text-white rounded-lg`}
                dir={l === "ar" ? "rtl" : "ltr"}
              >
                <h2 className="text-[22px] font-semibold mb-3">
                  {POLICE_SCREEN.title[l]}
                </h2>
                <p className="text-lg leading-relaxed whitespace-pre-wrap">
                  {POLICE_SCREEN.body[l]}
                </p>
              </div>
            ))}

            <p className="text-center text-sm text-text-faint mt-4">
              Pathfinder — Fundació Tierra Digna
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
