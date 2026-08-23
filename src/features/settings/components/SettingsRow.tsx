import type { ReactNode } from "react";

type Props = {
  label: string;
  description?: string;
  children: ReactNode;
  className?: string;
};

export default function SettingsRow({
  label,
  description,
  children,
  className = "",
}: Props) {
  return (
    <div
      className={[
        "flex flex-col gap-4 border-b border-gray-100 py-5 last:border-b-0",
        "sm:flex-row sm:items-center sm:justify-between",
        className,
      ].join(" ")}
    >
      <div className="min-w-0 sm:max-w-md">
        <p className="text-sm font-medium text-gray-900">
          {label}
        </p>

        {description && (
          <p className="mt-1 text-sm text-gray-500">
            {description}
          </p>
        )}
      </div>

      <div className="sm:w-auto sm:min-w-[240px]">
        {children}
      </div>
    </div>
  );
}