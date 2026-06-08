export interface SparklineProps {
  data: number[];
  w?: number;
  h?: number;
  color?: string;
  fill?: boolean;
  sw?: number;
}

export function Sparkline({
  data,
  w = 120,
  h = 34,
  color = "var(--profit)",
  fill = true,
  sw = 1.8,
}: SparklineProps) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const rng = max - min || 1;
  const points = data.map<[number, number]>((value, i) => [
    (i / (data.length - 1)) * w,
    h - ((value - min) / rng) * (h - 4) - 2,
  ]);
  const dLine = points
    .map((p, i) => `${i ? "L" : "M"}${p[0].toFixed(1)} ${p[1].toFixed(1)}`)
    .join(" ");
  const dFill = `${dLine} L${w} ${h} L0 ${h} Z`;
  const id = `sg${Math.round(data[0] * 97 + w)}`;

  return (
    <svg width={w} height={h} style={{ display: "block", overflow: "visible" }}>
      {fill && (
        <defs>
          <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={color} stopOpacity="0.28" />
            <stop offset="1" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
      )}
      {fill && <path d={dFill} fill={`url(#${id})`} />}
      <path
        d={dLine}
        fill="none"
        stroke={color}
        strokeWidth={sw}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  );
}
