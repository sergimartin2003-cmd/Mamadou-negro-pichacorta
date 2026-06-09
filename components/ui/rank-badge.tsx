import type { NicheSlug } from "@/types/db";
import { tierFor, tierGlyph } from "@/lib/domain/tiers";
import { nicheTierName } from "@/lib/domain/niche-tiers";
import { getNiche } from "@/config/niches";
import { ICONS } from "./icon";

export type RankBadgeSize = "sm" | "md" | "lg";

export interface RankBadgeProps {
  rp: number;
  size?: RankBadgeSize;
  showName?: boolean;
  /** When set, the tier is labelled with this niche's names (Diamond → Whale…). */
  niche?: NicheSlug;
}

const PADDING: Record<RankBadgeSize, string> = {
  sm: "2px 8px",
  md: "4px 10px",
  lg: "7px 13px",
};

const FONT_SIZE: Record<RankBadgeSize, number> = {
  sm: 11,
  md: 12.5,
  lg: 14,
};

export function RankBadge({ rp, size = "md", showName = true, niche }: RankBadgeProps) {
  const tier = tierFor(rp);
  const name = niche ? nicheTierName(getNiche(niche), tier) : tier.name;
  const fs = FONT_SIZE[size];
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        padding: PADDING[size],
        borderRadius: "var(--r-pill)",
        background: `color-mix(in srgb, ${tier.color} 14%, transparent)`,
        border: `1px solid color-mix(in srgb, ${tier.color} 36%, transparent)`,
        color: tier.color,
        fontFamily: "var(--f-display)",
        fontWeight: 600,
        fontSize: fs,
        lineHeight: 1,
        whiteSpace: "nowrap",
      }}
    >
      <span style={{ fontSize: fs * 1.05 }}>{tierGlyph(tier.key)}</span>
      {showName && name}
    </span>
  );
}

export interface VerifiedTickProps {
  size?: number;
}

export function VerifiedTick({ size = 15 }: VerifiedTickProps) {
  return (
    <span
      title="Verified performance"
      style={{ display: "inline-grid", placeItems: "center", color: "var(--t-diamond)" }}
    >
      <svg width={size} height={size} viewBox="0 0 24 24">
        <path d={ICONS.verified} fill="var(--t-diamond)" />
        <path
          d="M8 12.2l2.6 2.6L16 9"
          stroke="#0B0F14"
          strokeWidth="2.2"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}
