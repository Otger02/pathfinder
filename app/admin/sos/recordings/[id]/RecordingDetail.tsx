"use client";

import { useState } from "react";

interface Chunk {
  id: string;
  chunk_index: number;
  storage_path: string;
  size_bytes: number;
  sha256: string;
  chain_hash: string;
  gps_lat: number | null;
  gps_lon: number | null;
  client_timestamp: string | null;
  server_timestamp: string;
  signedUrl: string | null;
}

interface Recording {
  id: string;
  session_id: string;
  sos_event_id: string | null;
  user_code: string;
  status: string;
  started_at: string;
  ended_at: string | null;
  duration_ms: number | null;
  chunk_count: number;
  gps_lat: number | null;
  gps_lon: number | null;
  device_info: Record<string, unknown> | null;
  integrity_hash: string | null;
}

interface VerifyResult {
  valid: boolean;
  totalChunks: number;
  checkedAt: string;
  details: Array<{
    index: number;
    sha256Match: boolean;
    chainMatch: boolean;
  }>;
  brokenAtIndex: number | null;
}

export default function RecordingDetail({
  recording,
  chunks,
}: {
  recording: Recording;
  chunks: Array<Chunk & { signedUrl: string | null }>;
}) {
  const [verifying, setVerifying] = useState(false);
  const [verifyResult, setVerifyResult] = useState<VerifyResult | null>(null);
  const [exporting, setExporting] = useState(false);
  const [currentChunk, setCurrentChunk] = useState(0);

  const statusColors: Record<string, { bg: string; color: string }> = {
    recording: { bg: "#fff3e0", color: "#e65100" },
    completed: { bg: "#e8f5e9", color: "#2e7d32" },
    interrupted: { bg: "#fce4ec", color: "#c62828" },
    failed: { bg: "#fce4ec", color: "#c62828" },
  };

  const colors = statusColors[recording.status] || { bg: "#eee", color: "#333" };

  function formatDuration(ms: number | null): string {
    if (!ms) return "—";
    const s = Math.floor(ms / 1000);
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${String(sec).padStart(2, "0")}`;
  }

  function formatBytes(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  async function handleVerify() {
    setVerifying(true);
    try {
      const resp = await fetch(`/api/sos/recording/verify?recordingId=${recording.id}`);
      const data = await resp.json();
      setVerifyResult(data);
    } catch {
      alert("Error verificant integritat");
    }
    setVerifying(false);
  }

  async function handleExport() {
    setExporting(true);
    try {
      const resp = await fetch(`/api/sos/recording/export?recordingId=${recording.id}`);
      if (!resp.ok) throw new Error("Export failed");
      const blob = await resp.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `evidence-${recording.id.slice(0, 8)}.zip`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      alert("Error exportant evidència");
    }
    setExporting(false);
  }

  const panelStyle = {
    background: "#fff",
    borderRadius: 8,
    padding: 20,
    marginBottom: 16,
    boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
  };

  const labelStyle = {
    fontSize: 12,
    color: "#888",
    marginBottom: 2,
  };

  const valueStyle = {
    fontSize: 14,
    marginBottom: 12,
  };

  const thStyle = {
    textAlign: "left" as const,
    padding: "8px 6px",
    fontSize: 12,
    fontWeight: 600,
    color: "#666",
    borderBottom: "2px solid #eee",
  };

  const tdStyle = {
    padding: "8px 6px",
    borderBottom: "1px solid #f0f0f0",
    fontSize: 12,
  };

  const playableChunks = chunks.filter((c) => c.signedUrl);

  return (
    <div>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <h1 style={{ margin: 0, fontSize: 22 }}>
          Gravació{" "}
          <span style={{ color: "#888", fontSize: 16 }}>{recording.id.slice(0, 8)}...</span>
        </h1>
        <div style={{ display: "flex", gap: 8 }}>
          <button
            onClick={handleVerify}
            disabled={verifying}
            style={{
              padding: "8px 16px",
              fontSize: 13,
              background: verifying ? "#ccc" : "#2e7d32",
              color: "#fff",
              border: "none",
              borderRadius: 4,
              cursor: verifying ? "not-allowed" : "pointer",
            }}
          >
            {verifying ? "Verificant..." : "Verificar integritat"}
          </button>
          <button
            onClick={handleExport}
            disabled={exporting}
            style={{
              padding: "8px 16px",
              fontSize: 13,
              background: exporting ? "#ccc" : "#1976d2",
              color: "#fff",
              border: "none",
              borderRadius: 4,
              cursor: exporting ? "not-allowed" : "pointer",
            }}
          >
            {exporting ? "Exportant..." : "Descarregar evidència"}
          </button>
        </div>
      </div>

      {/* Verification result */}
      {verifyResult && (
        <div
          style={{
            ...panelStyle,
            borderLeft: `4px solid ${verifyResult.valid ? "#4caf50" : "#f44336"}`,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
            <span style={{ fontSize: 20 }}>{verifyResult.valid ? "✓" : "✗"}</span>
            <strong style={{ color: verifyResult.valid ? "#2e7d32" : "#c62828" }}>
              {verifyResult.valid
                ? "Cadena d'integritat verificada correctament"
                : `Integritat compromesa al fragment ${verifyResult.brokenAtIndex}`}
            </strong>
          </div>
          <p style={{ margin: 0, fontSize: 13, color: "#666" }}>
            {verifyResult.totalChunks} fragments verificats — {verifyResult.checkedAt}
          </p>
          {!verifyResult.valid && (
            <div style={{ marginTop: 12 }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr>
                    <th style={thStyle}>#</th>
                    <th style={thStyle}>SHA-256</th>
                    <th style={thStyle}>Chain</th>
                  </tr>
                </thead>
                <tbody>
                  {verifyResult.details
                    .filter((d) => !d.sha256Match || !d.chainMatch)
                    .map((d) => (
                      <tr key={d.index}>
                        <td style={tdStyle}>{d.index}</td>
                        <td style={{ ...tdStyle, color: d.sha256Match ? "#4caf50" : "#f44336" }}>
                          {d.sha256Match ? "OK" : "FAIL"}
                        </td>
                        <td style={{ ...tdStyle, color: d.chainMatch ? "#4caf50" : "#f44336" }}>
                          {d.chainMatch ? "OK" : "FAIL"}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Metadata */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
        <div style={panelStyle}>
          <h3 style={{ margin: "0 0 12px", fontSize: 15 }}>Informació</h3>
          <div style={labelStyle}>Estat</div>
          <div style={valueStyle}>
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
              {recording.status}
            </span>
          </div>
          <div style={labelStyle}>Inici</div>
          <div style={valueStyle}>{new Date(recording.started_at).toLocaleString("ca-ES")}</div>
          <div style={labelStyle}>Fi</div>
          <div style={valueStyle}>
            {recording.ended_at ? new Date(recording.ended_at).toLocaleString("ca-ES") : "—"}
          </div>
          <div style={labelStyle}>Durada</div>
          <div style={valueStyle}>{formatDuration(recording.duration_ms)}</div>
          <div style={labelStyle}>Fragments</div>
          <div style={valueStyle}>{recording.chunk_count}</div>
        </div>

        <div style={panelStyle}>
          <h3 style={{ margin: "0 0 12px", fontSize: 15 }}>Context</h3>
          <div style={labelStyle}>Session ID</div>
          <div style={{ ...valueStyle, fontFamily: "monospace", fontSize: 12 }}>
            {recording.session_id}
          </div>
          {recording.sos_event_id && (
            <>
              <div style={labelStyle}>SOS Event</div>
              <div style={valueStyle}>
                <a href="/admin/sos" style={{ color: "#1976d2", textDecoration: "none" }}>
                  {recording.sos_event_id.slice(0, 8)}...
                </a>
              </div>
            </>
          )}
          <div style={labelStyle}>GPS</div>
          <div style={valueStyle}>
            {recording.gps_lat && recording.gps_lon ? (
              <a
                href={`https://maps.google.com/?q=${recording.gps_lat},${recording.gps_lon}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: "#1976d2", textDecoration: "none" }}
              >
                {recording.gps_lat.toFixed(6)}, {recording.gps_lon.toFixed(6)}
              </a>
            ) : (
              "—"
            )}
          </div>
          {recording.integrity_hash && (
            <>
              <div style={labelStyle}>Hash d'integritat</div>
              <div style={{ ...valueStyle, fontFamily: "monospace", fontSize: 11, wordBreak: "break-all" }}>
                {recording.integrity_hash}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Video player */}
      {playableChunks.length > 0 && (
        <div style={panelStyle}>
          <h3 style={{ margin: "0 0 12px", fontSize: 15 }}>Reproducció</h3>
          <video
            src={playableChunks[currentChunk]?.signedUrl || undefined}
            controls
            autoPlay={false}
            onEnded={() => {
              if (currentChunk < playableChunks.length - 1) {
                setCurrentChunk(currentChunk + 1);
              }
            }}
            style={{
              width: "100%",
              maxHeight: 400,
              background: "#000",
              borderRadius: 4,
            }}
          />
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 8 }}>
            <button
              onClick={() => setCurrentChunk(Math.max(0, currentChunk - 1))}
              disabled={currentChunk === 0}
              style={{
                padding: "4px 12px",
                fontSize: 12,
                background: currentChunk === 0 ? "#eee" : "#1976d2",
                color: currentChunk === 0 ? "#999" : "#fff",
                border: "none",
                borderRadius: 4,
                cursor: currentChunk === 0 ? "not-allowed" : "pointer",
              }}
            >
              Anterior
            </button>
            <span style={{ fontSize: 13, color: "#666" }}>
              Fragment {currentChunk + 1} / {playableChunks.length}
            </span>
            <button
              onClick={() => setCurrentChunk(Math.min(playableChunks.length - 1, currentChunk + 1))}
              disabled={currentChunk >= playableChunks.length - 1}
              style={{
                padding: "4px 12px",
                fontSize: 12,
                background: currentChunk >= playableChunks.length - 1 ? "#eee" : "#1976d2",
                color: currentChunk >= playableChunks.length - 1 ? "#999" : "#fff",
                border: "none",
                borderRadius: 4,
                cursor: currentChunk >= playableChunks.length - 1 ? "not-allowed" : "pointer",
              }}
            >
              Següent
            </button>
          </div>
        </div>
      )}

      {/* Chunk table */}
      <div style={panelStyle}>
        <h3 style={{ margin: "0 0 12px", fontSize: 15 }}>Fragments ({chunks.length})</h3>
        <div style={{ overflow: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th style={thStyle}>#</th>
                <th style={thStyle}>Mida</th>
                <th style={thStyle}>Timestamp</th>
                <th style={thStyle}>SHA-256</th>
                <th style={thStyle}>Chain Hash</th>
                <th style={thStyle}>GPS</th>
              </tr>
            </thead>
            <tbody>
              {chunks.map((chunk) => (
                <tr key={chunk.id}>
                  <td style={tdStyle}>{chunk.chunk_index}</td>
                  <td style={tdStyle}>{formatBytes(chunk.size_bytes)}</td>
                  <td style={{ ...tdStyle, whiteSpace: "nowrap" }}>
                    {chunk.client_timestamp
                      ? new Date(chunk.client_timestamp).toLocaleTimeString("ca-ES")
                      : "—"}
                  </td>
                  <td style={{ ...tdStyle, fontFamily: "monospace", fontSize: 11 }}>
                    {chunk.sha256.slice(0, 16)}...
                  </td>
                  <td style={{ ...tdStyle, fontFamily: "monospace", fontSize: 11 }}>
                    {chunk.chain_hash.slice(0, 16)}...
                  </td>
                  <td style={tdStyle}>
                    {chunk.gps_lat && chunk.gps_lon ? (
                      <a
                        href={`https://maps.google.com/?q=${chunk.gps_lat},${chunk.gps_lon}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ color: "#1976d2", textDecoration: "none", fontSize: 11 }}
                      >
                        {chunk.gps_lat.toFixed(4)}, {chunk.gps_lon.toFixed(4)}
                      </a>
                    ) : (
                      <span style={{ color: "#ccc" }}>—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
