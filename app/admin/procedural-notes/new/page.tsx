import { createServiceClient } from "@/lib/supabase";
import { createProceduralNote } from "../actions";
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

export default async function NewProceduralNotePage() {
  const authOptions = await loadAuthOptions();
  return (
    <div>
      <h1 style={{ margin: "0 0 20px", fontSize: 22 }}>Nova nota procedimental</h1>
      <ProceduralNoteForm
        action={createProceduralNote}
        authOptions={authOptions}
      />
    </div>
  );
}
