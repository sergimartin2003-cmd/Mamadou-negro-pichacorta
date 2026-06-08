import { CONNECTION_OPTIONS, type OnboardingState } from "./constants";

export interface StepDoneProps {
  state: OnboardingState;
  communityCount: number;
}

export function StepDone({ state, communityCount }: StepDoneProps) {
  const connection = CONNECTION_OPTIONS.find((option) => option.key === state.connection);

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 20, textAlign: "center" }}>
      <div
        style={{
          width: 84,
          height: 84,
          display: "grid",
          placeItems: "center",
          borderRadius: "50%",
          background: "linear-gradient(150deg, var(--brand), var(--brand-2))",
          boxShadow: "var(--sh-brand)",
        }}
      >
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
          <path d="M5 12l5 5 9-11" />
        </svg>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <h2 style={{ fontSize: 28, fontWeight: 700, letterSpacing: "-0.03em" }}>
          You&apos;re on the board.
        </h2>
        <p style={{ fontSize: 15, lineHeight: 1.55, color: "var(--tx-2)", maxWidth: 380 }}>
          Welcome,{" "}
          <strong style={{ color: "var(--tx-1)" }}>@{state.username || "trader"}</strong>. Your feed
          is ready — time to start climbing.
        </p>
      </div>

      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "center" }}>
        <SummaryPill label={state.market} />
        <SummaryPill label={connection ? `${connection.name} linked` : "Account not linked"} />
        <SummaryPill label={`${communityCount} ${communityCount === 1 ? "community" : "communities"}`} />
      </div>
    </div>
  );
}

function SummaryPill({ label }: { label: string }) {
  return (
    <span
      className="chip"
      style={{ background: "var(--brand-dim)", borderColor: "var(--brand-line)", color: "#c9b1ff" }}
    >
      {label}
    </span>
  );
}
