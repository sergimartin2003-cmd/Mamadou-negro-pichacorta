import type { Post, Profile } from "@/types/db";

interface TradeRow {
  sym: string;
  dir: string;
  rr: number;
  pnl: number;
  date: string;
  res: string;
}

interface TradesTableProps {
  profile: Profile;
  posts: Post[];
}

const EXTRA_ROWS: TradeRow[] = [
  { sym: "ETH", dir: "long", rr: 1.9, pnl: 1.2, date: "May 22", res: "win" },
  { sym: "EURUSD", dir: "short", rr: -1, pnl: -1.0, date: "May 21", res: "loss" },
  { sym: "CL", dir: "long", rr: 3.4, pnl: 2.8, date: "May 20", res: "win" },
];

function statusDot(res: string): React.ReactNode {
  if (res === "win") return <span className="up">●</span>;
  if (res === "loss") return <span className="down">●</span>;
  return <span style={{ color: "var(--t-diamond)" }}>○</span>;
}

export function TradesTable({ posts }: TradesTableProps) {
  const rows: TradeRow[] = [
    ...posts.map((p, i) => ({
      sym: p.symbol,
      dir: p.dir,
      rr: p.rr,
      pnl: p.pnl,
      date: `May ${28 - i}`,
      res: p.result,
    })),
    ...EXTRA_ROWS,
  ];

  return (
    <div className="card" style={{ overflow: "hidden" }}>
      <div style={{ overflowX: "auto" }}>
        <div style={{ minWidth: 520 }}>
          <div
            className="sec-label"
            style={{
              display: "grid",
              gridTemplateColumns: "1.2fr 1fr 1fr 1fr 1fr 0.8fr",
              padding: "12px 18px",
              borderBottom: "1px solid var(--line-1)",
              background: "var(--bg-3)",
            }}
          >
            <span>Symbol</span>
            <span>Direction</span>
            <span>R:R</span>
            <span>Result</span>
            <span>Date</span>
            <span style={{ textAlign: "right" }}>Status</span>
          </div>
          {rows.map((r, i) => (
            <div
              key={i}
              style={{
                display: "grid",
                gridTemplateColumns: "1.2fr 1fr 1fr 1fr 1fr 0.8fr",
                padding: "13px 18px",
                borderBottom: "1px solid var(--line-1)",
                alignItems: "center",
                fontSize: 13.5,
              }}
            >
              <span className="mono" style={{ fontWeight: 700 }}>
                {r.sym}
              </span>
              <span
                style={{
                  color: r.dir === "long" ? "var(--profit)" : "var(--loss)",
                  fontWeight: 600,
                  textTransform: "capitalize",
                }}
              >
                {r.dir}
              </span>
              <span className="mono">{r.rr > 0 ? `${r.rr.toFixed(1)}:1` : "—"}</span>
              <span
                className="mono"
                style={{ fontWeight: 700, color: r.pnl >= 0 ? "var(--profit)" : "var(--loss)" }}
              >
                {r.pnl >= 0 ? "+" : ""}
                {r.pnl}R
              </span>
              <span className="mono" style={{ color: "var(--tx-3)" }}>
                {r.date}
              </span>
              <span style={{ textAlign: "right" }}>{statusDot(r.res)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
