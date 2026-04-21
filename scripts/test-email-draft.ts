/**
 * Test: Email Draft Generator — verify templates and mailto URLs.
 *
 * Run: npx tsx scripts/test-email-draft.ts
 */

import { generateEmailDraft } from "../lib/email/draft-generator";
import { getSubdelegacion, SUBDELEGACION_MAP } from "../lib/email/subdelegacion-map";
import { PROVINCIAS } from "../lib/types/personal-data";
import type { Lang } from "../lib/sos";

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

// ── Scenario 1: Subdelegación map covers all provinces ──────────────

console.log("\n═══ Scenario 1: All 52 provinces mapped ═══");
{
  const mapKeys = Object.keys(SUBDELEGACION_MAP);
  assert(mapKeys.length === 52, `Map has 52 entries (got ${mapKeys.length})`);

  let allMapped = true;
  const unmapped: string[] = [];
  for (const prov of PROVINCIAS) {
    if (!SUBDELEGACION_MAP[prov]) {
      allMapped = false;
      unmapped.push(prov);
    }
  }
  assert(allMapped, `All PROVINCIAS found in map${unmapped.length > 0 ? ` (missing: ${unmapped.join(", ")})` : ""}`);
}

// ── Scenario 2: Fallback to Madrid ──────────────────────────────────

console.log("\n═══ Scenario 2: Fallback for unknown province ═══");
{
  const sub = getSubdelegacion("Narnia");
  assert(sub.email === "extranjeria.madrid@correo.gob.es", "Falls back to Madrid");
}

// ── Scenario 3: Spanish email draft ─────────────────────────────────

console.log("\n═══ Scenario 3: Spanish draft — arraigo social ═══");
{
  const draft = generateEmailDraft({
    personalData: {
      nombre: "Ahmed",
      primerApellido: "El Fassi",
      segundoApellido: "",
      numeroDocumento: "AB1234567",
      localidad: "Barcelona",
      provincia: "Barcelona",
    },
    authSlug: "arraigo_social",
    authName: "Arraigo social",
    provincia: "Barcelona",
    lang: "es",
  });

  assert(draft.to === "extranjeria.barcelona@correo.gob.es", "To = Barcelona");
  assert(draft.toName.includes("Barcelona"), "toName includes Barcelona");
  assert(draft.subject.includes("Arraigo social"), "Subject mentions auth");
  assert(draft.body.includes("Ahmed El Fassi"), "Body has full name");
  assert(draft.body.includes("****4567"), "Doc number masked (last 4)");
  assert(draft.body.includes("Barcelona"), "Body has localidad");
  assert(draft.mailtoUrl.startsWith("mailto:"), "mailto URL starts correctly");
  assert(draft.mailtoUrl.includes("extranjeria.barcelona"), "mailto has right email");
  assert(draft.body.includes("Pathfinder"), "Footer mentions Pathfinder");

  console.log(`  ℹ Subject: ${draft.subject}`);
  console.log(`  ℹ Body length: ${draft.body.length} chars`);
  console.log(`  ℹ Mailto URL length: ${draft.mailtoUrl.length} chars`);
}

// ── Scenario 4: English email draft ─────────────────────────────────

console.log("\n═══ Scenario 4: English draft ═══");
{
  const draft = generateEmailDraft({
    personalData: {
      nombre: "Maria",
      primerApellido: "García",
      nie: "Y1234567X",
      localidad: "Madrid",
      provincia: "Madrid",
    },
    authSlug: "residencia_no_lucrativa",
    authName: "Non-lucrative residence",
    provincia: "Madrid",
    lang: "en",
  });

  assert(draft.body.includes("Dear Sir/Madam"), "English salutation");
  assert(draft.body.includes("Maria García"), "Has full name");
  assert(draft.subject.includes("Non-lucrative"), "English subject");
}

// ── Scenario 5: Arabic email draft ──────────────────────────────────

console.log("\n═══ Scenario 5: Arabic draft ═══");
{
  const draft = generateEmailDraft({
    personalData: {
      nombre: "فاطمة",
      primerApellido: "الحسني",
      numeroDocumento: "CD9876543",
      localidad: "Málaga",
      provincia: "Málaga",
    },
    authSlug: "arraigo_familiar",
    authName: "Arraigo familiar",
    provincia: "Málaga",
    lang: "ar",
  });

  assert(draft.body.includes("السيد/السيدة"), "Arabic salutation");
  assert(draft.body.includes("فاطمة الحسني"), "Arabic name");
  assert(draft.to.includes("malaga"), "Málaga email");
}

// ── Scenario 6: French email draft ──────────────────────────────────

console.log("\n═══ Scenario 6: French draft ═══");
{
  const draft = generateEmailDraft({
    personalData: {
      nombre: "Jean",
      primerApellido: "Dupont",
      localidad: "Valencia",
      provincia: "Valencia",
    },
    authSlug: "reagrupacio_familiar",
    authName: "Regroupement familial",
    provincia: "Valencia",
    lang: "fr",
  });

  assert(draft.body.includes("Monsieur/Madame"), "French salutation");
  assert(draft.subject.includes("Regroupement"), "French subject");
}

// ── Scenario 7: All 4 languages produce valid drafts ────────────────

console.log("\n═══ Scenario 7: All 4 languages produce valid output ═══");
{
  const langs: Lang[] = ["es", "en", "ar", "fr"];
  for (const lang of langs) {
    const draft = generateEmailDraft({
      personalData: { nombre: "Test", primerApellido: "User", localidad: "Madrid", provincia: "Madrid" },
      authSlug: "arraigo_social",
      authName: "Test Auth",
      provincia: "Madrid",
      lang,
    });

    assert(draft.to.length > 0, `${lang}: has 'to'`);
    assert(draft.subject.length > 0, `${lang}: has subject`);
    assert(draft.body.length > 50, `${lang}: body > 50 chars (got ${draft.body.length})`);
    assert(draft.mailtoUrl.startsWith("mailto:"), `${lang}: valid mailto`);
    assert(draft.mailtoUrl.length <= 2000, `${lang}: mailto <= 2000 chars (got ${draft.mailtoUrl.length})`);
  }
}

// ── Scenario 8: PII masking — short doc numbers ─────────────────────

console.log("\n═══ Scenario 8: PII masking edge cases ═══");
{
  // Doc number shorter than 4 chars
  const draft = generateEmailDraft({
    personalData: {
      nombre: "Test",
      primerApellido: "User",
      numeroDocumento: "AB",
      localidad: "Madrid",
      provincia: "Madrid",
    },
    authSlug: "arraigo_social",
    authName: "Test",
    provincia: "Madrid",
    lang: "es",
  });
  assert(!draft.body.includes("AB12"), "Short doc not leaked");

  // No doc at all
  const draft2 = generateEmailDraft({
    personalData: {
      nombre: "Test",
      primerApellido: "User",
      localidad: "Madrid",
      provincia: "Madrid",
    },
    authSlug: "arraigo_social",
    authName: "Test",
    provincia: "Madrid",
    lang: "es",
  });
  assert(draft2.body.includes("****"), "Shows masked placeholder when no doc");
}

// ── Results ─────────────────────────────────────────────────────────

console.log(`\n${"═".repeat(50)}`);
console.log(`Results: ${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
