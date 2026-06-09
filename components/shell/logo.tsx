export interface LogoProps {
  size?: number;
  withText?: boolean;
}

export function Logo({ size = 30, withText = true }: LogoProps) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
      <div
        style={{
          position: "relative",
          width: size,
          height: size,
          display: "grid",
          placeItems: "center",
          background: "linear-gradient(150deg, var(--brand), var(--brand-2))",
          borderRadius: 9,
          boxShadow: "var(--sh-brand)",
        }}
      >
        <svg
          width={size * 0.6}
          height={size * 0.6}
          viewBox="0 0 24 24"
          fill="none"
          stroke="#fff"
          strokeWidth="2.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M4 16l5-5 4 4 7-9" />
          <path d="M20 6v5h-5" />
        </svg>
      </div>
      {withText && (
        <span className="display" style={{ fontSize: size * 0.62, fontWeight: 700, letterSpacing: "-0.03em" }}>
          Emprende<span style={{ color: "var(--brand)" }}>Hub</span>
        </span>
      )}
    </div>
  );
}
