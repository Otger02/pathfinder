"use server";

import { createServiceClient } from "@/lib/supabase";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

function extractFormFields(formData: FormData) {
  const parseJson = (key: string, fallback: unknown) => {
    const raw = formData.get(key) as string;
    if (!raw || raw.trim() === "") return fallback;
    try {
      return JSON.parse(raw);
    } catch {
      throw new Error(`Camp "${key}" no és JSON vàlid`);
    }
  };

  return {
    slug: formData.get("slug") as string,
    nom: parseJson("nom", {}),
    descripcio: parseJson("descripcio", {}),
    requisits: parseJson("requisits", []),
    passos: parseJson("passos", []),
    lleis: parseJson("lleis", []),
    country: (formData.get("country") as string) || "ES",
    situacio_legal: (formData.get("situacio_legal") as string) || null,
    termini_dies: formData.get("termini_dies")
      ? parseInt(formData.get("termini_dies") as string, 10)
      : null,
    silenci_admin: (formData.get("silenci_admin") as string) || null,
  };
}

export async function createAuthorization(formData: FormData) {
  const supabase = createServiceClient();
  const fields = extractFormFields(formData);
  const { error } = await supabase.from("authorizations").insert(fields);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/authorizations");
  redirect("/admin/authorizations");
}

export async function updateAuthorization(id: string, formData: FormData) {
  const supabase = createServiceClient();
  const fields = extractFormFields(formData);
  const { error } = await supabase.from("authorizations").update(fields).eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/authorizations");
  redirect("/admin/authorizations");
}

export async function deleteAuthorization(id: string) {
  const supabase = createServiceClient();
  const { error } = await supabase.from("authorizations").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/authorizations");
  redirect("/admin/authorizations");
}
