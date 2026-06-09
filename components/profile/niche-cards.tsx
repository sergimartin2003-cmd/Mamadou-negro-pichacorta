import type { NicheStatRow } from "@/lib/data/queries";
import { getNiche } from "@/config/niches";
import { nicheTierFor } from "@/lib/domain/niche-tiers";
import { RankBadge, VerifiedTick } from "@/components/ui";

interface NicheCardsProps {
  rows: NicheStatRow[];
}

/**
 * The per-niche competitive cards on a profile. Instead of one global stat
 * block, a profile shows a card for each niche it competes in — "Trading —
 * Diamond, verified", "Crypto — Whale", etc. — each with that niche's metrics.
 */
export function NicheCards({ rows }: NicheCardsProps) {
  if (rows.length === 0) return null;

  return (
    <div>
      <div className="sec-label" style={{ marginBottom: 12 }}>
        Competitive profile · {rows.length} {rows.length === 1 ? "niche" : "niches"}
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(248px, 1fr))",
          gap: 12,
        }}
      >
        {rows.map((row) => {
          const nicheModule = getNiche(row.niche);
          const tier = nicheTierFor(nicheModule, row.rp);
          const metrics = nicheModule.profileMetrics.map((metric) => ({
            label: metric.label,
            value: (row.metrics[metric.key] ?? "—") + (metric.suffix ?? ""),
            accent: metric.accent,
          }));

          return (
            <div
              key={row.niche}
              className="card pad"
              style={{ borderColor: `color-mix(in srgb, ${nicheModule.color} 30%, var(--line-1))` }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 12 }}>
                <span
                  aria-hidden
                  style={{
                    width: 30,
                    height: 30,
                    borderRadius: 9,
                    display: "grid",
                    placeItems: "center",
                    fontSize: 16,
                    background: `color-mix(in srgb, ${nicheModule.color} 16%, transparent)`,
                  }}
                >
                  {nicheModule.glyph}
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: 14 }}>{nicheModule.name}</div>
                  <div style={{ fontSize: 11.5, color: tier.color, fontWeight: 600 }}>
                    {tier.name}
                  </div>
                </div>
                {row.verified && <VerifiedTick size={15} />}
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 8,
                  marginBottom: 12,
                }}
              >
                <RankBadge rp={row.rp} size="sm" niche={row.niche} />
                <span className="mono" style={{ fontSize: 12.5, color: "var(--tx-3)" }}>
                  {row.rp.toLocaleString()} RP
                </span>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 9 }}>
                {metrics.map((metric) => (
                  <div key={metric.label}>
                    <div className="sec-label" style={{ fontSize: 9.5, marginBottom: 2 }}>
                      {metric.label}
                    </div>
                    <div
                      className="mono"
                      style={{ fontWeight: 700, fontSize: 13.5, color: metric.accent ?? "var(--tx-1)" }}
                    >
                      {metric.value}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
