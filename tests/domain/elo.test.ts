import { describe, it, expect } from "vitest";
import {
  expectedScore,
  kFactor,
  placementScore,
  computeRpChange,
  seasonalReset,
} from "@/lib/domain/elo";

describe("expectedScore", () => {
  it("should return exactly 0.5 when player and field RP are equal", () => {
    expect(expectedScore(1000, 1000)).toBe(0.5);
  });

  it("should return > 0.5 when player RP is higher than field", () => {
    expect(expectedScore(2000, 1000)).toBeGreaterThan(0.5);
  });

  it("should return < 0.5 when player RP is lower than field", () => {
    expect(expectedScore(1000, 2000)).toBeLessThan(0.5);
  });

  it("should be bounded between 0 and 1 (inclusive) for any inputs", () => {
    // NOTE: extreme gaps >= ~6400 RP cause 10^(-gap/400) to underflow to 0 in
    // float64, so expectedScore returns exactly 1 (or exactly 0 for the inverse).
    // This is correct IEEE 754 behavior, not a source bug.
    const pairs = [
      [0, 0],
      [0, 10000],
      [10000, 0],
      [1000, 1000],
      [500, 9000],
    ];
    pairs.forEach(([p, f]) => {
      const score = expectedScore(p, f);
      expect(score).toBeGreaterThanOrEqual(0);
      expect(score).toBeLessThanOrEqual(1);
    });
  });

  it("should return strictly between 0 and 1 for moderate RP gaps (< 6400 gap)", () => {
    // float64 underflow only occurs at RP gaps >= ~6400; these pairs are safe
    const pairs = [
      [1000, 6000],   // gap = 5000, well within safe zone
      [6000, 1000],   // gap = 5000
      [1000, 3000],   // gap = 2000
      [500, 500],     // gap = 0
    ];
    pairs.forEach(([p, f]) => {
      const score = expectedScore(p, f);
      expect(score).toBeGreaterThan(0);
      expect(score).toBeLessThan(1);
    });
  });

  it("should be symmetric: expectedScore(a,b) + expectedScore(b,a) === 1", () => {
    const a = expectedScore(1500, 1000);
    const b = expectedScore(1000, 1500);
    expect(a + b).toBeCloseTo(1, 10);
  });
});

describe("kFactor", () => {
  it("should return 32 at rp 0 (maximum volatility for low-rated players)", () => {
    expect(kFactor(0)).toBe(32);
  });

  it("should return 16 at rp 8000 (minimum volatility for elite players)", () => {
    expect(kFactor(8000)).toBe(16);
  });

  it("should return 24 at rp 4000 (linear midpoint)", () => {
    expect(kFactor(4000)).toBe(24);
  });

  it("should decrease as tier (rp) increases", () => {
    expect(kFactor(1000)).toBeGreaterThan(kFactor(3000));
    expect(kFactor(3000)).toBeGreaterThan(kFactor(6000));
    expect(kFactor(6000)).toBeGreaterThan(kFactor(8000));
  });

  it("should clamp at 32 for rp below 0", () => {
    expect(kFactor(-100)).toBe(32);
  });

  it("should clamp at 16 for rp above 8000", () => {
    expect(kFactor(9000)).toBe(16);
  });
});

describe("placementScore", () => {
  it("should return 1 for rank #1 in any field", () => {
    expect(placementScore(1, 10)).toBe(1);
    expect(placementScore(1, 100)).toBe(1);
  });

  it("should return 0 for last place", () => {
    expect(placementScore(10, 10)).toBe(0);
    expect(placementScore(5, 5)).toBe(0);
  });

  it("should return 1 when field size is 1", () => {
    expect(placementScore(1, 1)).toBe(1);
  });

  it("should return approximately 0.5 for median rank in an even field", () => {
    // rank 5 of 9: (9-5)/(9-1) = 4/8 = 0.5
    expect(placementScore(5, 9)).toBeCloseTo(0.5, 5);
  });

  it("should be bounded between 0 and 1", () => {
    [
      [1, 1],
      [1, 10],
      [5, 10],
      [10, 10],
    ].forEach(([rank, size]) => {
      const s = placementScore(rank, size);
      expect(s).toBeGreaterThanOrEqual(0);
      expect(s).toBeLessThanOrEqual(1);
    });
  });
});

describe("computeRpChange", () => {
  it("should return a positive integer when player finishes 1st with equal field", () => {
    const change = computeRpChange({ playerRp: 1000, fieldRp: 1000, rank: 1, fieldSize: 10 });
    expect(change).toBeGreaterThan(0);
    expect(Number.isInteger(change)).toBe(true);
  });

  it("should return a negative integer when player finishes last with equal field", () => {
    const change = computeRpChange({ playerRp: 1000, fieldRp: 1000, rank: 10, fieldSize: 10 });
    expect(change).toBeLessThan(0);
    expect(Number.isInteger(change)).toBe(true);
  });

  it("should return an integer (rounded value)", () => {
    const change = computeRpChange({ playerRp: 1500, fieldRp: 1200, rank: 3, fieldSize: 8 });
    expect(Number.isInteger(change)).toBe(true);
  });

  it("should be exactly 15 for rank #1 of 10 at equal RP 1000", () => {
    // kFactor(1000) = 32 - 16*(1000/8000) = 32 - 2 = 30
    // placementScore(1,10) = 1; expectedScore(1000,1000) = 0.5
    // delta = 30 * (1 - 0.5) = 15
    expect(computeRpChange({ playerRp: 1000, fieldRp: 1000, rank: 1, fieldSize: 10 })).toBe(15);
  });

  it("should be exactly -15 for rank #10 of 10 at equal RP 1000", () => {
    expect(computeRpChange({ playerRp: 1000, fieldRp: 1000, rank: 10, fieldSize: 10 })).toBe(-15);
  });

  it("should produce smaller absolute change for high-RP player vs low-RP player given same result", () => {
    const highRp = computeRpChange({ playerRp: 7000, fieldRp: 7000, rank: 1, fieldSize: 10 });
    const lowRp = computeRpChange({ playerRp: 500, fieldRp: 500, rank: 1, fieldSize: 10 });
    expect(Math.abs(highRp)).toBeLessThan(Math.abs(lowRp));
  });
});

describe("seasonalReset", () => {
  it("should compress 2000 RP toward 1000 anchor", () => {
    expect(seasonalReset(2000)).toBe(1600);
  });

  it("should compress 500 RP upward toward 1000 anchor", () => {
    expect(seasonalReset(500)).toBe(700);
  });

  it("should not change rp of exactly 1000 (at the anchor)", () => {
    expect(seasonalReset(1000)).toBe(1000);
  });

  it("should compress rp of 0 toward anchor (not go below 0)", () => {
    expect(seasonalReset(0)).toBe(400);
  });

  it("should never return a value below 0", () => {
    // Even if rp starts deeply negative (edge case)
    expect(seasonalReset(-5000)).toBeGreaterThanOrEqual(0);
  });

  it("should return an integer (rounded)", () => {
    expect(Number.isInteger(seasonalReset(1337))).toBe(true);
    expect(Number.isInteger(seasonalReset(2500))).toBe(true);
  });

  it("should produce a value closer to 1000 than the original rp (for rp !== 1000)", () => {
    const original = 5000;
    const reset = seasonalReset(original);
    expect(Math.abs(reset - 1000)).toBeLessThan(Math.abs(original - 1000));
  });
});
