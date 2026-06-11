/// <reference lib="webworker" />

/**
 * Pathfinder Service Worker
 *
 * Caching strategy (designed for low-end Androids on flaky connections):
 * - Precache: app shell (/, /chat, /offline) + manifest + icons.
 * - Navigations (GET): network-first with a short timeout, falling back to
 *   the cached copy of the page, then to /offline. Successful responses are
 *   cached at runtime (except /admin and /auth, which are session-dependent).
 * - Static assets (scripts, styles, fonts, images, /_next/static, /icons,
 *   /forms): stale-while-revalidate.
 * - /api/* and anything cross-origin (Supabase, Sentry): NOT intercepted —
 *   network only. This keeps SSE/streaming chat responses untouched.
 * - Background Sync: retries failed SOS chunk uploads (see bottom).
 */

const VERSION = "v2";
const PRECACHE = `pathfinder-precache-${VERSION}`;
const RUNTIME = `pathfinder-runtime-${VERSION}`;

const APP_SHELL = [
  "/",
  "/chat",
  "/offline",
  "/manifest.webmanifest",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
];

/** Navigations to these prefixes are never cached (auth/session-dependent). */
const UNCACHED_NAV_PREFIXES = ["/admin", "/auth", "/api"];

/** How long to wait for the network before falling back to cache. */
const NAV_NETWORK_TIMEOUT_MS = 5000;

// ── Install: precache app shell ─────────────────────────────────────

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(PRECACHE).then((cache) => cache.addAll(APP_SHELL))
  );
  self.skipWaiting();
});

// ── Activate: clean old caches ──────────────────────────────────────

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((k) => k !== PRECACHE && k !== RUNTIME)
          .map((k) => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

// ── Fetch ────────────────────────────────────────────────────────────

self.addEventListener("fetch", (event) => {
  const { request } = event;

  // Only GET requests are cacheable.
  if (request.method !== "GET") return;

  const url = new URL(request.url);

  // Cross-origin (Supabase REST/Realtime/Storage, Sentry, Google Fonts at
  // runtime…): don't intercept — network only.
  if (url.origin !== self.location.origin) return;

  // API routes: never intercept. Includes the SSE chat stream — caching or
  // even cloning a streaming response could break it.
  if (url.pathname.startsWith("/api/")) return;

  // Navigation requests: network-first (with timeout) → cache → /offline.
  if (request.mode === "navigate") {
    event.respondWith(handleNavigation(request, url));
    return;
  }

  // Static assets: stale-while-revalidate.
  if (isStaticAsset(request, url)) {
    event.respondWith(staleWhileRevalidate(request));
    return;
  }

  // Anything else same-origin: network with cache fallback.
  event.respondWith(
    fetch(request).catch(() =>
      caches.match(request).then((cached) => cached || Response.error())
    )
  );
});

function isStaticAsset(request, url) {
  if (
    url.pathname.startsWith("/_next/static/") ||
    url.pathname.startsWith("/icons/") ||
    url.pathname.startsWith("/forms/") ||
    url.pathname === "/manifest.webmanifest"
  ) {
    return true;
  }
  return ["style", "script", "font", "image"].includes(request.destination);
}

async function handleNavigation(request, url) {
  const cacheable = !UNCACHED_NAV_PREFIXES.some((p) =>
    url.pathname.startsWith(p)
  );

  try {
    const response = await fetchWithTimeout(request, NAV_NETWORK_TIMEOUT_MS);
    // Cache successful page loads for offline revisits.
    if (cacheable && response.ok) {
      const copy = response.clone();
      caches.open(RUNTIME).then((cache) => cache.put(request, copy));
    }
    return response;
  } catch {
    // Offline or too slow: cached copy of this page → cached /chat shell →
    // the /offline fallback page.
    const cached = await caches.match(request, { ignoreSearch: true });
    if (cached) return cached;
    const offline = await caches.match("/offline");
    if (offline) return offline;
    return Response.error();
  }
}

function fetchWithTimeout(request, ms) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error("timeout")), ms);
    fetch(request).then(
      (res) => {
        clearTimeout(timer);
        resolve(res);
      },
      (err) => {
        clearTimeout(timer);
        reject(err);
      }
    );
  });
}

async function staleWhileRevalidate(request) {
  const cache = await caches.open(RUNTIME);
  const cached = await cache.match(request);

  const networkFetch = fetch(request)
    .then((response) => {
      if (response.ok) {
        cache.put(request, response.clone());
      }
      return response;
    })
    .catch(() => undefined);

  if (cached) {
    // Serve stale immediately; refresh in the background.
    networkFetch.catch(() => {});
    return cached;
  }

  const response = await networkFetch;
  return response || Response.error();
}

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
