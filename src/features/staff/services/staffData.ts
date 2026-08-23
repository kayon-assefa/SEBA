import { supabase } from "../../../lib/supabase";

export async function getCurrentStaff() {
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError) throw authError;
  if (!user) throw new Error("Not authenticated.");

  const { data, error } = await supabase
    .from("business_staff")
    .select("id,user_id,business_id,full_name,email,role,is_active")
    .eq("user_id", user.id)
    .eq("is_active", true)
    .maybeSingle();

  if (error) throw error;
  if (!data) throw new Error("No active staff account found for this login.");
  return data;
}

export async function getAppointments(businessId: string) {
  const { data, error } = await supabase
    .from("appointments")
    .select("*")
    .eq("business_id", businessId)
    .order("date", { ascending: true })
    .order("time", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function getOrders(businessId: string) {
  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .eq("business_id", businessId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function getCustomers(businessId: string) {
  const { data, error } = await supabase
    .from("customers")
    .select("*")
    .eq("business_id", businessId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}
