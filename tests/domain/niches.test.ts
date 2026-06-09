import { describe, it, expect } from "vitest";
import { NICHES, NICHE_SLUGS, DEFAULT_NICHE, getNiche, isNicheSlug } from "@/config/niches";
import { nicheTierName, nicheTierFor, nicheLadder } from "@/lib/domain/niche-tiers";
import { TIERS } from "@/lib/domain/tiers";

describe("niche registry", () => {
  it("registers exactly the five niches, keyed by slug", () => {
    expect(NICHE_SLUGS.length).toBe(5);
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
    expect(getNiche("crypto").slug).toBe("crypto");
  });

  it("falls back to the default niche for unknown input", () => {
    expect(getNiche("nope").slug).toBe(DEFAULT_NICHE);
    expect(getNiche(undefined).slug).toBe(DEFAULT_NICHE);
  });
});

describe("isNicheSlug", () => {
  it("accepts registered slugs and rejects others", () => {
    expect(isNicheSlug("trading")).toBe(true);
    expect(isNicheSlug("real-estate")).toBe(true);
    expect(isNicheSlug("forex")).toBe(false);
    expect(isNicheSlug("")).toBe(false);
  });
});

describe("niche tier naming", () => {
  it("relabels the shared ladder per niche, index-aligned", () => {
    // Top of the ladder (Elite index) → each niche's apex name.
    const topRp = TIERS[TIERS.length - 1].min + 500;
    expect(nicheTierFor(getNiche("trading"), topRp).name).toBe("Elite");
    expect(nicheTierFor(getNiche("crypto"), topRp).name).toBe("Satoshi");
    expect(nicheTierFor(getNiche("emprendimiento"), topRp).name).toBe("Titan");
    expect(nicheTierFor(getNiche("marketing"), topRp).name).toBe("Legend");
  });

  it("keeps the shared tier's key and color while swapping the name", () => {
    const tier = nicheTierFor(getNiche("crypto"), 0);
    expect(tier.key).toBe("bronze");
    expect(tier.name).toBe("Newbie");
    expect(tier.color).toBe(TIERS[0].color);
  });

  it("nicheLadder returns all seven rungs relabelled in order", () => {
    const ladder = nicheLadder(getNiche("real-estate"));
    expect(ladder.map((t) => t.name)).toEqual([
      "Tenant",
      "Landlord",
      "Investor",
      "Operator",
      "Syndicator",
      "Mogul",
      "Titan",
    ]);
  });

  it("nicheTierName matches the module's array for every rung", () => {
    const module = getNiche("marketing");
    TIERS.forEach((tier, i) => {
      expect(nicheTierName(module, tier)).toBe(module.tierNames[i]);
    });
  });
});
