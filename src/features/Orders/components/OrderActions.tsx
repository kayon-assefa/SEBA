import { useState } from "react";
import { Copy, Receipt as ReceiptIcon, RotateCcw } from "lucide-react";
import toast from "react-hot-toast";

import type { Order } from "../types/order";
import { orderService } from "../services/orders.service";

type Props = {
  order: Order;
  onOrderChange: (order: Order) => void;
  onDelete: () => void;
  onViewReceipt: () => void;
  onDuplicated: (order: Order) => void;
  onEditItems: () => void;
};

export default function OrderActions({
  order,
  onOrderChange,
  onDelete,
  onViewReceipt,
  onDuplicated,
  onEditItems,
}: Props) {
  const [loading, setLoading] = useState(false);

  async function changeStatus(status: Order["status"]) {
    try {
      setLoading(true);

      const updated = await orderService.updateOrderStatus(
        order.id,
        status
      );

      onOrderChange({
        ...order,
        ...updated,
        status,
        order_items: order.order_items,
      });

      toast.success("Order updated");
    } catch (error) {
      console.error(error);
      toast.error("Failed to update order");
    } finally {
      setLoading(false);
    }
  }

  async function deleteOrder() {
    const confirmed = window.confirm(
      "Are you sure you want to delete this order?"
    );

    if (!confirmed) return;

    try {
      setLoading(true);
      await orderService.deleteOrder(order.id);
      toast.success("Order deleted");
      onDelete();
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete order");
    } finally {
      setLoading(false);
    }
  }

  async function duplicateOrder() {
    try {
      setLoading(true);
      const duplicated = await orderService.duplicateOrder(
        order.id
      );
      toast.success("Order duplicated");
      onDuplicated(duplicated);
    } catch (error) {
      console.error(error);
      toast.error("Failed to duplicate order");
    } finally {
      setLoading(false);
    }
  }

  async function refundOrder() {
    const confirmed = window.confirm(
      "Mark this order as refunded?"
    );
    if (!confirmed) return;

    try {
      setLoading(true);
      const updated = await orderService.updatePaymentStatus(
        order.id,
        "refunded"
      );
      onOrderChange({ ...order, ...updated });
      toast.success("Order marked as refunded");
    } catch (error) {
      console.error(error);
      toast.error("Failed to refund order");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={onViewReceipt}
          className="col-span-2 inline-flex items-center justify-center gap-2 rounded-xl bg-orange-600 px-4 py-3 font-medium text-white transition hover:bg-orange-700"
        >
          <ReceiptIcon size={16} />
          View Receipt
        </button>

        {order.status === "pending" && (
          <button
            disabled={loading}
            onClick={() => changeStatus("confirmed")}
            className="rounded-xl bg-blue-600 px-4 py-3 font-medium text-white disabled:opacity-50"
          >
            Confirm Order
          </button>
        )}

        {(order.status === "confirmed" ||
          order.status === "pending") && (
          <button
            disabled={loading}
            onClick={() => changeStatus("processing")}
            className="rounded-xl bg-purple-600 px-4 py-3 font-medium text-white disabled:opacity-50"
          >
            Processing
          </button>
        )}

        {order.status === "processing" && (
          <button
            disabled={loading}
            onClick={() => changeStatus("ready")}
            className="rounded-xl bg-indigo-600 px-4 py-3 font-medium text-white disabled:opacity-50"
          >
            Mark Ready
          </button>
        )}

        {order.status === "ready" && (
          <button
            disabled={loading}
            onClick={() => changeStatus("completed")}
            className="rounded-xl bg-green-600 px-4 py-3 font-medium text-white disabled:opacity-50"
          >
            Complete
          </button>
        )}

        {order.status !== "completed" &&
          order.status !== "cancelled" && (
            <button
              disabled={loading}
              onClick={() => changeStatus("cancelled")}
              className="rounded-xl bg-red-100 px-4 py-3 font-medium text-red-700 disabled:opacity-50"
            >
              Cancel
            </button>
          )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <button
          disabled={loading}
          onClick={onEditItems}
          className="rounded-xl border border-gray-200 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
        >
          Edit items
        </button>

        <button
          disabled={loading}
          onClick={duplicateOrder}
          className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-gray-200 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
        >
          <Copy size={14} />
          Duplicate
        </button>
      </div>

      {order.payment_status === "paid" && (
        <button
          disabled={loading}
          onClick={refundOrder}
          className="inline-flex w-full items-center justify-center gap-1.5 rounded-xl border border-amber-200 px-4 py-3 text-sm font-medium text-amber-700 hover:bg-amber-50 disabled:opacity-50"
        >
          <RotateCcw size={14} />
          Refund order
        </button>
      )}

      <button
        disabled={loading}
        onClick={deleteOrder}
        className="w-full rounded-xl border border-red-200 px-4 py-3 font-medium text-red-600 disabled:opacity-50"
      >
        Delete Order
      </button>
    </div>
  );
}
