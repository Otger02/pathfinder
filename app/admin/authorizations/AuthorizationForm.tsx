import Link from "next/link";

const SITUACIO_OPTIONS = [
  "",
  "sense_autoritzacio",
  "amb_autoritzacio",
  "ue",
  "asil",
  "apatrida",
  "general",
];

interface AuthorizationData {
  slug?: string;
  nom?: Record<string, string>;
  descripcio?: Record<string, string>;
  requisits?: unknown;
  passos?: unknown;
  lleis?: unknown;
  country?: string;
  situacio_legal?: string | null;
  termini_dies?: number | null;
  silenci_admin?: string | null;
}

export default function AuthorizationForm({
  action,
  initial,
  deleteAction,
}: {
  action: (formData: FormData) => Promise<void>;
  initial?: AuthorizationData;
  deleteAction?: () => Promise<void>;
}) {
  const inputStyle = {
    width: "100%",
    padding: 8,
    fontSize: 14,
    border: "1px solid #ddd",
    borderRadius: 4,
    boxSizing: "border-box" as const,
  };

  const labelStyle = {
    display: "block",
    marginBottom: 4,
    fontSize: 13,
    fontWeight: 500 as const,
    color: "#555",
  };

  const fieldGroup = { marginBottom: 16 };

  const jsonDefault = (val: unknown, fallback: string) => {
    if (!val) return fallback;
    return JSON.stringify(val, null, 2);
  };

  return (
    <div style={{ background: "#fff", padding: 24, borderRadius: 8, maxWidth: 700, boxShadow: "0 1px 3px rgba(0,0,0,0.08)" }}>
      <form action={action}>
        <div style={fieldGroup}>
          <label style={labelStyle}>Slug *</label>
          <input
            name="slug"
            required
            defaultValue={initial?.slug || ""}
            style={{ ...inputStyle, fontFamily: "monospace" }}
            placeholder="arraigo-social"
          />
        </div>

        <div style={{ display: "flex", gap: 12, ...fieldGroup }}>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>País</label>
            <input name="country" defaultValue={initial?.country || "ES"} style={inputStyle} />
          </div>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>Situació legal</label>
            <select name="situacio_legal" defaultValue={initial?.situacio_legal || ""} style={inputStyle}>
              {SITUACIO_OPTIONS.map((s) => (
                <option key={s} value={s}>{s || "— Cap —"}</option>
              ))}
            </select>
          </div>
        </div>

        <div style={{ display: "flex", gap: 12, ...fieldGroup }}>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>Termini (dies)</label>
            <input
              name="termini_dies"
              type="number"
              defaultValue={initial?.termini_dies ?? ""}
              style={inputStyle}
            />
          </div>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>Silenci administratiu</label>
            <select name="silenci_admin" defaultValue={initial?.silenci_admin || ""} style={inputStyle}>
              <option value="">— Cap —</option>
              <option value="positiu">Positiu</option>
              <option value="negatiu">Negatiu</option>
            </select>
          </div>
        </div>

        <p style={{ fontSize: 12, color: "#888", margin: "0 0 12px" }}>
          Els camps JSON han de ser vàlids. Claus: codis ISO 639-1 (es, en, ar, fr).
        </p>

        <div style={fieldGroup}>
          <label style={labelStyle}>Nom (JSON multilingüe) *</label>
          <textarea
            name="nom"
            required
            rows={3}
            defaultValue={jsonDefault(initial?.nom, '{"es": "", "en": ""}')}
            style={{ ...inputStyle, fontFamily: "monospace", fontSize: 13, resize: "vertical" as const }}
          />
        </div>

        <div style={fieldGroup}>
          <label style={labelStyle}>Descripció (JSON multilingüe)</label>
          <textarea
            name="descripcio"
            rows={4}
            defaultValue={jsonDefault(initial?.descripcio, "{}")}
            style={{ ...inputStyle, fontFamily: "monospace", fontSize: 13, resize: "vertical" as const }}
          />
        </div>

        <div style={fieldGroup}>
          <label style={labelStyle}>Requisits (JSON array)</label>
          <textarea
            name="requisits"
            rows={6}
            defaultValue={jsonDefault(initial?.requisits, "[]")}
            style={{ ...inputStyle, fontFamily: "monospace", fontSize: 13, resize: "vertical" as const }}
          />
        </div>

        <div style={fieldGroup}>
          <label style={labelStyle}>Passos (JSON array)</label>
          <textarea
            name="passos"
            rows={6}
            defaultValue={jsonDefault(initial?.passos, "[]")}
            style={{ ...inputStyle, fontFamily: "monospace", fontSize: 13, resize: "vertical" as const }}
          />
        </div>

        <div style={fieldGroup}>
          <label style={labelStyle}>Lleis (JSON array)</label>
          <textarea
            name="lleis"
            rows={4}
            defaultValue={jsonDefault(initial?.lleis, "[]")}
            style={{ ...inputStyle, fontFamily: "monospace", fontSize: 13, resize: "vertical" as const }}
          />
        </div>

        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <button
            type="submit"
            style={{
              padding: "10px 20px",
              fontSize: 14,
              fontWeight: 600,
              background: "#1976d2",
              color: "#fff",
              border: "none",
              borderRadius: 4,
              cursor: "pointer",
            }}
          >
            Guardar
          </button>

          <Link
            href="/admin/authorizations"
            style={{ fontSize: 14, color: "#666", textDecoration: "none" }}
          >
            Cancel·lar
          </Link>

          {deleteAction && (
            <form action={deleteAction} style={{ marginLeft: "auto" }}>
              <button
                type="submit"
                style={{
                  padding: "8px 16px",
                  fontSize: 13,
                  background: "#fff",
                  color: "#d32f2f",
                  border: "1px solid #d32f2f",
                  borderRadius: 4,
                  cursor: "pointer",
                }}
              >
                Eliminar
              </button>
            </form>
          )}
        </div>
      </form>
    </div>
  );
}
