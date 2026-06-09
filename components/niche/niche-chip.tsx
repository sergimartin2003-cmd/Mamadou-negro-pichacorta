import type { NicheSlug } from "@/types/db";
import { getNiche } from "@/config/niches";

interface NicheChipProps {
  niche: NicheSlug;
  size?: "sm" | "md";
}

/** A small niche tag (glyph + name) in the niche's accent color. */
export function NicheChip({ niche, size = "sm" }: NicheChipProps) {
  const nicheModule = getNiche(niche);
  const fs = size === "sm" ? 10.5 : 12;
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
        padding: size === "sm" ? "2px 8px" : "3px 10px",
        borderRadius: "var(--r-pill)",
        fontSize: fs,
        fontWeight: 600,
        lineHeight: 1,
        whiteSpace: "nowrap",
        color: nicheModule.color,
        background: `color-mix(in srgb, ${nicheModule.color} 14%, transparent)`,
        border: `1px solid color-mix(in srgb, ${nicheModule.color} 34%, transparent)`,
      }}
    >
      <span aria-hidden style={{ fontSize: fs * 1.05 }}>
        {nicheModule.glyph}
      </span>
      {nicheModule.name}
    </span>
  );
}
