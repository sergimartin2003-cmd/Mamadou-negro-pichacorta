/**
 * Multi-asset investment portfolio — pure analytics for the Portfolio Tracker
 * module. Money values are plain numbers in the portfolio currency; weights
 * and returns are 0–1 fractions. Every function is individually unit-tested.
 */

export type AssetType = "stock" | "etf" | "crypto" | "realestate" | "bond" | "commodity" | "cash";

export interface PortfolioSnapshot {
  name: string;
  currency: string;
  holdings: Holding[];
}

export interface Holding {
  id: string;
  name: string;
  symbol: string;
  type: AssetType;
  region: string;
  /** Units held. */
  quantity: number;
  /** Average purchase price per unit. */
  avgCost: number;
  /** Current market price per unit. */
  price: number;
}

/** Current market value of a holding. */
export function marketValue(h: Pick<Holding, "quantity" | "price">): number {
  return h.quantity * h.price;
}

/** Amount originally paid for a holding. */
export function costBasis(h: Pick<Holding, "quantity" | "avgCost">): number {
  return h.quantity * h.avgCost;
}

/** Unrealized profit/loss for a holding (can be negative). */
export function unrealizedPnl(h: Holding): number {
  return marketValue(h) - costBasis(h);
}

/** Unrealized P&L as a fraction of cost basis. Returns 0 when cost is zero. */
export function unrealizedPnlPct(h: Holding): number {
  const cost = costBasis(h);
  if (cost <= 0) return 0;
  return unrealizedPnl(h) / cost;
}

export function totalValue(holdings: readonly Holding[]): number {
  return holdings.reduce((sum, h) => sum + marketValue(h), 0);
}

export function totalCost(holdings: readonly Holding[]): number {
  return holdings.reduce((sum, h) => sum + costBasis(h), 0);
}

export function totalUnrealizedPnl(holdings: readonly Holding[]): number {
  return totalValue(holdings) - totalCost(holdings);
}

/** Portfolio-wide unrealized return as a fraction of total cost. */
export function totalReturnPct(holdings: readonly Holding[]): number {
  const cost = totalCost(holdings);
  if (cost <= 0) return 0;
  return totalUnrealizedPnl(holdings) / cost;
}

/** A weight (0–1) of `value` within `total`. */
export function weightPct(value: number, total: number): number {
  if (total <= 0) return 0;
  return value / total;
}

export interface AllocationSlice {
  key: string;
  value: number;
  /** Share of the portfolio (0–1). */
  pct: number;
}

/**
 * Group holdings by an arbitrary key and return value + weight per group,
 * sorted by value descending.
 */
export function allocation(holdings: readonly Holding[], keyFn: (h: Holding) => string): AllocationSlice[] {
  const total = totalValue(holdings);
  const buckets = new Map<string, number>();
  for (const h of holdings) {
    const key = keyFn(h);
    buckets.set(key, (buckets.get(key) ?? 0) + marketValue(h));
  }
  return [...buckets.entries()]
    .map(([key, value]) => ({ key, value, pct: weightPct(value, total) }))
    .sort((a, b) => b.value - a.value);
}

export function allocationByType(holdings: readonly Holding[]): AllocationSlice[] {
  return allocation(holdings, (h) => h.type);
}

export function allocationByRegion(holdings: readonly Holding[]): AllocationSlice[] {
  return allocation(holdings, (h) => h.region);
}

/** Largest single-asset weight (0–1) — a simple concentration risk gauge. */
export function concentration(holdings: readonly Holding[]): number {
  const total = totalValue(holdings);
  if (total <= 0) return 0;
  return holdings.reduce((max, h) => Math.max(max, weightPct(marketValue(h), total)), 0);
}

/**
 * Diversification score (0–1) = 1 − Herfindahl index of holding weights.
 * 0 for a single asset; approaches 1 as holdings spread evenly. Empty → 0.
 */
export function diversificationScore(holdings: readonly Holding[]): number {
  const total = totalValue(holdings);
  if (total <= 0 || holdings.length === 0) return 0;
  const hhi = holdings.reduce((sum, h) => {
    const w = weightPct(marketValue(h), total);
    return sum + w * w;
  }, 0);
  return Math.max(0, Math.min(1, 1 - hhi));
}

/** Holdings sorted by unrealized return %, best first. Input not mutated. */
export function topMovers(holdings: readonly Holding[], n = 5): Holding[] {
  return [...holdings].sort((a, b) => unrealizedPnlPct(b) - unrealizedPnlPct(a)).slice(0, Math.max(0, n));
}
