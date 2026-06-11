"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { Profile } from "@/types/db";
import { me as seedMe } from "@/lib/data/seed";

const MeContext = createContext<Profile | null>(null);

/** Provides the signed-in profile (real with Supabase, seed in demo) to the tree. */
export function MeProvider({ value, children }: { value: Profile; children: ReactNode }) {
  return <MeContext.Provider value={value}>{children}</MeContext.Provider>;
}

/** The signed-in profile; falls back to the seed user outside a provider/demo. */
export function useMe(): Profile {
  return useContext(MeContext) ?? seedMe;
}
