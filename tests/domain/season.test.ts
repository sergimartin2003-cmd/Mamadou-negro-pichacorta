import { describe, it, expect } from "vitest";
import {
  daysRemaining,
  seasonProgress,
  hasEnded,
  rewardFor,
  SEASON_REWARDS,
  type Season,
} from "@/lib/domain/season";
import { TIERS } from "@/lib/domain/tiers";

const season: Season = {
  id: "s1",
  number: 1,
  name: "Cyberpunk Trading",
  startsAt: "2026-04-01T00:00:00.000Z",
  endsAt: "2026-07-01T00:00:00.000Z",
};

describe("daysRemaining", () => {
  it("should count whole days until the end", () => {
    expect(daysRemaining(season, new Date("2026-06-24T00:00:00.000Z"))).toBe(7);
  });

  it("should floor at 0 once the season has ended", () => {
    expect(daysRemaining(season, new Date("2026-07-02T00:00:00.000Z"))).toBe(0);
    expect(daysRemaining(season, new Date("2026-07-01T00:00:00.000Z"))).toBe(0);
  });
});

describe("seasonProgress", () => {
  it("should be 0 at the start and 100 at the end", () => {
    expect(seasonProgress(season, new Date("2026-04-01T00:00:00.000Z"))).toBe(0);
    expect(seasonProgress(season, new Date("2026-07-01T00:00:00.000Z"))).toBe(100);
  });

  it("should be ~50 at the midpoint", () => {
    const mid = seasonProgress(season, new Date("2026-05-16T00:00:00.000Z"));
    expect(mid).toBeGreaterThan(45);
    expect(mid).toBeLessThan(55);
  });

  it("should clamp before start and after end", () => {
    expect(seasonProgress(season, new Date("2026-01-01T00:00:00.000Z"))).toBe(0);
    expect(seasonProgress(season, new Date("2027-01-01T00:00:00.000Z"))).toBe(100);
  });
});

describe("hasEnded", () => {
  it("should reflect the end boundary", () => {
    expect(hasEnded(season, new Date("2026-06-30T00:00:00.000Z"))).toBe(false);
    expect(hasEnded(season, new Date("2026-07-01T00:00:00.000Z"))).toBe(true);
  });
});

describe("rewardFor / SEASON_REWARDS", () => {
  it("should provide a reward for every tier", () => {
    for (const tier of TIERS) {
      const r = rewardFor(tier.key);
      expect(r.xp).toBeGreaterThan(0);
      expect(r.loot.length).toBeGreaterThan(0);
    }
  });

  it("should grant strictly increasing XP up the ladder", () => {
    const xps = TIERS.map((t) => SEASON_REWARDS[t.key].xp);
    for (let i = 1; i < xps.length; i++) {
      expect(xps[i]).toBeGreaterThan(xps[i - 1]);
    }
  });
});
