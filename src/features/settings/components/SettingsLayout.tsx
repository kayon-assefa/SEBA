import type { ReactNode } from "react";
import SettingsHeader from "./SettingsHeader";
import SettingsNavigation from "./SettingsNavigation";

type Props = {
  children: ReactNode;
  title?: string;
  description?: string;
};

export default function SettingsLayout({
  children,
  title = "Settings",
  description = "Manage your business and account settings.",
}: Props) {
  return (
    <div className="min-h-full bg-[#FAF7F0]">
      <SettingsHeader title={title} description={description} />

      <div className="border-b border-gray-200 bg-[#FFFDF8]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SettingsNavigation />
        </div>
      </div>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
}
