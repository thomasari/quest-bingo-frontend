import "./Button.scss";

interface Props {
  id: string;
  label?: string;
  text: string;
  onClick: React.MouseEventHandler<HTMLButtonElement>;
  modifierClass?: string;
  disabled?: boolean;
  invalidText?: string | null;
  icon?: string;
  type?: "primary" | "secondary";
}

function Button({
  id,
  label,
  text,
  onClick,
  modifierClass,
  disabled,
  invalidText,
  icon,
  type = "primary",
}: Props) {
  return (
    <div className={`button-section ${modifierClass ?? ""}`}>
      {label && (
        <label
          className={`button-label ${disabled ? "button-label--disabled" : ""}`}
          htmlFor={id}
        >
          {label}
        </label>
      )}

      <button
        className={`button ${type} ${invalidText ? "invalid" : ""}`}
        type="button"
        onClick={onClick}
        disabled={disabled}
      >
        <span className="button-text">{text}</span>
        {icon && <span className="material-symbols-outlined">{icon}</span>}
      </button>
      {invalidText && (
        <label className="button-invalid-text" htmlFor={id}>
          <span className="material-symbols-outlined">warning</span>
          {invalidText}
        </label>
      )}
    </div>
  );
}

export default Button;
