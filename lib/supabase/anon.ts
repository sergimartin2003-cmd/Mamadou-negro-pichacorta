import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { env } from "@/lib/env";

// Isomorphic anon-key client for public reads (feed, profiles, rankings,
// communities, competitions). It carries no session and never touches
// next/headers, so it is safe to bundle for both server and client and reads
// only what RLS exposes to anonymous visitors.
export function anonClient(): SupabaseClient {
  const url = env.supabaseUrl();
  const key = env.supabaseAnonKey();
  if (!url || !key) {
    throw new Error("Supabase is not configured.");
  }
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
