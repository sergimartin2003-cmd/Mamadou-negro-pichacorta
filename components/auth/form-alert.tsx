export interface FormAlertProps {
  message: string;
  tone?: "error" | "info";
}

export function FormAlert({ message, tone = "error" }: FormAlertProps) {
  const error = tone === "error";
  return (
    <div
      role="alert"
      style={{
        display: "flex",
        gap: 9,
        padding: "10px 13px",
        borderRadius: "var(--r-sm)",
        fontSize: 13,
        lineHeight: 1.45,
        background: error ? "var(--loss-dim)" : "var(--brand-dim)",
        border: `1px solid ${error ? "var(--loss-line)" : "var(--brand-line)"}`,
        color: error ? "#ffb4b9" : "#c9b1ff",
      }}
    >
      {message}
    </div>
  );
}
