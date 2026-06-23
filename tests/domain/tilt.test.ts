import { describe, it, expect } from "vitest";
import {
  countInWindow,
  currentLossStreak,
  averageSize,
  maxPostLossSizeRatio,
  computeTilt,
  tiltLevel,
  lockRemainingMin,
  LOCK_THRESHOLD,
  type TiltTrade,
} from "@/lib/domain/tilt";

const tr = (id: string, minutesAgo: number, result: TiltTrade["result"], size = 100): TiltTrade => ({
  id,
  minutesAgo,
  result,
  size,
});

describe("countInWindow", () => {
  it("should count trades within the window", () => {
    const trades = [tr("a", 1, "loss"), tr("b", 3, "loss"), tr("c", 9, "win")];
    expect(countInWindow(trades, 5)).toBe(2);
  });
});

describe("currentLossStreak", () => {
  it("should count consecutive recent losses", () => {
    const trades = [tr("a", 1, "loss"), tr("b", 2, "loss"), tr("c", 3, "win"), tr("d", 4, "loss")];
    expect(currentLossStreak(trades)).toBe(2);
  });
  it("should be 0 when the latest trade is a win", () => {
    expect(currentLossStreak([tr("a", 1, "win"), tr("b", 2, "loss")])).toBe(0);
  });
  it("should handle unsorted input", () => {
    const trades = [tr("c", 3, "win"), tr("a", 1, "loss"), tr("b", 2, "loss")];
    expect(currentLossStreak(trades)).toBe(2);
  });
});

describe("averageSize / maxPostLossSizeRatio", () => {
  it("should compute average size", () => {
    expect(averageSize([tr("a", 1, "win", 100), tr("b", 2, "win", 300)])).toBe(200);
  });
  it("should detect upsizing after a loss vs. the losing trade's size", () => {
    // newest-first: a(size 300) follows b(loss, size 100) → ratio 3
    const trades = [tr("a", 1, "win", 300), tr("b", 2, "loss", 100)];
    expect(maxPostLossSizeRatio(trades)).toBeCloseTo(3);
  });
  it("should return 1 when no trade follows a loss", () => {
    expect(maxPostLossSizeRatio([tr("a", 1, "win", 100), tr("b", 2, "win", 100)])).toBe(1);
  });
  it("should return 1 for empty trades", () => {
    expect(maxPostLossSizeRatio([])).toBe(1);
  });
});

describe("computeTilt", () => {
  it("should be calm for a single winning trade", () => {
    const r = computeTilt([tr("a", 2, "win", 100)]);
    expect(r.score).toBe(0);
    expect(r.locked).toBe(false);
  });

  it("should rise with rapid fire + loss streak + revenge sizing", () => {
    const calm = computeTilt([tr("a", 30, "loss", 100)]);
    const tilted = computeTilt([
      tr("a", 1, "loss", 300),
      tr("b", 2, "loss", 100),
      tr("c", 3, "loss", 100),
      tr("d", 4, "loss", 100),
    ]);
    expect(tilted.score).toBeGreaterThan(calm.score);
  });

  it("should lock at the maximum when fully tilted", () => {
    // 5 rapid trades, 5-loss streak, 3x size after a loss
    const trades: TiltTrade[] = [
      tr("a", 1, "loss", 300),
      tr("b", 2, "loss", 100),
      tr("c", 3, "loss", 100),
      tr("d", 4, "loss", 100),
      tr("e", 5, "loss", 100),
    ];
    const r = computeTilt(trades);
    expect(r.score).toBe(100);
    expect(r.locked).toBe(true);
  });

  it("should keep the score within 0–100 and components within their caps", () => {
    const r = computeTilt([
      tr("a", 0, "loss", 1000),
      tr("b", 1, "loss", 50),
      tr("c", 2, "loss", 50),
      tr("d", 3, "loss", 50),
      tr("e", 4, "loss", 50),
      tr("f", 4, "loss", 50),
    ]);
    expect(r.score).toBeGreaterThanOrEqual(0);
    expect(r.score).toBeLessThanOrEqual(100);
    expect(r.rapid).toBeLessThanOrEqual(40);
    expect(r.streak).toBeLessThanOrEqual(30);
    expect(r.revenge).toBeLessThanOrEqual(30);
  });
});

describe("tiltLevel", () => {
  it("should band scores", () => {
    expect(tiltLevel(10)).toBe("calm");
    expect(tiltLevel(50)).toBe("caution");
    expect(tiltLevel(80)).toBe("danger");
    expect(tiltLevel(LOCK_THRESHOLD)).toBe("locked");
  });
});

describe("lockRemainingMin", () => {
  it("should count down from the duration", () => {
    expect(lockRemainingMin(0, 120)).toBe(120);
    expect(lockRemainingMin(90, 120)).toBe(30);
  });
  it("should floor at 0 once elapsed", () => {
    expect(lockRemainingMin(130, 120)).toBe(0);
  });
});
