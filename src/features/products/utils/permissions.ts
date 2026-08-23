import { supabase } from "../../../lib/supabase";
import type { UserRole } from "../types/catalog";

/**
 * Reads the current user's role for their active business.
 * Assumes a `business_members(user_id, business_id, role)` table
 * (see supabase/schema.sql notes). Defaults to "staff" (least privilege)
 * if no row is found, so a missing/misconfigured table fails closed,
 * not open.
 */
export async function getUserRole(businessId: string): Promise<UserRole> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return "staff";

  const { data, error } = await supabase
    .from("business_members")
    .select("role")
    .eq("business_id", businessId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (error || !data?.role) return "staff";

  return data.role === "owner" ? "owner" : "staff";
}

export function canEditProducts(_role: UserRole): boolean {
  return true; // both roles can propose edits; owner-only gates below decide approval
}

export function canDeleteProducts(role: UserRole): boolean {
  return role === "owner";
}

export function canApproveProducts(role: UserRole): boolean {
  return role === "owner";
}

export function canManageCategories(role: UserRole): boolean {
  return role === "owner";
}
