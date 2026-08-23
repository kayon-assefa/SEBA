import { useState } from "react";
import { SlidersHorizontal } from "lucide-react";
import type { Category, ProductFilters, ProductStatus, Tag } from "../types/product";

type Props = {
  filters: ProductFilters;
  onChange: (filters: ProductFilters) => void;
  categories: Category[];
  tags: Tag[];
};

const STATUS_OPTIONS: Array<ProductStatus | "all"> = ["all", "Active", "Inactive", "Draft"];

// Features #7 (category filter), #8 (status filter), #9 (price range),
// #21 (advanced filters: stock range, date range, tags)
export default function FiltersBar({ filters, onChange, categories, tags }: Props) {
  const [expanded, setExpanded] = useState(false);

  function set<K extends keyof ProductFilters>(key: K, value: ProductFilters[K]) {
    onChange({ ...filters, [key]: value });
  }

  function toggleTag(tagId: string) {
    const has = filters.tagIds.includes(tagId);
    set("tagIds", has ? filters.tagIds.filter((id) => id !== tagId) : [...filters.tagIds, tagId]);
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-4">
      <div className="flex flex-wrap items-center gap-2">
        <select
          value={filters.status}
          onChange={(e) => set("status", e.target.value as ProductStatus | "all")}
          className="rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[#F25F5C]"
        >
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>{s === "all" ? "All statuses" : s}</option>
          ))}
        </select>

        <select
          value={filters.categoryId}
          onChange={(e) => set("categoryId", e.target.value)}
          className="rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[#F25F5C]"
        >
          <option value="all">All categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>

        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="ml-auto inline-flex items-center gap-1.5 rounded-xl border border-gray-200 px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
        >
          <SlidersHorizontal size={15} /> More filters
        </button>
      </div>

      {expanded && (
        <div className="mt-4 space-y-4 border-t border-gray-100 pt-4">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <RangeInput label="Min price" value={filters.minPrice} onChange={(v) => set("minPrice", v)} />
            <RangeInput label="Max price" value={filters.maxPrice} onChange={(v) => set("maxPrice", v)} />
            <RangeInput label="Min stock" value={filters.minStock} onChange={(v) => set("minStock", v)} />
            <RangeInput label="Max stock" value={filters.maxStock} onChange={(v) => set("maxStock", v)} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-500">Added from</label>
              <input type="date" value={filters.dateFrom} onChange={(e) => set("dateFrom", e.target.value)} className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[#F25F5C]" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-500">Added to</label>
              <input type="date" value={filters.dateTo} onChange={(e) => set("dateTo", e.target.value)} className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[#F25F5C]" />
            </div>
          </div>

          {tags.length > 0 && (
            <div>
              <label className="mb-1.5 block text-xs font-medium text-gray-500">Tags</label>
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => {
                  const active = filters.tagIds.includes(tag.id);
                  return (
                    <button
                      key={tag.id}
                      type="button"
                      onClick={() => toggleTag(tag.id)}
                      className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                        active ? "bg-[#F25F5C] text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}
                    >
                      {tag.name}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function RangeInput({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="mb-1 block text-xs font-medium text-gray-500">{label}</label>
      <input
        type="number"
        min="0"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[#F25F5C]"
      />
    </div>
  );
}
