import { describe, it, expect } from "vitest";
import {
  conversionRate,
  averageOrderValue,
  refundRate,
  revenueGrowth,
  grossMargin,
  profitPerUnit,
  stockStatus,
  inventoryValue,
  retailValue,
  totalUnits,
  lowStockProducts,
  topProducts,
  catalogRevenue,
  type Product,
} from "@/lib/domain/store";

const product = (id: string, price: number, cost: number, stock: number, sales: number): Product => ({
  id,
  name: id,
  category: "test",
  price,
  cost,
  stock,
  sales,
});

const catalog: Product[] = [
  product("a", 40, 16, 12, 120),
  product("b", 25, 10, 3, 80),
  product("c", 60, 30, 0, 200),
  product("d", 15, 9, 50, 10),
];

describe("conversionRate", () => {
  it("should be orders / visitors", () => {
    expect(conversionRate(30, 1000)).toBe(0.03);
  });
  it("should return 0 with no visitors and clamp", () => {
    expect(conversionRate(5, 0)).toBe(0);
    expect(conversionRate(2000, 1000)).toBe(1);
  });
});

describe("averageOrderValue", () => {
  it("should be revenue / orders", () => {
    expect(averageOrderValue(5000, 100)).toBe(50);
  });
  it("should return 0 with no orders", () => {
    expect(averageOrderValue(5000, 0)).toBe(0);
  });
});

describe("refundRate", () => {
  it("should be refunds / orders, clamped", () => {
    expect(refundRate(5, 100)).toBe(0.05);
    expect(refundRate(200, 100)).toBe(1);
    expect(refundRate(1, 0)).toBe(0);
  });
});

describe("revenueGrowth", () => {
  it("should compute period growth", () => {
    expect(revenueGrowth(1000, 1250)).toBeCloseTo(0.25);
    expect(revenueGrowth(1000, 800)).toBeCloseTo(-0.2);
  });
  it("should return 0 when previous is non-positive", () => {
    expect(revenueGrowth(0, 1000)).toBe(0);
  });
});

describe("grossMargin / profitPerUnit", () => {
  it("should compute margin fraction", () => {
    expect(grossMargin({ price: 40, cost: 16 })).toBeCloseTo(0.6);
  });
  it("should return 0 margin for a zero price", () => {
    expect(grossMargin({ price: 0, cost: 5 })).toBe(0);
  });
  it("should compute profit per unit", () => {
    expect(profitPerUnit({ price: 40, cost: 16 })).toBe(24);
  });
});

describe("stockStatus", () => {
  it("should detect out of stock", () => {
    expect(stockStatus(0)).toBe("out");
  });
  it("should detect low stock at or below threshold", () => {
    expect(stockStatus(5)).toBe("low");
    expect(stockStatus(3, 3)).toBe("low");
  });
  it("should be ok above threshold", () => {
    expect(stockStatus(6)).toBe("ok");
  });
});

describe("inventory aggregates", () => {
  it("should sum inventory cost value", () => {
    // 12*16 + 3*10 + 0*30 + 50*9 = 192 + 30 + 0 + 450 = 672
    expect(inventoryValue(catalog)).toBe(672);
  });
  it("should sum inventory retail value", () => {
    // 12*40 + 3*25 + 0 + 50*15 = 480 + 75 + 0 + 750 = 1305
    expect(retailValue(catalog)).toBe(1305);
  });
  it("should sum total units", () => {
    expect(totalUnits(catalog)).toBe(65);
  });
  it("should compute lifetime catalog revenue", () => {
    // 120*40 + 80*25 + 200*60 + 10*15 = 4800 + 2000 + 12000 + 150 = 18950
    expect(catalogRevenue(catalog)).toBe(18950);
  });
});

describe("lowStockProducts", () => {
  it("should include low and out-of-stock items only", () => {
    const ids = lowStockProducts(catalog).map((p) => p.id);
    expect(ids).toContain("b"); // stock 3 (low)
    expect(ids).toContain("c"); // stock 0 (out)
    expect(ids).not.toContain("a");
    expect(ids).not.toContain("d");
  });
});

describe("topProducts", () => {
  it("should sort by sales desc and cap at n", () => {
    const top = topProducts(catalog, 2);
    expect(top.map((p) => p.id)).toEqual(["c", "a"]);
  });
  it("should not mutate the input", () => {
    const copy = [...catalog];
    topProducts(catalog, 2);
    expect(catalog).toEqual(copy);
  });
});
