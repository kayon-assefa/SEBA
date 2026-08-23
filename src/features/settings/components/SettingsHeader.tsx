type Props = {
  title?: string;
  description?: string;
};

export default function SettingsHeader({
  title = "Settings",
  description = "Manage your business and account settings.",
}: Props) {
  return (
    <header className="bg-[#FFFDF8]">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">
          {title}
        </h1>

        {description && (
          <p className="mt-1 text-sm text-gray-500">
            {description}
          </p>
        )}
      </div>
    </header>
  );
}