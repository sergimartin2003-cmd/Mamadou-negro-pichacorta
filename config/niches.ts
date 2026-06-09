/**
 * Niche registry — the single import point for the competitive layer.
 *
 * EmprendeHub is one shared social network; these modules only parameterise the
 * per-niche competitive surfaces (rankings, retos, academia, stats, verificación).
 * Trading is one niche among the eight, fully backward-compatible.
 */

import type { NicheModule, NicheSlug } from "@/lib/niches/types";
import { ecommerce } from "@/lib/niches/ecommerce/config";
import { saas } from "@/lib/niches/saas/config";
import { contenido } from "@/lib/niches/contenido/config";
import { trading } from "@/lib/niches/trading/config";
import { inmobiliario } from "@/lib/niches/inmobiliario/config";
import { servicios } from "@/lib/niches/servicios/config";
import { amazon } from "@/lib/niches/amazon/config";
import { dropshipping } from "@/lib/niches/dropshipping/config";

export const NICHES: Record<NicheSlug, NicheModule> = {
  ecommerce,
  saas,
  contenido,
  trading,
  inmobiliario,
  servicios,
  amazon,
  dropshipping,
};

/** Display order for selectors and section headers. */
export const NICHE_SLUGS: readonly NicheSlug[] = [
  "ecommerce",
  "saas",
  "contenido",
  "trading",
  "inmobiliario",
  "servicios",
  "amazon",
  "dropshipping",
];

/** Default niche when none is specified (e.g. the user's primary). */
export const DEFAULT_NICHE: NicheSlug = "ecommerce";

export const NICHE_LIST: readonly NicheModule[] = NICHE_SLUGS.map((slug) => NICHES[slug]);

export function isNicheSlug(value: string): value is NicheSlug {
  return Object.prototype.hasOwnProperty.call(NICHES, value);
}

/** Resolve a slug to its module, falling back to the default niche. */
export function getNiche(slug: string | undefined): NicheModule {
  if (slug && isNicheSlug(slug)) return NICHES[slug];
  return NICHES[DEFAULT_NICHE];
}
