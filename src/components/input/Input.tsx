import type { ChangeEventHandler } from "react";
import "./Input.scss";
import Button from "../button/Button";

interface Props {
  id: string;
  label?: string;
  onChange: ChangeEventHandler<HTMLInputElement>;
  modifierClass?: string;
  value?: string;
  disabled?: boolean;
  invalidText?: string | null;
  onKeySubmit?: React.KeyboardEventHandler<HTMLInputElement>;
  onClickSubmit?: React.MouseEventHandler<HTMLButtonElement>;
  buttonText?: string;
  buttonIcon?: string;
  placeholder?: string;
  buttonDisabled?: boolean;
  buttonType?: "primary" | "secondary";
  maxLength?: number;
}

function Input({
  id,
  label,
  onChange,
  onKeySubmit,
  onClickSubmit,
  buttonText,
  buttonDisabled,
  buttonType,
  buttonIcon,
  modifierClass,
  value,
  placeholder,
  disabled,
  invalidText,
  maxLength,
}: Props) {
  return (
    <div className={`input-section ${modifierClass ?? ""}`}>
      {label && (
        <label
          className={`input-label ${disabled ? "input-label--disabled" : ""}`}
          htmlFor={id}
        >
          {label}
        </label>
      )}
      <div className="input-button-section">
        <input
          className={`input ${invalidText ? "invalid" : ""}`}
          onChange={onChange}
          onKeyDown={(e) => e.key === "Enter" && onKeySubmit && onKeySubmit(e)}
          value={value ?? ""}
          disabled={disabled}
          maxLength={maxLength}
          placeholder={placeholder}
        ></input>
        {onClickSubmit && buttonText && (
          <Button
            id={`${id}-button`}
            text={buttonText}
            onClick={onClickSubmit}
            disabled={disabled || invalidText !== undefined || buttonDisabled}
            type={buttonType}
            icon={buttonIcon}
          ></Button>
        )}
      </div>
      {invalidText && (
        <label className="input-invalid-text" htmlFor={id}>
          <span className="material-symbols-outlined">warning</span>
          {invalidText}
        </label>
      )}
    </div>
  );
}

export default Input;
