export type Staff = {
  id: string;
  user_id: string;
  business_id: string;
  full_name: string;
  email: string; // staff login identifier only — never shown/used for customers
  role: string;
  is_active: boolean;
  language?: string | null;
};

/**
 * These enums are intentionally an exact, case-sensitive match of the values
 * written by the owner-facing app (features/appointments/types/appointment.ts
 * and features/Orders/types/order.ts). Staff and owner MUST agree on these
 * strings — that mismatch was the root cause of statuses that looked
 * "invisible" or didn't update as expected.
 */
export type AppointmentStatus = "Pending" | "Confirmed" | "Completed" | "Cancelled" | "No-show" | "Waitlisted";
export type AppointmentPaymentStatus = "Unpaid" | "Deposit" | "Paid";

export type Appointment = {
  id: string;
  business_id: string;
  customer: string;
  customer_id?: string | null;
  /** Real column name is `phone` (NOT `customer_phone`) — matches the owner app's schema. */
  phone?: string | null;
  service: string;
  services?: string[] | null;
  staff?: string | null;
  staff_members?: string[] | null;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  duration?: number | null;
  end_time?: string | null;
  status: AppointmentStatus | string;
  payment_status?: AppointmentPaymentStatus | string | null;
  deposit_amount?: number | null;
  price?: number | null;
  notes?: string | null;
  is_recurring?: boolean | null;
  qr_code?: string | null;
  created_at?: string;
};

export type OrderStatus = "pending" | "confirmed" | "processing" | "ready" | "completed" | "cancelled";
export type PaymentStatus = "pending" | "paid" | "failed" | "refunded";

export type OrderItem = { name: string; qty: number; price: number };

export type Order = {
  id: string;
  business_id: string;
  order_number?: string | null;
  customer_name?: string | null;
  customer_phone?: string | null;
  status: OrderStatus | string;
  payment_status: PaymentStatus | string;
  items?: OrderItem[] | null;
  total_amount?: number | null;
  notes?: string | null;
  qr_code?: string | null;
  created_at: string;
};

export type Customer = {
  id: string;
  business_id: string;
  name: string;
  phone?: string | null;
  /** Kept only so old rows/columns don't break — never shown or collected in the staff UI. */
  email?: string | null;
  tags?: string[] | null;
  notes?: string | null;
  created_at?: string;
};

export type StaffNotification = {
  id: string;
  business_id: string;
  staff_id: string | null; // null = broadcast to whole business
  title: string;
  body: string;
  type: "appointment" | "order" | "system" | "reminder";
  is_read: boolean;
  created_at: string;
  link?: string | null;
};

export type StaffShift = {
  id: string;
  business_id: string;
  staff_id: string;
  date: string;
  start_time: string;
  end_time: string;
  note?: string | null;
};

export type TimeOffRequest = {
  id: string;
  business_id: string;
  staff_id: string;
  start_date: string;
  end_date: string;
  reason?: string | null;
  status: "pending" | "approved" | "denied";
};

/** Email intentionally removed — SEBA staff notifications are SMS/push/in-app only. */
export type NotificationPrefs = {
  staff_id: string;
  sms_enabled: boolean;
  push_enabled: boolean;
};

export type ScanResult =
  | { kind: "appointment"; record: Appointment }
  | { kind: "order"; record: Order }
  | { kind: "not_found"; raw: string };

export type LanguageCode = "en" | "am" | "ti" | "om";
