export type NotificationChannel =
  | "email"
  | "push"
  | "sms";

export type NotificationCategory =
  | "appointments"
  | "orders"
  | "customers"
  | "products"
  | "subscription";

export type NotificationEvent =
  | "new_appointment"
  | "appointment_confirmation"
  | "appointment_cancellation"
  | "appointment_rescheduling"
  | "appointment_reminder"
  | "appointment_no_show"
  | "new_order"
  | "order_confirmed"
  | "order_cancelled"
  | "order_ready"
  | "order_completed"
  | "new_customer"
  | "new_review"
  | "low_stock"
  | "out_of_stock"
  | "trial_ending"
  | "payment_due"
  | "subscription_expired";

export type NotificationSetting = {
  event: NotificationEvent;

  email: boolean;
  push: boolean;
  sms: boolean;
};

export type NotificationSettings = {
  business_id: string;

  [key: string]: unknown;
};

export type NotificationSettingsUpdate =
  Record<string, unknown>;