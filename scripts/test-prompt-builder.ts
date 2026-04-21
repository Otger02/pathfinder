/**
 * Test: Prompt Builder — verify output for different scenarios.
 *
 * Run: npx tsx scripts/test-prompt-builder.ts
 */

import { buildSystemPrompt } from "../lib/prompt-builder";
import type { PersonalDataField } from "../lib/types/personal-data";

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

function assertContains(text: string, substring: string, name: string) {
  assert(text.includes(substring), `${name} — contains "${substring.slice(0, 50)}..."`);
}

function assertNotContains(text: string, substring: string, name: string) {
  assert(!text.includes(substring), `${name} — does NOT contain "${substring.slice(0, 50)}..."`);
}

// ── Scenario 1: Info mode (no collection) ───────────────────────────

console.log("\n═══ Scenario 1: Info mode — basic RAG prompt ═══");
{
  const prompt = buildSystemPrompt({
    idioma: "es",
    mode: "info",
    contextBlock: "DOCUMENTS DE REFERÈNCIA:\n[1] Test doc",
  });

  assertContains(prompt, "Pathfinder", "Has Pathfinder identity");
  assertContains(prompt, "español", "Language instruction = español");
  assertContains(prompt, "DOCUMENTS DE REFERÈNCIA", "Includes RAG context");
  assertNotContains(prompt, "INSTRUCCIÓ RECOLLIDA", "No collection instructions");
  assertNotContains(prompt, "collect_personal_data", "No tool reference");
}

// ── Scenario 2: Collection mode — conversa phase, empty ─────────────

console.log("\n═══ Scenario 2: Collection mode — conversa, no data yet ═══");
{
  const prompt = buildSystemPrompt({
    idioma: "es",
    mode: "collection",
    subPhase: "conversa",
    authSlugs: ["arraigo_social"],
    collectedFields: [],
    missingFields: [
      "nombre", "primerApellido", "fechaNacimiento", "nacionalidad",
      "tipoDocumento", "numeroDocumento", "domicilio", "localidad",
      "provincia", "codigoPostal",
    ] as PersonalDataField[],
    contextBlock: "No context",
  });

  assertContains(prompt, "INSTRUCCIÓ RECOLLIDA", "Has collection instructions");
  assertContains(prompt, "PROACTIU", "Tells bot to be proactive");
  assertContains(prompt, "arraigo_social", "Lists the auth slug");
  assertContains(prompt, "nombre", "Lists nombre as missing");
  assertContains(prompt, "cap camp recollit", "Shows no fields collected");
  assertContains(prompt, "PROTECCIÓ DADES", "Has PII protection rules");
  assertContains(prompt, "collect_personal_data", "References the tool");
  assertContains(prompt, "PER QUÈ", "Explains to tell user WHY each field is needed");
}

// ── Scenario 3: Collection mode — conversa phase, partial ───────────

console.log("\n═══ Scenario 3: Collection mode — conversa, partial data ═══");
{
  const prompt = buildSystemPrompt({
    idioma: "en",
    mode: "collection",
    subPhase: "conversa",
    authSlugs: ["arraigo_social"],
    collectedFields: ["nombre", "primerApellido", "nacionalidad"] as PersonalDataField[],
    missingFields: [
      "fechaNacimiento", "tipoDocumento", "numeroDocumento",
      "domicilio", "localidad", "provincia", "codigoPostal",
    ] as PersonalDataField[],
    contextBlock: "No context",
  });

  assertContains(prompt, "English", "Language instruction = English");
  assertContains(prompt, "✓ nombre", "Shows nombre as collected");
  assertContains(prompt, "✓ nacionalidad", "Shows nacionalidad as collected");
  assertContains(prompt, "• fecha de nacimiento", "Shows fechaNacimiento as pending");
}

// ── Scenario 4: Resum phase ─────────────────────────────────────────

console.log("\n═══ Scenario 4: Resum phase ═══");
{
  const prompt = buildSystemPrompt({
    idioma: "es",
    mode: "collection",
    subPhase: "resum",
    contextBlock: "No context",
  });

  assertContains(prompt, "INSTRUCCIÓ RESUM", "Has resum instructions");
  assertContains(prompt, "confirmació", "Asks for confirmation");
  assertContains(prompt, "últims 4 dígits", "PII masking instruction");
  assertNotContains(prompt, "INSTRUCCIÓ RECOLLIDA", "No collection instructions in resum");
}

// ── Scenario 5: Document phase ──────────────────────────────────────

console.log("\n═══ Scenario 5: Document phase ═══");
{
  const prompt = buildSystemPrompt({
    idioma: "fr",
    mode: "collection",
    subPhase: "document",
    contextBlock: "No context",
  });

  assertContains(prompt, "français", "Language = français");
  assertContains(prompt, "INSTRUCCIÓ DOCUMENTS", "Has document instructions");
  assertContains(prompt, "descarregar", "Mentions downloading");
}

// ── Scenario 6: Enviament phase ─────────────────────────────────────

console.log("\n═══ Scenario 6: Enviament phase ═══");
{
  const prompt = buildSystemPrompt({
    idioma: "ar",
    mode: "collection",
    subPhase: "enviament",
    contextBlock: "No context",
  });

  assertContains(prompt, "العربية", "Language = Arabic");
  assertContains(prompt, "INSTRUCCIÓ ENVIAMENT", "Has enviament instructions");
  assertContains(prompt, "correu", "Mentions email");
  assertContains(prompt, "Subdelegació", "Mentions subdelegación");
}

// ── Scenario 7: Situació legal adds context ─────────────────────────

console.log("\n═══ Scenario 7: Situació legal context ═══");
{
  const prompt = buildSystemPrompt({
    situacioLegal: "sense_autoritzacio",
    idioma: "es",
    mode: "info",
    contextBlock: "No context",
  });

  assertContains(prompt, "sense_autoritzacio", "Includes legal situation");
  assertContains(prompt, "Prioritza informació", "Prioritization instruction");
}

// ── Results ─────────────────────────────────────────────────────────

console.log(`\n${"═".repeat(50)}`);
console.log(`Results: ${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
