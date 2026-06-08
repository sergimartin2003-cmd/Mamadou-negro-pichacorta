"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

interface Stat {
  value: string;
  label: string;
}

const STATS: readonly Stat[] = [
  { value: "182,400", label: "verified traders climbing the ranks" },
  { value: "$4.2B", label: "in tracked P&L across live accounts" },
  { value: "1,950", label: "competitions settled this season" },
  { value: "96%", label: "of pros say status keeps them sharp" },
] as const;

const ROTATE_MS = 4200;

export function SocialProof() {
  const reduce = useReducedMotion();
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (reduce) return;
    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1) % STATS.length);
    }, ROTATE_MS);
    return () => window.clearInterval(timer);
  }, [reduce]);

  const stat = STATS[index];

  return (
    <div style={{ minHeight: 92 }}>
      <AnimatePresence mode="wait">
        <motion.div
          key={stat.label}
          initial={reduce ? false : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduce ? undefined : { opacity: 0, y: -10 }}
          transition={{ duration: 0.4, ease: [0.2, 0.7, 0.2, 1] }}
        >
          <div
            className="display"
            style={{ fontSize: 38, fontWeight: 700, color: "#fff", letterSpacing: "-0.03em" }}
          >
            {stat.value}
          </div>
          <div style={{ fontSize: 14, color: "rgba(255,255,255,0.7)", marginTop: 4 }}>
            {stat.label}
          </div>
        </motion.div>
      </AnimatePresence>

      <div style={{ display: "flex", gap: 6, marginTop: 18 }}>
        {STATS.map((entry, dot) => (
          <span
            key={entry.label}
            style={{
              width: dot === index ? 22 : 7,
              height: 7,
              borderRadius: 999,
              background: dot === index ? "#fff" : "rgba(255,255,255,0.3)",
              transition: "width .3s ease, background .3s ease",
            }}
          />
        ))}
      </div>
    </div>
  );
}
