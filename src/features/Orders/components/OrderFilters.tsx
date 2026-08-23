import { useState } from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";

import type {
  DateFilter,
  OrderStatus,
  PaymentStatus,
  SortKey,
} from "../types/order";

type Props = {
  search: string;
  status: OrderStatus | "all";
  paymentStatus: PaymentStatus | "all";
  dateFilter: DateFilter;
  customFrom: string;
  customTo: string;
  minTotal: string;
  maxTotal: string;
  sort: SortKey;
  onSearchChange: (value: string) => void;
  onStatusChange: (value: OrderStatus | "all") => void;
  onPaymentStatusChange: (value: PaymentStatus | "all") => void;
  onDateChange: (value: DateFilter) => void;
  onCustomFromChange: (value: string) => void;
  onCustomToChange: (value: string) => void;
  onMinTotalChange: (value: string) => void;
  onMaxTotalChange: (value: string) => void;
  onSortChange: (value: SortKey) => void;
  onClearAll: () => void;
};

export default function OrderFilters({
  search,
  status,
  paymentStatus,
  dateFilter,
  customFrom,
  customTo,
  minTotal,
  maxTotal,
  sort,
  onSearchChange,
  onStatusChange,
  onPaymentStatusChange,
  onDateChange,
  onCustomFromChange,
  onCustomToChange,
  onMinTotalChange,
  onMaxTotalChange,
  onSortChange,
  onClearAll,
}: Props) {
  const [expanded, setExpanded] = useState(false);

  const activeChips: { label: string; clear: () => void }[] = [];

  if (status !== "all") {
    activeChips.push({
      label: `Status: ${status}`,
      clear: () => onStatusChange("all"),
    });
  }
  if (paymentStatus !== "all") {
    activeChips.push({
      label: `Payment: ${paymentStatus}`,
      clear: () => onPaymentStatusChange("all"),
    });
  }
  if (dateFilter !== "all") {
    activeChips.push({
      label: `Date: ${dateFilter}`,
      clear: () => onDateChange("all"),
    });
  }
  if (minTotal || maxTotal) {
    activeChips.push({
      label: `Total: ${minTotal || "0"}–${maxTotal || "∞"}`,
      clear: () => {
        onMinTotalChange("");
        onMaxTotalChange("");
      },
    });
  }

  return (
    <div className="mb-6">
      <div className="flex flex-col gap-3 lg:flex-row">
        <div className="relative flex-1">
          <Search
            size={18}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
          />

          <input
            value={search}
            onChange={(event) =>
              onSearchChange(event.target.value)
            }
            placeholder="Search orders, customers, phone, product..."
            className="w-full rounded-xl border border-gray-200 bg-white py-3 pl-11 pr-4 outline-none transition focus:border-orange-400"
          />
        </div>

        <select
          value={sort}
          onChange={(event) =>
            onSortChange(event.target.value as SortKey)
          }
          className="rounded-xl border border-gray-200 bg-white px-4 py-3 outline-none"
        >
          <option value="newest">Newest first</option>
          <option value="oldest">Oldest first</option>
          <option value="total_high">Total: high to low</option>
          <option value="total_low">Total: low to high</option>
        </select>

        <button
          type="button"
          onClick={() => setExpanded((current) => !current)}
          className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          <SlidersHorizontal size={16} />
          Filters
        </button>
      </div>

      {expanded && (
        <div className="mt-3 grid grid-cols-1 gap-3 rounded-xl border border-gray-200 bg-white p-4 sm:grid-cols-2 lg:grid-cols-4">
          <select
            value={status}
            onChange={(event) =>
              onStatusChange(
                event.target.value as OrderStatus | "all"
              )
            }
            className="rounded-lg border border-gray-200 px-3 py-2.5 outline-none"
          >
            <option value="all">All statuses</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="processing">Processing</option>
            <option value="ready">Ready</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>

          <select
            value={paymentStatus}
            onChange={(event) =>
              onPaymentStatusChange(
                event.target.value as PaymentStatus | "all"
              )
            }
            className="rounded-lg border border-gray-200 px-3 py-2.5 outline-none"
          >
            <option value="all">All payments</option>
            <option value="pending">Payment pending</option>
            <option value="paid">Paid</option>
            <option value="failed">Failed</option>
            <option value="refunded">Refunded</option>
          </select>

          <select
            value={dateFilter}
            onChange={(event) =>
              onDateChange(event.target.value as DateFilter)
            }
            className="rounded-lg border border-gray-200 px-3 py-2.5 outline-none"
          >
            <option value="all">All dates</option>
            <option value="today">Today</option>
            <option value="week">This week</option>
            <option value="month">This month</option>
            <option value="custom">Custom range</option>
          </select>

          <div className="flex gap-2">
            <input
              type="number"
              min={0}
              placeholder="Min total"
              value={minTotal}
              onChange={(event) =>
                onMinTotalChange(event.target.value)
              }
              className="w-full rounded-lg border border-gray-200 px-3 py-2.5 outline-none"
            />
            <input
              type="number"
              min={0}
              placeholder="Max total"
              value={maxTotal}
              onChange={(event) =>
                onMaxTotalChange(event.target.value)
              }
              className="w-full rounded-lg border border-gray-200 px-3 py-2.5 outline-none"
            />
          </div>

          {dateFilter === "custom" && (
            <div className="flex gap-2 sm:col-span-2 lg:col-span-4">
              <input
                type="date"
                value={customFrom}
                onChange={(event) =>
                  onCustomFromChange(event.target.value)
                }
                className="w-full rounded-lg border border-gray-200 px-3 py-2.5 outline-none"
              />
              <input
                type="date"
                value={customTo}
                onChange={(event) =>
                  onCustomToChange(event.target.value)
                }
                className="w-full rounded-lg border border-gray-200 px-3 py-2.5 outline-none"
              />
            </div>
          )}
        </div>
      )}

      {activeChips.length > 0 && (
        <div className="mt-3 flex flex-wrap items-center gap-2">
          {activeChips.map((chip) => (
            <span
              key={chip.label}
              className="inline-flex items-center gap-1.5 rounded-full bg-orange-50 px-3 py-1 text-xs font-medium text-orange-700"
            >
              {chip.label}
              <button
                type="button"
                onClick={chip.clear}
                className="rounded-full hover:bg-orange-100"
              >
                <X size={12} />
              </button>
            </span>
          ))}

          <button
            type="button"
            onClick={onClearAll}
            className="text-xs font-medium text-gray-400 underline hover:text-gray-600"
          >
            Clear all
          </button>
        </div>
      )}
    </div>
  );
}
