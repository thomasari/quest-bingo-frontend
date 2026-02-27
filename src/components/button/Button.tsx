import "./Button.scss";

interface Props {
  label?: string;
  text: string;
  onClick: React.MouseEventHandler<HTMLButtonElement>;
  modifierClass?: string;
  disabled?: boolean;
  invalidText?: string | null;
  submit?: boolean;
  icon?: string;
  type?: "primary" | "secondary" | "tertiary";
  isLoading?: boolean;
}

function Button({
  label,
  text,
  onClick,
  modifierClass,
  disabled,
  invalidText,
  submit,
  icon,
  isLoading,
  type = "primary",
}: Props) {
  return (
    <div className={`button-section ${modifierClass ?? ""}`}>
      {label && (
        <label
          className={`button-label ${disabled ? "button-label--disabled" : ""}`}
        >
          {label}
        </label>
      )}

      <button
        className={`button ${type} ${invalidText ? "invalid" : ""}`}
        type={submit ? "submit" : "button"}
        onClick={onClick}
        disabled={disabled}
      >
        {text && <span className="button-text">{text}</span>}
        {icon && (
          <span className="material-symbols-outlined">
            {isLoading ? "hourglass_empty" : icon}
          </span>
        )}
      </button>
      {invalidText && (
        <label className="button-invalid-text">
          <span className="material-symbols-outlined">warning</span>
          {invalidText}
        </label>
      )}
    </div>
  );
}

export default Button;
