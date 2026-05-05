import { writeFileSync } from "fs";
import { join } from "path";

/**
 * test-chat.mjs — Simulates a full arraigo_sociolaboral conversation
 * against the local dev server. Run with: node scripts/test-chat.mjs
 */

const BASE = "http://localhost:3001";
const AUTH_SLUG = "arraigo_sociolaboral";
const LANG = "ca";

// ── Test messages — each sent as one turn ──────────────────────────────────
const TURNS = [
  // Turn 1: personal identity (bulk)
  "Em dic Mamadou Diallo Balde, nascut el 15/03/1990 a Conakry (Guinea). Soc home, solter, fill d'Ibrahima Diallo i Fatoumata Balde. Tinc passaport AA1234567. El meu telèfon és 612345678. Email: mamadou@gmail.com.",

  // Turn 2: home address
  "Visc al Carrer de Balmes 47, 3r 2a, Barcelona, província de Barcelona, codi postal 08007.",

  // Turn 3: employer (bulk)
  "Treballo a Restaurante La Barceloneta SL, NIF B12345678. L'adreça de l'empresa és Passeig de Joan de Borbó 57, Barcelona, 08003, Barcelona. Activitat: restauració i hostaleria. Telèfon empresa: 933456789.",

  // Turn 4: tipo solicitud + residencia context
  "La sol·licitud és una residència inicial (primera autorització). Porto 2 anys a Espanya sense interrupcions. Tinc contracte indefinit, 40 hores setmanals, salari SMI.",
];

// ── SSE parser ─────────────────────────────────────────────────────────────

async function* parseSSE(resp) {
  const reader = resp.body.getReader();
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
      try { yield JSON.parse(json); } catch { /* skip */ }
    }
  }
}

// ── Single turn ────────────────────────────────────────────────────────────

async function sendTurn(message, convId) {
  const body = {
    message,
    auth_slugs: [AUTH_SLUG],
    mode: "collection",
    idioma: LANG,
    ...(convId ? { conversation_id: convId } : {}),
  };

  const resp = await fetch(`${BASE}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!resp.ok) throw new Error(`HTTP ${resp.status}`);

  let resultConvId = convId;
  let botText = "";
  let consentNeeded = false;
  let collected = null;
  let missing = null;

  for await (const ev of parseSSE(resp)) {
    if (ev.type === "conversation_id") resultConvId = ev.conversation_id;
    if (ev.type === "consent_request") consentNeeded = true;
    if (ev.type === "text") { process.stdout.write(ev.text); botText += ev.text; }
    if (ev.type === "data_update") {
      collected = ev.collected;
      missing = ev.missingFields;
    }
  }

  return { convId: resultConvId, botText, consentNeeded, collected, missing };
}

// ── Accept consent ─────────────────────────────────────────────────────────

async function acceptConsent(convId) {
  await fetch(`${BASE}/api/chat/consent`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ conversation_id: convId, accepted: true }),
  });
}

// ── Main ───────────────────────────────────────────────────────────────────

async function main() {
  console.log(`\n${"═".repeat(60)}`);
  console.log(`  TEST: arraigo_sociolaboral — ${new Date().toLocaleTimeString()}`);
  console.log(`${"═".repeat(60)}\n`);

  let convId = null;
  let lastCollected = null;

  for (let i = 0; i < TURNS.length; i++) {
    const msg = TURNS[i];
    console.log(`\n${"─".repeat(60)}`);
    console.log(`[TURN ${i + 1}] USER: ${msg.slice(0, 80)}${msg.length > 80 ? "…" : ""}`);
    console.log(`${"─".repeat(60)}`);

    let result = await sendTurn(msg, convId);

    // Handle consent gate on first turn
    if (result.consentNeeded) {
      console.log("[CONSENT] Consent requested — accepting automatically…");
      convId = result.convId;
      await acceptConsent(convId);
      // Re-send same message now that consent is given
      result = await sendTurn(msg, convId);
    }

    convId = result.convId;
    if (result.collected) lastCollected = result.collected;

    if (result.botText) {
      console.log(`\n[BOT]: ${result.botText}`);
    }

    if (result.missing !== null) {
      const collectedKeys = result.collected ? Object.keys(result.collected).length : 0;
      console.log(`\n[STATE] collected=${collectedKeys}  missing=${result.missing.length}`);
      if (result.missing.length > 0) {
        console.log(`        pending: ${result.missing.slice(0, 8).join(", ")}${result.missing.length > 8 ? "…" : ""}`);
      } else {
        console.log("        ✅ ALL FIELDS COLLECTED — ready for summary");
      }
    }

  if (result.missing?.length === 0) {
      console.log("\n[→] All personal data collected. Triggering document phase...");
      // Confirm summary → switches subPhase to "document"
      await sendTurn("__CONFIRM_SUMMARY__", convId);

      // Ask about documents
      const docResult = await sendTurn(
        "Quins documents necessito per a l'arraigo sociolaboral? Ja tinc el passaport i l'empadronament de 2 anys.",
        convId
      );
      if (docResult.botText) console.log(`\n[BOT - DOCUMENTS]: ${docResult.botText}`);
      if (docResult.collected) lastCollected = docResult.collected;
      break;
    }
  }

  console.log(`\n${"═".repeat(60)}`);
  console.log("  TEST COMPLETE");
  console.log(`${"═".repeat(60)}\n`);

  // ── Generate PDF ───────────────────────────────────────────────────────
  // Load final collected data from Supabase via conversation state
  // by re-reading what the last data_update gave us.
  if (convId && lastCollected) {
    console.log("Generating EX-10 PDF…");
    console.log("\n[COLLECTED DATA]", JSON.stringify(lastCollected, null, 2));
    const pdfResp = await fetch(`${BASE}/api/pdf/form`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        personalData: lastCollected,
        exFormId: "EX-10",
        authSlug: AUTH_SLUG,
        flatten: false,
      }),
    });

    if (pdfResp.ok) {
      const buf = Buffer.from(await pdfResp.arrayBuffer());
      const outPath = join(process.cwd(), "public", "forms", `test-ex10-${Date.now()}.pdf`);
      writeFileSync(outPath, buf);
      console.log(`✅ PDF saved → ${outPath}`);
    } else {
      const err = await pdfResp.text();
      console.error("PDF generation failed:", err);
    }
  }
}

main().catch(console.error);
