import type { NicheModule } from "@/lib/niches/types";

/** Trading — the original TradeHub niche, extracted to a module. */
export const trading: NicheModule = {
  slug: "trading",
  name: "Trading",
  tagline: "Verified traders, ranked by risk-adjusted return.",
  color: "var(--brand)",
  glyph: "◈",
  copy: {
    member: "trader",
    postAction: "Copy setup",
    composer: "Share a setup, a trade idea, or your journal…",
    feedEmpty: "No trading setups yet. Be the first to post one.",
    curveLabel: "Verified equity curve",
  },
  tierNames: ["Bronze", "Silver", "Gold", "Platinum", "Diamond", "Master", "Elite"],
  postTags: ["scalping", "swing", "ICT", "SMC", "macro", "options", "futures", "journal"],
  postStatFields: [
    { key: "symbol", label: "Symbol" },
    { key: "direction", label: "Direction" },
    { key: "rr", label: "R:R" },
    { key: "result", label: "Result" },
  ],
  profileMetrics: [
    { key: "win", label: "Win rate", suffix: "%", accent: "var(--profit)" },
    { key: "pnl", label: "Total PnL", suffix: "%", accent: "var(--profit)" },
    { key: "dd", label: "Max DD", suffix: "%", accent: "var(--loss)" },
    { key: "trades", label: "Trades" },
  ],
  verification: {
    method: "broker",
    connectLabel: "Connect broker",
    description: "Sync verified trades from your broker or TradingView.",
    mvp: "CSV trade-history import",
    safety: "Read-only. We never place trades or move funds.",
  },
  competitions: [
    { id: "season-league", name: "Seasonal League", metric: "Risk-adjusted return", basis: "verified-delta" },
    { id: "scalp-sprint", name: "48h Scalper Sprint", metric: "Net R multiple", basis: "verified-delta" },
    { id: "consistency-cup", name: "Consistency Cup", metric: "Lowest drawdown", basis: "lowest-risk" },
  ],
  learning: [
    { id: "risk", name: "Risk Management", blurb: "Sizing, expectancy and risk-of-ruin." },
    { id: "price-action", name: "Reading Price Action", blurb: "Structure, liquidity and order flow." },
    { id: "crypto-foundations", name: "Crypto Foundations", blurb: "Spot, perps and on-chain basics." },
    { id: "sessions", name: "Forex & Sessions", blurb: "Session timing and pair selection." },
  ],
  communitiesSeed: [
    { name: "Order Flow Lab", desc: "Tape reading, footprint & auction theory." },
    { name: "Smart Money FX", desc: "Liquidity, order blocks & session timing." },
    { name: "Risk First", desc: "Position sizing, psychology & journaling." },
  ],
};
