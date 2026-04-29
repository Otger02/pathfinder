/**
 * IndexedDB-based offline queue for failed SOS recording chunk uploads.
 * Chunks are stored locally and retried via Background Sync or manual flush.
 * Client-side only.
 */

import type { ChunkUploadPayload } from "./types/recording";

const DB_NAME = "pathfinder-sos";
const DB_VERSION = 1;
const STORE_NAME = "upload-queue";

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { autoIncrement: true });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

/**
 * Store a failed chunk upload for later retry.
 */
export async function enqueueChunk(payload: ChunkUploadPayload): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    tx.objectStore(STORE_NAME).add({
      sessionId: payload.sessionId,
      chunkIndex: payload.chunkIndex,
      blob: payload.blob,
      sha256: payload.sha256,
      chainHash: payload.chainHash,
      durationMs: payload.durationMs,
      timestamp: payload.timestamp,
      gpsLat: payload.gpsLat,
      gpsLon: payload.gpsLon,
    });
    tx.oncomplete = () => {
      // Request Background Sync if available
      if ("serviceWorker" in navigator && "SyncManager" in window) {
        navigator.serviceWorker.ready
          .then((reg) => (reg as unknown as { sync: { register: (tag: string) => Promise<void> } }).sync.register("sos-chunk-upload"))
          .catch(() => {});
      }
      resolve();
    };
    tx.onerror = () => reject(tx.error);
  });
}

/**
 * Get the number of queued chunks.
 */
export async function getQueueSize(): Promise<number> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readonly");
    const req = tx.objectStore(STORE_NAME).count();
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

/**
 * Process all queued chunks: upload each, remove on success.
 * Returns the number of successfully uploaded chunks.
 */
export async function flushQueue(
  uploadFn: (payload: ChunkUploadPayload) => Promise<boolean>
): Promise<number> {
  const db = await openDB();

  const keys = await new Promise<IDBValidKey[]>((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readonly");
    const req = tx.objectStore(STORE_NAME).getAllKeys();
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });

  let uploaded = 0;
  for (const key of keys) {
    const item = await new Promise<ChunkUploadPayload | null>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readonly");
      const req = tx.objectStore(STORE_NAME).get(key);
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });

    if (!item) continue;

    try {
      const ok = await uploadFn(item);
      if (ok) {
        await new Promise<void>((resolve, reject) => {
          const tx = db.transaction(STORE_NAME, "readwrite");
          tx.objectStore(STORE_NAME).delete(key);
          tx.oncomplete = () => resolve();
          tx.onerror = () => reject(tx.error);
        });
        uploaded++;
      }
    } catch {
      // Keep in queue for next retry
    }
  }

  return uploaded;
}

/**
 * Clear all queued chunks for a specific session.
 */
export async function clearQueue(sessionId?: string): Promise<void> {
  const db = await openDB();

  if (!sessionId) {
    // Clear all
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readwrite");
      tx.objectStore(STORE_NAME).clear();
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  // Clear by session
  const keys = await new Promise<IDBValidKey[]>((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readonly");
    const req = tx.objectStore(STORE_NAME).getAllKeys();
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });

  for (const key of keys) {
    const item = await new Promise<{ sessionId: string } | null>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readonly");
      const req = tx.objectStore(STORE_NAME).get(key);
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });

    if (item?.sessionId === sessionId) {
      await new Promise<void>((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, "readwrite");
        tx.objectStore(STORE_NAME).delete(key);
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      });
    }
  }
}
