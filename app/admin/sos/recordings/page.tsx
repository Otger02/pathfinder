import { createServiceClient } from "@/lib/supabase";
import Link from "next/link";

interface Recording {
  id: string;
  session_id: string;
  sos_event_id: string | null;
  status: string;
  started_at: string;
  ended_at: string | null;
  duration_ms: number | null;
  chunk_count: number;
  gps_lat: number | null;
  gps_lon: number | null;
  user_code: string;
}

export default async function RecordingsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const params = await searchParams;
  const statusFilter = params.status || "all";

  const supabase = createServiceClient();
  let query = supabase
    .from("sos_recordings")
    .select("*")
    .order("started_at", { ascending: false })
    .limit(100);

  if (statusFilter !== "all") {
    query = query.eq("status", statusFilter);
  }

  const { data } = await query;
  const recordings = (data || []) as Recording[];

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
    fontSize: 13,
  };

  const statusColors: Record<string, { bg: string; color: string }> = {
    recording: { bg: "#fff3e0", color: "#e65100" },
    completed: { bg: "#e8f5e9", color: "#2e7d32" },
    interrupted: { bg: "#fce4ec", color: "#c62828" },
    failed: { bg: "#fce4ec", color: "#c62828" },
  };

  const filters = ["all", "recording", "completed", "interrupted", "failed"];

  function formatDuration(ms: number | null): string {
    if (!ms) return "—";
    const s = Math.floor(ms / 1000);
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${String(sec).padStart(2, "0")}`;
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <h1 style={{ margin: 0, fontSize: 22 }}>SOS Recordings</h1>
        <div style={{ display: "flex", gap: 8 }}>
          {filters.map((f) => (
            <a
              key={f}
              href={`/admin/sos/recordings${f === "all" ? "" : `?status=${f}`}`}
              style={{
                padding: "6px 12px",
                fontSize: 13,
                background: statusFilter === f ? "#1976d2" : "#eee",
                color: statusFilter === f ? "#fff" : "#333",
                textDecoration: "none",
                borderRadius: 4,
                textTransform: "capitalize",
              }}
            >
              {f === "all" ? "Tots" : f}
            </a>
          ))}
        </div>
      </div>

      {recordings.length === 0 ? (
        <div
          style={{
            padding: 40,
            textAlign: "center",
            color: "#888",
            background: "#fff",
            borderRadius: 8,
          }}
        >
          No hi ha gravacions{statusFilter !== "all" ? ` amb estat "${statusFilter}"` : ""}.
        </div>
      ) : (
        <div style={{ background: "#fff", borderRadius: 8, overflow: "auto", boxShadow: "0 1px 3px rgba(0,0,0,0.08)" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
            <thead>
              <tr>
                <th style={thStyle}>Data</th>
                <th style={thStyle}>Durada</th>
                <th style={thStyle}>Status</th>
                <th style={thStyle}>Chunks</th>
                <th style={thStyle}>GPS</th>
                <th style={thStyle}>SOS Event</th>
                <th style={thStyle}>Accions</th>
              </tr>
            </thead>
            <tbody>
              {recordings.map((rec) => {
                const colors = statusColors[rec.status] || { bg: "#eee", color: "#333" };
                return (
                  <tr key={rec.id}>
                    <td style={{ ...tdStyle, whiteSpace: "nowrap" }}>
                      {new Date(rec.started_at).toLocaleString("ca-ES")}
                    </td>
                    <td style={tdStyle}>{formatDuration(rec.duration_ms)}</td>
                    <td style={tdStyle}>
                      <span
                        style={{
                          background: colors.bg,
                          color: colors.color,
                          padding: "2px 8px",
                          borderRadius: 4,
                          fontSize: 12,
                          fontWeight: 600,
                        }}
                      >
                        {rec.status}
                      </span>
                    </td>
                    <td style={tdStyle}>{rec.chunk_count}</td>
                    <td style={tdStyle}>
                      {rec.gps_lat && rec.gps_lon ? (
                        <a
                          href={`https://maps.google.com/?q=${rec.gps_lat},${rec.gps_lon}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ color: "#1976d2", textDecoration: "none", fontSize: 12 }}
                        >
                          {rec.gps_lat.toFixed(4)}, {rec.gps_lon.toFixed(4)}
                        </a>
                      ) : (
                        <span style={{ color: "#ccc" }}>—</span>
                      )}
                    </td>
                    <td style={tdStyle}>
                      {rec.sos_event_id ? (
                        <Link
                          href="/admin/sos"
                          style={{ color: "#1976d2", textDecoration: "none", fontSize: 12 }}
                        >
                          {rec.sos_event_id.slice(0, 8)}...
                        </Link>
                      ) : (
                        <span style={{ color: "#ccc" }}>—</span>
                      )}
                    </td>
                    <td style={tdStyle}>
                      <Link
                        href={`/admin/sos/recordings/${rec.id}`}
                        style={{
                          padding: "4px 10px",
                          fontSize: 12,
                          background: "#1976d2",
                          color: "#fff",
                          textDecoration: "none",
                          borderRadius: 4,
                        }}
                      >
                        Detall
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
