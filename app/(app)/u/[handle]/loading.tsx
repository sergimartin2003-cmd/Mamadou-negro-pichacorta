export default function HandleLoading() {
  return (
    <div
      style={{
        maxWidth: 920,
        margin: "0 auto",
        padding: "16px 0",
        display: "flex",
        flexDirection: "column",
        gap: 16,
      }}
    >
      <div className="card" style={{ overflow: "hidden", padding: 0 }}>
        <div style={{ height: 128, background: "var(--bg-3)" }} />
        <div style={{ padding: "0 24px 22px" }}>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 18, marginTop: -44 }}>
            <div
              style={{
                width: 104,
                height: 104,
                borderRadius: "50%",
                background: "var(--bg-4)",
                flexShrink: 0,
              }}
            />
            <div style={{ flex: 1, paddingBottom: 6 }}>
              <div
                style={{
                  width: 180,
                  height: 26,
                  borderRadius: "var(--r-sm)",
                  background: "var(--bg-4)",
                  marginBottom: 8,
                }}
              />
              <div
                style={{ width: 240, height: 14, borderRadius: "var(--r-xs)", background: "var(--bg-4)" }}
              />
            </div>
          </div>
          <div
            style={{
              marginTop: 20,
              height: 56,
              borderRadius: "var(--r-md)",
              background: "var(--bg-4)",
            }}
          />
        </div>
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))",
          gap: 12,
        }}
      >
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            style={{
              height: 80,
              borderRadius: "var(--r-md)",
              background: "var(--bg-3)",
              border: "1px solid var(--line-1)",
            }}
          />
        ))}
      </div>
      <div
        className="card pad"
        style={{ height: 210, background: "var(--bg-3)", border: "1px solid var(--line-1)" }}
      />
      <div style={{ height: 44, borderBottom: "1px solid var(--line-1)" }} />
      {[1, 2].map((i) => (
        <div
          key={i}
          className="card"
          style={{ height: 220, background: "var(--bg-2)", border: "1px solid var(--line-1)" }}
        />
      ))}
    </div>
  );
}
