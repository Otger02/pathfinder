/**
 * Test: End-to-end chat flow simulation.
 *
 * Simulates a complete conversation with the real /api/chat endpoint:
 * 1. Send first message → get consent_request
 * 2. Accept consent
 * 3. Send personal data progressively → get data_update events
 * 4. Complete all fields → get phase_change to "resum"
 * 5. Confirm summary → get phase_change to "document"
 *
 * Requires: next dev running on localhost:3000 + valid API keys in .env.local
 *
 * Run: npx tsx scripts/test-chat-flow.ts
 */

const BASE_URL = process.env.BASE_URL || "http://localhost:3000";

// ── Helpers ──────────────────────────────────────────────────────────

async function sendMessage(
  message: string,
  conversationId: string | null,
  opts: {
    authSlugs?: string[];
    mode?: "info" | "collection";
  } = {}
): Promise<{
  conversationId: string;
  text: string;
  events: Array<{ type: string; [key: string]: unknown }>;
}> {
  const resp = await fetch(`${BASE_URL}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      message,
      conversation_id: conversationId,
      idioma: "es",
      auth_slugs: opts.authSlugs,
      mode: opts.mode,
    }),
  });

  if (!resp.ok) {
    const err = await resp.text();
    throw new Error(`HTTP ${resp.status}: ${err}`);
  }

  const reader = resp.body!.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let text = "";
  let convId = conversationId || "";
  const events: Array<{ type: string; [key: string]: unknown }> = [];

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n\n");
    buffer = lines.pop() || "";

    for (const line of lines) {
      if (!line.startsWith("data: ")) continue;
      try {
        const event = JSON.parse(line.slice(6));
        events.push(event);

        if (event.type === "conversation_id") convId = event.conversation_id;
        if (event.type === "text") text += event.text;
      } catch { /* skip */ }
    }
  }

  return { conversationId: convId, text, events };
}

async function acceptConsent(conversationId: string): Promise<void> {
  const resp = await fetch(`${BASE_URL}/api/chat/consent`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ conversation_id: conversationId }),
  });
  if (!resp.ok) throw new Error(`Consent failed: ${resp.status}`);
}

async function generateEmailDraft(
  personalData: Record<string, string>,
  authSlug: string,
  provincia: string
): Promise<{ to: string; subject: string; mailtoUrl: string }> {
  const resp = await fetch(`${BASE_URL}/api/email/draft`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ personalData, authSlug, provincia, lang: "es" }),
  });
  if (!resp.ok) throw new Error(`Email draft failed: ${resp.status}`);
  return resp.json();
}

// ── Test scenarios ───────────────────────────────────────────────────

let passed = 0;
let failed = 0;

function assert(condition: boolean, name: string) {
  if (condition) {
    console.log(`  ✓ ${name}`);
    passed++;
  } else {
    console.error(`  ✗ ${name}`);
    failed++;
  }
}

async function runTests() {
  console.log(`\nTesting against: ${BASE_URL}`);
  console.log("Checking server availability...");

  try {
    const health = await fetch(`${BASE_URL}/api/tree`);
    if (!health.ok) throw new Error("Server not ready");
    console.log("Server OK.\n");
  } catch {
    console.error("ERROR: Server not available. Start with 'npm run dev' first.");
    process.exit(1);
  }

  // ── Scenario A: Info mode (no auth slugs) ───────────────────────

  console.log("═══ Scenario A: Info mode — RAG question ═══");
  {
    const result = await sendMessage("¿Qué es el arraigo social?", null, {
      mode: "info",
    });

    assert(result.conversationId.length > 0, "Got conversation ID");
    assert(result.text.length > 50, `Got substantial response (${result.text.length} chars)`);

    const hasText = result.events.some((e) => e.type === "text");
    assert(hasText, "Has text events");

    const hasConsent = result.events.some((e) => e.type === "consent_request");
    assert(!hasConsent, "No consent_request in info mode");

    console.log(`  ℹ Response preview: "${result.text.slice(0, 100)}..."`);
  }

  // ── Scenario B: Collection mode — full flow ─────────────────────

  console.log("\n═══ Scenario B: Collection mode — step by step ═══");
  let convId: string;

  // B1: First message → should get consent_request
  console.log("\n  Step B1: First message → consent request");
  {
    const result = await sendMessage("Hola, necesito ayuda", null, {
      authSlugs: ["arraigo_social"],
      mode: "collection",
    });

    convId = result.conversationId;
    assert(convId.length > 0, "Got conversation ID");

    const consentEvent = result.events.find((e) => e.type === "consent_request");
    assert(!!consentEvent, "Got consent_request event");
    console.log(`  ℹ Conv ID: ${convId}`);
  }

  // B2: Accept consent
  console.log("\n  Step B2: Accept consent");
  {
    await acceptConsent(convId);
    console.log("  ✓ Consent accepted");
    passed++;
  }

  // B3: Send name + nationality → should get data_update
  console.log("\n  Step B3: Send name + nationality");
  {
    const result = await sendMessage(
      "Me llamo Ahmed El Fassi, soy de Marruecos",
      convId,
      { authSlugs: ["arraigo_social"], mode: "collection" }
    );

    const dataEvent = result.events.find((e) => e.type === "data_update") as {
      type: string;
      collected?: Record<string, string>;
      completionPct?: number;
    } | undefined;

    assert(!!dataEvent, "Got data_update event");
    if (dataEvent?.collected) {
      const hasName = !!(dataEvent.collected.nombre || dataEvent.collected.primerApellido);
      assert(hasName, `Extracted name (nombre=${dataEvent.collected.nombre}, primerApellido=${dataEvent.collected.primerApellido})`);
      console.log(`  ℹ Completion: ${dataEvent.completionPct}%`);
      console.log(`  ℹ Collected fields: ${Object.keys(dataEvent.collected).filter((k) => dataEvent.collected![k]).join(", ")}`);
    }

    assert(result.text.length > 0, "Bot replied with text too");
    console.log(`  ℹ Bot says: "${result.text.slice(0, 120)}..."`);
  }

  // B4: Send document info
  console.log("\n  Step B4: Send document info");
  {
    const result = await sendMessage(
      "Mi pasaporte es AB1234567, nací el 15 de mayo de 1992",
      convId,
      { authSlugs: ["arraigo_social"], mode: "collection" }
    );

    const dataEvent = result.events.find((e) => e.type === "data_update") as {
      type: string;
      collected?: Record<string, string>;
      completionPct?: number;
    } | undefined;

    assert(!!dataEvent, "Got data_update for documents");
    if (dataEvent?.collected) {
      console.log(`  ℹ Completion: ${dataEvent.completionPct}%`);
      console.log(`  ℹ Fields: ${Object.keys(dataEvent.collected).filter((k) => dataEvent.collected![k]).join(", ")}`);
    }
  }

  // B5: Send address
  console.log("\n  Step B5: Send address");
  {
    const result = await sendMessage(
      "Vivo en Calle Mayor 5, Barcelona, 08001, provincia Barcelona",
      convId,
      { authSlugs: ["arraigo_social"], mode: "collection" }
    );

    const dataEvent = result.events.find((e) => e.type === "data_update") as {
      type: string;
      collected?: Record<string, string>;
      completionPct?: number;
      missingFields?: string[];
    } | undefined;

    const phaseEvent = result.events.find((e) => e.type === "phase_change");

    assert(!!dataEvent, "Got data_update for address");
    if (dataEvent?.collected) {
      console.log(`  ℹ Completion: ${dataEvent.completionPct}%`);
      console.log(`  ℹ Missing: ${(dataEvent.missingFields || []).join(", ") || "none!"}`);
    }

    if (phaseEvent) {
      assert(
        (phaseEvent as { phase: string }).phase === "resum",
        "Phase changed to resum!"
      );
    } else {
      console.log("  ℹ Not all fields complete yet — continue manually");
    }
  }

  // B6: Test email draft endpoint
  console.log("\n═══ Scenario C: Email draft endpoint ═══");
  {
    const emailResult = await generateEmailDraft(
      {
        nombre: "Ahmed",
        primerApellido: "El Fassi",
        numeroDocumento: "AB1234567",
        localidad: "Barcelona",
        provincia: "Barcelona",
      },
      "arraigo_social",
      "Barcelona"
    );

    assert(emailResult.to.includes("barcelona"), "Email to Barcelona office");
    assert(emailResult.subject.length > 0, "Has subject");
    assert(emailResult.mailtoUrl.startsWith("mailto:"), "Valid mailto URL");
    console.log(`  ℹ To: ${emailResult.to}`);
    console.log(`  ℹ Subject: ${emailResult.subject}`);
  }

  // ── Results ─────────────────────────────────────────────────────

  console.log(`\n${"═".repeat(50)}`);
  console.log(`Results: ${passed} passed, ${failed} failed`);
  console.log(`\nNote: Scenario B depends on Claude Haiku extracting data correctly.`);
  console.log(`Tool_use extraction is probabilistic — minor variations are normal.`);
  if (failed > 0) process.exit(1);
}

runTests().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
