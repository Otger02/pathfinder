import { createServiceClient } from "@/lib/supabase";
import SosRow from "./SosRow";

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

export default async function SosPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const params = await searchParams;
  const showAll = params.status === "all";

  const supabase = createServiceClient();
  let query = supabase
    .from("sos_events")
    .select("*")
    .order("timestamp", { ascending: false })
    .limit(100);

  if (!showAll) {
    query = query.eq("resolved", false);
  }

  const { data } = await query;
  const events = (data || []) as SosEvent[];

  const thStyle = {
    textAlign: "left" as const,
    padding: "10px 8px",
    fontSize: 13,
    fontWeight: 600,
    color: "#666",
    borderBottom: "2px solid #eee",
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <h1 style={{ margin: 0, fontSize: 22 }}>SOS Events</h1>
        <div style={{ display: "flex", gap: 8 }}>
          <a
            href="/admin/sos"
            style={{
              padding: "6px 12px",
              fontSize: 13,
              background: !showAll ? "#1976d2" : "#eee",
              color: !showAll ? "#fff" : "#333",
              textDecoration: "none",
              borderRadius: 4,
            }}
          >
            No resolts
          </a>
          <a
            href="/admin/sos?status=all"
            style={{
              padding: "6px 12px",
              fontSize: 13,
              background: showAll ? "#1976d2" : "#eee",
              color: showAll ? "#fff" : "#333",
              textDecoration: "none",
              borderRadius: 4,
            }}
          >
            Tots
          </a>
        </div>
      </div>

      {events.length === 0 ? (
        <div
          style={{
            padding: 40,
            textAlign: "center",
            color: "#888",
            background: "#fff",
            borderRadius: 8,
          }}
        >
          {showAll ? "No hi ha events SOS." : "Cap event SOS pendent."}
        </div>
      ) : (
        <div style={{ background: "#fff", borderRadius: 8, overflow: "auto", boxShadow: "0 1px 3px rgba(0,0,0,0.08)" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
            <thead>
              <tr>
                <th style={thStyle}>Data</th>
                <th style={thStyle}>User</th>
                <th style={thStyle}>Trigger</th>
                <th style={thStyle}>Status</th>
                <th style={thStyle}>Gravació</th>
                <th style={thStyle}>Notes</th>
                <th style={thStyle}>Accions</th>
              </tr>
            </thead>
            <tbody>
              {events.map((ev) => (
                <SosRow key={ev.id} event={ev} />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
