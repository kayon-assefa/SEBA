import { useState } from "react";
import { ArrowUpDown } from "lucide-react";

import type { Order } from "../types/order";

import OrderRow from "./OrderRow";

type Props = {
  orders: Order[];
  loading?: boolean;
  selectedIds: Set<string>;
  newOrderId?: string | null;
  onSelect: (order: Order) => void;
  onToggleSelect: (orderId: string, checked: boolean) => void;
  onToggleSelectAll: (checked: boolean) => void;
  onSortChange: (key: "date" | "total") => void;
};

function SkeletonRow() {
  return (
    <tr className="border-b border-gray-100">
      {Array.from({ length: 7 }).map((_, index) => (
        <td key={index} className="px-5 py-4">
          <div className="h-4 w-full max-w-24 animate-pulse rounded bg-gray-100" />
        </td>
      ))}
    </tr>
  );
}

export default function OrderTable({
  orders,
  loading,
  selectedIds,
  newOrderId,
  onSelect,
  onToggleSelect,
  onToggleSelectAll,
  onSortChange,
}: Props) {
  const [allChecked, setAllChecked] = useState(false);

  if (loading) {
    return (
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
        <table className="w-full min-w-200 text-left">
          <tbody className="divide-y divide-gray-100">
            {Array.from({ length: 6 }).map((_, index) => (
              <SkeletonRow key={index} />
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-12 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-orange-50 text-2xl">
          🛍️
        </div>

        <h3 className="text-lg font-semibold text-gray-900">
          No orders yet
        </h3>

        <p className="mx-auto mt-2 max-w-md text-sm text-gray-500">
          When customers purchase products from
          your SEBA shop, their orders will appear
          here.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
      <div className="max-h-[70vh] overflow-x-auto overflow-y-auto">
        <table className="w-full min-w-220 text-left">
          <thead className="sticky top-0 z-10 border-b bg-gray-50">
            <tr>
              <th className="px-4 py-4">
                <input
                  type="checkbox"
                  checked={allChecked}
                  onChange={(event) => {
                    setAllChecked(event.target.checked);
                    onToggleSelectAll(event.target.checked);
                  }}
                  className="h-4 w-4 rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                />
              </th>

              <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
                Order
              </th>

              <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
                Customer
              </th>

              <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
                Items
              </th>

              <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
                <button
                  type="button"
                  onClick={() => onSortChange("total")}
                  className="inline-flex items-center gap-1 hover:text-gray-800"
                >
                  Total <ArrowUpDown size={12} />
                </button>
              </th>

              <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
                <button
                  type="button"
                  onClick={() => onSortChange("date")}
                  className="inline-flex items-center gap-1 hover:text-gray-800"
                >
                  Date <ArrowUpDown size={12} />
                </button>
              </th>

              <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
                Status
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100">
            {orders.map((order) => (
              <OrderRow
                key={order.id}
                order={order}
                selected={selectedIds.has(order.id)}
                isNew={order.id === newOrderId}
                onClick={() => onSelect(order)}
                onToggleSelect={(checked) =>
                  onToggleSelect(order.id, checked)
                }
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
