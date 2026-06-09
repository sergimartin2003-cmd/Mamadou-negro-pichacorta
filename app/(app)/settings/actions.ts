"use server";

import { z } from "zod";
import { supabaseConfigured } from "@/lib/env";

const DISPLAY_NAME_MAX = 40;
const HANDLE_MIN = 3;
const HANDLE_MAX = 20;
const BIO_MAX = 280;
const LABEL_MAX = 60;

const CONNECTION_PROVIDERS = [
  "tradingview",
  "broker",
  "propfirm",
  "exchange",
  "csv",
] as const;

const saveProfileSchema = z.object({
  displayName: z.string().trim().min(1, "Add a display name.").max(DISPLAY_NAME_MAX),
  handle: z
    .string()
    .trim()
    .transform((value) => value.replace(/^@/, ""))
    .pipe(
      z
        .string()
        .min(HANDLE_MIN, `Username must be at least ${HANDLE_MIN} characters.`)
        .max(HANDLE_MAX, `Username must be ${HANDLE_MAX} characters or fewer.`)
        .regex(/^[a-z0-9_]+$/i, "Use letters, numbers and underscores only."),
    ),
  bio: z.string().trim().max(BIO_MAX),
});

export type SaveProfileInput = z.infer<typeof saveProfileSchema>;

const connectBrokerSchema = z.object({
  provider: z.enum(CONNECTION_PROVIDERS),
  label: z.string().trim().max(LABEL_MAX).optional(),
});

export type ConnectBrokerInput = z.infer<typeof connectBrokerSchema>;

export interface ActionResult {
  ok: boolean;
  persisted: boolean;
  message?: string;
}

export async function saveProfile(input: unknown): Promise<ActionResult> {
  const parsed = saveProfileSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      persisted: false,
      message: parsed.error.issues[0]?.message ?? "Invalid profile data.",
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
    return { ok: false, persisted: false, message: "Not authenticated." };
  }

  const { error } = await supabase
    .from("profiles")
    .update({
      display_name: parsed.data.displayName,
      handle: parsed.data.handle,
      bio: parsed.data.bio,
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id);

  if (error) {
    return { ok: false, persisted: false, message: error.message };
  }

  return { ok: true, persisted: true };
}

export async function connectBroker(input: unknown): Promise<ActionResult> {
  const parsed = connectBrokerSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      persisted: false,
      message: parsed.error.issues[0]?.message ?? "Invalid connection data.",
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
    return { ok: false, persisted: false, message: "Not authenticated." };
  }

  const { error } = await supabase.from("broker_connections").insert({
    profile_id: user.id,
    provider: parsed.data.provider,
    status: "pending",
    label: parsed.data.label ?? null,
  });

  if (error) {
    return { ok: false, persisted: false, message: error.message };
  }

  return { ok: true, persisted: true };
}
