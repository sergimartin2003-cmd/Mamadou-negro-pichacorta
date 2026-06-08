"use client";

import { Segmented } from "@/components/ui";
import { MARKETS, type MarketLabel } from "@/lib/auth/schemas";
import { Field } from "@/components/auth/field";
import type { OnboardingState } from "./constants";

export type IdentityErrors = Partial<Record<"displayName" | "username" | "country", string>>;

export interface StepIdentityProps {
  state: OnboardingState;
  errors: IdentityErrors;
  onPatch: (patch: Partial<OnboardingState>) => void;
}

export function StepIdentity({ state, errors, onPatch }: StepIdentityProps) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <h2 style={{ fontSize: 26, fontWeight: 700, letterSpacing: "-0.03em" }}>Who are you?</h2>
        <p style={{ fontSize: 14.5, lineHeight: 1.5, color: "var(--tx-2)" }}>
          This is how you&apos;ll appear across leaderboards and competitions.
        </p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <Field
          label="Display name"
          name="displayName"
          autoComplete="name"
          placeholder="Kaito Mercer"
          value={state.displayName}
          onChange={(event) => onPatch({ displayName: event.target.value })}
          error={errors.displayName}
        />
        <Field
          label="Username"
          name="username"
          autoComplete="username"
          prefix="@"
          placeholder="yourhandle"
          value={state.username}
          onChange={(event) => onPatch({ username: event.target.value })}
          error={errors.username}
        />
        <Field
          label="Country"
          name="country"
          autoComplete="country"
          placeholder="US"
          maxLength={2}
          value={state.country}
          onChange={(event) => onPatch({ country: event.target.value.toUpperCase() })}
          hint="Two-letter country code for your regional rank."
          error={errors.country}
        />
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
        <span className="sec-label" style={{ color: "var(--tx-2)" }}>
          Primary market
        </span>
        <Segmented
          options={[...MARKETS]}
          value={state.market}
          onChange={(key) => onPatch({ market: key as MarketLabel })}
        />
      </div>
    </div>
  );
}
