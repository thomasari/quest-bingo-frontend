import "./Switch.scss";

interface Props {
  id: string;
  label?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  modifierClass?: string;
  disabled?: boolean;
  invalidText?: string | null;
}

function Switch({
  id,
  label,
  checked,
  onChange,
  modifierClass,
  disabled,
  invalidText,
}: Props) {
  return (
    <div className={`switch-section ${modifierClass ?? ""}`}>
      {label && (
        <label
          className={`switch-label ${disabled ? "switch-label--disabled" : ""}`}
          htmlFor={id}
        >
          {label}
        </label>
      )}

      <label className={`switch ${invalidText ? "invalid" : ""}`}>
        <input
          id={id}
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          disabled={disabled}
        />
        <span className="slider" />
      </label>

      {invalidText && (
        <label className="switch-invalid-text" htmlFor={id}>
          <span className="material-symbols-outlined">warning</span>
          {invalidText}
        </label>
      )}
    </div>
  );
}

export default Switch;
