import { createServiceClient } from "@/lib/supabase";
import Link from "next/link";

interface Resource {
  id: string;
  nom: string;
  tipus: string;
  country: string;
  city: string | null;
  telefon: string | null;
}

export default async function ResourcesPage() {
  const supabase = createServiceClient();
  const { data } = await supabase
    .from("resources")
    .select("id, nom, tipus, country, city, telefon")
    .order("nom");

  const resources = (data || []) as Resource[];

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
        <h1 style={{ margin: 0, fontSize: 22 }}>Resources</h1>
        <Link
          href="/admin/resources/new"
          style={{
            padding: "8px 16px",
            fontSize: 14,
            background: "#1976d2",
            color: "#fff",
            textDecoration: "none",
            borderRadius: 4,
          }}
        >
          + Nou recurs
        </Link>
      </div>

      {resources.length === 0 ? (
        <div style={{ padding: 40, textAlign: "center", color: "#888", background: "#fff", borderRadius: 8 }}>
          No hi ha recursos. Crea el primer.
        </div>
      ) : (
        <div style={{ background: "#fff", borderRadius: 8, overflow: "auto", boxShadow: "0 1px 3px rgba(0,0,0,0.08)" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th style={thStyle}>Nom</th>
                <th style={thStyle}>Tipus</th>
                <th style={thStyle}>País</th>
                <th style={thStyle}>Ciutat</th>
                <th style={thStyle}>Telèfon</th>
                <th style={thStyle}></th>
              </tr>
            </thead>
            <tbody>
              {resources.map((r) => (
                <tr key={r.id}>
                  <td style={tdStyle}>{r.nom}</td>
                  <td style={tdStyle}>
                    <span
                      style={{
                        padding: "2px 6px",
                        background: "#e8f5e9",
                        borderRadius: 3,
                        fontSize: 12,
                      }}
                    >
                      {r.tipus}
                    </span>
                  </td>
                  <td style={tdStyle}>{r.country}</td>
                  <td style={tdStyle}>{r.city || "—"}</td>
                  <td style={tdStyle}>{r.telefon || "—"}</td>
                  <td style={tdStyle}>
                    <Link
                      href={`/admin/resources/${r.id}`}
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
