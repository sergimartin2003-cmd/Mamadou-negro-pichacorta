import { Logo } from "@/components/shell/logo";

interface Highlight {
  glyph: string;
  label: string;
}

const HIGHLIGHTS: readonly Highlight[] = [
  { glyph: "◎", label: "Connect a verified trading account" },
  { glyph: "⛬", label: "Earn RP and break into higher tiers" },
  { glyph: "⚔", label: "Compete in seasonal leagues" },
] as const;

export function StepWelcome() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
      <Logo size={36} />
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <h2 style={{ fontSize: 30, fontWeight: 700, letterSpacing: "-0.03em" }}>
          Let&apos;s build your trader profile.
        </h2>
        <p style={{ fontSize: 15, lineHeight: 1.55, color: "var(--tx-2)", maxWidth: 440 }}>
          Three quick steps and you&apos;re on the board. Your stats stay private until you choose
          to verify and rank.
        </p>
      </div>
      <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gap: 10 }}>
        {HIGHLIGHTS.map((item) => (
          <li
            key={item.label}
            className="card"
            style={{ display: "flex", alignItems: "center", gap: 13, padding: "13px 15px" }}
          >
            <span
              aria-hidden
              style={{
                width: 36,
                height: 36,
                display: "grid",
                placeItems: "center",
                borderRadius: 10,
                background: "var(--brand-dim)",
                border: "1px solid var(--brand-line)",
                color: "#c9b1ff",
                fontSize: 18,
              }}
            >
              {item.glyph}
            </span>
            <span style={{ fontSize: 14, fontWeight: 600 }}>{item.label}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
