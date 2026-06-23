import { describe, it, expect } from "vitest";
import {
  progressFraction,
  isComplete,
  isClaimable,
  totalClaimable,
  isoWeek,
  periodKey,
  shouldReset,
  streakBonus,
  allComplete,
  type Challenge,
  type ChallengeProgress,
} from "@/lib/domain/challenges";

const ch = (id: string, period: Challenge["period"], goal: number, reward: number): Challenge => ({
  id,
  period,
  title: id,
  goal,
  reward,
});

describe("progressFraction", () => {
  it("should clamp between 0 and 1", () => {
    expect(progressFraction(ch("a", "daily", 3, 50), 0)).toBe(0);
    expect(progressFraction(ch("a", "daily", 3, 50), 2)).toBeCloseTo(2 / 3);
    expect(progressFraction(ch("a", "daily", 3, 50), 9)).toBe(1);
  });

  it("should treat a zero goal as already complete", () => {
    expect(progressFraction(ch("a", "daily", 0, 50), 0)).toBe(1);
  });
});

describe("isComplete / isClaimable", () => {
  const c = ch("a", "daily", 3, 50);

  it("should complete at or above the goal", () => {
    expect(isComplete(c, 3)).toBe(true);
    expect(isComplete(c, 2)).toBe(false);
  });

  it("should be claimable only when complete and unclaimed", () => {
    expect(isClaimable(c, { current: 3, claimed: false })).toBe(true);
    expect(isClaimable(c, { current: 3, claimed: true })).toBe(false);
    expect(isClaimable(c, { current: 1, claimed: false })).toBe(false);
  });
});

describe("totalClaimable", () => {
  it("should sum rewards of complete, unclaimed challenges only", () => {
    const challenges = [ch("a", "daily", 3, 50), ch("b", "daily", 2, 75), ch("c", "daily", 1, 100)];
    const progress: Record<string, ChallengeProgress> = {
      a: { current: 3, claimed: false }, // claimable: +50
      b: { current: 2, claimed: true }, // claimed: skip
      c: { current: 0, claimed: false }, // incomplete: skip
    };
    expect(totalClaimable(challenges, progress)).toBe(50);
  });

  it("should return 0 when nothing is claimable", () => {
    expect(totalClaimable([ch("a", "daily", 3, 50)], { a: { current: 0, claimed: false } })).toBe(0);
  });
});

describe("isoWeek", () => {
  it("should place 2026-01-01 in week 1 of 2026", () => {
    // 2026-01-01 is a Thursday → ISO week 1
    expect(isoWeek(new Date(2026, 0, 1))).toEqual({ year: 2026, week: 1 });
  });

  it("should assign the same week to days within one Mon–Sun span", () => {
    const mon = isoWeek(new Date(2026, 5, 22)); // Mon 2026-06-22
    const sun = isoWeek(new Date(2026, 5, 28)); // Sun 2026-06-28
    expect(mon).toEqual(sun);
  });
});

describe("periodKey / shouldReset", () => {
  it("should key daily by calendar date", () => {
    expect(periodKey("daily", new Date(2026, 5, 9))).toBe("2026-06-09");
  });

  it("should key monthly by year-month", () => {
    expect(periodKey("monthly", new Date(2026, 5, 30))).toBe("2026-06");
  });

  it("should detect a daily reset across midnight", () => {
    const key = periodKey("daily", new Date(2026, 5, 9));
    expect(shouldReset("daily", key, new Date(2026, 5, 9))).toBe(false);
    expect(shouldReset("daily", key, new Date(2026, 5, 10))).toBe(true);
  });

  it("should not reset monthly within the same month", () => {
    const key = periodKey("monthly", new Date(2026, 5, 1));
    expect(shouldReset("monthly", key, new Date(2026, 5, 28))).toBe(false);
  });
});

describe("streakBonus", () => {
  it("should match the spec values per period", () => {
    expect(streakBonus("daily")).toBe(500);
    expect(streakBonus("weekly")).toBe(2500);
    expect(streakBonus("monthly")).toBe(100000);
  });
});

describe("allComplete", () => {
  const challenges = [ch("a", "daily", 1, 10), ch("b", "daily", 2, 20)];

  it("should be true only when every challenge is complete", () => {
    expect(allComplete(challenges, { a: { current: 1, claimed: false }, b: { current: 2, claimed: false } })).toBe(true);
    expect(allComplete(challenges, { a: { current: 1, claimed: false }, b: { current: 1, claimed: false } })).toBe(false);
  });

  it("should be false when a challenge has no progress entry", () => {
    expect(allComplete(challenges, { a: { current: 1, claimed: false } })).toBe(false);
  });

  it("should be false for an empty challenge list", () => {
    expect(allComplete([], {})).toBe(false);
  });
});
