import { createServiceClient } from "@/lib/supabase";
import { generateEmailDraft } from "@/lib/email/draft-generator";
import { checkRateLimit, getClientIp, rateLimitResponse } from "@/lib/rate-limit";
import type { Lang } from "@/lib/sos";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const ip = getClientIp(req);
    const limit = checkRateLimit(ip, {
      windowMs: 60_000,
      max: 10,
      keyPrefix: "email-draft",
    });
    if (!limit.allowed) return rateLimitResponse(limit);

    const { personalData, authSlug, provincia, lang } = (await req.json()) as {
      personalData?: Record<string, string>;
      authSlug?: string;
      provincia?: string;
      lang?: string;
    };

    if (!personalData || !authSlug || !provincia) {
      return Response.json(
        { error: "personalData, authSlug, and provincia are required" },
        { status: 400 }
      );
    }

    // Fetch authorization name from Supabase
    const supabase = createServiceClient();
    const { data: authRow } = await supabase
      .from("authorizations")
      .select("nom")
      .eq("slug", authSlug)
      .single();

    const authName = authRow?.nom || authSlug;

    const emailDraft = generateEmailDraft({
      personalData,
      authSlug,
      authName,
      provincia,
      lang: (lang as Lang) || "es",
    });

    return Response.json(emailDraft);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal error";
    console.error("Email draft error:", message);
    return Response.json({ error: message }, { status: 500 });
  }
}
