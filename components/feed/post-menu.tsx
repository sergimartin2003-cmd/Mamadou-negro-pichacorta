"use client";

import { useState } from "react";
import { IconButton } from "@/components/ui";
import { reportContent } from "@/lib/actions/social";

interface PostMenuProps {
  postId: string;
}

type MenuState = "closed" | "open" | "sent";

/** Post overflow menu — today: report to the moderation queue. */
export function PostMenu({ postId }: PostMenuProps) {
  const [state, setState] = useState<MenuState>("closed");

  function report() {
    setState("sent");
    void reportContent("post", postId, "Reportado desde el feed");
  }

  return (
    <div style={{ position: "relative" }}>
      <IconButton
        icon="ellipsis"
        size="sm"
        aria-label="Opciones del post"
        aria-expanded={state === "open"}
        onClick={() => setState((s) => (s === "open" ? "closed" : "open"))}
      />
      {state !== "closed" && (
        <div
          style={{
            position: "absolute",
            right: 0,
            top: "calc(100% + 6px)",
            zIndex: 30,
            minWidth: 180,
            padding: 6,
            borderRadius: "var(--r-md)",
            background: "var(--bg-float)",
            border: "1px solid var(--line-2)",
            boxShadow: "var(--sh-2)",
          }}
        >
          {state === "sent" ? (
            <div style={{ padding: "8px 10px", fontSize: 12.5, color: "var(--profit)" }}>
              ✓ Reporte enviado a moderación
            </div>
          ) : (
            <button
              onClick={report}
              style={{
                width: "100%",
                textAlign: "left",
                border: "none",
                background: "transparent",
                cursor: "pointer",
                padding: "8px 10px",
                borderRadius: "var(--r-sm)",
                fontSize: 13,
                color: "var(--loss)",
              }}
            >
              Reportar contenido
            </button>
          )}
        </div>
      )}
    </div>
  );
}
