import type {
  SelectHTMLAttributes,
} from "react";

export type SettingsSelectOption = {
  value: string;
  label: string;
  disabled?: boolean;
};

type Props =
  SelectHTMLAttributes<HTMLSelectElement> & {
    label?: string;
    description?: string;
    error?: string;
    options: SettingsSelectOption[];
  };

export default function SettingsSelect({
  label,
  description,
  error,
  options,
  className = "",
  id,
  ...props
}: Props) {
  const selectId =
    id ||
    (label
      ? label.toLowerCase().replace(/\s+/g, "-")
      : undefined);

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={selectId}
          className="mb-2 block text-sm font-medium text-gray-700"
        >
          {label}
        </label>
      )}

      {description && (
        <p className="mb-2 text-xs text-gray-500">
          {description}
        </p>
      )}

      <select
        {...props}
        id={selectId}
        className={[
          "w-full rounded-xl border bg-white px-4 py-2.5 text-sm text-gray-900",
          "outline-none transition",
          "focus:border-gray-400 focus:ring-2 focus:ring-gray-100",
          "disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-400",
          error
            ? "border-red-300"
            : "border-gray-200",
          className,
        ].join(" ")}
      >
        {options.map((option) => (
          <option
            key={option.value}
            value={option.value}
            disabled={option.disabled}
          >
            {option.label}
          </option>
        ))}
      </select>

      {error && (
        <p className="mt-1.5 text-xs text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}