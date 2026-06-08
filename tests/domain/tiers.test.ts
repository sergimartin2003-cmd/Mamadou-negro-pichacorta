import { describe, it, expect } from "vitest";
import { tierFor, nextTier, tierProgress, divisionFor } from "@/lib/domain/tiers";

describe("tierFor", () => {
  it("should return bronze when rp is 0", () => {
    expect(tierFor(0).key).toBe("bronze");
  });

  it("should return bronze when rp is 999", () => {
    expect(tierFor(999).key).toBe("bronze");
  });

  it("should return silver when rp is exactly 1000", () => {
    expect(tierFor(1000).key).toBe("silver");
  });

  it("should return gold when rp is exactly 2000", () => {
    expect(tierFor(2000).key).toBe("gold");
  });

  it("should return platinum when rp is exactly 3200", () => {
    expect(tierFor(3200).key).toBe("platinum");
  });

  it("should return diamond when rp is exactly 4600", () => {
    expect(tierFor(4600).key).toBe("diamond");
  });

  it("should return master when rp is exactly 6200", () => {
    expect(tierFor(6200).key).toBe("master");
  });

  it("should return elite when rp is exactly 8000", () => {
    expect(tierFor(8000).key).toBe("elite");
  });

  it("should return elite when rp far exceeds 8000", () => {
    expect(tierFor(99999).key).toBe("elite");
  });
});

describe("nextTier", () => {
  it("should return silver as next tier when in bronze", () => {
    expect(nextTier(0)?.key).toBe("silver");
  });

  it("should return silver as next tier just below silver threshold", () => {
    expect(nextTier(999)?.key).toBe("silver");
  });

  it("should return gold as next tier when at silver floor", () => {
    expect(nextTier(1000)?.key).toBe("gold");
  });

  it("should return null when at elite (top tier)", () => {
    expect(nextTier(8000)).toBeNull();
  });

  it("should return null when well above elite floor", () => {
    expect(nextTier(10000)).toBeNull();
  });

  it("should return elite as next tier when in master", () => {
    expect(nextTier(6200)?.key).toBe("elite");
  });
});

describe("tierProgress", () => {
  it("should return 0 at bronze floor", () => {
    expect(tierProgress(0)).toBe(0);
  });

  it("should return 50 at midpoint of bronze range", () => {
    expect(tierProgress(500)).toBe(50);
  });

  it("should be below 100 just before silver threshold", () => {
    expect(tierProgress(999)).toBeGreaterThan(0);
    expect(tierProgress(999)).toBeLessThan(100);
  });

  it("should reset to 0 at silver floor", () => {
    expect(tierProgress(1000)).toBe(0);
  });

  it("should return 100 at elite (max tier, no ceiling)", () => {
    expect(tierProgress(8000)).toBe(100);
  });

  it("should return 100 above elite floor", () => {
    expect(tierProgress(9000)).toBe(100);
  });

  it("should be monotonically non-decreasing within a tier", () => {
    const values = [0, 100, 200, 500, 800, 999].map(tierProgress);
    for (let i = 1; i < values.length; i++) {
      expect(values[i]).toBeGreaterThanOrEqual(values[i - 1]);
    }
  });

  it("should be bounded between 0 and 100 for any rp", () => {
    [0, 500, 1000, 2500, 5000, 8000, 10000].forEach((rp) => {
      const p = tierProgress(rp);
      expect(p).toBeGreaterThanOrEqual(0);
      expect(p).toBeLessThanOrEqual(100);
    });
  });
});

describe("divisionFor", () => {
  it("should return IV at the bronze floor (lowest division)", () => {
    expect(divisionFor(0)).toBe("IV");
  });

  it("should return III at lower-mid bronze", () => {
    expect(divisionFor(250)).toBe("III");
  });

  it("should return II at mid bronze", () => {
    expect(divisionFor(500)).toBe("II");
  });

  it("should return I at upper bronze", () => {
    expect(divisionFor(750)).toBe("I");
  });

  it("should return I just below silver threshold", () => {
    expect(divisionFor(999)).toBe("I");
  });

  it("should return IV at the elite floor (bottom division of top tier)", () => {
    expect(divisionFor(8000)).toBe("IV");
  });

  it("should return one of the four Roman numeral divisions", () => {
    const valid = new Set(["IV", "III", "II", "I"]);
    [0, 500, 1000, 2000, 3200, 4600, 6200, 8000].forEach((rp) => {
      expect(valid.has(divisionFor(rp))).toBe(true);
    });
  });
});
