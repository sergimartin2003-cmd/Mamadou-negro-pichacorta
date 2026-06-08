import { Logo } from "@/components/shell/logo";
import { SocialProof } from "./social-proof";

interface Pillar {
  title: string;
  body: string;
}

const PILLARS: readonly Pillar[] = [
  { title: "Verified by your broker", body: "Every stat is pulled from live, connected accounts — never self-reported." },
  { title: "Climb the global ranks", body: "Earn RP, break tiers and prove you belong among the sharpest traders." },
  { title: "Compete for real stakes", body: "Seasonal leagues and 48h battles settle on audited P&L." },
] as const;

export function BrandPanel() {
  return (
    <aside className="th-auth-brand" aria-hidden>
      <div
        style={{
          position: "relative",
          height: "100%",
          padding: "44px 48px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          overflow: "hidden",
          background:
            "radial-gradient(120% 120% at 0% 0%, rgba(155,92,255,0.28) 0%, rgba(124,77,255,0.10) 38%, transparent 64%)," +
            "linear-gradient(160deg, #15101F 0%, #0B0F14 58%)",
          borderRight: "1px solid var(--line-1)",
        }}
      >
        <BrandGlow />

        <div style={{ position: "relative", zIndex: 1 }}>
          <Logo size={34} />
        </div>

        <div style={{ position: "relative", zIndex: 1, maxWidth: 460 }}>
          <h1
            className="display"
            style={{
              fontSize: "clamp(40px, 4vw, 56px)",
              fontWeight: 700,
              lineHeight: 1.02,
              letterSpacing: "-0.035em",
              color: "#fff",
            }}
          >
            Status is{" "}
            <span
              style={{
                background: "linear-gradient(120deg, var(--brand), #c9b1ff)",
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                color: "transparent",
              }}
            >
              earned.
            </span>
          </h1>
          <p
            style={{
              marginTop: 16,
              fontSize: 16,
              lineHeight: 1.55,
              color: "rgba(255,255,255,0.72)",
              maxWidth: 400,
            }}
          >
            TradeHub is the proving ground for serious traders. Connect, verify, and let your
            results speak.
          </p>

          <ul style={{ listStyle: "none", padding: 0, margin: "28px 0 0", display: "grid", gap: 16 }}>
            {PILLARS.map((pillar) => (
              <li key={pillar.title} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                <span
                  style={{
                    flexShrink: 0,
                    width: 26,
                    height: 26,
                    display: "grid",
                    placeItems: "center",
                    borderRadius: 8,
                    background: "rgba(255,255,255,0.08)",
                    border: "1px solid rgba(255,255,255,0.12)",
                  }}
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#c9b1ff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12l5 5 9-11" />
                  </svg>
                </span>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "#fff" }}>{pillar.title}</div>
                  <div style={{ fontSize: 13, lineHeight: 1.5, color: "rgba(255,255,255,0.6)" }}>
                    {pillar.body}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div
          style={{
            position: "relative",
            zIndex: 1,
            paddingTop: 28,
            borderTop: "1px solid rgba(255,255,255,0.10)",
          }}
        >
          <SocialProof />
        </div>
      </div>
    </aside>
  );
}

function BrandGlow() {
  return (
    <>
      <span
        aria-hidden
        style={{
          position: "absolute",
          top: "-12%",
          right: "-18%",
          width: 380,
          height: 380,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(124,77,255,0.40), transparent 70%)",
          filter: "blur(8px)",
          pointerEvents: "none",
        }}
      />
      <span
        aria-hidden
        style={{
          position: "absolute",
          bottom: "-20%",
          left: "-10%",
          width: 320,
          height: 320,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(91,124,255,0.22), transparent 70%)",
          pointerEvents: "none",
        }}
      />
    </>
  );
}
