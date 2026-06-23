import Link from "next/link";
import { Icon, type IconName } from "@/components/ui/icon";

interface GameEntry {
  href: string | null;
  title: string;
  tagline: string;
  icon: IconName;
  accent: string;
  status: "live" | "soon";
}

const GAMES: readonly GameEntry[] = [
  {
    href: "/games/predict-candle",
    title: "Predict the Next Candle",
    tagline: "¿Alcista o bajista? Modos Clásico, Turbo y Extremo. Suma XP y racha.",
    icon: "trend",
    accent: "var(--brand)",
    status: "live",
  },
  {
    href: "/games/speed-trading",
    title: "Speed Trading Challenge",
    tagline: "60 segundos para encadenar el máximo de trades ganadores.",
    icon: "bolt",
    accent: "var(--t-gold)",
    status: "live",
  },
  {
    href: null,
    title: "Trading Arena",
    tagline: "Battle royale de trading: 100 traders, el último en pie gana.",
    icon: "swords",
    accent: "var(--t-elite)",
    status: "soon",
  },
];

export function GamesHub() {
  return (
    <div style={{ maxWidth: 920, margin: "0 auto", display: "flex", flexDirection: "column", gap: 18 }}>
      <div>
        <div className="sec-label" style={{ color: "var(--brand)" }}>Arcade</div>
        <h1 style={{ fontSize: 24, margin: "4px 0" }}>Minijuegos</h1>
        <p style={{ color: "var(--tx-3)", fontSize: 14, margin: 0 }}>
          Entrena tu instinto y compite por XP. Más juegos en camino.
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 14 }}>
        {GAMES.map((g) => {
          const inner = (
            <div
              className="card"
              style={{
                padding: 18,
                display: "flex",
                flexDirection: "column",
                gap: 12,
                height: "100%",
                opacity: g.status === "soon" ? 0.62 : 1,
                cursor: g.href ? "pointer" : "default",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: "var(--r-md)",
                    display: "grid",
                    placeItems: "center",
                    background: `color-mix(in srgb, ${g.accent} 16%, transparent)`,
                    border: `1px solid color-mix(in srgb, ${g.accent} 32%, transparent)`,
                  }}
                >
                  <Icon name={g.icon} size={22} style={{ color: g.accent }} />
                </div>
                <span
                  className="chip"
                  style={{
                    fontSize: 10.5,
                    color: g.status === "live" ? "var(--profit)" : "var(--tx-3)",
                  }}
                >
                  {g.status === "live" ? "Jugable" : "Próximamente"}
                </span>
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 16 }}>{g.title}</div>
                <div style={{ fontSize: 13, color: "var(--tx-3)", marginTop: 4 }}>{g.tagline}</div>
              </div>
              {g.href && (
                <div style={{ marginTop: "auto", display: "flex", alignItems: "center", gap: 6, color: g.accent, fontWeight: 600, fontSize: 13 }}>
                  Jugar <Icon name="arrowR" size={15} />
                </div>
              )}
            </div>
          );

          return g.href ? (
            <Link key={g.title} href={g.href} style={{ textDecoration: "none", color: "inherit" }}>
              {inner}
            </Link>
          ) : (
            <div key={g.title}>{inner}</div>
          );
        })}
      </div>
    </div>
  );
}
