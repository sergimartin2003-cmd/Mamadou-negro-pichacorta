import { describe, it, expect } from "vitest";
import {
  marketValue,
  costBasis,
  unrealizedPnl,
  unrealizedPnlPct,
  totalValue,
  totalCost,
  totalUnrealizedPnl,
  totalReturnPct,
  weightPct,
  allocationByType,
  allocationByRegion,
  concentration,
  diversificationScore,
  topMovers,
  type Holding,
} from "@/lib/domain/portfolio";

const h = (
  id: string,
  type: Holding["type"],
  region: string,
  quantity: number,
  avgCost: number,
  price: number,
): Holding => ({ id, name: id, symbol: id.toUpperCase(), type, region, quantity, avgCost, price });

const portfolio: Holding[] = [
  h("a", "stock", "US", 10, 100, 150), // value 1500, cost 1000, pnl +500
  h("b", "crypto", "Global", 2, 1000, 800), // value 1600, cost 2000, pnl -400
  h("c", "etf", "EU", 5, 80, 100), // value 500, cost 400, pnl +100
  h("d", "cash", "US", 400, 1, 1), // value 400, cost 400, pnl 0
];

describe("per-holding metrics", () => {
  it("should compute market value and cost basis", () => {
    expect(marketValue(portfolio[0])).toBe(1500);
    expect(costBasis(portfolio[0])).toBe(1000);
  });

  it("should compute unrealized P&L and percentage", () => {
    expect(unrealizedPnl(portfolio[0])).toBe(500);
    expect(unrealizedPnlPct(portfolio[0])).toBeCloseTo(0.5);
    expect(unrealizedPnl(portfolio[1])).toBe(-400);
    expect(unrealizedPnlPct(portfolio[1])).toBeCloseTo(-0.2);
  });

  it("should return 0 pct when cost basis is zero", () => {
    expect(unrealizedPnlPct(h("z", "stock", "US", 0, 0, 10))).toBe(0);
  });
});

describe("portfolio totals", () => {
  it("should sum value and cost", () => {
    expect(totalValue(portfolio)).toBe(4000); // 1500+1600+500+400
    expect(totalCost(portfolio)).toBe(3800); // 1000+2000+400+400
  });

  it("should compute total unrealized P&L and return", () => {
    expect(totalUnrealizedPnl(portfolio)).toBe(200);
    expect(totalReturnPct(portfolio)).toBeCloseTo(200 / 3800);
  });
});

describe("weightPct", () => {
  it("should compute a weight", () => {
    expect(weightPct(1500, 4000)).toBeCloseTo(0.375);
  });
  it("should be 0 for a non-positive total", () => {
    expect(weightPct(100, 0)).toBe(0);
  });
});

describe("allocation", () => {
  it("should group by type with weights summing to 1", () => {
    const alloc = allocationByType(portfolio);
    const sum = alloc.reduce((s, a) => s + a.pct, 0);
    expect(sum).toBeCloseTo(1);
    // crypto is the largest by value (1600)
    expect(alloc[0].key).toBe("crypto");
    expect(alloc[0].value).toBe(1600);
  });

  it("should group by region and combine same-region holdings", () => {
    const alloc = allocationByRegion(portfolio);
    const us = alloc.find((a) => a.key === "US");
    expect(us?.value).toBe(1900); // 1500 (a) + 400 (d)
  });

  it("should be sorted by value descending", () => {
    const alloc = allocationByType(portfolio);
    for (let i = 1; i < alloc.length; i++) {
      expect(alloc[i - 1].value).toBeGreaterThanOrEqual(alloc[i].value);
    }
  });
});

describe("concentration", () => {
  it("should return the largest single-asset weight", () => {
    expect(concentration(portfolio)).toBeCloseTo(1600 / 4000); // 0.4
  });
  it("should be 0 for an empty portfolio", () => {
    expect(concentration([])).toBe(0);
  });
});

describe("diversificationScore", () => {
  it("should be 0 for a single holding", () => {
    expect(diversificationScore([h("solo", "stock", "US", 1, 10, 10)])).toBeCloseTo(0);
  });

  it("should be higher for evenly spread holdings than concentrated ones", () => {
    const even = [
      h("e1", "stock", "US", 1, 1, 100),
      h("e2", "etf", "EU", 1, 1, 100),
      h("e3", "bond", "EU", 1, 1, 100),
      h("e4", "cash", "US", 1, 1, 100),
    ];
    const concentrated = [
      h("c1", "stock", "US", 1, 1, 970),
      h("c2", "etf", "EU", 1, 1, 10),
      h("c3", "bond", "EU", 1, 1, 10),
      h("c4", "cash", "US", 1, 1, 10),
    ];
    expect(diversificationScore(even)).toBeGreaterThan(diversificationScore(concentrated));
  });

  it("should be 0 for an empty portfolio", () => {
    expect(diversificationScore([])).toBe(0);
  });
});

describe("topMovers", () => {
  it("should sort by return % descending and cap at n", () => {
    const top = topMovers(portfolio, 2);
    expect(top[0].id).toBe("a"); // +50%
    expect(top).toHaveLength(2);
  });

  it("should not mutate the input", () => {
    const copy = [...portfolio];
    topMovers(portfolio, 2);
    expect(portfolio).toEqual(copy);
  });
});
