import { createAuthServerClient } from "@/lib/supabase-server";
import type { User } from "@supabase/supabase-js";

export type AdminRole = "superadmin" | "humanitarian";

export interface AdminContext {
  user: User;
  role: AdminRole;
}

/**
 * Returns an `AdminContext` if the current request is from an authenticated
 * user with an active row in `admin_users`. Returns `null` otherwise — call
 * sites should respond with 401/403 in that case.
 *
 * Use in route handlers and Server Components:
 *
 *   const admin = await requireAdmin();
 *   if (!admin) {
 *     return Response.json({ error: "Forbidden" }, { status: 403 });
 *   }
 *
 * Note: middleware cannot use this helper directly because it depends on
 * `next/headers` `cookies()`. Middleware has its own inline check — see
 * `middleware.ts`.
 */
export async function requireAdmin(): Promise<AdminContext | null> {
  const supabase = await createAuthServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from("admin_users")
    .select("role, active")
    .eq("user_id", user.id)
    .single();

  if (error || !data || data.active !== true) return null;

  return { user, role: data.role as AdminRole };
}
