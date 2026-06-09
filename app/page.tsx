import Link from "next/link";

export default function LandingPage() {
  return (
    <main
      style={{
        minHeight: "100dvh",
        display: "grid",
        placeItems: "center",
        padding: "32px",
        background:
          "radial-gradient(60% 50% at 50% 0%, rgba(124,77,255,0.16) 0%, rgba(124,77,255,0) 70%), var(--bg-1)",
      }}
    >
      <div
        className="fade-up"
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "20px",
          textAlign: "center",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
          <span
            aria-hidden
            style={{
              width: "52px",
              height: "52px",
              borderRadius: "var(--r-md)",
              background: "linear-gradient(160deg, var(--brand) 0%, var(--brand-2) 100%)",
              boxShadow: "var(--sh-brand)",
              display: "grid",
              placeItems: "center",
              fontFamily: "var(--f-display)",
              fontWeight: 700,
              fontSize: "26px",
              color: "#fff",
            }}
          >
            T
          </span>
          <h1
            className="display"
            style={{ fontSize: "44px", fontWeight: 700, color: "var(--tx-1)" }}
          >
            Emprende<span style={{ color: "var(--brand)" }}>Hub</span>
          </h1>
        </div>

        <p
          style={{
            maxWidth: "44ch",
            fontSize: "16px",
            lineHeight: 1.55,
            color: "var(--tx-2)",
          }}
        >
          La red social donde los emprendedores comparten sus números reales, compiten y crecen.
        </p>

        <Link href="/feed" className="btn primary lg" style={{ marginTop: "4px" }}>
          Entrar al feed
        </Link>
      </div>
    </main>
  );
}
