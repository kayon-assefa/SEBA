import { supabase } from "../../../lib/supabase";
import type { ProductVariant } from "../types/product";

// Feature #35 - product variants (size/color etc.)
export const variantService = {
  async getForProduct(productId: string): Promise<ProductVariant[]> {
    const { data, error } = await supabase
      .from("product_variants")
      .select("*")
      .eq("product_id", productId)
      .order("name", { ascending: true });

    if (error) throw error;
    return data ?? [];
  },

  async add(
    productId: string,
    variant: { name: string; value: string; price_override?: number; stock: number }
  ): Promise<ProductVariant> {
    const { data, error } = await supabase
      .from("product_variants")
      .insert({ product_id: productId, ...variant })
      .select("*")
      .single();

    if (error) throw error;
    return data;
  },

  async remove(id: string): Promise<void> {
    const { error } = await supabase.from("product_variants").delete().eq("id", id);
    if (error) throw error;
  },
};
