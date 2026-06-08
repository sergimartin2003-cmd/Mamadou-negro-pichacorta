export default function RankingsLoading() {
  return (
    <div
      style={{
        maxWidth: 980,
        margin: "0 auto",
        padding: "24px 16px",
        display: "flex",
        flexDirection: "column",
        gap: 16,
      }}
    >
      <div
        className="card"
        style={{
          height: 96,
          background: "linear-gradient(110deg, color-mix(in srgb, var(--brand) 8%, var(--bg-2)), var(--bg-2) 70%)",
          borderColor: "var(--brand-line)",
          animation: "pulse 1.6s ease-in-out infinite",
        }}
      />
      <div className="card" style={{ height: 48 }} />
      <div className="card" style={{ height: 340 }} />
      <div className="card" style={{ height: 400 }} />
    </div>
  );
}
