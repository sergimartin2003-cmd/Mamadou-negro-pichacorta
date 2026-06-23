import { describe, it, expect } from "vitest";
import {
  matchesFilter,
  screen,
  valuationScore,
  sortSecurities,
  sectors,
  type Security,
} from "@/lib/domain/screener";

const sec = (over: Partial<Security> = {}): Security => ({
  id: "x",
  name: "X",
  symbol: "X",
  sector: "Tech",
  price: 100,
  per: 18,
  pb: 3,
  roe: 0.2,
  dividendYield: 0.02,
  growth: 0.12,
  debtToEquity: 0.5,
  marketCap: 1_000_000_000,
  ...over,
});

describe("matchesFilter", () => {
  it("should pass when no constraints are set", () => {
    expect(matchesFilter(sec(), {})).toBe(true);
  });

  it("should enforce perMax and reject loss-makers", () => {
    expect(matchesFilter(sec({ per: 12 }), { perMax: 15 })).toBe(true);
    expect(matchesFilter(sec({ per: 20 }), { perMax: 15 })).toBe(false);
    expect(matchesFilter(sec({ per: -5 }), { perMax: 15 })).toBe(false); // negative PER fails
  });

  it("should enforce minimums", () => {
    expect(matchesFilter(sec({ roe: 0.25 }), { roeMin: 0.15 })).toBe(true);
    expect(matchesFilter(sec({ roe: 0.1 }), { roeMin: 0.15 })).toBe(false);
    expect(matchesFilter(sec({ growth: 0.05 }), { growthMin: 0.1 })).toBe(false);
    expect(matchesFilter(sec({ dividendYield: 0.01 }), { divYieldMin: 0.03 })).toBe(false);
  });

  it("should enforce maximums", () => {
    expect(matchesFilter(sec({ pb: 6 }), { pbMax: 5 })).toBe(false);
    expect(matchesFilter(sec({ debtToEquity: 2.5 }), { debtMax: 1 })).toBe(false);
  });

  it("should enforce sector", () => {
    expect(matchesFilter(sec({ sector: "Energy" }), { sector: "Tech" })).toBe(false);
    expect(matchesFilter(sec({ sector: "Tech" }), { sector: "Tech" })).toBe(true);
  });

  it("should require ALL constraints to pass", () => {
    expect(matchesFilter(sec({ per: 12, roe: 0.25 }), { perMax: 15, roeMin: 0.2 })).toBe(true);
    expect(matchesFilter(sec({ per: 12, roe: 0.1 }), { perMax: 15, roeMin: 0.2 })).toBe(false);
  });
});

describe("screen", () => {
  const list = [
    sec({ id: "a", per: 10, roe: 0.25 }),
    sec({ id: "b", per: 25, roe: 0.3 }),
    sec({ id: "c", per: 8, roe: 0.05 }),
  ];

  it("should return only matching securities", () => {
    const out = screen(list, { perMax: 15, roeMin: 0.2 });
    expect(out.map((s) => s.id)).toEqual(["a"]);
  });

  it("should not mutate the input", () => {
    const copy = [...list];
    screen(list, { perMax: 15 });
    expect(list).toEqual(copy);
  });
});

describe("valuationScore", () => {
  it("should return a 0–100 integer", () => {
    const v = valuationScore(sec());
    expect(Number.isInteger(v)).toBe(true);
    expect(v).toBeGreaterThanOrEqual(0);
    expect(v).toBeLessThanOrEqual(100);
  });

  it("should score a clearly better security higher", () => {
    const great = sec({ per: 9, pb: 1.2, roe: 0.3, growth: 0.25, dividendYield: 0.05, debtToEquity: 0.2 });
    const poor = sec({ per: 40, pb: 8, roe: 0.03, growth: 0.0, dividendYield: 0, debtToEquity: 3 });
    expect(valuationScore(great)).toBeGreaterThan(valuationScore(poor));
  });

  it("should give a loss-maker no valuation credit for PER", () => {
    const a = valuationScore(sec({ per: -10 }));
    const b = valuationScore(sec({ per: 10 }));
    expect(b).toBeGreaterThan(a);
  });
});

describe("sortSecurities", () => {
  const list = [sec({ id: "a", per: 25 }), sec({ id: "b", per: 8 }), sec({ id: "c", per: 15 })];

  it("should sort by score descending by default", () => {
    const out = sortSecurities(list);
    for (let i = 1; i < out.length; i++) {
      expect(valuationScore(out[i - 1])).toBeGreaterThanOrEqual(valuationScore(out[i]));
    }
  });

  it("should sort ascending by a chosen key", () => {
    const out = sortSecurities(list, "per", "asc");
    expect(out.map((s) => s.id)).toEqual(["b", "c", "a"]);
  });

  it("should not mutate the input", () => {
    const copy = [...list];
    sortSecurities(list, "per", "asc");
    expect(list).toEqual(copy);
  });
});

describe("sectors", () => {
  it("should list distinct sectors alphabetically", () => {
    const list = [sec({ sector: "Tech" }), sec({ sector: "Energy" }), sec({ sector: "Tech" })];
    expect(sectors(list)).toEqual(["Energy", "Tech"]);
  });
});
