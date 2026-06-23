/**
 * Tilt-Meter — behavioral risk monitor for the "mental firewall" feature.
 * Detects revenge-trading patterns (rapid fire, loss streaks, size escalation)
 * from a list of recent trades and produces a 0–100 tilt score. At 100 the
 * account is locked for a cooldown. All functions are pure and testable.
 *
 * Trades are described by `minutesAgo` (relative to "now"), so the logic is
 * fully deterministic and free of wall-clock dependencies.
 */

export type TradeResult = "win" | "loss";

export interface TiltTrade {
  id: string;
  /** Minutes since the trade was opened (0 = just now). */
  minutesAgo: number;
  result: TradeResult;
  /** Position size (any consistent unit). */
  size: number;
}

export const RAPID_WINDOW_MIN = 5;
export const LOCK_THRESHOLD = 100;
export const LOCK_DURATION_MIN = 120;

const W_RAPID = 40;
const W_STREAK = 30;
const W_REVENGE = 30;

function clamp01(v: number): number {
  return Math.max(0, Math.min(1, v));
}

/** Trades opened within the rapid-fire window (most recent activity burst). */
export function countInWindow(trades: readonly TiltTrade[], windowMin = RAPID_WINDOW_MIN): number {
  return trades.filter((t) => t.minutesAgo <= windowMin).length;
}

/** Most recent trades sorted newest-first by `minutesAgo`. */
function newestFirst(trades: readonly TiltTrade[]): TiltTrade[] {
  return [...trades].sort((a, b) => a.minutesAgo - b.minutesAgo);
}

/** Current streak of consecutive losses counting back from the latest trade. */
export function currentLossStreak(trades: readonly TiltTrade[]): number {
  let streak = 0;
  for (const t of newestFirst(trades)) {
    if (t.result === "loss") streak += 1;
    else break;
  }
  return streak;
}

/** Average position size across all trades (0 when empty). */
export function averageSize(trades: readonly TiltTrade[]): number {
  if (trades.length === 0) return 0;
  return trades.reduce((s, t) => s + t.size, 0) / trades.length;
}

/**
 * Largest "post-loss size ratio": for any trade opened immediately after a
 * losing trade, its size relative to that losing trade's size. >1 means the
 * trader upsized to chase the loss (a classic revenge signal). Returns 1 when
 * no post-loss trade exists.
 */
export function maxPostLossSizeRatio(trades: readonly TiltTrade[]): number {
  const ordered = newestFirst(trades);
  let max = 1;
  // ordered[i] is more recent than ordered[i+1]; a loss at i+1 is followed by i.
  for (let i = 0; i < ordered.length - 1; i++) {
    const prevLoss = ordered[i + 1];
    if (prevLoss.result === "loss" && prevLoss.size > 0) {
      max = Math.max(max, ordered[i].size / prevLoss.size);
    }
  }
  return max;
}

export interface TiltResult {
  score: number;
  rapid: number;
  streak: number;
  revenge: number;
  locked: boolean;
}

/**
 * Compute the tilt score (0–100) and its component contributions:
 * - rapid fire: trades crammed into the rapid window
 * - loss streak: consecutive recent losses
 * - revenge sizing: upsizing after a loss
 */
export function computeTilt(trades: readonly TiltTrade[]): TiltResult {
  const count = countInWindow(trades);
  const streakN = currentLossStreak(trades);
  const ratio = maxPostLossSizeRatio(trades);

  const rapid = Math.round(clamp01((count - 1) / 4) * W_RAPID);
  const streak = Math.round(clamp01(streakN / 4) * W_STREAK);
  const revenge = Math.round(clamp01((ratio - 1) / 2) * W_REVENGE);

  const score = Math.max(0, Math.min(100, rapid + streak + revenge));
  return { score, rapid, streak, revenge, locked: score >= LOCK_THRESHOLD };
}

export type TiltLevel = "calm" | "caution" | "danger" | "locked";

/** Qualitative band for a tilt score. */
export function tiltLevel(score: number): TiltLevel {
  if (score >= LOCK_THRESHOLD) return "locked";
  if (score >= 70) return "danger";
  if (score >= 40) return "caution";
  return "calm";
}

/** Minutes of cooldown remaining given when the lock started. Floored at 0. */
export function lockRemainingMin(lockedAtMinAgo: number, durationMin = LOCK_DURATION_MIN): number {
  return Math.max(0, Math.ceil(durationMin - lockedAtMinAgo));
}
