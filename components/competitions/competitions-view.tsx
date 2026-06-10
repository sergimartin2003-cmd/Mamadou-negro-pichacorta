"use client";

import { useState, useMemo, type ReactNode } from "react";
import Link from "next/link";
import type { Competition, Profile } from "@/types/db";
import { Avatar } from "@/components/ui/avatar";
import { Icon } from "@/components/ui/icon";
import { Pnl } from "@/components/ui/pnl";
import { Segmented } from "@/components/ui/segmented";
import { Button } from "@/components/ui/button";
import { CompCard } from "./comp-card";

const TAB_OPTIONS = ["Active", "Seasonal", "Friends", "Finished"] as const;
type TabOption = (typeof TAB_OPTIONS)[number];

const TAB_KIND_MAP: Record<TabOption, string | null> = {
  Active: null,
  Seasonal: "Seasonal",
  Friends: "Friends",
  Finished: null,
};

interface CompetitionsViewProps {
  competitions: Competition[];
  traders: Profile[];
  /** Optional slot rendered above the view (e.g. the in-section niche selector). */
  header?: ReactNode;
}

function isFinished(competition: Competition): boolean {
  return competition.daysLeft <= 0;
}

function filterCompetitions(competitions: Competition[], tab: TabOption): Competition[] {
  if (tab === "Finished") return competitions.filter(isFinished);

  const ongoing = competitions.filter((c) => !isFinished(c));
  const kind = TAB_KIND_MAP[tab];
  return kind ? ongoing.filter((c) => c.kind === kind) : ongoing;
}

export function CompetitionsView({ competitions, traders, header }: CompetitionsViewProps) {
  const [tab, setTab] = useState<TabOption>("Active");
  const live = competitions[0];

  const leadersSorted = useMemo(
    () => [...traders].sort((a, b) => b.pnl - a.pnl).slice(0, 5),
    [traders],
  );

  const filtered = useMemo(() => filterCompetitions(competitions, tab), [competitions, tab]);

  return (
    <div
      style={{
        maxWidth: 980,
        margin: "0 auto",
        padding: "24px 16px",
        display: "flex",
        flexDirection: "column",
        gap: 18,
      }}
    >
      {header}
      {live && (
        <div
          className="card"
          style={{
            overflow: "hidden",
            display: "flex",
            minHeight: 200,
            borderColor: "var(--brand-line)",
            flexWrap: "wrap",
          }}
        >
          <div
            style={{
              flex: 1,
              minWidth: 260,
              padding: "26px 28px",
              background: "linear-gradient(120deg, color-mix(in srgb, var(--brand) 22%, var(--bg-2)), var(--bg-2) 80%)",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              gap: 14,
            }}
          >
            <span
              className="chip"
              style={{ alignSelf: "flex-start", color: "var(--profit)", borderColor: "var(--profit-line)" }}
            >
              ● LIVE NOW
            </span>
            <div>
              <h1 style={{ fontSize: 30, marginBottom: 6 }}>{live.name}</h1>
              <p style={{ color: "var(--tx-2)", fontSize: 14, maxWidth: 440, margin: 0 }}>
                Compete on risk-adjusted return. Verified accounts only, max 3% risk per trade. Top 10 earn the seasonal Elite badge.
              </p>
            </div>
            <div style={{ display: "flex", gap: 28, marginTop: 4, flexWrap: "wrap" }}>
              {(
                [
                  ["Your rank", "#142"],
                  ["Field", "4,820"],
                  ["Ends in", `${live.daysLeft}d`],
                  ["Prize pool", live.prize],
                ] as const
              ).map(([label, value]) => (
                <div key={label}>
                  <div className="mono" style={{ fontSize: 22, fontWeight: 700 }}>{value}</div>
                  <div className="sec-label" style={{ fontSize: 10 }}>{label}</div>
                </div>
              ))}
            </div>
            <div style={{ display: "flex", gap: 10, marginTop: 6, flexWrap: "wrap" }}>
              <Button variant="primary" size="lg">View live standings</Button>
              <Button size="lg">Rules &amp; scoring</Button>
            </div>
          </div>

          <div
            style={{
              width: 300,
              flexShrink: 0,
              borderLeft: "1px solid var(--line-1)",
              padding: 18,
              background: "var(--bg-2)",
            }}
          >
            <div className="sec-label" style={{ marginBottom: 12 }}>Leaders</div>
            {leadersSorted.map((t, i) => (
              <div
                key={t.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "8px 0",
                  borderBottom: i < 4 ? "1px solid var(--line-1)" : "none",
                }}
              >
                <span
                  className="mono"
                  style={{ width: 18, fontWeight: 700, color: i === 0 ? "var(--t-gold)" : "var(--tx-3)" }}
                >
                  {i + 1}
                </span>
                <Avatar user={t} size={30} />
                <span style={{ flex: 1, fontWeight: 600, fontSize: 13 }}>{t.name.split(" ")[0]}</span>
                <Pnl value={t.pnl} suffix="%" />
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
        <Segmented
          options={[...TAB_OPTIONS]}
          value={tab}
          onChange={(k) => setTab(k as TabOption)}
        />
        <div style={{ flex: 1 }} />
        <Link href="/retos/create">
          <Button variant="primary">
            <Icon name="plus" size={16} sw={2.4} /> Create competition
          </Button>
        </Link>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
          gap: 14,
        }}
      >
        {filtered.map((c) => (
          <CompCard key={c.id} competition={c} leaders={traders} />
        ))}

        <Link
          href="/retos/create"
          style={{
            border: "1.5px dashed var(--line-3)",
            borderRadius: "var(--r-lg)",
            background: "transparent",
            color: "var(--tx-3)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 12,
            minHeight: 240,
            transition: "all .15s",
            textDecoration: "none",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLAnchorElement).style.borderColor = "var(--brand-line)";
            (e.currentTarget as HTMLAnchorElement).style.color = "var(--tx-1)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLAnchorElement).style.borderColor = "var(--line-3)";
            (e.currentTarget as HTMLAnchorElement).style.color = "var(--tx-3)";
          }}
        >
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: 14,
              display: "grid",
              placeItems: "center",
              background: "var(--brand-dim)",
              color: "var(--brand)",
            }}
          >
            <Icon name="swords" size={24} />
          </div>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontWeight: 700, fontSize: 15, color: "var(--tx-1)" }}>Start a battle</div>
            <div style={{ fontSize: 12.5, marginTop: 3 }}>Challenge friends · set the rules</div>
          </div>
        </Link>
      </div>
    </div>
  );
}
