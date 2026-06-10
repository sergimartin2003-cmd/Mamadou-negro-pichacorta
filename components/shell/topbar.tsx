"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Market, Notification, Profile } from "@/types/db";
import { Avatar, Icon } from "@/components/ui";
import { MARKETS, titleForPath } from "./nav-config";
import { NotifPopover } from "./notif";

export interface TopBarProps {
  me: Profile;
  notifications: Notification[];
  market: Market;
  onMarketChange: (market: Market) => void;
  onOpenMenu: () => void;
}

export function TopBar({ me, notifications, market, onMarketChange, onOpenMenu }: TopBarProps) {
  const pathname = usePathname();
  const [notifOpen, setNotifOpen] = useState(false);
  const unread = notifications.filter((n) => !n.read).length;

  return (
    <header
      style={{
        height: "var(--topbar-h)",
        flexShrink: 0,
        borderBottom: "1px solid var(--line-1)",
        background: "color-mix(in srgb, var(--bg-1) 80%, transparent)",
        backdropFilter: "blur(12px)",
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "0 16px",
        position: "relative",
        zIndex: 30,
      }}
    >
      <button
        className="th-iconbtn th-hamburger"
        onClick={onOpenMenu}
        aria-label="Open navigation"
      >
        <Icon name="menu" size={20} sw={2} />
      </button>

      <h2 className="th-topbar-title" style={{ fontSize: 18, fontWeight: 600, minWidth: 0 }}>
        {titleForPath(pathname)}
      </h2>

      <form
        action="/search"
        className="th-search-full"
        style={{ flex: 1, maxWidth: 440, position: "relative", alignItems: "center" }}
      >
        <Icon name="search" size={17} style={{ position: "absolute", left: 13, color: "var(--tx-3)" }} />
        <input
          className="input"
          type="search"
          name="q"
          placeholder="Busca emprendedores, posts, cursos…"
          aria-label="Búsqueda global"
          style={{ paddingLeft: 38, height: 38, background: "var(--bg-2)" }}
        />
        <kbd
          style={{
            position: "absolute",
            right: 10,
            fontSize: 11,
            fontFamily: "var(--f-mono)",
            color: "var(--tx-4)",
            border: "1px solid var(--line-2)",
            borderRadius: 5,
            padding: "2px 6px",
          }}
        >
          /
        </kbd>
      </form>

      <Link href="/search" className="th-iconbtn th-search-icon" aria-label="Buscar">
        <Icon name="search" size={19} />
      </Link>

      <div style={{ flex: 1 }} />

      <div
        className="th-market-segmented"
        style={{
          gap: 2,
          background: "var(--bg-2)",
          border: "1px solid var(--line-1)",
          borderRadius: "var(--r-sm)",
          padding: 3,
        }}
      >
        {MARKETS.map((m) => (
          <button
            key={m}
            onClick={() => onMarketChange(m)}
            style={{
              border: "none",
              borderRadius: 6,
              padding: "6px 11px",
              fontSize: 12.5,
              fontWeight: 600,
              background: market === m ? "var(--bg-4)" : "transparent",
              color: market === m ? "var(--tx-1)" : "var(--tx-3)",
              boxShadow: market === m ? "var(--sh-1)" : "none",
              transition: "all .14s",
            }}
          >
            {m}
          </button>
        ))}
      </div>

      <div className="th-market-compact">
        <select
          aria-label="Market"
          value={market}
          onChange={(event) => onMarketChange(event.target.value as Market)}
          className="input"
          style={{ height: 36, width: "auto", padding: "0 28px 0 10px", fontSize: 12.5 }}
        >
          {MARKETS.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>
      </div>

      <button
        className="th-iconbtn"
        onClick={() => setNotifOpen((open) => !open)}
        aria-label="Notifications"
        style={{ position: "relative" }}
      >
        <Icon name="bell" size={19} />
        {unread > 0 && (
          <span
            style={{
              position: "absolute",
              top: 6,
              right: 6,
              width: 8,
              height: 8,
              borderRadius: 5,
              background: "var(--loss)",
              border: "2px solid var(--bg-1)",
            }}
          />
        )}
      </button>
      {notifOpen && (
        <NotifPopover notifications={notifications} onClose={() => setNotifOpen(false)} />
      )}

      <Link href="/premium" title="Upgrade" className="th-iconbtn" style={{ color: "var(--t-gold)" }}>
        <Icon name="bolt" size={19} fill />
      </Link>

      <Link href="/profile" style={{ display: "grid", placeItems: "center" }}>
        <Avatar user={me} size={36} ring="var(--brand)" />
      </Link>
    </header>
  );
}
