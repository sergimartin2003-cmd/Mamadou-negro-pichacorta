"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import type { Profile } from "@/types/db";
import { tierFor } from "@/lib/domain/tiers";
import { Avatar, Button, Icon } from "@/components/ui";
import { NAV, isActivePath } from "./nav-config";
import { Logo } from "./logo";

export interface SidebarProps {
  me: Profile;
}

export function Sidebar({ me }: SidebarProps) {
  const pathname = usePathname();
  const tier = tierFor(me.rp);

  return (
    <aside
      style={{
        width: "var(--nav-w)",
        flexShrink: 0,
        height: "100%",
        background: "var(--bg-1)",
        borderRight: "1px solid var(--line-1)",
        display: "flex",
        flexDirection: "column",
        padding: "16px 12px",
      }}
    >
      <div style={{ padding: "4px 8px 18px" }}>
        <Link href="/feed" aria-label="EmprendeHub inicio">
          <Logo size={30} />
        </Link>
      </div>

      <Link href="/create" style={{ marginBottom: 16, display: "block" }}>
        <Button variant="primary" block>
          <Icon name="plus" size={17} sw={2.4} /> New post
        </Button>
      </Link>

      <nav style={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {NAV.map((item) => {
          const active = isActivePath(pathname, item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className="th-nav-link"
              data-active={active}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                height: 42,
                padding: "0 12px",
                borderRadius: "var(--r-sm)",
                background: active ? "var(--brand-dim)" : "transparent",
                color: active ? "#fff" : "var(--tx-2)",
                fontWeight: 600,
                fontSize: 14,
                position: "relative",
              }}
            >
              {active && (
                <motion.span
                  layoutId="sidebar-active"
                  transition={{ type: "spring", stiffness: 520, damping: 38 }}
                  style={{
                    position: "absolute",
                    left: -12,
                    top: 9,
                    bottom: 9,
                    width: 3,
                    borderRadius: 3,
                    background: "var(--brand)",
                  }}
                />
              )}
              <Icon
                name={item.icon}
                size={20}
                sw={active ? 2.1 : 1.8}
                style={{ color: active ? "var(--brand)" : "inherit" }}
              />
              <span style={{ flex: 1 }}>{item.label}</span>
              {item.badge && (
                <span
                  style={{
                    minWidth: 18,
                    height: 18,
                    padding: "0 5px",
                    borderRadius: 9,
                    background: "var(--loss)",
                    color: "#fff",
                    fontSize: 11,
                    fontWeight: 700,
                    display: "grid",
                    placeItems: "center",
                  }}
                >
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <div style={{ flex: 1 }} />

      <Link
        href="/settings"
        className="th-nav-link"
        data-active={isActivePath(pathname, "/settings")}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          height: 42,
          padding: "0 12px",
          borderRadius: "var(--r-sm)",
          background: isActivePath(pathname, "/settings") ? "var(--bg-3)" : "transparent",
          color: "var(--tx-2)",
          fontWeight: 600,
          fontSize: 14,
          marginBottom: 8,
        }}
      >
        <Icon name="gear" size={20} /> <span>Settings</span>
      </Link>

      <Link
        href="/profile"
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
          <div
            style={{
              fontWeight: 700,
              fontSize: 13,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            Alex Rhodes
          </div>
          <div className="mono" style={{ fontSize: 11, color: "var(--tx-3)" }}>
            {tier.name} · {me.rp.toLocaleString()} RP
          </div>
        </div>
      </Link>
    </aside>
  );
}
