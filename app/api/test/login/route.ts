/**
 * Test-only login endpoint for Playwright E2E.
 *
 * Uses the Supabase service-role key to generate a magic-link, extracts the
 * one-time OTP, then verifies it via the SSR client so the response carries
 * the normal sb-<ref>-auth-token cookies that the rest of the app reads.
 *
 * Hard-disabled in production. Refuses without the shared secret.
 */
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createAuthServerClient } from "@/lib/supabase-server";

export async function GET(req: NextRequest) {
  if (process.env.NODE_ENV === "production") {
    return new NextResponse("Not found", { status: 404 });
  }

  const { searchParams } = req.nextUrl;
  const email = searchParams.get("email");
  const secret = searchParams.get("secret");
  const returnTo = searchParams.get("returnTo") || "/dashboard?lang=ca";

  if (!email || !secret) {
    return new NextResponse("Missing email/secret", { status: 400 });
  }
  if (secret !== process.env.E2E_LOGIN_SECRET) {
    return new NextResponse("Forbidden", { status: 403 });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

  const admin = createClient(supabaseUrl, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { data, error } = await admin.auth.admin.generateLink({
    type: "magiclink",
    email,
  });

  if (error || !data.properties?.email_otp) {
    return new NextResponse(
      `Failed to generate OTP: ${error?.message ?? "no email_otp"}`,
      { status: 500 }
    );
  }

  const supabase = await createAuthServerClient();
  const { error: verifyError } = await supabase.auth.verifyOtp({
    email,
    token: data.properties.email_otp,
    type: "email",
  });

  if (verifyError) {
    return new NextResponse(`verifyOtp failed: ${verifyError.message}`, {
      status: 500,
    });
  }

  return NextResponse.redirect(new URL(returnTo, req.url));
}
