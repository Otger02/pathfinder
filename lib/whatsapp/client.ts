/**
 * Meta WhatsApp Cloud API client.
 *
 * We use Meta's Cloud API directly (not Twilio or another BSP) — it has a
 * free tier and avoids a middleman markup, per the project's "platform-native
 * before custom infrastructure" principle.
 *
 * Required environment variables (set in Vercel; NEVER prefix NEXT_PUBLIC_):
 *   WHATSAPP_PHONE_NUMBER_ID   — the Cloud API phone number id
 *   WHATSAPP_ACCESS_TOKEN      — a permanent system-user access token
 *   WHATSAPP_VERIFY_TOKEN      — an arbitrary string you also paste into the
 *                                Meta webhook config (for the GET challenge)
 *
 * All three are optional at build time. If they're missing, isConfigured()
 * returns false and the webhook degrades to a 503 instead of crashing — so
 * the app deploys fine before WhatsApp onboarding is complete.
 */

const GRAPH_VERSION = "v21.0";

export function isWhatsappConfigured(): boolean {
  return Boolean(
    process.env.WHATSAPP_PHONE_NUMBER_ID &&
      process.env.WHATSAPP_ACCESS_TOKEN
  );
}

export function getVerifyToken(): string | null {
  return process.env.WHATSAPP_VERIFY_TOKEN ?? null;
}

/**
 * Send a plain-text WhatsApp message. Returns true on success.
 * WhatsApp text body limit is 4096 chars — we truncate defensively.
 */
export async function sendWhatsappText(
  to: string,
  body: string
): Promise<boolean> {
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const token = process.env.WHATSAPP_ACCESS_TOKEN;
  if (!phoneNumberId || !token) return false;

  const url = `https://graph.facebook.com/${GRAPH_VERSION}/${phoneNumberId}/messages`;
  const text = body.length > 4096 ? body.slice(0, 4093) + "..." : body;

  try {
    const resp = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to,
        type: "text",
        text: { body: text },
      }),
    });
    if (!resp.ok) {
      const errBody = await resp.text();
      console.error(
        "[whatsapp] send failed:",
        resp.status,
        errBody.slice(0, 200)
      );
      return false;
    }
    return true;
  } catch (err) {
    console.error(
      "[whatsapp] send error:",
      err instanceof Error ? err.message : "unknown"
    );
    return false;
  }
}

// ── Inbound payload typings (subset of the Cloud API webhook schema) ──

export interface WhatsappInboundMessage {
  from: string; // sender phone number (E.164, no +)
  id: string;
  timestamp: string;
  type: string;
  text?: { body: string };
}

export interface WhatsappWebhookPayload {
  object?: string;
  entry?: Array<{
    changes?: Array<{
      value?: {
        messaging_product?: string;
        messages?: WhatsappInboundMessage[];
        contacts?: Array<{ wa_id: string; profile?: { name?: string } }>;
      };
    }>;
  }>;
}

/**
 * Extract the first inbound text message from a webhook payload, if any.
 * Status callbacks (delivered/read receipts) carry no `messages` array and
 * return null.
 */
export function extractInboundText(
  payload: WhatsappWebhookPayload
): { from: string; text: string } | null {
  const msg = payload.entry?.[0]?.changes?.[0]?.value?.messages?.[0];
  if (!msg || msg.type !== "text" || !msg.text?.body) return null;
  return { from: msg.from, text: msg.text.body };
}
