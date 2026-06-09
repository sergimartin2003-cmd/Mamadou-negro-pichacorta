"use server";

import { z } from "zod";
import { supabaseConfigured } from "@/lib/env";
import { rateLimit } from "@/lib/ratelimit";

const MARKETS = ["Crypto", "Forex", "Futures", "Stocks"] as const;
const MARKET_ENUM: Record<(typeof MARKETS)[number], string> = {
  Crypto: "crypto",
  Forex: "forex",
  Futures: "futures",
  Stocks: "stocks",
};

const TITLE_MAX = 140;
const BODY_MAX = 4000;
const SYMBOL_MAX = 20;
const TAG_MAX = 30;
const TAGS_MAX = 8;
const RATE_LIMIT = 10;
const RATE_WINDOW_MS = 60_000;

const createPostSchema = z.object({
  title: z.string().trim().min(1, "Add a title.").max(TITLE_MAX),
  body: z.string().trim().max(BODY_MAX),
  symbol: z.string().trim().min(1, "Add a symbol.").max(SYMBOL_MAX),
  rr: z.number().finite(),
  dir: z.enum(["long", "short"]),
  market: z.enum(MARKETS),
  tags: z.array(z.string().trim().min(1).max(TAG_MAX)).max(TAGS_MAX),
});

export type CreatePostInput = z.infer<typeof createPostSchema>;

export type CreatePostResult =
  | { ok: true; persisted: boolean; id?: string }
  | { ok: false; error: string; message: string };

export async function createPost(input: unknown): Promise<CreatePostResult> {
  const parsed = createPostSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: "validation",
      message: parsed.error.issues[0]?.message ?? "Invalid post data.",
    };
  }

  if (!supabaseConfigured()) {
    return { ok: true, persisted: false };
  }

  const { createClient } = await import("@/lib/supabase/server");
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return {
      ok: false,
      error: "not_authenticated",
      message: "Your session has expired. Please sign in again.",
    };
  }

  const limited = await rateLimit(`create-post:${user.id}`, {
    limit: RATE_LIMIT,
    windowMs: RATE_WINDOW_MS,
  });
  if (!limited.success) {
    return {
      ok: false,
      error: "rate_limited",
      message: "Too many attempts, try again shortly.",
    };
  }

  const { data, error } = await supabase
    .from("posts")
    .insert({
      author_id: user.id,
      title: parsed.data.title,
      body: parsed.data.body,
      symbol: parsed.data.symbol,
      rr: parsed.data.rr,
      dir: parsed.data.dir,
      market: MARKET_ENUM[parsed.data.market],
      result: "open",
    })
    .select("id")
    .single();

  if (error || !data) {
    return {
      ok: false,
      error: "insert_failed",
      message: error?.message ?? "Could not create post.",
    };
  }

  if (parsed.data.tags.length > 0) {
    const rows = parsed.data.tags.map((tag) => ({ post_id: data.id, tag }));
    const { error: tagError } = await supabase.from("post_tags").insert(rows);
    if (tagError) {
      return { ok: false, error: "tags_failed", message: tagError.message };
    }
  }

  return { ok: true, persisted: true, id: data.id as string };
}
