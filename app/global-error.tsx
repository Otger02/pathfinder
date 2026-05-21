"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="ca">
      <body style={{ fontFamily: "system-ui, sans-serif", padding: "2rem", textAlign: "center" }}>
        <h2 style={{ marginBottom: "1rem" }}>Alguna cosa ha fallat.</h2>
        <button
          onClick={reset}
          style={{ padding: "0.5rem 1.5rem", borderRadius: "0.5rem", cursor: "pointer" }}
        >
          Torna a intentar-ho
        </button>
      </body>
    </html>
  );
}
