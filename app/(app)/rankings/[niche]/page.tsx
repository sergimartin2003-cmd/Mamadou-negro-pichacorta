import { notFound } from "next/navigation";
import { getMe, getNicheLeaderboard, getNicheProfile } from "@/lib/data/queries";
import { getNiche, isNicheSlug, NICHE_SLUGS } from "@/config/niches";
import { RankingsClient } from "@/components/rankings/rankings-client";
import { NicheSelector } from "@/components/niche/niche-selector";

export function generateStaticParams() {
  return NICHE_SLUGS.map((niche) => ({ niche }));
}

interface RankingsNichePageProps {
  params: Promise<{ niche: string }>;
}

export default async function RankingsNichePage({ params }: RankingsNichePageProps) {
  const { niche } = await params;
  if (!isNicheSlug(niche)) notFound();
  const nicheModule = getNiche(niche);

  const me = await getMe();
  const [pool, meView] = await Promise.all([
    getNicheLeaderboard(niche),
    getNicheProfile(me.id, niche),
  ]);
  const meProfile = meView ?? me;
  const myRank =
    [...pool, meProfile].sort((a, b) => b.rp - a.rp).findIndex((p) => p.id === me.id) + 1;
  const fieldSize = pool.length + 1;

  return (
    <div
      style={{
        maxWidth: 980,
        margin: "0 auto",
        padding: "24px 16px",
        display: "flex",
        flexDirection: "column",
        gap: 16,
      }}
    >
      <div
        className="card"
        style={{
          padding: "18px 22px",
          display: "flex",
          alignItems: "center",
          gap: 18,
          flexWrap: "wrap",
          background: `linear-gradient(110deg, color-mix(in srgb, ${nicheModule.color} 16%, var(--bg-2)), var(--bg-2) 70%)`,
          borderColor: `color-mix(in srgb, ${nicheModule.color} 34%, transparent)`,
        }}
      >
        <div
          style={{
            width: 48,
            height: 48,
            borderRadius: 13,
            display: "grid",
            placeItems: "center",
            fontSize: 24,
            background: `color-mix(in srgb, ${nicheModule.color} 16%, transparent)`,
            color: nicheModule.color,
          }}
        >
          {nicheModule.glyph}
        </div>
        <div style={{ flex: 1, minWidth: 200 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 9, flexWrap: "wrap" }}>
            <h1 style={{ fontSize: 22 }}>{nicheModule.name} · Season 7</h1>
            <span
              className="chip tag"
              style={{ color: "var(--profit)", borderColor: "var(--profit-line)" }}
            >
              ● LIVE
            </span>
          </div>
          <div style={{ fontSize: 13, color: "var(--tx-3)", marginTop: 3 }}>{nicheModule.tagline}</div>
        </div>
        <div style={{ display: "flex", gap: 22, textAlign: "center" }}>
          {(
            [
              ["Ends in", "6d 4h"],
              ["Field", fieldSize.toLocaleString()],
              ["Your rank", `#${myRank.toLocaleString()}`],
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

      <NicheSelector section="rankings" active={niche} />

      <RankingsClient traders={pool} me={meProfile} verifiedOnly={false} niche={niche} />
    </div>
  );
}
