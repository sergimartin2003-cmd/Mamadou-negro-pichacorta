import type { NicheModule } from "@/lib/niches/types";

/** Crypto — trustless on-chain verification; the strongest proof of the five. */
export const crypto: NicheModule = {
  slug: "crypto",
  name: "Crypto",
  tagline: "Ranked by trustless on-chain P&L — the chain doesn't lie.",
  color: "var(--t-gold)",
  glyph: "◎",
  copy: {
    member: "degen",
    postAction: "View on-chain",
    composer: "Share a position, a play, or a DeFi strategy…",
    feedEmpty: "No plays yet. Post a position or some alpha.",
    curveLabel: "Verified on-chain portfolio",
  },
  tierNames: ["Newbie", "Hodler", "Trader", "Degen", "Whale", "OG", "Satoshi"],
  postTags: ["btc", "eth", "solana", "defi", "nft", "memecoin", "l2", "airdrop"],
  postStatFields: [
    { key: "chain", label: "Chain" },
    { key: "token", label: "Token" },
    { key: "allocation", label: "Allocation" },
    { key: "pnl", label: "P&L" },
  ],
  profileMetrics: [
    { key: "portfolio", label: "Portfolio", accent: "var(--profit)" },
    { key: "realizedPnl", label: "Realized P&L", accent: "var(--profit)" },
    { key: "roi", label: "ROI", suffix: "%", accent: "var(--profit)" },
    { key: "win", label: "Win rate", suffix: "%" },
  ],
  verification: {
    method: "wallet-onchain",
    connectLabel: "Connect wallet",
    description: "Prove wallet ownership with a message signature; we read the public chain.",
    mvp: "Read-only address watch",
    safety: "Read-only. We never ask for keys, seed phrases or transaction approvals.",
  },
  competitions: [
    { id: "best-roi", name: "Best ROI of the Month", metric: "Verified on-chain ROI", basis: "verified-delta" },
    { id: "best-call", name: "Best Call", metric: "Tracked on-chain accuracy", basis: "verified-delta" },
    { id: "paper-trading", name: "Paper Trading Comp", metric: "Simulated ROI", basis: "verified-delta" },
    { id: "yield-farm", name: "Yield Farming Challenge", metric: "Verified APY", basis: "verified-delta" },
  ],
  learning: [
    { id: "fundamentals", name: "Crypto Fundamentals", blurb: "Chains, tokens and custody." },
    { id: "security", name: "Wallets & Security", blurb: "Self-custody and avoiding scams. Start here." },
    { id: "defi", name: "DeFi to Yield", blurb: "AMMs, lending and farming." },
    { id: "onchain", name: "On-Chain Analysis", blurb: "Reading flows and smart money." },
    { id: "trading", name: "Crypto Trading", blurb: "Spot, perps and risk." },
  ],
  communitiesSeed: [
    { name: "Solana Degens", desc: "Memecoins, mints & fast plays." },
    { name: "DeFi Yield", desc: "Pools, lending & farming strategy." },
    { name: "On-Chain Alpha", desc: "Smart-money flows from verified wallets." },
  ],
};
