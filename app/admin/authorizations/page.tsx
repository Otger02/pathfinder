import { createServiceClient } from "@/lib/supabase";
import Link from "next/link";

interface Authorization {
  id: string;
  slug: string;
  nom: Record<string, string>;
  country: string;
  situacio_legal: string | null;
  termini_dies: number | null;
}

export default async function AuthorizationsPage() {
  const supabase = createServiceClient();
  const { data } = await supabase
    .from("authorizations")
    .select("id, slug, nom, country, situacio_legal, termini_dies")
    .order("slug");

  const auths = (data || []) as Authorization[];

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
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <h1 style={{ margin: 0, fontSize: 22 }}>Authorizations</h1>
        <Link
          href="/admin/authorizations/new"
          style={{
            padding: "8px 16px",
            fontSize: 14,
            background: "#1976d2",
            color: "#fff",
            textDecoration: "none",
            borderRadius: 4,
          }}
        >
          + Nova autorització
        </Link>
      </div>

      {auths.length === 0 ? (
        <div style={{ padding: 40, textAlign: "center", color: "#888", background: "#fff", borderRadius: 8 }}>
          No hi ha autoritzacions.
        </div>
      ) : (
        <div style={{ background: "#fff", borderRadius: 8, overflow: "auto", boxShadow: "0 1px 3px rgba(0,0,0,0.08)" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th style={thStyle}>Slug</th>
                <th style={thStyle}>Nom (ES)</th>
                <th style={thStyle}>País</th>
                <th style={thStyle}>Situació</th>
                <th style={thStyle}>Termini (dies)</th>
                <th style={thStyle}></th>
              </tr>
            </thead>
            <tbody>
              {auths.map((a) => (
                <tr key={a.id}>
                  <td style={{ ...tdStyle, fontFamily: "monospace", fontSize: 13 }}>{a.slug}</td>
                  <td style={tdStyle}>{a.nom?.es || "—"}</td>
                  <td style={tdStyle}>{a.country}</td>
                  <td style={tdStyle}>{a.situacio_legal || "—"}</td>
                  <td style={tdStyle}>{a.termini_dies ?? "—"}</td>
                  <td style={tdStyle}>
                    <Link
                      href={`/admin/authorizations/${a.id}`}
                      style={{ color: "#1976d2", fontSize: 13, textDecoration: "none" }}
                    >
                      Editar
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
