import { describe, it, expect } from "vitest";
import { NICHES, NICHE_SLUGS, DEFAULT_NICHE, getNiche, isNicheSlug } from "@/config/niches";
import { nicheTierName, nicheTierFor, nicheLadder } from "@/lib/domain/niche-tiers";
import { TIERS } from "@/lib/domain/tiers";

const STANDARD_TIERS = ["Bronze", "Silver", "Gold", "Platinum", "Diamond", "Master", "Elite"];

describe("niche registry", () => {
  it("registers exactly the eight EmprendeHub niches, keyed by slug", () => {
    expect(NICHE_SLUGS.length).toBe(8);
    for (const slug of NICHE_SLUGS) {
      expect(NICHES[slug].slug).toBe(slug);
    }
  });

  it("each module has 7 tier names, 4 stat fields and a verification provider", () => {
    for (const slug of NICHE_SLUGS) {
      const module = NICHES[slug];
      expect(module.tierNames).toHaveLength(7);
      expect(module.postStatFields).toHaveLength(4);
      expect(module.profileMetrics.length).toBeGreaterThan(0);
      expect(module.verification.connectLabel.length).toBeGreaterThan(0);
      expect(module.competitions.length).toBeGreaterThan(0);
      expect(module.learning.length).toBeGreaterThan(0);
    }
  });

  it("the default niche is registered", () => {
    expect(isNicheSlug(DEFAULT_NICHE)).toBe(true);
  });
});

describe("getNiche", () => {
  it("resolves a known slug", () => {
    expect(getNiche("saas").slug).toBe("saas");
    expect(getNiche("dropshipping").slug).toBe("dropshipping");
  });

  it("falls back to the default niche for unknown input", () => {
    expect(getNiche("nope").slug).toBe(DEFAULT_NICHE);
    expect(getNiche(undefined).slug).toBe(DEFAULT_NICHE);
    // Retired niches from the pre-pivot taxonomy are no longer registered.
    expect(getNiche("crypto").slug).toBe(DEFAULT_NICHE);
  });
});

describe("isNicheSlug", () => {
  it("accepts registered slugs and rejects others", () => {
    expect(isNicheSlug("ecommerce")).toBe(true);
    expect(isNicheSlug("inmobiliario")).toBe(true);
    expect(isNicheSlug("trading")).toBe(true);
    expect(isNicheSlug("forex")).toBe(false);
    expect(isNicheSlug("")).toBe(false);
  });
});

describe("niche tier naming", () => {
  it("uses the shared Bronze→Elite ladder for every niche", () => {
    const topRp = TIERS[TIERS.length - 1].min + 500;
    for (const slug of NICHE_SLUGS) {
      expect(nicheTierFor(getNiche(slug), topRp).name).toBe("Elite");
      expect(nicheTierFor(getNiche(slug), 0).name).toBe("Bronze");
    }
  });

  it("keeps the shared tier's key and color while resolving the name", () => {
    const tier = nicheTierFor(getNiche("amazon"), 0);
    expect(tier.key).toBe("bronze");
    expect(tier.name).toBe("Bronze");
    expect(tier.color).toBe(TIERS[0].color);
  });

  it("nicheLadder returns all seven rungs in order", () => {
    expect(nicheLadder(getNiche("inmobiliario")).map((t) => t.name)).toEqual(STANDARD_TIERS);
  });

  it("nicheTierName matches the module's array for every rung", () => {
    const module = getNiche("servicios");
    TIERS.forEach((tier, i) => {
      expect(nicheTierName(module, tier)).toBe(module.tierNames[i]);
    });
  });
});
