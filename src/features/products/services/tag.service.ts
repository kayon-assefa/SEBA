import { supabase } from "../../../lib/supabase";
import { getActiveBusinessId } from "../../../lib/business";
import type { Tag } from "../types/product";

export const tagService = {
  async list(): Promise<Tag[]> {
    const businessId = await getActiveBusinessId();

    const { data, error } = await supabase
      .from("tags")
      .select("*")
      .eq("business_id", businessId)
      .order("name", { ascending: true });

    if (error) throw error;
    return data ?? [];
  },

  async create(name: string): Promise<Tag> {
    const businessId = await getActiveBusinessId();
    const trimmed = name.trim();

    if (!trimmed) throw new Error("Tag name is required");

    const { data, error } = await supabase
      .from("tags")
      .insert({ business_id: businessId, name: trimmed })
      .select("*")
      .single();

    if (error) throw error;
    return data;
  },

  async getForProduct(productId: string): Promise<Tag[]> {
    const { data, error } = await supabase
      .from("product_tags")
      .select("tag_id, tags(*)")
      .eq("product_id", productId);

    if (error) throw error;

    return (data ?? []).map((row: any) => row.tags).filter(Boolean);
  },
};
