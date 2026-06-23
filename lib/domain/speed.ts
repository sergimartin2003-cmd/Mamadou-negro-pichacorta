/**
 * "Speed Trading Challenge" minigame — pure, testable scoring & rules.
 *
 * 60-second sprint: the player rapidly takes long/short calls against a fast,
 * seeded price stream. A correct call banks points, a wrong one costs points.
 * Random power-ups can temporarily multiply scoring.
 */

export const SPEED_DURATION_S = 60;
export const WIN_POINTS = 100;
export const LOSS_POINTS = -50;

export type PowerupKind = "turbo" | "clarity" | "secondChance";

export interface PowerupConfig {
  kind: PowerupKind;
  label: string;
  /** How long the effect lasts once collected, in seconds. */
  durationS: number;
  /** Scoring multiplier applied while active (1 = no change). */
  multiplier: number;
  desc: string;
}

export const POWERUPS: Readonly<Record<PowerupKind, PowerupConfig>> = {
  turbo: {
    kind: "turbo",
    label: "Turbo",
    durationS: 5,
    multiplier: 2,
    desc: "Puntuación ×2 durante 5s.",
  },
  clarity: {
    kind: "clarity",
    label: "Visión Clara",
    durationS: 10,
    multiplier: 1,
    desc: "El gráfico se vuelve más legible 10s.",
  },
  secondChance: {
    kind: "secondChance",
    label: "Segunda Oportunidad",
    durationS: 0,
    multiplier: 1,
    desc: "Revierte tu próxima operación perdedora.",
  },
};

export const POWERUP_KINDS: readonly PowerupKind[] = ["turbo", "clarity", "secondChance"];

export interface SpeedState {
  score: number;
  trades: number;
  wins: number;
}

export const INITIAL_SPEED_STATE: SpeedState = { score: 0, trades: 0, wins: 0 };

/** Points for a single trade given correctness and an active multiplier. */
export function tradeDelta(correct: boolean, multiplier = 1): number {
  const mult = Number.isFinite(multiplier) && multiplier > 0 ? multiplier : 1;
  return correct ? WIN_POINTS * mult : LOSS_POINTS;
}

/**
 * Apply a resolved trade to the running state. Score is floored at 0 so a run
 * can never go negative (arcade-friendly). Pure — returns a new object.
 */
export function applyTrade(state: SpeedState, correct: boolean, multiplier = 1): SpeedState {
  return {
    score: Math.max(0, state.score + tradeDelta(correct, multiplier)),
    trades: state.trades + 1,
    wins: state.wins + (correct ? 1 : 0),
  };
}

/** Accuracy as a 0–1 fraction; zero trades → 0. */
export function accuracy(wins: number, trades: number): number {
  if (trades <= 0) return 0;
  return Math.max(0, Math.min(1, wins / trades));
}

export interface PowerupSpawn {
  /** Seconds from the start of the run when the power-up appears. */
  at: number;
  kind: PowerupKind;
}

function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return function next(): number {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Deterministic power-up spawn schedule for a run: one candidate every
 * ~`gapS` seconds, each a seeded random kind. Used so spawns are reproducible
 * and unit-testable.
 */
export function powerupSchedule(seed: number, durationS = SPEED_DURATION_S, gapS = 8): PowerupSpawn[] {
  const rand = mulberry32(seed);
  const spawns: PowerupSpawn[] = [];
  for (let at = gapS; at < durationS; at += gapS) {
    const idx = Math.floor(rand() * POWERUP_KINDS.length) % POWERUP_KINDS.length;
    spawns.push({ at, kind: POWERUP_KINDS[idx] });
  }
  return spawns;
}

export interface SpeedScore {
  handle: string;
  name: string;
  score: number;
  trades: number;
  accuracy: number;
}

/** Sort high-to-low by score, breaking ties by accuracy. */
export function rankSpeedScores(entries: readonly SpeedScore[]): SpeedScore[] {
  return [...entries].sort((a, b) => b.score - a.score || b.accuracy - a.accuracy);
}

/** Insert a score and return a fresh ranked list capped at `limit`. */
export function submitSpeedScore(
  entries: readonly SpeedScore[],
  entry: SpeedScore,
  limit = 10,
): SpeedScore[] {
  return rankSpeedScores([...entries, entry]).slice(0, Math.max(0, limit));
}
