import Link from "next/link";
import type { Profile } from "@/types/db";
import { Avatar, Icon } from "@/components/ui";

interface ComposerStripProps {
  me: Profile;
}

export function ComposerStrip({ me }: ComposerStripProps) {
  return (
    <div className="card" style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 14px" }}>
      <Avatar user={me} size={40} ring="var(--brand)" />
      <Link
        href="/create"
        style={{
          flex: 1,
          textAlign: "left",
          height: 40,
          padding: "0 15px",
          borderRadius: "var(--r-sm)",
          background: "var(--bg-3)",
          border: "1px solid var(--line-2)",
          color: "var(--tx-3)",
          fontSize: 13.5,
          display: "flex",
          alignItems: "center",
        }}
      >
        Share a setup, chart, or result…
      </Link>
      <Link href="/create" className="btn sm">
        <Icon name="image" size={16} /> Chart
      </Link>
      <Link href="/create" className="btn primary sm">
        <Icon name="trend" size={16} /> Log trade
      </Link>
    </div>
  );
}
