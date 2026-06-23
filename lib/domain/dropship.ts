/**
 * Dropshipping business metrics & supplier scoring — pure functions for the
 * Dropshipping Dashboard module. Money values are plain numbers; rates are
 * 0–1 fractions. Every function is individually unit-tested.
 */

export interface DropshipSnapshot {
  name: string;
  currency: string;
  stats: DropshipStats;
  suppliers: Supplier[];
}

export interface DropshipStats {
  revenue: number;
  /** Cost of goods sold. */
  cogs: number;
  adSpend: number;
  /** Apps, fees, misc. operating costs. */
  otherCosts: number;
  orders: number;
  refunds: number;
  newCustomers: number;
}

/** Revenue minus cost of goods. */
export function grossProfit(revenue: number, cogs: number): number {
  return revenue - cogs;
}

/** Revenue minus COGS, ad spend and other costs. */
export function netProfit(s: DropshipStats): number {
  return s.revenue - s.cogs - s.adSpend - s.otherCosts;
}

/** Net profit as a fraction of revenue. 0 when there is no revenue. */
export function profitMargin(s: DropshipStats): number {
  if (s.revenue <= 0) return 0;
  return netProfit(s) / s.revenue;
}

/** Gross margin fraction: (revenue − COGS) / revenue. */
export function grossMarginFraction(revenue: number, cogs: number): number {
  if (revenue <= 0) return 0;
  return (revenue - cogs) / revenue;
}

/** Average order value. */
export function averageOrderValue(revenue: number, orders: number): number {
  if (orders <= 0) return 0;
  return revenue / orders;
}

/** Refund rate (0–1), clamped. */
export function refundRate(refunds: number, orders: number): number {
  if (orders <= 0) return 0;
  return Math.max(0, Math.min(1, refunds / orders));
}

/** Customer acquisition cost: ad spend per new customer. */
export function cac(adSpend: number, newCustomers: number): number {
  if (newCustomers <= 0) return 0;
  return adSpend / newCustomers;
}

/** Return on ad spend: revenue per unit of ad spend. Infinity if no spend. */
export function roas(revenue: number, adSpend: number): number {
  if (adSpend <= 0) return Number.POSITIVE_INFINITY;
  return revenue / adSpend;
}

/**
 * Break-even ROAS for a given gross margin fraction: the ROAS at which ad
 * spend exactly equals gross profit. = 1 / grossMargin. Infinity if margin ≤ 0.
 */
export function breakEvenRoas(grossMargin: number): number {
  if (grossMargin <= 0) return Number.POSITIVE_INFINITY;
  return 1 / grossMargin;
}

export interface Supplier {
  id: string;
  name: string;
  /** Average shipping time in days. */
  avgShipDays: number;
  /** Incident/dispute rate (0–1). */
  incidentRate: number;
  /** Product quality rating, 0–5. */
  quality: number;
  orders: number;
}

const SHIP_FAST_DAYS = 5;
const SHIP_SLOW_DAYS = 20;
const W_SHIP = 0.3;
const W_INCIDENT = 0.35;
const W_QUALITY = 0.35;

function clamp01(v: number): number {
  return Math.max(0, Math.min(1, v));
}

/**
 * Supplier performance score (0–100) blending shipping speed (5d→best,
 * 20d→worst), inverse incident rate, and quality rating. Pure.
 */
export function supplierScore(s: Supplier): number {
  const ship = clamp01((SHIP_SLOW_DAYS - s.avgShipDays) / (SHIP_SLOW_DAYS - SHIP_FAST_DAYS));
  const incident = clamp01(1 - s.incidentRate);
  const quality = clamp01(s.quality / 5);
  return Math.round((ship * W_SHIP + incident * W_INCIDENT + quality * W_QUALITY) * 100);
}

/** Suppliers ranked by score, best first. Input not mutated. */
export function rankSuppliers(suppliers: readonly Supplier[]): Supplier[] {
  return [...suppliers].sort((a, b) => supplierScore(b) - supplierScore(a));
}

export type AlertLevel = "info" | "warning" | "critical";
export interface DropshipAlert {
  level: AlertLevel;
  message: string;
}

const MARGIN_WARNING = 0.15;
const REFUND_WARNING = 0.1;

/** Prioritized alerts from the current stats. Pure. */
export function buildDropshipAlerts(s: DropshipStats): DropshipAlert[] {
  const alerts: DropshipAlert[] = [];
  const margin = profitMargin(s);
  const r = roas(s.revenue, s.adSpend);
  const be = breakEvenRoas(grossMarginFraction(s.revenue, s.cogs));
  const refund = refundRate(s.refunds, s.orders);

  if (Number.isFinite(r) && Number.isFinite(be) && r < be) {
    alerts.push({ level: "critical", message: `Tu ROAS (${r.toFixed(2)}) está por debajo del break-even (${be.toFixed(2)}). Estás perdiendo dinero en publicidad.` });
  }
  if (margin < MARGIN_WARNING) {
    alerts.push({ level: "warning", message: `Margen neto del ${(margin * 100).toFixed(1)}% (objetivo ≥ 15%). Sube precios o reduce coste de adquisición.` });
  }
  if (refund >= REFUND_WARNING) {
    alerts.push({ level: "warning", message: `Tasa de devoluciones del ${(refund * 100).toFixed(1)}%. Revisa calidad o expectativas de producto.` });
  }
  if (alerts.length === 0) {
    alerts.push({ level: "info", message: "Negocio rentable y saludable. 🚀" });
  }
  return alerts;
}
