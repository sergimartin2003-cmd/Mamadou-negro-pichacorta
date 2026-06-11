import { supabaseConfigured } from "@/lib/env";

const MAX_AVATAR_BYTES = 4 * 1024 * 1024;

/**
 * Upload an avatar to the public `avatars` bucket under the user's own folder
 * and return its public URL. Client-side (browser Supabase client). Returns
 * null in demo mode, on oversize files, or on any upload error.
 */
export async function uploadAvatar(file: File): Promise<string | null> {
  if (!supabaseConfigured() || file.size > MAX_AVATAR_BYTES) return null;

  const { createClient } = await import("@/lib/supabase/client");
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const ext = (file.name.split(".").pop() ?? "png").toLowerCase().replace(/[^a-z0-9]/g, "") || "png";
  const path = `${user.id}/avatar-${Date.now()}.${ext}`;

  const { error } = await supabase.storage
    .from("avatars")
    .upload(path, file, { upsert: true, cacheControl: "3600" });
  if (error) return null;

  return supabase.storage.from("avatars").getPublicUrl(path).data.publicUrl;
}
