"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import type { Profile } from "@/types/db";
import { tierFor } from "@/lib/domain/tiers";
import { Avatar, Button, Icon } from "@/components/ui";
import { NAV, isActivePath } from "./nav-config";
import { Logo } from "./logo";

export interface MobileDrawerProps {
  open: boolean;
  me: Profile;
  onClose: () => void;
}

const DRAWER_LINKS = [...NAV, { href: "/settings", label: "Settings", icon: "gear" as const }];

export function MobileDrawer({ open, me, onClose }: MobileDrawerProps) {
  const pathname = usePathname();
  const tier = tierFor(me.rp);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="drawer-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            style={{ position: "fixed", inset: 0, zIndex: 60, background: "rgba(0,0,0,0.55)" }}
          />
          <motion.aside
            key="drawer-panel"
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", stiffness: 420, damping: 40 }}
            style={{
              position: "fixed",
              left: 0,
              top: 0,
              bottom: 0,
              width: "min(280px, 84vw)",
              zIndex: 61,
              background: "var(--bg-1)",
              borderRight: "1px solid var(--line-1)",
              display: "flex",
              flexDirection: "column",
              padding: "16px 12px",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "4px 8px 18px",
              }}
            >
              <Logo size={30} />
              <button className="th-iconbtn sm" onClick={onClose} aria-label="Close navigation">
                <Icon name="close" size={18} />
              </button>
            </div>

            <Link href="/create" onClick={onClose} style={{ marginBottom: 16, display: "block" }}>
              <Button variant="primary" block>
                <Icon name="plus" size={17} sw={2.4} /> New post
              </Button>
            </Link>

            <nav style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {DRAWER_LINKS.map((item) => {
                const active = isActivePath(pathname, item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onClose}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      height: 44,
                      padding: "0 12px",
                      borderRadius: "var(--r-sm)",
                      background: active ? "var(--brand-dim)" : "transparent",
                      color: active ? "#fff" : "var(--tx-2)",
                      fontWeight: 600,
                      fontSize: 14.5,
                    }}
                  >
                    <Icon
                      name={item.icon}
                      size={20}
                      sw={active ? 2.1 : 1.8}
                      style={{ color: active ? "var(--brand)" : "inherit" }}
                    />
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            <div style={{ flex: 1 }} />

            <Link
              href="/profile"
              onClick={onClose}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "9px 10px",
                borderRadius: "var(--r-md)",
                border: "1px solid var(--line-1)",
                background: "var(--bg-2)",
              }}
            >
              <Avatar user={me} size={36} ring="var(--brand)" />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 700, fontSize: 13 }}>Alex Rhodes</div>
                <div className="mono" style={{ fontSize: 11, color: "var(--tx-3)" }}>
                  {tier.name} · {me.rp.toLocaleString()} RP
                </div>
              </div>
            </Link>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
