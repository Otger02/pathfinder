/**
 * Brute-force approach: reads raw PDF bytes, looks for Spanish text
 * near the PDF keyword operators (Tj, TJ, Tm) in decompressed streams.
 */
import { PDFDocument, PDFStream, PDFRawStream, PDFArray } from "pdf-lib";
import { readFileSync } from "fs";
import * as zlib from "zlib";

function tryDecompress(bytes: Uint8Array): string {
  // Try inflate (deflate/zlib/gzip)
  try {
    const buf = zlib.inflateSync(Buffer.from(bytes));
    return new TextDecoder("latin1").decode(buf);
  } catch {}
  try {
    const buf = zlib.gunzipSync(Buffer.from(bytes));
    return new TextDecoder("latin1").decode(buf);
  } catch {}
  // Return raw as latin1
  return new TextDecoder("latin1").decode(bytes);
}

// Extract all text from a content stream string, ordered by Y position
function extractText(content: string): Array<{ y: number; x: number; text: string }> {
  const results: Array<{ y: number; x: number; text: string }> = [];
  let y = 0, x = 0;

  // Simple regex-based extraction
  // Match: number number number number number number Tm
  const tmRe = /(-?\d+(?:\.\d+)?)\s+(-?\d+(?:\.\d+)?)\s+(-?\d+(?:\.\d+)?)\s+(-?\d+(?:\.\d+)?)\s+(-?\d+(?:\.\d+)?)\s+(-?\d+(?:\.\d+)?)\s+Tm/g;
  const tdRe = /(-?\d+(?:\.\d+)?)\s+(-?\d+(?:\.\d+)?)\s+T[dD]/g;
  const tjRe = /\(([^)\\]*(?:\\.[^)\\]*)*)\)\s*Tj/g;
  const tjArrayRe = /\[([^\]]*)\]\s*TJ/g;

  // Process Tm to capture positions with text
  // We'll do a single-pass scan
  const lines = content.split("\n");
  let inBT = false;

  for (const line of lines) {
    const trimmed = line.trim();

    if (trimmed === "BT") { inBT = true; continue; }
    if (trimmed === "ET") { inBT = false; continue; }
    if (!inBT && !trimmed.includes("Tj") && !trimmed.includes("Tm")) continue;

    // Tm
    const tmMatch = /(-?\d+(?:\.\d+)?)\s+(-?\d+(?:\.\d+)?)\s+(-?\d+(?:\.\d+)?)\s+(-?\d+(?:\.\d+)?)\s+(-?\d+(?:\.\d+)?)\s+(-?\d+(?:\.\d+)?)\s+Tm/.exec(trimmed);
    if (tmMatch) {
      x = parseFloat(tmMatch[5]);
      y = parseFloat(tmMatch[6]);
    }

    // Td/TD
    const tdMatch = /(-?\d+(?:\.\d+)?)\s+(-?\d+(?:\.\d+)?)\s+T[dD]/.exec(trimmed);
    if (tdMatch) {
      x += parseFloat(tdMatch[1]);
      y += parseFloat(tdMatch[2]);
    }

    // Tj literal
    const tjMatch = /\(([^)\\]*(?:\\.[^)\\]*)*)\)\s*Tj/.exec(trimmed);
    if (tjMatch) {
      const text = tjMatch[1].replace(/\\([nrtbf\\()])/g, (_, c) =>
        ({ n: "\n", r: "\r", t: "\t", b: "\b", f: "\f", "\\": "\\", "(": "(", ")": ")" }[c] ?? c)
      );
      if (text.trim()) results.push({ y, x, text });
    }

    // TJ array
    const tjArr = /\[([^\]]*)\]\s*TJ/.exec(trimmed);
    if (tjArr) {
      const inner = tjArr[1];
      const parts = inner.match(/\(([^)\\]*(?:\\.[^)\\]*)*)\)/g) || [];
      const text = parts.map(p => p.slice(1, -1)).join("");
      if (text.trim()) results.push({ y, x, text });
    }
  }

  // Also do multiline scan with regex
  let match;
  tjRe.lastIndex = 0;
  while ((match = tjRe.exec(content)) !== null) {
    const text = match[1];
    if (text.trim()) {
      // Find the nearest preceding Tm
      const before = content.slice(Math.max(0, match.index - 200), match.index);
      const nearTm = /(-?\d+(?:\.\d+)?)\s+(-?\d+(?:\.\d+)?)\s+(-?\d+(?:\.\d+)?)\s+(-?\d+(?:\.\d+)?)\s+(-?\d+(?:\.\d+)?)\s+(-?\d+(?:\.\d+)?)\s+Tm/.exec(before);
      if (nearTm) {
        results.push({ y: parseFloat(nearTm[6]), x: parseFloat(nearTm[5]), text });
      }
    }
  }

  return results.sort((a, b) => b.y - a.y);
}

async function main() {
  const bytes = readFileSync("public/forms/EX-10.pdf");
  const pdf = await PDFDocument.load(bytes);
  const pages = pdf.getPages();

  for (let pi = 0; pi < pages.length; pi++) {
    const page = pages[pi];
    const streamBytes: Uint8Array[] = [];

    try {
      const contentsRef = (page.node as any).get(
        page.node.context.obj("Contents")
      );
      if (!contentsRef) continue;
      const resolved = page.node.context.lookup(contentsRef);
      if (!resolved) continue;

      if ((resolved as any).contents !== undefined) {
        streamBytes.push((resolved as any).contents);
      } else if ((resolved as any).asArray) {
        for (const ref of (resolved as any).asArray()) {
          const s = page.node.context.lookup(ref);
          if (s && (s as any).contents) streamBytes.push((s as any).contents);
        }
      }
    } catch (e) {
      continue;
    }

    for (const sb of streamBytes) {
      const decompressed = tryDecompress(sb);
      const texts = extractText(decompressed);

      // Filter to target Y ranges
      const rangeA = texts.filter(t => t.y >= 295 && t.y <= 555);  // cb133-148
      const rangeB = texts.filter(t => t.y >= 550 && t.y <= 780);  // cb119-132 (known)
      const rangeC = texts.filter(t => t.y >= 30 && t.y <= 70);    // cb261

      if (rangeA.length > 0 || rangeB.length > 0 || rangeC.length > 0) {
        console.log(`\n=== Page ${pi + 1} ===`);
        if (rangeB.length > 0) {
          console.log("\n  [Y 550-780 — cb119-132 known circumstancia zone]");
          for (const t of rangeB) console.log(`    Y=${t.y.toFixed(0)} X=${t.x.toFixed(0)}  "${t.text}"`);
        }
        if (rangeA.length > 0) {
          console.log("\n  [Y 295-555 — cb133-148 UNKNOWN]");
          for (const t of rangeA) console.log(`    Y=${t.y.toFixed(0)} X=${t.x.toFixed(0)}  "${t.text}"`);
        }
        if (rangeC.length > 0) {
          console.log("\n  [Y 30-70 — cb261 area]");
          for (const t of rangeC) console.log(`    Y=${t.y.toFixed(0)} X=${t.x.toFixed(0)}  "${t.text}"`);
        }
      }
    }
  }
}

main().catch(console.error);
