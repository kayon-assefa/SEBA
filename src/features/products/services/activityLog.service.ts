import { supabase } from "../../../lib/supabase";
import type { ActivityLogEntry } from "../types/catalog";

export async function logActivity(
  productId: string,
  businessId: string,
  action: ActivityLogEntry["action"],
  details: Record<string, unknown>
): Promise<void> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  await supabase.from("product_activity_log").insert({
    product_id: productId,
    business_id: businessId,
    action,
    actor_id: user?.id ?? null,
    details,
  });
}

export const activityLogService = {
  async getForProduct(productId: string): Promise<ActivityLogEntry[]> {
    const { data, error } = await supabase
      .from("product_activity_log")
      .select("*")
      .eq("product_id", productId)
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) throw error;
    return data ?? [];
  },
};
