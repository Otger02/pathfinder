import Link from "next/link";

const RESOURCE_TYPES = [
  "ong",
  "legal_aid",
  "government",
  "shelter",
  "health",
  "education",
  "employment",
  "other",
];

interface ResourceData {
  nom?: string;
  tipus?: string;
  country?: string;
  city?: string | null;
  adreca?: string | null;
  telefon?: string | null;
  email?: string | null;
  web?: string | null;
  idiomes?: string[];
  especialitat?: string[];
  horari?: string | null;
  notes?: string | null;
  province_iso?: string | null;
  ccaa_code?: string | null;
  target_populations?: string[];
  free_of_charge?: boolean | null;
  appointment_required?: boolean | null;
  description?: Record<string, string> | null;
  verified_by?: string | null;
  verified_date?: string | null;
  active?: boolean;
}

export default function ResourceForm({
  action,
  initial,
  deleteAction,
}: {
  action: (formData: FormData) => Promise<void>;
  initial?: ResourceData;
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

  return (
    <div style={{ background: "#fff", padding: 24, borderRadius: 8, maxWidth: 600, boxShadow: "0 1px 3px rgba(0,0,0,0.08)" }}>
      <form action={action}>
        <div style={fieldGroup}>
          <label style={labelStyle}>Nom *</label>
          <input name="nom" required defaultValue={initial?.nom || ""} style={inputStyle} />
        </div>

        <div style={fieldGroup}>
          <label style={labelStyle}>Tipus *</label>
          <select name="tipus" required defaultValue={initial?.tipus || "ong"} style={inputStyle}>
            {RESOURCE_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>

        <div style={{ display: "flex", gap: 12, ...fieldGroup }}>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>País</label>
            <input name="country" defaultValue={initial?.country || "ES"} style={inputStyle} />
          </div>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>Ciutat</label>
            <input name="city" defaultValue={initial?.city || ""} style={inputStyle} />
          </div>
        </div>

        <div style={{ display: "flex", gap: 12, ...fieldGroup }}>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>Province ISO</label>
            <input name="province_iso" defaultValue={initial?.province_iso || ""} style={inputStyle} placeholder="ES-B" />
          </div>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>CCAA ISO</label>
            <input name="ccaa_code" defaultValue={initial?.ccaa_code || ""} style={inputStyle} placeholder="ES-CT" />
          </div>
        </div>

        <div style={fieldGroup}>
          <label style={labelStyle}>Adreça</label>
          <input name="adreca" defaultValue={initial?.adreca || ""} style={inputStyle} />
        </div>

        <div style={{ display: "flex", gap: 12, ...fieldGroup }}>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>Telèfon</label>
            <input name="telefon" defaultValue={initial?.telefon || ""} style={inputStyle} />
          </div>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>Email</label>
            <input name="email" type="email" defaultValue={initial?.email || ""} style={inputStyle} />
          </div>
        </div>

        <div style={fieldGroup}>
          <label style={labelStyle}>Web</label>
          <input name="web" defaultValue={initial?.web || ""} style={inputStyle} />
        </div>

        <div style={{ display: "flex", gap: 12, ...fieldGroup }}>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>Idiomes (separats per coma)</label>
            <input
              name="idiomes"
              defaultValue={(initial?.idiomes || []).join(", ")}
              style={inputStyle}
              placeholder="es, en, ar, fr"
            />
          </div>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>Especialitat (separats per coma)</label>
            <input
              name="especialitat"
              defaultValue={(initial?.especialitat || []).join(", ")}
              style={inputStyle}
              placeholder="asil, trata, menors"
            />
          </div>
        </div>

        <div style={fieldGroup}>
          <label style={labelStyle}>Horari</label>
          <input name="horari" defaultValue={initial?.horari || ""} style={inputStyle} placeholder="L-V 9-17h" />
        </div>

        <div style={fieldGroup}>
          <label style={labelStyle}>Notes</label>
          <textarea
            name="notes"
            defaultValue={initial?.notes || ""}
            rows={3}
            style={{ ...inputStyle, resize: "vertical" as const }}
          />
        </div>

        <div style={fieldGroup}>
          <label style={labelStyle}>Descripció (ca)</label>
          <textarea
            name="description_ca"
            defaultValue={initial?.description?.ca || ""}
            rows={2}
            style={{ ...inputStyle, resize: "vertical" as const }}
          />
        </div>

        <div style={fieldGroup}>
          <label style={labelStyle}>Descripción (es)</label>
          <textarea
            name="description_es"
            defaultValue={initial?.description?.es || ""}
            rows={2}
            style={{ ...inputStyle, resize: "vertical" as const }}
          />
        </div>

        <div style={fieldGroup}>
          <label style={labelStyle}>Description (en)</label>
          <textarea
            name="description_en"
            defaultValue={initial?.description?.en || ""}
            rows={2}
            style={{ ...inputStyle, resize: "vertical" as const }}
          />
        </div>

        <div style={fieldGroup}>
          <label style={labelStyle}>Target populations (separades per coma)</label>
          <input
            name="target_populations"
            defaultValue={(initial?.target_populations || []).join(", ")}
            style={inputStyle}
            placeholder="general, asylum_seekers, women_victims"
          />
        </div>

        <div style={{ display: "flex", gap: 12, ...fieldGroup }}>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>Cita prèvia</label>
            <select
              name="appointment_required"
              defaultValue={
                initial?.appointment_required === null || initial?.appointment_required === undefined
                  ? ""
                  : String(initial.appointment_required)
              }
              style={inputStyle}
            >
              <option value="">No especificat</option>
              <option value="true">Sí</option>
              <option value="false">No</option>
            </select>
          </div>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>Verificat per</label>
            <input name="verified_by" defaultValue={initial?.verified_by || ""} style={inputStyle} placeholder="Alba" />
          </div>
        </div>

        <div style={{ display: "flex", gap: 12, ...fieldGroup }}>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>Data de verificació</label>
            <input name="verified_date" type="date" defaultValue={initial?.verified_date || ""} style={inputStyle} />
          </div>
          <div style={{ flex: 1, display: "flex", gap: 16, alignItems: "center", paddingTop: 24 }}>
            <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14 }}>
              <input
                name="free_of_charge"
                type="checkbox"
                defaultChecked={initial?.free_of_charge ?? true}
              />
              Gratis
            </label>
            <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14 }}>
              <input name="active" type="checkbox" defaultChecked={initial?.active ?? true} />
              Actiu
            </label>
          </div>
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
            href="/admin/resources"
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
