import { type InputHTMLAttributes, type ReactNode } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  iconLeft?: ReactNode;
  iconRight?: ReactNode;
  required?: boolean;
}

export function Input({
  label,
  error,
  hint,
  iconLeft,
  iconRight,
  required,
  className = "",
  ...props
}: InputProps) {
  return (
    <div style={{ marginBottom: 16 }}>
      {label && (
        <label className="input-label">
          {label}
          {required && <span style={{ color: "var(--gold)", marginLeft: 3 }}>*</span>}
        </label>
      )}
      <div className="input-wrap">
        {iconLeft && <span className="input-icon-left">{iconLeft}</span>}
        <input
          className={`input-field ${iconLeft ? "pl-10" : ""} ${error ? "error" : ""} ${className}`}
          {...props}
        />
        {iconRight && <span className="input-icon-right">{iconRight}</span>}
      </div>
      {error && <p className="input-error"> {error}</p>}
      {hint && !error && <p className="input-hint">{hint}</p>}
    </div>
  );
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  hint?: string;
  required?: boolean;
  options: { value: string; label: string }[];
  placeholder?: string;
}

export function Select({
  label,
  error,
  hint,
  required,
  options,
  placeholder,
  className = "",
  ...props
}: SelectProps) {
  return (
    <div style={{ marginBottom: 16 }}>
      {label && (
        <label className="input-label">
          {label}
          {required && <span style={{ color: "var(--gold)", marginLeft: 3 }}>*</span>}
        </label>
      )}
      <select
        className={`input-field select-field ${error ? "error" : ""} ${className}`}
        {...props}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
      {error && <p className="input-error"> {error}</p>}
      {hint && !error && <p className="input-hint">{hint}</p>}
    </div>
  );
}
