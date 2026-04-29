"use server";

import { createServiceClient } from "@/lib/supabase";
import { createAuthServerClient } from "@/lib/supabase-server";
import { revalidatePath } from "next/cache";

export async function resolveSosEvent(id: string) {
  const auth = await createAuthServerClient();
  const {
    data: { user },
  } = await auth.auth.getUser();

  const supabase = createServiceClient();
  const { error } = await supabase
    .from("sos_events")
    .update({
      resolved: true,
      resolved_at: new Date().toISOString(),
      resolved_by: user?.email ?? "admin",
    })
    .eq("id", id);

  if (error) throw new Error(error.message);
  revalidatePath("/admin/sos");
}

export async function updateSosNotes(id: string, notes: string) {
  const supabase = createServiceClient();
  const { error } = await supabase
    .from("sos_events")
    .update({ notes })
    .eq("id", id);

  if (error) throw new Error(error.message);
  revalidatePath("/admin/sos");
}
