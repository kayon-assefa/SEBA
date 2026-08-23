import type { Order } from "../types/order";

/**
 * Builds the public receipt URL that gets encoded into the order's QR code.
 * Format: https://seba.com/{businessSlug}/order/{orderId}
 *
 * Point this at wherever your public order-lookup route actually lives.
 * If you don't have a public receipt page yet, this URL is still safe to
 * print — build the page whenever you're ready and it'll start working.
 */
export function buildReceiptUrl(
  businessSlug: string,
  orderId: string
): string {
  const slug = (businessSlug || "shop")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return `https://seba.com/${slug}/order/${orderId}`;
}

export function formatOrderNumber(order: Order): string {
  return order.order_number ?? order.id.slice(0, 8).toUpperCase();
}

export function formatCurrency(amount: number): string {
  return `${amount.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} ETB`;
}

export function calculateOrderTotals(order: Order) {
  const items = order.order_items ?? [];

  const subtotal = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const discount = Number(order.discount ?? 0);
  const tax = Number(order.tax ?? 0);
  const total = Math.max(0, subtotal - discount + tax);
  const amountPaid = Number(order.amount_paid ?? 0);
  const balanceDue = Math.max(0, total - amountPaid);

  return { subtotal, discount, tax, total, amountPaid, balanceDue };
}

const RECENT_CUSTOMERS_KEY = "seba_recent_customers";
const MAX_RECENT_CUSTOMERS = 8;

export type RecentCustomer = {
  name: string;
  phone: string;
  address?: string;
};

export function getRecentCustomers(): RecentCustomer[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = window.localStorage.getItem(
      RECENT_CUSTOMERS_KEY
    );
    return raw ? (JSON.parse(raw) as RecentCustomer[]) : [];
  } catch {
    return [];
  }
}

export function saveRecentCustomer(
  customer: RecentCustomer
) {
  if (typeof window === "undefined") return;

  try {
    const current = getRecentCustomers().filter(
      (entry) => entry.phone !== customer.phone
    );

    const next = [customer, ...current].slice(
      0,
      MAX_RECENT_CUSTOMERS
    );

    window.localStorage.setItem(
      RECENT_CUSTOMERS_KEY,
      JSON.stringify(next)
    );
  } catch {
    // localStorage unavailable — silently skip, not critical
  }
}

const FILTER_PRESETS_KEY = "seba_order_filter_presets";

export type FilterPreset = {
  name: string;
  status: string;
  paymentStatus: string;
  dateFilter: string;
  sort: string;
};

export function getFilterPresets(): FilterPreset[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = window.localStorage.getItem(
      FILTER_PRESETS_KEY
    );
    return raw ? (JSON.parse(raw) as FilterPreset[]) : [];
  } catch {
    return [];
  }
}

export function saveFilterPreset(preset: FilterPreset) {
  if (typeof window === "undefined") return;

  try {
    const current = getFilterPresets().filter(
      (entry) => entry.name !== preset.name
    );

    window.localStorage.setItem(
      FILTER_PRESETS_KEY,
      JSON.stringify([...current, preset])
    );
  } catch {
    // ignore
  }
}
