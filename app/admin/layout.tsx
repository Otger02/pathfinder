import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { createAuthServerClient } from "@/lib/supabase-server";
import LogoutButton from "./components/LogoutButton";
import Link from "next/link";

const NAV_ITEMS = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/sos", label: "SOS Events" },
  { href: "/admin/sos/recordings", label: "Recordings" },
  { href: "/admin/resources", label: "Resources" },
  { href: "/admin/authorizations", label: "Authorizations" },
  { href: "/admin/documents", label: "Documents" },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Check if we're on the login page — if so, skip auth and render bare
  const headersList = await headers();
  const url = headersList.get("x-url") || headersList.get("x-invoke-path") || "";
  const pathname =
    headersList.get("x-next-url") ||
    headersList.get("x-invoke-path") ||
    "";

  // For login page, render children directly without auth check
  // Next.js doesn't expose pathname easily in layouts, so we check
  // via the middleware which already allows /admin/login through
  const supabase = await createAuthServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    // If not authenticated, render children directly (login page)
    // The middleware already redirects non-login admin pages
    return <>{children}</>;
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh", fontFamily: "system-ui" }}>
      {/* Sidebar */}
      <aside
        style={{
          width: 200,
          background: "#1a1a2e",
          color: "#fff",
          padding: "20px 0",
          flexShrink: 0,
        }}
      >
        <div style={{ padding: "0 16px", marginBottom: 24 }}>
          <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>Pathfinder</h2>
          <p style={{ margin: "2px 0 0", fontSize: 12, color: "#999" }}>Admin</p>
        </div>
        <nav>
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              style={{
                display: "block",
                padding: "10px 16px",
                fontSize: 14,
                color: "#ccc",
                textDecoration: "none",
              }}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>

      {/* Main content */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        {/* Header */}
        <header
          style={{
            padding: "12px 24px",
            borderBottom: "1px solid #eee",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            background: "#fff",
          }}
        >
          <span style={{ fontSize: 13, color: "#666" }}>{user.email}</span>
          <LogoutButton />
        </header>

        {/* Content */}
        <main style={{ flex: 1, padding: 24, background: "#f8f9fa" }}>
          {children}
        </main>
      </div>
    </div>
  );
}
