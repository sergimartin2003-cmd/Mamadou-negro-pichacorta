import { NextResponse, type NextRequest } from "next/server";
import { seasonalReset } from "@/lib/domain/elo";
import { supabaseConfigured } from "@/lib/env";

/**
 * Monthly season reset (Vercel Cron → see vercel.json). Compresses every
 * niche-ladder RP toward the placement anchor via the same `seasonalReset`
 * the domain layer uses. Protected by CRON_SECRET; no-ops without Supabase.
 *
 * Service-role write: bypasses RLS to touch all rows, exactly what a system
 * job should do. Never callable from the client.
 */
export async function GET(req: NextRequest): Promise<NextResponse> {
  const secret = process.env["CRON_SECRET"];
  if (secret) {
    const auth = req.headers.get("authorization");
    if (auth !== `Bearer ${secret}`) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }
  }

  const serviceKey = process.env["SUPABASE_SERVICE_ROLE_KEY"];
  const url = process.env["NEXT_PUBLIC_SUPABASE_URL"];
  if (!supabaseConfigured() || !serviceKey || !url) {
    return NextResponse.json({ skipped: "not_configured" });
  }

  const { createClient } = await import("@supabase/supabase-js");
  const supabase = createClient(url, serviceKey);

  const { data, error } = await supabase.from("user_niche_stats").select("profile_id, niche, rp");
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const rows = (data ?? []) as { profile_id: string; niche: string; rp: number }[];
  let updated = 0;
  for (const row of rows) {
    const next = seasonalReset(row.rp);
    if (next === row.rp) continue;
    const { error: upErr } = await supabase
      .from("user_niche_stats")
      .update({ rp: next })
      .eq("profile_id", row.profile_id)
      .eq("niche", row.niche);
    if (!upErr) updated += 1;
  }

  return NextResponse.json({ ok: true, reset: updated, of: rows.length });
}
