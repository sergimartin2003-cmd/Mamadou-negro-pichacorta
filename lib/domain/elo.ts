/**
 * Competitive rating math for TradeHub seasons.
 * Elo-derived: a trader's RP moves based on how their competition placement
 * compares to the result expected from their rating versus the field.
 * All functions are pure.
 */

const ELO_DIVISOR = 400;
const K_LOW = 32;
const K_HIGH = 16;
const ELITE_RP = 8000;
const SEASON_ANCHOR = 1000;
const SEASON_RETENTION = 0.6;

/**
 * Expected score (0–1) for a player rated `playerRp` against an average field
 * rating `fieldRp`. Formula: 1 / (1 + 10^((fieldRp - playerRp) / 400)).
 */
export function expectedScore(playerRp: number, fieldRp: number): number {
  return 1 / (1 + 10 ** ((fieldRp - playerRp) / ELO_DIVISOR));
}

/**
 * K-factor: rating volatility. Lower tiers swing more (32); it eases linearly
 * to 16 at Elite (8000 RP) so high-rated players are harder to dislodge.
 */
export function kFactor(rp: number): number {
  const t = Math.max(0, Math.min(1, rp / ELITE_RP));
  return K_LOW + (K_HIGH - K_LOW) * t;
}

/**
 * Normalized placement score (1.0 for 1st → 0.0 for last), smoothly
 * distributed across the field. A field of one returns a perfect 1.0.
 */
export function placementScore(rank: number, fieldSize: number): number {
  if (fieldSize <= 1) return 1;
  const clampedRank = Math.max(1, Math.min(fieldSize, rank));
  return (fieldSize - clampedRank) / (fieldSize - 1);
}

export interface RpChangeInput {
  playerRp: number;
  fieldRp: number;
  rank: number;
  fieldSize: number;
}

/**
 * RP delta after a competition. delta = K * (actual - expected), where
 * `actual` is the placement score and `expected` is the Elo expectation.
 * Returns a rounded integer.
 */
export function computeRpChange({ playerRp, fieldRp, rank, fieldSize }: RpChangeInput): number {
  const expected = expectedScore(playerRp, fieldRp);
  const actual = placementScore(rank, fieldSize);
  const delta = kFactor(playerRp) * (actual - expected);
  return Math.round(delta);
}

/**
 * Soft seasonal reset, pulling ratings toward the 1000 anchor while retaining
 * 60% of the distance above/below it. Floored at 0.
 * Formula: 1000 + (rp - 1000) * 0.6.
 */
export function seasonalReset(rp: number): number {
  const reset = SEASON_ANCHOR + (rp - SEASON_ANCHOR) * SEASON_RETENTION;
  return Math.max(0, Math.round(reset));
}
