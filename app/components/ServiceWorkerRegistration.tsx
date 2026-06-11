"use client";

import { useEffect } from "react";

/**
 * Registers the service worker (public/sw.js) once the page has loaded.
 *
 * Production-only: in development a SW would cache stale dev assets and
 * fight the HMR server. NODE_ENV is inlined at build time, so in dev
 * builds this component compiles to a no-op.
 */
export default function ServiceWorkerRegistration() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return;
    if (!("serviceWorker" in navigator)) return;

    const register = () => {
      navigator.serviceWorker
        .register("/sw.js", { scope: "/" })
        .catch(() => {
          // Registration failure is non-fatal — the app works without it.
        });
    };

    // Defer until after load so SW install never competes with first paint
    // on low-end devices.
    if (document.readyState === "complete") {
      register();
    } else {
      window.addEventListener("load", register, { once: true });
      return () => window.removeEventListener("load", register);
    }
  }, []);

  return null;
}
