import { type ReactNode, type ButtonHTMLAttributes } from "react";

type Variant = "primary" | "gold" | "ghost" | "success" | "danger";
type Size    = "sm" | "md" | "lg" | "xl";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  full?: boolean;
  loading?: boolean;
  icon?: ReactNode;
  children: ReactNode;
}

const variantClass: Record<Variant, string> = {
  primary: "btn btn-primary",
  gold:    "btn btn-gold",
  ghost:   "btn btn-ghost",
  success: "btn btn-success",
  danger:  "btn btn-danger",
};

const sizeClass: Record<Size, string> = {
  sm: "btn-sm",
  md: "",
  lg: "btn-lg",
  xl: "btn-xl",
};

export function Button({
  variant = "primary",
  size = "md",
  full = false,
  loading = false,
  icon,
  children,
  disabled,
  className = "",
  ...props
}: ButtonProps) {
  return (
    <button
      className={`${variantClass[variant]} ${sizeClass[size]} ${full ? "btn-full" : ""} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <span className="spinner spinner-sm" />
      ) : icon ? (
        <span style={{ display: "flex", alignItems: "center" }}>{icon}</span>
      ) : null}
      {children}
    </button>
  );
}
