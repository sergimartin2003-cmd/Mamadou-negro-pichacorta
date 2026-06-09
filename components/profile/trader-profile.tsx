"use client";

import { useState } from "react";
import type { Post, Profile } from "@/types/db";
import {
  Avatar,
  RankBadge,
  VerifiedTick,
  StatCard,
  Sparkline,
  Progress,
  Segmented,
  Icon,
} from "@/components/ui";
import { tierFor, nextTier, tierProgress } from "@/lib/domain/tiers";
import { formatCompact } from "@/lib/utils";
import { PostCard } from "@/components/feed/post-card";
import { AchievementBadge } from "./achievement-badge";
import { TradesTable } from "./trades-table";
import { NicheCards } from "./niche-cards";
import { getNiche } from "@/config/niches";
import { getAchievements, type NicheStatRow } from "@/lib/data/queries";

type ProfileTab = "Posts" | "Trades" | "Stats" | "Achievements";
type CurveRange = "1M" | "3M" | "1Y" | "All";

const TABS: ProfileTab[] = ["Posts", "Trades", "Stats", "Achievements"];
const CURVE_RANGES: CurveRange[] = ["1M", "3M", "1Y", "All"];

const PERF_BY_MARKET: Array<[string, number, string]> = [
  ["Crypto", 72, "var(--profit)"],
  ["Forex", 58, "var(--t-diamond)"],
  ["Futures", 41, "var(--t-gold)"],
];

const RISK_DISCIPLINE_ROWS: Array<[string, string]> = [
  ["Avg R:R", "2.8 : 1"],
  ["Avg risk / trade", "1.4%"],
  ["Profit factor", "2.31"],
  ["Sharpe (est.)", "1.92"],
  ["Days green", "64%"],
];

function deterministicSpark(seed: number, len: number, ascending: boolean): number[] {
  const result: number[] = [];
  let v = 50 + seed;
  for (let i = 0; i < len; i++) {
    const delta = ((seed * (i + 1) * 7) % 17) - 8;
    v = Math.max(10, Math.min(95, v + delta * (ascending ? 1 : -1)));
    result.push(v);
  }
  return result;
}

interface TraderProfileProps {
  profile: Profile;
  isMe?: boolean;
  posts?: Post[];
  nicheStats?: NicheStatRow[];
}

export function TraderProfile({
  profile: u,
  isMe = false,
  posts = [],
  nicheStats = [],
}: TraderProfileProps) {
  const [tab, setTab] = useState<ProfileTab>("Posts");
  const [curveRange, setCurveRange] = useState<CurveRange>("1Y");
  const [following, setFollowing] = useState(false);
  const [achievements, setAchievements] = useState<Awaited<ReturnType<typeof getAchievements>>>([]);
  const [achievementsLoaded, setAchievementsLoaded] = useState(false);

  const tier = tierFor(u.rp);
  const nt = nextTier(u.rp);
  const progress = tierProgress(u.rp);

  // Identity is shared across niches; label by the user's primary niche, not
  // the trading-only `market` field. nicheStats is in canonical niche order.
  const primaryMember = nicheStats[0] ? getNiche(nicheStats[0].niche).copy.member : "trader";

  const myPosts = posts.filter((p) => p.author === u.id);

  const stats = [
    {
      label: "Win rate",
      value: u.win + "%",
      accent: "var(--profit)",
      spark: deterministicSpark(2, 20, true),
    },
    {
      label: "Total PnL",
      value: "+" + u.pnl + "%",
      accent: "var(--profit)",
      spark: deterministicSpark(5, 20, true),
    },
    {
      label: "Max drawdown",
      value: "-" + u.dd + "%",
      accent: "var(--loss)",
      spark: deterministicSpark(9, 20, false),
    },
    {
      label: "Consistency",
      value: u.consistency + "%",
      accent: "var(--t-platinum)",
      spark: deterministicSpark(3, 20, true),
    },
    {
      label: "Total trades",
      value: u.trades.toLocaleString(),
      accent: "var(--tx-1)",
      spark: undefined,
    },
    {
      label: "Win streak",
      value: String(u.streak),
      accent: "var(--t-gold)",
      spark: undefined,
    },
  ] as const;

  const equityCurve = deterministicSpark(7, 60, true);

  function handleTabClick(next: string) {
    setTab(next as ProfileTab);
    if (next === "Achievements" && !achievementsLoaded) {
      getAchievements().then((data) => {
        setAchievements(data);
        setAchievementsLoaded(true);
      });
    }
  }

  const displayName = u.name.replace(/^You · /, "");

  return (
    <div
      style={{
        maxWidth: 920,
        margin: "0 auto",
        display: "flex",
        flexDirection: "column",
        gap: 16,
        padding: "16px 0 40px",
      }}
    >
      {/* Cover + identity */}
      <div className="card" style={{ overflow: "hidden", padding: 0 }}>
        <div
          style={{
            height: 128,
            position: "relative",
            background: `linear-gradient(120deg, color-mix(in srgb, ${tier.color} 35%, var(--bg-2)), color-mix(in srgb, var(--brand) 22%, var(--bg-2)) 60%, var(--bg-2))`,
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "repeating-linear-gradient(135deg, rgba(255,255,255,0.03) 0 12px, transparent 12px 24px)",
            }}
          />
        </div>

        <div style={{ padding: "0 24px 22px", position: "relative" }}>
          <div
            style={{
              display: "flex",
              alignItems: "flex-end",
              gap: 18,
              marginTop: -44,
              flexWrap: "wrap",
            }}
          >
            <Avatar user={u} size={104} ring={tier.color} />
            <div style={{ flex: 1, paddingBottom: 6, minWidth: 160 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 9, flexWrap: "wrap" }}>
                <h1 style={{ fontSize: 26 }}>{displayName}</h1>
                {u.verified && <VerifiedTick size={20} />}
              </div>
              <div className="mono" style={{ color: "var(--tx-3)", fontSize: 13, marginTop: 3 }}>
                @{u.handle} · {u.flag} {u.country} · {primaryMember}
              </div>
            </div>
            {!isMe && (
              <div style={{ display: "flex", gap: 9, paddingBottom: 6 }}>
                <button className="btn">
                  <Icon name="chat" size={16} /> Message
                </button>
                <button
                  className={`btn ${following ? "" : "primary"}`}
                  onClick={() => setFollowing((f) => !f)}
                >
                  <Icon name={following ? "check" : "plus"} size={16} sw={2.4} />
                  {following ? "Following" : "Follow"}
                </button>
              </div>
            )}
            {isMe && (
              <div style={{ paddingBottom: 6 }}>
                <button className="btn">
                  <Icon name="gear" size={16} /> Edit profile
                </button>
              </div>
            )}
          </div>

          <div
            style={{
              display: "flex",
              gap: 24,
              alignItems: "center",
              marginTop: 16,
              flexWrap: "wrap",
            }}
          >
            <RankBadge rp={u.rp} size="lg" />
            <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
              {(
                [
                  ["Followers", formatCompact(u.followers)],
                  ["Following", String(u.following)],
                  ["EP", u.rp.toLocaleString()],
                ] as const
              ).map(([l, v]) => (
                <div key={l}>
                  <span className="mono" style={{ fontWeight: 700, fontSize: 15 }}>
                    {v}
                  </span>{" "}
                  <span style={{ color: "var(--tx-3)", fontSize: 12.5 }}>{l}</span>
                </div>
              ))}
            </div>
          </div>

          <p
            style={{
              fontSize: 13.5,
              color: "var(--tx-2)",
              lineHeight: 1.5,
              margin: "14px 0 0",
              maxWidth: 620,
            }}
          >
            {u.bio}
          </p>

          {nt && (
            <div
              style={{
                marginTop: 18,
                padding: "14px 16px",
                borderRadius: "var(--r-md)",
                background: "var(--bg-3)",
                border: "1px solid var(--line-1)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 9,
                  fontSize: 12.5,
                }}
              >
                <span style={{ color: "var(--tx-2)" }}>
                  Progress to{" "}
                  <span style={{ color: nt.color, fontWeight: 700 }}>{nt.name}</span>
                </span>
                <span className="mono" style={{ color: "var(--tx-3)" }}>
                  {u.rp.toLocaleString()} / {nt.min.toLocaleString()} RP
                </span>
              </div>
              <Progress value={progress} color={tier.color} glow h={9} />
            </div>
          )}
        </div>
      </div>

      {/* Per-niche competitive cards — one card per niche the user competes in */}
      {nicheStats.length > 0 && <NicheCards rows={nicheStats} />}

      {/* Primary-niche stats dashboard — 6 cols → 3 cols → 2 cols */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))",
          gap: 12,
        }}
      >
        {stats.map((s) => (
          <StatCard
            key={s.label}
            label={s.label}
            value={s.value}
            accent={s.accent}
            spark={s.spark}
            sparkColor={s.accent}
          />
        ))}
      </div>

      {/* Equity curve */}
      <div className="card pad">
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 14,
            flexWrap: "wrap",
            gap: 10,
          }}
        >
          <strong style={{ fontFamily: "var(--f-display)", fontSize: 15 }}>
            Verified equity curve
          </strong>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span className="chip tag">
              <Icon name="verified" size={12} style={{ color: "var(--t-diamond)" }} /> Broker-synced
            </span>
            <Segmented
              options={CURVE_RANGES}
              value={curveRange}
              onChange={(k) => setCurveRange(k as CurveRange)}
              size="sm"
            />
          </div>
        </div>
        <div style={{ width: "100%", overflowX: "hidden" }}>
          <Sparkline data={equityCurve} w={840} h={150} color="var(--profit)" sw={2.2} />
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 4, borderBottom: "1px solid var(--line-1)" }}>
        {TABS.map((x) => (
          <button
            key={x}
            onClick={() => handleTabClick(x)}
            style={{
              border: "none",
              background: "transparent",
              padding: "12px 16px",
              fontSize: 14,
              fontWeight: 600,
              color: tab === x ? "var(--tx-1)" : "var(--tx-3)",
              borderBottom: `2px solid ${tab === x ? "var(--brand)" : "transparent"}`,
              marginBottom: -1,
              transition: "all .14s",
            }}
          >
            {x}
          </button>
        ))}
      </div>

      {tab === "Posts" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {myPosts.length === 0 && (
            <div
              className="card pad"
              style={{ textAlign: "center", color: "var(--tx-3)", fontSize: 13.5 }}
            >
              No posts yet.
            </div>
          )}
          {myPosts.map((p) => (
            <PostCard key={p.id} post={p} author={u} />
          ))}
        </div>
      )}

      {tab === "Trades" && <TradesTable profile={u} posts={myPosts} />}

      {tab === "Stats" && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 14 }}>
          <div className="card pad">
            <div className="sec-label" style={{ marginBottom: 12 }}>
              Performance by market
            </div>
            {PERF_BY_MARKET.map(([m, v, c]) => (
              <div key={m} style={{ marginBottom: 13 }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: 13,
                    marginBottom: 6,
                  }}
                >
                  <span>{m}</span>
                  <span className="mono" style={{ color: c }}>
                    {v}% win
                  </span>
                </div>
                <Progress value={v} color={c} />
              </div>
            ))}
          </div>
          <div className="card pad">
            <div className="sec-label" style={{ marginBottom: 12 }}>
              Risk discipline
            </div>
            {RISK_DISCIPLINE_ROWS.map(([l, v]) => (
              <div
                key={l}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "9px 0",
                  borderBottom: "1px solid var(--line-1)",
                  fontSize: 13.5,
                }}
              >
                <span style={{ color: "var(--tx-2)" }}>{l}</span>
                <span className="mono" style={{ fontWeight: 700 }}>
                  {v}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === "Achievements" && (
        <div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 14,
            }}
          >
            <span className="sec-label">
              {achievementsLoaded ? `${achievements.filter((a) => a.got).length} of ${achievements.length} unlocked` : "Loading…"}
            </span>
            <span className="mono" style={{ fontSize: 12.5, color: "var(--tx-3)" }}>
              2,140 achievement XP
            </span>
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
              gap: 12,
              marginBottom: 30,
            }}
          >
            {achievements.map((a) => (
              <AchievementBadge key={a.id} achievement={a} />
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
