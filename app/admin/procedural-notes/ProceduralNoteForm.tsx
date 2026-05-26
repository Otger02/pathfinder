"use client";

import { useState } from "react";
import Link from "next/link";

interface AuthOption {
  slug: string;
  label: string;
}

interface NoteData {
  authorization_slug?: string | null;
  scope?: string;
  province_iso?: string | null;
  ccaa_code?: string | null;
  country_iso?: string | null;
  legal_text?: string | null;
  practical_text?: string;
  severity?: string;
  source?: string | null;
  source_date?: string | null;
  tags?: string[];
  active?: boolean;
  verified_by?: string[];
}

const SCOPES = [
  { value: "national", label: "Nacional (tot Espanya)" },
  { value: "ccaa", label: "Comunitat Autònoma" },
  { value: "province", label: "Província" },
  { value: "consulate", label: "Consolat (per país d'origen)" },
];

const SEVERITIES = [
  { value: "blocker", label: "Blocker — atura el tràmit", color: "#dc2626" },
  { value: "workaround", label: "Workaround — hi ha solució", color: "#d97706" },
  { value: "warning", label: "Warning — vés amb compte", color: "#d97706" },
  { value: "info", label: "Info — context útil", color: "#3b82f6" },
];

// ES province ISO codes
const PROVINCES = [
  ["ES-C", "A Coruña"],
  ["ES-VI", "Álava (Araba)"],
  ["ES-AB", "Albacete"],
  ["ES-A", "Alacant / Alicante"],
  ["ES-AL", "Almería"],
  ["ES-O", "Asturias"],
  ["ES-AV", "Ávila"],
  ["ES-BA", "Badajoz"],
  ["ES-B", "Barcelona"],
  ["ES-BI", "Bizkaia"],
  ["ES-BU", "Burgos"],
  ["ES-CC", "Cáceres"],
  ["ES-CA", "Cádiz"],
  ["ES-CS", "Castelló"],
  ["ES-CE", "Ceuta"],
  ["ES-CR", "Ciudad Real"],
  ["ES-CO", "Córdoba"],
  ["ES-CU", "Cuenca"],
  ["ES-SS", "Gipuzkoa"],
  ["ES-GI", "Girona"],
  ["ES-GR", "Granada"],
  ["ES-GU", "Guadalajara"],
  ["ES-H", "Huelva"],
  ["ES-HU", "Huesca"],
  ["ES-PM", "Illes Balears"],
  ["ES-J", "Jaén"],
  ["ES-LO", "La Rioja"],
  ["ES-GC", "Las Palmas"],
  ["ES-LE", "León"],
  ["ES-L", "Lleida"],
  ["ES-LU", "Lugo"],
  ["ES-M", "Madrid"],
  ["ES-MA", "Málaga"],
  ["ES-ML", "Melilla"],
  ["ES-MU", "Murcia"],
  ["ES-NA", "Navarra"],
  ["ES-OR", "Ourense"],
  ["ES-P", "Palencia"],
  ["ES-PO", "Pontevedra"],
  ["ES-S", "Cantabria"],
  ["ES-SA", "Salamanca"],
  ["ES-TF", "Santa Cruz de Tenerife"],
  ["ES-SG", "Segovia"],
  ["ES-SE", "Sevilla"],
  ["ES-SO", "Soria"],
  ["ES-T", "Tarragona"],
  ["ES-TE", "Teruel"],
  ["ES-TO", "Toledo"],
  ["ES-V", "Valencia"],
  ["ES-VA", "Valladolid"],
  ["ES-ZA", "Zamora"],
  ["ES-Z", "Zaragoza"],
];

const CCAAS = [
  ["ES-AN", "Andalusia"],
  ["ES-AR", "Aragó"],
  ["ES-AS", "Astúries"],
  ["ES-CN", "Canàries"],
  ["ES-CB", "Cantàbria"],
  ["ES-CL", "Castella i Lleó"],
  ["ES-CM", "Castella-La Manxa"],
  ["ES-CT", "Catalunya"],
  ["ES-CE", "Ceuta"],
  ["ES-EX", "Extremadura"],
  ["ES-GA", "Galícia"],
  ["ES-IB", "Illes Balears"],
  ["ES-RI", "La Rioja"],
  ["ES-MD", "Madrid"],
  ["ES-ML", "Melilla"],
  ["ES-MC", "Múrcia"],
  ["ES-NC", "Navarra"],
  ["ES-PV", "País Basc"],
  ["ES-VC", "País Valencià"],
];

export default function ProceduralNoteForm({
  action,
  initial,
  deleteAction,
  authOptions,
}: {
  action: (formData: FormData) => Promise<void>;
  initial?: NoteData;
  deleteAction?: () => Promise<void>;
  authOptions: AuthOption[];
}) {
  const [scope, setScope] = useState(initial?.scope || "national");

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
    <div
      style={{
        background: "#fff",
        padding: 24,
        borderRadius: 8,
        maxWidth: 720,
        boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
      }}
    >
      <form action={action}>
        {/* Authorization slug */}
        <div style={fieldGroup}>
          <label style={labelStyle}>
            Autorització afectada (opcional — buit = nota genèrica)
          </label>
          <input
            name="authorization_slug"
            list="auth-slugs"
            defaultValue={initial?.authorization_slug || ""}
            style={inputStyle}
            placeholder="arraigo_social, reagrupament_familiar, ..."
          />
          <datalist id="auth-slugs">
            {authOptions.map((a) => (
              <option key={a.slug} value={a.slug}>
                {a.label}
              </option>
            ))}
          </datalist>
        </div>

        {/* Scope */}
        <div style={fieldGroup}>
          <label style={labelStyle}>Àmbit *</label>
          <select
            name="scope"
            required
            value={scope}
            onChange={(e) => setScope(e.target.value)}
            style={inputStyle}
          >
            {SCOPES.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>

        {/* Scope-conditional fields */}
        {scope === "province" && (
          <div style={fieldGroup}>
            <label style={labelStyle}>Província *</label>
            <select
              name="province_iso"
              required
              defaultValue={initial?.province_iso || ""}
              style={inputStyle}
            >
              <option value="">— Tria una província —</option>
              {PROVINCES.map(([iso, name]) => (
                <option key={iso} value={iso}>
                  {name} ({iso})
                </option>
              ))}
            </select>
          </div>
        )}

        {scope === "ccaa" && (
          <div style={fieldGroup}>
            <label style={labelStyle}>Comunitat Autònoma *</label>
            <select
              name="ccaa_code"
              required
              defaultValue={initial?.ccaa_code || ""}
              style={inputStyle}
            >
              <option value="">— Tria una CCAA —</option>
              {CCAAS.map(([iso, name]) => (
                <option key={iso} value={iso}>
                  {name} ({iso})
                </option>
              ))}
            </select>
          </div>
        )}

        {scope === "consulate" && (
          <div style={fieldGroup}>
            <label style={labelStyle}>
              País del consolat (ISO 3166-1 alpha-2) *
            </label>
            <input
              name="country_iso"
              required
              defaultValue={initial?.country_iso || ""}
              maxLength={2}
              style={inputStyle}
              placeholder="MA, SN, PK..."
            />
          </div>
        )}

        {/* Severity */}
        <div style={fieldGroup}>
          <label style={labelStyle}>Gravetat *</label>
          <select
            name="severity"
            required
            defaultValue={initial?.severity || "info"}
            style={inputStyle}
          >
            {SEVERITIES.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>

        {/* Practical text — REQUIRED */}
        <div style={fieldGroup}>
          <label style={labelStyle}>
            Aplicació real * (què passa al carrer / a l&apos;oficina)
          </label>
          <textarea
            name="practical_text"
            required
            defaultValue={initial?.practical_text || ""}
            rows={4}
            style={{ ...inputStyle, resize: "vertical" as const }}
            placeholder="Ex: A Lleida, la subdelegació exigeix padró previ amb contracte de lloguer registrat. No oficial, però bloqueja l'expedient si no es presenta."
          />
        </div>

        {/* Legal text — optional */}
        <div style={fieldGroup}>
          <label style={labelStyle}>
            Què diu la llei (opcional — citació breu)
          </label>
          <textarea
            name="legal_text"
            defaultValue={initial?.legal_text || ""}
            rows={2}
            style={{ ...inputStyle, resize: "vertical" as const }}
            placeholder="Art. 124.2 RD 557/2011: ..."
          />
        </div>

        {/* Source */}
        <div style={{ display: "flex", gap: 12, ...fieldGroup }}>
          <div style={{ flex: 2 }}>
            <label style={labelStyle}>Font</label>
            <input
              name="source"
              defaultValue={initial?.source || ""}
              style={inputStyle}
              placeholder="Alba Jussà (treballadora social), advocat X, experiència usuari..."
            />
          </div>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>Data de la font</label>
            <input
              name="source_date"
              type="date"
              defaultValue={initial?.source_date || ""}
              style={inputStyle}
            />
          </div>
        </div>

        {/* Tags */}
        <div style={fieldGroup}>
          <label style={labelStyle}>Etiquetes (separades per coma)</label>
          <input
            name="tags"
            defaultValue={(initial?.tags || []).join(", ")}
            style={inputStyle}
            placeholder="cita_previa, padro, certificat_integracio"
          />
        </div>

        {/* Verified-by (read-only display) */}
        {initial?.verified_by && initial.verified_by.length > 0 && (
          <div style={fieldGroup}>
            <label style={labelStyle}>Verificat per</label>
            <div
              style={{
                padding: 8,
                background: "#f0f9ff",
                border: "1px solid #bae6fd",
                borderRadius: 4,
                fontSize: 13,
              }}
            >
              {initial.verified_by.join(", ")}
            </div>
          </div>
        )}

        {/* Active toggle */}
        <div style={fieldGroup}>
          <label
            style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14 }}
          >
            <input
              type="checkbox"
              name="active"
              defaultChecked={initial?.active ?? true}
            />
            Actiu (mostrar als usuaris)
          </label>
        </div>

        {/* Buttons */}
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
            href="/admin/procedural-notes"
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
