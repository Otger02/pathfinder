"use server";

import { createServiceClient } from "@/lib/supabase";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

function parseCsv(formData: FormData, key: string) {
  return ((formData.get(key) as string) || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

function parseDescription(formData: FormData) {
  const description: Record<string, string> = {};
  for (const lang of ["ca", "es", "en"]) {
    const value = ((formData.get(`description_${lang}`) as string) || "").trim();
    if (value) description[lang] = value;
  }
  return description;
}

function parseNullableBoolean(value: FormDataEntryValue | null): boolean | null {
  if (value == null || value === "") return null;
  if (value === "true") return true;
  if (value === "false") return false;
  return null;
}

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
    idiomes: parseCsv(formData, "idiomes"),
    especialitat: parseCsv(formData, "especialitat"),
    horari: (formData.get("horari") as string) || null,
    notes: (formData.get("notes") as string) || null,
    province_iso: (formData.get("province_iso") as string) || null,
    ccaa_code: (formData.get("ccaa_code") as string) || null,
    target_populations: parseCsv(formData, "target_populations"),
    free_of_charge: formData.get("free_of_charge") === "on",
    appointment_required: parseNullableBoolean(formData.get("appointment_required")),
    description: parseDescription(formData),
    verified_by: ((formData.get("verified_by") as string) || "").trim() || null,
    verified_date: (formData.get("verified_date") as string) || null,
    active: formData.get("active") === "on",
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
