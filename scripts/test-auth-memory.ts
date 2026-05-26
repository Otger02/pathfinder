/**
 * Test: authenticated memory across applications.
 *
 * Verifies that a logged-in user who starts a second authorization flow:
 * 1. Reuses remembered personal data from the first flow
 * 2. Does not carry over documents_obtained or tipoSolicitud
 * 3. Is asked only for the new authorization's extra fields
 *
 * Requires:
 * - next dev running on localhost:3001
 * - TEST_USER_EMAIL and E2E_LOGIN_SECRET in .env.local
 *
 * Run: npx tsx scripts/test-auth-memory.ts
 */

import fs from "node:fs";
import path from "node:path";
import { chromium } from "playwright";

const BASE_URL = process.env.BASE_URL || "http://localhost:3001";

function loadEnvLocal() {
  const envPath = path.join(process.cwd(), ".env.local");
  if (!fs.existsSync(envPath)) return;

  const raw = fs.readFileSync(envPath, "utf8");
  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const idx = trimmed.indexOf("=");
    if (idx === -1) continue;

    const key = trimmed.slice(0, idx).trim();
    const value = trimmed.slice(idx + 1).trim().replace(/^['"]|['"]$/g, "");
    if (key && !process.env[key]) process.env[key] = value;
  }
}

async function* parseSSE(resp: Response) {
  const reader = resp.body!.getReader();
  const dec = new TextDecoder();
  let buf = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buf += dec.decode(value, { stream: true });
    const lines = buf.split("\n");
    buf = lines.pop() ?? "";

    for (const line of lines) {
      if (!line.startsWith("data: ")) continue;
      const json = line.slice(6).trim();
      if (json === "[DONE]") continue;
      try {
        yield JSON.parse(json) as Record<string, unknown>;
      } catch {
        // Skip malformed SSE chunks.
      }
    }
  }
}

async function sendTurn(
  cookieHeader: string,
  body: Record<string, unknown>
): Promise<Array<Record<string, unknown>>> {
  const resp = await fetch(`${BASE_URL}/api/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Cookie: cookieHeader,
    },
    body: JSON.stringify(body),
  });

  if (!resp.ok) {
    throw new Error(`chat ${resp.status}: ${await resp.text()}`);
  }

  const events: Array<Record<string, unknown>> = [];
  for await (const ev of parseSSE(resp)) events.push(ev);
  return events;
}

async function acceptConsent(cookieHeader: string, conversationId: string) {
  const resp = await fetch(`${BASE_URL}/api/chat/consent`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Cookie: cookieHeader,
    },
    body: JSON.stringify({ conversation_id: conversationId, accepted: true }),
  });

  if (!resp.ok) {
    throw new Error(`consent ${resp.status}: ${await resp.text()}`);
  }
}

async function getConversation(cookieHeader: string, conversationId: string) {
  const resp = await fetch(`${BASE_URL}/api/conversations/${conversationId}`, {
    headers: { Cookie: cookieHeader },
  });

  if (!resp.ok) {
    throw new Error(`conversation ${resp.status}: ${await resp.text()}`);
  }

  return resp.json() as Promise<{
    id: string;
    auth_slugs: string[];
    chat_sub_phase: string;
    collected_data: Record<string, unknown>;
  }>;
}

async function loginAndGetCookieHeader() {
  loadEnvLocal();

  const email = process.env.TEST_USER_EMAIL;
  const secret = process.env.E2E_LOGIN_SECRET;
  if (!email || !secret) {
    throw new Error("Missing TEST_USER_EMAIL or E2E_LOGIN_SECRET in .env.local");
  }

  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();
  const loginUrl =
    `${BASE_URL}/api/test/login` +
    `?email=${encodeURIComponent(email)}` +
    `&secret=${encodeURIComponent(secret)}` +
    `&returnTo=${encodeURIComponent("/dashboard?lang=ca")}`;

  await page.goto(loginUrl);
  await page.waitForURL("**/dashboard**", { timeout: 30_000 });

  const cookies = await context.cookies();
  await browser.close();

  return cookies.map((cookie) => `${cookie.name}=${cookie.value}`).join("; ");
}

let passed = 0;
let failed = 0;

function assert(condition: boolean, label: string) {
  if (condition) {
    console.log(`  PASS ${label}`);
    passed++;
  } else {
    console.error(`  FAIL ${label}`);
    failed++;
  }
}

async function main() {
  console.log(`\nTesting authenticated memory against: ${BASE_URL}`);

  const uniqueToken = Date.now().toString().slice(-6);
  const uniqueName = `Mamadou${uniqueToken}`;
  const uniqueSurname = `Diallo${uniqueToken}`;
  const uniquePhone = `6123${uniqueToken.slice(-5)}`.slice(0, 9);
  const uniquePassport = `AA${uniqueToken}Z`;

  const cookieHeader = await loginAndGetCookieHeader();

  const firstMessage = [
    `Em dic ${uniqueName} ${uniqueSurname}.`,
    "Soc del Senegal.",
    "Vaig néixer el 15/03/1990 a Dakar.",
    "Soc home i solter.",
    `Tinc passaport ${uniquePassport}.`,
    `El meu telèfon és ${uniquePhone}.`,
    "Visc a Barcelona.",
  ].join(" ");

  console.log("\nScenario A: first authenticated application stores fresh data");
  const firstStart = await sendTurn(cookieHeader, {
    message: firstMessage,
    auth_slugs: ["arraigo_sociolaboral"],
    mode: "collection",
    idioma: "ca",
  });
  const firstConversationId = firstStart.find((ev) => ev.type === "conversation_id")?.conversation_id as string | undefined;
  if (!firstConversationId) throw new Error("Missing first conversation_id");

  assert(
    firstStart.some((ev) => ev.type === "consent_request"),
    "first flow requests consent"
  );

  await acceptConsent(cookieHeader, firstConversationId);

  const firstReplay = await sendTurn(cookieHeader, {
    conversation_id: firstConversationId,
    message: firstMessage,
    auth_slugs: ["arraigo_sociolaboral"],
    mode: "collection",
    idioma: "ca",
  });
  const firstDataUpdate = firstReplay.find((ev) => ev.type === "data_update");
  assert(!!firstDataUpdate, "first flow emits data_update after consent");
  const firstConversation = await getConversation(cookieHeader, firstConversationId);
  const firstCollected = firstConversation.collected_data || {};

  console.log("\nScenario B: second authenticated application reuses personal data only");
  const secondStart = await sendTurn(cookieHeader, {
    message: "Vull iniciar un altre tràmit nou.",
    auth_slugs: ["arraigo_socioformatiu"],
    mode: "collection",
    idioma: "ca",
  });
  const secondConversationId = secondStart.find((ev) => ev.type === "conversation_id")?.conversation_id as string | undefined;
  if (!secondConversationId) throw new Error("Missing second conversation_id");

  const secondConversation = await getConversation(cookieHeader, secondConversationId);
  const remembered = secondConversation.collected_data || {};

  assert(remembered.nombre === firstCollected.nombre, "second flow remembers stored name from first flow");
  assert(remembered.primerApellido === firstCollected.primerApellido, "second flow remembers stored surname from first flow");
  assert(remembered.telefono === firstCollected.telefono, "second flow remembers stored phone from first flow");
  assert(!("documents_obtained" in remembered), "second flow does not carry documents_obtained");
  assert(!("tipoSolicitud" in remembered) || remembered.tipoSolicitud === "", "second flow does not carry tipoSolicitud");

  await acceptConsent(cookieHeader, secondConversationId);

  const secondReplay = await sendTurn(cookieHeader, {
    conversation_id: secondConversationId,
    message: "Vull iniciar un altre tràmit nou.",
    auth_slugs: ["arraigo_socioformatiu"],
    mode: "collection",
    idioma: "ca",
  });

  const secondText = secondReplay
    .filter((ev) => ev.type === "text")
    .map((ev) => String(ev.text || ""))
    .join("");

  assert(
    !/quin tipus d'autoritzaci|quin tràmit|quina via|altres vies/i.test(secondText),
    "second flow does not re-ask authorization choice"
  );
  assert(
    !/com et dius|quin(?:a|) (?:és|es) la teva nacionalitat|quin(?:a|) (?:és|es) el teu passaport|quin(?:a|) (?:és|es) el teu telèfon|necessito .*?(?:nom|nacionalitat|passaport|telèfon)/i.test(secondText),
    "second flow does not re-ask remembered identity fields"
  );
  assert(
    /formaci|centre|curs|matriculat|entitat|adreça|domicili|carrer|província|codi postal/i.test(secondText),
    "second flow asks only for extra non-remembered fields"
  );

  console.log(`\n${passed} passed, ${failed} failed`);
  console.log(`Second conversation: ${secondConversationId}`);
  console.log(`Preview: ${secondText.slice(0, 240)}...`);

  if (failed > 0) process.exit(1);
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});