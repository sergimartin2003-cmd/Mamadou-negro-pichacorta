"use client";

import { useState } from "react";
import { Icon } from "@/components/ui";
import { toggleBookmark } from "@/lib/actions/social";

interface SaveButtonProps {
  postId: string;
}

/** Bookmark toggle — optimistic, persisted via the social action. */
export function SaveButton({ postId }: SaveButtonProps) {
  const [saved, setSaved] = useState(false);

  function onClick() {
    const prev = saved;
    setSaved(!prev);
    toggleBookmark(postId).then((res) => {
      if (!res.ok) setSaved(prev);
      else if (res.persisted && res.saved !== undefined) setSaved(res.saved);
    });
  }

  return (
    <button
      className="th-action"
      aria-label={saved ? "Quitar de guardados" : "Guardar post"}
      aria-pressed={saved}
      onClick={onClick}
      style={saved ? { color: "var(--t-gold)" } : undefined}
    >
      <Icon name="bookmark" size={17} fill={saved} /> {saved ? "Guardado" : "Guardar"}
    </button>
  );
}
