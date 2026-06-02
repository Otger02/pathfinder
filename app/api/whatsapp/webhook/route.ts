import { NextRequest, NextResponse } from "next/server";
import {
  isWhatsappConfigured,
  getVerifyToken,
  sendWhatsappText,
  extractInboundText,
  type WhatsappWebhookPayload,
} from "@/lib/whatsapp/client";
import { answerWhatsappQuestion } from "@/lib/whatsapp/answer";
import { checkRateLimit, getClientIp, rateLimitResponse } from "@/lib/rate-limit";

export const runtime = "nodejs";

/**
 * GET — Meta webhook verification handshake.
 * Meta calls this once when you register the webhook URL. We echo back
 * hub.challenge iff hub.verify_token matches our configured token.
 * Docs: https://developers.facebook.com/docs/graph-api/webhooks/getting-started
 */
export async function GET(req: NextRequest) {
  const params = req.nextUrl.searchParams;
  const mode = params.get("hub.mode");
  const token = params.get("hub.verify_token");
  const challenge = params.get("hub.challenge");

  const expected = getVerifyToken();
  if (mode === "subscribe" && expected && token === expected && challenge) {
    return new NextResponse(challenge, { status: 200 });
  }
  return new NextResponse("Forbidden", { status: 403 });
}

/**
 * POST — inbound message events.
 *
 * Meta requires a 200 within a few seconds or it retries. We answer the
 * user's question synchronously here because Vercel functions allow up to
 * 300s; for higher volume this should move to a queue (Vercel Queues) so
 * the webhook ACKs immediately and the reply is produced out-of-band.
 *
 * Status callbacks (delivered/read) and non-text messages are ACKed with
 * 200 and ignored.
 */
export async function POST(req: NextRequest) {
  if (!isWhatsappConfigured()) {
    // Not onboarded yet — ACK so Meta doesn't spam retries, but do nothing.
    return NextResponse.json({ ok: false, reason: "not_configured" }, { status: 200 });
  }

  // Rate limit by IP as a coarse abuse guard (Meta's edge IPs are shared,
  // so this mainly caps a single misbehaving source).
  const ip = getClientIp(req);
  const limit = checkRateLimit(ip, { windowMs: 60_000, max: 60, keyPrefix: "wa" });
  if (!limit.allowed) return rateLimitResponse(limit);

  let payload: WhatsappWebhookPayload;
  try {
    payload = (await req.json()) as WhatsappWebhookPayload;
  } catch {
    return NextResponse.json({ ok: true }, { status: 200 });
  }

  const inbound = extractInboundText(payload);
  if (!inbound) {
    // Status callback or non-text message — nothing to do.
    return NextResponse.json({ ok: true }, { status: 200 });
  }

  // Per-sender rate limit: protect Claude/Voyage spend from a flood.
  const senderLimit = checkRateLimit(inbound.from, {
    windowMs: 60_000,
    max: 8,
    keyPrefix: "wa-sender",
  });
  if (!senderLimit.allowed) {
    await sendWhatsappText(
      inbound.from,
      "Has enviat massa missatges seguits. Espera un minut, si us plau."
    );
    return NextResponse.json({ ok: true }, { status: 200 });
  }

  const answer = await answerWhatsappQuestion(inbound.text);
  await sendWhatsappText(inbound.from, answer);

  return NextResponse.json({ ok: true }, { status: 200 });
}
