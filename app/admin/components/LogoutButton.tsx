"use client";

import { useRouter } from "next/navigation";
import { createBrowserSupabase } from "@/lib/supabase-browser";

export default function LogoutButton() {
  const router = useRouter();

  async function handleLogout() {
    const supabase = createBrowserSupabase();
    await supabase.auth.signOut();
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <button
      onClick={handleLogout}
      style={{
        padding: "6px 12px",
        fontSize: 13,
        background: "transparent",
        border: "1px solid #ccc",
        borderRadius: 4,
        cursor: "pointer",
        color: "#666",
      }}
    >
      Tancar sessió
    </button>
  );
}
