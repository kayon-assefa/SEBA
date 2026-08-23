import type { InputHTMLAttributes, ReactNode } from "react";

type Props = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  description?: string;
  error?: string;
  icon?: ReactNode;
};

export default function SettingsInput({
  label,
  description,
  error,
  icon,
  className = "",
  id,
  ...props
}: Props) {
  const inputId =
    id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={inputId}
          className="mb-2 block text-xs font-bold uppercase tracking-wide text-gray-700"
        >
          {label}
        </label>
      )}

      {description && (
        <p className="mb-2 text-xs text-gray-500">{description}</p>
      )}

      <div className="relative">
        {icon && (
          <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            {icon}
          </div>
        )}

        <input
          {...props}
          id={inputId}
          className={[
            "w-full rounded-xl border bg-white px-4 py-2.5 text-sm text-gray-900",
            "outline-none transition",
            "placeholder:text-gray-400",
            "focus:border-gray-400 focus:ring-2 focus:ring-gray-100",
            "disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-400",
            error
              ? "border-red-300 focus:border-red-400 focus:ring-red-50"
              : "border-gray-200",
            icon ? "pl-10" : "",
            className,
          ].join(" ")}
        />
      </div>

      {error && <p className="mt-1.5 text-xs text-red-600">{error}</p>}
    </div>
  );
}
