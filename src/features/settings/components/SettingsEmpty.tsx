import { Settings } from "lucide-react";

type Props = {
  title?: string;
  description?: string;
  action?: React.ReactNode;
};

export default function SettingsEmpty({
  title = "Nothing here yet",
  description = "There are no settings to display.",
  action,
}: Props) {
  return (
    <div className="flex min-h-[240px] flex-col items-center justify-center rounded-2xl border border-dashed border-gray-300 p-8 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
        <Settings size={22} className="text-gray-500" />
      </div>

      <h3 className="mt-4 font-semibold text-gray-900">
        {title}
      </h3>

      <p className="mt-1 max-w-md text-sm text-gray-500">
        {description}
      </p>

      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}