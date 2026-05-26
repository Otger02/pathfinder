import { notFound } from "next/navigation";
import { createServiceClient } from "@/lib/supabase";
import {
  updateProceduralNote,
  deleteProceduralNote,
  verifyProceduralNote,
} from "../actions";
import ProceduralNoteForm from "../ProceduralNoteForm";

interface AuthRow {
  slug: string;
  nom: Record<string, string> | string | null;
}

async function loadAuthOptions() {
  const supabase = createServiceClient();
  const { data } = await supabase
    .from("authorizations")
    .select("slug, nom")
    .order("slug");
  return ((data || []) as AuthRow[]).map((a) => ({
    slug: a.slug,
    label:
      typeof a.nom === "object" && a.nom !== null
        ? (a.nom as Record<string, string>).ca ||
          (a.nom as Record<string, string>).es ||
          a.slug
        : (a.nom as string) || a.slug,
  }));
}

export default async function EditProceduralNotePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = createServiceClient();
  const { data } = await supabase
    .from("procedural_notes")
    .select("*")
    .eq("id", id)
    .single();

  if (!data) notFound();

  const updateAction = updateProceduralNote.bind(null, id);
  const deleteAction = deleteProceduralNote.bind(null, id);
  const verifyAction = verifyProceduralNote.bind(null, id);

  const authOptions = await loadAuthOptions();

  // Normalize source_date to YYYY-MM-DD for the <input type="date">
  const initial = {
    ...data,
    source_date:
      typeof data.source_date === "string" && data.source_date.length >= 10
        ? data.source_date.slice(0, 10)
        : null,
  };

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 20,
        }}
      >
        <h1 style={{ margin: 0, fontSize: 22 }}>Editar nota procedimental</h1>
        <form action={verifyAction}>
          <button
            type="submit"
            style={{
              padding: "8px 16px",
              fontSize: 13,
              fontWeight: 600,
              background: "#16a34a",
              color: "#fff",
              border: "none",
              borderRadius: 4,
              cursor: "pointer",
            }}
            title="Afegir el meu email a la llista de verificadors"
          >
            ✓ Verificar amb el meu nom
          </button>
        </form>
      </div>

      <ProceduralNoteForm
        action={updateAction}
        initial={initial}
        deleteAction={deleteAction}
        authOptions={authOptions}
      />
    </div>
  );
}
