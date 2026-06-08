"use client";

import { useState } from "react";
import { startOAuth } from "@/lib/auth/actions";
import { OAUTH_PROVIDERS, type OAuthProvider } from "@/lib/auth/schemas";
import { OAuthGlyph } from "./oauth-glyph";

const LABELS: Record<OAuthProvider, string> = {
  google: "Google",
  apple: "Apple",
  discord: "Discord",
  twitter: "X",
};

export interface SocialButtonsProps {
  onError: (message: string) => void;
}

export function SocialButtons({ onError }: SocialButtonsProps) {
  const [pending, setPending] = useState<OAuthProvider | null>(null);

  async function connect(provider: OAuthProvider): Promise<void> {
    setPending(provider);
    const result = await startOAuth(provider);
    if (result.ok) {
      window.location.assign(result.data);
      return;
    }
    setPending(null);
    onError(result.message);
  }

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(2, 1fr)",
        gap: 10,
      }}
    >
      {OAUTH_PROVIDERS.map((provider) => (
        <button
          key={provider}
          type="button"
          className="btn"
          disabled={pending !== null}
          onClick={() => void connect(provider)}
          style={{ opacity: pending && pending !== provider ? 0.5 : 1 }}
        >
          <OAuthGlyph provider={provider} />
          {pending === provider ? "Redirecting…" : LABELS[provider]}
        </button>
      ))}
    </div>
  );
}
