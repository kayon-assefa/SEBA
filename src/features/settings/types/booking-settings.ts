export type BookingSettings = {
  business_id: string;

  allow_rescheduling: boolean;

  default_duration_minutes: number;
  buffer_minutes: number;

  maximum_daily_appointments: number | null;

  auto_confirm: boolean;

  confirmation_message: string | null;
  cancellation_message: string | null;
  reminder_message: string | null;
  completion_message: string | null;

  require_customer_name: boolean;
  require_customer_phone: boolean;
  require_customer_email: boolean;
  require_customer_notes: boolean;

  created_at?: string;
  updated_at?: string;

  [key: string]: unknown;
};

export type BookingSettingsUpdate =
  Partial<
    Omit<
      BookingSettings,
      "business_id" | "created_at" | "updated_at"
    >
  >;

export type BookingConfirmationMode =
  | "automatic"
  | "manual";

export type BookingCustomerFields = {
  name: boolean;
  phone: boolean;
  email: boolean;
  notes: boolean;
};