"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import type { Profile } from "@/types/db";
import { Avatar, Button, Chip, Icon, Pnl, VerifiedTick } from "@/components/ui";

export interface RightPanelProps {
  topTraders: Profile[];
  suggested: Profile[];
}

const RANK_COLORS = ["var(--t-gold)", "var(--t-silver)", "var(--t-bronze)"] as const;
const TRENDING = ["#BTC", "#NQ", "#riskmanagement", "#GBPUSD", "#earnings", "#scalping", "#SOL"];

export function RightPanel({ topTraders, suggested }: RightPanelProps) {
  return (
    <aside
      className="scroll th-rightpanel"
      style={{
        width: "var(--right-w)",
        flexShrink: 0,
        height: "100%",
        borderLeft: "1px solid var(--line-1)",
        padding: 18,
        flexDirection: "column",
        gap: 16,
      }}
    >
      <div className="card" style={{ overflow: "hidden" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "14px 16px 10px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Icon name="trophy" size={17} style={{ color: "var(--t-gold)" }} />
            <strong style={{ fontFamily: "var(--f-display)", fontSize: 14.5 }}>Global Top</strong>
          </div>
          <Link href="/rankings">
            <Chip tag>Season 7</Chip>
          </Link>
        </div>
        {topTraders.map((trader, i) => (
          <Link
            key={trader.id}
            href={`/profile/${trader.handle}`}
            className="th-toptrader"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 11,
              padding: "9px 16px",
            }}
          >
            <span
              className="mono"
              style={{
                width: 18,
                fontWeight: 700,
                fontSize: 13,
                color: RANK_COLORS[i] ?? "var(--tx-3)",
              }}
            >
              {i + 1}
            </span>
            <Avatar user={trader} size={30} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  fontWeight: 600,
                  fontSize: 13,
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                }}
              >
                {trader.name.split(" ")[0]} {trader.verified && <VerifiedTick size={12} />}
              </div>
              <div className="mono" style={{ fontSize: 11, color: "var(--tx-3)" }}>
                {trader.rp.toLocaleString()} RP
              </div>
            </div>
            <Pnl value={trader.pnl} suffix="%" />
          </Link>
        ))}
        <Link href="/rankings">
          <Button
            variant="ghost"
            size="sm"
            block
            style={{ borderRadius: 0, borderTop: "1px solid var(--line-1)", height: 40 }}
          >
            See full leaderboard <Icon name="chevR" size={15} />
          </Button>
        </Link>
      </div>

      <div
        className="card pad"
        style={{
          background:
            "linear-gradient(150deg, color-mix(in srgb, var(--brand) 14%, var(--bg-2)), var(--bg-2))",
          borderColor: "var(--brand-line)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
          <Icon name="swords" size={16} style={{ color: "var(--brand)" }} />
          <span className="sec-label" style={{ color: "#c9b1ff" }}>
            Live competition
          </span>
        </div>
        <div style={{ fontFamily: "var(--f-display)", fontSize: 16, fontWeight: 600, marginBottom: 4 }}>
          May Crypto League
        </div>
        <div style={{ fontSize: 12.5, color: "var(--tx-3)", marginBottom: 12 }}>
          You&apos;re <span className="mono" style={{ color: "var(--tx-1)" }}>#142</span> of 4,820 · ends in 6d
        </div>
        <Link href="/competitions">
          <Button variant="primary" size="sm" block>
            View standings
          </Button>
        </Link>
      </div>

      <div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
          <span className="sec-label">Suggested for you</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {suggested.map((trader) => (
            <motion.div
              key={trader.id}
              whileHover={{ y: -2 }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
              className="card"
              style={{ display: "flex", alignItems: "center", gap: 11, padding: "10px 12px" }}
            >
              <Avatar user={trader} size={36} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600, fontSize: 13, display: "flex", alignItems: "center", gap: 4 }}>
                  {trader.name} {trader.verified && <VerifiedTick size={12} />}
                </div>
                <div className="mono" style={{ fontSize: 11, color: "var(--tx-3)" }}>
                  {trader.market} · {trader.win}% win
                </div>
              </div>
              <Button size="sm">Follow</Button>
            </motion.div>
          ))}
        </div>
      </div>

      <div>
        <div className="sec-label" style={{ marginBottom: 10 }}>
          Trending
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
          {TRENDING.map((tag) => (
            <Chip key={tag} tag>
              {tag}
            </Chip>
          ))}
        </div>
      </div>
    </aside>
  );
}
