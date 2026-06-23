/**
 * "Predict the Next Candle" minigame — pure, deterministic domain logic.
 *
 * All randomness flows through a seeded PRNG so a given seed always yields the
 * same candle series. This keeps the game verifiable, makes the logic unit
 * testable, and (matching the ChartFrame approach) avoids any server/client
 * hydration mismatch were a series ever rendered during SSR.
 */

export type PredictMode = "classic" | "turbo" | "extreme";

export type Guess = "up" | "down";

export interface GameCandle {
  /** open */
  o: number;
  /** close */
  c: number;
  /** high */
  hi: number;
  /** low */
  lo: number;
}

export interface ModeConfig {
  key: PredictMode;
  label: string;
  /** Number of candles the player must predict in one game. */
  rounds: number;
  /** XP multiplier applied to every correct guess. */
  multiplier: number;
  /** Base XP awarded per correct guess before the multiplier. */
  baseXp: number;
  /** When true, a single miss forfeits the entire game's XP. */
  allOrNothing: boolean;
  desc: string;
}

/** How many historical candles are revealed before the first prediction. */
export const VISIBLE_HISTORY = 16;

export const PREDICT_MODES: Readonly<Record<PredictMode, ModeConfig>> = {
  classic: {
    key: "classic",
    label: "Clásico",
    rounds: 1,
    multiplier: 1,
    baseXp: 10,
    allOrNothing: false,
    desc: "Una vela. Dificultad normal.",
  },
  turbo: {
    key: "turbo",
    label: "Turbo",
    rounds: 5,
    multiplier: 3,
    baseXp: 10,
    allOrNothing: false,
    desc: "5 velas seguidas. Multiplicador ×3.",
  },
  extreme: {
    key: "extreme",
    label: "Extremo",
    rounds: 10,
    multiplier: 10,
    baseXp: 10,
    allOrNothing: true,
    desc: "10 velas. Multiplicador ×10. Falla una y lo pierdes todo.",
  },
};

export const PREDICT_MODE_ORDER: readonly PredictMode[] = ["classic", "turbo", "extreme"];

/** Total candles a game of `mode` needs: revealed history + one per round. */
export function seriesLength(mode: PredictMode): number {
  return VISIBLE_HISTORY + PREDICT_MODES[mode].rounds;
}

/**
 * mulberry32 — a small, fast, well-distributed seeded PRNG. Returns a function
 * producing deterministic values in [0, 1) for a given 32-bit seed.
 */
function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return function next(): number {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const MIN_PRICE = 1;

/**
 * Generate a deterministic OHLC candle series via a bounded random walk.
 * Each candle opens at the previous close; prices stay strictly positive.
 */
export function generateSeries(seed: number, count: number, start = 100): GameCandle[] {
  const rand = mulberry32(seed);
  const candles: GameCandle[] = [];
  let price = start;

  for (let i = 0; i < count; i++) {
    const open = price;
    const body = (rand() - 0.5) * 6;
    const close = Math.max(MIN_PRICE, open + body);
    const hi = Math.max(open, close) + rand() * 3 + 0.4;
    const lo = Math.max(MIN_PRICE * 0.5, Math.min(open, close) - (rand() * 3 + 0.4));
    candles.push({ o: open, c: close, hi, lo });
    price = close;
  }

  return candles;
}

/** A candle is bullish ("up") when it closes at or above its open. */
export function candleDirection(candle: GameCandle): Guess {
  return candle.c >= candle.o ? "up" : "down";
}

/** True when the player's guess matches the candle's actual direction. */
export function isCorrect(guess: Guess, candle: GameCandle): boolean {
  return guess === candleDirection(candle);
}

/**
 * XP for a finished game. Standard modes pay per correct guess; all-or-nothing
 * modes pay the full pot only on a flawless run, otherwise nothing.
 */
export function computeXp(mode: PredictMode, correctCount: number): number {
  const config = PREDICT_MODES[mode];
  const clamped = Math.max(0, Math.min(config.rounds, Math.floor(correctCount)));
  const pot = clamped * config.baseXp * config.multiplier;
  if (config.allOrNothing) {
    return clamped === config.rounds ? config.rounds * config.baseXp * config.multiplier : 0;
  }
  return pot;
}

/** The maximum XP a mode can award (a perfect run). */
export function maxXp(mode: PredictMode): number {
  const config = PREDICT_MODES[mode];
  return config.rounds * config.baseXp * config.multiplier;
}

/** Advance a streak: a correct guess extends it, a miss resets it to zero. */
export function nextStreak(current: number, correct: boolean): number {
  if (!Number.isFinite(current) || current < 0) return correct ? 1 : 0;
  return correct ? Math.floor(current) + 1 : 0;
}

export interface PredictScore {
  handle: string;
  name: string;
  mode: PredictMode;
  score: number;
  streak: number;
}

/** Sort scores high-to-low, breaking ties by the longer streak. */
export function rankScores(entries: readonly PredictScore[]): PredictScore[] {
  return [...entries].sort((a, b) => b.score - a.score || b.streak - a.streak);
}

/**
 * Insert a new score into a leaderboard, returning a fresh ranked list capped
 * at `limit` entries. The input list is never mutated.
 */
export function submitScore(
  entries: readonly PredictScore[],
  entry: PredictScore,
  limit = 10,
): PredictScore[] {
  return rankScores([...entries, entry]).slice(0, Math.max(0, limit));
}
