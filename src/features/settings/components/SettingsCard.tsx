import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
  title?: string;
  description?: string;
  className?: string;
};

export default function SettingsCard({
  children,
  title,
  description,
  className = "",
}: Props) {
  return (
    <section
      className={[
        "rounded-2xl border border-gray-200 bg-[#FFFDF8] shadow-sm",
        className,
      ].join(" ")}
    >
      {(title || description) && (
        <div className="border-b border-gray-100 px-5 py-4 sm:px-6">
          {title && (
            <h2 className="text-base font-bold text-gray-900">{title}</h2>
          )}

          {description && (
            <p className="mt-1 text-sm text-gray-500">{description}</p>
          )}
        </div>
      )}

      <div className="p-5 sm:p-6">{children}</div>
    </section>
  );
}
