/**
 * Equity screener & valuation scoring — pure functions for the Investment
 * Research Hub. Ratios like ROE / growth / dividend yield are 0–1 fractions
 * (0.18 = 18%). Every function is individually unit-tested.
 */

export interface Security {
  id: string;
  name: string;
  symbol: string;
  sector: string;
  price: number;
  /** Price/earnings ratio (negative ⇒ loss-making). */
  per: number;
  /** Price/book ratio. */
  pb: number;
  /** Return on equity (fraction). */
  roe: number;
  /** Dividend yield (fraction). */
  dividendYield: number;
  /** Revenue/earnings growth (fraction). */
  growth: number;
  /** Debt to equity ratio. */
  debtToEquity: number;
  marketCap: number;
}

export interface ScreenFilter {
  perMax?: number;
  pbMax?: number;
  roeMin?: number;
  divYieldMin?: number;
  growthMin?: number;
  debtMax?: number;
  sector?: string;
}

/** Numeric fields a screener result can be sorted by. */
export type SortKey = "valuationScore" | "per" | "pb" | "roe" | "dividendYield" | "growth" | "marketCap" | "price";
export type SortDir = "asc" | "desc";

function clamp01(v: number): number {
  return Math.max(0, Math.min(1, v));
}

/** True when a security satisfies every defined constraint in the filter. */
export function matchesFilter(s: Security, f: ScreenFilter): boolean {
  if (f.perMax != null && !(s.per > 0 && s.per <= f.perMax)) return false;
  if (f.pbMax != null && !(s.pb <= f.pbMax)) return false;
  if (f.roeMin != null && !(s.roe >= f.roeMin)) return false;
  if (f.divYieldMin != null && !(s.dividendYield >= f.divYieldMin)) return false;
  if (f.growthMin != null && !(s.growth >= f.growthMin)) return false;
  if (f.debtMax != null && !(s.debtToEquity <= f.debtMax)) return false;
  if (f.sector != null && s.sector !== f.sector) return false;
  return true;
}

/** Securities passing the filter. Input not mutated. */
export function screen(securities: readonly Security[], f: ScreenFilter): Security[] {
  return securities.filter((s) => matchesFilter(s, f));
}

/**
 * Composite valuation/quality score (0–100): rewards cheap valuation (low
 * PER/PB), high quality (ROE), growth and dividend, and penalizes leverage.
 */
export function valuationScore(s: Security): number {
  const per = s.per > 0 ? clamp01((30 - s.per) / 30) : 0;
  const pb = clamp01((5 - s.pb) / 5);
  const roe = clamp01(s.roe / 0.3);
  const growth = clamp01(s.growth / 0.3);
  const div = clamp01(s.dividendYield / 0.06);
  const debt = clamp01((2 - s.debtToEquity) / 2);
  const score = per * 0.2 + pb * 0.15 + roe * 0.25 + growth * 0.2 + div * 0.1 + debt * 0.1;
  return Math.round(clamp01(score) * 100);
}

function sortValue(s: Security, key: SortKey): number {
  return key === "valuationScore" ? valuationScore(s) : s[key];
}

/** Sort securities by a numeric key. Input not mutated. Default: score desc. */
export function sortSecurities(
  securities: readonly Security[],
  key: SortKey = "valuationScore",
  dir: SortDir = "desc",
): Security[] {
  const factor = dir === "asc" ? 1 : -1;
  return [...securities].sort((a, b) => (sortValue(a, key) - sortValue(b, key)) * factor);
}

/** Distinct sectors present, alphabetically. */
export function sectors(securities: readonly Security[]): string[] {
  return [...new Set(securities.map((s) => s.sector))].sort();
}
