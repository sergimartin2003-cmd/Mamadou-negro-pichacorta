// Supabase-backed implementations swap in here when supabaseConfigured() is true.
// Every function is async and returns a Promise so the data source can change
// (seed → Supabase) without touching call sites.

import type {
  Achievement,
  ChatMessage,
  Channel,
  Community,
  Competition,
  Dm,
  DmMessage,
  LearningPath,
  Lesson,
  Market,
  Notification,
  Post,
  Profile,
} from "@/types/db";
import { rankScores, type PredictScore } from "@/lib/domain/predict";
import { rankSpeedScores, type SpeedScore } from "@/lib/domain/speed";
import type { Challenge, ChallengeProgress } from "@/lib/domain/challenges";
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
  challenges as challengeSeed,
  challengeProgress,
  notifications,
  posts,
  predictLeaderboard,
  speedLeaderboard,
  traders,
} from "./seed";

export type FeedScope = "following" | "global" | "verified";
export type FeedSort = "top" | "latest";

export interface FeedOptions {
  scope?: FeedScope;
  sort?: FeedSort;
  market?: Market;
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

export async function getFeed(opts: FeedOptions = {}): Promise<Post[]> {
  let result = [...posts];

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

export async function getCompetitions(filter: CompetitionFilter = {}): Promise<Competition[]> {
  let result = [...competitions];

  if (filter.market) {
    result = result.filter((competition) => competition.market === filter.market);
  }

  if (filter.joined !== undefined) {
    result = result.filter((competition) => competition.joined === filter.joined);
  }

  return result;
}

export async function getLearningPaths(): Promise<LearningPath[]> {
  return [...learningPaths];
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

export async function getPredictLeaderboard(): Promise<PredictScore[]> {
  return rankScores(predictLeaderboard);
}

export async function getSpeedLeaderboard(): Promise<SpeedScore[]> {
  return rankSpeedScores(speedLeaderboard);
}

export async function getChallenges(): Promise<{
  challenges: Challenge[];
  progress: Record<string, ChallengeProgress>;
}> {
  return { challenges: [...challengeSeed], progress: { ...challengeProgress } };
}

function engagement(post: Post): number {
  return post.up - post.down + post.comments;
}
