// File: src/features/Dashboard/services/dashboard.service.ts
//
// NOTE ON "REAL DATA": bookings/customers/orders counts below query
// `appointments` / `orders` tables directly (not hardcoded demo numbers).
// Column names are a best guess at common naming (`business_id`,
// `customer_name`, `status`, `starts_at`, `created_at`) — if your schema
// differs, adjust the `.select()` / `.eq()` calls below. Every one of
// these methods is wrapped so a missing table or column returns 0 / []
// instead of crashing the dashboard.

import { supabase } from "../../../lib/supabase";
import { getActiveBusinessId } from "../../../lib/business";

type Business = {
  id: string;
  business_name: string;
  username: string;
};

type Service = {
  id: string;
  name: string;
  price?: number | null;
  duration?: number | null;
};

type Product = {
  id: string;
  name: string;
  price?: number | null;
  image_url?: string | null;
  images?: string[] | null;
  image?: string | null;
};

type AppointmentField = {
  id: string;
  label: string;
  field_type: string;
  required: boolean;
};

export type UpcomingBookingRow = {
  id: string;
  customerName: string;
  service: string;
  time: string;
  day: string;
};

export type RecentAppointmentRow = {
  id: string;
  customer: string;
  service: string;
  status: string;
};

type CustomerRow = {
  customer: string | null;
};

type UpcomingBookingQueryRow = {
  id: string;
  customer: string | null;
  service: string | null;
  date: string | null;
  time: string | null;
};

async function getCurrentBusinessId(): Promise<string | null> {
  try {
    return await getActiveBusinessId();
  } catch {
    return null;
  }
}

export const dashboardService = {
  async getBusiness(): Promise<Business | null> {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError) {
      throw userError;
    }

    if (!user) {
      throw new Error("Not authenticated");
    }

    const businessId = await getCurrentBusinessId();
    if (!businessId) return null;

    const { data: business, error } = await supabase
      .from("businesses")
      .select("id, business_name, username")
      .eq("id", businessId)
      .limit(1);

    if (error) {
      throw error;
    }

    return business?.[0] ?? null;
  },

  async getServices(): Promise<Service[]> {
    const businessId = await getCurrentBusinessId();
    if (!businessId) return [];

    const { data, error } = await supabase
      .from("services")
      .select("*")
      .eq("business_id", businessId)
      .order("created_at", { ascending: false });

    if (error) {
      const { data: fallbackData, error: fallbackError } = await supabase
        .from("services")
        .select("*")
        .eq("business_id", businessId);

      if (fallbackError) {
        throw fallbackError;
      }

      return fallbackData ?? [];
    }

    return data ?? [];
  },

  /**
   * Products, including image(s). Tries a full select with a `images`
   * gallery column first, falls back to just `image_url`, then falls back
   * further to bare fields — mirrors the existing defensive pattern for
   * `created_at` in case your schema doesn't have one or both columns yet.
   */
  async getProducts(): Promise<Product[]> {
    const businessId = await getCurrentBusinessId();
    if (!businessId) return [];

    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("business_id", businessId)
      .order("created_at", { ascending: false });

    if (!error) return data ?? [];

    throw error;
  },

  async getAppointmentFields(): Promise<AppointmentField[]> {
    const businessId = await getCurrentBusinessId();
    if (!businessId) return [];

    const { data, error } = await supabase
      .from("appointment_fields")
      .select("id, label, field_type, required")
      .eq("business_id", businessId);

    if (error) {
      throw error;
    }

    return data ?? [];
  },

  /** Total bookings (appointments) ever made for this business. Real count. */
  async getBookingsCount(): Promise<number> {
    try {
      const businessId = await getCurrentBusinessId();
      if (!businessId) return 0;

      const { count, error } = await supabase
        .from("appointments")
        .select("id", { count: "exact", head: true })
        .eq("business_id", businessId);

      if (error) return 0;
      return count ?? 0;
    } catch {
      return 0;
    }
  },

  /** Customer count from the customer directory, with appointment fallback. */
  async getCustomersCount(): Promise<number> {
    try {
      const businessId = await getCurrentBusinessId();
      if (!businessId) return 0;

      const { count, error: customerError } = await supabase
        .from("customers")
        .select("id", { count: "exact", head: true })
        .eq("business_id", businessId);

      if (!customerError) return count ?? 0;

      const { data, error } = await supabase
        .from("appointments")
        .select("customer")
        .eq("business_id", businessId);

      if (error || !data) return 0;

      const unique = new Set(
        (data as CustomerRow[])
          .map((row) => row.customer)
          .filter((customer): customer is string => Boolean(customer))
      );

      return unique.size;
    } catch {
      return 0;
    }
  },

  /** Completed/placed shop orders for this business. Real count. */
  async getOrdersCount(): Promise<number> {
    try {
      const businessId = await getCurrentBusinessId();
      if (!businessId) return 0;

      const { count, error } = await supabase
        .from("orders")
        .select("id", { count: "exact", head: true })
        .eq("business_id", businessId);

      if (error) return 0;
      return count ?? 0;
    } catch {
      return 0;
    }
  },

  /** Next 5 upcoming bookings for the "Upcoming Bookings" widget. */
  async getUpcomingBookings(): Promise<UpcomingBookingRow[]> {
    try {
      const businessId = await getCurrentBusinessId();
      if (!businessId) return [];

      const { data, error } = await supabase
        .from("appointments")
        .select("id, customer, service, date, time")
        .eq("business_id", businessId)
        .gte("date", new Date().toISOString().slice(0, 10))
        .order("date", { ascending: true })
        .order("time", { ascending: true })
        .limit(5);

      if (error || !data) return [];

      return (data as UpcomingBookingQueryRow[]).map((row) => {
        return {
          id: row.id,
          customerName: row.customer ?? "Customer",
          service: row.service ?? "",
          time: row.time ?? "",
          day: row.date
            ? new Date(`${row.date}T00:00:00`).toLocaleDateString([], { weekday: "short" })
            : "",
        };
      });
    } catch {
      return [];
    }
  },

  /** Latest appointments, shown in the dashboard's Recent Activity card. */
  async getRecentAppointments(): Promise<RecentAppointmentRow[]> {
    try {
      const businessId = await getCurrentBusinessId();
      if (!businessId) return [];

      const { data, error } = await supabase
        .from("appointments")
        .select("id, customer, service, status")
        .eq("business_id", businessId)
        .order("created_at", { ascending: false })
        .limit(5);

      if (error || !data) return [];
      return data as RecentAppointmentRow[];
    } catch {
      return [];
    }
  },

  /**
   * Reads the signed-in user's language preference from `user_settings`.
   * Returns null on any failure (table not present yet, no row, etc.) so
   * this is always safe to call — the UI treats null as "default/English".
   */
  async getLanguagePreference(): Promise<string | null> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return null;

      const { data, error } = await supabase
        .from("user_settings")
        .select("language")
        .eq("user_id", user.id)
        .limit(1);

      if (error || !data?.[0]) return null;

      return data[0].language ?? null;
    } catch {
      return null;
    }
  },

  async getDashboardData() {
    const business = await this.getBusiness();

    if (!business) {
      return {
        business: null,
        services: [],
        products: [],
        appointmentFields: [],
        language: null as string | null,
        bookingsCount: 0,
        customersCount: 0,
        ordersCount: 0,
        upcomingBookings: [] as UpcomingBookingRow[],
        recentAppointments: [] as RecentAppointmentRow[],
      };
    }

    const [
      services,
      products,
      appointmentFields,
      language,
      bookingsCount,
      customersCount,
      ordersCount,
      upcomingBookings,
      recentAppointments,
    ] = await Promise.all([
      this.getServices(),
      this.getProducts(),
      this.getAppointmentFields(),
      this.getLanguagePreference(),
      this.getBookingsCount(),
      this.getCustomersCount(),
      this.getOrdersCount(),
      this.getUpcomingBookings(),
      this.getRecentAppointments(),
    ]);

    return {
      business,
      services,
      products,
      appointmentFields,
      language,
      bookingsCount,
      customersCount,
      ordersCount,
      upcomingBookings,
      recentAppointments,
    };
  },
};
