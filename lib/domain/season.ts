/**
 * Seasonal league framework on top of the RP ladder (see `tiers.ts`, `elo.ts`).
 * A season runs for a fixed window; at its close, players earn tier-based
 * rewards and their RP is softly reset toward the anchor for the next season.
 * All time math takes an injected `now` so it stays deterministic and testable.
 */

import type { TierKey } from "@/types/db";

export interface Season {
  id: string;
  /** Sequential season number (1, 2, 3, …). */
  number: number;
  /** Display name / theme, e.g. "Cyberpunk Trading". */
  name: string;
  /** ISO timestamps bounding the season. */
  startsAt: string;
  endsAt: string;
}

const MS_PER_DAY = 86_400_000;

/** Whole days remaining until the season ends (floored at 0). */
export function daysRemaining(season: Season, now: Date = new Date()): number {
  const end = new Date(season.endsAt).getTime();
  const diff = end - now.getTime();
  if (diff <= 0) return 0;
  return Math.ceil(diff / MS_PER_DAY);
}

/** Season elapsed progress as 0–100, clamped. */
export function seasonProgress(season: Season, now: Date = new Date()): number {
  const start = new Date(season.startsAt).getTime();
  const end = new Date(season.endsAt).getTime();
  const span = end - start;
  if (span <= 0) return 100;
  const pct = ((now.getTime() - start) / span) * 100;
  return Math.max(0, Math.min(100, pct));
}

export function hasEnded(season: Season, now: Date = new Date()): boolean {
  return now.getTime() >= new Date(season.endsAt).getTime();
}

export interface SeasonReward {
  /** XP granted at season end for finishing in this tier. */
  xp: number;
  /** Cosmetic / loot description. */
  loot: string;
}

/** End-of-season rewards by final tier — strictly increasing in XP up the ladder. */
export const SEASON_REWARDS: Readonly<Record<TierKey, SeasonReward>> = {
  bronze: { xp: 500, loot: "Marco de perfil Bronce" },
  silver: { xp: 1200, loot: "Marco de perfil Plata + emote" },
  gold: { xp: 3000, loot: "Marco Oro + skin de temporada" },
  platinum: { xp: 6000, loot: "Marco Platino + 2 emotes" },
  diamond: { xp: 12000, loot: "Marco Diamante + mascota rara" },
  master: { xp: 25000, loot: "Marco Maestro + skin legendaria" },
  elite: { xp: 60000, loot: "Marco Élite animado + NFT conmemorativo" },
};

export function rewardFor(tier: TierKey): SeasonReward {
  return SEASON_REWARDS[tier];
}
