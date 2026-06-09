import { describe, it, expect } from "vitest";
import { cn, formatCompact, formatPct, formatRP } from "@/lib/utils";

// ── cn ──────────────────────────────────────────────────────────────────────

describe("cn", () => {
  it("should merge two plain class strings", () => {
    expect(cn("foo", "bar")).toBe("foo bar");
  });

  it("should deduplicate Tailwind conflicting classes (last wins)", () => {
    // tailwind-merge: p-2 overrides p-4 when both passed
    expect(cn("p-4", "p-2")).toBe("p-2");
  });

  it("should handle conditional classes (falsy values ignored)", () => {
    expect(cn("base", false && "hidden", "active")).toBe("base active");
  });

  it("should handle object syntax (truthy keys included)", () => {
    expect(cn({ "font-bold": true, italic: false })).toBe("font-bold");
  });

  it("should return empty string when no arguments passed", () => {
    expect(cn()).toBe("");
  });

  it("should handle array of class names", () => {
    expect(cn(["a", "b"])).toBe("a b");
  });
});

// ── formatCompact ───────────────────────────────────────────────────────────

describe("formatCompact", () => {
  it("should format 12400 as '12.4k'", () => {
    expect(formatCompact(12400)).toBe("12.4k");
  });

  it("should format 1000 as '1k' (exact threshold, no decimal)", () => {
    expect(formatCompact(1000)).toBe("1k");
  });

  it("should format 1500000 as '1.5m'", () => {
    expect(formatCompact(1500000)).toBe("1.5m");
  });

  it("should format 1000000000 as '1b' (exactly 1 billion)", () => {
    expect(formatCompact(1000000000)).toBe("1b");
  });

  it("should format 1500000000 as '1.5b'", () => {
    expect(formatCompact(1500000000)).toBe("1.5b");
  });

  it("should format 999 as '999' (below threshold, plain integer)", () => {
    expect(formatCompact(999)).toBe("999");
  });

  it("should format 0 as '0'", () => {
    expect(formatCompact(0)).toBe("0");
  });

  it("should format negative numbers like -5000 as '-5k'", () => {
    expect(formatCompact(-5000)).toBe("-5k");
  });

  it("should return '0' for Infinity", () => {
    expect(formatCompact(Infinity)).toBe("0");
  });

  it("should return '0' for NaN", () => {
    expect(formatCompact(NaN)).toBe("0");
  });

  it("should round sub-threshold numbers to nearest integer", () => {
    expect(formatCompact(99.7)).toBe("100");
  });
});

// ── formatPct ───────────────────────────────────────────────────────────────

describe("formatPct", () => {
  it("should format positive percentage with + sign", () => {
    expect(formatPct(12.5)).toBe("+12.50%");
  });

  it("should format negative percentage without + sign", () => {
    expect(formatPct(-3.2)).toBe("-3.20%");
  });

  it("should format 0 as '0.00%' (no sign for zero)", () => {
    expect(formatPct(0)).toBe("0.00%");
  });

  it("should format to exactly 2 decimal places", () => {
    expect(formatPct(1)).toBe("+1.00%");
  });

  it("should return '0%' for Infinity", () => {
    expect(formatPct(Infinity)).toBe("0%");
  });

  it("should return '0%' for NaN", () => {
    expect(formatPct(NaN)).toBe("0%");
  });
});

// ── formatRP ────────────────────────────────────────────────────────────────

describe("formatRP", () => {
  it("should append ' RP' suffix to compact-formatted number", () => {
    expect(formatRP(1500)).toBe("1.5k RP");
  });

  it("should format 0 as '0 RP'", () => {
    expect(formatRP(0)).toBe("0 RP");
  });

  it("should format 8000 as '8k RP'", () => {
    expect(formatRP(8000)).toBe("8k RP");
  });

  it("should format 500 as '500 RP' (below k threshold)", () => {
    expect(formatRP(500)).toBe("500 RP");
  });

  it("should return '0 RP' for Infinity", () => {
    expect(formatRP(Infinity)).toBe("0 RP");
  });

  it("should return '0 RP' for NaN", () => {
    expect(formatRP(NaN)).toBe("0 RP");
  });
});
