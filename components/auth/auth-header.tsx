import type { ReactNode } from "react";
import { Logo } from "@/components/shell/logo";

export interface AuthHeaderProps {
  title: string;
  subtitle: ReactNode;
}

export function AuthHeader({ title, subtitle }: AuthHeaderProps) {
  return (
    <header style={{ display: "flex", flexDirection: "column", gap: 18, marginBottom: 26 }}>
      <div className="th-auth-mark">
        <Logo size={30} />
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
        <h1 style={{ fontSize: 26, fontWeight: 700, letterSpacing: "-0.03em" }}>{title}</h1>
        <p style={{ fontSize: 14.5, lineHeight: 1.5, color: "var(--tx-2)" }}>{subtitle}</p>
      </div>
    </header>
  );
}
