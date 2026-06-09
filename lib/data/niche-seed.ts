/**
 * Per-niche competitive seed.
 *
 * The social layer (profiles, feed, communities) is shared and lives in seed.ts.
 * This module derives the *competitive* layer that is split per niche:
 *   - `userNicheStats`  — one row per (profile, niche): rp, tier, verified, card metrics
 *   - `crossNichePosts` — non-trading posts for the single shared feed
 *   - `nicheCompetitions` / `nicheLearningPaths` — generated from each niche module
 *
 * Values are generated deterministically (FNV-1a hash, no Math.random) so server
 * and client render identically — no hydration mismatch.
 */

import type {
  Competition,
  CompetitionKind,
  LearningPath,
  NicheSlug,
  Post,
  Profile,
} from "@/types/db";
import { NICHES, NICHE_SLUGS } from "@/config/niches";
import { TIER_INDEX } from "@/lib/niches/types";
import { tierFor } from "@/lib/domain/tiers";
import { me, traders } from "./seed";

export interface NicheStatRow {
  profileId: string;
  niche: NicheSlug;
  rp: number;
  verified: boolean;
  /** Headline win-rate for the leaderboard "Win %" column. */
  win: number;
  /** Season delta for the leaderboard "Season" column (percent). */
  delta: number;
  /** Per-niche profile-card metric values, keyed by the module metric `key`. */
  metrics: Record<string, string>;
}

const PROFILES: readonly Profile[] = [...traders, me];

/** FNV-1a — stable across server/client. */
function hash(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function clamp(min: number, max: number, n: number): number {
  return Math.max(min, Math.min(max, n));
}

function compact(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`;
  return `${Math.round(n)}`;
}

function money(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(n >= 100_000 ? 0 : 1)}k`;
  return `$${Math.round(n)}`;
}

/** A profile takes part in a niche if it's a guaranteed seed or hashes in. */
function participates(profile: Profile, slug: NicheSlug, index: number): boolean {
  if (slug === "trading") return true; // every demo profile has a trading ladder
  if (index < 6 || profile.id === "me") return true; // guarantee a field per niche
  return hash(profile.id + slug) % 5 < 3;
}

function nicheRp(profile: Profile, slug: NicheSlug): number {
  const seed = hash(profile.id + slug);
  return clamp(420, 9200, Math.round(profile.rp * (0.55 + (seed % 90) / 100) + ((seed >>> 8) % 1600) - 400));
}

const STAGE_BY_LEVEL = ["Idea", "MVP", "Traction", "Traction", "Scaling", "Scaling", "Scaling"];

function metricsFor(slug: NicheSlug, level: number, seed: number): Record<string, string> {
  switch (slug) {
    case "emprendimiento":
      return {
        mrr: money(level * level * 900 + (seed % 2000)),
        users: compact(level * 1200 + (seed % 4000)),
        stage: STAGE_BY_LEVEL[level],
        projects: String(1 + level + (seed % 5)),
      };
    case "real-estate":
      return {
        doors: String(1 + level * 3 + (seed % 6)),
        portfolio: money(level * 350_000 + (seed % 200_000)),
        cashFlow: `${money(level * 1500 + (seed % 2500))}/mo`,
        capRate: (5 + (seed % 50) / 10).toFixed(1),
      };
    case "marketing":
      return {
        spend: money(level * 40_000 + (seed % 80_000)),
        roas: (1.5 + (seed % 40) / 10).toFixed(1),
        audience: compact(level * 8000 + (seed % 30_000)),
        campaigns: String(5 + level * 4 + (seed % 20)),
      };
    case "crypto":
      return {
        portfolio: money(level * 15_000 + (seed % 60_000)),
        realizedPnl: `+${money(level * 4000 + (seed % 30_000))}`,
        roi: `+${10 + (seed % 180)}`,
        win: String(48 + (seed % 38)),
      };
    default:
      return {};
  }
}

function tradingMetrics(profile: Profile): Record<string, string> {
  return {
    win: String(profile.win),
    pnl: `+${profile.pnl}`,
    dd: String(profile.dd),
    trades: profile.trades.toLocaleString(),
  };
}

function buildUserNicheStats(): NicheStatRow[] {
  const rows: NicheStatRow[] = [];
  PROFILES.forEach((profile, index) => {
    NICHE_SLUGS.forEach((slug) => {
      if (!participates(profile, slug, index)) return;
      if (slug === "trading") {
        rows.push({
          profileId: profile.id,
          niche: slug,
          rp: profile.rp,
          verified: profile.verified,
          win: profile.win,
          delta: profile.pnl,
          metrics: tradingMetrics(profile),
        });
        return;
      }
      const seed = hash(profile.id + slug);
      const rp = nicheRp(profile, slug);
      const level = TIER_INDEX[tierFor(rp).key];
      rows.push({
        profileId: profile.id,
        niche: slug,
        rp,
        verified: (seed % 100) < (profile.verified ? 70 : 35),
        win: 48 + (seed % 38),
        delta: ((seed >>> 4) % 220) - 40,
        metrics: metricsFor(slug, level, seed),
      });
    });
  });
  return rows;
}

export const userNicheStats: readonly NicheStatRow[] = buildUserNicheStats();

// ---------------------------------------------------------------------------
// Cross-niche feed posts — the feed is ONE shared space; niche is just a tag.
// Authors are guaranteed-seed profiles (u1–u6, me) so a rank badge always shows.
// ---------------------------------------------------------------------------

export const crossNichePosts: readonly Post[] = [
  {
    id: "np1",
    author: "u2",
    time: "22m",
    niche: "crypto",
    market: "Crypto",
    dir: "long",
    symbol: "SOL",
    title: "Rotated into SOL on the reclaim — on-chain receipts attached",
    body: "Closed the ETH swing, rotated 12% of the book into SOL on the daily reclaim. Wallet is verified, so the entry is on-chain and timestamped — no screenshots, just the explorer.",
    rr: 0,
    pnl: 0,
    result: "open",
    tags: ["solana", "defi"],
    up: 412,
    down: 9,
    comments: 38,
    chart: "",
    stats: ["Solana", "SOL", "12% port", "+34%"],
  },
  {
    id: "np2",
    author: "u5",
    time: "1h",
    niche: "emprendimiento",
    market: "Crypto",
    dir: "long",
    symbol: "—",
    title: "Crossed $8.4k MRR this month — here's what moved the needle",
    body: "Doubled down on onboarding and added annual plans. Stripe-verified, so the number on my profile is the real one. Churn still my biggest problem — open to feedback.",
    rr: 0,
    pnl: 0,
    result: "win",
    tags: ["saas", "mrr"],
    up: 286,
    down: 4,
    comments: 52,
    chart: "",
    stats: ["Traction", "SaaS", "$8.4k", "+22%"],
  },
  {
    id: "np3",
    author: "u1",
    time: "3h",
    niche: "marketing",
    market: "Stocks",
    dir: "long",
    symbol: "—",
    title: "4.1x ROAS on cold paid social — creative teardown inside",
    body: "Winning angle was problem-aware UGC, not the polished studio cut. Spend scaled to $96k this month at a verified 4.1x. Breakdown of the funnel in the thread.",
    rr: 0,
    pnl: 0,
    result: "win",
    tags: ["paid-social", "creative"],
    up: 521,
    down: 11,
    comments: 47,
    chart: "",
    stats: ["Meta Ads", "Sales", "4.1x", "+$96k"],
  },
  {
    id: "np4",
    author: "u4",
    time: "5h",
    niche: "real-estate",
    market: "Stocks",
    dir: "long",
    symbol: "—",
    title: "Closed a BRRRR in Austin — 7.4% cap, refinanced all-in",
    body: "Bought distressed, rehabbed in 9 weeks, refinanced at the new ARV and pulled most of the capital back out. Closing docs uploaded, so the portfolio bump is verified.",
    rr: 0,
    pnl: 0,
    result: "win",
    tags: ["brrrr", "buy-hold"],
    up: 318,
    down: 6,
    comments: 29,
    chart: "",
    stats: ["Austin, TX", "BRRRR", "7.4%", "$1.8k/mo"],
  },
  {
    id: "np5",
    author: "u6",
    time: "8h",
    niche: "crypto",
    market: "Crypto",
    dir: "long",
    symbol: "ETH",
    title: "Staking ladder on ETH — boring, verified, compounding",
    body: "Not a trade — a position. Laddered into staked ETH and LSTs, read-only wallet connected so the yield shows up on-chain. Slow money, but it's real money.",
    rr: 0,
    pnl: 0,
    result: "open",
    tags: ["eth", "defi"],
    up: 244,
    down: 5,
    comments: 18,
    chart: "",
    stats: ["Ethereum", "ETH", "30% port", "+11%"],
  },
] as const;

// ---------------------------------------------------------------------------
// Per-niche competitions & learning, generated from each niche module.
// Trading keeps its hand-authored seed (see seed.ts); these cover the other 4.
// ---------------------------------------------------------------------------

const COMP_KINDS: readonly CompetitionKind[] = ["Seasonal", "48h Battle", "Friends", "Seasonal"];
const PRIZES = ["Elite badge + $5k", "Season RP x2", "Verified spotlight", "Bragging rights"];

function buildNicheCompetitions(): Competition[] {
  const out: Competition[] = [];
  NICHE_SLUGS.forEach((slug) => {
    if (slug === "trading") return; // hand-authored in seed.ts
    const nicheModule = NICHES[slug];
    nicheModule.competitions.forEach((comp, i) => {
      const seed = hash(slug + comp.id);
      const joined = i === 0 && (seed % 2 === 0);
      out.push({
        id: `${slug}-${comp.id}`,
        name: comp.name,
        niche: slug,
        kind: COMP_KINDS[i % COMP_KINDS.length],
        market: "All",
        participants: 60 + (seed % 4800),
        daysLeft: i === nicheModule.competitions.length - 1 && seed % 3 === 0 ? 0 : 1 + (seed % 26),
        prize: PRIZES[i % PRIZES.length],
        metric: comp.metric,
        joined,
        myRank: joined ? 1 + (seed % 40) : null,
        rule: comp.basis === "votes" ? "Community-voted" : "Verified metrics only",
      });
    });
  });
  return out;
}

function buildNicheLearningPaths(): LearningPath[] {
  const out: LearningPath[] = [];
  NICHE_SLUGS.forEach((slug) => {
    if (slug === "trading") return; // hand-authored in seed.ts
    const nicheModule = NICHES[slug];
    nicheModule.learning.forEach((path) => {
      const seed = hash(slug + path.id);
      const modules = 8 + (seed % 9);
      const done = seed % (modules + 1);
      out.push({
        id: `${slug}-${path.id}`,
        name: path.name,
        niche: slug,
        market: "All",
        color: nicheModule.color,
        icon: nicheModule.glyph,
        modules,
        done,
        xp: done * 120 + (seed % 200),
        level: 1 + (TIER_INDEX[tierFor((seed % 9000) + 200).key]),
      });
    });
  });
  return out;
}

export const nicheCompetitions: readonly Competition[] = buildNicheCompetitions();
export const nicheLearningPaths: readonly LearningPath[] = buildNicheLearningPaths();
