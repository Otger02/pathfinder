# WhatsApp integration — setup guide

Pathfinder ships a **ready-to-connect** WhatsApp webhook. The code is done;
what remains is the Meta onboarding, which only a human with access to the
Fundació's Meta Business account can complete. Budget **a few days to ~2 weeks**
for Meta's review/verification.

## What's already built

- `app/api/whatsapp/webhook/route.ts` — GET verification + POST inbound handler.
- `lib/whatsapp/client.ts` — Meta Cloud API send + payload parsing.
- `lib/whatsapp/answer.ts` — RAG-grounded Q&A in the user's language (info mode).

The webhook degrades gracefully: with no env vars set it returns 200
`not_configured` and never crashes the deploy.

## Scope of the MVP

WhatsApp is **info mode only** — RAG Q&A over the knowledge base, with a
steer back to the web app for actual document preparation. You can't render
the decision tree, the consent modal, or fill an EX-10 over chat text, so
the form-filling flow stays on the web.

## Setup steps (human)

### 1. Meta Business + WhatsApp product
1. Create/Use a [Meta Business account](https://business.facebook.com/).
2. In [Meta for Developers](https://developers.facebook.com/), create an app
   of type **Business** and add the **WhatsApp** product.
3. In WhatsApp → API Setup, note the **Phone number ID** and generate a
   **permanent access token** (create a System User in Business Settings and
   assign it the WhatsApp permissions — the temporary 24h token is only for
   testing).
4. Register and verify the Fundació's phone number for production.

### 2. Environment variables (Vercel → Project → Settings → Environment Variables)
Mark all three **Sensitive**, apply to Production + Preview:

| Variable | Value |
|---|---|
| `WHATSAPP_PHONE_NUMBER_ID` | from API Setup |
| `WHATSAPP_ACCESS_TOKEN` | the permanent system-user token |
| `WHATSAPP_VERIFY_TOKEN` | any random string you invent (e.g. a UUID) |

Redeploy after adding them.

### 3. Configure the webhook in Meta
1. WhatsApp → Configuration → Webhook → **Edit**.
2. Callback URL: `https://<your-domain>/api/whatsapp/webhook`
3. Verify token: the exact same string as `WHATSAPP_VERIFY_TOKEN`.
4. Click **Verify and save** — Meta calls our GET handler; it echoes the
   challenge and the webhook turns green.
5. Subscribe to the **messages** field.

### 4. Test
Send a WhatsApp message to the business number from your phone. You should
get a RAG-grounded answer in your language within a few seconds.

## Hardening before real traffic (follow-ups)

- **Move to a queue.** The webhook currently answers synchronously. Under
  load, ACK immediately and produce the reply via Vercel Queues so Meta
  never times out and retries.
- **Verify the X-Hub-Signature-256 header.** Meta signs each POST with your
  app secret (`WHATSAPP_APP_SECRET`). We don't validate it yet — add an HMAC
  check so only Meta can invoke the webhook.
- **Session memory.** Each message is currently answered statelessly. Add a
  per-`wa_id` conversation row so follow-up questions keep context.
- **24h window / templates.** Outside the 24h customer-service window you can
  only send pre-approved message templates. Free-form replies only work
  within 24h of the user's last message.
- **Opt-in + privacy.** WhatsApp requires documented opt-in. Surface the
  same AI-disclosure + privacy notice (link to /privacy) in the first reply.
