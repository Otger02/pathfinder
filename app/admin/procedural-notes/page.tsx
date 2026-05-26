import { createServiceClient } from "@/lib/supabase";
import Link from "next/link";

interface Note {
  id: string;
  authorization_slug: string | null;
  scope: "province" | "ccaa" | "national" | "consulate";
  province_iso: string | null;
  ccaa_code: string | null;
  country_iso: string | null;
  severity: "blocker" | "workaround" | "warning" | "info";
  practical_text: string;
  source: string | null;
  active: boolean;
  verified_by: string[] | null;
  updated_at: string;
}

const SEVERITY_BADGE: Record<
  Note["severity"],
  { label: string; bg: string; color: string }
> = {
  blocker: { label: "BLOCKER", bg: "#fee2e2", color: "#b91c1c" },
  workaround: { label: "WORKAROUND", bg: "#fef3c7", color: "#92400e" },
  warning: { label: "WARNING", bg: "#fef3c7", color: "#92400e" },
  info: { label: "INFO", bg: "#dbeafe", color: "#1d4ed8" },
};

function scopeLabel(note: Note): string {
  if (note.scope === "national") return "Nacional";
  if (note.scope === "province" && note.province_iso) return note.province_iso;
  if (note.scope === "ccaa" && note.ccaa_code) return note.ccaa_code;
  if (note.scope === "consulate" && note.country_iso) {
    return `Consolat ${note.country_iso}`;
  }
  return note.scope;
}

export default async function ProceduralNotesPage() {
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("procedural_notes")
    .select(
      "id, authorization_slug, scope, province_iso, ccaa_code, country_iso, severity, practical_text, source, active, verified_by, updated_at"
    )
    .order("severity", { ascending: true })
    .order("updated_at", { ascending: false });

  const notes = (data || []) as Note[];

  const thStyle = {
    textAlign: "left" as const,
    padding: "10px 8px",
    fontSize: 13,
    fontWeight: 600,
    color: "#666",
    borderBottom: "2px solid #eee",
  };

  const tdStyle = {
    padding: "10px 8px",
    borderBottom: "1px solid #f0f0f0",
    fontSize: 14,
    verticalAlign: "top" as const,
  };

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 20,
        }}
      >
        <div>
          <h1 style={{ margin: 0, fontSize: 22 }}>Notes procedimentals</h1>
          <p
            style={{
              margin: "4px 0 0",
              fontSize: 13,
              color: "#666",
              maxWidth: 600,
            }}
          >
            Distància entre el que diu la llei i el que passa realment a les
            oficines, per província, CCAA o consolat. La taula més valuosa del
            sistema — només dades verificades.
          </p>
        </div>
        <Link
          href="/admin/procedural-notes/new"
          style={{
            padding: "8px 16px",
            fontSize: 14,
            background: "#1976d2",
            color: "#fff",
            textDecoration: "none",
            borderRadius: 4,
            whiteSpace: "nowrap" as const,
          }}
        >
          + Nova nota
        </Link>
      </div>

      {error && (
        <div
          style={{
            padding: 12,
            background: "#fee2e2",
            color: "#b91c1c",
            borderRadius: 4,
            fontSize: 14,
            marginBottom: 16,
          }}
        >
          Error carregant: {error.message}
        </div>
      )}

      {notes.length === 0 ? (
        <div
          style={{
            padding: 40,
            textAlign: "center",
            color: "#888",
            background: "#fff",
            borderRadius: 8,
          }}
        >
          Encara no hi ha notes procedimentals. Crea la primera per començar
          a documentar el que passa realment al carrer.
        </div>
      ) : (
        <div
          style={{
            background: "#fff",
            borderRadius: 8,
            overflow: "auto",
            boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
          }}
        >
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th style={thStyle}>Gravetat</th>
                <th style={thStyle}>Àmbit</th>
                <th style={thStyle}>Autorització</th>
                <th style={thStyle}>Aplicació real</th>
                <th style={thStyle}>Verif.</th>
                <th style={thStyle}>Activa</th>
                <th style={thStyle}></th>
              </tr>
            </thead>
            <tbody>
              {notes.map((n) => {
                const sev = SEVERITY_BADGE[n.severity];
                return (
                  <tr key={n.id}>
                    <td style={tdStyle}>
                      <span
                        style={{
                          padding: "2px 6px",
                          background: sev.bg,
                          color: sev.color,
                          borderRadius: 3,
                          fontSize: 11,
                          fontWeight: 700,
                          whiteSpace: "nowrap" as const,
                        }}
                      >
                        {sev.label}
                      </span>
                    </td>
                    <td style={tdStyle}>
                      <code
                        style={{
                          fontSize: 12,
                          background: "#f5f5f5",
                          padding: "1px 4px",
                          borderRadius: 2,
                        }}
                      >
                        {scopeLabel(n)}
                      </code>
                    </td>
                    <td style={tdStyle}>
                      {n.authorization_slug ? (
                        <code style={{ fontSize: 12 }}>
                          {n.authorization_slug}
                        </code>
                      ) : (
                        <span style={{ color: "#aaa", fontSize: 12 }}>
                          (totes)
                        </span>
                      )}
                    </td>
                    <td style={{ ...tdStyle, maxWidth: 360 }}>
                      <div
                        style={{
                          display: "-webkit-box",
                          WebkitBoxOrient: "vertical",
                          WebkitLineClamp: 2,
                          overflow: "hidden",
                          fontSize: 13,
                        }}
                      >
                        {n.practical_text}
                      </div>
                      {n.source && (
                        <div
                          style={{
                            fontSize: 11,
                            color: "#888",
                            marginTop: 2,
                          }}
                        >
                          {n.source}
                        </div>
                      )}
                    </td>
                    <td style={tdStyle}>
                      <span style={{ fontSize: 12, color: "#666" }}>
                        {n.verified_by?.length ?? 0}
                      </span>
                    </td>
                    <td style={tdStyle}>
                      {n.active ? (
                        <span
                          style={{
                            fontSize: 11,
                            color: "#16a34a",
                            fontWeight: 600,
                          }}
                        >
                          ✓
                        </span>
                      ) : (
                        <span
                          style={{
                            fontSize: 11,
                            color: "#aaa",
                          }}
                        >
                          —
                        </span>
                      )}
                    </td>
                    <td style={tdStyle}>
                      <Link
                        href={`/admin/procedural-notes/${n.id}`}
                        style={{
                          color: "#1976d2",
                          fontSize: 13,
                          textDecoration: "none",
                        }}
                      >
                        Editar
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
