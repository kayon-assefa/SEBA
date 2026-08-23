import { useState } from "react";

type Props = {
  checked?: boolean;
  defaultChecked?: boolean;
  onChange?: (checked: boolean) => void;
  label?: string;
  description?: string;
  disabled?: boolean;
};

export default function SettingsToggle({
  checked,
  defaultChecked = false,
  onChange,
  label,
  description,
  disabled = false,
}: Props) {
  const [uncontrolledChecked, setUncontrolledChecked] = useState(defaultChecked);
  const isChecked = checked ?? uncontrolledChecked;

  function handleChange(nextChecked: boolean) {
    if (checked === undefined) setUncontrolledChecked(nextChecked);
    onChange?.(nextChecked);
  }

  return (
    <div className="flex items-center justify-between gap-4">
      {(label || description) && (
        <div className="min-w-0">
          {label && <p className="text-sm font-bold text-gray-900">{label}</p>}
          {description && (
            <p className="mt-1 text-xs text-gray-500">{description}</p>
          )}
        </div>
      )}

      <button
        type="button"
        role="switch"
        aria-checked={isChecked}
        disabled={disabled}
        onClick={() => handleChange(!isChecked)}
        className={[
          "relative inline-flex h-6 w-11 shrink-0 rounded-full",
          "transition-colors focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2",
          isChecked ? "bg-gray-900" : "bg-gray-300",
          disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer",
        ].join(" ")}
      >
        <span
          className={[
            "pointer-events-none inline-block h-5 w-5 translate-y-0.5 rounded-full bg-white shadow-sm",
            "transition-transform",
            isChecked ? "translate-x-5" : "translate-x-0.5",
          ].join(" ")}
        />
      </button>
    </div>
  );
}
