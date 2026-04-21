/**
 * Test: Collection Engine — pure function unit tests.
 *
 * Run: npx tsx scripts/test-collection-engine.ts
 */

import {
  computeMissingFields,
  shouldTransitionToResum,
  mergeExtractedData,
  computeCompletionPct,
} from "../lib/collection-engine";
import type { PersonalData } from "../lib/types/personal-data";

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

// ── Scenario 1: Empty data — all base fields missing ────────────────

console.log("\n═══ Scenario 1: Arraigo social — empty data ═══");
{
  const missing = computeMissingFields(["arraigo_social"], {});
  assert(missing.length >= 10, `Missing fields >= 10 (got ${missing.length})`);
  assert(missing.includes("nombre"), "nombre is missing");
  assert(missing.includes("provincia"), "provincia is missing");
  assert(missing.includes("codigoPostal"), "codigoPostal is missing");

  const pct = computeCompletionPct(["arraigo_social"], {});
  assert(pct === 0, `Completion = 0% (got ${pct}%)`);

  const transition = shouldTransitionToResum(["arraigo_social"], {});
  assert(!transition, "Should NOT transition to resum");
}

// ── Scenario 2: Partial data — some fields filled ───────────────────

console.log("\n═══ Scenario 2: Partial data (name + nationality) ═══");
{
  const partial: Partial<PersonalData> = {
    nombre: "Ahmed",
    primerApellido: "El Fassi",
    nacionalidad: "Marroquí",
  };

  const missing = computeMissingFields(["arraigo_social"], partial);
  assert(!missing.includes("nombre"), "nombre is NOT missing");
  assert(!missing.includes("nacionalidad"), "nacionalidad is NOT missing");
  assert(missing.includes("domicilio"), "domicilio IS still missing");

  const pct = computeCompletionPct(["arraigo_social"], partial);
  assert(pct > 0 && pct < 100, `Completion between 0-100% (got ${pct}%)`);
  console.log(`  ℹ Completion: ${pct}%`);
}

// ── Scenario 3: Merge extracted data ────────────────────────────────

console.log("\n═══ Scenario 3: Merge extracted data ═══");
{
  const existing: Partial<PersonalData> = {
    nombre: "Ahmed",
    primerApellido: "El Fassi",
  };

  const extracted: Partial<PersonalData> = {
    nacionalidad: "Marroquí",
    fechaNacimiento: "1992-05-15",
    nombre: "", // empty — should NOT overwrite
  };

  const merged = mergeExtractedData(existing, extracted);
  assert(merged.nombre === "Ahmed", "nombre preserved (empty not overwritten)");
  assert(merged.nacionalidad === "Marroquí", "nacionalidad added");
  assert(merged.fechaNacimiento === "1992-05-15", "fechaNacimiento added");
  assert(merged.primerApellido === "El Fassi", "primerApellido preserved");
}

// ── Scenario 4: Full data — should transition ──────────────────────

console.log("\n═══ Scenario 4: All fields filled — transition to resum ═══");
{
  const fullData: Partial<PersonalData> = {
    nombre: "Ahmed",
    primerApellido: "El Fassi",
    fechaNacimiento: "1992-05-15",
    nacionalidad: "Marroquí",
    tipoDocumento: "pasaporte",
    numeroDocumento: "AB1234567",
    domicilio: "Calle Mayor 5",
    localidad: "Barcelona",
    provincia: "Barcelona",
    codigoPostal: "08001",
  };

  const missing = computeMissingFields(["arraigo_social"], fullData);
  assert(missing.length === 0, `No missing fields (got ${missing.length})`);

  const pct = computeCompletionPct(["arraigo_social"], fullData);
  assert(pct === 100, `Completion = 100% (got ${pct}%)`);

  const transition = shouldTransitionToResum(["arraigo_social"], fullData);
  assert(transition, "Should transition to resum");
}

// ── Scenario 5: Multiple auth slugs ────────────────────────────────

console.log("\n═══ Scenario 5: Multiple auth slugs (reagrupació + arraigo) ═══");
{
  const missing1 = computeMissingFields(["reagrupacio_familiar"], {});
  const missing2 = computeMissingFields(["arraigo_social"], {});
  const missingBoth = computeMissingFields(
    ["reagrupacio_familiar", "arraigo_social"],
    {}
  );

  // reagrupació requires estadoCivil (EX-02), arraigo doesn't (EX-10)
  assert(missing1.includes("estadoCivil"), "reagrupació requires estadoCivil");
  assert(!missing2.includes("estadoCivil"), "arraigo does NOT require estadoCivil");
  assert(
    missingBoth.includes("estadoCivil"),
    "combined requires estadoCivil (union)"
  );
  assert(
    missingBoth.length >= missing1.length,
    "Combined missing >= individual"
  );
}

// ── Scenario 6: Auth with no EX form ───────────────────────────────

console.log("\n═══ Scenario 6: Auth with no EX form (EU registration) ═══");
{
  const missing = computeMissingFields(["certificat_registre_ciutada_ue"], {});
  assert(missing.length === 0, "No fields required (no EX form)");

  const pct = computeCompletionPct(["certificat_registre_ciutada_ue"], {});
  assert(pct === 100, "100% complete (nothing to collect)");

  const transition = shouldTransitionToResum(
    ["certificat_registre_ciutada_ue"],
    {}
  );
  assert(transition, "Immediate transition (nothing needed)");
}

// ── Scenario 7: Minors (EX-25) — requires parent names ─────────────

console.log("\n═══ Scenario 7: Minors (EX-25) — parent names required ═══");
{
  const missing = computeMissingFields(["menor_no_acompanyat"], {});
  assert(missing.includes("nombrePadre"), "nombrePadre required for minors");
  assert(missing.includes("nombreMadre"), "nombreMadre required for minors");

  // Fill everything except parents
  const partial: Partial<PersonalData> = {
    nombre: "Youssef",
    primerApellido: "Benali",
    fechaNacimiento: "2008-03-20",
    nacionalidad: "Marroquí",
    tipoDocumento: "pasaporte",
    numeroDocumento: "CD9876543",
    domicilio: "Centro de menores",
    localidad: "Girona",
    provincia: "Girona",
    codigoPostal: "17001",
  };
  const stillMissing = computeMissingFields(["menor_no_acompanyat"], partial);
  assert(
    stillMissing.includes("nombrePadre"),
    "Still needs padre even with base fields filled"
  );
  assert(
    !shouldTransitionToResum(["menor_no_acompanyat"], partial),
    "Cannot transition without parent names"
  );

  // Now add parents
  const withParents = mergeExtractedData(partial, {
    nombrePadre: "Hassan Benali",
    nombreMadre: "Fatima Ait",
  });
  assert(
    shouldTransitionToResum(["menor_no_acompanyat"], withParents),
    "Can transition with parent names filled"
  );
}

// ── Results ─────────────────────────────────────────────────────────

console.log(`\n${"═".repeat(50)}`);
console.log(`Results: ${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
