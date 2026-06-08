"use server";

import { supabaseConfigured } from "@/lib/env";

export interface SaveProfileInput {
  displayName: string;
  handle: string;
  bio: string;
}

export interface ActionResult {
  ok: boolean;
  persisted: boolean;
  message?: string;
}

export async function saveProfile(
  input: SaveProfileInput,
): Promise<ActionResult> {
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
    return { ok: false, persisted: false, message: "Not authenticated." };
  }

  const { error } = await supabase
    .from("profiles")
    .update({
      name: input.displayName,
      handle: input.handle.replace(/^@/, ""),
      bio: input.bio,
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id);

  if (error) {
    return { ok: false, persisted: false, message: error.message };
  }

  return { ok: true, persisted: true };
}

export interface ConnectBrokerInput {
  brokerName: string;
}

export async function connectBroker(
  input: ConnectBrokerInput,
): Promise<ActionResult> {
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
    return { ok: false, persisted: false, message: "Not authenticated." };
  }

  const { error } = await supabase.from("broker_connections").upsert({
    user_id: user.id,
    broker_name: input.brokerName,
    connected_at: new Date().toISOString(),
  });

  if (error) {
    return { ok: false, persisted: false, message: error.message };
  }

  return { ok: true, persisted: true };
}
