"use client";

import { useState, useEffect } from "react";
import type { Dm, DmMessage, Profile } from "@/types/db";
import { Avatar, Button, Icon, IconButton, VerifiedTick } from "@/components/ui";
import { getDmThread } from "@/lib/data/queries";
import { byId } from "@/lib/data/seed";

interface MessagesViewProps {
  dms: Dm[];
  me: Profile;
}

type MobilePane = "list" | "thread";

export function MessagesView({ dms }: MessagesViewProps) {
  const [activeId, setActiveId] = useState<string>(dms[0]?.id ?? "");
  const [thread, setThread] = useState<DmMessage[]>([]);
  const [loadingThread, setLoadingThread] = useState(false);
  const [draft, setDraft] = useState("");
  const [localThread, setLocalThread] = useState<DmMessage[]>([]);
  const [mobilePane, setMobilePane] = useState<MobilePane>("list");

  const activeDm = dms.find((d) => d.id === activeId);
  const activeWho = activeDm ? byId[activeDm.who] : null;
  const messages = thread.length > 0 ? [...thread, ...localThread] : localThread;

  useEffect(() => {
    if (!activeId) return;
    setLocalThread([]);
    setDraft("");
    setLoadingThread(true);
    getDmThread(activeId)
      .then((msgs) => setThread(msgs as DmMessage[]))
      .finally(() => setLoadingThread(false));
  }, [activeId]);

  async function handleSelectDm(id: string) {
    setActiveId(id);
    setMobilePane("thread");
  }

  function handleSend() {
    const text = draft.trim();
    if (!text || !activeDm) return;
    const optimistic: DmMessage = { from: "me", time: "just now", text };
    setLocalThread((prev) => [...prev, optimistic]);
    setDraft("");
  }

  return (
    <div style={{ display: "flex", height: "100%", overflow: "hidden" }}>
      {/* DM list */}
      <div
        style={{
          width: 300,
          flexShrink: 0,
          borderRight: "1px solid var(--line-1)",
          background: "var(--bg-1)",
          display: "flex",
          flexDirection: "column",
        }}
        className={mobilePane !== "list" ? "hidden lg:flex" : "flex lg:flex"}
      >
        <div style={{ padding: "16px 18px 12px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 12,
            }}
          >
            <strong style={{ fontFamily: "var(--f-display)", fontSize: 16 }}>Messages</strong>
            <IconButton icon="plus" size="sm" iconSize={17} />
          </div>
          <label style={{ position: "relative", display: "flex", alignItems: "center" }}>
            <Icon
              name="search"
              size={15}
              style={{ position: "absolute", left: 11, color: "var(--tx-3)" }}
            />
            <input
              className="input"
              placeholder="Search messages"
              style={{ paddingLeft: 34, height: 36 }}
            />
          </label>
        </div>
        <div className="scroll" style={{ flex: 1, padding: "0 10px" }}>
          {dms.map((d) => {
            const u = byId[d.who];
            if (!u) return null;
            const on = d.id === activeId;
            return (
              <button
                key={d.id}
                onClick={() => handleSelectDm(d.id)}
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  gap: 11,
                  padding: "10px 11px",
                  borderRadius: "var(--r-sm)",
                  border: "none",
                  background: on ? "var(--bg-3)" : "transparent",
                  textAlign: "left",
                  marginBottom: 2,
                  cursor: "pointer",
                }}
              >
                <Avatar user={u} size={42} showStatus={d.online} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 6 }}>
                    <span
                      style={{
                        fontWeight: 700,
                        fontSize: 13.5,
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        color: "var(--tx-1)",
                      }}
                    >
                      {u.name.replace(/^You · /, "")}
                    </span>
                    <span className="mono" style={{ fontSize: 10.5, color: "var(--tx-4)" }}>
                      {d.time}
                    </span>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      gap: 6,
                      marginTop: 2,
                    }}
                  >
                    <span
                      style={{
                        fontSize: 12.5,
                        color: d.unread ? "var(--tx-1)" : "var(--tx-3)",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        fontWeight: d.unread ? 600 : 400,
                      }}
                    >
                      {d.last}
                    </span>
                    {d.unread > 0 && (
                      <span
                        style={{
                          minWidth: 18,
                          height: 18,
                          padding: "0 5px",
                          borderRadius: 9,
                          background: "var(--brand)",
                          color: "#fff",
                          fontSize: 11,
                          fontWeight: 700,
                          display: "grid",
                          placeItems: "center",
                          flexShrink: 0,
                        }}
                      >
                        {d.unread}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Thread */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          minWidth: 0,
          background: "var(--bg-1)",
        }}
        className={mobilePane !== "thread" ? "hidden lg:flex" : "flex lg:flex"}
      >
        {activeWho && activeDm ? (
          <>
            <div
              style={{
                height: 56,
                flexShrink: 0,
                borderBottom: "1px solid var(--line-1)",
                display: "flex",
                alignItems: "center",
                gap: 11,
                padding: "0 22px",
              }}
            >
              <button
                className="th-iconbtn sm lg:hidden"
                onClick={() => setMobilePane("list")}
                style={{ marginRight: 2 }}
              >
                <Icon name="caretUp" size={16} style={{ transform: "rotate(-90deg)" }} />
              </button>
              <Avatar user={activeWho} size={36} showStatus={activeDm.online} />
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    fontWeight: 700,
                    fontSize: 14,
                    display: "flex",
                    alignItems: "center",
                    gap: 5,
                  }}
                >
                  {activeWho.name.replace(/^You · /, "")}
                  {activeWho.verified && <VerifiedTick size={13} />}
                </div>
                <div
                  className="mono"
                  style={{
                    fontSize: 11,
                    color: activeDm.online ? "var(--profit)" : "var(--tx-4)",
                  }}
                >
                  {activeDm.online ? "● Active now" : "Offline"}
                </div>
              </div>
              <IconButton icon="trend" iconSize={18} />
              <IconButton icon="ellipsis" iconSize={18} />
            </div>

            <div
              className="scroll"
              style={{
                flex: 1,
                padding: "20px 26px",
                display: "flex",
                flexDirection: "column",
                gap: 4,
              }}
            >
              {loadingThread && (
                <div
                  style={{
                    textAlign: "center",
                    color: "var(--tx-4)",
                    fontSize: 12,
                    fontFamily: "var(--f-mono)",
                    padding: "20px 0",
                  }}
                >
                  Loading…
                </div>
              )}
              {messages.map((m, i) => {
                const mine = m.from === "me";
                const prevSame = i > 0 && messages[i - 1].from === m.from;
                const key = `${m.from}-${m.time}-${i}`;
                return (
                  <div
                    key={key}
                    style={{
                      display: "flex",
                      justifyContent: mine ? "flex-end" : "flex-start",
                      marginTop: prevSame ? 0 : 10,
                    }}
                  >
                    <div style={{ maxWidth: "62%" }}>
                      <div
                        style={{
                          padding: "10px 14px",
                          borderRadius: mine
                            ? "14px 14px 4px 14px"
                            : "14px 14px 14px 4px",
                          background: mine
                            ? "linear-gradient(180deg, var(--brand), var(--brand-2))"
                            : "var(--bg-3)",
                          color: mine ? "#fff" : "var(--tx-1)",
                          fontSize: 13.5,
                          lineHeight: 1.5,
                          border: mine ? "none" : "1px solid var(--line-1)",
                        }}
                      >
                        {m.text}
                        {m.file && (
                          <div
                            style={{
                              marginTop: 8,
                              display: "flex",
                              alignItems: "center",
                              gap: 9,
                              padding: "9px 11px",
                              borderRadius: 9,
                              background: "rgba(0,0,0,0.25)",
                            }}
                          >
                            <Icon name="book" size={18} />
                            <span className="mono" style={{ fontSize: 11.5 }}>
                              {m.file}
                            </span>
                          </div>
                        )}
                      </div>
                      <div
                        className="mono"
                        style={{
                          fontSize: 10,
                          color: "var(--tx-4)",
                          marginTop: 3,
                          textAlign: mine ? "right" : "left",
                        }}
                      >
                        {m.time}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div style={{ padding: "0 22px 20px" }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  background: "var(--bg-3)",
                  border: "1px solid var(--line-2)",
                  borderRadius: "var(--r-md)",
                  padding: "4px 4px 4px 14px",
                }}
              >
                <IconButton icon="plus" size="sm" iconSize={18} />
                <input
                  className="input"
                  placeholder={`Message ${activeWho.name.split(" ")[0]}`}
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSend()}
                  style={{ border: "none", background: "transparent", height: 44 }}
                />
                <Button variant="primary" size="sm" onClick={handleSend}>
                  <Icon name="send" size={15} />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--tx-4)",
              fontSize: 13,
              fontFamily: "var(--f-mono)",
            }}
          >
            Select a conversation
          </div>
        )}
      </div>
    </div>
  );
}
