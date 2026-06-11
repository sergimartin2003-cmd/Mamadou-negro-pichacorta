import Link from "next/link";

export default function NotFound() {
  return (
    <main
      style={{
        minHeight: "100dvh",
        display: "grid",
        placeItems: "center",
        background: "var(--bg-1)",
        padding: "0 16px",
      }}
    >
      <div style={{ textAlign: "center", maxWidth: 420 }}>
        <div
          className="display"
          style={{ fontSize: 64, fontWeight: 700, color: "var(--brand)", lineHeight: 1 }}
        >
          404
        </div>
        <h1 style={{ fontSize: 20, margin: "12px 0 8px" }}>Página no encontrada</h1>
        <p style={{ color: "var(--tx-3)", fontSize: 14, lineHeight: 1.55, marginBottom: 22 }}>
          La página que buscas no existe o se ha movido.
        </p>
        <Link href="/feed" className="btn primary lg">
          Volver al inicio
        </Link>
      </div>
    </main>
  );
}
