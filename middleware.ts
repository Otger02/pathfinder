import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

function makeSupabase(req: NextRequest, response: { current: NextResponse }) {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return req.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => req.cookies.set(name, value));
          response.current = NextResponse.next({ request: req });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.current.cookies.set(name, value, options)
          );
        },
      },
    }
  );
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Auth callback: let the route handler do the code exchange
  if (pathname === "/auth/callback") {
    return NextResponse.next();
  }

  const response = { current: NextResponse.next({ request: req }) };
  const supabase = makeSupabase(req, response);
  const { data: { user } } = await supabase.auth.getUser();

  // /admin is protected — /admin/login is the only bypass
  if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
    if (!user) {
      return NextResponse.redirect(new URL("/admin/login", req.url));
    }
    // Verify admin role: a logged-in user is not enough — the user must
    // have an active row in `admin_users`. Regular Pathfinder users have
    // Supabase Auth accounts too (case dashboard) and must NOT see /admin.
    //
    // One indexed lookup per /admin/* navigation. Acceptable: admin pages
    // are low-traffic and the lookup hits the partial index on user_id
    // WHERE active = true. A revoked admin keeps access for at most one
    // page navigation, which the user has accepted as a reasonable trade.
    const { data: adminRow } = await supabase
      .from("admin_users")
      .select("active")
      .eq("user_id", user.id)
      .single();
    if (!adminRow?.active) {
      return NextResponse.redirect(
        new URL("/admin/login?error=forbidden", req.url)
      );
    }
  }

  // /chat/history is protected
  if (pathname === "/chat/history" && !user) {
    const lang = req.nextUrl.searchParams.get("lang") || "es";
    return NextResponse.redirect(new URL(`/auth?returnTo=/chat/history&lang=${lang}`, req.url));
  }

  // /auth pages redirect already-logged-in users back to chat
  if (pathname === "/auth" && user) {
    const returnTo = req.nextUrl.searchParams.get("returnTo") || "/chat";
    const lang = req.nextUrl.searchParams.get("lang") || "es";
    return NextResponse.redirect(new URL(`${returnTo}?lang=${lang}`, req.url));
  }

  return response.current;
}

export const config = {
  matcher: ["/admin/:path*", "/auth", "/auth/callback", "/chat/history"],
};
