/**
 * Test: Realistic arraigo social conversation flow.
 *
 * Sends messages one-by-one like a real user and validates:
 * - Bot asks the RIGHT fields for EX-10 (arraigo social)
 * - Bot does NOT ask irrelevant fields (estadoCivil, nombrePadre/Madre)
 * - Bot is proactive (asks questions, doesn't wait)
 * - Phase transitions happen at the right time
 * - Data extraction works correctly
 * - Communication quality (empathy, explains WHY)
 *
 * Requires: npm run dev (localhost:3000) + ANTHROPIC_API_KEY
 *
 * Run: npx tsx scripts/test-conversation-arraigo.ts
 */

const BASE_URL = process.env.BASE_URL || "http://localhost:3000";

// ── Helpers ──────────────────────────────────────────────────────────

async function sendMessage(
  message: string,
  conversationId: string | null,
  opts: { authSlugs?: string[]; mode?: "info" | "collection" } = {}
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
      auth_slugs: opts.authSlugs || ["arraigo_social"],
      mode: opts.mode || "collection",
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

// ── Assertion helpers ────────────────────────────────────────────────

let passed = 0;
let failed = 0;
let warnings = 0;

function assert(condition: boolean, name: string) {
  if (condition) {
    console.log(`  ✓ ${name}`);
    passed++;
  } else {
    console.error(`  ✗ ${name}`);
    failed++;
  }
}

function warn(condition: boolean, name: string) {
  if (condition) {
    console.log(`  ✓ ${name}`);
    passed++;
  } else {
    console.log(`  ⚠ ${name} (warning — LLM-dependent)`);
    warnings++;
  }
}

function getCollectedData(events: Array<{ type: string; [key: string]: unknown }>): Record<string, string> {
  const dataEvents = events.filter((e) => e.type === "data_update");
  // Last data_update has the most complete data
  const last = dataEvents[dataEvents.length - 1];
  return (last?.collected as Record<string, string>) || {};
}

function getCompletionPct(events: Array<{ type: string; [key: string]: unknown }>): number {
  const dataEvents = events.filter((e) => e.type === "data_update");
  const last = dataEvents[dataEvents.length - 1];
  return (last?.completionPct as number) || 0;
}

function hasPhaseChange(events: Array<{ type: string; [key: string]: unknown }>, phase: string): boolean {
  return events.some((e) => e.type === "phase_change" && (e as { phase?: string }).phase === phase);
}

// Fields that EX-10 (arraigo social) REQUIRES
const ARRAIGO_REQUIRED = [
  "nombre", "primerApellido", "fechaNacimiento",
  "nacionalidad", "tipoDocumento", "numeroDocumento",
  "domicilio", "localidad", "provincia", "codigoPostal",
];

// Fields that arraigo social should NOT require
const ARRAIGO_NOT_REQUIRED = [
  "estadoCivil",     // Only EX-02, EX-19, EX-24
  "nombrePadre",     // Only EX-25 (minors)
  "nombreMadre",     // Only EX-25 (minors)
  "nie",             // Optional for EX-10
];

// ── Conversation simulation ──────────────────────────────────────────

async function runConversation() {
  console.log(`\nTesting against: ${BASE_URL}`);
  console.log("Checking server availability...\n");

  try {
    const health = await fetch(`${BASE_URL}/api/tree`);
    // Accept any response (even 500) as "server is running"
    console.log(`Server responded (${health.status}).\n`);
  } catch {
    console.error("ERROR: Server not available. Start with 'npm run dev' first.");
    process.exit(1);
  }

  let convId: string;
  let allCollected: Record<string, string> = {};

  // ── STEP 1: First contact ──────────────────────────────────────
  console.log("═══ STEP 1: Primer contacte — molt bàsic ═══");
  console.log('  → Usuari: "Hola, necesito ayuda con mis papeles"');
  {
    const result = await sendMessage("Hola, necesito ayuda con mis papeles", null);
    convId = result.conversationId;

    assert(convId.length > 0, "Got conversation ID");

    const consentEvent = result.events.find((e) => e.type === "consent_request");
    assert(!!consentEvent, "Got consent_request (GDPR compliance)");

    // Bot should respond with something, even before consent
    assert(result.text.length > 0, "Bot responded with text");
    console.log(`  ℹ Bot: "${result.text.slice(0, 150)}..."`);
  }

  // ── STEP 2: Accept consent ─────────────────────────────────────
  console.log("\n═══ STEP 2: Acceptar consentiment GDPR ═══");
  {
    await acceptConsent(convId);
    console.log("  ✓ Consent accepted");
    passed++;
  }

  // ── STEP 3: Answer name + nationality ──────────────────────────
  console.log("\n═══ STEP 3: Nom i nacionalitat ═══");
  console.log('  → Usuari: "Me llamo Fatima Benali, soy marroquí"');
  {
    const result = await sendMessage(
      "Me llamo Fatima Benali, soy marroquí",
      convId
    );

    const collected = getCollectedData(result.events);
    allCollected = { ...allCollected, ...collected };

    // Should extract nombre and/or nacionalidad
    const extractedName = !!(collected.nombre || collected.primerApellido);
    assert(extractedName, `Extracted name (nombre=${collected.nombre}, apellido=${collected.primerApellido})`);

    warn(
      !!collected.nacionalidad,
      `Extracted nacionalidad (${collected.nacionalidad})`
    );

    const pct = getCompletionPct(result.events);
    assert(pct > 0 && pct < 100, `Progress > 0% and < 100% (got ${pct}%)`);

    // Bot should be PROACTIVE: ask the next question, not wait
    const textLower = result.text.toLowerCase();
    const asksQuestion = textLower.includes("?");
    warn(asksQuestion, "Bot asks a follow-up question (proactive)");

    // Bot should NOT ask about estado civil or parent names for arraigo
    const asksEstadoCivil =
      textLower.includes("estado civil") || textLower.includes("casad");
    assert(!asksEstadoCivil, "Bot does NOT ask estado civil (not needed for arraigo)");

    const asksParents =
      textLower.includes("padre") || textLower.includes("madre");
    assert(!asksParents, "Bot does NOT ask parent names (not needed for arraigo)");

    console.log(`  ℹ Bot: "${result.text.slice(0, 200)}..."`);
    console.log(`  ℹ Progress: ${pct}%`);
  }

  // ── STEP 4: Document ───────────────────────────────────────────
  console.log("\n═══ STEP 4: Document d'identitat ═══");
  console.log('  → Usuari: "Tengo pasaporte, es el AB1234567"');
  {
    const result = await sendMessage(
      "Tengo pasaporte, es el AB1234567",
      convId
    );

    const collected = getCollectedData(result.events);
    allCollected = { ...allCollected, ...collected };

    warn(
      collected.tipoDocumento === "pasaporte" || !!collected.tipoDocumento,
      `Extracted tipoDocumento (${collected.tipoDocumento})`
    );
    warn(
      !!collected.numeroDocumento,
      `Extracted numeroDocumento (${collected.numeroDocumento ? "****" + collected.numeroDocumento.slice(-4) : "empty"})`
    );

    // PII check: bot should NOT repeat the full document number
    assert(
      !result.text.includes("AB1234567"),
      "Bot does NOT repeat full document number in text (PII protection)"
    );

    console.log(`  ℹ Bot: "${result.text.slice(0, 200)}..."`);
    console.log(`  ℹ Progress: ${getCompletionPct(result.events)}%`);
  }

  // ── STEP 5: Date of birth + situational info ──────────────────
  console.log("\n═══ STEP 5: Data de naixement + context situacional ═══");
  console.log('  → Usuari: "Nací el 3 de marzo de 1995. Llevo en España 4 años, trabajo limpiando casas"');
  {
    const result = await sendMessage(
      "Nací el 3 de marzo de 1995. Llevo en España 4 años, trabajo limpiando casas",
      convId
    );

    const collected = getCollectedData(result.events);
    allCollected = { ...allCollected, ...collected };

    warn(
      !!collected.fechaNacimiento,
      `Extracted fechaNacimiento (${collected.fechaNacimiento})`
    );

    // Bot should acknowledge the situational info and still guide
    const textLower = result.text.toLowerCase();
    const acknowledgesContext = textLower.includes("arraigo") ||
      textLower.includes("trabaj") ||
      textLower.includes("situación") ||
      textLower.includes("año");
    warn(acknowledgesContext, "Bot acknowledges user's life context (empathy/relevance)");

    // Bot should ask next field (address) proactively
    const asksAddress =
      textLower.includes("dirección") ||
      textLower.includes("domicilio") ||
      textLower.includes("viv") ||
      textLower.includes("dónde") ||
      textLower.includes("?");
    warn(asksAddress, "Bot proactively asks next (address)");

    console.log(`  ℹ Bot: "${result.text.slice(0, 250)}..."`);
    console.log(`  ℹ Progress: ${getCompletionPct(result.events)}%`);
  }

  // ── STEP 6: Address ────────────────────────────────────────────
  console.log("\n═══ STEP 6: Adreça completa ═══");
  console.log('  → Usuari: "Vivo en la Calle Lepanto 42, 3ro 2a, Barcelona, código postal 08025"');
  {
    const result = await sendMessage(
      "Vivo en la Calle Lepanto 42, 3ro 2a, Barcelona, código postal 08025",
      convId
    );

    const collected = getCollectedData(result.events);
    allCollected = { ...allCollected, ...collected };
    const pct = getCompletionPct(result.events);

    warn(!!collected.domicilio, `Extracted domicilio (${collected.domicilio})`);
    warn(!!collected.localidad, `Extracted localidad (${collected.localidad})`);
    warn(!!collected.provincia, `Extracted provincia (${collected.provincia})`);
    warn(!!collected.codigoPostal, `Extracted codigoPostal (${collected.codigoPostal})`);

    console.log(`  ℹ Bot: "${result.text.slice(0, 250)}..."`);
    console.log(`  ℹ Progress: ${pct}%`);

    // Check if we transitioned to resum
    if (hasPhaseChange(result.events, "resum")) {
      console.log("  ℹ → Phase change to RESUM detected!");
    } else {
      console.log(`  ℹ Not yet transitioned — might need more fields`);
    }
  }

  // ── STEP 7: If still missing fields, provide them ──────────────
  // Check what's still missing
  const stillMissing = ARRAIGO_REQUIRED.filter((f) => !allCollected[f] || allCollected[f].trim() === "");
  if (stillMissing.length > 0) {
    console.log(`\n═══ STEP 7: Completar camps pendents ═══`);
    console.log(`  ℹ Missing fields: ${stillMissing.join(", ")}`);

    // Build a message that provides all remaining missing fields
    const fillGaps: Record<string, string> = {
      nombre: "Fatima",
      primerApellido: "Benali",
      segundoApellido: "",
      fechaNacimiento: "1995-03-03",
      nacionalidad: "marroquí",
      tipoDocumento: "pasaporte",
      numeroDocumento: "AB1234567",
      domicilio: "Calle Lepanto 42, 3ro 2a",
      localidad: "Barcelona",
      provincia: "Barcelona",
      codigoPostal: "08025",
    };

    const missingInfo = stillMissing.map((f) => {
      const labels: Record<string, string> = {
        nombre: "Mi nombre es Fatima",
        primerApellido: "mi apellido es Benali",
        fechaNacimiento: "nací el 3 de marzo del 95",
        nacionalidad: "soy marroquí",
        tipoDocumento: "tengo pasaporte",
        numeroDocumento: "número AB1234567",
        domicilio: "vivo en Calle Lepanto 42",
        localidad: "en Barcelona ciudad",
        provincia: "provincia Barcelona",
        codigoPostal: "código postal 08025",
      };
      return labels[f] || `${f}: ${fillGaps[f]}`;
    });

    const msg = missingInfo.join(", ");
    console.log(`  → Usuari: "${msg}"`);

    const result = await sendMessage(msg, convId);
    const collected = getCollectedData(result.events);
    allCollected = { ...allCollected, ...collected };

    console.log(`  ℹ Bot: "${result.text.slice(0, 200)}..."`);
    console.log(`  ℹ Progress: ${getCompletionPct(result.events)}%`);

    if (hasPhaseChange(result.events, "resum")) {
      console.log("  ✓ Phase change to RESUM detected!");
      passed++;
    }
  }

  // ── OVERALL FIELD ANALYSIS ─────────────────────────────────────
  console.log("\n═══ FIELD ANALYSIS: What was collected ═══");
  {
    const collectedKeys = Object.keys(allCollected).filter(
      (k) => allCollected[k] && allCollected[k].trim() !== ""
    );

    console.log(`  Collected ${collectedKeys.length} fields: ${collectedKeys.join(", ")}`);

    // Verify required fields were collected
    for (const field of ARRAIGO_REQUIRED) {
      const hasIt = collectedKeys.includes(field);
      if (hasIt) {
        console.log(`  ✓ ${field}: "${field === "numeroDocumento" ? "****" + allCollected[field]?.slice(-4) : allCollected[field]}"`);
        passed++;
      } else {
        console.log(`  ⚠ ${field}: missing (LLM extraction varies)`);
        warnings++;
      }
    }

    // Verify fields that should NOT have been collected
    console.log("\n  Fields that should NOT be actively collected:");
    for (const field of ARRAIGO_NOT_REQUIRED) {
      const hasIt = collectedKeys.includes(field);
      if (!hasIt) {
        console.log(`  ✓ ${field}: correctly not collected`);
        passed++;
      } else {
        // It's OK if user volunteers info but bot shouldn't have asked
        console.log(`  ⚠ ${field}: was collected ("${allCollected[field]}") — bot shouldn't have asked for it`);
        warnings++;
      }
    }
  }

  // ── COMMUNICATION QUALITY CHECK ────────────────────────────────
  console.log("\n═══ COMMUNICATION QUALITY ═══");
  console.log("  (These are soft checks — LLM variability is expected)\n");

  // ── SUMMARY ────────────────────────────────────────────────────

  console.log(`\n${"═".repeat(50)}`);
  console.log(`Results: ${passed} passed, ${failed} hard failures, ${warnings} warnings`);
  console.log(`\nNotes:`);
  console.log(`  - Hard failures indicate structural bugs (wrong fields, missing events)`);
  console.log(`  - Warnings indicate LLM variability (extraction, phrasing)`);
  console.log(`  - Data extraction depends on Claude Haiku tool_use output`);
  console.log(`  - Check the "ℹ Bot:" lines to evaluate communication quality`);
  if (failed > 0) process.exit(1);
}

runConversation().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
