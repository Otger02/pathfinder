import { NextRequest, NextResponse } from "next/server";
import { createAuthServerClient } from "@/lib/supabase-server";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const code = searchParams.get("code");
  const returnTo = searchParams.get("returnTo") || "/chat";
  const lang = searchParams.get("lang") || "es";

  if (code) {
    const supabase = await createAuthServerClient();
    await supabase.auth.exchangeCodeForSession(code);
  }

  return NextResponse.redirect(new URL(`${returnTo}?lang=${lang}`, req.url));
}
