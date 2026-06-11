"use client";

import { useEffect, useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import type { Market, Notification, Profile } from "@/types/db";
import {
  getMe,
  getNotifications,
  getSuggestedTraders,
  getTopTraders,
} from "@/lib/data/queries";
import { Sidebar } from "./sidebar";
import { TopBar } from "./topbar";
import { RightPanel } from "./right-panel";
import { MobileNav } from "./mobile-nav";
import { MobileDrawer } from "./mobile-drawer";
import { MeProvider } from "./me-context";

interface ShellData {
  me: Profile;
  notifications: Notification[];
  topTraders: Profile[];
  suggested: Profile[];
}

export interface AppShellProps {
  children: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();
  const [market, setMarket] = useState<Market>("Crypto");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const data = useShellData();

  useEffect(() => {
    setDrawerOpen(false);
  }, [pathname]);

  if (!data) return null;

  return (
    <div className="th-shell">
      <div className="th-sidebar-desktop" style={{ height: "100%" }}>
        <Sidebar me={data.me} />
      </div>

      <MobileDrawer open={drawerOpen} me={data.me} onClose={() => setDrawerOpen(false)} />

      <div className="th-main">
        <TopBar
          me={data.me}
          notifications={data.notifications}
          market={market}
          onMarketChange={setMarket}
          onOpenMenu={() => setDrawerOpen(true)}
        />
        <div className="th-content">
          <main className="th-page">
            <MeProvider value={data.me}>{children}</MeProvider>
          </main>
          <RightPanel topTraders={data.topTraders} suggested={data.suggested} />
        </div>
      </div>

      <MobileNav />
    </div>
  );
}

function useShellData(): ShellData | null {
  const [data, setData] = useState<ShellData | null>(null);

  useEffect(() => {
    let active = true;
    void Promise.all([
      getMe(),
      getNotifications(),
      getTopTraders(4),
      getSuggestedTraders(3),
    ]).then(([me, notifications, topTraders, suggested]) => {
      if (active) setData({ me, notifications, topTraders, suggested });
    });
    return () => {
      active = false;
    };
  }, []);

  return data;
}
