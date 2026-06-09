/**
 * Niche-aware tier naming.
 *
 * The ELO engine and the seven-rung ladder (`TIERS`) are identical across every
 * niche — only the tier *names* change (Diamond → Whale → Syndicator …). These
 * helpers resolve an RP value to the active niche's label while keeping the
 * shared tier's key/color/glyph for styling.
 */

import type { Tier } from "@/types/db";
import type { NicheModule } from "@/lib/niches/types";
import { TIER_INDEX } from "@/lib/niches/types";
import { TIERS, tierFor } from "@/lib/domain/tiers";

/** The niche's display name for a given tier (Bronze→Elite index-aligned). */
export function nicheTierName(niche: NicheModule, tier: Tier): string {
  return niche.tierNames[TIER_INDEX[tier.key]] ?? tier.name;
}

/** Resolve RP to a tier carrying the niche's display name (color/key unchanged). */
export function nicheTierFor(niche: NicheModule, rp: number): Tier {
  const base = tierFor(rp);
  return { ...base, name: nicheTierName(niche, base) };
}

/** Full ladder relabelled for a niche, highest tier first (for legends/headers). */
export function nicheLadder(niche: NicheModule): Tier[] {
  return TIERS.map((tier, i) => ({ ...tier, name: niche.tierNames[i] ?? tier.name }));
}
