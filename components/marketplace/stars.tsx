import { Icon } from "@/components/ui";

interface StarsProps {
  rating: number;
  size?: number;
}

/** Five-star rating display, filled up to round(rating). */
export function Stars({ rating, size = 13 }: StarsProps) {
  const full = Math.round(rating);
  return (
    <span style={{ display: "inline-flex", gap: 1, color: "var(--t-gold)" }} aria-label={`${rating} de 5`}>
      {Array.from({ length: 5 }, (_, i) => (
        <Icon key={i} name="star" size={size} fill={i < full} style={{ opacity: i < full ? 1 : 0.28 }} />
      ))}
    </span>
  );
}
