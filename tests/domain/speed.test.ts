import { describe, it, expect } from "vitest";
import {
  WIN_POINTS,
  LOSS_POINTS,
  INITIAL_SPEED_STATE,
  POWERUP_KINDS,
  tradeDelta,
  applyTrade,
  accuracy,
  powerupSchedule,
  rankSpeedScores,
  submitSpeedScore,
  type SpeedScore,
} from "@/lib/domain/speed";

describe("tradeDelta", () => {
  it("should award WIN_POINTS for a correct trade", () => {
    expect(tradeDelta(true)).toBe(WIN_POINTS);
  });

  it("should subtract LOSS_POINTS for a wrong trade", () => {
    expect(tradeDelta(false)).toBe(LOSS_POINTS);
  });

  it("should apply a multiplier to wins but not to losses", () => {
    expect(tradeDelta(true, 2)).toBe(WIN_POINTS * 2);
    expect(tradeDelta(false, 2)).toBe(LOSS_POINTS);
  });

  it("should ignore non-positive or non-finite multipliers", () => {
    expect(tradeDelta(true, 0)).toBe(WIN_POINTS);
    expect(tradeDelta(true, -3)).toBe(WIN_POINTS);
    expect(tradeDelta(true, Number.NaN)).toBe(WIN_POINTS);
  });
});

describe("applyTrade", () => {
  it("should increment trades and wins on a correct trade", () => {
    const next = applyTrade(INITIAL_SPEED_STATE, true);
    expect(next).toEqual({ score: 100, trades: 1, wins: 1 });
  });

  it("should increment only trades on a wrong trade", () => {
    const next = applyTrade({ score: 100, trades: 1, wins: 1 }, false);
    expect(next).toEqual({ score: 50, trades: 2, wins: 1 });
  });

  it("should floor the score at zero", () => {
    const next = applyTrade(INITIAL_SPEED_STATE, false);
    expect(next.score).toBe(0);
    expect(next.trades).toBe(1);
  });

  it("should not mutate the input state", () => {
    const state = { score: 100, trades: 1, wins: 1 };
    applyTrade(state, true);
    expect(state).toEqual({ score: 100, trades: 1, wins: 1 });
  });
});

describe("accuracy", () => {
  it("should return 0 for zero trades", () => {
    expect(accuracy(0, 0)).toBe(0);
  });

  it("should compute the win fraction", () => {
    expect(accuracy(3, 4)).toBe(0.75);
    expect(accuracy(5, 5)).toBe(1);
  });

  it("should stay within [0,1]", () => {
    expect(accuracy(10, 5)).toBe(1);
    expect(accuracy(-2, 5)).toBe(0);
  });
});

describe("powerupSchedule", () => {
  it("should be deterministic for a given seed", () => {
    expect(powerupSchedule(7)).toEqual(powerupSchedule(7));
  });

  it("should only spawn within the run window and at increasing times", () => {
    const spawns = powerupSchedule(3, 60, 8);
    expect(spawns.length).toBeGreaterThan(0);
    let prev = 0;
    for (const s of spawns) {
      expect(s.at).toBeGreaterThan(0);
      expect(s.at).toBeLessThan(60);
      expect(s.at).toBeGreaterThan(prev);
      prev = s.at;
    }
  });

  it("should only use known power-up kinds", () => {
    for (const s of powerupSchedule(99)) {
      expect(POWERUP_KINDS).toContain(s.kind);
    }
  });
});

describe("rankSpeedScores / submitSpeedScore", () => {
  const board: SpeedScore[] = [
    { handle: "a", name: "A", score: 800, trades: 12, accuracy: 0.66 },
    { handle: "b", name: "B", score: 800, trades: 10, accuracy: 0.8 },
    { handle: "c", name: "C", score: 400, trades: 6, accuracy: 0.5 },
  ];

  it("should break score ties by accuracy", () => {
    const ranked = rankSpeedScores(board);
    expect(ranked[0].handle).toBe("b");
    expect(ranked[1].handle).toBe("a");
  });

  it("should insert and cap at the limit", () => {
    const next = submitSpeedScore(board, { handle: "me", name: "Me", score: 1000, trades: 11, accuracy: 0.9 }, 2);
    expect(next).toHaveLength(2);
    expect(next[0].handle).toBe("me");
  });

  it("should not mutate the input board", () => {
    const copy = [...board];
    submitSpeedScore(board, { handle: "x", name: "X", score: 1, trades: 1, accuracy: 1 });
    expect(board).toEqual(copy);
  });
});
