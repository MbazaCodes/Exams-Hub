interface SpinnerProps {
  size?: "sm" | "md" | "lg";
  color?: string;
  label?: string;
}

export function Spinner({ size = "md", color = "var(--indigo)", label }: SpinnerProps) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
      <span
        className={`spinner spinner-${size}`}
        style={{ borderTopColor: color }}
        role="status"
        aria-label={label || "Loading"}
      />
      {label && <span style={{ fontSize: 13, color: "var(--muted)" }}>{label}</span>}
    </div>
  );
}

export function PageLoader() {
  return (
    <div style={{
      minHeight: "100vh",
      background: "var(--navy)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flexDirection: "column",
      gap: 20,
    }}>
      <div style={{
        width: 48, height: 48, borderRadius: 12,
        background: "linear-gradient(135deg, var(--indigo), var(--gold))",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 24, fontWeight: 900, color: "#fff",
      }}>E</div>
      <Spinner size="lg" label="Loading ExamHub..." />
    </div>
  );
}
