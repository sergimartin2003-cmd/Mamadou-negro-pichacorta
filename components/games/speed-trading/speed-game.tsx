"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Icon } from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
import { CandleChart } from "@/components/games/predict-candle/candle-chart";
import {
  generateSeries,
  candleDirection,
  type GameCandle,
  type Guess,
} from "@/lib/domain/predict";
import {
  SPEED_DURATION_S,
  POWERUPS,
  INITIAL_SPEED_STATE,
  applyTrade,
  accuracy,
  powerupSchedule,
  submitSpeedScore,
  type SpeedState,
  type SpeedScore,
  type PowerupSpawn,
} from "@/lib/domain/speed";

type Phase = "idle" | "playing" | "over";

interface SpeedGameProps {
  me: { name: string; handle: string };
  initialBoard: SpeedScore[];
}

const WINDOW = 22;
const SERIES_LEN = 800;
const POWERUP_VISIBLE_S = 6;

export function SpeedGame({ me, initialBoard }: SpeedGameProps) {
  const [phase, setPhase] = useState<Phase>("idle");
  const [timeLeft, setTimeLeft] = useState(SPEED_DURATION_S);
  const [state, setState] = useState<SpeedState>(INITIAL_SPEED_STATE);
  const [series, setSeries] = useState<GameCandle[]>([]);
  const [cursor, setCursor] = useState(WINDOW);
  const [flash, setFlash] = useState<boolean | null>(null);
  const [board, setBoard] = useState<SpeedScore[]>(initialBoard);
  const [schedule, setSchedule] = useState<PowerupSpawn[]>([]);
  const [collected, setCollected] = useState<Set<number>>(new Set());
  const [turboUntil, setTurboUntil] = useState(0);
  const [secondChance, setSecondChance] = useState(false);

  const tick = useRef<ReturnType<typeof setInterval> | null>(null);
  const flashTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const finalRef = useRef<SpeedState>(INITIAL_SPEED_STATE);

  useEffect(() => {
    finalRef.current = state;
  }, [state]);

  const elapsed = SPEED_DURATION_S - timeLeft;
  const turboActive = elapsed < turboUntil;

  const finish = useCallback(() => {
    if (tick.current) clearInterval(tick.current);
    const s = finalRef.current;
    setPhase("over");
    setBoard((prev) =>
      submitSpeedScore(prev, {
        handle: me.handle,
        name: me.name,
        score: s.score,
        trades: s.trades,
        accuracy: accuracy(s.wins, s.trades),
      }),
    );
  }, [me.handle, me.name]);

  const start = useCallback(() => {
    if (tick.current) clearInterval(tick.current);
    const seed = (Date.now() ^ Math.floor(Math.random() * 0xffffffff)) >>> 0;
    setSeries(generateSeries(seed, SERIES_LEN));
    setSchedule(powerupSchedule(seed));
    setCollected(new Set());
    setCursor(WINDOW);
    setState(INITIAL_SPEED_STATE);
    finalRef.current = INITIAL_SPEED_STATE;
    setTimeLeft(SPEED_DURATION_S);
    setTurboUntil(0);
    setSecondChance(false);
    setFlash(null);
    setPhase("playing");

    tick.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          finish();
          return 0;
        }
        return t - 1;
      });
    }, 1000);
  }, [finish]);

  useEffect(
    () => () => {
      if (tick.current) clearInterval(tick.current);
      if (flashTimer.current) clearTimeout(flashTimer.current);
    },
    [],
  );

  const trade = useCallback(
    (g: Guess) => {
      if (phase !== "playing") return;
      const candle = series[cursor];
      if (!candle) return;
      const correct = candleDirection(candle) === g;
      let saved = false;
      if (!correct && secondChance) {
        saved = true;
        setSecondChance(false);
      }
      const mult = turboActive ? POWERUPS.turbo.multiplier : 1;
      setState((s) => (saved ? { ...s, trades: s.trades + 1 } : applyTrade(s, correct, mult)));
      setCursor((c) => Math.min(SERIES_LEN - 1, c + 1));
      setFlash(correct || saved);
      if (flashTimer.current) clearTimeout(flashTimer.current);
      flashTimer.current = setTimeout(() => setFlash(null), 220);
    },
    [phase, series, cursor, secondChance, turboActive],
  );

  const collect = useCallback(
    (spawn: PowerupSpawn, idx: number) => {
      setCollected((prev) => new Set(prev).add(idx));
      if (spawn.kind === "turbo") {
        setTurboUntil(elapsed + POWERUPS.turbo.durationS);
      } else if (spawn.kind === "secondChance") {
        setSecondChance(true);
      }
      // "clarity" is purely cosmetic; collecting it just clears it.
    },
    [elapsed],
  );

  const visibleSpawns =
    phase === "playing"
      ? schedule
          .map((s, i) => ({ s, i }))
          .filter(
            ({ s, i }) =>
              !collected.has(i) && elapsed >= s.at && elapsed < s.at + POWERUP_VISIBLE_S,
          )
      : [];

  const windowCandles = series.slice(Math.max(0, cursor - WINDOW), cursor);
  const acc = accuracy(state.wins, state.trades);

  return (
    <div style={{ maxWidth: 920, margin: "0 auto", display: "flex", flexDirection: "column", gap: 18 }}>
      <div
        className="card"
        style={{
          padding: "18px 22px",
          display: "flex",
          alignItems: "center",
          gap: 18,
          flexWrap: "wrap",
          background: "linear-gradient(110deg, color-mix(in srgb, var(--t-gold) 14%, var(--bg-2)), var(--bg-2) 70%)",
        }}
      >
        <div style={{ width: 48, height: 48, borderRadius: "var(--r-md)", display: "grid", placeItems: "center", background: "color-mix(in srgb, var(--t-gold) 16%, transparent)", border: "1px solid color-mix(in srgb, var(--t-gold) 32%, transparent)", flexShrink: 0 }}>
          <Icon name="bolt" size={24} style={{ color: "var(--t-gold)" }} fill />
        </div>
        <div style={{ flex: 1, minWidth: 180 }}>
          <div className="sec-label" style={{ color: "var(--t-gold)" }}>Minijuego</div>
          <h1 style={{ fontSize: 22, margin: "2px 0" }}>Speed Trading Challenge</h1>
          <div style={{ fontSize: 13, color: "var(--tx-3)" }}>60 segundos. Encadena trades ganadores. +100 acierto · −50 fallo.</div>
        </div>
        <Stat label="Tiempo" value={`${timeLeft}s`} highlight={timeLeft <= 10} />
        <Stat label="Puntos" value={state.score.toLocaleString()} />
        <Stat label="Precisión" value={`${Math.round(acc * 100)}%`} />
      </div>

      <div className="card" style={{ padding: 18, position: "relative", overflow: "hidden" }}>
        <AnimatePresence>
          {flash != null && (
            <motion.div
              key={`${cursor}-${flash}`}
              initial={{ opacity: 0.45 }}
              animate={{ opacity: 0 }}
              transition={{ duration: 0.22 }}
              style={{ position: "absolute", inset: 0, pointerEvents: "none", background: flash ? "var(--profit-dim)" : "var(--loss-dim)", zIndex: 2 }}
            />
          )}
        </AnimatePresence>

        {phase === "idle" ? (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16, padding: "32px 12px", textAlign: "center" }}>
            <p style={{ color: "var(--tx-2)", fontSize: 14, maxWidth: 440, margin: 0 }}>
              Pulsa <strong>Alcista</strong> o <strong>Bajista</strong> tan rápido como puedas. Recoge power-ups que aparecen en pantalla: Turbo (×2), Visión Clara y Segunda Oportunidad.
            </p>
            <Button variant="primary" size="lg" onClick={start}>
              <Icon name="play" size={18} /> Empezar (60s)
            </Button>
          </div>
        ) : (
          <>
            <div style={{ position: "relative" }}>
              <CandleChart candles={windowCandles} revealed={windowCandles.length} height={220} />
              {turboActive && (
                <span className="chip" style={{ position: "absolute", top: 10, right: 10, color: "var(--t-gold)", borderColor: "var(--t-gold)" }}>
                  <Icon name="bolt" size={13} fill /> Turbo ×2
                </span>
              )}
              {secondChance && (
                <span className="chip" style={{ position: "absolute", top: 10, left: 10, color: "var(--brand)", borderColor: "var(--brand-line)" }}>
                  <Icon name="shield" size={13} /> 2ª oportunidad
                </span>
              )}

              {visibleSpawns.map(({ s, i }) => {
                const left = 12 + ((i * 53) % 70);
                return (
                  <motion.button
                    key={i}
                    initial={{ scale: 0.6, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1, y: [0, -6, 0] }}
                    transition={{ y: { repeat: Infinity, duration: 1.1 } }}
                    onClick={() => collect(s, i)}
                    title={POWERUPS[s.kind].desc}
                    style={{
                      position: "absolute",
                      left: `${left}%`,
                      bottom: 16,
                      border: "1px solid var(--brand-line)",
                      background: "var(--brand-dim)",
                      color: "var(--brand)",
                      borderRadius: "var(--r-pill)",
                      padding: "6px 12px",
                      fontSize: 12,
                      fontWeight: 700,
                      cursor: "pointer",
                      boxShadow: "var(--sh-brand)",
                      zIndex: 3,
                    }}
                  >
                    <Icon name={s.kind === "turbo" ? "bolt" : s.kind === "secondChance" ? "shield" : "star"} size={13} /> {POWERUPS[s.kind].label}
                  </motion.button>
                );
              })}
            </div>

            {phase === "playing" ? (
              <div style={{ display: "flex", gap: 12, marginTop: 16 }}>
                <Button variant="profit" size="lg" block onClick={() => trade("up")}>
                  <Icon name="up" size={18} /> Alcista
                </Button>
                <button
                  className="btn lg block"
                  onClick={() => trade("down")}
                  style={{ borderColor: "var(--loss-line)", color: "var(--loss)", background: "var(--loss-dim)" }}
                >
                  <Icon name="down" size={18} /> Bajista
                </button>
              </div>
            ) : (
              <GameOver state={state} acc={acc} onAgain={start} />
            )}
          </>
        )}
      </div>

      <Leaderboard board={board} meHandle={me.handle} />
    </div>
  );
}

function GameOver({ state, acc, onAgain }: { state: SpeedState; acc: number; onAgain: () => void }) {
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} style={{ marginTop: 16, textAlign: "center", display: "flex", flexDirection: "column", gap: 10, alignItems: "center" }}>
      <div style={{ fontFamily: "var(--f-display)", fontSize: 24, fontWeight: 700 }}>¡Tiempo! ⏱️</div>
      <div style={{ fontFamily: "var(--f-mono)", fontSize: 34, fontWeight: 700, color: "var(--t-gold)" }}>{state.score.toLocaleString()} pts</div>
      <div style={{ fontSize: 14, color: "var(--tx-2)" }}>
        {state.trades} trades · {state.wins} ganados · {Math.round(acc * 100)}% precisión
      </div>
      <Button variant="primary" size="lg" onClick={onAgain}>
        <Icon name="play" size={16} /> Otra vez
      </Button>
    </motion.div>
  );
}

function Leaderboard({ board, meHandle }: { board: SpeedScore[]; meHandle: string }) {
  return (
    <div className="card" style={{ padding: 18 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
        <Icon name="trophy" size={18} style={{ color: "var(--t-gold)" }} />
        <h2 style={{ fontSize: 16, margin: 0 }}>Leaderboard mundial</h2>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {board.map((e, i) => {
          const mine = e.handle === meHandle;
          return (
            <div
              key={`${e.handle}-${i}`}
              style={{
                display: "grid",
                gridTemplateColumns: "28px 1fr auto auto",
                alignItems: "center",
                gap: 12,
                padding: "9px 12px",
                borderRadius: "var(--r-sm)",
                background: mine ? "var(--brand-dim)" : "transparent",
                border: mine ? "1px solid var(--brand-line)" : "1px solid transparent",
              }}
            >
              <span className="mono" style={{ color: i < 3 ? "var(--t-gold)" : "var(--tx-3)", fontWeight: 700 }}>{i + 1}</span>
              <span style={{ fontSize: 14, fontWeight: mine ? 700 : 500 }}>
                {e.name}
                {mine && <span style={{ color: "var(--brand)", marginLeft: 6, fontSize: 12 }}>· tú</span>}
              </span>
              <span className="chip" style={{ fontSize: 11 }}>{Math.round(e.accuracy * 100)}%</span>
              <span className="mono" style={{ fontWeight: 700, color: "var(--t-gold)" }}>{e.score.toLocaleString()}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Stat({ label, value, highlight = false }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div style={{ textAlign: "center" }}>
      <div className="mono" style={{ fontWeight: 700, fontSize: 20, color: highlight ? "var(--loss)" : "var(--tx-1)" }}>{value}</div>
      <div className="sec-label" style={{ fontSize: 10 }}>{label}</div>
    </div>
  );
}
