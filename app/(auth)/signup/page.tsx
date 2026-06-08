"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signUp } from "@/lib/auth/actions";
import { signUpSchema } from "@/lib/auth/schemas";
import { AuthHeader } from "@/components/auth/auth-header";
import { Field } from "@/components/auth/field";
import { FormAlert } from "@/components/auth/form-alert";
import { Honeypot, isHoneypotFilled } from "@/components/auth/honeypot";
import { OrDivider } from "@/components/auth/or-divider";
import { PasswordStrength } from "@/components/auth/password-strength";
import { SocialButtons } from "@/components/auth/social-buttons";
import { SubmitButton } from "@/components/auth/submit-button";

type Errors = Partial<Record<"handle" | "email" | "password", string>>;

export default function SignupPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [pending, setPending] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const [alert, setAlert] = useState<string | null>(null);

  async function onSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    if (isHoneypotFilled(form)) return;

    const candidate = {
      handle: String(form.get("handle") ?? ""),
      email: String(form.get("email") ?? ""),
      password: String(form.get("password") ?? ""),
    };
    const parsed = signUpSchema.safeParse(candidate);
    if (!parsed.success) {
      const fieldErrors: Errors = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0];
        if (key === "handle" || key === "email" || key === "password") fieldErrors[key] = issue.message;
      }
      setErrors(fieldErrors);
      return;
    }

    setErrors({});
    setAlert(null);
    setPending(true);
    const result = await signUp(parsed.data);
    if (result.ok) {
      router.replace("/onboarding");
      return;
    }
    setPending(false);
    setAlert(result.message);
  }

  return (
    <>
      <AuthHeader
        title="Create your account"
        subtitle="Join the proving ground. It takes 30 seconds."
      />

      <SocialButtons onError={setAlert} />
      <div style={{ height: 16 }} />
      <OrDivider label="or sign up with email" />
      <div style={{ height: 16 }} />

      {alert && <FormAlert message={alert} />}

      <form onSubmit={onSubmit} noValidate style={{ display: "flex", flexDirection: "column", gap: 16, marginTop: alert ? 16 : 0 }}>
        <Honeypot />
        <Field
          label="Username"
          name="handle"
          autoComplete="username"
          prefix="@"
          placeholder="yourhandle"
          hint="Your public identity on the leaderboards."
          error={errors.handle}
          disabled={pending}
        />
        <Field
          label="Email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          error={errors.email}
          disabled={pending}
        />
        <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
          <Field
            label="Password"
            name="password"
            type="password"
            autoComplete="new-password"
            placeholder="Create a strong password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            error={errors.password}
            disabled={pending}
          />
          {password.length > 0 && <PasswordStrength value={password} />}
        </div>
        <SubmitButton pending={pending} label="Create account" pendingLabel="Creating…" />
      </form>

      <p style={{ marginTop: 22, fontSize: 13.5, color: "var(--tx-2)", textAlign: "center" }}>
        Already have an account?{" "}
        <Link href="/login" style={{ color: "var(--brand)", fontWeight: 600 }}>
          Sign in
        </Link>
      </p>
    </>
  );
}
