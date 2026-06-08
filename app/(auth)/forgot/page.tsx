"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { requestPasswordReset } from "@/lib/auth/actions";
import { requestResetSchema } from "@/lib/auth/schemas";
import { AuthHeader } from "@/components/auth/auth-header";
import { Field } from "@/components/auth/field";
import { FormAlert } from "@/components/auth/form-alert";
import { Honeypot, isHoneypotFilled } from "@/components/auth/honeypot";
import { SubmitButton } from "@/components/auth/submit-button";

export default function ForgotPage() {
  const [email, setEmail] = useState("");
  const [pending, setPending] = useState(false);
  const [fieldError, setFieldError] = useState<string | undefined>(undefined);
  const [alert, setAlert] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    if (isHoneypotFilled(form)) return;

    const parsed = requestResetSchema.safeParse({ email });
    if (!parsed.success) {
      setFieldError(parsed.error.issues[0]?.message ?? "Enter a valid email address.");
      return;
    }

    setFieldError(undefined);
    setAlert(null);
    setPending(true);
    const result = await requestPasswordReset(parsed.data);
    setPending(false);
    if (result.ok) {
      setSent(true);
      return;
    }
    setAlert(result.message);
  }

  if (sent) {
    return (
      <>
        <AuthHeader
          title="Check your inbox"
          subtitle={
            <>
              We sent a reset link to <strong style={{ color: "var(--tx-1)" }}>{email}</strong>. It
              expires in 60 minutes.
            </>
          }
        />
        <div
          style={{
            display: "grid",
            placeItems: "center",
            height: 72,
            width: 72,
            margin: "4px 0 24px",
            borderRadius: "50%",
            background: "var(--brand-dim)",
            border: "1px solid var(--brand-line)",
          }}
        >
          <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="var(--brand)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 6h16v12H4zM4 7l8 6 8-6" />
          </svg>
        </div>
        <Link href="/login" className="btn block" style={{ height: 46 }}>
          Back to sign in
        </Link>
        <button
          type="button"
          className="btn ghost block"
          style={{ marginTop: 10 }}
          onClick={() => setSent(false)}
        >
          Use a different email
        </button>
      </>
    );
  }

  return (
    <>
      <AuthHeader
        title="Reset your password"
        subtitle="Enter your email and we'll send you a secure reset link."
      />

      {alert && <FormAlert message={alert} />}

      <form onSubmit={onSubmit} noValidate style={{ display: "flex", flexDirection: "column", gap: 16, marginTop: alert ? 16 : 0 }}>
        <Honeypot />
        <Field
          label="Email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          error={fieldError}
          disabled={pending}
        />
        <SubmitButton pending={pending} label="Send reset link" pendingLabel="Sending…" />
      </form>

      <p style={{ marginTop: 22, fontSize: 13.5, color: "var(--tx-2)", textAlign: "center" }}>
        Remembered it?{" "}
        <Link href="/login" style={{ color: "var(--brand)", fontWeight: 600 }}>
          Back to sign in
        </Link>
      </p>
    </>
  );
}
