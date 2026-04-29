import { notFound } from "next/navigation";
import { createServiceClient } from "@/lib/supabase";
import { updateAuthorization, deleteAuthorization } from "../actions";
import AuthorizationForm from "../AuthorizationForm";

export default async function EditAuthorizationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = createServiceClient();
  const { data } = await supabase.from("authorizations").select("*").eq("id", id).single();

  if (!data) notFound();

  const updateAction = updateAuthorization.bind(null, id);
  const deleteAction = deleteAuthorization.bind(null, id);

  return (
    <div>
      <h1 style={{ margin: "0 0 20px", fontSize: 22 }}>Editar autorització</h1>
      <AuthorizationForm action={updateAction} initial={data} deleteAction={deleteAction} />
    </div>
  );
}
