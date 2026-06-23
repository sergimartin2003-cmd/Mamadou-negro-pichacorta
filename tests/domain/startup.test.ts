import { describe, it, expect } from "vitest";
import {
  arr,
  churnRate,
  cac,
  ltv,
  ltvCacRatio,
  netBurn,
  runwayMonths,
  growthRate,
  requiredMonthlyGrowth,
  buildAlerts,
} from "@/lib/domain/startup";

describe("arr", () => {
  it("should be 12x MRR", () => {
    expect(arr(1000)).toBe(12000);
  });
});

describe("churnRate", () => {
  it("should divide churned by customers at start", () => {
    expect(churnRate(5, 100)).toBe(0.05);
  });

  it("should return 0 when there were no customers", () => {
    expect(churnRate(3, 0)).toBe(0);
  });

  it("should clamp to [0,1]", () => {
    expect(churnRate(150, 100)).toBe(1);
    expect(churnRate(-5, 100)).toBe(0);
  });
});

describe("cac", () => {
  it("should divide spend by new customers", () => {
    expect(cac(1000, 20)).toBe(50);
  });

  it("should return 0 when no customers were acquired", () => {
    expect(cac(1000, 0)).toBe(0);
  });
});

describe("ltv", () => {
  it("should be ARPA * margin / churn", () => {
    // 50 * 1 / 0.05 = 1000
    expect(ltv(50, 0.05)).toBe(1000);
    // with 80% margin: 50 * 0.8 / 0.05 = 800
    expect(ltv(50, 0.05, 0.8)).toBe(800);
  });

  it("should be Infinity when churn is zero", () => {
    expect(ltv(50, 0)).toBe(Number.POSITIVE_INFINITY);
  });

  it("should clamp margin to [0,1]", () => {
    expect(ltv(50, 0.05, 2)).toBe(1000); // margin clamps to 1
  });
});

describe("ltvCacRatio", () => {
  it("should divide LTV by CAC", () => {
    expect(ltvCacRatio(1000, 250)).toBe(4);
  });

  it("should be Infinity when CAC is zero", () => {
    expect(ltvCacRatio(1000, 0)).toBe(Number.POSITIVE_INFINITY);
  });
});

describe("netBurn / runwayMonths", () => {
  it("should compute net burn as expenses - revenue", () => {
    expect(netBurn(30000, 18000)).toBe(12000);
    expect(netBurn(18000, 30000)).toBe(-12000); // profitable
  });

  it("should compute runway as cash / burn", () => {
    expect(runwayMonths(120000, 12000)).toBe(10);
  });

  it("should be Infinity when not burning", () => {
    expect(runwayMonths(120000, 0)).toBe(Number.POSITIVE_INFINITY);
    expect(runwayMonths(120000, -5000)).toBe(Number.POSITIVE_INFINITY);
  });
});

describe("growthRate", () => {
  it("should compute period-over-period growth", () => {
    expect(growthRate(100, 120)).toBeCloseTo(0.2);
    expect(growthRate(100, 80)).toBeCloseTo(-0.2);
  });

  it("should return 0 when previous is non-positive", () => {
    expect(growthRate(0, 100)).toBe(0);
  });
});

describe("requiredMonthlyGrowth", () => {
  it("should compute the compounded monthly rate to reach a target", () => {
    // doubling in 12 months → ~5.95%/mo
    const g = requiredMonthlyGrowth(1000, 2000, 12);
    expect(g).toBeCloseTo(2 ** (1 / 12) - 1, 6);
  });

  it("should round-trip: applying the growth reaches the target", () => {
    const g = requiredMonthlyGrowth(1000, 10000, 6);
    expect(1000 * (1 + g) ** 6).toBeCloseTo(10000, 3);
  });

  it("should return 0 for invalid inputs", () => {
    expect(requiredMonthlyGrowth(0, 1000, 6)).toBe(0);
    expect(requiredMonthlyGrowth(1000, 2000, 0)).toBe(0);
  });
});

describe("buildAlerts", () => {
  it("should flag critical runway", () => {
    const alerts = buildAlerts({ churnRate: 0.03, churnDeltaPct: 0, ltvCac: 4, runway: 2 });
    expect(alerts.some((a) => a.level === "critical")).toBe(true);
  });

  it("should warn on moderate runway", () => {
    const alerts = buildAlerts({ churnRate: 0.03, churnDeltaPct: 0, ltvCac: 4, runway: 5 });
    expect(alerts.some((a) => a.level === "warning")).toBe(true);
  });

  it("should flag CAC above LTV as critical", () => {
    const alerts = buildAlerts({ churnRate: 0.03, churnDeltaPct: 0, ltvCac: 0.8, runway: 24 });
    expect(alerts.some((a) => a.level === "critical")).toBe(true);
  });

  it("should warn on an unhealthy LTV:CAC", () => {
    const alerts = buildAlerts({ churnRate: 0.03, churnDeltaPct: 0, ltvCac: 2, runway: 24 });
    expect(alerts.some((a) => a.level === "warning")).toBe(true);
  });

  it("should warn on a rising churn delta", () => {
    const alerts = buildAlerts({ churnRate: 0.08, churnDeltaPct: 6, ltvCac: 4, runway: 24 });
    expect(alerts.some((a) => /churn/i.test(a.message))).toBe(true);
  });

  it("should return a single healthy info alert when all is well", () => {
    const alerts = buildAlerts({ churnRate: 0.02, churnDeltaPct: 0, ltvCac: 5, runway: 24 });
    expect(alerts).toHaveLength(1);
    expect(alerts[0].level).toBe("info");
  });

  it("should not treat Infinity runway as a problem", () => {
    const alerts = buildAlerts({ churnRate: 0.02, churnDeltaPct: 0, ltvCac: 5, runway: Number.POSITIVE_INFINITY });
    expect(alerts.every((a) => a.level === "info")).toBe(true);
  });
});
