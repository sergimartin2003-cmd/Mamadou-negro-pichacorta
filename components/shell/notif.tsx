"use client";

import { type ReactNode } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import type { Notification, NotificationType } from "@/types/db";
import { Chip, Icon, type IconName } from "@/components/ui";

const NOTIF_ICON: Record<NotificationType, IconName> = {
  rank: "trend",
  like: "up",
  comp: "swords",
  comment: "comment",
  follow: "user",
  tier: "shield",
};

const NOTIF_COLOR: Record<NotificationType, string> = {
  rank: "var(--profit)",
  like: "var(--brand)",
  comp: "var(--t-gold)",
  comment: "var(--t-diamond)",
  follow: "var(--brand)",
  tier: "var(--t-platinum)",
};

export function renderRich(text: string): ReactNode[] {
  return text.split(/(\*\*[^*]+\*\*)/g).map((part, i) =>
    part.startsWith("**") ? (
      <strong key={i} style={{ color: "var(--tx-1)", fontWeight: 700 }}>
        {part.slice(2, -2)}
      </strong>
    ) : (
      <span key={i}>{part}</span>
    ),
  );
}

export interface NotifRowProps {
  n: Notification;
}

export function NotifRow({ n }: NotifRowProps) {
  const col = NOTIF_COLOR[n.type];
  return (
    <div
      style={{
        display: "flex",
        gap: 12,
        padding: "12px 16px",
        borderBottom: "1px solid var(--line-1)",
        background: n.read ? "transparent" : "color-mix(in srgb, var(--brand) 5%, transparent)",
        alignItems: "flex-start",
      }}
    >
      <div
        style={{
          width: 34,
          height: 34,
          borderRadius: 9,
          flexShrink: 0,
          display: "grid",
          placeItems: "center",
          background: `color-mix(in srgb, ${col} 14%, transparent)`,
          color: col,
        }}
      >
        <Icon name={NOTIF_ICON[n.type]} size={17} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, color: "var(--tx-2)", lineHeight: 1.45 }}>{renderRich(n.text)}</div>
        <div style={{ fontSize: 11, color: "var(--tx-4)", marginTop: 3, fontFamily: "var(--f-mono)" }}>
          {n.time} ago
        </div>
      </div>
      {!n.read && (
        <span
          style={{ width: 7, height: 7, borderRadius: 4, background: "var(--brand)", marginTop: 6 }}
        />
      )}
    </div>
  );
}

export interface NotifPopoverProps {
  notifications: Notification[];
  onClose: () => void;
}

export function NotifPopover({ notifications, onClose }: NotifPopoverProps) {
  return (
    <>
      <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 40 }} />
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.18, ease: [0.2, 0.7, 0.2, 1] }}
        style={{
          position: "absolute",
          top: 54,
          right: 16,
          width: 360,
          maxWidth: "calc(100vw - 24px)",
          zIndex: 50,
          background: "var(--bg-float)",
          border: "1px solid var(--line-2)",
          borderRadius: "var(--r-lg)",
          boxShadow: "var(--sh-3)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "14px 16px",
            borderBottom: "1px solid var(--line-1)",
          }}
        >
          <strong style={{ fontFamily: "var(--f-display)", fontSize: 15 }}>Notifications</strong>
          <Link href="/messages" onClick={onClose}>
            <Chip tag>View all</Chip>
          </Link>
        </div>
        <div className="scroll" style={{ maxHeight: 380 }}>
          {notifications.slice(0, 5).map((n) => (
            <NotifRow key={n.id} n={n} />
          ))}
        </div>
      </motion.div>
    </>
  );
}
