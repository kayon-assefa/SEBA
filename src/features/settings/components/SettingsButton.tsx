import type {
  ButtonHTMLAttributes,
  ReactNode,
} from "react";

type Variant =
  | "primary"
  | "secondary"
  | "danger"
  | "ghost";

type Props =
  ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: Variant;
    loading?: boolean;
    children: ReactNode;
  };

export default function SettingsButton({
  variant = "primary",
  loading = false,
  disabled,
  children,
  className = "",
  ...props
}: Props) {
  const variants: Record<Variant, string> = {
    primary:
      "bg-gray-900 text-white hover:bg-gray-800",
    secondary:
      "border border-gray-200 bg-white text-gray-700 hover:bg-gray-50",
    danger:
      "bg-red-600 text-white hover:bg-red-700",
    ghost:
      "text-gray-600 hover:bg-gray-100 hover:text-gray-900",
  };

  return (
    <button
      {...props}
      disabled={disabled || loading}
      className={[
        "inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5",
        "text-sm font-semibold transition",
        "focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2",
        "disabled:cursor-not-allowed disabled:opacity-50",
        variants[variant],
        className,
      ].join(" ")}
    >
      {loading && (
        <span
          className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
          aria-hidden="true"
        />
      )}

      {children}
    </button>
  );
}