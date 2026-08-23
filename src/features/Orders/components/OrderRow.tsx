import type { Order } from "../types/order";
import OrderStatus from "./OrderStatus";
import { formatCurrency, formatOrderNumber } from "../lib/receipt";

type Props = {
  order: Order;
  selected: boolean;
  isNew?: boolean;
  onClick: () => void;
  onToggleSelect: (checked: boolean) => void;
};

export default function OrderRow({
  order,
  selected,
  isNew,
  onClick,
  onToggleSelect,
}: Props) {
  const orderItems = order.order_items ?? [];

  const itemCount = orderItems.reduce(
    (total, item) => total + item.quantity,
    0
  );

  const total = orderItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const date = new Date(order.created_at);

  return (
    <tr
      className={`cursor-pointer border-b border-gray-100 transition hover:bg-orange-50/40 ${
        isNew ? "animate-[pulse_1.4s_ease-out_1]" : ""
      } ${selected ? "bg-orange-50/60" : ""}`}
    >
      <td
        className="px-4 py-4"
        onClick={(event) => event.stopPropagation()}
      >
        <input
          type="checkbox"
          checked={selected}
          onChange={(event) =>
            onToggleSelect(event.target.checked)
          }
          className="h-4 w-4 rounded border-gray-300 text-orange-600 focus:ring-orange-500"
        />
      </td>

      <td className="px-5 py-4" onClick={onClick}>
        <span className="font-semibold text-gray-900">
          #{formatOrderNumber(order)}
        </span>
      </td>

      <td className="px-5 py-4" onClick={onClick}>
        <div>
          <p className="font-medium text-gray-900">
            {order.customer_name}
          </p>

          <p className="text-xs text-gray-500">
            {order.customer_phone}
          </p>
        </div>
      </td>

      <td
        className="px-5 py-4 text-sm text-gray-600"
        onClick={onClick}
      >
        {itemCount}{" "}
        {itemCount === 1 ? "item" : "items"}
      </td>

      <td
        className="px-5 py-4 text-sm font-medium text-gray-900"
        onClick={onClick}
      >
        {formatCurrency(total)}
      </td>

      <td
        className="px-5 py-4 text-sm text-gray-600"
        onClick={onClick}
      >
        {date.toLocaleDateString()}
      </td>

      <td className="px-5 py-4" onClick={onClick}>
        <OrderStatus status={order.status} />
      </td>
    </tr>
  );
}
