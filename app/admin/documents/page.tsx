import { createServiceClient } from "@/lib/supabase";
import Link from "next/link";

interface DocChunk {
  id: string;
  source_file: string | null;
  chunk_index: number | null;
  situacio_legal: string | null;
  urgencia: string;
  tokens_count: number | null;
  content: string;
}

export default async function DocumentsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; source?: string }>;
}) {
  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page || "1", 10));
  const sourceFilter = params.source || "";
  const perPage = 50;
  const from = (page - 1) * perPage;
  const to = from + perPage - 1;

  const supabase = createServiceClient();

  let query = supabase
    .from("doc_chunks")
    .select("id, source_file, chunk_index, situacio_legal, urgencia, tokens_count, content", {
      count: "exact",
    })
    .order("source_file")
    .order("chunk_index")
    .range(from, to);

  if (sourceFilter) {
    query = query.ilike("source_file", `%${sourceFilter}%`);
  }

  const { data, count } = await query;
  const chunks = (data || []) as DocChunk[];
  const totalPages = Math.ceil((count || 0) / perPage);

  const thStyle = {
    textAlign: "left" as const,
    padding: "10px 8px",
    fontSize: 13,
    fontWeight: 600,
    color: "#666",
    borderBottom: "2px solid #eee",
  };

  const tdStyle = {
    padding: "8px",
    borderBottom: "1px solid #f0f0f0",
    fontSize: 13,
    verticalAlign: "top" as const,
  };

  function pageHref(p: number) {
    const q = new URLSearchParams();
    q.set("page", String(p));
    if (sourceFilter) q.set("source", sourceFilter);
    return `/admin/documents?${q.toString()}`;
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <h1 style={{ margin: 0, fontSize: 22 }}>
          Documents{" "}
          <span style={{ fontSize: 14, fontWeight: 400, color: "#888" }}>
            ({count ?? 0} chunks)
          </span>
        </h1>
      </div>

      {/* Filter */}
      <form
        style={{
          display: "flex",
          gap: 8,
          marginBottom: 16,
          background: "#fff",
          padding: 12,
          borderRadius: 8,
          boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
        }}
      >
        <input
          name="source"
          defaultValue={sourceFilter}
          placeholder="Filtrar per source_file..."
          style={{
            flex: 1,
            padding: 8,
            fontSize: 14,
            border: "1px solid #ddd",
            borderRadius: 4,
          }}
        />
        <button
          type="submit"
          style={{
            padding: "8px 16px",
            fontSize: 14,
            background: "#1976d2",
            color: "#fff",
            border: "none",
            borderRadius: 4,
            cursor: "pointer",
          }}
        >
          Filtrar
        </button>
        {sourceFilter && (
          <Link
            href="/admin/documents"
            style={{
              padding: "8px 12px",
              fontSize: 14,
              color: "#666",
              textDecoration: "none",
              display: "flex",
              alignItems: "center",
            }}
          >
            Netejar
          </Link>
        )}
      </form>

      {chunks.length === 0 ? (
        <div style={{ padding: 40, textAlign: "center", color: "#888", background: "#fff", borderRadius: 8 }}>
          No hi ha chunks{sourceFilter ? ` per "${sourceFilter}"` : ""}.
        </div>
      ) : (
        <>
          <div style={{ background: "#fff", borderRadius: 8, overflow: "auto", boxShadow: "0 1px 3px rgba(0,0,0,0.08)" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th style={thStyle}>Source File</th>
                  <th style={{ ...thStyle, width: 40 }}>#</th>
                  <th style={thStyle}>Situació</th>
                  <th style={thStyle}>Urgència</th>
                  <th style={{ ...thStyle, width: 50 }}>Tokens</th>
                  <th style={thStyle}>Contingut</th>
                </tr>
              </thead>
              <tbody>
                {chunks.map((c) => (
                  <tr key={c.id}>
                    <td style={{ ...tdStyle, fontFamily: "monospace", fontSize: 12, maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {c.source_file || "—"}
                    </td>
                    <td style={{ ...tdStyle, textAlign: "center" }}>{c.chunk_index ?? "—"}</td>
                    <td style={tdStyle}>
                      {c.situacio_legal ? (
                        <span style={{ padding: "1px 5px", background: "#e8f5e9", borderRadius: 3, fontSize: 11 }}>
                          {c.situacio_legal}
                        </span>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td style={tdStyle}>{c.urgencia}</td>
                    <td style={{ ...tdStyle, textAlign: "center" }}>{c.tokens_count ?? "—"}</td>
                    <td style={{ ...tdStyle, maxWidth: 400, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {c.content.length > 100 ? c.content.slice(0, 100) + "…" : c.content}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div style={{ display: "flex", gap: 8, justifyContent: "center", marginTop: 16 }}>
              {page > 1 && (
                <Link href={pageHref(page - 1)} style={{ padding: "6px 12px", fontSize: 13, color: "#1976d2", textDecoration: "none" }}>
                  ← Anterior
                </Link>
              )}
              <span style={{ padding: "6px 12px", fontSize: 13, color: "#666" }}>
                Pàgina {page} de {totalPages}
              </span>
              {page < totalPages && (
                <Link href={pageHref(page + 1)} style={{ padding: "6px 12px", fontSize: 13, color: "#1976d2", textDecoration: "none" }}>
                  Següent →
                </Link>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
