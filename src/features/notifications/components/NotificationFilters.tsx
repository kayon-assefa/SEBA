// src/features/Notifications/components/NotificationFilters.tsx

import { Search } from "lucide-react";
import type { NotificationFilter } from "../types/notification";

const TABS: { value: NotificationFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "unread", label: "Unread" },
  { value: "order", label: "Orders" },
  { value: "appointment", label: "Appointments" },
  { value: "customer", label: "Customers" },
  { value: "auth", label: "Auth" },
];

interface NotificationFiltersProps {
  filter: NotificationFilter;
  onFilterChange: (filter: NotificationFilter) => void;
  search: string;
  onSearchChange: (search: string) => void;
}

export default function NotificationFilters({
  filter,
  onFilterChange,
  search,
  onSearchChange,
}: NotificationFiltersProps) {
  return (
    <div className="flex flex-col gap-3 border-b border-gray-200 pb-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-wrap gap-1">
        {TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => onFilterChange(tab.value)}
            className={`rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
              filter === tab.value
                ? "bg-orange-600 text-white"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="relative w-full sm:w-64">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <input
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search notifications..."
          className="w-full rounded-lg border border-gray-200 py-2 pl-9 pr-3 text-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
        />
      </div>
    </div>
  );
}
