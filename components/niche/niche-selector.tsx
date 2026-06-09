import Link from "next/link";
import type { NicheSlug } from "@/types/db";
import { NICHE_LIST } from "@/config/niches";

type NicheSection = "rankings" | "competitions" | "learning";

interface NicheSelectorProps {
  section: NicheSection;
  active: NicheSlug;
}

/**
 * In-section niche switcher. Per the architecture the niche selector lives
 * INSIDE the competitive sections (rankings / competitions / learning), never
 * in the global shell — the social network itself is one shared space.
 */
export function NicheSelector({ section, active }: NicheSelectorProps) {
  return (
    <div
      role="tablist"
      aria-label="Niche"
      style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}
    >
      {NICHE_LIST.map((niche) => {
        const isActive = niche.slug === active;
        return (
          <Link
            key={niche.slug}
            href={`/${section}/${niche.slug}`}
            role="tab"
            aria-selected={isActive}
            className="chip"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 7,
              padding: "7px 13px",
              fontSize: 13,
              fontWeight: 600,
              textDecoration: "none",
              color: isActive ? niche.color : "var(--tx-2)",
              background: isActive
                ? `color-mix(in srgb, ${niche.color} 16%, transparent)`
                : "var(--bg-3)",
              border: `1px solid ${
                isActive ? `color-mix(in srgb, ${niche.color} 42%, transparent)` : "var(--line-1)"
              }`,
              borderRadius: "var(--r-pill)",
            }}
          >
            <span aria-hidden style={{ fontSize: 14 }}>
              {niche.glyph}
            </span>
            {niche.name}
          </Link>
        );
      })}
    </div>
  );
}

export type { NicheSection };
