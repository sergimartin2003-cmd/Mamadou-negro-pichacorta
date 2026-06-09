"use client";

import { Suspense, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "@/lib/auth/actions";
import { signInSchema } from "@/lib/auth/schemas";
import { safeNext } from "@/lib/auth/utils";
import { AuthHeader } from "@/components/auth/auth-header";
import { Field } from "@/components/auth/field";
import { FormAlert } from "@/components/auth/form-alert";
import { Honeypot, isHoneypotFilled } from "@/components/auth/honeypot";
import { OrDivider } from "@/components/auth/or-divider";
import { SocialButtons } from "@/components/auth/social-buttons";
import { SubmitButton } from "@/components/auth/submit-button";

type Errors = Partial<Record<"email" | "password", string>>;

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const next = safeNext(params.get("next"));

  const [pending, setPending] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const [alert, setAlert] = useState<string | null>(null);

  async function onSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    if (isHoneypotFilled(form)) return;

    const candidate = {
      email: String(form.get("email") ?? ""),
      password: String(form.get("password") ?? ""),
    };
    const parsed = signInSchema.safeParse(candidate);
    if (!parsed.success) {
      const fieldErrors: Errors = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0];
        if (key === "email" || key === "password") fieldErrors[key] = issue.message;
      }
      setErrors(fieldErrors);
      return;
    }

    setErrors({});
    setAlert(null);
    setPending(true);
    const result = await signIn(parsed.data);
    if (result.ok) {
      router.replace(next);
      return;
    }
    setPending(false);
    setAlert(result.message);
  }

  return (
    <>
      <AuthHeader
        title="Welcome back"
        subtitle="Sign in to keep climbing the ranks."
      />

      <SocialButtons onError={setAlert} />
      <div style={{ height: 16 }} />
      <OrDivider label="or sign in with email" />
      <div style={{ height: 16 }} />

      {alert && <FormAlert message={alert} />}

      <form onSubmit={onSubmit} noValidate style={{ display: "flex", flexDirection: "column", gap: 16, marginTop: alert ? 16 : 0 }}>
        <Honeypot />
        <Field
          label="Email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          error={errors.email}
          disabled={pending}
        />
        <Field
          label="Password"
          name="password"
          type="password"
          autoComplete="current-password"
          placeholder="••••••••"
          error={errors.password}
          disabled={pending}
          trailing={
            <Link
              href="/forgot"
              style={{ fontSize: 12, fontWeight: 600, color: "var(--brand)", padding: "0 8px" }}
            >
              Forgot?
            </Link>
          }
        />
        <SubmitButton pending={pending} label="Sign in" pendingLabel="Signing in…" />
      </form>

      <p style={{ marginTop: 22, fontSize: 13.5, color: "var(--tx-2)", textAlign: "center" }}>
        New to TradeHub?{" "}
        <Link href="/signup" style={{ color: "var(--brand)", fontWeight: 600 }}>
          Create an account
        </Link>
      </p>
    </>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
