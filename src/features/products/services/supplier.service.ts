import { supabase } from "../../../lib/supabase";
import { getActiveBusinessId } from "../../../lib/business";
import type { Supplier } from "../types/product";

export const supplierService = {
  async list(): Promise<Supplier[]> {
    const businessId = await getActiveBusinessId();

    const { data, error } = await supabase
      .from("suppliers")
      .select("*")
      .eq("business_id", businessId)
      .order("name", { ascending: true });

    if (error) throw error;
    return data ?? [];
  },

  async create(input: {
    name: string;
    contact_phone?: string;
    contact_email?: string;
  }): Promise<Supplier> {
    const businessId = await getActiveBusinessId();
    const name = input.name.trim();

    if (!name) throw new Error("Supplier name is required");

    const { data, error } = await supabase
      .from("suppliers")
      .insert({
        business_id: businessId,
        name,
        contact_phone: input.contact_phone?.trim() || null,
        contact_email: input.contact_email?.trim() || null,
      })
      .select("*")
      .single();

    if (error) throw error;
    return data;
  },

  async remove(id: string): Promise<void> {
    const businessId = await getActiveBusinessId();

    const { error } = await supabase
      .from("suppliers")
      .delete()
      .eq("id", id)
      .eq("business_id", businessId);

    if (error) throw error;
  },
};
