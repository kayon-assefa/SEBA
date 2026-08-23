import { MapPin, Clock, Phone, User, History } from "lucide-react";

import type { Order } from "../types/order";
import { calculateOrderTotals, formatCurrency } from "../lib/receipt";

import StatusStepper from "./StatusStepper";

type Props = {
  order: Order;
  customerOrderCount?: number;
};

export default function OrderDetails({
  order,
  customerOrderCount,
}: Props) {
  const orderItems = order.order_items ?? [];
  const totals = calculateOrderTotals(order);

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-gray-200 bg-white p-4">
        <StatusStepper status={order.status} />
      </div>

      <div className="rounded-2xl border border-gray-200 bg-orange-50/40 p-4">
        <div className="flex items-center justify-between">
          <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-gray-500">
            <User size={13} /> Customer
          </p>
          {typeof customerOrderCount === "number" && (
            <span className="rounded-full bg-white px-2 py-0.5 text-[11px] font-medium text-gray-500">
              {customerOrderCount} order
              {customerOrderCount === 1 ? "" : "s"} total
            </span>
          )}
        </div>
        <p className="mt-2 text-lg font-semibold text-gray-900">
          {order.customer_name}
        </p>
        <p className="flex items-center gap-1.5 text-sm text-gray-600">
          <Phone size={13} /> {order.customer_phone}
        </p>

        {order.delivery_type === "delivery" &&
          order.delivery_address && (
            <p className="mt-2 flex items-start gap-1.5 text-sm text-gray-600">
              <MapPin size={13} className="mt-0.5 shrink-0" />
              {order.delivery_address}
            </p>
          )}

        {order.estimated_ready_at && (
          <p className="mt-2 flex items-center gap-1.5 text-sm text-gray-600">
            <Clock size={13} />
            Ready by{" "}
            {new Date(order.estimated_ready_at).toLocaleString()}
          </p>
        )}
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-4">
        <div className="mb-3 flex items-center justify-between">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
            Items
          </p>
          <span className="text-sm font-medium text-gray-700">
            {orderItems.length} item
            {orderItems.length === 1 ? "" : "s"}
          </span>
        </div>

        <div className="space-y-3">
          {orderItems.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between gap-3 rounded-xl bg-gray-50 p-3"
            >
              <div>
                <p className="font-medium text-gray-900">
                  {item.product_name}
                </p>
                <p className="text-xs text-gray-500">
                  Qty {item.quantity}
                </p>
              </div>

              <p className="font-medium text-gray-900">
                {formatCurrency(item.price * item.quantity)}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 text-sm">
        <div className="rounded-2xl border border-gray-200 bg-white p-4">
          <p className="text-gray-500">Status</p>
          <p className="mt-1 font-semibold capitalize text-gray-900">
            {order.status}
          </p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-4">
          <p className="text-gray-500">Payment</p>
          <p className="mt-1 font-semibold capitalize text-gray-900">
            {order.payment_status}
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-4">
        <div className="space-y-1.5 text-sm">
          <div className="flex justify-between text-gray-500">
            <span>Subtotal</span>
            <span className="text-gray-900">
              {formatCurrency(totals.subtotal)}
            </span>
          </div>
          {totals.discount > 0 && (
            <div className="flex justify-between text-gray-500">
              <span>Discount</span>
              <span className="text-gray-900">
                -{formatCurrency(totals.discount)}
              </span>
            </div>
          )}
          {totals.tax > 0 && (
            <div className="flex justify-between text-gray-500">
              <span>Tax</span>
              <span className="text-gray-900">
                {formatCurrency(totals.tax)}
              </span>
            </div>
          )}
        </div>
        <div className="mt-2 flex items-center justify-between border-t border-gray-100 pt-2">
          <p className="text-sm text-gray-500">Order total</p>
          <p className="text-xl font-bold text-gray-900">
            {formatCurrency(totals.total)}
          </p>
        </div>
        {totals.amountPaid > 0 && (
          <div className="mt-1 flex items-center justify-between text-sm">
            <span className="text-gray-500">Balance due</span>
            <span className="font-semibold text-orange-700">
              {formatCurrency(totals.balanceDue)}
            </span>
          </div>
        )}
      </div>

      {order.notes && (
        <div className="rounded-2xl border border-gray-200 bg-white p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
            Notes
          </p>
          <p className="mt-2 text-sm text-gray-700">
            {order.notes}
          </p>
        </div>
      )}

      {order.status_history && order.status_history.length > 0 && (
        <div className="rounded-2xl border border-gray-200 bg-white p-4">
          <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-gray-500">
            <History size={13} /> History
          </p>
          <div className="space-y-1.5">
            {order.status_history.map((entry, index) => (
              <div
                key={index}
                className="flex justify-between text-xs text-gray-500"
              >
                <span className="capitalize">{entry.status}</span>
                <span>
                  {new Date(entry.changed_at).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
