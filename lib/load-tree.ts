import type { DecisionTree } from "@/lib/types/decision-tree";

/**
 * Loads the decision tree from the app bundle instead of GET /api/tree, so the
 * tree works fully offline on flaky connections.
 *
 * Mirrors loadTranslations() in tree-i18n.ts: the dynamic import becomes a
 * content-hashed JS chunk that the service worker caches (stale-while-revalidate
 * over /_next/static). After the first online visit to /chat the tree is served
 * with zero network. /api/tree stays as a server endpoint for the test scripts.
 */
let treeCache: DecisionTree | null = null;

export async function loadTree(): Promise<DecisionTree> {
  if (!treeCache) {
    const data = await import("../data/decision-tree.json");
    treeCache = (data.default ?? data) as unknown as DecisionTree;
  }
  return treeCache;
}
