"use server";

import { createServiceClient } from "@/lib/supabase";
import { createAuthServerClient } from "@/lib/supabase-server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

const ALLOWED_SCOPES = new Set(["province", "ccaa", "national", "consulate"]);
const ALLOWED_SEVERITIES = new Set([
  "blocker",
  "workaround",
  "warning",
  "info",
]);

function extractFields(formData: FormData) {
  const scope = String(formData.get("scope") || "national");
  const severity = String(formData.get("severity") || "info");
  if (!ALLOWED_SCOPES.has(scope)) {
    throw new Error(`Invalid scope: ${scope}`);
  }
  if (!ALLOWED_SEVERITIES.has(severity)) {
    throw new Error(`Invalid severity: ${severity}`);
  }

  const tags = String(formData.get("tags") || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  return {
    authorization_slug:
      (formData.get("authorization_slug") as string)?.trim() || null,
    scope,
    province_iso:
      scope === "province"
        ? ((formData.get("province_iso") as string)?.trim() || null)
        : null,
    ccaa_code:
      scope === "ccaa"
        ? ((formData.get("ccaa_code") as string)?.trim() || null)
        : null,
    country_iso:
      scope === "consulate"
        ? ((formData.get("country_iso") as string)?.trim() || null)
        : null,
    legal_text: (formData.get("legal_text") as string)?.trim() || null,
    practical_text: (formData.get("practical_text") as string)?.trim() || "",
    severity,
    source: (formData.get("source") as string)?.trim() || null,
    source_date:
      (formData.get("source_date") as string)?.trim() || null,
    tags,
    active: formData.get("active") === "on",
  };
}

export async function createProceduralNote(formData: FormData) {
  const supabase = createServiceClient();
  const fields = extractFields(formData);
  if (!fields.practical_text) {
    throw new Error("practical_text is required");
  }
  const { error } = await supabase.from("procedural_notes").insert(fields);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/procedural-notes");
  redirect("/admin/procedural-notes");
}

export async function updateProceduralNote(id: string, formData: FormData) {
  const supabase = createServiceClient();
  const fields = extractFields(formData);
  if (!fields.practical_text) {
    throw new Error("practical_text is required");
  }
  const { error } = await supabase
    .from("procedural_notes")
    .update({ ...fields, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/procedural-notes");
  redirect("/admin/procedural-notes");
}

export async function deleteProceduralNote(id: string) {
  const supabase = createServiceClient();
  const { error } = await supabase
    .from("procedural_notes")
    .delete()
    .eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/procedural-notes");
  redirect("/admin/procedural-notes");
}

/**
 * Appends the calling admin's email to verified_by[]. Idempotent: a
 * second click by the same admin is a no-op (the existing array is
 * inspected before update so we don't grow the same name twice).
 */
export async function verifyProceduralNote(id: string) {
  const authClient = await createAuthServerClient();
  const {
    data: { user },
  } = await authClient.auth.getUser();
  const verifier = user?.email;
  if (!verifier) {
    throw new Error("Not authenticated");
  }

  const supabase = createServiceClient();
  const { data: existing, error: readErr } = await supabase
    .from("procedural_notes")
    .select("verified_by")
    .eq("id", id)
    .single();
  if (readErr) throw new Error(readErr.message);

  const verified_by: string[] = Array.isArray(existing?.verified_by)
    ? (existing.verified_by as string[])
    : [];
  if (verified_by.includes(verifier)) {
    // Already verified by this admin — surface a no-op redirect
    revalidatePath("/admin/procedural-notes");
    return;
  }
  verified_by.push(verifier);

  const { error: updateErr } = await supabase
    .from("procedural_notes")
    .update({
      verified_by,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);
  if (updateErr) throw new Error(updateErr.message);

  revalidatePath("/admin/procedural-notes");
}
