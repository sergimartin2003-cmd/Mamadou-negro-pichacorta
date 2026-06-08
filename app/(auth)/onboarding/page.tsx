"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Button } from "@/components/ui";
import { completeOnboarding } from "@/lib/auth/actions";
import { onboardingSchema } from "@/lib/auth/schemas";
import { getCommunities } from "@/lib/data/queries";
import type { Community } from "@/types/db";
import { FormAlert } from "@/components/auth/form-alert";
import { STEP_COUNT, type OnboardingState } from "@/components/auth/onboarding/constants";
import { WizardProgress } from "@/components/auth/onboarding/wizard-progress";
import { StepWelcome } from "@/components/auth/onboarding/step-welcome";
import { StepIdentity, type IdentityErrors } from "@/components/auth/onboarding/step-identity";
import { StepConnect } from "@/components/auth/onboarding/step-connect";
import { StepCommunities } from "@/components/auth/onboarding/step-communities";
import { StepDone } from "@/components/auth/onboarding/step-done";

const INITIAL_STATE: OnboardingState = {
  displayName: "",
  username: "",
  country: "",
  market: "Crypto",
  connection: null,
  communities: [],
};

function validateIdentity(state: OnboardingState): IdentityErrors {
  const result = onboardingSchema
    .pick({ displayName: true, username: true, country: true })
    .safeParse(state);
  if (result.success) return {};
  const errors: IdentityErrors = {};
  for (const issue of result.error.issues) {
    const key = issue.path[0];
    if (key === "displayName" || key === "username" || key === "country") {
      errors[key] = issue.message;
    }
  }
  return errors;
}

export default function OnboardingPage() {
  const router = useRouter();
  const reduce = useReducedMotion();

  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [state, setState] = useState<OnboardingState>(INITIAL_STATE);
  const [communities, setCommunities] = useState<readonly Community[]>([]);
  const [identityErrors, setIdentityErrors] = useState<IdentityErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [alert, setAlert] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    void getCommunities().then((list) => {
      if (active) setCommunities(list);
    });
    return () => {
      active = false;
    };
  }, []);

  const patch = useCallback((update: Partial<OnboardingState>) => {
    setState((current) => ({ ...current, ...update }));
  }, []);

  const toggleCommunity = useCallback((id: string) => {
    setState((current) => {
      const has = current.communities.includes(id);
      return {
        ...current,
        communities: has
          ? current.communities.filter((entry) => entry !== id)
          : [...current.communities, id],
      };
    });
  }, []);

  const goTo = useCallback((target: number) => {
    setDirection(target > step ? 1 : -1);
    setStep(target);
  }, [step]);

  const isLast = step === STEP_COUNT - 1;

  const finish = useCallback(async () => {
    setSubmitting(true);
    setAlert(null);
    const result = await completeOnboarding(state);
    if (result.ok) {
      router.replace("/feed");
      return;
    }
    setSubmitting(false);
    setAlert(result.message);
  }, [router, state]);

  function handleNext(): void {
    if (step === 1) {
      const errors = validateIdentity(state);
      setIdentityErrors(errors);
      if (Object.keys(errors).length > 0) return;
    }
    if (isLast) {
      void finish();
      return;
    }
    goTo(step + 1);
  }

  const stepNode = useMemo(() => {
    switch (step) {
      case 0:
        return <StepWelcome />;
      case 1:
        return <StepIdentity state={state} errors={identityErrors} onPatch={patch} />;
      case 2:
        return (
          <StepConnect
            selected={state.connection}
            onSelect={(connection) => patch({ connection })}
          />
        );
      case 3:
        return (
          <StepCommunities
            communities={communities}
            selected={state.communities}
            onToggle={toggleCommunity}
          />
        );
      default:
        return <StepDone state={state} communityCount={state.communities.length} />;
    }
  }, [step, state, identityErrors, patch, communities, toggleCommunity]);

  const skippable = step === 2 || step === 3;
  const offset = reduce ? 0 : 28;

  return (
    <div style={{ width: "100%", maxWidth: 540, margin: "0 auto", display: "flex", flexDirection: "column", gap: 26 }}>
      <WizardProgress current={step} />

      <div style={{ position: "relative", overflow: "hidden" }}>
        <AnimatePresence mode="wait" initial={false} custom={direction}>
          <motion.div
            key={step}
            custom={direction}
            initial={reduce ? false : { opacity: 0, x: direction * offset }}
            animate={{ opacity: 1, x: 0 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, x: direction * -offset }}
            transition={{ duration: 0.34, ease: [0.2, 0.7, 0.2, 1] }}
          >
            {stepNode}
          </motion.div>
        </AnimatePresence>
      </div>

      {alert && <FormAlert message={alert} />}

      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        {step > 0 && !isLast && (
          <Button variant="ghost" size="lg" onClick={() => goTo(step - 1)} disabled={submitting}>
            Back
          </Button>
        )}
        {skippable && (
          <Button variant="ghost" size="lg" onClick={() => goTo(step + 1)} disabled={submitting}>
            Skip
          </Button>
        )}
        <div style={{ flex: 1 }} />
        <Button
          variant="primary"
          size="lg"
          onClick={handleNext}
          disabled={submitting}
          style={{ minWidth: 148, opacity: submitting ? 0.85 : 1 }}
        >
          {isLast ? (submitting ? "Finishing…" : "Enter TradeHub") : step === 0 ? "Get started" : "Continue"}
        </Button>
      </div>
    </div>
  );
}
