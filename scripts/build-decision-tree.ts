import { writeFileSync } from "fs"
import { join } from "path"
import type { DecisionNode, DecisionTree } from "@/lib/types/decision-tree"

// Slugs per node resultat — basats en AUTH_TO_EX de lib/form-config.ts
const SLUGS: Record<string, string[]> = {
  // B1 — sense papers
  "b1-r-menor":             ["menor_no_acompanyat"],
  "b1-r-menor-excepcional": ["menor_excepcional_majoria_edat"],
  "b1-r-reg":               [],
  "b1-r-laboral":           ["arraigo_sociolaboral"],
  "b1-r-formatiu":          ["arraigo_socioformatiu"],
  "b1-r-social":            ["arraigo_social"],
  "b1-r-familiar":          ["arraigo_social"],
  "b1-r-familiar-espanyol": ["residencia_familiar_espanyol"],
  "b1-r-familiar-ue":       ["arraigo_familiar"],
  "b1-r-sense":             [],
  "b1-r-aviat":             [],
  "b1-r-gairebe":           ["arraigo_social"],
  "b1-block-a":             [],
  "b1-block-a-wait":        [],
  "b1-block-b":             [],
  "b1-block-c":             [],
  "b1-block-d":             [],
  "b1-sos1-doc":            [],
  "b1-p8":                  [],
  "b1-sos2":                [],
  // B2 — amb autorització
  "b2-r-ok":                ["treball_compte_alie_renovacio", "treball_compte_propi_renovacio", "renovacio_residencia_no_lucrativa"],
  "b2-r-urgent":            ["treball_compte_alie_renovacio", "treball_compte_propi_renovacio"],
  "b2-r-critic":            ["treball_compte_alie_renovacio"],
  "b2-r-ld":                ["residencia_llarga_duracio_nacional"],
  "b2-r-caducada-recent":   ["treball_compte_alie_renovacio"],
  "b2-r-caducada-mitja":    ["arraigo_social", "arraigo_sociolaboral"],
  "b2-r-caducada-llarga":   ["arraigo_social", "arraigo_sociolaboral"],
  "b2-r-2a-op":             ["arraigo_segona_oportunitat"],
  "b2-r-antiga":            ["arraigo_social"],
  "b2-r-identificar":       [],
  // B3 — ciutadà UE
  "b3-r-curta":             [],
  "b3-r-registre":          ["certificat_registre_ciutada_ue"],
  "b3-r-permanent":         ["certificat_registre_ciutada_ue"],
  "b3-r-treball":           ["certificat_registre_ciutada_ue"],
  "b3-r-familia":           ["targeta_familiar_ciutada_ue"],
  "b3-r-estudis":           ["certificat_registre_ciutada_ue"],
  "b3-r-serveis":           ["certificat_registre_ciutada_ue"],
  "b3-r-familiar-ue":       ["targeta_familiar_ciutada_ue"],
  "b3-r-familiar-altres":   [],
  "b3-r-familiar-espanyol": ["residencia_familiar_espanyol"],
  // B4 — asil
  "b4-r-frontera":          [],
  "b4-r-cie":               [],
  "b4-r-com-sol":           [],
  "b4-r-fora-termini":      [],
  "b4-r-espera-admissio":   [],
  "b4-r-espera-resolucio":  [],
  "b4-r-tarjeta-roja":      [],
  "b4-r-reg-ext":           [],
  "b4-r-reexamen":          [],
  "b4-r-recurs":            [],
  "b4-r-denegat-antic":     ["arraigo_social"],
  "b4-r-resolucio-positiva":[],
}

const RESULT_TYPES = new Set(["result", "block", "sos1", "sos2", "sos3"])

function addSlugs(nodes: DecisionNode[]): DecisionNode[] {
  return nodes.map(node => {
    if (RESULT_TYPES.has(node.type)) {
      return { ...node, slugs: SLUGS[node.id] ?? [] }
    }
    return node
  })
}

async function main() {
  const { default: currentTree } = await import("../data/decision-tree.json", {
    assert: { type: "json" }
  })

  const tree: DecisionTree = {
    version: "2.0.0",
    lastUpdated: new Date().toISOString().split("T")[0],
    legalBasis: (currentTree as any).legalBasis ?? [],
    branches: {
      b1: addSlugs((currentTree as any).branches.b1),
      b2: addSlugs((currentTree as any).branches.b2),
      b3: addSlugs((currentTree as any).branches.b3),
      b4: addSlugs((currentTree as any).branches.b4),
    }
  }

  // Validació
  const allIds = new Set(Object.values(tree.branches).flat().map(n => n.id))
  const broken = Object.values(tree.branches).flat().flatMap(n =>
    n.opts.filter(o => o.next && !allIds.has(o.next)).map(o => `${n.id} → ${o.next}`)
  )
  const missingSlug = Object.values(tree.branches).flat()
    .filter(n => RESULT_TYPES.has(n.type) && !("slugs" in n))
    .map(n => n.id)

  console.log(`Nodes: ${allIds.size}`)
  console.log(`Broken refs: ${broken.length}`)
  console.log(`Missing slugs: ${missingSlug.length}`)
  if (broken.length) broken.forEach(b => console.error("  BROKEN:", b))
  if (missingSlug.length) missingSlug.forEach(m => console.error("  NO SLUG:", m))

  if (broken.length === 0 && missingSlug.length === 0) {
    const outPath = join(process.cwd(), "data", "decision-tree.json")
    writeFileSync(outPath, JSON.stringify(tree, null, 2), "utf-8")
    console.log(`✓ Escrit a ${outPath}`)
  } else {
    process.exit(1)
  }
}

main()