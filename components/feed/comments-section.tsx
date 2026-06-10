"use client";

import { useState, type ReactNode } from "react";
import type { Comment, Profile } from "@/types/db";
import { Avatar, Icon } from "@/components/ui";
import { byId, me } from "@/lib/data/seed";
import { getComments } from "@/lib/data/queries";
import { addComment } from "@/lib/actions/social";

interface CommentsSectionProps {
  postId: string;
  count: number;
  /** The rest of the post's action row (share/save/etc.), kept inline. */
  children?: ReactNode;
}

interface CommentNodeProps {
  comment: Comment;
  replies: Comment[];
  onReply: (parentId: string, body: string) => void;
}

function authorOf(id: string): Profile | undefined {
  return byId[id];
}

function CommentNode({ comment, replies, onReply }: CommentNodeProps) {
  const [replying, setReplying] = useState(false);
  const [draft, setDraft] = useState("");
  const author = authorOf(comment.author);
  if (!author) return null;

  function submitReply() {
    const text = draft.trim();
    if (!text) return;
    onReply(comment.id, text);
    setDraft("");
    setReplying(false);
  }

  return (
    <div style={{ display: "flex", gap: 10 }}>
      <Avatar user={author} size={30} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 7, flexWrap: "wrap" }}>
          <strong style={{ fontSize: 13 }}>{author.name.replace(/^You · /, "")}</strong>
          <span className="mono" style={{ fontSize: 11, color: "var(--tx-4)" }}>
            · {comment.time}
          </span>
        </div>
        <p style={{ fontSize: 13.5, color: "var(--tx-2)", lineHeight: 1.5, margin: "3px 0 6px" }}>
          {comment.body}
        </p>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span className="mono" style={{ fontSize: 11.5, color: "var(--tx-3)", display: "inline-flex", alignItems: "center", gap: 4 }}>
            <Icon name="caretUp" size={13} /> {comment.up}
          </span>
          <button
            onClick={() => setReplying((r) => !r)}
            style={{ border: "none", background: "transparent", cursor: "pointer", fontSize: 11.5, fontWeight: 600, color: "var(--tx-3)", padding: 0 }}
          >
            Responder
          </button>
        </div>

        {replying && (
          <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
            <input
              className="input"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && submitReply()}
              placeholder={`Responder a @${author.handle}…`}
              style={{ height: 34, fontSize: 13, flex: 1 }}
              autoFocus
            />
            <button className="btn sm primary" onClick={submitReply}>
              Enviar
            </button>
          </div>
        )}

        {replies.length > 0 && (
          <div style={{ marginTop: 10, paddingLeft: 12, borderLeft: "2px solid var(--line-1)", display: "flex", flexDirection: "column", gap: 12 }}>
            {replies.map((reply) => (
              <CommentNode key={reply.id} comment={reply} replies={[]} onReply={onReply} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Threaded comments under a post. Collapsed by default; loads via the async
 * data layer on first open. New comments/replies post through the server
 * action (real with Supabase, optimistic-only in demo).
 */
export function CommentsSection({ postId, count, children }: CommentsSectionProps) {
  const [open, setOpen] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [draft, setDraft] = useState("");

  function toggle() {
    setOpen((o) => !o);
    if (!loaded) {
      getComments(postId).then((data) => {
        setComments(data);
        setLoaded(true);
      });
    }
  }

  function appendLocal(parentId: string | null, body: string) {
    const local: Comment = {
      id: `local-${postId}-${comments.length + 1}`,
      postId,
      author: me.id,
      parentId,
      body,
      time: "ahora",
      up: 0,
    };
    setComments((prev) => [...prev, local]);
    addComment(postId, body, parentId ?? undefined).then((res) => {
      if (!res.ok) setComments((prev) => prev.filter((c) => c.id !== local.id));
    });
  }

  function submitTop() {
    const text = draft.trim();
    if (!text) return;
    appendLocal(null, text);
    setDraft("");
  }

  const topLevel = comments.filter((c) => c.parentId === null);
  const repliesFor = (id: string) => comments.filter((c) => c.parentId === id);
  const shown = loaded ? comments.length : count;

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 6, color: "var(--tx-3)" }}>
        <button className="th-action" aria-expanded={open} onClick={toggle} aria-label="Ver comentarios">
          <Icon name="comment" size={17} />
          <span className="mono">{shown}</span>
        </button>
        {children}
      </div>

      {open && (
        <div style={{ marginTop: 12, paddingTop: 14, borderTop: "1px solid var(--line-1)", display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ display: "flex", gap: 8 }}>
            <Avatar user={me} size={30} />
            <input
              className="input"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && submitTop()}
              placeholder="Añade un comentario…"
              style={{ height: 36, fontSize: 13, flex: 1 }}
            />
            <button className="btn sm primary" onClick={submitTop} disabled={!draft.trim()}>
              Comentar
            </button>
          </div>

          {!loaded ? (
            <span style={{ fontSize: 12.5, color: "var(--tx-3)" }}>Cargando…</span>
          ) : topLevel.length === 0 ? (
            <span style={{ fontSize: 12.5, color: "var(--tx-3)" }}>Sé el primero en comentar.</span>
          ) : (
            topLevel.map((comment) => (
              <CommentNode
                key={comment.id}
                comment={comment}
                replies={repliesFor(comment.id)}
                onReply={(parentId, body) => appendLocal(parentId, body)}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
}
