/// <reference lib="webworker" />

/**
 * Pathfinder Service Worker
 *
 * - Caches the app shell for offline access to SOS emergency info
 * - Retries failed SOS chunk uploads via Background Sync
 */

const CACHE_NAME = "pathfinder-v1";
const APP_SHELL = ["/chat"];

// ── Install: cache app shell ────────────────────────────────────────

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL))
  );
  self.skipWaiting();
});

// ── Activate: clean old caches ──────────────────────────────────────

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((k) => k !== CACHE_NAME)
          .map((k) => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

// ── Fetch: network-first, fallback to cache for navigation ──────────

self.addEventListener("fetch", (event) => {
  const { request } = event;

  // Don't intercept API calls or SSE streams
  if (request.url.includes("/api/")) return;

  // Navigation requests: network-first with cache fallback
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request).catch(() => caches.match("/chat") || caches.match(request))
    );
    return;
  }

  // Other assets: cache-first
  event.respondWith(
    caches.match(request).then((cached) => cached || fetch(request))
  );
});

// ── Background Sync: retry failed SOS chunk uploads ─────────────────

self.addEventListener("sync", (event) => {
  if (event.tag === "sos-chunk-upload") {
    event.waitUntil(processChunkQueue());
  }
});

async function processChunkQueue() {
  // Open IndexedDB to get queued chunks
  const db = await openDB();
  const tx = db.transaction("upload-queue", "readonly");
  const store = tx.objectStore("upload-queue");
  const allKeys = await getAllKeys(store);

  for (const key of allKeys) {
    const readTx = db.transaction("upload-queue", "readonly");
    const item = await getItem(readTx.objectStore("upload-queue"), key);
    if (!item) continue;

    try {
      const formData = new FormData();
      formData.append("file", item.blob);
      formData.append("sessionId", item.sessionId);
      formData.append("chunkIndex", String(item.chunkIndex));
      formData.append("sha256", item.sha256);
      formData.append("chainHash", item.chainHash);
      formData.append("durationMs", String(item.durationMs));
      formData.append("timestamp", item.timestamp);

      const resp = await fetch("/api/sos/recording/chunk", {
        method: "POST",
        body: formData,
      });

      if (resp.ok) {
        const delTx = db.transaction("upload-queue", "readwrite");
        delTx.objectStore("upload-queue").delete(key);
      }
    } catch {
      // Will retry on next sync
    }
  }
}

// ── IndexedDB helpers ───────────────────────────────────────────────

function openDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open("pathfinder-sos", 1);
    req.onupgradeneeded = () => {
      req.result.createObjectStore("upload-queue", { autoIncrement: true });
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

function getAllKeys(store) {
  return new Promise((resolve, reject) => {
    const req = store.getAllKeys();
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

function getItem(store, key) {
  return new Promise((resolve, reject) => {
    const req = store.get(key);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}
