"use client";

import { useState, useEffect, FormEvent } from "react";
import type { Lang } from "@/lib/i18n";
import { t, labels } from "@/lib/i18n";

interface Note {
  id: string;
  content: string;
  created_at: string;
}

interface NotesPanelProps {
  conversationId: string;
  lang: Lang;
}

function formatTimestamp(iso: string, lang: Lang): string {
  try {
    const date = new Date(iso);
    return date.toLocaleString(
      lang === "ca" ? "ca-ES" : lang === "ar" ? "ar" : lang,
      {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }
    );
  } catch {
    return iso;
  }
}

export default function NotesPanel({ conversationId, lang }: NotesPanelProps) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadNotes = async () => {
    try {
      const resp = await fetch(`/api/cases/${conversationId}/notes`);
      if (!resp.ok) throw new Error("load failed");
      const data = (await resp.json()) as { notes: Note[] };
      setNotes(data.notes);
    } catch {
      setError("load");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversationId]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!draft.trim() || saving) return;
    setSaving(true);
    setError(null);
    try {
      const resp = await fetch(`/api/cases/${conversationId}/notes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: draft.trim() }),
      });
      if (!resp.ok) throw new Error("save failed");
      const data = (await resp.json()) as { note: Note };
      setNotes((prev) => [data.note, ...prev]);
      setDraft("");
    } catch {
      setError("save");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (noteId: string) => {
    setError(null);
    // Optimistic remove
    const previous = notes;
    setNotes((prev) => prev.filter((n) => n.id !== noteId));
    try {
      const resp = await fetch(`/api/cases/${conversationId}/notes`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ note_id: noteId }),
      });
      if (!resp.ok) throw new Error("delete failed");
    } catch {
      // Restore on failure
      setNotes(previous);
      setError("delete");
    }
  };

  return (
    <section className="card flat" aria-labelledby="notes-title">
      <h2
        id="notes-title"
        className="text-base font-semibold mb-3"
        style={{ color: "var(--ink)" }}
      >
        {t(labels.notesTitle, lang)}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-2">
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder={t(labels.notesPlaceholder, lang)}
          rows={3}
          maxLength={4000}
          disabled={saving}
          className="input w-full"
          style={{ resize: "vertical", minHeight: 72 }}
        />
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={!draft.trim() || saving}
            className="btn"
          >
            {t(labels.notesAdd, lang)}
          </button>
        </div>
      </form>

      {error && (
        <p
          className="mt-2 text-sm"
          role="alert"
          style={{ color: "var(--danger-2)" }}
        >
          {error === "load" && "Could not load notes."}
          {error === "save" && "Could not save the note."}
          {error === "delete" && "Could not delete the note."}
        </p>
      )}

      <ul className="mt-4 space-y-2">
        {loading ? (
          <li className="text-sm" style={{ color: "var(--ink-3)" }}>
            ...
          </li>
        ) : notes.length === 0 ? (
          <li
            className="text-sm italic"
            style={{ color: "var(--ink-3)" }}
          >
            {t(labels.notesEmpty, lang)}
          </li>
        ) : (
          notes.map((note) => (
            <li
              key={note.id}
              className="card flat"
              style={{ padding: 10, background: "var(--surface)" }}
            >
              <div className="flex justify-between items-start gap-3">
                <div className="flex-1 min-w-0">
                  <p
                    className="text-sm whitespace-pre-wrap break-words"
                    style={{ color: "var(--ink-2)" }}
                  >
                    {note.content}
                  </p>
                  <p
                    className="text-[11px] mt-1"
                    style={{ color: "var(--ink-3)" }}
                  >
                    {formatTimestamp(note.created_at, lang)}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleDelete(note.id)}
                  className="text-xs underline shrink-0"
                  style={{ color: "var(--ink-3)" }}
                  aria-label={t(labels.notesDelete, lang)}
                >
                  {t(labels.notesDelete, lang)}
                </button>
              </div>
            </li>
          ))
        )}
      </ul>
    </section>
  );
}
