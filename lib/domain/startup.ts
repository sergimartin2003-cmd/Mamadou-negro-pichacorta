export interface MrrPoint {
  month: string;
  mrr: number;
}

export interface ExpenseItem {
  label: string;
  amount: number;
}

/** Everything the Startup Dashboard needs; all metrics are derived from this. */
export interface StartupSnapshot {
  company: string;
  currency: string;
  /** Trailing months of MRR, oldest first. */
  mrrSeries: MrrPoint[];
  /** Monthly expense breakdown. */
  expenses: ExpenseItem[];
  cash: number;
  customersAtStart: number;
  churnedCustomers: number;
  newCustomers: number;
  salesMarketingSpend: number;
  arpa: number;
  grossMargin: number;
  /** Week-over-week churn change in percentage points (for alerts). */
  churnDeltaPct: number;
  goalMrr: number;
  goalMonths: number;
}

/**
 * Startup metrics — pure SaaS finance math for the Startup Dashboard module.
 * Every function is pure and individually unit-tested. Currency values are
 * plain numbers in the caller's unit (e.g. EUR); rates are 0–1 fractions.
 */

/** Annual recurring revenue from monthly recurring revenue. */
export function arr(mrr: number): number {
  return mrr * 12;
}

/** Customer churn rate (0–1): customers lost over customers at period start. */
export function churnRate(churnedCustomers: number, customersAtStart: number): number {
  if (customersAtStart <= 0) return 0;
  return Math.max(0, Math.min(1, churnedCustomers / customersAtStart));
}

/** Customer acquisition cost: sales+marketing spend per new customer. */
export function cac(salesMarketingSpend: number, newCustomers: number): number {
  if (newCustomers <= 0) return 0;
  return salesMarketingSpend / newCustomers;
}

/**
 * Lifetime value. With a monthly churn rate, average customer lifetime is
 * 1/churn months, so LTV = ARPA * grossMargin / churn. Returns Infinity when
 * churn is zero (a customer never leaves).
 */
export function ltv(arpa: number, monthlyChurnRate: number, grossMargin = 1): number {
  const margin = Math.max(0, Math.min(1, grossMargin));
  if (monthlyChurnRate <= 0) return Number.POSITIVE_INFINITY;
  return (arpa * margin) / monthlyChurnRate;
}

/** LTV:CAC ratio. Returns Infinity when CAC is zero. */
export function ltvCacRatio(ltvValue: number, cacValue: number): number {
  if (cacValue <= 0) return Number.POSITIVE_INFINITY;
  return ltvValue / cacValue;
}

/** Net monthly burn: expenses minus revenue. Negative means profitable. */
export function netBurn(monthlyExpenses: number, monthlyRevenue: number): number {
  return monthlyExpenses - monthlyRevenue;
}

/**
 * Runway in months: cash divided by net burn. Returns Infinity when the
 * company is break-even or profitable (burn <= 0).
 */
export function runwayMonths(cash: number, monthlyNetBurn: number): number {
  if (monthlyNetBurn <= 0) return Number.POSITIVE_INFINITY;
  return cash / monthlyNetBurn;
}

/** Period-over-period growth rate (0–1, can be negative). */
export function growthRate(previous: number, current: number): number {
  if (previous <= 0) return 0;
  return (current - previous) / previous;
}

/**
 * Compounded monthly growth needed to get from `current` to `target` in
 * `months` periods. Returns 0 for invalid inputs.
 */
export function requiredMonthlyGrowth(current: number, target: number, months: number): number {
  if (current <= 0 || target <= 0 || months <= 0) return 0;
  return (target / current) ** (1 / months) - 1;
}

export type AlertLevel = "info" | "warning" | "critical";

export interface MetricAlert {
  level: AlertLevel;
  message: string;
}

export interface AlertInputs {
  churnRate: number;
  churnDeltaPct: number; // week-over-week churn change in percentage points
  ltvCac: number;
  runway: number; // months
}

const RUNWAY_CRITICAL = 3;
const RUNWAY_WARNING = 6;
const LTVCAC_HEALTHY = 3;

/**
 * Build prioritized alerts from key metrics. Pure: same inputs → same alerts,
 * ordered critical → warning → info.
 */
export function buildAlerts(input: AlertInputs): MetricAlert[] {
  const alerts: MetricAlert[] = [];

  if (input.runway <= RUNWAY_CRITICAL && Number.isFinite(input.runway)) {
    alerts.push({
      level: "critical",
      message: `Te quedan ${input.runway.toFixed(1)} meses de runway — considera levantar capital o reducir gastos.`,
    });
  } else if (input.runway <= RUNWAY_WARNING && Number.isFinite(input.runway)) {
    alerts.push({
      level: "warning",
      message: `Runway de ${input.runway.toFixed(1)} meses. Vigila el burn rate de cerca.`,
    });
  }

  if (input.ltvCac < 1) {
    alerts.push({
      level: "critical",
      message: "Tu CAC supera al LTV: cada cliente cuesta más de lo que aporta. Optimiza adquisición.",
    });
  } else if (input.ltvCac < LTVCAC_HEALTHY) {
    alerts.push({
      level: "warning",
      message: `LTV:CAC de ${input.ltvCac.toFixed(1)} (objetivo ≥ 3). Mejora retención o reduce CAC.`,
    });
  }

  if (input.churnDeltaPct >= 5) {
    alerts.push({
      level: "warning",
      message: `Tu churn ha subido ${input.churnDeltaPct.toFixed(1)} puntos esta semana. Revisa la satisfacción del cliente.`,
    });
  }

  if (alerts.length === 0) {
    alerts.push({ level: "info", message: "Métricas saludables. Sigue así. 🚀" });
  }

  return alerts;
}
