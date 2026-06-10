"use client";

import { useState } from "react";
import type { Notification, NotificationType } from "@/types/db";
import { Segmented, Chip, Icon } from "@/components/ui";
import { NotifRow } from "@/components/shell/notif";
import { markNotificationsRead } from "@/lib/actions/social";
import { useRealtimeInserts } from "@/lib/supabase/use-realtime-inserts";

type Tab = "All" | "Mentions" | "Ranks" | "Competitions";

const KNOWN_NOTIF_TYPES: NotificationType[] = [
  "rank",
  "like",
  "comp",
  "comment",
  "follow",
  "tier",
];

interface NotificationRow {
  id: string;
  actor_id: string | null;
  type: string;
  body: string | null;
  read: boolean;
}

const TAB_OPTIONS: ReadonlyArray<Tab> = ["All", "Mentions", "Ranks", "Competitions"];

const TAB_TYPES: Record<Exclude<Tab, "All">, NotificationType[]> = {
  Mentions: ["comment", "like", "follow"],
  Ranks: ["rank", "tier"],
  Competitions: ["comp"],
};

function filterByTab(items: Notification[], tab: Tab): Notification[] {
  if (tab === "All") return items;
  const types = TAB_TYPES[tab];
  return items.filter((n) => types.includes(n.type));
}

interface NotificationsViewProps {
  items: Notification[];
}

export function NotificationsView({ items }: NotificationsViewProps) {
  const [tab, setTab] = useState<Tab>("All");
  const [notifications, setNotifications] = useState<Notification[]>(items);

  // Realtime: RLS only delivers the signed-in user's own rows. No-op in demo.
  useRealtimeInserts<NotificationRow>({
    table: "notifications",
    onInsert: (row) => {
      if (!KNOWN_NOTIF_TYPES.includes(row.type as NotificationType)) return;
      setNotifications((prev) =>
        prev.some((n) => n.id === row.id)
          ? prev
          : [
              {
                id: row.id,
                type: row.type as NotificationType,
                read: row.read,
                time: "ahora",
                text: row.body ?? "",
                who: row.actor_id,
              },
              ...prev,
            ],
      );
    },
  });

  const filtered = filterByTab(notifications, tab);

  function handleMarkAllRead() {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    // Persist (real with Supabase, no-op in demo); local state stays optimistic.
    void markNotificationsRead();
  }

  return (
    <div
      style={{
        maxWidth: 680,
        margin: "0 auto",
        padding: "20px 16px",
        display: "flex",
        flexDirection: "column",
        gap: 14,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
        <Segmented
          options={TAB_OPTIONS as ReadonlyArray<string>}
          value={tab}
          onChange={(key) => setTab(key as Tab)}
        />
        <div style={{ flex: 1 }} />
        <Chip onClick={handleMarkAllRead}>
          <Icon name="check" size={14} /> Mark all read
        </Chip>
      </div>
      <div className="card" style={{ overflow: "hidden" }}>
        {filtered.length === 0 ? (
          <div
            style={{
              padding: "32px 16px",
              textAlign: "center",
              color: "var(--tx-4)",
              fontSize: 13,
              fontFamily: "var(--f-mono)",
            }}
          >
            No notifications here
          </div>
        ) : (
          filtered.map((n) => <NotifRow key={n.id} n={n} />)
        )}
      </div>
    </div>
  );
}
