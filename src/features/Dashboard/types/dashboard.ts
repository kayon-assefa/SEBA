export interface DashboardStats {
  todayAppointments: number;
  pendingAppointments: number;
  pendingOrders: number;
  customers: number;
  products: number;
  reviews: number;
  revenue: number;
  businessLive: boolean;
}

export interface Activity {
  id: string;
  title: string;
  description: string;
  time: string;
}

export interface BusinessStatus {
  businessName: string;
  username: string;
  isLive: boolean;
}

/** Signed-in user's language preference, read from `user_settings.language`. */
export type LanguagePreference = string | null;
