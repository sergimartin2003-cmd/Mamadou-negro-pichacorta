export interface ProgressProps {
  value: number;
  max?: number;
  color?: string;
  h?: number;
  glow?: boolean;
}

export function Progress({
  value,
  max = 100,
  color = "var(--brand)",
  h = 8,
  glow = false,
}: ProgressProps) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  return (
    <div
      style={{
        height: h,
        borderRadius: 999,
        background: "var(--bg-4)",
        overflow: "hidden",
        width: "100%",
      }}
    >
      <div
        style={{
          height: "100%",
          width: `${pct}%`,
          borderRadius: 999,
          background: `linear-gradient(90deg, ${color}, color-mix(in srgb, ${color} 70%, white))`,
          boxShadow: glow ? `0 0 12px ${color}` : "none",
          transition: "width .6s cubic-bezier(.2,.8,.2,1)",
        }}
      />
    </div>
  );
}
