import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";

export const runtime = "nodejs";

/**
 * Scheduled PII cleanup. Runs cleanup_expired_pii() (migration 002), which
 * nullifies collected_data on conversations whose data_expires_at has passed.
 *
 * Without this, the 24h PII TTL promised in the privacy policy never fires —
 * a real GDPR gap. See docs/dpia.md §6 item 4.
 *
 * Scheduled by vercel.json `crons`. Vercel invokes it with
 * `Authorization: Bearer $CRON_SECRET` when CRON_SECRET is set, so we
 * reject anyone else (the endpoint would otherwise be public).
 *
 * Alternative (plan-independent, hourly): enable pg_cron in Supabase and
 *   SELECT cron.schedule('cleanup-pii','0 * * * *','SELECT cleanup_expired_pii()');
 * Vercel Hobby crons run at most once/day; Pro allows finer schedules.
 */
export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const auth = req.headers.get("authorization");
    if (auth !== `Bearer ${secret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  try {
    const supabase = createServiceClient();
    const { data, error } = await supabase.rpc("cleanup_expired_pii");
    if (error) {
      console.error("[cron/cleanup] rpc error:", error.message);
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }
    const cleaned = typeof data === "number" ? data : 0;
    console.log(`[cron/cleanup] nullified PII on ${cleaned} conversations`);
    return NextResponse.json({ ok: true, cleaned });
  } catch (err) {
    console.error(
      "[cron/cleanup] error:",
      err instanceof Error ? err.message : "unknown"
    );
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
