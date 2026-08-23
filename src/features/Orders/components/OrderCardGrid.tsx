import type { Order } from "../types/order";
import OrderStatus from "./OrderStatus";
import { formatCurrency, formatOrderNumber } from "../lib/receipt";

type Props = {
  orders: Order[];
  onSelect: (order: Order) => void;
};

export default function OrderCardGrid({ orders, onSelect }: Props) {
  if (orders.length === 0) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-12 text-center text-sm text-gray-500">
        No orders match your filters.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {orders.map((order) => {
        const items = order.order_items ?? [];
        const total = items.reduce(
          (sum, item) => sum + item.price * item.quantity,
          0
        );

        return (
          <button
            key={order.id}
            onClick={() => onSelect(order)}
            className="flex flex-col gap-3 rounded-2xl border border-gray-200 bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="font-semibold text-gray-900">
                  #{formatOrderNumber(order)}
                </p>
                <p className="text-xs text-gray-500">
                  {new Date(
                    order.created_at
                  ).toLocaleDateString()}
                </p>
              </div>
              <OrderStatus status={order.status} />
            </div>

            <div>
              <p className="font-medium text-gray-900">
                {order.customer_name}
              </p>
              <p className="text-xs text-gray-500">
                {order.customer_phone}
              </p>
            </div>

            <div className="flex items-center justify-between border-t border-gray-100 pt-3 text-sm">
              <span className="text-gray-500">
                {items.length}{" "}
                {items.length === 1 ? "item" : "items"}
              </span>
              <span className="font-semibold text-gray-900">
                {formatCurrency(total)}
              </span>
            </div>
          </button>
        );
      })}
    </div>
  );
}
