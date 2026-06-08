"use client";

import { useState } from "react";
import type { ChatMessage as ChatMessageType, Channel, Community } from "@/types/db";
import { Avatar, Button, Icon, IconButton, RankBadge } from "@/components/ui";
import { ChatMessage } from "./chat-message";
import { byId, me, traders } from "@/lib/data/seed";
import { tierFor } from "@/lib/domain/tiers";

type Pane = "rail" | "channels" | "chat" | "members";

interface CommunitiesViewProps {
  communities: Community[];
  channels: Channel[];
  chatMessages: ChatMessageType[];
}

export function CommunitiesView({ communities, channels, chatMessages }: CommunitiesViewProps) {
  const [activeCommunity, setActiveCommunity] = useState(communities[0]?.id ?? "");
  const [activeChannel, setActiveChannel] = useState(channels[0]?.id ?? "");
  const [mobilePane, setMobilePane] = useState<Pane>("rail");
  const [draft, setDraft] = useState("");
  const [localMessages, setLocalMessages] = useState<ChatMessageType[]>(chatMessages);

  const comm = communities.find((c) => c.id === activeCommunity);

  function handleSelectCommunity(id: string) {
    setActiveCommunity(id);
    setMobilePane("channels");
  }

  function handleSelectChannel(id: string) {
    setActiveChannel(id);
    setMobilePane("chat");
  }

  function handleSend() {
    const text = draft.trim();
    if (!text) return;
    const optimistic: ChatMessageType = {
      id: `opt-${Date.now()}`,
      author: me.id,
      time: "just now",
      text,
    };
    setLocalMessages((prev) => [...prev, optimistic]);
    setDraft("");
  }

  const onlineTraders = traders.slice(0, 5);
  const offlineTraders = traders.slice(5, 8);
  const activeChannelName = channels.find((c) => c.id === activeChannel)?.name ?? "general";

  return (
    <div style={{ display: "flex", height: "100%", overflow: "hidden" }}>
      {/* Community rail — always visible on lg+, mobile rail pane */}
      <div
        style={{
          width: 240,
          flexShrink: 0,
          borderRight: "1px solid var(--line-1)",
          background: "var(--bg-1)",
          display: "flex",
          flexDirection: "column",
        }}
        className={mobilePane !== "rail" ? "hidden lg:flex" : "flex lg:flex"}
      >
        <div
          style={{
            padding: "16px 16px 10px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <span className="sec-label">Your communities</span>
          <IconButton icon="plus" size="sm" iconSize={16} />
        </div>
        <div className="scroll" style={{ flex: 1, padding: "0 10px" }}>
          {communities.map((c) => {
            const on = c.id === activeCommunity;
            return (
              <button
                key={c.id}
                onClick={() => handleSelectCommunity(c.id)}
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  gap: 11,
                  padding: "9px 10px",
                  borderRadius: "var(--r-sm)",
                  border: "none",
                  background: on ? "var(--bg-3)" : "transparent",
                  textAlign: "left",
                  marginBottom: 2,
                  cursor: "pointer",
                }}
              >
                <div
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: 11,
                    flexShrink: 0,
                    display: "grid",
                    placeItems: "center",
                    fontSize: 18,
                    background: `color-mix(in srgb, ${c.color} 18%, var(--bg-3))`,
                    color: c.color,
                    border: on ? `1px solid ${c.color}` : "1px solid var(--line-1)",
                  }}
                >
                  {c.icon}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontWeight: 600,
                      fontSize: 13,
                      color: on ? "var(--tx-1)" : "var(--tx-2)",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {c.name}
                  </div>
                  <div className="mono" style={{ fontSize: 10.5, color: "var(--tx-4)" }}>
                    {(c.members / 1000).toFixed(1)}k members
                  </div>
                </div>
              </button>
            );
          })}
          <Button variant="outline" size="sm" block style={{ marginTop: 10 }}>
            <Icon name="compass" size={15} /> Discover more
          </Button>
        </div>
      </div>

      {/* Channel list — visible on lg+ or mobile channels pane */}
      {comm && (
        <div
          style={{
            width: 208,
            flexShrink: 0,
            borderRight: "1px solid var(--line-1)",
            background: "var(--bg-1)",
            display: "flex",
            flexDirection: "column",
          }}
          className={mobilePane !== "channels" ? "hidden lg:flex" : "flex lg:flex"}
        >
          <div
            style={{
              padding: "0 16px",
              height: 56,
              display: "flex",
              alignItems: "center",
              gap: 9,
              borderBottom: "1px solid var(--line-1)",
            }}
          >
            {/* back button on mobile */}
            <button
              className="th-iconbtn sm lg:hidden"
              onClick={() => setMobilePane("rail")}
              style={{ marginRight: 2 }}
            >
              <Icon name="caretUp" size={16} style={{ transform: "rotate(-90deg)" }} />
            </button>
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: 8,
                display: "grid",
                placeItems: "center",
                background: `color-mix(in srgb, ${comm.color} 18%, transparent)`,
                color: comm.color,
                fontSize: 15,
              }}
            >
              {comm.icon}
            </div>
            <div style={{ minWidth: 0 }}>
              <div
                style={{
                  fontWeight: 700,
                  fontSize: 13.5,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {comm.name}
              </div>
            </div>
          </div>
          <div className="scroll" style={{ flex: 1, padding: "14px 10px" }}>
            <div className="sec-label" style={{ padding: "0 8px 8px" }}>
              Channels
            </div>
            {channels.map((c) => {
              const on = c.id === activeChannel;
              return (
                <button
                  key={c.id}
                  onClick={() => handleSelectChannel(c.id)}
                  style={{
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "7px 9px",
                    borderRadius: "var(--r-xs)",
                    border: "none",
                    background: on ? "var(--bg-3)" : "transparent",
                    color: on ? "var(--tx-1)" : "var(--tx-3)",
                    fontWeight: on ? 700 : 600,
                    fontSize: 13.5,
                    marginBottom: 1,
                    cursor: "pointer",
                  }}
                >
                  <Icon
                    name="hash"
                    size={15}
                    style={{ color: on ? comm.color : "var(--tx-4)" }}
                  />
                  {c.name}
                </button>
              );
            })}
          </div>
          <div
            style={{
              padding: "10px 14px",
              borderTop: "1px solid var(--line-1)",
              display: "flex",
              alignItems: "center",
              gap: 9,
            }}
          >
            <Avatar user={me} size={32} ring="var(--brand)" showStatus />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 700, fontSize: 12.5 }}>
                {me.name.replace(/^You · /, "")}
              </div>
              <div className="mono" style={{ fontSize: 10, color: "var(--profit)" }}>
                ● Online
              </div>
            </div>
            <IconButton icon="gear" size="sm" iconSize={16} />
          </div>
        </div>
      )}

      {/* Chat area — visible on lg+ or mobile chat pane */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          minWidth: 0,
          background: "var(--bg-1)",
        }}
        className={mobilePane !== "chat" ? "hidden lg:flex" : "flex lg:flex"}
      >
        <div
          style={{
            height: 56,
            flexShrink: 0,
            borderBottom: "1px solid var(--line-1)",
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "0 22px",
          }}
        >
          {/* back button on mobile */}
          <button
            className="th-iconbtn sm lg:hidden"
            onClick={() => setMobilePane("channels")}
          >
            <Icon name="caretUp" size={16} style={{ transform: "rotate(-90deg)" }} />
          </button>
          <Icon name="hash" size={19} style={{ color: "var(--tx-3)" }} />
          <strong style={{ fontSize: 15 }}>{activeChannelName}</strong>
          <div style={{ width: 1, height: 20, background: "var(--line-2)", margin: "0 4px" }} />
          <span style={{ fontSize: 12.5, color: "var(--tx-3)" }}>
            Share your A+ setups with stop, target &amp; thesis.
          </span>
          <div style={{ flex: 1 }} />
          <IconButton icon="bell" iconSize={18} />
          <button
            className="th-iconbtn lg:hidden"
            onClick={() => setMobilePane("members")}
          >
            <Icon name="user" size={18} />
          </button>
          <IconButton icon="user" iconSize={18} className="hidden lg:grid" />
        </div>

        <div className="scroll" style={{ flex: 1, paddingTop: 14 }}>
          {comm && (
            <div style={{ padding: "24px 22px 18px" }}>
              <div
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: 15,
                  display: "grid",
                  placeItems: "center",
                  background: `color-mix(in srgb, ${comm.color} 16%, transparent)`,
                  color: comm.color,
                  fontSize: 26,
                  marginBottom: 12,
                }}
              >
                {comm.icon}
              </div>
              <h2 style={{ fontSize: 22 }}>Welcome to #{activeChannelName}</h2>
              <p style={{ color: "var(--tx-3)", fontSize: 13.5, marginTop: 4 }}>
                This is the start of the #{activeChannelName} channel in {comm.name}.
              </p>
            </div>
          )}
          <div className="hr" style={{ margin: "0 22px 8px" }} />
          {localMessages.map((m) => (
            <ChatMessage key={m.id} m={m} />
          ))}
        </div>

        <div style={{ padding: "0 22px 20px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              background: "var(--bg-3)",
              border: "1px solid var(--line-2)",
              borderRadius: "var(--r-md)",
              padding: "4px 4px 4px 14px",
            }}
          >
            <IconButton icon="plus" size="sm" iconSize={18} />
            <input
              className="input"
              placeholder={`Message #${activeChannelName}`}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              style={{ border: "none", background: "transparent", height: 44, paddingLeft: 4 }}
            />
            <IconButton icon="image" size="sm" iconSize={18} />
            <IconButton icon="trend" size="sm" iconSize={18} />
            <Button variant="primary" size="sm" onClick={handleSend}>
              <Icon name="send" size={15} />
            </Button>
          </div>
        </div>
      </div>

      {/* Member list — visible on lg+ or mobile members pane */}
      <div
        style={{
          width: 212,
          flexShrink: 0,
          borderLeft: "1px solid var(--line-1)",
          background: "var(--bg-1)",
          padding: "16px 12px",
        }}
        className={`scroll ${mobilePane !== "members" ? "hidden lg:block" : "block lg:block"}`}
      >
        {/* back on mobile */}
        <button
          className="th-iconbtn sm lg:hidden"
          onClick={() => setMobilePane("chat")}
          style={{ marginBottom: 8 }}
        >
          <Icon name="caretUp" size={16} style={{ transform: "rotate(-90deg)" }} />
        </button>
        <div className="sec-label" style={{ padding: "0 8px 10px" }}>
          Online — {onlineTraders.length}
        </div>
        {onlineTraders.map((t) => (
          <button
            key={t.id}
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "7px 8px",
              borderRadius: "var(--r-sm)",
              border: "none",
              background: "transparent",
              textAlign: "left",
              cursor: "pointer",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-3)")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
          >
            <Avatar user={t} size={32} showStatus />
            <div style={{ minWidth: 0 }}>
              <div
                style={{
                  fontWeight: 600,
                  fontSize: 12.5,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {t.name.split(" ")[0]}
              </div>
              <div className="mono" style={{ fontSize: 10, color: "var(--tx-4)" }}>
                {tierFor(t.rp).name}
              </div>
            </div>
          </button>
        ))}
        <div className="sec-label" style={{ padding: "14px 8px 10px" }}>
          Offline — 3
        </div>
        {offlineTraders.map((t) => (
          <button
            key={t.id}
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "7px 8px",
              borderRadius: "var(--r-sm)",
              border: "none",
              background: "transparent",
              textAlign: "left",
              opacity: 0.5,
              cursor: "pointer",
            }}
          >
            <Avatar user={t} size={32} />
            <div style={{ minWidth: 0 }}>
              <div style={{ fontWeight: 600, fontSize: 12.5 }}>{t.name.split(" ")[0]}</div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
