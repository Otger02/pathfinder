/**
 * SHA-256 hashing and hash chain for recording integrity.
 * Uses Web Crypto API (crypto.subtle) — works in browsers and Node.js 18+.
 */

/**
 * Compute SHA-256 hex digest of an ArrayBuffer.
 */
export async function computeSha256(data: ArrayBuffer): Promise<string> {
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = new Uint8Array(hashBuffer);
  return Array.from(hashArray)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/**
 * Compute a chain hash: SHA-256(previousChainHash + ":" + currentChunkHash).
 * For the first chunk (no previous), returns the chunk hash itself.
 */
export async function computeChainHash(
  previousChainHash: string | null,
  currentChunkHash: string
): Promise<string> {
  if (!previousChainHash) return currentChunkHash;

  const input = `${previousChainHash}:${currentChunkHash}`;
  const encoder = new TextEncoder();
  return computeSha256(encoder.encode(input).buffer as ArrayBuffer);
}

/**
 * Verify an entire hash chain.
 * Returns { valid: true } if all chain hashes are consistent,
 * or { valid: false, brokenAtIndex } indicating the first mismatch.
 */
export async function verifyChain(
  chunks: Array<{ sha256: string; chainHash: string }>
): Promise<{ valid: boolean; brokenAtIndex: number | null }> {
  let previousChain: string | null = null;

  for (let i = 0; i < chunks.length; i++) {
    const expected = await computeChainHash(previousChain, chunks[i].sha256);
    if (expected !== chunks[i].chainHash) {
      return { valid: false, brokenAtIndex: i };
    }
    previousChain = chunks[i].chainHash;
  }

  return { valid: true, brokenAtIndex: null };
}
