"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Icon } from "@/components/ui/icon";
import { Segmented } from "@/components/ui/segmented";
import { Button } from "@/components/ui/button";
import { CandleChart } from "./candle-chart";
import {
  PREDICT_MODES,
  PREDICT_MODE_ORDER,
  VISIBLE_HISTORY,
  seriesLength,
  generateSeries,
  candleDirection,
  isCorrect,
  computeXp,
  maxXp,
  nextStreak,
  submitScore,
  type PredictMode,
  type Guess,
  type GameCandle,
  type PredictScore,
} from "@/lib/domain/predict";

type Phase = "idle" | "playing" | "over";

interface PredictGameProps {
  me: { name: string; handle: string };
  initialBoard: PredictScore[];
}

const REVEAL_MS = 750;

/** Short ascending/descending blip via WebAudio; silently no-ops if unavailable. */
function blip(correct: boolean, muted: boolean): void {
  if (muted || typeof window === "undefined") return;
  try {
    const Ctx =
      window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctx) return;
    const ctx = new Ctx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.value = correct ? 660 : 220;
    gain.gain.setValueAtTime(0.06, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.22);
    osc.connect(gain).connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.24);
    osc.onended = () => ctx.close();
  } catch {
    /* audio is best-effort only */
  }
}

const MODE_OPTIONS = PREDICT_MODE_ORDER.map((k) => ({ k, label: PREDICT_MODES[k].label }));

export function PredictGame({ me, initialBoard }: PredictGameProps) {
  const [phase, setPhase] = useState<Phase>("idle");
  const [mode, setMode] = useState<PredictMode>("classic");
  const [series, setSeries] = useState<GameCandle[]>([]);
  const [revealed, setRevealed] = useState(VISIBLE_HISTORY);
  const [round, setRound] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [streak, setStreak] = useState(0);
  const [best, setBest] = useState(0);
  const [lastOutcome, setLastOutcome] = useState<Guess | null>(null);
  const [lastHit, setLastHit] = useState<boolean | null>(null);
  const [locked, setLocked] = useState(false);
  const [muted, setMuted] = useState(false);
  const [board, setBoard] = useState<PredictScore[]>(initialBoard);
  const [earned, setEarned] = useState(0);

  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);

  const config = PREDICT_MODES[mode];

  const start = useCallback(() => {
    if (timer.current) clearTimeout(timer.current);
    const seed = (Date.now() ^ Math.floor(Math.random() * 0xffffffff)) >>> 0;
    setSeries(generateSeries(seed, seriesLength(mode)));
    setRevealed(VISIBLE_HISTORY);
    setRound(0);
    setCorrect(0);
    setLastOutcome(null);
    setLastHit(null);
    setLocked(false);
    setEarned(0);
    setPhase("playing");
  }, [mode]);

  const finish = useCallback(
    (finalCorrect: number, finalStreak: number) => {
      const xp = computeXp(mode, finalCorrect);
      setEarned(xp);
      setPhase("over");
      setBoard((prev) =>
        submitScore(prev, { handle: me.handle, name: me.name, mode, score: xp, streak: finalStreak }),
      );
    },
    [mode, me.handle, me.name],
  );

  const guess = useCallback(
    (g: Guess) => {
      if (phase !== "playing" || locked) return;
      const candle = series[revealed];
      if (!candle) return;
      const hit = isCorrect(g, candle);
      const newStreak = nextStreak(streak, hit);
      const newCorrect = correct + (hit ? 1 : 0);

      setLocked(true);
      setRevealed((r) => r + 1);
      setLastOutcome(candleDirection(candle));
      setLastHit(hit);
      setStreak(newStreak);
      setBest((b) => Math.max(b, newStreak));
      setCorrect(newCorrect);
      blip(hit, muted);

      const isLastRound = round + 1 >= config.rounds;
      const bustEarly = config.allOrNothing && !hit;

      timer.current = setTimeout(() => {
        if (isLastRound || bustEarly) {
          finish(newCorrect, newStreak);
        } else {
          setRound((r) => r + 1);
          setLastOutcome(null);
          setLastHit(null);
          setLocked(false);
        }
      }, REVEAL_MS);
    },
    [phase, locked, series, revealed, streak, correct, muted, round, config, finish],
  );

  const showConfetti = phase === "over" && earned > 0;

  return (
    <div style={{ maxWidth: 920, margin: "0 auto", display: "flex", flexDirection: "column", gap: 18 }}>
      <Header mode={mode} streak={streak} best={best} muted={muted} onMute={() => setMuted((m) => !m)} />

      <div className="card" style={{ padding: 18, position: "relative", overflow: "hidden" }}>
        <AnimatePresence>
          {lastHit != null && (
            <motion.div
              key={`${revealed}-${lastHit}`}
              initial={{ opacity: 0.5 }}
              animate={{ opacity: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6 }}
              style={{
                position: "absolute",
                inset: 0,
                pointerEvents: "none",
                background: lastHit ? "var(--profit-dim)" : "var(--loss-dim)",
                zIndex: 2,
              }}
            />
          )}
        </AnimatePresence>

        {phase === "idle" ? (
          <IdleScreen
            mode={mode}
            onMode={setMode}
            onStart={start}
            options={MODE_OPTIONS}
            desc={config.desc}
            potential={maxXp(mode)}
          />
        ) : (
          <>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12, flexWrap: "wrap", gap: 8 }}>
              <div className="sec-label" style={{ color: "var(--brand)" }}>
                {config.label} · vela {Math.min(round + 1, config.rounds)} / {config.rounds}
              </div>
              <div style={{ display: "flex", gap: 14 }}>
                <Metric label="Aciertos" value={`${correct}/${config.rounds}`} />
                <Metric label="Racha" value={`🔥 ${streak}`} />
              </div>
            </div>

            <CandleChart
              candles={series}
              revealed={revealed}
              awaiting={phase === "playing" && !locked}
              lastOutcome={lastOutcome}
            />

            {phase === "playing" ? (
              <div style={{ display: "flex", gap: 12, marginTop: 16 }}>
                <Button
                  variant="profit"
                  size="lg"
                  block
                  disabled={locked}
                  onClick={() => guess("up")}
                >
                  <Icon name="up" size={18} /> Alcista
                </Button>
                <button
                  className="btn lg block"
                  disabled={locked}
                  onClick={() => guess("down")}
                  style={{
                    borderColor: "var(--loss-line)",
                    color: "var(--loss)",
                    background: "var(--loss-dim)",
                  }}
                >
                  <Icon name="down" size={18} /> Bajista
                </button>
              </div>
            ) : (
              <GameOver
                mode={mode}
                correct={correct}
                earned={earned}
                best={best}
                onAgain={start}
                onChangeMode={() => setPhase("idle")}
              />
            )}
          </>
        )}

        <AnimatePresence>{showConfetti && <Confetti />}</AnimatePresence>
      </div>

      <Leaderboard board={board} meHandle={me.handle} />
    </div>
  );
}

function Header({
  mode,
  streak,
  best,
  muted,
  onMute,
}: {
  mode: PredictMode;
  streak: number;
  best: number;
  muted: boolean;
  onMute: () => void;
}) {
  void mode;
  return (
    <div
      className="card"
      style={{
        padding: "18px 22px",
        display: "flex",
        alignItems: "center",
        gap: 18,
        flexWrap: "wrap",
        background: "linear-gradient(110deg, color-mix(in srgb, var(--brand) 14%, var(--bg-2)), var(--bg-2) 70%)",
      }}
    >
      <div style={{ width: 48, height: 48, borderRadius: "var(--r-md)", display: "grid", placeItems: "center", background: "var(--brand-dim)", border: "1px solid var(--brand-line)", flexShrink: 0 }}>
        <Icon name="trend" size={24} style={{ color: "var(--brand)" }} />
      </div>
      <div style={{ flex: 1, minWidth: 180 }}>
        <div className="sec-label" style={{ color: "var(--brand)" }}>Minijuego</div>
        <h1 style={{ fontSize: 22, margin: "2px 0" }}>Predict the Next Candle</h1>
        <div style={{ fontSize: 13, color: "var(--tx-3)" }}>¿Alcista o bajista? Acierta para sumar XP y racha.</div>
      </div>
      <div style={{ display: "flex", gap: 18, alignItems: "center" }}>
        <Metric label="Racha actual" value={`🔥 ${streak}`} />
        <Metric label="Mejor racha" value={String(best)} />
        <button className="chip" onClick={onMute} aria-label={muted ? "Activar sonido" : "Silenciar"}>
          <Icon name={muted ? "close" : "bolt"} size={14} /> {muted ? "Silencio" : "Sonido"}
        </button>
      </div>
    </div>
  );
}

function IdleScreen({
  mode,
  onMode,
  onStart,
  options,
  desc,
  potential,
}: {
  mode: PredictMode;
  onMode: (m: PredictMode) => void;
  onStart: () => void;
  options: { k: PredictMode; label: string }[];
  desc: string;
  potential: number;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16, padding: "32px 12px", textAlign: "center" }}>
      <div className="sec-label">Elige modo</div>
      <Segmented options={options} value={mode} onChange={(k) => onMode(k as PredictMode)} />
      <p style={{ color: "var(--tx-2)", fontSize: 14, maxWidth: 420, margin: 0 }}>{desc}</p>
      <div style={{ fontSize: 13, color: "var(--tx-3)" }}>
        XP máxima: <span className="mono" style={{ color: "var(--t-gold)" }}>{potential}</span>
      </div>
      <Button variant="primary" size="lg" onClick={onStart}>
        <Icon name="play" size={18} /> Empezar
      </Button>
    </div>
  );
}

function GameOver({
  mode,
  correct,
  earned,
  best,
  onAgain,
  onChangeMode,
}: {
  mode: PredictMode;
  correct: number;
  earned: number;
  best: number;
  onAgain: () => void;
  onChangeMode: () => void;
}) {
  const config = PREDICT_MODES[mode];
  const perfect = correct === config.rounds;
  const busted = config.allOrNothing && !perfect;
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      style={{ marginTop: 16, textAlign: "center", display: "flex", flexDirection: "column", gap: 12, alignItems: "center" }}
    >
      <div style={{ fontFamily: "var(--f-display)", fontSize: 24, fontWeight: 700 }}>
        {perfect ? "¡Ronda perfecta! 🎯" : busted ? "Fallaste — sin XP 💥" : "Fin de la ronda"}
      </div>
      <div style={{ fontSize: 14, color: "var(--tx-2)" }}>
        {correct}/{config.rounds} aciertos · mejor racha {best}
      </div>
      <div
        style={{
          fontFamily: "var(--f-mono)",
          fontSize: 32,
          fontWeight: 700,
          color: earned > 0 ? "var(--t-gold)" : "var(--tx-3)",
        }}
      >
        +{earned} XP
      </div>
      <div style={{ display: "flex", gap: 12 }}>
        <Button variant="primary" size="lg" onClick={onAgain}>
          <Icon name="play" size={16} /> Otra vez
        </Button>
        <Button size="lg" onClick={onChangeMode}>Cambiar modo</Button>
      </div>
    </motion.div>
  );
}

function Leaderboard({ board, meHandle }: { board: PredictScore[]; meHandle: string }) {
  return (
    <div className="card" style={{ padding: 18 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
        <Icon name="trophy" size={18} style={{ color: "var(--t-gold)" }} />
        <h2 style={{ fontSize: 16, margin: 0 }}>Leaderboard</h2>
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
              <span className="mono" style={{ color: i < 3 ? "var(--t-gold)" : "var(--tx-3)", fontWeight: 700 }}>
                {i + 1}
              </span>
              <span style={{ fontSize: 14, fontWeight: mine ? 700 : 500 }}>
                {e.name}
                {mine && <span style={{ color: "var(--brand)", marginLeft: 6, fontSize: 12 }}>· tú</span>}
              </span>
              <span className="chip" style={{ fontSize: 11 }}>{PREDICT_MODES[e.mode].label}</span>
              <span className="mono" style={{ fontWeight: 700, color: "var(--t-gold)" }}>{e.score}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ textAlign: "center" }}>
      <div className="mono" style={{ fontWeight: 700, fontSize: 18 }}>{value}</div>
      <div className="sec-label" style={{ fontSize: 10 }}>{label}</div>
    </div>
  );
}

const CONFETTI_COLORS = ["#9B5CFF", "#16C784", "#F2B33D", "#56A8FF", "#FF5C8A"];

function Confetti() {
  const pieces = Array.from({ length: 28 }, (_, i) => i);
  return (
    <div style={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "hidden", zIndex: 3 }}>
      {pieces.map((i) => {
        const left = (i * 37) % 100;
        const delay = (i % 7) * 0.05;
        const color = CONFETTI_COLORS[i % CONFETTI_COLORS.length];
        return (
          <motion.div
            key={i}
            initial={{ y: -20, opacity: 1, rotate: 0 }}
            animate={{ y: 320, opacity: 0, rotate: 360 }}
            transition={{ duration: 1.4, delay, ease: "easeIn" }}
            style={{
              position: "absolute",
              left: `${left}%`,
              top: 0,
              width: 8,
              height: 12,
              borderRadius: 2,
              background: color,
            }}
          />
        );
      })}
    </div>
  );
}
