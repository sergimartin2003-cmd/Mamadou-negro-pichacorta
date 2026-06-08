import { forwardRef, type InputHTMLAttributes, type ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface FieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  hint?: string;
  error?: string;
  prefix?: string;
  trailing?: ReactNode;
}

export const Field = forwardRef<HTMLInputElement, FieldProps>(function Field(
  { label, hint, error, prefix, trailing, id, className, ...props },
  ref,
) {
  const inputId = id ?? props.name;
  const describedBy = error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
      <label htmlFor={inputId} className="sec-label" style={{ color: "var(--tx-2)" }}>
        {label}
      </label>
      <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
        {prefix && (
          <span
            aria-hidden
            style={{
              position: "absolute",
              left: 13,
              fontSize: 13.5,
              fontWeight: 600,
              color: "var(--tx-3)",
              pointerEvents: "none",
            }}
          >
            {prefix}
          </span>
        )}
        <input
          ref={ref}
          id={inputId}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          className={cn("input", className)}
          style={{
            paddingLeft: prefix ? 13 + prefix.length * 8 : undefined,
            paddingRight: trailing ? 44 : undefined,
            borderColor: error ? "var(--loss-line)" : undefined,
          }}
          {...props}
        />
        {trailing && (
          <span style={{ position: "absolute", right: 6, display: "flex" }}>{trailing}</span>
        )}
      </div>
      {error ? (
        <span id={`${inputId}-error`} style={{ fontSize: 12, color: "var(--loss)" }}>
          {error}
        </span>
      ) : hint ? (
        <span id={`${inputId}-hint`} style={{ fontSize: 12, color: "var(--tx-3)" }}>
          {hint}
        </span>
      ) : null}
    </div>
  );
});
