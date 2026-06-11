/**
 * Canonical domain types for TradeHub seed + queries.
 * These describe the application's content shapes (not raw Supabase rows;
 * DB row types live in types/supabase.ts, owned by a separate task).
 */

export type Market = "Crypto" | "Forex" | "Futures" | "Stocks";

/** Communities/competitions may target every market. */
export type MarketScope = Market | "All";

/**
 * Competitive-layer niches. The social layer (feed, communities, DMs,
 * notifications, identity) is shared and never namespaced by niche; only the
 * competitive layer (stats, ranks, competitions, learning) is per-niche.
 */
export type NicheSlug =
  | "ecommerce"
  | "saas"
  | "contenido"
  | "trading"
  | "inmobiliario"
  | "servicios"
  | "amazon"
  | "dropshipping";

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
  /** Uploaded avatar image URL (Supabase Storage); falls back to the gradient. */
  avatarUrl?: string;
  bio: string;
  followers: number;
  following: number;
  followingIds?: string[];
}

export interface Post {
  id: string;
  author: string;
  time: string;
  /** Optional competitive-layer tag for the shared feed (filter + rank badge). */
  niche: NicheSlug;
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
  /**
   * Optional 4-value stat-strip override for non-trading niches. Column labels
   * come from the active niche module's `postStatFields`; when absent the strip
   * falls back to the trading fields (symbol/direction/R:R/result).
   */
  stats?: readonly [string, string, string, string];
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
  niche: NicheSlug;
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
  niche: NicheSlug;
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

export interface Comment {
  id: string;
  postId: string;
  author: string;
  /** Parent comment id for threaded replies (one level deep in the UI). */
  parentId: string | null;
  body: string;
  time: string;
  up: number;
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

// --- Marketplace de cursos --------------------------------------------------

export type CourseLevel = "Principiante" | "Intermedio" | "Avanzado";
export type CourseFormat = "video" | "texto" | "mixto" | "cohort";
export type CourseLessonFormat = "video" | "texto" | "quiz" | "ejercicio";

export interface Course {
  id: string;
  slug: string;
  /** Profile id of the instructor (resolved against the shared profile pool). */
  instructorId: string;
  title: string;
  tagline: string;
  description: string;
  niche: NicheSlug;
  level: CourseLevel;
  format: CourseFormat;
  /** Price in EUR; 0 = gratis. */
  price: number;
  originalPrice?: number;
  durationHours: number;
  modulesCount: number;
  lessonsCount: number;
  students: number;
  rating: number; // 0–5
  reviewsCount: number;
  language: string;
  certificate: boolean;
  updatedAt: string; // relative label, e.g. "hace 2 semanas"
  createdDaysAgo: number; // drives the "Nuevo" badge
  tags: string[];
  whatYouLearn: string[];
  requirements: string[];
}

export interface CourseLesson {
  id: string;
  n: number;
  title: string;
  durationMin: number;
  format: CourseLessonFormat;
  /** Free preview lessons are viewable without purchase. */
  freePreview: boolean;
}

export interface CourseModule {
  id: string;
  n: number;
  title: string;
  lessons: CourseLesson[];
}

export interface CourseReview {
  id: string;
  author: string; // profile id
  rating: number; // 1–5
  text: string;
  verifiedPurchase: boolean;
  helpful: number;
  time: string;
}
