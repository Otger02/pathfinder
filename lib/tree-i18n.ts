/**
 * Decision-tree i18n helper.
 *
 * The tree's source of truth is Catalan (data/decision-tree.json).
 * data/tree-translations.json holds machine-translated strings for the
 * 76 real nodes in es/fr/ar.
 *
 * The synthetic ROOT_NODE is NOT in the translations file (it doesn't
 * exist in decision-tree.json either). Its labels are hardcoded per
 * language below.
 */

import type { DecisionNode } from "@/lib/types/decision-tree";

// ── Translation cache (lazy-loaded JSON) ──────────────────────────

interface NodeTranslation {
  id: string;
  text: string;
  note: string;
  opts: string[];
}

let translations: Record<
  string,
  Record<string, NodeTranslation>
> | null = null;

export async function loadTranslations(): Promise<
  Record<string, Record<string, NodeTranslation>>
> {
  if (!translations) {
    const data = await import("../data/tree-translations.json");
    translations =
      (data.default ?? data) as Record<string, Record<string, NodeTranslation>>;
  }
  return translations;
}

// ── Translate a real node (b1-*, b2-*, b3-*, b4-*) ────────────────

export function translateNode(node: DecisionNode, lang: string): DecisionNode {
  // Catalan is the source — no translation needed
  if (lang === "ca" || !lang) return node;

  const t = translations?.[lang]?.[node.id];
  if (!t) return node; // fallback to Catalan if lookup fails

  return {
    ...node,
    text: t.text,
    note: t.note,
    opts: node.opts.map((opt, i) => ({
      ...opt,
      text: t.opts[i] ?? opt.text,
    })),
  };
}

// ── Synthetic root node, per language ─────────────────────────────

const ROOT_OPTS_NEXT: Array<string> = ["b1-p0", "b2-p0", "b3-p0", "b4-p0"];

const ROOT_NODES: Record<string, DecisionNode> = {
  ca: {
    id: "root",
    type: "q",
    text: "Quina és la teva situació?",
    note: "",
    opts: [
      { text: "No tinc papers", s: "", next: "b1-p0" },
      { text: "Tinc autorització", s: "", next: "b2-p0" },
      { text: "Sóc ciutadà/ana UE", s: "", next: "b3-p0" },
      { text: "Vull demanar asil", s: "", next: "b4-p0" },
    ],
  },
  es: {
    id: "root",
    type: "q",
    text: "¿Cuál es tu situación?",
    note: "",
    opts: [
      { text: "No tengo papeles", s: "", next: "b1-p0" },
      { text: "Tengo autorización", s: "", next: "b2-p0" },
      { text: "Soy ciudadano/a UE", s: "", next: "b3-p0" },
      { text: "Quiero solicitar asilo", s: "", next: "b4-p0" },
    ],
  },
  fr: {
    id: "root",
    type: "q",
    text: "Quelle est ta situation ?",
    note: "",
    opts: [
      { text: "Je n'ai pas de papiers", s: "", next: "b1-p0" },
      { text: "J'ai une autorisation", s: "", next: "b2-p0" },
      { text: "Je suis citoyen/ne de l'UE", s: "", next: "b3-p0" },
      { text: "Je veux demander l'asile", s: "", next: "b4-p0" },
    ],
  },
  ar: {
    id: "root",
    type: "q",
    text: "ما هو وضعك؟",
    note: "",
    opts: [
      { text: "ليس لدي أوراق", s: "", next: "b1-p0" },
      { text: "لدي تصريح", s: "", next: "b2-p0" },
      { text: "أنا مواطن/ة من الاتحاد الأوروبي", s: "", next: "b3-p0" },
      { text: "أريد طلب اللجوء", s: "", next: "b4-p0" },
    ],
  },
  en: {
    id: "root",
    type: "q",
    text: "What is your situation?",
    note: "",
    opts: [
      { text: "I don't have papers", s: "", next: "b1-p0" },
      { text: "I have authorization", s: "", next: "b2-p0" },
      { text: "I'm an EU citizen", s: "", next: "b3-p0" },
      { text: "I want to request asylum", s: "", next: "b4-p0" },
    ],
  },
};

export function getRootNode(lang: string): DecisionNode {
  return ROOT_NODES[lang] ?? ROOT_NODES.ca;
}

export const ROOT_NODE_ID = "root";

// Re-export helpers for callers that need direct access to the
// synthetic root opts targets (e.g. inferSituacioFromNextId checks).
export { ROOT_OPTS_NEXT };
