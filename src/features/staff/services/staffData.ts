import { supabase } from "../../../lib/supabase";
import type {
  Appointment, Order, Customer, StaffNotification, StaffShift, TimeOffRequest, NotificationPrefs,
} from "../types";

/* ------------------------------- Staff / session ------------------------------- */

export async function getCurrentStaff() {
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError) throw authError;
  if (!user) throw new Error("Not authenticated.");

  const { data, error } = await supabase
    .from("business_staff")
    .select("id,user_id,business_id,full_name,email,role,is_active,language")
    .eq("user_id", user.id)
    .eq("is_active", true)
    .maybeSingle();

  if (error) throw error;
  if (!data) throw new Error("No active staff account found for this login.");
  return data;
}

/** Persists the staff member's language choice server-side so it follows them across devices. */
export async function updateStaffLanguage(staffId: string, language: string) {
  const { error } = await supabase.from("business_staff").update({ language }).eq("id", staffId);
  if (error) throw error; // non-fatal for the caller — language still works locally via localStorage
}

export async function updateStaffProfile(staffId: string, patch: { full_name?: string }) {
  const { error } = await supabase.from("business_staff").update(patch).eq("id", staffId);
  if (error) throw error;
}

export async function changePassword(newPassword: string) {
  const { error } = await supabase.auth.updateUser({ password: newPassword });
  if (error) throw error;
}

/* --------------------------------- Appointments --------------------------------- */

export async function getAppointments(businessId: string): Promise<Appointment[]> {
  const { data, error } = await supabase
    .from("appointments").select("*")
    .eq("business_id", businessId)
    .order("date", { ascending: true }).order("time", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function updateAppointment(id: string, patch: Partial<Appointment>) {
  const { error } = await supabase.from("appointments").update(patch).eq("id", id);
  if (error) throw error;
}

export async function bulkUpdateAppointments(ids: string[], patch: Partial<Appointment>) {
  const { error } = await supabase.from("appointments").update(patch).in("id", ids);
  if (error) throw error;
}

/** Returns true if moving `appointmentId` to date/time would collide with another appointment. */
export function hasConflict(appointments: Appointment[], appointmentId: string, date: string, time: string) {
  return appointments.some(a => a.id !== appointmentId && a.date === date && a.time === time);
}

export async function createAppointment(businessId: string, input: {
  customer: string; phone?: string; serviceId: string; serviceName: string; staffId: string; staffName: string; date: string; time: string;
}) {
  // Written to match the exact pattern the owner app uses (see
  // features/appointments/services/appointment.service.ts `toRow()`):
  // both the array field AND the legacy singular field get set together,
  // so nothing the owner app reads ever comes up empty.
  const { data, error } = await supabase.from("appointments").insert({
    business_id: businessId,
    customer: input.customer,
    phone: input.phone || null,
    services: [input.serviceName],
    service: input.serviceName,
    staff_members: [input.staffName],
    staff: input.staffName,
    date: input.date,
    time: input.time,
    status: "Pending",
    payment_status: "Unpaid",
  }).select().single();
  if (error) throw error;
  return data;
}

/* ------------------------------- Bookable resources ------------------------------- */
// NOTE: `staff` (bookable staff members, e.g. "Selam", "Dawit") is a different
// table from `business_staff` (staff LOGIN accounts, i.e. who can sign into
// this app). A bookable staff member doesn't need a login, and a login
// doesn't need to be a bookable staff member. Appointments reference the
// bookable one.
export type BookableStaff = { id: string; name: string; role?: string | null; active: boolean };
export type BookableService = { id: string; name: string; price?: number | null; duration?: number | null; active: boolean };
export type BookableProduct = { id: string; name: string; price?: number | null };

export async function getBookableStaff(businessId: string): Promise<BookableStaff[]> {
  const { data, error } = await supabase.from("staff").select("*").eq("business_id", businessId);
  if (error) {
    // Older deployments may not have the separate public roster table yet.
    const missingRosterTable = error.code === "42P01" || error.code === "PGRST205"
      || /relation .*staff.* does not exist|could not find the table .*staff/i.test(error.message);
    if (!missingRosterTable) throw error;
    const { data: loginStaff, error: loginError } = await supabase
      .from("business_staff")
      .select("id,full_name,role,is_active")
      .eq("business_id", businessId)
      .eq("is_active", true);
    if (loginError) throw loginError;
    return (loginStaff ?? []).map((r: any) => ({
      id: String(r.id), name: String(r.full_name ?? "Staff member"),
      role: r.role ?? null, active: true,
    }));
  }
  return (data ?? [])
    .map((r: any) => ({
      id: String(r.id), name: String(r.name ?? r.full_name ?? "Staff member"),
      role: r.role ?? r.position ?? null, active: r.active !== false && r.is_active !== false,
    }))
    .filter(s => s.active);
}

export async function getBookableServices(businessId: string): Promise<BookableService[]> {
  const { data, error } = await supabase.from("services").select("*").eq("business_id", businessId);
  if (error) throw error;
  return (data ?? [])
    .map((r: any) => ({
      id: String(r.id), name: String(r.name ?? "Service"), price: r.price ?? null, duration: r.duration ?? null,
      active: r.available !== false && r.active !== false,
    }))
    .filter(s => s.active);
}

export async function getOrderableProducts(businessId: string): Promise<BookableProduct[]> {
  const { data, error } = await supabase.from("products").select("*").eq("business_id", businessId).eq("is_archived", false);
  if (error) throw error;
  return (data ?? []).map((r: any) => ({ id: String(r.id), name: String(r.name ?? "Product"), price: r.price ?? null }));
}

/** Prefix-matches an already-loaded customer list for a phone-number autosuggest —
 *  no extra round trip needed since the Customers page already has this list loaded. */
export function suggestCustomersByPhone(customers: Customer[], query: string) {
  const q = query.replace(/\s+/g, "");
  if (!q) return [];
  return customers.filter(c => c.phone && c.phone.replace(/\s+/g, "").includes(q)).slice(0, 6);
}

/** Turns a raw Postgres/PostgREST error into something a staff member (not a
 *  developer) can act on, instead of a bare "violates constraint" string. */
export function friendlyDbError(e: any, fallback: string): string {
  const msg: string = e?.message || "";
  if (/row-level security/i.test(msg)) {
    return "Your account doesn't have permission to do this yet. Ask the business owner to run the latest SQL migration (see README) — it grants staff accounts access to this action.";
  }
  if (/violates not-null constraint/i.test(msg)) {
    const col = /column "([^"]+)"/.exec(msg)?.[1];
    return col ? `Please fill in "${col}" before saving.` : fallback;
  }
  if (/violates foreign key constraint/i.test(msg)) {
    return "That reference no longer exists (it may have been deleted). Please refresh and try again.";
  }
  return msg || fallback;
}



export async function getOrders(businessId: string): Promise<Order[]> {
  const { data, error } = await supabase
    .from("orders").select("*")
    .eq("business_id", businessId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function updateOrder(id: string, patch: Partial<Order>) {
  const { error } = await supabase.from("orders").update(patch).eq("id", id);
  if (error) throw error;
}

export async function createOrder(businessId: string, input: {
  customer_name: string; customer_phone?: string; items: { name: string; qty: number; price: number }[];
}) {
  const total = input.items.reduce((sum, it) => sum + it.qty * it.price, 0);
  const { data, error } = await supabase.from("orders").insert({
    business_id: businessId,
    customer_name: input.customer_name,
    customer_phone: input.customer_phone || null,
    items: input.items,
    total_amount: total,
    status: "pending",
    payment_status: "pending",
  }).select().single();
  if (error) throw error;
  return data;
}

/* ----------------------------------- Customers ----------------------------------- */

export async function getCustomers(businessId: string): Promise<Customer[]> {
  const { data, error } = await supabase
    .from("customers").select("id,business_id,name,phone").eq("business_id", businessId);
  if (error) throw error;
  return (data ?? []) as Customer[];
}

export async function updateCustomer(id: string, patch: Partial<Customer>) {
  const { error } = await supabase.from("customers").update(patch).eq("id", id);
  if (error) throw error;
}

/** No email field — SEBA is phone-first. `email` is intentionally not accepted here. */
export async function createCustomer(businessId: string, input: { name: string; phone?: string; notes?: string }) {
  const { data, error } = await supabase.from("customers").insert({
    business_id: businessId, name: input.name, phone: input.phone || null, notes: input.notes || null,
  }).select().single();
  if (error) throw error;
  return data;
}

/* --------------------------------- Notifications --------------------------------- */

export async function getNotifications(businessId: string, staffId: string): Promise<StaffNotification[]> {
  const { data, error } = await supabase
    .from("staff_notifications").select("*")
    .eq("business_id", businessId)
    .or(`staff_id.eq.${staffId},staff_id.is.null`)
    .order("created_at", { ascending: false })
    .limit(50);
  if (error) throw error;
  return data ?? [];
}

export async function markNotificationRead(id: string) {
  const { error } = await supabase.from("staff_notifications").update({ is_read: true }).eq("id", id);
  if (error) throw error;
}

export async function markAllNotificationsRead(businessId: string, staffId: string) {
  const { error } = await supabase
    .from("staff_notifications").update({ is_read: true })
    .eq("business_id", businessId)
    .or(`staff_id.eq.${staffId},staff_id.is.null`)
    .eq("is_read", false);
  if (error) throw error;
}

export async function getNotificationPrefs(staffId: string): Promise<NotificationPrefs | null> {
  const { data, error } = await supabase
    .from("staff_notification_prefs").select("staff_id,sms_enabled,push_enabled").eq("staff_id", staffId).maybeSingle();
  if (error) throw error;
  return data;
}

export async function saveNotificationPrefs(staffId: string, businessId: string, prefs: Partial<NotificationPrefs>) {
  const { error } = await supabase
    .from("staff_notification_prefs")
    .upsert({ staff_id: staffId, business_id: businessId, ...prefs }, { onConflict: "staff_id" });
  if (error) throw error;
}

/** Store a browser push subscription so a server-side job can send real push notifications later. */
export async function savePushSubscription(staffId: string, businessId: string, subscription: PushSubscriptionJSON) {
  const { error } = await supabase.from("push_subscriptions").upsert({
    staff_id: staffId,
    business_id: businessId,
    endpoint: subscription.endpoint,
    subscription,
  }, { onConflict: "endpoint" });
  if (error) throw error;
}

/* ----------------------------------- Schedule ----------------------------------- */

export async function getShifts(businessId: string): Promise<StaffShift[]> {
  const { data, error } = await supabase
    .from("staff_shifts").select("*")
    .eq("business_id", businessId)
    .order("date", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function getTimeOffRequests(businessId: string, staffId: string): Promise<TimeOffRequest[]> {
  const { data, error } = await supabase
    .from("staff_time_off").select("*")
    .eq("business_id", businessId).eq("staff_id", staffId)
    .order("start_date", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function requestTimeOff(businessId: string, staffId: string, req: { start_date: string; end_date: string; reason?: string }) {
  const { error } = await supabase.from("staff_time_off").insert({
    business_id: businessId, staff_id: staffId, status: "pending", ...req,
  });
  if (error) throw error;
}
