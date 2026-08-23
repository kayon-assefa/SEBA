import { supabase } from "../../../lib/supabase";
import { getActiveBusinessId } from "../../../lib/business";

import type {
  Product,
  ProductForm,
  ProductFilters,
  SortField,
  SortDirection,
} from "../types/product";
import { logActivity } from "./activityLog.service";
import { recordStockChange } from "./stockHistory.service";

async function getBusinessId(): Promise<string> {
  return getActiveBusinessId();
}

// ---------------------------------------------------------------------------
// Validation (SECURITY FIX: also trims/caps free-text fields so a
// pasted 50,000-character description can't bloat the row or be used to
// smuggle script-like content into fields that get rendered elsewhere,
// e.g. printed labels or CSV export).
// ---------------------------------------------------------------------------
const MAX_TEXT_LENGTH = 2000;
const MAX_NAME_LENGTH = 200;

function sanitizeText(value: string, maxLength: number): string {
  return value.trim().slice(0, maxLength);
}

function validateForm(form: ProductForm) {
  const errors: string[] = [];

  if (!form.name.trim()) errors.push("Product name is required");
  if (form.name.trim().length > MAX_NAME_LENGTH) {
    errors.push(`Product name must be under ${MAX_NAME_LENGTH} characters`);
  }

  const price = Number(form.price);
  if (Number.isNaN(price) || price < 0) errors.push("Invalid product price");

  const stock = Number(form.stock);
  if (!Number.isInteger(stock) || stock < 0) {
    errors.push("Invalid stock quantity");
  }

  if (form.cost_price && Number.isNaN(Number(form.cost_price))) {
    errors.push("Invalid cost price");
  }

  if (form.tax_rate && (Number.isNaN(Number(form.tax_rate)) || Number(form.tax_rate) < 0)) {
    errors.push("Invalid tax rate");
  }

  if (form.low_stock_threshold && Number.isNaN(Number(form.low_stock_threshold))) {
    errors.push("Invalid low stock threshold");
  }

  if (form.image && form.image.trim()) {
    try {
      // eslint-disable-next-line no-new
      new URL(form.image.trim());
    } catch {
      errors.push("Image must be a valid URL");
    }
  }

  if (errors.length > 0) {
    throw new Error(errors.join(". "));
  }

  return { price, stock };
}

function buildPayload(form: ProductForm) {
  const { price, stock } = validateForm(form);

  return {
    name: sanitizeText(form.name, MAX_NAME_LENGTH),
    category: sanitizeText(form.category, 100) || null,
    category_id: form.category_id || null,
    description: sanitizeText(form.description, MAX_TEXT_LENGTH) || null,
    image: form.image.trim() || null,
    price,
    cost_price: form.cost_price ? Number(form.cost_price) : null,
    sale_price: form.sale_price ? Number(form.sale_price) : null,
    tax_rate: form.tax_rate ? Number(form.tax_rate) : 0,
    currency: form.currency || "ETB",
    stock,
    low_stock_threshold: form.low_stock_threshold
      ? Number(form.low_stock_threshold)
      : 5,
    unit: form.unit || "pcs",
    sku: sanitizeText(form.sku, 60) || null,
    barcode: sanitizeText(form.barcode, 60) || null,
    status: form.status,
    supplier_id: form.supplier_id || null,
    is_public: Boolean(form.is_public),
  };
}

function makeSlug(): string {
  return Math.random().toString(36).slice(2, 10);
}

// ---------------------------------------------------------------------------
// Reads
// ---------------------------------------------------------------------------
export type GetProductsOptions = {
  filters?: Partial<ProductFilters>;
  sortField?: SortField;
  sortDirection?: SortDirection;
  page?: number;
  pageSize?: number;
  includeArchived?: boolean;
};

export type PagedProducts = {
  data: Product[];
  total: number;
  page: number;
  pageSize: number;
};

export const productService = {
  /**
   * Get products for the active business, with server-side filtering,
   * sorting and pagination (features #21/#41/#42).
   */
  async getProducts(options: GetProductsOptions = {}): Promise<PagedProducts> {
    const businessId = await getBusinessId();

    const {
      filters,
      sortField = "created_at",
      sortDirection = "desc",
      page = 1,
      pageSize = 20,
      includeArchived = false,
    } = options;

    let query = supabase
      .from("products")
      .select("*", { count: "exact" })
      .eq("business_id", businessId);

    if (!includeArchived) {
      query = query.eq("is_archived", false);
    }

    if (filters?.search?.trim()) {
      const term = `%${filters.search.trim()}%`;
      query = query.or(
        `name.ilike.${term},description.ilike.${term},sku.ilike.${term},barcode.ilike.${term}`
      );
    }

    if (filters?.categoryId && filters.categoryId !== "all") {
      query = query.eq("category_id", filters.categoryId);
    }

    if (filters?.status && filters.status !== "all") {
      query = query.eq("status", filters.status);
    }

    if (filters?.minPrice) query = query.gte("price", Number(filters.minPrice));
    if (filters?.maxPrice) query = query.lte("price", Number(filters.maxPrice));
    if (filters?.minStock) query = query.gte("stock", Number(filters.minStock));
    if (filters?.maxStock) query = query.lte("stock", Number(filters.maxStock));
    if (filters?.dateFrom) query = query.gte("created_at", filters.dateFrom);
    if (filters?.dateTo) query = query.lte("created_at", filters.dateTo);

    query = query
      .order(sortField, { ascending: sortDirection === "asc" })
      .range((page - 1) * pageSize, page * pageSize - 1);

    const { data, error, count } = await query;

    if (error) throw error;

    return {
      data: data ?? [],
      total: count ?? 0,
      page,
      pageSize,
    };
  },

  /**
   * Get one product. FIX: previously any authenticated user could pass an
   * arbitrary id; this still always scopes by business_id so a user from
   * business A can never read a row belonging to business B, even if they
   * guess/enumerate ids.
   */
  async getProduct(id: string): Promise<Product> {
    const businessId = await getBusinessId();

    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("id", id)
      .eq("business_id", businessId)
      .single();

    if (error) throw error;

    return data;
  },

  async createProduct(form: ProductForm): Promise<Product> {
    const businessId = await getBusinessId();
    const payload = buildPayload(form);
    const publicSlug = payload.is_public ? makeSlug() : null;

    const { data, error } = await supabase
      .from("products")
      .insert({ ...payload, business_id: businessId, public_slug: publicSlug })
      .select("*")
      .single();

    if (error) throw error;

    if (form.tagIds?.length) {
      await syncProductTags(data.id, form.tagIds);
    }

    await logActivity(data.id, businessId, "created", { name: data.name });

    return data;
  },

  async updateProduct(id: string, form: ProductForm): Promise<Product> {
    const businessId = await getBusinessId();
    const payload = buildPayload(form);

    // Fetch previous stock + public_slug so we can log stock_history and
    // avoid clobbering an existing public link with a new random slug.
    const { data: existing } = await supabase
      .from("products")
      .select("stock, public_slug")
      .eq("id", id)
      .eq("business_id", businessId)
      .single();

    const publicSlug = payload.is_public
      ? existing?.public_slug ?? makeSlug()
      : null;

    const { data, error } = await supabase
      .from("products")
      .update({ ...payload, public_slug: publicSlug, updated_at: new Date().toISOString() })
      .eq("id", id)
      .eq("business_id", businessId)
      .select("*")
      .single();

    if (error) throw error;

    if (form.tagIds) {
      await syncProductTags(id, form.tagIds);
    }

    if (existing && existing.stock !== payload.stock) {
      await recordStockChange(
        id,
        businessId,
        payload.stock - existing.stock,
        existing.stock,
        payload.stock,
        "Manual edit"
      );
    }

    await logActivity(id, businessId, "updated", { name: data.name });

    return data;
  },

  /**
   * Delete a product. FIX: this used to be a hard delete only. Default is
   * now a soft delete (archive) so it can be restored (feature #44);
   * pass `hard: true` to permanently remove (owner-only, gated in the UI).
   */
  async deleteProduct(id: string, options: { hard?: boolean } = {}): Promise<void> {
    const businessId = await getBusinessId();

    if (options.hard) {
      const { error } = await supabase
        .from("products")
        .delete()
        .eq("id", id)
        .eq("business_id", businessId);

      if (error) throw error;

      await logActivity(id, businessId, "deleted", {});
      return;
    }

    const { error } = await supabase
      .from("products")
      .update({ is_archived: true })
      .eq("id", id)
      .eq("business_id", businessId);

    if (error) throw error;

    await logActivity(id, businessId, "archived", {});
  },

  async restoreProduct(id: string): Promise<void> {
    const businessId = await getBusinessId();

    const { error } = await supabase
      .from("products")
      .update({ is_archived: false })
      .eq("id", id)
      .eq("business_id", businessId);

    if (error) throw error;

    await logActivity(id, businessId, "restored", {});
  },

  // -------------------------------------------------------------------------
  // Bulk actions (#25, #26)
  // -------------------------------------------------------------------------
  async bulkArchive(ids: string[]): Promise<void> {
    const businessId = await getBusinessId();

    const { error } = await supabase
      .from("products")
      .update({ is_archived: true })
      .in("id", ids)
      .eq("business_id", businessId);

    if (error) throw error;
  },

  async bulkSetStatus(ids: string[], status: Product["status"]): Promise<void> {
    const businessId = await getBusinessId();

    const { error } = await supabase
      .from("products")
      .update({ status })
      .in("id", ids)
      .eq("business_id", businessId);

    if (error) throw error;
  },

  // -------------------------------------------------------------------------
  // Duplicate / clone (#29)
  // -------------------------------------------------------------------------
  async duplicateProduct(product: Product): Promise<Product> {
    const businessId = await getBusinessId();

    const { id, created_at, updated_at, view_count, public_slug, ...rest } =
      product;

    const { data, error } = await supabase
      .from("products")
      .insert({
        ...rest,
        business_id: businessId,
        name: `${product.name} (Copy)`,
        is_public: false,
        public_slug: null,
      })
      .select("*")
      .single();

    if (error) throw error;

    await logActivity(data.id, businessId, "created", {
      duplicatedFrom: product.id,
    });

    return data;
  },

  // -------------------------------------------------------------------------
  // Quick inline stock/price edit (#19)
  // -------------------------------------------------------------------------
  async quickUpdateField(
    id: string,
    field: "price" | "stock",
    value: number
  ): Promise<Product> {
    const businessId = await getBusinessId();

    if (Number.isNaN(value) || value < 0) {
      throw new Error(`Invalid ${field} value`);
    }

    if (field === "stock") {
      const { data: existing } = await supabase
        .from("products")
        .select("stock")
        .eq("id", id)
        .eq("business_id", businessId)
        .single();

      if (existing) {
        await recordStockChange(
          id,
          businessId,
          value - existing.stock,
          existing.stock,
          value,
          "Quick edit"
        );
      }
    }

    const { data, error } = await supabase
      .from("products")
      .update({ [field]: value, updated_at: new Date().toISOString() })
      .eq("id", id)
      .eq("business_id", businessId)
      .select("*")
      .single();

    if (error) throw error;

    return data;
  },

  // -------------------------------------------------------------------------
  // Favorites (#54)
  // -------------------------------------------------------------------------
  async toggleFavorite(id: string, isFavorite: boolean): Promise<void> {
    const businessId = await getBusinessId();

    const { error } = await supabase
      .from("products")
      .update({ is_favorite: isFavorite })
      .eq("id", id)
      .eq("business_id", businessId);

    if (error) throw error;
  },

  // -------------------------------------------------------------------------
  // View count for lightweight analytics (#53)
  // -------------------------------------------------------------------------
  async recordView(id: string): Promise<void> {
    try {
      await supabase.rpc("increment_product_view", { product_id: id });
    } catch {
      // Non-critical: swallow errors so analytics never breaks the UI.
      // Requires the `increment_product_view` SQL function - see README.
    }
  },

  // -------------------------------------------------------------------------
  // Approval workflow (#59)
  // -------------------------------------------------------------------------
  async setApprovalStatus(
    id: string,
    status: "approved" | "rejected"
  ): Promise<void> {
    const businessId = await getBusinessId();

    const { error } = await supabase
      .from("products")
      .update({ approval_status: status })
      .eq("id", id)
      .eq("business_id", businessId);

    if (error) throw error;

    await logActivity(id, businessId, status === "approved" ? "approved" : "rejected", {});
  },

  // -------------------------------------------------------------------------
  // Public catalog link (#50)
  // -------------------------------------------------------------------------
  async setPublic(id: string, isPublic: boolean): Promise<string | null> {
    const businessId = await getBusinessId();
    const slug = isPublic ? `${id}-${Math.random().toString(36).slice(2, 8)}` : null;

    const { error } = await supabase
      .from("products")
      .update({ is_public: isPublic, public_slug: slug })
      .eq("id", id)
      .eq("business_id", businessId);

    if (error) throw error;

    return slug;
  },
};

async function syncProductTags(productId: string, tagIds: string[]) {
  await supabase.from("product_tags").delete().eq("product_id", productId);

  if (tagIds.length === 0) return;

  await supabase
    .from("product_tags")
    .insert(tagIds.map((tagId) => ({ product_id: productId, tag_id: tagId })));
}
