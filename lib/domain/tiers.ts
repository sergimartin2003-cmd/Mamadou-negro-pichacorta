import type { Tier, TierKey } from "@/types/db";

/** Esports-style ranked ladder. Each entry's `min` is the RP floor for the tier. */
export const TIERS: readonly Tier[] = [
  { key: "bronze", name: "Bronze", color: "var(--t-bronze)", min: 0 },
  { key: "silver", name: "Silver", color: "var(--t-silver)", min: 1000 },
  { key: "gold", name: "Gold", color: "var(--t-gold)", min: 2000 },
  { key: "platinum", name: "Platinum", color: "var(--t-platinum)", min: 3200 },
  { key: "diamond", name: "Diamond", color: "var(--t-diamond)", min: 4600 },
  { key: "master", name: "Master", color: "var(--t-master)", min: 6200 },
  { key: "elite", name: "Elite", color: "var(--t-elite)", min: 8000 },
] as const;

const GLYPHS: Record<TierKey, string> = {
  bronze: "❖",
  silver: "❖",
  gold: "✦",
  platinum: "✦",
  diamond: "◆",
  master: "◆",
  elite: "♛",
};

/** Number of divisions within a single tier (Roman numerals IV → I as RP rises). */
const DIVISIONS = 4;
const DIVISION_NUMERALS = ["IV", "III", "II", "I"] as const;

/** Highest tier whose floor `rp` has reached. */
export function tierFor(rp: number): Tier {
  let current: Tier = TIERS[0];
  for (const tier of TIERS) {
    if (rp >= tier.min) current = tier;
  }
  return current;
}

/** Next tier above `rp`, or null when already at the top tier. */
export function nextTier(rp: number): Tier | null {
  for (const tier of TIERS) {
    if (rp < tier.min) return tier;
  }
  return null;
}

/** Progress (0–100) from the current tier floor toward the next tier. 100 at max tier. */
export function tierProgress(rp: number): number {
  const current = tierFor(rp);
  const next = nextTier(rp);
  if (!next) return 100;
  const span = next.min - current.min;
  if (span <= 0) return 100;
  const pct = ((rp - current.min) / span) * 100;
  return Math.max(0, Math.min(100, pct));
}

/**
 * Division within the current tier as a Roman numeral (IV lowest → I highest).
 * The final tier has no ceiling, so RP is bucketed against the previous span.
 */
export function divisionFor(rp: number): string {
  const current = tierFor(rp);
  const next = nextTier(rp);
  const previousFloor = previousTierMin(current.key);
  const span = next ? next.min - current.min : current.min - previousFloor;
  if (span <= 0) return DIVISION_NUMERALS[DIVISIONS - 1];
  const offset = next ? rp - current.min : rp - current.min;
  const index = Math.min(DIVISIONS - 1, Math.floor((offset / span) * DIVISIONS));
  return DIVISION_NUMERALS[Math.max(0, index)];
}

export function tierGlyph(key: TierKey): string {
  return GLYPHS[key];
}

function previousTierMin(key: TierKey): number {
  const index = TIERS.findIndex((tier) => tier.key === key);
  return index > 0 ? TIERS[index - 1].min : 0;
}
