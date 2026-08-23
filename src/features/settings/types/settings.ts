export type SettingsSection =
  | "general"
  | "business"
  | "booking"
  | "shop"
  | "page"
  | "staff"
  | "notifications"
  | "subscription"
  | "integrations"
  | "security"
  | "data"
  | "branches"
  | "danger";

export type SettingsTab = {
  id: SettingsSection;
  label: string;
  description?: string;
  href?: string;
};

export type SettingsRecord = {
  id?: string;
  business_id?: string;
  created_at?: string;
  updated_at?: string;
};

export type SettingSaveResult<T> = {
  data: T | null;
  error: Error | null;
};