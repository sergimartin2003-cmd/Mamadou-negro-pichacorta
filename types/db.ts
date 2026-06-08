/**
 * Canonical domain types for TradeHub seed + queries.
 * These describe the application's content shapes (not raw Supabase rows;
 * DB row types live in types/supabase.ts, owned by a separate task).
 */

export type Market = "Crypto" | "Forex" | "Futures" | "Stocks";

/** Communities/competitions may target every market. */
export type MarketScope = Market | "All";

export type TradeDir = "long" | "short";

export type TradeResult = "win" | "loss" | "open";

export type TierKey =
  | "bronze"
  | "silver"
  | "gold"
  | "platinum"
  | "diamond"
  | "master"
  | "elite";

export type PlanTier = "free" | "pro" | "elite";

/** A linear-gradient avatar palette: `[from, to]` hex colors. */
export type AvatarGradient = readonly [string, string];

export interface Tier {
  key: TierKey;
  name: string;
  color: string;
  min: number;
}

export interface Profile {
  id: string;
  name: string;
  handle: string;
  rp: number;
  verified: boolean;
  market: Market;
  country: string;
  flag: string;
  win: number;
  pnl: number;
  trades: number;
  dd: number;
  consistency: number;
  streak: number;
  avatar: AvatarGradient;
  bio: string;
  followers: number;
  following: number;
}

export interface Post {
  id: string;
  author: string;
  time: string;
  market: Market;
  dir: TradeDir;
  symbol: string;
  title: string;
  body: string;
  rr: number;
  pnl: number;
  result: TradeResult;
  tags: string[];
  up: number;
  down: number;
  comments: number;
  chart: string;
}

export interface Community {
  id: string;
  name: string;
  members: number;
  market: MarketScope;
  icon: string;
  color: string;
  desc: string;
}

export type ChannelKind = "text" | "voice";

export interface Channel {
  id: string;
  name: string;
  kind: ChannelKind;
  active?: boolean;
}

export interface ChatMessage {
  id: string;
  author: string;
  time: string;
  text: string;
  chart?: string;
}

export type CompetitionKind = "Seasonal" | "48h Battle" | "Friends";

export interface Competition {
  id: string;
  name: string;
  kind: CompetitionKind;
  market: MarketScope;
  participants: number;
  daysLeft: number;
  prize: string;
  metric: string;
  joined: boolean;
  myRank: number | null;
  rule: string;
}

export interface LearningPath {
  id: string;
  name: string;
  market: MarketScope;
  color: string;
  icon: string;
  modules: number;
  done: number;
  xp: number;
  level: number;
}

export type LessonState = "done" | "current" | "locked";

export interface Lesson {
  id: string;
  n: number;
  name: string;
  state: LessonState;
  min: number;
}

export interface Achievement {
  id: string;
  name: string;
  desc: string;
  icon: string;
  got: boolean;
  tier: TierKey;
}

export type NotificationType =
  | "rank"
  | "like"
  | "comp"
  | "comment"
  | "follow"
  | "tier";

export interface Notification {
  id: string;
  type: NotificationType;
  read: boolean;
  time: string;
  text: string;
  who: string | null;
}

export interface Dm {
  id: string;
  who: string;
  last: string;
  time: string;
  unread: number;
  online: boolean;
}

export interface DmMessage {
  from: string;
  time: string;
  text: string;
  file?: string;
}
