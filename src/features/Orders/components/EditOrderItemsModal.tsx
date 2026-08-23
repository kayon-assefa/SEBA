import { useEffect, useMemo, useState } from "react";
import { Plus, Trash2, X } from "lucide-react";
import toast from "react-hot-toast";

import type { Order, ProductOption } from "../types/order";
import { orderService } from "../services/orders.service";

type Props = {
  order: Order | null;
  open: boolean;
  onClose: () => void;
  onSaved: (order: Order) => void;
};

type FormItem = {
  product_id: string;
  product_name: string;
  quantity: number;
  price: number;
};

export default function EditOrderItemsModal({
  order,
  open,
  onClose,
  onSaved,
}: Props) {
  const [products, setProducts] = useState<ProductOption[]>([]);
  const [items, setItems] = useState<FormItem[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open || !order) return;

    setItems(
      (order.order_items ?? []).map((item) => ({
        product_id: item.product_id ?? "",
        product_name: item.product_name,
        quantity: item.quantity,
        price: item.price,
      }))
    );

    orderService.getProducts().then(setProducts).catch(() => {});
  }, [open, order]);

  const total = useMemo(
    () =>
      items.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      ),
    [items]
  );

  function updateProduct(index: number, productId: string) {
    const product = products.find((p) => p.id === productId);
    if (!product) return;

    if (product.track_stock && product.in_stock === false) {
      toast.error(`${product.name} is out of stock`);
      return;
    }

    setItems((current) =>
      current.map((item, i) =>
        i === index
          ? {
              ...item,
              product_id: product.id,
              product_name: product.name,
              price: product.price,
            }
          : item
      )
    );
  }

  function updateQuantity(index: number, quantity: number) {
    setItems((current) =>
      current.map((item, i) =>
        i === index
          ? { ...item, quantity: Math.max(1, quantity) }
          : item
      )
    );
  }

  function removeItem(index: number) {
    setItems((current) => current.filter((_, i) => i !== index));
  }

  function addItem() {
    setItems((current) => [
      ...current,
      { product_id: "", product_name: "", quantity: 1, price: 0 },
    ]);
  }

  async function handleSave() {
    if (!order) return;

    const validItems = items.filter(
      (item) => item.product_id && item.quantity > 0
    );

    if (validItems.length === 0) {
      toast.error("An order needs at least one item.");
      return;
    }

    try {
      setSaving(true);
      const updated = await orderService.updateOrderItems(
        order.id,
        validItems
      );
      toast.success("Items updated");
      onSaved(updated);
      onClose();
    } catch (error) {
      console.error(error);
      toast.error("Failed to update items");
    } finally {
      setSaving(false);
    }
  }

  if (!open || !order) return null;

  return (
    <div className="fixed inset-0 z-120 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="flex max-h-[85vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl bg-[#FDF8F1] shadow-2xl">
        <div className="flex items-center justify-between border-b border-stone-200 bg-white px-6 py-4">
          <h2 className="text-lg font-bold text-gray-900">
            Edit Items
          </h2>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 space-y-2 overflow-y-auto px-6 py-5">
          {items.map((item, index) => {
            const product = products.find(
              (p) => p.id === item.product_id
            );
            const outOfStock =
              product?.track_stock && product.in_stock === false;

            return (
              <div key={index} className="flex items-center gap-2">
                <select
                  value={item.product_id}
                  onChange={(e) =>
                    updateProduct(index, e.target.value)
                  }
                  className={`flex-1 rounded-xl border px-3 py-2.5 text-sm outline-none ${
                    outOfStock
                      ? "border-gray-200 bg-gray-100 text-gray-400 grayscale"
                      : "border-gray-200 focus:border-orange-400"
                  }`}
                >
                  <option value="">Select product...</option>
                  {products.map((p) => {
                    const disabled =
                      p.track_stock && p.in_stock === false;
                    return (
                      <option
                        key={p.id}
                        value={p.id}
                        disabled={disabled}
                      >
                        {p.name}
                        {disabled ? " (out of stock)" : ""} —{" "}
                        {p.price} ETB
                      </option>
                    );
                  })}
                </select>

                <input
                  type="number"
                  min={1}
                  value={item.quantity}
                  onChange={(e) =>
                    updateQuantity(index, Number(e.target.value))
                  }
                  className="w-20 rounded-xl border border-gray-200 px-2 py-2.5 text-sm outline-none focus:border-orange-400"
                />

                <button
                  onClick={() => removeItem(index)}
                  className="rounded-lg p-2 text-gray-400 hover:bg-red-50 hover:text-red-600"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            );
          })}

          <button
            onClick={addItem}
            className="mt-2 inline-flex items-center gap-1.5 rounded-xl border border-dashed border-gray-300 px-3 py-2 text-sm font-medium text-gray-600 hover:border-orange-300 hover:text-orange-700"
          >
            <Plus size={14} />
            Add item
          </button>

          <div className="mt-4 flex items-center justify-between rounded-xl border border-orange-100 bg-orange-50 px-4 py-3">
            <span className="text-sm font-medium text-gray-600">
              New total
            </span>
            <span className="text-lg font-bold text-gray-900">
              {total.toLocaleString()} ETB
            </span>
          </div>
        </div>

        <div className="border-t border-stone-200 bg-white px-6 py-4">
          <button
            disabled={saving}
            onClick={handleSave}
            className="w-full rounded-xl bg-orange-600 px-4 py-3 font-semibold text-white hover:bg-orange-700 disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save changes"}
          </button>
        </div>
      </div>
    </div>
  );
}
