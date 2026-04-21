/**
 * Shared chunking utilities used by chunk-legislation, chunk-authorizations,
 * and chunk-guides scripts.
 */

export const CHUNK_SIZE = 2000; // chars ≈ 500 tokens
export const OVERLAP = 200; // chars ≈ 50 tokens

export function cleanText(raw: string): string {
  return raw
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .replace(/\t/g, " ")
    .replace(/ {2,}/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

/**
 * Split text into chunks of ≈CHUNK_SIZE chars with ≈OVERLAP overlap.
 * Prefer splitting at paragraph boundaries (\n\n), then line (\n), then word.
 */
export function chunkText(
  text: string,
  chunkSize = CHUNK_SIZE,
  overlap = OVERLAP
): string[] {
  if (text.length <= chunkSize) return [text];

  const chunks: string[] = [];
  let pos = 0;

  while (pos < text.length) {
    let end = pos + chunkSize;

    if (end >= text.length) {
      chunks.push(text.slice(pos).trim());
      break;
    }

    const searchFrom = pos + Math.floor(chunkSize * 0.6);
    let cut = text.lastIndexOf("\n\n", end);
    if (cut > searchFrom) {
      end = cut;
    } else {
      cut = text.lastIndexOf("\n", end);
      if (cut > searchFrom) {
        end = cut;
      } else {
        cut = text.lastIndexOf(" ", end);
        if (cut > searchFrom) {
          end = cut;
        }
      }
    }

    chunks.push(text.slice(pos, end).trim());
    pos = end - overlap;
    if (pos < 0) pos = 0;
    while (pos < text.length && /\s/.test(text[pos])) pos++;
  }

  return chunks.filter((c) => c.length > 0);
}

/** Extract all unique law references from text. */
export function extractLleiRef(text: string): string {
  const refs = new Set<string>();
  for (const m of text.matchAll(
    /(?:Ley\s+Org[aá]nica|LO|Ley)\s+\d+\/\d{4}/gi
  ))
    refs.add(m[0].replace(/\s+/g, " "));
  for (const m of text.matchAll(
    /(?:Real\s+Decreto|RD|RDL|RDLeg)[\s-]*\d+\/\d{4}/gi
  ))
    refs.add(m[0].replace(/\s+/g, " "));
  for (const m of text.matchAll(
    /Orden\s+[A-Z]{2,5}[\s/-]+\d+[\s/-]+\d{4}/gi
  ))
    refs.add(m[0].replace(/\s+/g, " "));
  for (const m of text.matchAll(
    /Directiva\s*(?:\((?:UE|CE)\)\s*)?\d{2,4}[\/-]\d+(?:[\/-][A-Z]{2,3})?/gi
  ))
    refs.add(m[0].replace(/\s+/g, " "));
  for (const m of text.matchAll(/BOE-A-\d{4}-\d+/g)) refs.add(m[0]);
  for (const m of text.matchAll(
    /(?:Art[ií]culo|Art\.)\s*\d+(?:\.\d+)?(?:\s*bis)?/gi
  ))
    refs.add(m[0].replace(/\s+/g, " "));
  return [...refs].join("; ");
}

export type SituacioLegal =
  | "sense_autoritzacio"
  | "amb_autoritzacio"
  | "ue"
  | "asil"
  | "general";

export type Urgencia = "immediata" | "normal" | "planificacio";

/** Scan first ~4000 chars for urgency signals. */
export function inferUrgencia(content: string): Urgencia {
  const head = content.slice(0, 4000).toLowerCase();
  if (
    /\bexpulsi[oó]n\b|\bdetenci[oó]n\b|\binternamiento\b|\bcautelar\b|\burgent/i.test(
      head
    )
  ) {
    return "immediata";
  }
  if (
    /\bplazo.*(?:5|cinco)\s*años\b|\blarga\s*duraci[oó]n\b|\bplanificaci[oó]n\b/i.test(
      head
    )
  ) {
    return "planificacio";
  }
  return "normal";
}
