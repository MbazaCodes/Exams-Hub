import { type ReactNode } from "react";

type BadgeVariant = "indigo" | "gold" | "green" | "red" | "teal" | "purple" | "muted";

interface BadgeProps {
  children: ReactNode;
  variant?: BadgeVariant;
  icon?: string;
  className?: string;
}

export function Badge({ children, variant = "indigo", icon, className = "" }: BadgeProps) {
  return (
    <span className={`badge badge-${variant} ${className}`}>
      {icon && <span>{icon}</span>}
      {children}
    </span>
  );
}

export function DifficultyBadge({ difficulty }: { difficulty: string }) {
  const map: Record<string, BadgeVariant> = { Easy: "green", Medium: "gold", Hard: "red" };
  return <Badge variant={map[difficulty] || "muted"}>{difficulty}</Badge>;
}

export function ExamTypeBadge({ type }: { type: string }) {
  const map: Record<string, BadgeVariant> = {
    NECTA: "indigo", "Mock Exam": "teal", "Pre-National": "purple",
    Regional: "gold", District: "gold", "School Exam": "muted",
  };
  return <Badge variant={map[type] || "muted"}>{type}</Badge>;
}

export function GradeBadge({ grade, pct }: { grade: string; pct: number }) {
  const variant: BadgeVariant = pct >= 75 ? "green" : pct >= 50 ? "gold" : "red";
  return <Badge variant={variant}>Grade {grade}</Badge>;
}
