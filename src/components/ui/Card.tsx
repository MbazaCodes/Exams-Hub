import { type ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
  padding?: number | string;
  hover?: boolean;
  glass?: boolean;
  style?: React.CSSProperties;
  onClick?: () => void;
}

export function Card({
  children,
  className = "",
  padding = 24,
  hover = false,
  glass = false,
  style = {},
  onClick,
}: CardProps) {
  return (
    <div
      className={`${glass ? "glass-card" : "card"} ${hover ? "card-hover" : ""} ${className}`}
      style={{ padding, cursor: onClick ? "pointer" : undefined, ...style }}
      onClick={onClick}
    >
      {children}
    </div>
  );
}

export function StatCard({
  icon,
  label,
  value,
  tag,
  color = "var(--indigo)",
}: {
  icon: string;
  label: string;
  value: string | number;
  tag?: string;
  color?: string;
}) {
  return (
    <div className="stat-card">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div className="stat-icon" style={{ background: color + "22" }}>
          {icon}
        </div>
        {tag && (
          <span style={{
            padding: "3px 10px", borderRadius: 99, fontSize: 11, fontWeight: 600,
            background: color + "22", color, border: `1px solid ${color}44`,
          }}>
            {tag}
          </span>
        )}
      </div>
      <div className="stat-value">{value}</div>
      <div className="stat-label">{label}</div>
    </div>
  );
}
