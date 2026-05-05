import { createBrowserClient } from "@supabase/ssr";

export function createBrowserSupabase() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

export async function getCurrentUser() {
  const supabase = createBrowserSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}
