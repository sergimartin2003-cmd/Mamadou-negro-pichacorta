"use client";

import { useEffect, useRef } from "react";
import type { RealtimeChannel } from "@supabase/supabase-js";
import { supabaseConfigured } from "@/lib/env";

interface RealtimeInsertOptions<Row> {
  table: string;
  /** Optional postgres filter, e.g. `channel_id=eq.<uuid>`. */
  filter?: string;
  onInsert: (row: Row) => void;
  /** Set false to pause the subscription (e.g. while a panel is closed). */
  enabled?: boolean;
}

/**
 * Subscribe to INSERTs on a public table via Supabase Realtime.
 *
 * No-ops in demo mode (no keys) so the seed experience is untouched.
 * postgres_changes respects RLS for the signed-in client, so private
 * tables (notifications, DMs) only deliver the caller's own rows.
 */
export function useRealtimeInserts<Row>(options: RealtimeInsertOptions<Row>) {
  const { table, filter, enabled = true } = options;

  // Keep the latest callback without re-subscribing on every render.
  const onInsertRef = useRef(options.onInsert);
  onInsertRef.current = options.onInsert;

  useEffect(() => {
    if (!enabled || !supabaseConfigured()) return;

    let channel: RealtimeChannel | null = null;
    let cancelled = false;

    import("@/lib/supabase/client").then(({ createClient }) => {
      if (cancelled) return;
      const supabase = createClient();
      channel = supabase
        .channel(`rt:${table}:${filter ?? "all"}`)
        .on(
          "postgres_changes",
          { event: "INSERT", schema: "public", table, ...(filter ? { filter } : {}) },
          (payload) => onInsertRef.current(payload.new as Row),
        )
        .subscribe();
    });

    return () => {
      cancelled = true;
      channel?.unsubscribe();
    };
  }, [table, filter, enabled]);
}
