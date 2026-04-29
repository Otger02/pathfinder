"use client";

import { useState } from "react";
import { resolveSosEvent, updateSosNotes } from "./actions";

interface SosEvent {
  id: string;
  user_code: string;
  country: string;
  trigger_text: string;
  timestamp: string;
  resolved: boolean;
  resolved_at: string | null;
  resolved_by: string | null;
  notes: string | null;
  recording_id: string | null;
}

export default function SosRow({ event }: { event: SosEvent }) {
  const [editingNotes, setEditingNotes] = useState(false);
  const [notes, setNotes] = useState(event.notes || "");
  const [resolving, setResolving] = useState(false);

  const tdStyle = {
    padding: "10px 8px",
    borderBottom: "1px solid #f0f0f0",
    verticalAlign: "top" as const,
  };

  async function handleResolve() {
    setResolving(true);
    try {
      await resolveSosEvent(event.id);
    } catch {
      setResolving(false);
    }
  }

  async function handleSaveNotes() {
    await updateSosNotes(event.id, notes);
    setEditingNotes(false);
  }

  return (
    <tr style={{ background: event.resolved ? "#fafafa" : "#fff" }}>
      <td style={{ ...tdStyle, whiteSpace: "nowrap", fontSize: 13 }}>
        {new Date(event.timestamp).toLocaleString("ca-ES")}
      </td>
      <td style={{ ...tdStyle, fontSize: 13, color: "#888" }}>{event.user_code}</td>
      <td style={{ ...tdStyle, maxWidth: 300 }}>{event.trigger_text}</td>
      <td style={tdStyle}>
        {event.resolved ? (
          <span style={{ color: "#4caf50", fontSize: 13 }}>
            Resolt
            {event.resolved_by && <> per {event.resolved_by}</>}
          </span>
        ) : (
          <span
            style={{
              background: "#fff3e0",
              color: "#e65100",
              padding: "2px 8px",
              borderRadius: 4,
              fontSize: 12,
              fontWeight: 600,
            }}
          >
            Pendent
          </span>
        )}
      </td>
      <td style={tdStyle}>
        {event.recording_id ? (
          <a
            href={`/admin/sos/recordings/${event.recording_id}`}
            style={{ color: "#1976d2", textDecoration: "none", fontSize: 12 }}
          >
            Veure
          </a>
        ) : (
          <span style={{ color: "#ccc", fontSize: 12 }}>—</span>
        )}
      </td>
      <td style={{ ...tdStyle, maxWidth: 200 }}>
        {editingNotes ? (
          <div style={{ display: "flex", gap: 4 }}>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              style={{ flex: 1, padding: 4, fontSize: 13, border: "1px solid #ddd", borderRadius: 3 }}
            />
            <button
              onClick={handleSaveNotes}
              style={{
                padding: "4px 8px",
                fontSize: 12,
                background: "#1976d2",
                color: "#fff",
                border: "none",
                borderRadius: 3,
                cursor: "pointer",
              }}
            >
              OK
            </button>
            <button
              onClick={() => setEditingNotes(false)}
              style={{
                padding: "4px 8px",
                fontSize: 12,
                background: "#eee",
                border: "none",
                borderRadius: 3,
                cursor: "pointer",
              }}
            >
              X
            </button>
          </div>
        ) : (
          <span
            style={{ fontSize: 13, color: event.notes ? "#333" : "#ccc", cursor: "pointer" }}
            onClick={() => setEditingNotes(true)}
          >
            {event.notes || "Afegir nota..."}
          </span>
        )}
      </td>
      <td style={tdStyle}>
        {!event.resolved && (
          <button
            onClick={handleResolve}
            disabled={resolving}
            style={{
              padding: "4px 10px",
              fontSize: 12,
              background: resolving ? "#ccc" : "#4caf50",
              color: "#fff",
              border: "none",
              borderRadius: 4,
              cursor: resolving ? "not-allowed" : "pointer",
            }}
          >
            {resolving ? "..." : "Resoldre"}
          </button>
        )}
      </td>
    </tr>
  );
}
