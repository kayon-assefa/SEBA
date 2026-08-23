import { useState } from "react";

import type { Order, OrderStatus as OrderStatusType } from "../types/order";
import OrderStatus from "./OrderStatus";
import { formatCurrency, formatOrderNumber } from "../lib/receipt";

type Props = {
  orders: Order[];
  onSelect: (order: Order) => void;
  onStatusChange: (
    orderId: string,
    status: OrderStatusType
  ) => void;
};

const COLUMNS: OrderStatusType[] = [
  "pending",
  "confirmed",
  "processing",
  "ready",
  "completed",
];

export default function OrderKanbanBoard({
  orders,
  onSelect,
  onStatusChange,
}: Props) {
  const [dragOverColumn, setDragOverColumn] =
    useState<OrderStatusType | null>(null);

  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {COLUMNS.map((column) => {
        const columnOrders = orders.filter(
          (order) => order.status === column
        );

        return (
          <div
            key={column}
            onDragOver={(event) => {
              event.preventDefault();
              setDragOverColumn(column);
            }}
            onDragLeave={() => setDragOverColumn(null)}
            onDrop={(event) => {
              event.preventDefault();
              const orderId =
                event.dataTransfer.getData("orderId");
              if (orderId) onStatusChange(orderId, column);
              setDragOverColumn(null);
            }}
            className={`flex w-72 shrink-0 flex-col rounded-2xl border p-3 transition ${
              dragOverColumn === column
                ? "border-orange-300 bg-orange-50/60"
                : "border-gray-200 bg-gray-50"
            }`}
          >
            <div className="mb-3 flex items-center justify-between px-1">
              <OrderStatus status={column} />
              <span className="text-xs font-medium text-gray-400">
                {columnOrders.length}
              </span>
            </div>

            <div className="flex flex-1 flex-col gap-2">
              {columnOrders.map((order) => {
                const total = (order.order_items ?? []).reduce(
                  (sum, item) => sum + item.price * item.quantity,
                  0
                );

                return (
                  <div
                    key={order.id}
                    draggable
                    onDragStart={(event) =>
                      event.dataTransfer.setData(
                        "orderId",
                        order.id
                      )
                    }
                    onClick={() => onSelect(order)}
                    className="cursor-pointer rounded-xl border border-gray-200 bg-white p-3 shadow-sm transition hover:shadow-md"
                  >
                    <p className="text-sm font-semibold text-gray-900">
                      #{formatOrderNumber(order)}
                    </p>
                    <p className="mt-0.5 text-xs text-gray-500">
                      {order.customer_name}
                    </p>
                    <p className="mt-2 text-sm font-medium text-gray-900">
                      {formatCurrency(total)}
                    </p>
                  </div>
                );
              })}

              {columnOrders.length === 0 && (
                <div className="rounded-xl border border-dashed border-gray-200 p-4 text-center text-xs text-gray-400">
                  Drop here
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
