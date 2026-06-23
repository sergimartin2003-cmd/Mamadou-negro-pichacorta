import { describe, it, expect } from "vitest";
import {
  grossProfit,
  netProfit,
  profitMargin,
  grossMarginFraction,
  averageOrderValue,
  refundRate,
  cac,
  roas,
  breakEvenRoas,
  supplierScore,
  rankSuppliers,
  buildDropshipAlerts,
  type DropshipStats,
  type Supplier,
} from "@/lib/domain/dropship";

const stats = (over: Partial<DropshipStats> = {}): DropshipStats => ({
  revenue: 10000,
  cogs: 4000,
  adSpend: 3000,
  otherCosts: 500,
  orders: 250,
  refunds: 10,
  newCustomers: 200,
  ...over,
});

describe("profit metrics", () => {
  it("should compute gross profit", () => {
    expect(grossProfit(10000, 4000)).toBe(6000);
  });
  it("should compute net profit", () => {
    expect(netProfit(stats())).toBe(2500); // 10000-4000-3000-500
  });
  it("should compute profit margin", () => {
    expect(profitMargin(stats())).toBeCloseTo(0.25);
  });
  it("should return 0 margin with no revenue", () => {
    expect(profitMargin(stats({ revenue: 0 }))).toBe(0);
  });
  it("should compute gross margin fraction", () => {
    expect(grossMarginFraction(10000, 4000)).toBeCloseTo(0.6);
    expect(grossMarginFraction(0, 100)).toBe(0);
  });
});

describe("order metrics", () => {
  it("should compute AOV", () => {
    expect(averageOrderValue(10000, 250)).toBe(40);
    expect(averageOrderValue(10000, 0)).toBe(0);
  });
  it("should compute refund rate clamped", () => {
    expect(refundRate(10, 250)).toBeCloseTo(0.04);
    expect(refundRate(300, 250)).toBe(1);
    expect(refundRate(1, 0)).toBe(0);
  });
  it("should compute CAC", () => {
    expect(cac(3000, 200)).toBe(15);
    expect(cac(3000, 0)).toBe(0);
  });
});

describe("roas / breakEvenRoas", () => {
  it("should compute ROAS", () => {
    expect(roas(10000, 3000)).toBeCloseTo(3.333, 2);
  });
  it("should be Infinity with no ad spend", () => {
    expect(roas(10000, 0)).toBe(Number.POSITIVE_INFINITY);
  });
  it("should compute break-even ROAS as 1/margin", () => {
    expect(breakEvenRoas(0.5)).toBe(2);
    expect(breakEvenRoas(0.25)).toBe(4);
  });
  it("should be Infinity for non-positive margin", () => {
    expect(breakEvenRoas(0)).toBe(Number.POSITIVE_INFINITY);
    expect(breakEvenRoas(-0.1)).toBe(Number.POSITIVE_INFINITY);
  });
});

describe("supplierScore / rankSuppliers", () => {
  const fast: Supplier = { id: "f", name: "Fast", avgShipDays: 5, incidentRate: 0.01, quality: 4.8, orders: 100 };
  const slow: Supplier = { id: "s", name: "Slow", avgShipDays: 20, incidentRate: 0.2, quality: 3, orders: 100 };

  it("should give a higher score to the better supplier", () => {
    expect(supplierScore(fast)).toBeGreaterThan(supplierScore(slow));
  });
  it("should return a 0–100 integer", () => {
    const sc = supplierScore(fast);
    expect(Number.isInteger(sc)).toBe(true);
    expect(sc).toBeGreaterThanOrEqual(0);
    expect(sc).toBeLessThanOrEqual(100);
  });
  it("should score a perfect supplier at/near 100", () => {
    expect(supplierScore({ id: "p", name: "P", avgShipDays: 5, incidentRate: 0, quality: 5, orders: 1 })).toBe(100);
  });
  it("should rank best first without mutating input", () => {
    const arr = [slow, fast];
    const copy = [...arr];
    const ranked = rankSuppliers(arr);
    expect(ranked[0].id).toBe("f");
    expect(arr).toEqual(copy);
  });
});

describe("buildDropshipAlerts", () => {
  it("should flag ROAS below break-even as critical", () => {
    // margin 0.6 → break-even ROAS 1.667; set revenue/adSpend so ROAS < that
    const a = buildDropshipAlerts(stats({ revenue: 4000, cogs: 1600, adSpend: 3000, otherCosts: 0 }));
    expect(a.some((x) => x.level === "critical")).toBe(true);
  });
  it("should warn on a thin margin", () => {
    const a = buildDropshipAlerts(stats({ revenue: 10000, cogs: 4000, adSpend: 5000, otherCosts: 500 }));
    // net 500 → margin 5%
    expect(a.some((x) => /margen/i.test(x.message))).toBe(true);
  });
  it("should warn on high refunds", () => {
    const a = buildDropshipAlerts(stats({ refunds: 40, orders: 250 })); // 16%
    expect(a.some((x) => /devoluc/i.test(x.message))).toBe(true);
  });
  it("should report a healthy business with a single info alert", () => {
    const a = buildDropshipAlerts(stats());
    expect(a).toHaveLength(1);
    expect(a[0].level).toBe("info");
  });
});
