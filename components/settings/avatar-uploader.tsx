"use client";

import { useRef, useState, type ChangeEvent } from "react";
import { Avatar } from "@/components/ui";
import type { Profile } from "@/types/db";
import { supabaseConfigured } from "@/lib/env";
import { uploadAvatar } from "@/lib/supabase/storage";
import { saveAvatarUrl } from "@/lib/actions/social";

type State = "idle" | "working" | "demo" | "error";

const HINTS: Record<State, string> = {
  idle: "PNG o JPG, máx 4MB",
  working: "Subiendo…",
  demo: "Vista previa (demo — se guarda al conectar Supabase).",
  error: "No se pudo subir. Revisa el formato (PNG/JPG) y el tamaño (máx 4MB).",
};

export function AvatarUploader({ profile }: { profile: Profile }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [url, setUrl] = useState<string | undefined>(profile.avatarUrl);
  const [state, setState] = useState<State>("idle");

  async function onFile(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (file.size > 4 * 1024 * 1024) {
      setState("error");
      return;
    }

    if (!supabaseConfigured()) {
      setUrl(URL.createObjectURL(file));
      setState("demo");
      return;
    }

    setState("working");
    const publicUrl = await uploadAvatar(file);
    if (!publicUrl) {
      setState("error");
      return;
    }
    const res = await saveAvatarUrl(publicUrl);
    if (!res.ok) {
      setState("error");
      return;
    }
    setUrl(publicUrl);
    setState("idle");
  }

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 20 }}>
      <Avatar user={{ ...profile, avatarUrl: url }} size={72} ring="var(--brand)" />
      <div>
        <button
          className="btn sm"
          onClick={() => inputRef.current?.click()}
          disabled={state === "working"}
        >
          {state === "working" ? "Subiendo…" : "Cambiar foto"}
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          hidden
          onChange={onFile}
        />
        <div
          style={{
            fontSize: 11.5,
            color: state === "error" ? "var(--loss)" : state === "demo" ? "var(--profit)" : "var(--tx-4)",
            marginTop: 6,
          }}
        >
          {HINTS[state]}
        </div>
      </div>
    </div>
  );
}
