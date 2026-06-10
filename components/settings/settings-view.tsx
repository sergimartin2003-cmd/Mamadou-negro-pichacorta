"use client";

import { useState, useTransition } from "react";
import { Icon } from "@/components/ui/icon";
import { Avatar } from "@/components/ui/avatar";
import type { Profile } from "@/types/db";
import {
  saveProfile,
  connectBroker,
  type SaveProfileInput,
  type ActionResult,
} from "@/app/(app)/settings/actions";
import { NicheVerify } from "./niche-verify";

interface SettingsViewProps {
  profile: Profile;
}

type Section =
  | "Profile"
  | "Account"
  | "Notifications"
  | "Language"
  | "Connected accounts"
  | "Privacy";

const SECTIONS: Section[] = [
  "Profile",
  "Account",
  "Notifications",
  "Language",
  "Connected accounts",
  "Privacy",
];

interface TogglesState {
  likes: boolean;
  comments: boolean;
  ranks: boolean;
  comps: boolean;
  marketing: boolean;
}

interface ToggleProps {
  on: boolean;
  onClick: () => void;
}

function Toggle({ on, onClick }: ToggleProps) {
  return (
    <button
      onClick={onClick}
      style={{
        width: 42,
        height: 24,
        borderRadius: 999,
        border: "none",
        background: on ? "var(--brand)" : "var(--bg-4)",
        position: "relative",
        transition: "background .15s",
        cursor: "pointer",
        flexShrink: 0,
      }}
    >
      <span
        style={{
          position: "absolute",
          top: 3,
          left: on ? 21 : 3,
          width: 18,
          height: 18,
          borderRadius: "50%",
          background: "#fff",
          transition: "left .15s",
        }}
      />
    </button>
  );
}

interface RowProps {
  label: string;
  sub?: string;
  children: React.ReactNode;
}

function Row({ label, sub, children }: RowProps) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 16,
        padding: "15px 0",
        borderBottom: "1px solid var(--line-1)",
      }}
    >
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 13.5, fontWeight: 600 }}>{label}</div>
        {sub && (
          <div style={{ fontSize: 12, color: "var(--tx-3)", marginTop: 2 }}>
            {sub}
          </div>
        )}
      </div>
      {children}
    </div>
  );
}

function useToast() {
  const [toast, setToast] = useState<string | null>(null);
  function show(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  }
  return { toast, show };
}

export function SettingsView({ profile }: SettingsViewProps) {
  const [sec, setSec] = useState<Section>("Profile");
  const [lang, setLang] = useState<"EN" | "ES">("EN");
  const [toggles, setToggles] = useState<TogglesState>({
    likes: true,
    comments: true,
    ranks: true,
    comps: true,
    marketing: false,
  });
  const [displayName, setDisplayName] = useState(profile.name);
  const [handle, setHandle] = useState(profile.handle);
  const [bio, setBio] = useState(profile.bio);
  const [isPending, startTransition] = useTransition();
  const { toast, show } = useToast();

  function handleSaveProfile() {
    const input: SaveProfileInput = { displayName, handle, bio };
    startTransition(async () => {
      const result: ActionResult = await saveProfile(input);
      if (result.ok) {
        show(result.persisted ? "Profile saved." : "Profile updated (demo mode).");
      } else {
        show(result.message ?? "Failed to save profile.");
      }
    });
  }

  function handleConnect(brokerName: string) {
    startTransition(async () => {
      const result: ActionResult = await connectBroker({ brokerName });
      if (result.ok) {
        show(
          result.persisted
            ? `${brokerName} connected.`
            : `${brokerName} connect simulated (demo mode).`,
        );
      } else {
        show(result.message ?? "Connection failed.");
      }
    });
  }

  return (
    <div
      style={{
        maxWidth: 880,
        margin: "0 auto",
        display: "flex",
        gap: 24,
        flexWrap: "wrap",
      }}
    >
      {/* Toast */}
      {toast && (
        <div
          style={{
            position: "fixed",
            bottom: 24,
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 100,
            background: "var(--bg-float)",
            border: "1px solid var(--line-2)",
            borderRadius: "var(--r-md)",
            padding: "12px 20px",
            fontSize: 13.5,
            fontWeight: 600,
            color: "var(--tx-1)",
            boxShadow: "var(--sh-2)",
            whiteSpace: "nowrap",
          }}
        >
          {toast}
        </div>
      )}

      {/* Sidebar nav */}
      <div
        style={{
          width: 210,
          flexShrink: 0,
          minWidth: 0,
        }}
      >
        {SECTIONS.map((s) => (
          <button
            key={s}
            onClick={() => setSec(s)}
            style={{
              width: "100%",
              textAlign: "left",
              padding: "10px 13px",
              borderRadius: "var(--r-sm)",
              border: "none",
              background: sec === s ? "var(--bg-3)" : "transparent",
              color: sec === s ? "var(--tx-1)" : "var(--tx-3)",
              fontWeight: 600,
              fontSize: 13.5,
              marginBottom: 2,
              cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Content panel */}
      <div style={{ flex: 1, minWidth: 0 }}>
        {sec === "Profile" && (
          <div className="card pad" style={{ padding: "24px 28px" }}>
            <h2 style={{ fontSize: 18, marginBottom: 4 }}>Profile</h2>
            <p style={{ color: "var(--tx-3)", fontSize: 13, marginBottom: 20 }}>
              Así te ven los demás en EmprendeHub.
            </p>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 16,
                marginBottom: 20,
              }}
            >
              <Avatar user={profile} size={72} ring="var(--brand)" />
              <div>
                <button className="btn sm">Change avatar</button>
                <div
                  style={{
                    fontSize: 11.5,
                    color: "var(--tx-4)",
                    marginTop: 6,
                  }}
                >
                  PNG or JPG, max 4MB
                </div>
              </div>
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 16,
                marginBottom: 16,
              }}
            >
              <div>
                <div className="sec-label" style={{ marginBottom: 7 }}>
                  Display name
                </div>
                <input
                  className="input"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                />
              </div>
              <div>
                <div className="sec-label" style={{ marginBottom: 7 }}>
                  Handle
                </div>
                <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                  <span
                    aria-hidden
                    style={{
                      position: "absolute",
                      left: 13,
                      color: "var(--tx-4)",
                      fontSize: 14,
                      pointerEvents: "none",
                    }}
                  >
                    @
                  </span>
                  <input
                    className="input"
                    style={{ paddingLeft: 26 }}
                    value={handle}
                    onChange={(e) => setHandle(e.target.value)}
                  />
                </div>
              </div>
            </div>
            <div style={{ marginBottom: 16 }}>
              <div className="sec-label" style={{ marginBottom: 7 }}>
                Bio
              </div>
              <textarea
                className="input"
                style={{ height: 80, padding: "10px 13px", resize: "none" }}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
              />
            </div>
            <div
              style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}
            >
              <button
                className="btn"
                onClick={() => {
                  setDisplayName(profile.name);
                  setHandle(profile.handle);
                  setBio(profile.bio);
                }}
              >
                Cancel
              </button>
              <button
                className="btn primary"
                disabled={isPending}
                onClick={handleSaveProfile}
              >
                {isPending ? "Saving…" : "Save changes"}
              </button>
            </div>
          </div>
        )}

        {sec === "Notifications" && (
          <div className="card pad" style={{ padding: "24px 28px" }}>
            <h2 style={{ fontSize: 18, marginBottom: 20 }}>
              Notification preferences
            </h2>
            <Row
              label="Upvotes & reactions"
              sub="When someone upvotes your posts"
            >
              <Toggle
                on={toggles.likes}
                onClick={() =>
                  setToggles((t) => ({ ...t, likes: !t.likes }))
                }
              />
            </Row>
            <Row
              label="Comments & replies"
              sub="Replies to your posts and comments"
            >
              <Toggle
                on={toggles.comments}
                onClick={() =>
                  setToggles((t) => ({ ...t, comments: !t.comments }))
                }
              />
            </Row>
            <Row
              label="Rank changes"
              sub="When your global or seasonal rank moves"
            >
              <Toggle
                on={toggles.ranks}
                onClick={() =>
                  setToggles((t) => ({ ...t, ranks: !t.ranks }))
                }
              />
            </Row>
            <Row
              label="Competition results"
              sub="Standings, battle outcomes & invites"
            >
              <Toggle
                on={toggles.comps}
                onClick={() =>
                  setToggles((t) => ({ ...t, comps: !t.comps }))
                }
              />
            </Row>
            <Row
              label="Product & marketing"
              sub="Novedades, consejos y ofertas de EmprendeHub"
            >
              <Toggle
                on={toggles.marketing}
                onClick={() =>
                  setToggles((t) => ({ ...t, marketing: !t.marketing }))
                }
              />
            </Row>
          </div>
        )}

        {sec === "Language" && (
          <div className="card pad" style={{ padding: "24px 28px" }}>
            <h2 style={{ fontSize: 18, marginBottom: 6 }}>Language</h2>
            <p style={{ color: "var(--tx-3)", fontSize: 13, marginBottom: 18 }}>
              Choose your interface language.
            </p>
            {(
              [
                ["EN", "English"],
                ["ES", "Español"],
              ] as const
            ).map(([k, v]) => (
              <button
                key={k}
                onClick={() => setLang(k)}
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "14px 16px",
                  borderRadius: "var(--r-md)",
                  border: `1px solid ${lang === k ? "var(--brand-line)" : "var(--line-1)"}`,
                  background: lang === k ? "var(--brand-dim)" : "var(--bg-3)",
                  marginBottom: 10,
                  cursor: "pointer",
                  fontFamily: "inherit",
                }}
              >
                <span className="mono" style={{ fontWeight: 700, width: 32 }}>
                  {k}
                </span>
                <span
                  style={{
                    flex: 1,
                    textAlign: "left",
                    fontSize: 14,
                    fontWeight: 600,
                    color: "var(--tx-1)",
                  }}
                >
                  {v}
                </span>
                {lang === k && (
                  <Icon
                    name="check"
                    size={18}
                    sw={2.4}
                    style={{ color: "var(--brand)" }}
                  />
                )}
              </button>
            ))}
          </div>
        )}

        {sec === "Connected accounts" && (
          <div className="card pad" style={{ padding: "24px 28px" }}>
            <h2 style={{ fontSize: 18, marginBottom: 6 }}>
              Connected accounts
            </h2>
            <p style={{ color: "var(--tx-3)", fontSize: 13, marginBottom: 18 }}>
              Sync verified performance directly from your broker or charting
              tool.
            </p>
            {(
              [
                [
                  "Charting platform",
                  "Sync your published chart ideas",
                  "var(--t-diamond)",
                  true,
                ],
                [
                  "Broker / prop firm",
                  "Verify live PnL & drawdown",
                  "var(--profit)",
                  false,
                ],
                [
                  "Exchange API (read-only)",
                  "Auto-import crypto trade history",
                  "var(--t-gold)",
                  false,
                ],
              ] as const
            ).map(([n, d, , conn]) => (
              <Row key={n} label={n} sub={d}>
                {conn ? (
                  <span
                    className="chip tag"
                    style={{
                      color: "var(--profit)",
                      borderColor: "var(--profit-line)",
                    }}
                  >
                    <Icon name="check" size={12} /> Connected
                  </span>
                ) : (
                  <button
                    className="btn sm"
                    disabled={isPending}
                    onClick={() => handleConnect(n)}
                  >
                    Connect
                  </button>
                )}
              </Row>
            ))}
            <NicheVerify />
          </div>
        )}

        {(sec === "Account" || sec === "Privacy") && (
          <div className="card pad" style={{ padding: "24px 28px" }}>
            <h2 style={{ fontSize: 18, marginBottom: 6 }}>{sec}</h2>
            <Row label="Email" sub="alex@emprendehub.app">
              <button className="btn sm">Change</button>
            </Row>
            <Row label="Password" sub="Last changed 3 months ago">
              <button className="btn sm">Update</button>
            </Row>
            <Row
              label="Two-factor auth"
              sub="Recomendado para emprendedores verificados"
            >
              <span
                className="chip tag"
                style={{
                  color: "var(--profit)",
                  borderColor: "var(--profit-line)",
                }}
              >
                On
              </span>
            </Row>
            <div style={{ marginTop: 18 }}>
              <button
                className="btn"
                style={{
                  color: "var(--loss)",
                  borderColor: "var(--loss-line)",
                }}
              >
                Delete account
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
