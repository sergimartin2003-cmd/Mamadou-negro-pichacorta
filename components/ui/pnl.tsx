import { cn } from "@/lib/utils";

export interface PnlProps {
  value: number;
  suffix?: string;
  prefix?: string;
  sign?: boolean;
  cls?: string;
}

export function Pnl({ value, suffix = "%", prefix = "", sign = true, cls = "" }: PnlProps) {
  const up = value >= 0;
  const formatted = value.toLocaleString(undefined, {
    maximumFractionDigits: Math.abs(value) < 10 ? 2 : 1,
  });
  return (
    <span className={cn("pnl", up ? "up" : "down", cls)}>
      {sign ? (up ? "+" : "") : ""}
      {prefix}
      {formatted}
      {suffix}
    </span>
  );
}
