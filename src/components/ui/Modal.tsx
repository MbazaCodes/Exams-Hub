import { type ReactNode, useEffect } from "react";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  maxWidth?: number;
  title?: string;
}

export function Modal({ open, onClose, children, maxWidth = 480, title }: ModalProps) {
  useEffect(() => {
    if (!open) return;
    const handle = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handle);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", handle);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="modal-overlay"
      onClick={(e) => e.target === e.currentTarget && onClose()}
      role="dialog"
      aria-modal="true"
    >
      <div className="modal-panel" style={{ maxWidth }}>
        {title && (
          <div style={{
            display: "flex", justifyContent: "space-between", alignItems: "center",
            padding: "20px 24px 0",
          }}>
            <h3 style={{ fontWeight: 700, fontSize: 18, color: "var(--white)" }}>{title}</h3>
            <button
              onClick={onClose}
              style={{
                background: "none", border: "none", color: "var(--muted)",
                fontSize: 20, cursor: "pointer", lineHeight: 1,
              }}
              aria-label="Close"
            ></button>
          </div>
        )}
        <div style={{ padding: title ? "16px 24px 24px" : 0 }}>
          {!title && (
            <button
              onClick={onClose}
              style={{
                position: "absolute", top: 14, right: 14,
                background: "none", border: "none", color: "var(--muted)",
                fontSize: 20, cursor: "pointer", lineHeight: 1, zIndex: 1,
              }}
              aria-label="Close"
            ></button>
          )}
          {children}
        </div>
      </div>
    </div>
  );
}
