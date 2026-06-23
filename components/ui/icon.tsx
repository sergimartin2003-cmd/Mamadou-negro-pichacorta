import type { CSSProperties } from "react";

export const ICONS = {
  home: "M3 10.5 12 3l9 7.5M5 9.5V20a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1V9.5",
  compass: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18ZM15.5 8.5l-2 5-5 2 2-5 5-2Z",
  trophy: "M7 4h10v3a5 5 0 0 1-10 0V4ZM7 5H4v1a3 3 0 0 0 3 3M17 5h3v1a3 3 0 0 1-3 3M9 14h6M10 14l-1 5h6l-1-5M8 21h8",
  swords: "M14.5 3.5 21 3l-.5 6.5M21 3l-9 9M9.5 3.5 3 3l.5 6.5M3 3l9 9M5 14l-2 2 3 3 2-2M19 14l2 2-3 3-2-2",
  book: "M4 5a2 2 0 0 1 2-2h13v15H6a2 2 0 0 0-2 2V5ZM6 18h13M9 7h7M9 10h7",
  chat: "M4 5h16v11H9l-4 4v-4H4V5Z",
  user: "M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM5 20a7 7 0 0 1 14 0",
  gear: "M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM19 12a7 7 0 0 0-.1-1l2-1.6-2-3.4-2.3 1a7 7 0 0 0-1.7-1l-.4-2.5h-4l-.4 2.5a7 7 0 0 0-1.7 1l-2.3-1-2 3.4 2 1.6a7 7 0 0 0 0 2l-2 1.6 2 3.4 2.3-1a7 7 0 0 0 1.7 1l.4 2.5h4l.4-2.5a7 7 0 0 0 1.7-1l2.3 1 2-3.4-2-1.6c.06-.33.1-.66.1-1Z",
  search: "M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14ZM20 20l-4-4",
  bell: "M6 9a6 6 0 0 1 12 0c0 5 2 6 2 6H4s2-1 2-6ZM10 20a2 2 0 0 0 4 0",
  bolt: "M13 2 4 14h6l-1 8 9-12h-6l1-8Z",
  plus: "M12 5v14M5 12h14",
  up: "M12 5v14M6 11l6-6 6 6",
  down: "M12 19V5M6 13l6 6 6-6",
  caretUp: "M6 15l6-6 6 6",
  caretDown: "M6 9l6 6 6-6",
  chevR: "M9 6l6 6-6 6",
  check: "M5 12l5 5 9-11",
  verified:
    "M12 2.5l2.4 1.8 3-.2 1 2.8 2.5 1.6-1 2.9 1 2.9-2.5 1.6-1 2.8-3-.2L12 21.5l-2.4-1.8-3 .2-1-2.8-2.5-1.6 1-2.9-1-2.9 2.5-1.6 1-2.8 3 .2L12 2.5Z",
  flame: "M12 3c2 3 4 4 4 8a4 4 0 0 1-8 0c0-1 .5-2 1-2.5C9 11 12 8 12 3Z",
  comment: "M4 5h16v11H9l-4 4v-4H4V5Z",
  share: "M8.5 13.5 15 17M15 7 8.5 10.5M18 7a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5ZM6 14.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5ZM18 22a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z",
  bookmark: "M6 3h12v18l-6-4-6 4V3Z",
  filter: "M3 5h18l-7 8v6l-4-2v-4L3 5Z",
  globe: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18ZM3 12h18M12 3c2.5 2.5 2.5 15 0 18M12 3c-2.5 2.5-2.5 15 0 18",
  lock: "M6 11V8a6 6 0 0 1 12 0v3M5 11h14v9H5v-9Z",
  fire: "M12 3c2 3 4 4 4 8a4 4 0 0 1-8 0c0-1 .5-2 1-2.5C9 11 12 8 12 3Z",
  star: "M12 3l2.6 5.6 6 .7-4.4 4.2 1.2 6L12 16.8 6.6 19.5l1.2-6L3.4 9.3l6-.7L12 3Z",
  send: "M4 12 20 4l-6 16-3-7-7-1Z",
  image: "M4 5h16v14H4V5ZM4 15l5-5 4 4 3-3 4 4M9 10a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z",
  hash: "M7 4 5 20M17 4l-2 16M4 9h16M3 15h16",
  dot: "",
  close: "M6 6l12 12M18 6L6 18",
  trend: "M3 17l5-5 4 4 9-9M21 7v5h-5",
  crown: "M4 18h16M5 18 3 7l5 4 4-7 4 7 5-4-2 11H5Z",
  target: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18ZM12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM12 13a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z",
  shield: "M12 3l8 3v6c0 5-4 8-8 9-4-1-8-4-8-9V6l8-3Z",
  play: "M8 5v14l11-7-11-7Z",
  arrowR: "M5 12h14M13 6l6 6-6 6",
  ellipsis: "M5 12h.01M12 12h.01M19 12h.01",
  logout: "M15 4h4v16h-4M11 8l-4 4 4 4M7 12h9",
  menu: "M4 7h16M4 12h16M4 17h16",
  briefcase: "M3 8h18v11H3V8ZM8 8V6a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M3 13h18",
  bag: "M6 8h12l-1 12H7L6 8ZM9 8V6a3 3 0 0 1 6 0v2",
  pie: "M12 3a9 9 0 1 0 9 9h-9V3Z M12 3v9h9A9 9 0 0 0 12 3Z",
  box: "M3 7l9-4 9 4v10l-9 4-9-4V7Z M3 7l9 4 9-4 M12 11v10",
} as const;

export type IconName = keyof typeof ICONS;

export interface IconProps {
  name: IconName;
  size?: number;
  sw?: number;
  fill?: boolean;
  style?: CSSProperties;
  className?: string;
}

export function Icon({ name, size = 20, sw = 1.8, fill = false, style, className }: IconProps) {
  const d = ICONS[name];
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      style={{ flexShrink: 0, ...style }}
      stroke="currentColor"
      strokeWidth={sw}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {name === "ellipsis" ? (
        <path d={d} strokeWidth={2.6} />
      ) : (
        <path d={d} fill={fill ? "currentColor" : "none"} />
      )}
    </svg>
  );
}
