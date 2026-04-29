import { notFound } from "next/navigation";
import { createServiceClient } from "@/lib/supabase";
import { updateResource, deleteResource } from "../actions";
import ResourceForm from "../ResourceForm";

export default async function EditResourcePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = createServiceClient();
  const { data } = await supabase.from("resources").select("*").eq("id", id).single();

  if (!data) notFound();

  const updateAction = updateResource.bind(null, id);
  const deleteAction = deleteResource.bind(null, id);

  return (
    <div>
      <h1 style={{ margin: "0 0 20px", fontSize: 22 }}>Editar recurs</h1>
      <ResourceForm action={updateAction} initial={data} deleteAction={deleteAction} />
    </div>
  );
}
