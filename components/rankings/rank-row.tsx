"use client";

import Link from "next/link";
import type { Profile } from "@/types/db";
import { Avatar } from "@/components/ui/avatar";
import { RankBadge, VerifiedTick } from "@/components/ui/rank-badge";
import { Pnl } from "@/components/ui/pnl";
import { tierFor } from "@/lib/domain/tiers";

interface RankRowProps {
  profile: Profile;
  rank: number;
  highlight?: boolean;
}

function deltaFor(rank: number): number {
  return (rank * 7) % 3 === 0 ? -(rank % 4) - 1 : ((rank * 3) % 5) + 1;
}

export function RankRow({ profile, rank, highlight = false }: RankRowProps) {
  const tier = tierFor(profile.rp);
  const delta = deltaFor(rank);

  return (
    <Link
      href={`/u/${profile.handle}`}
      style={{
        width: "100%",
        display: "grid",
        gridTemplateColumns: "48px 1fr 88px 88px 78px 96px",
        alignItems: "center",
        gap: 12,
        padding: "12px 18px",
        borderBottom: "1px solid var(--line-1)",
        textAlign: "left",
        background: highlight
          ? "color-mix(in srgb, var(--brand) 8%, transparent)"
          : "transparent",
        transition: "background .14s",
        textDecoration: "none",
      }}
      onMouseEnter={(e) => {
        if (!highlight)
          (e.currentTarget as HTMLAnchorElement).style.background = "var(--bg-3)";
      }}
      onMouseLeave={(e) => {
        if (!highlight)
          (e.currentTarget as HTMLAnchorElement).style.background = "transparent";
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <span
          className="mono"
          style={{
            fontWeight: 700,
            fontSize: 15,
            width: 24,
            color: rank <= 3 ? tier.color : "var(--tx-2)",
          }}
        >
          {rank}
        </span>
        <span
          style={{
            fontSize: 10,
            color: delta >= 0 ? "var(--profit)" : "var(--loss)",
            fontFamily: "var(--f-mono)",
          }}
        >
          {delta >= 0 ? "▲" : "▼"}
          {Math.abs(delta)}
        </span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 11, minWidth: 0 }}>
        <Avatar user={profile} size={38} ring={rank <= 3 ? tier.color : null} />
        <div style={{ minWidth: 0 }}>
          <div style={{ fontWeight: 600, fontSize: 13.5, display: "flex", alignItems: "center", gap: 5 }}>
            {highlight ? "You · " : ""}
            {profile.name}
            {profile.verified && <VerifiedTick size={13} />}
          </div>
          <div className="mono" style={{ fontSize: 11.5, color: "var(--tx-3)" }}>
            @{profile.handle} · {profile.flag} {profile.market}
          </div>
        </div>
      </div>
      <div>
        <RankBadge rp={profile.rp} size="sm" />
      </div>
      <span className="mono" style={{ fontWeight: 700, fontSize: 13.5 }}>
        {profile.rp.toLocaleString()}
      </span>
      <span className="mono" style={{ fontSize: 13.5, color: "var(--tx-2)" }}>
        {profile.win}%
      </span>
      <div style={{ textAlign: "right" }}>
        <Pnl value={profile.pnl} suffix="%" />
      </div>
    </Link>
  );
}
