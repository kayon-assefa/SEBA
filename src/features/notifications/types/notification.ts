// src/features/Notifications/types/notification.ts

export type NotificationCategory =
  | "order"
  | "appointment"
  | "customer"
  | "auth"
  | "system";

export type NotificationSeverity = "info" | "warning" | "success";

export interface AppNotification {
  id: string;
  business_id: string;

  category: NotificationCategory;
  severity: NotificationSeverity;

  title: string;
  body: string;

  // Where clicking the notification should take you, e.g. "/orders?id=..."
  link: string | null;

  // Loose reference to the source row (order id, appointment id, customer id...)
  entity_type: string | null;
  entity_id: string | null;

  read: boolean;
  read_at: string | null;

  created_at: string;
}

export type NotificationFilter =
  | "all"
  | "unread"
  | "order"
  | "appointment"
  | "customer"
  | "auth";

// Per-user notification preferences (mute categories, quiet hours, sound).
export interface NotificationSettings {
  user_id: string;
  business_id: string;

  categories_enabled: Record<NotificationCategory, boolean>;

  push_enabled: boolean;
  sound_enabled: boolean;

  quiet_hours_enabled: boolean;
  quiet_hours_start: string; // "21:00"
  quiet_hours_end: string; // "08:00"

  // Instead of one push per unpaid customer, batch into one digest/day.
  unpaid_digest_enabled: boolean;

  updated_at: string | null;
}

export const DEFAULT_NOTIFICATION_SETTINGS: Omit<
  NotificationSettings,
  "user_id" | "business_id" | "updated_at"
> = {
  categories_enabled: {
    order: true,
    appointment: true,
    customer: true,
    auth: true,
    system: true,
  },
  push_enabled: false,
  sound_enabled: true,
  quiet_hours_enabled: false,
  quiet_hours_start: "21:00",
  quiet_hours_end: "08:00",
  unpaid_digest_enabled: true,
};

export interface PushSubscriptionRow {
  id: string;
  business_id: string;
  user_id: string;
  endpoint: string;
  p256dh: string;
  auth: string;
  created_at: string;
}
