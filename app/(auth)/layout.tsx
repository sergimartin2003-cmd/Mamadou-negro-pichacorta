import type { ReactNode } from "react";
import { BrandPanel } from "@/components/auth/brand-panel";

const RESPONSIVE_CSS = `
.th-auth-grid { grid-template-columns: minmax(0, 1fr); }
.th-auth-brand { display: none; }
@media (min-width: 960px) {
  .th-auth-grid { grid-template-columns: minmax(0, 1.05fr) minmax(0, 0.95fr); }
  .th-auth-brand { display: block; }
}
`;

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div
      style={{ minHeight: "100dvh", display: "grid", background: "var(--bg-1)" }}
      className="th-auth-grid"
    >
      <style>{RESPONSIVE_CSS}</style>
      <BrandPanel />
      <main
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "48px 24px",
          minHeight: "100dvh",
        }}
      >
        <div style={{ width: "100%", maxWidth: 408 }}>{children}</div>
      </main>
    </div>
  );
}
