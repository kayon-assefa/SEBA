import { supabase } from "../../../lib/supabase";
import { getActiveBusinessId } from "../../../lib/business";
import type { Category } from "../types/product";

export const categoryService = {
  async list(): Promise<Category[]> {
    const businessId = await getActiveBusinessId();

    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .eq("business_id", businessId)
      .order("name", { ascending: true });

    if (error) throw error;
    return data ?? [];
  },

  async create(name: string): Promise<Category> {
    const businessId = await getActiveBusinessId();
    const trimmed = name.trim();

    if (!trimmed) throw new Error("Category name is required");

    const { data, error } = await supabase
      .from("categories")
      .insert({ business_id: businessId, name: trimmed })
      .select("*")
      .single();

    if (error) throw error;
    return data;
  },

  async rename(id: string, name: string): Promise<Category> {
    const businessId = await getActiveBusinessId();
    const trimmed = name.trim();

    if (!trimmed) throw new Error("Category name is required");

    const { data, error } = await supabase
      .from("categories")
      .update({ name: trimmed })
      .eq("id", id)
      .eq("business_id", businessId)
      .select("*")
      .single();

    if (error) throw error;
    return data;
  },

  async remove(id: string): Promise<void> {
    const businessId = await getActiveBusinessId();

    const { error } = await supabase
      .from("categories")
      .delete()
      .eq("id", id)
      .eq("business_id", businessId);

    if (error) throw error;
  },
};
