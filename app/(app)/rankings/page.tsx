import { getRankings, getMe } from "@/lib/data/queries";
import { RankingsClient } from "@/components/rankings/rankings-client";

export default async function RankingsPage() {
  const [traders, me] = await Promise.all([getRankings(), getMe()]);

  return (
    <div style={{ maxWidth: 980, margin: "0 auto", padding: "24px 16px", display: "flex", flexDirection: "column", gap: 16 }}>
      <div
        className="card"
        style={{
          padding: "18px 22px",
          display: "flex",
          alignItems: "center",
          gap: 18,
          flexWrap: "wrap",
          background: "linear-gradient(110deg, color-mix(in srgb, var(--brand) 16%, var(--bg-2)), var(--bg-2) 70%)",
          borderColor: "var(--brand-line)",
        }}
      >
        <div
          style={{
            width: 48,
            height: 48,
            borderRadius: 13,
            display: "grid",
            placeItems: "center",
            background: "var(--brand-dim)",
            color: "var(--brand)",
          }}
        >
          <svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
            <path d="M7 4h10v3a5 5 0 0 1-10 0V4ZM7 5H4v1a3 3 0 0 0 3 3M17 5h3v1a3 3 0 0 1-3 3M9 14h6M10 14l-1 5h6l-1-5M8 21h8" />
          </svg>
        </div>
        <div style={{ flex: 1, minWidth: 200 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
            <h1 style={{ fontSize: 22 }}>Season 7 · Spring</h1>
            <span
              className="chip tag"
              style={{ color: "var(--profit)", borderColor: "var(--profit-line)" }}
            >
              ● LIVE
            </span>
          </div>
          <div style={{ fontSize: 13, color: "var(--tx-3)", marginTop: 3 }}>
            Ranked by risk-adjusted return · verified accounts only
          </div>
        </div>
        <div style={{ display: "flex", gap: 22, textAlign: "center" }}>
          {(
            [
              ["Ends in", "6d 4h"],
              ["Traders", "48,210"],
              ["Your rank", "#1,284"],
            ] as const
          ).map(([label, value]) => (
            <div key={label}>
              <div className="mono" style={{ fontWeight: 700, fontSize: 18 }}>
                {value}
              </div>
              <div className="sec-label" style={{ fontSize: 10 }}>
                {label}
              </div>
            </div>
          ))}
        </div>
      </div>

      <RankingsClient traders={traders} me={me} verifiedOnly={false} />
    </div>
  );
}
