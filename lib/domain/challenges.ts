/**
 * Daily / weekly / monthly challenges — pure logic for progress, completion,
 * period-reset detection and streak bonuses. All date math takes an injected
 * `Date` so it is deterministic and testable.
 */

export type ChallengePeriod = "daily" | "weekly" | "monthly";

export const CHALLENGE_PERIODS: readonly ChallengePeriod[] = ["daily", "weekly", "monthly"];

export interface Challenge {
  id: string;
  period: ChallengePeriod;
  title: string;
  /** Target count to complete the challenge. */
  goal: number;
  /** XP awarded on completion. */
  reward: number;
}

export interface ChallengeProgress {
  /** Current count toward the goal. */
  current: number;
  /** Whether the reward has already been claimed this period. */
  claimed: boolean;
}

/** 0–1 completion fraction, clamped. */
export function progressFraction(challenge: Challenge, current: number): number {
  if (challenge.goal <= 0) return 1;
  return Math.max(0, Math.min(1, current / challenge.goal));
}

export function isComplete(challenge: Challenge, current: number): boolean {
  return current >= challenge.goal;
}

/** Reward is claimable when complete and not yet claimed. */
export function isClaimable(challenge: Challenge, progress: ChallengeProgress): boolean {
  return isComplete(challenge, progress.current) && !progress.claimed;
}

/** Total XP currently claimable across a set of challenges. */
export function totalClaimable(
  challenges: readonly Challenge[],
  progress: Readonly<Record<string, ChallengeProgress>>,
): number {
  return challenges.reduce((sum, c) => {
    const p = progress[c.id];
    return p && isClaimable(c, p) ? sum + c.reward : sum;
  }, 0);
}

function pad2(n: number): string {
  return String(n).padStart(2, "0");
}

/** ISO-8601 week number (1–53) and its week-year for a date. */
export function isoWeek(date: Date): { year: number; week: number } {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const day = d.getUTCDay() || 7; // Mon=1..Sun=7
  d.setUTCDate(d.getUTCDate() + 4 - day); // shift to Thursday of this week
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const week = Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return { year: d.getUTCFullYear(), week };
}

/**
 * A stable key identifying the period a date falls in. When the key changes,
 * that period's challenges should reset.
 */
export function periodKey(period: ChallengePeriod, date: Date): string {
  switch (period) {
    case "daily":
      return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;
    case "weekly": {
      const { year, week } = isoWeek(date);
      return `${year}-W${pad2(week)}`;
    }
    case "monthly":
      return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}`;
  }
}

/** True when `date` is in a different period than `lastKey` was recorded for. */
export function shouldReset(period: ChallengePeriod, lastKey: string, date: Date): boolean {
  return periodKey(period, date) !== lastKey;
}

/**
 * Bonus XP for completing every challenge in a period across the next level up
 * (spec: all dailies in a week → 500, all weeklies in a month → 2500, all
 * monthlies in a year → 100000).
 */
export function streakBonus(period: ChallengePeriod): number {
  switch (period) {
    case "daily":
      return 500;
    case "weekly":
      return 2500;
    case "monthly":
      return 100000;
  }
}

/** True when every challenge in the list is complete. */
export function allComplete(
  challenges: readonly Challenge[],
  progress: Readonly<Record<string, ChallengeProgress>>,
): boolean {
  if (challenges.length === 0) return false;
  return challenges.every((c) => {
    const p = progress[c.id];
    return p != null && isComplete(c, p.current);
  });
}
