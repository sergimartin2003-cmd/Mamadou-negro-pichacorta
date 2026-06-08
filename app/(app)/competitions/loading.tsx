export default function CompetitionsLoading() {
  return (
    <div
      style={{
        maxWidth: 980,
        margin: "0 auto",
        padding: "24px 16px",
        display: "flex",
        flexDirection: "column",
        gap: 18,
      }}
    >
      <div
        className="card"
        style={{
          height: 200,
          background:
            "linear-gradient(120deg, color-mix(in srgb, var(--brand) 10%, var(--bg-2)), var(--bg-2) 80%)",
          borderColor: "var(--brand-line)",
          animation: "pulse 1.6s ease-in-out infinite",
        }}
      />
      <div className="card" style={{ height: 48 }} />
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
          gap: 14,
        }}
      >
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="card"
            style={{ height: 280, animation: "pulse 1.6s ease-in-out infinite" }}
          />
        ))}
      </div>
    </div>
  );
}
