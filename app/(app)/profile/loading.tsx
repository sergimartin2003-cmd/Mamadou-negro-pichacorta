export default function ProfileLoading() {
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
      {/* cover + identity skeleton */}
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
          <div style={{ display: "flex", gap: 12, marginTop: 20 }}>
            {[100, 80, 60].map((w) => (
              <div
                key={w}
                style={{ width: w, height: 14, borderRadius: "var(--r-xs)", background: "var(--bg-4)" }}
              />
            ))}
          </div>
          <div
            style={{
              width: "100%",
              maxWidth: 480,
              height: 40,
              borderRadius: "var(--r-sm)",
              background: "var(--bg-4)",
              marginTop: 14,
            }}
          />
          <div
            style={{
              marginTop: 18,
              height: 56,
              borderRadius: "var(--r-md)",
              background: "var(--bg-4)",
            }}
          />
        </div>
      </div>

      {/* stats skeleton */}
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

      {/* equity curve skeleton */}
      <div
        className="card pad"
        style={{ height: 210, background: "var(--bg-3)", border: "1px solid var(--line-1)" }}
      />

      {/* tabs skeleton */}
      <div style={{ height: 44, borderBottom: "1px solid var(--line-1)" }} />

      {/* post skeletons */}
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
