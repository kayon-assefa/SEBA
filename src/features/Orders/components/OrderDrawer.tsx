import { X, Receipt } from "lucide-react";

import type { Order } from "../types/order";

import OrderDetails from "./OrderDetails";
import OrderActions from "./OrderActions";

type Props = {
  order: Order | null;
  open: boolean;
  customerOrderCount?: number;
  onClose: () => void;
  onOrderUpdated: (order: Order) => void;
  onOrderDeleted: (orderId: string) => void;
  onViewReceipt: () => void;
  onDuplicated: (order: Order) => void;
  onEditItems: () => void;
};

export default function OrderDrawer({
  order,
  open,
  customerOrderCount,
  onClose,
  onOrderUpdated,
  onOrderDeleted,
  onViewReceipt,
  onDuplicated,
  onEditItems,
}: Props) {
  if (!open || !order) {
    return null;
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/30 backdrop-blur-[2px]"
        onClick={onClose}
      />

      {/* Drawer */}
      <aside className="fixed right-0 top-0 z-50 flex h-screen w-full max-w-md flex-col bg-[#FDF8F1] shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-stone-200 bg-white px-5 py-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
              Order
            </p>

            <h2 className="text-xl font-bold text-gray-900">
              #{order.order_number ?? order.id.slice(0, 8)}
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onViewReceipt}
              className="rounded-lg p-2 text-orange-600 transition hover:bg-orange-50"
              aria-label="View receipt"
              title="View receipt"
            >
              <Receipt size={20} />
            </button>

            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-900"
              aria-label="Close order"
            >
              <X size={22} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5">
          <OrderDetails
            order={order}
            customerOrderCount={customerOrderCount}
          />
        </div>

        {/* Actions */}
        <div className="border-t border-stone-200 bg-white p-5">
          <OrderActions
            order={order}
            onOrderChange={onOrderUpdated}
            onDelete={() => onOrderDeleted(order.id)}
            onViewReceipt={onViewReceipt}
            onDuplicated={onDuplicated}
            onEditItems={onEditItems}
          />
        </div>
      </aside>
    </>
  );
}
