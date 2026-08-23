import { useRef, useState } from "react";
import toast from "react-hot-toast";
import type { Category, ProductForm as ProductFormValues, Supplier, Tag } from "../types/product";
import { uploadProductImage } from "../services/image.service";
import { SUPPORTED_CURRENCIES } from "../utils/currency";

type Props = {
  form: ProductFormValues;
  onChange: (form: ProductFormValues) => void;
  categories: Category[];
  suppliers: Supplier[];
  tags: Tag[];
  onCreateCategory: (name: string) => Promise<Category>;
};

// Feature set covered here: category select (#23), image upload (#24),
// SKU/barcode (#10/#11), supplier linking (#47), tags (#39), cost price +
// tax rate for margin calc (#16/#17 in the features list), unit of
// measure (#26), Draft status (#25), public catalog toggle (#50).
// Sale price (#38) is rendered but disabled, marked "Coming soon" per your
// request - the column already exists in the DB for when it's built.
export default function ProductForm({
  form,
  onChange,
  categories,
  suppliers,
  tags,
  onCreateCategory,
}: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");

  function set<K extends keyof ProductFormValues>(key: K, value: ProductFormValues[K]) {
    onChange({ ...form, [key]: value });
  }

  async function handleFileSelected(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      const url = await uploadProductImage(file);
      set("image", url);
      toast.success("Image uploaded");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Upload failed");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  async function handleAddCategory() {
    const name = newCategoryName.trim();
    if (!name) return;

    try {
      const category = await onCreateCategory(name);
      set("category_id", category.id);
      set("category", category.name);
      setNewCategoryName("");
      toast.success("Category added");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not add category");
    }
  }

  function toggleTag(tagId: string) {
    const has = form.tagIds.includes(tagId);
    set("tagIds", has ? form.tagIds.filter((id) => id !== tagId) : [...form.tagIds, tagId]);
  }

  return (
    <div className="space-y-4">
      <TextField label="Product name" required value={form.name} onChange={(v) => set("name", v)} placeholder="e.g. Men's Haircut" />

      <div>
        <label className="mb-1.5 block text-sm font-medium text-gray-700">Description</label>
        <textarea
          value={form.description}
          onChange={(e) => set("description", e.target.value)}
          rows={3}
          placeholder="Optional product description..."
          className="w-full resize-none rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-[#F25F5C] focus:ring-2 focus:ring-[#F25F5C]/10"
        />
      </div>

      {/* Image upload */}
      <div>
        <label className="mb-1.5 block text-sm font-medium text-gray-700">Image</label>
        <div className="flex items-center gap-3">
          {form.image ? (
            <img src={form.image} alt="Preview" className="h-16 w-16 rounded-xl object-cover" />
          ) : (
            <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-gray-100 text-2xl text-gray-300">📦</div>
          )}
          <div className="flex-1">
            <input ref={fileInputRef} type="file" accept="image/png,image/jpeg,image/webp,image/gif" onChange={handleFileSelected} className="hidden" id="product-image-upload" />
            <label htmlFor="product-image-upload" className="inline-block cursor-pointer rounded-xl border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50">
              {uploading ? "Uploading..." : "Choose image"}
            </label>
            {form.image && (
              <button type="button" onClick={() => set("image", "")} className="ml-2 text-sm text-gray-400 hover:text-red-600">
                Remove
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Category */}
      <div>
        <label className="mb-1.5 block text-sm font-medium text-gray-700">Category</label>
        <div className="flex gap-2">
          <select
            value={form.category_id}
            onChange={(e) => {
              const category = categories.find((c) => c.id === e.target.value);
              set("category_id", e.target.value);
              set("category", category?.name ?? "");
            }}
            className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-[#F25F5C] focus:ring-2 focus:ring-[#F25F5C]/10"
          >
            <option value="">No category</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
        <div className="mt-2 flex gap-2">
          <input
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            placeholder="New category name"
            className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[#F25F5C]"
          />
          <button type="button" onClick={handleAddCategory} className="whitespace-nowrap rounded-xl border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
            + Add
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <TextField label="Price" type="number" min="0" step="0.01" required value={form.price} onChange={(v) => set("price", v)} placeholder="0.00" />
        <TextField label="Stock" type="number" min="0" step="1" required value={form.stock} onChange={(v) => set("stock", v)} placeholder="0" />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <TextField label="Cost price" type="number" min="0" step="0.01" value={form.cost_price} onChange={(v) => set("cost_price", v)} placeholder="0.00" />
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">
            Sale price <span className="ml-1 rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-400">Coming soon</span>
          </label>
          <input disabled type="number" placeholder="0.00" className="w-full cursor-not-allowed rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-400" />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <TextField label="Tax rate (%)" type="number" min="0" step="0.1" value={form.tax_rate} onChange={(v) => set("tax_rate", v)} placeholder="0" />
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">Currency</label>
          <select value={form.currency} onChange={(e) => set("currency", e.target.value)} className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-[#F25F5C]">
            {SUPPORTED_CURRENCIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">Unit</label>
          <select value={form.unit} onChange={(e) => set("unit", e.target.value)} className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-[#F25F5C]">
            {["pcs", "kg", "g", "liter", "ml", "box", "pack"].map((u) => (
              <option key={u} value={u}>{u}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <TextField label="SKU" value={form.sku} onChange={(v) => set("sku", v)} placeholder="e.g. HAIR-001" />
        <TextField label="Barcode" value={form.barcode} onChange={(v) => set("barcode", v)} placeholder="Scan or type" />
      </div>

      <TextField label="Low stock threshold" type="number" min="0" step="1" value={form.low_stock_threshold} onChange={(v) => set("low_stock_threshold", v)} placeholder="5" />

      <div>
        <label className="mb-1.5 block text-sm font-medium text-gray-700">Supplier</label>
        <select value={form.supplier_id} onChange={(e) => set("supplier_id", e.target.value)} className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-[#F25F5C]">
          <option value="">No supplier</option>
          {suppliers.map((s) => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-gray-700">Tags</label>
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => {
            const active = form.tagIds.includes(tag.id);
            return (
              <button
                key={tag.id}
                type="button"
                onClick={() => toggleTag(tag.id)}
                className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                  active ? "bg-[#F25F5C] text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {tag.name}
              </button>
            );
          })}
          {tags.length === 0 && <p className="text-xs text-gray-400">No tags yet.</p>}
        </div>
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-gray-700">Status</label>
        <div className="flex gap-2">
          {(["Draft", "Active", "Inactive"] as const).map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => set("status", status)}
              className={`rounded-xl border px-4 py-2 text-sm font-medium transition ${
                form.status === status
                  ? "border-[#F25F5C] bg-[#F25F5C]/10 text-[#F25F5C]"
                  : "border-gray-200 text-gray-600 hover:bg-gray-50"
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      <label className="flex cursor-pointer items-center justify-between rounded-xl border border-gray-200 p-3">
        <span className="text-sm font-medium text-gray-700">List on public catalog</span>
        <input type="checkbox" checked={form.is_public} onChange={(e) => set("is_public", e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-[#F25F5C] focus:ring-[#F25F5C]" />
      </label>
    </div>
  );
}

function TextField({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  required = false,
  min,
  step,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
  required?: boolean;
  min?: string;
  step?: string;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-gray-700">
        {label}
        {required && <span className="ml-1 text-[#F25F5C]">*</span>}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        min={min}
        step={step}
        className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-[#F25F5C] focus:ring-2 focus:ring-[#F25F5C]/10"
      />
    </div>
  );
}
