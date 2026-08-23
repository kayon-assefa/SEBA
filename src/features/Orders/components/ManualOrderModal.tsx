import { useEffect, useMemo, useState } from "react";
import { Plus, Trash2, X, RefreshCw, Send } from "lucide-react";
import toast from "react-hot-toast";

import type {
  CreateOrderItem,
  DeliveryType,
  Order,
  PaymentStatus,
  ProductOption,
} from "../types/order";

import { orderService } from "../services/orders.service";
import {
  getRecentCustomers,
  saveRecentCustomer,
  type RecentCustomer,
} from "../lib/receipt";

type Props = {
  open: boolean;
  onClose: () => void;
  onCreated: (order: Order) => void;
};

type FormItem = {
  product_id: string;
  product_name: string;
  quantity: number;
  price: number;
};

export default function ManualOrderModal({
  open,
  onClose,
  onCreated,
}: Props) {
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [paymentStatus, setPaymentStatus] =
    useState<PaymentStatus>("pending");

  const [deliveryType, setDeliveryType] =
    useState<DeliveryType>("pickup");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [estimatedReadyAt, setEstimatedReadyAt] = useState("");

  const [discount, setDiscount] = useState("0");
  const [tax, setTax] = useState("0");
  const [amountPaid, setAmountPaid] = useState("0");

  const [notifyTelegram, setNotifyTelegram] = useState(false);

  const [products, setProducts] = useState<ProductOption[]>([]);
  const [items, setItems] = useState<FormItem[]>([]);
  const [recentCustomers, setRecentCustomers] = useState<
    RecentCustomer[]
  >([]);

  const [loadingProducts, setLoadingProducts] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    loadProducts();
    setRecentCustomers(getRecentCustomers());
  }, [open]);

  async function loadProducts() {
    try {
      setLoadingProducts(true);
      const data = await orderService.getProducts();
      setProducts(data);

      if (data.length === 0) {
        toast.error(
          "No products found. Add products to your shop first."
        );
      }
    } catch (error) {
      console.error("Products load error:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Could not load products."
      );
    } finally {
      setLoadingProducts(false);
    }
  }

  function addItem() {
    setItems((current) => [
      ...current,
      { product_id: "", product_name: "", quantity: 1, price: 0 },
    ]);
  }

  function removeItem(index: number) {
    setItems((current) => current.filter((_, i) => i !== index));
  }

  function updateItemProduct(index: number, productId: string) {
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

  function updateItemQuantity(index: number, quantity: number) {
    setItems((current) =>
      current.map((item, i) =>
        i === index
          ? { ...item, quantity: Math.max(1, quantity) }
          : item
      )
    );
  }

  function selectRecentCustomer(customer: RecentCustomer) {
    setCustomerName(customer.name);
    setCustomerPhone(customer.phone);
    if (customer.address) {
      setDeliveryAddress(customer.address);
    }
  }

  const subtotal = useMemo(
    () =>
      items.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      ),
    [items]
  );

  const total = Math.max(
    0,
    subtotal - Number(discount || 0) + Number(tax || 0)
  );

  function resetForm() {
    setCustomerName("");
    setCustomerPhone("");
    setNotes("");
    setPaymentStatus("pending");
    setDeliveryType("pickup");
    setDeliveryAddress("");
    setEstimatedReadyAt("");
    setDiscount("0");
    setTax("0");
    setAmountPaid("0");
    setNotifyTelegram(false);
    setItems([]);
  }

  async function handleSubmit() {
    if (!customerName.trim() || !customerPhone.trim()) {
      toast.error("Customer name and phone are required.");
      return;
    }

    const validItems = items.filter(
      (item) => item.product_id && item.quantity > 0
    );

    if (validItems.length === 0) {
      toast.error("Add at least one product.");
      return;
    }

    const outOfStockItem = validItems.find((item) => {
      const product = products.find(
        (p) => p.id === item.product_id
      );
      return product?.track_stock && product.in_stock === false;
    });

    if (outOfStockItem) {
      toast.error(
        `${outOfStockItem.product_name} is out of stock.`
      );
      return;
    }

    if (deliveryType === "delivery" && !deliveryAddress.trim()) {
      toast.error("Add a delivery address.");
      return;
    }

    try {
      setSaving(true);

      const payload: CreateOrderItem[] = validItems.map(
        (item) => ({
          product_id: item.product_id,
          product_name: item.product_name,
          quantity: item.quantity,
          price: item.price,
        })
      );

      const order = await orderService.createOrder({
        customer_name: customerName,
        customer_phone: customerPhone,
        payment_status: paymentStatus,
        notes: notes || undefined,
        delivery_type: deliveryType,
        delivery_address:
          deliveryType === "delivery"
            ? deliveryAddress
            : undefined,
        estimated_ready_at: estimatedReadyAt || null,
        discount: Number(discount || 0),
        tax: Number(tax || 0),
        amount_paid: Number(amountPaid || 0),
        items: payload,
      });

      saveRecentCustomer({
        name: customerName,
        phone: customerPhone,
        address: deliveryAddress || undefined,
      });

      toast.success("Order created");
      onCreated(order);
      resetForm();
      onClose();
    } catch (error) {
      console.error("Create order error:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to create order."
      );
    } finally {
      setSaving(false);
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-[#FDF8F1] shadow-2xl">
        <div className="flex items-center justify-between border-b border-stone-200 bg-white px-6 py-4">
          <h2 className="text-lg font-bold text-gray-900">
            New Order
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 space-y-5 overflow-y-auto px-6 py-5">
          {/* Recent customers */}
          {recentCustomers.length > 0 && (
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
                Recent customers
              </p>
              <div className="flex flex-wrap gap-2">
                {recentCustomers.map((customer) => (
                  <button
                    key={customer.phone}
                    type="button"
                    onClick={() =>
                      selectRecentCustomer(customer)
                    }
                    className="rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:border-orange-300 hover:bg-orange-50"
                  >
                    {customer.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Customer */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Customer name
              </label>
              <input
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full rounded-xl border border-gray-200 px-3 py-2.5 outline-none focus:border-orange-400"
                placeholder="Jane Doe"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Phone
              </label>
              <input
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                className="w-full rounded-xl border border-gray-200 px-3 py-2.5 outline-none focus:border-orange-400"
                placeholder="+251..."
              />
            </div>
          </div>

          {/* Delivery */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Fulfillment
            </label>
            <div className="mb-2 inline-flex rounded-xl border border-gray-200 bg-white p-1">
              {(["pickup", "delivery"] as DeliveryType[]).map(
                (type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setDeliveryType(type)}
                    className={`rounded-lg px-4 py-1.5 text-sm font-medium capitalize transition ${
                      deliveryType === type
                        ? "bg-orange-600 text-white"
                        : "text-gray-500"
                    }`}
                  >
                    {type}
                  </button>
                )
              )}
            </div>

            {deliveryType === "delivery" && (
              <input
                value={deliveryAddress}
                onChange={(e) =>
                  setDeliveryAddress(e.target.value)
                }
                placeholder="Delivery address"
                className="w-full rounded-xl border border-gray-200 px-3 py-2.5 outline-none focus:border-orange-400"
              />
            )}

            <input
              type="datetime-local"
              value={estimatedReadyAt}
              onChange={(e) =>
                setEstimatedReadyAt(e.target.value)
              }
              className="mt-2 w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-orange-400"
            />
          </div>

          {/* Items */}
          <div>
            <div className="mb-2 flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700">
                Items
              </label>
              <button
                type="button"
                onClick={loadProducts}
                className="inline-flex items-center gap-1 text-xs font-medium text-gray-400 hover:text-gray-600"
              >
                <RefreshCw
                  size={12}
                  className={
                    loadingProducts ? "animate-spin" : ""
                  }
                />
                Refresh
              </button>
            </div>

            <div className="space-y-2">
              {items.map((item, index) => {
                const product = products.find(
                  (p) => p.id === item.product_id
                );
                const outOfStock =
                  product?.track_stock &&
                  product.in_stock === false;

                return (
                  <div
                    key={index}
                    className="flex items-center gap-2"
                  >
                    <select
                      value={item.product_id}
                      onChange={(e) =>
                        updateItemProduct(
                          index,
                          e.target.value
                        )
                      }
                      className={`flex-1 rounded-xl border px-3 py-2.5 text-sm outline-none ${
                        outOfStock
                          ? "border-gray-200 bg-gray-100 text-gray-400 grayscale"
                          : "border-gray-200 focus:border-orange-400"
                      }`}
                    >
                      <option value="">
                        Select product...
                      </option>
                      {products.map((p) => {
                        const disabled =
                          p.track_stock &&
                          p.in_stock === false;

                        return (
                          <option
                            key={p.id}
                            value={p.id}
                            disabled={disabled}
                            className={
                              disabled ? "text-gray-400" : ""
                            }
                          >
                            {p.name}
                            {disabled
                              ? " (out of stock)"
                              : ""}{" "}
                            — {p.price} ETB
                          </option>
                        );
                      })}
                    </select>

                    <input
                      type="number"
                      min={1}
                      value={item.quantity}
                      onChange={(e) =>
                        updateItemQuantity(
                          index,
                          Number(e.target.value)
                        )
                      }
                      disabled={outOfStock}
                      className="w-20 rounded-xl border border-gray-200 px-2 py-2.5 text-sm outline-none focus:border-orange-400 disabled:bg-gray-100"
                    />

                    <button
                      type="button"
                      onClick={() => removeItem(index)}
                      className="rounded-lg p-2 text-gray-400 hover:bg-red-50 hover:text-red-600"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                );
              })}
            </div>

            <button
              type="button"
              onClick={addItem}
              className="mt-2 inline-flex items-center gap-1.5 rounded-xl border border-dashed border-gray-300 px-3 py-2 text-sm font-medium text-gray-600 hover:border-orange-300 hover:text-orange-700"
            >
              <Plus size={14} />
              Add item
            </button>
          </div>

          {/* Money */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Discount
              </label>
              <input
                type="number"
                min={0}
                value={discount}
                onChange={(e) => setDiscount(e.target.value)}
                className="w-full rounded-xl border border-gray-200 px-3 py-2.5 outline-none focus:border-orange-400"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Tax
              </label>
              <input
                type="number"
                min={0}
                value={tax}
                onChange={(e) => setTax(e.target.value)}
                className="w-full rounded-xl border border-gray-200 px-3 py-2.5 outline-none focus:border-orange-400"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Amount paid
              </label>
              <input
                type="number"
                min={0}
                value={amountPaid}
                onChange={(e) => setAmountPaid(e.target.value)}
                className="w-full rounded-xl border border-gray-200 px-3 py-2.5 outline-none focus:border-orange-400"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Payment status
            </label>
            <select
              value={paymentStatus}
              onChange={(e) =>
                setPaymentStatus(e.target.value as PaymentStatus)
              }
              className="w-full rounded-xl border border-gray-200 px-3 py-2.5 outline-none focus:border-orange-400"
            >
              <option value="pending">Pending</option>
              <option value="paid">Paid</option>
              <option value="failed">Failed</option>
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              className="w-full rounded-xl border border-gray-200 px-3 py-2.5 outline-none focus:border-orange-400"
              placeholder="Optional notes about this order..."
            />
          </div>

          {/* Telegram notify — placeholder, wired up later */}
          <label className="flex items-center justify-between rounded-xl border border-gray-200 bg-white px-4 py-3">
            <span className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <Send size={15} className="text-[#229ED9]" />
              Notify customer on Telegram
              <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-500">
                Coming soon
              </span>
            </span>
            <input
              type="checkbox"
              checked={notifyTelegram}
              onChange={(e) =>
                setNotifyTelegram(e.target.checked)
              }
              disabled
              className="h-4 w-4 rounded border-gray-300 text-orange-600 opacity-50"
            />
          </label>

          <div className="flex items-center justify-between rounded-xl border border-orange-100 bg-orange-50 px-4 py-3">
            <span className="text-sm font-medium text-gray-600">
              Order total
            </span>
            <span className="text-lg font-bold text-gray-900">
              {total.toLocaleString()} ETB
            </span>
          </div>
        </div>

        <div className="border-t border-stone-200 bg-white px-6 py-4">
          <button
            type="button"
            disabled={saving}
            onClick={handleSubmit}
            className="w-full rounded-xl bg-orange-600 px-4 py-3 font-semibold text-white transition hover:bg-orange-700 disabled:opacity-50"
          >
            {saving ? "Creating order..." : "Create Order"}
          </button>
        </div>
      </div>
    </div>
  );
}
