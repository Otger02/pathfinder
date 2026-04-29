/**
 * scripts/translate-tree.ts
 *
 * Reads data/decision-tree.json (Catalan source) and produces
 * data/tree-translations.json with es/fr/ar translations of every node's
 * text, note, and option labels.
 *
 * Translations are produced by Claude Opus 4.5 in batches of 15 nodes,
 * with strict instructions to preserve legal terminology (arraigo, NIE,
 * EX-10, etc.) and exact deadlines/numbers.
 *
 * Run:  npx tsx --env-file=.env.local scripts/translate-tree.ts
 *       (Node 20.6+ required for --env-file)
 */

import Anthropic from "@anthropic-ai/sdk";
import { readFileSync, writeFileSync, existsSync } from "fs";
import { join } from "path";

// ── Load .env.local manually (tsx doesn't forward --env-file) ─────
{
  const envPath = join(process.cwd(), ".env.local");
  if (existsSync(envPath)) {
    const raw = readFileSync(envPath, "utf-8");
    for (const line of raw.split(/\r?\n/)) {
      const m = line.match(/^\s*([A-Z_][A-Z0-9_]*)\s*=\s*(.*?)\s*$/);
      if (!m) continue;
      const key = m[1];
      let val = m[2];
      if (
        (val.startsWith('"') && val.endsWith('"')) ||
        (val.startsWith("'") && val.endsWith("'"))
      ) {
        val = val.slice(1, -1);
      }
      if (!process.env[key]) process.env[key] = val;
    }
  }
}

// ── Types ─────────────────────────────────────────────────────────

interface DecisionNode {
  id: string;
  type: string;
  text: string;
  note: string;
  opts: Array<{ text: string; s: string; next: string | null }>;
}

interface DecisionTree {
  version: string;
  branches: Record<string, DecisionNode[]>;
}

interface NodeTranslation {
  id: string;
  text: string;
  note: string;
  opts: string[];
}

interface LangSpec {
  code: string;
  name: string;
}

// ── Anthropic client ──────────────────────────────────────────────

const apiKey = process.env.ANTHROPIC_API_KEY;
if (!apiKey) {
  console.error(
    "ERROR: ANTHROPIC_API_KEY no està disponible. Executa amb:\n" +
      "  npx tsx --env-file=.env.local scripts/translate-tree.ts"
  );
  process.exit(1);
}

const client = new Anthropic({ apiKey });

const SYSTEM = `Ets un traductor especialitzat en dret d'immigració espanyol.
Tradueixes textos legals del català a {LANG}.

Regles estrictes:
1. Mantén SEMPRE els termes legals en castellà: arraigo, NIE, TIE, EX-10, EX-25, OAR, CEAR, SJM, IPREM, SMI, RD, BOE.
2. Mantén els terminis i números exactes: "90 dies/días/jours/يوم", "2 anys/años/ans/سنوات", "20h/setmana".
3. Tona simple i directa — usuaris amb possible baixa alfabetització.
4. Per a l'àrab: usa MSA comprensible per a magribins i sahelians.
5. Retorna ÚNICAMENT el JSON demanat, sense markdown ni text addicional, sense fence \`\`\`.`;

// ── Translate one batch ───────────────────────────────────────────

async function translateBatch(
  nodes: DecisionNode[],
  langName: string
): Promise<NodeTranslation[]> {
  const payload = nodes.map((n) => ({
    id: n.id,
    text: n.text,
    note: n.note,
    opts: n.opts.map((o) => o.text),
  }));

  const response = await client.messages.create({
    model: "claude-opus-4-5",
    max_tokens: 8000,
    system: SYSTEM.replace("{LANG}", langName),
    messages: [
      {
        role: "user",
        content: `Tradueix al ${langName} els nodes següents. Retorna EXACTAMENT aquest format JSON (un array d'objectes):
[{"id":"...","text":"...","note":"...","opts":["..."]}]

Nodes a traduir:
${JSON.stringify(payload, null, 2)}`,
      },
    ],
  });

  const block = response.content[0];
  const text = block && block.type === "text" ? block.text : "";
  const clean = text
    .replace(/^```(?:json)?\n?/, "")
    .replace(/\n?```$/, "")
    .trim();

  try {
    return JSON.parse(clean) as NodeTranslation[];
  } catch (err) {
    console.error("Parse error. First 500 chars of response:");
    console.error(clean.slice(0, 500));
    throw err;
  }
}

// ── Main ──────────────────────────────────────────────────────────

async function main() {
  console.log("Iniciant translate-tree...");

  const treePath = join(process.cwd(), "data", "decision-tree.json");
  const outPath = join(process.cwd(), "data", "tree-translations.json");

  const tree = JSON.parse(readFileSync(treePath, "utf-8")) as DecisionTree;
  const allNodes = [
    ...tree.branches.b1,
    ...tree.branches.b2,
    ...tree.branches.b3,
    ...tree.branches.b4,
  ];

  console.log(`Total nodes a traduir: ${allNodes.length}`);

  const LANGS: LangSpec[] = [
    { code: "es", name: "castellà (espanyol estàndard d'Espanya)" },
    { code: "fr", name: "francès estàndard" },
    {
      code: "ar",
      name:
        "àrab estàndard modern (MSA), comprensible per a parlants del Magrib i el Sahel",
    },
  ];

  const translations: Record<string, Record<string, NodeTranslation>> = {};

  for (const lang of LANGS) {
    console.log(`\n── Traduint a ${lang.code} (${lang.name.split(",")[0]}) ──`);
    translations[lang.code] = {};

    // Batches of 15 nodes
    const BATCH_SIZE = 15;
    const batches: DecisionNode[][] = [];
    for (let i = 0; i < allNodes.length; i += BATCH_SIZE) {
      batches.push(allNodes.slice(i, i + BATCH_SIZE));
    }

    for (let i = 0; i < batches.length; i++) {
      const start = Date.now();
      console.log(
        `  Batch ${i + 1}/${batches.length} (${batches[i].length} nodes)...`
      );
      try {
        const results = await translateBatch(batches[i], lang.name);
        for (const r of results) {
          translations[lang.code][r.id] = r;
        }
        const elapsed = ((Date.now() - start) / 1000).toFixed(1);
        console.log(`    ✓ ${results.length} traduïts (${elapsed}s)`);
      } catch (err) {
        console.error(`    ✗ Batch ${i + 1} ha fallat:`, err);
        throw err;
      }
      // Small rate-limit pause
      await new Promise((r) => setTimeout(r, 500));
    }

    console.log(
      `  ✓ Total ${lang.code}: ${Object.keys(translations[lang.code]).length} nodes`
    );
  }

  // Write output
  writeFileSync(
    outPath,
    JSON.stringify(translations, null, 2) + "\n",
    "utf-8"
  );
  console.log(`\n✓ Guardat a ${outPath}`);

  // Validate completeness
  console.log("\n── Validació ──");
  let allOk = true;
  for (const lang of LANGS) {
    const missing = allNodes.filter((n) => !translations[lang.code][n.id]);
    if (missing.length > 0) {
      console.error(
        `  ✗ ${lang.code}: falten ${missing.length} nodes — ${missing
          .map((n) => n.id)
          .join(", ")}`
      );
      allOk = false;
    } else {
      console.log(`  ✓ ${lang.code}: ${allNodes.length}/${allNodes.length} nodes`);
    }
  }

  if (!allOk) {
    process.exit(1);
  }
}

main().catch((err) => {
  console.error("ERROR:", err);
  process.exit(1);
});
