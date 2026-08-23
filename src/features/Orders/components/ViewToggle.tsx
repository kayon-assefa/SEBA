import { LayoutList, LayoutGrid, Kanban } from "lucide-react";

import type { ViewMode } from "../types/order";

type Props = {
  value: ViewMode;
  onChange: (mode: ViewMode) => void;
};

const OPTIONS: { key: ViewMode; label: string; icon: typeof LayoutList }[] = [
  { key: "table", label: "Table", icon: LayoutList },
  { key: "kanban", label: "Board", icon: Kanban },
  { key: "cards", label: "Cards", icon: LayoutGrid },
];

export default function ViewToggle({ value, onChange }: Props) {
  return (
    <div className="inline-flex rounded-xl border border-gray-200 bg-white p-1">
      {OPTIONS.map((option) => {
        const Icon = option.icon;
        const active = value === option.key;

        return (
          <button
            key={option.key}
            type="button"
            onClick={() => onChange(option.key)}
            className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition ${
              active
                ? "bg-orange-600 text-white shadow-sm"
                : "text-gray-500 hover:bg-gray-50"
            }`}
          >
            <Icon size={15} />
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
