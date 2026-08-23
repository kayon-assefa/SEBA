import { supabase } from "../../../lib/supabase";
import type { StockHistoryEntry } from "../types/catalog";

export async function recordStockChange(
  productId: string,
  businessId: string,
  change: number,
  previousStock: number,
  newStock: number,
  reason: string
): Promise<void> {
  await supabase.from("stock_history").insert({
    product_id: productId,
    business_id: businessId,
    change,
    previous_stock: previousStock,
    new_stock: newStock,
    reason,
  });
}

export const stockHistoryService = {
  async getForProduct(productId: string): Promise<StockHistoryEntry[]> {
    const { data, error } = await supabase
      .from("stock_history")
      .select("*")
      .eq("product_id", productId)
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) throw error;
    return data ?? [];
  },
};
