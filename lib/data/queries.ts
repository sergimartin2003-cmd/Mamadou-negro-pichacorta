// Supabase-backed implementations swap in here when supabaseConfigured() is true.
// Every function is async and returns a Promise so the data source can change
// (seed → Supabase) without touching call sites.
//
// When credentials are present we read from Supabase (lib/data/supabase-queries),
// falling back to seed content on any error so the app never hard-fails. Reads
// that legitimately return null/empty (e.g. an unknown profile) are passed through.

import { supabaseConfigured } from "@/lib/env";
import * as sb from "./supabase-queries";
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

/**
 * Run the Supabase-backed fetcher when credentials are configured, falling back
 * to seed content on any error so the app degrades gracefully in demo mode.
 */
async function live<T>(fetch: () => Promise<T>, fallback: () => T | Promise<T>): Promise<T> {
  if (!supabaseConfigured()) return fallback();
  try {
    return await fetch();
  } catch {
    return fallback();
  }
}

// Seed-backed: getMe/getNotifications are user-scoped and need a session-aware
// client (server cookies vs browser). Wiring those live is a follow-up; the
// anon read layer only serves public data.
export async function getMe(): Promise<Profile> {
  return seedMe;
}

function seedFeed(opts: FeedOptions): Post[] {
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

export async function getFeed(opts: FeedOptions = {}): Promise<Post[]> {
  return live(() => sb.getFeed(opts), () => seedFeed(opts));
}

function seedProfile(idOrHandle: string): Profile | null {
  const byKey = byId[idOrHandle];
  if (byKey) return byKey;

  const normalized = idOrHandle.replace(/^@/, "").toLowerCase();
  const byHandle = [...traders, seedMe].find(
    (profile) => profile.handle.toLowerCase() === normalized,
  );
  return byHandle ?? null;
}

export async function getProfile(idOrHandle: string): Promise<Profile | null> {
  return live(() => sb.getProfile(idOrHandle), () => seedProfile(idOrHandle));
}

export async function getTopTraders(n: number): Promise<Profile[]> {
  return live(
    () => sb.getTopTraders(n),
    () => [...traders].sort((a, b) => b.rp - a.rp).slice(0, Math.max(0, n)),
  );
}

export async function getSuggestedTraders(n: number): Promise<Profile[]> {
  return live(
    () => sb.getSuggestedTraders(n),
    () => traders.slice(4, 4 + Math.max(0, n)),
  );
}

export async function getRankings(opts: RankingsOptions = {}): Promise<Profile[]> {
  return live(
    () => sb.getRankings(opts),
    () => {
      const pool = opts.market
        ? traders.filter((trader) => trader.market === opts.market)
        : [...traders];
      return pool.sort((a, b) => b.rp - a.rp);
    },
  );
}

export async function getCommunities(): Promise<Community[]> {
  return live(() => sb.getCommunities(), () => [...communities]);
}

export async function getChannels(communityId: string): Promise<Channel[]> {
  void communityId;
  return [...channels];
}

export async function getChatMessages(channelId: string): Promise<ChatMessage[]> {
  void channelId;
  return [...chatMsgs];
}

function seedCompetitions(filter: CompetitionFilter): Competition[] {
  let result = [...competitions];

  if (filter.market) {
    result = result.filter((competition) => competition.market === filter.market);
  }

  if (filter.joined !== undefined) {
    result = result.filter((competition) => competition.joined === filter.joined);
  }

  return result;
}

export async function getCompetitions(filter: CompetitionFilter = {}): Promise<Competition[]> {
  return live(() => sb.getCompetitions(filter), () => seedCompetitions(filter));
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

function engagement(post: Post): number {
  return post.up - post.down + post.comments;
}
