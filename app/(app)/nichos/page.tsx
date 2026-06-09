import Link from "next/link";
import { NICHE_LIST } from "@/config/niches";
import { getNicheLeaderboard } from "@/lib/data/queries";

export default async function NichosPage() {
  // Field size per niche (excludes the signed-in user) for a quick stat.
  const fields = await Promise.all(
    NICHE_LIST.map(async (n) => [n.slug, (await getNicheLeaderboard(n.slug)).length] as const),
  );
  const fieldBySlug = Object.fromEntries(fields);

  return (
    <div style={{ maxWidth: 1040, margin: "0 auto", padding: "24px 16px 48px", display: "flex", flexDirection: "column", gap: 18 }}>
      <div>
        <h1 style={{ fontSize: 24 }}>Nichos</h1>
        <p style={{ color: "var(--tx-3)", fontSize: 14, marginTop: 4, maxWidth: 560 }}>
          Una red social, muchos ladders. Entra en tu nicho para ver su feed, su ranking, sus retos
          y sus cursos — con métricas verificadas, no humo.
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
        {NICHE_LIST.map((niche) => (
          <Link
            key={niche.slug}
            href={`/nichos/${niche.slug}`}
            className="card fade-up"
            style={{ overflow: "hidden", textDecoration: "none", color: "inherit", borderRadius: "var(--r-lg)" }}
          >
            <div
              style={{
                height: 88,
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "0 18px",
                background: `linear-gradient(120deg, color-mix(in srgb, ${niche.color} 40%, var(--bg-2)), var(--bg-3))`,
              }}
            >
              <span aria-hidden style={{ fontSize: 34 }}>{niche.glyph}</span>
              <div>
                <div style={{ fontSize: 17, fontWeight: 700 }}>{niche.name}</div>
                <div className="mono" style={{ fontSize: 11.5, color: "var(--tx-2)" }}>
                  {fieldBySlug[niche.slug]?.toLocaleString() ?? 0} {niche.copy.member}s
                </div>
              </div>
            </div>
            <div style={{ padding: "13px 18px 16px" }}>
              <p style={{ fontSize: 13, color: "var(--tx-2)", lineHeight: 1.5, minHeight: 38 }}>{niche.tagline}</p>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 6, marginTop: 8, fontSize: 13, fontWeight: 600, color: niche.color }}>
                Ver nicho →
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
