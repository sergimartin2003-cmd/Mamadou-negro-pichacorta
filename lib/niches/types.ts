/**
 * The niche-module contract.
 *
 * Architecture (see CLAUDE.md / session-notes): the social network is ONE shared
 * space (feed, communities, profiles, messages, notifications). Only the
 * COMPETITIVE layer is split per niche: stats, ranks, competitions, challenges,
 * verification and learning content. A `NicheModule` is the single source of
 * truth for everything that differs between niches; shared core components read
 * from the active module and never hardcode niche-specific strings.
 */

import type { TierKey, NicheSlug } from "@/types/db";

export type { NicheSlug };

/** A metric shown on the per-niche profile card (e.g. "MRR", "Doors", "ROAS"). */
export interface NicheMetricDef {
  key: string;
  label: string;
  /** Optional unit rendered after the value, e.g. "%", "x", " doors". */
  suffix?: string;
  /** Optional CSS color token for emphasis. */
  accent?: string;
}

/** One of the four cells in a post's stat strip, parameterised per niche. */
export interface NicheStatField {
  /** Key read from `post.metrics`. */
  key: string;
  /** Column header. */
  label: string;
}

/** How a niche proves its numbers are real — the differentiator in every spec. */
export type VerificationMethod =
  | "broker" //          trading: broker / TradingView webhook / CSV
  | "stripe-analytics" // emprendimiento: Stripe Connect / Plausible / GA4 / CSV
  | "documents" //       real estate: closing docs / rent roll / CSV
  | "ad-platforms" //    marketing: Meta / Google / TikTok / GA4 / CSV
  | "wallet-onchain"; // crypto: read-only wallet signature + indexer

export interface VerificationProvider {
  method: VerificationMethod;
  /** Connect-button label, e.g. "Connect broker", "Connect wallet". */
  connectLabel: string;
  /** One-line explanation for onboarding / settings. */
  description: string;
  /** MVP path that works in demo without integrations (usually CSV import). */
  mvp: string;
  /** Read-only / anti-scam guarantees (crypto especially). */
  safety?: string;
}

/** A competition format for this niche. */
export interface NicheCompetitionType {
  id: string;
  name: string;
  /** The metric the winner is decided on. */
  metric: string;
  /** How the winner is computed. */
  basis: "verified-delta" | "votes" | "lowest-risk";
}

export interface NicheLearningPath {
  id: string;
  name: string;
  blurb: string;
}

export interface NicheCommunitySeed {
  name: string;
  desc: string;
}

/** Copy that differs per niche but slots into the same shared components. */
export interface NicheCopy {
  /** Noun for a competitor: "trader", "founder", "investor", "marketer", "degen". */
  member: string;
  /** PostCard primary action ("Copy setup" / "Clonar idea" / "Analizar deal"). */
  postAction: string;
  /** Feed composer placeholder for posts tagged with this niche. */
  composer: string;
  /** Empty-state line when the feed is filtered to this niche. */
  feedEmpty: string;
  /** Label for the verified-performance curve on the profile card. */
  curveLabel: string;
}

export interface NicheModule {
  slug: NicheSlug;
  /** Visible name, e.g. "Trading", "Emprendimiento", "Real Estate". */
  name: string;
  /** One-line positioning shown in the niche selector / section header. */
  tagline: string;
  /** Accent color token, e.g. "var(--brand)". */
  color: string;
  /** Glyph used in chips and selectors. */
  glyph: string;
  copy: NicheCopy;
  /**
   * Seven tier names aligned, by index, to the shared `TIERS` ladder
   * (Bronze→Elite). The ELO engine is identical across niches; only the names
   * change. Use `nicheTierName` / `nicheTierFor` to resolve, never index raw.
   */
  tierNames: readonly [string, string, string, string, string, string, string];
  /** Post tag taxonomy for this niche. */
  postTags: readonly string[];
  /** The four stat-strip cells on the PostCard. */
  postStatFields: readonly [NicheStatField, NicheStatField, NicheStatField, NicheStatField];
  /** Metrics shown on the per-niche profile card. */
  profileMetrics: readonly NicheMetricDef[];
  verification: VerificationProvider;
  competitions: readonly NicheCompetitionType[];
  learning: readonly NicheLearningPath[];
  communitiesSeed: readonly NicheCommunitySeed[];
}

/** Index in the shared TIERS ladder, by tier key. */
export const TIER_INDEX: Record<TierKey, number> = {
  bronze: 0,
  silver: 1,
  gold: 2,
  platinum: 3,
  diamond: 4,
  master: 5,
  elite: 6,
};
