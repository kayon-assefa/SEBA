export type ProductStatus = "Active" | "Inactive" | "Draft";
export type ApprovalStatus = "pending" | "approved" | "rejected";

export type ProductVariant = {
  id: string;
  product_id: string;
  name: string;
  value: string;
  price_override: number | null;
  stock: number;
};

export type ProductImage = {
  id: string;
  product_id: string;
  url: string;
  sort_order: number;
};

export type Tag = {
  id: string;
  business_id: string;
  name: string;
};

export type Category = {
  id: string;
  business_id: string;
  name: string;
};

export type Supplier = {
  id: string;
  business_id: string;
  name: string;
  contact_phone: string | null;
  contact_email: string | null;
};

export type Product = {
  id: string;
  business_id: string;

  name: string;
  category: string | null;
  category_id: string | null;
  description: string | null;
  image: string | null;

  price: number;
  cost_price: number | null;
  sale_price: number | null; // reserved for feature #38 (coming soon)
  tax_rate: number;
  currency: string;

  stock: number;
  low_stock_threshold: number;
  unit: string;

  sku: string | null;
  barcode: string | null;

  status: ProductStatus;
  approval_status: ApprovalStatus;
  is_archived: boolean;
  is_favorite: boolean;
  is_public: boolean;
  public_slug: string | null;

  supplier_id: string | null;
  name_translations: Record<string, string> | null;
  view_count: number;

  created_at: string | null;
  updated_at: string | null;

  // populated client-side via joins, optional
  tags?: Tag[];
  images?: ProductImage[];
  variants?: ProductVariant[];
};

export type ProductForm = {
  name: string;
  category: string;
  category_id: string;
  description: string;
  image: string;
  price: string;
  cost_price: string;
  sale_price: string;
  tax_rate: string;
  currency: string;
  stock: string;
  low_stock_threshold: string;
  unit: string;
  sku: string;
  barcode: string;
  status: ProductStatus;
  supplier_id: string;
  is_public: boolean;
  tagIds: string[];
};

export type ProductFilters = {
  search: string;
  categoryId: string | "all";
  status: ProductStatus | "all";
  minPrice: string;
  maxPrice: string;
  minStock: string;
  maxStock: string;
  dateFrom: string;
  dateTo: string;
  tagIds: string[];
};

export type SortField = "name" | "price" | "stock" | "created_at";
export type SortDirection = "asc" | "desc";
