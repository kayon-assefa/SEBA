import type {
  TextareaHTMLAttributes,
} from "react";

type Props =
  TextareaHTMLAttributes<HTMLTextAreaElement> & {
    label?: string;
    description?: string;
    error?: string;
  };

export default function SettingsTextarea({
  label,
  description,
  error,
  className = "",
  id,
  ...props
}: Props) {
  const textareaId =
    id ||
    (label
      ? label.toLowerCase().replace(/\s+/g, "-")
      : undefined);

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={textareaId}
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

      <textarea
        {...props}
        id={textareaId}
        className={[
          "min-h-[110px] w-full resize-y rounded-xl border bg-white px-4 py-3",
          "text-sm text-gray-900 outline-none transition",
          "placeholder:text-gray-400",
          "focus:border-gray-400 focus:ring-2 focus:ring-gray-100",
          error
            ? "border-red-300"
            : "border-gray-200",
          className,
        ].join(" ")}
      />

      {error && (
        <p className="mt-1.5 text-xs text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}