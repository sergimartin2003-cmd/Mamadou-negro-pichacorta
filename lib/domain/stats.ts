/**
 * Trading performance statistics and an anti-fake credibility model.
 * All functions are pure.
 */

import type { Profile } from "@/types/db";

const TRADING_DAYS_PER_YEAR = 252;

const MIN_LEADERBOARD_TRADES = 100;
const MIN_LEADERBOARD_CREDIBILITY = 50;

/** Win rate (0–1) and avg loss as a positive magnitude; negative loss is normalized. */
export function expectancy(winRate: number, avgWin: number, avgLoss: number): number {
  const loss = Math.abs(avgLoss);
  return winRate * avgWin - (1 - winRate) * loss;
}

/** Gross profit divided by gross loss. Returns Infinity when there are no losses. */
export function profitFactor(grossWin: number, grossLoss: number): number {
  const loss = Math.abs(grossLoss);
  if (loss === 0) return grossWin > 0 ? Number.POSITIVE_INFINITY : 0;
  return grossWin / loss;
}

/** Annualized Sharpe estimate from a series of per-period returns. */
export function sharpeEstimate(returns: number[]): number {
  if (returns.length < 2) return 0;
  const mean = returns.reduce((sum, r) => sum + r, 0) / returns.length;
  const variance =
    returns.reduce((sum, r) => sum + (r - mean) ** 2, 0) / (returns.length - 1);
  const stdDev = Math.sqrt(variance);
  if (stdDev === 0) return 0;
  return (mean / stdDev) * Math.sqrt(TRADING_DAYS_PER_YEAR);
}

/**
 * Consistency (0–100): rewards a healthy win rate and a profit factor above 1
 * while penalizing drawdown depth. Inputs use percentages where natural.
 */
export function consistencyScore(
  winRatePct: number,
  profitFactorValue: number,
  drawdownPct: number,
): number {
  const winComponent = clamp01(winRatePct / 100) * 40;
  const pfComponent = clamp01((profitFactorValue - 1) / 2) * 40;
  const ddComponent = (1 - clamp01(drawdownPct / 40)) * 20;
  return Math.round(clampScore(winComponent + pfComponent + ddComponent));
}

const VERIFIED_WEIGHT = 30;
const SAMPLE_WEIGHT = 25;
const SANITY_WEIGHT = 25;
const CONSISTENCY_WEIGHT = 20;
const SAMPLE_LOG_BASE = 2000;
const SUSPICIOUS_DD_PCT = 2;
const SUSPICIOUS_PNL_PCT = 150;

/**
 * Anti-fake credibility (0–100). Weights verified status, log-scaled trade
 * sample size, drawdown sanity (claiming <2% DD alongside very high PnL is
 * heavily penalized), and consistency.
 */
export function credibilityScore(p: Profile): number {
  const verified = p.verified ? VERIFIED_WEIGHT : 0;

  const sample = clamp01(Math.log10(1 + p.trades) / Math.log10(1 + SAMPLE_LOG_BASE)) * SAMPLE_WEIGHT;

  const sanity = drawdownSanity(p.dd, p.pnl) * SANITY_WEIGHT;

  const consistency = clamp01(p.consistency / 100) * CONSISTENCY_WEIGHT;

  return Math.round(clampScore(verified + sample + sanity + consistency));
}

export function isLeaderboardEligible(p: Profile): boolean {
  return (
    p.verified &&
    p.trades >= MIN_LEADERBOARD_TRADES &&
    credibilityScore(p) >= MIN_LEADERBOARD_CREDIBILITY
  );
}

/** 0–1 plausibility: implausibly low drawdown next to outsized PnL collapses the score. */
function drawdownSanity(drawdownPct: number, pnlPct: number): number {
  if (drawdownPct <= 0) return 0;
  if (drawdownPct < SUSPICIOUS_DD_PCT && pnlPct > SUSPICIOUS_PNL_PCT) {
    return 0.15;
  }
  return clamp01(drawdownPct / 10);
}

function clamp01(value: number): number {
  return Math.max(0, Math.min(1, value));
}

function clampScore(value: number): number {
  return Math.max(0, Math.min(100, value));
}
