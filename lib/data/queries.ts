// Supabase-backed implementations swap in here when supabaseConfigured() is true.
// Every function is async and returns a Promise so the data source can change
// (seed → Supabase) without touching call sites.

import type {
  Achievement,
  ChatMessage,
  Channel,
  Community,
  Competition,
  Course,
  CourseModule,
  CourseReview,
  Dm,
  DmMessage,
  LearningPath,
  Lesson,
  Market,
  NicheSlug,
  Notification,
  Post,
  Profile,
} from "@/types/db";
import { NICHE_SLUGS } from "@/config/niches";
import {
  achievements,
  byId,
  channels,
  chatMsgs,
  communities,
  competitions,
  dms,
  dmThread,
  learningPaths,
  lessons,
  me as seedMe,
  notifications,
  posts,
  traders,
} from "./seed";
import {
  crossNichePosts,
  nicheCompetitions,
  nicheLearningPaths,
  userNicheStats,
  type NicheStatRow,
} from "./niche-seed";

import { courses, buildModulesForCourse, buildReviewsForCourse } from "./courses-seed";

export type { NicheStatRow } from "./niche-seed";

export type FeedScope = "following" | "global" | "verified";
export type FeedSort = "top" | "latest";

export interface FeedOptions {
  scope?: FeedScope;
  sort?: FeedSort;
  market?: Market;
  /** Filter the single shared feed to one niche's tag. */
  niche?: NicheSlug;
}

export interface RankingsOptions {
  market?: Market;
}

export interface CompetitionFilter {
  market?: Market;
  joined?: boolean;
}

export async function getMe(): Promise<Profile> {
  return seedMe;
}

/** Convert a relative time label ("14m", "1h", "2d") to minutes for ordering. */
function recencyRank(time: string): number {
  const match = /^(\d+)\s*([mhd])/.exec(time);
  if (!match) return Number.MAX_SAFE_INTEGER;
  const n = Number(match[1]);
  const unit = match[2];
  return unit === "m" ? n : unit === "h" ? n * 60 : n * 1440;
}

export async function getFeed(opts: FeedOptions = {}): Promise<Post[]> {
  // One shared feed: trading seed + cross-niche posts, ordered most-recent first.
  let result = [...posts, ...crossNichePosts].sort(
    (a, b) => recencyRank(a.time) - recencyRank(b.time),
  );

  if (opts.niche) {
    result = result.filter((post) => post.niche === opts.niche);
  }

  if (opts.market) {
    result = result.filter((post) => post.market === opts.market);
  }

  if (opts.scope === "verified") {
    result = result.filter((post) => byId[post.author]?.verified === true);
  }

  if (opts.sort === "top") {
    result.sort((a, b) => engagement(b) - engagement(a));
  }

  return result;
}

export async function getProfile(idOrHandle: string): Promise<Profile | null> {
  const byKey = byId[idOrHandle];
  if (byKey) return byKey;

  const normalized = idOrHandle.replace(/^@/, "").toLowerCase();
  const byHandle = [...traders, seedMe].find(
    (profile) => profile.handle.toLowerCase() === normalized,
  );
  return byHandle ?? null;
}

export async function getTopTraders(n: number): Promise<Profile[]> {
  return [...traders].sort((a, b) => b.rp - a.rp).slice(0, Math.max(0, n));
}

export async function getSuggestedTraders(n: number): Promise<Profile[]> {
  return traders.slice(4, 4 + Math.max(0, n));
}

export async function getRankings(opts: RankingsOptions = {}): Promise<Profile[]> {
  const pool = opts.market
    ? traders.filter((trader) => trader.market === opts.market)
    : [...traders];
  return pool.sort((a, b) => b.rp - a.rp);
}

export async function getCommunities(): Promise<Community[]> {
  return [...communities];
}

export async function getChannels(communityId: string): Promise<Channel[]> {
  void communityId;
  return [...channels];
}

export async function getChatMessages(channelId: string): Promise<ChatMessage[]> {
  void channelId;
  return [...chatMsgs];
}

export async function getCompetitions(
  niche?: NicheSlug,
  filter: CompetitionFilter = {},
): Promise<Competition[]> {
  let result = [...competitions, ...nicheCompetitions];

  if (niche) {
    result = result.filter((competition) => competition.niche === niche);
  }

  if (filter.market) {
    result = result.filter((competition) => competition.market === filter.market);
  }

  if (filter.joined !== undefined) {
    result = result.filter((competition) => competition.joined === filter.joined);
  }

  return result;
}

export async function getLearningPaths(niche?: NicheSlug): Promise<LearningPath[]> {
  const all = [...learningPaths, ...nicheLearningPaths];
  return niche ? all.filter((path) => path.niche === niche) : all;
}

// --- Competitive layer: per-niche stats, leaderboards & rank badges ---------

/** Clone a profile with its niche-specific competitive numbers swapped in. */
function nicheView(profile: Profile, row: NicheStatRow): Profile {
  return { ...profile, rp: row.rp, verified: row.verified, win: row.win, pnl: row.delta };
}

/** Leaderboard for a niche (excludes the signed-in user), sorted by RP desc. */
export async function getNicheLeaderboard(niche: NicheSlug): Promise<Profile[]> {
  return userNicheStats
    .filter((row) => row.niche === niche && row.profileId !== seedMe.id)
    .map((row) => {
      const profile = byId[row.profileId];
      return profile ? nicheView(profile, row) : null;
    })
    .filter((profile): profile is Profile => profile !== null)
    .sort((a, b) => b.rp - a.rp);
}

/** A profile carrying one niche's competitive numbers, or null if not in it. */
export async function getNicheProfile(
  profileId: string,
  niche: NicheSlug,
): Promise<Profile | null> {
  const row = userNicheStats.find((r) => r.profileId === profileId && r.niche === niche);
  const profile = byId[profileId];
  return row && profile ? nicheView(profile, row) : null;
}

/** RP for a profile in a niche (used for the feed's contextual rank badge). */
export async function getNicheRp(profileId: string, niche: NicheSlug): Promise<number | null> {
  const row = userNicheStats.find((r) => r.profileId === profileId && r.niche === niche);
  return row ? row.rp : null;
}

/** Every niche a profile competes in, in display order — its profile cards. */
export async function getNicheStatsForProfile(profileId: string): Promise<NicheStatRow[]> {
  return userNicheStats
    .filter((row) => row.profileId === profileId)
    .sort((a, b) => NICHE_SLUGS.indexOf(a.niche) - NICHE_SLUGS.indexOf(b.niche));
}

// --- Marketplace de cursos --------------------------------------------------

export type CourseSort = "popular" | "rating" | "new" | "price-asc" | "price-desc";

export interface CourseFilter {
  niche?: NicheSlug;
  level?: string;
  sort?: CourseSort;
  q?: string;
  freeOnly?: boolean;
}

export interface CourseDetail {
  course: Course;
  modules: CourseModule[];
  reviews: CourseReview[];
  related: Course[];
}

export async function getCourses(filter: CourseFilter = {}): Promise<Course[]> {
  let result = [...courses];

  if (filter.niche) result = result.filter((c) => c.niche === filter.niche);
  if (filter.level) result = result.filter((c) => c.level === filter.level);
  if (filter.freeOnly) result = result.filter((c) => c.price === 0);
  if (filter.q) {
    const q = filter.q.toLowerCase();
    result = result.filter(
      (c) => c.title.toLowerCase().includes(q) || c.tags.some((t) => t.includes(q)),
    );
  }

  switch (filter.sort) {
    case "rating":
      result.sort((a, b) => b.rating - a.rating);
      break;
    case "new":
      result.sort((a, b) => a.createdDaysAgo - b.createdDaysAgo);
      break;
    case "price-asc":
      result.sort((a, b) => a.price - b.price);
      break;
    case "price-desc":
      result.sort((a, b) => b.price - a.price);
      break;
    default:
      result.sort((a, b) => b.students - a.students); // popular
  }

  return result;
}

export async function getCourse(slug: string): Promise<CourseDetail | null> {
  const course = courses.find((c) => c.slug === slug);
  if (!course) return null;
  const related = courses.filter((c) => c.niche === course.niche && c.slug !== slug).slice(0, 3);
  return {
    course,
    modules: buildModulesForCourse(course),
    reviews: buildReviewsForCourse(course),
    related,
  };
}

export function courseSlugs(): string[] {
  return courses.map((c) => c.slug);
}

export async function getLessons(pathId: string): Promise<Lesson[]> {
  void pathId;
  return [...lessons];
}

export async function getAchievements(): Promise<Achievement[]> {
  return [...achievements];
}

export async function getNotifications(): Promise<Notification[]> {
  return [...notifications];
}

export async function getDms(): Promise<Dm[]> {
  return [...dms];
}

export async function getDmThread(id: string): Promise<DmMessage[]> {
  void id;
  return [...dmThread];
}

function engagement(post: Post): number {
  return post.up - post.down + post.comments;
}
