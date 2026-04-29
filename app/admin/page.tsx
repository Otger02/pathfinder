import { createServiceClient } from "@/lib/supabase";

export default async function AdminDashboard() {
  const supabase = createServiceClient();

  // Fetch all analytics in parallel
  const [convPerDay, langDist, sosSummary, recentMessages] = await Promise.all([
    supabase.rpc("conversations_per_day", { days_back: 14 }),
    supabase.rpc("language_distribution"),
    supabase.rpc("sos_summary"),
    supabase
      .from("messages")
      .select("content, created_at")
      .eq("role", "user")
      .order("created_at", { ascending: false })
      .limit(20),
  ]);

  const convData = (convPerDay.data || []) as Array<{ day: string; count: number }>;
  const langData = (langDist.data || []) as Array<{ language: string; count: number }>;
  const sosData = (sosSummary.data || []) as Array<{
    total: number;
    unresolved: number;
    today: number;
  }>;
  const sos = sosData[0] || { total: 0, unresolved: 0, today: 0 };
  const recent = (recentMessages.data || []) as Array<{
    content: string;
    created_at: string;
  }>;

  const cardStyle = {
    background: "#fff",
    padding: 20,
    borderRadius: 8,
    boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
    marginBottom: 20,
  };

  const statBox = (label: string, value: number | string, color?: string) => (
    <div
      style={{
        padding: 16,
        background: "#fff",
        borderRadius: 8,
        boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
        textAlign: "center" as const,
        minWidth: 140,
      }}
    >
      <div style={{ fontSize: 28, fontWeight: 700, color: color || "#333" }}>{value}</div>
      <div style={{ fontSize: 13, color: "#888", marginTop: 4 }}>{label}</div>
    </div>
  );

  return (
    <div>
      <h1 style={{ margin: "0 0 20px", fontSize: 22 }}>Dashboard</h1>

      {/* Stats row */}
      <div style={{ display: "flex", gap: 16, marginBottom: 24, flexWrap: "wrap" as const }}>
        {statBox("Converses (14d)", convData.reduce((s, d) => s + d.count, 0))}
        {statBox("SOS total", sos.total, "#d32f2f")}
        {statBox("SOS no resolts", sos.unresolved, sos.unresolved > 0 ? "#d32f2f" : "#4caf50")}
        {statBox("SOS avui", sos.today)}
      </div>

      {/* Conversations per day */}
      <div style={cardStyle}>
        <h3 style={{ margin: "0 0 12px", fontSize: 16 }}>Converses per dia (últims 14 dies)</h3>
        {convData.length === 0 ? (
          <p style={{ color: "#888", fontSize: 14 }}>Sense dades</p>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
            <thead>
              <tr style={{ borderBottom: "2px solid #eee" }}>
                <th style={{ textAlign: "left", padding: "8px 4px" }}>Dia</th>
                <th style={{ textAlign: "right", padding: "8px 4px" }}>Converses</th>
              </tr>
            </thead>
            <tbody>
              {convData.map((row) => (
                <tr key={row.day} style={{ borderBottom: "1px solid #f0f0f0" }}>
                  <td style={{ padding: "6px 4px" }}>{row.day}</td>
                  <td style={{ padding: "6px 4px", textAlign: "right" }}>{row.count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div style={{ display: "flex", gap: 20, flexWrap: "wrap" as const }}>
        {/* Language distribution */}
        <div style={{ ...cardStyle, flex: 1, minWidth: 200 }}>
          <h3 style={{ margin: "0 0 12px", fontSize: 16 }}>Idiomes</h3>
          {langData.length === 0 ? (
            <p style={{ color: "#888", fontSize: 14 }}>Sense dades</p>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
              <tbody>
                {langData.map((row) => (
                  <tr key={row.language} style={{ borderBottom: "1px solid #f0f0f0" }}>
                    <td style={{ padding: "6px 4px" }}>{row.language}</td>
                    <td style={{ padding: "6px 4px", textAlign: "right", fontWeight: 600 }}>
                      {row.count}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Recent queries */}
        <div style={{ ...cardStyle, flex: 2, minWidth: 300 }}>
          <h3 style={{ margin: "0 0 12px", fontSize: 16 }}>Últimes consultes</h3>
          {recent.length === 0 ? (
            <p style={{ color: "#888", fontSize: 14 }}>Sense dades</p>
          ) : (
            <div>
              {recent.map((msg, i) => (
                <div
                  key={i}
                  style={{
                    padding: "8px 0",
                    borderBottom: "1px solid #f0f0f0",
                    fontSize: 14,
                  }}
                >
                  <span style={{ color: "#888", fontSize: 12 }}>
                    {new Date(msg.created_at).toLocaleString("ca-ES")}
                  </span>
                  <br />
                  {msg.content.length > 120
                    ? msg.content.slice(0, 120) + "…"
                    : msg.content}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
