export type BusinessSettings = {
  business_id: string;

  business_phone: string | null;
  business_email: string | null;

  city: string | null;
  address: string | null;

  latitude: number | null;
  longitude: number | null;

  is_published: boolean;
  is_temporarily_closed: boolean;

  temporary_close_reason: string | null;
  temporary_close_until: string | null;

  created_at?: string;
  updated_at?: string;
};

export type BusinessSettingsUpdate = Partial<
  Omit<BusinessSettings, "business_id" | "created_at" | "updated_at">
>;

export type BusinessStatus = "published" | "temporarily_closed";

export type BusinessLocation = {
  city: string;
  address: string;
  latitude: number | null;
  longitude: number | null;
};

export type BusinessContact = {
  phone: string;
  email: string;
};
