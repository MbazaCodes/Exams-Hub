import { type ReactNode } from "react";

type AlertType = "info" | "success" | "warning" | "error";

const icons: Record<AlertType, string> = {
  info: "ℹ", success: "", warning: "", error: "",
};

interface AlertProps {
  type?: AlertType;
  children: ReactNode;
  title?: string;
  onClose?: () => void;
}

export function Alert({ type = "info", children, title, onClose }: AlertProps) {
  return (
    <div className={`alert alert-${type}`} role="alert">
      <span style={{ fontSize: 16, flexShrink: 0 }}>{icons[type]}</span>
      <div style={{ flex: 1 }}>
        {title && <div style={{ fontWeight: 700, marginBottom: 3 }}>{title}</div>}
        <div style={{ fontSize: 13, lineHeight: 1.6 }}>{children}</div>
      </div>
      {onClose && (
        <button
          onClick={onClose}
          style={{ background: "none", border: "none", color: "inherit", cursor: "pointer", fontSize: 14, opacity: 0.7, flexShrink: 0 }}
        ></button>
      )}
    </div>
  );
}
