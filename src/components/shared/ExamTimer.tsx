import { useEffect, useState, useRef } from "react";

interface ExamTimerProps {
  totalSeconds: number;
  onExpire?: () => void;
  running?: boolean;
}

export function ExamTimer({ totalSeconds, onExpire, running = true }: ExamTimerProps) {
  const [left, setLeft] = useState(totalSeconds);
  const ref = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!running) return;
    ref.current = setInterval(() => {
      setLeft((t) => {
        if (t <= 1) {
          clearInterval(ref.current!);
          onExpire?.();
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(ref.current!);
  }, [running]);

  const m = Math.floor(left / 60);
  const s = left % 60;
  const display = `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  const urgency = left < 300 ? "urgent" : left < 600 ? "warning" : "";

  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 8,
      padding: "6px 14px", borderRadius: 99,
      background: left < 300 ? "rgba(239,68,68,0.15)" : "var(--navy-card)",
      border: `1px solid ${left < 300 ? "rgba(239,68,68,0.4)" : "var(--border)"}`,
      transition: "all 0.3s",
    }}>
      <span style={{ fontSize: 14 }}></span>
      <span className={`timer-display ${urgency}`}>{display}</span>
    </div>
  );
}
