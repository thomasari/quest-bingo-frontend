import "./Dropdown.scss";

interface DropdownProps {
  label?: string;
  disabled?: boolean;
  invalidText?: string | null;
  modifierClass?: string;
  options: { value: string | number; label: string }[];
  onChange?: (value: string | number) => void;
  defaultValue?: string | number;
}

function Dropdown({
  label,
  disabled,
  invalidText,
  modifierClass,
  options,
  onChange,
  defaultValue,
}: DropdownProps) {
  return (
    <div className={`dropdown-section ${modifierClass ?? ""}`}>
      {label && (
        <label
          className={`dropdown-label ${disabled ? "dropdown-label--disabled" : ""}`}
        >
          {label}
        </label>
      )}

      <div className="dropdown-wrapper">
        <select
          className={`dropdown ${invalidText ? "invalid" : ""}`}
          disabled={disabled}
          defaultValue={defaultValue ?? options[0]?.value}
          onChange={(e) => onChange && onChange(e.target.value)}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <span className="chevron material-symbols-outlined">expand_more</span>
      </div>

      {invalidText && (
        <label className="dropdown-invalid-text">
          <span className="material-symbols-outlined">warning</span>
          {invalidText}
        </label>
      )}
    </div>
  );
}

export default Dropdown;
