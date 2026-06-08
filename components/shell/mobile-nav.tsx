"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Icon } from "@/components/ui";
import { MOBILE_NAV, isActivePath } from "./nav-config";

export function MobileNav() {
  const pathname = usePathname();
  const [left, right] = [MOBILE_NAV.slice(0, 2), MOBILE_NAV.slice(2)];

  return (
    <nav
      className="th-mobilenav"
      style={{
        position: "fixed",
        left: 0,
        right: 0,
        bottom: 0,
        height: 64,
        zIndex: 35,
        alignItems: "center",
        justifyContent: "space-around",
        background: "color-mix(in srgb, var(--bg-1) 92%, transparent)",
        backdropFilter: "blur(12px)",
        borderTop: "1px solid var(--line-1)",
        paddingBottom: "env(safe-area-inset-bottom)",
      }}
    >
      {left.map((item) => (
        <MobileTab key={item.href} href={item.href} icon={item.icon} label={item.label} active={isActivePath(pathname, item.href)} />
      ))}

      <Link href="/create" aria-label="New post" style={{ display: "grid", placeItems: "center", marginTop: -18 }}>
        <motion.span
          whileTap={{ scale: 0.92 }}
          style={{
            width: 52,
            height: 52,
            borderRadius: 16,
            display: "grid",
            placeItems: "center",
            background: "linear-gradient(180deg, var(--brand) 0%, var(--brand-2) 100%)",
            color: "#fff",
            boxShadow: "var(--sh-brand)",
          }}
        >
          <Icon name="plus" size={24} sw={2.4} />
        </motion.span>
      </Link>

      {right.map((item) => (
        <MobileTab key={item.href} href={item.href} icon={item.icon} label={item.label} active={isActivePath(pathname, item.href)} />
      ))}
    </nav>
  );
}

interface MobileTabProps {
  href: string;
  icon: Parameters<typeof Icon>[0]["name"];
  label: string;
  active: boolean;
}

function MobileTab({ href, icon, label, active }: MobileTabProps) {
  return (
    <Link
      href={href}
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 3,
        minWidth: 56,
        color: active ? "var(--brand)" : "var(--tx-3)",
        fontSize: 10,
        fontWeight: 600,
      }}
    >
      <Icon name={icon} size={21} sw={active ? 2.1 : 1.8} />
      {label}
    </Link>
  );
}
