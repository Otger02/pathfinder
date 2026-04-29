"use server";

import { createServiceClient } from "@/lib/supabase";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

function extractFormFields(formData: FormData) {
  return {
    nom: formData.get("nom") as string,
    tipus: formData.get("tipus") as string,
    country: (formData.get("country") as string) || "ES",
    city: (formData.get("city") as string) || null,
    adreca: (formData.get("adreca") as string) || null,
    telefon: (formData.get("telefon") as string) || null,
    email: (formData.get("email") as string) || null,
    web: (formData.get("web") as string) || null,
    idiomes: ((formData.get("idiomes") as string) || "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean),
    especialitat: ((formData.get("especialitat") as string) || "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean),
    horari: (formData.get("horari") as string) || null,
    notes: (formData.get("notes") as string) || null,
  };
}

export async function createResource(formData: FormData) {
  const supabase = createServiceClient();
  const fields = extractFormFields(formData);
  const { error } = await supabase.from("resources").insert(fields);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/resources");
  redirect("/admin/resources");
}

export async function updateResource(id: string, formData: FormData) {
  const supabase = createServiceClient();
  const fields = extractFormFields(formData);
  const { error } = await supabase.from("resources").update(fields).eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/resources");
  redirect("/admin/resources");
}

export async function deleteResource(id: string) {
  const supabase = createServiceClient();
  const { error } = await supabase.from("resources").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/resources");
  redirect("/admin/resources");
}
