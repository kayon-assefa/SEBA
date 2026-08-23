import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import toast from "react-hot-toast";
import { LayoutGrid, List, WifiOff } from "lucide-react";

import ProductTable from "../components/ProductTable";
import ProductCardGrid from "../components/ProductCardGrid";
import ProductForm from "../components/ProductForm";
import FiltersBar from "../components/FiltersBar";
import BulkActionBar from "../components/BulkActionBar";
import Pagination from "../components/Pagination";
import SkeletonLoader from "../components/SkeletonLoader";
import EmptyState from "../components/EmptyState";
import SummaryCards from "../components/SummaryCards";
import ExportImportBar from "../components/ExportImportBar";
import DarkModeToggle from "../components/DarkModeToggle";
import NotificationsBell from "../components/NotificationsBell";

import { productService } from "../services/product.service";
import { categoryService } from "../services/category.service";
import { supplierService } from "../services/supplier.service";
import { tagService } from "../services/tag.service";
import { getUserRole, canDeleteProducts, canApproveProducts } from "../utils/permissions";
import { generateQrDataUrl, openPrintWindow } from "../utils/qrcode";
import { useDebounce } from "../hooks/useDebounce";
import { useKeyboardShortcuts } from "../hooks/useKeyboardShortcuts";
import { useOfflineSync } from "../hooks/useOfflineSync";
import { useRecentlyViewed } from "../hooks/useRecentlyViewed";
import { enqueueMutation } from "../utils/offlineQueue";
import { getActiveBusinessId } from "../../../lib/business";

import type {
  Category,
  Product,
  ProductFilters,
  ProductForm as ProductFormValues,
  SortDirection,
  SortField,
  Supplier,
  Tag,
} from "../types/product";
import type { UserRole } from "../types/catalog";

const emptyForm: ProductFormValues = {
  name: "",
  category: "",
  category_id: "",
  description: "",
  image: "",
  price: "",
  cost_price: "",
  sale_price: "",
  tax_rate: "0",
  currency: "ETB",
  stock: "0",
  low_stock_threshold: "5",
  unit: "pcs",
  sku: "",
  barcode: "",
  status: "Active",
  supplier_id: "",
  is_public: false,
  tagIds: [],
};

const emptyFilters: ProductFilters = {
  search: "",
  categoryId: "all",
  status: "all",
  minPrice: "",
  maxPrice: "",
  minStock: "",
  maxStock: "",
  dateFrom: "",
  dateTo: "",
  tagIds: [],
};

export default function Products() {
  const [businessId, setBusinessId] = useState<string | null>(null);
  const [role, setRole] = useState<UserRole>("staff");

  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [categories, setCategories] = useState<Category[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);

  const [filters, setFilters] = useState<ProductFilters>(emptyFilters);
  const debouncedSearch = useDebounce(filters.search, 300);

  const [sortField, setSortField] = useState<SortField>("created_at");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  const [view, setView] = useState<"table" | "grid">("table");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [form, setForm] = useState<ProductFormValues>(emptyForm);

  const searchInputRef = useRef<HTMLInputElement>(null);
  const { recentlyViewedIds, markViewed } = useRecentlyViewed();

  // ---------------------------------------------------------------------
  // Bootstrap: business id, role, lookup data
  // ---------------------------------------------------------------------
  useEffect(() => {
    (async () => {
      try {
        const id = await getActiveBusinessId();
        setBusinessId(id);
        setRole(await getUserRole(id));

        const [cats, sups, tgs] = await Promise.all([
          categoryService.list(),
          supplierService.list(),
          tagService.list(),
        ]);

        setCategories(cats);
        setSuppliers(sups);
        setTags(tgs);
      } catch (error) {
        console.error("Products bootstrap error:", error);
      }
    })();
  }, []);

  // ---------------------------------------------------------------------
  // Load products whenever filters / sort / page change
  // ---------------------------------------------------------------------
  const loadProducts = useCallback(async () => {
    try {
      setLoading(true);

      const result = await productService.getProducts({
        filters: { ...filters, search: debouncedSearch },
        sortField,
        sortDirection,
        page,
        pageSize,
      });

      setProducts(result.data);
      setTotal(result.total);
    } catch (error) {
      console.error("Products load error:", error);
      toast.error("Failed to load products");
    } finally {
      setLoading(false);
    }
  }, [filters, debouncedSearch, sortField, sortDirection, page, pageSize]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  // Reset to page 1 whenever filters change (avoid landing on an empty page)
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, filters.categoryId, filters.status, filters.minPrice, filters.maxPrice, filters.minStock, filters.maxStock, filters.dateFrom, filters.dateTo, filters.tagIds]);

  // ---------------------------------------------------------------------
  // Offline sync (#60) and keyboard shortcuts (#56)
  // ---------------------------------------------------------------------
  const { offline, pending } = useOfflineSync(loadProducts);

  useKeyboardShortcuts({
    onFocusSearch: () => searchInputRef.current?.focus(),
    onAddProduct: () => openAddModal(),
  });

  // ---------------------------------------------------------------------
  // Modal open/close helpers
  // ---------------------------------------------------------------------
  function openAddModal() {
    setEditingProduct(null);
    setForm(emptyForm);
    setShowModal(true);
  }

  function openEditModal(product: Product) {
    markViewed(product.id);
    setEditingProduct(product);
    setForm({
      name: product.name ?? "",
      category: product.category ?? "",
      category_id: product.category_id ?? "",
      description: product.description ?? "",
      image: product.image ?? "",
      price: String(product.price ?? ""),
      cost_price: product.cost_price != null ? String(product.cost_price) : "",
      sale_price: product.sale_price != null ? String(product.sale_price) : "",
      tax_rate: String(product.tax_rate ?? 0),
      currency: product.currency ?? "ETB",
      stock: String(product.stock ?? 0),
      low_stock_threshold: String(product.low_stock_threshold ?? 5),
      unit: product.unit ?? "pcs",
      sku: product.sku ?? "",
      barcode: product.barcode ?? "",
      status: product.status ?? "Active",
      supplier_id: product.supplier_id ?? "",
      is_public: product.is_public ?? false,
      tagIds: (product.tags ?? []).map((t) => t.id),
    });
    setShowModal(true);
  }

  function closeModal() {
    if (saving) return;
    setShowModal(false);
    setEditingProduct(null);
    setForm(emptyForm);
  }

  // ---------------------------------------------------------------------
  // Save (create/update) - #60 falls back to the offline queue if the
  // browser is offline instead of failing outright.
  // ---------------------------------------------------------------------
  async function saveProduct() {
    if (!form.name.trim()) {
      toast.error("Product name is required");
      return;
    }

    if (offline) {
      enqueueMutation(
        editingProduct
          ? { type: "update", id: editingProduct.id, form }
          : { type: "create", tempId: crypto.randomUUID(), form }
      );
      toast.success("Saved offline - will sync when you're back online");
      closeModal();
      return;
    }

    try {
      setSaving(true);

      if (editingProduct) {
        await productService.updateProduct(editingProduct.id, form);
        toast.success("Product updated");
      } else {
        await productService.createProduct(form);
        toast.success("Product added");
      }

      closeModal();
      loadProducts();
    } catch (error) {
      console.error("Product save error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to save product");
    } finally {
      setSaving(false);
    }
  }

  // ---------------------------------------------------------------------
  // Delete (soft-delete/archive by default; hard delete gated to owners)
  // ---------------------------------------------------------------------
  async function deleteProduct(product: Product) {
    const confirmed = window.confirm(
      `Archive ${product.name}? You can restore it later from Archived items.`
    );
    if (!confirmed) return;

    if (offline) {
      enqueueMutation({ type: "delete", id: product.id });
      toast.success("Will delete once you're back online");
      return;
    }

    try {
      await productService.deleteProduct(product.id);
      toast.success("Product archived");
      loadProducts();
    } catch (error) {
      console.error("Product delete error:", error);
      toast.error("Failed to delete product");
    }
  }

  async function duplicateProduct(product: Product) {
    try {
      await productService.duplicateProduct(product);
      toast.success("Product duplicated");
      loadProducts();
    } catch (error) {
      toast.error("Failed to duplicate product");
    }
  }

  async function toggleFavorite(product: Product) {
    try {
      await productService.toggleFavorite(product.id, !product.is_favorite);
      setProducts((current) =>
        current.map((p) => (p.id === product.id ? { ...p, is_favorite: !p.is_favorite } : p))
      );
    } catch {
      toast.error("Failed to update favorite");
    }
  }

  async function quickEdit(product: Product, field: "price" | "stock", value: number) {
    try {
      const updated = await productService.quickUpdateField(product.id, field, value);
      setProducts((current) => current.map((p) => (p.id === product.id ? updated : p)));
      toast.success(`${field === "price" ? "Price" : "Stock"} updated`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Update failed");
    }
  }

  async function printLabel(product: Product) {
    try {
      const dataUrl = await generateQrDataUrl(product.sku || product.id);
      openPrintWindow(`
        <img src="${dataUrl}" alt="QR code" />
        <h3>${escapeHtml(product.name)}</h3>
        <p>${product.sku ? `SKU: ${escapeHtml(product.sku)}` : ""}</p>
        <p>${product.price} ${product.currency}</p>
      `);
    } catch {
      toast.error("Could not generate label. Run: npm install qrcode");
    }
  }

  async function approveProduct(product: Product) {
    try {
      await productService.setApprovalStatus(product.id, "approved");
      toast.success("Product approved");
      loadProducts();
    } catch {
      toast.error("Failed to approve");
    }
  }

  async function rejectProduct(product: Product) {
    try {
      await productService.setApprovalStatus(product.id, "rejected");
      toast("Product rejected");
      loadProducts();
    } catch {
      toast.error("Failed to reject");
    }
  }

  // ---------------------------------------------------------------------
  // Bulk actions (#25 archive, #26 activate/deactivate)
  // ---------------------------------------------------------------------
  async function bulkArchive() {
    try {
      await productService.bulkArchive(Array.from(selectedIds));
      toast.success(`Archived ${selectedIds.size} product(s)`);
      setSelectedIds(new Set());
      loadProducts();
    } catch {
      toast.error("Bulk archive failed");
    }
  }

  async function bulkSetStatus(status: "Active" | "Inactive") {
    try {
      await productService.bulkSetStatus(Array.from(selectedIds), status);
      toast.success(`Updated ${selectedIds.size} product(s)`);
      setSelectedIds(new Set());
      loadProducts();
    } catch {
      toast.error("Bulk update failed");
    }
  }

  function toggleSelect(id: string) {
    setSelectedIds((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleSelectAll() {
    setSelectedIds((current) => {
      const allSelected = products.every((p) => current.has(p.id));
      if (allSelected) return new Set();
      return new Set(products.map((p) => p.id));
    });
  }

  function handleSort(field: SortField) {
    if (field === sortField) {
      setSortDirection((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  }

  const lowStockCount = useMemo(
    () => products.filter((p) => p.stock <= (p.low_stock_threshold ?? 5)).length,
    [products]
  );

  const totalStock = useMemo(
    () => products.reduce((sum, p) => sum + Number(p.stock ?? 0), 0),
    [products]
  );

  return (
    <div className="space-y-6">
      {/* Offline banner */}
      {offline && (
        <div className="flex items-center gap-2 rounded-xl bg-amber-50 px-4 py-2 text-sm text-amber-800">
          <WifiOff size={15} />
          You're offline. Changes will be saved locally and synced automatically.
          {pending > 0 && <span className="ml-1 font-medium">({pending} pending)</span>}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#2B2B2B]">Products</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage the products and services your business offers.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {businessId && <NotificationsBell businessId={businessId} />}
          <DarkModeToggle />

          <div className="flex overflow-hidden rounded-xl border border-gray-200">
            <button
              onClick={() => setView("table")}
              className={`p-2.5 ${view === "table" ? "bg-[#F25F5C] text-white" : "text-gray-500 hover:bg-gray-50"}`}
              aria-label="Table view"
            >
              <List size={16} />
            </button>
            <button
              onClick={() => setView("grid")}
              className={`p-2.5 ${view === "grid" ? "bg-[#F25F5C] text-white" : "text-gray-500 hover:bg-gray-50"}`}
              aria-label="Grid view"
            >
              <LayoutGrid size={16} />
            </button>
          </div>

          <button
            onClick={openAddModal}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#F25F5C] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#e14e4b] active:scale-[0.98]"
          >
            <span className="text-lg leading-none">+</span>
            Add Product
          </button>
        </div>
      </div>

      <SummaryCards
        totalProducts={total}
        showing={products.length}
        totalStock={totalStock}
        lowStockCount={lowStockCount}
      />

      <ExportImportBar products={products} />

      {/* Search */}
      <div className="rounded-2xl border border-gray-200 bg-white p-4">
        <input
          ref={searchInputRef}
          type="text"
          value={filters.search}
          onChange={(event) => setFilters((f) => ({ ...f, search: event.target.value }))}
          placeholder="Search products... (press / to focus)"
          className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition focus:border-[#F25F5C] focus:bg-white focus:ring-2 focus:ring-[#F25F5C]/10"
        />
      </div>

      {recentlyViewedIds.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <span className="text-gray-400">Recently viewed:</span>
          {recentlyViewedIds
            .map((id) => products.find((p) => p.id === id))
            .filter((p): p is Product => Boolean(p))
            .slice(0, 6)
            .map((p) => (
              <button
                key={p.id}
                onClick={() => openEditModal(p)}
                className="rounded-full bg-gray-100 px-3 py-1 font-medium text-gray-600 hover:bg-gray-200"
              >
                {p.name}
              </button>
            ))}
        </div>
      )}

      <FiltersBar filters={filters} onChange={setFilters} categories={categories} tags={tags} />

      <BulkActionBar
        count={selectedIds.size}
        onArchive={bulkArchive}
        onActivate={() => bulkSetStatus("Active")}
        onDeactivate={() => bulkSetStatus("Inactive")}
        onClear={() => setSelectedIds(new Set())}
      />

      {/* Product list */}
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
        {loading ? (
          <SkeletonLoader />
        ) : products.length === 0 ? (
          <EmptyState hasSearch={Boolean(filters.search.trim())} onAdd={openAddModal} />
        ) : view === "table" ? (
          <ProductTable
            products={products}
            selectedIds={selectedIds}
            canDelete={canDeleteProducts(role)}
            sortField={sortField}
            sortDirection={sortDirection}
            onSort={handleSort}
            onEdit={openEditModal}
            onDelete={deleteProduct}
            onDuplicate={duplicateProduct}
            onToggleFavorite={toggleFavorite}
            onToggleSelect={toggleSelect}
            onToggleSelectAll={toggleSelectAll}
            onQuickEdit={quickEdit}
            onPrintLabel={printLabel}
            canApprove={canApproveProducts(role)}
            onApprove={approveProduct}
            onReject={rejectProduct}
          />
        ) : (
          <ProductCardGrid products={products} onOpen={openEditModal} onToggleFavorite={toggleFavorite} />
        )}

        {!loading && products.length > 0 && (
          <Pagination
            page={page}
            pageSize={pageSize}
            total={total}
            onPageChange={setPage}
            onPageSizeChange={(size) => {
              setPageSize(size);
              setPage(1);
            }}
          />
        )}
      </div>

      {/* Add/Edit modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-5">
              <div>
                <h2 className="text-lg font-bold text-[#2B2B2B]">
                  {editingProduct ? "Edit product" : "Add product"}
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  {editingProduct ? "Update product information." : "Add a product to your business."}
                </p>
              </div>
              <button
                onClick={closeModal}
                disabled={saving}
                className="rounded-lg p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700 disabled:opacity-50"
              >
                ✕
              </button>
            </div>

            <div className="px-6 py-6">
              <ProductForm
                form={form}
                onChange={setForm}
                categories={categories}
                suppliers={suppliers}
                tags={tags}
                onCreateCategory={async (name) => {
                  const category = await categoryService.create(name);
                  setCategories((current) => [...current, category]);
                  return category;
                }}
              />
            </div>

            <div className="flex justify-end gap-3 border-t border-gray-100 px-6 py-4">
              <button
                onClick={closeModal}
                disabled={saving}
                className="rounded-xl border border-gray-200 px-5 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={saveProduct}
                disabled={saving}
                className="rounded-xl bg-[#F25F5C] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#e14e4b] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? "Saving..." : editingProduct ? "Save Changes" : "Add Product"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
