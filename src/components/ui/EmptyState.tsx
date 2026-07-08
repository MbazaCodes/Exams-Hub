import { Button } from "./Button";

interface EmptyStateProps {
  icon?: string;
  title: string;
  subtitle?: string;
  action?: { label: string; onClick: () => void };
}

export function EmptyState({ icon = "", title, subtitle, action }: EmptyStateProps) {
  return (
    <div className="empty-state">
      <div className="empty-icon">{icon}</div>
      <div className="empty-title">{title}</div>
      {subtitle && <div className="empty-sub" style={{ marginTop: 4 }}>{subtitle}</div>}
      {action && (
        <Button variant="primary" onClick={action.onClick} style={{ marginTop: 20 }}>
          {action.label}
        </Button>
      )}
    </div>
  );
}
