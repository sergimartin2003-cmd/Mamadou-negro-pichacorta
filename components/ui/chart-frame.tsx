import type { TradeDir } from "@/types/db";

export interface ChartFrameProps {
  label: string;
  dir?: TradeDir;
  h?: number;
  symbol?: string;
}

interface Candle {
  o: number;
  c: number;
  hi: number;
  lo: number;
  green: boolean;
}

const CANDLE_COUNT = 26;
const CANDLE_STEP = 9;

/** Deterministic 0–1 generator so server and client render identical candles. */
function pseudoRandom(seed: number): number {
  const x = Math.sin(seed * 12.9898) * 43758.5453;
  return x - Math.floor(x);
}

function buildCandles(up: boolean): Candle[] {
  const candles: Candle[] = [];
  let p = 50;
  for (let i = 0; i < CANDLE_COUNT; i++) {
    const move = (Math.sin(i * 0.9) + Math.cos(i * 0.5)) * 5 + (up ? 1.4 : -1.2);
    const o = p;
    p = Math.max(12, Math.min(88, p + move));
    const hi = Math.max(o, p) + pseudoRandom(i + 1) * 5;
    const lo = Math.min(o, p) - pseudoRandom(i + 101) * 5;
    candles.push({ o, c: p, hi, lo, green: p >= o });
  }
  return candles;
}

export function ChartFrame({ label, dir = "long", h = 180, symbol = "" }: ChartFrameProps) {
  const up = dir === "long";
  const col = up ? "var(--profit)" : "var(--loss)";
  const candles = buildCandles(up);

  return (
    <div
      style={{
        position: "relative",
        height: h,
        borderRadius: "var(--r-md)",
        overflow: "hidden",
        background: "linear-gradient(180deg, var(--bg-3), var(--bg-2))",
        border: "1px solid var(--line-1)",
      }}
    >
      <svg
        width="100%"
        height="100%"
        viewBox={`0 0 ${CANDLE_COUNT * CANDLE_STEP} 100`}
        preserveAspectRatio="none"
        style={{ position: "absolute", inset: 0 }}
      >
        {[20, 40, 60, 80].map((y) => (
          <line
            key={y}
            x1="0"
            x2={CANDLE_COUNT * CANDLE_STEP}
            y1={y}
            y2={y}
            stroke="rgba(255,255,255,0.04)"
            strokeWidth="0.5"
          />
        ))}
        {candles.map((c, i) => {
          const x = i * CANDLE_STEP + 4.5;
          const cc = c.green ? "#16C784" : "#EA3943";
          return (
            <g key={i}>
              <line x1={x} x2={x} y1={100 - c.hi} y2={100 - c.lo} stroke={cc} strokeWidth="0.8" />
              <rect
                x={x - 2.6}
                width="5.2"
                y={100 - Math.max(c.o, c.c)}
                height={Math.max(1.4, Math.abs(c.c - c.o))}
                fill={cc}
                rx="0.6"
              />
            </g>
          );
        })}
      </svg>
      <div
        style={{
          position: "absolute",
          left: 12,
          top: 11,
          display: "flex",
          gap: 8,
          alignItems: "center",
        }}
      >
        {symbol && (
          <span className="mono" style={{ fontWeight: 700, fontSize: 13, color: "var(--tx-1)" }}>
            {symbol}
          </span>
        )}
        <span
          style={{
            fontSize: 10.5,
            fontFamily: "var(--f-mono)",
            color: col,
            background: `color-mix(in srgb, ${col} 16%, transparent)`,
            padding: "2px 7px",
            borderRadius: 5,
            border: `1px solid color-mix(in srgb, ${col} 30%, transparent)`,
            textTransform: "uppercase",
            letterSpacing: ".05em",
            fontWeight: 600,
          }}
        >
          {dir}
        </span>
      </div>
      <div
        style={{
          position: "absolute",
          right: 12,
          bottom: 10,
          fontSize: 10.5,
          fontFamily: "var(--f-mono)",
          color: "var(--tx-3)",
        }}
      >
        {label}
      </div>
    </div>
  );
}
