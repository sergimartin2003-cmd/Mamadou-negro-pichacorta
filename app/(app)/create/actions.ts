"use server";

import { supabaseConfigured } from "@/lib/env";
import type { TradeDir, Market } from "@/types/db";

export interface CreatePostInput {
  title: string;
  body: string;
  symbol: string;
  entry: string;
  rr: number;
  dir: TradeDir;
  market: Market;
  communityId: string;
  tags: string[];
}

export interface CreatePostResult {
  persisted: boolean;
}

export async function createPost(input: CreatePostInput): Promise<CreatePostResult> {
  if (!supabaseConfigured()) {
    return { persisted: false };
  }

  const { createClient } = await import("@/lib/supabase/server");
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { persisted: false };
  }

  const { error } = await supabase.from("posts").insert({
    author: user.id,
    title: input.title,
    body: input.body,
    symbol: input.symbol,
    entry: input.entry,
    rr: input.rr,
    dir: input.dir,
    market: input.market,
    community_id: input.communityId,
    tags: input.tags,
    result: "open",
    up: 0,
    down: 0,
    comments: 0,
    pnl: 0,
  });

  if (error) {
    throw new Error(`Failed to persist post: ${error.message}`);
  }

  return { persisted: true };
}
