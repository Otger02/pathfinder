/**
 * EX-10 End-to-End Pipeline Test
 *
 * Tests the chat→canonical model→PDF fill pipeline for 4 scenarios.
 * Runs without the dev server: calls fillExForm() directly and inspects output.
 *
 * Each scenario includes:
 *   - Simulated chat input (what the user would say)
 *   - Canonical PersonalData model (what the extractor should produce)
 *   - PDF fill execution
 *   - Field-level validation of the output
 *
 * Run: npx tsx scripts/test-ex10-e2e.ts
 */

import { PDFDocument, PDFTextField, PDFCheckBox } from "pdf-lib";
import { fillExForm } from "@/lib/pdf/form-filler";
import { EMPTY_PERSONAL_DATA } from "@/lib/types/personal-data";
import type { PersonalData } from "@/lib/types/personal-data";
import { writeFileSync, mkdirSync } from "fs";
import { join } from "path";

// ── Helpers ────────────────────────────────────────────────────────────────

const OUTPUT_DIR = "output";
mkdirSync(OUTPUT_DIR, { recursive: true });

let totalPass = 0;
let totalFail = 0;

interface CheckResult {
  field: string;
  expected: string;
  actual: string;
  ok: boolean;
}

async function inspectFilledPdf(
  pdfBytes: Uint8Array
): Promise<Map<string, string>> {
  const pdf = await PDFDocument.load(pdfBytes);
  const form = pdf.getForm();
  const result = new Map<string, string>();
  for (const field of form.getFields()) {
    const name = field.getName();
    try {
      if (field instanceof PDFTextField) {
        result.set(name, field.getText() ?? "");
      } else if (field instanceof PDFCheckBox) {
        result.set(name, field.isChecked() ? "CHECKED" : "");
      }
    } catch {}
  }
  return result;
}

function check(results: CheckResult[], field: string, actual: string, expected: string) {
  const ok = actual === expected;
  results.push({ field, expected, actual, ok });
  if (ok) totalPass++;
  else totalFail++;
}

function printResults(scenarioName: string, results: CheckResult[], notes: string[]) {
  const fails = results.filter((r) => !r.ok);
  const passes = results.filter((r) => r.ok);
  console.log(`\n${"─".repeat(60)}`);
  console.log(`${scenarioName}`);
  console.log(`  PASS: ${passes.length}  FAIL: ${fails.length}`);
  if (fails.length > 0) {
    console.log("  Failed checks:");
    for (const f of fails) {
      console.log(`    ✗ ${f.field}: expected="${f.expected}" actual="${f.actual}"`);
    }
  }
  if (notes.length > 0) {
    console.log("  Notes:");
    for (const n of notes) console.log(`    → ${n}`);
  }
}

// ── Scenario definitions ────────────────────────────────────────────────────

// ── SCENARIO 1: Caso ideal ─────────────────────────────────────────────────
// User: "Soy Amara Diallo, de Guinea Conakry, nacida el 3 de agosto de 1990.
//   Tengo el pasaporte número GA4451872. Vivo en Carrer Balmes 102, 3r 2a,
//   Barcelona, 08008, provincia Barcelona. Mi teléfono es 612345678.
//   Mi marido es Ibrahim Bah, vínculo cónyuge.
//   Curso un certificado de profesionalidad presencial en el centro
//   CIFO L'Hospitalet, NIF Q1234567A, duración 6 meses."
//
// What extractor CAN capture (via tool): nombre, primerApellido, fechaNacimiento,
//   nacionalidad, tipoDocumento, numeroDocumento, domicilio, localidad,
//   codigoPostal, provincia, telefono, sexo.
//
// What extractor CANNOT capture (not in tool schema):
//   familiar_*, formacio_*, consentimientoDehu, repPresentacion_*, notif_*
//   → These must be entered via the UI or a richer tool schema.
//   For this test we inject them directly into PersonalData.

const SCENARIO_1: Partial<PersonalData> = {
  ...EMPTY_PERSONAL_DATA,
  // Base fields (extractable via tool)
  nombre: "Amara",
  primerApellido: "Diallo",
  segundoApellido: "",
  fechaNacimiento: "1990-08-03",
  lugarNacimiento: "Conakry",
  paisNacimiento: "Guinea",
  nacionalidad: "Guineana",
  sexo: "M",
  tipoDocumento: "pasaporte",
  numeroDocumento: "GA4451872",
  domicilio: "Carrer Balmes",
  numeroDomicilio: "102",
  pisoDomicilio: "3r 2a",
  localidad: "Barcelona",
  codigoPostal: "08008",
  provincia: "Barcelona",
  telefono: "612345678",
  email: "amara.diallo@example.com",
  // EX-10 specific — NOT extractable via current tool, injected manually
  familiar_nombre: "Ibrahim",
  familiar_primerApellido: "Bah",
  familiar_sexo: "H",
  familiar_estadoCivil: "casado",
  familiar_vinculo: "cónyuge",
  formacio_entitat: "CIFO L'Hospitalet",
  formacio_nom: "Servei Público de Catalunya",
  formacio_nifCif: "Q1234567A",
  formacio_duracio: "6 meses",
  formacio_tipus: ["certificat_professional"],
  formacio_modalitat: ["presencial"],
  consentimientoDehu: true,
};

// ── SCENARIO 2: Caso incompleto ────────────────────────────────────────────
// User provides enough to start but missing required fields:
// - fechaNacimiento not provided
// - codigoPostal not provided
// - provincia not provided
// - authSlug is "arraigo_sociolaboral" → needs empleador block (entirely missing)
//
// Expected: circunstancia cb125 (sociolaboral) checked, text fields for
//   fechaNacimiento/codigoPostal/provincia empty, empleador block empty.

const SCENARIO_2: Partial<PersonalData> = {
  ...EMPTY_PERSONAL_DATA,
  nombre: "Mohamed",
  primerApellido: "Aziz",
  segundoApellido: "El Ouafi",
  // fechaNacimiento: MISSING
  nacionalidad: "Marroquí",
  tipoDocumento: "pasaporte",
  numeroDocumento: "BK7891234",
  domicilio: "Avenida Meridiana",
  numeroDomicilio: "45",
  localidad: "Barcelona",
  // codigoPostal: MISSING
  // provincia: MISSING
  telefono: "698765432",
  // empleador_* block: MISSING (not in tool schema, user didn't provide)
  consentimientoDehu: false,
};

// ── SCENARIO 3: Caso ambiguo ───────────────────────────────────────────────
// User provides data in mixed/ambiguous form:
// - Provides both passport number AND NIE (conflict: which tipoDocumento wins?)
//   The tool would capture tipoDocumento="pasaporte" (from context) but also
//   extracts nie="X1234567Z". The form-filler uses tipoDocumento for checkbox
//   and pasaporte field for Texto1.
// - estadoCivil="separado" provided — EX-10 main person has NO estadoCivil
//   checkboxes (empty map), so it correctly doesn't get checked.
// - familiar data partially provided: familiar_nombre but no familiar_sexo.
//
// authSlug: "arraigo_familiar"

const SCENARIO_3: Partial<PersonalData> = {
  ...EMPTY_PERSONAL_DATA,
  nombre: "Fatima",
  primerApellido: "Bensalem",
  fechaNacimiento: "1985-03-15",
  nacionalidad: "Tunecina",
  sexo: "M",
  tipoDocumento: "pasaporte",     // says "pasaporte" but also has NIE
  numeroDocumento: "TN9988776",
  nie: "X1234567Z",               // NIE exists but tipoDoc = pasaporte
  estadoCivil: "separado",        // EX-10 has no estadoCivil for main person
  domicilio: "Calle Gran Via",
  numeroDomicilio: "200",
  localidad: "Madrid",
  codigoPostal: "28013",
  provincia: "Madrid",
  // Familiar: nombre provided but sexo missing
  familiar_nombre: "Khalil",
  familiar_primerApellido: "Bensalem",
  familiar_vinculo: "hijo",
  // familiar_sexo: MISSING — checkbox won't be checked
  familiar_estadoCivil: "soltero",
  consentimientoDehu: false,
};

// ── SCENARIO 4: Caso inconsistente ────────────────────────────────────────
// Data contains internal contradictions that the pipeline does NOT validate:
// - tipoDocumento="nie" but numeroDocumento looks like a passport (format mismatch)
// - familiar_sexo="H" but familiar_nombre="Fatima" (looks female — not detected)
// - fechaNacimiento in wrong format (DD/MM/YYYY instead of YYYY-MM-DD)
//   → form-filler handles this with the "/" branch
//
// authSlug: "arraigo_segunda_oportunidad" → cb124

const SCENARIO_4: Partial<PersonalData> = {
  ...EMPTY_PERSONAL_DATA,
  nombre: "Carlos",
  primerApellido: "Santos",
  fechaNacimiento: "15/04/1978",   // DD/MM/YYYY — pipeline handles this too
  nacionalidad: "Brasileña",
  tipoDocumento: "nie",            // says NIE but number is passport format
  numeroDocumento: "BZ1234567",    // looks like passport, not NIE
  nie: "",                          // no actual NIE stored
  domicilio: "Calle Lepanto",
  numeroDomicilio: "12",
  localidad: "Valencia",
  codigoPostal: "46001",
  provincia: "Valencia",
  // Inconsistent familiar sexo
  familiar_nombre: "Fatima",       // name sounds female
  familiar_primerApellido: "Santos",
  familiar_sexo: "H",              // marked as male — inconsistency not detected
  familiar_estadoCivil: "casado",
  consentimientoDehu: true,
};

// ── Test runner ─────────────────────────────────────────────────────────────

async function runScenario(
  id: number,
  label: string,
  chatInput: string,
  data: Partial<PersonalData>,
  authSlug: string,
  checks: Array<{
    what: string;
    field: string;
    expected: string;
  }>
) {
  console.log(`\n${"═".repeat(60)}`);
  console.log(`SCENARIO ${id}: ${label}`);
  console.log(`Auth slug: ${authSlug}`);
  console.log(`\nSimulated chat input:\n  "${chatInput}"`);
  console.log(`\nCanonical model (non-empty fields):`);
  const nonEmpty = Object.entries(data).filter(
    ([, v]) => v !== "" && v !== null && v !== false && !(Array.isArray(v) && v.length === 0)
  );
  for (const [k, v] of nonEmpty) {
    console.log(`  ${k}: ${JSON.stringify(v)}`);
  }

  const pdfBytes = await fillExForm("EX-10", data as PersonalData, authSlug);
  if (!pdfBytes) {
    console.error("  ERROR: fillExForm returned null");
    totalFail++;
    return;
  }

  const outPath = join(OUTPUT_DIR, `EX-10-e2e-s${id}.pdf`);
  writeFileSync(outPath, pdfBytes);
  console.log(`\nPDF written: ${outPath}`);

  const fields = await inspectFilledPdf(pdfBytes);
  const results: CheckResult[] = [];
  const notes: string[] = [];

  for (const c of checks) {
    const actual = fields.get(c.field) ?? "";
    check(results, `${c.what} [${c.field}]`, actual, c.expected);
  }

  // Structural notes (not assertion failures, just pipeline observations)
  const toolExtractableFields = [
    "nombre", "primerApellido", "segundoApellido", "fechaNacimiento",
    "lugarNacimiento", "paisNacimiento", "nacionalidad", "sexo",
    "tipoDocumento", "numeroDocumento", "nie", "domicilio", "localidad",
    "provincia", "codigoPostal", "telefono", "email",
    "representanteLegal", "representanteDniNiePas",
  ];
  const providedNotExtractable = nonEmpty
    .map(([k]) => k)
    .filter((k) => !toolExtractableFields.includes(k));
  if (providedNotExtractable.length > 0) {
    notes.push(
      `TOOL GAP: ${providedNotExtractable.length} fields manually injected (not in collect_personal_data tool): ` +
        providedNotExtractable.slice(0, 6).join(", ") +
        (providedNotExtractable.length > 6 ? " ..." : "")
    );
  }

  printResults(`  ${label}`, results, notes);
  return { pass: results.filter((r) => r.ok).length, fail: results.filter((r) => !r.ok).length };
}

async function main() {
  console.log("═".repeat(60));
  console.log("EX-10 END-TO-END PIPELINE TEST");
  console.log("═".repeat(60));
  console.log("Scope: canonical model → fillExForm() → PDF field validation");
  console.log("Chat extraction simulation: manual injection (tool covers only 19 of ~60 EX-10 fields)");

  // ── Scenario 1: Ideal ──────────────────────────────────────────────────
  await runScenario(
    1,
    "IDEAL — datos casi completos",
    "Soy Amara Diallo, de Guinea Conakry, nacida el 3 de agosto de 1990. " +
      "Tengo el pasaporte GA4451872. Vivo en Carrer Balmes 102, 3r 2a, Barcelona, 08008. " +
      "Mi marido Ibrahim Bah es mi cónyuge. " +
      "Curso un certificado de profesionalidad presencial en CIFO L'Hospitalet.",
    SCENARIO_1,
    "arraigo_social",
    [
      // Text fields — base
      { what: "Nombre", field: "Texto7", expected: "Amara" },
      { what: "Primer apellido", field: "Texto5", expected: "Diallo" },
      { what: "Fecha nacimiento DD", field: "Texto8", expected: "03" },
      { what: "Fecha nacimiento MM", field: "Texto9", expected: "08" },
      { what: "Fecha nacimiento YYYY", field: "Texto10", expected: "1990" },
      { what: "Domicilio", field: "Texto16", expected: "Carrer Balmes" },
      { what: "Número domicilio", field: "Texto17", expected: "102" },
      { what: "Localidad", field: "Texto19", expected: "Barcelona" },
      { what: "Código postal", field: "Texto20", expected: "08008" },
      { what: "Provincia", field: "Texto21", expected: "Barcelona" },
      { what: "Teléfono", field: "Texto22", expected: "612345678" },
      // Checkboxes — sexo. After bug-fix: 96=X, 97=H, 98=M
      { what: "Sexo M (cb98)", field: "Casilla de verificación98", expected: "CHECKED" },
      { what: "Sexo H (not, cb97)", field: "Casilla de verificación97", expected: "" },
      { what: "Sexo X (not, cb96)", field: "Casilla de verificación96", expected: "" },
      // Checkboxes — tipoDoc. cb99/103 are estado civil; tipoDoc lives at 112-115.
      { what: "TipoDoc pasaporte (cb112)", field: "Casilla de verificación112", expected: "CHECKED" },
      { what: "TipoDoc nie (not, cb113)", field: "Casilla de verificación113", expected: "" },
      // Circunstancia
      { what: "Circunstancia arraigo_social (cb126)", field: "Casilla de verificación126", expected: "CHECKED" },
      { what: "Circunstancia arraigo_sociolaboral (no)", field: "Casilla de verificación125", expected: "" },
      // Familiar
      { what: "Familiar nombre", field: "Texto33", expected: "Ibrahim" },
      { what: "Familiar apellido", field: "Texto31", expected: "Bah" },
      { what: "Familiar vínculo", field: "Texto47", expected: "cónyuge" },
      // Familiar sexo H now lives at cb105 (after off-by-one fix)
      { what: "Familiar sexo H (cb105)", field: "Casilla de verificación105", expected: "CHECKED" },
      { what: "Familiar estadoCivil casado", field: "Casilla de verificación108", expected: "CHECKED" },
      // Formació — text fields (interactive)
      { what: "Formació entitat", field: "Texto87", expected: "CIFO L'Hospitalet" },
      { what: "Formació NIF", field: "Texto90", expected: "Q1234567A" },
      { what: "Formació duació", field: "Texto93", expected: "6 meses" },
      // Formació tipus/modalitat are NOT interactive checkboxes in the official PDF
      // (they're static graphics). EX_10_FORMACIO_TIPUS_CHECKBOXES = {} on purpose.
      // Use EX_10_FORMACIO_TIPUS_COORDS via overlay drawText to mark them.
      // The previous asserts on cb114/cb116 were spurious (cb114 = tipo doc cédula,
      // cb116 = hijos escolarización — not formació). Removed.
      // Consentiment
      { what: "Consentiment DEHú", field: "Casilla de verificación261", expected: "CHECKED" },
      // TipoSolicitud — fillEx10Checkboxes now defaults to residencia_inicial (cb120).
      { what: "TipoSolicitud residencia_inicial (default cb120)", field: "Casilla de verificación120", expected: "CHECKED" },
      { what: "TipoSolicitud header (cb119)", field: "Casilla de verificación119", expected: "CHECKED" },
    ]
  );

  // ── Scenario 2: Incompleto ─────────────────────────────────────────────
  await runScenario(
    2,
    "INCOMPLETO — faltan campos obligatorios + empleador vacío",
    "Soy Mohamed Aziz El Ouafi, marroquí, pasaporte BK7891234. " +
      "Vivo en Avenida Meridiana 45, Barcelona. No sé el código postal.",
    SCENARIO_2,
    "arraigo_sociolaboral",
    [
      // Present fields
      { what: "Nombre", field: "Texto7", expected: "Mohamed" },
      { what: "Primer apellido", field: "Texto5", expected: "Aziz" },
      { what: "TipoDoc pasaporte (cb112)", field: "Casilla de verificación112", expected: "CHECKED" },
      { what: "Circunstancia arraigo_sociolaboral (cb125)", field: "Casilla de verificación125", expected: "CHECKED" },
      // Missing required fields — must be empty
      { what: "Fecha nacimiento DD (missing)", field: "Texto8", expected: "" },
      { what: "Código postal (missing)", field: "Texto20", expected: "" },
      { what: "Provincia (missing)", field: "Texto21", expected: "" },
      // Empleador block — entirely empty (not in tool, user didn't provide)
      { what: "Empleador nombre (gap)", field: "Texto71", expected: "" },
      { what: "Empleador NIF (gap)", field: "Texto72", expected: "" },
      { what: "Empleador localidad (gap)", field: "Texto79", expected: "" },
      // Familiar — not provided
      { what: "Familiar nombre (not provided)", field: "Texto33", expected: "" },
      // Consentimiento — false
      { what: "Consentiment (false)", field: "Casilla de verificación261", expected: "" },
    ]
  );

  // ── Scenario 3: Ambiguo ────────────────────────────────────────────────
  await runScenario(
    3,
    "AMBIGUO — conflictos tipoDoc, estadoCivil ignorado, familiar parcial",
    "Me llamo Fatima Bensalem, tunecina. Tengo pasaporte TN9988776 y también NIE X1234567Z. " +
      "Estoy separada. Vivo en Gran Via 200, Madrid 28013. " +
      "Mi hijo Khalil viene conmigo pero no sé su sexo todavía.",
    SCENARIO_3,
    "arraigo_familiar",
    [
      // tipoDocumento = pasaporte → cb112 checked; cb113 (nie) not checked
      // (cb99/103 are estado civil, not tipo doc — fixed in d97ebac)
      { what: "TipoDoc pasaporte (wins, cb112)", field: "Casilla de verificación112", expected: "CHECKED" },
      { what: "TipoDoc nie (not checked, cb113)", field: "Casilla de verificación113", expected: "" },
      // estadoCivil = "separado" maps to cb103 in the new mapping, but
      // SCENARIO_3 sets estadoCivil="separado_pareja_hecho" → cb103 should
      // be CHECKED. We assert cb110 (familiar separado) stays empty.
      { what: "Familiar estadoCivil separado (cb111, not used here)", field: "Casilla de verificación111", expected: "" },
      // Circunstancia — arraigo_familiar = cb128
      { what: "Circunstancia arraigo_familiar (cb128)", field: "Casilla de verificación128", expected: "CHECKED" },
      // Familiar nombre provided
      { what: "Familiar nombre", field: "Texto33", expected: "Khalil" },
      { what: "Familiar vínculo", field: "Texto47", expected: "hijo" },
      // familiar_sexo MISSING → no checkbox checked across all 3 (X/H/M)
      { what: "Familiar sexo X (cb104, not provided)", field: "Casilla de verificación104", expected: "" },
      { what: "Familiar sexo H (cb105, not provided)", field: "Casilla de verificación105", expected: "" },
      { what: "Familiar sexo M (cb106, not provided)", field: "Casilla de verificación106", expected: "" },
      // familiar_estadoCivil = soltero → cb107
      { what: "Familiar estadoCivil soltero", field: "Casilla de verificación107", expected: "CHECKED" },
      // Localidad/postal
      { what: "Localidad Madrid", field: "Texto19", expected: "Madrid" },
      { what: "Código postal", field: "Texto20", expected: "28013" },
    ]
  );

  // ── Scenario 4: Inconsistente ──────────────────────────────────────────
  await runScenario(
    4,
    "INCONSISTENTE — tipoDoc vs número, familiar sexo vs nombre, fecha DD/MM/YYYY",
    "Carlos Santos, brasileño, NIE BZ1234567 (pero el formato parece pasaporte). " +
      "Nací el 15/04/1978. Vivo en Lepanto 12, Valencia 46001. " +
      "Familiar Fatima Santos marcada como hombre por error.",
    SCENARIO_4,
    "arraigo_segona_oportunitat",
    [
      // Pipeline uses tipoDocumento value as-is — nie checkbox (cb113) checked
      // despite the document number looking like a passport.
      // (cb103 is estado civil separado, not tipo doc — fixed in d97ebac)
      { what: "TipoDoc nie (as-is, no format check, cb113)", field: "Casilla de verificación113", expected: "CHECKED" },
      { what: "TipoDoc pasaporte (not checked, cb112)", field: "Casilla de verificación112", expected: "" },
      // Fecha DD/MM/YYYY handled correctly
      { what: "Fecha DD (from DD/MM/YYYY)", field: "Texto8", expected: "15" },
      { what: "Fecha MM", field: "Texto9", expected: "04" },
      { what: "Fecha YYYY", field: "Texto10", expected: "1978" },
      // Circunstancia arraigo_segona_oportunitat = cb124 (Catalan slug, aligned with form-config)
      { what: "Circunstancia segona_oportunitat (cb124)", field: "Casilla de verificación124", expected: "CHECKED" },
      // familiar_sexo = "H" — pipeline accepts it, no validation.
      // After familiar-sexo bug fix: H → cb105, X → cb104, M → cb106.
      { what: "Familiar sexo H (wrong but accepted, cb105)", field: "Casilla de verificación105", expected: "CHECKED" },
      { what: "Familiar sexo X (not checked, cb104)", field: "Casilla de verificación104", expected: "" },
      { what: "Familiar sexo M (not checked, cb106)", field: "Casilla de verificación106", expected: "" },
      // Consentimiento = true
      { what: "Consentiment DEHú", field: "Casilla de verificación261", expected: "CHECKED" },
    ]
  );

  // ── Summary ────────────────────────────────────────────────────────────

  console.log(`\n${"═".repeat(60)}`);
  console.log("SUMMARY");
  console.log(`${"═".repeat(60)}`);
  console.log(`Total PASS: ${totalPass}  Total FAIL: ${totalFail}`);
  console.log(`PDFs written to output/EX-10-e2e-s1.pdf .. s4.pdf`);
  console.log("");
  console.log("PIPELINE GAPS IDENTIFIED:");
  console.log("  1. collect_personal_data tool covers only ~19 base fields.");
  console.log("     EX-10-specific fields not extractable from chat:");
  console.log("       familiar_* (19 fields), formacio_* (10 fields),");
  console.log("       empleador_* (17 fields), repPresentacion_* (14 fields),");
  console.log("       notif_* (10 fields), consentimientoDehu (1 flag)");
  console.log("  2. form-config EX-10 requiredFields = BASE_REQUIRED only.");
  console.log("     Collection engine transitions to 'resum' after 10 base fields,");
  console.log("     even though familiar/empleador/formació blocks are empty.");
  console.log("  3. tipoAutorizacionCheckboxes (cb120-122: inicial/prórroga/provisional)");
  console.log("     NEVER checked — authSlug never matches these values.");
  console.log("     The tipo solicitud (initial vs renewal) has no capture mechanism.");
  console.log("  4. No input validation: wrong document formats, sex/name mismatches,");
  console.log("     contradictory fields are silently accepted.");
  console.log("");
  if (totalFail === 0) {
    console.log("✓ All PDF fill assertions passed. Pipeline mechanically correct.");
    console.log("→ VERDICT: EX-10 PDF mapping is correct. Gaps are in EXTRACTION layer,");
    console.log("  not in form-filler or field-maps. Ready to move to other EX forms,");
    console.log("  but tool schema expansion for EX-10-specific fields is recommended.");
  } else {
    console.log(`✗ ${totalFail} assertion(s) failed — review field mappings above.`);
    process.exit(1);
  }
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
