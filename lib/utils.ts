import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

const COMPACT_THRESHOLDS = [
  { limit: 1_000_000_000, suffix: "b" },
  { limit: 1_000_000, suffix: "m" },
  { limit: 1_000, suffix: "k" },
] as const;

export function formatCompact(n: number): string {
  if (!Number.isFinite(n)) return "0";
  const abs = Math.abs(n);
  for (const { limit, suffix } of COMPACT_THRESHOLDS) {
    if (abs >= limit) {
      const scaled = n / limit;
      const text = scaled % 1 === 0 ? scaled.toFixed(0) : scaled.toFixed(1);
      return `${text}${suffix}`;
    }
  }
  return String(Math.round(n));
}

export function formatPct(n: number): string {
  if (!Number.isFinite(n)) return "0%";
  const sign = n > 0 ? "+" : "";
  return `${sign}${n.toFixed(2)}%`;
}

export function formatRP(n: number): string {
  if (!Number.isFinite(n)) return "0 RP";
  return `${formatCompact(n)} RP`;
}
