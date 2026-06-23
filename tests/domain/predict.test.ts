import { describe, it, expect } from "vitest";
import {
  PREDICT_MODES,
  VISIBLE_HISTORY,
  seriesLength,
  generateSeries,
  candleDirection,
  isCorrect,
  computeXp,
  maxXp,
  nextStreak,
  rankScores,
  submitScore,
  type PredictScore,
} from "@/lib/domain/predict";

describe("seriesLength", () => {
  it("should equal visible history plus the mode's rounds", () => {
    expect(seriesLength("classic")).toBe(VISIBLE_HISTORY + 1);
    expect(seriesLength("turbo")).toBe(VISIBLE_HISTORY + 5);
    expect(seriesLength("extreme")).toBe(VISIBLE_HISTORY + 10);
  });
});

describe("generateSeries", () => {
  it("should be deterministic: same seed yields an identical series", () => {
    expect(generateSeries(42, 20)).toEqual(generateSeries(42, 20));
  });

  it("should produce different series for different seeds", () => {
    expect(generateSeries(1, 20)).not.toEqual(generateSeries(2, 20));
  });

  it("should return exactly `count` candles", () => {
    expect(generateSeries(7, 25)).toHaveLength(25);
    expect(generateSeries(7, 0)).toHaveLength(0);
  });

  it("should keep all prices strictly positive", () => {
    const series = generateSeries(123, 200);
    for (const c of series) {
      expect(c.lo).toBeGreaterThan(0);
      expect(c.o).toBeGreaterThan(0);
      expect(c.c).toBeGreaterThan(0);
      expect(c.hi).toBeGreaterThan(0);
    }
  });

  it("should keep high >= max(o,c) and low <= min(o,c) for every candle", () => {
    const series = generateSeries(99, 100);
    for (const c of series) {
      expect(c.hi).toBeGreaterThanOrEqual(Math.max(c.o, c.c));
      expect(c.lo).toBeLessThanOrEqual(Math.min(c.o, c.c));
    }
  });

  it("should open each candle at the previous candle's close", () => {
    const series = generateSeries(5, 30);
    for (let i = 1; i < series.length; i++) {
      expect(series[i].o).toBe(series[i - 1].c);
    }
  });
});

describe("candleDirection / isCorrect", () => {
  it("should classify a higher close as up", () => {
    expect(candleDirection({ o: 100, c: 105, hi: 106, lo: 99 })).toBe("up");
  });

  it("should classify a lower close as down", () => {
    expect(candleDirection({ o: 100, c: 95, hi: 101, lo: 94 })).toBe("down");
  });

  it("should treat a flat candle (close == open) as up", () => {
    expect(candleDirection({ o: 100, c: 100, hi: 101, lo: 99 })).toBe("up");
  });

  it("should agree with isCorrect for a matching guess", () => {
    const candle = { o: 100, c: 105, hi: 106, lo: 99 };
    expect(isCorrect("up", candle)).toBe(true);
    expect(isCorrect("down", candle)).toBe(false);
  });
});

describe("computeXp", () => {
  it("should pay base XP for a single correct guess in classic", () => {
    expect(computeXp("classic", 1)).toBe(10);
    expect(computeXp("classic", 0)).toBe(0);
  });

  it("should apply the turbo multiplier per correct guess", () => {
    // 10 base * 3x = 30 per correct
    expect(computeXp("turbo", 1)).toBe(30);
    expect(computeXp("turbo", 5)).toBe(150);
    expect(computeXp("turbo", 3)).toBe(90);
  });

  it("should pay extreme only on a flawless run (all-or-nothing)", () => {
    expect(computeXp("extreme", 10)).toBe(1000); // 10 * 10 base * 10x
    expect(computeXp("extreme", 9)).toBe(0);
    expect(computeXp("extreme", 0)).toBe(0);
  });

  it("should clamp correctCount to the mode's rounds", () => {
    expect(computeXp("classic", 99)).toBe(computeXp("classic", 1));
    expect(computeXp("turbo", 99)).toBe(maxXp("turbo"));
  });

  it("should clamp negative correctCount to zero", () => {
    expect(computeXp("turbo", -3)).toBe(0);
  });
});

describe("maxXp", () => {
  it("should equal a perfect run for each mode", () => {
    expect(maxXp("classic")).toBe(10);
    expect(maxXp("turbo")).toBe(150);
    expect(maxXp("extreme")).toBe(1000);
  });

  it("should match PREDICT_MODES config arithmetic", () => {
    for (const m of Object.values(PREDICT_MODES)) {
      expect(maxXp(m.key)).toBe(m.rounds * m.baseXp * m.multiplier);
    }
  });
});

describe("nextStreak", () => {
  it("should increment on a correct guess", () => {
    expect(nextStreak(0, true)).toBe(1);
    expect(nextStreak(4, true)).toBe(5);
  });

  it("should reset to zero on a miss", () => {
    expect(nextStreak(7, false)).toBe(0);
  });

  it("should normalize a negative or non-finite current value", () => {
    expect(nextStreak(-2, true)).toBe(1);
    expect(nextStreak(Number.NaN, false)).toBe(0);
  });
});

describe("rankScores", () => {
  const entries: PredictScore[] = [
    { handle: "a", name: "A", mode: "classic", score: 30, streak: 2 },
    { handle: "b", name: "B", mode: "turbo", score: 150, streak: 5 },
    { handle: "c", name: "C", mode: "turbo", score: 150, streak: 9 },
  ];

  it("should sort by score descending", () => {
    const ranked = rankScores(entries);
    expect(ranked[0].score).toBe(150);
    expect(ranked[ranked.length - 1].score).toBe(30);
  });

  it("should break score ties by the longer streak", () => {
    const ranked = rankScores(entries);
    expect(ranked[0].handle).toBe("c"); // streak 9 beats streak 5
    expect(ranked[1].handle).toBe("b");
  });

  it("should not mutate the input array", () => {
    const copy = [...entries];
    rankScores(entries);
    expect(entries).toEqual(copy);
  });
});

describe("submitScore", () => {
  const board: PredictScore[] = [
    { handle: "a", name: "A", mode: "turbo", score: 150, streak: 5 },
    { handle: "b", name: "B", mode: "classic", score: 10, streak: 1 },
  ];

  it("should insert a new score in ranked position", () => {
    const next = submitScore(board, {
      handle: "me",
      name: "Me",
      mode: "turbo",
      score: 90,
      streak: 3,
    });
    expect(next.map((e) => e.handle)).toEqual(["a", "me", "b"]);
  });

  it("should cap the board at the limit", () => {
    const next = submitScore(board, {
      handle: "me",
      name: "Me",
      mode: "extreme",
      score: 1000,
      streak: 10,
    }, 2);
    expect(next).toHaveLength(2);
    expect(next[0].handle).toBe("me");
  });

  it("should not mutate the input board", () => {
    const copy = [...board];
    submitScore(board, { handle: "x", name: "X", mode: "classic", score: 5, streak: 0 });
    expect(board).toEqual(copy);
  });
});
