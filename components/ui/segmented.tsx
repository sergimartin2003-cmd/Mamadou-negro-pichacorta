"use client";

export interface SegmentedOption {
  k: string;
  label: string;
}

export interface SegmentedProps {
  options: ReadonlyArray<SegmentedOption | string>;
  value: string;
  onChange: (key: string) => void;
  size?: "sm" | "md";
}

function optionKey(option: SegmentedOption | string): string {
  return typeof option === "string" ? option : option.k;
}

function optionLabel(option: SegmentedOption | string): string {
  return typeof option === "string" ? option : option.label;
}

export function Segmented({ options, value, onChange, size = "md" }: SegmentedProps) {
  return (
    <div
      style={{
        display: "inline-flex",
        background: "var(--bg-3)",
        border: "1px solid var(--line-1)",
        borderRadius: "var(--r-sm)",
        padding: 3,
        gap: 2,
      }}
    >
      {options.map((option) => {
        const key = optionKey(option);
        const active = key === value;
        return (
          <button
            key={key}
            onClick={() => onChange(key)}
            style={{
              border: "none",
              background: active ? "var(--bg-4)" : "transparent",
              color: active ? "var(--tx-1)" : "var(--tx-3)",
              padding: size === "sm" ? "5px 10px" : "7px 13px",
              borderRadius: 6,
              fontSize: size === "sm" ? 12 : 13,
              fontWeight: 600,
              boxShadow: active ? "var(--sh-1)" : "none",
              transition: "all .14s",
              whiteSpace: "nowrap",
            }}
          >
            {optionLabel(option)}
          </button>
        );
      })}
    </div>
  );
}
