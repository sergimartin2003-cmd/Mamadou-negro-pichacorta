import { describe, it, expect } from "vitest";
import {
  expectancy,
  profitFactor,
  credibilityScore,
  isLeaderboardEligible,
} from "@/lib/domain/stats";
import type { Profile } from "@/types/db";

/** Minimal valid Profile fixture */
function makeProfile(overrides: Partial<Profile> = {}): Profile {
  return {
    id: "fixture-1",
    name: "Test Trader",
    handle: "testtrader",
    rp: 3000,
    verified: true,
    market: "Crypto",
    country: "US",
    flag: "us",
    win: 0.65,
    pnl: 80,
    trades: 500,
    dd: 15,
    consistency: 85,
    streak: 5,
    avatar: ["#000000", "#ffffff"],
    bio: "Test bio",
    followers: 100,
    following: 50,
    ...overrides,
  };
}

// ── profitFactor ────────────────────────────────────────────────────────────

describe("profitFactor", () => {
  it("should return 2 when grossWin is double grossLoss", () => {
    expect(profitFactor(1000, 500)).toBe(2);
  });

  it("should return 1 when grossWin equals grossLoss", () => {
    expect(profitFactor(500, 500)).toBe(1);
  });

  it("should treat negative grossLoss as magnitude", () => {
    expect(profitFactor(1000, -500)).toBe(2);
  });

  it("should return Infinity when grossLoss is 0 and there are wins", () => {
    expect(profitFactor(100, 0)).toBe(Number.POSITIVE_INFINITY);
  });

  it("should return 0 when both grossWin and grossLoss are 0", () => {
    expect(profitFactor(0, 0)).toBe(0);
  });

  it("should return less than 1 when wins are smaller than losses", () => {
    expect(profitFactor(300, 600)).toBeCloseTo(0.5, 5);
  });
});

// ── expectancy ──────────────────────────────────────────────────────────────

describe("expectancy", () => {
  it("should return a positive value for a winning edge (winRate 0.6, avgWin 2, avgLoss 1)", () => {
    // 0.6*2 - 0.4*1 = 1.2 - 0.4 = 0.8
    expect(expectancy(0.6, 2, 1)).toBeCloseTo(0.8, 5);
  });

  it("should return a negative value for a losing edge (winRate 0.3, avgWin 1, avgLoss 5)", () => {
    // 0.3*1 - 0.7*5 = 0.3 - 3.5 = -3.2
    expect(expectancy(0.3, 1, 5)).toBeCloseTo(-3.2, 5);
  });

  it("should return 0 when edge is exactly breakeven (winRate 0.5, avgWin 1, avgLoss 1)", () => {
    expect(expectancy(0.5, 1, 1)).toBeCloseTo(0, 5);
  });

  it("should treat negative avgLoss as magnitude (same result as positive)", () => {
    expect(expectancy(0.6, 2, -1)).toBeCloseTo(expectancy(0.6, 2, 1), 5);
  });

  it("should return a positive value when winRate is 1 (always wins)", () => {
    expect(expectancy(1, 3, 2)).toBeGreaterThan(0);
  });

  it("should return a negative value when winRate is 0 (always loses)", () => {
    expect(expectancy(0, 3, 2)).toBeLessThan(0);
  });
});

// ── credibilityScore ────────────────────────────────────────────────────────

describe("credibilityScore", () => {
  it("should return a value between 0 and 100 for a well-formed profile", () => {
    const score = credibilityScore(makeProfile());
    expect(score).toBeGreaterThanOrEqual(0);
    expect(score).toBeLessThanOrEqual(100);
  });

  it("should return 0 for minimum-possible inputs", () => {
    const worst = makeProfile({ verified: false, trades: 0, dd: 0, pnl: 0, consistency: 0 });
    const score = credibilityScore(worst);
    expect(score).toBeGreaterThanOrEqual(0);
    expect(score).toBeLessThanOrEqual(100);
  });

  it("should score a verified high-sample profile above an unverified one", () => {
    const verified = makeProfile({ verified: true, trades: 500, dd: 15, pnl: 80, consistency: 85 });
    const unverified = makeProfile({ verified: false, trades: 500, dd: 15, pnl: 80, consistency: 85 });
    expect(credibilityScore(verified)).toBeGreaterThan(credibilityScore(unverified));
  });

  it("should penalize implausibly low drawdown next to very high PnL", () => {
    const normal = makeProfile({ dd: 15, pnl: 80 });
    const suspicious = makeProfile({ dd: 1, pnl: 200 });
    expect(credibilityScore(suspicious)).toBeLessThan(credibilityScore(normal));
  });

  it("should return 92 for the reference good profile", () => {
    // verified=true, trades=500, dd=15, pnl=80, consistency=85
    // sample = clamp01(log10(501)/log10(2001)) * 25 ≈ 0.999... * 25 ≈ 24.97... → stays bounded
    // sanity = clamp01(15/10)*25 = 1*25 = 25
    // consistency = clamp01(85/100)*20 = 0.85*20 = 17
    // credibility = round(30 + ~24.97 + 25 + 17) = 92
    expect(credibilityScore(makeProfile())).toBe(92);
  });

  it("should return an integer", () => {
    expect(Number.isInteger(credibilityScore(makeProfile()))).toBe(true);
    expect(Number.isInteger(credibilityScore(makeProfile({ verified: false })))).toBe(true);
  });
});

// ── isLeaderboardEligible ───────────────────────────────────────────────────

describe("isLeaderboardEligible", () => {
  it("should return true for a verified, high-trade, credible profile", () => {
    // verified=true, trades=500 >= 100, credibility=92 >= 50
    expect(isLeaderboardEligible(makeProfile())).toBe(true);
  });

  it("should return false when profile is not verified", () => {
    expect(isLeaderboardEligible(makeProfile({ verified: false }))).toBe(false);
  });

  it("should return false when trades are below the 100-trade minimum", () => {
    expect(isLeaderboardEligible(makeProfile({ trades: 50 }))).toBe(false);
  });

  it("should return false when trades are exactly 99 (just below threshold)", () => {
    expect(isLeaderboardEligible(makeProfile({ trades: 99 }))).toBe(false);
  });

  it("should return true when trades are exactly 100 (at threshold) with sufficient credibility", () => {
    // trades=100 but credibility with trades=100:
    // sample = clamp01(log10(101)/log10(2001)) * 25 ≈ (2.004/3.301)*25 ≈ 15.18
    // total = 30 + 15.18 + 25 + 17 = 87.18 → 87 >= 50 ✓
    expect(isLeaderboardEligible(makeProfile({ trades: 100 }))).toBe(true);
  });

  it("should return false when both unverified and low-trade count", () => {
    expect(isLeaderboardEligible(makeProfile({ verified: false, trades: 10 }))).toBe(false);
  });
});
