"use client";

import { useEffect } from "react";
import Link from "next/link";

/**
 * Section-level error boundary for the app routes. A failed fetch or render
 * no longer tears down the whole screen — the shell stays, this renders inline.
 */
export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("App route error:", error);
  }, [error]);

  return (
    <div
      style={{
        maxWidth: 460,
        margin: "80px auto",
        padding: "0 16px",
        textAlign: "center",
      }}
    >
      <div className="card pad" style={{ padding: "36px 28px" }}>
        <div
          style={{
            width: 52,
            height: 52,
            borderRadius: "50%",
            display: "grid",
            placeItems: "center",
            margin: "0 auto 16px",
            background: "var(--loss-dim)",
            color: "var(--loss)",
            fontSize: 24,
          }}
        >
          !
        </div>
        <h1 style={{ fontSize: 20, marginBottom: 8 }}>Algo ha fallado</h1>
        <p style={{ color: "var(--tx-3)", fontSize: 13.5, lineHeight: 1.55, marginBottom: 20 }}>
          Hemos tenido un problema cargando esta sección. Puedes reintentar o volver al inicio.
        </p>
        <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
          <button className="btn primary" onClick={reset}>
            Reintentar
          </button>
          <Link href="/feed" className="btn">
            Ir al inicio
          </Link>
        </div>
      </div>
    </div>
  );
}
