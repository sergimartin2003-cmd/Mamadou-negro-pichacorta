import type { ReactNode } from "react";
import { BrandPanel } from "@/components/auth/brand-panel";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        minHeight: "100dvh",
        display: "grid",
        gridTemplateColumns: "minmax(0, 1fr)",
        background: "var(--bg-1)",
      }}
      className="th-auth-grid"
    >
      <BrandPanel />
      <main
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "40px 24px",
          minHeight: "100dvh",
        }}
      >
        <div style={{ width: "100%", maxWidth: 408 }}>{children}</div>
      </main>
    </div>
  );
}
