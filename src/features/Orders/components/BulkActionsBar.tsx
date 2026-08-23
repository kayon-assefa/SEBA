import { Trash2, X } from "lucide-react";

import type { OrderStatus } from "../types/order";

type Props = {
  count: number;
  onClear: () => void;
  onBulkStatus: (status: OrderStatus) => void;
  onBulkDelete: () => void;
};

export default function BulkActionsBar({
  count,
  onClear,
  onBulkStatus,
  onBulkDelete,
}: Props) {
  if (count === 0) return null;

  return (
    <div className="mb-4 flex flex-wrap items-center gap-3 rounded-xl border border-orange-200 bg-orange-50 px-4 py-3">
      <span className="text-sm font-semibold text-orange-800">
        {count} selected
      </span>

      <select
        onChange={(event) => {
          if (event.target.value) {
            onBulkStatus(event.target.value as OrderStatus);
            event.target.value = "";
          }
        }}
        defaultValue=""
        className="rounded-lg border border-orange-200 bg-white px-3 py-1.5 text-sm outline-none"
      >
        <option value="" disabled>
          Change status to...
        </option>
        <option value="confirmed">Confirmed</option>
        <option value="processing">Processing</option>
        <option value="ready">Ready</option>
        <option value="completed">Completed</option>
        <option value="cancelled">Cancelled</option>
      </select>

      <button
        type="button"
        onClick={onBulkDelete}
        className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-white px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50"
      >
        <Trash2 size={14} />
        Delete
      </button>

      <button
        type="button"
        onClick={onClear}
        className="ml-auto inline-flex items-center gap-1 text-sm font-medium text-orange-700 hover:text-orange-900"
      >
        <X size={14} />
        Clear
      </button>
    </div>
  );
}
