export default function SettingsLoading() {
  return (
    <div
      style={{
        display: "flex",
        height: "100%",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          color: "var(--tx-4)",
          fontSize: 13,
          fontFamily: "var(--f-mono)",
        }}
      >
        Loading settings…
      </div>
    </div>
  );
}
