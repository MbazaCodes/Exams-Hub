interface ProgressBarProps {
  value: number;         // 0-100
  max?: number;
  color?: string;
  height?: number;
  animated?: boolean;
  showLabel?: boolean;
}

export function ProgressBar({
  value,
  max = 100,
  color,
  height = 6,
  animated = false,
  showLabel = false,
}: ProgressBarProps) {
  const pct = Math.min(Math.round((value / max) * 100), 100);
  const autoColor = color || (pct >= 75 ? "var(--green)" : pct >= 50 ? "var(--gold)" : "var(--error)");

  return (
    <div>
      {showLabel && (
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "var(--muted)", marginBottom: 4 }}>
          <span>{value}</span>
          <span>{pct}%</span>
        </div>
      )}
      <div className="progress-track" style={{ height }}>
        <div
          className={`progress-fill ${animated ? "progress-animate" : ""}`}
          style={{ width: `${pct}%`, background: autoColor, "--target-width": `${pct}%` } as React.CSSProperties}
        />
      </div>
    </div>
  );
}

export function XPBar({ current, max, level }: { current: number; max: number; level: number }) {
  const pct = Math.min(Math.round((current / max) * 100), 100);
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "var(--muted)", marginBottom: 4 }}>
        <span>Level {level}</span>
        <span>{current.toLocaleString()} / {max.toLocaleString()} XP</span>
      </div>
      <div className="xp-bar-track">
        <div className="xp-bar-fill" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
