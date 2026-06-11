"use client";

import { useEffect } from "react";

/**
 * Root error boundary — the last line of defence. Must render its own
 * <html>/<body> because it replaces the root layout when it fires.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Root error:", error);
  }, [error]);

  return (
    <html lang="es">
      <body
        style={{
          margin: 0,
          minHeight: "100dvh",
          display: "grid",
          placeItems: "center",
          background: "#0B0F14",
          color: "#F4F7FB",
          fontFamily: "system-ui, -apple-system, sans-serif",
        }}
      >
        <div style={{ textAlign: "center", maxWidth: 420, padding: "0 16px" }}>
          <h1 style={{ fontSize: 22, marginBottom: 10 }}>Algo ha ido mal</h1>
          <p style={{ color: "#6C7888", fontSize: 14, lineHeight: 1.55, marginBottom: 22 }}>
            Ha ocurrido un error inesperado. Vuelve a intentarlo.
          </p>
          <button
            onClick={reset}
            style={{
              border: "none",
              cursor: "pointer",
              padding: "11px 22px",
              borderRadius: 999,
              fontSize: 14,
              fontWeight: 600,
              color: "#fff",
              background: "linear-gradient(150deg, #9B5CFF, #7C4DFF)",
            }}
          >
            Reintentar
          </button>
        </div>
      </body>
    </html>
  );
}
