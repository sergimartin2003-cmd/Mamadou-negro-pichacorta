"use client";

import { useState, useMemo } from "react";
import type { Profile, Market, NicheSlug } from "@/types/db";
import { Segmented } from "@/components/ui/segmented";
import { getNiche } from "@/config/niches";
import { Podium } from "./podium";
import { RankRow } from "./rank-row";
import { isLeaderboardEligible } from "@/lib/domain/stats";

const TAB_OPTIONS = ["Global", "Friends", "Country", "Skill"] as const;
const MARKET_OPTIONS = ["All markets", "Crypto", "Forex", "Futures", "Stocks"] as const;

type TabOption = (typeof TAB_OPTIONS)[number];
type MarketFilter = (typeof MARKET_OPTIONS)[number];

interface RankingsClientProps {
  traders: Profile[];
  me: Profile;
  verifiedOnly: boolean;
  /** Active niche — relabels tiers and hides the trading-only market filter. */
  niche?: NicheSlug;
}

function filterByMarket(traders: Profile[], market: MarketFilter): Profile[] {
  if (market === "All markets") return traders;
  return traders.filter((t) => t.market === (market as Market));
}

function sortByRp(traders: Profile[]): Profile[] {
  return [...traders].sort((a, b) => b.rp - a.rp);
}

export function RankingsClient({
  traders,
  me,
  verifiedOnly: initialVerifiedOnly,
  niche,
}: RankingsClientProps) {
  const [tab, setTab] = useState<TabOption>("Global");
  const [mkt, setMkt] = useState<MarketFilter>("All markets");
  const [verifiedOnly, setVerifiedOnly] = useState(initialVerifiedOnly);

  // The market filter is a trading-only concept; hide it for other niches.
  const showMarketFilter = !niche || niche === "trading";
  const memberLabel = niche ? getNiche(niche).copy.member : "trader";

  const sorted = useMemo(() => {
    let pool = showMarketFilter ? filterByMarket(traders, mkt) : [...traders];
    if (verifiedOnly) pool = pool.filter(isLeaderboardEligible);
    return sortByRp(pool);
  }, [traders, mkt, verifiedOnly, showMarketFilter]);

  const top3 = sorted.slice(0, 3) as [Profile, Profile, Profile];
  const rest = sorted.slice(3);

  const mePassesFilter = useMemo(() => {
    if (verifiedOnly && !isLeaderboardEligible(me)) return false;
    if (showMarketFilter && mkt !== "All markets" && me.market !== (mkt as Profile["market"]))
      return false;
    return true;
  }, [me, mkt, verifiedOnly, showMarketFilter]);

  const meRealRank = useMemo((): number => {
    const poolWithMe = sortByRp([...sorted, me]);
    return poolWithMe.findIndex((p) => p.id === me.id) + 1;
  }, [sorted, me]);

  return (
    <>
      <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
        <Segmented
          options={[...TAB_OPTIONS]}
          value={tab}
          onChange={(k) => setTab(k as TabOption)}
        />
        <div style={{ flex: 1 }} />
        <label
          style={{
            display: "flex",
            alignItems: "center",
            gap: 7,
            fontSize: 13,
            color: "var(--tx-2)",
            cursor: "pointer",
            userSelect: "none",
          }}
        >
          <input
            type="checkbox"
            checked={verifiedOnly}
            onChange={(e) => setVerifiedOnly(e.target.checked)}
            style={{ accentColor: "var(--brand)", width: 15, height: 15, cursor: "pointer" }}
          />
          Verified only
        </label>
        {showMarketFilter && (
          <>
            <div className="th-market-segmented">
              <Segmented
                options={[...MARKET_OPTIONS]}
                value={mkt}
                onChange={(k) => setMkt(k as MarketFilter)}
                size="sm"
              />
            </div>
            <div className="th-market-compact">
              <select
                value={mkt}
                onChange={(e) => setMkt(e.target.value as MarketFilter)}
                className="input"
                style={{ width: "auto", height: 34, padding: "0 10px", fontSize: 13 }}
              >
                {MARKET_OPTIONS.map((o) => (
                  <option key={o} value={o}>
                    {o}
                  </option>
                ))}
              </select>
            </div>
          </>
        )}
      </div>

      {top3.length >= 3 && (
        <div className="card" style={{ padding: "28px 22px 0", overflow: "hidden" }}>
          <Podium top={top3} />
        </div>
      )}

      <div className="card" style={{ overflow: "hidden", overflowX: "auto" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "48px 1fr 88px 88px 78px 96px",
            gap: 12,
            padding: "12px 18px",
            borderBottom: "1px solid var(--line-1)",
            background: "var(--bg-3)",
            minWidth: 560,
          }}
          className="sec-label"
        >
          <span>Rank</span>
          <span style={{ textTransform: "capitalize" }}>{memberLabel}</span>
          <span>Tier</span>
          <span>RP</span>
          <span>Win %</span>
          <span style={{ textAlign: "right" }}>Season PnL</span>
        </div>
        <div style={{ minWidth: 560 }}>
          {rest.map((t, i) => (
            <RankRow key={t.id} profile={t} rank={i + 4} niche={niche} />
          ))}
          {mePassesFilter && <RankRow profile={me} rank={meRealRank} niche={niche} highlight />}
        </div>
      </div>
    </>
  );
}
