import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sin conexión — Pathfinder",
};

/**
 * Offline fallback page, served by the service worker when a navigation
 * fails and there is no cached copy of the requested page.
 *
 * Static and dependency-free on purpose: it must render entirely from the
 * precache without network, JS hydration is optional.
 */
export default function OfflinePage() {
  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <div className="card w-full max-w-md text-center">
        <div className="text-5xl mb-4" aria-hidden="true">
          📡
        </div>
        <h1 className="text-xl font-bold mb-3">Sin conexión a internet</h1>
        <p className="text-sm leading-relaxed mb-3">
          El asistente de Pathfinder necesita conexión para responder a tus
          preguntas y rellenar formularios.
        </p>
        <p className="text-sm leading-relaxed mb-3">
          Las páginas que ya visitaste siguen disponibles sin conexión.
          Cuando recuperes la señal, vuelve a intentarlo: tu progreso
          guardado no se pierde.
        </p>
        <p className="text-sm leading-relaxed mb-5">
          Si estás en una emergencia, llama al{" "}
          <a href="tel:112" className="text-primary font-semibold underline">
            112
          </a>{" "}
          (no necesita internet ni saldo).
        </p>
        <a href="/chat" className="btn">
          Reintentar
        </a>
      </div>
    </main>
  );
}
