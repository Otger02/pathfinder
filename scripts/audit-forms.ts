/**
 * scripts/audit-forms.ts
 *
 * Produces docs/forms-audit.md: a per-EX-form coverage report.
 *
 * For each of the 13 EX-XX forms:
 *   - Does the PDF template exist? Size?
 *   - Does the field map exist?
 *   - How many text fields are mapped vs. left null (date parts, manual)?
 *   - Checkbox group sizes (sexo, tipoDoc, estadoCivil, circunstancia, ...)?
 *   - Which authorization slugs point to it?
 *   - Is there a "fill" test in scripts/test-fill-all.ts?
 *   - Notes / known special handling (EX-10 apartat 6, slug aliases, etc.)
 *
 * Read-only. Does not touch any database. Run:
 *   npx tsx scripts/audit-forms.ts
 *
 * Output: docs/forms-audit.md (overwritten).
 */

import { readFileSync, writeFileSync, existsSync, statSync, mkdirSync } from "fs";
import { join, dirname } from "path";

// Import via the field-map registry to mirror what production uses.
// Note: `tsx` imports relative paths, but we use a tsconfig path alias too.
import { getFieldMap, type FieldMap } from "../lib/pdf/field-maps";
import {
  EX_FORMS,
  AUTH_TO_EX,
  AUTH_FIELD_RULES,
  type ExFormId,
} from "../lib/form-config";
import { EMPTY_PERSONAL_DATA } from "../lib/types/personal-data";

// ── Static reference data ─────────────────────────────────────────

const ALL_FORM_IDS: ExFormId[] = [
  "EX-00", "EX-01", "EX-02", "EX-03", "EX-04",
  "EX-06", "EX-07", "EX-09", "EX-10", "EX-11",
  "EX-19", "EX-24", "EX-25",
];

const PERSONAL_DATA_FIELDS = new Set(Object.keys(EMPTY_PERSONAL_DATA));

// Known operational quirks per form, surfaced in the report so a future
// auditor doesn't have to grep form-filler.ts for them.
const KNOWN_NOTES: Partial<Record<ExFormId, string[]>> = {
  "EX-02": [
    "Reagrupació familiar — `familiar_*` fields filled via per-form FAMILIAR_* checkbox maps.",
  ],
  "EX-10": [
    "Apartat 6 (formació) — `formacio_tipus` and `formacio_modalitat` are GRAPHICAL checkboxes on the PDF template (not AcroForm fields). Marked via `drawText('X', ...)` overlays at coordinates from `EX_10_FORMACIO_*_COORDS` in `lib/forms/ex-10.ts`.",
    "TIPO_SOLICITUD header checkbox (119) marked alongside its sub-option (120/121/122).",
    "TIPO_AUTORIZACION header (123) marked alongside the resolved circumstància (124-148).",
    "Slug aliasing: e.g. `victima_violencia_genere` → `vg_mujer_extranjera`.",
    "Default residencia_inicial as tipoSolicitud when none collected.",
    "Default pasaporte as tipoDocumento when none collected.",
    "Default consentimientoDehu checked unless explicitly false.",
    "`hijosEscolarizacion` stored as `\"si\"|\"no\"|\"no_aplica\"` (3 options), not boolean. Other 12 forms use boolean.",
  ],
  "EX-24": [
    "Familiar d'espanyol — `espanyol_*` fields filled via per-form ESPANYOL_* checkbox maps.",
  ],
  "EX-01": [
    "No lucrativa — supports `titular_*` block for non-applicant titular of resources.",
  ],
};

// Forms covered by scripts/test-fill-all.ts
const TESTED_FORMS = new Set<ExFormId>([
  "EX-00", "EX-01", "EX-02", "EX-03", "EX-04",
  "EX-06", "EX-07", "EX-09", "EX-10", "EX-11",
  "EX-19", "EX-24", "EX-25",
]);

// ── Per-form metrics ──────────────────────────────────────────────

interface FormStats {
  id: ExFormId;
  name: string;
  template_exists: boolean;
  template_size_kb: number | null;
  field_map_exists: boolean;
  text_fields_total: number;
  text_fields_mapped: number;
  text_fields_null: number; // null = handled separately (date parts, etc.)
  text_fields_unmapped_keys: string[]; // PersonalData keys NOT referenced
  checkbox_groups: Record<string, number>;
  auth_slugs_using: string[];
  auth_slugs_with_rules: string[];
  has_fill_test: boolean;
  notes: string[];
}

async function inspectForm(id: ExFormId): Promise<FormStats> {
  const info = EX_FORMS[id];
  const root = process.cwd();
  const templatePath = join(root, "public", "forms", `${id}.pdf`);
  const template_exists = existsSync(templatePath);
  const template_size_kb = template_exists
    ? Math.round(statSync(templatePath).size / 1024)
    : null;

  let fieldMap: FieldMap | null = null;
  try {
    fieldMap = await getFieldMap(id);
  } catch {
    fieldMap = null;
  }

  const text_fields_total = fieldMap ? Object.keys(fieldMap.textFields).length : 0;
  const text_fields_mapped = fieldMap
    ? Object.values(fieldMap.textFields).filter((v) => v !== null).length
    : 0;
  const text_fields_null = text_fields_total - text_fields_mapped;

  // PersonalData fields referenced by this form's text map
  const referenced = new Set<string>();
  if (fieldMap) {
    for (const value of Object.values(fieldMap.textFields)) {
      if (value) referenced.add(value);
    }
  }
  // The 30+ "legacy / camelCase" duplicates pollute "unmapped" noise — drop them.
  const text_fields_unmapped_keys = [...PERSONAL_DATA_FIELDS]
    .filter((k) => !referenced.has(k))
    .filter(
      (k) =>
        !k.startsWith("repPresentacion") || k.startsWith("repPresentacion_")
    )
    .filter(
      (k) =>
        // hide PersonalData fields that are clearly not relevant to this form:
        // titular_* only on EX-01, ciudadanoUE_* only on EX-19, etc.
        !(id !== "EX-01" && k.startsWith("titular_")) &&
        !(id !== "EX-19" && k.startsWith("ciudadanoUE_")) &&
        !(id !== "EX-24" && k.startsWith("espanyol_")) &&
        !(id !== "EX-10" && k.startsWith("formacio_")) &&
        !(id !== "EX-25" && k.startsWith("tutor_"))
    );

  const checkbox_groups: Record<string, number> = {};
  if (fieldMap) {
    checkbox_groups.sexo = Object.keys(fieldMap.sexoCheckboxes).length;
    checkbox_groups.tipoDoc = Object.keys(fieldMap.tipoDocCheckboxes).length;
    checkbox_groups.estadoCivil = Object.keys(fieldMap.estadoCivilCheckboxes).length;
    checkbox_groups.circunstancia = Object.keys(fieldMap.circunstanciaCheckboxes).length;
    checkbox_groups.tipoAutorizacion = Object.keys(fieldMap.tipoAutorizacionCheckboxes).length;
    checkbox_groups.hijosEscolarizacion = Object.keys(fieldMap.hijosEscolarizacionCheckboxes).length;
    if (fieldMap.familiarSexoCheckboxes) {
      checkbox_groups.familiarSexo = Object.keys(fieldMap.familiarSexoCheckboxes).length;
    }
    if (fieldMap.familiarEstadoCivilCheckboxes) {
      checkbox_groups.familiarEstadoCivil = Object.keys(fieldMap.familiarEstadoCivilCheckboxes).length;
    }
    if (fieldMap.titularSexoCheckboxes) {
      checkbox_groups.titularSexo = Object.keys(fieldMap.titularSexoCheckboxes).length;
    }
    if (fieldMap.titularEstadoCivilCheckboxes) {
      checkbox_groups.titularEstadoCivil = Object.keys(fieldMap.titularEstadoCivilCheckboxes).length;
    }
    if (fieldMap.espanyolSexoCheckboxes) {
      checkbox_groups.espanyolSexo = Object.keys(fieldMap.espanyolSexoCheckboxes).length;
    }
    if (fieldMap.espanyolEstadoCivilCheckboxes) {
      checkbox_groups.espanyolEstadoCivil = Object.keys(fieldMap.espanyolEstadoCivilCheckboxes).length;
    }
    if (fieldMap.formacioTipusCheckboxes) {
      checkbox_groups.formacioTipus = Object.keys(fieldMap.formacioTipusCheckboxes).length;
    }
    if (fieldMap.formacioModalitatCheckboxes) {
      checkbox_groups.formacioModalitat = Object.keys(fieldMap.formacioModalitatCheckboxes).length;
    }
  }

  const auth_slugs_using = Object.entries(AUTH_TO_EX)
    .filter(([, ids]) => ids.includes(id))
    .map(([slug]) => slug);
  const auth_slugs_with_rules = auth_slugs_using.filter((s) => !!AUTH_FIELD_RULES[s]);

  return {
    id,
    name: info?.name ?? "(unknown)",
    template_exists,
    template_size_kb,
    field_map_exists: fieldMap !== null,
    text_fields_total,
    text_fields_mapped,
    text_fields_null,
    text_fields_unmapped_keys,
    checkbox_groups,
    auth_slugs_using,
    auth_slugs_with_rules,
    has_fill_test: TESTED_FORMS.has(id),
    notes: KNOWN_NOTES[id] ?? [],
  };
}

// ── Markdown rendering ────────────────────────────────────────────

function ratingFor(s: FormStats): string {
  // A quick traffic-light rating used in the summary table.
  if (!s.template_exists || !s.field_map_exists) return "🔴 broken";
  if (s.text_fields_total === 0) return "🔴 empty map";
  if (s.auth_slugs_using.length === 0) return "⚪ orphan";

  const slugsWithRules = s.auth_slugs_with_rules.length;
  const slugsTotal = s.auth_slugs_using.length;
  const fillCovered =
    s.text_fields_total > 0
      ? s.text_fields_mapped / s.text_fields_total
      : 0;

  if (slugsWithRules === 0 && slugsTotal > 0) return "🟠 no rules";
  if (fillCovered < 0.5) return "🟠 low fill";
  if (!s.has_fill_test) return "🟡 untested";
  return "🟢 ready";
}

function renderSummaryTable(stats: FormStats[]): string {
  const lines: string[] = [];
  lines.push(
    "| Form | Status | PDF | Field map | Text fields (mapped/total) | Slugs (rules/total) | Tested |"
  );
  lines.push(
    "|------|--------|-----|-----------|------------------------------|----------------------|--------|"
  );
  for (const s of stats) {
    const pdf = s.template_exists ? `✓ (${s.template_size_kb} KB)` : "✗";
    const map = s.field_map_exists ? "✓" : "✗";
    const fields = `${s.text_fields_mapped}/${s.text_fields_total}`;
    const slugs = `${s.auth_slugs_with_rules.length}/${s.auth_slugs_using.length}`;
    const tested = s.has_fill_test ? "✓" : "—";
    lines.push(
      `| **${s.id}** | ${ratingFor(s)} | ${pdf} | ${map} | ${fields} | ${slugs} | ${tested} |`
    );
  }
  return lines.join("\n");
}

function renderFormSection(s: FormStats): string {
  const lines: string[] = [];
  lines.push(`### ${s.id} — ${ratingFor(s)}`);
  lines.push(`*${s.name}*`);
  lines.push("");

  lines.push(`- **Template**: ${s.template_exists ? `✓ \`public/forms/${s.id}.pdf\` (${s.template_size_kb} KB)` : "✗ MISSING"}`);
  lines.push(`- **Field map**: ${s.field_map_exists ? `✓ \`lib/pdf/field-maps/${s.id.toLowerCase()}.ts\`` : "✗ MISSING"}`);
  lines.push(
    `- **Text fields**: ${s.text_fields_mapped} mapped + ${s.text_fields_null} handled-separately = **${s.text_fields_total} total**`
  );

  if (Object.keys(s.checkbox_groups).length > 0) {
    const cb = Object.entries(s.checkbox_groups)
      .map(([k, n]) => `${k} (${n})`)
      .join(", ");
    lines.push(`- **Checkbox groups**: ${cb}`);
  } else {
    lines.push(`- **Checkbox groups**: —`);
  }

  lines.push(
    `- **Authorization slugs using it** (${s.auth_slugs_using.length}): ${
      s.auth_slugs_using.length > 0 ? s.auth_slugs_using.map((s) => `\`${s}\``).join(", ") : "_none — orphan form_"
    }`
  );

  if (s.auth_slugs_using.length > 0) {
    lines.push(
      `- **With per-slug field rules**: ${s.auth_slugs_with_rules.length}/${s.auth_slugs_using.length}`
    );
    if (s.auth_slugs_with_rules.length < s.auth_slugs_using.length) {
      const missing = s.auth_slugs_using.filter(
        (sl) => !s.auth_slugs_with_rules.includes(sl)
      );
      lines.push(
        `  - _Missing rules in_ \`AUTH_FIELD_RULES\`: ${missing.map((s) => `\`${s}\``).join(", ")}`
      );
    }
  }
  lines.push(`- **Fill test**: ${s.has_fill_test ? "✓ in `scripts/test-fill-all.ts`" : "✗ absent"}`);

  if (s.notes.length > 0) {
    lines.push("");
    lines.push("**Notes / special handling**:");
    for (const note of s.notes) {
      lines.push(`- ${note}`);
    }
  }

  if (s.text_fields_unmapped_keys.length > 0 && s.text_fields_unmapped_keys.length < 50) {
    lines.push("");
    lines.push("<details><summary>PersonalData keys not referenced by this form's textFields map</summary>");
    lines.push("");
    lines.push(
      s.text_fields_unmapped_keys.map((k) => `\`${k}\``).join(", ")
    );
    lines.push("");
    lines.push("</details>");
  }

  return lines.join("\n");
}

function renderReport(stats: FormStats[]): string {
  const lines: string[] = [];
  lines.push(`# Forms coverage audit`);
  lines.push("");
  lines.push(`Auto-generated by \`scripts/audit-forms.ts\`. Do not edit by hand — re-run instead.`);
  lines.push("");
  lines.push(`- **Generated**: ${new Date().toISOString()}`);
  lines.push(`- **Forms inspected**: ${stats.length}`);
  lines.push(
    `- **Forms with template + field map**: ${stats.filter((s) => s.template_exists && s.field_map_exists).length} / ${stats.length}`
  );
  lines.push(
    `- **Forms with fill test**: ${stats.filter((s) => s.has_fill_test).length} / ${stats.length}`
  );
  lines.push(
    `- **Forms with at least one auth-slug using them**: ${stats.filter((s) => s.auth_slugs_using.length > 0).length} / ${stats.length}`
  );

  const totalSlugs = new Set<string>();
  const slugsWithRules = new Set<string>();
  for (const s of stats) {
    for (const sl of s.auth_slugs_using) totalSlugs.add(sl);
    for (const sl of s.auth_slugs_with_rules) slugsWithRules.add(sl);
  }
  lines.push(
    `- **Auth slugs covered**: ${totalSlugs.size} (with per-slug rules: ${slugsWithRules.size})`
  );
  lines.push("");

  lines.push(`## Status legend`);
  lines.push("");
  lines.push("- 🟢 **ready** — template + map + slugs + per-slug rules + fill test");
  lines.push("- 🟡 **untested** — everything in place but no fill test in `scripts/test-fill-all.ts`");
  lines.push("- 🟠 **no rules** — has slugs but no entries in `AUTH_FIELD_RULES` (so the chat doesn't know what fields are required for those slugs)");
  lines.push("- 🟠 **low fill** — under 50% of text fields are wired to a `PersonalData` key");
  lines.push("- ⚪ **orphan** — template + map present but no auth slug points to it");
  lines.push("- 🔴 **broken** — template or map missing");
  lines.push("- 🔴 **empty map** — field map loaded but contains zero text fields");
  lines.push("");

  lines.push(`## Summary`);
  lines.push("");
  lines.push(renderSummaryTable(stats));
  lines.push("");

  // Slugs declared in AUTH_TO_EX but pointing to no form
  const slugsToNoForm = Object.entries(AUTH_TO_EX)
    .filter(([, ids]) => ids.length === 0)
    .map(([s]) => s);
  if (slugsToNoForm.length > 0) {
    lines.push(`## Slugs with no EX form assigned`);
    lines.push("");
    lines.push(`These authorization slugs exist in the decision tree but \`AUTH_TO_EX\` maps them to **\`[]\`** — no PDF is generated for these cases:`);
    lines.push("");
    for (const s of slugsToNoForm) lines.push(`- \`${s}\``);
    lines.push("");
  }

  // Slugs with rules but no form (suspicious — rules unused)
  const slugsWithRulesNoForm = Object.keys(AUTH_FIELD_RULES).filter(
    (s) => !AUTH_TO_EX[s] || AUTH_TO_EX[s].length === 0
  );
  if (slugsWithRulesNoForm.length > 0) {
    lines.push(`## Slugs with field rules but no EX form`);
    lines.push("");
    lines.push("These slugs have entries in `AUTH_FIELD_RULES` but `AUTH_TO_EX` maps them to no form. Collection rules are defined but no PDF will be produced — verify intentional:");
    lines.push("");
    for (const s of slugsWithRulesNoForm) lines.push(`- \`${s}\``);
    lines.push("");
  }

  lines.push(`## Per-form detail`);
  lines.push("");
  for (const s of stats) {
    lines.push(renderFormSection(s));
    lines.push("");
  }

  lines.push(`## Recommendations`);
  lines.push("");
  const recommendations: string[] = [];

  const orphans = stats.filter((s) => s.auth_slugs_using.length === 0);
  if (orphans.length > 0) {
    recommendations.push(
      `Orphan forms (template + map but no slug uses them): ${orphans
        .map((s) => `**${s.id}**`)
        .join(", ")}. Either wire them into \`AUTH_TO_EX\` or remove their assets.`
    );
  }

  const noRules = stats.filter(
    (s) =>
      s.auth_slugs_using.length > 0 &&
      s.auth_slugs_with_rules.length < s.auth_slugs_using.length
  );
  if (noRules.length > 0) {
    recommendations.push(
      `Add per-slug field rules to \`AUTH_FIELD_RULES\` for: ${noRules
        .map(
          (s) =>
            `**${s.id}** (${
              s.auth_slugs_using.length - s.auth_slugs_with_rules.length
            } slugs missing)`
        )
        .join(", ")}.`
    );
  }

  const untested = stats.filter(
    (s) => s.template_exists && s.field_map_exists && !s.has_fill_test
  );
  if (untested.length > 0) {
    recommendations.push(
      `Add fill tests in \`scripts/test-fill-all.ts\` for: ${untested
        .map((s) => `**${s.id}**`)
        .join(", ")}.`
    );
  }

  const lowFill = stats.filter(
    (s) =>
      s.text_fields_total > 0 &&
      s.text_fields_mapped / s.text_fields_total < 0.5
  );
  if (lowFill.length > 0) {
    recommendations.push(
      `Investigate low text-field fill ratio: ${lowFill
        .map(
          (s) =>
            `**${s.id}** (${Math.round(
              (s.text_fields_mapped / s.text_fields_total) * 100
            )}%)`
        )
        .join(", ")}.`
    );
  }

  if (recommendations.length === 0) {
    recommendations.push("None — every form is in good shape.");
  }

  for (const r of recommendations) lines.push(`- ${r}`);
  lines.push("");

  return lines.join("\n");
}

// ── Main ─────────────────────────────────────────────────────────

async function main() {
  console.log(`Pathfinder forms audit`);
  console.log(`Inspecting ${ALL_FORM_IDS.length} EX forms...\n`);

  const stats: FormStats[] = [];
  for (const id of ALL_FORM_IDS) {
    const s = await inspectForm(id);
    stats.push(s);
    console.log(
      `  ${id.padEnd(6)} ${ratingFor(s).padEnd(14)} fields=${s.text_fields_mapped}/${s.text_fields_total}  slugs=${s.auth_slugs_using.length}`
    );
  }

  // Read just to silence the "unused" lint without importing it
  void readFileSync;

  const report = renderReport(stats);
  const outPath = join(process.cwd(), "docs", "forms-audit.md");
  mkdirSync(dirname(outPath), { recursive: true });
  writeFileSync(outPath, report, "utf-8");

  console.log(`\n✓ Report written to ${outPath}`);
}

main().catch((err) => {
  console.error("ERROR:", err);
  process.exit(1);
});
