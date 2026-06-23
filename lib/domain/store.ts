/**
 * E-commerce store metrics & catalog logic — pure functions for the Store
 * Builder module. Money values are plain numbers in the store currency; rates
 * are 0–1 fractions. Every function is individually unit-tested.
 */

export type StockStatus = "out" | "low" | "ok";

export interface StoreSnapshot {
  name: string;
  currency: string;
  /** Storefront template/theme name. */
  theme: string;
  stats: StoreStats;
  products: Product[];
}

export interface Product {
  id: string;
  name: string;
  category: string;
  /** Selling price per unit. */
  price: number;
  /** Unit cost (COGS). */
  cost: number;
  /** Units in stock. */
  stock: number;
  /** Units sold to date. */
  sales: number;
}

export interface StoreStats {
  visitors: number;
  orders: number;
  revenue: number;
  /** Previous-period revenue, for growth. */
  prevRevenue: number;
  refunds: number;
}

/** Order conversion rate (0–1): orders per visitor. */
export function conversionRate(orders: number, visitors: number): number {
  if (visitors <= 0) return 0;
  return Math.max(0, Math.min(1, orders / visitors));
}

/** Average order value: revenue per order. */
export function averageOrderValue(revenue: number, orders: number): number {
  if (orders <= 0) return 0;
  return revenue / orders;
}

/** Refund rate (0–1): refunds per order. */
export function refundRate(refunds: number, orders: number): number {
  if (orders <= 0) return 0;
  return Math.max(0, Math.min(1, refunds / orders));
}

/** Revenue growth versus the previous period (0–1, can be negative). */
export function revenueGrowth(prevRevenue: number, revenue: number): number {
  if (prevRevenue <= 0) return 0;
  return (revenue - prevRevenue) / prevRevenue;
}

/** Gross margin (0–1) for a single product: (price - cost) / price. */
export function grossMargin(product: Pick<Product, "price" | "cost">): number {
  if (product.price <= 0) return 0;
  return (product.price - product.cost) / product.price;
}

/** Profit per unit sold. */
export function profitPerUnit(product: Pick<Product, "price" | "cost">): number {
  return product.price - product.cost;
}

/**
 * Stock status against a low-stock threshold: "out" at 0, "low" at or below
 * the threshold, otherwise "ok".
 */
export function stockStatus(stock: number, lowThreshold = 5): StockStatus {
  if (stock <= 0) return "out";
  if (stock <= lowThreshold) return "low";
  return "ok";
}

/** Total cost value of all inventory on hand (sum of stock × cost). */
export function inventoryValue(products: readonly Product[]): number {
  return products.reduce((sum, p) => sum + p.stock * p.cost, 0);
}

/** Total retail value of all inventory on hand (sum of stock × price). */
export function retailValue(products: readonly Product[]): number {
  return products.reduce((sum, p) => sum + p.stock * p.price, 0);
}

/** Total units in stock across the catalog. */
export function totalUnits(products: readonly Product[]): number {
  return products.reduce((sum, p) => sum + p.stock, 0);
}

/** Products at or below the low-stock threshold (includes out of stock). */
export function lowStockProducts(products: readonly Product[], lowThreshold = 5): Product[] {
  return products.filter((p) => stockStatus(p.stock, lowThreshold) !== "ok");
}

/** Top `n` products by units sold, highest first. Input is not mutated. */
export function topProducts(products: readonly Product[], n = 5): Product[] {
  return [...products].sort((a, b) => b.sales - a.sales).slice(0, Math.max(0, n));
}

/** Lifetime catalog revenue (sum of sales × price). */
export function catalogRevenue(products: readonly Product[]): number {
  return products.reduce((sum, p) => sum + p.sales * p.price, 0);
}
