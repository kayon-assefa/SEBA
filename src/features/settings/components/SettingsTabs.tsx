import type { ReactNode } from "react";

export type SettingsTab = {
  id: string;
  label: string;
  content: ReactNode;
};

type Props = {
  tabs: SettingsTab[];
  activeTab: string;
  onChange: (id: string) => void;
};

export default function SettingsTabs({
  tabs,
  activeTab,
  onChange,
}: Props) {
  return (
    <div className="w-full overflow-x-auto">
      <div className="flex min-w-max gap-1 border-b border-gray-200">
        {tabs.map((tab) => {
          const active = tab.id === activeTab;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onChange(tab.id)}
              className={[
                "border-b-2 px-4 py-3 text-sm font-medium transition",
                active
                  ? "border-black text-gray-900"
                  : "border-transparent text-gray-500 hover:text-gray-900",
              ].join(" ")}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      <div className="pt-6">
        {tabs.find((tab) => tab.id === activeTab)?.content}
      </div>
    </div>
  );
}