import { Search, X } from "lucide-react";
import type { CustomerFilters as Filters } from "../types/customer";

type Props = {
  filters: Filters;
  onChange: (filters: Filters) => void;
  allTags: string[];
  density: "compact" | "comfortable";
  onDensityChange: (d: "compact" | "comfortable") => void;
  searchInputRef?: React.RefObject<HTMLInputElement | null>;
};

const SEGMENTS: { value: Filters["segment"]; label: string }[] = [
  { value: "all", label: "All Customers" },
  { value: "pinned", label: "Pinned" },
  { value: "vip", label: "VIP" },
  { value: "inactive", label: "Inactive (60+ days)" },
  { value: "blacklisted", label: "Blacklisted" },
];

export default function CustomerFilters({
  filters,
  onChange,
  allTags,
  density,
  onDensityChange,
  searchInputRef,
}: Props) {
  const activeChips: { key: string; label: string; clear: () => void }[] = [];
  if (filters.tag) {
    activeChips.push({
      key: "tag",
      label: `Tag: ${filters.tag}`,
      clear: () => onChange({ ...filters, tag: null }),
    });
  }
  if (filters.segment !== "all") {
    activeChips.push({
      key: "segment",
      label: SEGMENTS.find((s) => s.value === filters.segment)?.label ?? filters.segment,
      clear: () => onChange({ ...filters, segment: "all" }),
    });
  }

  return (
    <div className="mb-4 space-y-3">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[220px]">
          <Search
            size={16}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            ref={searchInputRef}
            value={filters.search}
            onChange={(e) => onChange({ ...filters, search: e.target.value })}
            placeholder="Search name, phone, or email... ( / )"
            className="w-full rounded-lg border py-2 pl-9 pr-3 text-sm"
          />
        </div>

        <select
          value={filters.segment}
          onChange={(e) =>
            onChange({ ...filters, segment: e.target.value as Filters["segment"] })
          }
          className="rounded-lg border px-3 py-2 text-sm"
        >
          {SEGMENTS.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>

        <select
          value={filters.tag ?? ""}
          onChange={(e) => onChange({ ...filters, tag: e.target.value || null })}
          className="rounded-lg border px-3 py-2 text-sm"
        >
          <option value="">All Tags</option>
          {allTags.map((tag) => (
            <option key={tag} value={tag}>
              {tag}
            </option>
          ))}
        </select>

        <div className="ml-auto flex items-center gap-1 rounded-lg border p-1 text-xs">
          <button
            onClick={() => onDensityChange("comfortable")}
            className={`rounded px-2 py-1 ${
              density === "comfortable" ? "bg-gray-900 text-white" : "text-gray-500"
            }`}
          >
            Comfortable
          </button>
          <button
            onClick={() => onDensityChange("compact")}
            className={`rounded px-2 py-1 ${
              density === "compact" ? "bg-gray-900 text-white" : "text-gray-500"
            }`}
          >
            Compact
          </button>
        </div>
      </div>

      {activeChips.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {activeChips.map((chip) => (
            <button
              key={chip.key}
              onClick={chip.clear}
              className="flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-700 hover:bg-gray-200"
            >
              {chip.label}
              <X size={12} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
