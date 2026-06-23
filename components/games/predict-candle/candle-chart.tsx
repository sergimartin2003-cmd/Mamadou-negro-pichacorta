"use client";

import { useMemo } from "react";
import type { GameCandle, Guess } from "@/lib/domain/predict";

export interface CandleChartProps {
  /** Full generated series; only the first `revealed` candles are drawn. */
  candles: GameCandle[];
  /** How many candles are currently shown. */
  revealed: number;
  /** Show a pulsing "?" slot for the candle the player is predicting. */
  awaiting?: boolean;
  /** Outcome of the candle just revealed, to flash its column. */
  lastOutcome?: Guess | null;
  height?: number;
}

const STEP = 12;
const PAD = 6;
const PROFIT = "#16C784";
const LOSS = "#EA3943";

/**
 * Renders an OHLC candle chart from a precomputed series. The y-scale is fixed
 * across the entire series so the axis never jumps as new candles reveal.
 */
export function CandleChart({
  candles,
  revealed,
  awaiting = false,
  lastOutcome = null,
  height = 240,
}: CandleChartProps) {
  const { min, max } = useMemo(() => {
    let lo = Infinity;
    let hi = -Infinity;
    for (const c of candles) {
      if (c.lo < lo) lo = c.lo;
      if (c.hi > hi) hi = c.hi;
    }
    if (!Number.isFinite(lo) || !Number.isFinite(hi) || hi === lo) {
      return { min: 0, max: 1 };
    }
    return { min: lo, max: hi };
  }, [candles]);

  const slots = candles.length + 1;
  const width = slots * STEP + PAD * 2;
  const span = max - min;
  const y = (price: number) => PAD + (1 - (price - min) / span) * (height - PAD * 2);

  const shown = candles.slice(0, revealed);
  const lastIdx = revealed - 1;

  return (
    <div
      style={{
        position: "relative",
        height,
        borderRadius: "var(--r-md)",
        overflow: "hidden",
        background: "linear-gradient(180deg, var(--bg-3), var(--bg-2))",
        border: "1px solid var(--line-1)",
      }}
    >
      <svg
        width="100%"
        height="100%"
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="none"
        style={{ position: "absolute", inset: 0 }}
      >
        {[0.2, 0.4, 0.6, 0.8].map((f) => (
          <line
            key={f}
            x1="0"
            x2={width}
            y1={PAD + f * (height - PAD * 2)}
            y2={PAD + f * (height - PAD * 2)}
            stroke="rgba(255,255,255,0.04)"
            strokeWidth="1"
          />
        ))}

        {shown.map((c, i) => {
          const x = PAD + i * STEP + STEP / 2;
          const green = c.c >= c.o;
          const col = green ? PROFIT : LOSS;
          const flash = i === lastIdx && lastOutcome != null;
          const top = y(Math.max(c.o, c.c));
          const bodyH = Math.max(1.5, Math.abs(y(c.o) - y(c.c)));
          return (
            <g key={i} opacity={flash ? 1 : 0.95}>
              {flash && (
                <rect
                  x={x - STEP / 2}
                  width={STEP}
                  y={0}
                  height={height}
                  fill={col}
                  opacity={0.12}
                />
              )}
              <line x1={x} x2={x} y1={y(c.hi)} y2={y(c.lo)} stroke={col} strokeWidth="1.4" />
              <rect
                x={x - 3.4}
                width="6.8"
                y={top}
                height={bodyH}
                fill={col}
                rx="1"
              />
            </g>
          );
        })}

        {awaiting && revealed < candles.length && (
          <line
            x1={PAD + revealed * STEP + STEP / 2}
            x2={PAD + revealed * STEP + STEP / 2}
            y1={PAD}
            y2={height - PAD}
            stroke="var(--brand)"
            strokeWidth="1.2"
            strokeDasharray="3 4"
            opacity={0.7}
          >
            <animate attributeName="opacity" values="0.25;0.8;0.25" dur="1.1s" repeatCount="indefinite" />
          </line>
        )}
      </svg>

      {awaiting && revealed < candles.length && (
        <div
          style={{
            position: "absolute",
            left: `calc(${((PAD + revealed * STEP + STEP / 2) / width) * 100}% )`,
            top: 10,
            transform: "translateX(-50%)",
            fontFamily: "var(--f-mono)",
            fontSize: 18,
            fontWeight: 700,
            color: "var(--brand)",
          }}
        >
          ?
        </div>
      )}
    </div>
  );
}
