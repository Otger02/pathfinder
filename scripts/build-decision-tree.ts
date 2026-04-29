/**
 * scripts/build-decision-tree.ts
 *
 * Reads data/decision-tree.json (nested schema: id/tipus/pregunta/opcions[].node)
 * and enriches result nodes with a `slugs: string[]` field looked up from the
 * SLUGS map below.
 *
 * SLUGS is keyed by node id and lists the authorization slugs (from
 * lib/form-config.ts AUTH_TO_EX) that the result node should activate when
 * the user clicks "talk to the assistant". An empty list — or a missing
 * entry — leaves the node in info-only mode (no slot-filling).
 *
 * Run:  npx tsx scripts/build-decision-tree.ts
 */

import { readFileSync, writeFileSync } from "fs";
import { join } from "path";

// ── Inline types (matching the nested schema currently in main repo) ──────

interface I18nText {
  es?: string;
  en?: string;
  ar?: string;
  fr?: string;
  ca?: string;
}

interface DecisionNodeNested {
  id: string;
  tipus: "questio" | "resultat" | string;
  pregunta?: I18nText;
  missatge?: I18nText;
  opcions?: Array<{
    id: string;
    text: I18nText;
    sos?: boolean;
    node: DecisionNodeNested;
  }>;
  autoritzacions?: Array<{ slug: string; prioritat: number; nota: I18nText }>;
  recursos_urgents?: Array<{ nom: string; telefon: string; disponibilitat: string }>;
  nota_legal?: I18nText;
  slugs?: string[];
}

// ── Configuration ─────────────────────────────────────────────────────────

const RESULT_TYPES = new Set(["resultat", "result", "block", "sos1", "sos2", "sos3"]);

/**
 * Node-id → authorization slug(s). Populate based on legal validation.
 * Empty for nodes that are pure dead-ends.
 */
const SLUGS: Record<string, string[]> = {
  // (omplir manualment després de mapejar cada result-node a AUTH_TO_EX)
};

// ── Main ──────────────────────────────────────────────────────────────────

async function main() {
  console.log("Iniciant build-decision-tree...");

  const treePath = join(process.cwd(), "data", "decision-tree.json");
  console.log("Llegint:", treePath);

  const raw = readFileSync(treePath, "utf-8");
  const currentTree = JSON.parse(raw) as DecisionNodeNested | { branches: Record<string, DecisionNodeNested[]> };

  // Detect schema and walk all nodes
  let schema: "nested" | "flat";
  let allNodes: DecisionNodeNested[];

  if ("branches" in currentTree && currentTree.branches) {
    schema = "flat";
    const flat = currentTree as { branches: Record<string, DecisionNodeNested[]> };
    console.log("Schema: FLAT — branques trobades:", Object.keys(flat.branches));
    allNodes = Object.values(flat.branches).flat();
  } else {
    schema = "nested";
    const nested = currentTree as DecisionNodeNested;
    console.log("Schema: NESTED — root id:", nested.id);
    allNodes = [];
    const walk = (n: DecisionNodeNested) => {
      allNodes.push(n);
      if (n.opcions) for (const o of n.opcions) if (o.node) walk(o.node);
    };
    walk(nested);
  }

  console.log("Total nodes recorreguts:", allNodes.length);

  let resultLikeNodes = 0;
  let nodesEnriched = 0;
  let nodesUntouched = 0;
  const unknownIds: string[] = [];

  for (const node of allNodes) {
    if (!RESULT_TYPES.has(node.tipus)) continue;
    resultLikeNodes++;
    const slugs = SLUGS[node.id];
    if (slugs === undefined) {
      unknownIds.push(node.id);
      nodesUntouched++;
      continue;
    }
    node.slugs = slugs;
    nodesEnriched++;
  }

  console.log();
  console.log("── Resum ──");
  console.log("  Schema:                ", schema);
  console.log("  Total nodes:           ", allNodes.length);
  console.log("  Nodes result-like:     ", resultLikeNodes);
  console.log("  Nodes enriquits:       ", nodesEnriched);
  console.log("  Nodes sense entrada:   ", nodesUntouched);
  if (unknownIds.length > 0) {
    console.log("  ⚠ Ids sense slugs (omple SLUGS):");
    for (const id of unknownIds) console.log("     -", id);
  }

  writeFileSync(treePath, JSON.stringify(currentTree, null, 2) + "\n", "utf-8");
  console.log();
  console.log("Escrit:", treePath);
  console.log(
    `Mida: ${(JSON.stringify(currentTree).length / 1024).toFixed(1)} KB`
  );
}

main().catch((err) => {
  console.error("ERROR:", err);
  process.exit(1);
});
