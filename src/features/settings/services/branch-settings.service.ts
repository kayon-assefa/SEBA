import { supabase } from "../../../lib/supabase";
import { subscriptionSettingsService } from "./subscription-settings.service";
import type { Branch, CreateBranchInput, UpdateBranchInput } from "../types/branch-settings";

async function requireEnterprise() {
  const context = await subscriptionSettingsService.getContext();
  if (context.subscription.plan !== "enterprise" || context.subscription.status === "expired") {
    throw new Error("Branches are available only on the Enterprise plan.");
  }
  return context.businessId;
}

export const branchSettingsService = {
  async list(): Promise<Branch[]> {
    const business_id = await requireEnterprise();
    const { data, error } = await supabase.from("business_branches").select("*")
      .eq("business_id", business_id).order("created_at", { ascending: true });
    if (error) throw new Error(`Failed to load branches: ${error.message}`);
    return (data ?? []) as Branch[];
  },

  async create(values: CreateBranchInput): Promise<Branch> {
    const business_id = await requireEnterprise();
    const { data, error } = await supabase.from("business_branches")
      .insert({ business_id, ...values }).select("*").single();
    if (error) throw new Error(`Failed to create branch: ${error.message}`);
    return data as Branch;
  },

  async update(id: string, values: UpdateBranchInput): Promise<Branch> {
    const business_id = await requireEnterprise();
    const { data, error } = await supabase.from("business_branches")
      .update(values).eq("id", id).eq("business_id", business_id).select("*").single();
    if (error) throw new Error(`Failed to update branch: ${error.message}`);
    return data as Branch;
  },

  async remove(id: string) {
    const business_id = await requireEnterprise();
    const { error } = await supabase.from("business_branches")
      .delete().eq("id", id).eq("business_id", business_id);
    if (error) throw new Error(`Failed to delete branch: ${error.message}`);
  },

  async isEnterprise() {
    try {
      const context = await subscriptionSettingsService.getContext();
      return context.subscription.plan === "enterprise" && context.subscription.status !== "expired";
    } catch {
      return false;
    }
  },
};
