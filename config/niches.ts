/**
 * Niche registry — the single import point for the competitive layer.
 *
 * The social network is shared; these modules only parameterise the per-niche
 * competitive surfaces (rankings, competitions, learning, stats, verification).
 */

import type { NicheModule, NicheSlug } from "@/lib/niches/types";
import { trading } from "@/lib/niches/trading/config";
import { emprendimiento } from "@/lib/niches/emprendimiento/config";
import { realEstate } from "@/lib/niches/real-estate/config";
import { marketing } from "@/lib/niches/marketing/config";
import { crypto } from "@/lib/niches/crypto/config";

export const NICHES: Record<NicheSlug, NicheModule> = {
  trading,
  emprendimiento,
  "real-estate": realEstate,
  marketing,
  crypto,
};

/** Display order for selectors and section headers. */
export const NICHE_SLUGS: readonly NicheSlug[] = [
  "trading",
  "crypto",
  "emprendimiento",
  "real-estate",
  "marketing",
];

/** Default niche when none is specified (e.g. the user's primary). */
export const DEFAULT_NICHE: NicheSlug = "trading";

export const NICHE_LIST: readonly NicheModule[] = NICHE_SLUGS.map((slug) => NICHES[slug]);

export function isNicheSlug(value: string): value is NicheSlug {
  return Object.prototype.hasOwnProperty.call(NICHES, value);
}

/** Resolve a slug to its module, falling back to the default niche. */
export function getNiche(slug: string | undefined): NicheModule {
  if (slug && isNicheSlug(slug)) return NICHES[slug];
  return NICHES[DEFAULT_NICHE];
}
