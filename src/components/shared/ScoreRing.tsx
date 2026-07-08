interface ScoreRingProps {
  pct: number;
  size?: number;
  strokeWidth?: number;
  label?: string;
}

export function ScoreRing({ pct, size = 120, strokeWidth = 10, label }: ScoreRingProps) {
  const r = (size / 2) - strokeWidth;
  const circ = 2 * Math.PI * r;
  const offset = circ - (pct / 100) * circ;
  const color = pct >= 75 ? "var(--green)" : pct >= 50 ? "var(--gold)" : "var(--error)";

  return (
    <div className="score-ring" style={{ width: size, height: size }}>
      <svg width={size} height={size}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="var(--border)" strokeWidth={strokeWidth} />
        <circle
          cx={size/2} cy={size/2} r={r}
          fill="none" stroke={color} strokeWidth={strokeWidth}
          strokeDasharray={circ} strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 1s ease" }}
        />
      </svg>
      <div className="score-ring-text">
        <div style={{ fontSize: size * 0.22, fontWeight: 900, color: "var(--white)", lineHeight: 1 }}>{pct}%</div>
        {label && <div style={{ fontSize: size * 0.1, color: "var(--muted)", marginTop: 2 }}>{label}</div>}
      </div>
    </div>
  );
}
