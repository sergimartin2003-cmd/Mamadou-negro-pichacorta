const HONEYPOT_STYLE = {
  position: "absolute",
  width: 1,
  height: 1,
  padding: 0,
  margin: -1,
  overflow: "hidden",
  clip: "rect(0 0 0 0)",
  whiteSpace: "nowrap",
  border: 0,
} as const;

export const HONEYPOT_NAME = "company_website";

export function Honeypot() {
  return (
    <div aria-hidden style={HONEYPOT_STYLE}>
      <label htmlFor={HONEYPOT_NAME}>Leave this field empty</label>
      <input
        id={HONEYPOT_NAME}
        name={HONEYPOT_NAME}
        type="text"
        tabIndex={-1}
        autoComplete="off"
        defaultValue=""
      />
    </div>
  );
}

export function isHoneypotFilled(form: FormData): boolean {
  return Boolean(form.get(HONEYPOT_NAME));
}
