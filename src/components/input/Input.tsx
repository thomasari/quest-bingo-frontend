import { forwardRef } from "react";
import type { ChangeEventHandler } from "react";
import "./Input.scss";

interface Props {
  label?: string;
  onChange: ChangeEventHandler<HTMLInputElement>;
  modifierClass?: string;
  value?: string;
  disabled?: boolean;
  invalidText?: string | null;
  placeholder?: string;
  onKeyDown?: React.KeyboardEventHandler<HTMLInputElement>;
  maxLength?: number;
  modifierStyle?: React.CSSProperties;
}

const Input = forwardRef<HTMLInputElement, Props>(
  (
    {
      label,
      onChange,
      modifierClass,
      modifierStyle,
      value,
      placeholder,
      disabled,
      invalidText,
      onKeyDown,
      maxLength,
    },
    ref,
  ) => {
    return (
      <div className={`input-section ${modifierClass ?? ""}`}>
        {label && (
          <label
            className={`input-label ${disabled ? "input-label--disabled" : ""}`}
          >
            {label}
          </label>
        )}

        <div className="input-button-section">
          <input
            ref={ref}
            style={modifierStyle}
            className={`input ${invalidText ? "invalid" : ""}`}
            onChange={onChange}
            onKeyDown={onKeyDown}
            value={value ?? ""}
            disabled={disabled}
            maxLength={maxLength}
            placeholder={placeholder}
          />
        </div>

        {invalidText && (
          <label className="input-invalid-text">
            <span className="material-symbols-outlined">warning</span>
            {invalidText}
          </label>
        )}
      </div>
    );
  },
);

export default Input;
